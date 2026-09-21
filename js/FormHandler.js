const formHandler = (() => {
  let app;
  let post;
  let zoomLevel = 1;

  const initialize = (appModule) => {
    app = appModule;
    post = app.getPost();

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

    FormNavigation.initUI(app, post);
  };

  const toggleVisibility = (checkbox, elements) => {
    for (const elem of elements) {
      if (checkbox.checked) {
        elem.classList.remove("hidden");
      } else {
        elem.classList.add("hidden");
      }
    }
  };

  const readForm = (readProperties) => {
    const form = document.forms[0];
    const currentPanel = app.getCurrentPanel();
    const subPanel =
      currentPanel.sign.subPanels[app.vars.currentlySelectedSubPanelIndex];

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
    currentPanel.sign.lanePanelSize = form["panelLaneSize"].value;

    currentPanel.borderRadius = Math.max(0, form["panelBorderRadius"].value);

    // Exit Tab
    if (app.vars.currentlySelectedExitTabRowIndex != -1) {
      const exitTabRow =
        currentPanel.exitTabs[app.vars.currentlySelectedExitTabRowIndex];
      if (app.vars.currentlySelectedExitTabIndex == -1) {
        exitTabRow.gap = parseFloat(form["sMET_Gap"].value);
        exitTabRow.panelEdgeType = form["sMET_PanelEdgeType"].value;
        exitTabRow.position = form["sMET_Position"].value;
        exitTabRow.marginBottom = parseFloat(form["smET_marginBottom"].value);
      } else {
        const exitTab =
          exitTabRow.exitTabs[app.vars.currentlySelectedExitTabIndex];

        exitTab.textContent = form["sMET_textContent"].value;
        exitTab.subTextContent = form["sMET_subTextContent"].value;

        exitTab.backgroundColor = form["sMET_backgroundColor"].value;
        exitTab.borderStyle = form["sMET_borderStyle"].value;
        exitTab.borderThickness = parseFloat(
          form["sMET_borderThickness"].value,
        );
        exitTab.borderRadius = parseFloat(form["sMET_borderRadius"].value);
        exitTab.useFullBorder = form["sMET_useFullBorder"].checked;
        exitTab.horizontalPadding = parseFloat(
          form["sMET_horizontalPadding"].value,
        );
        exitTab.verticalPadding = parseFloat(
          form["sMET_verticalPadding"].value,
        );
        exitTab.minimumHeight = parseFloat(form["sMET_minimumHeight"].value);
        exitTab.fontSize = parseFloat(form["sMET_fontSize"].value);
        exitTab.lineHeight = parseFloat(form["sMET_lineHeight"].value);
        exitTab.enlargeNumerals = form["sMET_enlargeNumerals"].checked;
        exitTab.enlargeNumeralsSize = parseFloat(
          form["sMET_enlargeNumeralsSize"].value,
        );
        exitTab.spaceLettersNumerals =
          form["sMET_spaceLettersNumerals"].checked;
        exitTab.useTrimFormat = form["smET_useTrimFormat"].checked;
        exitTab.numeralWordSpacing = parseFloat(
          form["sMET_numeralWordSpacing"].value,
        );
        exitTab.offsetNonNumerals = form["sMET_offsetNonNumerals"].checked;
        exitTab.fontFamily = form["sMET_fontFamily"].value;
        exitTab.numeralFontFamily = form["sMET_numeralFontFamily"].value;
        exitTab.letterSpacing = parseFloat(form["sMET_letterSpacing"].value);
        exitTab.numeralLetterSpacing = parseFloat(
          form["sMET_numeralLetterSpacing"].value,
        );
        exitTab.contentDirection = form["sMET_contentDirection"].value;
        exitTab.alignment = form["sMET_alignment"].value;
        exitTab.width = form["sMET_width"].value;
        exitTab.holderPadding = form["smET_containerHolderPadding"].value;

        if (exitTab.width.toLowerCase().includes("percent")) {
          exitTab.widthSize = Math.min(
            parseInt(form["sMET_widthSize"].value),
            100,
          );
        } else if (exitTab.width.toLowerCase().includes("size")) {
          exitTab.widthSize = Math.min(
            parseFloat(form["sMET_widthSize"].value),
            20,
          );
        }

        if (exitTab.variant == "PartialLeft") {
          exitTab.variantSettings.partialLeft.separateRow =
            form["smET_partialLeftCheckbox"].checked;
          exitTab.variantSettings.partialLeft.horizontalPadding =
            form["smET_partialLeftHorizontalPadding"].value;
          exitTab.variantSettings.partialLeft.verticalPadding =
            form["smET_partialLeftVerticalPadding"].value;
          exitTab.variantSettings.partialLeft.minWidth =
            form["smET_partialLeftMinWidth"].value;
          exitTab.variantSettings.partialLeft.letterSpacing =
            form["smET_partialLeftLetterSpacing"].value;
          exitTab.variantSettings.partialLeft.spacing =
            form["smET_partialLeftSpacing"].value;
        }

        if (
          exitTab.variant == "HOVVariant1" ||
          exitTab.variant == "HOVVariant2"
        ) {
          exitTab.variantSettings[
            exitTab.variant == "HOVVariant1" ? "hovVariant1" : "hovVariant2"
          ].width = parseFloat(
            form[
              exitTab.variant == "HOVVariant1"
                ? "smET_HOV1Width"
                : "smET_HOV2Width"
            ].value,
          );
          exitTab.variantSettings[
            exitTab.variant == "HOVVariant1" ? "hovVariant1" : "hovVariant2"
          ].height = parseFloat(
            form[
              exitTab.variant == "HOVVariant1"
                ? "smET_HOV1Height"
                : "smET_HOV2Height"
            ].value,
          );
          exitTab.variantSettings[
            exitTab.variant == "HOVVariant1" ? "hovVariant1" : "hovVariant2"
          ].verticalPadding = parseFloat(
            form[
              exitTab.variant == "HOVVariant1"
                ? "smET_HOV1VerticalPadding"
                : "smET_HOV2VerticalPadding"
            ].value,
          );
        }

        if (exitTab.variant == "HOVVariant1") {
          exitTab.variantSettings.hovVariant1.roundCorners =
            form["smET_HOV1RoundCorners"].checked;
        }

        if (exitTab.variant == "Icon") {
          exitTab.variantSettings.icon.icon = document.querySelector(
            "#sMET_variantRegularIcon",
          ).dataset.selectedOption;
          exitTab.variantSettings.icon.tollIcon = document.querySelector(
            "#sMET_variantTollIcon",
          ).dataset.selectedOption;

          exitTab.variantSettings.icon.isTextBased =
            form["sMET_variantIsTextBased"].checked;

          exitTab.variantSettings.icon.showBackground =
            form["smET_showBackground"].checked;

          exitTab.variantSettings.icon.iconBackgroundConfiguration.backgroundColor =
            form["smET_iconBackground"].value;
          exitTab.variantSettings.icon.iconBackgroundConfiguration.horizontalPadding =
            parseFloat(form["smET_iconBackgroundHorizPadding"].value);
          exitTab.variantSettings.icon.iconBackgroundConfiguration.verticalPadding =
            parseFloat(form["smET_iconBackgroundVertPadding"].value);
          exitTab.variantSettings.icon.iconBackgroundConfiguration.borderRadius =
            parseFloat(form["smET_iconBackgroundBorderRadius"].value);

          exitTab.variantSettings.icon.addon = form["sMET_variantAddon"].value;
          exitTab.variantSettings.icon.iconSize = parseFloat(
            form["sMET_variantIconSize"].value,
          );
          exitTab.variantSettings.icon.isSquare =
            form["sMET_variantIsSquare"].checked;
          exitTab.variantSettings.icon.isTollIcon =
            form["sMET_variantIsTollIcon"].checked;
          exitTab.variantSettings.icon.onlyHorizontalPadding = parseFloat(
            form["sMET_variantOnlyHorizontalPadding"].value,
          );
          exitTab.variantSettings.icon.pbmPadding = parseFloat(
            form["sMET_variantPbmPadding"].value,
          );
          exitTab.variantSettings.icon.pbmIsSquare =
            form["smET_variantIsSquare"].checked;

          exitTab.variantSettings.icon.fontFamily =
            form["sMET_variantFontFamily"].value;
          exitTab.variantSettings.icon.underline =
            form["sMET_variantUnderline"].checked;
        }

        exitTab.variant = document
          .querySelector("div.sMET_typeSelect > button.selected")
          .id.split("sMET_type")[1];
      }
    }

    if (
      app.getCurrentBlockElem().constructor.name === "ShieldGroupElement" &&
      app.vars.currentlySelectedShieldIndex != -1
    ) {
      const currentShield =
        app.getCurrentBlockElem().shields[
          app.vars.currentlySelectedShieldIndex
        ];

      /*
      currentShield.routeNumber = form["spShield_routeNumber"].value;
      currentShield.designation = form["spShield_designation"].value;
      currentShield.scale = parseFloat(form["spShield_scale"].value);

      currentShield.customShields.route_scale = parseFloat(
        form["spShield_routeScale"].value,
      );
      currentShield.customShields.route_xOffset = parseFloat(
        form["spShield_routeXOffset"].value,
      );
      currentShield.customShields.route_yOffset = parseFloat(
        form["spShield_routeYOffset"].value,
      );
      currentShield.customShields.route_letterSpacing = parseFloat(
        form["spShield_routeSpacing"].value,
      );
      currentShield.customShields.route_fontFamily =
        form["spShield_routeFontFamily"].value;

      currentShield.customShields.designation_scale = parseFloat(
        form["spShield_designationScale"].value,
      );
      currentShield.customShields.designation_xOffset = parseFloat(
        form["spShield_designationXOffset"].value,
      );
      currentShield.customShields.designation_yOffset = parseFloat(
        form["spShield_designationYOffset"].value,
      );
      currentShield.customShields.designation_letterSpacing = parseFloat(
        form["spShield_designationSpacing"].value,
      );
      currentShield.customShields.designation_fontFamily =
        form["spShield_designationFontFamily"].value;

      currentShield.horizMargin = form["spShield_horizMargins"].value;
      currentShield.vertMargin = form["spShield_vertMargins"].value;
      */

      const bannerElements = document.querySelectorAll(".smSP_bannerElement");
      let domIndex = bannerElements.length - 1;

      let indexToSkip = {};

      for (const alignment of ["top", "bottom", "left", "right"].reverse()) {
        if (!currentShield.banners[alignment]) {
          continue;
        }

        const bannerAlignmentElem = document.querySelector(
          `.smSPBanner_alignmentHeader.${alignment}`,
        );

        if (!bannerAlignmentElem) {
          continue;
        }

        currentShield.bannerSettings[alignment].alignment =
          bannerAlignmentElem.querySelector(".smSPShieldBannerJustify").value;
        currentShield.bannerSettings[alignment].gap =
          parseFloat(
            bannerAlignmentElem.querySelector(".smSPShieldBannerGap").value,
          ) || 0;

        for (let i = currentShield.banners[alignment].length - 1; i >= 0; i--) {
          if (indexToSkip[alignment] === i) {
            continue;
          }

          let banner = currentShield.banners[alignment][i];

          const bannerElement = bannerElements[domIndex];
          domIndex--;

          if (!bannerElement) continue;

          const newAlignment = bannerElement
            .querySelector(".smSPBanner_position")
            .value.toLowerCase();

          if (newAlignment !== alignment) {
            banner = currentShield.moveBanner(alignment, i, newAlignment);
            indexToSkip[newAlignment] =
              currentShield.banners[newAlignment].length - 1;
          }

          banner.textContent = bannerElement.querySelector(
            ".smSPBanner_textContent",
          ).value;
          banner.backgroundColor = bannerElement.querySelector(
            ".smSPBanner_bgColor",
          ).value;
          banner.fontFamily = bannerElement.querySelector(
            ".smSPBanner_fontFamily",
          ).value;

          banner.firstLetterSize =
            parseFloat(
              bannerElement.querySelector(".smSPBanner_firstLetterScale").value,
            ) || 0;
          banner.fontSize =
            parseFloat(
              bannerElement.querySelector(".smSPBanner_fontSize").value,
            ) || 0;
          banner.horizontalMargin =
            parseFloat(
              bannerElement.querySelector(".smSPBanner_horizontalMargins")
                .value,
            ) || 0;
          banner.verticalMargin =
            parseFloat(
              bannerElement.querySelector(".smSPBanner_verticalMargins").value,
            ) || 0;
          banner.borderRadius =
            parseFloat(
              bannerElement.querySelector(".smSPBanner_borderRadius").value,
            ) || 0;
          banner.horizontalPadding =
            parseFloat(
              bannerElement.querySelector(".smSPBanner_horizontalPadding")
                .value,
            ) || 0;
          banner.verticalPadding =
            parseFloat(
              bannerElement.querySelector(".smSPBanner_verticalPadding").value,
            ) || 0;
        }
      }
    }

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
    const currentBlockElem = app.getCurrentBlockElem();
    const blockElemType =
      Control.prototype.blockInternalElements[
        Control.prototype.blockToClassElems.getElem(currentBlockElem)
      ];
    for (const propertyName in currentBlockElem) {
      const elementId = `${blockElemType}_${propertyName}`;
      const element = document.getElementById(elementId);

      if (element) {
        let nextValue = element.value;

        if (element.type === "checkbox") {
          nextValue = element.checked;
        } else if (element.type === "radio") {
          nextValue = element.checked
            ? element.value
            : currentBlockElem[propertyName];
        } else if (element.tagName === "SELECT") {
          nextValue = element.value;
        }

        currentBlockElem[propertyName] = nextValue;
      }
    }

    if (currentBlockElem.constructor.name === "IconElement") {
      currentBlockElem.icon =
        document.querySelector(".sdIconDropdown").dataset.selectedOption ||
        currentBlockElem.icon;
    }

    subPanel.blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].topPadding = document.querySelector("#sdBlock_topPadding").value;
    subPanel.blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].bottomPadding = document.querySelector("#sdBlock_bottomPadding").value;
    subPanel.blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].backgroundColor = document.querySelector(
      "#sdBlock_backgroundColor",
    ).value;
    subPanel.blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].backgroundFullWidth = document.querySelector(
      "#sdBlock_backgroundFullWidth",
    ).checked;
    subPanel.blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].width = document.querySelector("#sdBlock_width").value;
    subPanel.blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].stretchLeft = document.querySelector("#sdBlock_stretchLeft").checked;
    subPanel.blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].stretchCenter = document.querySelector("#sdBlock_stretchCenter").checked;
    subPanel.blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].stretchRight = document.querySelector("#sdBlock_stretchRight").checked;

    subPanel.laneWidth = parseInt(form["subPanelLength"].value);
    subPanel.verticalAlign = form["subpanelAlign"].value;

    if (app.vars.currentlySelectedSubPanelIndex != 0) {
      //subPanel.height = form["subPanelHeight"].value;
    }

    // guide arrows
    currentPanel.sign.arrows.arrowMode = document
      .querySelector("div.sMA_typeSelect > button.selected")
      .id.split("sMA_type")[1]
      .toLowerCase();

    if (currentPanel.sign.arrows.arrowMode == "standard") {
      let guideArrow_result = form["guideArrow"].value;

      for (const guideArrow_value of Sign.prototype.guideArrows) {
        if (guideArrow_result == guideArrow_value.split(":")[0]) {
          guideArrow_result = guideArrow_value;
          break;
        }
      }

      currentPanel.sign.guideArrow = guideArrow_result;
      currentPanel.sign.guideArrowLanes = form["guideArrowLanes"].value;
      currentPanel.sign.arrowPosition = form["arrowLocations"].value;

      let exitOnlyDirection_result = form["exitOnlyDirection"].value;

      for (const exitOnlyDirection_value of Sign.prototype.exitguideArrows) {
        if (exitOnlyDirection_result == exitOnlyDirection_value.split(":")[0]) {
          exitOnlyDirection_result = exitOnlyDirection_value;
          break;
        }
      }

      if (currentPanel.sign.guideArrow == "Half Exit Only") {
        if (form["arrowLocations"].value == "Middle") {
          while (form["arrowLocations"].firstChild) {
            form["arrowLocations"].removeChild(
              form["arrowLocations"].lastChild,
            );
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
    } else if (currentPanel.sign.arrows.arrowMode == "apl") {
      const apl = currentPanel.sign.arrows.apl;
      apl.horizontalPadding = parseFloat(form["smAPL_HorizPadding"].value);
      apl.verticalTopPadding = parseFloat(form["smAPL_VertTopPadding"].value);
      apl.verticalBottomPadding = parseFloat(
        form["smAPL_VertBottomPadding"].value,
      );

      let containerIndex = 0;
      for (let i = 0; i <= currentPanel.sign.subPanels.length - 1; i += 0.5) {
        const aplContainer = document.querySelectorAll(".smAPLCat_container")[
          containerIndex++
        ];
        const aplList = apl.subpanels[i];

        if (!aplContainer || !aplList) {
          continue;
        }

        if (i % 1 == 0) {
          apl.subpanelConfigs[i].justify = aplContainer.querySelector(
            ".smAPLCat_justifyAPLs",
          ).value;
        }

        aplList.forEach((arrow, arrowIndex) => {
          const arrowElement =
            aplContainer.querySelectorAll(".smAPLCat_apl")[arrowIndex];

          if (!arrowElement) {
            return;
          }

          arrow.arrowVariant = arrowElement.querySelector(
            ".smAPLCat_aplSelectHolder",
          ).dataset.selectedOption;
          arrow.size = parseFloat(
            arrowElement.querySelector(".sMAPL_size").value,
          );
          arrow.offset = parseFloat(
            arrowElement.querySelector(".sMAPL_offset").value,
          );
          arrow.exitOnlyEnabled = arrowElement.querySelector(
            ".smAPL_exitOnlyCheck",
          ).checked;
          arrow.exitTextContent = [
            arrowElement.querySelector(".smAPL_leftText").value,
            arrowElement.querySelector(".smAPL_rightText").value,
          ];
          arrow.exitBGColor =
            arrowElement.querySelector(".smAPL_bgColor").value;
          arrow.fontFamily = arrowElement.querySelector(".smAPL_font").value;
          arrow.exitTextSize = parseFloat(
            arrowElement.querySelector(".smAPL_fontSize").value,
          );
          arrow.exitTextRoundness = parseFloat(
            arrowElement.querySelector(".smAPL_roundness").value,
          );
          arrow.exitTextHorizontalPadding = parseFloat(
            arrowElement.querySelector(".smAPL_horizontalPadding").value,
          );
          arrow.exitTextMargins = [
            parseFloat(arrowElement.querySelector(".smAPL_leftMargins").value),
            parseFloat(arrowElement.querySelector(".smAPL_rightMargins").value),
          ];
        });
      }
    } else if (currentPanel.sign.arrows.arrowMode == "diagrammic") {
      const diagrammicPreset = document.querySelector("#sMDiagrammicPreset");
      currentPanel.sign.arrows.diagrammic.preset = diagrammicPreset.value;

      if (
        currentPanel.sign.arrows.diagrammic.preset !== "None" &&
        readProperties &&
        readProperties["diagrammicPresetChange"]
      ) {
        DiagrammicLibrary.getDiagramByName(
          currentPanel.sign.arrows.diagrammic.preset,
        ).then((diagramData) => {
          if (diagramData) {
            currentPanel.sign.arrows.diagrammic.diagramData = diagramData;
            updateForm();
            app.redraw();
          }
        });
      }

      currentPanel.sign.arrows.diagrammic.scale = parseInt(
        document.querySelector("#sMDiagrammicScale").value,
      );
    }

    updateForm();
    app.redraw();
  };

  const updateForm = () => {
    const panel = app.getCurrentPanel();
    const sign = panel.sign.subPanels[app.vars.currentlySelectedSubPanelIndex];

    const panelList = document.getElementById("panelList");
    const subPanelList = document.getElementById("subPanelList");
    const exitTabList = document.getElementById("exitTabList");

    document.querySelector("#currentlySelectedPanel").textContent = `Panel ${
      app.vars.currentlySelectedPanelIndex + 1
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
        (app.vars.currentlySelectedPanelIndex == panelIndex ? " active" : "");
      panelButton.dataset.panelIndex = panelIndex.toString();

      const label = document.createElement("span");
      label.className = "panelListLabel";
      label.textContent = "Panel " + (panelIndex + 1);
      panelButton.appendChild(label);

      panelButton.addEventListener("click", () => {
        app.changeEditingPanel(panelIndex);
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
        app.vars.currentlySelectedSubPanelIndex == subPanelIndex
          ? "active"
          : "";

      subPanelButton.addEventListener("click", () => {
        app.changeEditingSubPanel(subPanelIndex);
        subPanelButton.className = "active";
      });

      subPanelList.appendChild(subPanelButton);
    }

    for (
      let exitTabIndex = 0, exitTabLength = panel.exitTabs.length;
      exitTabIndex < exitTabLength;
      exitTabIndex++
    ) {
      const exitTabs = panel.exitTabs[exitTabIndex].exitTabs;
      const exitTabGroup = document.createElement("div");
      exitTabGroup.className = "exitTabGroup";

      const exitTabButton = document.createElement("button");
      exitTabButton.type = "button";
      exitTabButton.className = "exitTabButton";
      exitTabButton.textContent =
        app.vars.currentlySelectedExitTabRowIndex == exitTabIndex
          ? "Group " + (exitTabIndex + 1)
          : "Group " + (exitTabIndex + 1) + " (" + exitTabs.length + ")";

      if (app.vars.currentlySelectedExitTabRowIndex == exitTabIndex) {
        exitTabGroup.classList.add("active");
      }

      if (
        app.vars.currentlySelectedExitTabRowIndex == exitTabIndex &&
        app.vars.currentlySelectedExitTabIndex == -1
      ) {
        exitTabButton.classList.add("active");
      }

      exitTabButton.addEventListener("click", () => {
        app.changeEditingExitTabRow(exitTabIndex);
      });

      exitTabGroup.appendChild(exitTabButton);

      for (let tabIndex = 0; tabIndex <= exitTabs.length; tabIndex++) {
        const tabButton = document.createElement("button");
        tabButton.type = "button";
        tabButton.className = "exitTabNestedButton";

        if (tabIndex < exitTabs.length) {
          tabButton.textContent = "Tab " + (tabIndex + 1);

          if (
            app.vars.currentlySelectedExitTabRowIndex == exitTabIndex &&
            app.vars.currentlySelectedExitTabIndex == tabIndex
          ) {
            tabButton.classList.add("active");
          }

          tabButton.addEventListener("click", () => {
            app.changeEditingExitTab(tabIndex);
          });
        } else if (app.vars.currentlySelectedExitTabRowIndex == exitTabIndex) {
          tabButton.textContent = "+";
          tabButton.dataset.tooltip = "Add a sub-exit tab";
          tabButton.className = "exitTabtabButton newtabButton";
          tabButton.addEventListener("click", app.newExitTab);
        }

        exitTabGroup.appendChild(tabButton);
      }

      exitTabList.appendChild(exitTabGroup);
    }

    // Panel Setting Config
    document.getElementById("panelColor").value = panel.color;
    document.getElementById("panelCorner").value = panel.corner;
    document.getElementById("panelBorderRadius").value =
      panel.borderRadius || 0.5;
    document.getElementById("panelLaneSize").value = panel.sign.lanePanelSize;

    // Exit Tabs
    updateExitTabSubform();

    // Sub Panel
    document.getElementById("subPanelLength").value =
      app.getCurrentSubPanel().laneWidth;
    document.getElementById("subpanelAlign").value =
      app.getCurrentSubPanel().verticalAlign;

    // Shields
    updateShieldSubform();

    // Icons
    if (app.getCurrentBlockElem().constructor.name === "IconElement") {
      const currentIcon = app.getCurrentBlockElem().icon;
      document.querySelector(".sdIconDropdown").dataset.selectedOption =
        currentIcon;
    }

    // Control Text Revision
    const sMSPTextList = document.querySelector("#sMSPTextList");
    sMSPTextList.innerHTML = "";
    document.querySelector("#SMSPSelectLabel").textContent =
      "Selected: Row " + (app.vars.currentlySelectedRowIndex + 1);
    document.querySelector("#SMSPElementLabel").textContent =
      "Selected: Block " + (app.vars.currentlySelectedBlockIndex + 1);
    document.querySelector("#sMSPDeleteSelectedRow").disabled =
      app.getCurrentSubPanel().blockElements.rows.length == 1;
    document.querySelector("#smSPDeleteSelectedBlock").disabled =
      app.getCurrentSubPanel().blockElements.rows.length == 1 &&
      app.getCurrentBlockRows().length == 1;
    for (
      let row = 0;
      row < Object.keys(sign.blockElements.rows).length;
      row++
    ) {
      const sMControlRow = document.createElement("div");
      sMControlRow.dataset.dataRow = row.toString();
      sMControlRow.className =
        "sMControlRow" +
        (row == app.vars.currentlySelectedRowIndex ? " selected" : "");

      for (let item = 0; item < sign.blockElements.rows[row].length; item++) {
        const blockElement = sign.blockElements.rows[row][item];

        const textEditorBlock = document.createElement("button");
        textEditorBlock.className =
          "textEditorBlock " +
          Control.prototype.blockInternalElements[
            blockElement.constructor.name
          ] +
          (item == app.vars.currentlySelectedBlockIndex &&
          row == app.vars.currentlySelectedRowIndex
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
            app.setSelectedControlElem(item);
          },
          { once: true },
        );
      }

      sMSPTextList.appendChild(sMControlRow);
      sMControlRow.addEventListener(
        "click",
        () => {
          app.setSelectedRow(row);
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
          Control.prototype.blockToClassElems.getElem(app.getCurrentBlockElem())
        ]
      ) {
        divConfig.classList.remove("hidden");
        selectedSettings = divConfig;
      } else {
        divConfig.classList.add("hidden");
      }
    }

    const currentBlockElem = app.getCurrentBlockElem();
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
        app.vars.currentlySelectedRowIndex
      ].topPadding;
    document
      .querySelector("#sdBlock_topPadding")
      .addEventListener("change", readForm, { once: true });

    document.querySelector("#sdBlock_bottomPadding").value =
      sign.blockElements.blockProperties[
        app.vars.currentlySelectedRowIndex
      ].bottomPadding;
    document
      .querySelector("#sdBlock_bottomPadding")
      .addEventListener("change", readForm, { once: true });

    document.querySelector("#sdBlock_topPaddingVal").value =
      sign.blockElements.blockProperties[
        app.vars.currentlySelectedRowIndex
      ].topPadding;
    document.querySelector("#sdBlock_bottomPaddingVal").value =
      sign.blockElements.blockProperties[
        app.vars.currentlySelectedRowIndex
      ].bottomPadding;

    document.querySelector("#sdBlock_topPadding").value =
      sign.blockElements.blockProperties[
        app.vars.currentlySelectedRowIndex
      ].topPadding;
    document.querySelector("#sdBlock_bottomPadding").value =
      sign.blockElements.blockProperties[
        app.vars.currentlySelectedRowIndex
      ].bottomPadding;

    document.querySelector("#sdBlock_backgroundColor").value =
      sign.blockElements.blockProperties[
        app.vars.currentlySelectedRowIndex
      ].backgroundColor;

    document
      .querySelector("#sdBlock_backgroundColor")
      .addEventListener("blur", readForm, { once: true });

    document.querySelector("#sdBlock_backgroundFullWidth").checked =
      sign.blockElements.blockProperties[
        app.vars.currentlySelectedRowIndex
      ].backgroundFullWidth;
    document
      .querySelector("#sdBlock_backgroundFullWidth")
      .addEventListener("change", readForm, {
        once: true,
      });

    document.querySelector("#sdBlock_width").value =
      sign.blockElements.blockProperties[
        app.vars.currentlySelectedRowIndex
      ].width;
    document
      .querySelector("#sdBlock_width")
      .addEventListener("change", readForm, { once: true });

    document
      .querySelector("#sdBlock_stretchLeft")
      .addEventListener("change", readForm, { once: true });

    document.querySelector("#sdBlock_stretchLeft").checked =
      sign.blockElements.blockProperties[
        app.vars.currentlySelectedRowIndex
      ].stretchLeft;

    document
      .querySelector("#sdBlock_stretchCenter")
      .addEventListener("change", readForm, { once: true });
    document.querySelector("#sdBlock_stretchCenter").checked =
      sign.blockElements.blockProperties[
        app.vars.currentlySelectedRowIndex
      ].stretchCenter;

    document
      .querySelector("#sdBlock_stretchRight")
      .addEventListener("change", readForm, { once: true });
    document.querySelector("#sdBlock_stretchRight").checked =
      sign.blockElements.blockProperties[
        app.vars.currentlySelectedRowIndex
      ].stretchRight;

    updateGuideArrowsSubform();

    const p = panel.sign.padding
      .split("rem")
      .map((val) => parseFloat(val) || 0);

    document.getElementById("paddingTop").value = p[0];
    document.getElementById("paddingRight").value = p[1];
    document.getElementById("paddingBottom").value = p[2];
    document.getElementById("paddingLeft").value = p[3];

    toggleVisibility(
      document.querySelector("#sdCtrlText_useNumeralFormatting"),
      [document.querySelector("#sdCtrlText_numeralFormattingSize")],
    );
    toggleVisibility(
      document.querySelector("#sdActionMessage_useNumeralFormatting"),
      [document.querySelector("#sdActionMessage_numeralFormattingSize")],
    );
    toggleVisibility(
      document.querySelector("#sdAdvisory_useNumeralFormatting"),
      [document.querySelector("#sdAdvisory_numeralFormattingSize")],
    );
    toggleVisibility(
      document.querySelector("#sdCtrlText_useBannerFormatting"),
      [
        document.querySelector("#sdCtrlText_bannerFormattingSize"),
        document.querySelector("#sdCtrlText_bannerFirstLetterSize"),
      ],
    );
    toggleVisibility(
      document.querySelector("#sdActionMessage_useBannerFormatting"),
      [
        document.querySelector("#sdActionMessage_bannerFormattingSize"),
        document.querySelector("#sdActionMessage_bannerFirstLetterSize"),
      ],
    );
    toggleVisibility(
      document.querySelector("#sdAdvisory_useBannerFormatting"),
      [
        document.querySelector("#sdAdvisory_bannerFormattingSize"),
        document.querySelector("#sdAdvisory_bannerFirstLetterSize"),
      ],
    );
    toggleVisibility(document.querySelector("#sdIcon_border"), [
      document.querySelector("#sdIcon_borderColor"),
      document.querySelector("#sdIcon_borderRadius"),
    ]);
    toggleVisibility(document.querySelector("#sdTollLogo_background"), [
      document.querySelector("#sdTollLogo_backgroundColor"),
      document.querySelector("#sdTollLogo_borderRadius"),
      document.querySelector("#sdTollLogo_horizontalPadding"),
      document.querySelector("#sdTollLogo_verticalPadding"),
      document.querySelector("#sdTollLogo_hasOnlyBlock"),
    ]);
    toggleVisibility(document.querySelector("#sMET_enlargeNumerals"), [
      document.querySelector("#sMET_enlargeNumeralsSize"),
    ]);
  };

  const updateExitTabSubform = () => {
    const panel = app.getCurrentPanel();
    const currentExitTabRow =
      panel.exitTabs[app.vars.currentlySelectedExitTabRowIndex];

    if (!currentExitTabRow) {
      return;
    }

    if (app.vars.currentlySelectedExitTabIndex == -1) {
      document.querySelector('a[data-tab="sMExitTabVariant"]').style.display =
        "none";
      document.querySelector(
        'a[data-tab="sMET_VariantProperties"]',
      ).style.display = "none";
      document.querySelector(
        'a[data-tab="sMExitTabProperties"]',
      ).style.display = "none";
      document.querySelector(
        'a[data-tab="sMExitTabGroupProperties"]',
      ).style.display = "";
      document.querySelector('a[data-tab="sMExitTabGroupProperties"]').click();

      document.querySelector("#sMET_Position").value =
        currentExitTabRow.position;
      document.querySelector("#sMET_PanelEdgeType").value =
        currentExitTabRow.panelEdgeType;

      document.querySelector("#sMET_Gap").value = currentExitTabRow.gap;
      document.querySelector("#smET_marginBottom").value =
        currentExitTabRow.marginBottom;

      document.querySelector("#smET_marginBottom").style.display =
        currentExitTabRow.panelEdgeType == "extend" ? "" : "none";
      document.querySelector("label[for='smET_marginBottom']").style.display =
        currentExitTabRow.panelEdgeType == "extend" ? "" : "none";

      return;
    }

    const currentExitTab =
      currentExitTabRow.exitTabs[app.vars.currentlySelectedExitTabIndex];

    document.querySelector('a[data-tab="sMExitTabVariant"]').style.display = "";
    document.querySelector(
      'a[data-tab="sMET_VariantProperties"]',
    ).style.display = "";
    document.querySelector('a[data-tab="sMExitTabProperties"]').style.display =
      "";
    document.querySelector(
      'a[data-tab="sMExitTabGroupProperties"]',
    ).style.display = "none";

    let presetsLibrary =
      StorageManager.getItem(StorageManager.STORAGE_KEYS.exitTabs) || {};

    if (
      presetsLibrary[currentExitTab.variant] ||
      exitTabPresets[currentExitTab.variant]
    ) {
      let pastValue = document.querySelector("#smET_presetSelect").value;
      document.querySelector("#smET_presetSelect").innerHTML = "";
      lib.appendOption(document.querySelector("#smET_presetSelect"), "None", {
        selected: pastValue == "",
      });

      for (const presetName in exitTabPresets[currentExitTab.variant] || {}) {
        let option = lib.appendOption(
          document.querySelector("#smET_presetSelect"),
          presetName,
          {
            selected: presetName == pastValue,
            text: "(Built-in) " + presetName,
          },
        );
        option.className = "presetExitTab";
      }

      for (const presetName in presetsLibrary[currentExitTab.variant] || {}) {
        lib.appendOption(
          document.querySelector("#smET_presetSelect"),
          presetName,
          { selected: presetName == pastValue },
        );
      }
    } else {
      document.querySelector("#smET_presetSelect").innerHTML = "";
      lib.appendOption(document.querySelector("#smET_presetSelect"), "None");
    }

    if (
      document
        .querySelector('a[data-tab="sMExitTabGroupProperties"]')
        .classList.contains("selected")
    ) {
      document.querySelector('a[data-tab="sMExitTabVariant"]').click();
    }

    for (const e of document.querySelectorAll(".sMET_typeSelect > button")) {
      if (e.id.split("sMET_type")[1] === currentExitTab.variant) {
        e.classList.add("selected");
      } else {
        e.classList.remove("selected");
      }
    }

    if (false) {
      document.querySelector("#sMET_textContent").style.display = "none";
      document.querySelector("#sMET_subTextContent").style.display = "none";
      document.querySelector('label[for="sMET_textContent"]').style.display =
        "none";
      document.querySelector('label[for="sMET_subTextContent"]').style.display =
        "none";
      for (const e of document.querySelectorAll(
        "#sMExitTabProperties > fieldset",
      )) {
        e.style.display = "none";
      }
    } else {
      document.querySelector("#sMET_textContent").style.display = "";
      document.querySelector("#sMET_subTextContent").style.display = "";
      document.querySelector('label[for="sMET_textContent"]').style.display =
        "";
      document.querySelector('label[for="sMET_subTextContent"]').style.display =
        "";
      for (const e of document.querySelectorAll(
        "#sMExitTabProperties > fieldset",
      )) {
        e.style.display = "";
      }
    }

    document.querySelector("#sMET_textContent").value =
      currentExitTab.textContent;
    document.querySelector("#smET_subTextContent").value =
      currentExitTab.subTextContent;
    document.querySelector("#sMET_backgroundColor").value =
      currentExitTab.backgroundColor;
    document.querySelector("#sMET_borderStyle").value =
      currentExitTab.borderStyle;
    document.querySelector("#sMET_borderThickness").value =
      currentExitTab.borderThickness;
    document.querySelector("#sMET_borderThicknessVal").value =
      currentExitTab.borderThickness;
    document.querySelector("#sMET_borderRadius").value =
      currentExitTab.borderRadius;
    document.querySelector("#sMET_borderRadiusVal").value =
      currentExitTab.borderRadius;
    document.querySelector("#sMET_useFullBorder").checked =
      currentExitTab.useFullBorder;
    document.querySelector("#sMET_horizontalPadding").value =
      currentExitTab.horizontalPadding;
    document.querySelector("#sMET_horizontalPaddingVal").value =
      currentExitTab.horizontalPadding;
    document.querySelector("#sMET_verticalPadding").value =
      currentExitTab.verticalPadding;
    document.querySelector("#sMET_verticalPaddingVal").value =
      currentExitTab.verticalPadding;
    document.querySelector("#sMET_minimumHeight").value =
      currentExitTab.minimumHeight;
    document.querySelector("#sMET_minimumHeightVal").value =
      currentExitTab.minimumHeight;
    document.querySelector("#sMET_fontSize").value = currentExitTab.fontSize;
    document.querySelector("#sMET_fontSizeVal").value = currentExitTab.fontSize;
    document.querySelector("#sMET_lineHeight").value =
      currentExitTab.lineHeight;
    document.querySelector("#sMET_lineHeightVal").value =
      currentExitTab.lineHeight;
    document.querySelector("#sMET_enlargeNumerals").checked =
      currentExitTab.enlargeNumerals;
    document.querySelector("#sMET_enlargeNumeralsSize").value =
      currentExitTab.enlargeNumeralsSize;
    document.querySelector("#sMET_spaceLettersNumerals").checked =
      currentExitTab.spaceLettersNumerals;
    document.querySelector("#sMET_numeralWordSpacing").value =
      currentExitTab.numeralWordSpacing;
    document.querySelector("#sMET_numeralWordSpacingVal").value =
      currentExitTab.numeralWordSpacing;
    document.querySelector("#sMET_offsetNonNumerals").checked =
      currentExitTab.offsetNonNumerals;
    document.querySelector("#smET_useTrimFormat").checked =
      currentExitTab.useTrimFormat;
    document.querySelector("#smET_lineHeight").disabled =
      currentExitTab.useTrimFormat;
    document.querySelector("#smET_lineHeightVal").disabled =
      currentExitTab.useTrimFormat;
    document.querySelector("#sMET_fontFamily").value =
      currentExitTab.fontFamily;
    document.querySelector("#sMET_numeralFontFamily").value =
      currentExitTab.numeralFontFamily;
    document.querySelector("#sMET_letterSpacing").value =
      currentExitTab.letterSpacing;
    document.querySelector("#sMET_letterSpacingVal").value =
      currentExitTab.letterSpacing;
    document.querySelector("#sMET_numeralLetterSpacing").value =
      currentExitTab.numeralLetterSpacing;
    document.querySelector("#sMET_numeralLetterSpacingVal").value =
      currentExitTab.numeralLetterSpacing;
    document.querySelector("#sMET_contentDirection").value =
      currentExitTab.contentDirection;
    document.querySelector("#sMET_alignment").value = currentExitTab.alignment;
    document.querySelector("#sMET_width").value = currentExitTab.width;
    document.querySelector("#smET_containerHolderPadding").value =
      currentExitTab.holderPadding;

    if (currentExitTab.width.toLowerCase().includes("custom")) {
      if (currentExitTab.width.toLowerCase().includes("percent")) {
        document.querySelector("#sMET_widthSizeLabel").textContent =
          "Width Size (%):";
        document.querySelector("#sMET_widthSize").max = 100;
        document.querySelector("#sMET_widthSize").step = 1;
      } else {
        document.querySelector("#sMET_widthSizeLabel").textContent =
          "Width Size (rem):";
        document.querySelector("#sMET_widthSize").max = 20;
        document.querySelector("#sMET_widthSize").step = 0.1;
      }

      document.querySelector("#sMET_widthSize").value =
        currentExitTab.widthSize;
      document.querySelector("#sMET_widthSizeVal").value =
        currentExitTab.widthSize;
      document.querySelector("#sMET_widthSizeLabel").classList.remove("hidden");
      document.querySelector("#sMET_widthSize").classList.remove("hidden");
      document.querySelector("#sMET_widthSizeVal").classList.remove("hidden");
    } else {
      document.querySelector("#sMET_widthSizeLabel").classList.add("hidden");
      document.querySelector("#sMET_widthSize").classList.add("hidden");
      document.querySelector("#sMET_widthSizeVal").classList.add("hidden");
    }

    if (currentExitTab.borderStyle == "square") {
      document
        .querySelector('label[for="sMET_borderRadius"]')
        .classList.add("hidden");
      document.querySelector("#sMET_borderRadius").classList.add("hidden");
      document.querySelector("#sMET_borderRadiusVal").classList.add("hidden");
    } else {
      document
        .querySelector('label[for="sMET_borderRadius"]')
        .classList.remove("hidden");
      document.querySelector("#sMET_borderRadius").classList.remove("hidden");
      document
        .querySelector("#sMET_borderRadiusVal")
        .classList.remove("hidden");
    }

    for (const elem of document.querySelectorAll(
      "#sMET_VariantProperties > fieldset",
    )) {
      if (elem.id.includes(currentExitTab.variant)) {
        elem.classList.remove("hidden");
      } else {
        elem.classList.add("hidden");
      }
    }

    if (currentExitTab.variant == "partialLeft") {
      document.querySelector("#smET_partialLeftCheckbox").checked =
        currentExitTab.variantSettings.partialLeft.separateRow;
      document.querySelector("#smET_partialLeftHorizontalPadding").value =
        currentExitTab.variantSettings.partialLeft.horizontalPadding;
      document.querySelector("#smET_partialLeftVerticalPadding").value =
        currentExitTab.variantSettings.partialLeft.verticalPadding;
      document.querySelector("#smET_partialLeftHorizontalPaddingVal").value =
        currentExitTab.variantSettings.partialLeft.horizontalPadding;
      document.querySelector("#smET_partialLeftVerticalPaddingVal").value =
        currentExitTab.variantSettings.partialLeft.verticalPadding;
      document.querySelector("#smET_partialLeftMinWidth").value =
        currentExitTab.variantSettings.partialLeft.minWidth;
      document.querySelector("#smET_partialLeftLetterSpacing").value =
        currentExitTab.variantSettings.partialLeft.letterSpacing;
      document.querySelector("#smET_partialLeftSpacing").value =
        currentExitTab.variantSettings.partialLeft.spacing;
    }

    if (
      currentExitTab.variant == "HOVVariant1" ||
      currentExitTab.variant == "HOVVariant2"
    ) {
      document.querySelector(
        "#" +
          (currentExitTab.variant == "HOVVariant1"
            ? "smET_HOV1Width"
            : "smET_HOV2Width"),
      ).value =
        currentExitTab.variantSettings[
          currentExitTab.variant == "HOVVariant1"
            ? "hovVariant1"
            : "hovVariant2"
        ].width;
      document.querySelector(
        "#" +
          (currentExitTab.variant == "HOVVariant1"
            ? "smET_HOV1Height"
            : "smET_HOV2Height"),
      ).value =
        currentExitTab.variantSettings[
          currentExitTab.variant == "HOVVariant1"
            ? "hovVariant1"
            : "hovVariant2"
        ].height;
      document.querySelector(
        "#" +
          (currentExitTab.variant == "HOVVariant1"
            ? "smET_HOV1VerticalPadding"
            : "smET_HOV2VerticalPadding"),
      ).value =
        currentExitTab.variantSettings[
          currentExitTab.variant == "HOVVariant1"
            ? "hovVariant1"
            : "hovVariant2"
        ].verticalPadding;
    }

    if (currentExitTab.variant == "HOVVariant1") {
      document.querySelector("#smET_HOV1RoundCorners").checked =
        currentExitTab.variantSettings.hovVariant1.roundCorners;
    }

    if (currentExitTab.variant == "Icon") {
      document.querySelector(
        "#sMET_variantRegularIcon",
      ).dataset.selectedOption = currentExitTab.variantSettings.icon.icon;
      document.querySelector("#sMET_variantTollIcon").dataset.selectedOption =
        currentExitTab.variantSettings.icon.tollIcon;

      document.querySelector("#sMET_variantAddon").value =
        currentExitTab.variantSettings.icon.addon;

      document.querySelector("#sMET_variantIconSize").value =
        currentExitTab.variantSettings.icon.iconSize;
      document.querySelector("#sMET_variantIconSizeVal").value =
        currentExitTab.variantSettings.icon.iconSize;
      document.querySelector(
        'label[for="sMET_variantIsTextBased"]',
      ).style.display =
        currentExitTab.variantSettings.icon.addon == "only" ? "" : "none";
      document.querySelector("#sMET_variantIsTextBased").checked =
        currentExitTab.variantSettings.icon.isTextBased;
      document.querySelector("#smET_showBackground").value =
        currentExitTab.variantSettings.icon.showBackground;
      document.querySelector("#smET_iconBackground").value =
        currentExitTab.variantSettings.icon.iconBackgroundConfiguration.backgroundColor;

      document.querySelector(
        "#smET_iconBackgroundConfigurations",
      ).style.display =
        currentExitTab.variantSettings.icon.iconBackgroundConfiguration
          .backgroundColor == "Transparent"
          ? "none"
          : "";

      document.querySelector("#smET_iconBackgroundHorizPadding").value =
        currentExitTab.variantSettings.icon.iconBackgroundConfiguration.horizontalPadding;
      document.querySelector("#smET_iconBackgroundVertPadding").value =
        currentExitTab.variantSettings.icon.iconBackgroundConfiguration.verticalPadding;
      document.querySelector("#smET_iconBackgroundBorderRadius").value =
        currentExitTab.variantSettings.icon.iconBackgroundConfiguration.borderRadius;

      document.querySelector("#sMET_variantIsSquare").checked =
        currentExitTab.variantSettings.icon.isSquare;
      document.querySelector("#sMET_variantIsTollIcon").checked =
        currentExitTab.variantSettings.icon.isTollIcon;

      document.querySelector(
        "#sMET_variantOnlyHorizontalPadding",
      ).style.display =
        currentExitTab.variantSettings.icon.addon == "only" ? "" : "none";
      document.querySelector("#sMET_variantPbmPadding").style.display =
        currentExitTab.variantSettings.icon.addon == "pay by mail 1"
          ? ""
          : "none";
      document.querySelector("#sMET_variantUnderline").style.display =
        currentExitTab.variantSettings.icon.addon == "none" ? "" : "none";
      document.querySelector("#smET_variantIsSquare").style.display =
        currentExitTab.variantSettings.icon.addon == "pay by mail 1"
          ? ""
          : "none";

      document.querySelector(
        'label[for="sMET_variantOnlyHorizontalPadding"]',
      ).style.display =
        currentExitTab.variantSettings.icon.addon == "only" ? "" : "none";
      document.querySelector(
        'label[for="sMET_variantPbmPadding"]',
      ).style.display =
        currentExitTab.variantSettings.icon.addon == "pay by mail 1"
          ? ""
          : "none";
      document.querySelector(
        'label[for="sMET_variantUnderline"]',
      ).style.display =
        currentExitTab.variantSettings.icon.addon == "none" ? "" : "none";
      document.querySelector(
        'label[for="smET_variantIsSquare"]',
      ).style.display =
        currentExitTab.variantSettings.icon.addon == "pay by mail 1"
          ? ""
          : "none";

      document.querySelector("#sMET_variantOnlyHorizontalPadding").value =
        currentExitTab.variantSettings.icon.onlyHorizontalPadding;
      document.querySelector("#sMET_variantPbmPadding").value =
        currentExitTab.variantSettings.icon.pbmPadding;
      document.querySelector("#smET_variantIsSquare").value =
        currentExitTab.variantSettings.icon.pbmIsSquare;

      document.querySelector(
        'label[for="sMET_variantFontFamily"]',
      ).style.display =
        currentExitTab.variantSettings.icon.addon != "none" ? "" : "none";
      document.querySelector("#sMET_variantFontFamily").style.display =
        currentExitTab.variantSettings.icon.addon != "none" ? "" : "none";

      document.querySelector("#sMET_variantFontFamily").value =
        currentExitTab.variantSettings.icon.fontFamily;
      document.querySelector("#sMET_variantUnderline").checked =
        currentExitTab.variantSettings.icon.underline;
    }
  };

  const updateShieldSubform = () => {
    const panel = app.getCurrentPanel();
    const sign = panel.sign.subPanels[app.vars.currentlySelectedSubPanelIndex];

    const shieldGroup = app.getCurrentBlockElem();
    const selectedShieldIndex = app.vars.currentlySelectedShieldIndex;
    const currentShield =
      shieldGroup.constructor.name === "ShieldGroupElement" &&
      shieldGroup.shields[selectedShieldIndex];

    const shieldGroupElements = [];
    for (const row of sign.blockElements.rows) {
      for (const blockElement of row) {
        if (blockElement.constructor.name === "ShieldGroupElement") {
          shieldGroupElements.push(blockElement);
        }
      }
    }

    // Shield Group Identification
    const smSPShieldList = document.querySelector("#smSPShieldList");
    const shieldGroupList = document.getElementById("shieldGroupList");
    shieldGroupList.innerHTML = "";

    shieldGroupElements.forEach((shieldGroup, id) => {
      const button = document.createElement("button");
      button.textContent = `Shield Group ${id + 1} (Row ${sign.blockElements.rows.findIndex((row) => row.includes(shieldGroup)) + 1})`;
      if (id === app.vars.currentlySelectedShieldGroupId) {
        button.classList.add("selected");
      }
      button.addEventListener("click", () => {
        app.changeCurrentlyEditingShieldGroup(id);
      });
      shieldGroupList.appendChild(button);
    });

    if (shieldGroup.constructor.name !== "ShieldGroupElement") {
      document.getElementById("smSPShieldHeader").style.display = "none";
      document.getElementById("smSPShieldList").style.display = "none";
      document.getElementById("smSPShieldProperties").style.display = "none";
      return;
    } else {
      document.getElementById("smSPShieldHeader").style.display = "";
      document.getElementById("smSPShieldList").style.display = "";
    }

    // Shield List
    const createShieldRow = (shield, shieldIndex) => {
      const shieldRow = document.createElement("button");
      shieldRow.type = "button";
      shieldRow.className = "smSPShieldRow";
      if (shieldIndex === selectedShieldIndex) {
        shieldRow.classList.add("selected");
      }

      const dragButton = document.createElement("span");
      dragButton.className = "dragIndicator";
      dragButton.innerHTML =
        '<span class="material-symbols-outlined">drag_indicator</span>';
      shieldRow.appendChild(dragButton);

      const shieldBlock = document.createElement("span");
      shieldBlock.className = "smSPShieldBlock";

      const shieldImg = document.createElement("img");
      shieldImg.className = "smSPShieldVisual";
      shieldImg.src =
        shield.shieldType === "preset"
          ? Shield.prototype.getDirectoryFromShield(
              shield.shieldValue,
              shield.variant,
            )
          : shield.imageData;
      shieldImg.alt = `${shield.shieldValue}-${shield.routeNumber}`;
      shieldBlock.appendChild(shieldImg);

      const shieldLabel = document.createElement("span");
      if (shield.routeNumber != "") {
        shieldLabel.textContent = `${
          shield.shieldType == "custom"
            ? shield.shieldName.replace(/\.\w+/g, "")
            : Shield.prototype
                .getPropertiesFromName(shield.shieldValue)
                .name.toUpperCase()
        }-${shield.routeNumber}`;
      } else {
        shieldLabel.textContent = `${
          shield.shieldType == "custom"
            ? shield.shieldName.replace(/\.\w+/g, "")
            : Shield.prototype
                .getPropertiesFromName(shield.shieldValue)
                .name.toUpperCase()
        }`;
      }
      shieldBlock.appendChild(shieldLabel);

      shieldRow.appendChild(shieldBlock);

      shieldRow.addEventListener("click", () => {
        if (selectedShieldIndex !== shieldIndex) {
          app.setSelectedShieldId(shieldIndex);
        } else {
          app.setSelectedShieldId(-1);
        }
        updateShieldSubform();
      });

      return shieldRow;
    };

    let lastGroup = null;
    let groupHolder = null;
    smSPShieldList.innerHTML = "";

    for (
      let shieldIndex = 0;
      shieldIndex < shieldGroup.shields.length;
      shieldIndex++
    ) {
      const shield = shieldGroup.shields[shieldIndex];

      if (shield.group === 0) {
        lastGroup = null;
        groupHolder = null;

        smSPShieldList.appendChild(createShieldRow(shield, shieldIndex));
        continue;
      }

      if (shield.group !== lastGroup) {
        lastGroup = shield.group;
        const groupWrapper = document.createElement("div");
        groupWrapper.className = "smSPShieldGroup";

        if (
          selectedShieldIndex != -1 &&
          shieldGroup.shields[selectedShieldIndex] &&
          shieldGroup.shields[selectedShieldIndex].group == shield.group
        ) {
          groupWrapper.classList.add("selected");
        }

        const groupDragButton = document.createElement("button");
        groupDragButton.type = "button";
        groupDragButton.className = "dragIndicator";
        groupDragButton.innerHTML =
          '<span class="material-symbols-outlined">drag_indicator</span>';
        groupWrapper.appendChild(groupDragButton);

        groupHolder = document.createElement("div");
        groupHolder.className = "smSPShieldGroupHolder";
        groupWrapper.appendChild(groupHolder);
        smSPShieldList.appendChild(groupWrapper);
      }

      if (!groupHolder) {
        groupHolder = document.createElement("div");
        groupHolder.className = "smSPShieldGroupHolder";
      }

      groupHolder.appendChild(createShieldRow(shield, shieldIndex));
    }

    document.getElementById("smSPShieldProperties").style.display =
      selectedShieldIndex == -1 ? "none" : "";
    if (selectedShieldIndex == -1 || shieldGroup.shields.length == 0) {
      document.querySelector("#smSPShieldSelectLabel").textContent = "";
      document.querySelector("#smSPDeleteShield").disabled = true;
      document.querySelector("#smSPGroupShieldNext").disabled = true;
      document.querySelector("#smSPGroupShieldPrev").disabled = true;
      document.querySelector("#smSPGroupShieldUngroup").disabled = true;
      document.querySelector("#smSPUngroupAllShields").disabled = true;
      return;
    }

    // Shield Settings
    document.querySelector("#smSPDeleteShield").disabled =
      shieldGroup.shields.length === 0;
    document.querySelector("#smSPGroupShieldNext").disabled =
      selectedShieldIndex === shieldGroup.shields.length - 1 ||
      (selectedShieldIndex <= shieldGroup.shields.length - 2 &&
        shieldGroup.shields[selectedShieldIndex + 1].group !== 0);
    document.querySelector("#smSPGroupShieldPrev").disabled =
      selectedShieldIndex === 0 ||
      (selectedShieldIndex >= 1 &&
        shieldGroup.shields[selectedShieldIndex - 1].group !== 0);
    document.querySelector("#smSPGroupShieldUngroup").disabled =
      shieldGroup.shields[selectedShieldIndex].group == 0;
    document.querySelector("#smSPUngroupAllShields").disabled =
      shieldGroup.shields[selectedShieldIndex].group == 0;
    document.querySelector("#smSPShieldSelectLabel").textContent =
      `Selected: Shield ${selectedShieldIndex + 1}`;

    const shieldField = document.getElementById("spShield_routeNumber");
    shieldField.value = currentShield.routeNumber;

    const designationField = document.getElementById("spShield_designation");
    designationField.value = currentShield.designation;

    /*
    const shieldScaleField = document.getElementById("spShield_scale");
    const shieldScaleValueField = document.getElementById("spShield_scaleVal");
    shieldScaleField.value = currentShield.scale;
    shieldScaleValueField.value = currentShield.scale;

    document.getElementById("spShield_routeScale").value =
      currentShield.customShields.route_scale;

    document.getElementById("spShield_routeXOffset").value =
      currentShield.customShields.route_xOffset;

    document.getElementById("spShield_routeYOffset").value =
      currentShield.customShields.route_yOffset;

    document.getElementById("spShield_routeSpacing").value =
      currentShield.customShields.route_letterSpacing;

    document.getElementById("spShield_routeFontFamily").value =
      currentShield.customShields.route_fontFamily || "";

    document.getElementById("spShield_designationScale").value =
      currentShield.customShields.designation_scale;

    document.getElementById("spShield_designationXOffset").value =
      currentShield.customShields.designation_xOffset;

    document.getElementById("spShield_designationYOffset").value =
      currentShield.customShields.designation_yOffset;

    document.getElementById("spShield_designationSpacing").value =
      currentShield.customShields.designation_letterSpacing;

    document.getElementById("spShield_designationFontFamily").value =
      currentShield.customShields.designation_fontFamily || "";

    document.getElementById("spShield_horizMargins").value =
      currentShield.horizMargin;
    document.getElementById("spShield_vertMargins").value =
      currentShield.vertMargin;
    */

    document.querySelector("#smSPShieldImgPreview").innerHTML = "";
    let shieldElem = currentShield.createElement();
    shieldElem.style.margin = "0";
    shieldElem.style.scale = "1";

    document.querySelector("#smSPShieldImgPreview").appendChild(shieldElem);

    const editShieldClone = document
      .querySelector("#editShieldBtn")
      .cloneNode(true);
    document
      .querySelector("#editShieldBtn")
      .parentNode.replaceChild(
        editShieldClone,
        document.querySelector("#editShieldBtn"),
      );

    editShieldClone.addEventListener("click", () => {
      ShieldEditor.promptEditShield(currentShield, (updatedShield) => {
        for (const key in updatedShield) {
          if (["banners", "bannerSettings", "group"].includes(key)) {
            continue;
          }

          currentShield[key] = updatedShield[key];
        }

        updateShieldSubform();
        app.redraw();
      });
    });

    /*
    const shieldScaleInputField = document.getElementById("spShield_scale");
    shieldScaleInputField.addEventListener("input", (event) => {
      document.getElementById("spShield_scale").value =
        event.currentTarget.value;
      document.getElementById("spShield_scaleVal").value =
        event.currentTarget.value;
    });

    const shieldScaleValueInputField =
      document.getElementById("spShield_scaleVal");
    shieldScaleValueInputField.addEventListener("input", (event) => {
      document.getElementById("spShield_scale").value =
        event.currentTarget.value;
      document.getElementById("spShield_scaleVal").value =
        event.currentTarget.value;
    });
    */

    // Banners
    document.querySelector("#smSP_bannerMaster").innerHTML = "";

    if (Object.values(currentShield.banners).flat().length == 0) {
      document.querySelector("#smSP_bannerMaster").innerHTML =
        "No banners found";
    }

    const isFirstInGroup =
      shieldGroup.shields.findIndex(
        (shield) => shield.group === currentShield.group,
      ) === selectedShieldIndex;

    if (!isFirstInGroup && currentShield.group != 0) {
      document.querySelector("#smSPShieldAddBanner").disabled = true;
      document.querySelector("#smSP_bannerMaster").innerHTML =
        "Please select the FIRST shield in this shield group!";
      return;
    } else {
      document.querySelector("#smSPShieldAddBanner").disabled = false;
    }

    for (const alignment of ["top", "bottom", "left", "right"]) {
      if (!currentShield.banners[alignment]) {
        continue;
      }

      const alignmentHeader = document.createElement("div");

      const headerElem = document.createElement("span");
      headerElem.textContent = alignment.toUpperCase();
      headerElem.className = "smSPBanner_alignmentHeaderText";
      alignmentHeader.appendChild(headerElem);

      alignmentHeader.appendChild(document.createElement("br"));

      const labelForJustify = document.createElement("label");
      labelForJustify.textContent = "Align:";
      alignmentHeader.appendChild(labelForJustify);

      const justifySelect = document.createElement("select");
      justifySelect.className = "smSPShieldBannerJustify";

      for (const justify of Shield.prototype.bannerAlignments) {
        lib.appendOption(justifySelect, justify.toLowerCase(), {
          selected:
            currentShield.bannerSettings[alignment].alignment ===
            justify.toLowerCase(),
          text: justify,
        });
      }

      justifySelect.addEventListener("change", readForm);
      labelForJustify.appendChild(justifySelect);

      const labelForGap = document.createElement("label");
      labelForGap.textContent = "Spacing: (rem)";
      alignmentHeader.appendChild(labelForGap);

      const gapInput = document.createElement("input");
      gapInput.type = "number";
      gapInput.min = "0";
      gapInput.step = "0.1";
      gapInput.value = currentShield.bannerSettings[alignment].gap || 0;
      gapInput.className = "smSPShieldBannerGap";
      gapInput.addEventListener("change", readForm);
      labelForGap.appendChild(gapInput);

      alignmentHeader.className = "smSPBanner_alignmentHeader " + alignment;
      document.querySelector("#smSP_bannerMaster").appendChild(alignmentHeader);

      for (let i = 0; i < currentShield.banners[alignment].length; i++) {
        const banner = currentShield.banners[alignment][i];
        const template = document.querySelector("#smSP_templateBannerElement");
        const clone = template.content.cloneNode(true);
        const bannerElement = clone.querySelector(".smSP_bannerElement");

        bannerElement.querySelector(".smSPBanner_textContent").value =
          banner.textContent;
        bannerElement.querySelector(".smSPBanner_bgColor").value =
          banner.backgroundColor;
        bannerElement.querySelector(".smSPBanner_fontFamily").value =
          banner.fontFamily;
        bannerElement.querySelector(".smSPBanner_firstLetterScale").value =
          banner.firstLetterSize;
        bannerElement.querySelector(".smSPBanner_fontSize").value =
          banner.fontSize;
        bannerElement.querySelector(".smSPBanner_horizontalMargins").value =
          banner.horizontalMargin;
        bannerElement.querySelector(".smSPBanner_verticalMargins").value =
          banner.verticalMargin;
        bannerElement.querySelector(".smSPBanner_borderRadius").value =
          banner.borderRadius;
        bannerElement.querySelector(".smSPBanner_horizontalPadding").value =
          banner.horizontalPadding;
        bannerElement.querySelector(".smSPBanner_verticalPadding").value =
          banner.verticalPadding;
        bannerElement.querySelector(".smSPBanner_position").value = alignment;

        bannerElement
          .querySelector(".smSP_deleteBanner")
          .addEventListener("click", () => {
            currentShield.removeBanner(alignment, i);
            updateShieldSubform();
            app.redraw();
          });
        document.querySelector("#smSP_bannerMaster").appendChild(clone);
      }
    }

    const addBanner = document.querySelector("#smSPShieldAddBanner");
    const clone = addBanner.cloneNode(true);
    addBanner.parentNode.replaceChild(clone, addBanner);

    clone.addEventListener("click", () => {
      currentShield.addBanner(
        document.querySelector("#smSPShieldBannerAlignment").value,
      );
      updateShieldSubform();
      app.redraw();
    });
  };

  const updateGuideArrowsSubform = () => {
    const panel = app.getCurrentPanel();
    const sign = panel.sign;
    const arrows = sign.arrows[sign.arrows.arrowMode];

    document.querySelector('a[data-tab="sMStandardArrows"]').style.display =
      sign.arrows.arrowMode == "standard" ? "" : "none";
    document.querySelector('a[data-tab="sMAPL"]').style.display =
      sign.arrows.arrowMode == "apl" ? "" : "none";
    document.querySelector('a[data-tab="sMDiagrammic"]').style.display =
      sign.arrows.arrowMode == "diagrammic" ? "" : "none";

    for (const e of document.querySelectorAll(".sMA_typeSelect > button")) {
      if (e.id.split("sMA_type")[1].toLowerCase() === sign.arrows.arrowMode) {
        e.classList.add("selected");
      } else {
        e.classList.remove("selected");
      }
    }

    if (sign.arrows.arrowMode == "standard") {
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
      document.getElementById("hideExitArrow").checked =
        panel.sign.hideExitArrow;
      document.getElementById("exitOnlyPadding").value =
        panel.sign.exitOnlyPadding;
      document.getElementById("paddingValue").textContent =
        panel.sign.exitOnlyPadding;

      // --- Other Symbols & Shields ---
      document.getElementById("oSNum").style.display =
        panel.sign.otherSymbol !== "None" ? "block" : "none";
      document.getElementById("oSNum").value = panel.sign.oSNum;
      document.getElementById("guideArrowLanes").value =
        panel.sign.guideArrowLanes;

      if (document.getElementById("useCanadianDownArrows")) {
        document.getElementById("useCanadianDownArrows").checked =
          panel.sign.useCanadianDownArrows;
      }
      return;
    }

    if (sign.arrows.arrowMode == "apl") {
      document.querySelector("#smAPL_HorizPadding").value =
        arrows.horizontalPadding;
      document.querySelector("#smAPL_VertTopPadding").value =
        arrows.verticalTopPadding;
      document.querySelector("#smAPL_VertBottomPadding").value =
        arrows.verticalBottomPadding;
      document.querySelector("#sMAPL_APLCat").innerHTML = "";

      let subpanels = app.getCurrentPanel().sign.subPanels;
      for (let i = 0; i <= subpanels.length - 1; i += 0.5) {
        let aplList = arrows.subpanels[i] || [];
        const aplContTemplate = document
          .querySelector("#smAPL_templateAPLContainer")
          .content.cloneNode(true);
        const aplContHolder = aplContTemplate.querySelector(
          ".smAPLCat_container",
        );

        aplContHolder.querySelector(".smAPLCat_title").textContent =
          i % 1 == 0 ? "Subpanel " + (i + 1) : "Divider";

        if (i % 1 != 0) {
          aplContHolder.querySelector(".smAPLCat_justifyLabel").remove();
          aplContHolder.querySelector(".smAPLCat_justifyAPLs").remove();
        } else {
          aplContHolder.querySelector(".smAPLCat_justifyAPLs").disabled =
            !arrows.subpanelConfigs[i];
          if (arrows.subpanelConfigs[i]) {
            aplContHolder.querySelector(".smAPLCat_justifyAPLs").value =
              arrows.subpanelConfigs[i].justify;
          }
        }

        for (let j = 0; j < aplList.length; j++) {
          const arrow = aplList[j];

          const aplTemplate = document
            .querySelector("#sMAPL_templateAPLItem")
            .content.cloneNode(true);
          const aplHolder = aplTemplate.querySelector(".smAPLCat_apl");

          aplHolder.querySelector(
            ".smAPLCat_aplSelectHolder",
          ).dataset.selectedOption = arrow.arrowVariant;
          const arrowSelectImage = aplHolder.querySelector(".smAPL_arrowImage");
          const arrowSelectLabel = aplHolder.querySelector(".smAPL_arrowLabel");
          const arrowDefinition =
            APLArrow.prototype.arrowTypes[arrow.arrowVariant];
          arrowSelectImage.src = `assets/arrow/${arrowDefinition.asset}`;
          arrowSelectImage.classList.toggle("flipped", arrowDefinition.flipped);
          arrowSelectLabel.textContent = arrow.arrowVariant;
          aplHolder.querySelectorAll(".smAPL_arrowOption").forEach((option) => {
            option.classList.toggle(
              "selected",
              option.dataset.arrow === arrow.arrowVariant,
            );
          });
          aplHolder.querySelector(".sMAPL_size").value = arrow.size;
          aplHolder.querySelector(".sMAPL_offset").value = arrow.offset;
          aplHolder.querySelector(".smAPL_exitOnlyCheck").checked =
            arrow.exitOnlyEnabled;
          aplHolder.querySelector(".smAPL_leftText").value =
            arrow.exitTextContent[0];
          aplHolder.querySelector(".smAPL_rightText").value =
            arrow.exitTextContent[1];
          aplHolder.querySelector(".smAPL_bgColor").value = arrow.exitBGColor;
          aplHolder.querySelector(".smAPL_font").value = arrow.fontFamily;
          aplHolder.querySelector(".smAPL_fontSize").value = arrow.exitTextSize;
          aplHolder.querySelector(".smAPL_roundness").value =
            arrow.exitTextRoundness;
          aplHolder.querySelector(".smAPL_horizontalPadding").value =
            arrow.exitTextHorizontalPadding;
          aplHolder.querySelector(".smAPL_leftMargins").value =
            arrow.exitTextMargins[0];
          aplHolder.querySelector(".smAPL_rightMargins").value =
            arrow.exitTextMargins[1];
          aplHolder.querySelector(".smAPLCat_aplRow3").style.display =
            arrow.exitOnlyEnabled ? "" : "none";

          aplContHolder
            .querySelector(".smAPLCat_aplList")
            .appendChild(aplTemplate);

          aplHolder
            .querySelector(".smAPL_Delete")
            .addEventListener("click", () => {
              app.removeAPLArrow(i, j);
            });
        }

        document.querySelector("#smAPL_APLCat").appendChild(aplContTemplate);

        if (i % 1 != 0 && aplList.length > 0) {
          aplContHolder.querySelector(".smAPLCat_addArrow").remove();
        } else {
          aplContHolder
            .querySelector(".smAPLCat_addArrow")
            .addEventListener("click", () => {
              app.addAPLArrow(i);
            });
        }
      }

      return;
    }

    if (sign.arrows.arrowMode == "diagrammic") {
      if (
        !document.querySelector("#sMDiagrammicOpenEditor").dataset.connected
      ) {
        document.querySelector("#sMDiagrammicOpenEditor").dataset.connected =
          true;
        document
          .querySelector("#sMDiagrammicOpenEditor")
          .addEventListener("click", async () => {
            await DiagramDrawing.promptDraw(
              (retValue) => {
                if (retValue) {
                  arrows.diagramData = retValue;
                  arrows.preset = "None";
                  document.querySelector("#sMDiagrammicPreset").value = "None";
                  formHandler.readForm();
                }
              },
              false,
              sign.arrows.diagrammic.diagramData,
            );
          });

        document
          .querySelector("#sMDiagrammicOpenEditorPresets")
          .addEventListener("click", async () => {
            await DiagramDrawing.promptDraw(
              (retValue) => {
                if (retValue) {
                  arrows.diagramData = retValue;
                  arrows.preset = "None";
                  document.querySelector("#sMDiagrammicPreset").value = "None";
                  formHandler.readForm();
                }
              },
              true,
              sign.arrows.diagrammic.diagramData,
            );
          });
      }

      const diagrammicPreset = document.querySelector("#sMDiagrammicPreset");
      const populatePresetOptions = async () => {
        const presetNames = await DiagrammicLibrary.getAllDiagramNames();
        diagrammicPreset.innerHTML = "";

        lib.appendOption(diagrammicPreset, "None", {
          selected: arrows.preset === "None",
          text: "None",
        });

        for (const presetName of presetNames) {
          lib.appendOption(diagrammicPreset, presetName, {
            selected: arrows.preset === presetName,
            text: presetName,
          });
        }
      };

      populatePresetOptions();

      document.querySelector("#sMDiagrammicScale").value = arrows.scale;
      return;
    }
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

  const removeExitTabHelper = () => {
    if (app.vars.currentlySelectedExitTabIndex == -1) {
      app.removeExitTabRow();
    } else {
      app.deleteExitTab();
    }
  };

  const duplicateExitTabHelper = () => {
    if (app.vars.currentlySelectedExitTabIndex == -1) {
      app.duplicateExitTabRow();
    } else {
      app.duplicateExitTab();
    }
  };

  return {
    init: initialize,
    readForm,
    updateForm,
    updateShieldSubform,
    updateExitTabSubform,
    zoom,
    removeExitTabHelper,
    duplicateExitTabHelper,
    updateGuideArrowsSubform,
    vars: {
      get zoomLevel() {
        return zoomLevel;
      },
    },
  };
})();
