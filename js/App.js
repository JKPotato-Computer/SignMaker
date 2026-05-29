// Constants
const FHWA_BASELINE_OFFSET_VAR = "var(--fhwaBaselineShift)";
const FHWA_EXIT_TAB_FONT_SCALE = 1.5;

const App = (function () {
  let post = {};
  let currentlySelectedPanelIndex = -1;
  let currentlySelectedSubPanelIndex = 0;

  let currentlySelectedExitTabIndex = 0;
  let currentlySelectedNestedExitTabIndex = -1;

  let currentlySelectedRowIndex = 0,
    currentlySelectedBlockIndex = 0;

  let currentlySelectedShieldGroupId = 0;
  let currentlySelectedShieldIndex = 0;

  // Acessor Methods
  const getCurrentPanel = () => {
    return post.panels[currentlySelectedPanelIndex];
  };

  const getCurrentSubPanel = () => {
    return getCurrentPanel().sign.subPanels[currentlySelectedSubPanelIndex];
  };

  const getCurrentBlockRows = () => {
    return getCurrentSubPanel().blockElements.rows[currentlySelectedRowIndex];
  };

  const getCurrentBlockElem = () => {
    return getCurrentBlockRows()[currentlySelectedBlockIndex];
  };

  const clamp = (number, min, max) => Math.max(min, Math.min(number, max));

  const applyHighwayGothicStyling = (element, fontFamily = "Series E") => {
    if (!element) {
      return;
    }
    element.style.fontFamily = fontFamily;
    element.style.setProperty("--fhwaBaselineOffset", FHWA_BASELINE_OFFSET_VAR);
  };

  const applyPanelBorderGradient = (signElmt) => {
    if (typeof window === "undefined" || !signElmt || !signElmt.isConnected) {
      return;
    }

    const computed = window.getComputedStyle(signElmt);
    const defaultBorderColor =
      computed.borderTopColor ||
      computed.borderColor ||
      (lib.colors && lib.colors.White) ||
      "rgb(255, 255, 255)";
    const borderWidth = parseFloat(computed.borderTopWidth) || 0;
    const fillColor =
      computed.backgroundColor &&
      computed.backgroundColor !== "rgba(0, 0, 0, 0)"
        ? computed.backgroundColor
        : "transparent";

    const clearDynamicBorder = () => {
      signElmt.style.removeProperty("backgroundImage");
      signElmt.style.removeProperty("backgroundOrigin");
      signElmt.style.removeProperty("backgroundClip");
      signElmt.style.removeProperty("backgroundRepeat");
      signElmt.style.removeProperty("backgroundPosition");
      signElmt.style.removeProperty("borderColor");
    };

    const fullBleedRows = signElmt.querySelectorAll(
      ".blockElementRow[data-full-bleed-border-color]",
    );

    if (!fullBleedRows.length) {
      clearDynamicBorder();
      return;
    }

    const signRect = signElmt.getBoundingClientRect();
    const signHeight = signRect.height;
    if (!signHeight) {
      clearDynamicBorder();
      return;
    }

    const segments = [];
    for (const rowEl of fullBleedRows) {
      const color = rowEl.dataset.fullBleedBorderColor;
      if (!color) {
        continue;
      }

      const rowRect = rowEl.getBoundingClientRect();
      let start = rowRect.top - signRect.top;
      let end = rowRect.bottom - signRect.top;
      if (end <= start) {
        continue;
      }

      const edgeThreshold = borderWidth + 0.5;
      if (start <= edgeThreshold) {
        start = 0;
      }
      if (signHeight - end <= edgeThreshold) {
        end = signHeight;
      }

      const startPct = Math.max(0, Math.min(100, (start / signHeight) * 100));
      const endPct = Math.max(0, Math.min(100, (end / signHeight) * 100));
      if (endPct <= startPct) {
        continue;
      }

      segments.push({ start: startPct, end: endPct, color });
    }

    if (!segments.length) {
      clearDynamicBorder();
      return;
    }

    segments.sort((a, b) => a.start - b.start);

    const gradientStops = [];
    let cursor = 0;
    const addSegment = (color, start, end) => {
      const startClamped = Math.max(0, Math.min(100, start));
      const endClamped = Math.max(0, Math.min(100, end));
      if (endClamped <= startClamped) {
        return;
      }
      const startLabel = startClamped.toFixed(4);
      const endLabel = endClamped.toFixed(4);
      gradientStops.push(`${color} ${startLabel}%`, `${color} ${endLabel}%`);
    };

    for (const segment of segments) {
      if (segment.start > cursor) {
        addSegment(defaultBorderColor, cursor, segment.start);
      }
      const segStart = Math.max(cursor, segment.start);
      addSegment(segment.color, segStart, segment.end);
      cursor = Math.max(cursor, segment.end);
    }

    if (cursor < 100) {
      addSegment(defaultBorderColor, cursor, 100);
    }

    const gradient = `linear-gradient(to bottom, ${gradientStops.join(", ")})`;
    signElmt.style.borderColor = "transparent";
    signElmt.style.backgroundImage = `linear-gradient(${fillColor}, ${fillColor}), ${gradient}`;
    signElmt.style.backgroundOrigin = "padding-box, border-box";
    signElmt.style.backgroundClip = "padding-box, border-box";
    signElmt.style.backgroundRepeat = "no-repeat, no-repeat";
    signElmt.style.backgroundPosition = "0 0, 0 0";
  };

  const schedulePanelBorderGradientUpdate = (panelContainerElmt) => {
    if (typeof window === "undefined" || !panelContainerElmt) {
      return;
    }

    const update = () => {
      const signs = panelContainerElmt.querySelectorAll(".sign");
      for (const signElmt of signs) {
        applyPanelBorderGradient(signElmt);
      }
    };

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(update);
    } else {
      update();
    }
  };

  const init = async function () {
    post = new Post(Post.prototype.polePositions[0]);
    formHandler.init(exposeToFormHandler);

    window.customShields = new CustomShields();
    await window.customShields.initialized;

    newPanel();
  };

  // Panels
  const newPanel = function () {
    post.newPanel();
    currentlySelectedPanelIndex = post.panels.length - 1;
    formHandler.updateForm();
    redraw();
  };

  const duplicatePanel = function () {
    post.duplicatePanel(currentlySelectedPanelIndex);
    currentlySelectedPanelIndex++;
    formHandler.updateForm();
    redraw();
  };

  const deletePanel = function () {
    post.deletePanel(currentlySelectedPanelIndex);
    if (currentlySelectedPanelIndex > 0) {
      currentlySelectedPanelIndex--;
    }
    if (post.panels.length == 0) {
      newPanel();
    } else {
      formHandler.updateForm();
      redraw();
    }
  };

  const shiftLeft = function () {
    currentlySelectedPanelIndex = post.shiftLeft(currentlySelectedPanelIndex);
    redraw();
  };

  const shiftRight = function () {
    currentlySelectedPanelIndex = post.shiftRight(currentlySelectedPanelIndex);
    redraw();
  };

  const movePanel = function (toIndex) {
    if ( post.panels.length < 2) {
      return;
    }

    let normalizedTo = clamp(toIndex, 0, post.panels.length);

    const selectedPanelRef = post.panels[currentlySelectedPanelIndex];

    let resultingIndex = normalizedFrom;
    if (typeof post.movePanel === "function") {
      resultingIndex = post.movePanel(normalizedFrom, normalizedTo);
    } else {
      const panels = post.panels;
      const [panel] = panels.splice(normalizedFrom, 1);
      if (!panel) {
        return;
      }
      if (normalizedTo > normalizedFrom) {
        normalizedTo--;
      }
      panels.splice(normalizedTo, 0, panel);
      resultingIndex = normalizedTo;
    }

    if (selectedPanelRef) {
      const updatedIndex = post.panels.indexOf(selectedPanelRef);
      if (updatedIndex !== -1) {
        currentlySelectedPanelIndex = updatedIndex;
      } else {
        currentlySelectedPanelIndex = clamp(
          currentlySelectedPanelIndex,
          0,
          post.panels.length - 1,
        );
      }
    } else {
      currentlySelectedPanelIndex = clamp(
        currentlySelectedPanelIndex,
        0,
        post.panels.length - 1,
      );
    }

    formHandler.updateForm();
    redraw();
  };

  // Set the current panel based off parameter number, within the correct range (0 < # of panels - 1)
  const changeEditingPanel = function (panelNumber) {
    currentlySelectedPanelIndex = clamp(panelNumber, 0, post.panels.length - 1);
    currentlySelectedSubPanelIndex = 0;
    formHandler.updateForm();
  };

  const addSubPanel = function () {
    const sign = getCurrentPanel().sign;
    sign.newSubPanel();
    currentlySelectedSubPanelIndex++;
    formHandler.updateForm();
    redraw();
  };

  const removeSubPanel = function () {
    const sign = getCurrentPanel().sign;
    if (sign.subPanels.length > 1) {
      sign.deleteSubPanel(sign.subPanels.length - 2);
      currentlySelectedSubPanelIndex--;
      formHandler.updateForm();
      redraw();
    }
  };

  // Duplicate the current subpanel, set the editing to that subpanel, update the form, and redraw.
  const duplicateSubPanel = function () {
    const sign = getCurrentPanel().sign;
    sign.duplicateSubPanel(currentlySelectedSubPanelIndex);
    currentlySelectedSubPanelIndex++;
    formHandler.updateForm();
    redraw();
  };

  // Set the current editing (SUB)panel based off paramter number, within the correct range (0 < # of panels - 1)
  const changeEditingSubPanel = function (subPanelNumber) {
    currentlySelectedSubPanelIndex = clamp(
      subPanelNumber,
      0,
      getCurrentPanel().sign.subPanels.length - 1,
    );
    formHandler.updateForm();
  };

  // Create a new exit tab, update the form, and redraw.
  const newExitTab = function () {
    const panel = getCurrentPanel();
    panel.newExitTab();
    currentlySelectedExitTabIndex = panel.exitTabs.length - 1;
    currentlySelectedNestedExitTabIndex = -1;
    formHandler.updateForm();
    redraw();
  };

  // Create a new nested exit tab within the parent exit tab.
  const newNestExitTab = function () {
    const panel = getCurrentPanel();
    if (!panel || !panel.exitTabs.length) {
      return;
    }
    const exitTab = panel.exitTabs[currentlySelectedExitTabIndex];
    if (!exitTab) {
      return;
    }
    const nested = exitTab.nestExitTab();
    if (!nested) {
      return;
    }
    currentlySelectedNestedExitTabIndex = exitTab.nestedExitTabs.length - 1;
    formHandler.updateForm();
    redraw();
  };

  // Create a duplicate of the exit tab.
  const duplicateExitTab = function (
    exitTabIndex = currentlySelectedExitTabIndex,
  ) {
    const panel = getCurrentPanel();
    if (!panel || !panel.exitTabs.length) {
      return;
    }
    exitTabIndex = clamp(exitTabIndex, 0, panel.exitTabs.length - 1);
    panel.duplicateExitTab(exitTabIndex);
    currentlySelectedExitTabIndex = clamp(
      exitTabIndex + 1,
      0,
      panel.exitTabs.length - 1,
    );
    currentlySelectedNestedExitTabIndex = -1;
    formHandler.updateForm();
    redraw();
  };

  // Delete the exit tab.
  const removeExitTab = function (
    exitTabIndex = currentlySelectedExitTabIndex,
  ) {
    const panel = getCurrentPanel();
    if (!panel || !panel.exitTabs.length) {
      return;
    }

    exitTabIndex = clamp(exitTabIndex, 0, panel.exitTabs.length - 1);
    panel.deleteExitTab(exitTabIndex);

    if (!panel.exitTabs.length) {
      panel.newExitTab();
      currentlySelectedExitTabIndex = 0;
    } else {
      currentlySelectedExitTabIndex = clamp(
        exitTabIndex,
        0,
        panel.exitTabs.length - 1,
      );
    }

    currentlySelectedNestedExitTabIndex = -1;
    formHandler.updateForm();
    redraw();
  };

  // Delete the exit tab within the parent exitTab
  const deleteNestExitTab = function (
    nestExitTabIndex = currentlySelectedNestedExitTabIndex,
  ) {
    const exitTab = getCurrentPanel().exitTabs[currentlySelectedExitTabIndex];
    if (!exitTab || !exitTab.nestedExitTabs.length) {
      return;
    }

    nestExitTabIndex = clamp(
      nestExitTabIndex,
      0,
      exitTab.nestedExitTabs.length - 1,
    );

    exitTab.deleteNestExitTab(nestExitTabIndex);

    if (exitTab.nestedExitTabs.length === 0) {
      currentlySelectedNestedExitTabIndex = -1;
    } else {
      currentlySelectedNestedExitTabIndex = Math.min(
        nestExitTabIndex,
        exitTab.nestedExitTabs.length - 1,
      );
    }

    formHandler.updateForm();
    redraw();
  };

  const moveExitTab = function (fromIndex, toIndex) {
    const panel = getCurrentPanel();
    if (!panel || !panel.exitTabs || panel.exitTabs.length < 2) {
      return;
    }

    const exitTabs = panel.exitTabs;
    const maxIndex = exitTabs.length - 1;
    const normalizedFrom = clamp(fromIndex, 0, maxIndex);
    let normalizedTo = clamp(toIndex, 0, exitTabs.length);

    if (
      normalizedTo === normalizedFrom ||
      normalizedTo === normalizedFrom + 1
    ) {
      return;
    }

    const [movedExitTab] = exitTabs.splice(normalizedFrom, 1);
    if (!movedExitTab) {
      return;
    }

    if (normalizedTo > normalizedFrom) {
      normalizedTo--;
    }

    normalizedTo = clamp(normalizedTo, 0, exitTabs.length);
    exitTabs.splice(normalizedTo, 0, movedExitTab);

    currentlySelectedExitTabIndex = normalizedTo;
    currentlySelectedNestedExitTabIndex = -1;
    formHandler.updateForm();
    redraw();
  };

  // Set the current editing exit tab based off paramter number, its child, within the correct range (0 < # of exit Tabs - 1 // Secondary: 0 < # of child exit Tabs)
  const changeEditingExitTab = function (exitTabNumber, nestedExitTabNumber) {
    currentlySelectedExitTabIndex = clamp(
      exitTabNumber,
      0,
      getCurrentPanel().exitTabs.length - 1,
    );
    currentlySelectedNestedExitTabIndex =
      nestedExitTabNumber != null
        ? clamp(
            nestedExitTabNumber,
            -1,
            getCurrentPanel().exitTabs[currentlySelectedExitTabIndex]
              .nestedExitTabs.length - 1,
          )
        : -1;
    formHandler.updateForm();
  };

  // Rows
  const newRow = (selectedBlock) => {
    const blockElems = getCurrentSubPanel().blockElements;
    currentlySelectedBlockIndex = 0;
    blockElems.addRow(++currentlySelectedRowIndex, selectedBlock);
    formHandler.updateForm();
    redraw();
  };

  const dupRow = () => {
    const blockElems = getCurrentSubPanel().blockElements;
    blockElems.duplicateRow(currentlySelectedRowIndex++);
    formHandler.updateForm();
    redraw();
  };

  const delRow = () => {
    const blockElems = getCurrentSubPanel().blockElements;
    if (blockElems.rows.length == 1) {
      return;
    }

    blockElems.deleteRow(currentlySelectedRowIndex);
    currentlySelectedRowIndex = Math.max(currentlySelectedRowIndex - 1, 0);

    formHandler.updateForm();
    redraw();
  };

  const setSelectedRow = (row) => {
    currentlySelectedRowIndex = clamp(
      row,
      0,
      getCurrentSubPanel().blockElements.rows.length - 1,
    );
    formHandler.updateForm();
  };

  const newControlElem = (selectedElem) => {
    const blockElems = getCurrentSubPanel().blockElements;
    blockElems.addElement(
      Control.prototype.blockToClassElems[selectedElem],
      {},
      currentlySelectedRowIndex,
      ++currentlySelectedBlockIndex,
    );
    formHandler.updateForm();
    redraw();
  };

  const delControlElem = () => {
    const blockElems = getCurrentSubPanel().blockElements;
    if (
      blockElems.removeElement(
        currentlySelectedRowIndex,
        currentlySelectedBlockIndex,
      )
    ) {
      currentlySelectedRowIndex--;
      currentlySelectedBlockIndex = getCurrentBlockRows().length - 1;
    } else {
      currentlySelectedBlockIndex--;
    }
    formHandler.updateForm();
    redraw();
  };

  const setSelectedControlElem = (block) => {
    currentlySelectedBlockIndex = clamp(
      block,
      0,
      getCurrentBlockRows().length - 1,
    );
    formHandler.updateForm();
  };

  const newShieldGroup = () => {
    const panel = getCurrentPanel();
    const sign = panel.sign.subPanels[currentlySelectedSubPanelIndex];

    const firstRow = sign.blockElements.rows[0];
    const hasOnlyShieldGroups =
      firstRow &&
      firstRow.every(
        (block) => block.constructor.name === "ShieldGroupElement",
      );

    if (!firstRow || !hasOnlyShieldGroups) {
      const blockElems = getCurrentSubPanel().blockElements;
      currentlySelectedBlockIndex = 0;
      blockElems.addRow(0, "ShieldGroupElement");
    } else if (firstRow) {
      getCurrentSubPanel().blockElements.addElement(
        Control.prototype.blockToClassElems["ShieldGroupElement"],
        {},
        0,
        firstRow.length + 1,
      );
      currentlySelectedBlockIndex = firstRow.length;
    }
    formHandler.updateForm();
    redraw();
  };

  const setSelectedShieldId = () => {
    const currentlySelectedElement = getCurrentBlockElem();
    if (currentlySelectedElement.constructor.name !== "ShieldGroupElement") {
      return;
    }

    const blockElems = getCurrentSubPanel().blockElements;
    let id = 0;
    for (let i = 0; i < blockElems.rows.length; i++) {
      for (let j = 0; j < blockElems.rows[i].length; j++) {
        const block = blockElems.rows[i][j];
        if (block.constructor.name === "ShieldGroupElement" && block == currentlySelectedElement) {
          currentlySelectedShieldIndex = id;
          break;
        }
        id++;
      }
    }
  }

  // Add a new shield to the current panel's sign, update the shield subform, and redraw the sign.
  const newShield = function () {
    if (selectedShieldGroup) {
      selectedShieldGroup.newShield();
      formHandler.updateShieldSubform();
      redraw();
    }
  };

  // Delete the current shield, update the shield subform, and redraw the sign
  const deleteShield = function (shieldIndex) {
    if (selectedShieldGroup && shieldIndex >= 0) {
      selectedShieldGroup.deleteShield(shieldIndex);
      formHandler.updateShieldSubform();
      redraw();
    }
  };

  // Duplicate a shield
  const duplicateShield = function (shieldIndex) {
    if (selectedShieldGroup && shieldIndex >= 0) {
      selectedShieldGroup.duplicateShield(shieldIndex);
      formHandler.updateShieldSubform();
      redraw();
    }
  };

  const resetPadding = function () {
    getCurrentPanel().sign.padding = "0.3rem 0.75rem 0.3rem 0.75rem";

    document.getElementById("paddingTop").value = 0.3;
    document.getElementById("paddingRight").value = 0.75;
    document.getElementById("paddingBottom").value = 0.3;
    document.getElementById("paddingLeft").value = 0.75;

    formHandler.updateForm();
    redraw();
  };

  /**
   * Redraw the panels on the post.
   */

  const redraw = function () {
    const panelContainerElmt = document.getElementById("panelContainer");

    post.renderPost(
      document.querySelector("#postContainer"),
      document.querySelector("#panelContainer"),
      document.querySelectorAll(".post"),
    );

    lib.clearChildren(panelContainerElmt);
    panelContainerElmt.style.setProperty(
      "--panelSpacing",
      post.panelSpacing + "rem",
    );

    let index = -1;
    let firstExitTab = null;

    for (const panel of post.panels) {
      index++;

      const panelElmt = document.createElement("div");
      panelElmt.className = `panel ${panel.color.toLowerCase()} ${panel.corner.toLowerCase()}`;
      panelElmt.style.setProperty(
        "--signBorderRadius",
        panel.borderRadius + "rem",
      );
      panelElmt.id = "panel" + index;
      panelContainerElmt.appendChild(panelElmt);

      for (
        let exitTabIndex = panel.exitTabs.length - 1;
        exitTabIndex > -1;
        exitTabIndex--
      ) {
        let exitTab = panel.exitTabs[exitTabIndex];
        const container = exitTab.renderTab(panelElmt, {
          post,
          panel,
          applyHighwayGothicStyling,
          FHWA_EXIT_TAB_FONT_SCALE,
        });

        if (exitTabIndex == 0) {
          firstExitTab = container;
        }
      }

      const signCont = document.createElement("div");
      signCont.className = `signContainer ${panel.exitTabs[0].width.toLowerCase()}`;
      panelElmt.appendChild(signCont);

      const signElmt = document.createElement("div");
      signElmt.className = `sign ${panel.exitTabs[0].width.toLowerCase()}`;

      if (panel.exitTabs.length > 0 && panel.exitTabs[0].number != null) {
        signElmt.className += " tabVisible";
      }

      signCont.appendChild(signElmt);

      const signHolderElmt = document.createElement("div");
      signHolderElmt.className = `signHolder`;
      signElmt.appendChild(signHolderElmt);

      const guideArrowsElmt = document.createElement("div");
      guideArrowsElmt.className = `guideArrows ${panel.sign.guideArrow
        .replace("/", "-")
        .replace(" ", "_")
        .toLowerCase()} ${panel.sign.arrowPosition.toLowerCase()}`;
      signCont.appendChild(guideArrowsElmt);

      const otherSymbolsElmt = document.createElement("div");
      otherSymbolsElmt.className = `otherSymbols ${panel.sign.otherSymbol
        .replace("/", "-")
        .replace(" ", "_")
        .toLowerCase()}`;
      guideArrowsElmt.appendChild(otherSymbolsElmt);

      const oSNumElmt = document.createElement("div");
      oSNumElmt.className = `oSNum`;
      otherSymbolsElmt.appendChild(oSNumElmt);

      const arrowContElmt = document.createElement("div");
      arrowContElmt.className = `arrowContainer`;
      guideArrowsElmt.appendChild(arrowContElmt);

      const sideLeftArrowElmt = document.createElement("img");
      sideLeftArrowElmt.className = "sideLeftArrow";
      sideLeftArrowElmt.src = "assets/arrows/A-4.svg";
      signHolderElmt.appendChild(sideLeftArrowElmt);

      // subpanels

      for (
        let subPanelIndex = 0;
        subPanelIndex < panel.sign.subPanels.length;
        subPanelIndex++
      ) {
        const subPanel = panel.sign.subPanels[subPanelIndex];

        if (subPanelIndex > 0) {
          const subPanel = panel.sign.subPanels[subPanelIndex];
          const subDivider = document.createElement("div");
          subDivider.className = "subDivider";
          if (subPanel.height) {
            subDivider.style.height = subPanel.height;
          } else {
            subDivider.style.removeProperty("height");
          }
          subDivider.style.alignSelf = "stretch";
          signHolderElmt.appendChild(subDivider);
        }

        const new_subPanel = document.createElement("div");
        new_subPanel.className = "subPanelDisplay";
        signHolderElmt.appendChild(new_subPanel);

        const signContentContainerElmt = document.createElement("div");
        signContentContainerElmt.className = `signContentContainer shieldPosition${panel.sign.shieldPosition}`;
        signHolderElmt.appendChild(signContentContainerElmt);

        const shieldsContainerElmt = document.createElement("div");
        shieldsContainerElmt.className = `shieldsContainer ${
          panel.sign.shieldBacks ? "shieldBacks" : ""
        }`;
        signContentContainerElmt.appendChild(shieldsContainerElmt);

        const blockElement = subPanel.blockElements.createElement(
          panel,
          subPanel,
        );
        signContentContainerElmt.appendChild(blockElement);

        // sign
        signContentContainerElmt.style.padding = panel.sign.padding;
      }

      const sideRightArrowElmt = document.createElement("img");
      sideRightArrowElmt.className = "sideRightArrow";
      sideRightArrowElmt.src = "assets/arrows/A-1.svg";
      signHolderElmt.appendChild(sideRightArrowElmt);

      // Guide arrows

      const ExitKeys = ["EA", "EB", "EC"];
      const MainKeys = ["A", "B", "C", "D", "E"];
      let path;

      const createArrowElmt = function (key, dir, name, extra) {
        if (dir == "MainArrows!ExitOnly") {
          key = key.split("/")[1];
        } else {
          key = key.split("/")[0];
        }

        console.log(key);

        if (
          ExitKeys.includes(key.split("-")[0]) ||
          MainKeys.includes(key.split("-")[0])
        ) {
          const downArrowElmt = document.createElement("img");
          downArrowElmt.className = name || "exitOnlyArrow ";

          if (extra) {
            downArrowElmt.className += " " + extra;
          }

          if (ExitKeys.includes(key.split("-")[0])) {
            key = key.split("-")[0].split("")[1] + "-" + key.split("-")[1];
            downArrowElmt.style.filter = "invert(1)";
          }

          const shouldUseCanadianDownArrow =
            panel.sign.useCanadianDownArrows && key === "C-1";

          if (shouldUseCanadianDownArrow) {
            downArrowElmt.src = "assets/arrowBlocks/DOWN_CA.svg";
            downArrowElmt.classList.add("canadianDownArrow");
          } else {
            downArrowElmt.src = "assets/arrows/" + key + ".svg";
          }

          return downArrowElmt;
        }
      };

      if (
        panel.sign.arrowPosition == "Left" &&
        panel.sign.guideArrow != "Exit Only" &&
        panel.sign.guideArrow != "Side Left" &&
        panel.sign.guideArrow != "Side Right" &&
        panel.sign.guideArrow != "Half Exit Only"
      ) {
        arrowContElmt.style.justifyContent = "left";
      } else if (panel.sign.arrowPosition == "Middle") {
        arrowContElmt.style.cssFloat = "none";
      } else if (
        panel.sign.arrowPosition == "Right" &&
        panel.sign.guideArrow != "Exit Only" &&
        panel.sign.guideArrow != "Side Left" &&
        panel.sign.guideArrow != "Side Right" &&
        panel.sign.guideArrow != "Half Exit Only"
      ) {
        arrowContElmt.style.justifyContent = "right";
      }

      if (panel.sign.guideArrow.includes("Exit Only")) {
        const borderWidthValue = "0.2rem";
        const exitOnlyBorderModes = Sign.prototype.exitOnlyBorderModes;
        const resolvedExitOnlyBorderMode = exitOnlyBorderModes.includes(
          panel.sign.exitOnlyBorderMode,
        )
          ? panel.sign.exitOnlyBorderMode
          : exitOnlyBorderModes[0];
        const hideExitOnlyArrows = panel.sign.hideExitArrow === true;
        arrowContElmt.classList.toggle(
          "hideExitOnlyArrows",
          hideExitOnlyArrows,
        );
        if (
          !post.secondExitOnly &&
          panel.sign.guideArrow != "Split Exit Only" &&
          panel.sign.guideArrow != "Half Exit Only"
        ) {
          guideArrowsElmt.style.padding = panel.sign.exitOnlyPadding + "rem";
        }

        if (panel.sign.guideArrow == "Exit Only" && !post.secondExitOnly) {
          guideArrowsElmt.style.borderTopWidth =
            resolvedExitOnlyBorderMode === "edge" ? borderWidthValue : "0";
        }

        if (panel.sign.guideArrow == "Half Exit Only") {
          const secondaryContainer = document.createElement("div");
          secondaryContainer.className = `arrowContainer ${panel.sign.guideArrow
            .replace("/", "-")
            .replace(" ", "_")
            .toLowerCase()} ${panel.sign.arrowPosition.toLowerCase()}`;

          guideArrowsElmt.className += post.secondExitOnly
            ? " new2"
            : " default";
          guideArrowsElmt.classList.remove("halfExitNoBorder");

          if (!post.secondExitOnly) {
            const borderMode = resolvedExitOnlyBorderMode;
            const arrowPos = panel.sign.arrowPosition.toLowerCase();
            const overlap = `-${borderWidthValue}`;
            const touchesLeftEdge =
              arrowPos === "left" || arrowPos === "middle";
            const touchesRightEdge =
              arrowPos === "right" || arrowPos === "middle";

            secondaryContainer.style.backgroundColor = "var(--yellow)";
            secondaryContainer.style.color = "var(--black)";
            secondaryContainer.style.borderStyle = "solid";
            secondaryContainer.style.borderColor = "var(--black)";
            secondaryContainer.style.borderTopWidth = "0";
            secondaryContainer.style.borderRightWidth = "0";
            secondaryContainer.style.borderBottomWidth = "0";
            secondaryContainer.style.borderLeftWidth = "0";
            secondaryContainer.style.marginBottom = "0";
            secondaryContainer.style.marginLeft = "0";
            secondaryContainer.style.marginRight = "0";

            if (borderMode !== "none") {
              const edges = {
                top: borderMode === "edge",
                right: borderMode === "edge",
                bottom: true,
                left: borderMode === "edge",
              };

              if (borderMode === "white-edge") {
                edges.top = false;
                edges.left = touchesLeftEdge;
                edges.right = touchesRightEdge;
              }

              secondaryContainer.style.borderTopWidth = edges.top
                ? borderWidthValue
                : "0";
              secondaryContainer.style.borderRightWidth = edges.right
                ? borderWidthValue
                : "0";
              secondaryContainer.style.borderBottomWidth = edges.bottom
                ? borderWidthValue
                : "0";
              secondaryContainer.style.borderLeftWidth = edges.left
                ? borderWidthValue
                : "0";

              if (edges.bottom) {
                secondaryContainer.style.marginBottom = overlap;
              }
              if (edges.left) {
                secondaryContainer.style.marginLeft = overlap;
              }
              if (edges.right) {
                secondaryContainer.style.marginRight = overlap;
              }
            } else {
              secondaryContainer.style.borderStyle = "none";
              const sideOverlap = "-0.02rem";
              if (touchesLeftEdge) {
                secondaryContainer.style.marginLeft = sideOverlap;
              }
              if (touchesRightEdge) {
                secondaryContainer.style.marginRight = sideOverlap;
              }
              secondaryContainer.style.marginBottom = overlap;
            }

            const leftRadius =
              touchesLeftEdge && borderMode === "none" ? "0.85rem" : "0.75rem";
            const rightRadius =
              touchesRightEdge && borderMode === "none" ? "0.85rem" : "0.75rem";
            secondaryContainer.style.borderBottomLeftRadius = touchesLeftEdge
              ? leftRadius
              : "0";
            secondaryContainer.style.borderBottomRightRadius = touchesRightEdge
              ? rightRadius
              : "0";

            if (borderMode === "none") {
              secondaryContainer.style.zIndex = "0";
            } else {
              secondaryContainer.style.removeProperty("z-index");
            }
          }

          guideArrowsElmt.classList.remove("halfExitNoBorder");
          path = secondaryContainer;

          const arrow = createArrowElmt(
            panel.sign.exitguideArrows.split(":")[1],
            "MainArrows!ExitOnly",
            "halfarrow",
            panel.sign.arrowPosition.toLowerCase(),
          );

          if (panel.sign.arrowPosition.toLowerCase() == "left") {
            arrowContElmt.appendChild(secondaryContainer);
            arrowContElmt.appendChild(arrow);

            if (panel.sign.guideArrowLanes > 1) {
              let marginLeft = 4;

              for (let i = 1; i <= panel.sign.guideArrowLanes - 2; i++) {
                if (i % 2 == 0) {
                  marginLeft += 12;
                } else {
                  marginLeft += 4;
                }
              }
            }
          } else {
            arrowContElmt.appendChild(arrow);
            arrowContElmt.appendChild(secondaryContainer);

            if (panel.sign.guideArrowLanes > 1) {
              let marginLeft = 11;

              for (let i = 1; i <= panel.sign.guideArrowLanes - 2; i++) {
                if (i % 2 == 0) {
                  marginLeft += 12;
                } else {
                  marginLeft += 4;
                }
              }
            }
          }

          path.style.padding = panel.sign.exitOnlyPadding + "rem";
        } else {
          path = arrowContElmt;
        }
      }

      if ("Side Left" == panel.sign.guideArrow) {
        sideLeftArrowElmt.style.display = "block";
      } else if ("Side Right" == panel.sign.guideArrow) {
        sideRightArrowElmt.style.display = "block";
      } else if ("None" != panel.sign.guideArrow) {
        signElmt.style.borderBottomLeftRadius = "0";
        signElmt.style.borderBottomRightRadius = "0";
        signElmt.style.borderBottomWidth = "0";
        signElmt.style.width = "100%";
        guideArrowsElmt.style.display = "block";
        guideArrowsElmt.style.visibility = "visible";
        if (
          "Exit Only" == panel.sign.guideArrow ||
          "Split Exit Only" == panel.sign.guideArrow ||
          "Half Exit Only" == panel.sign.guideArrow
        ) {
          if (
            post.secondExitOnly == true ||
            panel.sign.guideArrow == "Half Exit Only"
          ) {
            if (panel.sign.guideArrow == "Exit Only") {
              guideArrowsElmt.className += " new";
              arrowContElmt.className += " new";
            }
            if (panel.sign.guideArrow == "Half Exit Only") {
              path.className += " new2";
              arrowContElmt.className += " new2";
              const arrowPositionSetting =
                typeof panel.sign.arrowPosition === "string"
                  ? panel.sign.arrowPosition.toLowerCase()
                  : "middle";
              let justifyContent = "center";
              if (arrowPositionSetting === "left") {
                justifyContent = "flex-start";
              } else if (arrowPositionSetting === "right") {
                justifyContent = "flex-end";
              }
              arrowContElmt.style.justifyContent = justifyContent;
              arrowContElmt.style.gap = "5rem";
              arrowContElmt.style.width = "100%";
            }
            guideArrowsElmt.style.display = "flex";
          }

          if (post.secondExitOnly && panel.sign.guideArrow == "Exit Only") {
            console.log("hi");
            path.style.padding = panel.sign.exitOnlyPadding + "rem";
          }

          /*

						if (panel.sign.advisoryMessage) {
							actionMessageElmt.style.fontFamily = "Series E";
						}
					
					*/

          // Interlase arrows and the words EXIT and ONLY, ensuring
          //   EXIT ONLY is centered between all the arrows.
          if (
            panel.sign.guideArrowLanes == 0 &&
            panel.sign.advisoryMessage == true
          ) {
            const actionMessage = document.createElement("span");
            actionMessage.className = "exitOnlyText";
            actionMessage.appendChild(
              document.createTextNode(panel.sign.advisoryText),
            );
            path.appendChild(actionMessage);
          } else {
            const resolveExitOnlyText = (text, fallback) =>
              typeof text === "string" ? text : fallback;
            const exitOnlyLabelLeft = resolveExitOnlyText(
              panel.sign.exitOnlyLeftText,
              "EXIT",
            ).trim();
            const exitOnlyLabelRight = resolveExitOnlyText(
              panel.sign.exitOnlyRightText,
              "ONLY",
            ).trim();
            const exitOnlyLabelFull = [exitOnlyLabelLeft, exitOnlyLabelRight]
              .filter((text) => text && text.length > 0)
              .join(" ")
              .trim();
            const isSplitExitOnly = panel.sign.guideArrow == "Split Exit Only";
            const shouldRenderLabel = (text) =>
              !(
                panel.sign.showExitOnly == false &&
                isSplitExitOnly &&
                (!text || text.length === 0)
              );
            for (
              let arrowIndex = 0, length = panel.sign.guideArrowLanes;
              arrowIndex < length;
              arrowIndex++
            ) {
              // Evens
              if (length % 2 == 0) {
                if (arrowIndex == Math.floor(length / 2)) {
                  if (shouldRenderLabel(exitOnlyLabelFull)) {
                    const textExitOnlySpanElmt = document.createElement("span");
                    if (panel.sign.showExitOnly == false) {
                      textExitOnlySpanElmt.appendChild(
                        document.createTextNode(exitOnlyLabelFull),
                      );

                      let bonus = "";

                      if (panel.sign.guideArrow == "Split Exit Only") {
                        bonus = " yellowElmt";
                      }

                      textExitOnlySpanElmt.className = "exitOnlyText" + bonus;
                    } else {
                      textExitOnlySpanElmt.appendChild(
                        document.createTextNode("⠀⠀⠀⠀ ⠀⠀⠀⠀"),
                      );
                      textExitOnlySpanElmt.className = "exitOnlyText";
                    }
                    path.appendChild(textExitOnlySpanElmt);
                  }

                  if (panel.sign.guideArrow == "Split Exit Only") {
                    path.appendChild(
                      createArrowElmt(
                        panel.sign.exitguideArrows.split(":")[1],
                        "MainArrows!ExitOnly",
                      ),
                    );
                  } else {
                    path.appendChild(
                      createArrowElmt(panel.sign.exitguideArrows.split(":")[1]),
                    );
                  }

                  if (arrowIndex + 1 < length && length != 2) {
                    const space = document.createElement("span");
                    space.className = "exitOnlySpace";
                    path.appendChild(space);
                  }
                } else {
                  if (panel.sign.guideArrow == "Split Exit Only") {
                    path.appendChild(
                      createArrowElmt(
                        panel.sign.exitguideArrows.split(":")[1],
                        "MainArrows!ExitOnly",
                      ),
                    );
                  } else {
                    path.appendChild(
                      createArrowElmt(panel.sign.exitguideArrows.split(":")[1]),
                    );
                  }

                  if (
                    arrowIndex + 1 < length &&
                    arrowIndex + 1 != Math.ceil(length / 2) &&
                    length != 2
                  ) {
                    const space = document.createElement("span");
                    space.className = "exitOnlySpace";
                    path.appendChild(space);
                  }
                }
              } else {
                // Odds
                if (arrowIndex == Math.floor(length / 2)) {
                  if (shouldRenderLabel(exitOnlyLabelLeft)) {
                    const textExitSpanElmt = document.createElement("span");
                    if (panel.sign.showExitOnly == false) {
                      textExitSpanElmt.appendChild(
                        document.createTextNode(exitOnlyLabelLeft),
                      );

                      let bonus = "";

                      if (panel.sign.guideArrow == "Split Exit Only") {
                        bonus = " yellowElmt";
                      }

                      textExitSpanElmt.className = "exitOnlyText" + bonus;
                    } else {
                      textExitSpanElmt.appendChild(
                        document.createTextNode("⠀⠀⠀⠀"),
                      );
                      textExitSpanElmt.className = "exitOnlyText";
                    }

                    path.appendChild(textExitSpanElmt);
                  }

                  if (panel.sign.guideArrow == "Split Exit Only") {
                    path.appendChild(
                      createArrowElmt(
                        panel.sign.exitguideArrows.split(":")[1],
                        "MainArrows!ExitOnly",
                      ),
                    );
                  } else {
                    path.appendChild(
                      createArrowElmt(panel.sign.exitguideArrows.split(":")[1]),
                    );
                  }

                  if (shouldRenderLabel(exitOnlyLabelRight)) {
                    const textOnlySpanElmt = document.createElement("span");
                    if (panel.sign.showExitOnly == false) {
                      textOnlySpanElmt.appendChild(
                        document.createTextNode(exitOnlyLabelRight),
                      );

                      let bonus = "";

                      if (panel.sign.guideArrow == "Split Exit Only") {
                        bonus = " yellowElmt";
                      }

                      textOnlySpanElmt.className = "exitOnlyText" + bonus;
                    } else {
                      textOnlySpanElmt.appendChild(
                        document.createTextNode("⠀⠀⠀⠀"),
                      );
                      textOnlySpanElmt.className = "exitOnlyText";
                    }
                    path.appendChild(textOnlySpanElmt);
                  }
                } else if (arrowIndex == Math.ceil(length / 2)) {
                  if (panel.sign.guideArrow == "Split Exit Only") {
                    path.appendChild(
                      createArrowElmt(
                        panel.sign.exitguideArrows.split(":")[1],
                        "MainArrows!ExitOnly",
                      ),
                    );
                  } else {
                    path.appendChild(
                      createArrowElmt(panel.sign.exitguideArrows.split(":")[1]),
                    );
                  }

                  if (
                    arrowIndex + 1 < length &&
                    arrowIndex + 1 != Math.floor(length / 2) &&
                    length != 2
                  ) {
                    const space = document.createElement("span");
                    space.className = "exitOnlySpace";
                    path.appendChild(space);
                  }
                } else {
                  if (panel.sign.guideArrow == "Split Exit Only") {
                    path.appendChild(
                      createArrowElmt(
                        panel.sign.exitguideArrows.split(":")[1],
                        "MainArrows!ExitOnly",
                      ),
                    );
                  } else {
                    path.appendChild(
                      createArrowElmt(panel.sign.exitguideArrows.split(":")[1]),
                    );
                  }

                  if (
                    arrowIndex + 1 < length &&
                    arrowIndex + 1 != Math.floor(length / 2) &&
                    length != 2
                  ) {
                    const space = document.createElement("span");
                    space.className = "exitOnlySpace";
                    path.appendChild(space);
                  }
                }
              }
            }
          }
        } else {
          arrowContElmt.classList.remove("hideExitOnlyArrows");
          for (
            let arrowIndex = 0, length = panel.sign.guideArrowLanes;
            arrowIndex < length;
            arrowIndex++
          ) {
            if (arrowIndex % 2 == 0) {
              arrowContElmt.insertBefore(
                createArrowElmt(
                  panel.sign.guideArrow.split(":")[1],
                  "MainArrows",
                  "arrow",
                  panel.sign.guideArrow
                    .split(":")[0]
                    .toLowerCase()
                    .replace(/ /g, ""),
                ),
                arrowContElmt.childNodes[0],
              );
            } else {
              arrowContElmt.appendChild(
                createArrowElmt(
                  panel.sign.guideArrow.split(":")[1],
                  "MainArrows",
                  "arrow",
                  panel.sign.guideArrow.split(":")[0],
                ),
              );
            }
          }
        }
      }
      // Bottom Symbols

      if (panel.sign.oSNum != "" && panel.sign.otherSymbol != "None") {
        signElmt.style.borderBottomLeftRadius = "0";
        signElmt.style.borderBottomRightRadius = "0";
        signElmt.style.borderBottomWidth = "0";
        guideArrowsElmt.style.display = "block";
        guideArrowsElmt.style.visibility = "visible";
        oSNumElmt.style.visibility = "visible";
        oSNumElmt.className = `oSNum`;
        oSNumElmt.appendChild(document.createTextNode(panel.sign.oSNum));
        switch (panel.sign.oSNum.length) {
          case 1:
            oSNumElmt.className += " short";
            break;
          case 2:
            oSNumElmt.className += " short";
            break;
          case 3:
            oSNumElmt.className += " three";
            break;
          case 5:
            oSNumElmt.className += " five";
            break;
          default:
            oSNumElmt.className += " three";
            break;
        }
      } else {
        otherSymbolsElmt.style.display = "none";
      }

      switch (panel.sign.otherSymbol) {
        case "Quebec-Style Exit Marker": //Fallthrough
        case "Quebec-Left":
          const markerElmt = document.createElement("object");
          markerElmt.className = "markerImg";
          markerElmt.type = "image/svg+xml";
          markerElmt.data = "assets/other-symbols/QC-Exit.svg";
          if (panel.sign.otherSymbol == "Quebec-Left") {
            otherSymbolsElmt.className += " left";
          }
          otherSymbolsElmt.appendChild(markerElmt);
        default:
      }

      let width = signCont.clientWidth;
      let exitWidth = firstExitTab.clientWidth;

      if (exitWidth > width) {
        signCont.style.width = firstExitTab.clientWidth + "px";
      }

      schedulePanelBorderGradientUpdate(panelElmt);
    }

    recheckWidth();
    document
      .querySelector("#panel" + currentlySelectedPanelIndex)
      .scrollIntoView({
        behavior: "auto", // or 'auto'
        block: "nearest", // Prevents vertical scroll
        inline: "end", // Scrolls horizontally to the left edge
      });
  };

  const recheckWidth = () => {
    if (
      document.querySelector("#smRender").scrollWidth >
      document.documentElement.clientWidth
    ) {
      document.querySelector("#smRender").classList.add("wide");
    } else {
      document.querySelector("#smRender").classList.remove("wide");
    }
  };

  // Expose necessary variables and functions to formHandler
  const exposeToFormHandler = {
    getCurrentPanel,
    getCurrentSubPanel,
    getCurrentBlockRows,
    getCurrentBlockElem,
    getPost: () => post,
    redraw,
    setSelectedRow,
    setSelectedControlElem,
    changeEditingPanel,
    movePanel,
    newPanel,
    deletePanel,
    changeEditingSubPanel,
    changeEditingExitTab,
    newExitTab,
    duplicateExitTab,
    removeExitTab,
    moveExitTab,
    newNestExitTab,
    deleteNestExitTab,
    deleteShield,
    duplicateShield,
    vars: {
      get currentlySelectedPanelIndex() {
        return currentlySelectedPanelIndex;
      },
      get currentlySelectedSubPanelIndex() {
        return currentlySelectedSubPanelIndex;
      },
      get currentlySelectedExitTabIndex() {
        return currentlySelectedExitTabIndex;
      },
      get currentlySelectedNestedExitTabIndex() {
        return currentlySelectedNestedExitTabIndex;
      },
      get currentlySelectedRowIndex() {
        return currentlySelectedRowIndex;
      },
      get currentlySelectedBlockIndex() {
        return currentlySelectedBlockIndex;
      },

      get currentlySelectedShieldGroupId() {
        return currentlySelectedShieldGroupId;
      },

      get currentlySelectedShieldIndex() {
        return currentlySelectedShieldIndex;
      },
    },
  };

  const getPost = function () {
    return post;
  };

  const setPost = function (newPost) {
    post = newPost;
    if (!post) {
      return;
    }

    currentlySelectedPanelIndex = 0;
    formHandler.updateForm();
    redraw();
  };

  return {
    init: init,
    newPanel: newPanel,
    duplicatePanel: duplicatePanel,
    deletePanel: deletePanel,
    shiftLeft: shiftLeft,
    shiftRight: shiftRight,
    movePanel: movePanel,
    changeEditingPanel: changeEditingPanel,
    newShield: newShield,
    newSubPanel: addSubPanel,
    removeSubPanel: removeSubPanel,
    changeEditingSubPanel: changeEditingSubPanel,
    duplicateSubPanel: duplicateSubPanel,
    resetPadding: resetPadding,
    newExitTab: newExitTab,
    duplicateExitTab: duplicateExitTab,
    removeExitTab: removeExitTab,
    moveExitTab: moveExitTab,
    changeEditingExitTab: changeEditingExitTab,
    newNestExitTab: newNestExitTab,
    deleteNestExitTab: deleteNestExitTab,
    getPost: getPost,
    setPost: setPost,

    newRow: newRow,
    dupRow: dupRow,
    delRow: delRow,
    newControlElem: newControlElem,
    delControlElem: delControlElem,

    exposeToFormHandler,
    recheckWidth,
    newShieldGroup,
  };
})();
