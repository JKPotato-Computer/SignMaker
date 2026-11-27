// Main.js
// AI Disclosure: probably like 2% lol im a terrible coder that i'd confuse ai instead

const App = (() => {
  let post = {};
  let currentlySelectedPanelIndex = -1;
  let currentlySelectedPanelGroupIndex = -1;
  let currentlySelectedSubPanelIndex = 0;

  let currentlySelectedExitTabRowIndex = -1;
  let currentlySelectedExitTabIndex = -1;

  let currentlySelectedRowIndex = 0,
    currentlySelectedBlockIndex = 0;
  let currentlySelectedGroupIndex = -1;

  let currentlySelectedShieldGroupId = -1;
  let currentlySelectedShieldIndex = -1;
  let currentlySelectedStandardArrow = -1;

  const borderThicknessToPx =
    0.2 * parseFloat(getComputedStyle(document.documentElement).fontSize);

  // Glboal Acessor Methods
  const getCurrentPanel = () => {
    return post.panels[currentlySelectedPanelGroupIndex][
      Math.max(currentlySelectedPanelIndex, 0)
    ];
  };

  const getCurrentSubPanel = () => {
    return getCurrentPanel().sign.subPanels[currentlySelectedSubPanelIndex];
  };

  const getCurrentBlockElements = () => {
    if (currentlySelectedGroupIndex >= 0) {
      return getSelectedBlockGroup().blockElements;
    }
    return getCurrentSubPanel().blockElements;
  };

  const getCurrentBlockRow = () => {
    return getCurrentBlockElements().rows[currentlySelectedRowIndex];
  };

  const getCurrentBlockElem = () => {
    return getCurrentBlockRow()[currentlySelectedBlockIndex];
  };

  const clamp = (number, min, max) => Math.max(min, Math.min(number, max));

  const init = async () => {
    document
      .querySelector("#undoButton")
      .addEventListener("click", HistoryManager.undo);
    document
      .querySelector("#redoButton")
      .addEventListener("click", HistoryManager.redo);
    HistoryManager.updateButtons();

    if (localStorage.getItem("autoSaveSignData")) {
      try {
        post =
          ImportExport.jsonToSign(SavesNTemplates.fetchAutoSave()) ||
          new Post(Post.polePositions[0]);
      } catch (e) {
        alert("Error loading autosave data. Starting a new sign.");
        post = new Post(Post.polePositions[0]);
        localStorage.setItem("autoSaveSignData", null);
      }
      if (post.panels.length > 0 && !Array.isArray(post.panels[0])) {
        post.panels = post.panels.map((panel) => [panel]);
      }
      currentlySelectedPanelGroupIndex = post.panels.length > 0 ? 0 : -1;
      currentlySelectedPanelIndex =
        currentlySelectedPanelGroupIndex == -1 ||
        post.panels[currentlySelectedPanelGroupIndex].length == 0
          ? -1
          : 0;
    } else {
      post = new Post(Post.polePositions[0]);
    }

    formHandler.init(App);
    DiagramDrawing.init(App);

    SavesNTemplates.init();

    window.customImages = CustomImages;

    window.customShields = CustomShields;
    await window.customShields.init();

    window.shieldLibrary = ShieldLibrary;
    await window.shieldLibrary.init();

    window.diagramLibrary = DiagrammicLibrary;
    await window.diagramLibrary.init();

    // Attach Drag Systems
    DragSystem.attachDrag(
      document.querySelector("#sMSPTextList"),
      ".sMControlRow",
      "vertical",
      (oldRowIndex, newRowIndex, oldBlockIndex, newBlockIndex) => {
        if (oldBlockIndex == null) {
          let currentBlockRows = getCurrentBlockElements().rows;
          currentBlockRows.splice(
            newRowIndex,
            0,
            currentBlockRows.splice(oldRowIndex, 1)[0],
          );

          currentlySelectedRowIndex = Math.max(newRowIndex, 0);
        } else {
          let currentBlockRows = getCurrentBlockElements().rows;
          let block = currentBlockRows[oldRowIndex].splice(oldBlockIndex, 1)[0];

          currentBlockRows[newRowIndex].splice(newBlockIndex, 0, block);
          currentlySelectedRowIndex = Math.max(newRowIndex, 0);
          currentlySelectedBlockIndex = clamp(
            newBlockIndex,
            0,
            currentBlockRows[newRowIndex].length - 1,
          );

          if (currentBlockRows[oldRowIndex].length == 0) {
            currentBlockRows.splice(oldRowIndex, 1);
            currentlySelectedRowIndex =
              oldRowIndex > newRowIndex ? newRowIndex : newRowIndex - 1;
            currentlySelectedBlockIndex = clamp(
              newBlockIndex,
              0,
              currentBlockRows[currentlySelectedRowIndex].length - 1,
            );
          }
        }

        formHandler.updateForm();
        redraw();
      },
      { innerElement: ".textEditorBlock", innerDirection: "horizontal" },
    );

    DragSystem.attachDrag(
      document.querySelector("#exitTabList"),
      ".exitTabGroup",
      "horizontal",
      (oldGroupIndex, newGroupIndex, oldTabIndex, newTabIndex) => {
        let currentExitTabs = getCurrentPanel().exitTabs;
        if (oldTabIndex != null) {
          let tab = currentExitTabs[oldGroupIndex].exitTabs.splice(
            oldTabIndex,
            1,
          )[0];
          currentExitTabs[newGroupIndex].exitTabs.splice(newTabIndex, 0, tab);
          if (oldGroupIndex != newGroupIndex) {
            changeEditingExitTabRow(newGroupIndex);
          }
          changeEditingExitTab(newTabIndex);
        } else {
          currentExitTabs.splice(
            newGroupIndex,
            0,
            currentExitTabs.splice(oldGroupIndex, 1)[0],
          );

          changeEditingExitTabRow(newGroupIndex);
        }
        redraw();
      },
      {
        attachElement: ".exitTabButton",
        innerElement: ".exitTabNestedButton",
        innerDirection: "horizontal",
      },
    );

    DragSystem.attachDrag(
      document.querySelector("#subPanelList"),
      ".smSubPanelBtn",
      "horizontal",
      (oldPanelIndex, newPanelIndex) => {
        let currentSubPanels = getCurrentPanel().sign.subPanels;
        currentSubPanels.splice(
          newPanelIndex,
          0,
          currentSubPanels.splice(oldPanelIndex, 1)[0],
        );
        changeEditingSubPanel(newPanelIndex);
        redraw();
      },
    );

    DragSystem.attachDrag(
      document.querySelector("#panelList"),
      ".panelGroup",
      "vertical",
      (
        oldPanelGroupIndex,
        newPanelGroupIndex,
        oldPanelIndex,
        newPanelIndex,
      ) => {
        if (oldPanelIndex != null) {
          const panel = post.panels[oldPanelGroupIndex].splice(
            oldPanelIndex,
            1,
          )[0];
          post.panels[newPanelGroupIndex].splice(newPanelIndex, 0, panel);
          currentlySelectedPanelGroupIndex = newPanelGroupIndex;
          currentlySelectedPanelIndex = newPanelIndex;
        } else {
          post.panels.splice(
            newPanelGroupIndex,
            0,
            post.panels.splice(oldPanelGroupIndex, 1)[0],
          );
          currentlySelectedPanelGroupIndex = newPanelGroupIndex;
          currentlySelectedPanelIndex = 0;
        }

        ccurrentlySelectedSubPanelIndex = 0;
        currentlySelectedRowIndex = 0;
        currentlySelectedBlockIndex = 0;
        currentlySelectedGroupIndex = -1;
        currentlySelectedExitTabIndex = -1;
        currentlySelectedExitTabRowIndex = -1;

        formHandler.updateForm();
        redraw();
      },
      {
        attachElement: ".panelGroupButton",
        innerElement: ".panelListButton",
        innerDirection: "vertical",
      },
    );

    DragSystem.attachDrag(
      document.querySelector("#sMAPL_APLCat"),
      ".smAPLCat_container",
      "vertical",
      (oldPanelIndex, newPanelIndex, oldAPLIndex, newAPLIndex) => {
        if (oldAPLIndex == null) {
          return;
        }

        let apl = getCurrentPanel().sign.arrows.apl;
        oldPanelIndex /= 2;
        newPanelIndex /= 2;

        let arrow = apl.subpanels[oldPanelIndex].splice(oldAPLIndex, 1)[0];

        if (!apl.subpanels[newPanelIndex]) {
          apl.subpanels[newPanelIndex] = [];
        }

        apl.subpanels[newPanelIndex].splice(newAPLIndex, 0, arrow);

        formHandler.updateForm();
        redraw();
      },
      {
        attachElement: ".smAPLCat_aplDragger",
        innerElement: ".smAPLCat_apl",
        innerDirection: "vertical",
        useAttachForInner: true,
        ignoreOuterDragging: true,
        innerTargetContainer: ".smAPLCat_aplList",
      },
    );

    DragSystem.attachDrag(
      document.querySelector("#smSPShieldList"),
      ".smSPShieldRow,:scope > .smSPShieldGroup",
      "vertical",
      (oldShieldIndex, newShieldIndex, callbackResults) => {
        let currentShields = getCurrentBlockElem().shields;

        let oldAdjustedShieldIndex = 0;
        let lastShield = -1;
        let isDragItemShieldGroup =
          callbackResults.dragElement.classList.contains("smSPShieldGroup");
        let isPreviousMove = newShieldIndex < oldShieldIndex;

        for (let i = 0; i < currentShields.length; i++) {
          const shield = currentShields[i];

          if (
            oldAdjustedShieldIndex == oldShieldIndex &&
            (isDragItemShieldGroup || shield.group == 0)
          ) {
            oldShieldIndex = i;
            break;
          }

          if (shield.group == 0) {
            oldAdjustedShieldIndex += 1;
            lastShield = -1;
          } else if (shield.group != 0 && lastShield != shield.group) {
            lastShield = shield.group;
            oldAdjustedShieldIndex++;
          }
        }

        let targetIndices = [0];
        lastShield = -1;

        for (let i = 0; i < currentShields.length; i++) {
          const shield = currentShields[i];
          const nextShield = currentShields[i + 1];

          if (
            !nextShield ||
            shield.group == 0 ||
            nextShield.group !== shield.group
          ) {
            targetIndices.push(i);
          }
        }

        if (newShieldIndex == 0) {
          newShieldIndex = targetIndices[0];
        } else if (newShieldIndex < targetIndices.length) {
          newShieldIndex =
            targetIndices[
              isPreviousMove ? newShieldIndex - 1 : newShieldIndex + 1
            ];
        } else {
          newShieldIndex = currentShields.length;
        }

        let shield = currentShields[oldShieldIndex];
        let shieldsToMove = [];
        if (shield.group != 0) {
          for (let i = oldShieldIndex; i < currentShields.length; i++) {
            if (currentShields[i].group == shield.group) {
              shieldsToMove.push(currentShields[i]);
            } else {
              break;
            }
          }
          currentShields.splice(oldShieldIndex, shieldsToMove.length);
        } else {
          shieldsToMove.push(shield);
          currentShields.splice(oldShieldIndex, 1);
        }

        currentShields.splice(newShieldIndex, 0, ...shieldsToMove);

        formHandler.updateShieldSubform();
        redraw();
      },
      {
        attachElement: ".dragIndicator",
        callbackElements: (dragElement) => {
          return { dragElement: dragElement };
        },
      },
    );

    DragSystem.attachDrag(
      document.querySelector("#standardArrowList"),
      ".standardArrowListItem",
      "vertical",
      (oldIndex, newIndex) => {
        moveStandardArrow(oldIndex, newIndex);
      },
      { attachElement: ".dragIndicator" },
    );

    if (
      localStorage.getItem("autoSaveSignData") &&
      localStorage.getItem("autoSaveSignData") != "null"
    ) {
      formHandler.updateForm();
      redraw();
    } else {
      newPanel();
    }

    SavesNTemplates.updateAutoSave(post);
  };

  // Panels
  const newPanel = () => {
    if (post.panels.length > 0) {
      HistoryManager.addToUndoStack(post);
    }
    if (currentlySelectedPanelGroupIndex == -1) {
      post.panels.push([]);
      currentlySelectedPanelGroupIndex = post.panels.length - 1;
    }
    post.newPanel(currentlySelectedPanelGroupIndex);
    currentlySelectedPanelIndex =
      post.panels[currentlySelectedPanelGroupIndex].length - 1;
    currentlySelectedSubPanelIndex = 0;
    currentlySelectedExitTabIndex = -1;
    currentlySelectedExitTabRowIndex = -1;
    currentlySelectedBlockIndex = 0;
    currentlySelectedRowIndex = 0;

    formHandler.updateForm();
    redraw();
  };

  const newPanelGroup = () => {
    HistoryManager.addToUndoStack(post);
    post.panels.push([]);
    currentlySelectedPanelGroupIndex = post.panels.length - 1;
    post.newPanel(currentlySelectedPanelGroupIndex);
    currentlySelectedPanelIndex = 0;
    currentlySelectedSubPanelIndex = 0;
    currentlySelectedExitTabIndex = -1;
    currentlySelectedExitTabRowIndex = -1;
    currentlySelectedBlockIndex = 0;
    currentlySelectedRowIndex = 0;

    formHandler.updateForm();
    redraw();
  };

  const duplicatePanel = () => {
    const panelGroup = post.panels[currentlySelectedPanelGroupIndex];
    if (!panelGroup || !panelGroup[currentlySelectedPanelIndex]) {
      return;
    }

    HistoryManager.addToUndoStack(post);
    post.duplicatePanel([
      currentlySelectedPanelGroupIndex,
      currentlySelectedPanelIndex,
    ]);
    currentlySelectedPanelIndex++;
    currentlySelectedSubPanelIndex = 0;
    currentlySelectedExitTabIndex = -1;
    currentlySelectedExitTabRowIndex = -1;
    currentlySelectedBlockIndex = 0;
    currentlySelectedRowIndex = 0;

    formHandler.updateForm();
    redraw();
  };

  const deletePanel = () => {
    HistoryManager.addToUndoStack(post);
    post.deletePanel([
      currentlySelectedPanelGroupIndex,
      currentlySelectedPanelIndex,
    ]);
    if (currentlySelectedPanelIndex > 0) {
      currentlySelectedPanelIndex--;
    }
    if (post.panels[currentlySelectedPanelGroupIndex].length == 0) {
      post.panels.splice(currentlySelectedPanelGroupIndex, 1);
      currentlySelectedPanelGroupIndex = Math.max(
        0,
        currentlySelectedPanelGroupIndex - 1,
      );
      currentlySelectedPanelIndex = 0;
    }

    currentlySelectedSubPanelIndex = 0;
    currentlySelectedExitTabIndex = -1;
    currentlySelectedExitTabRowIndex = -1;
    currentlySelectedBlockIndex = 0;
    currentlySelectedRowIndex = 0;

    if (post.panels.length == 0) {
      newPanel();
    } else {
      formHandler.updateForm();
      redraw();
    }
  };

  const changeEditingPanel = (panelNumber) => {
    currentlySelectedPanelIndex = clamp(
      panelNumber,
      0,
      post.panels[currentlySelectedPanelGroupIndex].length - 1,
    );
    currentlySelectedSubPanelIndex = 0;
    currentlySelectedRowIndex = 0;
    currentlySelectedBlockIndex = 0;
    currentlySelectedGroupIndex = -1;
    currentlySelectedExitTabIndex = -1;
    currentlySelectedExitTabRowIndex = -1;

    formHandler.updateForm();
  };

  const deletePanelGroup = () => {
    HistoryManager.addToUndoStack(post);
    post.panels.splice(currentlySelectedPanelGroupIndex, 1);
    currentlySelectedPanelGroupIndex = Math.max(
      -1,
      currentlySelectedPanelGroupIndex - 1,
    );
    currentlySelectedSubPanelIndex = 0;
    currentlySelectedRowIndex = 0;
    currentlySelectedBlockIndex = 0;
    currentlySelectedGroupIndex = -1;
    currentlySelectedExitTabIndex = -1;
    currentlySelectedExitTabRowIndex = -1;

    if (post.panels.length == 0) {
      newPanel();
    } else {
      formHandler.updateForm();
      redraw();
    }
  };

  const changeEditingPanelGroup = (index) => {
    currentlySelectedPanelGroupIndex = clamp(index, 0, post.panels.length - 1);
    currentlySelectedPanelIndex = -1;
    currentlySelectedSubPanelIndex = 0;
    currentlySelectedRowIndex = 0;
    currentlySelectedBlockIndex = 0;
    currentlySelectedGroupIndex = -1;

    currentlySelectedExitTabIndex = -1;
    currentlySelectedExitTabRowIndex = -1;

    formHandler.updateForm();
  };

  const deletePanelHelper = () => {
    if (currentlySelectedPanelIndex == -1) {
      deletePanelGroup();
    } else {
      deletePanel();
    }
  };

  const addSubPanel = () => {
    HistoryManager.addToUndoStack(post);
    const sign = getCurrentPanel().sign;
    sign.newSubPanel();
    currentlySelectedSubPanelIndex++;
    currentlySelectedGroupIndex = -1;

    currentlySelectedRowIndex = clamp(
      currentlySelectedRowIndex,
      0,
      getCurrentSubPanel().blockElements.rows.length - 1,
    );
    currentlySelectedBlockIndex = clamp(
      currentlySelectedBlockIndex,
      0,
      getCurrentBlockRow().length - 1,
    );
    currentlySelectedShieldIndex = -1;
    currentlySelectedShieldGroupId = -1;

    formHandler.updateForm();
    redraw();
  };

  const removeSubPanel = () => {
    const sign = getCurrentPanel().sign;
    if (sign.subPanels.length > 1) {
      HistoryManager.addToUndoStack(post);
      sign.deleteSubPanel(sign.subPanels.length - 1);
      currentlySelectedSubPanelIndex = Math.max(
        0,
        currentlySelectedSubPanelIndex - 1,
      );

      currentlySelectedRowIndex = clamp(
        currentlySelectedRowIndex,
        0,
        getCurrentSubPanel().blockElements.rows.length - 1,
      );
      currentlySelectedBlockIndex = clamp(
        currentlySelectedBlockIndex,
        0,
        getCurrentBlockRow().length - 1,
      );
      currentlySelectedShieldIndex = -1;
      currentlySelectedShieldGroupId = -1;
      currentlySelectedGroupIndex = -1;

      formHandler.updateForm();
      redraw();
    }
  };

  const duplicateSubPanel = () => {
    const sign = getCurrentPanel().sign;
    if (!sign.subPanels[currentlySelectedSubPanelIndex]) {
      return;
    }

    HistoryManager.addToUndoStack(post);
    sign.duplicateSubPanel(currentlySelectedSubPanelIndex);
    currentlySelectedSubPanelIndex++;

    currentlySelectedRowIndex = clamp(
      currentlySelectedRowIndex,
      0,
      getCurrentSubPanel().blockElements.rows.length - 1,
    );
    currentlySelectedBlockIndex = clamp(
      currentlySelectedBlockIndex,
      0,
      getCurrentBlockRow().length - 1,
    );
    currentlySelectedShieldIndex = -1;
    currentlySelectedShieldGroupId = -1;
    currentlySelectedGroupIndex = -1;

    formHandler.updateForm();
    redraw();
  };

  const changeEditingSubPanel = (subPanelNumber) => {
    currentlySelectedSubPanelIndex = clamp(
      subPanelNumber,
      0,
      getCurrentPanel().sign.subPanels.length - 1,
    );
    currentlySelectedRowIndex = clamp(
      currentlySelectedRowIndex,
      0,
      getCurrentSubPanel().blockElements.rows.length - 1,
    );
    currentlySelectedBlockIndex = clamp(
      currentlySelectedBlockIndex,
      0,
      getCurrentBlockRow().length - 1,
    );
    currentlySelectedShieldIndex = -1;
    currentlySelectedShieldGroupId = -1;
    currentlySelectedGroupIndex = -1;

    formHandler.updateForm();
  };

  // Exit Tabs
  const newExitTabRow = () => {
    HistoryManager.addToUndoStack(post);
    const panel = getCurrentPanel();
    panel.newExitTabRow();

    currentlySelectedExitTabRowIndex = panel.exitTabs.length - 1;
    currentlySelectedExitTabIndex = -1;

    formHandler.updateForm();
    redraw();
  };

  const duplicateExitTabRow = () => {
    const panel = getCurrentPanel();
    if (!panel.exitTabs[currentlySelectedExitTabRowIndex]) {
      return;
    }

    HistoryManager.addToUndoStack(post);
    panel.duplicateExitTabRow(currentlySelectedExitTabRowIndex);
    currentlySelectedExitTabRowIndex++;

    formHandler.updateForm();
    redraw();
  };

  const removeExitTabRow = () => {
    HistoryManager.addToUndoStack(post);
    const panel = getCurrentPanel();
    panel.deleteExitTabRow(currentlySelectedExitTabRowIndex);
    currentlySelectedExitTabRowIndex = Math.max(
      -1,
      currentlySelectedExitTabRowIndex - 1,
    );

    formHandler.updateForm();
    redraw();
  };

  const changeEditingExitTabRow = (index) => {
    currentlySelectedExitTabRowIndex = clamp(
      index,
      0,
      getCurrentPanel().exitTabs.length - 1,
    );
    currentlySelectedExitTabIndex = -1;

    formHandler.updateForm();
  };

  const newExitTab = () => {
    HistoryManager.addToUndoStack(post);
    const panel = getCurrentPanel();
    const exitTabRow = panel.exitTabs[currentlySelectedExitTabRowIndex];
    exitTabRow.newExitTab("right");

    currentlySelectedExitTabIndex = exitTabRow.exitTabs.length - 1;
    formHandler.updateForm();
    redraw();
  };

  const deleteExitTab = () => {
    HistoryManager.addToUndoStack(post);
    const panel = getCurrentPanel();
    const exitTabRow = panel.exitTabs[currentlySelectedExitTabRowIndex];
    exitTabRow.deleteExitTab(currentlySelectedExitTabIndex);

    currentlySelectedExitTabIndex = Math.max(
      -1,
      currentlySelectedExitTabIndex - 1,
    );

    formHandler.updateForm();
    redraw();
  };

  const duplicateExitTab = () => {
    const panel = getCurrentPanel();
    const exitTabRow = panel.exitTabs[currentlySelectedExitTabRowIndex];
    if (!exitTabRow || !exitTabRow.exitTabs[currentlySelectedExitTabIndex]) {
      return;
    }

    HistoryManager.addToUndoStack(post);
    exitTabRow.duplicateExitTab(currentlySelectedExitTabIndex);

    currentlySelectedExitTabIndex++;

    formHandler.updateForm();
    redraw();
  };

  const changeEditingExitTab = (index) => {
    currentlySelectedExitTabIndex = clamp(
      index,
      0,
      getCurrentPanel().exitTabs[currentlySelectedExitTabRowIndex].exitTabs
        .length,
    );

    formHandler.updateForm();
  };

  // Rows
  const newRow = (selectedBlock) => {
    HistoryManager.addToUndoStack(post);
    let blockElems = getCurrentBlockElements();

    currentlySelectedBlockIndex = 0;
    blockElems.addRow(++currentlySelectedRowIndex, selectedBlock);

    formHandler.updateForm();
    redraw();
  };

  const dupRow = () => {
    let blockElems = getCurrentBlockElements();
    if (!blockElems.rows[currentlySelectedRowIndex]) {
      return;
    }

    HistoryManager.addToUndoStack(post);
    blockElems.duplicateRow(currentlySelectedRowIndex++);

    formHandler.updateForm();
    redraw();
  };

  const delRow = () => {
    let blockElems = getCurrentBlockElements();

    if (blockElems.rows.length == 1) {
      return;
    }

    HistoryManager.addToUndoStack(post);
    blockElems.deleteRow(currentlySelectedRowIndex);
    currentlySelectedRowIndex = Math.max(currentlySelectedRowIndex - 1, 0);

    formHandler.updateForm();
    redraw();
  };

  const setSelectedRow = (row) => {
    currentlySelectedRowIndex = clamp(
      row,
      0,
      getCurrentBlockElements().rows.length - 1,
    );
    currentlySelectedBlockIndex = clamp(
      currentlySelectedBlockIndex,
      0,
      getCurrentBlockRow().length - 1,
    );

    formHandler.updateForm();
  };

  const newControlElem = (selectedElem) => {
    HistoryManager.addToUndoStack(post);
    const blockElems = getCurrentBlockElements();
    blockElems.addElement(
      Control.prototype.blockToClassElems[selectedElem],
      {},
      currentlySelectedRowIndex,
      ++currentlySelectedBlockIndex,
    );

    formHandler.updateForm();
    redraw();
  };

  const replaceControlElem = (selectedElem) => {
    const blockElems = getCurrentBlockElements();
    blockElems.replaceElement(
      Control.prototype.blockToClassElems[selectedElem],
      currentlySelectedRowIndex,
      currentlySelectedBlockIndex,
    );

    formHandler.updateForm();
    redraw();
  };

  const delControlElem = () => {
    HistoryManager.addToUndoStack(post);
    const blockElems = getCurrentBlockElements();
    if (
      blockElems.removeElement(
        currentlySelectedRowIndex,
        currentlySelectedBlockIndex,
      )
    ) {
      currentlySelectedRowIndex = Math.max(0, currentlySelectedRowIndex - 1);
      currentlySelectedBlockIndex = Math.max(
        0,
        getCurrentBlockRow().length - 1,
      );
    } else {
      currentlySelectedBlockIndex = Math.max(
        0,
        currentlySelectedBlockIndex - 1,
      );
    }

    formHandler.updateForm();
    redraw();
  };

  const duplicateControlElem = () => {
    const blockRow = getCurrentBlockRow();
    const blockElem = blockRow[currentlySelectedBlockIndex];
    if (!blockElem) {
      return;
    }

    HistoryManager.addToUndoStack(post);
    blockRow.splice(currentlySelectedBlockIndex + 1, 0, lib.clone(blockElem));
    currentlySelectedBlockIndex++;

    formHandler.updateForm();
    redraw();
  };

  const setSelectedControlElem = (block) => {
    currentlySelectedBlockIndex = clamp(
      block,
      0,
      getCurrentBlockRow().length - 1,
    );

    formHandler.updateForm();
  };

  const getSelectedBlockGroup = () => {
    let groupIndex = -1;
    const rec = (blockElements) => {
      for (let pRowInd = 0; pRowInd < blockElements.rows.length; pRowInd++) {
        const row = blockElements.rows[pRowInd];
        for (let pBlockInd = 0; pBlockInd < row.length; pBlockInd++) {
          const block = row[pBlockInd];
          if (block.constructor.name === "GroupElement") {
            if (groupIndex + 1 === currentlySelectedGroupIndex) {
              return block;
            } else {
              groupIndex++;
              let hasReturnValue = rec(block.blockElements);

              if (hasReturnValue) {
                return hasReturnValue;
              }
            }
          }
        }
      }
      return null;
    };

    let retVal =
      rec(getCurrentSubPanel().blockElements) || getCurrentSubPanel();
    return retVal;
  };

  const getParentOfSelectedBlockGroup = () => {
    let groupIndex = -1;
    const rec = (blockElements, parent = null) => {
      for (let pRowInd = 0; pRowInd < blockElements.rows.length; pRowInd++) {
        const row = blockElements.rows[pRowInd];
        for (let pBlockInd = 0; pBlockInd < row.length; pBlockInd++) {
          const block = row[pBlockInd];
          if (block.constructor.name === "GroupElement") {
            if (groupIndex + 1 === currentlySelectedGroupIndex) {
              return parent;
            } else {
              groupIndex++;
              let hasReturnValue = rec(block.blockElements, block);
              if (hasReturnValue) {
                return hasReturnValue;
              }
            }
          }
        }
      }
      return null;
    };

    return rec(getCurrentSubPanel().blockElements, null);
  };

  const setSelectedBlockGroup = (group) => {
    currentlySelectedGroupIndex = Math.max(group, -1);
    currentlySelectedRowIndex = 0;
    currentlySelectedBlockIndex = 0;

    formHandler.updateForm();
  };

  const getGroupNumFromElem = (element) => {
    let groupIndex = -1;
    const rec = (blockElements) => {
      for (let pRowInd = 0; pRowInd < blockElements.rows.length; pRowInd++) {
        const rowElems = blockElements.rows[pRowInd];
        for (let pBlockInd = 0; pBlockInd < rowElems.length; pBlockInd++) {
          const block = rowElems[pBlockInd];
          if (block.constructor.name === "GroupElement") {
            if (block === element) {
              return groupIndex + 1;
            } else {
              groupIndex++;
              const nestedResult = rec(block.blockElements);
              if (nestedResult !== null) {
                return nestedResult;
              }
            }
          }
        }
      }
      return null;
    };

    return rec(getCurrentSubPanel().blockElements);
  };

  // Shield Groups
  const newShieldGroup = () => {
    HistoryManager.addToUndoStack(post);
    const firstRow = getCurrentBlockElements().rows[0];
    const hasOnlyShieldGroups =
      firstRow &&
      firstRow.every(
        (block) => block.constructor.name === "ShieldGroupElement",
      );

    if (!firstRow || !hasOnlyShieldGroups) {
      const blockElems = getCurrentBlockElements();
      currentlySelectedBlockIndex = 0;
      currentlySelectedRowIndex = 0;
      blockElems.addRow(0, "ShieldGroupElement");
    } else if (firstRow && hasOnlyShieldGroups) {
      getCurrentBlockElements().addElement(
        Control.prototype.blockToClassElems["ShieldGroupElement"],
        {},
        0,
        firstRow.length + 1,
      );
      currentlySelectedBlockIndex = firstRow.length - 1;
      currentlySelectedRowIndex = 0;
    }

    formHandler.updateForm();
    redraw();
  };

  const setSelectedShieldId = (shieldIndex) => {
    const currentlySelectedElement = getCurrentBlockElem();
    if (currentlySelectedElement.constructor.name !== "ShieldGroupElement") {
      return;
    }

    currentlySelectedShieldIndex = clamp(
      shieldIndex,
      -1,
      currentlySelectedElement.shields.length,
    );

    formHandler.updateForm();
  };

  const changeCurrentlyEditingShieldGroup = (newId) => {
    currentlySelectedShieldGroupId = newId;
    currentlySelectedShieldIndex = -1;

    let id = 0;
    const blockElems = getCurrentBlockElements();
    for (let i = 0; i < blockElems.rows.length; i++) {
      for (let j = 0; j < blockElems.rows[i].length; j++) {
        const block = blockElems.rows[i][j];
        if (block.constructor.name === "ShieldGroupElement" && id == newId) {
          currentlySelectedRowIndex = i;
          currentlySelectedBlockIndex = j;
          break;
        } else if (block.constructor.name === "ShieldGroupElement") {
          id++;
        }
      }
    }

    formHandler.updateForm();
  };

  const newShield = () => {
    const selectedShieldGroup = getCurrentBlockElem();
    if (
      selectedShieldGroup &&
      selectedShieldGroup.constructor?.name === "ShieldGroupElement"
    ) {
      HistoryManager.addToUndoStack(post);
      selectedShieldGroup.newShield();
      currentlySelectedShieldIndex = selectedShieldGroup.shields.length - 1;

      formHandler.updateShieldSubform();
      redraw();
    }
  };

  const deleteShield = (shieldIndex) => {
    const selectedShieldGroup = getCurrentBlockElem();
    if (
      selectedShieldGroup &&
      selectedShieldGroup.constructor?.name === "ShieldGroupElement" &&
      shieldIndex >= 0
    ) {
      HistoryManager.addToUndoStack(post);
      selectedShieldGroup.deleteShield(shieldIndex);
      currentlySelectedShieldIndex = Math.max(0, shieldIndex - 1);
      formHandler.updateShieldSubform();

      let lastShieldNum = -1;
      let shieldlist = [];
      for (const s of selectedShieldGroup.shields) {
        if (s.group != 0) {
          if (s.group != lastShieldNum) {
            shieldlist.push(s);
            lastShieldNum = s.group;
          } else {
            shieldlist.push(s);
          }
        } else {
          if (shieldlist.length == 1) {
            shieldlist[0].group = 0;
            shiedlist = [];
          }
        }
      }

      if (shieldlist.length == 1) {
        shieldlist[0].group = 0;
        shiedlist = [];
      }

      redraw();
    }
  };

  const duplicateShield = (shieldIndex) => {
    const selectedShieldGroup = getCurrentBlockElem();
    if (
      selectedShieldGroup &&
      selectedShieldGroup.constructor?.name === "ShieldGroupElement" &&
      shieldIndex >= 0 &&
      shieldIndex < selectedShieldGroup.shields.length
    ) {
      HistoryManager.addToUndoStack(post);
      selectedShieldGroup.duplicateShield(shieldIndex);
      currentlySelectedShieldIndex = shieldIndex + 1;
      formHandler.updateShieldSubform();
      redraw();
    }
  };

  const groupShields = (shieldIndex, nextShieldIndex) => {
    const selectedShieldGroup = getCurrentBlockElem();
    if (
      selectedShieldGroup &&
      selectedShieldGroup.constructor?.name === "ShieldGroupElement" &&
      shieldIndex >= 0 &&
      shieldIndex < selectedShieldGroup.shields.length &&
      nextShieldIndex >= 0 &&
      nextShieldIndex < selectedShieldGroup.shields.length
    ) {
      HistoryManager.addToUndoStack(post);
      const shield = selectedShieldGroup.shields[shieldIndex];
      const nextShield = selectedShieldGroup.shields[nextShieldIndex];

      let groupNumber;
      if (shield.group != 0) {
        groupNumber = shield.group;
      } else {
        groupNumber = 0;
        for (const s of selectedShieldGroup.shields) {
          if (s.group > groupNumber) {
            groupNumber = s.group;
          }
        }
        groupNumber++;
      }

      shield.group = groupNumber;
      if (nextShield) {
        nextShield.group = groupNumber;
      }
    }
    formHandler.updateShieldSubform();
    redraw();
  };

  const removeShieldFromGroup = (shieldIndex) => {
    const selectedShieldGroup = getCurrentBlockElem();
    if (
      selectedShieldGroup &&
      selectedShieldGroup.constructor?.name === "ShieldGroupElement" &&
      shieldIndex >= 0 &&
      shieldIndex < selectedShieldGroup.shields.length
    ) {
      HistoryManager.addToUndoStack(post);
      const shield = selectedShieldGroup.shields[shieldIndex];

      let previousGroup = shield.group;
      let groupList = [];

      shield.group = 0;

      for (let i = 0; i < selectedShieldGroup.shields.length; i++) {
        const s = selectedShieldGroup.shields[i];
        if (s.group == previousGroup) {
          groupList.push(s);
        } else if (s.group == 0) {
          if (groupList.length == 1) {
            groupList[0].group = 0;
            groupList = [];
          }
          if (i != shieldIndex) {
            break;
          }
        }
      }
    }
    formHandler.updateShieldSubform();
    redraw();
  };

  const removeShieldGroup = (shieldIndex) => {
    const selectedShieldGroup = getCurrentBlockElem();
    if (
      selectedShieldGroup &&
      selectedShieldGroup.constructor?.name === "ShieldGroupElement" &&
      shieldIndex >= 0 &&
      shieldIndex < selectedShieldGroup.shields.length
    ) {
      HistoryManager.addToUndoStack(post);
      let groupNumber = selectedShieldGroup.shields[shieldIndex].group;
      for (let i = 0; i < selectedShieldGroup.shields.length; i++) {
        const s = selectedShieldGroup.shields[i];
        if (s.group == groupNumber) {
          s.group = 0;
        }
      }
    }
    formHandler.updateShieldSubform();
    redraw();
  };

  // APL
  const addAPLArrow = (subpanelIndex) => {
    const arrow = getCurrentPanel().sign.arrows;
    if (arrow.arrowMode != "apl") {
      return;
    }

    HistoryManager.addToUndoStack(post);
    getCurrentPanel().sign.newAPL(subpanelIndex);
    formHandler.updateGuideArrowsSubform();
    redraw();
  };

  const removeAPLArrow = (subpanelIndex, aplIndex) => {
    const arrow = getCurrentPanel().sign.arrows;
    if (arrow.arrowMode != "apl") {
      return;
    }

    HistoryManager.addToUndoStack(post);
    getCurrentPanel().sign.deleteAPL(subpanelIndex, aplIndex);
    formHandler.updateGuideArrowsSubform();
    redraw();
  };

  const setSelectedStandardArrow = (arrowIndex) => {
    currentlySelectedStandardArrow = Math.max(arrowIndex, -1);
    formHandler.updateGuideArrowsSubform();
  };

  const addStandardArrow = () => {
    const standardArrow = getCurrentPanel().sign.arrows.standard;
    HistoryManager.addToUndoStack(post);
    getCurrentPanel().sign.newStandardArrow();
    currentlySelectedStandardArrow = standardArrow.arrowList.length - 1;
    formHandler.updateGuideArrowsSubform();
    redraw();
  };

  const removeStandardArrow = () => {
    const standardArrow = getCurrentPanel().sign.arrows.standard;
    HistoryManager.addToUndoStack(post);
    getCurrentPanel().sign.deleteStandardArrow(currentlySelectedStandardArrow);
    currentlySelectedStandardArrow = clamp(
      currentlySelectedStandardArrow,
      -1,
      standardArrow.arrowList.length - 1,
    );
    formHandler.updateGuideArrowsSubform();
    redraw();
  };

  const duplicateStandardArrow = () => {
    const arrowList = getCurrentPanel().sign.arrows.standard.arrowList;
    if (
      currentlySelectedStandardArrow < 0 ||
      currentlySelectedStandardArrow >= arrowList.length
    ) {
      return;
    }

    HistoryManager.addToUndoStack(post);
    getCurrentPanel().sign.duplicateStandardArrow(
      currentlySelectedStandardArrow,
    );
    currentlySelectedStandardArrow++;
    formHandler.updateGuideArrowsSubform();
    redraw();
  };

  const moveStandardArrow = (oldIndex, newIndex) => {
    getCurrentPanel().sign.moveStandardArrow(oldIndex, newIndex);
    currentlySelectedStandardArrow = newIndex;
    formHandler.updateGuideArrowsSubform();
    redraw();
  };

  // Redraw Methods
  const redrawExitTabs = (
    panel,
    exitTabContainerTop,
    exitTabContainerBottom,
    exitTabContainerWithin,
    exitTabContainerLeft,
    exitTabContainerRight,
  ) => {
    let determineWidth = new Map();

    for (let rowIndex = panel.exitTabs.length - 1; rowIndex >= 0; rowIndex--) {
      const exitTabRow = panel.exitTabs[rowIndex];
      const exitTabRowElement = exitTabRow.createElement();
      exitTabRowElement.style.setProperty(
        "--backgroundColor",
        ColorLibrary.colorLibrary[panel.color] || panel.color,
      );

      if (exitTabRow.position == "top") {
        if (exitTabRow.independentWidth) {
          determineWidth.set(exitTabContainerTop, true);
        }

        exitTabContainerTop.appendChild(exitTabRowElement);
      } else if (exitTabRow.position == "bottom") {
        if (exitTabRow.independentWidth) {
          determineWidth.set(exitTabContainerBottom, true);
        }

        exitTabContainerBottom.appendChild(exitTabRowElement);
      } else if (exitTabRow.position == "left") {
        exitTabContainerLeft.appendChild(exitTabRowElement);
      } else if (exitTabRow.position == "right") {
        exitTabContainerRight.appendChild(exitTabRowElement);
      } else {
        exitTabContainerWithin.appendChild(exitTabRowElement);
      }
    }

    return determineWidth;
  };

  const redrawSubPanels = (panel, signHolderElmt) => {
    const subpanelList = [];
    const dividerList = [];

    for (
      let subPanelIndex = 0;
      subPanelIndex < panel.sign.subPanels.length;
      subPanelIndex++
    ) {
      const subPanel = panel.sign.subPanels[subPanelIndex];

      const signContentContainerElmt = document.createElement("div");
      signContentContainerElmt.className = `signContentContainer`;
      signHolderElmt.appendChild(signContentContainerElmt);

      if (
        panel.sign.arrows.arrowMode != "diagrammic" &&
        subPanel.laneWidth > 0 &&
        panel.sign.lanePanelSize > 0
      ) {
        signContentContainerElmt.style.width =
          panel.sign.lanePanelSize * subPanel.laneWidth + "px";
      } else if (
        panel.sign.arrows.arrowMode != "diagrammic" &&
        subPanel.laneWidth == 0 &&
        panel.sign.lanePanelSize > 0
      ) {
        signContentContainerElmt.style.display = "none";
      }

      const blockElement = subPanel.blockElements.createElement(
        panel,
        subPanel,
      );

      blockElement.style.justifyContent = subPanel.verticalAlign.toLowerCase();
      signContentContainerElmt.appendChild(blockElement);
      subpanelList.push(signContentContainerElmt);

      if (subPanelIndex < panel.sign.subPanels.length - 1) {
        const subDivider = document.createElement("div");
        subDivider.className = "subDivider";

        const subDividerHolder = document.createElement("div");
        subDividerHolder.className = "subDividerHolder";
        subDivider.appendChild(subDividerHolder);

        if (subPanel.dividerHeight && subPanel.dividerHeightUnit == "rem") {
          subDivider.style.height =
            subPanel.dividerHeight + subPanel.dividerHeightUnit;
        } else if (
          subPanel.dividerHeight &&
          subPanel.dividerHeightUnit == "%"
        ) {
          subDivider.style.height = `${
            (signContentContainerElmt.getBoundingClientRect().height / 1) *
            (subPanel.dividerHeight / 100)
          }px`;
        }
        subDivider.style.backgroundColor = ColorLibrary.checkForContrast(
          panel.color,
        )
          ? "black"
          : "white";

        dividerList.push(subDivider);
        signHolderElmt.appendChild(subDivider);
      }
    }

    return [subpanelList, dividerList];
  };

  const recolorBorder = (
    signHolder,
    subpanelList,
    dividerList,
    panel,
    signCorners,
  ) => {
    const zoomScale = 1;
    const getScaledRect = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top / zoomScale,
        right: rect.right / zoomScale,
        bottom: rect.bottom / zoomScale,
        left: rect.left / zoomScale,
        width: rect.width / zoomScale,
        height: rect.height / zoomScale,
      };
    };

    // sign border
    const signHolderRect = getScaledRect(signHolder);
    const innerEdges = {
      top: signHolderRect.top + borderThicknessToPx / zoomScale,
      right: signHolderRect.right - borderThicknessToPx / zoomScale,
      bottom: signHolderRect.bottom - borderThicknessToPx / zoomScale,
      left: signHolderRect.left + borderThicknessToPx / zoomScale,
    };

    const rows = subpanelList.flatMap((subpanel) =>
      Array.from(subpanel.querySelectorAll(".blockElementRow")),
    );

    // dividers
    for (const divider of dividerList) {
      const dividerRect = getScaledRect(divider);
      const defaultColor = ColorLibrary.checkForContrast(panel.color)
        ? "black"
        : "white";

      const intersectingRows = rows
        .filter((row) => {
          const rowRect = getScaledRect(row);
          const minXOverlap = dividerRect.left - 5;
          const maxXOverlap = dividerRect.right + 5;

          const isVerticalOverlap =
            rowRect.bottom >= dividerRect.top &&
            rowRect.top <= dividerRect.bottom;
          const isHorizontalOverlap =
            rowRect.left <= maxXOverlap && rowRect.right >= minXOverlap;

          return isVerticalOverlap && isHorizontalOverlap;
        })
        .sort((a, b) => getScaledRect(a).top - getScaledRect(b).top);

      const oppositeColorRows = intersectingRows.filter((row) => {
        const blockBackgroundColor = row.dataset.blockBackgroundColor;
        const blockBorderColor =
          ColorLibrary.checkForContrast(blockBackgroundColor);
        return blockBorderColor != ColorLibrary.checkForContrast(panel.color);
      });

      for (const row of oppositeColorRows) {
        const dividerBlock = document.createElement("div");
        dividerBlock.className = "subdividerRect";
        dividerBlock.style.position = "absolute";
        dividerBlock.style.top = `${getScaledRect(row).top - dividerRect.top}px`;
        dividerBlock.style.width = "100%";
        dividerBlock.style.height = getScaledRect(row).height;
        dividerBlock.style.backgroundColor = ColorLibrary.checkForContrast(
          row.dataset.blockBackgroundColor,
        )
          ? "black"
          : "white";
        divider.querySelector(".subDividerHolder").appendChild(dividerBlock);
      }

      if (
        Math.abs(dividerRect.top - innerEdges.top) <= 5 &&
        oppositeColorRows.length > 0
      ) {
        const dividerAbsElmt = document.createElement("div");
        dividerAbsElmt.className = "subdividerRect absolutePositioning";
        dividerAbsElmt.style.top = "-0.2rem";

        const touchingRow = oppositeColorRows.find((row) => {
          const rowRect = getScaledRect(row);
          return Math.abs(rowRect.top - innerEdges.top) <= 5;
        });

        if (touchingRow) {
          dividerAbsElmt.style.backgroundColor = ColorLibrary.checkForContrast(
            touchingRow.dataset.blockBackgroundColor,
          )
            ? "black"
            : "white";
        } else {
          dividerAbsElmt.style.backgroundColor = defaultColor;
        }

        divider.appendChild(dividerAbsElmt);
      }

      if (
        Math.abs(dividerRect.bottom - innerEdges.bottom) <= 5 &&
        oppositeColorRows.length > 0
      ) {
        const dividerAbsElmt = document.createElement("div");
        dividerAbsElmt.className = "subdividerRect absolutePositioning";
        dividerAbsElmt.style.bottom = "-0.2rem";

        const touchingRow = oppositeColorRows.find((row) => {
          const rowRect = getScaledRect(row);
          return Math.abs(rowRect.bottom - innerEdges.bottom) <= 5;
        });

        if (touchingRow) {
          dividerAbsElmt.style.backgroundColor = ColorLibrary.checkForContrast(
            touchingRow.dataset.blockBackgroundColor,
          )
            ? "black"
            : "white";
        } else {
          dividerAbsElmt.style.backgroundColor = defaultColor;
        }

        divider.appendChild(dividerAbsElmt);
      }
    }

    for (const row of rows) {
      row.style.border = "none";
      row.style.boxSizing = "border-box";

      const rowRect = getScaledRect(row);
      const touchesTop = Math.abs(rowRect.top - innerEdges.top) <= 5;
      const touchesRight = Math.abs(rowRect.right - innerEdges.right) <= 5;
      const touchesBottom = Math.abs(rowRect.bottom - innerEdges.bottom) <= 5;
      const touchesLeft = Math.abs(rowRect.left - innerEdges.left) <= 5;

      const blockBackgroundColor = row.dataset.blockBackgroundColor;
      const blockBorderColor =
        ColorLibrary.checkForContrast(blockBackgroundColor);

      if (blockBorderColor != ColorLibrary.checkForContrast(panel.color)) {
        if (
          touchesTop &&
          window.getComputedStyle(signHolder).borderTopWidth > 0
        ) {
          row.style.borderTop = `0.2rem solid ${blockBorderColor ? "black" : "white"}`;
          row.style.marginTop = `-0.2rem`;
        }
        if (touchesRight) {
          row.style.borderRight = `0.2rem solid ${blockBorderColor ? "black" : "white"}`;
          row.style.marginRight = `-0.2rem`;
          row.style.width = `calc(100% + 0.2rem)`;
        }
        if (
          touchesBottom &&
          window.getComputedStyle(signHolder).borderBottomWidth > 0
        ) {
          row.style.borderBottom = `0.2rem solid ${blockBorderColor ? "black" : "white"}`;
          row.style.marginBottom = `-0.2rem`;
        }
        if (touchesLeft) {
          row.style.borderLeft = `0.2rem solid ${blockBorderColor ? "black" : "white"}`;
          row.style.marginLeft = `-0.2rem`;
          row.style.width = `calc(100% + 0.2rem)`;
        }

        if (touchesLeft && touchesRight) {
          row.style.width = `calc(100% + 0.4rem)`;
        }
      }

      if (
        touchesTop &&
        touchesRight &&
        window.getComputedStyle(signHolder).borderTopWidth > 0
      ) {
        row.style.borderTopRightRadius = `${panel.borderRadius}rem`;
        signCorners[0].style.backgroundColor = blockBackgroundColor;
      }

      if (
        touchesTop &&
        touchesLeft &&
        window.getComputedStyle(signHolder).borderTopidth > 0
      ) {
        row.style.borderTopLeftRadius = `${panel.borderRadius}rem`;
        signCorners[1].style.backgroundColor = blockBackgroundColor;
      }

      if (
        touchesBottom &&
        touchesRight &&
        window.getComputedStyle(signHolder).borderBottomWidth > 0
      ) {
        row.style.borderBottomRightRadius = `${panel.borderRadius}rem`;
        signCorners[2].style.backgroundColor = blockBackgroundColor;
      }

      if (
        touchesBottom &&
        touchesLeft &&
        window.getComputedStyle(signHolder).borderBottomWidth > 0
      ) {
        row.style.borderBottomLeftRadius = `${panel.borderRadius}rem`;
        signCorners[3].style.backgroundColor = blockBackgroundColor;
      }
    }

    return;
  };

  const redrawPanel = (panel, panelContainerElmt, index) => {
    const panelElmt = document.createElement("div");
    panelElmt.className = `panel ${panel.corner.toLowerCase()} ${panel.panelAppearance.toLowerCase()}`;
    panelElmt.style.setProperty(
      "--leftSpacing",
      (panel.useLeftSpacing ? panel.leftSpacing : post.panelSpacing) + "rem",
    );
    panelElmt.style.setProperty(
      "--rightSpacing",
      (panel.useRightSpacing ? panel.rightSpacing : post.panelSpacing) + "rem",
    );

    if (panel.panelAppearance.includes("Pixels")) {
      panelElmt.style.padding = `${panel.appearancePadding}rem`;
      panelElmt.style.border = `${panel.appearanceBorderThickness}px solid black`;
      panelElmt.style.backgroundColor = `#444444`;

      const panelOverlay = document.createElement("div");
      panelOverlay.className = "panelPixelOverlay";
      panelOverlay.style.background =
        panel.panelAppearance === "Circle Pixels"
          ? `radial-gradient(circle, transparent ${panel.appearancePixelSize}rem, black ${panel.appearancePixelSize}rem)`
          : `linear-gradient(to right, transparent ${panel.appearancePixelSize}rem, black ${panel.appearancePixelSize}rem), linear-gradient(to bottom, transparent ${panel.appearancePixelSize}rem, black ${panel.appearancePixelSize}rem)`;
      panelOverlay.style.backgroundSize = `${panel.appearancePixelSize * 3}rem ${panel.appearancePixelSize * 3}rem`;
      panelElmt.appendChild(panelOverlay);
    }

    panelElmt.style.setProperty(
      "--bg-color",
      ColorLibrary.colorLibrary[panel.color] || panel.color,
    );
    panelElmt.style.setProperty(
      "--fg-color",
      ColorLibrary.checkForContrast(panel.color) ? "black" : "white",
    );

    panelElmt.style.setProperty(
      "--signBorderRadius",
      panel.borderRadius + "rem",
    );
    panelElmt.id = "panel" + index;
    panelContainerElmt.appendChild(panelElmt);

    const exitTabContainerTop = document.createElement("div");
    exitTabContainerTop.className = "exitTabContainer top";

    const exitTabContainerBottom = document.createElement("div");
    exitTabContainerBottom.className = "exitTabContainer bottom";

    const exitTabContainerLeft = document.createElement("div");
    exitTabContainerLeft.className = "exitTabContainer left";

    const exitTabContainerRight = document.createElement("div");
    exitTabContainerRight.className = "exitTabContainer right";

    const exitTabContainerWithin = document.createElement("div");
    exitTabContainerWithin.className = "exitTabContainer within";

    let considerWidth = redrawExitTabs(
      panel,
      exitTabContainerTop,
      exitTabContainerBottom,
      exitTabContainerWithin,
      exitTabContainerLeft,
      exitTabContainerRight,
    );

    const signCont = document.createElement("div");
    signCont.className = `signContainer`;
    panelElmt.appendChild(signCont);

    const signElmt = document.createElement("div");
    signElmt.className = `sign`;

    const topLeftSignCorner = document.createElement("div");
    topLeftSignCorner.className = "signCorner topLeft";
    signElmt.appendChild(topLeftSignCorner);

    const topRightSignCorner = document.createElement("div");
    topRightSignCorner.className = "signCorner topRight";
    signElmt.appendChild(topRightSignCorner);

    const bottomLeftSignCorner = document.createElement("div");
    bottomLeftSignCorner.className = "signCorner bottomLeft";
    signElmt.appendChild(bottomLeftSignCorner);

    const bottomRightSignCorner = document.createElement("div");
    bottomRightSignCorner.className = "signCorner bottomRight";
    signElmt.appendChild(bottomRightSignCorner);

    const signHolderElmt = document.createElement("div");
    signHolderElmt.className = `signHolder ${panel.sign.arrows.arrowMode == "diagrammic" ? "diagrammic" : ""}`;
    signElmt.appendChild(signHolderElmt);
    signElmt.appendChild(exitTabContainerWithin);

    let hasFirstBottom = false,
      hasFirstTop = false;
    for (const exitTab of panel.exitTabs) {
      if (exitTab.position == "bottom" && !hasFirstBottom) {
        hasFirstBottom = true;

        if (exitTab.hideBottomBorder) {
          signHolderElmt.style.borderBottom = "none";
        }
      }
      if (exitTab.position == "top" && !hasFirstTop) {
        hasFirstTop = true;

        if (exitTab.hideTopBorder) {
          signHolderElmt.style.borderTop = "none";
        }
      }
    }

    const guideArrowsHolderElmt = document.createElement("div");
    guideArrowsHolderElmt.className = "guideArrowsHolder";

    const guideArrowsElmt = document.createElement("div");

    guideArrowsElmt.className = `guideArrows ${panel.sign.arrows.arrowMode.toLowerCase()} ${
      panel.sign.arrows.arrowMode.toLowerCase() == "standard"
        ? panel.sign.arrows.standard.variant
            .toLowerCase()
            .replace(/\//g, "-")
            .replace(/\s/g, "_")
            .toLowerCase()
        : ""
    }`;
    guideArrowsHolderElmt.appendChild(guideArrowsElmt);

    const sideLeftArrowElmt = document.createElement("img");
    sideLeftArrowElmt.className = "sideLeftArrow";
    sideLeftArrowElmt.src = "assets/arrow/TypeA.svg";
    signHolderElmt.appendChild(sideLeftArrowElmt);

    const sideRightArrowElmt = document.createElement("img");
    sideRightArrowElmt.className = "sideRightArrow";
    sideRightArrowElmt.src = "assets/arrow/TypeA.svg";

    signCont.appendChild(exitTabContainerTop);
    signCont.appendChild(exitTabContainerLeft);
    signCont.appendChild(exitTabContainerRight);
    signCont.appendChild(signElmt);
    signCont.appendChild(guideArrowsHolderElmt);
    signCont.appendChild(exitTabContainerBottom);

    const [subpanelList, dividerList] = redrawSubPanels(panel, signHolderElmt);
    requestAnimationFrame(() => {
      recolorBorder(signHolderElmt, subpanelList, dividerList, panel, [
        topRightSignCorner,
        topLeftSignCorner,
        bottomRightSignCorner,
        bottomLeftSignCorner,
      ]);
    });

    signHolderElmt.appendChild(sideRightArrowElmt);

    // Guide arrows
    const arrows = panel.sign.arrows;
    const arrowVariant = arrows[arrows.arrowMode];

    if (
      arrows.arrowMode == "diagrammic" &&
      Object.keys(arrowVariant.diagramData).length != 0
    ) {
      let diagramData = arrowVariant.diagramData;
      const diagrammicImage = document.createElement("img");
      diagrammicImage.className = "diagrammicImage";
      diagrammicImage.style.height = 15 * (arrowVariant.scale / 100) + "rem";
      diagrammicImage.style.width = 15 * (arrowVariant.scale / 100) + "rem";

      DiagramDrawing.diagramDataToImage(diagramData, false, false)
        .then((url) => {
          diagrammicImage.src = url;
        })
        .catch((error) => {
          alert(error);
        });

      signHolderElmt.appendChild(diagrammicImage);

      // aligning subpanels
      const canvasSize = diagramData.canvasProperties.canvasWidth;
      const diagramClientRect = diagrammicImage.getBoundingClientRect();

      const zoomScale = 1;
      const diagramHeightScaled = diagramClientRect.height / zoomScale;

      let queue = [diagramData.roadData];
      let subpanelNumbersUsed = {};

      while (queue.length > 0) {
        let nextNode = queue.pop();
        queue.push(...nextNode.children);

        if (
          !nextNode.subpanel.enabled ||
          !subpanelList[nextNode.subpanel.subpanelNumber]
        ) {
          continue;
        }

        let subpanel = subpanelList[nextNode.subpanel.subpanelNumber];

        let position = [
          (nextNode.subpanel.x / canvasSize) * diagramHeightScaled,
          (nextNode.subpanel.y / canvasSize) * diagramHeightScaled,
        ];

        if (nextNode.subpanel.direction == "left") {
          position[0] -= subpanel.getBoundingClientRect().width / zoomScale;
        } else if (nextNode.subpanel.direction == "top") {
          position[1] -= subpanel.getBoundingClientRect().height / zoomScale;
        }

        if (
          nextNode.subpanel.direction == "left" ||
          nextNode.subpanel.direction == "right"
        ) {
          position[1] -=
            subpanel.getBoundingClientRect().height / zoomScale / 2;
        } else if (
          nextNode.subpanel.direction == "top" ||
          nextNode.subpanel.direction == "bottom"
        ) {
          position[0] -= subpanel.getBoundingClientRect().width / zoomScale / 2;
        }

        subpanelNumbersUsed[nextNode.subpanel.subpanelNumber] = {
          position: position,
          direction: nextNode.subpanel.direction,
        };
        subpanel.style.setProperty("--leftTransform", position[0]);
        subpanel.style.setProperty("--topTransform", position[1]);
      }

      for (let i = 0; i < subpanelList.length; i++) {
        if (!subpanelNumbersUsed[i]) {
          subpanelList[i].style.display = "none";
        }
      }

      let minLeft = 0;
      let maxRight = diagramHeightScaled;

      let minTop = 0;
      let maxBottom = diagramHeightScaled;

      for (const key in subpanelNumbersUsed) {
        const { position, _ } = subpanelNumbersUsed[key];
        const [posX, posY] = position;
        const subpanel = subpanelList[key];

        const subpanelRect = subpanel.getBoundingClientRect();
        const normWidth = subpanelRect.width / zoomScale;
        const normHeight = subpanelRect.height / zoomScale;

        if (posX < minLeft) {
          minLeft = posX;
        }
        if (posX + normWidth > maxRight) {
          maxRight = posX + normWidth;
        }
        if (posY < minTop) {
          minTop = posY;
        }
        if (posY + normHeight > maxBottom) {
          maxBottom = posY + normHeight;
        }
      }

      const leftOverhang = Math.abs(Math.min(0, minLeft));
      const topOverhang = Math.abs(Math.min(0, minTop));

      signHolderElmt.style.width = `${maxRight - minLeft}px`;
      signHolderElmt.style.height = `${maxBottom - minTop}px`;

      diagrammicImage.style.left = `${leftOverhang}px`;
      diagrammicImage.style.top = `${topOverhang}px`;

      for (const key in subpanelNumbersUsed) {
        const subpanel = subpanelList[key];
        const { position } = subpanelNumbersUsed[key];

        subpanel.style.setProperty(
          "--leftTransform",
          `${position[0] + leftOverhang}`,
        );
        subpanel.style.setProperty(
          "--topTransform",
          `${position[1] + topOverhang}`,
        );
      }
    }

    if (arrows.arrowMode == "apl") {
      guideArrowsElmt.style.setProperty(
        "--verticalTopPadding",
        arrowVariant.verticalTopPadding + "rem",
      );
      guideArrowsElmt.style.setProperty(
        "--verticalBottomPadding",
        arrowVariant.verticalBottomPadding + "rem",
      );
      guideArrowsElmt.style.setProperty(
        "--arrowGap",
        (panel.sign.lanePanelSize > 0 ? 0 : arrowVariant.gap || 0) + "rem",
      );

      if (panel.sign.lanePanelSize == 0) {
        guideArrowsElmt.style.paddingLeft = ".5rem";
        guideArrowsElmt.style.paddingRight = ".5rem";
        signHolderElmt.style.paddingLeft = ".5rem";
        signHolderElmt.style.paddingRight = ".5rem";
      }

      const aplHolderList = [];

      // duplicated code but i'd rather be able to figure something out bash mash my head into two identical yet different codes
      if (parseInt(panel.sign.lanePanelSize) === 0) {
        // uses arrow gap :(

        const subpanelPreRects = [];
        for (let i = 0; i < subpanelList.length; i++) {
          let rect = subpanelList[i].getBoundingClientRect();

          // apply a / 1 on all of rect
          rect = {
            top: rect.top / 1,
            right: rect.right / 1,
            bottom: rect.bottom / 1,
            left: rect.left / 1,
            width: rect.width / 1,
            height: rect.height / 1,
          };

          // if arrowVariant.subpanels[i - 0.5] exists, then subtract by arrow gap to px
          if (arrowVariant.subpanels[i - 0.5]) {
            rect = {
              ...rect,
              width:
                rect.width -
                arrowVariant.gap *
                  parseFloat(
                    getComputedStyle(document.documentElement).fontSize,
                  ),
            };
          }

          if (arrowVariant.subpanels[i + 0.5]) {
            rect = {
              ...rect,
              width:
                rect.width -
                arrowVariant.gap *
                  parseFloat(
                    getComputedStyle(document.documentElement).fontSize,
                  ),
            };
          }

          subpanelPreRects[i] = rect;
        }

        for (let i = 0; i <= subpanelList.length - 1; i += 0.5) {
          const aplArrows = arrowVariant.subpanels[i] || [];
          const subpanel = i % 1 == 0 && subpanelList[i];
          const aplHolder = document.createElement("div");
          aplHolder.className =
            "sMGA_APLHolder manual " + (subpanel ? "" : "divider");

          if (
            arrowVariant.subpanelConfigs[i] &&
            arrowVariant.subpanelConfigs[i].justify === true
          ) {
            aplHolder.style.justifyContent = "right";
          }

          if (!subpanel) {
            aplHolder.style.width = `${arrowVariant.gap * 2}rem`;
          } else {
            aplHolder.style.width = `max-content`;
            aplHolder.style.minWidth = `${subpanelPreRects[i].width / 1}px`;
          }

          for (let j = 0; j <= aplArrows.length - 1; j += 1) {
            const arrow = aplArrows[j];
            const arrowElmt = arrow.createElement();
            arrowElmt.style.width = arrow.size / 2 + "rem";

            if (ColorLibrary.checkForContrast(panel.color)) {
              if (arrow.exitOnlyEnabled) {
                arrowElmt.children[1].style.filter = "invert(1)";
              } else {
                arrowElmt.style.filter = "invert(1)";
              }
            }

            if (arrow.exitOnlyEnabled) {
              const exitWidthChecker = document.createElement("div");
              document.body.appendChild(exitWidthChecker);

              exitWidthChecker.appendChild(arrowElmt);

              const arrowRect = arrowElmt
                .querySelector(".sMGA_APLArrow")
                .getBoundingClientRect();
              const arrowHolderRect = arrowElmt.getBoundingClientRect();

              const distanceToCenter = Math.abs(
                arrowRect.left +
                  arrowRect.width / 2 -
                  (arrowHolderRect.left + arrowHolderRect.width / 2),
              );

              if (
                j === 0 &&
                i === 0 &&
                arrowElmt.children[0].tagName === "DIV"
              ) {
                const divRect = arrowElmt.children[0].getBoundingClientRect();
                const divDistToCenter = arrowHolderRect.left - divRect.left;

                aplHolder.style.paddingLeft = `${divDistToCenter / 1}px`;
              }

              if (
                j === aplArrows.length - 1 &&
                i === subpanelList.length - 1 &&
                arrowElmt.children[2].tagName === "DIV"
              ) {
                const divRect = arrowElmt.children[2].getBoundingClientRect();
                const divDistToCenter = divRect.right - arrowHolderRect.right;

                aplHolder.style.paddingRight = `${divDistToCenter / 1}px`;
              }

              const sign =
                arrowRect.left + arrowRect.width / 2 <
                arrowHolderRect.left + arrowHolderRect.width / 2
                  ? distanceToCenter
                  : -distanceToCenter;
              for (const child of arrowElmt.children) {
                child.style.transform = `translateX(${sign / 1}px)`;
              }
              arrowElmt
                .querySelector(".sMGA_APLArrow")
                .style.setProperty("--translation", sign / 1);

              exitWidthChecker.remove();
            } else {
              const exitWidthChecker = document.createElement("div");
              document.body.appendChild(exitWidthChecker);

              exitWidthChecker.appendChild(arrowElmt);

              const arrowRect = arrowElmt
                .querySelector(".sMGA_APLArrow")
                .getBoundingClientRect();
              const arrowHolderRect = arrowElmt.getBoundingClientRect();

              const distanceToCenter = Math.abs(
                arrowRect.left +
                  arrowRect.width / 2 -
                  (arrowHolderRect.left + arrowHolderRect.width / 2),
              );

              if (j === 0 && i === 0) {
                const divDistToCenter = arrowHolderRect.left - arrowRect.left;
                aplHolder.style.paddingLeft = `${divDistToCenter / 2 / 1}px`;
              }

              if (j === aplArrows.length - 1 && i === subpanelList.length - 1) {
                const divDistToCenter = arrowHolderRect.right - arrowRect.right;

                aplHolder.style.paddingRight = `${divDistToCenter / 2 / 1}px`;
              }

              const sign =
                arrowRect.left + arrowRect.width / 2 <
                arrowHolderRect.left + arrowHolderRect.width / 2
                  ? distanceToCenter
                  : -distanceToCenter;
              arrowElmt.querySelector(".sMGA_APLArrow").style.transform =
                `translateX(${sign / 1}px)`;
              arrowElmt
                .querySelector(".sMGA_APLArrow")
                .style.setProperty("--translation", sign / 1);
              exitWidthChecker.remove();
            }

            if (arrowElmt.querySelector(".sMGA_APLArrow.flipped")) {
              arrowElmt.querySelector(
                ".sMGA_APLArrow.flipped",
              ).style.transform +=
                ` scaleX(-1) translateX(calc(-1 * var(--arrowOffset)))`;
            }

            aplHolder.appendChild(arrowElmt);
          }

          // flex test
          const flexTest = document.createElement("div");
          flexTest.style.setProperty("--arrowGap", arrowVariant.gap + "rem");
          document.body.appendChild(flexTest);
          flexTest.appendChild(aplHolder);

          aplHolder.style.flex = `0 0 ${aplHolder.getBoundingClientRect().width / 1}px`;

          guideArrowsElmt.appendChild(aplHolder);
          flexTest.remove();

          aplHolderList.push(aplHolder);

          if (aplArrows.length === 0 && subpanel) {
            aplHolder.style.minWidth = `0`;
            aplHolder.style.flex = `0`;
          } else {
          }
        }

        // assign a dividerParent yadaaydayaydya im going insaneeeee
        for (let i = 0; i < dividerList.length; i++) {
          const divider = dividerList[i];
          const dividerParent = document.createElement("div");
          const originalParent = divider.parentNode;
          originalParent.replaceChild(dividerParent, divider);

          dividerParent.className = "dividerParent";
          dividerParent.style.width = `${arrowVariant.gap * 2}rem`;
          dividerParent.style.flex = `0 0 ${arrowVariant.gap * 2}rem`;
          dividerParent.appendChild(divider);

          dividerList[i] = dividerParent;
        }

        // set each subpanel to be equal to the respective apl content
        for (let i = 0; i < subpanelList.length; i++) {
          const subpanel = subpanelList[i];
          const aplHolder = aplHolderList[2 * i];

          if (
            aplHolder.getBoundingClientRect().width <= 1 &&
            i == subpanelList.length - 1
          ) {
            continue;
          }

          subpanel.style.width = `${aplHolder.getBoundingClientRect().width / 1}px`;
          subpanel.style.flex = `0 0 ${aplHolder.getBoundingClientRect().width / 1}px`;
        }

        const signHolderRects = signHolderElmt.getBoundingClientRect();
        for (let i = 0; i < subpanelList.length; i++) {
          const subpanel = subpanelList[i];

          const currentBoundX = subpanel.getBoundingClientRect().left / 1;
          let leftBoundX;
          let rightBoundX;

          if (i == 0) {
            leftBoundX = signHolderRects.left;
            rightBoundX =
              subpanelList.length === 1
                ? signHolderRects.left + signHolderRects.width
                : dividerList[i]
                    .querySelector(".subDivider")
                    .getBoundingClientRect().left;
          } else if (i == subpanelList.length - 1) {
            leftBoundX =
              dividerList[i - 1]
                .querySelector(".subDivider")
                .getBoundingClientRect().left +
              dividerList[i - 1]
                .querySelector(".subDivider")
                .getBoundingClientRect().width;
            rightBoundX = signHolderRects.left + signHolderRects.width;
          } else {
            leftBoundX =
              dividerList[i - 1]
                .querySelector(".subDivider")
                .getBoundingClientRect().left +
              dividerList[i - 1]
                .querySelector(".subDivider")
                .getBoundingClientRect().width;
            rightBoundX = dividerList[i]
              .querySelector(".subDivider")
              .getBoundingClientRect().left;
          }

          leftBoundX /= 1;
          rightBoundX /= 1;

          const newCenter = (leftBoundX + rightBoundX) / 2;
          const newLeft =
            newCenter - subpanel.getBoundingClientRect().width / 2;
          const offset = newLeft - currentBoundX;

          subpanel.style.transform = `translateX(${offset}px)`;

          //add offsets for dividers
          for (let i = 0; i <= aplHolderList.length - 1; i += 1) {
            if (
              aplHolderList[i].className == "sMGA_APLHolder manual divider" &&
              aplHolderList[i].querySelector(".sMGA_APLArrow") &&
              aplHolderList[i]
                .querySelector(".sMGA_APLArrow")
                .style.getPropertyValue("--translation") != 0
            ) {
              aplHolderList[i - 1].style.paddingRight =
                `${-1 * aplHolderList[i].querySelector(".sMGA_APLArrow").style.getPropertyValue("--translation")}px`;
            }
            if (
              aplHolderList[i].className == "sMGA_APLHolder manual divider" &&
              aplHolderList[i].querySelector(".sMGA_APLArrow") &&
              aplHolderList[i].querySelector(".sMGA_APLArrow.flipped") &&
              aplHolderList[i]
                .querySelector(".sMGA_APLArrow.flipped")
                .style.getPropertyValue("--translation") != 0
            ) {
              aplHolderList[i + 1].style.paddingLeft =
                `${aplHolderList[i].querySelector(".sMGA_APLArrow.flipped").style.getPropertyValue("--translation")}px`;
            }
          }
        }
      } else {
        // uses lane panel size
        for (let i = 0; i <= subpanelList.length - 1; i += 0.5) {
          const aplArrows = arrowVariant.subpanels[i] || [];
          const subpanel = i % 1 == 0 && subpanelList[i];
          const aplHolder = document.createElement("div");
          aplHolder.className = "sMGA_APLHolder";

          // generate all arrows
          for (let j = 0; j <= aplArrows.length - 1; j += 1) {
            const arrow = aplArrows[j];
            const arrowElmt = arrow.createElement();
            arrowElmt.style.width = panel.sign.lanePanelSize + "px";

            if (ColorLibrary.checkForContrast(panel.color)) {
              if (arrow.exitOnlyEnabled) {
                arrowElmt.children[1].style.filter = "invert(1)";
              } else {
                arrowElmt.style.filter = "invert(1)";
              }
            }

            aplHolder.appendChild(arrowElmt);
          }

          aplHolderList.push(aplHolder);
          guideArrowsElmt.appendChild(aplHolder);

          if (subpanel) {
            // subpanel
            const holderSize =
              panel.sign.lanePanelSize * panel.sign.subPanels[i].laneWidth;

            if (
              arrowVariant.subpanels[i - 0.5] &&
              arrowVariant.subpanels[i - 0.5].length > 0
            ) {
              aplHolder.style.width = `${holderSize - panel.sign.lanePanelSize}px`;
            } else {
              aplHolder.style.width = `${holderSize}px`;
            }
            continue;
          }

          if (
            arrowVariant.subpanels[i] &&
            arrowVariant.subpanels[i].length > 0
          ) {
            // divider w/ arrow
            aplHolder.style.width = panel.sign.lanePanelSize + "px";
            continue;
          }
        }

        // for each divider, create a dividerParent and reassign dividerList likewise
        for (let i = 0; i < dividerList.length; i++) {
          const divider = dividerList[i];
          const dividerParent = document.createElement("div");
          const originalParent = divider.parentNode;
          originalParent.replaceChild(dividerParent, divider);

          dividerParent.className = "dividerParent";
          dividerParent.style.width = panel.sign.lanePanelSize + "px";
          dividerParent.appendChild(divider);

          dividerList[i] = dividerParent;
        }

        // get the correct widths
        for (let i = 0; i < subpanelList.length; i++) {
          const subpanel = subpanelList[i];
          const aplHolder = aplHolderList[2 * i];

          if (
            (i > 0 && !arrowVariant.subpanels[i - 0.5]) ||
            (arrowVariant.subpanels[i - 0.5] &&
              arrowVariant.subpanels[i - 0.5].length == 0)
          ) {
            subpanel.style.width =
              aplHolder.getBoundingClientRect().width / 1 -
              panel.sign.lanePanelSize +
              "px";
          } else {
            subpanel.style.width = aplHolder.style.width;
          }
        }

        const signHolderRects = signHolderElmt.getBoundingClientRect();

        // re-center each subpanel by either the left, dividers, or right signHolder
        for (let i = 0; i < subpanelList.length; i++) {
          const subpanel = subpanelList[i];

          const currentBoundX = subpanel.getBoundingClientRect().left / 1;
          let leftBoundX;
          let rightBoundX;

          if (i == 0) {
            leftBoundX = signHolderRects.left;
            rightBoundX =
              subpanelList.length === 1
                ? signHolderRects.left + signHolderRects.width
                : dividerList[i]
                    .querySelector(".subDivider")
                    .getBoundingClientRect().left;
          } else if (i == subpanelList.length - 1) {
            leftBoundX =
              dividerList[i - 1]
                .querySelector(".subDivider")
                .getBoundingClientRect().left +
              dividerList[i - 1]
                .querySelector(".subDivider")
                .getBoundingClientRect().width;
            rightBoundX = signHolderRects.left + signHolderRects.width;
          } else {
            leftBoundX =
              dividerList[i - 1]
                .querySelector(".subDivider")
                .getBoundingClientRect().left +
              dividerList[i - 1]
                .querySelector(".subDivider")
                .getBoundingClientRect().width;
            rightBoundX = dividerList[i]
              .querySelector(".subDivider")
              .getBoundingClientRect().left;
          }

          leftBoundX /= 1;
          rightBoundX /= 1;

          const newCenter = (leftBoundX + rightBoundX) / 2;
          const newLeft =
            newCenter - subpanel.getBoundingClientRect().width / 2;
          const offset = newLeft - currentBoundX;

          subpanel.style.transform = `translateX(${offset}px)`;
        }
      }
    }

    if (arrows.arrowMode == "standard") {
      const createOtherSymbol = (otherSymbolType) => {
        switch (otherSymbolType) {
          case "actionMessage":
            const actionMessage = new ActionMessageElement({
              textContent: panel.sign.actionMessage,
              fontSize: 50,
            });
            return actionMessage.createElement();
          case "Quebec-Style Exit Marker":
          case "Quebec-Style LEFT Exit Marker":
            const otherSymbolsElmt = document.createElement("div");
            otherSymbolsElmt.className = `otherSymbols ${panel.sign.otherSymbol
              .replace(/\s/g, "_")
              .toLowerCase()}`;
            guideArrowsElmt.appendChild(otherSymbolsElmt);

            const oSNumElmt = document.createElement("div");
            oSNumElmt.className = `oSNum`;
            oSNumElmt.textContent = panel.sign.oSNum;

            switch (oSNumElmt.textContent.length) {
              case 1:
              case 2:
                oSNumElmt.classList.add("two");
                break;
              case 3:
                oSNumElmt.classList.add("three");
                break;
              case 4:
              case 5:
              default:
                oSNumElmt.classList.add("five");
            }

            otherSymbolsElmt.appendChild(oSNumElmt);

            return otherSymbolsElmt;
          default:
            return null;
        }
      };

      const standardArrowConfig = panel.sign.arrows.standard;
      const standardVariant = standardArrowConfig.variant;
      const exitOnlyConfigs = standardArrowConfig.exitOnlyConfigs;

      const arrowContElmt = document.createElement("div");
      arrowContElmt.className = `arrowContainer`;
      guideArrowsElmt.appendChild(arrowContElmt);

      if (standardVariant.includes("Exit Only")) {
        guideArrowsElmt.classList.add(
          exitOnlyConfigs.borderMode.replace(/\s/g, "_"),
        );

        guideArrowsElmt.style.setProperty(
          "--exitOnlyFontFamily",
          `"${exitOnlyConfigs.fontFamily}"`,
        );
        guideArrowsElmt.style.setProperty(
          "--exitOnlyFontSize",
          exitOnlyConfigs.fontSize + "px",
        );
        guideArrowsElmt.style.setProperty(
          "--exitOnlyWordSpacing",
          exitOnlyConfigs.wordSpacing + "rem",
        );
        guideArrowsElmt.style.setProperty(
          "--exitOnlyLetterSpacing",
          exitOnlyConfigs.letterSpacing + "rem",
        );
        guideArrowsElmt.style.setProperty(
          "--verticalPadding",
          `${exitOnlyConfigs.verticalPadding}rem`,
        );
        guideArrowsElmt.style.setProperty(
          "--horizontalPadding",
          `${exitOnlyConfigs.horizontalPadding}rem`,
        );
      }

      let exitOnlyContainer = arrowContElmt;
      switch (standardVariant) {
        case "Side Left": {
          sideLeftArrowElmt.style.display = "block";
          if (ColorLibrary.checkForContrast(panel.color)) {
            sideLeftArrowElmt.style.filter = "invert(1)";
          }
          break;
        }
        case "Side Right": {
          sideRightArrowElmt.style.display = "block";
          if (ColorLibrary.checkForContrast(panel.color)) {
            sideRightArrowElmt.style.filter = "invert(1)";
          }
          break;
        }
        case "Custom": {
          arrowContElmt.style.setProperty(
            "--arrowGap",
            standardArrowConfig.customConfig.gap + "rem",
          );
          arrowContElmt.style.setProperty(
            "--arrowJustify",
            standardArrowConfig.customConfig.justify.toLowerCase() ==
              "space between"
              ? "space-between"
              : standardArrowConfig.customConfig.justify.toLowerCase(),
          );
          guideArrowsElmt.style.padding = `${standardArrowConfig.customConfig.verticalTopPadding}rem ${standardArrowConfig.customConfig.horizontalPadding}rem ${standardArrowConfig.customConfig.verticalBottomPadding}rem`;

          let arrowIndex = 0;

          for (const arrow of standardArrowConfig.arrowList) {
            const arrowElement = arrow.createElement();
            if (panel.sign.lanePanelSize > 0) {
              arrowElement.style.width = panel.sign.lanePanelSize + "px";
            }

            arrowContElmt.appendChild(arrowElement);

            if (
              arrowIndex == panel.sign.oSArrow &&
              panel.sign.otherSymbol != "None"
            ) {
              const otherSymbolElement = createOtherSymbol(
                panel.sign.otherSymbol,
              );
              if (panel.sign.oSArrowPositioning == "Left") {
                arrowElement.before(otherSymbolElement);
              } else {
                arrowElement.after(otherSymbolElement);
              }
            }

            if (
              arrowIndex == panel.sign.actionMessageArrow &&
              panel.sign.actionMessage != ""
            ) {
              const actionMessage = createOtherSymbol("actionMessage");
              if (panel.sign.actionMessagePositioning == "Left") {
                arrowElement.before(actionMessage);
              } else {
                arrowElement.after(actionMessage);
              }
            }

            if (ColorLibrary.checkForContrast(panel.color)) {
              arrowElement.style.filter = "invert(1)";
            }

            arrowIndex++;
          }

          if (
            -1 == panel.sign.actionMessageArrow &&
            panel.sign.actionMessage != ""
          ) {
            const actionMessage = createOtherSymbol("actionMessage");
            if (panel.sign.actionMessagePositioning == "Left") {
              arrowContElmt.prepend(actionMessage);
            } else {
              arrowContElmt.appendChild(actionMessage);
            }
          }

          if (-1 == panel.sign.oSArrow && panel.sign.otherSymbol != "None") {
            const otherSymbolElement = createOtherSymbol(
              panel.sign.otherSymbol,
            );

            if (panel.sign.oSArrowPositioning == "Left") {
              arrowContElmt.prepend(otherSymbolElement);
            } else {
              arrowContElmt.appendChild(otherSymbolElement);
            }
          }

          break;
        }
        case "Half Exit Only": {
          exitOnlyContainer = document.createElement("div");
          exitOnlyContainer.className = "arrowContainer halfExitOnly";
          arrowContElmt.appendChild(exitOnlyContainer);

          const secondArrow =
            standardArrowConfig.exitOnlyConfigs.arrow.createElement();
          secondArrow.classList.add("halfExitOnlyOutsideArrow");
          secondArrow.style.visibility = standardArrowConfig.exitOnlyConfigs
            .displayOutsideArrow
            ? "visible"
            : "hidden";
          if (ColorLibrary.checkForContrast(panel.color)) {
            secondArrow.style.filter = "invert(1)";
          }
          arrowContElmt.appendChild(secondArrow);
        }
        case "Split Exit Only":
        case "Exit Only": {
          const exitOnlyConfig = standardArrowConfig.exitOnlyConfigs;
          const arrowElement = exitOnlyConfig.arrow.createElement();

          if (panel.sign.lanePanelSize > 0) {
            arrowElement.style.width = panel.sign.lanePanelSize + "px";
          }

          exitOnlyContainer.style.setProperty("--arrowJustify", "Center");
          exitOnlyContainer.style.setProperty(
            "--arrowGap",
            (exitOnlyConfig.numArrows <= 1
              ? exitOnlyConfig.textGap
              : exitOnlyConfig.gap) + "rem",
          );
          guideArrowsHolderElmt.style.setProperty(
            "--bgColor",
            ColorLibrary.colorLibrary[exitOnlyConfig.backgroundColor] ||
              exitOnlyConfig.backgroundColor,
          );
          if (!ColorLibrary.checkForContrast(exitOnlyConfig.backgroundColor)) {
            guideArrowsHolderElmt.style.color = "white";
            guideArrowsHolderElmt.style.borderColor = "white";
            exitOnlyContainer.style.color = "white";
          } else {
            guideArrowsHolderElmt.style.color = "black";
            guideArrowsHolderElmt.style.borderColor = "black";
            exitOnlyContainer.style.color = "black";
          }

          if (standardVariant != "Split Exit Only") {
            arrowElement.style.filter = ColorLibrary.checkForContrast(
              exitOnlyConfig.backgroundColor,
            )
              ? "invert(1)"
              : "";
          } else {
            arrowElement.style.filter = ColorLibrary.checkForContrast(
              panel.color,
            )
              ? "invert(1)"
              : "";
          }

          let numArrows = exitOnlyConfig.numArrows;

          const textElementBuilder = new TextElement({
            textContent: exitOnlyConfig.exitOnlyText,
            fontFamily: exitOnlyConfig.fontFamily,
            wordSpacing: exitOnlyConfig.wordSpacing,
            letterSpacing: exitOnlyConfig.letterSpacing,
            useNumeralFormatting: true,
            numeralFormattingSize: 140,
          });

          if (numArrows === 0) {
            const textElement = textElementBuilder.createElement();
            textElement.style.setProperty(
              "--fontSize",
              exitOnlyConfig.fontSize + "px",
            );
            textElement.className = "SM-ExitOnlyTextElement";
            exitOnlyContainer.appendChild(textElement);
          } else if (
            numArrows === 1 &&
            exitOnlyConfig.exitOnlyTextPosition !== "Center"
          ) {
            // 1 off center
            exitOnlyContainer.appendChild(arrowElement);

            if (textElementBuilder.textContent != "") {
              const textElement = textElementBuilder.createElement();
              textElement.style.setProperty(
                "--fontSize",
                exitOnlyConfig.fontSize + "px",
              );
              textElement.className = "SM-ExitOnlyTextElement";
              exitOnlyContainer.appendChild(textElement);
            }

            exitOnlyContainer.style.setProperty("--arrowJustify", "Center");
            exitOnlyContainer.style.flexDirection =
              exitOnlyConfig.exitOnlyTextPosition === "Left"
                ? "row-reverse"
                : "row";

            if (0 == panel.sign.oSArrow && panel.sign.otherSymbol != "None") {
              const otherSymbolElement = createOtherSymbol(
                panel.sign.otherSymbol,
              );
              if (panel.sign.oSArrowPositioning == "Left") {
                arrowElement.before(otherSymbolElement);
              } else {
                exitOnlyContainer.appendChild(otherSymbolElement);
              }
            }

            if (
              0 == panel.sign.actionMessageArrow &&
              panel.sign.actionMessage != ""
            ) {
              const actionMessage = createOtherSymbol("actionMessage");
              if (panel.sign.actionMessagePositioning == "Left") {
                arrowElement.before(actionMessage);
              } else {
                exitOnlyContainer.appendChild(actionMessage);
              }
            }
          } else if (
            numArrows === 1 &&
            exitOnlyConfig.exitOnlyTextPosition === "Center"
          ) {
            // 1 center
            const spaceIndex = exitOnlyConfig.exitOnlyText.indexOf(" ");
            if (exitOnlyConfig.exitOnlyText != "") {
              textElementBuilder.textContent =
                exitOnlyConfig.exitOnlyText.substring(0, spaceIndex);
              const textElement1 = textElementBuilder.createElement();
              textElement1.style.setProperty(
                "--fontSize",
                exitOnlyConfig.fontSize + "px",
              );
              textElement1.className = "SM-ExitOnlyTextElement";
              exitOnlyContainer.appendChild(textElement1);
            }

            exitOnlyContainer.appendChild(arrowElement.cloneNode(true));

            if (exitOnlyConfig.exitOnlyText != "") {
              textElementBuilder.textContent =
                exitOnlyConfig.exitOnlyText.substring(spaceIndex + 1);
              const textElement2 = textElementBuilder.createElement();
              textElement2.style.setProperty(
                "--fontSize",
                exitOnlyConfig.fontSize + "px",
              );
              textElement2.className = "SM-ExitOnlyTextElement";
              exitOnlyContainer.appendChild(textElement2);
            }

            if (0 == panel.sign.oSArrow && panel.sign.otherSymbol != "None") {
              const otherSymbolElement = createOtherSymbol(
                panel.sign.otherSymbol,
              );
              if (panel.sign.oSArrowPositioning == "Left") {
                arrowElement.before(otherSymbolElement);
              } else {
                exitOnlyContainer.appendChild(otherSymbolElement);
              }
            }

            if (
              0 == panel.sign.actionMessageArrow &&
              panel.sign.actionMessage != ""
            ) {
              const actionMessage = createOtherSymbol("actionMessage");
              if (panel.sign.actionMessagePositioning == "Left") {
                arrowElement.before(actionMessage);
              } else {
                exitOnlyContainer.appendChild(actionMessage);
              }
            }
          } else {
            if (
              standardVariant == "Split Exit Only" &&
              exitOnlyConfig.exitOnlyTextPosition == "Left"
            ) {
              textElementBuilder.textContent = exitOnlyConfig.exitOnlyText;

              const textElement = textElementBuilder.createElement();
              textElement.style.setProperty(
                "--fontSize",
                exitOnlyConfig.fontSize + "px",
              );
              textElement.style.marginRight = `-${exitOnlyConfig.gap - exitOnlyConfig.textGap}rem`;
              textElement.className = "SM-ExitOnlyTextElement";
              exitOnlyContainer.appendChild(textElement);
            }

            if (numArrows % 2 == 0) {
              for (let i = 0; i < numArrows; i++) {
                if (
                  i === Math.floor(numArrows / 2) &&
                  exitOnlyConfig.exitOnlyText != "" &&
                  (standardVariant == "Split Exit Only"
                    ? exitOnlyConfig.exitOnlyTextPosition == "Center"
                    : true)
                ) {
                  textElementBuilder.textContent = exitOnlyConfig.exitOnlyText;

                  const textElement = textElementBuilder.createElement();
                  textElement.style.setProperty(
                    "--fontSize",
                    exitOnlyConfig.fontSize + "px",
                  );

                  textElement.style.marginRight = `-${exitOnlyConfig.gap - exitOnlyConfig.textGap}rem`;
                  textElement.style.marginLeft = `-${exitOnlyConfig.gap - exitOnlyConfig.textGap}rem`;

                  textElement.className = "SM-ExitOnlyTextElement";
                  exitOnlyContainer.appendChild(textElement);
                }
                const arrowClone = arrowElement.cloneNode(true);
                exitOnlyContainer.appendChild(arrowClone);

                if (
                  i == panel.sign.oSArrow &&
                  panel.sign.otherSymbol != "None"
                ) {
                  const otherSymbolElement = createOtherSymbol(
                    panel.sign.otherSymbol,
                  );
                  if (panel.sign.oSArrowPositioning == "Left") {
                    arrowClone.before(otherSymbolElement);
                  } else {
                    arrowClone.after(otherSymbolElement);
                  }
                }

                if (
                  i == panel.sign.actionMessageArrow &&
                  panel.sign.actionMessage != ""
                ) {
                  const actionMessage = createOtherSymbol("actionMessage");
                  actionMessage.style.setProperty(
                    "--fontFamily",
                    `"${exitOnlyConfig.fontFamily}"`,
                  );
                  actionMessage.style.setProperty(
                    "--fontSize",
                    `${exitOnlyConfig.fontSize}px`,
                  );
                  actionMessage.style.setProperty(
                    "--letterSpacing",
                    `"${exitOnlyConfig.letterSpacing}px"`,
                  );
                  actionMessage.style.setProperty(
                    "--wordSpacing",
                    `"${exitOnlyConfig.wordSpacing}px"`,
                  );

                  if (panel.sign.actionMessagePositioning == "Left") {
                    arrowClone.before(actionMessage);
                  } else {
                    arrowClone.after(actionMessage);
                  }
                }
              }
            } else {
              for (let i = 0; i < numArrows; i++) {
                if (
                  (i === Math.floor(numArrows / 2) ||
                    i === Math.floor(numArrows / 2) + 1) &&
                  exitOnlyConfig.exitOnlyText != "" &&
                  (standardVariant == "Split Exit Only"
                    ? exitOnlyConfig.exitOnlyTextPosition == "Center"
                    : true)
                ) {
                  const spaceIndex = exitOnlyConfig.exitOnlyText.indexOf(" ");

                  textElementBuilder.textContent =
                    i === Math.floor(numArrows / 2)
                      ? exitOnlyConfig.exitOnlyText.substring(0, spaceIndex)
                      : exitOnlyConfig.exitOnlyText.substring(spaceIndex + 1);

                  const textElement = textElementBuilder.createElement();
                  textElement.style.setProperty(
                    "--fontSize",
                    exitOnlyConfig.fontSize + "px",
                  );

                  if (i == Math.floor(numArrows / 2)) {
                    textElement.style.marginRight = `-${exitOnlyConfig.gap - exitOnlyConfig.textGap}rem`;
                  } else {
                    textElement.style.marginLeft = `-${exitOnlyConfig.gap - exitOnlyConfig.textGap}rem`;
                  }

                  textElement.className = "SM-ExitOnlyTextElement";
                  exitOnlyContainer.appendChild(textElement);
                }
                const arrowClone = arrowElement.cloneNode(true);
                exitOnlyContainer.appendChild(arrowClone);

                if (
                  i == panel.sign.oSArrow &&
                  panel.sign.otherSymbol != "None"
                ) {
                  const otherSymbolElement = createOtherSymbol(
                    panel.sign.otherSymbol,
                  );
                  if (panel.sign.oSArrowPositioning == "Left") {
                    arrowClone.before(otherSymbolElement);
                  } else {
                    arrowClone.after(otherSymbolElement);
                  }
                }

                if (
                  i == panel.sign.actionMessageArrow &&
                  panel.sign.actionMessage != ""
                ) {
                  const actionMessage = createOtherSymbol("actionMessage");
                  actionMessage.style.setProperty(
                    "--fontFamily",
                    `"${exitOnlyConfig.fontFamily}"`,
                  );
                  actionMessage.style.setProperty(
                    "--fontSize",
                    `${exitOnlyConfig.fontSize}px`,
                  );
                  actionMessage.style.setProperty(
                    "--letterSpacing",
                    `"${exitOnlyConfig.letterSpacing}px"`,
                  );
                  actionMessage.style.setProperty(
                    "--wordSpacing",
                    `${exitOnlyConfig.wordSpacing}px`,
                  );

                  if (panel.sign.actionMessagePositioning == "Left") {
                    arrowClone.before(actionMessage);
                  } else {
                    arrowClone.after(actionMessage);
                  }
                }
              }
            }

            if (
              standardVariant == "Split Exit Only" &&
              exitOnlyConfig.exitOnlyTextPosition == "Right"
            ) {
              textElementBuilder.textContent = exitOnlyConfig.exitOnlyText;

              const textElement = textElementBuilder.createElement();
              textElement.style.setProperty(
                "--fontSize",
                exitOnlyConfig.fontSize + "px",
              );
              textElement.style.marginLeft = `-${exitOnlyConfig.gap - exitOnlyConfig.textGap}rem`;
              textElement.className = "SM-ExitOnlyTextElement";
              exitOnlyContainer.appendChild(textElement);
            }
          }

          if (
            -1 == panel.sign.actionMessageArrow &&
            panel.sign.actionMessage != ""
          ) {
            const actionMessage = createOtherSymbol("actionMessage");
            actionMessage.style.setProperty(
              "--fontFamily",
              `"${exitOnlyConfig.fontFamily}"`,
            );
            actionMessage.style.setProperty(
              "--fontSize",
              `${exitOnlyConfig.fontSize}px`,
            );
            actionMessage.style.setProperty(
              "--letterSpacing",
              `${exitOnlyConfig.letterSpacing}px`,
            );
            actionMessage.style.setProperty(
              "--wordSpacing",
              `${exitOnlyConfig.wordSpacing}px`,
            );

            if (panel.sign.actionMessagePositioning == "Left") {
              exitOnlyContainer.prepend(actionMessage);
            } else {
              exitOnlyContainer.appendChild(actionMessage);
            }
          }

          if (-1 == panel.sign.oSArrow && panel.sign.otherSymbol != "None") {
            const otherSymbolElement = createOtherSymbol(
              panel.sign.otherSymbol,
            );

            if (panel.sign.oSArrowPositioning == "Left") {
              exitOnlyContainer.prepend(otherSymbolElement);
            } else {
              exitOnlyContainer.appendChild(otherSymbolElement);
            }
          }

          if (
            standardVariant == "Split Exit Only" ||
            standardVariant == "Half Exit Only"
          ) {
            arrowContElmt.style.setProperty(
              "--splitHorizontalPadding",
              exitOnlyConfig.splitHorizontalPadding + "rem",
            );
            arrowContElmt.style.setProperty(
              "--splitVerticalPadding",
              exitOnlyConfig.splitVerticalPadding + "rem",
            );
            arrowContElmt.style.setProperty(
              "--splitBorderRadius",
              exitOnlyConfig.splitBorderRadius + "px",
            );
          }

          if (standardVariant == "Split Exit Only") {
            arrowContElmt.style.justifyContent =
              exitOnlyConfig.arrowLocation.toLowerCase();
          }

          if (standardVariant == "Half Exit Only") {
            arrowContElmt.style.flexDirection =
              exitOnlyConfig.arrowLocation == "Left" ? "row" : "row-reverse";
            arrowContElmt.style.gap = exitOnlyConfig.exitOnlyOutsideGap + "rem";

            exitOnlyContainer.style.borderBottomLeftRadius =
              exitOnlyConfig.arrowLocation == "Left"
                ? "calc(var(--signBorderRadius)" +
                  (exitOnlyConfig.borderMode == "White Border" ? " / 2)" : ")")
                : 0;
            exitOnlyContainer.style.borderBottomRightRadius =
              exitOnlyConfig.arrowLocation == "Left"
                ? 0
                : "calc(var(--signBorderRadius)" +
                  (exitOnlyConfig.borderMode == "White Border" ? " / 2)" : ")");

            if (exitOnlyConfig.arrowLocation == "Left") {
              arrowContElmt.style.paddingRight =
                exitOnlyConfig.horizontalPadding + "rem";
              if (exitOnlyConfig.borderMode != "White Border") {
                exitOnlyContainer.style.borderLeft = ".2rem solid black";
                exitOnlyContainer.style.marginLeft = "-.2rem";
              }

              if (
                panel.corner == "Sharp" &&
                exitOnlyConfig.borderMode != "White Border"
              ) {
                guideArrowsHolderElmt.style.background = `linear-gradient(270deg, ${ColorLibrary.colorLibrary[panel.color] || panel.color} 0%, ${ColorLibrary.colorLibrary[panel.color] || panel.color} 49%, ${ColorLibrary.colorLibrary[exitOnlyConfig.backgroundColor] || exitOnlyConfig.backgroundColor} 50%, ${ColorLibrary.colorLibrary[exitOnlyConfig.backgroundColor] || exitOnlyConfig.backgroundColor} 100%)`;
              }
            } else {
              arrowContElmt.style.paddingLeft =
                exitOnlyConfig.horizontalPadding + "rem";
              if (exitOnlyConfig.borderMode != "White Border") {
                exitOnlyContainer.style.borderRight = ".2rem solid black";
                exitOnlyContainer.style.marginRight = "-.2rem";
              }

              if (
                panel.corner == "Sharp" &&
                exitOnlyConfig.borderMode != "White Border"
              ) {
                guideArrowsHolderElmt.style.background = `linear-gradient(90deg, ${ColorLibrary.colorLibrary[panel.color] || panel.color} 0%, ${ColorLibrary.colorLibrary[panel.color] || panel.color} 49%, ${ColorLibrary.colorLibrary[exitOnlyConfig.backgroundColor] || exitOnlyConfig.backgroundColor} 50%, ${ColorLibrary.colorLibrary[exitOnlyConfig.backgroundColor] || exitOnlyConfig.backgroundColor} 100%)`;
              }
            }

            if (exitOnlyConfig.borderMode != "White Border") {
              exitOnlyContainer.style.borderBottom = ".2rem solid black";
              exitOnlyContainer.style.marginBottom = `${-0.2 + -exitOnlyConfig.verticalPadding}rem`;
              arrowContElmt.style.paddingBottom =
                exitOnlyConfig.verticalPadding + "rem";
            } else {
              arrowContElmt.style.paddingTop =
                exitOnlyConfig.verticalPadding + "rem";
            }

            if (
              arrowContElmt.querySelector(".halfExitOnlyOutsideArrow") &&
              exitOnlyContainer.querySelector(".BE-arrowImage")
            ) {
              const outsideArrow = arrowContElmt.querySelector(
                ".halfExitOnlyOutsideArrow",
              );
              const innerArrows =
                exitOnlyContainer.querySelector(".BE-arrowImage");
              outsideArrow.style.top = `${
                (innerArrows.getBoundingClientRect().top -
                  outsideArrow.getBoundingClientRect().top) /
                1 /
                2
              }px`;
            }
          }

          if (
            exitOnlyConfig.roundAllCorners &&
            exitOnlyConfig.borderMode == "White Border"
          ) {
            exitOnlyContainer.style.borderTopLeftRadius =
              "calc(var(--signBorderRadius) / 2)";
            exitOnlyContainer.style.borderTopRightRadius =
              "calc(var(--signBorderRadius) / 2)";
            exitOnlyContainer.style.borderBottomLeftRadius =
              "calc(var(--signBorderRadius) / 2)";
            exitOnlyContainer.style.borderBottomRightRadius =
              "calc(var(--signBorderRadius) / 2)";
          }

          break;
        }
        default: {
          break;
        }
      }
    }

    // redraw exit tab widths
    for (const container of considerWidth.keys()) {
      let width = container.getBoundingClientRect().width / 1;
      container.style.left = `-${width / 2}px`;
      container.style.width = "0";
      container.style.position = "relative";
      container.style.transform = `translateX(${signHolderElmt.getBoundingClientRect().width / 2 / 1}px)`;
    }
  };

  const redraw = () => {
    const panelContainerElmt = document.getElementById("panelContainer");

    // save sign to localstorage
    SavesNTemplates.updateAutoSave(post);
    formHandler.tempResetZoom();

    post.renderPost(
      document.querySelector("#postContainer"),
      document.querySelector("#panelContainer"),
      document.querySelectorAll(".post"),
    );

    panelContainerElmt.innerHTML = "";

    if (post.variant != "Rural" && post.variant != "Center") {
      panelContainerElmt.style.setProperty(
        "--postPanelSpacing",
        post.postPanelSpacing + "rem",
      );
      panelContainerElmt.className = `${post.alignPanels}`;
    }

    let ind = 0;
    for (const panelGroup of post.panels) {
      const panelGroupContainer = document.createElement("div");
      panelGroupContainer.className = "panelGroupContainer";
      panelContainerElmt.appendChild(panelGroupContainer);

      for (const panel of panelGroup) {
        redrawPanel(panel, panelGroupContainer, ind++);
      }
    }

    formHandler.zoom();

    recheckWidth();
    document
      .querySelector("#panel" + getPanels().indexOf(getCurrentPanel()))
      .scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "end",
      });
  };

  const recheckWidth = () => {
    let minTop = Infinity;
    let maxBottom = 0;
    document.querySelector("#smRender").style.height = "";
    const renderRect = document
      .querySelector("#smRender")
      .getBoundingClientRect();

    for (const panelGroupContainer of document.querySelectorAll(
      ".panelGroupContainer",
    )) {
      minTop = Math.min(
        minTop,
        panelGroupContainer.getBoundingClientRect().top - renderRect.top,
      );
      maxBottom = Math.max(
        maxBottom,
        panelGroupContainer.getBoundingClientRect().top +
          panelGroupContainer.getBoundingClientRect().height -
          renderRect.top,
      );
    }

    if (minTop == Infinity) minTop = 0;

    document.querySelector("#smRender").style.height =
      Math.max(
        (maxBottom - minTop) * 1.5,
        document.querySelector("#postContainer").getBoundingClientRect().height,
      ) + "px";

    if (
      document.querySelector("#smRender").scrollWidth >
      document.documentElement.clientWidth
    ) {
      document.querySelector("#smRender").classList.add("wide");
    } else {
      document.querySelector("#smRender").classList.remove("wide");
    }
  };

  const getPost = () => {
    return post;
  };

  const getPanels = () => {
    return post.panels.flat();
  };

  const setPost = (newPost) => {
    post = newPost;
    if (post.panels.length > 0 && !Array.isArray(post.panels[0])) {
      post.panels = post.panels.map((panel) => [panel]);
    }
  };

  const resetSelectors = () => {
    currentlySelectedPanelGroupIndex = clamp(
      currentlySelectedPanelGroupIndex,
      0,
      post.panels.length - 1,
    );
    currentlySelectedPanelIndex =
      clamp(
        currentlySelectedPanelIndex,
        0,
        post.panels[currentlySelectedPanelGroupIndex]?.length - 1,
      ) || 0;
    currentlySelectedSubPanelIndex = 0;
    currentlySelectedExitTabRowIndex = -1;
    currentlySelectedExitTabIndex = -1;
    currentlySelectedRowIndex = 0;
    currentlySelectedBlockIndex = 0;
    currentlySelectedGroupIndex = -1;
    currentlySelectedShieldGroupId = -1;
    currentlySelectedShieldIndex = -1;
    currentlySelectedStandardArrow = -1;
    ColorLibrary.updateDefaultColors();
  };

  // i guess w ai efficiency :sob:
  // well i mean it's future proofing
  const getHistoryVars = () => {
    return {
      currentlySelectedPanelIndex,
      currentlySelectedPanelGroupIndex,
      currentlySelectedSubPanelIndex,
      currentlySelectedExitTabRowIndex,
      currentlySelectedExitTabIndex,
      currentlySelectedRowIndex,
      currentlySelectedBlockIndex,
      currentlySelectedGroupIndex,
      currentlySelectedShieldGroupId,
      currentlySelectedShieldIndex,
      currentlySelectedStandardArrow,
    };
  };

  const setHistoryVars = (historyVars = {}) => {
    if (typeof historyVars.currentlySelectedPanelIndex === "number") {
      currentlySelectedPanelIndex = historyVars.currentlySelectedPanelIndex;
    }
    if (typeof historyVars.currentlySelectedPanelGroupIndex === "number") {
      currentlySelectedPanelGroupIndex =
        historyVars.currentlySelectedPanelGroupIndex;
    }
    if (typeof historyVars.currentlySelectedSubPanelIndex === "number") {
      currentlySelectedSubPanelIndex =
        historyVars.currentlySelectedSubPanelIndex;
    }
    if (typeof historyVars.currentlySelectedExitTabRowIndex === "number") {
      currentlySelectedExitTabRowIndex =
        historyVars.currentlySelectedExitTabRowIndex;
    }
    if (typeof historyVars.currentlySelectedExitTabIndex === "number") {
      currentlySelectedExitTabIndex = historyVars.currentlySelectedExitTabIndex;
    }
    if (typeof historyVars.currentlySelectedRowIndex === "number") {
      currentlySelectedRowIndex = historyVars.currentlySelectedRowIndex;
    }
    if (typeof historyVars.currentlySelectedBlockIndex === "number") {
      currentlySelectedBlockIndex = historyVars.currentlySelectedBlockIndex;
    }
    if (typeof historyVars.currentlySelectedGroupIndex === "number") {
      currentlySelectedGroupIndex = historyVars.currentlySelectedGroupIndex;
    }
    if (typeof historyVars.currentlySelectedShieldGroupId === "number") {
      currentlySelectedShieldGroupId =
        historyVars.currentlySelectedShieldGroupId;
    }
    if (typeof historyVars.currentlySelectedShieldIndex === "number") {
      currentlySelectedShieldIndex = historyVars.currentlySelectedShieldIndex;
    }
    if (typeof historyVars.currentlySelectedStandardArrow === "number") {
      currentlySelectedStandardArrow =
        historyVars.currentlySelectedStandardArrow;
    }
  };

  window.addEventListener("resize", () => {
    requestAnimationFrame(recheckWidth);
  });

  return {
    init,
    newPanel,
    newPanelGroup,
    duplicatePanel,
    deletePanel,
    deletePanelGroup,
    deletePanelHelper,
    changeEditingPanel,
    changeEditingPanelGroup,
    newShield,
    duplicateShield,
    deleteShield,
    groupShields,
    removeShieldFromGroup,
    removeShieldGroup,
    addSubPanel,
    removeSubPanel,
    changeEditingSubPanel,
    duplicateSubPanel,
    newExitTabRow,
    removeExitTabRow,
    duplicateExitTabRow,
    newExitTab,
    deleteExitTab,
    duplicateExitTab,
    changeEditingExitTabRow,
    changeEditingExitTab,
    getPost,
    getPanels,
    setPost,
    getHistoryVars,
    setHistoryVars,

    newRow,
    dupRow,
    delRow,
    newControlElem,
    delControlElem,
    duplicateControlElem,
    replaceControlElem,

    recheckWidth,
    newShieldGroup,
    setSelectedControlElem,
    setSelectedRow,

    getCurrentPanel,
    getCurrentSubPanel,
    getCurrentBlockRow,
    getCurrentBlockElem,
    changeCurrentlyEditingShieldGroup,
    setSelectedShieldId,
    redraw,

    addAPLArrow,
    removeAPLArrow,
    setSelectedStandardArrow,
    addStandardArrow,
    removeStandardArrow,
    moveStandardArrow,
    duplicateStandardArrow,

    getSelectedBlockGroup,
    getParentOfSelectedBlockGroup,
    setSelectedBlockGroup,
    getCurrentBlockElements,
    getGroupNumFromElem,
    resetSelectors,

    vars: {
      get currentlySelectedPanelIndex() {
        return currentlySelectedPanelIndex;
      },
      get currentlySelectedPanelGroupIndex() {
        return currentlySelectedPanelGroupIndex;
      },
      get currentlySelectedSubPanelIndex() {
        return currentlySelectedSubPanelIndex;
      },
      get currentlySelectedExitTabRowIndex() {
        return currentlySelectedExitTabRowIndex;
      },
      get currentlySelectedExitTabIndex() {
        return currentlySelectedExitTabIndex;
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
      get currentlySelectedStandardArrow() {
        return currentlySelectedStandardArrow;
      },
      get currentlySelectedGroupIndex() {
        return currentlySelectedGroupIndex;
      },
    },
  };
})();
