const FormNavigation = (() => {
  let exposed;
  let post;
  let scrollCooldown = false;
  let isFooterVisible = false;

  const initUI = (exposedAPI, postObj) => {
    exposed = exposedAPI;
    post = postObj;

    setupThemeAndWelcome();
    setupNavigation();
    setupTooltips();
    setupAdvancedMenu();
    setupHorizontalScroll();
    setupResetButtons();
    setupPostOptions();
    setupPanelOptions();
    setupExitTabOptions();
    setupControlSignElements();
    setupShields();
    setupLimonEasterEgg();
  };

  // Theme and Welcome Modal
  const setupThemeAndWelcome = () => {
    const applyTheme = (theme) => {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem("userTheme", theme);
      document.querySelector("#nightMode").dataset.tooltip =
        theme == "dark" ? "Day Mode" : "Night Mode";
    };

    document.querySelector("#nightMode").addEventListener("click", () => {
      const nextTheme =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });

    document.querySelector("#nightMode").dataset.tooltip =
      document.documentElement.dataset.theme == "dark"
        ? "Day Mode"
        : "Night Mode";

    if (!localStorage.getItem("closedWelcome")) {
      document.querySelector("#modalHolder").style.display = "flex";
      document.querySelector("#welcomeToSignMaker").showModal();
    }
  };

  const setupNavigation = () => {
    const reDisplay = () => {
      for (const holder of document.querySelectorAll(".sMModal")) {
        if (holder.classList.contains(sMConfigBar.dataset.currentMenu)) {
          holder.style.display = "block";
        } else {
          holder.style.display = "";
        }
      }

      if (
        sMConfigBar.dataset.currentMenu != "" &&
        sMConfigBar.dataset.currentMenu != "panelSelector" &&
        !document.querySelector("#smRender").classList.contains("wide") &&
        App.getPost().panels.length <= 2
      ) {
        document.querySelector("#smRender").classList.add("modalOpen");
      } else {
        document.querySelector("#smRender").classList.remove("modalOpen");
      }

      if (
        sMConfigBar.dataset.currentMenu != "" &&
        sMConfigBar.dataset.currentMenu != "panelSelector" &&
        document.querySelector("#smRender").classList.contains("wide")
      ) {
        document
          .querySelector(
            "#panel" + App.exposeToFormHandler.vars.currentlySelectedPanelIndex,
          )
          .scrollIntoView({
            behavior: "smooth", // or 'auto'
            block: "nearest", // Prevents vertical scroll
            inline: "start", // Scrolls horizontally to the left edge
          });
      }

      if (sMConfigBar.dataset.currentMenu == "panelSelector") {
        document.querySelector("#panelSelect").style.display = "flex";
        document.querySelectorAll(
          ".sMConfigOption:has(#panelSelector)",
        )[0].className = "sMConfigOption selected";
      } else {
        document.querySelector("#panelSelect").style.display = "";
        document.querySelectorAll(
          ".sMConfigOption:has(#panelSelector)",
        )[0].className = "sMConfigOption";
      }

      for (const button of document.querySelectorAll(".sMConfigOption")) {
        if (!button.id || button.id == "nightMode") {
          continue;
        }

        if (button.id == sMConfigBar.dataset.currentMenu) {
          button.className = "sMConfigOption selected";
        } else {
          button.className = "sMConfigOption";
        }
      }
    };

    for (const button of document.querySelectorAll(".sMConfigOption")) {
      button.onclick = function () {
        if (!button.id || button.id == "nightMode") {
          return;
        }

        if (sMConfigBar.dataset.currentMenu == button.id) {
          sMConfigBar.dataset.currentMenu = "";
        } else {
          sMConfigBar.dataset.currentMenu = button.id;
        }

        reDisplay();
      };
    }

    for (const button of document.querySelectorAll(".sMModalTab")) {
      const input = () => {
        if (!button.dataset.tab) {
          return;
        }

        const modal = document.querySelectorAll(
          '.sMModal:has(.sMModalTab[data-tab="' + button.dataset.tab + '"]',
        )[0];

        if (modal.dataset.currentMenu != button.dataset.tab) {
          modal.dataset.currentMenu = button.dataset.tab;
        }

        for (const holder of modal.querySelectorAll(".sMModalContent > *")) {
          if (holder.id != modal.dataset.currentMenu) {
            holder.classList.add("tabHidden");
          } else {
            holder.classList.remove("tabHidden");
          }
        }

        for (const btn of modal.querySelectorAll(".sMModalTab")) {
          if (btn.dataset.tab == button.dataset.tab) {
            btn.className = "sMModalTab selected";
          } else {
            btn.className = "sMModalTab";
          }
        }
      };
      button.addEventListener("click", input);
      button.addEventListener("keydown", (e) => {
        if (e.keyCode === 13 || e.keyCode == 32) {
          e.preventDefault();
          input();
        }
      });
    }

    document.querySelector("#panelSelector").onclick = function () {
      if (sMConfigBar.dataset.currentMenu == this.id) {
        sMConfigBar.dataset.currentMenu = "";
      } else {
        sMConfigBar.dataset.currentMenu = this.id;
      }

      reDisplay();
    };

    document.getElementsByName("signMaker")[0].onsubmit = function (e) {
      e.preventDefault();
    };

    document.getElementById("hideConfig").onclick = function () {
      if (sMConfigBar.classList.contains("invisible")) {
        sMConfigBar.classList.remove("invisible");
        document.querySelector(".mutcd-link").style.display = "";
        this.dataset.tooltip = "Hide";
      } else {
        sMConfigBar.classList.add("invisible");
        document.querySelector(".mutcd-link").style.display = "none";
        this.dataset.tooltip = "Show";
      }
    };

    document.querySelector("#sdShieldGroup_OpenShieldEditor").onclick =
      function () {
        document
          .querySelector(
            "body > form > div > div.sMModal.subPanelConfig > nav.sMModalBar.sMModalSubBar > a:nth-child(2)",
          )
          .click();
      };
  };

  // Tooltips
  const setupTooltips = () => {
    const sMConfigBar = document.querySelector("#sMConfigBar");
    const tooltip = document.createElement("span");
    tooltip.className = "tooltip";
    tooltip.style.opacity = 0;
    document.body.appendChild(tooltip);

    const bindTooltip = (element) => {
      element.addEventListener("mouseover", () => {
        const boundingRect = element.getBoundingClientRect();
        tooltip.textContent = element.dataset.tooltip;
        tooltip.style.left =
          boundingRect.left +
          (boundingRect.right - boundingRect.left) / 2 +
          "px";
        tooltip.style.top = boundingRect.top - tooltip.offsetHeight - 10 + "px";
        tooltip.style.opacity = 1;
        tooltip.style.transform = "translateX(-50%)";

        if (sMConfigBar.contains(element)) {
          tooltip.style.fontFamily = "Overpass";
        } else {
          tooltip.style.fontFamily = "Inter";
        }
      });

      element.addEventListener("mouseout", () => {
        tooltip.style.opacity = 0;
        tooltip.style.left = "-100px";
        tooltip.style.top = 0;
        tooltip.textContent = "";
        tooltip.style.transform = "";
      });
    };

    for (const element of document.querySelectorAll("[data-tooltip]")) {
      bindTooltip(element);
    }

    const observer = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (node.dataset.tooltip != null) {
                bindTooltip(node);
              }

              node.querySelectorAll("[data-tooltip]").forEach((descendant) => {
                bindTooltip(descendant);
              });
            }
          });
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const scrollObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        isFooterVisible = entry.isIntersecting;
        if (entry.isIntersecting) {
          setTimeout(() => {
            document.querySelector("#sMConfigBar").style.display = "none";
          }, 100);
        } else {
          document.querySelector("#sMConfigBar").style.display = "";
        }
        setTimeout(() => {
          document.querySelector("#sMConfigBar").style.opacity =
            entry.isIntersecting ? 0 : 1;
        }, 5);
      }
    });
    setTimeout(() => {
      scrollObserver.observe(document.querySelector("#signMakerFooter"));
    }, 1000);
  };

  // Advanced Menu Toggle
  const setupAdvancedMenu = () => {
    document
      .querySelector("#smSPShieldAdvanced")
      .addEventListener("click", () => {
        if (
          document.querySelector("#advancedMenu").classList.contains("hidden")
        ) {
          document.querySelector("#advancedMenu").classList.remove("hidden");
        } else {
          document.querySelector("#advancedMenu").classList.add("hidden");
        }
      });
  };

  // Horizontal Scroll on Wheel
  const setupHorizontalScroll = () => {
    const horizontalScrollOnWheel = document.querySelectorAll(
      ".horizontal-scroll-on-wheel",
    );
    horizontalScrollOnWheel.forEach((scrollableElement) => {
      scrollableElement.addEventListener("wheel", (event) => {
        if (scrollCooldown) {
          return;
        }

        event.preventDefault();
        scrollableElement.scrollBy({
          left: event.deltaY,
          behavior: "smooth",
        });
      });
    });

    window.addEventListener("scroll", () => {
      if (!isFooterVisible) {
        return;
      }

      const scrollLeft = document.body.scrollLeft;
      document.querySelector("#signMakerFooter").style.left = scrollLeft + "px";
    });
  };

  // Reset Buttons
  const setupResetButtons = () => {
    const borderReset = document.querySelector("#borderReset");
    const minimumReset = document.querySelector("#minimumReset");
    const sizeReset = document.querySelector("#sizeReset");
    const paddingReset = document.querySelector("#paddingReset");

    borderReset.onclick = function () {
      document.querySelector("#borderThickness").value = 0.2;
      document.querySelector("#borderValue").textContent = 0.2;
      formHandler.readForm();
    };

    minimumReset.onclick = function () {
      document.querySelector("#minHeight").value = 2.25;
      document.querySelector("#minValue").textContent = 2.25;
      formHandler.readForm();
    };

    sizeReset.onclick = function () {
      document.querySelector("#fontSize").value = 16;
      document.querySelector("#fontValue").textContent = 16;
      formHandler.readForm();
    };

    paddingReset.onclick = function () {
      document.querySelector("#exitOnlyPadding").value = 0.25;
      document.querySelector("#paddingValue").textContent = 0.25;
      formHandler.readForm();
    };
  };

  // ============================================================================
  // POST OPTIONS SETUP
  // ============================================================================

  const setupPostOptions = () => {
    // Post position
    const postPositionSelectElmt = document.querySelector("#postPosition");
    for (const polePosition of Post.prototype.polePositions) {
      lib.appendOption(postPositionSelectElmt, polePosition, {
        selected: polePosition == post.polePosition,
      });
    }

    // Post color
    const postColorSelectElmt = document.querySelector("#postColor");
    for (const colorOption of Post.prototype.colors) {
      lib.appendOption(postColorSelectElmt, colorOption, {
        selected: colorOption === post.color,
      });
    }

    // Post variant
    const postVariantSelectElmt = document.querySelector("#postVariant");
    for (const variant of Post.prototype.postVariants) {
      lib.appendOption(postVariantSelectElmt, variant, {
        selected: variant === post.variant,
      });
    }
  };

  const setupPanelOptions = () => {
    // Panel color
    const colorSelectElmt = document.querySelector("#panelColor");
    for (const color in lib.colors) {
      lib.appendOption(colorSelectElmt, color, { text: color });
    }

    // Panel corner
    const cornerTypeSelectElmt = document.querySelector("#panelCorner");
    for (const corner of Panel.prototype.cornerType) {
      lib.appendOption(cornerTypeSelectElmt, corner, {
        selected: corner == "Round",
      });
    }

    // Shield position
    const shieldPositionsSelectElmt =
      document.querySelector("#shieldsPosition");
    for (const position of Sign.prototype.shieldPositions) {
      lib.appendOption(shieldPositionsSelectElmt, position, {
        selected: position == "Above",
      });
    }

    // Guide arrow options
    const guideArrowSelectElmt = document.querySelector("#guideArrow");
    for (const guideArrow of Sign.prototype.guideArrows) {
      const display = guideArrow.split(":")[0];
      lib.appendOption(guideArrowSelectElmt, display);
    }

    // Exit-only guide arrow options
    const exitOnlyDirectionElmt = document.querySelector("#exitOnlyDirection");
    for (const exitguideArrows of Sign.prototype.exitguideArrows) {
      const display = exitguideArrows.split(":")[0];
      lib.appendOption(exitOnlyDirectionElmt, display);
    }

    // Arrow directions
    const arrowDirectionElmt = document.querySelector("#arrowLocations");
    for (const arrowDirection of Sign.prototype.arrowPositions) {
      lib.appendOption(arrowDirectionElmt, arrowDirection);
    }

    // Other symbols
    const otherSymbolSelectElement = document.querySelector("#otherSymbol");
    for (const otherSymbol of Sign.prototype.otherSymbols) {
      lib.appendOption(otherSymbolSelectElement, otherSymbol);
    }
  };

  // ============================================================================
  // EXIT TAB OPTIONS SETUP
  // ============================================================================

  const setupExitTabOptions = () => {
    // Exit tab position
    const exitTabPositionSelectElmt =
      document.querySelector("#exitTabPosition");
    for (const position of ExitTab.prototype.positions) {
      lib.appendOption(exitTabPositionSelectElmt, position, {
        selected: position == "Right",
      });
    }

    // Exit tab width
    const exitTabWidthSelectElmt = document.querySelector("#exitTabWidth");
    for (const width of ExitTab.prototype.widths) {
      lib.appendOption(exitTabWidthSelectElmt, width, {
        selected: width == "Narrow",
      });
    }

    // Exit color
    const exitColorSelectElement = document.querySelector("#exitColor");
    for (const exitColor of ExitTab.prototype.colors) {
      lib.appendOption(exitColorSelectElement, exitColor);
    }

    // Exit variant
    const exitVariantSelectElmt = document.querySelector("#exitVariant");
    for (const exitVariant of ExitTab.prototype.variants) {
      lib.appendOption(exitVariantSelectElmt, exitVariant);
    }
    exitVariantSelectElmt.addEventListener("change", (event) => {
      const exitTollLogoOptions = document.getElementById(
        "exitTollLogoOptions",
      );
      if (event.target.value === "Toll Logo") {
        exitTollLogoOptions.classList.remove("hidden");
      } else {
        exitTollLogoOptions.classList.add("hidden");
      }
      formHandler.updateForm();
    });

    // Initial toll logo visibility
    const exitTollLogoOptions = document.querySelector("#exitTollLogoOptions");
    if (exitVariantSelectElmt.value === "Toll Logo") {
      exitTollLogoOptions.classList.remove("hidden");
    } else {
      exitTollLogoOptions.classList.add("hidden");
    }

    // Toll logo selection
    const exitTollLogoSelectElmt = document.querySelector(
      "#exitTollLogoSelect",
    );
    for (const [logoKey, logoDef] of Object.entries(
      TollLogoElement.prototype.logos,
    )) {
      lib.appendOption(exitTollLogoSelectElmt, logoKey, {
        text: logoDef.label,
        selected: logoKey == TollLogoElement.prototype.defaultLogo,
      });
    }

    /*
    // Exit icons
    const iconSelectSelectElmt = document.querySelector("#iconSelect");
    for (const icons of ExitTab.prototype.icons) {
      lib.appendOption(iconSelectSelectElmt, icons.split(":")[0]);
    }
      */

    // Element list
    const sMSPElementSelect = document.querySelector("#sMSPElementSelect");
    for (const element in Control.prototype.blockElements) {
      lib.appendOption(sMSPElementSelect, element, {
        selected: element == "Standard Control Text",
        text: Control.prototype.blockElements[element],
      });
    }
  };

  // ============================================================================
  // CONTROL SIGN ELEMENTS SETUP
  // ============================================================================

  const setupControlSignElements = () => {
    // Font families
    let textElem_fontFamilySelects = [
      document.querySelector("#sdCtrlText_fontFamily"),
      document.querySelector("#sdAdvisory_fontFamily"),
      document.querySelector("#sdActionMessage_fontFamily"),
    ];
    for (const elem of textElem_fontFamilySelects) {
      for (const fontFamily of TextElement.prototype.fontFamily) {
        lib.appendOption(elem, fontFamily);
      }
    }

    // Text alignment
    let textElem_alignmentSelects = [
      document.querySelector("#sdCtrlText_alignment"),
      document.querySelector("#sdAdvisory_alignment"),
      document.querySelector("#sdActionMessage_alignment"),
      document.querySelector("#sdBlocker_alignment"),
      document.querySelector("#sdElectronicSign_alignment"),
      document.querySelector("#sdTollLogo_alignment"),
      document.querySelector("#sdBeacon_alignment"),
      document.querySelector("#sdArrow_alignment"),
      document.querySelector("#sdShieldGroup_alignment"),
    ];
    for (const elem of textElem_alignmentSelects) {
      for (const alignment of TextElement.prototype.alignment) {
        lib.appendOption(elem, alignment);
      }
    }

    // Background colors
    let textElem_bgColorSelects = [
      document.querySelector("#sdCtrlText_backgroundColor"),
      document.querySelector("#sdAdvisory_backgroundColor"),
      document.querySelector("#sdActionMessage_backgroundColor"),
      document.querySelector("#sdIcon_borderColor"),
      document.querySelector("#sdIcon_backgroundColor"),
      document.querySelector("#sdBlock_backgroundColor"),
      document.querySelector("#sdTollLogo_backgroundColor"),
    ];
    for (const elem of textElem_bgColorSelects) {
      for (const backgroundColor of TextElement.prototype.backgroundColor) {
        lib.appendOption(elem, backgroundColor);
      }
    }

    // Shields
    const shieldGroupSelect = document.querySelector(
      "#sdShieldGroup_direction",
    );
    for (const direction of ShieldGroupElement.prototype.direction) {
      lib.appendOption(shieldGroupSelect, direction);
    }

    // Beacon colors
    const beaconColorSelect = document.querySelector("#sdBeacon_color");
    for (const color of BeaconElement.prototype.colors) {
      lib.appendOption(beaconColorSelect, color);
    }

    // Control text font (with storage support)
    const controlTextFontSelect = document.querySelector(
      "#sdCtrlText_fontFamily",
    );
    let defaultControlFont = ControlTextElement.getDefaultFont
      ? ControlTextElement.getDefaultFont()
      : ControlTextElement.defaultFont;
    if (defaultControlFont) {
      controlTextFontSelect.value = defaultControlFont;
    }

    controlTextFontSelect.addEventListener("change", () => {
      const selectedFont = controlTextFontSelect.value;
      if (ControlTextElement.setDefaultFont) {
        ControlTextElement.setDefaultFont(selectedFont);
      } else {
        ControlTextElement.defaultFont = selectedFont;
      }
      StorageManager.setItem(
        StorageManager.STORAGE_KEYS.controlTextFont,
        selectedFont,
      );
    });

    // Electronic sign font family
    const eSignFontSelect = document.querySelector(
      "#sdElectronicSign_fontFamily",
    );
    for (const fontFamily of ElectronicSignElement.prototype.fontFamily) {
      lib.appendOption(eSignFontSelect, fontFamily);
    }

    // Electronic sign text colors
    const eSignColorSelect = document.querySelector(
      "#sdElectronicSign_textColor",
    );
    for (const textColor of ElectronicSignElement.prototype.textColors) {
      lib.appendOption(eSignColorSelect, textColor);
    }

    // Divider measurement
    const divider_widthMeasurement = document.querySelector(
      "#sdBlocker_dividerMeasurement",
    );
    for (const measurement of DividerElement.prototype.dividerMeasurement) {
      lib.appendOption(divider_widthMeasurement, measurement);
    }

    // Divider colors
    const divider_colorSelect = document.querySelector(
      "#sdBlocker_dividerColor",
    );
    for (const { value, label } of DividerElement.prototype.dividerColors) {
      lib.appendOption(divider_colorSelect, value, { text: label });
    }

    // Shield types
    const shield_shieldBase = document.querySelector("#sdShield_shieldBase");
    for (const shieldType in Shield.prototype.types) {
      lib.appendOption(shield_shieldBase, shieldType);
    }

    // Icons
    const iconElem_iconsSelect = document.querySelector("#sdIcon_icon");
    for (const icon of IconElement.prototype.icons) {
      lib.appendOption(iconElem_iconsSelect, icon);
    }

    // Arrows
    const arrowElemSelect = document.querySelector("#sdArrow_arrow");
    const arrowSizeInput = document.querySelector("#sdArrow_size");
    const arrowKeys =
      ArrowElement.prototype.arrowKeys ||
      Object.keys(ArrowElement.prototype.arrows || {});
    for (const arrowKey of arrowKeys) {
      const arrowDefinition = ArrowElement.prototype.arrows[arrowKey] || {};
      lib.appendOption(arrowElemSelect, arrowKey, {
        text: arrowDefinition.label || arrowKey,
        selected: arrowKey === ArrowElement.prototype.defaultArrow,
      });
    }

    arrowElemSelect.addEventListener("change", () => {
      const arrowDefinition =
        ArrowElement.prototype.arrows[arrowElemSelect.value] || null;
      const defaultSize =
        arrowDefinition &&
        typeof arrowDefinition.defaultSize === "number" &&
        !isNaN(arrowDefinition.defaultSize)
          ? arrowDefinition.defaultSize
          : ArrowElement.prototype.defaultSize;
      arrowSizeInput.value = defaultSize;
      formHandler.readForm();
    });

    // Arrow rotation slider
    const arrowRotationSlider = document.querySelector("#sdArrow_rotation");
    const arrowRotationVal = document.querySelector("#sdArrow_rotationVal");
    arrowRotationSlider.addEventListener("input", () => {
      arrowRotationVal.value = arrowRotationSlider.value;
    });

    // Arrow rotation presets
    const arrowRotationButtons = document.querySelectorAll(
      ".sdArrow_rotationPreset",
    );
    for (const button of arrowRotationButtons) {
      button.addEventListener("click", () => {
        const degrees = parseFloat(button.dataset.degrees || "0") || 0;
        arrowRotationSlider.value = degrees.toString();
        arrowRotationVal.value = degrees.toString();
        arrowRotationButtons.forEach((presetButton) => {
          presetButton.classList.toggle("activated", presetButton === button);
        });
        formHandler.readForm();
      });
    }

    // Arrow flip button
    const arrowFlipInput = document.querySelector("#sdArrow_flip");
    const arrowFlipButton = document.querySelector("#sdArrow_flipButton");
    arrowFlipButton.addEventListener("click", () => {
      const newValue = arrowFlipInput.value === "true" ? "false" : "true";
      arrowFlipInput.value = newValue;
      const isFlipped = newValue === "true";
      arrowFlipButton.classList.toggle("activated", isFlipped);
      arrowFlipButton.setAttribute(
        "aria-pressed",
        isFlipped ? "true" : "false",
      );
      arrowFlipButton.textContent = isFlipped ? "Unflip" : "Flip";
      formHandler.readForm();
    });

    // Small value inputs
    document.querySelectorAll(".smallVal").forEach((valEl) => {
      const onChange = (e) => {
        const id = valEl.id || "";
        if (id.endsWith("Val")) {
          const controlId = id.slice(0, -3);
          const control = document.getElementById(controlId);
          const isSuitable =
            control.type === "range" ||
            control.type === "number" ||
            control.tagName === "INPUT" ||
            control.tagName === "SELECT";
          if (isSuitable) {
            control.value = valEl.value;
          }
        }
        formHandler.readForm();
      };
      valEl.addEventListener("change", onChange);
    });

    // Toll logo selector
    const tollLogoSelectElmt = document.querySelector("#sdTollLogo_logo");
    for (const logoKey in TollLogoElement.prototype.logos) {
      const logoDef = TollLogoElement.prototype.logos[logoKey];
      lib.appendOption(tollLogoSelectElmt, logoKey, {
        text: logoDef.label,
        selected: logoKey == TollLogoElement.prototype.defaultLogo,
      });
    }
  };

  // ============================================================================
  // LIMON EASTER EGG SETUP
  // ============================================================================

  const setupLimonEasterEgg = () => {
    const isTextInputElement = (element) => {
      if (!element || element.disabled || element.readOnly) {
        return false;
      }
      const tagName = element.tagName;
      if (tagName === "TEXTAREA") {
        return true;
      }
      if (tagName === "INPUT") {
        const type = (element.type || "").toLowerCase();
        return (
          type === "text" ||
          type === "search" ||
          type === "email" ||
          type === "url" ||
          type === "tel" ||
          type === "password"
        );
      }
      return false;
    };

    const handleLimonInput = (event) => {
      const target = event.target;
      const LIMON_TRIGGER_VALUE = "limon";

      if (!isTextInputElement(target)) {
        return;
      }
      const trimmedValue = (target.value || "").trim().toLowerCase();
      if (trimmedValue === LIMON_TRIGGER_VALUE) {
        if (target.dataset.limonTriggered === "true") {
          return;
        }
        target.dataset.limonTriggered = "true";

        const audio = new Audio("assets/other-symbols/limon/limon.mp3");
        audio.volume = 0.5;
        audio.play();

        const limonJump = document.createElement("img");
        limonJump.src = "assets/other-symbols/limon/limon.png";
        limonJump.style = `
          width: 100%;
          height: 100%;
          position: absolute;
          inset: 0;
        `;
        document.body.appendChild(limonJump);

        const anim = limonJump.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 1000,
          direction: "normal",
          fill: "forwards",
          delay: 500,
        });
        anim.play();

        setTimeout(() => {
          delete target.dataset.limonTriggered;
        }, 500);

        setTimeout(() => {
          limonJump.remove();
          audio.remove();
        }, 1500);
      }
    };

    document.addEventListener("input", handleLimonInput, true);
  };

  const setupShields = () => {
    const presetShieldList = document.querySelector("#presetShieldList");

    const createShieldRow = (name, properties) => {
      const shieldCategoryType = document.createElement("button");
      const shieldCategoryImg = document.createElement("img");
      const shieldItemName = document.createElement("span");
      const shieldItemSeleted = document.createElement("span");
      shieldCategoryType.className = "shieldCategoryType";
      shieldCategoryImg.className = "shieldItemImg";
      shieldItemName.className = "shieldItemName";
      shieldItemSeleted.className =
        "shieldItemSelected material-symbols-outlined";

      shieldCategoryImg.src = Shield.prototype.getDirectoryFromShield(
        name,
        properties.variants[0] || "",
      );

      shieldItemName.textContent = properties.name;
      shieldItemSeleted.textContent = "radio_button_unchecked";

      shieldCategoryType.appendChild(shieldCategoryImg);
      shieldCategoryType.appendChild(shieldItemName);
      shieldCategoryType.appendChild(shieldItemSeleted);

      shieldCategoryType.dataset.name = name;

      return shieldCategoryType;
    };

    const createShieldCategory = (name) => {
      const shieldCategory = document.createElement("div");
      const shieldCategoryHead = document.createElement("button");
      const dropdownArrow = document.createElement("span");
      const shieldCategoryName = document.createElement("span");

      shieldCategory.className = "shieldCategory";
      shieldCategoryHead.className = "shieldCategoryHead";
      dropdownArrow.className = "material-symbols-outlined";
      dropdownArrow.textContent = "arrow_drop_down";
      shieldCategoryName.className = "shieldCategoryName";
      shieldCategoryName.textContent = name + " (Expand)";

      shieldCategoryHead.addEventListener("click", () => {
        shieldCategory.classList.toggle("open");
        dropdownArrow.textContent = shieldCategory.classList.contains("open")
          ? "arrow_drop_up"
          : "arrow_drop_down";
        shieldCategoryName.textContent =
          name +
          (shieldCategory.classList.contains("open")
            ? " (Collapse)"
            : " (Expand)");
      });

      shieldCategoryHead.appendChild(dropdownArrow);
      shieldCategoryHead.appendChild(shieldCategoryName);
      shieldCategory.append(shieldCategoryHead);
      shieldCategory.dataset.category = name;

      return shieldCategory;
    };

    const createFromDir = (dir, parentElem) => {
      for (const category in dir) {
        if (category == "type") {
          continue;
        }
        const cat = dir[category];
        if (cat.type == "category") {
          const holder = createShieldCategory(category);
          createFromDir(cat, holder);
          parentElem.appendChild(holder);
        } else if (cat.type == "shield") {
          parentElem.appendChild(createShieldRow(category, cat));
        }
      }
    };

    createFromDir(Shield.prototype.shieldDirectory, presetShieldList);

    // Preset/Custom Shield Tabs
    document.querySelector("#presetShields").addEventListener("click", () => {
      document.querySelector(".shieldLibrary").dataset.tab = "presetShieldList";
      document.querySelector("#presetShields").className = "selected";
      document.querySelector("#customShields").className = "";
    });

    document.querySelector("#customShields").addEventListener("click", () => {
      document.querySelector(".shieldLibrary").dataset.tab = "uploadShield";
      document.querySelector("#customShields").className = "selected";
      document.querySelector("#presetShields").className = "";
    });

    // Shield Search
    document
      .querySelector("#presetShieldSearch")
      .addEventListener("input", () => {
        const query = document
          .querySelector("#presetShieldSearch")
          .value.toLowerCase();
        const searchFromDir = (dir, parentElem) => {
          let hasAnything = false;
          for (const category in dir) {
            const cat = dir[category];
            if (category == "type") {
              continue;
            }

            if (cat.type == "category") {
              const childElem = parentElem.querySelector(
                '.shieldCategory[data-category="' + category + '"]',
              );
              if (searchFromDir(cat, childElem)) {
                hasAnything = true;
                childElem.classList.remove("hidden");

                if (query != "") {
                  childElem.classList.remove("open");
                  childElem.querySelector(".shieldCategoryHead").click();
                }
              } else {
                childElem.classList.add("hidden");
                childElem.classList.add("open");
                childElem.querySelector(".shieldCategoryHead").click();
              }
            } else if (
              cat.type == "shield" &&
              cat.name.toLowerCase().includes(query)
            ) {
              hasAnything = true;
              parentElem.querySelector(
                '.shieldCategoryType[data-name="' + category + '"]',
              ).style.display = "";
            } else {
              parentElem.querySelector(
                '.shieldCategoryType[data-name="' + category + '"]',
              ).style.display = "none";
            }
          }
          return hasAnything;
        };
        searchFromDir(Shield.prototype.shieldDirectory, presetShieldList);
      });
  };

  return {
    initUI,
  };
})();
