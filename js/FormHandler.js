const formHandler = (() => {
  let exposed;
  let post;
  let zoomLevel = 1;
  let selectedShieldGroupIndex = -1;
  let selectedShieldIndex = -1;

  const initialize = (appExposed) => {
    exposed = appExposed;
    post = exposed.getPost();

    let postConfiguration = StorageManager.getItem(
      StorageManager.STORAGE_KEYS.post,
    );

    if (!postConfiguration) {
      postConfiguration = {
        polePosition: post.polePosition,
        showPost: post.showPost,
        color: post.color,
      };
      StorageManager.setItem(
        StorageManager.STORAGE_KEYS.post,
        postConfiguration,
      );
    }

    post.polePosition = postConfiguration.polePosition ?? post.polePosition;
    post.showPost = postConfiguration.showPost ?? post.showPost;
    post.color = postConfiguration.color ?? post.color;

    let textElementConfiguration = StorageManager.getItem(
      StorageManager.STORAGE_KEYS.textElement,
    );

    if (!textElementConfiguration) {
      textElementConfiguration = {
        defaultFont: ControlTextElement.defaultFont,
      };
      StorageManager.setItem(
        StorageManager.STORAGE_KEYS.textElement,
        textElementConfiguration,
      );
    }

    ControlTextElement.defaultFont =
      textElementConfiguration.defaultFont ?? ControlTextElement.defaultFont;

    FormNavigation.initUI(exposed, post);

    try {
      //console.log(promptShield(null));
    } catch (e) {
      console.error(e);
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

        const labels = document.querySelectorAll(`label[for="${tid}"]`);
        labels.forEach((label) => {
          if (chk.checked) label.classList.remove("hidden");
          else label.classList.add("hidden");
        });
      }
    };

    toggleTargets(`${block}_useNumeralFormatting`, [
      `${block}_numeralFormattingSize`,
    ]);
    toggleTargets(`${block}_useBannerFormatting`, [
      `${block}_bannerFormattingSize`,
      `${block}_bannerFirstLetterSize`,
    ]);
    toggleTargets(`${block}_smallCapitals`, [`${block}_firstLetterSize`]);
    toggleTargets(`${block}_border`, [
      `${block}_borderColor`,
      `${block}_borderRadius`,
    ]);
    toggleTargets(`${block}_background`, [
      `${block}_backgroundColor`,
      `${block}_borderRadius`,
      `${block}_horizontalPadding`,
      `${block}_verticalPadding`,
      `${block}_hasOnlyBlock`,
    ]);
  };

  const readForm = () => {
    const form = document.forms[0];
    const currentPanel = exposed.getCurrentPanel();
    const subPanel =
      currentPanel.sign.subPanels[exposed.vars.currentlySelectedSubPanelIndex];
    const exitTab =
      exposed.vars.currentlySelectedNestedExitTabIndex != -1
        ? currentPanel.exitTabs[exposed.vars.currentlySelectedExitTabIndex]
            .nestedExitTabs[exposed.vars.currentlySelectedNestedExitTabIndex]
        : currentPanel.exitTabs[exposed.vars.currentlySelectedExitTabIndex];

    // Post
    post.polePosition = form["postPosition"].value;
    post.variant = form["postVariant"].value;
    post.color = form["postColor"].value;
    post.showPost = form["showPost"].checked;
    post.secondExitOnly = form["secondExitOnly"].checked;
    post.thickness = form["postThicknessValue"].value;
    post.panelSpacing = form["panelSpacing"].value;

    if (post.variant === "Standard") {
      post.offsetPost = form["offsetPost"].checked;
    } else {
      post.offsetPost = false;
    }

    // Handle corner radius for non-curved variants
    post.cornerRadius = Math.min(
      Math.max(form["postCornerRadius"].value, 0),
      50,
    );

    // Handle spacing (only for OVERHEAD and Curved 2)
    post.spacing = form["postSpacing"].value;

    StorageManager.setItem(
      StorageManager.STORAGE_KEYS.postPosition,
      post.polePosition,
    );
    StorageManager.setItem(
      StorageManager.STORAGE_KEYS.showPost,
      String(post.showPost),
    );
    StorageManager.setItem(StorageManager.STORAGE_KEYS.postColor, post.color);

    // Panel
    currentPanel.color = form["panelColor"].value;
    currentPanel.corner = form["panelCorner"].value;

    currentPanel.borderRadius = Math.max(0, form["panelBorderRadius"].value);

    // Exit Tab
    exitTab.number = form["exitNumber"].value;
    exitTab.width = form["exitTabWidth"].value;
    exitTab.position = form["exitTabPosition"].value;
    exitTab.color = form["exitColor"].value;
    exitTab.variant = form["exitVariant"].value;
    exitTab.tollLogoSize = form["exitTollLogoSize"].value;

    if (exitTab.variant === "Toll Logo") {
      exitTab.icon = form["exitTollLogoSelect"].value;
      exitTab.tollLogoOnly = form["exitTollLogoOnly"].checked;
      exitTab.tollLogoSquare = form["exitTollLogoSquare"].checked;
    } else if (exitTab.variant === "Icon") {
      exitTab.icon = form["iconSelect"].value;
    } else {
      exitTab.icon = null;
    }

    // Reset/Static flags
    exitTab.useTextBasedIcon = false;

    // Direct Assignments
    exitTab.FHWAFont = form["exitFont"].checked;
    exitTab.showLeft = form["showLeft"].checked;
    exitTab.fullBorder = form["fullBorder"].checked;
    exitTab.squareCorners = form["squareCorners"].checked;
    exitTab.topOffset = form["topOffset"].checked;

    // Numeric and Value inputs
    exitTab.borderThickness = parseFloat(form["borderThickness"].value);
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

    subPanel.blockElements.blockProperties[
      exposed.vars.currentlySelectedRowIndex
    ].topPadding = document.querySelector("#sdBlock_topPadding").value;
    subPanel.blockElements.blockProperties[
      exposed.vars.currentlySelectedRowIndex
    ].bottomPadding = document.querySelector("#sdBlock_bottomPadding").value;
    subPanel.blockElements.blockProperties[
      exposed.vars.currentlySelectedRowIndex
    ].backgroundColor = document.querySelector(
      "#sdBlock_backgroundColor",
    ).value;
    subPanel.blockElements.blockProperties[
      exposed.vars.currentlySelectedRowIndex
    ].backgroundFullWidth = document.querySelector(
      "#sdBlock_backgroundFullWidth",
    ).checked;
    subPanel.blockElements.blockProperties[
      exposed.vars.currentlySelectedRowIndex
    ].width = document.querySelector("#sdBlock_width").value;
    subPanel.blockElements.blockProperties[
      exposed.vars.currentlySelectedRowIndex
    ].stretchLeft = document.querySelector("#sdBlock_stretchLeft").checked;
    subPanel.blockElements.blockProperties[
      exposed.vars.currentlySelectedRowIndex
    ].stretchCenter = document.querySelector("#sdBlock_stretchCenter").checked;
    subPanel.blockElements.blockProperties[
      exposed.vars.currentlySelectedRowIndex
    ].stretchRight = document.querySelector("#sdBlock_stretchRight").checked;

    subPanel.width = parseInt(form["subPanelLength"].value);

    if (exposed.vars.currentlySelectedSubPanelIndex != 0) {
      subPanel.height = form["subPanelHeight"].value;
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

    const useCanadianDownArrowField = form["useCanadianDownArrows"];
    currentPanel.sign.useCanadianDownArrows =
      useCanadianDownArrowField && useCanadianDownArrowField.checked;

    currentPanel.sign.exitguideArrows = exitOnlyDirection_result;
    currentPanel.sign.showExitOnly = form["showExitOnly"].checked;
    currentPanel.sign.hideExitArrow = form["hideExitArrow"]
      ? form["hideExitArrow"].checked
      : false;
    const borderModeField = form["exitOnlyBorderMode"];
    if (borderModeField) {
      const selectedMode = borderModeField.value;
      currentPanel.sign.exitOnlyBorderMode =
        Sign.prototype.exitOnlyBorderModes.includes(selectedMode)
          ? selectedMode
          : Sign.prototype.exitOnlyBorderModes[0];
    } else {
      currentPanel.sign.exitOnlyBorderMode =
        Sign.prototype.exitOnlyBorderModes[0];
    }
    currentPanel.sign.exitOnlyLeftText = form["exitOnlyLeftText"]
      ? form["exitOnlyLeftText"].value || ""
      : "";
    currentPanel.sign.exitOnlyRightText = form["exitOnlyRightText"]
      ? form["exitOnlyRightText"].value || ""
      : "";
    currentPanel.sign.exitOnlyLabelPreset = [
      currentPanel.sign.exitOnlyLeftText,
      currentPanel.sign.exitOnlyRightText,
    ]
      .filter((part) => part && part.trim().length > 0)
      .join(" ")
      .trim();
    currentPanel.sign.exitOnlyPadding = form["exitOnlyPadding"].value;

    currentPanel.sign.otherSymbol = form["otherSymbol"].value;
    currentPanel.sign.oSNum = form["oSNum"].value;

    updateForm();
    exposed.redraw();
  };

  /**
   * Update the fields in the form to the values of the currently selected panel.
   */
  const updateForm = () => {
    const panel = exposed.getCurrentPanel();
    const sign =
      panel.sign.subPanels[exposed.vars.currentlySelectedSubPanelIndex];

    const selectedExitTabIndex = exposed.vars.currentlySelectedExitTabIndex;
    const selectedNestedExitTabIndex =
      exposed.vars.currentlySelectedNestedExitTabIndex;
    const currentExitTab = panel.exitTabs[selectedExitTabIndex];

    const maxNested =
      typeof ExitTab !== "undefined" && ExitTab.prototype.maxNested != null
        ? ExitTab.prototype.maxNested
        : 1;

    if (currentExitTab && currentExitTab.nestedExitTabs.length > maxNested) {
      currentExitTab.nestedExitTabs.splice(maxNested);
    }

    if (
      currentExitTab &&
      selectedNestedExitTabIndex > -1 &&
      selectedNestedExitTabIndex >= currentExitTab.nestedExitTabs.length
    ) {
      const newNestedIndex =
        currentExitTab.nestedExitTabs.length > 0
          ? currentExitTab.nestedExitTabs.length - 1
          : -1;
      exposed.changeEditingExitTab(selectedExitTabIndex, newNestedIndex);
      return;
    }

    const exitTab =
      currentExitTab && selectedNestedExitTabIndex > -1
        ? currentExitTab.nestedExitTabs[selectedNestedExitTabIndex]
        : currentExitTab;

    const panelList = document.getElementById("panelList");
    const subPanelList = document.getElementById("subPanelList");
    const exitTabList = document.getElementById("exitTabList");

    document.querySelector("#currentlySelectedPanel").textContent = `Panel ${
      exposed.vars.currentlySelectedPanelIndex + 1
    }`;

    document.getElementById("postPosition").value = post.polePosition;
    document.getElementById("postColor").value = post.color;
    document.getElementById("showPost").checked = post.showPost;
    document.getElementById("secondExitOnly").checked = post.secondExitOnly;
    document.getElementById("offsetPost").checked = post.offsetPost;
    document.getElementById("postCornerRadius").value = post.cornerRadius;
    document.getElementById("postSpacing").value = post.spacing || 1;
    document.getElementById("panelSpacing").value = post.panelSpacing;
    document.getElementById("panelSpacingValue").value = post.panelSpacing;
    document.getElementById("postThicknessValue").value = post.thickness;

    panelList.innerHTML = "";
    exitTabList.innerHTML = "";

    subPanelList.innerHTML = "";

    for (
      let panelIndex = 0, panelsLength = post.panels.length;
      panelIndex < panelsLength;
      panelIndex++
    ) {
      const panelButton = document.createElement("button");
      panelButton.id = "edit" + (panelIndex + 1);
      panelButton.type = "button";
      panelButton.className =
        "panelListButton" +
        (exposed.vars.currentlySelectedPanelIndex == panelIndex
          ? " active"
          : "");
      panelButton.dataset.panelIndex = panelIndex.toString();

      const label = document.createElement("span");
      label.className = "panelListLabel";
      label.textContent = "Panel " + (panelIndex + 1);
      panelButton.appendChild(label);

      panelButton.addEventListener("click", () => {
        exposed.changeEditingPanel(panelIndex);
        panelButton.classList.add("active");
      });

      panelList.appendChild(panelButton);
    }

    for (
      let subPanelIndex = 0, subPanelsLength = panel.sign.subPanels.length;
      subPanelIndex < subPanelsLength;
      subPanelIndex++
    ) {
      const subPanelButton = document.createElement("button");
      subPanelButton.textContent = subPanelIndex + 1;
      subPanelButton.className =
        exposed.vars.currentlySelectedSubPanelIndex == subPanelIndex
          ? "active"
          : "";

      subPanelButton.addEventListener("click", () => {
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
      const nestedExitTabs = panel.exitTabs[exitTabIndex].nestedExitTabs || [];
      const allowedNestedLength = Math.min(
        nestedExitTabs.length,
        maxNested != null ? maxNested : nestedExitTabs.length,
      );

      const exitTabGroup = document.createElement("div");
      exitTabGroup.className = "exitTabGroup";

      const exitTabButton = document.createElement("button");
      exitTabButton.type = "button";
      exitTabButton.className = "exitTabButton";
      exitTabButton.textContent = "Tab " + (exitTabIndex + 1);

      if (
        exposed.vars.currentlySelectedExitTabIndex === exitTabIndex &&
        exposed.vars.currentlySelectedNestedExitTabIndex === -1
      ) {
        exitTabButton.classList.add("active");
        exitTabButton.textContent = "Tab " + (exitTabIndex + 1);
      } else if (
        exposed.vars.currentlySelectedExitTabIndex != exitTabIndex &&
        allowedNestedLength > 0
      ) {
        exitTabButton.textContent =
          "Tab " + (exitTabIndex + 1) + " (" + allowedNestedLength + ")";
      }

      exitTabButton.addEventListener("click", () => {
        exposed.changeEditingExitTab(exitTabIndex);
      });

      exitTabButton.dataset.exitTabIndex = exitTabIndex.toString();
      exitTabGroup.appendChild(exitTabButton);

      for (
        let nestIndex = 0;
        nestIndex < allowedNestedLength + 1;
        nestIndex++
      ) {
        const nestedButton = document.createElement("button");
        nestedButton.type = "button";
        nestedButton.className = "exitTabNestedButton";

        if (nestIndex < allowedNestedLength) {
          nestedButton.textContent = "Sub " + (nestIndex + 1);

          if (
            exposed.vars.currentlySelectedExitTabIndex === exitTabIndex &&
            exposed.vars.currentlySelectedNestedExitTabIndex === nestIndex
          ) {
            nestedButton.classList.add("active");
          }

          nestedButton.addEventListener("click", () => {
            exposed.changeEditingExitTab(exitTabIndex, nestIndex);
          });
        } else {
          nestedButton.textContent = "+";
          nestedButton.dataset.tooltip = "Add a sub-exit tab";
          nestedButton.className = "exitTabNestedButton newNestedButton";
          nestedButton.onclick = App.newNestExitTab;
        }

        exitTabGroup.appendChild(nestedButton);
      }

      exitTabList.appendChild(exitTabGroup);
    }

    // Panel Setting Config
    document.getElementById("panelColor").value = panel.color;
    document.getElementById("panelCorner").value = panel.corner;
    document.getElementById("panelBorderRadius").value =
      panel.borderRadius || 0.5;
    document.getElementById("outActionMessage").checked =
      panel.sign.advisoryMessage;

    // Sub Panel
    const isSubPanelSelected = exposed.vars.currentlySelectedSubPanelIndex > 0;
    const hasMultipleSubPanels = panel.sign.subPanels.length > 1;

    subPanelHeight.style.display = isSubPanelSelected ? "initial" : "none";
    subPanelHeightLabel.style.display = isSubPanelSelected
      ? "inline-block"
      : "none";

    const showLength = hasMultipleSubPanels;
    subPanelLength.style.display = showLength ? "initial" : "none";
    subPanelLengthLabel.style.display = showLength ? "inline-block" : "none";

    document.getElementById("exitNumber").value = exitTab.number;
    document
      .getElementById("exitTollLogoOptions")
      .classList.toggle("hidden", exitTab.variant !== "Toll Logo");

    const selectFields = [
      { id: "exitTabPosition", val: exitTab.position },
      { id: "exitTabWidth", val: exitTab.width },
      { id: "exitColor", val: exitTab.color },
      { id: "exitVariant", val: exitTab.variant },
      { id: "exitTollLogoSelect", val: exitTab.icon || "" },
      { id: "iconSelect", val: exitTab.icon || "" },
      { id: "shieldsPosition", val: panel.sign.shieldPosition },
      { id: "guideArrow", val: panel.sign.guideArrow },
      { id: "otherSymbol", val: panel.sign.otherSymbol },
    ];

    for (const field of selectFields) {
      const el = document.getElementById(field.id);
      if (!el) continue;
      for (const option of el.options) {
        if (option.value == field.val) {
          option.selected = true;
          break;
        }
      }
    }

    document.getElementById("exitTollLogoSize").value = exitTab.tollLogoSize;
    document.getElementById("exitTollLogoSizeValue").textContent =
      exitTab.tollLogoSize;
    document.getElementById("exitTollLogoOnly").checked =
      exitTab.tollLogoOnly !== false;
    document.getElementById("exitTollLogoSquare").checked =
      exitTab.tollLogoSquare;
    document.getElementById("exitFont").checked = exitTab.FHWAFont;
    document.getElementById("showLeft").checked = exitTab.showLeft;
    document.getElementById("fullBorder").checked = exitTab.fullBorder;
    document.getElementById("squareCorners").checked = exitTab.squareCorners;
    document.getElementById("topOffset").checked = exitTab.topOffset;

    document.getElementById("borderThickness").value = exitTab.borderThickness;
    document.getElementById("borderValue").innerHTML = exitTab.borderThickness;

    document.getElementById("minHeight").value = exitTab.minHeight;
    document.getElementById("minValue").innerHTML = exitTab.minHeight;

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
        textEditorBlock.dataset.row = row.toString();
        textEditorBlock.dataset.block = item.toString();
        textEditorBlock.textContent =
          Control.prototype.blockElements[blockElement.constructor.name];
        sMControlRow.appendChild(textEditorBlock);
        textEditorBlock.addEventListener(
          "click",
          () => {
            exposed.setSelectedControlElem(item);
          },
          { once: true },
        );
      }

      sMSPTextList.appendChild(sMControlRow);
      sMControlRow.addEventListener(
        "click",
        () => {
          exposed.setSelectedRow(row);
        },
        { once: true },
      );
    }

    for (const divConfig of document.querySelectorAll(
      "#smSPProperties > div",
    )) {
      if (
        divConfig.dataset.property ==
        Control.prototype.blockInternalElements[
          Control.prototype.blockToClassElems.getElem(
            exposed.getCurrentBlockElem(),
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

    if (blockElemType === "sdArrow") {
      const fallbackPadding =
        currentBlockElem.padding !== undefined &&
        currentBlockElem.padding !== null
          ? currentBlockElem.padding
          : 0;

      currentBlockElem.paddingHorizontal =
        currentBlockElem.paddingHorizontal || fallbackPadding;
      currentBlockElem.paddingVertical =
        currentBlockElem.paddingVertical || fallbackPadding;

      delete currentBlockElem.padding;
    }

    for (const propertyName in currentBlockElem) {
      const elementId = `${blockElemType}_${propertyName}`;
      const element = document.getElementById(elementId);
      const displayElement = document.getElementById(elementId + "Val");
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
            element.type === "text" ? "input" : "change",
            readForm,
            { once: true },
          );
          if (element.type === "range" && displayElement) {
            element.addEventListener(
              "input",
              () => {
                displayElement.value = element.value;
              },
              { once: true },
            );
          }
        }
      }

      if (displayElement) {
        if (
          displayElement.tagName === "INPUT" &&
          displayElement.type === "number"
        ) {
          displayElement.value = currentBlockElem[propertyName];
        } else {
          displayElement.textContent = currentBlockElem[propertyName];
        }
      }
    }

    if (blockElemType === "sdArrow") {
      const arrowRotationButtons = document.querySelectorAll(
        ".sdArrow_rotationPreset",
      );
      const currentRotation = parseFloat(currentBlockElem.rotation) || 0;
      arrowRotationButtons.forEach((button) => {
        const degrees = parseFloat(button.dataset.degrees || "0") || 0;
        button.classList.toggle(
          "activated",
          Math.abs((((currentRotation % 360) + 360) % 360) - degrees) < 0.5,
        );
      });

      const arrowFlipInput = document.getElementById("sdArrow_flip");
      const arrowFlipButton = document.getElementById("sdArrow_flipButton");
      if (arrowFlipInput && arrowFlipButton) {
        arrowFlipInput.value = currentBlockElem.flip ? "true" : "false";
        arrowFlipButton.classList.toggle("activated", currentBlockElem.flip);
        arrowFlipButton.setAttribute(
          "aria-pressed",
          currentBlockElem.flip ? "true" : "false",
        );
      }
    }

    document.querySelector("#sdBlock_topPadding").value =
      sign.blockElements.blockProperties[
        exposed.vars.currentlySelectedRowIndex
      ].topPadding;
    document
      .querySelector("#sdBlock_topPadding")
      .addEventListener("change", readForm, { once: true });

    document.querySelector("#sdBlock_bottomPadding").value =
      sign.blockElements.blockProperties[
        exposed.vars.currentlySelectedRowIndex
      ].bottomPadding;
    document
      .querySelector("#sdBlock_bottomPadding")
      .addEventListener("change", readForm, { once: true });

    document.querySelector("#sdBlock_topPaddingVal").textContent =
      sign.blockElements.blockProperties[
        exposed.vars.currentlySelectedRowIndex
      ].topPadding;
    document.querySelector("#sdBlock_bottomPaddingVal").textContent =
      sign.blockElements.blockProperties[
        exposed.vars.currentlySelectedRowIndex
      ].bottomPadding;

    document.querySelector("#sdBlock_backgroundColor").value =
      sign.blockElements.blockProperties[
        exposed.vars.currentlySelectedRowIndex
      ].backgroundColor;

    document
      .querySelector("#sdBlock_backgroundColor")
      .addEventListener("blur", readForm, { once: true });

    document.querySelector("#sdBlock_backgroundFullWidth").checked =
      sign.blockElements.blockProperties[
        exposed.vars.currentlySelectedRowIndex
      ].backgroundFullWidth;
    document
      .querySelector("#sdBlock_backgroundFullWidth")
      .addEventListener("change", readForm, {
        once: true,
      });

    document.querySelector("#sdBlock_width").value =
      sign.blockElements.blockProperties[
        exposed.vars.currentlySelectedRowIndex
      ].width;
    document
      .querySelector("#sdBlock_width")
      .addEventListener("change", readForm, { once: true });

    document
      .querySelector("#sdBlock_stretchLeft")
      .addEventListener("change", readForm, { once: true });

    document.querySelector("#sdBlock_stretchLeft").checked =
      sign.blockElements.blockProperties[
        exposed.vars.currentlySelectedRowIndex
      ].stretchLeft;

    document
      .querySelector("#sdBlock_stretchCenter")
      .addEventListener("change", readForm, { once: true });
    document.querySelector("#sdBlock_stretchCenter").checked =
      sign.blockElements.blockProperties[
        exposed.vars.currentlySelectedRowIndex
      ].stretchCenter;

    document
      .querySelector("#sdBlock_stretchRight")
      .addEventListener("change", readForm, { once: true });
    document.querySelector("#sdBlock_stretchRight").checked =
      sign.blockElements.blockProperties[
        exposed.vars.currentlySelectedRowIndex
      ].stretchRight;

    const isExitOnly = panel.sign.guideArrow.includes("Exit Only");
    const isSplit = panel.sign.guideArrow === "Split Exit Only";

    // Toggle visibility for all Exit Only related elements
    const exitOnlyElements = [
      "exitOnlyDirectionLabel",
      "showExitOnlyLabel",
      "exitOnlyDirection",
      "showExitOnly",
      "hideExitArrowLabel",
      "hideExitArrow",
      "exitOnlyLeftTextLabel",
      "exitOnlyLeftText",
      "exitOnlyRightTextLabel",
      "exitOnlyRightText",
    ];

    for (const id of exitOnlyElements) {
      const el = document.getElementById(id);
      if (el) el.style.visibility = isExitOnly ? "visible" : "hidden";
    }

    const showPadding = isExitOnly && !isSplit;
    document.getElementById("exitOnlyPaddingLabel").className = showPadding
      ? ""
      : "invisible";
    document.getElementById("exitOnlyPadding").className = showPadding
      ? ""
      : "invisible";
    document.getElementById("paddingValue").className = showPadding
      ? ""
      : "invisible";

    const shouldShowBorderMode =
      !post.secondExitOnly &&
      (panel.sign.guideArrow === "Half Exit Only" ||
        panel.sign.guideArrow === "Exit Only");
    document.getElementById("exitOnlyBorderModeLabel").style.visibility =
      shouldShowBorderMode ? "visible" : "hidden";
    document.getElementById("exitOnlyBorderMode").style.visibility =
      shouldShowBorderMode ? "visible" : "hidden";
    document.getElementById("exitOnlyBorderMode").value =
      panel.sign.exitOnlyBorderMode || "None";

    // Text inputs
    document.getElementById("exitOnlyLeftText").value =
      panel.sign.exitOnlyLeftText || "";
    document.getElementById("exitOnlyRightText").value =
      panel.sign.exitOnlyRightText || "";
    document.getElementById("showExitOnly").checked = panel.sign.showExitOnly;
    document.getElementById("hideExitArrow").checked = panel.sign.hideExitArrow;
    document.getElementById("exitOnlyPadding").value =
      panel.sign.exitOnlyPadding;
    document.getElementById("paddingValue").textContent =
      panel.sign.exitOnlyPadding;

    // --- Other Symbols & Shields ---
    document.getElementById("oSNum").style.display =
      panel.sign.otherSymbol !== "None" ? "block" : "none";
    document.getElementById("oSNum").value = panel.sign.oSNum;
    document.getElementById("shieldBacks").checked = panel.sign.shieldBacks;
    document.getElementById("guideArrowLanes").value =
      panel.sign.guideArrowLanes;

    if (document.getElementById("useCanadianDownArrows")) {
      document.getElementById("useCanadianDownArrows").checked =
        panel.sign.useCanadianDownArrows;
    }

    const p = panel.sign.padding
      .split("rem")
      .map((val) => parseFloat(val) || 0);

    document.getElementById("paddingTop").value = p[0];
    document.getElementById("paddingRight").value = p[1];
    document.getElementById("paddingBottom").value = p[2];
    document.getElementById("paddingLeft").value = p[3];

    // Ensure dependent small inputs reflect the corresponding checkbox state
    [
      "sdCtrlText",
      "sdAdvisory",
      "sdActionMessage",
      "sdIcon",
      "sdTollLogo",
    ].forEach((block) => setDependentVisibility(block));
  };

  /**
   * Update the fields in the form relating to shields to the values of the currently selected panel.
   */
  const updateShieldSubform = () => {
    const panel = exposed.getCurrentPanel();
    const sign =
      panel.sign.subPanels[exposed.vars.currentlySelectedSubPanelIndex];

    const blockElements = exposed.getCurrentBlockElem();

    const shieldGroupElements = [];
    for (const row of sign.blockElements.rows) {
      for (const blockElement of row) {
        if (blockElement.constructor.name === "ShieldGroupElement") {
          shieldGroupElements.push(blockElement);
        }
      }
    }

    // Update the shield group list
    const shieldGroupList = document.getElementById("shieldGroupList");
    shieldGroupList.innerHTML = "";

    shieldGroupElements.forEach((shieldGroup, index) => {
      const button = document.createElement("button");
      button.textContent = `Shield Group ${index + 1} (Row ${sign.blockElements.rows.findIndex((row) => row.includes(shieldGroup)) + 1})`;
      if (index === selectedShieldGroupIndex) {
        button.classList.add("selected");
      }
      button.addEventListener("click", () => {
        selectedShieldGroupIndex = index;
        selectedShieldIndex = -1; // Reset shield selection
        document
          .querySelectorAll("#shieldGroupList button")
          .forEach((btn) => btn.classList.remove("selected"));
        button.classList.add("selected");
        updateShieldListForGroup(shieldGroup, index);
      });
      shieldGroupList.appendChild(button);
    });

    // If a shield group is selected, update its list
    if (
      selectedShieldGroupIndex >= 0 &&
      selectedShieldGroupIndex < shieldGroupElements.length
    ) {
      updateShieldListForGroup(
        shieldGroupElements[selectedShieldGroupIndex],
        selectedShieldGroupIndex,
      );
    }

    // Show/hide shield group settings
    const shieldGroupSettings = document.querySelector(
      '[data-property="sdShieldGroup"]',
    );
    if (shieldGroupSettings) {
      if (selectedShieldGroupIndex >= 0) {
        shieldGroupSettings.classList.remove("hidden");
      } else {
        shieldGroupSettings.classList.add("hidden");
      }
    }

    // Hide banner config initially
    const bannerConfig = document.getElementById("smSPShieldBannerConfig");
    if (bannerConfig) {
      bannerConfig.style.display = "none";
    }
  };

  const updateShieldListForGroup = (shieldGroup, groupIndex) => {
    const shieldList = document.getElementById("smSPShieldList");
    shieldList.innerHTML = "";

    const shieldGroupDiv = document.createElement("div");
    shieldGroupDiv.className = "smSPShieldGroup selected";

    const dragIndicator = document.createElement("button");
    dragIndicator.className = "dragIndicator";
    dragIndicator.innerHTML =
      '<span class="material-symbols-outlined">drag_indicator</span>';
    shieldGroupDiv.appendChild(dragIndicator);

    const holder = document.createElement("div");
    holder.className = "smSPShieldGroupHolder";

    shieldGroup.shields.forEach((shield, shieldIndex) => {
      const shieldRow = document.createElement("div");
      shieldRow.className = "smSPShieldRow";
      if (shieldIndex === selectedShieldIndex) {
        shieldRow.classList.add("selected");
      }

      const rowDragIndicator = document.createElement("button");
      rowDragIndicator.className = "dragIndicator";
      rowDragIndicator.innerHTML =
        '<span class="material-symbols-outlined">drag_indicator</span>';
      shieldRow.appendChild(rowDragIndicator);

      const shieldBlock = document.createElement("span");
      shieldBlock.className = "smSPShieldBlock";

      const img = document.createElement("img");
      img.src = Shield.prototype.getDirectoryFromShield(
        shield.shieldValue,
        shield.variant,
      );
      img.className = "smSPShieldVisual";
      shieldBlock.appendChild(img);

      shieldBlock.appendChild(
        document.createTextNode(shield.routeNumber || ""),
      );
      shieldRow.appendChild(shieldBlock);

      shieldRow.addEventListener("click", () => {
        selectedShieldIndex = shieldIndex;
        document
          .querySelectorAll(".smSPShieldRow")
          .forEach((row) => row.classList.remove("selected"));
        shieldRow.classList.add("selected");

        // Show banner config
        const bannerConfig = document.getElementById("smSPShieldBannerConfig");
        if (bannerConfig) {
          bannerConfig.style.display = "block";
        }
      });

      holder.appendChild(shieldRow);
    });

    shieldGroupDiv.appendChild(holder);
    shieldList.appendChild(shieldGroupDiv);
  };

  const updateShieldModalVisual = (selected, differentShield) => {
    const holder = document.querySelector(".shieldPreview");
    const img = holder.querySelector(".selectedShieldPreview");

    if (selected.shieldType === "custom" && selected.imageData) {
      img.src = selected.imageData;
    } else {
      img.src = Shield.prototype.getDirectoryFromShield(
        selected.shieldValue,
        selected.variant,
      );
    }

    if (selected.shieldBacks) {
      img.style.setProperty(
        "--shieldBackColor",
        (
          lib.colors[selected.shieldBackColor] || selected.shieldBackColor
        ).toLowerCase(),
      );
      img.style.setProperty(
        "--shieldBackRadius",
        selected.shieldBorderRadius + "px",
      );
    } else {
      img.style.setProperty("--shieldBackColor", "");
      img.style.setProperty("--shieldBackRadius", "");
    }

    holder.querySelector(".selectedShieldName").textContent =
      selected.shieldName;

    if (differentShield) {
      document.querySelector("#selectedShieldVariant").innerHTML = "";
      for (const variant of Shield.prototype.getPropertiesFromName(
        selected.shieldValue,
      ).variants) {
        lib.appendOption(
          document.querySelector("#selectedShieldVariant"),
          variant,
          { selected: selected.variant == variant },
        );
      }
    }

    document.querySelector("#selectedShieldBacks").value = selected.shieldBacks;
    document.querySelector("#selectedBackColor").value = selected.backColor;
    document.querySelector("#selectedBackRoudness").value =
      selected.shieldBorderRadius;
  };

  const promptShield = function (currentValue, returnMethod = null) {
    const modal = document.querySelector("#shieldImgSelector");
    const holder = document.querySelector("#modalHolder");
    let eventListeners = [];
    return new Promise((resolve, reject) => {
      let selectedShield = {
        shieldType: currentValue?.shieldType || "preset",
        shieldName: currentValue?.shieldName || "Interstate",
        shieldValue: currentValue?.shieldValue || "I",
        variant: currentValue?.variant || "2 Digit",

        shieldBacks: currentValue?.shieldBacks || false,
        shieldBackColor: currentValue?.shieldBackColor || "Black",
        shieldBorderRadius: currentValue?.shieldBorderRadius || 4,

        imageType: currentValue?.imageType || "file",
        imageData: currentValue?.imageData || "",
      };

      // Setup tabs
      document.querySelector("#presetShields").addEventListener("click", () => {
        document.querySelector(".shieldLibrary").dataset.tab =
          "presetShieldList";
        document.querySelector("#presetShields").className = "selected";
        document.querySelector("#customShields").className = "";
        selectedShield.shieldType = "preset";
      });

      document.querySelector("#customShields").addEventListener("click", () => {
        document.querySelector(".shieldLibrary").dataset.tab = "uploadShield";
        document.querySelector("#customShields").className = "selected";
        document.querySelector("#presetShields").className = "";
        selectedShield.shieldType = "custom";
      });

      updateShieldModalVisual(selectedShield, true);

      holder.style.display = "flex";
      modal.style.display = "flex";
      modal.showModal();

      // Setup close button
      // Setup file upload
      const fileInput = document.querySelector("#uploadCustomShield");
      if (fileInput) {
        fileInput.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              selectedShield.shieldType = "custom";
              selectedShield.imageType = "data";
              selectedShield.imageData = e.target.result;
              selectedShield.shieldName = file.name.split(".")[0];
              updateShieldModalVisual(selectedShield, true);
            };
            reader.readAsDataURL(file);
          }
        });
      }

      // Setup tabs
      document
        .querySelector("#presetShields")
        ?.addEventListener("click", () => {
          document.querySelector(".shieldLibrary").dataset.tab =
            "presetShieldList";
          document.querySelector("#presetShields").className = "selected";
          document.querySelector("#customShields").className = "";
          selectedShield.shieldType = "preset";
        });

      document
        .querySelector("#customShields")
        ?.addEventListener("click", () => {
          document.querySelector(".shieldLibrary").dataset.tab = "uploadShield";
          document.querySelector("#customShields").className = "selected";
          document.querySelector("#presetShields").className = "";
          selectedShield.shieldType = "custom";
        });

      // Setup close button
      document.querySelector("#shieldImgSelectorClose")?.addEventListener(
        "click",
        () => {
          holder.style.display = "none";
          modal.style.display = "none";
          modal.close();

          // Cleanup event listeners
          for (const e of eventListeners) {
            e.element.removeEventListener("click", e.handler);
          }
          eventListeners.length = 0;

          if (returnMethod) returnMethod(null);
          resolve(null);
        },
        { once: true },
      );

      const setShield = (event) => {
        let isDifferent =
          selectedShield.shieldValue != event.currentTarget.dataset.name;
        selectedShield.shieldName =
          event.currentTarget.querySelector(".shieldItemName").textContent;
        selectedShield.shieldValue = event.currentTarget.dataset.name;
        searchFromDir(
          Shield.prototype.shieldDirectory,
          document.querySelector("#presetShieldList"),
        );

        if (
          isDifferent &&
          !Shield.prototype
            .getPropertiesFromName(selectedShield.shieldValue)
            .variants.includes(selectedShield.variant)
        ) {
          selectedShield.variant =
            Shield.prototype.getPropertiesFromName(selectedShield.shieldValue)
              .variants[0] || "";
        }

        updateShieldModalVisual(selectedShield, isDifferent);
      };

      const searchFromDir = (dir, parentElem, createListeners) => {
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
            if (searchFromDir(cat, childElem, createListeners)) {
              hasAnything = true;
              if (selectedShield.name != "") {
                childElem.classList.remove("open");
                childElem.querySelector(".shieldCategoryHead").click();
              }
            }
          } else if (cat.type == "shield") {
            const childElem = parentElem.querySelector(
              '.shieldCategoryType[data-name="' + category + '"]',
            );

            if (cat.name == selectedShield.shieldName) {
              hasAnything = true;
              childElem.classList.add("selected");
              childElem.querySelector(".shieldItemSelected").textContent =
                "radio_button_checked";
            } else {
              childElem.classList.remove("selected");
              childElem.querySelector(".shieldItemSelected").textContent =
                "radio_button_unchecked";
            }

            if (createListeners) {
              childElem.addEventListener("click", setShield);
              eventListeners.push({ element: childElem, handler: setShield });
            }
          }
        }
        return hasAnything;
      };

      searchFromDir(
        Shield.prototype.shieldDirectory,
        document.querySelector("#presetShieldList"),
        true,
      );

      const handleVariant = (e) => {
        selectedShield.variant = e.currentTarget.value;
        updateShieldModalVisual(selectedShield, false);
      };
      document
        .querySelector("#selectedShieldVariant")
        .addEventListener("change", handleVariant);
      eventListeners.push({
        element: document.querySelector("#selectedShieldVariant"),
        handler: handleVariant,
      });

      const handleBackColor = (e) => {
        selectedShield.shieldBackColor = e.currentTarget.value;
        updateShieldModalVisual(selectedShield, false);
      };
      document
        .querySelector("#selectedBackColor")
        .addEventListener("change", handleBackColor);
      eventListeners.push({
        element: document.querySelector("#selectedBackColor"),
        handler: handleBackColor,
      });

      const handleBorderRadius = (e) => {
        selectedShield.shieldBorderRadius = parseInt(e.currentTarget.value);
        updateShieldModalVisual(selectedShield, false);
      };
      document
        .querySelector("#selectedBackRoudness")
        .addEventListener("change", handleBorderRadius);
      eventListeners.push({
        element: document.querySelector("#selectedBackRoudness"),
        handler: handleBorderRadius,
      });

      const handleShieldBackCheckbox = (e) => {
        selectedShield.shieldBacks = e.currentTarget.checked;
        updateShieldModalVisual(selectedShield, false);
      };
      document
        .querySelector("#selectedShieldBacks")
        .addEventListener("change", handleShieldBackCheckbox);
      eventListeners.push({
        element: document.querySelector("#selectedShieldBacks"),
        handler: handleShieldBackCheckbox,
      });

      /*
      window.customShields.loadSavedShields((shield) => {
        selectedShield.shieldType = "custom";
        selectedShield.shieldName = shield.fileName;
        selectedShield.imageType = "data";
        selectedShield.imageData = shield.data;
        updateShieldModalVisual(selectedShield, true);
      });
      */

      document.querySelector("#setShield").addEventListener("click", () => {
        holder.style.display = "none";
        modal.style.display = "none";
        modal.close();

        // Cleanup event listeners
        for (const e of eventListeners) {
          e.element.removeEventListener("click", e.handler);
        }
        eventListeners.length = 0;

        if (returnMethod) returnMethod(selectedShield);
        resolve(selectedShield);
      });
    });
  };

  const zoom = (val) => {
    zoomLevel = Math.min(Math.max(zoomLevel + val, 0), 5);
    document
      .querySelector("#smRender")
      .style.setProperty("--zoomLevel", zoomLevel * 100 + "%");
    document
      .querySelector("#smRender")
      .style.setProperty("--zoomLevelDec", zoomLevel);
    document.querySelector("#zoomLevel").textContent =
      Math.floor(zoomLevel * 100) + "%";
    App.recheckWidth();
  };

  return {
    init: initialize,
    readForm,
    updateForm,
    updateShieldSubform,
    zoom,
  };
})();
