const ShieldLibrary = (() => {
  const db = IndexDBManager.getDatastore("shieldLibrary", {
    keyPath: "shieldID",
  });
  const listOfShields = [];

  let hasInit = false;
  const init = async () => {
    if (hasInit) return;

    hasInit = true;
    await loadShields();
  };
  const holder = document.getElementById("shieldLibraryListHolder");
  let returnMethod = null;

  const addFolder = async (folderName) => {
    const folderID = crypto.randomUUID();

    let folderNameExists = false;
    try {
      const shields = await db.getAll();
      folderNameExists = shields.some(
        (shield) => shield.shieldName === folderName,
      );
    } catch (err) {
      alert("Failed to check for existing folder names: " + err);
      return false;
    }

    if (
      folderNameExists &&
      !confirm(
        "A folder with this name already exists. Do you want to continue?",
      )
    ) {
      return false;
    }

    const folderData = {
      shieldID: folderID,
      folderName: folderName,
      isFolder: true,
      contentList: [],
    };

    try {
      await db.put(folderData);
      await loadShields();
      return true;
    } catch (err) {
      alert("Failed to add folder: " + err);
      return false;
    }
  };

  const addShieldToFolder = async (shieldID, folderName) => {
    try {
      const shield = await db.get(shieldID);
      if (!shield) {
        alert("Shield not found.");
        return false;
      }
    } catch (err) {
      alert("Failed to retrieve shield: " + err);
      return false;
    }
  };

  const addShield = async (shieldElement) => {
    let dataToSave = structuredClone(shieldElement);
    delete dataToSave.bannerSettings;
    delete dataToSave.banners;
    delete dataToSave.group;

    dataToSave.shieldID = crypto.randomUUID();
    dataToSave.shieldName =
      shieldElement.routeNumber != ""
        ? `${
            shieldElement.shieldType == "custom"
              ? shieldElement.shieldName.replace(/\.\w+/g, "")
              : Shield.prototype
                  .getPropertiesFromName(shieldElement.shieldValue)
                  .name.toUpperCase()
          }-${shieldElement.routeNumber}`
        : `${
            shieldElement.shieldType == "custom"
              ? shieldElement.shieldName.replace(/\.\w+/g, "")
              : Shield.prototype
                  .getPropertiesFromName(shieldElement.shieldValue)
                  .name.toUpperCase()
          }`;

    try {
      await db.put(dataToSave);
      await loadShields();
      return true;
    } catch (err) {
      alert("Failed to add shield: " + err);
      return false;
    }
  };

  const removeShield = async (shieldID) => {
    if (
      confirm(
        "Are you sure you want to remove " +
          (await db.get(shieldID)).shieldName +
          "?",
      )
    ) {
      try {
        await db.delete(shieldID);
        await loadShields();
      } catch (err) {
        alert("Failed to remove shield: " + err);
      }
    }
  };

  const loadShields = async (retMethod) => {
    if (!retMethod) {
      retMethod = returnMethod;
    } else {
      returnMethod = retMethod;
    }

    listOfShields.length = 0;

    try {
      const shields = await db.getAll();
      holder.innerHTML = "";

      const handleShieldFolder = async (element, isFirstOrder, directory) => {
        if (element.isFolder) {
          // TODO: folder
          const buttonTemplate = document.createElement("button");
          buttonTemplate.className = "shieldLibraryButton shieldLibraryFolder";
          buttonTemplate.dataset.folderDirectory = directory;
          buttonTemplate.style.display = isFirstOrder ? "" : "none";
          buttonTemplate.name = element.folderName;

          const labelElement = document.createElement("span");
          labelElement.className = "shieldLibraryLabel";
          labelElement.textContent = element.folderName;

          const visualElement = document.createElement("div");
          visualElement.className = "shieldLibraryVisual";
          visualElement.textContent = "folder";

          buttonTemplate.appendChild(labelElement);
          buttonTemplate.appendChild(visualElement);

          holder.appendChild(buttonTemplate);

          for (const shield of element.contentList) {
            handleShieldFolder(
              shield,
              false,
              directory + element.folderName + "/",
            );
          }
        } else {
          listOfShields.push(element);

          const shield = element;

          const buttonTemplate = document.createElement("button");
          buttonTemplate.className = "shieldLibraryButton";
          buttonTemplate.name = shield.shieldName;

          const labelElement = document.createElement("span");
          labelElement.className = "shieldLibraryLabel";
          labelElement.textContent = shield.shieldName;

          const visualElement = document.createElement("div");
          visualElement.className = "shieldLibraryVisual";

          const shieldElement = new Shield(shield).createElement();

          visualElement.appendChild(shieldElement);
          buttonTemplate.appendChild(labelElement);
          buttonTemplate.appendChild(visualElement);

          holder.appendChild(buttonTemplate);
          buttonTemplate.addEventListener("click", () => {
            for (const sElem of document.querySelectorAll(
              ".shieldLibraryButton",
            )) {
              if (sElem !== buttonTemplate) {
                sElem.classList.remove("selected");
              } else {
                sElem.classList.add("selected");
              }
            }

            retMethod(shield);
          });
        }
      };

      shields.forEach((shield) => {
        handleShieldFolder(shield, "/");
      });
    } catch (err) {
      alert("Failed to load shields: " + err);
    }
  };

  return {
    addShield,
    removeShield,
    loadShields,
    init,
  };
})();
