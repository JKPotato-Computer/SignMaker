class IndexDB {
  constructor() {
    this.dbName = "SignMakerDB";
    this.dbVersion = 2;
    this.storeName = "customShields";
    this.templatesStoreName = "templates";
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
        if (!db.objectStoreNames.contains(this.templatesStoreName)) {
          db.createObjectStore(this.templatesStoreName, { keyPath: "id" });
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

  // Template methods
  async saveTemplate(templateData) {
    await this.dbInitialized;
    
    return new Promise((resolve, reject) => {
      const template = {
        id: templateData.id || Date.now().toString(),
        name: templateData.name,
        data: templateData.data,
        dateCreated: templateData.dateCreated || new Date().toISOString(),
        dateModified: new Date().toISOString(),
      };

      const transaction = this.db.transaction([this.templatesStoreName], "readwrite");
      const store = transaction.objectStore(this.templatesStoreName);
      const request = store.put(template);

      request.onsuccess = () => resolve(template);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTemplates() {
    await this.dbInitialized;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.templatesStoreName], "readonly");
      const store = transaction.objectStore(this.templatesStoreName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTemplate(templateId) {
    await this.dbInitialized;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.templatesStoreName], "readonly");
      const store = transaction.objectStore(this.templatesStoreName);
      const request = store.get(templateId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTemplate(templateId) {
    await this.dbInitialized;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.templatesStoreName], "readwrite");
      const store = transaction.objectStore(this.templatesStoreName);
      const request = store.delete(templateId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
