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
    formHandler.updateForm();
    redraw();
  };

  // Create a new nested exit tab within the parent exit tab.
  const newNestExitTab = function () {
    const exitTab = getCurrentPanel().exitTabs[currentlySelectedExitTabIndex];
    exitTab.nestExitTab();
    currentlySelectedNestedExitTabIndex = exitTab.nestedExitTabs.length - 1;
    formHandler.updateForm();
    redraw();
  };

  // Create a duplicate of the exit tab.
  const duplicateExitTab = function (exitTabIndex) {
    const panel = getCurrentPanel();
    panel.duplicateExitTab(exitTabIndex);
    currentlySelectedExitTabIndex++;
    formHandler.updateForm();
    redraw();
  };

  // Delete the exit tab.
  const removeExitTab = function (exitTabIndex) {
    const panel = getCurrentPanel();
    panel.deleteExitTab(exitTabIndex);
    currentlySelectedExitTabIndex--;
    formHandler.updateForm();
    redraw();
  };

  // Delete the exit tab within the parent exitTab
  const deleteNestExitTab = function (nestExitTabIndex) {
    const exitTab = getCurrentPanel().exitTabs[currentlySelectedExitTabIndex];
    exitTab.deleteNestExitTab(nestExitTabIndex);
    currentlySelectedNestedExitTabIndex--;
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
    getCurrentPanel().sign.padding = "0.5rem 0.75rem 0.5rem 0.75rem";

    document.getElementById("paddingTop").value = 0.5;
    document.getElementById("paddingRight").value = 0.75;
    document.getElementById("paddingBottom").value = 0.5;
    document.getElementById("paddingLeft").value = 0.75;

    formHandler.updateForm();
    redraw();
  };

  /**
   * Redraw the panels on the post.
   */

  const redraw = function () {
    const postContainerElmt = document.getElementById("postContainer");

    postContainerElmt.className = `polePosition${post.polePosition}`;

    // post

    if (post.showPost == true) {
      var item = document.getElementsByClassName("post");
      for (let i = 0; i < item.length; i++) {
        item[i].style.visibility = "hidden";
      }

      const panelContainer = document.getElementById("panelContainer");

      panelContainer.style.background = "none";
    } else {
      var item = document.getElementsByClassName("post");
      for (let i = 0; i < item.length; i++) {
        if (post.polePosition.toLowerCase() != "overhead") {
          if (post.polePosition.toLowerCase() == "left") {
            item[0].style.visibility = "visible";
            item[1].style.visibility = "hidden";
          } else if (post.polePosition.toLowerCase() == "right") {
            item[0].style.visibility = "hidden";
            item[1].style.visibility = "visible";
          } else if (
            post.polePosition.toLowerCase() == "center" ||
            post.polePosition.toLowerCase() == "rural"
          ) {
            //hide both
            item[0].style.visibility = "hidden";
            item[1].style.visibility = "hidden";
          }
        } else {
          item[i].style.visibility = "visible";
        }
      }

      const panelContainer = document.getElementById("panelContainer");

      if (post.polePosition.toLowerCase() == "center") {
        panelContainer.style.background =
          "linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 45%,rgba(191,191,191,1) 45%,rgba(240,240,240,1) 49%,rgba(128,128,128,1) 55%,rgba(255,255,255,0) 55%)";
      } else if (post.polePosition.toLowerCase() == "rural") {
        panelContainer.style.background =
          "linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 20%,rgba(191,191,191,1) 20%,rgba(240,240,240,1) 22%,rgba(128,128,128,1) 25%,rgba(255,255,255,0) 25%,rgba(255,255,255,0) 75%,rgba(191,191,191,1) 75%,rgba(240,240,240,1) 77%,rgba(128,128,128,1) 80%,rgba(255,255,255,0) 80%)";
      } else {
        panelContainer.style.background =
          "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 47%, rgba(191,191,191,1) 47%, rgba(240,240,240,1) 49%, rgba(128,128,128,1) 52%, rgba(255,255,255,0) 52%, rgba(255,255,255,0) 64%, rgba(191,191,191,1) 64%, rgba(240,240,240,1) 66%, rgba(128,128,128,1) 69%, rgba(255,255,255,0) 69%";
      }
    }

    const panelContainerElmt = document.getElementById("panelContainer");
    lib.clearChildren(panelContainerElmt);

    var index = -1;
    var firstExitTab = null;

    for (const panel of post.panels) {
      index++;

      const panelElmt = document.createElement("div");
      panelElmt.className = `panel ${panel.color.toLowerCase()} ${panel.corner.toLowerCase()}`;
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

          if (exitTab.FHWAFont) {
            exitTabElmt.style.fontFamily = "Series E";
          }

          if (
            exitTab.number ||
            exitTab.showLeft ||
            exitTab.variant != "Default"
          ) {
            if (exitTab.variant == "Default") {
              const leftElmt = document.createElement("div");

              if (exitTab.showLeft) {
                leftElmt.className = `yellowElmt`;
                leftElmt.appendChild(document.createTextNode("LEFT"));
                exitTabElmt.appendChild(leftElmt);
                exitTabElmt.style.display = "inline-block";

                if (exitTab.number) {
                  leftElmt.style.marginRight = "0.4rem";
                }
              }

              const txtArr = exitTab.number.toUpperCase().split(/(\d+\S*)/);
              const divTextElmt = document.createElement("div");
              divTextElmt.appendChild(document.createTextNode(txtArr[0]));
              exitTabElmt.appendChild(divTextElmt);

              if (txtArr.length > 1) {
                divTextElmt.className = "exitFormat";
                const spanNumeralElmt = document.createElement("span");
                spanNumeralElmt.className = "numeral";
                spanNumeralElmt.appendChild(document.createTextNode(txtArr[1]));
                exitTabElmt.appendChild(spanNumeralElmt);
                exitTabElmt.appendChild(
                  document.createTextNode(txtArr.slice(2).join(""))
                );
                if (exitTab.topOffset == false) {
                  divTextElmt.style.top = "0rem";
                }
              }
            } else if (exitTab.variant == "Toll") {
              let tollAuthority = exitTab.icon;

              if (exitTab.useTextBasedIcon) {
                const tagElement = document.createElement("span");
                tagElement.textContent = tollAuthority.toUpperCase();
                tagElement.className = "tagText";

                const onlyElement = document.createElement("span");
                onlyElement.textContent = "ONLY";
                onlyElement.className = "tagOnlyText";

                exitTabElmt.appendChild(tagElement);
                exitTabElmt.appendChild(onlyElement);
              }
            } else if (exittab.variant == "Icon") {
            } else if (exitTab.variant == "Full Left") {
            } else if (exitTab.variant == "HOV 1") {
            } else if (exitTab.variant == "HOV 2") {
            }

            exitTabElmt.style.visibility = "visible";
            exitTabCont.className += " tabVisible";

            if (post.fontType == true) {
              exitTabElmt.style.fontFamily = "Series E";
            }

            const cornerRadius = exitTab.squareCorners ? "0.25rem" : "0.5rem";

            if (exitTab.fullBorder == true) {
              exitTabElmt.style.borderBottomWidth =
                exitTab.borderThickness.toString() + "rem";
              exitTabElmt.style.borderBottomStyle = "solid";
              exitTabElmt.style.borderRadius = cornerRadius;
            } else {
              exitTabElmt.style.borderBottomWidth = "";
              exitTabElmt.style.borderBottomStyle = "";
              exitTabElmt.style.borderRadius = "";
            }

            exitTabElmt.style.borderTopWidth =
              exitTab.borderThickness.toString() + "rem";
            exitTabElmt.style.borderLeftWidth =
              exitTab.borderThickness.toString() + "rem";
            exitTabElmt.style.borderRightWidth =
              exitTab.borderThickness.toString() + "rem";
            exitTabElmt.style.fontSize = exitTab.fontSize.toString() + "px";

            exitTabElmt.style.minHeight = exitTab.minHeight.toString() + "rem";
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
            toElmt.style.fontFamily = "Series E";
            bannerElmt.style.fontFamily = "Series E";
            bannerElmt2.style.fontFamily = "Series E";
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
            p.style.fontFamily = "Series E";
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
        g_controlTextElmt.style.fontFamily = "Series EM";
      }

      monitorControlText(panel.sign, g_controlTextElmt);

      const g_actionMessageElmt = document.createElement("div");
      g_actionMessageElmt.className = `actionMessage`;

      if (post.fontType) {
        g_actionMessage.className = "Series E";
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
          const subDivider = document.createElement("div");
          subDivider.className = "subDivider";
          subDivider.id = "subDivider" + subPanelIndex.toString();
          subDivider.style.height = panel.sign.subPanels[subPanelIndex].height;
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

          downArrowElmt.src = "img/arrows/" + key + ".svg";
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
        if (
          !post.secondExitOnly &&
          panel.sign.guideArrow != "Split Exit Only"
        ) {
          guideArrowsElmt.style.padding = panel.sign.exitOnlyPadding + "rem";
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

          if (
            post.secondExitOnly &&
            panel.sign.guideArrow != "Split Exit Only"
          ) {
            path.style.padding = panel.sign.exitOnlyPadding + "rem";
          }
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
              arrowContElmt.style.justifyContent = "space-between";
              arrowContElmt.style.gap = "5rem";
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
            const exitOnlyLabelFull =
              typeof panel.sign.exitOnlyLabelPreset === "string" &&
              panel.sign.exitOnlyLabelPreset.trim().length > 0
                ? panel.sign.exitOnlyLabelPreset.trim().toUpperCase()
                : "EXIT ONLY";
            const exitOnlyLabelParts = exitOnlyLabelFull.split(/\s+/);
            const exitOnlyLabelLeft =
              exitOnlyLabelParts[0] && exitOnlyLabelParts[0].length > 0
                ? exitOnlyLabelParts[0]
                : "EXIT";
            const exitOnlyLabelRight =
              exitOnlyLabelParts.length > 1
                ? exitOnlyLabelParts.slice(1).join(" ")
                : exitOnlyLabelLeft;
            for (
              let arrowIndex = 0, length = panel.sign.guideArrowLanes;
              arrowIndex < length;
              arrowIndex++
            ) {
              // Evens
              if (length % 2 == 0) {
                if (arrowIndex == Math.floor(length / 2)) {
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
    changeEditingPanel,
    changeEditingSubPanel,
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
    changeEditingPanel: changeEditingPanel,
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
