class SM_Database {
  constructor({
    storeName = "",
    dbName = "SignMakerDB",
    version = 1,
    keyPath = null,
    database = null,
  } = {}) {
    this.storeName = storeName;
    this.dbName = dbName;
    this.version = version;
    this.keyPath = keyPath;
    this.database = null;
    this.initialized = this.initialize();
  }

  initialize() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.version);

      req.onerror = (event) => reject(event.target.error);

      req.onsuccess = (event) => {
        this.database = event.target.result;
        resolve(this.database);
      };

      req.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          const options =
            this.keyPath == null
              ? { autoIncrement: true }
              : { keyPath: this.keyPath };
          db.createObjectStore(this.storeName, options);
        }
      };
    });
  }

  async getStore(mode = "readonly") {
    await this.initialized;
    const transaction = this.database.transaction([this.storeName], mode);
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

const activeDatastores = {};

const IndexDBManager = (() => {
  const getDatastore = (storeName, options = {}) => {
    const dbName = options.dbName || "SignMakerDB";
    const registryKey = `${dbName}:${storeName}`;

    if (activeDatastores[registryKey]) {
      return activeDatastores[registryKey];
    }

    activeDatastores[registryKey] = new SM_Database({
      storeName,
      dbName,
      version: options.version || 1,
      keyPath: options.keyPath,
    });

    return activeDatastores[registryKey];
  };

  return {
    getDatastore,
  };
})();
