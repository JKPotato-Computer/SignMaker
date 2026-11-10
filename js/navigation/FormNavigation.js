const FormNavigation = (() => {
  let post;
  let scrollCooldown = false;
  let isFooterVisible = false;

  const initUI = (exposedAPI, postObj) => {
    exposed = exposedAPI;
    post = postObj;

    setupThemeAndWelcome();
    setupNavigation();
    setupTooltips();
    setupHorizontalScroll();
    setupPostOptions();
    setupPanelOptions();
    setupExitTabOptions();
    setupControlSignElements();
    setupShields();
    setupGuideArrows();
    setupLimonEasterEgg();
    setupDropdownElements();
    setupSettings();
    setupColorHandler();

    const changeEvent = new Event("change", { bubbles: true });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        if (event.target.tagName === "TEXTAREA") return;
        if (event.target.tagName === "BUTTON") return;

        if (event.target.tagName === "INPUT") {
          event.target.dispatchEvent(changeEvent);
        }

        event.preventDefault();
      }
    });
  };

  const setupThemeAndWelcome = () => {
    const applyTheme = (theme) => {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem("userTheme", theme);
      document.querySelector("#nightMode").dataset.tooltip =
        theme == "dark" ? "Day Mode" : "Night Mode";
      document.querySelector("#nightMode").innerHTML =
        `<span class="material-symbols-outlined"> ${theme == "dark" ? "light_mode" : "dark_mode"} </span>`;
    };

    document.querySelector("#nightMode").addEventListener("click", () => {
      const nextTheme =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });

    applyTheme(document.documentElement.dataset.theme);

    if (!localStorage.getItem("closedWelcome")) {
      document.querySelector("#modalHolder").style.display = "flex";
      document.querySelector("#welcomeToSignMaker").showModal();
    }

    document.querySelector("#closeWelcome").addEventListener("click", () => {
      localStorage.setItem("closedWelcome", true);
      document.querySelector("#modalHolder").style.display = "none";
      document.querySelector("#welcomeToSignMaker").close();
    });
  };

  const setupNavigation = () => {
    const reDisplay = () => {
      let isModalOpen = false;
      for (const holder of document.querySelectorAll(".sMModal")) {
        if (holder.classList.contains(sMConfigBar.dataset.currentMenu)) {
          holder.style.display = "block";

          if (window.innerWidth > 768) {
            let width = holder.getBoundingClientRect().left;
            document.querySelector("#smRender").style.transform =
              `translateX(${width}px)`;
            isModalOpen = true;
          }
        } else {
          holder.style.display = "";
        }
      }

      if (!isModalOpen) {
        document.querySelector("#smRender").style.transform = "";
      }

      if (
        sMConfigBar.dataset.currentMenu != "" &&
        sMConfigBar.dataset.currentMenu != "panelSelector" &&
        document.querySelector("#smRender").classList.contains("wide")
      ) {
        document
          .querySelector(
            "#panel" + App.getPanels().indexOf(App.getCurrentPanel()),
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
          "#sMConfigBar .sMConfigOption:has(#panelSelector)",
        )[0].className = "sMConfigOption selected";
      } else {
        document.querySelector("#panelSelect").style.display = "";
        document.querySelectorAll(
          "#sMConfigBar .sMConfigOption:has(#panelSelector)",
        )[0].className = "sMConfigOption";
      }

      for (const button of document.querySelectorAll(
        "#sMConfigBar .sMConfigOption",
      )) {
        if (
          !button.id ||
          button.id == "nightMode" ||
          button.id == "importSign" ||
          button.id == "exportSign"
        ) {
          continue;
        }

        if (button.id == sMConfigBar.dataset.currentMenu) {
          button.className = "sMConfigOption selected";
        } else {
          button.className = "sMConfigOption";
        }
      }
    };

    for (const button of document.querySelectorAll(
      "#sMConfigBar .sMConfigOption",
    )) {
      button.onclick = function () {
        if (
          !button.id ||
          button.id == "nightMode" ||
          button.id == "importSign" ||
          button.id == "exportSign"
        ) {
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
        document.querySelector("#sMMiniToolbar").style.display = "";
        this.dataset.tooltip = "Hide";
      } else {
        sMConfigBar.classList.add("invisible");
        document.querySelector("#sMMiniToolbar").style.display = "none";
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

    document.querySelector("#sdGroup_editGroup").onclick = function () {
      let groupNum = App.getGroupNumFromElem(App.getCurrentBlockElem());
      if (groupNum != null) {
        App.setSelectedBlockGroup(groupNum);
        formHandler.updateForm();
      }
    };

    document.querySelector("#toggleSettings").onclick = function () {
      document.querySelector("#signMakerSettings").showModal();
      document.querySelector("#signMakerSettings").style.display = "flex";
      document.querySelector("#modalHolder").style.display = "flex";
    };

    document.querySelector("#signMakerSettingsClose").onclick = function () {
      document.querySelector("#signMakerSettings").close();
      document.querySelector("#signMakerSettings").style.display = "";
      document.querySelector("#modalHolder").style.display = "none";
    };

    document
      .querySelector("#signMakerSettings")
      .addEventListener("cancel", (event) => {
        event.preventDefault();
        document.querySelector("#signMakerSettings").close();
        document.querySelector("#signMakerSettings").style.display = "";
        document.querySelector("#modalHolder").style.display = "none";
      });
  };

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

        if (
          boundingRect.bottom + tooltip.offsetHeight + 10 >
          window.innerHeight
        ) {
          tooltip.style.top =
            boundingRect.top - tooltip.offsetHeight - 10 + "px";
        } else {
          tooltip.style.top = boundingRect.bottom + 10 + "px";
        }

        tooltip.style.opacity = 1;

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
        if (window.innerWidth <= 768) {
          document.querySelector("#sMConfigBar").style.display = "";
          document.querySelector("#sMConfigBar").style.opacity = "1";
          return;
        }

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

  const setupPostOptions = () => {
    // Post position
    const postPositionSelectElmt = document.querySelector("#postPosition");
    for (const polePosition of Post.polePositions) {
      lib.appendOption(postPositionSelectElmt, polePosition, {
        selected: polePosition == post.polePosition,
      });
    }

    // Post color
    for (const color of Post.colors) {
      lib.appendOption(document.querySelector("#postColor"), color, {
        selected: color == post.color,
      });
    }

    // Post variant
    const postVariantSelectElmt = document.querySelector("#postVariant");
    for (const variant of Post.postVariants) {
      lib.appendOption(postVariantSelectElmt, variant, {
        selected: variant === post.variant,
      });
    }
  };

  const setupPanelOptions = () => {
    // Panel color
    // Panel corner
    const cornerTypeSelectElmt = document.querySelector("#panelCorner");
    for (const corner of Panel.prototype.cornerType) {
      lib.appendOption(cornerTypeSelectElmt, corner, {
        selected: corner == "Round",
      });
    }

    // Guide arrow options
    const guideArrowSelectElmt = document.querySelector("#guideArrow");
    for (const guideArrow of Sign.prototype.guideArrows) {
      const display = guideArrow.split(":")[0];
      lib.appendOption(guideArrowSelectElmt, display);
    }

    for (const fontFamily of TextElement.fontFamilies) {
      lib.appendOption(
        document.querySelector("#exitOnlyFontFamily"),
        fontFamily,
      );
    }

    for (const unit of SubPanels.prototype.dividerHeightUnits) {
      lib.appendOption(
        document.querySelector("#subpanelDividerHeightUnit"),
        unit,
      );
    }
  };

  const setupExitTabOptions = () => {
    for (const position of ExitTabRow.positions) {
      lib.appendOption(
        document.querySelector("#sMET_Position"),
        position.toLowerCase(),
        { text: position },
      );
    }

    for (const edgeType of ExitTabRow.panelEdgeTypes) {
      lib.appendOption(
        document.querySelector("#sMET_PanelEdgeType"),
        edgeType.toLowerCase(),
        { text: edgeType },
      );
    }

    for (const borderStyle of ExitTab.borderStyles) {
      lib.appendOption(
        document.querySelector("#sMET_borderStyle"),
        borderStyle.toLowerCase(),
        { text: borderStyle },
      );
    }

    for (const fontFamily of ExitTab.fontFamilies) {
      lib.appendOption(document.querySelector("#sMET_fontFamily"), fontFamily, {
        text: fontFamily,
      });
    }

    for (const fontFamily of ExitTab.numeralFontFamilies) {
      lib.appendOption(
        document.querySelector("#sMET_numeralFontFamily"),
        fontFamily,
        { text: fontFamily },
      );
    }

    for (const direction of ExitTab.contentDirections) {
      lib.appendOption(
        document.querySelector("#sMET_contentDirection"),
        direction.toLowerCase(),
        { text: direction },
      );
    }

    for (const alignment of ExitTab.alignments) {
      lib.appendOption(
        document.querySelector("#sMET_alignment"),
        alignment.toLowerCase(),
        { text: alignment },
      );
    }

    for (const widthPreset of ExitTab.widthPresets) {
      lib.appendOption(
        document.querySelector("#sMET_width"),
        widthPreset.toLowerCase(),
        { text: widthPreset },
      );
    }

    for (const addon of ExitTab.iconVariantAddons) {
      lib.appendOption(
        document.querySelector("#sMET_variantAddon"),
        addon.toLowerCase(),
        { text: addon },
      );
    }

    for (const alignment of ExitTab.shieldsDirections) {
      lib.appendOption(
        document.querySelector("#sMET_shieldsDirection"),
        alignment.toLowerCase(),
        {
          text: alignment,
        },
      );
    }

    for (const element of document.querySelectorAll(
      ".sMET_typeSelect > button",
    )) {
      element.addEventListener("click", () => {
        for (const e of document.querySelectorAll(
          ".sMET_typeSelect > button",
        )) {
          if (e === element) {
            e.classList.add("selected");
          } else {
            e.classList.remove("selected");
          }
        }
        formHandler.readForm();
      });
    }

    document
      .querySelector("#smET_saveAsPreset")
      .addEventListener("click", () => {
        let currentExitTab =
          App.getCurrentPanel().exitTabs[
            App.vars.currentlySelectedExitTabRowIndex
          ].exitTabs[App.vars.currentlySelectedExitTabIndex];
        if (!currentExitTab) {
          return;
        }

        let dataToSave = {};
        for (const key in currentExitTab) {
          if (["textContent", "subTextContext", "shields"].includes(key)) {
            continue;
          }

          dataToSave[key] = currentExitTab[key];
        }

        let presetName = prompt("Enter a name for the preset:");
        let presetsLibrary =
          StorageManager.getItem(StorageManager.STORAGE_KEYS.exitTabs) || {};

        if (!presetsLibrary[currentExitTab.variant]) {
          presetsLibrary[currentExitTab.variant] = {};
        }

        if (presetName.trim() === "" || presetName == undefined) {
          return;
        }

        if (
          exitTabPresets[currentExitTab.variant] &&
          exitTabPresets[currentExitTab.variant][presetName]
        ) {
          alert("Built-in preset already uses that name!");
          return;
        }

        if (
          (presetsLibrary[currentExitTab.variant][presetName] &&
            confirm("Preset already exists. Overwrite?")) ||
          !presetsLibrary[currentExitTab.variant][presetName]
        ) {
          presetsLibrary[currentExitTab.variant][presetName] = dataToSave;
        }

        StorageManager.setItem(
          StorageManager.STORAGE_KEYS.exitTabs,
          presetsLibrary,
        );

        formHandler.updateExitTabSubform();
      });

    document
      .querySelector("#smET_deletePreset")
      .addEventListener("click", () => {
        let currentExitTab =
          App.getCurrentPanel().exitTabs[
            App.vars.currentlySelectedExitTabRowIndex
          ].exitTabs[App.vars.currentlySelectedExitTabIndex];
        if (!currentExitTab) {
          return;
        }

        let selectedPreset = document.querySelector("#smET_presetSelect").value;
        let presetsLibrary =
          StorageManager.getItem(StorageManager.STORAGE_KEYS.exitTabs) || {};

        if (
          !presetsLibrary[currentExitTab.variant] ||
          (presetsLibrary[currentExitTab.variant] &&
            !presetsLibrary[currentExitTab.variant][selectedPreset])
        ) {
          return;
        }

        if (confirm("Are you sure you want to delete this preset?")) {
          delete presetsLibrary[currentExitTab.variant][selectedPreset];
        }

        StorageManager.setItem(
          StorageManager.STORAGE_KEYS.exitTabs,
          presetsLibrary,
        );

        formHandler.updateExitTabSubform();
      });

    document.querySelector("#smET_loadPreset").addEventListener("click", () => {
      let currentExitTab =
        App.getCurrentPanel().exitTabs[
          App.vars.currentlySelectedExitTabRowIndex
        ].exitTabs[App.vars.currentlySelectedExitTabIndex];
      if (!currentExitTab) {
        return;
      }

      let selectedPreset = document.querySelector("#smET_presetSelect").value;
      let presetsLibrary =
        StorageManager.getItem(StorageManager.STORAGE_KEYS.exitTabs) || {};

      let isInPresetsLibrary =
        presetsLibrary[currentExitTab.variant] &&
        presetsLibrary[currentExitTab.variant][selectedPreset];
      let isInPrebuiltLibrary =
        exitTabPresets[currentExitTab.variant] &&
        exitTabPresets[currentExitTab.variant][selectedPreset];

      if (
        !isInPresetsLibrary &&
        !isInPrebuiltLibrary &&
        selectedPreset != "None"
      ) {
        return;
      }

      if (selectedPreset == "None") {
        for (const key in ExitTab.prototype.defaultExitTabConfig) {
          currentExitTab[key] = ExitTab.prototype.defaultExitTabConfig[key];
        }
      } else {
        for (const key in isInPresetsLibrary
          ? presetsLibrary[currentExitTab.variant][selectedPreset]
          : exitTabPresets[currentExitTab.variant][selectedPreset]) {
          currentExitTab[key] = isInPresetsLibrary
            ? presetsLibrary[currentExitTab.variant][selectedPreset][key]
            : exitTabPresets[currentExitTab.variant][selectedPreset][key];
        }
      }

      formHandler.updateExitTabSubform();
      App.redraw();
    });
  };

  const setupControlSignElements = () => {
    // subpanel alignment
    for (const alignment of SubPanels.verticalAlignments) {
      lib.appendOption(document.querySelector("#subpanelAlign"), alignment);
    }

    // Element list
    const sMSPElementSelect = document.querySelector("#sMSPElementSelect");
    for (const element in Control.prototype.blockElements) {
      lib.appendOption(sMSPElementSelect, element, {
        selected: element == "Standard Control Text",
        text: Control.prototype.blockElements[element],
      });
    }

    let textElem_fontFamilySelects = [
      document.querySelector("#sdCtrlText_fontFamily"),
      document.querySelector("#sdAdvisory_fontFamily"),
      document.querySelector("#sdActionMessage_fontFamily"),
      document.querySelector("#sMET_variantFontFamily"),
      document.querySelector("#smET_fullLeftFontFamily"),
      document.querySelector("#smET_partialLeftFontFamily"),
    ];
    for (const elem of textElem_fontFamilySelects) {
      for (const fontFamily of TextElement.fontFamilies) {
        lib.appendOption(elem, fontFamily);
      }
    }

    for (const fontFamily of TextElement.fontFamilies) {
      lib.appendOption(
        document.querySelector("#sdTollLogo_fontFamily"),
        fontFamily,
      );
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
      document.querySelector("#sdCtrlText_textAlign"),
      document.querySelector("#sdActionMessage_textAlign"),
      document.querySelector("#sdAdvisory_textAlign"),
    ];
    for (const elem of textElem_alignmentSelects) {
      for (const alignment of TextElement.alignments) {
        lib.appendOption(elem, alignment);
      }
    }

    for (const direction in TollLogoElement.directions) {
      lib.appendOption(
        document.querySelector("#sdTollLogo_onlyBlockDirection"),
        direction,
      );
    }

    // Shields
    const shieldGroupSelect = document.querySelector(
      "#sdShieldGroup_direction",
    );
    for (const direction of ShieldGroupElement.directions) {
      lib.appendOption(shieldGroupSelect, direction);
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
    for (const fontFamily of ElectronicSignElement.fontFamilies) {
      lib.appendOption(eSignFontSelect, fontFamily);
    }

    // Electronic sign text colors
    const eSignColorSelect = document.querySelector(
      "#sdElectronicSign_textColor",
    );
    for (const textColor of ElectronicSignElement.prototype.textColors) {
      lib.appendOption(eSignColorSelect, textColor);
    }

    for (const format of ElectronicSignElement.prototype.textFormats) {
      lib.appendOption(
        document.querySelector("#sdElectronicSign_textFormat"),
        format,
      );
    }

    // Divider measurement
    const divider_widthMeasurement = document.querySelector(
      "#sdBlocker_dividerMeasurement",
    );
    for (const measurement of DividerElement.dividerMeasurements) {
      lib.appendOption(divider_widthMeasurement, measurement);
    }

    for (const { value, label } of DividerElement.prototype.dividerColors) {
      lib.appendOption(
        document.querySelector("#sdBlocker_dividerColor"),
        value,
        { text: label },
      );
    }

    for (const color of BeaconElement.colors) {
      lib.appendOption(document.querySelector("#sdBeacon_color"), color);
    }

    // Shield types
    const shield_shieldBase = document.querySelector("#sdShield_shieldBase");
    for (const shieldType in Shield.prototype.types) {
      lib.appendOption(shield_shieldBase, shieldType);
    }

    // Arrow rotation slider
    const arrowRotationSlider = document.querySelector("#sdArrow_rotation");
    const arrowRotationVal = document.querySelector("#sdArrow_rotationVal");
    arrowRotationSlider.addEventListener("input", () => {
      arrowRotationVal.value = arrowRotationSlider.value;
    });

    const arrowRotationButtons = document.querySelectorAll(
      ".sdArrow_rotationPreset",
    );
    for (const button of arrowRotationButtons) {
      button.addEventListener("click", () => {
        const degrees = button.dataset.degrees;
        arrowRotationSlider.value = degrees.toString();
        arrowRotationVal.value = degrees.toString();
        formHandler.readForm();
      });
    }

    // Small value inputs
    document.querySelectorAll(".smallVal").forEach((valEl) => {
      const onChange = () => {
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

    for (const direction of GroupElement.prototype.blockDirection) {
      lib.appendOption(document.querySelector("#sdGroup_direction"), direction);
    }

    for (const format of GroupElement.boxFormats) {
      lib.appendOption(document.querySelector("#sdGroup_boxFormat"), format);
    }
  };

  const setupGuideArrows = () => {
    for (const element of document.querySelectorAll(
      ".sMA_typeSelect > button",
    )) {
      element.addEventListener("click", () => {
        for (const e of document.querySelectorAll(".sMA_typeSelect > button")) {
          if (e === element) {
            e.classList.add("selected");
          } else {
            e.classList.remove("selected");
          }
        }
        formHandler.readForm();
      });
    }

    for (const font of TextElement.fontFamilies) {
      lib.appendOption(
        document
          .querySelector("#sMAPL_templateAPLItem")
          .content.querySelector(".smAPL_font"),
        font,
      );
    }

    for (const color of APLArrow.prototype.backgroundColors) {
      lib.appendOption(
        document
          .querySelector("#sMAPL_templateAPLItem")
          .content.querySelector(".smAPL_bgColor"),
        color,
      );
    }

    for (const justify of APLArrow.prototype.justifyAPLs) {
      lib.appendOption(
        document
          .querySelector("#smAPL_templateAPLContainer")
          .content.querySelector(".smAPLCat_justifyAPLs"),
        justify.toLowerCase(),
        { text: justify },
      );
    }

    for (const justify of Sign.prototype.standardArrowJustify) {
      lib.appendOption(
        document.querySelector("#standardArrows_justify"),
        justify,
        { selected: justify == "Space Between" },
      );
    }

    for (const position of Sign.prototype.exitOnlyJustify) {
      lib.appendOption(
        document.querySelector("#exitOnlyTextPosition"),
        position,
        { selected: position == "Center" },
      );
    }

    for (const element of document.querySelectorAll(
      ".sdGuideArrows_rotationPreset",
    )) {
      element.addEventListener("click", () => {
        document.querySelector("#guideStandardArrow_rotation").value =
          parseFloat(element.dataset.degrees);
        formHandler.readForm();
      });
    }

    for (const element of document.querySelectorAll(
      ".sdExitOnlyGuide_rotationPreset",
    )) {
      element.addEventListener("click", () => {
        document.querySelector("#exitOnlyArrowRotation").value = parseInt(
          element.dataset.degrees,
        );
        formHandler.readForm();
      });
    }

    for (const borderMode of Sign.prototype.exitOnlyBorderTypes) {
      lib.appendOption(
        document.querySelector("#exitOnlyBorderMode"),
        borderMode,
        { selected: borderMode == "Partial Black Border" },
      );
    }
  };

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

  const positionDropdown = (dropdownHolder, trigger) => {
    const bounds = trigger.getBoundingClientRect();
    const gap = 5;
    const dropdownHeight = dropdownHolder.getBoundingClientRect().height;
    const top =
      bounds.bottom + gap + dropdownHeight > window.innerHeight
        ? bounds.top - dropdownHeight - gap
        : bounds.bottom + gap;

    dropdownHolder.style.left = bounds.left + "px";
    dropdownHolder.style.top = top + "px";
  };

  const setupDropdownElements = () => {
    document.addEventListener("click", (event) => {
      const dropdownButton = event.target.closest(".smDropdownOption");

      if (dropdownButton) {
        const dropdownElement = dropdownButton.closest(
          ".smDropdownInputElement",
        );
        dropdownElement.dataset.selectedOption = dropdownButton.dataset.value;
        formHandler.readForm();
        return;
      }

      const selectedButton = event.target.closest(".smDropdownSelectedButton");

      if (selectedButton) {
        const dropdownElement = selectedButton.closest(
          ".smDropdownInputElement",
        );
        const selectedArrow = selectedButton.querySelector(".smDropdownArrow");
        const dropdownHolder =
          dropdownElement.querySelector(".smDropdownHolder");
        const dropdownSearch =
          dropdownHolder.querySelector(".smDropdownSearch");

        if (!dropdownHolder.classList.toggle("hidden")) {
          dropdownSearch.value = "";
          positionDropdown(dropdownHolder, selectedButton);
          dropdownSearch.focus();
          selectedArrow.style.rotate = "180deg";
        }
      }
    });

    document.addEventListener("input", (event) => {
      if (!event.target.matches(".smDropdownSearch")) {
        return;
      }

      const dropdownHolder = event.target.closest(".smDropdownHolder");
      const dropdownList = dropdownHolder.querySelector(".smDropdownList");

      const query = event.target.value.toLowerCase().trim();
      for (const option of dropdownList.querySelectorAll(".smDropdownOption")) {
        option.style.display = option.dataset.value
          .replace(/_/g, " ")
          .toLowerCase()
          .trim()
          .includes(query)
          ? "flex"
          : "none";
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key == "Enter" && event.target.matches(".smDropdownSearch")) {
        const dropdownList = event.target
          .closest(".smDropdownHolder")
          .querySelector(".smDropdownList");
        const firstOption = Array.from(
          dropdownList.querySelectorAll(".smDropdownOption"),
        ).find((option) => option.style.display !== "none");
        event.preventDefault();
        firstOption?.click();
        return;
      }

      if (event.key != "Escape") {
        return;
      }

      document
        .querySelectorAll(".smDropdownHolder:not(.hidden)")
        .forEach((dropdownHolder) => {
          dropdownHolder.classList.add("hidden");
          dropdownHolder
            .closest(".smDropdownInputElement")
            .querySelector(".smDropdownArrow").style.rotate = "";
        });
    });

    document.addEventListener("click", (event) => {
      if (
        !event.target.closest(".smDropdownHolder") &&
        !event.target.closest(".smDropdownSelectedButton")
      ) {
        document
          .querySelectorAll(".smDropdownHolder:not(.hidden)")
          .forEach((dropdownHolder) => {
            dropdownHolder.classList.add("hidden");
            dropdownHolder
              .closest(".smDropdownInputElement")
              .querySelector(".smDropdownArrow").style.rotate = "";
          });
      }
    });

    const setupDropdownElement = (
      dropdownElement,
      basePrototype,
      baseValue,
      imageFunction,
      textFunction,
      changeFunction = null,
    ) => {
      const selectedButton = dropdownElement.querySelector(
        ".smDropdownSelectedButton",
      );
      const selectedLabel = selectedButton.querySelector(
        ".smDropdownSelectedLabel",
      );
      const selectedImage = selectedButton.querySelector(
        ".smDropdownSelectedImage",
      );

      const dropdownHolder = dropdownElement.querySelector(".smDropdownHolder");
      const dropdownList = dropdownHolder.querySelector(".smDropdownList");

      imageFunction(selectedImage, baseValue);
      textFunction(selectedLabel, baseValue);

      // loading
      for (const [key, _] of Object.entries(basePrototype)) {
        const dropdownButton = document.createElement("button");
        const dropdownImage = imageFunction(document.createElement("img"), key);
        const dropdownLabel = textFunction(document.createElement("span"), key);

        dropdownButton.className = "smDropdownOption";
        dropdownButton.dataset.value = key;
        dropdownImage.classList.add("smDropdownImage");
        dropdownLabel.classList.add("smDropdownLabel");

        dropdownButton.appendChild(dropdownImage);
        dropdownButton.appendChild(dropdownLabel);

        dropdownList.appendChild(dropdownButton);
      }

      // searching
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (
            mutation.type !== "attributes" ||
            mutation.attributeName != "data-selected-option"
          ) {
            continue;
          }

          imageFunction(selectedImage, dropdownElement.dataset.selectedOption);
          textFunction(selectedLabel, dropdownElement.dataset.selectedOption);

          for (const element of dropdownList.querySelectorAll(
            ".smDropdownOption",
          )) {
            if (
              element.dataset.value === dropdownElement.dataset.selectedOption
            ) {
              element.classList.add("selected");
            } else {
              element.classList.remove("selected");
            }
          }
        }
      });

      observer.observe(dropdownElement, {
        attributes: true,
        attributeFilter: ["data-selected-option"],
      });

      dropdownElement.dataset.selectedOption = baseValue;

      if (!changeFunction) {
        return;
      }

      let debounce = false;
      const changeObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (
            mutation.type !== "attributes" ||
            mutation.attributeName != "data-selected-option"
          ) {
            continue;
          }

          if (debounce) {
            return;
          }

          debounce = true;
          changeFunction(dropdownElement.dataset.selectedOption);
          setTimeout(() => {
            debounce = false;
          }, 10);
        }
      });

      changeObserver.observe(dropdownElement, {
        attributes: true,
        attributeFilter: ["data-selected-option"],
      });
    };

    setupDropdownElement(
      document
        .querySelector("#sMAPL_templateAPLItem")
        .content.querySelector(".smAPLCat_aplSelectHolder"),
      APLArrow.arrowTypes,
      "Up Arrow",
      (image, value) => {
        if (APLArrow.arrowTypes[value].flipped) {
          image.classList.add("flipped");
        }

        image.classList.add("smAPL_arrowImage");

        image.loading = "lazy";
        image.src = `assets/arrow/${APLArrow.arrowTypes[value].asset}`;

        return image;
      },
      (text, value) => {
        text.textContent = value;
        return text;
      },
    );

    setupDropdownElement(
      document.querySelector("#sdArrow_arrow"),
      StandardArrow.prototype.arrows,
      "TYPE_A",
      (image, value) => {
        image.loading = "lazy";
        image.src = StandardArrow.prototype.arrows[value].src;
        return image;
      },
      (text, value) => {
        text.textContent = StandardArrow.prototype.arrows[value].label;
        return text;
      },
    );

    setupDropdownElement(
      document.querySelector("#guideStandardArrow"),
      StandardArrow.prototype.arrows,
      "TYPE_A",
      (image, value) => {
        image.loading = "lazy";
        image.src = StandardArrow.prototype.arrows[value].src;
        return image;
      },
      (text, value) => {
        text.textContent = StandardArrow.prototype.arrows[value].label;
        return text;
      },
      (option) => {
        const currentPanel = App.getCurrentPanel();
        if (!currentPanel) {
          return;
        }

        switch (option) {
          case "DOWN":
            currentPanel.sign.arrows.standard.arrowList[
              App.vars.currentlySelectedStandardArrow
            ].size = 1.75;
            currentPanel.sign.arrows.standard.arrowList[
              App.vars.currentlySelectedStandardArrow
            ].rotation = 0;

            formHandler.updateForm();
            App.redraw();
            break;
          default:
            break;
        }
      },
    );

    setupDropdownElement(
      document.querySelector("#exitOnlyArrowType"),
      StandardArrow.prototype.arrows,
      "DOWN",
      (image, value) => {
        image.loading = "lazy";
        image.src = StandardArrow.prototype.arrows[value].src;
        return image;
      },
      (text, value) => {
        text.textContent = StandardArrow.prototype.arrows[value].label;
        return text;
      },
      (option) => {
        const currentPanel = App.getCurrentPanel();
        if (!currentPanel) {
          return;
        }

        switch (option) {
          case "DOWN":
            currentPanel.sign.arrows.standard.exitOnlyConfigs.arrow.size = 1.75;
            currentPanel.sign.arrows.standard.exitOnlyConfigs.arrow.rotation = 0;

            formHandler.updateForm();
            App.redraw();
            break;
          default:
            break;
        }
      },
    );

    setupDropdownElement(
      document.querySelector(".sdIconDropdown"),
      IconElement.icons,
      "AIRPORT",
      (image, value) => {
        image.loading = "lazy";
        image.src = value.startsWith("custom:")
          ? image.closest(".smDropdownInputElement").dataset.customImageData
          : `./assets/icons/${IconElement.icons[value]}`;
        return image;
      },
      (text, value) => {
        text.textContent = value.startsWith("custom:")
          ? value.slice("custom:".length)
          : value.replace(/_/g, " ");
        return text;
      },
    );

    setupDropdownElement(
      document.querySelector("#sMET_variantRegularIcon"),
      IconElement.icons,
      "AIRPORT",
      (image, value) => {
        image.loading = "lazy";
        image.src = value.startsWith("custom:")
          ? image.closest(".smDropdownInputElement").dataset.customImageData
          : `./assets/icons/${IconElement.icons[value]}`;
        return image;
      },
      (text, value) => {
        text.textContent = value.startsWith("custom:")
          ? value.slice("custom:".length)
          : value.replace(/_/g, " ");
        return text;
      },
    );

    setupDropdownElement(
      document.querySelector("#sMET_variantTollIcon"),
      TollLogoElement.logos,
      "EZPass",
      (image, value) => {
        image.loading = "lazy";
        image.src = `${TollLogoElement.logos[value].src}`;
        image.classList.add("smWhiteDropdownImage");
        return image;
      },
      (text, value) => {
        text.textContent = TollLogoElement.logos[value].label;
        return text;
      },
    );

    setupDropdownElement(
      document.querySelector("#sdTollLogoHolder"),
      TollLogoElement.logos,
      "EZPass",
      (image, value) => {
        image.loading = "lazy";
        image.src = `${TollLogoElement.logos[value].src}`;
        image.classList.add("smWhiteDropdownImage");
        return image;
      },
      (text, value) => {
        text.textContent = TollLogoElement.logos[value].label;
        return text;
      },
    );

    document
      .querySelector("#sdIcon_customBtn")
      .addEventListener("click", async () => {
        const image = await formHandler.promptCustomIcon();
        if (!image) return;

        const iconDropdown = document.querySelector(".sdIconDropdown");
        iconDropdown.dataset.customImageData = image.data;
        iconDropdown.dataset.selectedOption = `custom:${image.fileName}`;
        formHandler.readForm();
      });
    document
      .querySelector("#smET_iconCustomBtn")
      .addEventListener("click", async () => {
        const image = await formHandler.promptCustomIcon();
        if (!image) return;

        const iconDropdown = document.querySelector("#sMET_variantRegularIcon");
        iconDropdown.dataset.customImageData = image.data;
        iconDropdown.dataset.selectedOption = `custom:${image.fileName}`;
        formHandler.readForm();
      });
  };

  const setupShields = () => {
    const shieldFontSelect = [
      document.querySelector("#spShield_routeFontFamily"),
      document.querySelector("#spShield_designationFontFamily"),
    ];
    for (const select of shieldFontSelect) {
      lib.appendOption(select, "", { text: "Unset" });
      for (const fontFamily of TextElement.fontFamilies) {
        lib.appendOption(select, fontFamily);
      }
    }

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

      shieldCategoryImg.loading = "lazy";
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

    // Shield Library Search
    document
      .querySelector("#shieldLibrarySearch")
      .addEventListener("input", () => {
        const query = document
          .querySelector("#shieldLibrarySearch")
          .value.toLowerCase()
          .trim();
        const shieldLibrary = document.querySelector(
          "#shieldLibraryListHolder",
        );
        const shieldLibraryItems = shieldLibrary.querySelectorAll(
          ".shieldLibraryButton",
        );

        shieldLibraryItems.forEach((item) => {
          const shieldName = item.name.toLowerCase().trim();
          if (shieldName.includes(query)) {
            item.style.display = "";
          } else {
            item.style.display = "none";
          }
        });
      });

    const bannerPosiitonsElem = document
      .querySelector("#smSP_templateBannerElement")
      .content.querySelector(".smSPBanner_position");
    for (const banner of Shield.prototype.bannerPositions) {
      lib.appendOption(bannerPosiitonsElem, banner.toLowerCase(), {
        text: banner,
      });
      lib.appendOption(
        document.querySelector("#smSPShieldBannerAlignment"),
        banner.toLowerCase(),
        {
          text: banner,
        },
      );
    }

    const fontFamilyElem = document
      .querySelector("#smSP_templateBannerElement")
      .content.querySelector(".smSPBanner_fontFamily");
    for (const font of TextElement.fontFamilies) {
      lib.appendOption(fontFamilyElem, font);
    }
  };

  const setupSettings = () => {
    const mutcdVariantButtons = document.querySelectorAll(
      "#smSettings_MUTCDGallery .mutcdImage",
    );
    const selectedVariantText = document.querySelector(
      "#smSettings_selectedMUTCDVariant",
    );

    mutcdVariantButtons.forEach((button) => {
      button.addEventListener("click", () => {
        mutcdVariantButtons.forEach((btn) => btn.classList.remove("selected"));
        button.classList.add("selected");
        const selectedVariant = button.dataset.variant;
        selectedVariantText.textContent = `Selected: ${MUTCDVariants[selectedVariant].VariantInfo.FullName}`;

        let post = App.getPost();
        if (post) {
          post.mutcdVariant = selectedVariant;
          formHandler.updateForm();
          App.redraw();
        }
      });
    });

    document
      .querySelector("#smSettings_replaceVariant")
      .addEventListener("click", () => {
        if (
          !confirm(
            "Are you sure you want to replace to this variant? Some elements may need to be re-edited afterwards.",
          )
        ) {
          return;
        }

        let post = App.getPost();
        const replaceRecursive = (obj) => {
          if (Array.isArray(obj)) {
            for (const item of obj) {
              replaceRecursive(item);
            }
            return;
          }

          if (typeof obj !== "object" || obj === null) {
            return;
          }

          let objectType = obj.constructor.name;
          const validClassNames = MUTCDVariants.getClassNames(objectType);
          let tagsToReplace = [];

          for (const className of validClassNames) {
            const classTags =
              MUTCDVariants[post.mutcdVariant][className]?.tagToReplace || [];
            tagsToReplace = [...tagsToReplace, ...classTags];
          }

          const validKeys = Object.keys(obj).filter(
            (key) => key !== "constructor" && key !== "prototype",
          );

          for (const key of validKeys) {
            if (tagsToReplace.includes(key)) {
              const currentValue = obj[key];
              let newValue;

              for (const className of validClassNames) {
                let thisValue =
                  MUTCDVariants[post.mutcdVariant][className]?.[key];
                if (thisValue !== undefined) {
                  newValue = thisValue;
                  break;
                }
              }

              if (newValue !== undefined && newValue !== currentValue) {
                obj[key] = newValue;
              }
            } else if (
              typeof obj[key] === "object" &&
              !lib.isClass(obj[key].constructor) &&
              !Array.isArray(obj[key])
            ) {
              const recursiveHelper = (o, mutcdRecursive) => {
                const valKeys = Object.keys(o).filter(
                  (k) => k !== "constructor" && k !== "prototype",
                );

                for (const k of valKeys) {
                  if (tagsToReplace.includes(k)) {
                    const currentValue = o[k];
                    let newValue;

                    for (const className of validClassNames) {
                      let thisValue =
                        MUTCDVariants[post.mutcdVariant][className]?.[key];
                      for (const nestedKey of mutcdRecursive) {
                        thisValue = thisValue?.[nestedKey];
                      }
                      thisValue = thisValue?.[k];

                      if (thisValue !== undefined) {
                        newValue = thisValue;
                        break;
                      }
                    }

                    console.log(k, currentValue, newValue, mutcdRecursive);

                    if (newValue !== undefined && newValue !== currentValue) {
                      o[k] = newValue;
                    }
                  } else if (
                    typeof o[k] === "object" &&
                    !lib.isClass(o[k].constructor) &&
                    !Array.isArray(o[k])
                  ) {
                    recursiveHelper(o[k], [...mutcdRecursive, k]);
                  }
                }
              };
              recursiveHelper(obj[key], []);
            } else {
              replaceRecursive(obj[key]);
            }
          }
        };

        replaceRecursive(post);
        formHandler.updateForm();
        App.redraw();
      });
  };

  let oldColorName = null;
  const promptColorEdit = (color = null) => {
    const colorEditModal = document.querySelector(".smColorDropdownEdit");
    colorEditModal.style.display = "flex";
    if (color) {
      oldColorName = color;
      document.querySelector("#smColorName").value = color;
      document.querySelector("#smColorTheRealColor").value =
        ColorLibrary.colorLibrary[color];

      const event = new Event("change", { bubbles: true });
      document.querySelector("#smColorName").dispatchEvent(event);
      document.querySelector("#smColorTheRealColor").dispatchEvent(event);
      document.querySelector("#smColorEditingLabel").textContent =
        "Editing: " + color;
      document.querySelector("#smColorEditingLabel").style.display = "";
    } else {
      document.querySelector("#smColorEditingLabel").style.display = "none";
    }

    document.querySelector("#smColorDropdownUpdate").textContent = color
      ? "Update"
      : "Add";
    document.querySelector("#smColorDropdownRemove").style.display = color
      ? ""
      : "none";
  };

  const setupColorHandler = () => {
    const colorDropdown = document.querySelector("#smColorDropdownHolder");
    const colorSearch = colorDropdown.querySelector("#smColorDropdownSearch");
    let activeColorButton = null;

    // listener event
    document.addEventListener("click", (event) => {
      const button = event.target.closest(".smColorDropdownButton");
      if (button) {
        activeColorButton = button;
        colorDropdown.classList.remove("hidden");
        positionDropdown(colorDropdown, button);
        colorSearch.value = "";
        colorSearch.focus();
        colorSearch.dispatchEvent(new Event("input"));

        if (activeColorButton.dataset.emptyValue) {
          document.querySelector(".smColorDropdownEmptyButton").style.display =
            "";
          document.querySelector(".smColorDropdownEmptyButton").textContent =
            button.dataset.emptyValue;
        } else {
          document.querySelector(".smColorDropdownEmptyButton").style.display =
            "none";
        }
      }
    });

    colorDropdown.addEventListener("click", (event) => {
      const colorItem = event.target.closest(".smColorDropdownItem");
      if (
        !colorItem ||
        event.target.closest(".smColorDropdownEditBtn") ||
        !activeColorButton
      ) {
        return;
      }

      const selectedColor =
        colorItem.dataset.color === ""
          ? activeColorButton.dataset.emptyValue
          : colorItem.dataset.color;

      activeColorButton.dataset.color = selectedColor;

      if (activeColorButton.closest("#shieldEditorModal")) {
        ShieldEditor.readForm();
      } else {
        formHandler.readForm();
      }
    });

    // close events
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        colorDropdown.classList.add("hidden");
      }
    });

    document.addEventListener("click", (event) => {
      if (
        !event.target.closest("#smColorDropdownHolder") &&
        !event.target.closest(".smColorDropdownButton")
      ) {
        colorDropdown.classList.add("hidden");
      }
    });

    // search
    colorSearch.addEventListener("input", () => {
      const query = colorSearch.value.toLowerCase().trim();
      for (const colorOption of colorDropdown.querySelectorAll(
        ".smColorDropdownItem",
      )) {
        const colorName = colorOption.dataset.color.toLowerCase().trim();
        if (colorName.includes(query)) {
          colorOption.style.display = "";
        } else {
          colorOption.style.display = "none";
        }
      }
    });

    const currentColorSetttings = {
      name: "",
      color: "#000000",
    };

    document
      .querySelector("#smColorName")
      .addEventListener("change", (event) => {
        currentColorSetttings.name = event.target.value;

        if (
          ColorLibrary.isDefaultColor(currentColorSetttings.name) ||
          (ColorLibrary.colorLibrary[currentColorSetttings.name] &&
            currentColorSetttings.name !== oldColorName)
        ) {
          document.querySelector("#smColorDropdownUpdate").style.display =
            "none";
        } else {
          document.querySelector("#smColorDropdownUpdate").style.display = "";
        }
      });

    document
      .querySelector("#smColorTheRealColor")
      .addEventListener("change", (event) => {
        currentColorSetttings.color = event.target.value;
      });

    document
      .querySelector("#smColorDropdownUpdate")
      .addEventListener("click", () => {
        if (oldColorName) {
          ColorLibrary.updateColor(
            oldColorName,
            currentColorSetttings.name,
            currentColorSetttings.color,
          );
          oldColorName = null;
        } else {
          ColorLibrary.addColor(
            currentColorSetttings.name,
            currentColorSetttings.color,
          );
        }
        document.querySelector(".smColorDropdownEdit").style.display = "none";
        formHandler.updateForm();
        SavesNTemplates.updateAutoSave(post);
        HistoryManager.addToUndoStack(post);
      });

    document
      .querySelector("#smColorDropdownRemove")
      .addEventListener("click", () => {
        ColorLibrary.removeColor(oldColorName);
        oldColorName = null;
        document.querySelector(".smColorDropdownEdit").style.display = "none";
        formHandler.updateForm();
        SavesNTemplates.updateAutoSave(post);
        HistoryManager.addToUndoStack(post);
      });

    const colorAddButton = colorDropdown.querySelector("#smColorAddColor");
    colorAddButton.addEventListener("click", () => {
      promptColorEdit();
    });

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type !== "attributes" ||
          mutation.attributeName != "data-color"
        ) {
          continue;
        }

        if (!mutation.target.classList.contains("smColorDropdownButton")) {
          continue;
        }

        let target = mutation.target;

        if (!target.isConnected) {
          continue;
        }

        if (
          target.dataset.color === "" ||
          target.dataset.color == target.dataset.emptyValue
        ) {
          target.style.backgroundColor = "";
          target.style.color = "";
          target.textContent = target.dataset.emptyValue || "";
        } else {
          target.style.backgroundColor =
            ColorLibrary.colorLibrary[target.dataset.color] ||
            target.dataset.color;
          target.style.color = ColorLibrary.checkForContrast(
            target.dataset.color,
          )
            ? "black"
            : "white";
          target.textContent = target.dataset.color;
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-color"],
    });
  };

  return {
    initUI,
    promptColorEdit,
  };
})();
