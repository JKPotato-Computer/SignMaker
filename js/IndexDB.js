class IndexDB {
  constructor() {
    this.dbName = "SignMakerDB";
    this.dbVersion = 1;
    this.storeName = "customShields";
    this.db = null;
    this.dbInitialized = this.init(); // Store the initialization promise
  }

  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log("IndexedDB connected successfully");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "fileName" });
        }
      };
    });
  }

  async saveShield(file) {
    // Wait for DB initialization
    await this.dbInitialized;
    
    return new Promise((resolve, reject) => {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const shield = {
          fileName: file.name,
          type: file.type,
          data: reader.result,
          dateAdded: new Date().toISOString(),
        };

        const transaction = this.db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.put(shield);

        request.onsuccess = () => resolve(shield);
        request.onerror = () => reject(request.error);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  async getAllShields() {
    // Wait for DB initialization
    await this.dbInitialized;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteShield(fileName) {
    // Wait for DB initialization
    await this.dbInitialized;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(fileName);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
