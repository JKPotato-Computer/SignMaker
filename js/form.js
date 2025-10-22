/* 
	// form.js - JK_Potato/Computer
	Responsible for changes within the website form (editor)
*/

const formHandler = (function () {
  let exposed;
  let post;

  const initialize = (appExposed) => {
    exposed = appExposed;
    post = exposed.getPost();
    initUI();
  };

  const initUI = () => {
    const sMConfigBar = document.querySelector("#sMConfigBar");

    function reDisplay() {
      for (const holder of document.querySelectorAll(".sMModal")) {
        if (holder.classList.contains(sMConfigBar.dataset.currentMenu)) {
          holder.style.display = "block";
        } else {
          holder.style.display = "";
        }
      }

      if (sMConfigBar.dataset.currentMenu == "panelSelector") {
        document.querySelector("#panelSelect").style.display = "flex";
        document.querySelectorAll(
          ".sMConfigOption:has(#panelSelector)"
        )[0].className = "sMConfigOption selected";
      } else {
        document.querySelector("#panelSelect").style.display = "";
        document.querySelectorAll(
          ".sMConfigOption:has(#panelSelector)"
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
    }

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
      button.onclick = function () {
        if (!button.dataset.tab) {
          return;
        }

        const modal = document.querySelectorAll(
          '.sMModal:has(.sMModalTab[data-tab="' + button.dataset.tab + '"]'
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

    document.getElementById("export").onclick = function () {
      /*
      document.querySelector("#modalHolder").style.display = "flex";
      document.querySelector("#downloadContent").showModal();
      document.querySelector("#downloadContent").style.display = "flex";
      app.updatePreview();
      */
    };

    document.getElementById("hideConfig").onclick = function () {
      if (sMConfigBar.classList.contains("invisible")) {
        sMConfigBar.classList.remove("invisible");
        this.dataset.tooltip = "Hide";
      } else {
        sMConfigBar.classList.add("invisible");
        this.dataset.tooltip = "Show";
      }
    };

    document.getElementById("cancelDownload").onclick = function () {
      document.querySelector("#modalHolder").style.display = "none";
      document.querySelector("#downloadContent").style.display = "none";
      document.querySelector("#downloadContent").close();
    };

    document.querySelector("#closeWelcome").onclick = function () {
      document.querySelector("#modalHolder").style.display = "none";
      localStorage.setItem("closedWelcome", true);
      document.querySelector("#welcomeToSignMaker").close();
    };

    const toolTip = document.createElement("span");
    toolTip.className = "toolTip";
    toolTip.style.opacity = 0;
    document.body.appendChild(toolTip);
    for (const element of document.querySelectorAll("[data-toolTip]")) {
      element.addEventListener("mouseover", () => {
        const boundingRect = element.getBoundingClientRect();
        toolTip.textContent = element.dataset.tooltip;
        toolTip.style.left =
          boundingRect.left +
          (boundingRect.right - boundingRect.left) / 2 +
          "px";
        toolTip.style.top = boundingRect.top - toolTip.offsetHeight - 10 + "px";
        toolTip.style.opacity = 1;
        toolTip.style.transform = "translateX(-50%)";

        if (sMConfigBar.contains(element)) {
          toolTip.style.fontFamily = "Overpass";
        } else {
          toolTip.style.fontFamily = "Inter";
        }
      });

      element.addEventListener("mouseout", () => {
        toolTip.style.opacity = 0;
        toolTip.style.left = "-100px";
        toolTip.style.top = 0;
        toolTip.textContent = "";
        toolTip.style.transform = "";
      });
    }

    document.querySelector("#nightMode").addEventListener("click", () => {
      document.querySelector("html").dataset.theme =
        document.querySelector("html").dataset.theme == "dark"
          ? "light"
          : "dark";
    });

    const horizontalScrollOnWheel = document.querySelectorAll(
      ".horizontal-scroll-on-wheel"
    );
    horizontalScrollOnWheel.forEach((scrollableElement) => {
      scrollableElement.addEventListener("wheel", (event) => {
        if (scrollCooldown) {
          return;
        }

        event.preventDefault();
        // Smoothly increase scrollableElement.scrollLeft by event.deltaY;
        scrollableElement.scrollBy({
          left: event.deltaY,
          behavior: "smooth",
        });
      });
    });

    if (!localStorage.getItem("closedWelcome")) {
      document.querySelector("#modalHolder").style.display = "flex";
      document.querySelector("#welcomeToSignMaker").showModal();
    }
  };

  // Show/hide dependent small inputs for a given block (e.g. sdCtrlText, sdAdvisory, sdActionMessage, sdIcon)
  const setDependentVisibility = (block) => {
    const el = (id) => document.getElementById(id);

    const toggleTargets = (checkboxId, targetIds) => {
      const chk = el(checkboxId);
      if (!chk) return;
      for (const tid of targetIds) {
        const target = el(tid);
        if (!target) continue;
        if (chk.checked) target.classList.remove("hidden");
        else target.classList.add("hidden");
      }
    };

    // numeral formatting -> _numeralFormattingSize
    toggleTargets(`${block}_useNumeralFormatting`, [
      `${block}_numeralFormattingSize`,
    ]);
    // banner formatting -> _bannerFormattingSize and _bannerFirstLetterSize
    toggleTargets(`${block}_useBannerFormatting`, [
      `${block}_bannerFormattingSize`,
      `${block}_bannerFirstLetterSize`,
    ]);
    // small capitals -> _firstLetterSize
    toggleTargets(`${block}_smallCapitals`, [`${block}_firstLetterSize`]);
    // icon border -> border color / radius (sdIcon_border)
    toggleTargets(`${block}_border`, [
      `${block}_borderColor`,
      `${block}_borderRadius`,
    ]);
  };

  // Handle Form
  // Read the form and update the page by redrawing it.
  const readForm = function () {
    const form = document.forms[0];
    const currentPanel = exposed.getCurrentPanel();
    const subPanel =
      exposed.vars.currentlySelectedSubPanelIndex != -1
        ? currentPanel.sign.subPanels[
            exposed.vars.currentlySelectedSubPanelIndex
          ]
        : currentPanel.sign;
    const exitTab =
      exposed.vars.currentlySelectedNestedExitTabIndex != -1
        ? currentPanel.exitTabs[exposed.vars.currentlySelectedExitTabIndex]
            .nestedExitTabs[exposed.vars.currentlySelectedNestedExitTabIndex]
        : currentPanel.exitTabs[exposed.vars.currentlySelectedExitTabIndex];

    // Post
    post.polePosition = form["postPosition"].value;
    post.fontType = form["fontChange"].checked;
    post.showPost = form["showPost"].checked;
    post.secondExitOnly = form["secondExitOnly"].checked;

    // Panel
    currentPanel.color = form["panelColor"].value;
    currentPanel.corner = form["panelCorner"].value;

    // Exit Tab
    exitTab.number = form["exitNumber"].value;
    exitTab.width = form["exitTabWidth"].value;
    exitTab.position = form["exitTabPosition"].value;
    exitTab.color = form["exitColor"].value;
    exitTab.variant = form["exitVariant"].value;

    if (exitTab.variant == "Toll") {
      for (const tollOption of document.getElementsByName("tollOption")) {
        if (tollOption.checked == true) {
          if (tollOption.value != "custom") {
            exitTab.icon = tollOption.value;
            exitTab.useTextBasedIcon = false;
          } else {
            exitTab.icon = form["customTag"].value;
            exitTab.useTextBasedIcon = true;
          }
          break;
        }
      }
    } else if (exitTab.variant == "Icon") {
      exitTab.icon = form["iconSelect"].value;
    } else {
      exitTab.icon = null;
    }

    exitTab.FHWAFont = form["exitFont"].checked;
    exitTab.showLeft = form["showLeft"].checked;
    exitTab.fullBorder = form["fullBorder"].checked;
    exitTab.topOffset = form["topOffset"].checked;
    exitTab.borderThickness = form["borderThickness"].value;
    exitTab.minHeight = form["minHeight"].value;
    exitTab.fontSize = form["fontSize"].value;

    // Misc Shields
    currentPanel.sign.shieldBacks = form["shieldBacks"].checked;

    // Sign
    currentPanel.sign.padding =
      form["paddingTop"].value.toString() +
      "rem " +
      form["paddingRight"].value.toString() +
      "rem " +
      form["paddingBottom"].value.toString() +
      "rem " +
      form["paddingLeft"].value.toString() +
      "rem";
    // Global Settings
    currentPanel.sign.globalPositioning = form["globalPosition"].value;

    // Shields
    for (
      let shieldIndex = 0, length = subPanel.shields.length;
      shieldIndex < length;
      shieldIndex++
    ) {
      let shield = subPanel.shields[shieldIndex];
      shield.type = document.getElementById(`shield${shieldIndex}_type`).value;
      shield.routeNumber = document.getElementById(
        `shield${shieldIndex}_routeNumber`
      ).value;
      shield.to = document.getElementById(`shield${shieldIndex}_to`).checked;
      shield.bannerType = document.getElementById(
        `shield${shieldIndex}_bannerType`
      ).value;
      shield.bannerPosition = document.getElementById(
        `shield${shieldIndex}_bannerPosition`
      ).value;
      shield.bannerType2 = document.getElementById(
        `shield${shieldIndex}_bannerType2`
      ).value;
      shield.specialBannerType =
        document.getElementById(`shield${shieldIndex}_specialBannerType`)
          .value || "None";
      shield.indentFirstLetter = document.getElementById(
        `shield${shieldIndex}_indentFirstLetter`
      ).checked;
      shield.fontSize =
        String(document.getElementById(`shield${shieldIndex}_fontSize`).value) +
        "rem";

      const specialBannerTypeSelectElmt = document.getElementById(
        `shield${shieldIndex}_specialBannerType`
      );

      if (Shield.prototype.specialBannerTypes[shield.type] != undefined) {
        while (specialBannerTypeSelectElmt.firstChild) {
          specialBannerTypeSelectElmt.removeChild(
            specialBannerTypeSelectElmt.firstChild
          );
        }

        for (const specialBannerType of Object.keys(
          Shield.prototype.specialBannerTypes[shield.type]
        )) {
          if (exposed.checkSpecialShield(shieldIndex, specialBannerType)) {
            const optionElmt = document.createElement("option");
            optionElmt.value = specialBannerType;
            optionElmt.selected =
              shield.specialBannerType == specialBannerType || false;
            optionElmt.appendChild(document.createTextNode(specialBannerType));
            specialBannerTypeSelectElmt.appendChild(optionElmt);
          } else {
            if (shield.specialBannerType == specialBannerType) {
              shield.specialBannerType = "None";
            }
          }
        }

        let optionElmt = document.createElement("option");
        optionElmt.value = "None";
        optionElmt.selected = "None" == shield.specialBannerType || false;
        optionElmt.appendChild(document.createTextNode("None"));
        specialBannerTypeSelectElmt.appendChild(optionElmt);
        specialBannerTypeSelectElmt.style.visibility = "";
      } else {
        shield.specialBannerType = "None";
        specialBannerTypeSelectElmt.style.visibility = "hidden";
      }
    }

    // Control Text Revision
    const currentBlockElem = exposed.getCurrentBlockElem();
    const blockElemType =
      Control.prototype.blockInternalElements[
        Control.prototype.blockToClassElems.getElem(currentBlockElem)
      ];
    for (const propertyName in currentBlockElem) {
      const elementId = `${blockElemType}_${propertyName}`;
      const element = document.getElementById(elementId);

      if (element) {
        if (element.type === "checkbox") {
          currentBlockElem[propertyName] = element.checked;
        } else if (element.type === "radio") {
          if (element.checked) {
            currentBlockElem[propertyName] = element.value;
          }
        } else if (element.tagName === "SELECT") {
          currentBlockElem[propertyName] = element.value;
        } else {
          currentBlockElem[propertyName] = element.value;
        }
      }
    }

    subPanel.controlText = form["controlText"].value;
    subPanel.actionMessage = form["actionMessage"].value;
    subPanel.actionMessage = subPanel.actionMessage.replace("1/2", "½");
    subPanel.actionMessage = subPanel.actionMessage.replace("1/4", "¼");
    subPanel.actionMessage = subPanel.actionMessage.replace("3/4", "¾");
    subPanel.advisoryMessage = form["outActionMessage"].checked;
    subPanel.advisoryText = form["g_actionMessage"].value;
    if (
      currentPanel.sign.subPanels.length > 1 &&
      exposed.vars.currentlySelectedSubPanelIndex == 0
    ) {
      subPanel.width = parseInt(form["subPanelLength"].value);
    } else if (exposed.vars.currentlySelectedSubPanelIndex != 0) {
      subPanel.height = form["subPanelHeight"].value + "rem";
      subPanel.width = parseInt(form["subPanelLength"].value);
    }

    currentPanel.sign.shieldPosition = form["shieldsPosition"].value;
    var guideArrow_result = form["guideArrow"].value;

    for (const guideArrow_value of Sign.prototype.guideArrows) {
      if (guideArrow_result == guideArrow_value.split(":")[0]) {
        guideArrow_result = guideArrow_value;
        break;
      }
    }

    currentPanel.sign.guideArrow = guideArrow_result;
    currentPanel.sign.guideArrowLanes = form["guideArrowLanes"].value;
    currentPanel.sign.arrowPosition = form["arrowLocations"].value;

    var exitOnlyDirection_result = form["exitOnlyDirection"].value;

    for (const exitOnlyDirection_value of Sign.prototype.exitguideArrows) {
      if (exitOnlyDirection_result == exitOnlyDirection_value.split(":")[0]) {
        exitOnlyDirection_result = exitOnlyDirection_value;
        break;
      }
    }

    if (currentPanel.sign.guideArrow == "Half Exit Only") {
      if (form["arrowLocations"].value == "Middle") {
        while (form["arrowLocations"].firstChild) {
          form["arrowLocations"].removeChild(form["arrowLocations"].lastChild);
        }

        for (const arrowPosition of Sign.prototype.arrowPositions) {
          if (arrowPosition != "Middle") {
            lib.appendOption(form["arrowLocations"], arrowPosition);
          }
        }

        form["arrowLocations"].value = "Left";
        currentPanel.sign.arrowPosition = "Left";
      } else {
        currentPanel.sign.arrowPosition = form["arrowLocations"].value;

        if (!form["arrowLocations"].querySelector("option[value=Middle]")) {
          lib.appendOption(form["arrowLocations"], "Middle");
        }
      }
    } else {
      currentPanel.sign.arrowPosition = form["arrowLocations"].value;

      if (!form["arrowLocations"].querySelector("option[value=Middle]")) {
        lib.appendOption(form["arrowLocations"], "Middle");
      }
    }

    currentPanel.sign.exitguideArrows = exitOnlyDirection_result;
    currentPanel.sign.showExitOnly = form["showExitOnly"].checked;
    currentPanel.sign.exitOnlyPadding = form["exitOnlyPadding"].value;

    currentPanel.sign.otherSymbol = form["otherSymbol"].value;
    currentPanel.sign.oSNum = form["oSNum"].value;

    // Other Symbols Extra
    if (currentPanel.sign.otherSymbol != "None") {
      form["oSNum"].style.display = "block";
    } else {
      form["oSNum"].style.display = "none";
    }

    const exitOnlyDirectionLabel = document.getElementById(
      "exitOnlyDirectionLabel"
    );
    const showExitOnlyLabel = document.getElementById("showExitOnlyLabel");
    const exitOnlyDirection = document.getElementById("exitOnlyDirection");
    const showExitOnly = document.getElementById("showExitOnly");

    if (
      currentPanel.sign.guideArrow != "Exit Only" &&
      currentPanel.sign.guideArrow != "Split Exit Only" &&
      currentPanel.sign.guideArrow != "Half Exit Only"
    ) {
      exitOnlyDirectionLabel.style.visibility = "hidden";
      showExitOnlyLabel.style.visibility = "hidden";
      exitOnlyDirection.style.visibility = "hidden";
      showExitOnly.style.visibility = "hidden";
    } else {
      exitOnlyDirectionLabel.style.visibility = "visible";
      showExitOnlyLabel.style.visibility = "visible";
      exitOnlyDirection.style.visibility = "visible";
      showExitOnly.style.visibility = "visible";
    }

    var paddingValues = currentPanel.sign.padding.split("rem");

    var left = parseFloat(paddingValues[3]);
    var ctop = parseFloat(paddingValues[0]);
    var right = parseFloat(paddingValues[1]);
    var bottom = parseFloat(paddingValues[2]);

    const paddingLeft = document.getElementById("paddingLeft");
    const paddingTop = document.getElementById("paddingTop");
    const paddingRight = document.getElementById("paddingRight");
    const paddingBottom = document.getElementById("paddingBottom");

    paddingLeft.value = left;
    paddingTop.value = ctop;
    paddingRight.value = right;
    paddingBottom.value = bottom;

    updateForm();
    exposed.redraw();
  };

  /**
   * Update the fields in the form to the values of the currently selected panel.
   */
  const updateForm = function () {
    const panel = exposed.getCurrentPanel();
    const sign =
      exposed.vars.currentlySelectedSubPanelIndex != -1
        ? panel.sign.subPanels[exposed.vars.currentlySelectedSubPanelIndex]
        : panel.sign;
    const exitTab =
      exposed.vars.currentlySelectedNestedExitTabIndex != -1
        ? panel.exitTabs[exposed.vars.currentlySelectedExitTabIndex]
            .nestedExitTabs[exposed.vars.currentlySelectedNestedExitTabIndex]
        : panel.exitTabs[exposed.vars.currentlySelectedExitTabIndex];

    const panelList = document.getElementById("panelList");
    const subPanelList = document.getElementById("subPanelList");
    const exitTabList = document.getElementById("exitTabList");

    while (panelList.firstChild) {
      panelList.removeChild(panelList.lastChild);
    }

    while (subPanelList.firstChild) {
      subPanelList.removeChild(subPanelList.lastChild);

      if (subPanelList.lastChild == document.getElementById("global")) {
        if (exposed.vars.currentlySelectedSubPanelIndex == -1) {
          document.getElementById("global").className = "active";
        } else {
          document.getElementById("global").className = "";
        }

        break;
      }
    }

    while (exitTabList.firstChild) {
      exitTabList.removeChild(exitTabList.lastChild);
    }

    for (
      let panelIndex = 0, panelsLength = post.panels.length;
      panelIndex < panelsLength;
      panelIndex++
    ) {
      const panelButton = document.createElement("button");
      panelButton.id = "edit" + (panelIndex + 1);
      panelButton.textContent = "Panel " + (panelIndex + 1);
      panelButton.className =
        exposed.vars.currentlySelectedPanelIndex == panelIndex ? "active" : "";

      panelButton.addEventListener("click", function () {
        exposed.changeEditingPanel(panelIndex);
        panelButton.className = "active";
      });

      panelList.appendChild(panelButton);
    }

    for (
      let subPanelIndex = 0, subPanelsLength = panel.sign.subPanels.length;
      subPanelIndex < subPanelsLength;
      subPanelIndex++
    ) {
      const subPanelButton = document.createElement("button");
      subPanelButton.id = "sub_edit" + (subPanelIndex + 1);
      subPanelButton.textContent = "SubPanel " + (subPanelIndex + 1);
      subPanelButton.className =
        exposed.vars.currentlySelectedSubPanelIndex == subPanelIndex
          ? "active"
          : "";

      subPanelButton.addEventListener("click", function () {
        exposed.changeEditingSubPanel(subPanelIndex, panel);
        subPanelButton.className = "active";
      });

      subPanelList.appendChild(subPanelButton);
    }

    for (
      let exitTabIndex = 0, exitTabLength = panel.exitTabs.length;
      exitTabIndex < exitTabLength;
      exitTabIndex++
    ) {
      const nestedExitTab = panel.exitTabs[exitTabIndex].nestedExitTabs.length;

      const exitTabButton = document.createElement("select");
      exitTabButton.id = "tab_edit" + (exitTabIndex + 1);
      exitTabButton.className =
        "exitTabSelect" +
        (exposed.vars.currentlySelectedExitTabIndex == exitTabIndex)
          ? " active"
          : "";

      for (let nestIndex = -1; nestIndex < nestedExitTab; nestIndex++) {
        lib.appendOption(exitTabButton, nestIndex, {
          selected:
            exposed.vars.currentlySelectedNestedExitTabIndex == nestIndex,
          text:
            nestIndex == -1
              ? "Exit Tab "
              : "Nest Exit Tab " + (nestIndex + 1).toString(),
        });
      }

      exitTabButton.addEventListener("change", function () {
        exposed.changeEditingExitTab(
          exitTabIndex,
          parseInt(exitTabButton.value)
        );
      });

      exitTabButton.addEventListener("click", function () {
        exposed.changeEditingExitTab(exitTabIndex);
      });

      exitTabList.appendChild(exitTabButton);
    }

    // Panel Setting Config

    // Panel Config
    const panelColorSelectElmt = document.getElementById("panelColor");
    for (const option of panelColorSelectElmt.options) {
      if (option.value == panel.color) {
        option.selected = true;
        break;
      }
    }

    const panelCornerSelectElmt = document.getElementById("panelCorner");
    for (const option of panelCornerSelectElmt.options) {
      if (option.value == panel.corner) {
        option.selected = true;
        break;
      }
    }

    // Global Panel
    const outActionMessage = document.getElementById("outActionMessage");
    const outActionMessageLabel = document.getElementById(
      "outActionMessageLabel"
    );
    const globalPositioning = document.getElementById("globalPosition");
    const globalPositionLabel = document.getElementById("globalPositionLabel");
    const g_actionMessage = document.getElementById("g_actionMessage");

    g_actionMessage.className =
      exposed.varscurrentlySelectedSubPanelIndex != -1 ? "invisible" : "";
    outActionMessage.className =
      exposed.varscurrentlySelectedSubPanelIndex != -1 ? "invisible" : "";
    outActionMessageLabel.className =
      exposed.varscurrentlySelectedSubPanelIndex != -1 ? "invisible" : "";
    g_actionMessage.className =
      exposed.varscurrentlySelectedSubPanelIndex != -1 ? "invisible" : "";
    globalPositioning.className =
      exposed.varscurrentlySelectedSubPanelIndex != -1 ? "invisible" : "";
    globalPositionLabel.className =
      exposed.varscurrentlySelectedSubPanelIndex != -1 ? "invisible" : "";

    outActionMessage.checked = panel.sign.advisoryMessage;

    // Sub Panel
    const subPanelHeight = document.getElementById("subPanelHeight");
    const subPanelHeightLabel = document.getElementById("subPanelHeightLabel");
    const subPanelLength = document.getElementById("subPanelLength");
    const subPanelLengthLabel = document.getElementById("subPanelLengthLabel");

    subPanelHeight.style.display =
      exposed.varscurrentlySelectedSubPanelIndex > 0 ? "initial" : "none";
    subPanelHeightLabel.style.display =
      exposed.varscurrentlySelectedSubPanelIndex > 0 ? "inline-block" : "none";

    subPanelLength.style.display =
      exposed.varscurrentlySelectedSubPanelIndex != -1 &&
      panel.sign.subPanels.length > 1
        ? "initial"
        : "none";
    subPanelLengthLabel.style.display =
      exposed.varscurrentlySelectedSubPanelIndex != -1 &&
      panel.sign.subPanels.length > 1
        ? "inline-block"
        : "none";

    // Exit Tabs
    const exitNumberElmt = document.getElementById("exitNumber");
    exitNumberElmt.value = exitTab.number;

    const exitTabPositionSelectElmt =
      document.getElementById("exitTabPosition");
    for (const option of exitTabPositionSelectElmt.options) {
      if (option.value == exitTab.position) {
        option.selected = true;
        break;
      }
    }

    const exitTabWidthSelectElmt = document.getElementById("exitTabWidth");
    for (const option of exitTabWidthSelectElmt.options) {
      if (option.value == exitTab.width) {
        option.selected = true;
        break;
      }
    }

    const exitTabColorElmt = document.querySelector("#exitColor");
    for (const option of exitTabColorElmt.options) {
      if (option.value == exitTab.color) {
        option.selected = true;
        break;
      }
    }

    const exitTabVariantElmt = document.querySelector("#exitVariant");
    for (const option of exitTabColorElmt.options) {
      if (option.value == exitTab.color) {
        option.selected = true;
        break;
      }
    }

    const tollSettingOptions = document.getElementsByName("tollOption");
    for (const tollSettingOption of tollSettingOptions) {
      if (tollSettingOption.value == exitTab.icon) {
        tollSettingOption.selected = true;
        break;
      }
    }

    const iconSetting = document.getElementById("iconSelect");
    iconSetting.value = exitTab.icon;

    for (const option of iconSetting.options) {
      if (option.value == exitTab.icon) {
        option.selected = true;
        break;
      }
    }

    const exitFont = document.getElementById("exitFont");
    exitFont.checked = exitTab.FHWAFont;

    const showLeft = document.getElementById("showLeft");
    showLeft.checked = exitTab.showLeft;

    const fullBorder = document.getElementById("fullBorder");
    fullBorder.checked = exitTab.fullBorder;

    const topOffset = document.getElementById("topOffset");
    topOffset.checked = exitTab.topOffset;

    const borderThickness = document.getElementById("borderThickness");
    borderThickness.value = exitTab.borderThickness;
    document.getElementById("borderValue").innerHTML =
      borderThickness.value.toString();

    const minHeight = document.getElementById("minHeight");
    minHeight.value = exitTab.minHeight;
    document.getElementById("minValue").innerHTML = minHeight.value.toString();

    // Shields
    updateShieldSubform();

    // Control Text Revision
    const sMSPTextList = document.querySelector("#sMSPTextList");
    sMSPTextList.innerHTML = "";
    document.querySelector("#SMSPSelectLabel").textContent =
      "Selected: Row " + (exposed.vars.currentlySelectedRowIndex + 1);
    document.querySelector("#SMSPElementLabel").textContent =
      "Selected: Block " + (exposed.vars.currentlySelectedBlockIndex + 1);
    document.querySelector("#sMSPDeleteSelectedRow").disabled =
      exposed.getCurrentSubPanel().blockElements.rows.length == 1;
    document.querySelector("#smSPDeleteSelectedBlock").disabled =
      exposed.getCurrentSubPanel().blockElements.rows.length == 1 &&
      exposed.getCurrentBlockRows().length == 1;
    for (
      let row = 0;
      row < Object.keys(sign.blockElements.rows).length;
      row++
    ) {
      const sMControlRow = document.createElement("div");
      sMControlRow.dataset.dataRow = row.toString();
      sMControlRow.className =
        "sMControlRow" +
        (row == exposed.vars.currentlySelectedRowIndex ? " selected" : "");

      for (let item = 0; item < sign.blockElements.rows[row].length; item++) {
        const blockElement = sign.blockElements.rows[row][item];

        const textEditorBlock = document.createElement("button");
        textEditorBlock.className =
          "textEditorBlock " +
          Control.prototype.blockInternalElements[
            blockElement.constructor.name
          ] +
          (item == exposed.vars.currentlySelectedBlockIndex &&
          row == exposed.vars.currentlySelectedRowIndex
            ? " selected"
            : "");
        textEditorBlock.textContent =
          Control.prototype.blockElements[blockElement.constructor.name];
        sMControlRow.appendChild(textEditorBlock);
        textEditorBlock.addEventListener("click", () => {
          exposed.setSelectedControlElem(item);
        });
      }

      sMSPTextList.appendChild(sMControlRow);
      sMControlRow.addEventListener("click", () => {
        exposed.setSelectedRow(row);
      });
    }

    for (const divConfig of document.querySelectorAll(
      "#smSPProperties > div"
    )) {
      if (
        divConfig.dataset.property ==
        Control.prototype.blockInternalElements[
          Control.prototype.blockToClassElems.getElem(
            exposed.getCurrentBlockElem()
          )
        ]
      ) {
        divConfig.classList.remove("hidden");
        selectedSettings = divConfig;
      } else {
        divConfig.classList.add("hidden");
      }
    }
    const currentBlockElem = exposed.getCurrentBlockElem();
    const blockElemType =
      Control.prototype.blockInternalElements[
        Control.prototype.blockToClassElems.getElem(currentBlockElem)
      ];

    for (const propertyName in currentBlockElem) {
      const elementId = `${blockElemType}_${propertyName}`;
      const element = document.getElementById(elementId);
      if (element) {
        if (element.type === "checkbox") {
          element.checked = currentBlockElem[propertyName];
          element.addEventListener("change", readForm, { once: true });
        } else if (element.type === "radio") {
          if (element.value === currentBlockElem[propertyName].toString()) {
            element.checked = true;
          }
          element.addEventListener("change", readForm, { once: true });
        } else if (element.tagName === "SELECT") {
          element.value = currentBlockElem[propertyName];
          element.addEventListener("blur", readForm, { once: true });
        } else {
          element.value = currentBlockElem[propertyName];
          element.addEventListener(
            element.type === "text" ? "blur" : "change",
            readForm,
            { once: true }
          );
        }
      }
    }

    // Old Control Text
    const controlTextElmt = document.getElementById("controlText");
    controlTextElmt.value = sign.controlText;

    const actionMessageElmt = document.getElementById("actionMessage");
    actionMessageElmt.value = sign.actionMessage;

    const shieldPositionsSelectElmt =
      document.getElementById("shieldsPosition");
    for (const option of shieldPositionsSelectElmt.options) {
      if (option.value == panel.sign.shieldPosition) {
        option.selected = true;
        break;
      }
    }

    const shieldBacksElmt = document.getElementById("shieldBacks");
    shieldBacksElmt.checked = panel.sign.shieldBacks;

    const guideArrowSelectElmt = document.getElementById("guideArrow");
    for (const option of guideArrowSelectElmt.options) {
      if (option.value == panel.sign.guideArrow) {
        option.selected = true;
        break;
      }
    }

    const guideArrowLanesElmt = document.getElementById("guideArrowLanes");
    guideArrowLanesElmt.value = panel.sign.guideArrowLanes;

    const exitOnlyDirectionLabel = document.getElementById(
      "exitOnlyDirectionLabel"
    );
    const showExitOnlyLabel = document.getElementById("showExitOnlyLabel");
    const exitOnlyDirection = document.getElementById("exitOnlyDirection");
    const showExitOnly = document.getElementById("showExitOnly");
    const exitOnlyPadding = document.getElementById("exitOnlyPadding");
    const exitOnlyPaddingValue = document.getElementById("paddingValue");
    const exitOnlyPaddingLabel = document.getElementById(
      "exitOnlyPaddingLabel"
    );

    exitOnlyDirectionLabel.className = !panel.sign.guideArrow.includes(
      "Exit Only"
    )
      ? "invisible"
      : "";
    exitOnlyPaddingLabel.className =
      !panel.sign.guideArrow.includes("Exit Only") ||
      panel.sign.guideArrow == "Split Exit Only"
        ? "invisible"
        : "";
    showExitOnlyLabel.className = !panel.sign.guideArrow.includes("Exit Only")
      ? "invisible"
      : "";
    exitOnlyDirection.className = !panel.sign.guideArrow.includes("Exit Only")
      ? "invisible"
      : "";
    exitOnlyPadding.className =
      !panel.sign.guideArrow.includes("Exit Only") ||
      panel.sign.guideArrow == "Split Exit Only"
        ? "invisible"
        : "";
    showExitOnly.className = !panel.sign.guideArrow.includes("Exit Only")
      ? "invisible"
      : "";
    paddingValue.className =
      !panel.sign.guideArrow.includes("Exit Only") ||
      panel.sign.guideArrow == "Split Exit Only"
        ? "invisible"
        : "";
    showExitOnly.value = panel.sign.showExitOnly;

    for (const option of exitOnlyDirection.options) {
      if (option.value == panel.sign.exitguideArrows) {
        option.selected = true;
        break;
      }
    }

    const otherSymbolSelectElement = document.getElementById("otherSymbol");
    for (const option of otherSymbolSelectElement.options) {
      if (option.value == panel.sign.otherSymbol) {
        option.selected = true;
        break;
      }
    }

    const oSNumElmt = document.getElementById("oSNum");
    oSNumElmt.value = panel.sign.oSNum;

    const advisoryMessageElmt = document.getElementById("outActionMessage");
    advisoryMessageElmt.checked = panel.sign.advisoryMessage;

    // Ensure dependent small inputs reflect the corresponding checkbox state
    ["sdCtrlText", "sdAdvisory", "sdActionMessage", "sdIcon"].forEach((block) =>
      setDependentVisibility(block)
    );
  };

  /**
   * Update the fields in the form relating to shields to the values of the currently selected panel.
   */
  const updateShieldSubform = function () {
    const shieldsContainerElmt = document.getElementById("shields");
    var subPanel;

    if (exposed.vars.currentlySelectedSubPanelIndex == -1) {
      subPanel = getCurrentPanel().sign;
    } else {
      subPanel = exposed.getCurrentSubPanel();
    }
    const shields = subPanel.shields;

    while (shieldsContainerElmt.firstChild) {
      shieldsContainerElmt.removeChild(shieldsContainerElmt.lastChild);
    }

    for (
      let shieldIndex = 0, length = shields.length;
      shieldIndex < length;
      shieldIndex++
    ) {
      const rowContainerElmt = document.createElement("div");
      rowContainerElmt.style.width = "100%";

      const toCheckElmt = document.createElement("input");
      toCheckElmt.type = "checkbox";
      toCheckElmt.id = `shield${shieldIndex}_to`;
      toCheckElmt.name = `shield${shieldIndex}_to`;
      toCheckElmt.checked = shields[shieldIndex].to;
      toCheckElmt.addEventListener("change", readForm);
      rowContainerElmt.appendChild(toCheckElmt);

      const toCheckLabelElmt = document.createElement("label");
      toCheckLabelElmt.setAttribute("for", `shield${shieldIndex}_to`);
      toCheckLabelElmt.appendChild(document.createTextNode(" TO "));
      rowContainerElmt.appendChild(toCheckLabelElmt);

      // Populate shield options
      const typeSelectElmt = document.createElement("select");
      for (const type in Shield.prototype.types) {
        lib.appendOption(typeSelectElmt, Shield.prototype.types[type], {
          selected: shields[shieldIndex].type == Shield.prototype.types[type],
          text: type,
        });
      }
      typeSelectElmt.id = `shield${shieldIndex}_type`;
      typeSelectElmt.addEventListener("change", readForm);
      rowContainerElmt.appendChild(typeSelectElmt);

      const routeNumberElmt = document.createElement("input");
      routeNumberElmt.type = "text";
      routeNumberElmt.id = `shield${shieldIndex}_routeNumber`;
      routeNumberElmt.placeholder = "00";
      routeNumberElmt.value = shields[shieldIndex].routeNumber;
      routeNumberElmt.addEventListener("change", readForm);
      rowContainerElmt.appendChild(routeNumberElmt);

      // Populate special banner type options
      const specialBannerTypeSelectElmt = document.createElement("select");

      if (
        Shield.prototype.specialBannerTypes[shields[shieldIndex].type] !=
        undefined
      ) {
        for (const specialBannerType of Object.keys(
          Shield.prototype.specialBannerTypes[shields[shieldIndex].type]
        )) {
          if (exposed.checkSpecialShield(shieldIndex, specialBannerType)) {
            const optionElmt = document.createElement("option");
            optionElmt.value = specialBannerType;
            if (specialBannerType == shields[shieldIndex].specialBannerType) {
              optionElmt.selected = true;
            } else {
              optionElmt.selected = false;
            }
            optionElmt.appendChild(document.createTextNode(specialBannerType));
            specialBannerTypeSelectElmt.appendChild(optionElmt);
          }
        }

        let optionElmt = document.createElement("option");
        optionElmt.value = "None";
        if ("None" == shields[shieldIndex].specialBannerType) {
          optionElmt.selected = true;
        } else {
          optionElmt.selected = false;
        }
        optionElmt.appendChild(document.createTextNode("None"));
        specialBannerTypeSelectElmt.appendChild(optionElmt);
        specialBannerTypeSelectElmt.style.visibility = "";
      } else {
        specialBannerTypeSelectElmt.style.visibility = "hidden";
      }

      specialBannerTypeSelectElmt.id = `shield${shieldIndex}_specialBannerType`;
      specialBannerTypeSelectElmt.addEventListener("change", readForm);
      rowContainerElmt.appendChild(specialBannerTypeSelectElmt);

      rowContainerElmt.appendChild(document.createElement("br"));

      const indentElmt = document.createElement("input");
      indentElmt.type = "checkbox";
      indentElmt.id = `shield${shieldIndex}_indentFirstLetter`;
      indentElmt.checked = shields[shieldIndex].indentFirstLetter;
      indentElmt.onchange = readForm;
      rowContainerElmt.appendChild(indentElmt);

      const indentLabelElmt = document.createElement("label");
      indentLabelElmt.setAttribute(
        "for",
        `shield${shieldIndex}_indentFirstLetter`
      );
      indentLabelElmt.appendChild(
        document.createTextNode("Enlarge First Letter")
      );
      rowContainerElmt.appendChild(indentLabelElmt);

      const fontSizeLabelElmt = document.createElement("label");
      fontSizeLabelElmt.setAttribute("for", `shield${shieldIndex}_fontSize`);
      fontSizeLabelElmt.appendChild(document.createTextNode("Text Size: "));
      fontSizeLabelElmt.style.marginLeft = "2rem";
      rowContainerElmt.appendChild(fontSizeLabelElmt);

      const fontSizeText = document.createElement("input");
      fontSizeText.type = "number";
      fontSizeText.id = `shield${shieldIndex}_fontSize`;
      fontSizeText.placeholder = 1.4;
      fontSizeText.value = parseFloat(
        shields[shieldIndex].fontSize.split("rem")[0]
      );
      fontSizeText.min = 1;
      fontSizeText.max = 3;
      fontSizeText.style.width = "4rem";
      fontSizeText.onchange = readForm;
      rowContainerElmt.appendChild(fontSizeText);

      rowContainerElmt.appendChild(document.createElement("br"));

      rowContainerElmt.appendChild(document.createTextNode("Banners:"));

      rowContainerElmt.appendChild(document.createElement("br"));

      // Populate banner type options
      const bannerTypeSelectElmt = document.createElement("select");
      for (const bannerType of Shield.prototype.bannerTypes) {
        lib.appendOption(bannerTypeSelectElmt, bannerType, {
          selected: shields[shieldIndex].bannerType == bannerType,
        });
      }
      bannerTypeSelectElmt.id = `shield${shieldIndex}_bannerType`;
      bannerTypeSelectElmt.addEventListener("change", readForm);
      rowContainerElmt.appendChild(bannerTypeSelectElmt);

      // Populate banner position options
      const bannerPositionSelectElmt = document.createElement("select");
      for (const bannerPosition of Shield.prototype.bannerPositions) {
        lib.appendOption(bannerPositionSelectElmt, bannerPosition, {
          selected: shields[shieldIndex].bannerPosition == bannerPosition,
        });
      }
      bannerPositionSelectElmt.id = `shield${shieldIndex}_bannerPosition`;
      bannerPositionSelectElmt.addEventListener("change", readForm);
      rowContainerElmt.appendChild(bannerPositionSelectElmt);

      rowContainerElmt.appendChild(document.createElement("br"));

      const bannerType2SelectElmt = document.createElement("select");
      for (const bannerType2 of Shield.prototype.bannerTypes) {
        lib.appendOption(bannerType2SelectElmt, bannerType2, {
          selected: shields[shieldIndex].bannerType2 == bannerType2,
        });
      }
      bannerType2SelectElmt.id = `shield${shieldIndex}_bannerType2`;
      bannerType2SelectElmt.addEventListener("change", readForm);
      rowContainerElmt.appendChild(bannerType2SelectElmt);

      // Populate banner position options

      rowContainerElmt.appendChild(document.createElement("br"));

      const duplicateElmt = document.createElement("input");
      duplicateElmt.type = "button";
      duplicateElmt.value = "Duplicate";
      duplicateElmt.dataset.shieldIndex = shieldIndex;
      duplicateElmt.addEventListener("click", function () {
        exposed.duplicateShield(shieldIndex);
      });
      rowContainerElmt.appendChild(duplicateElmt);

      const deleteElmt = document.createElement("input");
      deleteElmt.type = "button";
      deleteElmt.value = "Delete";
      deleteElmt.dataset.shieldIndex = shieldIndex;
      deleteElmt.addEventListener("click", function () {
        exposed.deleteShield(deleteElmt.dataset.shieldIndex);
      });

      rowContainerElmt.appendChild(deleteElmt);

      shieldsContainerElmt.appendChild(rowContainerElmt);
    }
  };

  return {
    init: initialize,
    readForm,
    updateForm,
    updateShieldSubform,
  };
})();
