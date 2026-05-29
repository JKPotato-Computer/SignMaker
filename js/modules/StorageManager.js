const StorageManager = (() => {
  let localStorageAvailable;
  let localStorageWarningLogged = false;

  const STORAGE_KEYS = {
    post: "signMaker.postConfig",
    textElement: "signMaker.textElementConfig",
  };

  const getItem = (key) => {
    let result = window.localStorage.getItem(key);
    try {
      return JSON.parse(result);
    } catch (error) {
      return result;
    }
  };

  const setItem = (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      window.localStorage.setItem(key, value);
    }
  };

  return {
    STORAGE_KEYS,
    getItem,
    setItem,
  };
})();
