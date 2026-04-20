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

  let currentlySelectedAPLArrowIndex = 0;
  const SESSION_STORAGE_KEY = "signMaker.session";
  const SESSION_STORAGE_VERSION = 1;
  let isSessionPersisting = false;

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
    return typeof Post.prototype.defaultThickness === "number"
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
    if (!signElmt || !signElmt.isConnected) {
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

  const applyVerticalDividerLaneBleed = (signElmt) => {
    if (!signElmt || !signElmt.isConnected) {
      return;
    }

    const verticalDividers = signElmt.querySelectorAll(
      ".dividerElement.vertical.fullBleed"
    );
    if (!verticalDividers.length) {
      return;
    }

    for (const dividerEl of verticalDividers) {
      dividerEl.style.setProperty("--dividerLaneBleedTop", "0px");
      dividerEl.style.setProperty("--dividerLaneBleedBottom", "0px");

      const laneEl = dividerEl.parentElement;
      if (!laneEl) {
        continue;
      }

      const laneRect = laneEl.getBoundingClientRect();
      const dividerRect = dividerEl.getBoundingClientRect();
      if (!laneRect.height || !dividerRect.height) {
        continue;
      }

      const laneBleedTop = Math.max(0, dividerRect.top - laneRect.top);
      const laneBleedBottom = Math.max(0, laneRect.bottom - dividerRect.bottom);

      dividerEl.style.setProperty("--dividerLaneBleedTop", `${laneBleedTop}px`);
      dividerEl.style.setProperty(
        "--dividerLaneBleedBottom",
        `${laneBleedBottom}px`
      );
    }
  };

  const schedulePanelBorderGradientUpdate = (panelContainerElmt) => {
    if (!panelContainerElmt) {
      return;
    }

    const update = () => {
      const signs = panelContainerElmt.querySelectorAll(".sign");
      for (const signElmt of signs) {
        applyVerticalDividerLaneBleed(signElmt);
        applyPanelBorderGradient(signElmt);
      }
    };

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(update);
    } else {
      update();
    }
  };

  const getSelectionState = () => ({
    currentlySelectedPanelIndex,
    currentlySelectedSubPanelIndex,
    currentlySelectedExitTabIndex,
    currentlySelectedNestedExitTabIndex,
    currentlySelectedRowIndex,
    currentlySelectedBlockIndex,
    currentlySelectedAPLArrowIndex,
  });

  const persistSessionState = ({ syncForm = false } = {}) => {
    if (
      isSessionPersisting ||
      !post ||
      !Array.isArray(post.panels) ||
      post.panels.length === 0
    ) {
      return;
    }

    if (syncForm && formHandler && typeof formHandler.readForm === "function") {
      isSessionPersisting = true;
      try {
        formHandler.readForm();
      } catch (error) {
        console.warn("Unable to sync form before saving session", error);
      } finally {
        isSessionPersisting = false;
      }
    }

    try {
      const sessionData = {
        version: SESSION_STORAGE_VERSION,
        savedAt: new Date().toISOString(),
        post: JSON.parse(serializePostWithElementTypes()),
        selection: getSelectionState(),
        fileInfo: { ...fileInfo },
      };
      window.localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(sessionData)
      );
    } catch (error) {
      console.warn("Unable to save SignMaker session", error);
    }
  };

  const restoreSavedSession = () => {
    try {
      const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!storedSession) {
        return false;
      }

      const sessionData = JSON.parse(storedSession);
      const postData = sessionData && (sessionData.post || sessionData);
      if (!postData || !Array.isArray(postData.panels) || !postData.panels.length) {
        return false;
      }

      if (sessionData.fileInfo && typeof sessionData.fileInfo === "object") {
        fileInfo = { ...fileInfo, ...sessionData.fileInfo };
      }

      setPost(reconstructPostFromData(postData), sessionData.selection);
      return true;
    } catch (error) {
      console.warn("Unable to restore SignMaker session", error);
      try {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (storageError) {
        console.warn("Unable to clear invalid SignMaker session", storageError);
      }
      return false;
    }
  };

  // Initialize the application, and populates dropdowns and the default post.

  const init = async function () {
    post = new Post(Post.prototype.polePositions[0]);
    await formHandler.init(exposeToFormHandler);

    // Initialize CustomShields after formHandler and wait for it
    window.customShields = new CustomShields();
    await window.customShields.initialized;

    window.addEventListener("beforeunload", () => {
      persistSessionState({ syncForm: true });
    });

    if (!restoreSavedSession()) {
      newPanel();
    }
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
    if (
      !post ||
      !Array.isArray(post.panels) ||
      currentlySelectedPanelIndex < 0 ||
      currentlySelectedPanelIndex >= post.panels.length
    ) {
      return;
    }

    post.duplicatePanel(currentlySelectedPanelIndex);
    currentlySelectedPanelIndex = clamp(
      currentlySelectedPanelIndex + 1,
      0,
      post.panels.length - 1
    );
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

    const resultingIndex = post.movePanel(normalizedFrom, normalizedTo);

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

  // --- Rendered Panel Drag and Drop ---
  let renderedPanelDragState = null;

  const toggleRenderedPanelWiggle = (isActive) => {
    const panels = document.querySelectorAll("#panelContainer > .panel");
    for (const panel of panels) {
      panel.classList.toggle("panelWiggle", isActive);
      if (isActive) {
        panel.style.setProperty("--wiggle-delay", `${Math.random() * 0.12}s`);
      } else {
        panel.style.removeProperty("--wiggle-delay");
      }
    }
  };

  const clearRenderedPanelDropIndicators = () => {
    document
      .querySelectorAll(".panel.dropBefore, .panel.dropAfter")
      .forEach((el) => el.classList.remove("dropBefore", "dropAfter"));
  };

  const endRenderedPanelDrag = () => {
    toggleRenderedPanelWiggle(false);
    clearRenderedPanelDropIndicators();
    document
      .querySelectorAll(".panel.dragging")
      .forEach((el) => {
        el.classList.remove("dragging");
        delete el.dataset.dragging;
      });
    renderedPanelDragState = null;
  };

  const getRenderedPanelDropPosition = (container, clientX) => {
    const panels = Array.from(container.querySelectorAll(".panel"));
    if (!panels.length) {
      return { dropIndex: 0, targetPanel: null, placement: null };
    }

    let dropIndex = panels.length;
    let targetPanel = null;
    let placement = "after";
    let foundPosition = false;

    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const rect = panel.getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      if (clientX < midpoint) {
        dropIndex = i;
        placement = "before";
        foundPosition = true;
        targetPanel = panel.dataset.dragging === "true" ? null : panel;
        break;
      }
    }

    if (!foundPosition) {
      const lastPanel = panels[panels.length - 1];
      if (lastPanel.dataset.dragging !== "true") {
        targetPanel = lastPanel;
        placement = "after";
      } else {
        placement = null;
      }
    } else if (!targetPanel) {
      placement = null;
    }

    return { dropIndex, targetPanel, placement };
  };

  const handleRenderedPanelDragStart = (event) => {
    const panel = event.currentTarget;
    const fromIndex = Number(panel.dataset.panelIndex);
    if (Number.isNaN(fromIndex)) {
      return;
    }
    renderedPanelDragState = { fromIndex, dropIndex: fromIndex };
    panel.dataset.dragging = "true";
    panel.classList.add("dragging");
    toggleRenderedPanelWiggle(true);
    clearRenderedPanelDropIndicators();

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setData("text/plain", "");
    }
  };

  const handleRenderedPanelDragOver = (event) => {
    if (!renderedPanelDragState) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }

    const container = document.getElementById("panelContainer");
    if (!container) {
      return;
    }
    const { dropIndex, targetPanel, placement } = getRenderedPanelDropPosition(
      container,
      event.clientX
    );
    renderedPanelDragState.dropIndex = dropIndex;

    clearRenderedPanelDropIndicators();
    if (targetPanel && placement) {
      targetPanel.classList.add(
        placement === "before" ? "dropBefore" : "dropAfter"
      );
    }
  };

  const handleRenderedPanelDrop = (event) => {
    if (!renderedPanelDragState) {
      return;
    }
    event.preventDefault();
    const fromIndex = renderedPanelDragState.fromIndex;
    const dropIndex =
      renderedPanelDragState.dropIndex !== undefined
        ? renderedPanelDragState.dropIndex
        : fromIndex;
    movePanel(fromIndex, dropIndex);
    endRenderedPanelDrag();
  };

  const handleRenderedPanelDragLeave = (event) => {
    if (!renderedPanelDragState) {
      return;
    }
    const container = document.getElementById("panelContainer");
    const related = event.relatedTarget;
    if (related && container && container.contains(related)) {
      return;
    }
    clearRenderedPanelDropIndicators();
  };

  const handleRenderedPanelDragEnd = () => {
    if (renderedPanelDragState) {
      endRenderedPanelDrag();
    }
  };

  // Set the current panel based off parameter number, within the correct range (0 < # of panels - 1)

  const changeEditingPanel = function (panelNumber) {
    currentlySelectedPanelIndex = clamp(panelNumber, 0, post.panels.length - 1);
    currentlySelectedSubPanelIndex = 0;
    // Reset row and block indices to prevent accessing non-existent elements
    currentlySelectedRowIndex = 0;
    currentlySelectedBlockIndex = 0;
    formHandler.updateForm();

    // Flash the selected panel
    const panelElmt = document.getElementById("panel" + currentlySelectedPanelIndex);
    if (panelElmt) {
      const signElmt = panelElmt.querySelector(".sign");
      if (signElmt) {
        flashElement(signElmt);
      }
    }
    persistSessionState();
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
    // Reset row and block indices to prevent accessing non-existent elements
    currentlySelectedRowIndex = 0;
    currentlySelectedBlockIndex = 0;
    formHandler.updateForm();

    // Flash the selected subpanel
    const panelElmt = document.getElementById(
      "panel" + currentlySelectedPanelIndex
    );
    const subPanelElmt = panelElmt
      ? panelElmt.querySelector("#S_subPanel" + currentlySelectedSubPanelIndex)
      : null;
    if (subPanelElmt) {
      flashElement(subPanelElmt);
    }
    persistSessionState();
  };

  const flashElement = (targetElmt) => {
    if (!targetElmt) return;
    if (post && post.disableFlash) return;

    const postContainer = document.getElementById("postContainer");
    if (!postContainer) return;

    const rect = targetElmt.getBoundingClientRect();
    const containerRect = postContainer.getBoundingClientRect();

    const overlay = document.createElement("div");
    overlay.className = "flash-selection";
    overlay.style.top = (rect.top - containerRect.top) + "px";
    overlay.style.left = (rect.left - containerRect.left) + "px";
    overlay.style.width = rect.width + "px";
    overlay.style.height = rect.height + "px";

    postContainer.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
    }, 500);
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
    persistSessionState();
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
  const newRow = (selectedBlock, evt) => {
    const blockElems = getCurrentSubPanel().blockElements;
    const insertAbove = evt && evt.shiftKey;
    currentlySelectedBlockIndex = 0;
    if (insertAbove) {
      blockElems.addRow(currentlySelectedRowIndex, selectedBlock);
    } else {
      blockElems.addRow(++currentlySelectedRowIndex, selectedBlock);
    }
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

  const moveRow = (fromIndex, toIndex) => {
    const blockElements = getCurrentSubPanel().blockElements;
    const rows = blockElements.rows;
    const blockProps = blockElements.blockProperties;
    const rowCount = rows.length;

    if (rowCount < 2) {
      return fromIndex;
    }

    const clampIdx = (val, max) => Math.max(0, Math.min(val, max));
    const normalizedFrom = clampIdx(fromIndex, rowCount - 1);
    let normalizedTo = clampIdx(toIndex, rowCount);

    if (normalizedFrom === normalizedTo || normalizedFrom + 1 === normalizedTo) {
      return normalizedFrom;
    }

    const [movedRow] = rows.splice(normalizedFrom, 1);
    const [movedProps] = blockProps.splice(normalizedFrom, 1);

    if (normalizedTo > normalizedFrom) {
      normalizedTo--;
    }

    rows.splice(normalizedTo, 0, movedRow);
    blockProps.splice(normalizedTo, 0, movedProps);

    currentlySelectedRowIndex = normalizedTo;
    currentlySelectedBlockIndex = 0;
    formHandler.updateForm();
    redraw();
    return normalizedTo;
  };

  const setSelectedRow = (row) => {
    currentlySelectedRowIndex = clamp(
      row,
      0,
      getCurrentSubPanel().blockElements.rows.length - 1
    );
    formHandler.updateForm();
    persistSessionState();
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

    // Flash the selected block element on the sign
    const panelElmt = document.getElementById(
      "panel" + currentlySelectedPanelIndex
    );
    const subPanelContainer = panelElmt
      ? panelElmt.querySelector(
          `.blockElementMaster[data-subpanel="${currentlySelectedSubPanelIndex}"]`
        )
      : null;
    if (subPanelContainer) {
      const signBlockElmt = subPanelContainer.querySelector(
        `[data-sign-row="${currentlySelectedRowIndex}"][data-sign-block="${currentlySelectedBlockIndex}"]`
      );
      if (signBlockElmt) {
        flashElement(signBlockElmt);
      }
    }
    persistSessionState();
  };

  const duplicateControlElem = () => {
    const subPanel = getCurrentSubPanel();
    if (!subPanel || !subPanel.blockElements) {
      return;
    }
    const blockElements = subPanel.blockElements;
    const rows = blockElements.rows || [];
    const row = rows[currentlySelectedRowIndex];
    if (!Array.isArray(row) || !row.length) {
      return;
    }
    const sourceBlock = row[currentlySelectedBlockIndex];
    if (!sourceBlock) {
      return;
    }
    const blockElemType =
      Control.prototype.blockToClassElems.getElem(sourceBlock);
    const Constructor = blockElemType
      ? Control.prototype.blockToClassElems[blockElemType]
      : null;
    if (typeof Constructor !== "function") {
      return;
    }
    const duplicatedBlock = Object.assign(new Constructor(), sourceBlock);
    const insertIndex = clamp(
      currentlySelectedBlockIndex + 1,
      0,
      row.length
    );
    row.splice(insertIndex, 0, duplicatedBlock);
    currentlySelectedBlockIndex = insertIndex;
    formHandler.updateForm();
    redraw();
  };

  // APL Arrow Management Functions
  const addAPLArrow = function (type = "APL_UP") {
    const sign = getCurrentPanel().sign;
    sign.newAPLArrow(type);
    currentlySelectedAPLArrowIndex = sign.aplArrows.length - 1;
    formHandler.updateForm();
    redraw();
  };

  const removeAPLArrow = function () {
    const sign = getCurrentPanel().sign;
    if (sign.aplArrows.length === 0) {
      return;
    }
    sign.deleteAPLArrow(currentlySelectedAPLArrowIndex);
    if (currentlySelectedAPLArrowIndex >= sign.aplArrows.length) {
      currentlySelectedAPLArrowIndex = Math.max(0, sign.aplArrows.length - 1);
    }
    formHandler.updateForm();
    redraw();
  };

  const selectAPLArrow = function (index) {
    const sign = getCurrentPanel().sign;
    currentlySelectedAPLArrowIndex = clamp(index, 0, Math.max(0, sign.aplArrows.length - 1));
    formHandler.updateForm();
    persistSessionState();
  };

  const updateAPLArrowType = function (type) {
    const sign = getCurrentPanel().sign;
    if (sign.aplArrows.length > 0 && currentlySelectedAPLArrowIndex < sign.aplArrows.length) {
      sign.updateAPLArrowType(currentlySelectedAPLArrowIndex, type);
      formHandler.updateForm();
      redraw();
    }
  };

  const toggleAPLArrowFlip = function (index) {
    const sign = getCurrentPanel().sign;
    const targetIndex = typeof index === 'number' ? index : currentlySelectedAPLArrowIndex;
    if (sign.aplArrows.length > 0 && targetIndex >= 0 && targetIndex < sign.aplArrows.length) {
      sign.toggleAPLArrowFlip(targetIndex);
      formHandler.updateForm();
      redraw();
    }
  };

  const addAPLDivider = function (arrowIndex) {
    const sign = getCurrentPanel().sign;
    if (arrowIndex >= 0 && arrowIndex < sign.aplArrows.length) {
      const arrow = sign.aplArrows[arrowIndex];
      if (arrow.dividerAfter) {
        // Toggle off - remove divider
        sign.setAPLDivider(arrowIndex, false);
        // Remove the associated subpanel if there are more than 1
        if (sign.subPanels.length > 1) {
          sign.deleteSubPanel(sign.subPanels.length - 2);
          currentlySelectedSubPanelIndex = Math.max(0, currentlySelectedSubPanelIndex - 1);
        }
      } else {
        // Toggle on - add divider and create subpanel
        if (confirm("This will add a new subpanel. Continue?")) {
          sign.setAPLDivider(arrowIndex, true);
          sign.newSubPanel();
          currentlySelectedSubPanelIndex++;
        }
      }
      formHandler.updateForm();
      redraw();
    }
  };

  const buildMileageTemplate = () => {
    const destinations = ["A", "B", "C"];
    const rows = destinations.map((label) => [
      new ControlTextElement({ textContent: `Destination ${label}` }),
      new DividerElement({ visible: false, dividerWidth: 3, dividerMeasurement: "rem" }),
      new ControlTextElement({ textContent: "X" }),
    ]);
    const blockProperties = rows.map(() => new Block());
    return { rows, blockProperties };
  };

  const buildSimpleExitTemplate = () => {
    const actionMessage = new ActionMessageElement();
    actionMessage.textContent = "Distance";
    actionMessage.fontFamily = "Series EM";

    const rows = [
      [new ShieldElement({ shieldBase: "I", routeNumber: "X" })],
      [new ControlTextElement({ textContent: "Destination" })],
      [actionMessage],
    ];
    const blockProperties = [new Block(), new Block(), new Block()];
    return { rows, blockProperties };
  };

  const buildTolledExitTemplate = () => {
    const rows = [
      [
        new TollLogoElement({ logo: "MUTCD", logoHeight: 2 }),
        new ControlTextElement({
          textContent: "OR",
          fontSize: 50,
          fontFamily: "Series E",
          textColor: "Black",
        }),
        new ControlTextElement({
          textContent: "PAY BY\\nPLATE",
          fontSize: 50,
          fontFamily: "Series E",
          textColor: "Black",
        }),
      ],
      [
        new DividerElement({
          dividerWidth: 100,
          dividerMeasurement: "%",
          dividerColor: "Black",
          fullBleed: true,
        }),
      ],
      [new ControlTextElement({ textContent: "Destination" })],
    ];
    const blockProperties = [
      new Block({ backgroundColor: "White", bottomPadding: 0.25 }),
      new Block(),
      new Block(),
    ];
    return { rows, blockProperties };
  };

  const buildControlCitiesAdvanceJunctionTemplate = () => {
    const actionMessage = new ActionMessageElement();
    actionMessage.textContent = "Distance";
    actionMessage.fontFamily = "Series EM";

    const rows = [
      [
        new ShieldElement({
          shieldBase: "I",
          routeNumber: "X",
          bannerType: "Jct",
          bannerPosition: "Left",
        }),
      ],
      [new ControlTextElement({ textContent: "Destination A\\nDestination B" })],
      [actionMessage],
    ];
    const blockProperties = [new Block(), new Block(), new Block()];
    return { rows, blockProperties };
  };

  const applyTemplate = (templateName) => {
    const confirmationMessage =
      "Are you sure you want to apply this template? THIS WILL OVERRIDE YOUR CURRENT SUBPANEL!";
    if (!window.confirm(confirmationMessage)) {
      return;
    }
    const subPanel = getCurrentSubPanel();
    if (!subPanel) {
      return;
    }
    let templateData = null;
    switch (templateName) {
      case "mileage-sign":
        templateData = buildMileageTemplate();
        break;
      case "simple-exit":
        templateData = buildSimpleExitTemplate();
        break;
      case "tolled-exit":
        templateData = buildTolledExitTemplate();
        break;
      case "control-cities-advance-junction":
        templateData = buildControlCitiesAdvanceJunctionTemplate();
        break;
      default:
        return;
    }
    subPanel.blockElements = new Control(templateData);
    currentlySelectedRowIndex = 0;
    currentlySelectedBlockIndex = 0;
    formHandler.updateForm();
    redraw();
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
    persistSessionState();

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
    persistSessionState();
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
    const availablePolePositions = Post.prototype.polePositions;
    const polePosition = availablePolePositions.includes(post.polePosition)
      ? post.polePosition
      : availablePolePositions[0];
    const polePositionClass = `polePosition${polePosition}`;
    const availableColors = Post.prototype.colors;
    const normalizedPostColor = availableColors.includes(post.color)
      ? post.color
      : availableColors[0];
    const colorClass = normalizedPostColor ? ` postColor${normalizedPostColor}` : "";
    postContainerElmt.className = `${polePositionClass}${colorClass}`;
    const normalizedThickness = post.normalizeThickness(post.thickness);
    post.thickness = normalizedThickness;
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
      const polePosition = (post.polePosition || "").toLowerCase();
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
      // Attach drag handlers to panelContainer once
      if (!panelContainerElmt.dataset.panelDragAttached) {
        panelContainerElmt.addEventListener("dragover", handleRenderedPanelDragOver);
        panelContainerElmt.addEventListener("drop", handleRenderedPanelDrop);
        panelContainerElmt.addEventListener("dragleave", handleRenderedPanelDragLeave);
        panelContainerElmt.dataset.panelDragAttached = "true";
      }
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
      const numericPanelBorderRadius =
        typeof panel.borderRadius === "number"
          ? panel.borderRadius
          : parseFloat(panel.borderRadius);
      const panelBorderRadius = Number.isFinite(numericPanelBorderRadius)
        ? Math.max(0, numericPanelBorderRadius)
        : Panel.prototype.defaultBorderRadius;
      panelElmt.style.setProperty(
        "--signBorderRadius",
        panelBorderRadius + "rem"
      );
      panelElmt.id = "panel" + index;
      panelElmt.dataset.panelIndex = index.toString();
      panelElmt.draggable = post.panels.length > 1;
      panelElmt.addEventListener("dragstart", handleRenderedPanelDragStart);
      panelElmt.addEventListener("dragend", handleRenderedPanelDragEnd);
      const panelClickIndex = index;
      panelElmt.addEventListener("click", () => {
        changeEditingPanel(panelClickIndex);
      });
      panelContainerElmt.appendChild(panelElmt);

      // Store CA style exit tabs to append inside sign later
      const caStyleExitTabs = [];

      for (
        let exitTabIndex = panel.exitTabs.length - 1;
        exitTabIndex > -1;
        exitTabIndex--
      ) {
        var exitTab = panel.exitTabs[exitTabIndex];

        const exitTabCont = document.createElement("div");
        exitTabCont.className = `exitTabContainer ${exitTab.position.toLowerCase()} ${exitTab.width.toLowerCase()}`;

        // If CA style, don't append to panel yet - store for later insertion inside sign
        if (exitTab.caStyle && exitTab.variant == "Default") {
          caStyleExitTabs.push({ exitTabCont, exitTabIndex });
        } else {
          panelElmt.appendChild(exitTabCont);
        }

        // Apply nested tab spacing CSS variable
        const nestedTabSpacingValue =
          typeof exitTab.nestedTabSpacing === "number" && exitTab.nestedTabSpacing > 0
            ? exitTab.nestedTabSpacing
            : 0;
        exitTabCont.style.setProperty("--nestedTabSpacing", nestedTabSpacingValue + "rem");

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
          const numericBorderThickness =
            typeof exitTab.borderThickness === "number"
              ? exitTab.borderThickness
              : parseFloat(exitTab.borderThickness);
          const normalizedBorderThickness =
            Number.isFinite(numericBorderThickness) && numericBorderThickness >= 0
              ? numericBorderThickness
              : ExitTab.prototype.defaultBorderThickness;
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

              // Handle vertical arrangement
              if (exitTab.verticalArrangement && txtArr.length > 1) {
                // #region agent log
                fetch('http://127.0.0.1:7244/ingest/6501febc-ac26-4bc0-8a4d-3e287db43aa8', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'main.js:1564', message: 'Vertical arrangement active', data: { verticalArrangement: exitTab.verticalArrangement, leadingText: txtArr[0], number: txtArr[1], minHeight: exitTab.minHeight }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A,B' }) }).catch(() => { });
                // #endregion
                const verticalContainer = document.createElement("div");
                verticalContainer.className = "exitTabVerticalContainer";
                registerExitTabText(verticalContainer);

                const leadingText = txtArr[0] || "";
                if (leadingText && leadingText.trim().length > 0) {
                  const topTextElmt = document.createElement("div");
                  topTextElmt.className = "exitTabVerticalText";
                  registerExitTabText(topTextElmt);
                  if (usesHighwayGothicFont) {
                    topTextElmt.style.setProperty(
                      "--exitTabAdditionalOffset",
                      "-0.5px"
                    );
                  }
                  topTextElmt.appendChild(document.createTextNode(leadingText));
                  if (exitTab.topOffset == false) {
                    topTextElmt.style.setProperty("--exitTabTextBaseOffset", "0rem");
                  }
                  verticalContainer.appendChild(topTextElmt);
                }

                const bottomNumberElmt = document.createElement("div");
                bottomNumberElmt.className = "exitTabVerticalNumber";
                registerExitTabText(bottomNumberElmt);
                const spanNumeralElmt = document.createElement("span");
                spanNumeralElmt.className = "numeral";
                registerExitTabText(spanNumeralElmt);
                spanNumeralElmt.appendChild(document.createTextNode(txtArr[1]));
                bottomNumberElmt.appendChild(spanNumeralElmt);
                const trailingText = txtArr.slice(2).join("");
                if (trailingText) {
                  const trailingSpanElmt = document.createElement("span");
                  trailingSpanElmt.className = "numeral exitTabTrailing";
                  trailingSpanElmt.textContent = trailingText;
                  registerExitTabText(trailingSpanElmt);
                  bottomNumberElmt.appendChild(trailingSpanElmt);
                }
                verticalContainer.appendChild(bottomNumberElmt);
                targetElmt.appendChild(verticalContainer);
                // #region agent log
                setTimeout(() => {
                  const containerStyle = window.getComputedStyle(verticalContainer);
                  const topTextStyle = topTextElmt ? window.getComputedStyle(topTextElmt) : null;
                  const exitTabStyle = exitTabElmt ? window.getComputedStyle(exitTabElmt) : null;
                  fetch('http://127.0.0.1:7244/ingest/6501febc-ac26-4bc0-8a4d-3e287db43aa8', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'main.js:1607', message: 'Vertical container padding computed', data: { containerPaddingTop: containerStyle.paddingTop, containerPaddingBottom: containerStyle.paddingBottom, containerPadding: containerStyle.padding, topTextMarginTop: topTextStyle?.marginTop, topTextPaddingTop: topTextStyle?.paddingTop, exitTabPaddingTop: exitTabStyle?.paddingTop, exitTabPadding: exitTabStyle?.padding }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'padding-source' }) }).catch(() => { });
                }, 100);
                // #endregion
                return;
              }

              // Original horizontal arrangement
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
                  trailingSpanElmt.className = "numeral exitTabTrailing";
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

          if (exitTab.verticalArrangement && exitTab.variant == "Default") {
            exitTabElmt.classList.add("verticalArrangement");
            // #region agent log
            setTimeout(() => {
              const computedStyle = window.getComputedStyle(exitTabElmt);
              fetch('http://127.0.0.1:7244/ingest/6501febc-ac26-4bc0-8a4d-3e287db43aa8', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'main.js:1692', message: 'Vertical arrangement class added - computed padding', data: { verticalArrangement: exitTab.verticalArrangement, computedPaddingTop: computedStyle.paddingTop, computedPaddingRight: computedStyle.paddingRight, computedPaddingBottom: computedStyle.paddingBottom, computedPaddingLeft: computedStyle.paddingLeft, inlinePadding: exitTabElmt.style.padding }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'padding-source' }) }).catch(() => { });
            }, 100);
            // #endregion
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
              const tollLogos = TollLogoElement.prototype.logos;
              const tollLogoKey =
                tollLogos && exitTab.icon && tollLogos[exitTab.icon]
                  ? exitTab.icon
                  : TollLogoElement.prototype.defaultLogo;
              const tollLogoDef = tollLogos && tollLogos[tollLogoKey];
              if (tollLogoDef) {
                const tollLogoImgElmt = document.createElement("img");
                tollLogoImgElmt.src = tollLogoDef.src;
                tollLogoImgElmt.alt = tollLogoDef.label || "Toll logo";
                tollLogoImgElmt.className = "tollLogoImage";
                tollLogoImgElmt.loading = "lazy";
                tollLogoImgElmt.decoding = "async";
                tollLogoHolderElmt.appendChild(tollLogoImgElmt);
              } else if (exitTab.icon) {
                const logoTextElmt = document.createElement("span");
                logoTextElmt.textContent = exitTab.icon.toUpperCase();
                registerExitTabText(logoTextElmt);
                tollLogoHolderElmt.appendChild(logoTextElmt);
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

            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/6501febc-ac26-4bc0-8a4d-3e287db43aa8', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'main.js:1859', message: 'Setting exit tab minHeight', data: { verticalArrangement: exitTab.verticalArrangement, minHeight: exitTab.minHeight, variant: exitTab.variant, resolvedFontSize: resolvedFontSize }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F,G,H' }) }).catch(() => { });
            // #endregion
            // Increase minHeight when vertical arrangement is enabled to accommodate stacked content
            // Large numerals (1.5em scale) need extra space, so increase minHeight more
            if (exitTab.verticalArrangement && exitTab.variant == "Default") {
              const baseMinHeight = parseFloat(exitTab.minHeight) || 2.25;
              // Account for numeral scaling (1.5em) and vertical spacing
              const calculatedMinHeight = Math.max(baseMinHeight * 1.5, 3.75);
              exitTabElmt.style.minHeight = calculatedMinHeight.toString() + "rem";
              // #region agent log
              fetch('http://127.0.0.1:7244/ingest/6501febc-ac26-4bc0-8a4d-3e287db43aa8', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'main.js:1868', message: 'Vertical arrangement minHeight calculated', data: { baseMinHeight: baseMinHeight, calculatedMinHeight: calculatedMinHeight }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'G,H' }) }).catch(() => { });
              // #endregion
            } else {
              exitTabElmt.style.minHeight = exitTab.minHeight.toString() + "rem";
            }
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
          bannerShieldContainerElmt.className = `bannerShieldContainer ${shield.type
            } ${shield.specialBannerType.toLowerCase()} bannerPosition${shield.bannerPosition
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
            "bannerB" +
            (!(shield.indentFirstLetter2 ?? shield.indentFirstLetter)
              ? " noIndent"
              : "");
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
      g_shieldsContainerElmt.className = `shieldsContainer ${panel.sign.shieldBacks ? "shieldBacks" : ""
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

      // APL Arrows Container
      const aplArrowsElmt = document.createElement("div");
      aplArrowsElmt.className = "aplArrows";
      signCont.appendChild(aplArrowsElmt);

      const sideLeftArrowElmt = document.createElement("img");
      sideLeftArrowElmt.className = "sideLeftArrow";
      sideLeftArrowElmt.src = "img/arrows/A-4.svg";
      signHolderElmt.appendChild(sideLeftArrowElmt);

      // subpanels

      // Calculate APL arrow groups before the loop
      const aplArrows = panel.sign.aplArrows || [];
      let arrowGroups = [];
      if (aplArrows.length > 0) {
        let currentGroup = [];
        for (let ai = 0; ai < aplArrows.length; ai++) {
          currentGroup.push({ arrow: aplArrows[ai], index: ai });
          if (aplArrows[ai].dividerAfter && ai < aplArrows.length - 1) {
            arrowGroups.push(currentGroup);
            currentGroup = [];
          }
        }
        if (currentGroup.length > 0) {
          arrowGroups.push(currentGroup);
        }
      }

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

          // Check for grouped divider arrow
          if (arrowGroups.length > 0 && subPanelIndex - 1 < arrowGroups.length) {
            const prevGroup = arrowGroups[subPanelIndex - 1];
            if (prevGroup.length > 0) {
              const lastArrowOfPrevGroup = prevGroup[prevGroup.length - 1].arrow;
              if (lastArrowOfPrevGroup.groupedWithDivider) {
                const arrowDef = ArrowElement.prototype.arrows[lastArrowOfPrevGroup.type];
                if (arrowDef) {
                  const divArrowImg = document.createElement("img");
                  divArrowImg.className = "aplDividerArrow";
                  divArrowImg.dataset.type = lastArrowOfPrevGroup.type;
                  divArrowImg.src = arrowDef.src;
                  divArrowImg.alt = arrowDef.label;

                  // Flip divider arrow if the arrow is flipped
                  if (lastArrowOfPrevGroup.flip) {
                    divArrowImg.style.transform = "scaleX(-1)";
                  }

                  subDivider.appendChild(divArrowImg);
                  subDivider.classList.add("hasArrow");
                }
              }
            }
          }

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
        new_subPanel.appendChild(signContentContainerElmt);

        // Insert CA style exit tabs at the beginning of the first subpanel
        if (subPanelIndex === 0 && caStyleExitTabs.length > 0) {
          caStyleExitTabs.forEach(({ exitTabCont }) => {
            exitTabCont.classList.add("caStyle");
            signContentContainerElmt.appendChild(exitTabCont);
          });
        }

        const shieldsContainerElmt = document.createElement("div");
        shieldsContainerElmt.className = `shieldsContainer ${panel.sign.shieldBacks ? "shieldBacks" : ""
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
        blockElement.dataset.subpanel = subPanelIndex;
        signContentContainerElmt.appendChild(blockElement);

        // Shields
        createShield(subPanel.shields, shieldsContainerElmt);

        // sign
        signContentContainerElmt.style.padding = panel.sign.padding;

        // APL Arrows for this subpanel - always create container if APL arrows exist on sign
        if (panel.sign.aplArrows && panel.sign.aplArrows.length > 0) {
          const subPanelArrowContainer = document.createElement("div");
          subPanelArrowContainer.className = "aplArrows subpanelAplArrows";
          subPanelArrowContainer.style.display = "flex";
          // subPanelArrowContainer.style.justifyContent = "center"; // Moved to CSS
          subPanelArrowContainer.style.gap = "0";

          // Only add arrows if this subpanel has an arrow group
          if (arrowGroups.length > 0 && subPanelIndex < arrowGroups.length) {
            const arrowGroup = arrowGroups[subPanelIndex];
            for (let gi = 0; gi < arrowGroup.length; gi++) {
              const arrowData = arrowGroup[gi];
              const arrow = arrowData.arrow;

              const arrowDef = ArrowElement.prototype.arrows[arrow.type];
              if (arrowDef) {
                const arrowImg = document.createElement("img");
                arrowImg.className = "aplArrow";
                arrowImg.dataset.type = arrow.type;
                arrowImg.src = arrowDef.src;
                arrowImg.alt = arrowDef.label;

                // If this arrow is grouped with divider, make it invisible but keep space
                if (arrow.groupedWithDivider) {
                  arrowImg.style.visibility = "hidden";
                }

                if (arrow.flip) {
                  arrowImg.style.transform = "scaleX(-1)";
                }

                if (arrow.exitOnly) {
                  const container = document.createElement("div");
                  container.className = "aplExitOnlyContainer";
                  container.dataset.arrowType = arrow.type;
                  if (arrow.flip) {
                    container.dataset.flipped = "true";
                  }

                  // Apply arrow margins to container (arrow margin is zeroed inside container)
                  if (arrow.arrowMarginLeft != null) {
                    container.style.marginLeft = arrow.arrowMarginLeft + "rem";
                  }
                  if (arrow.arrowMarginRight != null) {
                    container.style.marginRight = arrow.arrowMarginRight + "rem";
                  }

                  const exitSpan = document.createElement("span");
                  exitSpan.className = "aplExitOnlyLabel aplExitOnlyExit";
                  exitSpan.textContent = arrow.exitOnlyTextLeft != null ? arrow.exitOnlyTextLeft : "EXIT";

                  const onlySpan = document.createElement("span");
                  onlySpan.className = "aplExitOnlyLabel aplExitOnlyOnly";
                  onlySpan.textContent = arrow.exitOnlyTextRight != null ? arrow.exitOnlyTextRight : "ONLY";

                  // Background color
                  if (arrow.exitOnlyBgColor === "white") {
                    exitSpan.style.backgroundColor = "var(--white)";
                    onlySpan.style.backgroundColor = "var(--white)";
                  }

                  // Horizontal padding
                  if (arrow.exitOnlyPadding != null) {
                    const pad = arrow.exitOnlyPadding + "rem";
                    exitSpan.style.paddingLeft = pad;
                    exitSpan.style.paddingRight = pad;
                    onlySpan.style.paddingLeft = pad;
                    onlySpan.style.paddingRight = pad;
                  }

                  // Border radius
                  if (arrow.exitOnlyBorderRadius != null) {
                    const rad = arrow.exitOnlyBorderRadius + "rem";
                    exitSpan.style.borderRadius = rad;
                    onlySpan.style.borderRadius = rad;
                  }

                  // Hide labels
                  if (arrow.exitOnlyHideLeft) {
                    exitSpan.style.display = "none";
                  }
                  if (arrow.exitOnlyHideRight) {
                    onlySpan.style.display = "none";
                  }

                  container.appendChild(exitSpan);
                  arrowImg.style.margin = "0"; // Remove margins from arrow
                  container.appendChild(arrowImg);
                  container.appendChild(onlySpan);

                  subPanelArrowContainer.appendChild(container);
                } else {
                  // Apply per-arrow margins
                  if (arrow.arrowMarginLeft != null) {
                    arrowImg.style.marginLeft = arrow.arrowMarginLeft + "rem";
                  }
                  if (arrow.arrowMarginRight != null) {
                    arrowImg.style.marginRight = arrow.arrowMarginRight + "rem";
                  }
                  subPanelArrowContainer.appendChild(arrowImg);
                }
              }
            }
          }

          new_subPanel.appendChild(subPanelArrowContainer);
        }

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
              arrowContElmt.style.gap = (typeof panel.sign.halfExitGap === "number" ? panel.sign.halfExitGap : 5) + "rem";
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
            const exitOnlyLabelLeft = (typeof panel.sign.exitOnlyLeftText === "string" ? panel.sign.exitOnlyLeftText : "EXIT").trim();
            const exitOnlyLabelRight = (typeof panel.sign.exitOnlyRightText === "string" ? panel.sign.exitOnlyRightText : "ONLY").trim();
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
                  if (length == 2 && panel.sign.guideArrow == "Exit Only") {
                  } else {
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
                  }
                } else if (
                  length == 2 &&
                  panel.sign.guideArrow == "Exit Only"
                ) {
                  // Special handling for 2 arrows Exit Only
                  const arrowPos = (
                    panel.sign.arrowPosition || "Middle"
                  ).toLowerCase();

                  let arrowEl1 = createArrowElmt(
                    panel.sign.exitguideArrows.split(":")[1]
                  );
                  let arrowEl2 = createArrowElmt(
                    panel.sign.exitguideArrows.split(":")[1]
                  );

                  let leftTextEl = null;
                  if (shouldRenderLabel(exitOnlyLabelLeft)) {
                    leftTextEl = document.createElement("span");
                    if (panel.sign.showExitOnly == false) {
                      leftTextEl.appendChild(
                        document.createTextNode(exitOnlyLabelLeft)
                      );
                      leftTextEl.className = "exitOnlyText";
                    } else {
                      leftTextEl.appendChild(
                        document.createTextNode("⠀⠀⠀⠀")
                      );
                      leftTextEl.className = "exitOnlyText";
                    }
                  }

                  let rightTextEl = null;
                  if (shouldRenderLabel(exitOnlyLabelRight)) {
                    rightTextEl = document.createElement("span");
                    if (panel.sign.showExitOnly == false) {
                      rightTextEl.appendChild(
                        document.createTextNode(exitOnlyLabelRight)
                      );
                      rightTextEl.className = "exitOnlyText";
                    } else {
                      rightTextEl.appendChild(
                        document.createTextNode("⠀⠀⠀⠀")
                      );
                      rightTextEl.className = "exitOnlyText";
                    }
                  }

                  if (arrowPos === "left") {
                    // (arrow) EXIT (arrow) ONLY
                    if (arrowEl1) path.appendChild(arrowEl1);
                    if (leftTextEl) path.appendChild(leftTextEl);
                    if (arrowEl2) path.appendChild(arrowEl2);
                    if (rightTextEl) path.appendChild(rightTextEl);
                  } else if (arrowPos === "right") {
                    // EXIT (arrow) ONLY (arrow)
                    if (leftTextEl) path.appendChild(leftTextEl);
                    if (arrowEl1) path.appendChild(arrowEl1);
                    if (rightTextEl) path.appendChild(rightTextEl);
                    if (arrowEl2) path.appendChild(arrowEl2);
                  } else {

                    if (arrowEl1) path.appendChild(arrowEl1);
                    if (leftTextEl) path.appendChild(leftTextEl);
                    if (rightTextEl) path.appendChild(rightTextEl);
                    if (arrowEl2) path.appendChild(arrowEl2);
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
                  let leftTextEl = null;
                  if (shouldRenderLabel(exitOnlyLabelLeft)) {
                    leftTextEl = document.createElement("span");
                    if (panel.sign.showExitOnly == false) {
                      leftTextEl.appendChild(
                        document.createTextNode(exitOnlyLabelLeft)
                      );

                      var bonus = "";

                      if (panel.sign.guideArrow == "Split Exit Only") {
                        bonus = " yellowElmt";
                      }

                      leftTextEl.className = "exitOnlyText" + bonus;
                    } else {
                      leftTextEl.appendChild(
                        document.createTextNode("⠀⠀⠀⠀")
                      );
                      leftTextEl.className = "exitOnlyText";
                    }
                  }

                  let arrowEl = null;
                  if (panel.sign.guideArrow == "Split Exit Only") {
                    arrowEl = createArrowElmt(
                      panel.sign.exitguideArrows.split(":")[1],
                      "MainArrows!ExitOnly"
                    );
                  } else {
                    arrowEl = createArrowElmt(
                      panel.sign.exitguideArrows.split(":")[1]
                    );
                  }

                  let rightTextEl = null;
                  if (shouldRenderLabel(exitOnlyLabelRight)) {
                    rightTextEl = document.createElement("span");
                    if (panel.sign.showExitOnly == false) {
                      rightTextEl.appendChild(
                        document.createTextNode(exitOnlyLabelRight)
                      );

                      var bonus = "";

                      if (panel.sign.guideArrow == "Split Exit Only") {
                        bonus = " yellowElmt";
                      }

                      rightTextEl.className = "exitOnlyText" + bonus;
                    } else {
                      rightTextEl.appendChild(
                        document.createTextNode("⠀⠀⠀⠀")
                      );
                      rightTextEl.className = "exitOnlyText";
                    }
                  }

                  const isExitOnlySingle =
                    panel.sign.guideArrow == "Exit Only" && length == 1;
                  const arrowPos = isExitOnlySingle
                    ? (panel.sign.arrowPosition || "Middle").toLowerCase()
                    : "middle";

                  if (arrowPos === "left") {
                    if (arrowEl) path.appendChild(arrowEl);
                    if (leftTextEl) path.appendChild(leftTextEl);
                    if (rightTextEl) path.appendChild(rightTextEl);
                  } else if (arrowPos === "right") {
                    if (leftTextEl) path.appendChild(leftTextEl);
                    if (rightTextEl) path.appendChild(rightTextEl);
                    if (arrowEl) path.appendChild(arrowEl);
                  } else {
                    if (leftTextEl) path.appendChild(leftTextEl);
                    if (arrowEl) path.appendChild(arrowEl);
                    if (rightTextEl) path.appendChild(rightTextEl);
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

      // APL Arrows Rendering
      // aplArrows is already defined above
      if (aplArrows.length > 0) {
        // Extend sign bottom for APL arrows (like guide arrows)
        signElmt.style.borderBottomWidth = "0";
        signElmt.style.width = "100%";
        // APL arrows are now rendered inside subpanels
      }

      var width = signCont.clientWidth;
      var exitWidth = firstExitTab.clientWidth;

      if (exitWidth > width) {
        signCont.style.width = firstExitTab.clientWidth + "px";
      }

      schedulePanelBorderGradientUpdate(panelElmt);
    }
    persistSessionState();
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
    moveRow,
    changeEditingPanel,
    movePanel,
    newPanel,
    duplicatePanel,
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
    addAPLArrow,
    removeAPLArrow,
    selectAPLArrow,
    updateAPLArrowType,
    toggleAPLArrowFlip,
    addAPLDivider,
    setAPLGroupedWithDivider: (index, grouped) => {
      getCurrentPanel().sign.setAPLGroupedWithDivider(index, grouped);
      redraw();
    },
    setAPLExitOnly: (index, isExitOnly) => {
      getCurrentPanel().sign.setAPLExitOnly(index, isExitOnly);
      redraw();
    },
    setAPLArrowMarginLeft: (index, margin) => {
      getCurrentPanel().sign.setAPLArrowMarginLeft(index, margin);
      redraw();
    },
    setAPLArrowMarginRight: (index, margin) => {
      getCurrentPanel().sign.setAPLArrowMarginRight(index, margin);
      redraw();
    },
    setAPLExitOnlyBgColor: (index, color) => {
      getCurrentPanel().sign.setAPLExitOnlyBgColor(index, color);
      redraw();
    },
    setAPLExitOnlyPadding: (index, padding) => {
      getCurrentPanel().sign.setAPLExitOnlyPadding(index, padding);
      redraw();
    },
    setAPLExitOnlyBorderRadius: (index, radius) => {
      getCurrentPanel().sign.setAPLExitOnlyBorderRadius(index, radius);
      redraw();
    },
    setAPLExitOnlyTextLeft: (index, text) => {
      getCurrentPanel().sign.setAPLExitOnlyTextLeft(index, text);
      redraw();
    },
    setAPLExitOnlyTextRight: (index, text) => {
      getCurrentPanel().sign.setAPLExitOnlyTextRight(index, text);
      redraw();
    },
    setAPLExitOnlyHideLeft: (index, hidden) => {
      getCurrentPanel().sign.setAPLExitOnlyHideLeft(index, hidden);
      redraw();
    },
    setAPLExitOnlyHideRight: (index, hidden) => {
      getCurrentPanel().sign.setAPLExitOnlyHideRight(index, hidden);
      redraw();
    },
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
      get currentlySelectedAPLArrowIndex() {
        return currentlySelectedAPLArrowIndex;
      },
    },
  };

  const normalizeIndex = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.trunc(number) : fallback;
  };

  const normalizeEditorSelection = () => {
    if (!post || !Array.isArray(post.panels) || post.panels.length === 0) {
      currentlySelectedPanelIndex = -1;
      currentlySelectedSubPanelIndex = 0;
      currentlySelectedExitTabIndex = 0;
      currentlySelectedNestedExitTabIndex = -1;
      currentlySelectedRowIndex = 0;
      currentlySelectedBlockIndex = 0;
      currentlySelectedAPLArrowIndex = 0;
      return;
    }

    currentlySelectedPanelIndex = clamp(
      normalizeIndex(currentlySelectedPanelIndex),
      0,
      post.panels.length - 1
    );

    const panel = post.panels[currentlySelectedPanelIndex];
    const subPanels = Array.isArray(panel?.sign?.subPanels)
      ? panel.sign.subPanels
      : [];
    currentlySelectedSubPanelIndex =
      currentlySelectedSubPanelIndex === -1
        ? -1
        : clamp(
            normalizeIndex(currentlySelectedSubPanelIndex),
            0,
            Math.max(0, subPanels.length - 1)
          );

    const exitTabs = Array.isArray(panel?.exitTabs) ? panel.exitTabs : [];
    currentlySelectedExitTabIndex = exitTabs.length
      ? clamp(
          normalizeIndex(currentlySelectedExitTabIndex),
          0,
          exitTabs.length - 1
        )
      : 0;

    const nestedExitTabs = Array.isArray(
      exitTabs[currentlySelectedExitTabIndex]?.nestedExitTabs
    )
      ? exitTabs[currentlySelectedExitTabIndex].nestedExitTabs
      : [];
    currentlySelectedNestedExitTabIndex =
      currentlySelectedNestedExitTabIndex === -1
        ? -1
        : clamp(
            normalizeIndex(currentlySelectedNestedExitTabIndex),
            0,
            Math.max(0, nestedExitTabs.length - 1)
          );

    const selectedSubPanel =
      currentlySelectedSubPanelIndex === -1
        ? null
        : subPanels[currentlySelectedSubPanelIndex];
    const rows = Array.isArray(selectedSubPanel?.blockElements?.rows)
      ? selectedSubPanel.blockElements.rows
      : [];
    currentlySelectedRowIndex = rows.length
      ? clamp(normalizeIndex(currentlySelectedRowIndex), 0, rows.length - 1)
      : 0;

    const row = Array.isArray(rows[currentlySelectedRowIndex])
      ? rows[currentlySelectedRowIndex]
      : [];
    currentlySelectedBlockIndex = row.length
      ? clamp(normalizeIndex(currentlySelectedBlockIndex), 0, row.length - 1)
      : 0;

    const aplArrows = Array.isArray(panel?.sign?.aplArrows)
      ? panel.sign.aplArrows
      : [];
    currentlySelectedAPLArrowIndex = aplArrows.length
      ? clamp(
          normalizeIndex(currentlySelectedAPLArrowIndex),
          0,
          aplArrows.length - 1
        )
      : 0;
  };

  const applySelectionState = (selection) => {
    if (selection && typeof selection === "object") {
      currentlySelectedPanelIndex = normalizeIndex(
        selection.currentlySelectedPanelIndex,
        currentlySelectedPanelIndex
      );
      currentlySelectedSubPanelIndex = normalizeIndex(
        selection.currentlySelectedSubPanelIndex,
        currentlySelectedSubPanelIndex
      );
      currentlySelectedExitTabIndex = normalizeIndex(
        selection.currentlySelectedExitTabIndex,
        currentlySelectedExitTabIndex
      );
      currentlySelectedNestedExitTabIndex = normalizeIndex(
        selection.currentlySelectedNestedExitTabIndex,
        currentlySelectedNestedExitTabIndex
      );
      currentlySelectedRowIndex = normalizeIndex(
        selection.currentlySelectedRowIndex,
        currentlySelectedRowIndex
      );
      currentlySelectedBlockIndex = normalizeIndex(
        selection.currentlySelectedBlockIndex,
        currentlySelectedBlockIndex
      );
      currentlySelectedAPLArrowIndex = normalizeIndex(
        selection.currentlySelectedAPLArrowIndex,
        currentlySelectedAPLArrowIndex
      );
    }

    normalizeEditorSelection();
  };

  const addElementTypes = (obj, visited = new WeakSet()) => {
    if (!obj || typeof obj !== "object" || visited.has(obj)) {
      return;
    }

    visited.add(obj);

    if (Array.isArray(obj)) {
      obj.forEach((item) => addElementTypes(item, visited));
      return;
    }

    if (Control.prototype.blockToClassElems) {
      try {
        const elemType = Control.prototype.blockToClassElems.getElem?.(obj);
        if (elemType) {
          obj._elementType = elemType;
        }
      } catch (error) {
        // Not a Control element instance.
      }
    }

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && key !== "_elementType") {
        addElementTypes(obj[key], visited);
      }
    }
  };

  const removeElementTypes = (obj, visited = new WeakSet()) => {
    if (!obj || typeof obj !== "object" || visited.has(obj)) {
      return;
    }

    visited.add(obj);

    if (Array.isArray(obj)) {
      obj.forEach((item) => removeElementTypes(item, visited));
      return;
    }

    if (obj._elementType) {
      delete obj._elementType;
    }

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        removeElementTypes(obj[key], visited);
      }
    }
  };

  const serializePostWithElementTypes = (space) => {
    addElementTypes(post);
    try {
      return JSON.stringify(post, null, space);
    } finally {
      removeElementTypes(post);
    }
  };

  const inferControlElementType = (elemData) => {
    if (!elemData || typeof elemData !== "object") {
      return null;
    }

    if (elemData._elementType) {
      return elemData._elementType;
    }

    if (!Control.prototype.blockToClassElems) {
      return null;
    }

    if (elemData.icon !== undefined) {
      return "IconElement";
    }
    if (elemData.arrow !== undefined) {
      return "ArrowElement";
    }
    if (elemData.logo !== undefined || elemData.tollLogo !== undefined) {
      return "TollLogoElement";
    }
    if (elemData.shieldBase !== undefined || elemData.type !== undefined) {
      return "ShieldElement";
    }
    if (elemData.dividerWidth !== undefined) {
      return "DividerElement";
    }
    if (
      elemData.beacon !== undefined ||
      (elemData.size !== undefined &&
        elemData.color !== undefined &&
        !elemData.textContent)
    ) {
      return "BeaconElement";
    }
    if (elemData.textContent !== undefined) {
      if (elemData.glow !== undefined) {
        return "ElectronicSignElement";
      }
      if (
        elemData.borderRadius !== undefined &&
        elemData.horizPadding !== undefined
      ) {
        return "AdvisoryMessageElement";
      }
      if (elemData.spacing !== undefined) {
        return "ControlTextElement";
      }
      return "ActionMessageElement";
    }

    return null;
  };

  const reconstructControl = (controlData) => {
    if (!controlData) {
      return new Control();
    }

    const control = new Control();
    const rows = [];
    const blockProperties = [];

    if (Array.isArray(controlData.rows)) {
      for (const rowData of controlData.rows) {
        const row = [];
        if (Array.isArray(rowData)) {
          for (const elemData of rowData) {
            const elemType = inferControlElementType(elemData);

            if (
              elemType &&
              Control.prototype.blockToClassElems &&
              Control.prototype.blockToClassElems[elemType]
            ) {
              const ElemClass = Control.prototype.blockToClassElems[elemType];
              const elem = new ElemClass(elemData);
              Object.assign(elem, elemData);
              delete elem._elementType;
              row.push(elem);
            } else {
              console.warn("Could not reconstruct element:", elemData);
            }
          }
        }
        rows.push(row);

        const blockIndex = rows.length - 1;
        const blockData = controlData.blockProperties?.[blockIndex];
        if (blockData) {
          const block = new Block(blockData);
          Object.assign(block, blockData);
          blockProperties.push(block);
        } else {
          blockProperties.push(new Block());
        }
      }
    }

    control.rows = rows;
    control.blockProperties = blockProperties;
    return control;
  };

  const reconstructPostFromData = (postData) => {
    const newPost = new Post(
      postData.polePosition || Post.prototype.polePositions[0],
      postData.lanesWide || 1,
      postData.color || Post.prototype.colors[0]
    );

    Object.assign(newPost, postData);

    if (Array.isArray(postData.panels)) {
      newPost.panels = [];
      for (const panelData of postData.panels) {
        const subPanels = [];
        if (Array.isArray(panelData.sign?.subPanels)) {
          for (const subPanelData of panelData.sign.subPanels) {
            const blockElements = reconstructControl(subPanelData.blockElements);
            const subPanel = new SubPanels({
              ...subPanelData,
              blockElements,
            });
            Object.assign(subPanel, subPanelData);
            subPanel.blockElements = blockElements;
            subPanels.push(subPanel);
          }
        }

        const signData = panelData.sign || {};
        const sign = new Sign({
          ...signData,
          subPanels,
        });

        if (Array.isArray(signData.shields)) {
          sign.shields = signData.shields.map((shieldData) => {
            const shield = new Shield(shieldData);
            Object.assign(shield, shieldData);
            return shield;
          });
        }

        Object.assign(sign, signData);
        sign.subPanels = subPanels;

        const panel = new Panel(
          sign,
          panelData.color,
          [],
          panelData.corner,
          panelData.borderRadius
        );

        if (Array.isArray(panelData.exitTabs)) {
          panel.exitTabs = panelData.exitTabs.map((exitTabData) => {
            const exitTab = new ExitTab(exitTabData);
            Object.assign(exitTab, exitTabData);

            if (Array.isArray(exitTabData.nestedExitTabs)) {
              exitTab.nestedExitTabs = exitTabData.nestedExitTabs.map(
                (nestedData) => {
                  const nested = new ExitTab(nestedData);
                  Object.assign(nested, nestedData);
                  return nested;
                }
              );
            }

            return exitTab;
          });
        }

        Object.assign(panel, panelData);
        panel.sign = sign;
        newPost.panels.push(panel);
      }
    }

    return newPost;
  };

  const getPost = function () {
    return post;
  };

  const setPost = function (newPost, selection) {
    post = newPost;
    if (!post) {
      return;
    }
    if (typeof post.panelSpacing !== "number" || post.panelSpacing < 0) {
      post.panelSpacing = 0;
    }
    post.thickness = post.normalizeThickness(post.thickness);
    if (selection) {
      applySelectionState(selection);
    } else {
      currentlySelectedPanelIndex = 0;
      normalizeEditorSelection();
    }
    formHandler.updateForm();
    redraw();
  };

  // Template management functions
  let templateDB = null;

  const initTemplateDB = async function () {
    if (!templateDB) {
      templateDB = new IndexDB();
      await templateDB.dbInitialized;
    }
    return templateDB;
  };

  const saveTemplate = async function (templateName) {
    if (!templateName || templateName.trim() === "") {
      alert("Please enter a template name");
      return;
    }

    try {
      // Sync form values (padding, border radius, etc.) to the model before saving
      if (formHandler && typeof formHandler.readForm === "function") {
        formHandler.readForm();
      }

      const db = await initTemplateDB();
      const postData = serializePostWithElementTypes(2);

      const templateData = {
        name: templateName.trim(),
        data: postData,
        dateCreated: new Date().toISOString(),
      };

      await db.saveTemplate(templateData);

      // Clear the input field
      const templateNameInput = document.getElementById("templateNameInput");
      if (templateNameInput) {
        templateNameInput.value = "";
      }

      await refreshTemplatesList();
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template: " + error.message);
    }
  };

  const loadTemplate = async function (templateId) {
    if (!templateId) {
      return;
    }

    const confirmationMessage =
      "Are you sure you want to load this template? THIS WILL REPLACE YOUR CURRENT SIGN!";
    if (!window.confirm(confirmationMessage)) {
      return;
    }

    try {
      const db = await initTemplateDB();
      const template = await db.getTemplate(templateId);

      if (!template) {
        alert("Template not found");
        return;
      }

      const postData = JSON.parse(template.data);
      setPost(reconstructPostFromData(postData));
    } catch (error) {
      console.error("Error loading template:", error);
      alert("Failed to load template: " + error.message);
    }
  };

  const deleteTemplate = async function (templateId) {
    if (!templateId) {
      return;
    }

    try {
      const db = await initTemplateDB();
      await db.deleteTemplate(templateId);
      await refreshTemplatesList();
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template: " + error.message);
    }
  };

  const refreshTemplatesList = async function () {
    try {
      const db = await initTemplateDB();
      const templates = await db.getAllTemplates();

      const templatesList = document.getElementById("savedTemplatesList");
      if (!templatesList) {
        return;
      }

      // Clear existing list
      templatesList.innerHTML = "";

      if (templates.length === 0) {
        templatesList.innerHTML = "<p style='padding: 1rem; color: #666;'>No saved templates</p>";
        return;
      }

      // Sort templates by date (newest first)
      templates.sort((a, b) => {
        const dateA = new Date(a.dateModified || a.dateCreated);
        const dateB = new Date(b.dateModified || b.dateCreated);
        return dateB - dateA;
      });

      // Create template items
      templates.forEach((template) => {
        const templateItem = document.createElement("div");
        templateItem.className = "templateItem";
        templateItem.innerHTML = `
          <div class="templateItemInfo">
            <span class="templateItemName">${escapeHtml(template.name)}</span>
            <span class="templateItemDate">${formatDate(template.dateModified || template.dateCreated)}</span>
          </div>
          <div class="templateItemActions">
            <button class="templateLoadBtn" onclick="app.loadTemplate('${template.id}')" title="Load Template">
              <span class="material-symbols-outlined">upload</span>
            </button>
            <button class="templateDeleteBtn" onclick="app.deleteTemplate('${template.id}')" title="Delete Template">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        `;
        templatesList.appendChild(templateItem);
      });
    } catch (error) {
      console.error("Error refreshing templates list:", error);
    }
  };

  const escapeHtml = function (text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  const formatDate = function (dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    duplicateControlElem: duplicateControlElem,
    applyTemplate: applyTemplate,
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

    saveTemplate: saveTemplate,
    loadTemplate: loadTemplate,
    deleteTemplate: deleteTemplate,
    refreshTemplatesList: refreshTemplatesList,

    exposeToFormHandler,
  };
})();
