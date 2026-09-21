// Shield Editor
const shieldEditorModal = document.querySelector("#shieldEditorModal");
const holder = document.querySelector("#modalHolder");

let baseShield = new Shield();
let currentScale = "actual";

const ShieldEditor = (() => {
  const readForm = () => {
    baseShield.variant = document.querySelector("#selectedShieldVariant").value;
    baseShield.shieldBacks = document.querySelector(
      "#selectedShieldBacks",
    ).checked;
    baseShield.shieldBackColor =
      document.querySelector("#selectedBackColor").value;
    baseShield.shieldBackRadius = parseFloat(
      document.querySelector("#selectedBackRoudness").value,
    );
    baseShield.routeNumber = document.querySelector(
      "#spShield_routeNumber",
    ).value;
    baseShield.designation = document.querySelector(
      "#spShield_designation",
    ).value;
    baseShield.scale = parseFloat(
      document.querySelector("#spShield_scale").value,
    );
    baseShield.customShields.route_scale = parseFloat(
      document.querySelector("#spShield_routeScale").value,
    );
    baseShield.customShields.route_xOffset = parseFloat(
      document.querySelector("#spShield_routeXOffset").value,
    );
    baseShield.customShields.route_yOffset = parseFloat(
      document.querySelector("#spShield_routeYOffset").value,
    );
    baseShield.customShields.route_letterSpacing = parseFloat(
      document.querySelector("#spShield_routeSpacing").value,
    );
    baseShield.customShields.route_fontFamily = document.querySelector(
      "#spShield_routeFontFamily",
    ).value;
    baseShield.customShields.route_color = document.querySelector(
      "#spShield_routeColor",
    ).value;
    baseShield.customShields.designation_scale = parseFloat(
      document.querySelector("#spShield_designationScale").value,
    );
    baseShield.customShields.designation_xOffset = parseFloat(
      document.querySelector("#spShield_designationXOffset").value,
    );
    baseShield.customShields.designation_yOffset = parseFloat(
      document.querySelector("#spShield_designationYOffset").value,
    );
    baseShield.customShields.designation_letterSpacing = parseFloat(
      document.querySelector("#spShield_designationSpacing").value,
    );
    baseShield.customShields.designation_fontFamily = document.querySelector(
      "#spShield_designationFontFamily",
    ).value;
    baseShield.customShields.designation_color = document.querySelector(
      "#spShield_designationColor",
    ).value;
    baseShield.horizMargin = parseFloat(
      document.querySelector("#spShield_horizMargins").value,
    );
    baseShield.vertMargin = parseFloat(
      document.querySelector("#spShield_vertMargins").value,
    );

    updateForm();
    redrawShield();
  };

  const updateForm = () => {
    const properties =
      baseShield.shieldType === "preset"
        ? Shield.prototype.getPropertiesFromName(baseShield.shieldValue)
        : { name: baseShield.shieldName, variants: [] };

    const variantSelect = document.querySelector("#selectedShieldVariant");

    variantSelect.innerHTML = "";
    for (const variant of properties.variants) {
      lib.appendOption(variantSelect, variant, {
        selected: baseShield.variant === variant,
      });
    }

    document.querySelector(".selectedShieldName").textContent =
      baseShield.shieldName;

    // preview image
    document.querySelector(".selectedShieldPreview").src =
      Shield.prototype.getImageData(baseShield);
    document.querySelector(".selectedShieldPreview").alt =
      baseShield.shieldValue;

    if (baseShield.shieldBacks) {
      document
        .querySelector(".selectedShieldPreview")
        .style.setProperty("--shieldBackColor", baseShield.shieldBackColor);
      document
        .querySelector(".selectedShieldPreview")
        .style.setProperty(
          "--shieldBackRadius",
          baseShield.shieldBackRadius + "px",
        );
    } else {
      document
        .querySelector(".selectedShieldPreview")
        .style.removeProperty("--shieldBackColor");
      document
        .querySelector(".selectedShieldPreview")
        .style.removeProperty("--shieldBackRadius");
    }

    document.querySelector("#selectedShieldBacks").checked =
      baseShield.shieldBacks;

    document.querySelector("#shieldBackOptions").style.display =
      !baseShield.shieldBacks ? "none" : "";

    document.querySelector("#selectedBackColor").value =
      baseShield.shieldBackColor;
    document.querySelector("#selectedBackRoudness").value =
      baseShield.shieldBackRadius;
    document.querySelector("#spShield_routeNumber").value =
      baseShield.routeNumber;
    document.querySelector("#spShield_routeFontFamily").value =
      baseShield.customShields.route_fontFamily;
    document.querySelector("#spShield_routeColor").value =
      baseShield.customShields.route_color;
    document.querySelector("#spShield_routeSpacing").value =
      baseShield.customShields.route_letterSpacing;
    document.querySelector("#spShield_designation").value =
      baseShield.designation;
    document.querySelector("#spShield_designationFontFamily").value =
      baseShield.customShields.designation_fontFamily;
    document.querySelector("#spShield_designationColor").value =
      baseShield.customShields.designation_color;
    document.querySelector("#spShield_designationSpacing").value =
      baseShield.customShields.designation_letterSpacing;
    document.querySelector("#spShield_scale").value = baseShield.scale;
    document.querySelector("#spShield_scaleVal").value = baseShield.scale;
    document.querySelector("#spShield_routeXOffset").value =
      baseShield.customShields.route_xOffset;
    document.querySelector("#spShield_routeYOffset").value =
      baseShield.customShields.route_yOffset;
    document.querySelector("#spShield_routeScale").value =
      baseShield.customShields.route_scale;
    document.querySelector("#spShield_designationXOffset").value =
      baseShield.customShields.designation_xOffset;
    document.querySelector("#spShield_designationYOffset").value =
      baseShield.customShields.designation_yOffset;
    document.querySelector("#spShield_designationScale").value =
      baseShield.customShields.designation_scale;
    document.querySelector("#spShield_horizMargins").value =
      baseShield.horizMargin;
    document.querySelector("#spShield_vertMargins").value =
      baseShield.vertMargin;

    const cloneNode = document
      .querySelector("#saveToShieldLibrary")
      .cloneNode(true);
    document
      .querySelector("#saveToShieldLibrary")
      .parentNode.replaceChild(
        cloneNode,
        document.querySelector("#saveToShieldLibrary"),
      );

    cloneNode.addEventListener("click", async () => {
      if (await ShieldLibrary.addShield(baseShield)) {
        cloneNode.innerHTML =
          '<span class="material-symbols-outlined">check</span>Saved!';
      }
    });
  };

  const redrawShield = () => {
    const preview = document.querySelector("#shieldPreviewImage");
    preview.innerHTML = "";
    const shieldElement = baseShield.createElement();
    shieldElement.style.margin = "0";

    preview.appendChild(shieldElement);

    if (currentScale === "fit") {
      shieldElement.style.setProperty("--shieldScale", 1);
      shieldElement.style.fontSize = "1rem";

      let boxSize = preview.getBoundingClientRect().width;
      let shieldSize = shieldElement.getBoundingClientRect().width;

      shieldElement.style.scale = boxSize / shieldSize;
    }

    document.querySelector("#shieldBaseName").textContent = `${
      baseShield.shieldType == "custom"
        ? baseShield.shieldName.replace(/\.\w+/g, "")
        : Shield.prototype
            .getPropertiesFromName(baseShield.shieldValue)
            .name.toUpperCase()
    }-${baseShield.routeNumber}`;
  };

  const promptEditShield = (shieldBase = {}, returnFunction) => {
    baseShield = new Shield(shieldBase);

    let eventListeners = [];

    const trackListener = (element, type, handler) => {
      if (element) {
        element.addEventListener(type, handler);
        eventListeners.push({ element, type, handler });
      }
    };

    const cleanupListeners = () => {
      for (const item of eventListeners) {
        item.element.removeEventListener(item.type, item.handler);
      }
      eventListeners = [];
    };

    return new Promise((resolve) => {
      const closeFunction = (value) => {
        shieldEditorModal.close();
        shieldEditorModal.style.display = "none";
        holder.style.display = "none";
        cleanupListeners();
        if (returnFunction) returnFunction(value);
        resolve(value);
      };

      trackListener(document.querySelector("#shieldEditorClose"), "click", () =>
        closeFunction(null),
      );

      trackListener(shieldEditorModal, "cancel", (event) => {
        event.preventDefault();
        () => closeFunction(null);
      });

      trackListener(document.querySelector("#setShield"), "click", () =>
        closeFunction(baseShield),
      );

      trackListener(
        document.querySelector("#openShieldLibrary"),
        "click",
        async () => {
          const shield = await promptShieldLibrary();
          console.log(shield);
          if (shield) {
            Object.assign(baseShield, shield);
            updateForm();
            redrawShield();
          }
        },
      );

      trackListener(document.querySelector("#shieldFullSize"), "click", () => {
        currentScale = "actual";
        document.querySelector("#shieldFullSize").classList.add("selected");
        document.querySelector("#shieldFitSize").classList.remove("selected");
        redrawShield();
      });

      trackListener(document.querySelector("#shieldFitSize"), "click", () => {
        currentScale = "fit";
        document.querySelector("#shieldFullSize").classList.remove("selected");
        document.querySelector("#shieldFitSize").classList.add("selected");
        redrawShield();
      });

      const searchFromDir = (dir, parentElem, createListeners) => {
        let hasAnything = false;
        if (!parentElem) return hasAnything;

        for (const category in dir) {
          if (category == "type") continue;
          const cat = dir[category];

          if (cat.type == "category") {
            const childElem = parentElem.querySelector(
              `.shieldCategory[data-category="${category}"]`,
            );
            if (childElem && searchFromDir(cat, childElem, createListeners)) {
              hasAnything = true;
              if (baseShield.name != "") {
                childElem.classList.remove("open");
                childElem.querySelector(".shieldCategoryHead")?.click();
              }
            }
          } else if (cat.type == "shield") {
            const childElem = parentElem.querySelector(
              `.shieldCategoryType[data-name="${category}"]`,
            );
            if (!childElem) continue;

            if (cat.name == baseShield.shieldName) {
              hasAnything = true;
              childElem.classList.add("selected");
              const indicator = childElem.querySelector(".shieldItemSelected");
              if (indicator) indicator.textContent = "radio_button_checked";
            } else {
              childElem.classList.remove("selected");
              const indicator = childElem.querySelector(".shieldItemSelected");
              if (indicator) indicator.textContent = "radio_button_unchecked";
            }

            if (createListeners) {
              trackListener(childElem, "click", (event) => {
                const item = event.currentTarget;
                const properties = Shield.prototype.getPropertiesFromName(
                  item.dataset.name,
                );
                baseShield.shieldType = "preset";
                baseShield.shieldName =
                  item.querySelector(".shieldItemName").textContent;
                baseShield.shieldValue = item.dataset.name;
                if (!properties.variants.includes(baseShield.variant)) {
                  baseShield.variant = properties.variants[0] || "";
                }

                searchFromDir(
                  Shield.prototype.shieldDirectory,
                  document.querySelector("#presetShieldList"),
                  false,
                );

                readForm();
              });
            }
          }
        }
        return hasAnything;
      };

      // Initial load of the shield directory item listeners
      searchFromDir(
        Shield.prototype.shieldDirectory,
        document.querySelector("#presetShieldList"),
        true,
      );

      window.customShields.loadSavedShields(() => {
        baseShield.shieldType = "custom";
        baseShield.shieldName = shield.fileName;
        baseShield.imageType = "data";
        baseShield.imageData = shield.data;
        updateForm();
      });

      holder.style.display = "flex";
      shieldEditorModal.style.display = "flex";
      shieldEditorModal.showModal();

      updateForm();
      redrawShield();
    });
  };

  const promptShieldLibrary = () => {
    const modal = document.querySelector("#shieldImgLibrary");
    let eventListeners = [];

    const trackListener = (element, type, handler) => {
      if (element) {
        element.addEventListener(type, handler);
        eventListeners.push({ element, type, handler });
      }
    };

    const cleanup = () => {
      for (const item of eventListeners) {
        item.element.removeEventListener(item.type, item.handler);
      }
      eventListeners = [];
    };

    document.querySelector("#shieldLibraryDelete").disabled = true;

    return new Promise((resolve) => {
      let selectedShield = null;
      modal.style.display = "flex";
      modal.showModal();

      const close = (value) => {
        modal.style.display = "none";
        modal.close();
        cleanup();
        resolve(value);
      };

      trackListener(
        document.querySelector("#shieldImgLibraryClose"),
        "click",
        () => close(null),
      );

      trackListener(modal, "cancel", () => close(null));
      window.shieldLibrary.loadShields((shield) => {
        selectedShield = shield;
        document.querySelector("#shieldLibraryDelete").disabled = false;
      });

      trackListener(
        document.querySelector("#shieldLibraryDelete"),
        "click",
        () => {
          if (selectedShield != null) {
            window.shieldLibrary.removeShield(selectedShield.shieldID);
          }
        },
      );

      trackListener(document.querySelector("#shieldLibraryUse"), "click", () =>
        close(selectedShield),
      );
    });
  };

  return {
    readForm,
    updateForm,
    promptEditShield,
    promptShieldLibrary,
  };
})();
