// Constants
const App = (() => {
  let post = {};
  let currentlySelectedPanelIndex = -1;
  let currentlySelectedSubPanelIndex = 0;

  let currentlySelectedExitTabRowIndex = -1;
  let currentlySelectedExitTabIndex = -1;

  let currentlySelectedRowIndex = 0,
    currentlySelectedBlockIndex = 0;

  let currentlySelectedShieldGroupId = -1;
  let currentlySelectedShieldIndex = -1;
  let currentlySelectedStandardArrow = 0;

  // Glboal Acessor Methods
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

  const init = async () => {
    post = new Post(Post.prototype.polePositions[0]);
    formHandler.init(App);
    DiagramDrawing.init(App);

    window.customShields = new CustomShields();
    await window.customShields.initialized;

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
          let currentBlockRows = getCurrentSubPanel().blockElements.rows;
          currentBlockRows.splice(
            newRowIndex,
            0,
            currentBlockRows.splice(oldRowIndex, 1)[0],
          );

          currentlySelectedRowIndex = Math.max(newRowIndex, 0);
        } else {
          let currentBlockRows = getCurrentSubPanel().blockElements.rows;
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
              currentBlockRows[newRowIndex].length - 1,
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
      ".panelListButton",
      "vertical",
      (oldPanelIndex, newPanelIndex) => {
        post.panels.splice(
          newPanelIndex,
          0,
          post.panels.splice(oldPanelIndex, 1)[0],
        );
        currentlySelectedPanelIndex = Math.max(newPanelIndex, 0);

        formHandler.updateForm();
        redraw();
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
        console.log(oldShieldIndex, newShieldIndex, callbackResults);
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

        console.log(oldShieldIndex, newShieldIndex);

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
        callbackElements: (dragElement, lastActiveBox) => {
          return { dragElement: dragElement };
        },
      },
    );

    newPanel();
  };

  // Panels
  const newPanel = () => {
    post.newPanel();
    currentlySelectedPanelIndex = post.panels.length - 1;
    formHandler.updateForm();
    redraw();
  };

  const duplicatePanel = () => {
    post.duplicatePanel(currentlySelectedPanelIndex);
    currentlySelectedPanelIndex++;
    formHandler.updateForm();
    redraw();
  };

  const deletePanel = () => {
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

  const changeEditingPanel = (panelNumber) => {
    currentlySelectedPanelIndex = clamp(panelNumber, 0, post.panels.length - 1);
    currentlySelectedSubPanelIndex = 0;
    formHandler.updateForm();
  };

  const addSubPanel = () => {
    const sign = getCurrentPanel().sign;
    sign.newSubPanel();
    currentlySelectedSubPanelIndex++;

    currentlySelectedRowIndex = clamp(
      currentlySelectedRowIndex,
      0,
      getCurrentSubPanel().blockElements.rows.length - 1,
    );
    currentlySelectedBlockIndex = clamp(
      currentlySelectedBlockIndex,
      0,
      getCurrentBlockRows().length - 1,
    );
    currentlySelectedShieldIndex = -1;
    currentlySelectedShieldGroupId = -1;

    formHandler.updateForm();
    redraw();
  };

  const removeSubPanel = () => {
    const sign = getCurrentPanel().sign;
    if (sign.subPanels.length > 1) {
      sign.deleteSubPanel(sign.subPanels.length - 1);
      currentlySelectedSubPanelIndex = Math.max(0, currentlySelectedSubPanelIndex - 1);

      currentlySelectedRowIndex = clamp(
        currentlySelectedRowIndex,
        0,
        getCurrentSubPanel().blockElements.rows.length - 1,
      );
      currentlySelectedBlockIndex = clamp(
        currentlySelectedBlockIndex,
        0,
        getCurrentBlockRows().length - 1,
      );
      currentlySelectedShieldIndex = -1;
      currentlySelectedShieldGroupId = -1;

      formHandler.updateForm();
      redraw();
    }
  };

  const duplicateSubPanel = () => {
    const sign = getCurrentPanel().sign;
    sign.duplicateSubPanel(currentlySelectedSubPanelIndex);
    currentlySelectedSubPanelIndex++;
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
      getCurrentBlockRows().length - 1,
    );
    currentlySelectedShieldIndex = -1;
    currentlySelectedShieldGroupId = -1;

    formHandler.updateForm();
  };

  // Exit Tabs
  const newExitTabRow = () => {
    const panel = getCurrentPanel();
    panel.newExitTabRow();

    currentlySelectedExitTabRowIndex = panel.exitTabs.length - 1;
    currentlySelectedExitTabIndex = -1;

    formHandler.updateForm();
    redraw();
  };

  const duplicateExitTabRow = () => {
    const panel = getCurrentPanel();
    panel.duplicateExitTabRow(currentlySelectedExitTabRowIndex);
    currentlySelectedExitTabRowIndex++;

    formHandler.updateForm();
    redraw();
  };

  const removeExitTabRow = () => {
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
    const panel = getCurrentPanel();
    const exitTabRow = panel.exitTabs[currentlySelectedExitTabRowIndex];
    exitTabRow.newExitTab("right");

    currentlySelectedExitTabIndex = exitTabRow.exitTabs.length - 1;
    formHandler.updateForm();
    redraw();
  };

  const deleteExitTab = () => {
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

  const replaceControlElem = (selectedElem) => {
    const blockElems = getCurrentSubPanel().blockElements;
    blockElems.replaceElement(
      Control.prototype.blockToClassElems[selectedElem],
      currentlySelectedRowIndex,
      currentlySelectedBlockIndex,
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
      currentlySelectedRowIndex = Math.max(0, currentlySelectedRowIndex - 1);
      currentlySelectedBlockIndex = Math.max(
        0,
        getCurrentBlockRows().length - 1,
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

  const setSelectedControlElem = (block) => {
    currentlySelectedBlockIndex = clamp(
      block,
      0,
      getCurrentBlockRows().length - 1,
    );

    formHandler.updateForm();
  };

  // Shield Groups
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
      currentlySelectedRowIndex = 0;
      blockElems.addRow(0, "ShieldGroupElement");
    } else if (firstRow && hasOnlyShieldGroups) {
      getCurrentSubPanel().blockElements.addElement(
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
    const blockElems = getCurrentSubPanel().blockElements;
    for (let i = 0; i < blockElems.rows.length; i++) {
      for (let j = 0; j < blockElems.rows[i].length; j++) {
        const block = blockElems.rows[i][j];
        if (block.constructor.name === "ShieldGroupElement" && id == newId) {
          console.log(i, j, id);
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
      shieldIndex >= 0
    ) {
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

    getCurrentPanel().sign.newAPL(subpanelIndex);
    formHandler.updateGuideArrowsSubform();
    redraw();
  };

  const removeAPLArrow = (subpanelIndex, aplIndex) => {
    const arrow = getCurrentPanel().sign.arrows;
    if (arrow.arrowMode != "apl") {
      return;
    }

    getCurrentPanel().sign.deleteAPL(subpanelIndex, aplIndex);
    formHandler.updateGuideArrowsSubform();
    redraw();
  };

  const setSelectedStandardArrow = (arrowIndex) => {
    currentlySelectedStandardArrow = Math.max(arrowIndex, 0);
  };

  const addStandardArrow = () => {
    const standardArrow = getCurrentPanel().sign.arrows.standard;
    getCurrentPanel().sign.newStandardArrow();
    currentlySelectedStandardArrow = standardArrow.arrowList.length - 1;
    formHandler.updateGuideArrowsSubform();
    redraw();
  };

  const removeStandardArrow = () => {
    const standardArrow = getCurrentPanel().sign.arrows.standard;
    getCurrentPanel().sign.deleteStandardArrow(currentlySelectedStandardArrow);
    currentlySelectedStandardArrow = Math.min(
      currentlySelectedStandardArrow,
      Math.max(standardArrow.arrowList.length - 1, 0),
    );
    formHandler.updateGuideArrowsSubform();
    redraw();
  };

  const moveStandardArrow = (oldIndex, newIndex) => {
    getCurrentPanel().sign.moveStandardArrow(oldIndex, newIndex);
    currentlySelectedStandardArrow = newIndex;
    formHandler.updateGuideArrowsSubform();
    redraw();
  };

  const resetPadding = () => {
    getCurrentPanel().sign.padding = "0.3rem 0.75rem 0.3rem 0.75rem";

    document.getElementById("paddingTop").value = 0.3;
    document.getElementById("paddingRight").value = 0.75;
    document.getElementById("paddingBottom").value = 0.3;
    document.getElementById("paddingLeft").value = 0.75;

    formHandler.updateForm();
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
        lib.colors[panel.color] || panel.color.toLowerCase(),
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
      }

      const blockElement = subPanel.blockElements.createElement(
        panel,
        subPanel,
      );
      blockElement.style.justifyContent = subPanel.verticalAlign.toLowerCase();
      signContentContainerElmt.appendChild(blockElement);
      signContentContainerElmt.style.padding = panel.sign.padding;
      subpanelList.push(signContentContainerElmt);

      if (subPanelIndex < panel.sign.subPanels.length - 1) {
        const subDivider = document.createElement("div");
        subDivider.className = "subDivider";
        if (subPanel.dividerHeight && subPanel.dividerHeightUnit == "rem") {
          subDivider.style.height =
            subPanel.dividerHeight + subPanel.dividerHeightUnit;
        } else if (
          subPanel.dividerHeight &&
          subPanel.dividerHeightUnit == "%"
        ) {
          subDivider.style.height = `${
            (signContentContainerElmt.getBoundingClientRect().height /
              formHandler.vars.zoomLevel) *
            (subPanel.dividerHeight / 100)
          }px`;
        }

        dividerList.push(subDivider);

        if (
          panel.sign.arrows.arrowMode == "apl" &&
          panel.sign.lanePanelSize > 0 &&
          panel.sign.arrows.apl.subpanels[subPanelIndex - 0.5] &&
          panel.sign.arrows.apl.subpanels[subPanelIndex - 0.5].length > 0
        ) {
          subDivider.style.margin = `0 ${panel.sign.lanePanelSize / 2}px`;
        }

        signHolderElmt.appendChild(subDivider);
      }
    }

    return [subpanelList, dividerList];
  };

  const redrawPanel = (panel, panelContainerElmt, index) => {
    const panelElmt = document.createElement("div");
    panelElmt.className = `panel ${panel.color.toLowerCase()} ${panel.corner.toLowerCase()}`;
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

    guideArrowsElmt.className = `guideArrows ${panel.sign.arrows.arrowMode.toLowerCase()} ${panel.sign.arrowPosition.toLowerCase()} ${
      panel.sign.arrows.arrowMode.toLowerCase() == "standard"
        ? panel.sign.arrows.standard.variant
            .toLowerCase()
            .replace("/", "-")
            .replace(" ", "_")
            .toLowerCase()
        : ""
    }`;
    guideArrowsHolderElmt.appendChild(guideArrowsElmt);

    const sideLeftArrowElmt = document.createElement("img");
    sideLeftArrowElmt.className = "sideLeftArrow";
    sideLeftArrowElmt.src = "assets/arrows/A-4.svg";
    signHolderElmt.appendChild(sideLeftArrowElmt);

    const sideRightArrowElmt = document.createElement("img");
    sideRightArrowElmt.className = "sideRightArrow";
    sideRightArrowElmt.src = "assets/arrows/A-4.svg";

    signCont.appendChild(exitTabContainerTop);
    signCont.appendChild(exitTabContainerLeft);
    signCont.appendChild(exitTabContainerRight);
    signCont.appendChild(signElmt);
    signCont.appendChild(guideArrowsHolderElmt);
    signCont.appendChild(exitTabContainerBottom);

    if (exitTabContainerWithin.innerHTML != "") {
      signHolderElmt.style.paddingTop =
        exitTabContainerWithin.offsetHeight + "px";
      signHolderElmt.style.minWidth = exitTabContainerWithin.offsetWidth + "px";
    }

    const [subpanelList, dividerList] = redrawSubPanels(panel, signHolderElmt);

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

      const zoomScale = formHandler.vars.zoomLevel;
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
      let autoJustify = panel.sign.lanePanelSize == 0;

      guideArrowsElmt.style.setProperty(
        "--horizontalPadding",
        arrowVariant.horizontalPadding + "rem",
      );
      guideArrowsElmt.style.setProperty(
        "--verticalTopPadding",
        arrowVariant.verticalTopPadding + "rem",
      );
      guideArrowsElmt.style.setProperty(
        "--verticalBottomPadding",
        arrowVariant.verticalBottomPadding + "rem",
      );

      let dividerElements = [];
      let arrowElements = [];

      for (let i = 0; i <= subpanelList.length - 1; i += 0.5) {
        let aplArrows = arrowVariant.subpanels[i] || [];
        let subpanel = i % 1 == 0 && subpanelList[i];
        const aplHolder = document.createElement("div");
        if (i % 1 == 0) {
          aplHolder.className =
            "sMGA_APLHolder " +
            ((arrowVariant.subpanelConfigs[i] &&
              arrowVariant.subpanelConfigs[i].justify) ||
              "left") +
            " " +
            (autoJustify && i % 1 == 0 ? "auto" : "");
        } else {
          aplHolder.className =
            "sMGA_APLHolder center " +
            (autoJustify && i % 1 == 0 ? "auto" : "");
          aplHolder.style.width = "0";
        }

        let pair = [];
        let ind = 0;
        for (const arrow of aplArrows) {
          const arrowElmt = arrow.createElement();
          if (!autoJustify) {
            arrowElmt.style.width = panel.sign.lanePanelSize + "px";
          }

          aplHolder.appendChild(arrowElmt);

          pair[ind++] = arrowElmt;
          if (ind == 2) {
            arrowElements.push(pair);
            pair = [];
            ind = 0;
          }
        }

        if (subpanel) {
          aplHolder.style.width = `max-content`;
          aplHolder.style.minWidth = `${subpanel.getBoundingClientRect().width / formHandler.vars.zoomLevel}px`;
        } else {
          if (autoJustify && aplArrows.length > 0) {
            dividerElements.push(aplHolder);
          } else if (aplArrows.length > 0) {
            aplHolder.style.width = panel.sign.lanePanelSize + "px";
          }
        }
        guideArrowsElmt.appendChild(aplHolder);
      }

      for (let i = 0; i < dividerElements.length; i++) {
        const holder = dividerElements[i];
        const divider = dividerList[i];
        holder.style.marginLeft = `${(divider.getBoundingClientRect().left - holder.getBoundingClientRect().left) / formHandler.vars.zoomLevel}px`;
      }
    }

    if (arrows.arrowMode == "standard") {
      const standardArrowConfig = panel.sign.arrows.standard;
      const standardVariant = standardArrowConfig.variant;
      const exitOnlyConfigs = standardArrowConfig.exitOnlyConfigs;
      const ExitKeys = ["EA", "EB", "EC"];
      const MainKeys = ["A", "B", "C", "D", "E"];
      let path;

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

      const standardArrowList = panel.sign.arrows.standard.arrowList;
      let standardArrowIndex = 0;
      const createArrowElmt = () => {
        const arrow = standardArrowList[standardArrowIndex++];
        return arrow.createElement();
      };

      if (
        panel.sign.arrowPosition == "Left" &&
        standardVariant !== "Exit Only" &&
        standardVariant !== "Side Left" &&
        standardVariant !== "Side Right" &&
        standardVariant !== "Half Exit Only"
      ) {
        arrowContElmt.style.justifyContent = "left";
      } else if (panel.sign.arrowPosition == "Middle") {
        arrowContElmt.style.cssFloat = "none";
      } else if (
        panel.sign.arrowPosition == "Right" &&
        standardVariant !== "Exit Only" &&
        standardVariant !== "Side Left" &&
        standardVariant !== "Side Right" &&
        standardVariant !== "Half Exit Only"
      ) {
        arrowContElmt.style.justifyContent = "right";
      }

      if (standardVariant.includes("Exit Only")) {
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
          "--exitOnlyLineHeight",
          exitOnlyConfigs.lineHeight + "%",
        );

        const hideExitOnlyArrows = exitOnlyConfigs.hideArrow === true;
        arrowContElmt.classList.toggle("hideExitOnlyArrows", hideExitOnlyArrows);

        if (
          !post.secondExitOnly &&
          standardVariant !== "Split Exit Only" &&
          standardVariant !== "Half Exit Only"
        ) {
          guideArrowsElmt.style.padding = `${exitOnlyConfigs.verticalPadding}rem ${exitOnlyConfigs.horizontalPadding}rem`;
        }

        const centerText = (exitOnlyConfigs.exitOnlyText || "EXIT ONLY").trim();
        const centerIndex = Math.floor(standardArrowList.length / 2);

        for (let arrowIndex = 0; arrowIndex < standardArrowList.length; arrowIndex++) {
          if (
            arrowIndex === centerIndex &&
            standardArrowList.length % 2 !== 0 &&
            centerText
          ) {
            const label = document.createElement("span");
            label.className = "exitOnlyText";
            label.textContent = centerText;
            arrowContElmt.appendChild(label);
          }

          const arrowElement = createArrowElmt();
          if (arrowElement) {
            arrowContElmt.appendChild(arrowElement);
          }

          if (
            arrowIndex === centerIndex &&
            standardArrowList.length % 2 === 0 &&
            centerText
          ) {
            const label = document.createElement("span");
            label.className = "exitOnlyText";
            label.textContent = centerText;
            arrowContElmt.appendChild(label);
          }
        }
      } else if (standardVariant === "Side Left") {
        sideLeftArrowElmt.style.display = "block";
      } else if (standardVariant === "Side Right") {
        sideRightArrowElmt.style.display = "block";
      } else if (standardVariant !== "None") {
        signElmt.style.borderBottomLeftRadius = "0";
        signElmt.style.borderBottomRightRadius = "0";
        signElmt.style.borderBottomWidth = "0";
        signElmt.style.width = "100%";
        guideArrowsElmt.style.display = "block";
        guideArrowsElmt.style.visibility = "visible";

        for (const arrow of standardArrowList) {
          const arrowElement = arrow.createElement();
          arrowContElmt.appendChild(arrowElement);
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
    }

    // redraw exit tab widths
    for (const container of considerWidth.keys()) {
      let width =
        container.getBoundingClientRect().width / formHandler.vars.zoomLevel;
      container.style.left = `-${width / 2}px`;
      container.style.width = "0";
      container.style.position = "relative";
      container.style.transform = `translateX(${signHolderElmt.getBoundingClientRect().width / 2 / formHandler.vars.zoomLevel}px)`;
    }
  };

  const redraw = () => {
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

    let ind = 0;
    for (const panel of post.panels) {
      redrawPanel(panel, panelContainerElmt, ind++);
    }

    recheckWidth();
    document
      .querySelector("#panel" + currentlySelectedPanelIndex)
      .scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "end",
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

  const getPost = () => {
    return post;
  };

  const setPost = (newPost) => {
    post = newPost;
    if (!post) {
      return;
    }

    currentlySelectedPanelIndex = 0;
    formHandler.updateForm();
    redraw();
  };

  return {
    init,
    newPanel,
    duplicatePanel,
    deletePanel,
    changeEditingPanel,
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
    resetPadding,
    newExitTabRow,
    removeExitTabRow,
    duplicateExitTabRow,
    newExitTab,
    deleteExitTab,
    duplicateExitTab,
    changeEditingExitTabRow,
    changeEditingExitTab,
    getPost,
    setPost,

    newRow,
    dupRow,
    delRow,
    newControlElem,
    delControlElem,
    replaceControlElem,

    recheckWidth,
    newShieldGroup,
    setSelectedControlElem,
    setSelectedRow,

    getCurrentPanel,
    getCurrentSubPanel,
    getCurrentBlockRows,
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

    vars: {
      get currentlySelectedPanelIndex() {
        return currentlySelectedPanelIndex;
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
    },
  };
})();
