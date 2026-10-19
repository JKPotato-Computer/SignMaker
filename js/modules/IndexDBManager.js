class SM_Database {
  constructor(storeName, dbConnectionPromise) {
    this.storeName = storeName;
    this.dbConnectionPromise = dbConnectionPromise;
  }

  async getStore(mode = "readonly") {
    const db = await this.dbConnectionPromise;
    const transaction = db.transaction([this.storeName], mode);
    return transaction.objectStore(this.storeName);
  }

  async put(item) {
    const store = await this.getStore("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  async get(key) {
    const store = await this.getStore("readonly");
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll() {
    const store = await this.getStore("readonly");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key) {
    const store = await this.getStore("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}

const IndexDBManager = (() => {
  const databaseName = "SignMakerDB";
  const databaseVersion = 17;

  const schema = {
    shieldLibrary: { keyPath: "shieldId" },
    customImages: { keyPath: "fileName" },
    diagrammicLibrary: { keyPath: "diagramName" },
  };

  const activeDatastores = {};

  const dbConnectionPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(databaseName, databaseVersion);

    req.onerror = (event) => reject(event.target.error);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      for (const [storeName, options] of Object.entries(schema)) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, options);
        }
      }
    };

    req.onsuccess = (event) => {
      const db = event.target.result;

      db.onversionchange = () => {
        db.close();
      };

      resolve(db);
    };
  });

  const getDatastore = (storeName) => {
    if (activeDatastores[storeName]) {
      return activeDatastores[storeName];
    }

    activeDatastores[storeName] = new SM_Database(
      storeName,
      dbConnectionPromise,
    );
    return activeDatastores[storeName];
  };

  return {
    getDatastore,
  };
})();

window.SM_Database = SM_Database;
