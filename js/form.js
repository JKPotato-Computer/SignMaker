/* 
  // form.js - JK_Potato/Computer
  Responsible for changes within the website form (editor)
*/

const formHandler = (function () {
  let exposed;
  let post;
  let blockDragState = null;
  let panelDragState = null;
  let exitTabDragState = null;
  let rowDragState = null;
  let newRowDropTargetButton = null;
  const STORAGE_KEYS = {
    postPosition: "signMaker.postPosition",
    postColor: "signMaker.postColor",
    showPost: "signMaker.showPost",
    postThickness: "signMaker.postThickness",
    controlTextFont: "signMaker.controlTextFont",
    bannerFontFamily: "signMaker.bannerFontFamily",
    exitTabFHWAFont: "signMaker.exitTabFHWAFont",
    exitTabFullBorder: "signMaker.exitTabFullBorder",
    exitTabSquareCorners: "signMaker.exitTabSquareCorners",
    exitTabTopOffset: "signMaker.exitTabTopOffset",
  };
  let localStorageAvailable;
  let localStorageWarningLogged = false;
  const LIMON_TRIGGER_VALUE = "limon";
  const LIMON_VIDEO_URL = "https://www.youtube.com/watch?v=qA7qUG6uEbY";
  const getPostThicknessFallback = () =>
    typeof Post.prototype.defaultThickness === "number"
      ? Post.prototype.defaultThickness
      : 1;
  const normalizeStoredPostThickness = (value) => {
    const parsed =
      typeof value === "string" ? parseFloat(value) : Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed);
    }
    return getPostThicknessFallback();
  };

  const logStorageWarning = (message, error) => {
    if (!localStorageWarningLogged) {
      console.warn(message, error);
      localStorageWarningLogged = true;
    }
  };

  const hasLocalStorage = () => {
    localStorageAvailable = true;
    return true;
  };

  const getStoredItem = (key) => {
    if (!hasLocalStorage()) {
      return null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      logStorageWarning("Unable to read from localStorage", error);
      localStorageAvailable = false;
      return null;
    }
  };

  const setStoredItem = (key, value) => {
    if (!hasLocalStorage()) {
      return;
    }
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      logStorageWarning("Unable to write to localStorage", error);
      localStorageAvailable = false;
    }
  };

  const formatPostKindLabel = (value) => {
    if (typeof value !== "string") {
      return "";
    }
    const spaced = value.replace(/([a-z])([A-Z])/g, "$1 $2");
    return spaced.replace(/[_-]+/g, " ").trim() || value;
  };

  const applyStoredPreferences = () => {
    const storedPostPosition = getStoredItem(STORAGE_KEYS.postPosition);
    if (
      storedPostPosition &&
      Post.prototype.polePositions.includes(storedPostPosition)
    ) {
      post.polePosition = storedPostPosition;
    }

    const storedShowPost = getStoredItem(STORAGE_KEYS.showPost);
    if (storedShowPost !== null) {
      post.showPost = storedShowPost === "true";
    }

    const storedPostColor = getStoredItem(STORAGE_KEYS.postColor);
    if (
      storedPostColor &&
      Array.isArray(Post.prototype.colors) &&
      Post.prototype.colors.includes(storedPostColor)
    ) {
      post.color = storedPostColor;
    }

    const storedPostThickness = getStoredItem(STORAGE_KEYS.postThickness);
    if (storedPostThickness !== null && post) {
      const normalizedThickness =
        typeof post.normalizeThickness === "function"
          ? post.normalizeThickness(storedPostThickness)
          : normalizeStoredPostThickness(storedPostThickness);
      post.thickness = normalizedThickness;
    }

    const storedControlFont = getStoredItem(STORAGE_KEYS.controlTextFont);
    const availableFonts = TextElement.prototype.fontFamily;
    if (
      storedControlFont &&
      Array.isArray(availableFonts) &&
      availableFonts.includes(storedControlFont)
    ) {
      ControlTextElement.setDefaultFont(storedControlFont);
    }

    const storedBannerFont = getStoredItem(STORAGE_KEYS.bannerFontFamily);
    const bannerFonts = ShieldElement.prototype.getBannerFontOptions();
    if (
      storedBannerFont &&
      Array.isArray(bannerFonts) &&
      bannerFonts.includes(storedBannerFont)
    ) {
      ShieldElement.prototype.defaultBannerFontFamily = storedBannerFont;
    }

    const storedExitFHWA = getStoredItem(STORAGE_KEYS.exitTabFHWAFont);
    if (storedExitFHWA !== null) {
      ExitTab.prototype.defaultFHWAFont = storedExitFHWA === "true";
    }

    const storedExitFullBorder = getStoredItem(STORAGE_KEYS.exitTabFullBorder);
    if (storedExitFullBorder !== null) {
      ExitTab.prototype.defaultFullBorder = storedExitFullBorder === "true";
    }

    const storedExitSquareCorners = getStoredItem(STORAGE_KEYS.exitTabSquareCorners);
    if (storedExitSquareCorners !== null) {
      ExitTab.prototype.defaultSquareCorners = storedExitSquareCorners === "true";
    }

    const storedExitTopOffset = getStoredItem(STORAGE_KEYS.exitTabTopOffset);
    if (storedExitTopOffset !== null) {
      ExitTab.prototype.defaultTopOffset = storedExitTopOffset === "true";
    }
  };

  const toggleBlockWiggle = (isActive) => {
    const blocks = document.querySelectorAll(".textEditorBlock");
    for (const block of blocks) {
      block.classList.toggle("blockWiggle", isActive);
      if (isActive) {
        block.style.setProperty("--wiggle-delay", `${Math.random() * 0.12}s`);
      } else {
        block.style.removeProperty("--wiggle-delay");
      }
    }
  };

  const toggleExitTabWiggle = (isActive) => {
    const buttons = document.querySelectorAll(".exitTabButton");
    for (const button of buttons) {
      button.classList.toggle("blockWiggle", isActive);
      if (isActive) {
        button.style.setProperty("--wiggle-delay", `${Math.random() * 0.12}s`);
      } else {
        button.style.removeProperty("--wiggle-delay");
      }
    }
  };

  const togglePanelListWiggle = (isActive) => {
    const buttons = document.querySelectorAll(".panelListButton");
    for (const button of buttons) {
      button.classList.toggle("panelWiggle", isActive);
      if (isActive) {
        button.style.setProperty("--wiggle-delay", `${Math.random() * 0.12}s`);
      } else {
        button.style.removeProperty("--wiggle-delay");
      }
    }
  };

  const toggleExitTabVariantOptionsVisibility = (variantValue) => {
    const tollOptionsElmt = document.getElementById("exitTollLogoOptions");
    if (tollOptionsElmt) {
      tollOptionsElmt.classList.toggle("hidden", variantValue !== "Toll Logo");
    }
  };

  const clearExitTabDropIndicators = () => {
    document
      .querySelectorAll(".exitTabButton.dropBefore, .exitTabButton.dropAfter")
      .forEach((button) => button.classList.remove("dropBefore", "dropAfter"));
  };

  const endExitTabDrag = () => {
    toggleExitTabWiggle(false);
    clearExitTabDropIndicators();
    exitTabDragState = null;
    document
      .querySelectorAll(".exitTabButton.dragging")
      .forEach((button) => {
        button.classList.remove("dragging");
        delete button.dataset.dragging;
      });
  };

  const getExitTabDropPosition = (container, clientX) => {
    const buttons = Array.from(container.querySelectorAll(".exitTabButton"));
    if (!buttons.length) {
      return { dropIndex: 0, targetButton: null, placement: null };
    }

    let dropIndex = Number(
      buttons[buttons.length - 1].dataset.exitTabIndex || buttons.length - 1
    );
    let targetButton = null;
    let placement = "after";
    let foundPosition = false;

    for (const button of buttons) {
      const rect = button.getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      if (clientX < midpoint) {
        dropIndex = Number(button.dataset.exitTabIndex || 0);
        placement = "before";
        foundPosition = true;
        targetButton = button.dataset.dragging === "true" ? null : button;
        break;
      }
    }

    if (!foundPosition) {
      const lastButton = buttons[buttons.length - 1];
      dropIndex = Number(lastButton.dataset.exitTabIndex || buttons.length - 1) + 1;
      if (lastButton.dataset.dragging !== "true") {
        targetButton = lastButton;
        placement = "after";
      } else {
        placement = null;
      }
    } else if (!targetButton) {
      placement = null;
    }

    return { dropIndex, targetButton, placement };
  };

  const handleExitTabDragStart = (event) => {
    const button = event.currentTarget;
    const fromIndex = Number(button.dataset.exitTabIndex);
    if (Number.isNaN(fromIndex)) {
      return;
    }
    exitTabDragState = { fromIndex, dropIndex: fromIndex };
    button.dataset.dragging = "true";
    button.classList.add("dragging");
    toggleExitTabWiggle(true);
    clearExitTabDropIndicators();

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setData("text/plain", "");
    }
  };

  const handleExitTabDragOver = (event) => {
    if (!exitTabDragState) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }

    const container = event.currentTarget;
    const { dropIndex, targetButton, placement } = getExitTabDropPosition(
      container,
      event.clientX
    );
    exitTabDragState.dropIndex = dropIndex;

    clearExitTabDropIndicators();
    if (targetButton && placement) {
      targetButton.classList.add(
        placement === "before" ? "dropBefore" : "dropAfter"
      );
    }
  };

  const handleExitTabDrop = (event) => {
    if (!exitTabDragState) {
      return;
    }
    event.preventDefault();
    const fromIndex = exitTabDragState.fromIndex;
    const dropIndex =
      exitTabDragState.dropIndex !== undefined
        ? exitTabDragState.dropIndex
        : fromIndex;
    exposed.moveExitTab(fromIndex, dropIndex);
    endExitTabDrag();
  };

  const handleExitTabDragLeave = (event) => {
    if (!exitTabDragState) {
      return;
    }
    const container = event.currentTarget;
    const related = event.relatedTarget;
    if (related && container.contains(related)) {
      return;
    }
    clearExitTabDropIndicators();
  };

  const handleExitTabDragEnd = () => {
    if (exitTabDragState) {
      endExitTabDrag();
    }
  };

  const clearPanelDropIndicators = () => {
    document
      .querySelectorAll(
        ".panelListButton.dropBefore, .panelListButton.dropAfter"
      )
      .forEach((button) => button.classList.remove("dropBefore", "dropAfter"));
  };

  const endPanelDrag = () => {
    clearPanelDropIndicators();
    document
      .querySelectorAll(".panelListButton.dragging")
      .forEach((button) => {
        button.classList.remove("dragging");
        delete button.dataset.dragging;
      });
    panelDragState = null;
    togglePanelListWiggle(false);
  };

  const getPanelDropPosition = (container, clientY) => {
    const buttons = Array.from(container.querySelectorAll(".panelListButton"));
    if (!buttons.length) {
      return { dropIndex: 0, targetButton: null, placement: null };
    }

    let dropIndex = Number(
      buttons[buttons.length - 1].dataset.panelIndex || buttons.length - 1
    );
    dropIndex += 1;
    let targetButton = null;
    let placement = "after";
    let foundPosition = false;

    for (const button of buttons) {
      const rect = button.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (clientY < midpoint) {
        dropIndex = Number(button.dataset.panelIndex || 0);
        placement = "before";
        foundPosition = true;
        targetButton = button.dataset.dragging === "true" ? null : button;
        break;
      }
    }

    if (!foundPosition) {
      const lastButton = buttons[buttons.length - 1];
      if (lastButton.dataset.dragging !== "true") {
        targetButton = lastButton;
        placement = "after";
      } else {
        placement = null;
      }
    } else if (!targetButton) {
      placement = null;
    }

    return { dropIndex, targetButton, placement };
  };

  const handlePanelDragStart = (event) => {
    const button = event.currentTarget;
    const fromIndex = Number(button.dataset.panelIndex);
    if (Number.isNaN(fromIndex)) {
      return;
    }
    panelDragState = { fromIndex, dropIndex: fromIndex };
    button.dataset.dragging = "true";
    button.classList.add("dragging");
    togglePanelListWiggle(true);
    clearPanelDropIndicators();

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setData("text/plain", "");
    }
  };

  const handlePanelDragOver = (event) => {
    if (!panelDragState) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }

    const container = event.currentTarget;
    const { dropIndex, targetButton, placement } = getPanelDropPosition(
      container,
      event.clientY
    );
    panelDragState.dropIndex = dropIndex;

    clearPanelDropIndicators();
    if (targetButton && placement) {
      targetButton.classList.add(
        placement === "before" ? "dropBefore" : "dropAfter"
      );
    }
  };

  const handlePanelDrop = (event) => {
    if (!panelDragState) {
      return;
    }
    event.preventDefault();
    const fromIndex = panelDragState.fromIndex;
    const dropIndex =
      panelDragState.dropIndex !== undefined
        ? panelDragState.dropIndex
        : fromIndex;
    if (typeof exposed.movePanel === "function") {
      exposed.movePanel(fromIndex, dropIndex);
    }
    endPanelDrag();
  };

  const handlePanelDragLeave = (event) => {
    if (!panelDragState) {
      return;
    }
    const container = event.currentTarget;
    const related = event.relatedTarget;
    if (related && container.contains(related)) {
      return;
    }
    clearPanelDropIndicators();
  };

  const handlePanelDragEnd = () => {
    if (panelDragState) {
      endPanelDrag();
    }
  };

  // --- Row Drag and Drop ---
  const toggleRowWiggle = (isActive) => {
    const rows = document.querySelectorAll(".sMControlRow");
    for (const row of rows) {
      row.classList.toggle("rowWiggle", isActive);
      if (isActive) {
        row.style.setProperty("--wiggle-delay", `${Math.random() * 0.12}s`);
      } else {
        row.style.removeProperty("--wiggle-delay");
      }
    }
  };

  const clearRowDropIndicators = () => {
    document
      .querySelectorAll(".sMControlRow.dropBefore, .sMControlRow.dropAfter")
      .forEach((el) => el.classList.remove("dropBefore", "dropAfter"));
  };

  const endRowDrag = () => {
    toggleRowWiggle(false);
    clearRowDropIndicators();
    rowDragState = null;
    document
      .querySelectorAll(".sMControlRow.dragging")
      .forEach((el) => {
        el.classList.remove("dragging");
        delete el.dataset.dragging;
      });
  };

  const getRowDropPosition = (container, clientY) => {
    const rows = Array.from(container.querySelectorAll(".sMControlRow"));
    if (!rows.length) {
      return { dropIndex: 0, targetRow: null, placement: null };
    }

    let dropIndex = rows.length;
    let targetRow = null;
    let placement = "after";
    let foundPosition = false;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rect = row.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (clientY < midpoint) {
        dropIndex = Number(row.dataset.dataRow || i);
        placement = "before";
        foundPosition = true;
        targetRow = row.dataset.dragging === "true" ? null : row;
        break;
      }
    }

    if (!foundPosition) {
      const lastRow = rows[rows.length - 1];
      dropIndex = Number(lastRow.dataset.dataRow || rows.length - 1) + 1;
      if (lastRow.dataset.dragging !== "true") {
        targetRow = lastRow;
        placement = "after";
      } else {
        placement = null;
      }
    } else if (!targetRow) {
      placement = null;
    }

    return { dropIndex, targetRow, placement };
  };

  const handleRowDragStart = (event) => {
    const row = event.currentTarget;
    const fromIndex = Number(row.dataset.dataRow);
    if (Number.isNaN(fromIndex)) {
      return;
    }
    rowDragState = { fromIndex, dropIndex: fromIndex };
    row.dataset.dragging = "true";
    row.classList.add("dragging");
    toggleRowWiggle(true);
    clearRowDropIndicators();

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setData("text/plain", "");
    }
  };

  const handleRowListDragOver = (event) => {
    if (!rowDragState) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }

    const container = event.currentTarget;
    const { dropIndex, targetRow, placement } = getRowDropPosition(
      container,
      event.clientY
    );
    rowDragState.dropIndex = dropIndex;

    clearRowDropIndicators();
    if (targetRow && placement) {
      targetRow.classList.add(
        placement === "before" ? "dropBefore" : "dropAfter"
      );
    }
  };

  const handleRowListDrop = (event) => {
    if (!rowDragState) {
      return;
    }
    event.preventDefault();
    const fromIndex = rowDragState.fromIndex;
    const dropIndex =
      rowDragState.dropIndex !== undefined
        ? rowDragState.dropIndex
        : fromIndex;
    if (typeof exposed.moveRow === "function") {
      exposed.moveRow(fromIndex, dropIndex);
    }
    endRowDrag();
  };

  const handleRowListDragLeave = (event) => {
    if (!rowDragState) {
      return;
    }
    const container = event.currentTarget;
    const related = event.relatedTarget;
    if (related && container.contains(related)) {
      return;
    }
    clearRowDropIndicators();
  };

  const handleRowDragEnd = () => {
    if (rowDragState) {
      endRowDrag();
    }
  };

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

  const checkForLimonEasterEgg = (event) => {
    const target = event.target;
    if (!isTextInputElement(target)) {
      return;
    }
    const trimmedValue = (target.value || "").trim().toLowerCase();
    if (trimmedValue === LIMON_TRIGGER_VALUE) {
      if (target.dataset.limonTriggered === "true") {
        return;
      }
      target.dataset.limonTriggered = "true";
      const newWindow = window.open(LIMON_VIDEO_URL, "_blank");
      if (newWindow) {
        newWindow.opener = null;
      }
    } else if (target.dataset.limonTriggered === "true") {
      delete target.dataset.limonTriggered;
    }
  };

  const clearBlockDragIndicators = () => {
    document
      .querySelectorAll(
        ".textEditorBlock.dropBefore, .textEditorBlock.dropAfter"
      )
      .forEach((el) => el.classList.remove("dropBefore", "dropAfter"));
    document
      .querySelectorAll(".sMControlRow.dropActive")
      .forEach((el) => el.classList.remove("dropActive"));
  };

  const setNewRowDropState = (isActive) => {
    if (!newRowDropTargetButton) {
      return;
    }
    if (isActive) {
      newRowDropTargetButton.classList.add("dropActive");
    } else {
      newRowDropTargetButton.classList.remove("dropActive");
    }
  };

  const handleNewRowDragEnter = (event) => {
    if (!blockDragState || !newRowDropTargetButton) {
      return;
    }
    event.preventDefault();
    setNewRowDropState(true);
  };

  const handleNewRowDragOver = (event) => {
    if (!blockDragState || !newRowDropTargetButton) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
    setNewRowDropState(true);
  };

  const handleNewRowDragLeave = (event) => {
    if (!blockDragState || !newRowDropTargetButton) {
      return;
    }
    const related = event.relatedTarget;
    if (related && newRowDropTargetButton.contains(related)) {
      return;
    }
    setNewRowDropState(false);
  };

  const handleNewRowDrop = (event) => {
    if (!blockDragState || !newRowDropTargetButton) {
      return;
    }
    event.preventDefault();
    setNewRowDropState(false);
    if (typeof exposed?.duplicateBlockIntoNewRow === "function") {
      exposed.duplicateBlockIntoNewRow(
        blockDragState.rowIndex,
        blockDragState.blockIndex
      );
    }
    endBlockDrag();
  };

  const endBlockDrag = () => {
    toggleBlockWiggle(false);
    clearBlockDragIndicators();
    setNewRowDropState(false);
    blockDragState = null;
    document
      .querySelectorAll(".textEditorBlock.dragging")
      .forEach((el) => el.classList.remove("dragging"));
    document
      .querySelectorAll(".textEditorBlock")
      .forEach((el) => delete el.dataset.dragging);
  };

  const getDropIndexForRow = (rowEl, clientX) => {
    const blocks = Array.from(rowEl.querySelectorAll(".textEditorBlock"));
    if (!blocks.length) {
      return 0;
    }

    let dropIndex = blocks.length;
    let indicatorTarget = null;
    let before = false;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const rect = block.getBoundingClientRect();
      if (clientX < rect.left + rect.width / 2) {
        dropIndex = i;
        indicatorTarget = block;
        before = true;
        break;
      }
    }

    if (!indicatorTarget) {
      indicatorTarget = blocks[blocks.length - 1];
      before = false;
    }

    blocks.forEach((block) => {
      block.classList.remove("dropBefore", "dropAfter");
    });

    indicatorTarget.classList.add(before ? "dropBefore" : "dropAfter");
    return dropIndex;
  };

  const handleBlockDragStart = (event) => {
    event.stopPropagation();
    const target = event.currentTarget;
    const rowIndex = Number(target.dataset.row);
    const blockIndex = Number(target.dataset.block);
    blockDragState = { rowIndex, blockIndex };
    target.dataset.dragging = "true";
    target.classList.add("dragging");
    toggleBlockWiggle(true);
    clearBlockDragIndicators();
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setData("text/plain", "");
    }
  };

  const handleBlockDragEnd = () => {
    if (blockDragState) {
      endBlockDrag();
    }
  };

  const handleRowDragEnter = (event) => {
    if (!blockDragState) {
      return;
    }
    clearBlockDragIndicators();
    const rowEl = event.currentTarget;
    rowEl.classList.add("dropActive");
  };

  const handleRowDragOver = (event) => {
    if (!blockDragState) {
      return;
    }
    const rowEl = event.currentTarget;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    rowEl.classList.add("dropActive");
    getDropIndexForRow(rowEl, event.clientX);
  };

  const handleRowDrop = (event) => {
    if (!blockDragState) {
      return;
    }
    const rowEl = event.currentTarget;
    const rowIndex = Number(rowEl.dataset.dataRow);
    event.preventDefault();
    const dropIndex = getDropIndexForRow(rowEl, event.clientX);
    exposed.moveControlElem(
      blockDragState.rowIndex,
      blockDragState.blockIndex,
      rowIndex,
      dropIndex
    );
    endBlockDrag();
  };

  const handleRowDragLeave = (event) => {
    if (!blockDragState) {
      return;
    }
    const rowEl = event.currentTarget;
    const related = event.relatedTarget;
    if (related && rowEl.contains(related)) {
      return;
    }
    rowEl.classList.remove("dropActive");
    rowEl
      .querySelectorAll(
        ".textEditorBlock.dropBefore, .textEditorBlock.dropAfter"
      )
      .forEach((el) => el.classList.remove("dropBefore", "dropAfter"));
  };


  const initialize = async (appExposed) => {
    exposed = appExposed;
    post = exposed.getPost();
    applyStoredPreferences();
    await initUI();

    try {
      //console.log(promptShield(null));
    } catch (e) {
      console.error(e);
    }
  };

  const initUI = async () => {
    const sMConfigBar = document.querySelector("#sMConfigBar");
    const htmlElement = document.documentElement;
    const nightModeButton = document.querySelector("#nightMode");
    const prefersDarkScheme =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;
    let userThemeOverride = false;

    const getSystemTheme = () =>
      prefersDarkScheme && prefersDarkScheme.matches ? "dark" : "light";

    const applyTheme = (theme) => {
      if (!theme) {
        return;
      }
      htmlElement.dataset.theme = theme;
    };

    const syncThemeWithSystem = () => {
      const systemTheme = getSystemTheme();
      if (!userThemeOverride) {
        applyTheme(systemTheme);
      } else if (htmlElement.dataset.theme === systemTheme) {
        userThemeOverride = false;
      }
    };

    syncThemeWithSystem();
    if (prefersDarkScheme) {
      if (typeof prefersDarkScheme.addEventListener === "function") {
        prefersDarkScheme.addEventListener("change", syncThemeWithSystem);
      } else if (typeof prefersDarkScheme.addListener === "function") {
        prefersDarkScheme.addListener(syncThemeWithSystem);
      }
    }

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

      // Shift panels right by half the open modal's width so they aren't blocked
      const mainElmt = document.querySelector("main");
      if (mainElmt) {
        const currentMenu = sMConfigBar.dataset.currentMenu;
        const openModal = currentMenu
          ? document.querySelector(".sMModal." + currentMenu)
          : null;
        if (openModal) {
          const modalWidth = openModal.offsetWidth;
          mainElmt.style.transform = "translateX(" + (modalWidth / 2) + "px)";
        } else {
          mainElmt.style.transform = "";
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

        // Refresh templates list when Saved tab is opened
        if (button.dataset.tab === "sMTemplatesSaved" && typeof app !== "undefined" && typeof app.refreshTemplatesList === "function") {
          app.refreshTemplatesList();
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

    const registerPanelButton = (selector, actionName) => {
      const button = document.querySelector(selector);
      const action =
        exposed && actionName && typeof exposed[actionName] === "function"
          ? exposed[actionName]
          : null;
      if (!button || !action) {
        return;
      }
      button.type = "button";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        action();
      });
    };

    registerPanelButton("#newPanel", "newPanel");
    registerPanelButton("#duplicatePanel", "duplicatePanel");
    registerPanelButton("#deletePanel", "deletePanel");

    const panelSpacingSlider = document.getElementById("panelSpacing");
    const panelSpacingValueInput =
      document.getElementById("panelSpacingValue");

    const syncPanelSpacingInputs = (value) => {
      if (panelSpacingSlider) {
        panelSpacingSlider.value = value;
      }
      if (panelSpacingValueInput) {
        panelSpacingValueInput.value = value;
      }
    };

    const commitPanelSpacingChange = (value) => {
      const parsedValue = parseFloat(value);
      const normalized =
        Number.isFinite(parsedValue) && parsedValue >= 0
          ? Math.min(parsedValue, 8)
          : 0;
      syncPanelSpacingInputs(normalized);
      if (exposed && typeof exposed.setPanelSpacing === "function") {
        exposed.setPanelSpacing(normalized);
      } else if (post) {
        post.panelSpacing = normalized;
        if (exposed && typeof exposed.redraw === "function") {
          exposed.redraw();
        }
      }
    };

    if (panelSpacingSlider) {
      panelSpacingSlider.addEventListener("input", () => {
        if (panelSpacingValueInput) {
          panelSpacingValueInput.value = panelSpacingSlider.value;
        }
      });
      panelSpacingSlider.addEventListener("change", () => {
        commitPanelSpacingChange(panelSpacingSlider.value);
      });
    }

    if (panelSpacingValueInput) {
      panelSpacingValueInput.addEventListener("input", () => {
        if (panelSpacingSlider) {
          panelSpacingSlider.value = panelSpacingValueInput.value;
        }
      });
      panelSpacingValueInput.addEventListener("change", () => {
        commitPanelSpacingChange(panelSpacingValueInput.value);
      });
    }

    const postThicknessValueInput =
      document.getElementById("postThicknessValue");

    const commitPostThicknessChange = (value) => {
      const normalizedThickness =
        post && typeof post.normalizeThickness === "function"
          ? post.normalizeThickness(value)
          : normalizeStoredPostThickness(value);
      if (post) {
        post.thickness = normalizedThickness;
      }
      if (postThicknessValueInput) {
        postThicknessValueInput.value = normalizedThickness;
      }
      setStoredItem(STORAGE_KEYS.postThickness, normalizedThickness);
      if (exposed && typeof exposed.redraw === "function") {
        exposed.redraw();
      }
    };

    if (postThicknessValueInput) {
      postThicknessValueInput.addEventListener("input", () => {
        commitPostThicknessChange(postThicknessValueInput.value);
      });
      postThicknessValueInput.addEventListener("change", () => {
        commitPostThicknessChange(postThicknessValueInput.value);
      });
    }

    document.addEventListener("input", checkForLimonEasterEgg, true);

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

    newRowDropTargetButton = document.getElementById("sMSPCreateRow");
    if (newRowDropTargetButton) {
      newRowDropTargetButton.addEventListener("dragenter", handleNewRowDragEnter);
      newRowDropTargetButton.addEventListener("dragover", handleNewRowDragOver);
      newRowDropTargetButton.addEventListener("dragleave", handleNewRowDragLeave);
      newRowDropTargetButton.addEventListener("drop", handleNewRowDrop);
    }

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

    if (nightModeButton) {
      nightModeButton.addEventListener("click", () => {
        const nextTheme =
          htmlElement.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        userThemeOverride = nextTheme !== getSystemTheme();
      });
    }

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

    // Populate post kind options
    const postPositionSelectElmt = document.getElementById("postPosition");
    for (const polePosition of Post.prototype.polePositions) {
      const displayLabel = formatPostKindLabel(polePosition);
      lib.appendOption(postPositionSelectElmt, polePosition, {
        selected: polePosition == post.polePosition,
        text: displayLabel,
      });
    }

    const postColorSelectElmt = document.getElementById("postColor");
    if (postColorSelectElmt) {
      for (const colorOption of Post.prototype.colors) {
        lib.appendOption(postColorSelectElmt, colorOption, {
          selected: colorOption === post.color,
        });
      }
    }

    // Populate color options
    const colorSelectElmt = document.getElementById("panelColor");
    for (const color in lib.colors) {
      lib.appendOption(colorSelectElmt, color, {
        text: color,
      });
    }

    const cornerTypeSelectElmt = document.getElementById("panelCorner");
    for (const corner of Panel.prototype.cornerType) {
      lib.appendOption(cornerTypeSelectElmt, corner, {
        selected: corner == "Round",
      });
    }

    // Populate exit tab position options
    const exitTabPositionSelectElmt =
      document.getElementById("exitTabPosition");
    for (const position of ExitTab.prototype.positions) {
      lib.appendOption(exitTabPositionSelectElmt, position, {
        selected: position == "Right",
      });
    }

    // Populate exit tab width options
    const exitTabWidthSelectElmt = document.getElementById("exitTabWidth");
    for (const width of ExitTab.prototype.widths) {
      lib.appendOption(exitTabWidthSelectElmt, width, {
        selected: width == "Narrow",
      });
    }

    // Populate the exit color options
    const exitColorSelectElement = document.getElementById("exitColor");
    for (const exitColor of ExitTab.prototype.colors) {
      lib.appendOption(exitColorSelectElement, exitColor);
    }

    // Populate the exit variants
    const exitVariantSelectElmt = document.getElementById("exitVariant");
    for (const exitVariant of ExitTab.prototype.variants) {
      lib.appendOption(exitVariantSelectElmt, exitVariant);
    }
    if (exitVariantSelectElmt) {
      exitVariantSelectElmt.addEventListener("change", (event) => {
        toggleExitTabVariantOptionsVisibility(event.target.value);
      });
      toggleExitTabVariantOptionsVisibility(exitVariantSelectElmt.value);
    }

    const exitTollLogoSelectElmt =
      document.getElementById("exitTollLogoSelect");
    if (exitTollLogoSelectElmt) {
      for (const [logoKey, logoDef] of Object.entries(
        TollLogoElement.prototype.logos
      )) {
        lib.appendOption(exitTollLogoSelectElmt, logoKey, {
          text: logoDef.label,
          selected: logoKey == TollLogoElement.prototype.defaultLogo,
        });
      }
    }

    // Populate the exit icons
    const iconSelectSelectElmt = document.getElementById("iconSelect");
    if (iconSelectSelectElmt) {
      for (const icons of ExitTab.prototype.icons) {
        lib.appendOption(iconSelectSelectElmt, icons.split(":")[0]);
      }
    }

    // Populate the shield position options
    const shieldPositionsSelectElmt =
      document.getElementById("shieldsPosition");
    for (const position of Sign.prototype.shieldPositions) {
      lib.appendOption(shieldPositionsSelectElmt, position, {
        selected: position == "Above",
      });
    }

    // Populate global positioning
    const globalPosition = document.getElementById("globalPosition");
    for (const position of Sign.prototype.globalPositioning) {
      lib.appendOption(globalPosition, position, {
        selected: position == "Top",
      });
    }

    // Populate the element list
    const sMSPElementSelect = document.getElementById("sMSPElementSelect");
    for (const element in Control.prototype.blockElements) {
      lib.appendOption(sMSPElementSelect, element, {
        selected: element == "Standard Control Text",
        text: Control.prototype.blockElements[element],
      });
    }

    // Populate the guide arrow options
    const guideArrowSelectElmt = document.getElementById("guideArrow");
    for (const guideArrow of Sign.prototype.guideArrows) {
      const display = guideArrow.split(":")[0];

      lib.appendOption(guideArrowSelectElmt, display);
    }

    // Populate the exit only guide arrow options
    const exitOnlyDirectionElmt = document.getElementById("exitOnlyDirection");
    for (const exitguideArrows of Sign.prototype.exitguideArrows) {
      const display = exitguideArrows.split(":")[0];

      lib.appendOption(exitOnlyDirectionElmt, display);
    }

    // exit-only labels
    // Populate the arrow directions
    const arrowDirectionElmt = document.getElementById("arrowLocations");
    for (const arrowDirection of Sign.prototype.arrowPositions) {
      lib.appendOption(arrowDirectionElmt, arrowDirection);
    }

    // Populate the other symbol options
    const otherSymbolSelectElement = document.getElementById("otherSymbol");
    for (const otherSymbol of Sign.prototype.otherSymbols) {
      lib.appendOption(otherSymbolSelectElement, otherSymbol);
    }

    // APL Arrow Per Lane event listeners
    const addAPLArrowBtn = document.getElementById("addAPLArrow");
    const removeAPLArrowBtn = document.getElementById("removeAPLArrow");
    const aplArrowTypeSelect = document.getElementById("aplArrowType");

    if (addAPLArrowBtn) {
      addAPLArrowBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (exposed && typeof exposed.addAPLArrow === "function") {
          const type = aplArrowTypeSelect ? aplArrowTypeSelect.value : "APL_UP";
          exposed.addAPLArrow(type);
        }
      });
    }

    if (removeAPLArrowBtn) {
      removeAPLArrowBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (exposed && typeof exposed.removeAPLArrow === "function") {
          exposed.removeAPLArrow();
        }
      });
    }

    if (aplArrowTypeSelect) {
      aplArrowTypeSelect.addEventListener("change", () => {
        if (exposed && typeof exposed.updateAPLArrowType === "function") {
          exposed.updateAPLArrowType(aplArrowTypeSelect.value);
        }
      });
    }

    const aplArrowFlipButton = document.getElementById("aplArrowFlipButton");
    if (aplArrowFlipButton) {
      aplArrowFlipButton.addEventListener("click", () => {
        if (exposed && typeof exposed.toggleAPLArrowFlip === "function") {
          exposed.toggleAPLArrowFlip();
        }
      });
    }

    // Control Signs Revision
    let textElem_fontFamilySelects = [
      document.querySelector("#sdCtrlText_fontFamily"),
      document.querySelector("#sdAdvisory_fontFamily"),
      document.querySelector("#sdActionMessage_fontFamily"),
    ];
    let textElem_alignmentSelects = [
      document.querySelector("#sdCtrlText_alignment"),
      document.querySelector("#sdAdvisory_alignment"),
      document.querySelector("#sdActionMessage_alignment"),
      document.querySelector("#sdBlocker_alignment"),
      document.querySelector("#sdElectronicSign_alignment"),
      document.querySelector("#sdTollLogo_alignment"),
      document.querySelector("#sdBeacon_alignment"),
      document.querySelector("#sdIcon_alignment"),
    ];
    let textElem_bgColorSelects = [
      document.querySelector("#sdCtrlText_backgroundColor"),
      document.querySelector("#sdAdvisory_backgroundColor"),
      document.querySelector("#sdActionMessage_backgroundColor"),
      document.querySelector("#sdIcon_borderColor"),
      document.querySelector("#sdIcon_backgroundColor"),
      document.querySelector("#sdBlock_backgroundColor"),
      document.querySelector("#sdTollLogo_backgroundColor"),
    ];
    let divider_widthMeasurement = document.querySelector(
      "#sdBlocker_dividerMeasurement"
    );
    let divider_orientationSelect = document.querySelector(
      "#sdBlocker_orientation"
    );
    let divider_colorSelect = document.querySelector("#sdBlocker_dividerColor");
    let shield_shieldBase = document.querySelector("#sdShield_shieldBase");
    let iconElem_iconsSelect = document.querySelector("#sdIcon_icon");
    const beaconColorSelect = document.querySelector("#sdBeacon_color");
    const controlTextColorSelect = document.querySelector(
      "#sdCtrlText_textColor"
    );
    const blockBorderColorSelect = document.querySelector(
      "#sdBlock_borderColor"
    );

    for (const elem of textElem_fontFamilySelects) {
      for (const fontFamily of TextElement.prototype.fontFamily) {
        lib.appendOption(elem, fontFamily);
      }
    }

    if (beaconColorSelect) {
      for (const color of BeaconElement.prototype.colors) {
        lib.appendOption(beaconColorSelect, color);
      }
    }

    if (controlTextColorSelect) {
      const textColorOptions = ControlTextElement.getTextColorOptions();
      for (const optionValue of textColorOptions) {
        if (optionValue) {
          lib.appendOption(controlTextColorSelect, optionValue);
        }
      }
      const defaultTextColor =
        ControlTextElement.defaultTextColor ||
        (textColorOptions.length ? textColorOptions[0] : "");
      if (defaultTextColor) {
        controlTextColorSelect.value = defaultTextColor;
      }
    }

    const advisoryTextColorSelect = document.querySelector(
      "#sdAdvisory_textColor"
    );
    if (advisoryTextColorSelect) {
      const advisoryTextColorOptions = AdvisoryMessageElement.getTextColorOptions();
      for (const optionValue of advisoryTextColorOptions) {
        if (optionValue) {
          lib.appendOption(advisoryTextColorSelect, optionValue);
        }
      }
      advisoryTextColorSelect.value = AdvisoryMessageElement.defaultTextColor;
    }

    const actionMessageTextColorSelect = document.querySelector(
      "#sdActionMessage_textColor"
    );
    if (actionMessageTextColorSelect) {
      const actionTextColorOptions = ActionMessageElement.getTextColorOptions();
      for (const optionValue of actionTextColorOptions) {
        if (optionValue) {
          lib.appendOption(actionMessageTextColorSelect, optionValue);
        }
      }
      actionMessageTextColorSelect.value = ActionMessageElement.defaultTextColor;
    }

    if (blockBorderColorSelect) {
      const defaultBorderColor = Block.defaultBorderColor || "Match BG";
      const borderColorOptions = [defaultBorderColor].concat(
        Object.keys(lib.colors || {})
      );
      const seenBorderColors = new Set();
      for (const optionValue of borderColorOptions) {
        if (!optionValue || seenBorderColors.has(optionValue)) {
          continue;
        }
        lib.appendOption(blockBorderColorSelect, optionValue);
        seenBorderColors.add(optionValue);
      }
      blockBorderColorSelect.value = defaultBorderColor;
    }

    const controlTextFontSelect = document.querySelector(
      "#sdCtrlText_fontFamily"
    );
    if (controlTextFontSelect) {
      let defaultControlFont = null;
      defaultControlFont = ControlTextElement.getDefaultFont();
      if (defaultControlFont) {
        controlTextFontSelect.value = defaultControlFont;
      }

      controlTextFontSelect.addEventListener("change", () => {
        const selectedFont = controlTextFontSelect.value;
        const availableFonts = TextElement.prototype.fontFamily;
        if (!selectedFont || !availableFonts.includes(selectedFont)) {
          return;
        }
        ControlTextElement.setDefaultFont(selectedFont);
        setStoredItem(STORAGE_KEYS.controlTextFont, selectedFont);
      });
    }

    for (const elem of textElem_alignmentSelects) {
      for (const alignment of TextElement.prototype.alignment) {
        lib.appendOption(elem, alignment);
      }
    }

    let textElem_justificationSelects = [
      document.querySelector("#sdCtrlText_justification"),
      document.querySelector("#sdAdvisory_justification"),
      document.querySelector("#sdActionMessage_justification"),
      document.querySelector("#sdElectronicSign_justification"),
    ];
    for (const elem of textElem_justificationSelects) {
      for (const justification of TextElement.prototype.justification) {
        lib.appendOption(elem, justification);
      }
    }

    for (const elem of textElem_bgColorSelects) {
      for (const backgroundColor of TextElement.prototype.backgroundColor) {
        lib.appendOption(elem, backgroundColor);
      }
    }

    for (const fontFamily of ElectronicSignElement.prototype.fontFamily) {
      lib.appendOption(
        document.querySelector("#sdElectronicSign_fontFamily"),
        fontFamily
      );
    }

    for (const textColor of ElectronicSignElement.prototype.textColors) {
      lib.appendOption(
        document.querySelector("#sdElectronicSign_textColor"),
        textColor
      );
    }

    for (const measurement of DividerElement.prototype.dividerMeasurement) {
      lib.appendOption(divider_widthMeasurement, measurement);
    }

    for (const orientation of DividerElement.prototype.orientations || []) {
      lib.appendOption(divider_orientationSelect, orientation);
    }

    for (const { value, label } of DividerElement.prototype.dividerColors) {
      lib.appendOption(divider_colorSelect, value, { text: label });
    }

    if (shield_shieldBase && ShieldElement.prototype.blockShieldBases) {
      const shields = ShieldElement.prototype.blockShieldBases || [];
      const currentValue =
        shield_shieldBase.value || ShieldElement.prototype.defaultShieldBase;
      shield_shieldBase.innerHTML = "";

      const groupMap = new Map();
      for (const shield of shields) {
        const categories = Array.isArray(shield.categories)
          ? shield.categories
          : [];
        const groupLabel = categories.length ? categories.join(" / ") : "Other";
        if (!groupMap.has(groupLabel)) {
          groupMap.set(groupLabel, []);
        }
        groupMap.get(groupLabel).push(shield);
      }

      let firstOptionValue = "";
      const sortedGroups = Array.from(groupMap.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
      );

      for (const [groupLabel, groupShields] of sortedGroups) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = groupLabel;

        groupShields
          .slice()
          .sort((a, b) =>
            (a.label || a.value).localeCompare(b.label || b.value)
          )
          .forEach(({ value, label }) => {
            const option = document.createElement("option");
            option.value = value;
            option.text = label || value;
            if (!firstOptionValue) {
              firstOptionValue = value;
            }
            if (currentValue && value === currentValue) {
              option.selected = true;
            }
            optgroup.appendChild(option);
          });

        shield_shieldBase.appendChild(optgroup);
      }

      if (!shield_shieldBase.value && firstOptionValue) {
        shield_shieldBase.value = firstOptionValue;
      }
    }

    const shieldVariantSelect = document.querySelector("#sdShield_shieldType");
    if (shieldVariantSelect && ShieldElement.prototype.blockShieldVariants) {
      const populateVariantOptions = (baseValue, currentValue) => {
        shieldVariantSelect.innerHTML = "";
        const config = ShieldElement.prototype.getBlockShieldConfig(baseValue);
        const variants =
          (config && Array.isArray(config.variants) && config.variants.length
            ? config.variants
            : []) || [];
        const optionsToUse = variants.length
          ? variants
          : (ShieldElement.prototype.blockShieldVariants || []).map(
            (variant) => variant.value || variant
          );
        for (const variant of optionsToUse) {
          lib.appendOption(shieldVariantSelect, variant, { text: variant });
        }
        if (currentValue && optionsToUse.includes(currentValue)) {
          shieldVariantSelect.value = currentValue;
        }
      };

      populateVariantOptions(
        shield_shieldBase?.value || ShieldElement.prototype.defaultShieldBase,
        shieldVariantSelect.value
      );

      if (shield_shieldBase) {
        shield_shieldBase.addEventListener("change", () => {
          populateVariantOptions(shield_shieldBase.value, null);
        });
      }
    }

    const blockShieldBannerSelects = [
      document.querySelector("#sdShield_bannerType"),
      document.querySelector("#sdShield_bannerType2"),
    ];
    for (const select of blockShieldBannerSelects) {
      if (!select) {
        continue;
      }
      for (const bannerType of Shield.prototype.bannerTypes) {
        lib.appendOption(select, bannerType);
      }
    }

    const blockBannerPositionSelects = [
      document.querySelector("#sdShield_bannerPosition"),
      document.querySelector("#sdShield_bannerPosition2"),
    ];
    const bannerPositionOptions = ShieldElement.prototype.blockBannerPositions;
    for (const select of blockBannerPositionSelects) {
      if (!select || !bannerPositionOptions.length) {
        continue;
      }
      for (const bannerPosition of bannerPositionOptions) {
        lib.appendOption(select, bannerPosition);
      }
    }

    const blockBannerFontSelect = document.querySelector(
      "#sdShield_bannerFontFamily"
    );
    if (blockBannerFontSelect) {
      const bannerFontOptions = ShieldElement.prototype.getBannerFontOptions();
      if (
        (!bannerFontOptions || !bannerFontOptions.length) &&
        ShieldElement.prototype.defaultBannerFontFamily
      ) {
        lib.appendOption(
          blockBannerFontSelect,
          ShieldElement.prototype.defaultBannerFontFamily
        );
      } else {
        for (const font of bannerFontOptions) {
          lib.appendOption(blockBannerFontSelect, font);
        }
      }
      const defaultBannerFont =
        ShieldElement.prototype.defaultBannerFontFamily ||
        (bannerFontOptions.length ? bannerFontOptions[0] : "");
      if (defaultBannerFont) {
        blockBannerFontSelect.value = defaultBannerFont;
      }
      blockBannerFontSelect.addEventListener("change", () => {
        const selectedFont = blockBannerFontSelect.value;
        if (selectedFont) {
          ShieldElement.prototype.defaultBannerFontFamily = selectedFont;
          setStoredItem(STORAGE_KEYS.bannerFontFamily, selectedFont);
        }
        readForm();
      });
    }



    const arrowElemSelect = document.querySelector("#sdArrow_arrow");
    const arrowSizeInput = document.querySelector("#sdArrow_size");
    if (arrowElemSelect) {
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
    }

    if (arrowElemSelect && arrowSizeInput) {
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
        readForm();
      });
    }

    const arrowRotationSlider = document.getElementById("sdArrow_rotation");
    const arrowRotationVal = document.getElementById("sdArrow_rotationVal");
    if (arrowRotationSlider && arrowRotationVal) {
      arrowRotationSlider.addEventListener("input", () => {
        arrowRotationVal.value = arrowRotationSlider.value;
      });
    }

    const arrowRotationButtons = document.querySelectorAll(
      ".sdArrow_rotationPreset"
    );
    for (const button of arrowRotationButtons) {
      button.addEventListener("click", () => {
        if (!arrowRotationSlider || !arrowRotationVal) {
          return;
        }
        const degrees = parseFloat(button.dataset.degrees || "0") || 0;
        arrowRotationSlider.value = degrees.toString();
        arrowRotationVal.value = degrees.toString();
        arrowRotationButtons.forEach((presetButton) => {
          presetButton.classList.toggle("activated", presetButton === button);
        });
        readForm();
      });
    }

    const arrowFlipInput = document.getElementById("sdArrow_flip");
    const arrowFlipButton = document.getElementById("sdArrow_flipButton");
    if (arrowFlipButton && arrowFlipInput) {
      arrowFlipButton.addEventListener("click", () => {
        const newValue = arrowFlipInput.value === "true" ? "false" : "true";
        arrowFlipInput.value = newValue;
        const isFlipped = newValue === "true";
        arrowFlipButton.classList.toggle("activated", isFlipped);
        arrowFlipButton.setAttribute(
          "aria-pressed",
          isFlipped ? "true" : "false"
        );
        arrowFlipButton.textContent = isFlipped ? "Unflip" : "Flip";
        readForm();
      });
    }

    document.querySelectorAll(".smallVal").forEach((valEl) => {
      const onChange = (e) => {
        const id = valEl.id || "";
        if (id.endsWith("Val")) {
          const controlId = id.slice(0, -3);
          const control = document.getElementById(controlId);
          if (control) {
            if (
              control.type === "range" ||
              control.type === "number" ||
              control.tagName === "INPUT" ||
              control.tagName === "SELECT"
            ) {
              control.value = valEl.value;
            }
          }
        }
        readForm();
      };
      valEl.addEventListener("change", onChange);
    });

    const tollLogoSelectElmt = document.getElementById("sdTollLogo_logo");
    if (tollLogoSelectElmt) {
      for (const logoKey in TollLogoElement.prototype.logos) {
        const logoDef = TollLogoElement.prototype.logos[logoKey];
        lib.appendOption(tollLogoSelectElmt, logoKey, {
          text: logoDef.label,
          selected: logoKey == TollLogoElement.prototype.defaultLogo,
        });
      }
    }

    const iconSelectElmt = document.getElementById("sdIcon_icon");
    if (iconSelectElmt) {
      for (const iconKey in IconElement.prototype.icons) {
        const iconDef = IconElement.prototype.icons[iconKey];
        lib.appendOption(iconSelectElmt, iconKey, {
          text: iconDef.label,
          selected: iconKey == IconElement.prototype.defaultIcon,
        });
      }
    }

    // Populate shield directory
    const presetShieldList = document.querySelector("#presetShieldList");

    const createShieldRow = (name, properties) => {
      const shieldCategoryType = document.createElement("div");
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
        properties.variants[0] || ""
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
      const shieldCategoryHead = document.createElement("div");
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

    // Search
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
                '.shieldCategory[data-category="' + category + '"]'
              );
              if (searchFromDir(cat, childElem)) {
                hasAnything = true;
                childElem.classList.remove("hidden");

                if (query != "") {
                  console.log(query);
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
                '.shieldCategoryType[data-name="' + category + '"]'
              ).style.display = "";
            } else {
              parentElem.querySelector(
                '.shieldCategoryType[data-name="' + category + '"]'
              ).style.display = "none";
            }
          }
          return hasAnything;
        };
        searchFromDir(Shield.prototype.shieldDirectory, presetShieldList);
      });
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
    toggleTargets(`${block}_background`, [
      `${block}_backgroundColor`,
      `${block}_borderRadius`,
      `${block}_horizontalPadding`,
      `${block}_verticalPadding`,
      `${block}_hasOnlyBlock`,
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
    const requestedPostColor = form["postColor"] ? form["postColor"].value : null;
    if (
      requestedPostColor &&
      Array.isArray(Post.prototype.colors) &&
      Post.prototype.colors.includes(requestedPostColor)
    ) {
      post.color = requestedPostColor;
    }
    post.showPost = form["showPost"].checked;
    post.secondExitOnly = form["secondExitOnly"].checked;
    setStoredItem(STORAGE_KEYS.postPosition, post.polePosition);
    setStoredItem(STORAGE_KEYS.showPost, String(!!post.showPost));
    setStoredItem(STORAGE_KEYS.postColor, post.color);

    // Panel
    currentPanel.color = form["panelColor"].value;
    currentPanel.corner = form["panelCorner"].value;
    const panelBorderRadiusInput = parseFloat(form["panelBorderRadius"].value);
    currentPanel.borderRadius = Number.isFinite(panelBorderRadiusInput)
      ? Math.max(0, panelBorderRadiusInput)
      : Panel.prototype.defaultBorderRadius;

    post.disableFlash = form["disableFlash"].checked;

    // Exit Tab
    exitTab.number = form["exitNumber"].value;
    exitTab.width = form["exitTabWidth"].value;
    exitTab.position = form["exitTabPosition"].value;
    exitTab.color = form["exitColor"].value;
    exitTab.variant = form["exitVariant"].value;

    toggleExitTabVariantOptionsVisibility(exitTab.variant);

    const resolveDefaultTollLogoSize = () =>
      typeof ExitTab.prototype.defaultTollLogoSize === "number"
        ? ExitTab.prototype.defaultTollLogoSize
        : 3;
    const tollLogoSizeField = form["exitTollLogoSize"];
    const parsedTollLogoSize =
      tollLogoSizeField && tollLogoSizeField.value !== ""
        ? parseFloat(tollLogoSizeField.value)
        : NaN;
    const normalizedTollLogoSize =
      Number.isFinite(parsedTollLogoSize) && parsedTollLogoSize > 0
        ? parsedTollLogoSize
        : Number.isFinite(exitTab.tollLogoSize) && exitTab.tollLogoSize > 0
          ? exitTab.tollLogoSize
          : resolveDefaultTollLogoSize();
    exitTab.tollLogoSize = normalizedTollLogoSize;
    if (tollLogoSizeField) {
      tollLogoSizeField.value = normalizedTollLogoSize;
    }
    const tollLogoSizeValueElmt = document.getElementById(
      "exitTollLogoSizeValue"
    );
    if (tollLogoSizeValueElmt) {
      tollLogoSizeValueElmt.textContent = normalizedTollLogoSize.toString();
    }

    if (exitTab.variant == "Toll Logo") {
      const tollLogoSelectField = form["exitTollLogoSelect"];
      const tollLogoOptions = TollLogoElement.prototype.logos;
      let selectedLogo =
        tollLogoSelectField && tollLogoSelectField.value
          ? tollLogoSelectField.value
          : null;
      if (!tollLogoOptions || !tollLogoOptions[selectedLogo]) {
        selectedLogo =
          tollLogoOptions && TollLogoElement.prototype.defaultLogo
            ? TollLogoElement.prototype.defaultLogo
            : null;
      }
      exitTab.icon = selectedLogo;
      exitTab.useTextBasedIcon = false;
      const tollLogoOnlyField = form["exitTollLogoOnly"];
      exitTab.tollLogoOnly =
        tollLogoOnlyField && typeof tollLogoOnlyField.checked === "boolean"
          ? tollLogoOnlyField.checked
          : true;
      const tollLogoSquareField = form["exitTollLogoSquare"];
      exitTab.tollLogoSquare =
        tollLogoSquareField && typeof tollLogoSquareField.checked === "boolean"
          ? tollLogoSquareField.checked
          : false;
    } else if (exitTab.variant == "Icon") {
      const iconSelectField = form["iconSelect"];
      exitTab.icon = iconSelectField ? iconSelectField.value : null;
      exitTab.useTextBasedIcon = false;
    } else {
      exitTab.icon = null;
      exitTab.useTextBasedIcon = false;
      exitTab.tollLogoOnly =
        typeof exitTab.tollLogoOnly === "boolean" ? exitTab.tollLogoOnly : true;
      exitTab.tollLogoSquare = !!exitTab.tollLogoSquare;
    }

    exitTab.FHWAFont = form["exitFont"].checked;
    exitTab.showLeft = form["showLeft"].checked;
    exitTab.fullBorder = form["fullBorder"].checked;
    exitTab.squareCorners = form["squareCorners"].checked;
    exitTab.topOffset = form["topOffset"].checked;
    exitTab.verticalArrangement = form["verticalArrangement"].checked;
    exitTab.caStyle = form["caStyle"].checked;

    setStoredItem(STORAGE_KEYS.exitTabFHWAFont, String(!!exitTab.FHWAFont));
    setStoredItem(STORAGE_KEYS.exitTabFullBorder, String(!!exitTab.fullBorder));
    setStoredItem(STORAGE_KEYS.exitTabSquareCorners, String(!!exitTab.squareCorners));
    setStoredItem(STORAGE_KEYS.exitTabTopOffset, String(!!exitTab.topOffset));
    const borderThicknessInput = parseFloat(form["borderThickness"].value);
    exitTab.borderThickness = Number.isFinite(borderThicknessInput)
      ? Math.max(0, borderThicknessInput)
      : ExitTab.prototype.defaultBorderThickness;
    exitTab.minHeight = form["minHeight"].value;
    exitTab.fontSize = form["fontSize"].value;

    // Nested Tab Spacing (always applies to parent exit tab, not nested tabs)
    const parentExitTab = currentPanel.exitTabs[exposed.vars.currentlySelectedExitTabIndex];
    const nestedTabSpacingInput = parseFloat(form["nestedTabSpacing"]?.value);
    if (parentExitTab) {
      parentExitTab.nestedTabSpacing = Number.isFinite(nestedTabSpacingInput)
        ? Math.max(0, nestedTabSpacingInput)
        : 0;
    }

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
      const customBannerInput = document.getElementById(
        `shield${shieldIndex}_bannerCustomText`
      );
      const customBannerText =
        customBannerInput && customBannerInput.value
          ? customBannerInput.value.trim()
          : "";
      shield.bannerType = customBannerText || shield.bannerType;
      shield.bannerPosition = document.getElementById(
        `shield${shieldIndex}_bannerPosition`
      ).value;
      shield.bannerType2 = document.getElementById(
        `shield${shieldIndex}_bannerType2`
      ).value;
      const customBannerInput2 = document.getElementById(
        `shield${shieldIndex}_bannerCustomText2`
      );
      const customBannerText2 =
        customBannerInput2 && customBannerInput2.value
          ? customBannerInput2.value.trim()
          : "";
      shield.bannerType2 = customBannerText2 || shield.bannerType2;
      shield.specialBannerType =
        document.getElementById(`shield${shieldIndex}_specialBannerType`)
          .value || "None";
      shield.indentFirstLetter = document.getElementById(
        `shield${shieldIndex}_indentFirstLetter`
      ).checked;
      const indentSecondElmt = document.getElementById(
        `shield${shieldIndex}_indentFirstLetter2`
      );
      shield.indentFirstLetter2 =
        indentSecondElmt && typeof indentSecondElmt.checked === "boolean"
          ? indentSecondElmt.checked
          : shield.indentFirstLetter;
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
        const handleCustomBanner =
          blockElemType === "sdShield" &&
          (propertyName === "bannerType" || propertyName === "bannerType2");
        if (handleCustomBanner) {
          const customInputId =
            propertyName === "bannerType"
              ? "sdShield_bannerCustomText"
              : "sdShield_bannerCustomText2";
          const customInput = document.getElementById(customInputId);
          const customValue =
            customInput && typeof customInput.value === "string"
              ? customInput.value.trim()
              : "";
          if (customValue) {
            currentBlockElem[propertyName] = customValue;
          } else if (element.tagName === "SELECT") {
            currentBlockElem[propertyName] = element.value;
          }
          continue;
        }
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

    if (blockElemType === "sdShield") {
      currentBlockElem.shieldSize =
        ShieldElement.prototype.normalizeShieldSize(
          currentBlockElem.shieldSize
        );
      currentBlockElem.scaleBannersWithShield =
        ShieldElement.prototype.normalizeScaleBannersWithShield(
          currentBlockElem.scaleBannersWithShield
        );
      const disableSmallCapsElmt = document.getElementById(
        "sdShield_disableSmallCaps"
      );
      const disableSmallCapsElmt2 = document.getElementById(
        "sdShield_disableSmallCaps2"
      );
      if (disableSmallCapsElmt) {
        currentBlockElem.smallCaps = !disableSmallCapsElmt.checked;
      }
      if (disableSmallCapsElmt2) {
        currentBlockElem.smallCaps2 = !disableSmallCapsElmt2.checked;
      }
    }

    if (blockElemType === "sdArrow") {
      currentBlockElem.flip =
        currentBlockElem.flip === true ||
        currentBlockElem.flip === "true" ||
        currentBlockElem.flip === 1 ||
        currentBlockElem.flip === "1" ||
        currentBlockElem.flip === "on";
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
      "#sdBlock_backgroundColor"
    ).value;
    subPanel.blockElements.blockProperties[
      exposed.vars.currentlySelectedRowIndex
    ].borderColor = document.querySelector("#sdBlock_borderColor").value;
    subPanel.blockElements.blockProperties[
      exposed.vars.currentlySelectedRowIndex
    ].backgroundFullWidth = document.querySelector(
      "#sdBlock_backgroundFullWidth"
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

    if (
      currentPanel.sign.subPanels.length > 1 &&
      exposed.vars.currentlySelectedSubPanelIndex == 0
    ) {
      subPanel.width = parseInt(form["subPanelLength"].value);
    } else if (exposed.vars.currentlySelectedSubPanelIndex != 0) {
      const subPanelHeightField = form["subPanelHeight"];
      const rawHeightValue =
        subPanelHeightField && typeof subPanelHeightField.value === "string"
          ? subPanelHeightField.value.trim()
          : "";
      const hasCustomHeight = !!rawHeightValue;
      subPanel.customDividerHeight = hasCustomHeight;
      subPanel.height = SubPanels.normalizeHeight(
        hasCustomHeight ? rawHeightValue : undefined
      );
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
    } else if (
      currentPanel.sign.guideArrow == "Exit Only" &&
      (currentPanel.sign.guideArrowLanes == 1 ||
        currentPanel.sign.guideArrowLanes == 2)
    ) {
      currentPanel.sign.arrowPosition = form["arrowLocations"].value;

      for (const arrowPosition of Sign.prototype.arrowPositions) {
        if (
          !form["arrowLocations"].querySelector(
            `option[value="${arrowPosition}"]`
          )
        ) {
          lib.appendOption(form["arrowLocations"], arrowPosition);
        }
      }
    } else {
      currentPanel.sign.arrowPosition = form["arrowLocations"].value;

      if (!form["arrowLocations"].querySelector("option[value=Middle]")) {
        lib.appendOption(form["arrowLocations"], "Middle");
      }
    }

    const useCanadianDownArrowField = form["useCanadianDownArrows"];
    currentPanel.sign.useCanadianDownArrows = !!(
      useCanadianDownArrowField && useCanadianDownArrowField.checked
    );

    currentPanel.sign.exitguideArrows = exitOnlyDirection_result;
    currentPanel.sign.showExitOnly = form["showExitOnly"].checked;
    currentPanel.sign.hideExitArrow = form["hideExitArrow"]
      ? form["hideExitArrow"].checked
      : false;
    const borderModeField = form["exitOnlyBorderMode"];
    if (borderModeField) {
      const selectedMode = borderModeField.value;
      currentPanel.sign.exitOnlyBorderMode = Sign.prototype.exitOnlyBorderModes.includes(
        selectedMode
      )
        ? selectedMode
        : Sign.prototype.exitOnlyBorderModes[0];
    } else {
      currentPanel.sign.exitOnlyBorderMode = Sign.prototype.exitOnlyBorderModes[0];
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
    const halfExitGapInput = parseFloat(document.getElementById("halfExitGap")?.value);
    currentPanel.sign.halfExitGap = Number.isFinite(halfExitGapInput) ? halfExitGapInput : 5;

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
    const hideExitArrowLabel = document.getElementById("hideExitArrowLabel");
    const exitOnlyDirection = document.getElementById("exitOnlyDirection");
    const showExitOnly = document.getElementById("showExitOnly");
    const hideExitArrow = document.getElementById("hideExitArrow");
    const exitOnlyBorderModeLabel = document.getElementById(
      "exitOnlyBorderModeLabel"
    );
    const exitOnlyBorderModeSelect = document.getElementById(
      "exitOnlyBorderMode"
    );
    const exitOnlyLeftTextLabel = document.getElementById(
      "exitOnlyLeftTextLabel"
    );
    const exitOnlyLeftTextInput = document.getElementById("exitOnlyLeftText");
    const exitOnlyRightTextLabel = document.getElementById(
      "exitOnlyRightTextLabel"
    );
    const exitOnlyRightTextInput = document.getElementById("exitOnlyRightText");

    if (
      currentPanel.sign.guideArrow != "Exit Only" &&
      currentPanel.sign.guideArrow != "Split Exit Only" &&
      currentPanel.sign.guideArrow != "Half Exit Only"
    ) {
      exitOnlyDirectionLabel.style.visibility = "hidden";
      showExitOnlyLabel.style.visibility = "hidden";
      exitOnlyDirection.style.visibility = "hidden";
      showExitOnly.style.visibility = "hidden";
      if (hideExitArrowLabel && hideExitArrow) {
        hideExitArrowLabel.style.visibility = "hidden";
        hideExitArrow.style.visibility = "hidden";
      }
      if (exitOnlyLeftTextLabel && exitOnlyLeftTextInput) {
        exitOnlyLeftTextLabel.style.visibility = "hidden";
        exitOnlyLeftTextInput.style.visibility = "hidden";
      }
      if (exitOnlyRightTextLabel && exitOnlyRightTextInput) {
        exitOnlyRightTextLabel.style.visibility = "hidden";
        exitOnlyRightTextInput.style.visibility = "hidden";
      }
      if (exitOnlyBorderModeLabel && exitOnlyBorderModeSelect) {
        exitOnlyBorderModeLabel.style.visibility = "hidden";
        exitOnlyBorderModeSelect.style.visibility = "hidden";
      }
    } else {
      exitOnlyDirectionLabel.style.visibility = "visible";
      showExitOnlyLabel.style.visibility = "visible";
      exitOnlyDirection.style.visibility = "visible";
      showExitOnly.style.visibility = "visible";
      if (hideExitArrowLabel && hideExitArrow) {
        hideExitArrowLabel.style.visibility = "visible";
        hideExitArrow.style.visibility = "visible";
      }
      if (exitOnlyLeftTextLabel && exitOnlyLeftTextInput) {
        exitOnlyLeftTextLabel.style.visibility = "visible";
        exitOnlyLeftTextInput.style.visibility = "visible";
      }
      if (exitOnlyRightTextLabel && exitOnlyRightTextInput) {
        exitOnlyRightTextLabel.style.visibility = "visible";
        exitOnlyRightTextInput.style.visibility = "visible";
      }
      if (exitOnlyBorderModeLabel && exitOnlyBorderModeSelect) {
        const shouldShowBorderMode =
          !post.secondExitOnly &&
          (currentPanel.sign.guideArrow == "Half Exit Only" ||
            currentPanel.sign.guideArrow == "Exit Only");
        exitOnlyBorderModeLabel.style.visibility = shouldShowBorderMode
          ? "visible"
          : "hidden";
        exitOnlyBorderModeSelect.style.visibility = shouldShowBorderMode
          ? "visible"
          : "hidden";
      }
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
    if (exposed && typeof exposed.getPost === "function") {
      post = exposed.getPost();
    }
    if (!post || !Array.isArray(post.panels) || post.panels.length === 0) {
      return;
    }

    // Icon Modal Logic
    const iconChooseBtn = document.getElementById("sdIcon_chooseBtn");
    const iconModal = document.getElementById("iconSelectorModal");
    const closeIconModalBtn = document.getElementById("closeIconSelector");
    const iconSearch = document.getElementById("iconSearch");
    const iconGrid = document.getElementById("iconGrid");
    const iconInput = document.getElementById("sdIcon_icon");
    const iconLabel = document.getElementById("sdIcon_selectedLabel");

    if (iconChooseBtn && iconModal && !iconChooseBtn.hasAttribute("data-initialized")) {
      iconChooseBtn.setAttribute("data-initialized", "true");

      const populateGrid = (filter = "") => {
        lib.clearChildren(iconGrid);
        const filterText = filter.toLowerCase();

        for (const iconKey in IconElement.prototype.icons) {
          const iconDef = IconElement.prototype.icons[iconKey];
          if (iconDef.label.toLowerCase().includes(filterText)) {
            const item = document.createElement("div");
            item.className = "iconGridItem";

            const img = document.createElement("img");
            img.src = iconDef.src;
            img.loading = "lazy";
            img.title = iconDef.label; // Tooltip for accessibility

            item.appendChild(img);

            item.onclick = () => {
              iconInput.value = iconKey;
              iconLabel.textContent = "Current: " + iconDef.label;
              readForm(); // Trigger update
              iconModal.close();
            };

            iconGrid.appendChild(item);
          }
        }
      };

      iconChooseBtn.onclick = () => {
        populateGrid();
        iconSearch.value = "";
        iconModal.showModal();
      };

      closeIconModalBtn.onclick = () => {
        iconModal.close();
      };

      iconSearch.oninput = (e) => {
        populateGrid(e.target.value);
      };
    }

    // Update label on form update
    if (iconInput && iconLabel) {
      const currentIconKey = iconInput.value || IconElement.prototype.defaultIcon;
      const currentIconDef = IconElement.prototype.icons[currentIconKey];
      if (currentIconDef) {
        iconLabel.textContent = "Current: " + currentIconDef.label;
      }
    }

    const tollLogoChooseBtn = document.getElementById("sdTollLogo_chooseBtn");
    const tollLogoModal = document.getElementById("tollLogoSelectorModal");
    const closeTollLogoModalBtn = document.getElementById("closeTollLogoSelector");
    const tollLogoSearch = document.getElementById("tollLogoSearch");
    const tollLogoGrid = document.getElementById("tollLogoGrid");
    const tollLogoInput = document.getElementById("sdTollLogo_logo");
    const tollLogoLabel = document.getElementById("sdTollLogo_selectedLabel");

    if (tollLogoChooseBtn && tollLogoModal && !tollLogoChooseBtn.hasAttribute("data-initialized")) {
      tollLogoChooseBtn.setAttribute("data-initialized", "true");

      const populateTollGrid = (filter = "") => {
        lib.clearChildren(tollLogoGrid);
        const filterText = filter.toLowerCase();

        for (const logoKey in TollLogoElement.prototype.logos) {
          const logoDef = TollLogoElement.prototype.logos[logoKey];
          if (logoDef.label.toLowerCase().includes(filterText)) {
            const item = document.createElement("div");
            item.className = "iconGridItem";

            const img = document.createElement("img");
            img.src = logoDef.src;
            img.loading = "lazy";
            img.title = logoDef.label; // Tooltip for accessibility

            item.appendChild(img);

            item.onclick = () => {
              tollLogoInput.value = logoKey;
              tollLogoLabel.textContent = "Current: " + logoDef.label;
              readForm(); // Trigger update
              tollLogoModal.close();
            };

            tollLogoGrid.appendChild(item);
          }
        }
      };

      tollLogoChooseBtn.onclick = () => {
        populateTollGrid();
        tollLogoSearch.value = "";
        tollLogoModal.showModal();
      };

      closeTollLogoModalBtn.onclick = () => {
        tollLogoModal.close();
      };

      tollLogoSearch.oninput = (e) => {
        populateTollGrid(e.target.value);
      };
    }

    // Update label on form update for Toll Logo
    if (tollLogoInput && tollLogoLabel) {
      const currentLogoKey = tollLogoInput.value || TollLogoElement.prototype.defaultLogo;
      const currentLogoDef = TollLogoElement.prototype.logos[currentLogoKey];
      if (currentLogoDef) {
        tollLogoLabel.textContent = "Current: " + currentLogoDef.label;
      }
    }

    const arrowChooseBtn = document.getElementById("sdArrow_chooseBtn");
    const arrowModal = document.getElementById("arrowSelectorModal");
    const closeArrowModalBtn = document.getElementById("closeArrowSelector");
    const arrowSearch = document.getElementById("arrowSearch");
    const arrowGrid = document.getElementById("arrowGrid");
    const arrowInput = document.getElementById("sdArrow_arrow");
    const arrowLabel = document.getElementById("sdArrow_selectedLabel");

    if (arrowChooseBtn && arrowModal && !arrowChooseBtn.hasAttribute("data-initialized")) {
      arrowChooseBtn.setAttribute("data-initialized", "true");

      const populateArrowGrid = (filter = "") => {
        lib.clearChildren(arrowGrid);
        const filterText = filter.toLowerCase();

        for (const arrowKey in ArrowElement.prototype.arrows) {
          const arrowDef = ArrowElement.prototype.arrows[arrowKey];
          if (arrowDef.label.toLowerCase().includes(filterText)) {
            const item = document.createElement("div");
            item.className = "iconGridItem";

            const img = document.createElement("img");
            img.src = arrowDef.src;
            img.loading = "lazy";
            img.title = arrowDef.label;

            item.appendChild(img);

            item.onclick = () => {
              arrowInput.value = arrowKey;
              arrowLabel.textContent = "Current: " + arrowDef.label;
              readForm(); // Trigger update
              arrowModal.close();
            };

            arrowGrid.appendChild(item);
          }
        }
      };

      arrowChooseBtn.onclick = () => {
        populateArrowGrid();
        arrowSearch.value = "";
        arrowModal.showModal();
      };

      closeArrowModalBtn.onclick = () => {
        arrowModal.close();
      };

      arrowSearch.oninput = (e) => {
        populateArrowGrid(e.target.value);
      };
    }

    // Update label on form update for Arrow
    if (arrowInput && arrowLabel) {
      const currentArrowKey = arrowInput.value || ArrowElement.prototype.defaultArrow;
      const currentArrowDef = ArrowElement.prototype.arrows[currentArrowKey];
      if (currentArrowDef) {
        arrowLabel.textContent = "Current: " + currentArrowDef.label;
      }
    }

    const panel = exposed.getCurrentPanel();
    const sign =
      exposed.vars.currentlySelectedSubPanelIndex != -1
        ? panel.sign.subPanels[exposed.vars.currentlySelectedSubPanelIndex]
        : panel.sign;

    const selectedExitTabIndex = exposed.vars.currentlySelectedExitTabIndex;
    const selectedNestedExitTabIndex =
      exposed.vars.currentlySelectedNestedExitTabIndex;
    const currentExitTab = panel.exitTabs[selectedExitTabIndex];

    const maxNested =
      ExitTab.prototype.maxNested != null ? ExitTab.prototype.maxNested : 1;

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
    toggleExitTabWiggle(false);
    clearExitTabDropIndicators();
    exitTabDragState = null;
    endPanelDrag();
    togglePanelListWiggle(false);

    if (exitTabList && !exitTabList.dataset.exitTabDragAttached) {
      exitTabList.addEventListener("dragover", handleExitTabDragOver);
      exitTabList.addEventListener("drop", handleExitTabDrop);
      exitTabList.addEventListener("dragleave", handleExitTabDragLeave);
      exitTabList.dataset.exitTabDragAttached = "true";
    }

    if (panelList && !panelList.dataset.panelDragAttached) {
      panelList.addEventListener("dragover", handlePanelDragOver);
      panelList.addEventListener("drop", handlePanelDrop);
      panelList.addEventListener("dragleave", handlePanelDragLeave);
      panelList.dataset.panelDragAttached = "true";
    }

    const postPositionSelectElmt = document.getElementById("postPosition");
    if (postPositionSelectElmt && post.polePosition) {
      postPositionSelectElmt.value = post.polePosition;
    }

    const postColorSelectElmt = document.getElementById("postColor");
    if (postColorSelectElmt && post.color) {
      postColorSelectElmt.value = post.color;
    }

    const showPostCheckbox = document.getElementById("showPost");
    if (showPostCheckbox) {
      showPostCheckbox.checked = !!post.showPost;
    }

    const secondExitOnlyCheckbox = document.getElementById("secondExitOnly");
    if (secondExitOnlyCheckbox) {
      secondExitOnlyCheckbox.checked = !!post.secondExitOnly;
    }

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
      panelButton.type = "button";
      panelButton.className =
        "panelListButton" +
        (exposed.vars.currentlySelectedPanelIndex == panelIndex
          ? " active"
          : "");
      panelButton.dataset.panelIndex = panelIndex.toString();
      panelButton.draggable = post.panels.length > 1;

      const label = document.createElement("span");
      label.className = "panelListLabel";
      label.textContent = "Panel " + (panelIndex + 1);
      panelButton.appendChild(label);

      panelButton.addEventListener("click", function () {
        exposed.changeEditingPanel(panelIndex);
        panelButton.classList.add("active");
      });
      panelButton.addEventListener("dragstart", handlePanelDragStart);
      panelButton.addEventListener("dragend", handlePanelDragEnd);

      panelList.appendChild(panelButton);
    }

    const currentlySelectedPanelLabel = document.getElementById(
      "currentlySelectedPanel"
    );
    if (currentlySelectedPanelLabel) {
      const selectedPanelNumber = Math.max(
        1,
        Math.min(post.panels.length, exposed.vars.currentlySelectedPanelIndex + 1)
      );
      currentlySelectedPanelLabel.textContent = "Panel " + selectedPanelNumber;
    }

    const panelSpacingSlider = document.getElementById("panelSpacing");
    const panelSpacingValueInput =
      document.getElementById("panelSpacingValue");
    const resolvedPanelSpacing =
      typeof post.panelSpacing === "number" && post.panelSpacing >= 0
        ? post.panelSpacing
        : 0;
    if (panelSpacingSlider) {
      panelSpacingSlider.value = resolvedPanelSpacing;
    }
    if (panelSpacingValueInput) {
      panelSpacingValueInput.value = resolvedPanelSpacing;
    }

    const postThicknessValueInput =
      document.getElementById("postThicknessValue");
    const resolvedPostThickness =
      post && typeof post.normalizeThickness === "function"
        ? post.normalizeThickness(post.thickness)
        : normalizeStoredPostThickness(post ? post.thickness : undefined);
    if (post) {
      post.thickness = resolvedPostThickness;
    }
    if (postThicknessValueInput) {
      postThicknessValueInput.value = resolvedPostThickness;
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
      const exitTabGroup = document.createElement("div");
      exitTabGroup.className = "exitTabGroup";

      const exitTabButton = document.createElement("button");
      exitTabButton.type = "button";
      exitTabButton.id = "tab_edit" + (exitTabIndex + 1);
      exitTabButton.className = "exitTabButton";
      exitTabButton.textContent = "Exit Tab " + (exitTabIndex + 1);

      if (
        exposed.vars.currentlySelectedExitTabIndex === exitTabIndex &&
        exposed.vars.currentlySelectedNestedExitTabIndex === -1
      ) {
        exitTabButton.classList.add("active");
      }

      exitTabButton.addEventListener("click", function () {
        exposed.changeEditingExitTab(exitTabIndex);
      });

      exitTabButton.dataset.exitTabIndex = exitTabIndex.toString();
      exitTabButton.draggable = panel.exitTabs.length > 1;
      exitTabButton.addEventListener("dragstart", handleExitTabDragStart);
      exitTabButton.addEventListener("dragend", handleExitTabDragEnd);

      exitTabGroup.appendChild(exitTabButton);

      const nestedExitTabs =
        panel.exitTabs[exitTabIndex].nestedExitTabs || [];
      const allowedNestedLength = Math.min(
        nestedExitTabs.length,
        maxNested != null ? maxNested : nestedExitTabs.length
      );

      for (
        let nestIndex = 0;
        nestIndex < allowedNestedLength;
        nestIndex++
      ) {
        const nestedButton = document.createElement("button");
        nestedButton.type = "button";
        nestedButton.id =
          "tab_edit" + (exitTabIndex + 1) + "_nest" + (nestIndex + 1);
        nestedButton.className = "exitTabNestedButton";
        nestedButton.textContent = "Nested Exit Tab " + (nestIndex + 1);

        if (
          exposed.vars.currentlySelectedExitTabIndex === exitTabIndex &&
          exposed.vars.currentlySelectedNestedExitTabIndex === nestIndex
        ) {
          nestedButton.classList.add("active");
        }

        nestedButton.addEventListener("click", function () {
          exposed.changeEditingExitTab(exitTabIndex, nestIndex);
        });

        exitTabGroup.appendChild(nestedButton);
      }

      exitTabList.appendChild(exitTabGroup);
    }

    const addNestedButton = document.getElementById("addNestedExitTab");
    if (addNestedButton) {
      const selectedExitTab = panel.exitTabs[selectedExitTabIndex];
      const nestedCount =
        selectedExitTab && selectedExitTab.nestedExitTabs
          ? selectedExitTab.nestedExitTabs.length
          : 0;
      const limit = maxNested != null ? maxNested : 1;
      addNestedButton.disabled =
        !selectedExitTab || nestedCount >= limit;
    }

    // APL Arrow List Update
    const aplArrowList = document.getElementById("aplArrowList");
    const aplArrowTypeSelect = document.getElementById("aplArrowType");
    const selectedAPLIndex = exposed.vars.currentlySelectedAPLArrowIndex;

    if (aplArrowList) {
      lib.clearChildren(aplArrowList);

      // Add hint text
      const hintText = document.createElement("p");
      hintText.style.fontSize = "0.8rem";
      hintText.style.color = "#888";
      hintText.style.marginBottom = "8px";
      hintText.style.fontStyle = "italic";
      hintText.textContent = "To adjust spacing of each APL section, use the spacing section in the subpanel tab.";
      aplArrowList.appendChild(hintText);

      const aplArrows = panel.sign.aplArrows || [];

      for (let i = 0; i < aplArrows.length; i++) {
        const arrow = aplArrows[i];

        // Create container for arrow button and divider button
        const arrowContainer = document.createElement("div");
        arrowContainer.className = "aplArrowListItem";
        arrowContainer.style.display = "flex";
        arrowContainer.style.alignItems = "center";
        arrowContainer.style.gap = "4px";

        const arrowButton = document.createElement("button");
        arrowButton.type = "button";
        arrowButton.className = "scrollMenuItem" + (i === selectedAPLIndex ? " active" : "");
        arrowButton.dataset.aplIndex = i.toString();
        arrowButton.style.flex = "1";

        const arrowDef = ArrowElement.prototype.arrows[arrow.type];
        let label = arrowDef ? arrowDef.label : arrow.type;
        // Remove "APL " prefix if present
        if (label.startsWith("APL ")) {
          label = label.substring(4);
        }
        arrowButton.textContent = "Arrow " + (i + 1) + ": " + label;

        arrowButton.addEventListener("click", function () {
          if (exposed && typeof exposed.selectAPLArrow === "function") {
            exposed.selectAPLArrow(i);
          }
        });

        arrowContainer.appendChild(arrowButton);

        // Add divider button (available on all arrows if at least 2 arrows)
        if (aplArrows.length >= 2) {
          const dividerContainer = document.createElement("div");
          dividerContainer.style.display = "flex";
          dividerContainer.style.flexDirection = "row";
          dividerContainer.style.alignItems = "center";
          dividerContainer.style.gap = "4px";
          dividerContainer.style.marginLeft = "4px";

          const dividerButton = document.createElement("button");
          dividerButton.type = "button";
          dividerButton.className = "aplDividerButton" + (arrow.dividerAfter ? " active" : "");
          dividerButton.title = arrow.dividerAfter ? "Remove Divider" : "Add Divider";
          dividerButton.style.minWidth = "28px";
          dividerButton.style.padding = "4px";
          dividerButton.style.display = "flex";
          dividerButton.style.alignItems = "center";
          dividerButton.style.justifyContent = "center";

          if (arrow.dividerAfter) {
            const closeIcon = document.createElement("img");
            closeIcon.src = "img/other-symbols/ui/close.svg";
            closeIcon.alt = "Remove Divider";
            closeIcon.className = "aplDividerIcon";
            closeIcon.style.width = "20px";
            closeIcon.style.height = "20px";
            dividerButton.appendChild(closeIcon);
          } else {
            const dividerIcon = document.createElement("img");
            dividerIcon.src = "img/other-symbols/ui/divider_add.svg";
            dividerIcon.alt = "Add Divider";
            dividerIcon.className = "aplDividerIcon";
            dividerIcon.style.width = "20px";
            dividerIcon.style.height = "20px";
            dividerButton.appendChild(dividerIcon);
          }

          dividerButton.addEventListener("click", function (e) {
            e.stopPropagation();
            if (exposed && typeof exposed.addAPLDivider === "function") {
              exposed.addAPLDivider(i);
            }
          });

          dividerContainer.appendChild(dividerButton);

          if (arrow.dividerAfter) {
            // Radio buttons for divider options (when divider is active)
            const radioGroup = document.createElement("div");
            radioGroup.className = "aplDividerRadioGroup";
            radioGroup.style.display = "flex";
            radioGroup.style.flexDirection = "row";
            radioGroup.style.gap = "8px";
            radioGroup.style.fontSize = "0.75rem";
            radioGroup.style.marginLeft = "8px";
            radioGroup.style.flexWrap = "wrap";

            const radioName = "aplDividerOption_" + i;

            // Option 1: Normal (default)
            const normalLabel = document.createElement("label");
            normalLabel.className = "aplDividerRadioLabel";
            const normalRadio = document.createElement("input");
            normalRadio.type = "radio";
            normalRadio.name = radioName;
            normalRadio.value = "normal";
            normalRadio.checked = !arrow.groupedWithDivider && !arrow.exitOnly;
            normalRadio.addEventListener("change", function (e) {
              e.stopPropagation();
              if (exposed) {
                if (typeof exposed.setAPLGroupedWithDivider === "function") {
                  exposed.setAPLGroupedWithDivider(i, false);
                }
                if (typeof exposed.setAPLExitOnly === "function") {
                  exposed.setAPLExitOnly(i, false);
                }
                if (typeof exposed.selectAPLArrow === "function") {
                  exposed.selectAPLArrow(i);
                }
              }
            });
            normalLabel.appendChild(normalRadio);
            normalLabel.appendChild(document.createTextNode("Normal"));
            radioGroup.appendChild(normalLabel);

            // Option 2: Group with Last Arrow
            const groupLabel = document.createElement("label");
            groupLabel.className = "aplDividerRadioLabel";
            const groupRadio = document.createElement("input");
            groupRadio.type = "radio";
            groupRadio.name = radioName;
            groupRadio.value = "group";
            groupRadio.checked = arrow.groupedWithDivider === true;
            groupRadio.addEventListener("change", function (e) {
              e.stopPropagation();
              if (exposed && typeof exposed.setAPLGroupedWithDivider === "function") {
                exposed.setAPLGroupedWithDivider(i, true);
              }
              if (exposed && typeof exposed.selectAPLArrow === "function") {
                exposed.selectAPLArrow(i);
              }
            });
            groupLabel.appendChild(groupRadio);
            groupLabel.appendChild(document.createTextNode("Group"));
            radioGroup.appendChild(groupLabel);

            // Option 3: Exit Only
            const exitOnlyLabel = document.createElement("label");
            exitOnlyLabel.className = "aplDividerRadioLabel";
            const exitOnlyRadio = document.createElement("input");
            exitOnlyRadio.type = "radio";
            exitOnlyRadio.name = radioName;
            exitOnlyRadio.value = "exitOnly";
            exitOnlyRadio.checked = arrow.exitOnly === true;
            exitOnlyRadio.addEventListener("change", function (e) {
              e.stopPropagation();
              if (exposed && typeof exposed.setAPLExitOnly === "function") {
                exposed.setAPLExitOnly(i, true);
              }
              if (exposed && typeof exposed.selectAPLArrow === "function") {
                exposed.selectAPLArrow(i);
              }
            });
            exitOnlyLabel.appendChild(exitOnlyRadio);
            exitOnlyLabel.appendChild(document.createTextNode("Exit Only"));
            radioGroup.appendChild(exitOnlyLabel);

            dividerContainer.appendChild(radioGroup);
          } else {
            // Checkbox for Exit Only (when no divider)
            const exitOnlyCheckLabel = document.createElement("label");
            exitOnlyCheckLabel.className = "aplDividerRadioLabel";
            exitOnlyCheckLabel.style.marginLeft = "8px";

            const exitOnlyCheckbox = document.createElement("input");
            exitOnlyCheckbox.type = "checkbox";
            exitOnlyCheckbox.checked = arrow.exitOnly === true;
            exitOnlyCheckbox.addEventListener("change", function (e) {
              e.stopPropagation();
              if (exposed && typeof exposed.setAPLExitOnly === "function") {
                exposed.setAPLExitOnly(i, this.checked);
              }
              if (exposed && typeof exposed.selectAPLArrow === "function") {
                exposed.selectAPLArrow(i);
              }
            });

            exitOnlyCheckLabel.appendChild(exitOnlyCheckbox);
            exitOnlyCheckLabel.appendChild(document.createTextNode("Exit Only"));
            dividerContainer.appendChild(exitOnlyCheckLabel);
          }

          arrowContainer.appendChild(dividerContainer);
        }

        aplArrowList.appendChild(arrowContainer);
      }

      // Update the type selector to match the selected arrow
      if (aplArrowTypeSelect && aplArrows.length > 0 && selectedAPLIndex < aplArrows.length) {
        aplArrowTypeSelect.value = aplArrows[selectedAPLIndex].type;
      }

      // Update the flip button state
      const aplArrowFlipButton = document.getElementById("aplArrowFlipButton");
      if (aplArrowFlipButton && aplArrows.length > 0 && selectedAPLIndex < aplArrows.length) {
        const isFlipped = aplArrows[selectedAPLIndex].flip === true;
        aplArrowFlipButton.classList.toggle("activated", isFlipped);
        aplArrowFlipButton.setAttribute("aria-pressed", isFlipped ? "true" : "false");
        aplArrowFlipButton.textContent = isFlipped ? "Unflip" : "Flip";
      }

      // Per-arrow settings controls
      const aplArrowSettingsContainer = document.getElementById("aplArrowSettings");
      if (aplArrowSettingsContainer) {
        lib.clearChildren(aplArrowSettingsContainer);

        if (aplArrows.length > 0 && selectedAPLIndex < aplArrows.length) {
          const arrow = aplArrows[selectedAPLIndex];
          const idx = selectedAPLIndex;

          // Arrow Margin Left
          const marginLeftLabel = document.createElement("label");
          marginLeftLabel.textContent = "Arrow Margin Left (rem):";
          marginLeftLabel.style.fontSize = "0.8rem";
          const marginLeftInput = document.createElement("input");
          marginLeftInput.type = "number";
          marginLeftInput.step = "0.1";
          marginLeftInput.min = "0";
          marginLeftInput.placeholder = "3.6";
          marginLeftInput.style.width = "5rem";
          if (arrow.arrowMarginLeft != null) {
            marginLeftInput.value = arrow.arrowMarginLeft;
          }
          marginLeftInput.addEventListener("change", function () {
            const val = this.value === "" ? null : parseFloat(this.value);
            if (exposed) exposed.setAPLArrowMarginLeft(idx, val);
          });
          aplArrowSettingsContainer.appendChild(marginLeftLabel);
          aplArrowSettingsContainer.appendChild(marginLeftInput);

          // Arrow Margin Right
          const marginRightLabel = document.createElement("label");
          marginRightLabel.textContent = "Arrow Margin Right (rem):";
          marginRightLabel.style.fontSize = "0.8rem";
          const marginRightInput = document.createElement("input");
          marginRightInput.type = "number";
          marginRightInput.step = "0.1";
          marginRightInput.min = "0";
          marginRightInput.placeholder = "3.6";
          marginRightInput.style.width = "5rem";
          if (arrow.arrowMarginRight != null) {
            marginRightInput.value = arrow.arrowMarginRight;
          }
          marginRightInput.addEventListener("change", function () {
            const val = this.value === "" ? null : parseFloat(this.value);
            if (exposed) exposed.setAPLArrowMarginRight(idx, val);
          });
          aplArrowSettingsContainer.appendChild(marginRightLabel);
          aplArrowSettingsContainer.appendChild(marginRightInput);

          // Exit Only settings (only when exitOnly is enabled)
          if (arrow.exitOnly) {
            const exitOnlyHeader = document.createElement("p");
            exitOnlyHeader.textContent = "Exit Only Settings";
            exitOnlyHeader.style.fontWeight = "bold";
            exitOnlyHeader.style.fontSize = "0.85rem";
            exitOnlyHeader.style.marginTop = "8px";
            exitOnlyHeader.style.marginBottom = "4px";
            aplArrowSettingsContainer.appendChild(exitOnlyHeader);

            // Background Color
            const bgLabel = document.createElement("label");
            bgLabel.textContent = "Background Color:";
            bgLabel.style.fontSize = "0.8rem";
            const bgSelect = document.createElement("select");
            bgSelect.style.width = "5rem";
            const yellowOpt = document.createElement("option");
            yellowOpt.value = "yellow";
            yellowOpt.textContent = "Yellow";
            const whiteOpt = document.createElement("option");
            whiteOpt.value = "white";
            whiteOpt.textContent = "White";
            bgSelect.appendChild(yellowOpt);
            bgSelect.appendChild(whiteOpt);
            bgSelect.value = arrow.exitOnlyBgColor || "yellow";
            bgSelect.addEventListener("change", function () {
              if (exposed) exposed.setAPLExitOnlyBgColor(idx, this.value);
            });
            aplArrowSettingsContainer.appendChild(bgLabel);
            aplArrowSettingsContainer.appendChild(bgSelect);

            // Horizontal Padding
            const padLabel = document.createElement("label");
            padLabel.textContent = "Horizontal Padding (rem):";
            padLabel.style.fontSize = "0.8rem";
            const padInput = document.createElement("input");
            padInput.type = "number";
            padInput.step = "0.1";
            padInput.min = "0";
            padInput.placeholder = "1";
            padInput.style.width = "5rem";
            if (arrow.exitOnlyPadding != null) {
              padInput.value = arrow.exitOnlyPadding;
            }
            padInput.addEventListener("change", function () {
              const val = this.value === "" ? null : parseFloat(this.value);
              if (exposed) exposed.setAPLExitOnlyPadding(idx, val);
            });
            aplArrowSettingsContainer.appendChild(padLabel);
            aplArrowSettingsContainer.appendChild(padInput);

            // Border Radius
            const radLabel = document.createElement("label");
            radLabel.textContent = "Border Radius (rem):";
            radLabel.style.fontSize = "0.8rem";
            const radInput = document.createElement("input");
            radInput.type = "number";
            radInput.step = "0.1";
            radInput.min = "0";
            radInput.placeholder = "0.1";
            radInput.style.width = "5rem";
            if (arrow.exitOnlyBorderRadius != null) {
              radInput.value = arrow.exitOnlyBorderRadius;
            }
            radInput.addEventListener("change", function () {
              const val = this.value === "" ? null : parseFloat(this.value);
              if (exposed) exposed.setAPLExitOnlyBorderRadius(idx, val);
            });
            aplArrowSettingsContainer.appendChild(radLabel);
            aplArrowSettingsContainer.appendChild(radInput);

            // Left Label Text + Hide
            const leftLabel = document.createElement("label");
            leftLabel.textContent = "Left Label Text:";
            leftLabel.style.fontSize = "0.8rem";
            const leftInput = document.createElement("input");
            leftInput.type = "text";
            leftInput.placeholder = "EXIT";
            leftInput.style.width = "5rem";
            leftInput.value = arrow.exitOnlyTextLeft != null ? arrow.exitOnlyTextLeft : "EXIT";
            leftInput.addEventListener("change", function () {
              if (exposed) exposed.setAPLExitOnlyTextLeft(idx, this.value);
            });
            const hideLeftLabel = document.createElement("label");
            hideLeftLabel.style.fontSize = "0.8rem";
            hideLeftLabel.style.display = "inline-flex";
            hideLeftLabel.style.alignItems = "center";
            hideLeftLabel.style.gap = "4px";
            const hideLeftCheck = document.createElement("input");
            hideLeftCheck.type = "checkbox";
            hideLeftCheck.checked = arrow.exitOnlyHideLeft === true;
            hideLeftCheck.addEventListener("change", function () {
              if (exposed) exposed.setAPLExitOnlyHideLeft(idx, this.checked);
            });
            hideLeftLabel.appendChild(hideLeftCheck);
            hideLeftLabel.appendChild(document.createTextNode("Hide"));
            aplArrowSettingsContainer.appendChild(leftLabel);
            aplArrowSettingsContainer.appendChild(leftInput);
            aplArrowSettingsContainer.appendChild(hideLeftLabel);

            // Right Label Text + Hide
            const rightLabel = document.createElement("label");
            rightLabel.textContent = "Right Label Text:";
            rightLabel.style.fontSize = "0.8rem";
            const rightInput = document.createElement("input");
            rightInput.type = "text";
            rightInput.placeholder = "ONLY";
            rightInput.style.width = "5rem";
            rightInput.value = arrow.exitOnlyTextRight != null ? arrow.exitOnlyTextRight : "ONLY";
            rightInput.addEventListener("change", function () {
              if (exposed) exposed.setAPLExitOnlyTextRight(idx, this.value);
            });
            const hideRightLabel = document.createElement("label");
            hideRightLabel.style.fontSize = "0.8rem";
            hideRightLabel.style.display = "inline-flex";
            hideRightLabel.style.alignItems = "center";
            hideRightLabel.style.gap = "4px";
            const hideRightCheck = document.createElement("input");
            hideRightCheck.type = "checkbox";
            hideRightCheck.checked = arrow.exitOnlyHideRight === true;
            hideRightCheck.addEventListener("change", function () {
              if (exposed) exposed.setAPLExitOnlyHideRight(idx, this.checked);
            });
            hideRightLabel.appendChild(hideRightCheck);
            hideRightLabel.appendChild(document.createTextNode("Hide"));
            aplArrowSettingsContainer.appendChild(rightLabel);
            aplArrowSettingsContainer.appendChild(rightInput);
            aplArrowSettingsContainer.appendChild(hideRightLabel);
          }
        }
      }
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

    const panelBorderRadiusElmt = document.getElementById("panelBorderRadius");
    if (panelBorderRadiusElmt) {
      const resolvedRadius =
        typeof panel.borderRadius === "number"
          ? panel.borderRadius
          : Panel.prototype.defaultBorderRadius;
      panelBorderRadiusElmt.value = resolvedRadius;
    }

    const signPadding =
      typeof panel.sign.padding === "string"
        ? panel.sign.padding
        : "0.3rem 0.75rem 0.3rem 0.75rem";
    const paddingParts = signPadding.split("rem");
    const paddingTopElmt = document.getElementById("paddingTop");
    const paddingRightElmt = document.getElementById("paddingRight");
    const paddingBottomElmt = document.getElementById("paddingBottom");
    const paddingLeftElmt = document.getElementById("paddingLeft");
    if (paddingTopElmt) paddingTopElmt.value = parseFloat(paddingParts[0]);
    if (paddingRightElmt) paddingRightElmt.value = parseFloat(paddingParts[1]);
    if (paddingBottomElmt) paddingBottomElmt.value = parseFloat(paddingParts[2]);
    if (paddingLeftElmt) paddingLeftElmt.value = parseFloat(paddingParts[3]);

    // Global Panel
    const outActionMessage = document.getElementById("outActionMessage");
    const outActionMessageLabel = document.getElementById(
      "outActionMessageLabel"
    );
    const globalPositioning = document.getElementById("globalPosition");
    const globalPositionLabel = document.getElementById("globalPositionLabel");
    const g_actionMessage = document.getElementById("g_actionMessage");

    g_actionMessage.className =
      exposed.vars.currentlySelectedSubPanelIndex != -1 ? "invisible" : "";
    outActionMessage.className =
      exposed.vars.currentlySelectedSubPanelIndex != -1 ? "invisible" : "";
    outActionMessageLabel.className =
      exposed.vars.currentlySelectedSubPanelIndex != -1 ? "invisible" : "";
    g_actionMessage.className =
      exposed.vars.currentlySelectedSubPanelIndex != -1 ? "invisible" : "";
    globalPositioning.className =
      exposed.vars.currentlySelectedSubPanelIndex != -1 ? "invisible" : "";
    globalPositionLabel.className =
      exposed.vars.currentlySelectedSubPanelIndex != -1 ? "invisible" : "";

    outActionMessage.checked = panel.sign.advisoryMessage;

    // Sub Panel
    const subPanelHeight = document.getElementById("subPanelHeight");
    const subPanelHeightLabel = document.getElementById("subPanelHeightLabel");
    const subPanelLength = document.getElementById("subPanelLength");
    const subPanelLengthLabel = document.getElementById("subPanelLengthLabel");

    subPanelHeight.style.display =
      exposed.vars.currentlySelectedSubPanelIndex > 0 ? "initial" : "none";
    subPanelHeightLabel.style.display =
      exposed.vars.currentlySelectedSubPanelIndex > 0 ? "inline-block" : "none";

    subPanelLength.style.display =
      exposed.vars.currentlySelectedSubPanelIndex != -1 &&
        panel.sign.subPanels.length > 1
        ? "initial"
        : "none";
    subPanelLengthLabel.style.display =
      exposed.vars.currentlySelectedSubPanelIndex != -1 &&
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
    if (exitTabVariantElmt) {
      for (const option of exitTabVariantElmt.options) {
        if (option.value == exitTab.variant) {
          option.selected = true;
          break;
        }
      }
      toggleExitTabVariantOptionsVisibility(exitTab.variant);
    }

    const tollLogoSizeInput = document.getElementById("exitTollLogoSize");
    const tollLogoSizeValueElmt = document.getElementById(
      "exitTollLogoSizeValue"
    );
    const resolvedTollLogoSize = (() => {
      const parsed = parseFloat(exitTab.tollLogoSize);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
      return typeof ExitTab.prototype.defaultTollLogoSize === "number"
        ? ExitTab.prototype.defaultTollLogoSize
        : 3;
    })();
    if (tollLogoSizeInput) {
      tollLogoSizeInput.value = resolvedTollLogoSize;
    }
    if (tollLogoSizeValueElmt) {
      tollLogoSizeValueElmt.textContent = resolvedTollLogoSize.toString();
    }

    const tollLogoSelect = document.getElementById("exitTollLogoSelect");
    if (tollLogoSelect && tollLogoSelect.options.length > 0) {
      const desiredLogo =
        exitTab.icon || TollLogoElement.prototype.defaultLogo || "";
      for (const option of tollLogoSelect.options) {
        if (option.value == desiredLogo) {
          option.selected = true;
          break;
        }
      }
    }

    const tollLogoOnly = document.getElementById("exitTollLogoOnly");
    if (tollLogoOnly) {
      tollLogoOnly.checked =
        exitTab.tollLogoOnly === undefined ? true : exitTab.tollLogoOnly;
    }

    const tollLogoSquare = document.getElementById("exitTollLogoSquare");
    if (tollLogoSquare) {
      tollLogoSquare.checked = !!exitTab.tollLogoSquare;
    }

    const iconSetting = document.getElementById("iconSelect");
    if (iconSetting) {
      iconSetting.value = exitTab.icon || "";

      for (const option of iconSetting.options) {
        if (option.value == exitTab.icon) {
          option.selected = true;
          break;
        }
      }
    }

    const exitFont = document.getElementById("exitFont");
    exitFont.checked = exitTab.FHWAFont;

    const showLeft = document.getElementById("showLeft");
    showLeft.checked = exitTab.showLeft;

    const fullBorder = document.getElementById("fullBorder");
    fullBorder.checked = exitTab.fullBorder;

    const squareCorners = document.getElementById("squareCorners");
    squareCorners.checked = exitTab.squareCorners;

    const topOffset = document.getElementById("topOffset");
    topOffset.checked = exitTab.topOffset;

    const verticalArrangement = document.getElementById("verticalArrangement");
    verticalArrangement.checked = exitTab.verticalArrangement;

    const caStyle = document.getElementById("caStyle");
    caStyle.checked = exitTab.caStyle;

    const borderThickness = document.getElementById("borderThickness");
    const resolvedBorderThickness = (() => {
      const parsedValue = parseFloat(exitTab.borderThickness);
      if (Number.isFinite(parsedValue) && parsedValue >= 0) {
        return parsedValue;
      }
      return ExitTab.prototype.defaultBorderThickness;
    })();
    exitTab.borderThickness = resolvedBorderThickness;
    borderThickness.value = resolvedBorderThickness;
    document.getElementById("borderValue").innerHTML =
      resolvedBorderThickness.toString();

    const minHeight = document.getElementById("minHeight");
    minHeight.value = exitTab.minHeight;
    document.getElementById("minValue").innerHTML = minHeight.value.toString();

    // Nested Tab Spacing (from parent exit tab)
    const nestedTabSpacingInput = document.getElementById("nestedTabSpacing");
    if (nestedTabSpacingInput) {
      const parentExitTab = panel.exitTabs[selectedExitTabIndex];
      const resolvedSpacing = parentExitTab?.nestedTabSpacing ?? 0;
      nestedTabSpacingInput.value = resolvedSpacing;
    }

    // Shields
    updateShieldSubform();

    // Control Text Revision
    const sMSPTextList = document.querySelector("#sMSPTextList");
    sMSPTextList.innerHTML = "";

    // START Add Header/Footer Buttons
    const addHeaderFooterContainer = document.createElement("div");
    addHeaderFooterContainer.style.width = "100%";
    addHeaderFooterContainer.style.display = "flex";
    addHeaderFooterContainer.style.justifyContent = "center";
    addHeaderFooterContainer.style.gap = "10px";
    addHeaderFooterContainer.style.paddingBottom = "10px";

    const createButton = (text, onClick) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.type = "button";
      btn.style.padding = "0.4rem 0.8rem";
      btn.onclick = onClick;
      return btn;
    };

    const addHeaderButton = createButton("Add Header", () => {
      const blockElems = sign.blockElements;

      // Add Header text at the top
      blockElems.addRow(0, "ControlTextElement");
      if (blockElems.rows[0] && blockElems.rows[0][0]) {
        blockElems.rows[0][0].textContent = "Header";
        // Set element background just in case, though row background is usually preferred for full strips
        blockElems.rows[0][0].backgroundColor = "Yellow";
      }
      if (blockElems.blockProperties[0]) {
        blockElems.blockProperties[0].bottomPadding = 0.2;
        blockElems.blockProperties[0].backgroundColor = "Yellow";
      }

      // Add Divider below the Header
      blockElems.addRow(1, "DividerElement");
      if (blockElems.rows[1] && blockElems.rows[1][0]) {
        blockElems.rows[1][0].dividerColor = "Black";
        blockElems.rows[1][0].fullBleed = true;
      }

      if (typeof updateForm === "function") updateForm();
      if (exposed && typeof exposed.redraw === "function") exposed.redraw();
    });

    const addFooterButton = createButton("Add Footer", () => {
      const blockElems = sign.blockElements;
      const lastIndex = blockElems.rows.length;

      // Add Divider at the bottom
      blockElems.addRow(lastIndex, "DividerElement");
      if (blockElems.rows[lastIndex] && blockElems.rows[lastIndex][0]) {
        blockElems.rows[lastIndex][0].dividerColor = "Black";
        blockElems.rows[lastIndex][0].fullBleed = true;
      }

      // Add Footer text below the divider
      blockElems.addRow(lastIndex + 1, "ControlTextElement");
      if (blockElems.rows[lastIndex + 1] && blockElems.rows[lastIndex + 1][0]) {
        blockElems.rows[lastIndex + 1][0].textContent = "Footer";
        blockElems.rows[lastIndex + 1][0].backgroundColor = "Yellow";
      }
      if (blockElems.blockProperties[lastIndex + 1]) {
        blockElems.blockProperties[lastIndex + 1].topPadding = 0.2;
        blockElems.blockProperties[lastIndex + 1].backgroundColor = "Yellow";
      }

      if (typeof updateForm === "function") updateForm();
      if (exposed && typeof exposed.redraw === "function") exposed.redraw();
    });

    addHeaderFooterContainer.appendChild(addHeaderButton);
    addHeaderFooterContainer.appendChild(addFooterButton);
    sMSPTextList.appendChild(addHeaderFooterContainer);
    // END Add Header/Footer Buttons
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
        textEditorBlock.draggable = true;
        textEditorBlock.textContent =
          Control.prototype.blockElements[blockElement.constructor.name];
        sMControlRow.appendChild(textEditorBlock);
        textEditorBlock.addEventListener("dragstart", handleBlockDragStart);
        textEditorBlock.addEventListener("dragend", handleBlockDragEnd);
        textEditorBlock.addEventListener(
          "click",
          (event) => {
            if (textEditorBlock.dataset.dragging === "true") {
              event.preventDefault();
              return;
            }
            exposed.setSelectedRow(row);
            exposed.setSelectedControlElem(item);
          },
          { once: true }
        );
      }

      sMSPTextList.appendChild(sMControlRow);
      sMControlRow.draggable = true;
      sMControlRow.style.position = "relative";
      sMControlRow.addEventListener("dragstart", handleRowDragStart);
      sMControlRow.addEventListener("dragend", handleRowDragEnd);
      sMControlRow.addEventListener("dragenter", handleRowDragEnter);
      sMControlRow.addEventListener("dragover", handleRowDragOver);
      sMControlRow.addEventListener("dragleave", handleRowDragLeave);
      sMControlRow.addEventListener("drop", handleRowDrop);
      sMControlRow.addEventListener(
        "click",
        () => {
          exposed.setSelectedRow(row);
        },
        { once: true }
      );
    }

    // Attach row list container drag events for row reordering
    sMSPTextList.addEventListener("dragover", handleRowListDragOver);
    sMSPTextList.addEventListener("drop", handleRowListDrop);
    sMSPTextList.addEventListener("dragleave", handleRowListDragLeave);

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

    if (blockElemType === "sdArrow") {
      const normalizePadding = (value, fallback = 0) => {
        const parsed = parseFloat(
          value !== null && value !== undefined ? value : fallback
        );
        return isNaN(parsed) ? fallback : parsed;
      };

      const fallbackPadding =
        currentBlockElem.padding !== undefined &&
          currentBlockElem.padding !== null
          ? currentBlockElem.padding
          : 0;

      currentBlockElem.paddingHorizontal = normalizePadding(
        currentBlockElem.paddingHorizontal,
        fallbackPadding
      );
      currentBlockElem.paddingVertical = normalizePadding(
        currentBlockElem.paddingVertical,
        fallbackPadding
      );

      delete currentBlockElem.padding;

      currentBlockElem.flip =
        currentBlockElem.flip === true ||
        currentBlockElem.flip === "true" ||
        currentBlockElem.flip === 1 ||
        currentBlockElem.flip === "1" ||
        currentBlockElem.flip === "on";
    }

    if (blockElemType === "sdShield") {
      const normalizeDisableSmallCapsValue = (value) =>
        value === true ||
        value === "true" ||
        value === 1 ||
        value === "1" ||
        value === "on";

      if (
        currentBlockElem.disableSmallCaps !== undefined &&
        currentBlockElem.smallCaps === undefined
      ) {
        currentBlockElem.smallCaps = !normalizeDisableSmallCapsValue(
          currentBlockElem.disableSmallCaps
        );
      }
      if (
        currentBlockElem.disableSmallCaps2 !== undefined &&
        currentBlockElem.smallCaps2 === undefined
      ) {
        currentBlockElem.smallCaps2 = !normalizeDisableSmallCapsValue(
          currentBlockElem.disableSmallCaps2
        );
      }

      currentBlockElem.bannerFontFamily =
        ShieldElement.prototype.normalizeBannerFontFamily(
          currentBlockElem.bannerFontFamily
        );
      currentBlockElem.scaleBannersWithShield =
        ShieldElement.prototype.normalizeScaleBannersWithShield(
          currentBlockElem.scaleBannersWithShield
        );
      if (currentBlockElem.indentFirstLetter === undefined) {
        currentBlockElem.indentFirstLetter = true;
      }
      if (currentBlockElem.indentFirstLetter2 === undefined) {
        currentBlockElem.indentFirstLetter2 =
          currentBlockElem.indentFirstLetter;
      }
      currentBlockElem.shieldSize =
        ShieldElement.prototype.normalizeShieldSize(
          currentBlockElem.shieldSize
        );
      if (currentBlockElem.smallCaps === undefined) {
        currentBlockElem.smallCaps = true;
      }
      if (currentBlockElem.smallCaps2 === undefined) {
        currentBlockElem.smallCaps2 = currentBlockElem.smallCaps;
      }
      delete currentBlockElem.disableSmallCaps;
      delete currentBlockElem.disableSmallCaps2;
    }

    if (blockElemType === "sdBlocker") {
      currentBlockElem.orientation =
        DividerElement.prototype.normalizeOrientation(
          currentBlockElem.orientation
        );
    }

    for (const propertyName in currentBlockElem) {
      const elementId = `${blockElemType}_${propertyName}`;
      const element = document.getElementById(elementId);
      const displayElement = document.getElementById(elementId + "Val");
      if (element) {
        const handleCustomBanner =
          blockElemType === "sdShield" &&
          (propertyName === "bannerType" || propertyName === "bannerType2");
        if (handleCustomBanner) {
          const customInputId =
            propertyName === "bannerType"
              ? "sdShield_bannerCustomText"
              : "sdShield_bannerCustomText2";
          const customInput = document.getElementById(customInputId);
          const bannerOptions = Shield.prototype.bannerTypes || [];
          const isPreset = bannerOptions.includes(currentBlockElem[propertyName]);
          if (element.tagName === "SELECT") {
            element.value = isPreset
              ? currentBlockElem[propertyName]
              : ShieldElement.prototype.defaultBannerType;
            element.addEventListener("change", readForm, { once: true });
          }
          if (customInput) {
            customInput.value = isPreset ? "" : currentBlockElem[propertyName];
            customInput.addEventListener("blur", readForm, { once: true });
          }
          if (displayElement) {
            displayElement.textContent = currentBlockElem[propertyName];
          }
          continue;
        }
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
          if (
            element.type === "range" &&
            displayElement &&
            !element.dataset.syncDisplay
          ) {
            element.addEventListener("input", () => {
              displayElement.value = element.value;
            });
            element.dataset.syncDisplay = "true";
          }
        }
      }

      if (displayElement) {
        // If the display element is an input (we replaced many spans with number inputs), set value.
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

    if (blockElemType === "sdShield") {
      const disableSmallCapsElmt = document.getElementById(
        "sdShield_disableSmallCaps"
      );
      const disableSmallCapsElmt2 = document.getElementById(
        "sdShield_disableSmallCaps2"
      );
      if (disableSmallCapsElmt) {
        disableSmallCapsElmt.checked = currentBlockElem.smallCaps === false;
        disableSmallCapsElmt.addEventListener("change", readForm, {
          once: true,
        });
      }
      if (disableSmallCapsElmt2) {
        disableSmallCapsElmt2.checked = currentBlockElem.smallCaps2 === false;
        disableSmallCapsElmt2.addEventListener("change", readForm, {
          once: true,
        });
      }
    }

    if (blockElemType === "sdArrow") {
      const arrowRotationButtons = document.querySelectorAll(
        ".sdArrow_rotationPreset"
      );
      const currentRotation = parseFloat(currentBlockElem.rotation) || 0;
      arrowRotationButtons.forEach((button) => {
        const degrees = parseFloat(button.dataset.degrees || "0") || 0;
        button.classList.toggle(
          "activated",
          Math.abs((((currentRotation % 360) + 360) % 360) - degrees) < 0.5
        );
      });

      const arrowFlipInput = document.getElementById("sdArrow_flip");
      const arrowFlipButton = document.getElementById("sdArrow_flipButton");
      if (arrowFlipInput && arrowFlipButton) {
        arrowFlipInput.value = currentBlockElem.flip ? "true" : "false";
        arrowFlipButton.classList.toggle("activated", currentBlockElem.flip);
        arrowFlipButton.setAttribute(
          "aria-pressed",
          currentBlockElem.flip ? "true" : "false"
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

    const topPadValEl = document.querySelector("#sdBlock_topPaddingVal");
    const bottomPadValEl = document.querySelector("#sdBlock_bottomPaddingVal");
    const topPadValue =
      sign.blockElements.blockProperties[exposed.vars.currentlySelectedRowIndex]
        .topPadding;
    const bottomPadValue =
      sign.blockElements.blockProperties[exposed.vars.currentlySelectedRowIndex]
        .bottomPadding;
    if (topPadValEl) {
      if (topPadValEl.tagName === "INPUT" && topPadValEl.type === "number") {
        topPadValEl.value = topPadValue;
      } else {
        topPadValEl.textContent = topPadValue;
      }
    }
    if (bottomPadValEl) {
      if (
        bottomPadValEl.tagName === "INPUT" &&
        bottomPadValEl.type === "number"
      ) {
        bottomPadValEl.value = bottomPadValue;
      } else {
        bottomPadValEl.textContent = bottomPadValue;
      }
    }

    document.querySelector("#sdBlock_backgroundColor").value =
      sign.blockElements.blockProperties[
        exposed.vars.currentlySelectedRowIndex
      ].backgroundColor;

    document
      .querySelector("#sdBlock_backgroundColor")
      .addEventListener("blur", readForm, { once: true });

    const blockBorderColorEl = document.querySelector("#sdBlock_borderColor");
    if (blockBorderColorEl) {
      const storedBorderColor =
        sign.blockElements.blockProperties[
          exposed.vars.currentlySelectedRowIndex
        ].borderColor;
      blockBorderColorEl.value =
        storedBorderColor || Block.defaultBorderColor || "Match BG";
      blockBorderColorEl.addEventListener("blur", readForm, { once: true });
    }

    const blockBackgroundFullWidthEl = document.querySelector(
      "#sdBlock_backgroundFullWidth"
    );
    blockBackgroundFullWidthEl.checked =
      !!sign.blockElements.blockProperties[
        exposed.vars.currentlySelectedRowIndex
      ].backgroundFullWidth;
    blockBackgroundFullWidthEl.addEventListener("change", readForm, {
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

    /*
    // Old Control Text
    const controlTextElmt = document.getElementById("controlText");
    controlTextElmt.value = sign.controlText;
 
    const actionMessageElmt = document.getElementById("actionMessage");
    actionMessageElmt.value = sign.actionMessage;
    */
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

    const useCanadianDownArrowsElmt = document.getElementById(
      "useCanadianDownArrows"
    );
    if (useCanadianDownArrowsElmt) {
      useCanadianDownArrowsElmt.checked = !!panel.sign.useCanadianDownArrows;
    }

    const exitOnlyDirectionLabel = document.getElementById(
      "exitOnlyDirectionLabel"
    );
    const showExitOnlyLabel = document.getElementById("showExitOnlyLabel");
    const hideExitArrowLabel = document.getElementById("hideExitArrowLabel");
    const exitOnlyDirection = document.getElementById("exitOnlyDirection");
    const showExitOnly = document.getElementById("showExitOnly");
    const hideExitArrow = document.getElementById("hideExitArrow");
    const exitOnlyBorderModeLabel = document.getElementById(
      "exitOnlyBorderModeLabel"
    );
    const exitOnlyBorderModeSelect = document.getElementById(
      "exitOnlyBorderMode"
    );
    const exitOnlyLeftTextLabel = document.getElementById(
      "exitOnlyLeftTextLabel"
    );
    const exitOnlyLeftTextInput = document.getElementById("exitOnlyLeftText");
    const exitOnlyRightTextLabel = document.getElementById(
      "exitOnlyRightTextLabel"
    );
    const exitOnlyRightTextInput = document.getElementById("exitOnlyRightText");
    const exitOnlyPadding = document.getElementById("exitOnlyPadding");
    const exitOnlyPaddingValue = document.getElementById("paddingValue");
    const exitOnlyPaddingLabel = document.getElementById(
      "exitOnlyPaddingLabel"
    );
    const halfExitGapElmt = document.getElementById("halfExitGap");
    const halfExitGapValueElmt = document.getElementById("halfExitGapValue");
    const halfExitGapLabelElmt = document.getElementById("halfExitGapLabel");

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
    if (hideExitArrowLabel) {
      hideExitArrowLabel.className = !panel.sign.guideArrow.includes("Exit Only")
        ? "invisible"
        : "";
    }
    exitOnlyDirection.className = !panel.sign.guideArrow.includes("Exit Only")
      ? "invisible"
      : "";
    exitOnlyPadding.className =
      !panel.sign.guideArrow.includes("Exit Only") ||
        panel.sign.guideArrow == "Split Exit Only"
        ? "invisible"
        : "";
    const isHalfExitOnly = panel.sign.guideArrow === "Half Exit Only";
    if (halfExitGapElmt) halfExitGapElmt.className = isHalfExitOnly ? "" : "invisible";
    if (halfExitGapValueElmt) halfExitGapValueElmt.className = isHalfExitOnly ? "" : "invisible";
    if (halfExitGapLabelElmt) halfExitGapLabelElmt.className = isHalfExitOnly ? "" : "invisible";
    showExitOnly.className = !panel.sign.guideArrow.includes("Exit Only")
      ? "invisible"
      : "";
    if (hideExitArrow) {
      hideExitArrow.className = !panel.sign.guideArrow.includes("Exit Only")
        ? "invisible"
        : "";
    }
    if (exitOnlyLeftTextLabel && exitOnlyLeftTextInput) {
      exitOnlyLeftTextLabel.className = !panel.sign.guideArrow.includes(
        "Exit Only"
      )
        ? "invisible"
        : "";
      exitOnlyLeftTextInput.className = !panel.sign.guideArrow.includes(
        "Exit Only"
      )
        ? "invisible"
        : "";
      exitOnlyLeftTextInput.value = panel.sign.exitOnlyLeftText || "";
    }
    if (exitOnlyRightTextLabel && exitOnlyRightTextInput) {
      exitOnlyRightTextLabel.className = !panel.sign.guideArrow.includes(
        "Exit Only"
      )
        ? "invisible"
        : "";
      exitOnlyRightTextInput.className = !panel.sign.guideArrow.includes(
        "Exit Only"
      )
        ? "invisible"
        : "";
      exitOnlyRightTextInput.value = panel.sign.exitOnlyRightText || "";
    }
    paddingValue.className =
      !panel.sign.guideArrow.includes("Exit Only") ||
        panel.sign.guideArrow == "Split Exit Only"
        ? "invisible"
        : "";
    if (exitOnlyBorderModeLabel && exitOnlyBorderModeSelect) {
      const shouldShowBorderMode =
        !post.secondExitOnly &&
        (panel.sign.guideArrow == "Half Exit Only" ||
          panel.sign.guideArrow == "Exit Only");
      exitOnlyBorderModeLabel.className = shouldShowBorderMode
        ? ""
        : "invisible";
      exitOnlyBorderModeSelect.className = shouldShowBorderMode
        ? ""
        : "invisible";
      const resolvedBorderMode = Sign.prototype.exitOnlyBorderModes.includes(
        panel.sign.exitOnlyBorderMode
      )
        ? panel.sign.exitOnlyBorderMode
        : Sign.prototype.exitOnlyBorderModes[0];
      exitOnlyBorderModeSelect.value = resolvedBorderMode;
    }
    showExitOnly.checked = !!panel.sign.showExitOnly;
    showExitOnly.value = panel.sign.showExitOnly;
    if (hideExitArrow) {
      hideExitArrow.checked = !!panel.sign.hideExitArrow;
      hideExitArrow.value = panel.sign.hideExitArrow;
    }
    exitOnlyPadding.value = panel.sign.exitOnlyPadding;
    exitOnlyPaddingValue.textContent = panel.sign.exitOnlyPadding;
    const resolvedGap = typeof panel.sign.halfExitGap === "number" ? panel.sign.halfExitGap : 5;
    if (halfExitGapElmt) halfExitGapElmt.value = resolvedGap;
    if (halfExitGapValueElmt) halfExitGapValueElmt.textContent = resolvedGap;

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
      indentElmt.checked =
        shields[shieldIndex].indentFirstLetter !== undefined
          ? shields[shieldIndex].indentFirstLetter
          : true;
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
      const indentElmt2 = document.createElement("input");
      indentElmt2.type = "checkbox";
      indentElmt2.id = `shield${shieldIndex}_indentFirstLetter2`;
      indentElmt2.checked =
        shields[shieldIndex].indentFirstLetter2 !== undefined
          ? shields[shieldIndex].indentFirstLetter2
          : shields[shieldIndex].indentFirstLetter;
      indentElmt2.onchange = readForm;
      rowContainerElmt.appendChild(indentElmt2);

      const indentLabelElmt2 = document.createElement("label");
      indentLabelElmt2.setAttribute(
        "for",
        `shield${shieldIndex}_indentFirstLetter2`
      );
      indentLabelElmt2.appendChild(
        document.createTextNode("Enlarge First Letter (2nd Banner)")
      );
      rowContainerElmt.appendChild(indentLabelElmt2);

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
      const bannerCustomInputElmt = document.createElement("input");
      bannerCustomInputElmt.type = "text";
      bannerCustomInputElmt.placeholder = "Custom text";
      bannerCustomInputElmt.id = `shield${shieldIndex}_bannerCustomText`;
      const isCustomBanner =
        !Shield.prototype.bannerTypes.includes(shields[shieldIndex].bannerType);
      bannerCustomInputElmt.value = isCustomBanner
        ? shields[shieldIndex].bannerType
        : "";
      bannerCustomInputElmt.addEventListener("blur", readForm);
      rowContainerElmt.appendChild(bannerCustomInputElmt);

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
      const bannerCustomInputElmt2 = document.createElement("input");
      bannerCustomInputElmt2.type = "text";
      bannerCustomInputElmt2.placeholder = "Custom text";
      bannerCustomInputElmt2.id = `shield${shieldIndex}_bannerCustomText2`;
      const isCustomBanner2 =
        !Shield.prototype.bannerTypes.includes(shields[shieldIndex].bannerType2);
      bannerCustomInputElmt2.value = isCustomBanner2
        ? shields[shieldIndex].bannerType2
        : "";
      bannerCustomInputElmt2.addEventListener("blur", readForm);
      rowContainerElmt.appendChild(bannerCustomInputElmt2);

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

  const updateShieldModalVisual = (selected, differentShield) => {
    const holder = document.querySelector(".shieldPreview");
    const img = holder.querySelector(".selectedShieldPreview");

    if (selected.shieldType === "custom" && selected.imageData) {
      img.src = selected.imageData;
    } else {
      img.src = Shield.prototype.getDirectoryFromShield(
        selected.shieldValue,
        selected.variant
      );
    }

    if (selected.shieldBacks) {
      img.style.setProperty(
        "--shieldBackColor",
        (
          lib.colors[selected.shieldBackColor] || selected.shieldBackColor
        ).toLowerCase()
      );
      img.style.setProperty(
        "--shieldBackRadius",
        selected.shieldBorderRadius + "px"
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
        selected.shieldValue
      ).variants) {
        lib.appendOption(
          document.querySelector("#selectedShieldVariant"),
          variant,
          { selected: selected.variant == variant }
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
        { once: true }
      );

      const setShield = (event) => {
        let isDifferent =
          selectedShield.shieldValue != event.currentTarget.dataset.name;
        selectedShield.shieldName =
          event.currentTarget.querySelector(".shieldItemName").textContent;
        selectedShield.shieldValue = event.currentTarget.dataset.name;
        searchFromDir(
          Shield.prototype.shieldDirectory,
          document.querySelector("#presetShieldList")
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
              '.shieldCategory[data-category="' + category + '"]'
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
              '.shieldCategoryType[data-name="' + category + '"]'
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
        true
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

      window.customShields.loadSavedShields((shield) => {
        selectedShield.shieldType = "custom";
        selectedShield.shieldName = shield.fileName;
        selectedShield.imageType = "data";
        selectedShield.imageData = shield.data;
        updateShieldModalVisual(selectedShield, true);
      });

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

  return {
    init: initialize,
    readForm,
    updateForm,
    updateShieldSubform,
  };
})();
