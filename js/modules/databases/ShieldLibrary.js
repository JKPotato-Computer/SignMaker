const ShieldLibrary = (() => {
  const db = IndexDBManager.getDatastore("shieldLibrary", {
    keyPath: "shieldId",
  });

  let hasInit = false;
  const init = async () => {
    if (hasInit) return;

    hasInit = true;
    await loadShields();
  };
  const holder = document.getElementById("shieldLibraryListHolder");
  let returnMethod = null;

  const addShield = async (shieldElement) => {
    let dataToSave = structuredClone(shieldElement);
    delete dataToSave.bannerSettings;
    delete dataToSave.banners;
    delete dataToSave.group;

    dataToSave.shieldId = crypto.randomUUID();
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
    console.log(dataToSave);

    try {
      await db.put(dataToSave);
      await loadShields();
      return true;
    } catch (err) {
      alert("Failed to add shield: " + err);
      return false;
    }
  };

  const removeShield = async (shieldId) => {
    if (
      confirm(
        "Are you sure you want to remove " +
          (await db.get(shieldId)).shieldName +
          "?",
      )
    ) {
      try {
        await db.delete(shieldId);
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

    try {
      const shields = await db.getAll();
      holder.innerHTML = "";

      shields.forEach((shield) => {
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
