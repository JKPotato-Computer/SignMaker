const app = (function () {
  let post = {};
  let currentlySelectedPanelIndex = -1;
  let currentlySelectedSubPanelIndex = 0;
  let currentlySelectedExitTabIndex = 0;
  let currentlySelectedNestedExitTabIndex = -1;

  let currentlySelectedRowIndex = 0,
    currentlySelectedBlockIndex = 0;

  let fileInfo = {
    fileType: "png",
    panel: -1,
  };

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
  const normalizePostThickness = (value) => {
    const parsed =
      typeof value === "string" ? parseFloat(value) : Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed);
    }
    return typeof Post !== "undefined" &&
      Post.prototype &&
      typeof Post.prototype.defaultThickness === "number"
      ? Post.prototype.defaultThickness
      : 1;
  };
  const FHWA_BASELINE_OFFSET_VAR = "var(--fhwaBaselineShift)";
  const FHWA_EXIT_TAB_FONT_SCALE = 1.5;
  const applyHighwayGothicStyling = (element, fontFamily = "Series E") => {
    if (!element) {
      return;
    }
    element.style.fontFamily = fontFamily;
    element.style.setProperty("--fhwaBaselineOffset", FHWA_BASELINE_OFFSET_VAR);
  };
  const applyPanelBorderGradient = (signElmt) => {
    if (
      typeof window === "undefined" ||
      !signElmt ||
      !signElmt.isConnected
    ) {
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
      computed.backgroundColor && computed.backgroundColor !== "rgba(0, 0, 0, 0)"
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
      ".blockElementRow[data-full-bleed-border-color]"
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

      const startPct = Math.max(
        0,
        Math.min(100, (start / signHeight) * 100)
      );
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

  // Initialize the application, and populates dropdowns and the default post.

  const init = async function () {
    post = new Post(Post.prototype.polePositions[0]);
    formHandler.init(exposeToFormHandler);

    // Initialize CustomShields after formHandler and wait for it
    window.customShields = new CustomShields();
    await window.customShields.initialized;

    newPanel();
  };

  // Create a new panel, set the current editing panel to that panel, update the form, and redraw.
  const newPanel = function () {
    post.newPanel();
    currentlySelectedPanelIndex = post.panels.length - 1;
    formHandler.updateForm();
    redraw();
  };

  // Clone the panel, set the current editing panel to that panel, update the form and redraw.
  const duplicatePanel = function () {
    post.duplicatePanel(currentlySelectedPanelIndex);
    currentlySelectedPanelIndex++;
    formHandler.updateForm();
    redraw();
  };

  /*
		Delete the current panel, set the current editing panel to the panel before, update the form and redraw.
		If no panel is found, create a new one.
	*/
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

  // Shift a panel to the left, and redraw.
  const shiftLeft = function () {
    currentlySelectedPanelIndex = post.shiftLeft(currentlySelectedPanelIndex);
    redraw();
  };

  // Shift a panel to the right, and redraw.
  const shiftRight = function () {
    currentlySelectedPanelIndex = post.shiftRight(currentlySelectedPanelIndex);
    redraw();
  };

  const movePanel = function (fromIndex, toIndex) {
    if (!post || !Array.isArray(post.panels) || post.panels.length < 2) {
      return;
    }

    const normalizedFrom = clamp(
      typeof fromIndex === "number" ? fromIndex : currentlySelectedPanelIndex,
      0,
      post.panels.length - 1
    );
    let normalizedTo = clamp(
      typeof toIndex === "number" ? toIndex : normalizedFrom,
      0,
      post.panels.length
    );

    if (
      normalizedFrom === normalizedTo ||
      normalizedFrom + 1 === normalizedTo
    ) {
      return;
    }

    const selectedPanelRef =
      currentlySelectedPanelIndex >= 0 &&
      currentlySelectedPanelIndex < post.panels.length
        ? post.panels[currentlySelectedPanelIndex]
        : null;

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
          post.panels.length - 1
        );
      }
    } else {
      currentlySelectedPanelIndex = clamp(
        currentlySelectedPanelIndex,
        0,
        post.panels.length - 1
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

  const setPanelSpacing = function (value) {
    if (!post) {
      return;
    }
    const parsedValue = parseFloat(value);
    const normalized =
      Number.isFinite(parsedValue) && parsedValue >= 0
        ? Math.min(parsedValue, 8)
        : 0;
    if (post.panelSpacing === normalized) {
      return;
    }
    post.panelSpacing = normalized;
    formHandler.updateForm();
    redraw();
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
      -1,
      getCurrentPanel().sign.subPanels.length - 1
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
  const duplicateExitTab = function (exitTabIndex = currentlySelectedExitTabIndex) {
    const panel = getCurrentPanel();
    if (!panel || !panel.exitTabs.length) {
      return;
    }
    exitTabIndex = clamp(exitTabIndex, 0, panel.exitTabs.length - 1);
    panel.duplicateExitTab(exitTabIndex);
    currentlySelectedExitTabIndex = clamp(
      exitTabIndex + 1,
      0,
      panel.exitTabs.length - 1
    );
    currentlySelectedNestedExitTabIndex = -1;
    formHandler.updateForm();
    redraw();
  };

  // Delete the exit tab.
  const removeExitTab = function (exitTabIndex = currentlySelectedExitTabIndex) {
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
        panel.exitTabs.length - 1
      );
    }

    currentlySelectedNestedExitTabIndex = -1;
    formHandler.updateForm();
    redraw();
  };

  // Delete the exit tab within the parent exitTab
  const deleteNestExitTab = function (
    nestExitTabIndex = currentlySelectedNestedExitTabIndex
  ) {
    const exitTab = getCurrentPanel().exitTabs[currentlySelectedExitTabIndex];
    if (!exitTab || !exitTab.nestedExitTabs.length) {
      return;
    }

    nestExitTabIndex = clamp(
      nestExitTabIndex,
      0,
      exitTab.nestedExitTabs.length - 1
    );

    exitTab.deleteNestExitTab(nestExitTabIndex);

    if (exitTab.nestedExitTabs.length === 0) {
      currentlySelectedNestedExitTabIndex = -1;
    } else {
      currentlySelectedNestedExitTabIndex = Math.min(
        nestExitTabIndex,
        exitTab.nestedExitTabs.length - 1
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
      getCurrentPanel().exitTabs.length - 1
    );
    currentlySelectedNestedExitTabIndex =
      nestedExitTabNumber != null
        ? clamp(
            nestedExitTabNumber,
            -1,
            getCurrentPanel().exitTabs[currentlySelectedExitTabIndex]
              .nestedExitTabs.length - 1
          )
        : -1;
    formHandler.updateForm();
  };

  // Add a new shield to the current panel's sign, update the shield subform, and redraw the sign.
  const newShield = function () {
    const sign = getCurrentPanel().sign;
    sign.newShield(currentlySelectedSubPanelIndex);
    formHandler.updateShieldSubform();
    redraw();
  };

  // Delete the current shield, update the shield subform, and redraw the sign
  const deleteShield = function (shieldIndex) {
    const sign = getCurrentPanel().sign;
    sign.deleteShield(shieldIndex, currentlySelectedSubPanelIndex);
    formHandler.updateShieldSubform();
    redraw();
  };

  // Delete all shields of a sign
  const clearShields = function () {
    const subPanel = getCurrentSubPanel();
    const shields = subPanel.shields;

    while (shields.length > 0) {
      deleteShield(shields.length - 1, currentlySelectedSubPanelIndex);
    }
  };

  // Duplicate a shield
  const duplicateShield = function (shieldIndex) {
    const sign = getCurrentPanel().sign;
    sign.duplicateShield(shieldIndex, currentlySelectedSubPanelIndex);
    formHandler.updateShieldSubform();
    redraw();
  };

  const checkSpecialShield = function (shieldIndex, specialShield) {
    const shields = getCurrentSubPanel().shields;
    const shield = shields[shieldIndex];
    const specialShieldType =
      Shield.prototype.specialBannerTypes[shield.type][specialShield];

    if (specialShieldType != undefined) {
      if (shield.routeNumber.length >= specialShieldType) {
        return true;
      }
    }

    return false;
  };

  // Revised Control Panel
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
      getCurrentSubPanel().blockElements.rows.length - 1
    );
    formHandler.updateForm();
  };

  const newControlElem = (selectedElem) => {
    const blockElems = getCurrentSubPanel().blockElements;
    blockElems.addElement(
      Control.prototype.blockToClassElems[selectedElem],
      {},
      currentlySelectedRowIndex,
      ++currentlySelectedBlockIndex
    );
    formHandler.updateForm();
    redraw();
  };

  const delControlElem = () => {
    const blockElems = getCurrentSubPanel().blockElements;
    if (
      blockElems.removeElement(
        currentlySelectedRowIndex,
        currentlySelectedBlockIndex
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

  const moveControlElem = (
    fromRowIndex,
    fromBlockIndex,
    toRowIndex,
    toBlockIndex
  ) => {
    const blockElements = getCurrentSubPanel().blockElements;
    const sourceRow = blockElements.rows[fromRowIndex];
    if (!sourceRow || !sourceRow.length) {
      return;
    }

    const movingWithinRow = fromRowIndex === toRowIndex;
    const rowLengthBeforeRemoval = sourceRow.length;

    const normalizedFrom = clamp(
      fromBlockIndex,
      0,
      Math.max(0, rowLengthBeforeRemoval - 1)
    );
    const [movedElem] = sourceRow.splice(normalizedFrom, 1);
    if (!movedElem) {
      return;
    }

    let destinationRowIndex = toRowIndex;
    if (!movingWithinRow && sourceRow.length === 0) {
      blockElements.rows.splice(fromRowIndex, 1);
      blockElements.blockProperties.splice(fromRowIndex, 1);
      if (fromRowIndex < toRowIndex) {
        destinationRowIndex = Math.max(0, toRowIndex - 1);
      }
    }

    const targetRow = blockElements.rows[destinationRowIndex];
    if (!targetRow) {
      return;
    }

    let normalizedTo;
    if (movingWithinRow) {
      const maxIndex = rowLengthBeforeRemoval;
      normalizedTo = clamp(toBlockIndex, 0, maxIndex);
      if (normalizedTo > normalizedFrom) {
        normalizedTo--;
      }
    } else {
      normalizedTo = clamp(toBlockIndex, 0, targetRow.length);
    }

    targetRow.splice(normalizedTo, 0, movedElem);

    currentlySelectedRowIndex = destinationRowIndex;
    currentlySelectedBlockIndex = normalizedTo;
    formHandler.updateForm();
    redraw();
  };

  const duplicateBlockIntoNewRow = (sourceRowIndex, sourceBlockIndex) => {
    const blockElements = getCurrentSubPanel().blockElements;
    if (
      !blockElements ||
      !Array.isArray(blockElements.rows) ||
      !blockElements.rows.length
    ) {
      return;
    }

    const normalizedRow = clamp(
      sourceRowIndex,
      0,
      blockElements.rows.length - 1
    );
    const sourceRow = blockElements.rows[normalizedRow];
    if (!Array.isArray(sourceRow) || !sourceRow.length) {
      return;
    }

    const normalizedBlock = clamp(
      sourceBlockIndex,
      0,
      Math.max(0, sourceRow.length - 1)
    );
    const sourceBlock = sourceRow[normalizedBlock];
    if (!sourceBlock) {
      return;
    }

    const blockElemType =
      Control.prototype.blockToClassElems.getElem(sourceBlock);
    if (!blockElemType) {
      return;
    }
    const Constructor = Control.prototype.blockToClassElems[blockElemType];
    if (typeof Constructor !== "function") {
      return;
    }

    const duplicatedBlock = Object.assign(new Constructor(), sourceBlock);
    const insertRowIndex = clamp(
      normalizedRow + 1,
      0,
      blockElements.rows.length
    );

    blockElements.rows.splice(insertRowIndex, 0, [duplicatedBlock]);
    blockElements.blockProperties.splice(insertRowIndex, 0, new Block());

    currentlySelectedRowIndex = insertRowIndex;
    currentlySelectedBlockIndex = 0;
    formHandler.updateForm();
    redraw();
  };

  const setSelectedControlElem = (block) => {
    currentlySelectedBlockIndex = clamp(
      block,
      0,
      getCurrentBlockRows().length - 1
    );
    formHandler.updateForm();
  };

  /**
		Download the sign from options
	*/

  function getFile() {
    var screenshotTarget;
    var postClass;

    if (fileInfo.panel == -1) {
      screenshotTarget = document.querySelector("#postContainer");
    } else {
      screenshotTarget = document.getElementById(
        "panel" + fileInfo.panel.toString()
      );
    }

    return screenshotTarget;
  }

  const downloadFile = function (dataURL, ending) {
    let a = document.createElement(`a`);
    a.setAttribute("href", dataURL);
    a.setAttribute("download", "downloadedSign" + ending);
    a.click();
    a.remove();
  };

  const saveSign = async function (file, isPreview, isSVG) {
    let newElem = file.cloneNode(true);
    newElem.style.position = "absolute";
    newElem.style.top = "0";
    newElem.style.left = "0";
    document.body.appendChild(newElem);
    return new Promise((resolve, reject) => {
      let svg = htmlToImage.toSvg(newElem);
      newElem.remove();
      svg
        .then(function (dataUrl) {
          if (isSVG) {
            if (isPreview) {
              resolve(dataUrl);
            }
            downloadFile(dataUrl, ".svg");
            return;
          }

          let tmpCanvas = document.createElement("canvas");
          let ctx = tmpCanvas.getContext("2d");

          let tmpImg = new Image();
          tmpImg.addEventListener("load", onTempImageLoad);
          tmpImg.src = dataUrl;

          tmpCanvas.width = tmpCanvas.height = 512;
          function onTempImageLoad(e) {
            tmpCanvas.width = e.target.width;
            tmpCanvas.height = e.target.height;

            ctx.drawImage(e.target, 0, 0);
            if (isPreview) {
              resolve(tmpCanvas.toDataURL());
            } else {
              downloadFile(tmpCanvas.toDataURL(), ".png");
              resolve(true);
            }
          }
        })
        .catch(function (error) {
          console.error("Error Saving!", error);
        });
    });
  };

  const downloadSign = async function () {
    const downloadPreview = document.getElementById("downloadPreview");
    const entirePost_option = document.getElementById("entirePost");
    const panelContainer = document.getElementById("panelContainer");
    const panelNumberSelector = document.getElementById("singularPanel");

    let background = "";

    if (entirePost_option.checked == true) {
      fileInfo.panel = -1;
      panelNumberSelector.style.display = "none";
      document.getElementById("downloadContents").style.verticalAlign = "10rem";
    } else {
      const panelNumber = document.getElementById("selectPanel");
      fileInfo.panel = panelNumber.value - 1;
      panelNumberSelector.style.display = "block";
      document.getElementById("downloadContents").style.verticalAlign = "";
    }

    if (fileInfo.fileType == "png") {
      saveSign(getFile(), false);
    } else if (fileInfo.fileType == "svg") {
      saveSign(getFile(), false, true);
    }
  };

  const updatePreview = async function () {
    const downloadPreview = document.getElementById("downloadPreview");
    const entirePost_option = document.getElementById("entirePost");
    const panelContainer = document.getElementById("panelContainer");
    const panelNumberSelector = document.getElementById("singularPanel");

    let background = "";

    if (entirePost_option.checked == true) {
      fileInfo.panel = -1;
      panelNumberSelector.style.display = "none";
      document.getElementById("downloadContents").style.verticalAlign = "10rem";
    } else {
      const panelNumber = document.getElementById("selectPanel");
      fileInfo.panel = panelNumber.value - 1;
      panelNumberSelector.style.display = "block";
      document.getElementById("downloadContents").style.verticalAlign = "";
    }

    while (downloadPreview.firstChild) {
      downloadPreview.removeChild(downloadPreview.lastChild);
    }

    const targetImg = new Image();
    targetImg.src = await saveSign(getFile(), true);
    downloadPreview.appendChild(targetImg);
  };

  const updateFileType = function (fileType) {
    fileInfo.fileType = fileType;
    updatePreview();

    if (fileType == "png") {
      document.getElementById("PNG").className = "activated";
      document.getElementById("SVG").className = "";
    } else if (fileType == "svg") {
      document.getElementById("PNG").className = "";
      document.getElementById("SVG").className = "activated";
    }
  };

  const resetPadding = function (mode, params) {
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
    const postContainerElmt = document.getElementById("postContainer");
    const panelContainerElmt = document.getElementById("panelContainer");
    const posts = document.getElementsByClassName("post");
    const availablePolePositions = Array.isArray(Post.prototype.polePositions)
      ? Post.prototype.polePositions
      : [];
    const fallbackPolePosition = availablePolePositions.includes(post.polePosition)
      ? post.polePosition
      : availablePolePositions[0] || "Left";
    const polePositionClass = `polePosition${fallbackPolePosition}`;
    const availableColors = Array.isArray(Post.prototype.colors)
      ? Post.prototype.colors
      : [];
    const fallbackColor = availableColors[0] || "Silver";
    const normalizedPostColor = availableColors.includes(post.color)
      ? post.color
      : fallbackColor;
    const colorClass = normalizedPostColor ? ` postColor${normalizedPostColor}` : "";
    postContainerElmt.className = `${polePositionClass}${colorClass}`;
    const normalizedThickness =
      post && typeof post.normalizeThickness === "function"
        ? post.normalizeThickness(post.thickness)
        : normalizePostThickness(post ? post.thickness : undefined);
    if (post) {
      post.thickness = normalizedThickness;
    }
    postContainerElmt.style.setProperty(
      "--postThickness",
      normalizedThickness + "rem"
    );

    // post

    if (post.showPost == true) {
      for (let i = 0; i < posts.length; i++) {
        posts[i].style.visibility = "hidden";
      }
      panelContainerElmt.style.background = "none";
    } else {
      const polePosition = (fallbackPolePosition || "").toLowerCase();
      for (let i = 0; i < posts.length; i++) {
        posts[i].style.visibility = "hidden";
      }
      if (polePosition === "overhead") {
        for (let i = 0; i < posts.length; i++) {
          posts[i].style.visibility = "visible";
        }
      } else if (polePosition === "left") {
        if (posts[0]) {
          posts[0].style.visibility = "visible";
        }
      } else if (polePosition === "right") {
        if (posts[1]) {
          posts[1].style.visibility = "visible";
        }
      } else if (polePosition === "rural" || polePosition === "center") {
        // Posts remain hidden; custom backgrounds render supports.
      } else {
        for (let i = 0; i < posts.length; i++) {
          posts[i].style.visibility = "visible";
        }
      }
      panelContainerElmt.style.background = "";
    }

    lib.clearChildren(panelContainerElmt);
    if (panelContainerElmt) {
      const spacingValue =
        typeof post.panelSpacing === "number" && post.panelSpacing > 0
          ? Math.max(0, post.panelSpacing)
          : 0;
      panelContainerElmt.style.setProperty(
        "--panelSpacing",
        spacingValue + "rem"
      );
    }

    var index = -1;
    var firstExitTab = null;

    for (const panel of post.panels) {
      index++;

      const panelElmt = document.createElement("div");
      panelElmt.className = `panel ${panel.color.toLowerCase()} ${panel.corner.toLowerCase()}`;
      const borderRadiusFallback =
        (typeof Panel !== "undefined" &&
          Panel.prototype &&
          typeof Panel.prototype.defaultBorderRadius === "number")
          ? Panel.prototype.defaultBorderRadius
          : 0.75;
      const numericPanelBorderRadius =
        typeof panel.borderRadius === "number"
          ? panel.borderRadius
          : parseFloat(panel.borderRadius);
      const panelBorderRadius = Number.isFinite(numericPanelBorderRadius)
        ? Math.max(0, numericPanelBorderRadius)
        : borderRadiusFallback;
      panelElmt.style.setProperty(
        "--signBorderRadius",
        panelBorderRadius + "rem"
      );
      panelElmt.id = "panel" + index;
      panelContainerElmt.appendChild(panelElmt);

      for (
        let exitTabIndex = panel.exitTabs.length - 1;
        exitTabIndex > -1;
        exitTabIndex--
      ) {
        var exitTab = panel.exitTabs[exitTabIndex];

        const exitTabCont = document.createElement("div");
        exitTabCont.className = `exitTabContainer ${exitTab.position.toLowerCase()} ${exitTab.width.toLowerCase()}`;
        panelElmt.appendChild(exitTabCont);

        var nestedExitTabs = exitTab.nestedExitTabs.length;

        for (let nestIndex = -1; nestIndex < nestedExitTabs; nestIndex++) {
          if (nestIndex != -1) {
            exitTab = exitTab.nestedExitTabs[nestIndex];
          }

          const exitTabElmt = document.createElement("div");
          exitTabElmt.className = `exitTab ${exitTab.position.toLowerCase()} ${exitTab.width.toLowerCase()}`;
          if (exitTab.squareCorners) {
            exitTabElmt.className += " squareCorners";
          }
          const fallbackBorderThickness =
            typeof ExitTab !== "undefined" &&
            ExitTab.prototype &&
            typeof ExitTab.prototype.defaultBorderThickness === "number"
              ? ExitTab.prototype.defaultBorderThickness
              : 0.2;
          const numericBorderThickness =
            typeof exitTab.borderThickness === "number"
              ? exitTab.borderThickness
              : parseFloat(exitTab.borderThickness);
          const normalizedBorderThickness =
            Number.isFinite(numericBorderThickness) && numericBorderThickness >= 0
              ? numericBorderThickness
              : fallbackBorderThickness;
          exitTab.borderThickness = normalizedBorderThickness;
          const isBorderlessTab = normalizedBorderThickness <= 0;
          const borderThicknessRem = normalizedBorderThickness.toString() + "rem";
          if (isBorderlessTab) {
            exitTabElmt.classList.add("borderless");
          }
          const usesHighwayGothicFont = !!exitTab.FHWAFont || post.fontType === true;
          const registerExitTabText = (element) => {
            if (!element) {
              return element;
            }
            element.classList.add("exitTabText");
            return element;
          };
          const appendStandardExitNumber = (parentElmt) => {
            if (!parentElmt || !exitTab.number) {
              return;
            }
            const normalizedNumberText = String(exitTab.number).replace(
              /\\n/g,
              "\n"
            );
            const numberLines = normalizedNumberText.split("\n");
            const renderExitNumberSegments = (targetElmt, lineText) => {
              if (!targetElmt) {
                return;
              }
              const safeLineText =
                typeof lineText === "string" ? lineText : String(lineText || "");
              const txtArr = safeLineText.toUpperCase().split(/(\d+\S*)/);
              const divTextElmt = document.createElement("div");
              registerExitTabText(divTextElmt);
              if (usesHighwayGothicFont) {
                divTextElmt.style.setProperty(
                  "--exitTabAdditionalOffset",
                  "-0.5px"
                );
              }
              const leadingText = txtArr[0] || "";
              divTextElmt.appendChild(
                document.createTextNode(
                  leadingText.length > 0
                    ? leadingText
                    : safeLineText.length === 0
                      ? "\u00a0"
                      : ""
                )
              );
              targetElmt.appendChild(divTextElmt);

              if (txtArr.length > 1) {
                divTextElmt.classList.add("exitFormat");
                if (leadingText && leadingText.trim().length > 0) {
                  const spacerElmt = document.createElement("span");
                  spacerElmt.textContent = " ";
                  spacerElmt.classList.add("exitTabTextSpacer");
                  registerExitTabText(spacerElmt);
                  targetElmt.appendChild(spacerElmt);
                }
                const spanNumeralElmt = document.createElement("span");
                spanNumeralElmt.className = "numeral";
                registerExitTabText(spanNumeralElmt);
                spanNumeralElmt.appendChild(document.createTextNode(txtArr[1]));
                targetElmt.appendChild(spanNumeralElmt);
                const trailingText = txtArr.slice(2).join("");
                if (trailingText) {
                  const trailingSpanElmt = document.createElement("span");
                  trailingSpanElmt.textContent = trailingText;
                  registerExitTabText(trailingSpanElmt);
                  targetElmt.appendChild(trailingSpanElmt);
                }
                if (exitTab.topOffset == false) {
                  divTextElmt.style.setProperty("--exitTabTextBaseOffset", "0rem");
                }
              }
            };

            if (numberLines.length <= 1) {
              renderExitNumberSegments(parentElmt, normalizedNumberText);
              return;
            }

            const multiLineContainerElmt = document.createElement("div");
            multiLineContainerElmt.className = "exitTabNumberLinesContainer";
            parentElmt.appendChild(multiLineContainerElmt);

            numberLines.forEach((lineText) => {
              const lineWrapperElmt = document.createElement("div");
              lineWrapperElmt.className = "exitTabNumberLine";
              multiLineContainerElmt.appendChild(lineWrapperElmt);
              renderExitNumberSegments(lineWrapperElmt, lineText || "");
            });
          };

          const exitTabHolderElmt = document.createElement("div");
          exitTabHolderElmt.className = "exitTabHolder";
          exitTabHolderElmt.appendChild(exitTabElmt);

          exitTabCont.appendChild(exitTabHolderElmt);

          if (exitTab.color != "Panel Color" && exitTab.color != undefined) {
            exitTabElmt.className += ` ${exitTab.color.toLowerCase()}`;
            exitTabHolderElmt.className += ` ${exitTab.color.toLowerCase()}`;
          } else {
            exitTabElmt.className += ` ${panel.color.toLowerCase()}`;
            exitTabHolderElmt.className += ` ${panel.color.toLowerCase()}`;
          }

          if (usesHighwayGothicFont) {
            applyHighwayGothicStyling(exitTabElmt);
            exitTabElmt.style.setProperty(
              "--fhwaBaselineOffset",
              "calc(var(--fhwaBaselineShift) + 1px)"
            );
            exitTabElmt.style.setProperty("--exitTabNumeralScale", "0.95");
          }

          if (
            exitTab.number ||
            exitTab.showLeft ||
            exitTab.variant != "Default"
          ) {
            if (exitTab.variant == "Default") {
              const leftElmt = document.createElement("div");

              if (exitTab.showLeft) {
                leftElmt.classList.add("yellowElmt");
                registerExitTabText(leftElmt);
                leftElmt.appendChild(document.createTextNode("LEFT"));
                exitTabElmt.appendChild(leftElmt);
                exitTabElmt.style.display = "inline-block";

                if (exitTab.number) {
                  leftElmt.style.marginRight = "0.4rem";
                }
              }

              appendStandardExitNumber(exitTabElmt);
            } else if (exitTab.variant == "Toll Logo") {
              exitTabCont.classList.add("tollLogoExitTabContainer");
              exitTabHolderElmt.classList.add("tollLogoExitHolder");
              const tollLogoContainerElmt = document.createElement("div");
              tollLogoContainerElmt.className = "tollLogoLogoWrapper";
              const tollLogoHolderElmt = document.createElement("div");
              tollLogoHolderElmt.className = "tollLogoImageHolder";
              if (exitTab.tollLogoSquare) {
                tollLogoHolderElmt.classList.add("squareIcon");
              }
              const defaultTollLogoSize =
                typeof ExitTab !== "undefined" &&
                ExitTab.prototype &&
                typeof ExitTab.prototype.defaultTollLogoSize === "number"
                  ? ExitTab.prototype.defaultTollLogoSize
                  : 3;
              let resolvedTollLogoSize = parseFloat(exitTab.tollLogoSize);
              if (!Number.isFinite(resolvedTollLogoSize) || resolvedTollLogoSize <= 0) {
                resolvedTollLogoSize = defaultTollLogoSize;
              }
              exitTabElmt.style.setProperty(
                "--tollLogoSize",
                resolvedTollLogoSize.toString() + "rem"
              );
              tollLogoHolderElmt.style.setProperty(
                "--tollLogoSize",
                resolvedTollLogoSize.toString() + "rem"
              );
              const tollLogos =
                typeof TollLogoElement !== "undefined" &&
                TollLogoElement.prototype &&
                TollLogoElement.prototype.logos
                  ? TollLogoElement.prototype.logos
                  : null;
              const tollLogoKey =
                tollLogos && exitTab.icon && tollLogos[exitTab.icon]
                  ? exitTab.icon
                  : tollLogos && TollLogoElement.prototype.defaultLogo
                    ? TollLogoElement.prototype.defaultLogo
                    : null;
              const tollLogoDef =
                tollLogos && tollLogoKey ? tollLogos[tollLogoKey] : null;
              if (tollLogoDef) {
                const tollLogoImgElmt = document.createElement("img");
                tollLogoImgElmt.src = tollLogoDef.src;
                tollLogoImgElmt.alt = tollLogoDef.label || "Toll logo";
                tollLogoImgElmt.className = "tollLogoImage";
                tollLogoImgElmt.loading = "lazy";
                tollLogoImgElmt.decoding = "async";
                tollLogoHolderElmt.appendChild(tollLogoImgElmt);
              } else if (exitTab.icon) {
                const fallbackLogoElmt = document.createElement("span");
                fallbackLogoElmt.textContent = exitTab.icon.toUpperCase();
                registerExitTabText(fallbackLogoElmt);
                tollLogoHolderElmt.appendChild(fallbackLogoElmt);
              }
              tollLogoContainerElmt.appendChild(tollLogoHolderElmt);
              exitTabElmt.appendChild(tollLogoContainerElmt);
              exitTabElmt.classList.add("tollLogoExitTab");
              if (exitTab.tollLogoOnly) {
                exitTabElmt.classList.add("logoOnly");
                exitTabHolderElmt.classList.add("logoOnly");
                exitTabCont.classList.add("logoOnly");
              } else {
                const tollLogoNumberWrapperElmt = document.createElement("div");
                tollLogoNumberWrapperElmt.className = "tollLogoNumberWrapper";
                appendStandardExitNumber(tollLogoNumberWrapperElmt);
                exitTabElmt.appendChild(tollLogoNumberWrapperElmt);
              }
            } else if (exitTab.variant == "Icon") {
            } else if (exitTab.variant == "Full Left") {
              exitTabElmt.classList.add("fullLeft");
              const bannerElmt = document.createElement("div");
              bannerElmt.className = "fullLeftBanner";
              registerExitTabText(bannerElmt);
              bannerElmt.appendChild(document.createTextNode("LEFT"));
              exitTabElmt.appendChild(bannerElmt);

              const numberWrapperElmt = document.createElement("div");
              numberWrapperElmt.className = "fullLeftNumber";
              exitTabElmt.appendChild(numberWrapperElmt);
              appendStandardExitNumber(numberWrapperElmt);
            } else if (exitTab.variant == "HOV 1") {
              exitTabCont.classList.add("hovExitTabContainer");
              exitTabHolderElmt.classList.add("hovExitTabHolder");
              exitTabElmt.classList.add("hovExitTab");

              const hovIconColumnElmt = document.createElement("div");
              hovIconColumnElmt.className = "hovIconColumn";
              const hovIconImgElmt = document.createElement("img");
              hovIconImgElmt.className = "hovIcon";
              hovIconImgElmt.src = "img/icons/HOV.png";
              hovIconImgElmt.alt = "HOV symbol";
              hovIconColumnElmt.appendChild(hovIconImgElmt);

              const hovContentColumnElmt = document.createElement("div");
              hovContentColumnElmt.className = "hovContentColumn";

              const hovTextRowElmt = document.createElement("div");
              hovTextRowElmt.className = "hovTextRow";
              const hovTextElmt = document.createElement("span");
              registerExitTabText(hovTextElmt);
              const hovExitNumber =
                typeof exitTab.number === "string"
                  ? exitTab.number.trim().toUpperCase()
                  : "";
              hovTextElmt.textContent = hovExitNumber
                ? `HOV EXIT ${hovExitNumber}`
                : "HOV EXIT";
              hovTextRowElmt.appendChild(hovTextElmt);
              hovContentColumnElmt.appendChild(hovTextRowElmt);

              const hovBottomBarElmt = document.createElement("div");
              hovBottomBarElmt.className = "hovBottomBar";
              hovContentColumnElmt.appendChild(hovBottomBarElmt);

              exitTabElmt.appendChild(hovIconColumnElmt);
              exitTabElmt.appendChild(hovContentColumnElmt);
            } else if (exitTab.variant == "HOV 2") {
            }

            exitTabElmt.style.visibility = "visible";
            exitTabCont.className += " tabVisible";

            const cornerRadius = exitTab.squareCorners ? "0.25rem" : "0.5rem";

            if (exitTab.fullBorder == true) {
              exitTabElmt.style.borderBottomWidth = borderThicknessRem;
              exitTabElmt.style.borderBottomStyle = isBorderlessTab ? "" : "solid";
              exitTabElmt.style.borderRadius = isBorderlessTab ? "0" : cornerRadius;
            } else {
              exitTabElmt.style.borderBottomWidth = "";
              exitTabElmt.style.borderBottomStyle = "";
              exitTabElmt.style.borderRadius = "";
            }

            exitTabElmt.style.borderTopWidth = borderThicknessRem;
            exitTabElmt.style.borderLeftWidth = borderThicknessRem;
            exitTabElmt.style.borderRightWidth = borderThicknessRem;
            let resolvedFontSize = exitTab.fontSize;
            if (typeof resolvedFontSize === "string") {
              resolvedFontSize = parseFloat(resolvedFontSize);
            }
            if (!Number.isFinite(resolvedFontSize)) {
              resolvedFontSize = 0;
            }
            if (usesHighwayGothicFont) {
              resolvedFontSize *= FHWA_EXIT_TAB_FONT_SCALE;
            }
            exitTabElmt.style.fontSize = resolvedFontSize.toString() + "px";

            exitTabElmt.style.minHeight = exitTab.minHeight.toString() + "rem";
            if (exitTab.variant == "Toll Logo" && exitTab.tollLogoOnly) {
              exitTabElmt.style.minHeight = "0";
            }
          }
        }

        if (exitTabIndex == 0) {
          firstExitTab = exitTabCont;
        }

        exitTabCont.style.display = "flex";
      }

      function createShield(i, p) {
        /*
					i: index (table parent)
					p: parent (object)
				*/

        var position;

        for (const shield of i) {
          if (
            shield.bannerPosition != "Above" &&
            (shield.bannerType != "None" || shield.bannerType2 != "None")
          ) {
            position = shield.bannerPosition;
            break;
          }
        }

        for (const shield of i) {
          if (
            (shield.bannerPosition != "Above" && shield.bannerType != "None") ||
            (shield.bannerType2 != "None" && !locked)
          ) {
            position = shield.bannerPosition;
            locked = true;
          }

          const toElmt = document.createElement("p");
          toElmt.className = "to";
          toElmt.appendChild(document.createTextNode("TO"));
          p.appendChild(toElmt);

          const bannerShieldContainerElmt = document.createElement("div");
          bannerShieldContainerElmt.className = `bannerShieldContainer ${
            shield.type
          } ${shield.specialBannerType.toLowerCase()} bannerPosition${
            shield.bannerPosition
          }`;

          switch (shield.routeNumber.length) {
            case 1:
              bannerShieldContainerElmt.className += " one";
              break;
            case 2:
              bannerShieldContainerElmt.className += " two";
              break;
            case 3:
              bannerShieldContainerElmt.className += " three";
              break;
            default:
              bannerShieldContainerElmt.className += " three";
              break;
          }

          p.appendChild(bannerShieldContainerElmt);

          const bannerContainerElmt = document.createElement("div");
          bannerContainerElmt.className = `bannerContainer`;
          bannerShieldContainerElmt.appendChild(bannerContainerElmt);

          const bannerElmt = document.createElement("p");
          bannerElmt.className =
            "bannerA" + (!shield.indentFirstLetter ? " noIndent" : "");
          bannerElmt.style = "--fontSize:" + shield.fontSize;
          bannerContainerElmt.appendChild(bannerElmt);

          const shieldElmt = document.createElement("div");
          shieldElmt.className = "shield";
          shieldElmt.id = "shield" + i.indexOf(shield).toString();
          bannerShieldContainerElmt.appendChild(shieldElmt);

          const shieldImgElmt = document.createElement("img");
          shieldImgElmt.type = "image/png";
          shieldImgElmt.className = "shieldImg";

          switch (shield.routeNumber.length) {
            case 1:
              shieldImgElmt.className += " one";
              break;
            case 2:
              shieldImgElmt.className += " two";
              break;
            case 3:
              shieldImgElmt.className += " three";
              break;
            case 4:
              shieldImgElmt.className += " four";
              break;
            default:
              shieldImgElmt.className += " three";
              break;
          }

          shieldElmt.appendChild(shieldImgElmt);

          const bannerContainerElmt2 = document.createElement("div");
          bannerContainerElmt2.className = `bannerContainer2`;
          bannerShieldContainerElmt.appendChild(bannerContainerElmt2);

          const bannerElmt2 = document.createElement("p");
          bannerElmt2.className =
            "bannerB" + (!shield.indentFirstLetter ? " noIndent" : "");
          bannerElmt2.style = "--fontSize:" + shield.fontSize;
          bannerContainerElmt2.appendChild(bannerElmt2);

          if (shield.bannerType2 == "Toll") {
            bannerElmt2.className += " TOLL";
          }

          const routeNumberElmt = document.createElement("p");
          routeNumberElmt.className = "routeNumber";
          shieldElmt.appendChild(routeNumberElmt);

          if (shield.to) {
            toElmt.style.display = "inline";
            bannerShieldContainerElmt.style.marginLeft = "0";
          }

          // Shield type
          var lengthValue = shield.routeNumber.length;

          if (shield.routeNumber.length == 1) {
            lengthValue = 2;
          }

          const sameElement = [
            "AK",
            "C",
            "CO",
            "FL",
            "CD",
            "DC",
            "HI",
            "ID",
            "LA",
            "MI",
            "MN",
            "MT",
            "MT2",
            "NB",
            "NC",
            "NE",
            "NH",
            "NM",
            "NV",
            "PEI",
            "QC2",
            "REC2",
            "SC",
            "TN",
            "UT",
            "VA2",
            "WA",
            "WI",
            "WY",
          ];

          if (sameElement.includes(shield.type)) {
            lengthValue = 2;
          }

          var imgFileConstr = shield.type + "-" + lengthValue;

          if (shield.specialBannerType != "None") {
            imgFileConstr += "-" + shield.specialBannerType.toUpperCase();
          }

          shieldImgElmt.src = "img/shields/" + imgFileConstr + ".svg";

          //shield

          if (shield.type == "I" && shield.routeNumber.length == 3) {
            shieldImgElmt.style.width = "3.8rem";
          }

          if (position == "Right") {
            var shieldDistance;

            if (i == panel.sign.shields) {
              shieldDistance = panel.sign.shieldDistance;
            } else {
              shieldDistance =
                panel.sign.subPanels[currentlySelectedSubPanelIndex]
                  .shieldDistance;
            }

            shieldElmt.style.right = shieldDistance.toString() + "rem";

            if (shield.bannerType2 != "None") {
              bannerContainerElmt2.style.right =
                (shieldDistance * 2).toString() + "rem";
              bannerContainerElmt2.style.position = "relative";
              p.style.marginLeft =
                (i.length * shieldDistance * 2).toString() + "rem";
            } else {
              p.style.marginLeft =
                (i.length * shieldDistance).toString() + "rem";
            }
          } else if (position == "Left") {
            var shieldDistance;

            if (i == panel.sign.shields) {
              shieldDistance = panel.sign.shieldDistance;
            } else {
              shieldDistance =
                panel.sign.subPanels[currentlySelectedSubPanelIndex]
                  .shieldDistance;
            }

            shieldElmt.style.left = shieldDistance.toString() + "rem";

            if (shield.bannerType2 != "None") {
              bannerContainerElmt2.style.left =
                (shieldDistance * 2).toString() + "rem";
              bannerContainerElmt2.style.position = "relative";
              p.style.marginRight =
                (i.length * shieldDistance * 2).toString() + "rem";
            } else {
              p.style.marginRight =
                (i.length * shieldDistance).toString() + "rem";
            }
          }

          // Route Number
          routeNumberElmt.appendChild(
            document.createTextNode(shield.routeNumber)
          );

          // Route banner

          if (shield.bannerType == "Toll") {
            bannerElmt.className += " TOLL";
          }

          if (shield.bannerType != "None") {
            bannerElmt.appendChild(document.createTextNode(shield.bannerType));
          } else {
            bannerElmt.appendChild(document.createTextNode(" "));
          }

          if (shield.bannerType2 != "None") {
            bannerElmt2.appendChild(
              document.createTextNode(shield.bannerType2)
            );
          } else {
            bannerElmt2.appendChild(document.createTextNode(" "));
          }

          // Font change

          if (post.fontType == true) {
            applyHighwayGothicStyling(toElmt);
            applyHighwayGothicStyling(bannerElmt);
            applyHighwayGothicStyling(bannerElmt2);
          }
        }
      }

      function monitorActionMessage(i, p) {
        /*
					i: Array
					p: Parent (element)
				*/

        if (i.actionMessage != "") {
          if (post.fontType == true) {
            applyHighwayGothicStyling(p);
          } else {
            p.style.fontFamily = "Clearview 5WR";
          }
          p.style.visibility = "visible";
          p.style.display = "inline-flex";
          p.className = `actionMessage action_message`;
          const txtArr = i.actionMessage.split(/(\d+\S*)/);
          const txtFrac = txtArr[0].split(/([\u00BC-\u00BE]+\S*)/);

          p.appendChild(document.createTextNode(txtFrac[0]));

          if (
            (i.actionMessage.includes("½") ||
              i.actionMessage.includes("¼") ||
              i.actionMessage.includes("¾")) &&
            txtArr.length > 2
          ) {
            const spanElmt = document.createElement("span");
            spanElmt.className = "numeral special";

            if (post.fontType) {
              spanElmt.style.fontSize = "1.5rem";
            }

            spanElmt.appendChild(document.createTextNode(txtArr[1]));
            p.appendChild(spanElmt);

            const spanFractionElmt = document.createElement("span");
            spanFractionElmt.className = "fraction special";

            if (post.fontType) {
              spanFractionElmt.style.fontSize = "1.15rem";
              spanFractionElmt.style.top = "-0.15rem";
              spanFractionElmt.style.position = "relative";
            }

            spanFractionElmt.appendChild(
              document.createTextNode(
                txtArr[2].split(/([\u00BC-\u00BE]+\S*)/)[1]
              )
            );
            p.appendChild(spanFractionElmt);
            p.appendChild(
              document.createTextNode(
                txtArr[2]
                  .split(/([\u00BC-\u00BE]+\S*)/)
                  .slice(2)
                  .join("")
              )
            );
          } else {
            if (txtArr.length > 1) {
              const spanElmt = document.createElement("span");
              spanElmt.className = "numeral";

              if (post.fontType) {
                spanElmt.style.fontSize = "1.5rem";
              }

              spanElmt.appendChild(document.createTextNode(txtArr[1]));
              p.appendChild(spanElmt);
              p.appendChild(document.createTextNode(txtArr.slice(2).join("")));
            }
            if (txtFrac.length > 1) {
              const spanFractionElmt = document.createElement("span");
              spanFractionElmt.className = "fraction";

              if (post.fontType) {
                spanFractionElmt.style.fontSize = "1.15rem";
                spanFractionElmt.style.top = "-0.15rem";
                spanFractionElmt.style.position = "relative";
              }

              spanFractionElmt.appendChild(document.createTextNode(txtFrac[1]));
              p.appendChild(spanFractionElmt);
              p.appendChild(document.createTextNode(txtFrac.slice(2).join("")));
            }
          }
        } else {
          p.style.display = "none";
        }
      }

      function monitorControlText(i, p) {
        function LineEditor(line) {
          if (line.includes("</>")) {
            line = line.split("</>");
            p.appendChild(
              document.createTextNode(line[0] + "⠀⠀⠀⠀⠀⠀⠀⠀⠀" + line[1])
            );
          } else if (line.includes("<-->")) {
          } else {
            p.appendChild(document.createTextNode(line));
          }
        }

        const controlTextArray = i.controlText.split("\n");
        for (
          let lineNum = 0, length = controlTextArray.length - 1;
          lineNum < length;
          lineNum++
        ) {
          LineEditor(controlTextArray[lineNum]);
          p.appendChild(document.createElement("br"));
        }

        LineEditor(controlTextArray[controlTextArray.length - 1]);
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

      const g_top = document.createElement("div");
      g_top.className = `globalTop`;
      signElmt.appendChild(g_top);

      const signHolderElmt = document.createElement("div");
      signHolderElmt.className = `signHolder`;
      signElmt.appendChild(signHolderElmt);

      const g_bottom = document.createElement("div");
      g_bottom.className = `globalBottom`;
      signElmt.appendChild(g_bottom);

      const g_shieldsContainerElmt = document.createElement("div");
      g_shieldsContainerElmt.className = `shieldsContainer ${
        panel.sign.shieldBacks ? "shieldBacks" : ""
      }`;

      createShield(panel.sign.shields, g_shieldsContainerElmt);

      /*
      const g_controlTextElmt = document.createElement("p");
      g_controlTextElmt.className = "controlText";

      if (post.fontType) {
        applyHighwayGothicStyling(g_controlTextElmt, "Series EM");
      }

      monitorControlText(panel.sign, g_controlTextElmt);

      const g_actionMessageElmt = document.createElement("div");
      g_actionMessageElmt.className = `actionMessage`;

      if (post.fontType) {
        applyHighwayGothicStyling(g_actionMessageElmt);
      }

      monitorActionMessage(panel.sign, g_actionMessageElmt);
      
      if (
        panel.sign.shields.length != 0 ||
        panel.sign.controlText != "" ||
        panel.sign.actionMessage != ""
      ) {
        if (panel.sign.globalPositioning.toLowerCase() == "top") {
          g_top.appendChild(g_shieldsContainerElmt);
          g_top.appendChild(g_controlTextElmt);
          g_top.appendChild(g_actionMessageElmt);
          g_top.style.padding = "0.5rem 0rem 0.5rem 0rem";
        } else if (panel.sign.globalPositioning.toLowerCase() == "bottom") {
          g_bottom.appendChild(g_shieldsContainerElmt);
          g_bottom.appendChild(g_controlTextElmt);
          g_bottom.appendChild(g_actionMessageElmt);
          g_bottom.style.padding = "0.5rem 0rem 0.5rem 0rem";
        } else if (panel.sign.globalPositioning.toLowerCase() == "shield top") {
          g_top.appendChild(g_shieldsContainerElmt);
          g_bottom.appendChild(g_controlTextElmt);
          g_bottom.appendChild(g_actionMessageElmt);
          g_top.style.padding = "0.5rem 0rem 0.5rem 0rem";
          g_bottom.style.padding = "0.5rem 0rem 0.5rem 0rem";
        } else if (
          panel.sign.globalPositioning.toLowerCase() == "control top"
        ) {
          g_bottom.appendChild(g_shieldsContainerElmt);
          g_top.appendChild(g_controlTextElmt);
          g_top.appendChild(g_actionMessageElmt);
          g_top.style.padding = "0.5rem 0rem 0.5rem 0rem";
          g_bottom.style.padding = "0.5rem 0rem 0.5rem 0rem";
        }
      }
      */

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
      sideLeftArrowElmt.src = "img/arrows/A-4.svg";
      signHolderElmt.appendChild(sideLeftArrowElmt);

      // subpanels

      for (
        let subPanelIndex = 0;
        subPanelIndex < panel.sign.subPanels.length;
        subPanelIndex++
      ) {
        const subPanel = panel.sign.subPanels[subPanelIndex];
        let locked = false;

        if (subPanelIndex > 0) {
          const subPanel = panel.sign.subPanels[subPanelIndex];
          const subDivider = document.createElement("div");
          subDivider.className = "subDivider";
          subDivider.id = "subDivider" + subPanelIndex.toString();
          const dividerHeight = (subPanel && subPanel.height) || "";
          if (
            subPanel &&
            subPanel.customDividerHeight &&
            typeof dividerHeight === "string" &&
            dividerHeight.trim().length
          ) {
            subDivider.style.height = dividerHeight;
          } else {
            subDivider.style.removeProperty("height");
          }
          subDivider.style.alignSelf = "stretch";
          signHolderElmt.appendChild(subDivider);
        }

        const new_subPanel = document.createElement("div");
        new_subPanel.className = "subPanelDisplay";
        new_subPanel.id = "S_subPanel" + subPanelIndex.toString();
        signHolderElmt.appendChild(new_subPanel);

        const signContentContainerElmt = document.createElement("div");
        signContentContainerElmt.className = `signContentContainer shieldPosition${panel.sign.shieldPosition}`;
        signContentContainerElmt.id =
          "signContentContainer" + subPanelIndex.toString();
        signHolderElmt.appendChild(signContentContainerElmt);

        const shieldsContainerElmt = document.createElement("div");
        shieldsContainerElmt.className = `shieldsContainer ${
          panel.sign.shieldBacks ? "shieldBacks" : ""
        }`;
        shieldsContainerElmt.id = "shieldsContainer" + subPanelIndex.toString();
        signContentContainerElmt.appendChild(shieldsContainerElmt);

        /*
        const controlTextElmt = document.createElement("p");
        controlTextElmt.className = "controlText";
        controlTextElmt.id = "controlText" + subPanelIndex.toString();
        signContentContainerElmt.appendChild(controlTextElmt);
        

        const actionMessageElmt = document.createElement("div");
        actionMessageElmt.className = `actionMessage`;
        actionMessageElmt.id = "actionMessage" + subPanelIndex.toString();
        signContentContainerElmt.appendChild(actionMessageElmt);
        */

        const blockElement = subPanel.blockElements.createElement(
          panel,
          subPanel
        );
        signContentContainerElmt.appendChild(blockElement);

        // Shields
        createShield(subPanel.shields, shieldsContainerElmt);

        // sign
        signContentContainerElmt.style.padding = panel.sign.padding;
        /*
        monitorControlText(subPanel, controlTextElmt);

        if (post.fontType == true) {
          controlTextElmt.style.fontFamily = "Series EM";
        }

        //monitorActionMessage(subPanel, actionMessageElmt);
        */
      }

      const sideRightArrowElmt = document.createElement("img");
      sideRightArrowElmt.className = "sideRightArrow";
      sideRightArrowElmt.src = "img/arrows/A-1.svg";
      signHolderElmt.appendChild(sideRightArrowElmt);

      // Guide arrows

      const ExitKeys = ["EA", "EB", "EC"];
      const MainKeys = ["A", "B", "C", "D", "E"];
      var path;

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
            downArrowElmt.src = "img/arrowBlocks/DOWN_CA.svg";
            downArrowElmt.classList.add("canadianDownArrow");
          } else {
            downArrowElmt.src = "img/arrows/" + key + ".svg";
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
          panel.sign.exitOnlyBorderMode
        )
          ? panel.sign.exitOnlyBorderMode
          : exitOnlyBorderModes[0];
        const hideExitOnlyArrows = panel.sign.hideExitArrow === true;
        arrowContElmt.classList.toggle("hideExitOnlyArrows", hideExitOnlyArrows);
        if (
          !post.secondExitOnly &&
          panel.sign.guideArrow != "Split Exit Only" &&
          panel.sign.guideArrow != "Half Exit Only"
        ) {
          guideArrowsElmt.style.padding = panel.sign.exitOnlyPadding + "rem";
        }

        if (
          panel.sign.guideArrow == "Exit Only" &&
          !post.secondExitOnly
        ) {
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
            panel.sign.arrowPosition.toLowerCase()
          );

          if (panel.sign.arrowPosition.toLowerCase() == "left") {
            arrowContElmt.appendChild(secondaryContainer);
            arrowContElmt.appendChild(arrow);

            if (panel.sign.guideArrowLanes > 1) {
              var marginLeft = 4;

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
              var marginLeft = 11;

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
              document.createTextNode(panel.sign.advisoryText)
            );
            path.appendChild(actionMessage);
          } else {
            const resolveExitOnlyText = (text, fallback) =>
              typeof text === "string" ? text : fallback;
            const exitOnlyLabelLeft = resolveExitOnlyText(
              panel.sign.exitOnlyLeftText,
              "EXIT"
            ).trim();
            const exitOnlyLabelRight = resolveExitOnlyText(
              panel.sign.exitOnlyRightText,
              "ONLY"
            ).trim();
            const exitOnlyLabelFull = [exitOnlyLabelLeft, exitOnlyLabelRight]
              .filter((text) => text && text.length > 0)
              .join(" ")
              .trim();
            const isSplitExitOnly = panel.sign.guideArrow == "Split Exit Only";
            const shouldRenderLabel = (text) =>
              !(panel.sign.showExitOnly == false &&
                isSplitExitOnly &&
                (!text || text.length === 0));
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
                        document.createTextNode(exitOnlyLabelFull)
                      );

                      var bonus = "";

                      if (panel.sign.guideArrow == "Split Exit Only") {
                        bonus = " yellowElmt";
                      }

                      textExitOnlySpanElmt.className = "exitOnlyText" + bonus;
                    } else {
                      textExitOnlySpanElmt.appendChild(
                        document.createTextNode("⠀⠀⠀⠀ ⠀⠀⠀⠀")
                      );
                      textExitOnlySpanElmt.className = "exitOnlyText";
                    }
                    path.appendChild(textExitOnlySpanElmt);
                  }

                  if (panel.sign.guideArrow == "Split Exit Only") {
                    path.appendChild(
                      createArrowElmt(
                        panel.sign.exitguideArrows.split(":")[1],
                        "MainArrows!ExitOnly"
                      )
                    );
                  } else {
                    path.appendChild(
                      createArrowElmt(panel.sign.exitguideArrows.split(":")[1])
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
                        "MainArrows!ExitOnly"
                      )
                    );
                  } else {
                    path.appendChild(
                      createArrowElmt(panel.sign.exitguideArrows.split(":")[1])
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
                        document.createTextNode(exitOnlyLabelLeft)
                      );

                      var bonus = "";

                      if (panel.sign.guideArrow == "Split Exit Only") {
                        bonus = " yellowElmt";
                      }

                      textExitSpanElmt.className = "exitOnlyText" + bonus;
                    } else {
                      textExitSpanElmt.appendChild(
                        document.createTextNode("⠀⠀⠀⠀")
                      );
                      textExitSpanElmt.className = "exitOnlyText";
                    }

                    path.appendChild(textExitSpanElmt);
                  }

                  if (panel.sign.guideArrow == "Split Exit Only") {
                    path.appendChild(
                      createArrowElmt(
                        panel.sign.exitguideArrows.split(":")[1],
                        "MainArrows!ExitOnly"
                      )
                    );
                  } else {
                    path.appendChild(
                      createArrowElmt(panel.sign.exitguideArrows.split(":")[1])
                    );
                  }

                  if (shouldRenderLabel(exitOnlyLabelRight)) {
                    const textOnlySpanElmt = document.createElement("span");
                    if (panel.sign.showExitOnly == false) {
                      textOnlySpanElmt.appendChild(
                        document.createTextNode(exitOnlyLabelRight)
                      );

                      var bonus = "";

                      if (panel.sign.guideArrow == "Split Exit Only") {
                        bonus = " yellowElmt";
                      }

                      textOnlySpanElmt.className = "exitOnlyText" + bonus;
                    } else {
                      textOnlySpanElmt.appendChild(
                        document.createTextNode("⠀⠀⠀⠀")
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
                        "MainArrows!ExitOnly"
                      )
                    );
                  } else {
                    path.appendChild(
                      createArrowElmt(panel.sign.exitguideArrows.split(":")[1])
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
                        "MainArrows!ExitOnly"
                      )
                    );
                  } else {
                    path.appendChild(
                      createArrowElmt(panel.sign.exitguideArrows.split(":")[1])
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
                    .replace(/ /g, "")
                ),
                arrowContElmt.childNodes[0]
              );
            } else {
              arrowContElmt.appendChild(
                createArrowElmt(
                  panel.sign.guideArrow.split(":")[1],
                  "MainArrows",
                  "arrow",
                  panel.sign.guideArrow.split(":")[0]
                )
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
          markerElmt.data = "img/other-symbols/QC-Exit.svg";
          if (panel.sign.otherSymbol == "Quebec-Left") {
            otherSymbolsElmt.className += " left";
          }
          otherSymbolsElmt.appendChild(markerElmt);
        default:
      }

      var width = signCont.clientWidth;
      var exitWidth = firstExitTab.clientWidth;

      if (exitWidth > width) {
        signCont.style.width = firstExitTab.clientWidth + "px";
      }

      schedulePanelBorderGradientUpdate(panelElmt);
    }
  };

  // Expose necessary variables and functions to formHandler
  const exposeToFormHandler = {
    getCurrentPanel,
    getCurrentSubPanel,
    getCurrentBlockRows,
    getCurrentBlockElem,
    getPost: () => post,
    checkSpecialShield,
    redraw,
    setSelectedRow,
    setSelectedControlElem,
    moveControlElem,
    changeEditingPanel,
    movePanel,
    newPanel,
    //duplicatePanel,
    deletePanel,
    changeEditingSubPanel,
    changeEditingExitTab,
    newExitTab,
    duplicateExitTab,
    removeExitTab,
    moveExitTab,
    newNestExitTab,
    deleteNestExitTab,
    setPanelSpacing,
    duplicateBlockIntoNewRow,
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
    if (typeof post.panelSpacing !== "number" || post.panelSpacing < 0) {
      post.panelSpacing = 0;
    }
    if (typeof post.normalizeThickness === "function") {
      post.thickness = post.normalizeThickness(post.thickness);
    } else {
      post.thickness = normalizePostThickness(post.thickness);
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
    setPanelSpacing: setPanelSpacing,
    newShield: newShield,
    clearShields: clearShields,
    newSubPanel: addSubPanel,
    removeSubPanel: removeSubPanel,
    changeEditingSubPanel: changeEditingSubPanel,
    duplicateSubPanel: duplicateSubPanel,
    downloadSign: downloadSign,
    updatePreview: updatePreview,
    updateFileType: updateFileType,
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
    post: post,

    newRow: newRow,
    dupRow: dupRow,
    delRow: delRow,
    newControlElem: newControlElem,
    delControlElem: delControlElem,

    exposeToFormHandler,
  };
})();
