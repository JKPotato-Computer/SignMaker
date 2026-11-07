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

    post.showPost = postConfiguration.showPost || post.showPost;

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
      textElementConfiguration.defaultFont || ControlTextElement.defaultFont;

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
    post = app.getPost();
    HistoryManager.addToUndoStack(post);

    const form = document.forms[0];
    const currentPanel = app.getCurrentPanel();
    const subPanel =
      currentPanel.sign.subPanels[app.vars.currentlySelectedSubPanelIndex];

    // Post
    post.polePosition = form["postPosition"].value;
    post.variant = form["postVariant"].value;
    post.color = form["postColor"].value;
    post.showPost = form["showPost"].checked;
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

    // preliminary set post
    app.setPost(post);

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
        exitTabRow.padding = parseFloat(form["sMET_Padding"].value);
        exitTabRow.panelEdgeType = form["sMET_PanelEdgeType"].value;
        exitTabRow.position = form["sMET_Position"].value;
        exitTabRow.marginBottom = parseFloat(form["smET_marginBottom"].value);
        exitTabRow.independentWidth = form["smET_independentWidth"].checked;
        exitTabRow.hideTopBorder = form["smET_hideTopBorder"].checked;
        exitTabRow.hideBottomBorder = form["smET_hideBottomBorder"].checked;
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
        exitTab.roundBottomBorder = form["sMET_roundBottomBorder"].checked;
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
        exitTab.shieldsGap = parseFloat(form["smET_shieldGap"].value);
        exitTab.shieldsDirection = form["smET_shieldsDirection"].value;
        exitTab.shieldWordSpacing = form["smET_shieldWordSpacing"].value;

        if (exitTab.width.toLowerCase().includes("percent")) {
          exitTab.widthSize = Math.min(
            parseFloat(form["sMET_widthSize"].value),
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
          exitTab.variantSettings.partialLeft.fontFamily =
            form["smET_partialLeftFontFamily"].value;
          exitTab.variantSettings.partialLeft.borderRadius =
            form["smET_partialLeftBorderRadius"].value;
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
          const regularIconDropdown = document.querySelector(
            "#sMET_variantRegularIcon",
          );
          const selectedRegularIcon =
            regularIconDropdown.dataset.selectedOption;
          exitTab.variantSettings.icon.iconType =
            selectedRegularIcon.startsWith("custom:") ? "custom" : "preset";
          exitTab.variantSettings.icon.icon = selectedRegularIcon.startsWith(
            "custom:",
          )
            ? selectedRegularIcon.slice("custom:".length)
            : selectedRegularIcon;
          exitTab.variantSettings.icon.iconData =
            regularIconDropdown.dataset.customImageData || "";
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
            form["sMET_variantIsSquareIcon"].checked;
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
          exitTab.variantSettings.icon.fontSize = parseFloat(
            form["smET_variantFontSize"].value,
          );
        }

        if (exitTab.variant == "FullLeft") {
          exitTab.variantSettings.fullLeft.minimumWidth =
            form["smET_fullLeftMinimumWidth"].value;
          exitTab.variantSettings.fullLeft.fontFamily =
            form["smET_fullLeftFontFamily"].value;
          exitTab.variantSettings.fullLeft.letterSpacing =
            form["smET_fullLeftLetterSpacing"].value;
          exitTab.variantSettings.fullLeft.bottomSpacing =
            form["smET_fullLeftBottomSpacing"].value;
          exitTab.variantSettings.fullLeft.flipJustify =
            form["smET_fullLeftFlipJustify"].checked;
        }

        exitTab.variant = document
          .querySelector("div.sMET_typeSelect > button.selected")
          .id.split("sMET_type")[1];
      }
    }

    if (
      app.getCurrentBlockElem().constructor.name === "ShieldGroupElement" &&
      app.vars.currentlySelectedShieldIndex != -1 &&
      app.getCurrentBlockElem().shields[app.vars.currentlySelectedShieldIndex]
    ) {
      const currentShield =
        app.getCurrentBlockElem().shields[
          app.vars.currentlySelectedShieldIndex
        ];

      currentShield.routeNumber = form["spShieldQuick_routeNumber"].value;
      currentShield.designation = form["spShieldQuick_designation"].value;
      currentShield.scale = parseFloat(form["spShieldQuick_scale"].value);

      currentShield.horizMargin = form["spShieldQuick_horizMargins"].value;
      currentShield.vertMargin = form["spShieldQuick_vertMargins"].value;

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
        currentShield.bannerSettings[alignment].gap = parseFloat(
          bannerAlignmentElem.querySelector(".smSPShieldBannerGap").value,
        );

        if (alignment == "left" || alignment == "right") {
          currentShield.bannerSettings[alignment].inset = parseFloat(
            bannerAlignmentElem.querySelector(".smSPShieldBannerInset").value,
          );
        }

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

    // Control Text Revision
    const currentBlockElem = app.getCurrentBlockElem();
    const blockElemType =
      Control.prototype.blockInternalElements[
        Control.prototype.blockToClassElems.getElem(currentBlockElem)
      ];

    if (blockElemType === "sdArrow") {
      const standardArrow = currentBlockElem.standardArrow;
      standardArrow.arrow =
        document.getElementById("sdArrow_arrow").dataset.selectedOption;
      standardArrow.rotation =
        document.getElementById("sdArrow_rotation").value;
      standardArrow.size = document.getElementById("sdArrow_size").value;
      standardArrow.marginHorizontal = document.getElementById(
        "sdArrow_marginHorizontal",
      ).value;
      standardArrow.marginVertical = document.getElementById(
        "sdArrow_marginVertical",
      ).value;
      standardArrow.flip = document.getElementById("sdArrow_flip").checked;
    }

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
      const iconDropdown = document.querySelector(".sdIconDropdown");
      const selectedIcon = iconDropdown.dataset.selectedOption;
      if (selectedIcon.startsWith("custom:")) {
        currentBlockElem.iconType = "custom";
        currentBlockElem.icon = selectedIcon.slice("custom:".length);
        currentBlockElem.iconData = iconDropdown.dataset.customImageData;
      } else {
        currentBlockElem.iconType = "preset";
        currentBlockElem.icon = selectedIcon || currentBlockElem.icon;
        currentBlockElem.iconData = "";
      }
    } else if (currentBlockElem.constructor.name === "TollLogoElement") {
      currentBlockElem.logo =
        document.querySelector("#sdTollLogoHolder").dataset.selectedOption ||
        currentBlockElem.logo;
    }

    let blockElements =
      app.vars.currentlySelectedGroupIndex >= 0
        ? app.getSelectedBlockGroup().blockElements
        : subPanel.blockElements;

    blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].topPadding = document.querySelector("#sdBlock_topPadding").value;
    blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].bottomPadding = document.querySelector("#sdBlock_bottomPadding").value;

    blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].topMargin = document.querySelector("#sdBlock_topMargin").value;
    blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].bottomMargin = document.querySelector("#sdBlock_bottomMargin").value;

    blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].backgroundColor = document.querySelector(
      "#sdBlock_backgroundColor",
    ).value;
    blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].backgroundFullWidth = document.querySelector(
      "#sdBlock_backgroundFullWidth",
    ).checked;
    blockElements.blockProperties[app.vars.currentlySelectedRowIndex].width =
      document.querySelector("#sdBlock_width").value;
    blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].stretchLeft = document.querySelector("#sdBlock_stretchLeft").checked;
    blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].stretchCenter = document.querySelector("#sdBlock_stretchCenter").checked;
    blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].stretchRight = document.querySelector("#sdBlock_stretchRight").checked;

    blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].leftPadding = document.querySelector("#sdBlock_leftPadding").value;
    blockElements.blockProperties[
      app.vars.currentlySelectedRowIndex
    ].rightPadding = document.querySelector("#sdBlock_rightPadding").value;

    if (
      !readProperties ||
      (readProperties && !readProperties["aplSubpanelConfigChange"])
    ) {
      subPanel.laneWidth = parseInt(form["subPanelLength"].value);
    }

    subPanel.verticalAlign = form["subpanelAlign"].value;
    if (
      app.vars.currentlySelectedSubPanelIndex !=
        app.getCurrentPanel().sign.subPanels.length - 1 &&
      app.getCurrentPanel().sign.subPanels.length >= 2
    ) {
      subPanel.dividerHeight = form["subpanelDividerHeight"].value;
      subPanel.dividerHeightUnit = form["subpanelDividerHeightUnit"].value;
    }

    // guide arrows
    currentPanel.sign.arrows.arrowMode = document
      .querySelector("div.sMA_typeSelect > button.selected")
      .id.split("sMA_type")[1]
      .toLowerCase();

    if (currentPanel.sign.arrows.arrowMode == "standard") {
      const standardArrowConfig = currentPanel.sign.arrows.standard;
      const exitOnlyConfigs = standardArrowConfig.exitOnlyConfigs;

      if (standardArrowConfig.variant == "Custom") {
        standardArrowConfig.customConfig.gap = form["standardArrows_gap"].value;
        standardArrowConfig.customConfig.justify =
          form["standardArrows_justify"].value;
        standardArrowConfig.customConfig.verticalTopPadding =
          form["standardArrows_verticalTopPadding"].value;
        standardArrowConfig.customConfig.verticalBottomPadding =
          form["standardArrows_verticalBottomPadding"].value;
        standardArrowConfig.customConfig.horizontalPadding =
          form["standardArrows_horizontalPadding"].value;

        const standardArrow =
          currentPanel.sign.arrows.standard.arrowList[
            app.vars.currentlySelectedStandardArrow
          ];
        if (standardArrow) {
          standardArrow.arrow = document.querySelector(
            "#guideStandardArrow",
          ).dataset.selectedOption;
          standardArrow.rotation = document.querySelector(
            "#guideStandardArrow_rotation",
          ).value;
          standardArrow.size = document.querySelector(
            "#guideStandardArrow_size",
          ).value;
          standardArrow.marginHorizontal = document.querySelector(
            "#guideStandardArrow_marginHorizontal",
          ).value;
          standardArrow.marginVertical = document.querySelector(
            "#guideStandardArrow_marginVertical",
          ).value;
          standardArrow.flip = document.querySelector(
            "#guideStandardArrow_flip",
          ).checked;
        }
      } else if (standardArrowConfig.variant.includes("Exit Only")) {
        // set arrows
        const exitOnlyArrow = exitOnlyConfigs.arrow;
        exitOnlyArrow.arrow =
          document.querySelector("#exitOnlyArrowType").dataset.selectedOption;
        exitOnlyArrow.size = form["exitOnlyArrowSize"].value;
        exitOnlyArrow.rotation = form["exitOnlyArrowRotation"].value;
        exitOnlyArrow.flip = form["exitOnlyArrowFlip"].checked;

        // set exit only configs
        exitOnlyConfigs.exitOnlyText = form["exitOnlyText"].value;
        exitOnlyConfigs.exitOnlyTextPosition =
          form["exitOnlyTextPosition"].value;
        exitOnlyConfigs.horizontalPadding =
          form["exitOnlyHorizontalPadding"].value;
        exitOnlyConfigs.verticalPadding = form["exitOnlyVerticalPadding"].value;
        exitOnlyConfigs.fontFamily = form["exitOnlyFontFamily"].value;
        exitOnlyConfigs.fontSize = form["exitOnlyFontSize"].value;
        exitOnlyConfigs.wordSpacing = form["exitOnlyWordSpacing"].value;
        exitOnlyConfigs.letterSpacing = form["exitOnlyLetterSpacing"].value;
        exitOnlyConfigs.borderMode = form["exitOnlyBorderMode"].value;
        exitOnlyConfigs.arrowLocation = form["arrowLocations"].value;
        exitOnlyConfigs.numArrows = parseInt(form["exitOnlyArrowCount"].value);
        exitOnlyConfigs.gap = parseFloat(form["exitOnlyGap"].value);

        exitOnlyConfigs.splitHorizontalPadding =
          form["splitExitOnlyHorizPadding"].value;
        exitOnlyConfigs.splitVerticalPadding =
          form["splitExitOnlyVertPadding"].value;
        exitOnlyConfigs.splitBorderRadius =
          form["splitExitOnlyBorderRadius"].value;
        exitOnlyConfigs.exitOnlyOutsideGap = parseFloat(
          form["exitOnlyOutsideGap"].value,
        );
        exitOnlyConfigs.displayOutsideArrow =
          form["exitOnlyDisplayOutsideArrow"].checked;

        exitOnlyConfigs.backgroundColor = form["exitOnlyBGColor"].value;
        exitOnlyConfigs.textGap = parseFloat(form["exitOnlyTextGap"].value);
        exitOnlyConfigs.roundAllCorners = form["exitOnlyRoundCorners"].checked;
      }

      standardArrowConfig.variant = form["guideArrow"].value;

      // currentPanel.sign.otherSymbol = form["otherSymbol"].value;
      // currentPanel.sign.oSNum = form["oSNum"].value;
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

        if (
          i % 1 == 0 &&
          readProperties &&
          readProperties["aplSubpanelConfigChange"]
        ) {
          let subpanel = currentPanel.sign.subPanels[i];
          subpanel.laneWidth = parseInt(
            aplContainer.querySelector(".smAPLCat_numLanes").value,
          );
          console.log(i + " " + subpanel.laneWidth);
        }

        if (!aplContainer || !aplList) {
          continue;
        }

        if (i % 1 == 0 && apl.subpanelConfigs[i]) {
          apl.subpanelConfigs[i].justify = aplContainer.querySelector(
            ".smAPLCat_justifyAPLs",
          ).value;
        } else if (
          i % 1 != 0 &&
          apl.subpanelConfigs[i] &&
          currentPanel.sign.lanePanelSize == 0
        ) {
          apl.subpanelConfigs[i].minWidth = parseFloat(
            aplContainer.querySelector(".smAPLCat_minWidth").value,
          );
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
    post = app.getPost();

    const panel = app.getCurrentPanel();
    const sign = panel.sign.subPanels[app.vars.currentlySelectedSubPanelIndex];

    const panelList = document.getElementById("panelList");
    const subPanelList = document.getElementById("subPanelList");
    const exitTabList = document.getElementById("exitTabList");

    let selectedPanelLabel = app.vars.currentlySelectedPanelIndex + 1;
    let selectedPanelName = "";
    while (selectedPanelLabel > 0) {
      selectedPanelLabel--;
      selectedPanelName =
        String.fromCharCode(65 + (selectedPanelLabel % 26)) + selectedPanelName;
      selectedPanelLabel = Math.floor(selectedPanelLabel / 26);
    }
    document.querySelector("#currentlySelectedPanel").textContent =
      app.vars.currentlySelectedPanelIndex == -1
        ? `Group ${app.vars.currentlySelectedPanelGroupIndex + 1}`
        : `Panel ${selectedPanelName}`;

    document.getElementById("postPosition").value = post.polePosition;
    document.getElementById("postColor").value = post.color;
    document.getElementById("showPost").checked = post.showPost;
    document.getElementById("offsetPost").checked = post.offsetPost;
    document.getElementById("postCornerRadius").value = post.cornerRadius;
    document.getElementById("postSpacing").value = post.spacing || 1;
    document.getElementById("panelSpacing").value = post.panelSpacing;
    document.getElementById("panelSpacingValue").value = post.panelSpacing;
    document.getElementById("postThicknessValue").value = post.thickness;

    // mutcd variant thing
    let variant = post.mutcdVariant;

    document.querySelector("#smSettings_selectedMUTCDVariant").textContent =
      `Selected: ${MUTCDVariants[variant].VariantInfo.FullName}`;

    for (const option of document.querySelectorAll(
      "#smSettings_MUTCDGallery .mutcdImage",
    )) {
      if (option.dataset.variant === variant) {
        option.classList.add("selected");
      } else {
        option.classList.remove("selected");
      }
    }

    panelList.innerHTML = "";
    exitTabList.innerHTML = "";
    subPanelList.innerHTML = "";

    for (
      let panelGroupIndex = 0;
      panelGroupIndex < post.panels.length;
      panelGroupIndex++
    ) {
      const panelGroup = document.createElement("div");
      panelGroup.className =
        "panelGroup" +
        (app.vars.currentlySelectedPanelGroupIndex == panelGroupIndex
          ? " active"
          : "");

      const panelGroupButton = document.createElement("button");
      panelGroupButton.type = "button";
      panelGroupButton.className = "panelGroupButton";
      panelGroupButton.textContent =
        "Group " +
        (panelGroupIndex + 1) +
        (app.vars.currentlySelectedPanelGroupIndex == panelGroupIndex
          ? ""
          : " (" + post.panels[panelGroupIndex].length + ")");
      panelGroupButton.addEventListener("click", () => {
        app.changeEditingPanelGroup(panelGroupIndex);
      });
      panelGroup.appendChild(panelGroupButton);

      for (
        let panelIndex = 0;
        panelIndex <= post.panels[panelGroupIndex].length;
        panelIndex++
      ) {
        const panelButton = document.createElement("button");
        panelButton.type = "button";
        panelButton.className = "panelListButton";

        if (panelIndex < post.panels[panelGroupIndex].length) {
          let panelLabel = panelIndex + 1;
          let panelName = "";
          while (panelLabel > 0) {
            panelLabel--;
            panelName = String.fromCharCode(65 + (panelLabel % 26)) + panelName;
            panelLabel = Math.floor(panelLabel / 26);
          }
          panelButton.textContent = "Panel " + panelName;
          if (
            app.vars.currentlySelectedPanelGroupIndex == panelGroupIndex &&
            app.vars.currentlySelectedPanelIndex == panelIndex
          ) {
            panelButton.classList.add("active");
          }
          panelButton.addEventListener("click", () => {
            app.changeEditingPanelGroup(panelGroupIndex);
            app.changeEditingPanel(panelIndex);
          });
        } else if (
          app.vars.currentlySelectedPanelGroupIndex == panelGroupIndex
        ) {
          panelButton.textContent = "+ Add Panel";
          panelButton.className = "panelListButton newPanelButton";
          panelButton.addEventListener("click", app.newPanel);
        }
        panelGroup.appendChild(panelButton);
      }
      panelList.appendChild(panelGroup);
    }

    for (
      let subPanelIndex = 0, subPanelsLength = panel.sign.subPanels.length;
      subPanelIndex < subPanelsLength;
      subPanelIndex++
    ) {
      const subPanelButton = document.createElement("button");
      subPanelButton.textContent = subPanelIndex + 1;
      subPanelButton.className =
        "smSubPanelBtn " +
        (app.vars.currentlySelectedSubPanelIndex == subPanelIndex
          ? "active"
          : "");

      subPanelButton.addEventListener("click", () => {
        app.changeEditingSubPanel(subPanelIndex);
        subPanelButton.className = "smSubPanelBtn active";
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

    if (
      app.vars.currentlySelectedSubPanelIndex !=
        app.getCurrentPanel().sign.subPanels.length - 1 &&
      app.getCurrentPanel().sign.subPanels.length >= 2
    ) {
      document.getElementById("subpanelDividerHeight").value =
        app.getCurrentSubPanel().dividerHeight;
      document.getElementById("subpanelDividerHeightUnit").value =
        app.getCurrentSubPanel().dividerHeightUnit;
      document.getElementById("subpanelDividerHeight").style.display = "";
      document.getElementById("subpanelDividerHeightUnit").style.display = "";
      document.querySelector(
        'label[for="subpanelDividerHeight"]',
      ).style.display = "";
    } else {
      document.getElementById("subpanelDividerHeight").style.display = "none";
      document.getElementById("subpanelDividerHeightUnit").style.display =
        "none";
      document.querySelector(
        'label[for="subpanelDividerHeight"]',
      ).style.display = "none";
    }

    // Shields
    updateShieldSubform();

    // Icons
    if (app.getCurrentBlockElem().constructor.name === "IconElement") {
      const currentIcon = app.getCurrentBlockElem();
      const iconDropdown = document.querySelector(".sdIconDropdown");
      iconDropdown.dataset.customImageData = currentIcon.iconData || "";
      iconDropdown.dataset.selectedOption =
        currentIcon.iconType === "custom"
          ? `custom:${currentIcon.icon}`
          : currentIcon.icon;
    } else if (
      app.getCurrentBlockElem().constructor.name === "TollLogoElement"
    ) {
      const currentLogo = app.getCurrentBlockElem().logo;
      document.querySelector("#sdTollLogoHolder").dataset.selectedOption =
        currentLogo;
    }

    // Control Text Revision
    const sMSPTextList = document.querySelector("#sMSPTextList");
    sMSPTextList.innerHTML = "";
    document.querySelector("#SMSPSelectLabel").textContent =
      "Selected: Row " +
      (app.vars.currentlySelectedRowIndex + 1) +
      "; Block " +
      (app.vars.currentlySelectedBlockIndex + 1);
    document.querySelector("#sMSPElementSelect").value =
      app.getCurrentBlockElem().constructor.name;
    document.querySelector("#sMSPDeleteSelectedRow").disabled =
      app.getCurrentBlockElements().rows.length == 1;
    document.querySelector("#smSPDeleteSelectedBlock").disabled =
      app.getCurrentBlockElements().rows.length == 1 &&
      app.getCurrentBlockRow().length == 1;
    document.querySelector("#smSPExitGroupedBlock").disabled =
      app.vars.currentlySelectedGroupIndex == -1;

    for (let row = 0; row < app.getCurrentBlockElements().rows.length; row++) {
      const sMControlRow = document.createElement("div");
      sMControlRow.dataset.dataRow = row.toString();
      sMControlRow.className =
        "sMControlRow" +
        (row == app.vars.currentlySelectedRowIndex ? " selected" : "");

      for (
        let item = 0;
        item < app.getCurrentBlockElements().rows[row].length;
        item++
      ) {
        const blockElement = app.getCurrentBlockElements().rows[row][item];

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
        textEditorBlock.addEventListener("click", () => {
          console.log(
            textEditorBlock.dataset.row,
            textEditorBlock.dataset.block,
          );
          app.setSelectedRow(parseInt(textEditorBlock.dataset.row));
          app.setSelectedControlElem(parseInt(textEditorBlock.dataset.block));
        });
      }

      sMSPTextList.appendChild(sMControlRow);
      sMControlRow.addEventListener("click", () => {
        app.setSelectedRow(parseInt(sMControlRow.dataset.dataRow));
      });
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
      const standardArrow = currentBlockElem.standardArrow;
      const arrowFields = [
        "arrow",
        "rotation",
        "size",
        "marginHorizontal",
        "marginVertical",
        "flip",
      ];

      for (const propertyName of arrowFields) {
        const element = document.getElementById(`sdArrow_${propertyName}`);
        if (propertyName === "arrow") {
          document.getElementById("sdArrow_arrow").dataset.selectedOption =
            standardArrow.arrow;
        } else if (element.type == "checkbox") {
          element.checked = standardArrow[propertyName];
        } else {
          element.value = standardArrow[propertyName];
        }
        element.addEventListener(
          element.type === "range" ? "input" : "change",
          readForm,
        );
      }
      document.querySelectorAll(".sdArrow_rotationPreset").forEach((button) => {
        button.classList.toggle(
          "activated",
          standardArrow.rotation == parseFloat(button.dataset.degrees),
        );
      });
    }

    for (const propertyName in currentBlockElem) {
      const elementId = `${blockElemType}_${propertyName}`;
      const element = document.getElementById(elementId);
      const displayElement = document.getElementById(elementId + "Val");
      if (element) {
        if (element.type === "checkbox") {
          element.checked = currentBlockElem[propertyName];
          element.addEventListener("change", readForm);
        } else if (element.type === "radio") {
          if (element.value === currentBlockElem[propertyName].toString()) {
            element.checked = true;
          }
          element.addEventListener("change", readForm);
        } else if (element.tagName === "SELECT") {
          element.value = currentBlockElem[propertyName];
          element.addEventListener("blur", readForm);
        } else {
          element.value = currentBlockElem[propertyName];
          element.addEventListener(
            element.type === "text" ? "input" : "change",
            readForm,
          );
          if (
            element.type === "range" &&
            displayElement &&
            !displayElement.dataset.paired
          ) {
            displayElement.dataset.paired = "true";
            element.addEventListener("input", () => {
              displayElement.value = element.value;
            });
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

    document.querySelector("#sdBlock_topPadding").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].topPadding;

    document.querySelector("#sdBlock_bottomPadding").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].bottomPadding;

    document.querySelector("#sdBlock_leftPadding").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].leftPadding;
    document.querySelector("#sdBlock_rightPadding").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].rightPadding;

    document.querySelector("#sdBlock_topPaddingVal").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].topPadding;
    document.querySelector("#sdBlock_bottomPaddingVal").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].bottomPadding;

    document.querySelector("#sdBlock_leftPaddingVal").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].leftPadding;
    document.querySelector("#sdBlock_rightPaddingVal").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].rightPadding;

    document.querySelector("#sdBlock_topMargin").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].topMargin;
    document.querySelector("#sdBlock_bottomMargin").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].bottomMargin;

    document.querySelector("#sdBlock_topMarginVal").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].topMargin;
    document.querySelector("#sdBlock_bottomMarginVal").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].bottomMargin;

    document.querySelector("#sdBlock_backgroundColor").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].backgroundColor;

    document.querySelector("#sdBlock_backgroundFullWidth").checked =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].backgroundFullWidth;

    document.querySelector("#sdBlock_width").value =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].width;

    document.querySelector("#sdBlock_stretchLeft").checked =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].stretchLeft;
    document.querySelector("#sdBlock_stretchCenter").checked =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].stretchCenter;
    document.querySelector("#sdBlock_stretchRight").checked =
      app.getCurrentBlockElements().blockProperties[
        app.vars.currentlySelectedRowIndex
      ].stretchRight;

    updateGuideArrowsSubform();

    toggleVisibility(
      document.querySelector("#sdCtrlText_useNumeralFormatting"),
      [
        document.querySelector("#sdCtrlText_numeralFormattingSize"),
        document.querySelector("#sdCtrlText_spaceNumeralsLetters"),
      ],
    );
    toggleVisibility(
      document.querySelector("#sdActionMessage_useNumeralFormatting"),
      [
        document.querySelector("#sdActionMessage_numeralFormattingSize"),
        document.querySelector("#sdActionMessage_spaceNumeralsLetters"),
      ],
    );
    toggleVisibility(
      document.querySelector("#sdAdvisory_useNumeralFormatting"),
      [
        document.querySelector("#sdAdvisory_numeralFormattingSize"),
        document.querySelector("#sdAdvisory_spaceNumeralsLetters"),
      ],
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
    toggleVisibility(document.querySelector("#sdAdvisory_border"), [
      document.querySelector("#sdAdvisory_borderWidth"),
      document.querySelector("#sdAdvisory_borderColor"),
    ]);
    toggleVisibility(document.querySelector("#sdIcon_border"), [
      document.querySelector("#sdIcon_borderColor"),
      document.querySelector("#sdIcon_borderRadius"),
    ]);
    toggleVisibility(document.querySelector("#sdTollLogo_background"), [
      document.querySelector(".sdTollLogo_background"),
    ]);
    toggleVisibility(document.querySelector("#sdTollLogo_showOnlyBlock"), [
      document.querySelector(".sdTollLogo_showOnlyBlock"),
    ]);
    toggleVisibility(document.querySelector("#sMET_enlargeNumerals"), [
      document.querySelector("#sMET_enlargeNumeralsSize"),
    ]);

    if (
      document.querySelector("#sdElectronicSign_textFormat").value ==
      "Full Text"
    ) {
      document.querySelector("#sdElectronicSign_formatSize").style.display =
        "none";
      document.querySelector("#sdElectronicSign_glow").style.display = "";
      document.querySelector(
        'label[for="sdElectronicSign_glow"]',
      ).style.display = "";
    } else {
      document.querySelector("#sdElectronicSign_formatSize").style.display = "";
      document.querySelector("#sdElectronicSign_glow").style.display = "none";
      document.querySelector(
        'label[for="sdElectronicSign_glow"]',
      ).style.display = "none";
    }

    document.querySelector("#sdGroup_formatSize").style.display =
      document.querySelector("#sdGroup_boxFormat").value == "Normal"
        ? "none"
        : "";
    toggleVisibility(document.querySelector("#sdGroup_border"), [
      document.querySelector("#sdGroup_borderWidth"),
      document.querySelector("#sdGroup_borderColor"),
    ]);
  };

  const updateExitTabSubform = () => {
    const panel = app.getCurrentPanel();
    const currentExitTabRow =
      panel.exitTabs[app.vars.currentlySelectedExitTabRowIndex];

    if (!currentExitTabRow) {
      document.querySelector("#sMExitTabGroupProperties").style.display =
        "none";
      return;
    } else {
      document.querySelector("#sMExitTabGroupProperties").style.display = "";
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
      document.querySelector("#sMET_Padding").value = currentExitTabRow.padding;
      document.querySelector("#smET_marginBottom").value =
        currentExitTabRow.marginBottom;

      document.querySelector("#smET_marginBottom").style.display =
        currentExitTabRow.panelEdgeType == "extend" ? "" : "none";
      document.querySelector("label[for='smET_marginBottom']").style.display =
        currentExitTabRow.panelEdgeType == "extend" ? "" : "none";

      document.querySelector("#smET_independentWidth").checked =
        currentExitTabRow.independentWidth;

      document.querySelector("#smET_independentWidth").style.display = [
        "within",
        "left",
        "right",
      ].includes(currentExitTabRow.position)
        ? "none"
        : "";
      document.querySelector(
        'label[for="smET_independentWidth"]',
      ).style.display = ["within", "left", "right"].includes(
        currentExitTabRow.position,
      )
        ? "none"
        : "";

      let isFirst = false;
      for (const exitTab of panel.exitTabs) {
        if (
          exitTab == currentExitTabRow &&
          (exitTab.position == "top" || exitTab.position == "bottom")
        ) {
          isFirst = true;
        } else if (exitTab.position == "top" || exitTab.position == "bottom") {
          break;
        }
      }

      document.querySelector('label[for="smET_hideTopBorder"]').style.display =
        !isFirst || currentExitTabRow.position != "top" ? "none" : "";

      document.querySelector(
        'label[for="smET_hideBottomBorder"]',
      ).style.display =
        !isFirst || currentExitTabRow.position != "bottom" ? "none" : "";

      document.querySelector("#smET_hideTopBorder").value =
        currentExitTabRow.hideTopBorder;
      document.querySelector("#smET_hideBottomBorder").value =
        currentExitTabRow.hideBottomBorder;

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
          {
            selected: presetName == pastValue,
          },
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

    document.querySelector("#smET_shieldList").innerHTML = "";
    const cloneAddShieldNode = document
      .querySelector("#smET_addShield")
      .cloneNode(true);
    document
      .querySelector("#smET_addShield")
      .parentNode.replaceChild(
        cloneAddShieldNode,
        document.querySelector("#smET_addShield"),
      );

    cloneAddShieldNode.addEventListener("click", () => {
      const shield = new Shield({
        scale: 60,
        horizMargin: 0,
        vertMargin: 0,
      });
      HistoryManager.addToUndoStack(app.getPost());
      currentExitTab.shields.left.push(shield);
      updateExitTabSubform();
      app.redraw();
    });

    for (const shieldDirection in currentExitTab.shields) {
      for (const shield of currentExitTab.shields[shieldDirection]) {
        const shieldListItem = document.createElement("div");
        shieldListItem.className = "sMET_shieldListItem";

        const shieldListItemImage = document.createElement("img");
        shieldListItemImage.src = Shield.prototype.getImageData(shield);
        shieldListItemImage.className = "sMET_shieldListItemImage";
        shieldListItem.appendChild(shieldListItemImage);

        const shieldListItemText = document.createElement("span");
        shieldListItemText.className = "sMET_shieldListItemText";
        shieldListItemText.textContent = `${
          shield.shieldType == "custom"
            ? shield.shieldName.replace(/\.\w+/g, "")
            : Shield.prototype
                .getPropertiesFromName(shield.shieldValue)
                .name.toUpperCase()
        }-${shield.routeNumber}`;
        shieldListItem.appendChild(shieldListItemText);

        const shieldListItemEdit = document.createElement("button");

        shieldListItemEdit.className = "sMET_shieldListItemEdit";
        shieldListItemEdit.textContent = "Edit Shield";
        shieldListItem.appendChild(shieldListItemEdit);

        shieldListItemEdit.addEventListener("click", () => {
          ShieldEditor.promptEditShield(shield, (updatedShield) => {
            if (!updatedShield) {
              return;
            }

            for (const key in updatedShield) {
              if (["banners", "bannerSettings", "group"].includes(key)) {
                continue;
              }

              shield[key] = updatedShield[key];
            }

            updateExitTabSubform();
            app.redraw();
          });
        });

        const shieldListItemCategory = document.createElement("select");
        shieldListItemCategory.className = "sMET_shieldListItemCategory";
        for (const category of ["Left", "Right"]) {
          lib.appendOption(shieldListItemCategory, category.toLowerCase(), {
            selected: shieldDirection == category.toLowerCase(),
            text: category,
          });
        }
        shieldListItemCategory.addEventListener("change", () => {
          const newDirection = shieldListItemCategory.value;
          if (newDirection !== shieldDirection) {
            const shieldIndex =
              currentExitTab.shields[shieldDirection].indexOf(shield);
            if (shieldIndex !== -1) {
              HistoryManager.addToUndoStack(app.getPost());
              currentExitTab.shields[shieldDirection].splice(shieldIndex, 1);
              currentExitTab.shields[newDirection].push(shield);
              updateExitTabSubform();
              app.redraw();
            }
          }
        });
        shieldListItem.appendChild(shieldListItemCategory);

        const shieldListItemDelete = document.createElement("button");
        shieldListItemDelete.className = "sMET_shieldListItemDelete redButton";
        shieldListItemDelete.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
        shieldListItem.appendChild(shieldListItemDelete);

        shieldListItemDelete.addEventListener("click", () => {
          const shieldIndex =
            currentExitTab.shields[shieldDirection].indexOf(shield);
          if (shieldIndex !== -1) {
            HistoryManager.addToUndoStack(app.getPost());
            currentExitTab.shields[shieldDirection].splice(shieldIndex, 1);
            readForm();
          }
        });

        document.querySelector("#smET_shieldList").appendChild(shieldListItem);
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
    document.querySelector("#sMET_roundBottomBorder").checked =
      currentExitTab.roundBottomBorder;
    document.querySelector(
      "label[for='sMET_roundBottomBorder']",
    ).style.display = currentExitTab.useFullBorder ? "" : "none";
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
    document.querySelector("#sMET_alignment").disabled =
      currentExitTabRow.independentWidth;
    document.querySelector("#sMET_alignment").value = currentExitTab.alignment;
    document.querySelector("#sMET_width").value = currentExitTab.width;
    document.querySelector("#smET_containerHolderPadding").value =
      currentExitTab.holderPadding;
    document.querySelector("#smET_shieldGap").value = currentExitTab.shieldsGap;
    document.querySelector("#sMET_shieldsDirection").value =
      currentExitTab.shieldsDirection;
    document.querySelector("#smET_shieldWordSpacing").value =
      currentExitTab.shieldWordSpacing;

    if (currentExitTab.width.toLowerCase().includes("custom")) {
      if (currentExitTab.width.toLowerCase().includes("percent")) {
        document.querySelector("#sMET_widthSizeLabel").textContent =
          "Width Size (%):";
        document.querySelector("#sMET_widthSize").max = 100;
      } else {
        document.querySelector("#sMET_widthSizeLabel").textContent =
          "Width Size (rem):";
        document.querySelector("#sMET_widthSize").max = 20;
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

    if (currentExitTab.variant == "PartialLeft") {
      document.querySelector("#smET_partialLeftCheckbox").checked =
        currentExitTab.variantSettings.partialLeft.separateRow;

      document.querySelector("#smET_partialLeftSpacing").style.display =
        !currentExitTab.variantSettings.partialLeft.separateRow ? "none" : "";
      document.querySelector(
        'label[for="smET_partialLeftSpacing"]',
      ).style.display = !currentExitTab.variantSettings.partialLeft.separateRow
        ? "none"
        : "";
      document.querySelector("#smET_partialLeftMinWidth").style.display =
        !currentExitTab.variantSettings.partialLeft.separateRow ? "none" : "";
      document.querySelector(
        'label[for="smET_partialLeftMinWidth"]',
      ).style.display = !currentExitTab.variantSettings.partialLeft.separateRow
        ? "none"
        : "";

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
      document.querySelector("#smET_partialLeftFontFamily").value =
        currentExitTab.variantSettings.partialLeft.fontFamily;
      document.querySelector("#smET_partialLeftBorderRadius").value =
        currentExitTab.variantSettings.partialLeft.borderRadius;
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
      const regularIconDropdown = document.querySelector(
        "#sMET_variantRegularIcon",
      );
      regularIconDropdown.dataset.customImageData =
        currentExitTab.variantSettings.icon.iconData || "";
      regularIconDropdown.dataset.selectedOption =
        currentExitTab.variantSettings.icon.iconType === "custom"
          ? `custom:${currentExitTab.variantSettings.icon.icon}`
          : currentExitTab.variantSettings.icon.icon;
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

      document.querySelector("#sMET_variantIsSquareIcon").checked =
        currentExitTab.variantSettings.icon.isSquare;
      document.querySelector("#sMET_variantIsTollIcon").checked =
        currentExitTab.variantSettings.icon.isTollIcon;

      document.querySelector(
        "#sMET_variantOnlyHorizontalPadding",
      ).style.display =
        currentExitTab.variantSettings.icon.addon == "only" ? "" : "none";
      document.querySelector("#sMET_variantPbmPadding").style.display =
        currentExitTab.variantSettings.icon.addon == "or variant" ? "" : "none";
      document.querySelector("#sMET_variantUnderline").style.display =
        currentExitTab.variantSettings.icon.addon == "none" ? "" : "none";
      document.querySelector("#smET_variantIsSquare").style.display =
        currentExitTab.variantSettings.icon.addon == "or variant" ? "" : "none";
      document.querySelector("#smET_variantFontSize").style.display =
        currentExitTab.variantSettings.icon.addon == "or variant" ? "" : "none";
      document.querySelector(
        'label[for="smET_variantFontSize"]',
      ).style.display =
        currentExitTab.variantSettings.icon.addon == "or variant" ? "" : "none";

      document.querySelector("#smET_variantFontSize").value =
        currentExitTab.variantSettings.icon.fontSize;

      document.querySelector(
        'label[for="sMET_variantOnlyHorizontalPadding"]',
      ).style.display =
        currentExitTab.variantSettings.icon.addon == "only" ? "" : "none";
      document.querySelector(
        'label[for="sMET_variantPbmPadding"]',
      ).style.display =
        currentExitTab.variantSettings.icon.addon == "or variant" ? "" : "none";
      document.querySelector(
        'label[for="sMET_variantUnderline"]',
      ).style.display =
        currentExitTab.variantSettings.icon.addon == "none" ? "" : "none";
      document.querySelector(
        'label[for="smET_variantIsSquare"]',
      ).style.display =
        currentExitTab.variantSettings.icon.addon == "or variant" ? "" : "none";

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

    if (currentExitTab.variant == "FullLeft") {
      document.querySelector("#smET_fullLeftMinimumWidth").value =
        currentExitTab.variantSettings.fullLeft.minimumWidth;
      document.querySelector("#smET_fullLeftFontFamily").value =
        currentExitTab.variantSettings.fullLeft.fontFamily;
      document.querySelector("#smET_fullLeftLetterSpacing").value =
        currentExitTab.variantSettings.fullLeft.letterSpacing;
      document.querySelector("#smET_fullLeftBottomSpacing").value =
        currentExitTab.variantSettings.fullLeft.bottomSpacing;
      document.querySelector("#smET_fullLeftFlipJustify").checked =
        currentExitTab.variantSettings.fullLeft.flipJustify;
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
    for (const row of app.getCurrentBlockElements().rows) {
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
      button.textContent = `Shield Group ${id + 1} (Row ${app.getCurrentBlockElements().rows.findIndex((row) => row.includes(shieldGroup)) + 1})`;
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
    const createShieldRow = (shield, shieldIndex, noDrag) => {
      const shieldRow = document.createElement("button");
      shieldRow.type = "button";
      shieldRow.className = "smSPShieldRow";
      if (shieldIndex === selectedShieldIndex) {
        shieldRow.classList.add("selected");
      }

      if (!noDrag) {
        const dragButton = document.createElement("button");
        dragButton.className = "dragIndicator";
        dragButton.innerHTML = "drag_indicator";
        shieldRow.appendChild(dragButton);
      }

      const shieldBlock = document.createElement("span");
      shieldBlock.className = "smSPShieldBlock";

      const shieldImg = document.createElement("img");
      shieldImg.className = "smSPShieldVisual";
      shieldImg.src =
        shield.shieldType === "preset"
          ? Shield.prototype.getDirectoryFromShield(
              shield.shieldValue,
              shield.variant == "Auto"
                ? Shield.prototype.getPreviewVariant()
                : shield.variant,
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
        groupDragButton.className = "dragIndicator";
        groupDragButton.innerHTML = "drag_indicator";
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

      groupHolder.appendChild(createShieldRow(shield, shieldIndex, true));
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

    document.getElementById("spShieldQuick_routeNumber").value =
      currentShield.routeNumber;
    document.getElementById("spShieldQuick_designation").value =
      currentShield.designation;
    document.getElementById("spShieldQuick_scale").value = currentShield.scale;
    document.getElementById("spShieldQuick_scaleVal").value =
      currentShield.scale;
    document.getElementById("spShieldQuick_horizMargins").value =
      currentShield.horizMargin;
    document.getElementById("spShieldQuick_vertMargins").value =
      currentShield.vertMargin;

    document.querySelector("#smSPShieldImgPreview").innerHTML = "";
    let shieldElem = currentShield.createElement();
    shieldElem.style.setProperty("--shieldScale", 1);
    shieldElem.style.fontSize = "1rem";

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

      if (alignment == "left" || alignment == "right") {
        const inset = document.createElement("label");
        inset.textContent = "Inset: (rem)";
        alignmentHeader.appendChild(inset);

        const insetInput = document.createElement("input");
        insetInput.type = "number";
        insetInput.min = "0";
        insetInput.step = "0.1";
        insetInput.value = currentShield.bannerSettings[alignment].inset || 0;
        insetInput.className = "smSPShieldBannerInset";
        insetInput.addEventListener("change", readForm);
        inset.appendChild(insetInput);
      }

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
            HistoryManager.addToUndoStack(app.getPost());
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
      HistoryManager.addToUndoStack(app.getPost());
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
      const standardArrowConfig = sign.arrows.standard;
      const exitOnlyConfigs = standardArrowConfig.exitOnlyConfigs;
      const variant = standardArrowConfig.variant;

      const isExitOnly = [
        "Exit Only",
        "Split Exit Only",
        "Half Exit Only",
      ].includes(variant);
      const isSimpleVariant = ["None", "Side Left", "Side Right"].includes(
        variant,
      );
      const selectedIndex = app.vars.currentlySelectedStandardArrow;

      document.querySelector("#standardArrowCustomSettings").style.display =
        variant === "Custom" && selectedIndex !== -1 ? "" : "none";
      document.querySelector("#standardArrowExitOnlySettings").style.display =
        isExitOnly ? "" : "none";
      document.querySelector(".standardArrow_selectHeader").style.display =
        isExitOnly || isSimpleVariant ? "none" : "";
      document.querySelector("#standardArrowGeneralSettings").style.display =
        isExitOnly || isSimpleVariant ? "none" : "";
      document.querySelector("#standardArrowList").style.display =
        isExitOnly || isSimpleVariant ? "none" : "";

      document.querySelector("#guideArrow").value = variant;
      document.querySelector("#standardArrowSelected").textContent =
        "Selected: " +
        (selectedIndex === -1 ? "None" : "Arrow " + (selectedIndex + 1));

      if (isSimpleVariant) {
        return;
      }

      if (variant === "Custom") {
        document.querySelector("#standardArrows_gap").value =
          standardArrowConfig.customConfig.gap;
        document.querySelector("#standardArrows_justify").value =
          standardArrowConfig.customConfig.justify;
        document.querySelector("#standardArrows_horizontalPadding").value =
          standardArrowConfig.customConfig.horizontalPadding;
        document.querySelector("#standardArrows_verticalTopPadding").value =
          standardArrowConfig.customConfig.verticalTopPadding;
        document.querySelector("#standardArrows_verticalBottomPadding").value =
          standardArrowConfig.customConfig.verticalBottomPadding;

        const standardArrowList = document.querySelector("#standardArrowList");
        standardArrowList.innerHTML = "";

        standardArrowConfig.arrowList.forEach((arrow, arrowIndex) => {
          const arrowButton = document.createElement("button");
          arrowButton.className =
            "standardArrowListItem " +
            (arrowIndex === selectedIndex ? "selected" : "");

          const dragIndicator = document.createElement("div");
          dragIndicator.className = "dragIndicator";
          dragIndicator.textContent = "drag_indicator";
          arrowButton.appendChild(dragIndicator);

          const arrowImageHolder = document.createElement("div");
          arrowImageHolder.className = "standardArrowListItem_imageHolder";
          arrowButton.appendChild(arrowImageHolder);

          const arrowImage = document.createElement("img");
          arrowImage.src = StandardArrow.prototype.arrows[arrow.arrow].src;
          arrowImage.style.transform =
            (arrow.flip ? "scaleX(-1) " : "") +
            ("rotate(" + arrow.rotation + "deg)");
          arrowImageHolder.appendChild(arrowImage);

          const arrowLabel = document.createElement("span");
          arrowLabel.textContent =
            StandardArrow.prototype.arrows[arrow.arrow].label;
          arrowButton.appendChild(arrowLabel);

          arrowButton.addEventListener("click", () => {
            if (app.vars.currentlySelectedStandardArrow === arrowIndex) {
              app.setSelectedStandardArrow(-1);
            } else {
              app.setSelectedStandardArrow(arrowIndex);
            }
          });

          standardArrowList.appendChild(arrowButton);
        });

        if (
          selectedIndex !== -1 &&
          standardArrowConfig.arrowList[selectedIndex]
        ) {
          const selectedStandardArrow =
            standardArrowConfig.arrowList[selectedIndex];

          document.querySelector("#guideStandardArrow").dataset.selectedOption =
            selectedStandardArrow.arrow;
          document.querySelector("#guideStandardArrow_rotation").value =
            selectedStandardArrow.rotation;
          document.querySelector("#guideStandardArrow_size").value =
            selectedStandardArrow.size;
          document.querySelector("#guideStandardArrow_marginHorizontal").value =
            selectedStandardArrow.marginHorizontal;
          document.querySelector("#guideStandardArrow_marginVertical").value =
            selectedStandardArrow.marginVertical;
          document.querySelector("#guideStandardArrow_flip").checked =
            selectedStandardArrow.flip;

          document
            .querySelectorAll(".sdGuideArrows_rotationPreset")
            .forEach((button) => {
              button.classList.toggle(
                "activated",
                selectedStandardArrow.rotation ==
                  parseFloat(button.dataset.degrees),
              );
            });
        }

        return;
      }

      if (isExitOnly) {
        document.querySelector('label[for="arrowLocations"]').style.display = [
          "Split Exit Only",
          "Half Exit Only",
        ].includes(variant)
          ? ""
          : "none";
        document.querySelector("#arrowLocations").style.display = [
          "Split Exit Only",
          "Half Exit Only",
        ].includes(variant)
          ? ""
          : "none";

        const arrowLocations = document.querySelector("#arrowLocations");
        arrowLocations.innerHTML = "";

        for (const alignment of Sign.prototype.exitOnlyJustify) {
          if (variant == "Half Exit Only" && alignment == "Center") {
            if (standardArrowConfig.exitOnlyConfigs.arrowLocation == "Center") {
              standardArrowConfig.exitOnlyConfigs.arrowLocation = "Right";
            }

            continue;
          }

          lib.appendOption(arrowLocations, alignment, {
            selected:
              standardArrowConfig.exitOnlyConfigs.arrowLocation === alignment,
          });
        }

        document.querySelector("#exitOnlyTextPositionLabel").style.display =
          standardArrowConfig.exitOnlyConfigs.numArrows == 1 ||
          variant == "Split Exit Only"
            ? ""
            : "none";
        document.querySelector("#exitOnlyTextPosition").style.display =
          standardArrowConfig.exitOnlyConfigs.numArrows == 1 ||
          variant == "Split Exit Only"
            ? ""
            : "none";
        document.querySelector("#exitOnlyTextPosition").value =
          exitOnlyConfigs.exitOnlyTextPosition;

        document.querySelector("#exitOnlyBorderMode").value =
          exitOnlyConfigs.borderMode;

        document.querySelector("#splitExitOnlyHorizPadding").style.display = [
          "Split Exit Only",
          "Half Exit Only",
        ].includes(variant)
          ? ""
          : "none";
        document.querySelector("#splitExitOnlyVertPadding").style.display = [
          "Split Exit Only",
          "Half Exit Only",
        ].includes(variant)
          ? ""
          : "none";
        document.querySelector("#splitExitOnlyBorderRadius").style.display = [
          "Split Exit Only",
          "Half Exit Only",
        ].includes(variant)
          ? ""
          : "none";

        document.querySelector(
          'label[for="splitExitOnlyHorizPadding"]',
        ).style.display = ["Split Exit Only", "Half Exit Only"].includes(
          variant,
        )
          ? ""
          : "none";
        document.querySelector(
          'label[for="splitExitOnlyVertPadding"]',
        ).style.display = ["Split Exit Only", "Half Exit Only"].includes(
          variant,
        )
          ? ""
          : "none";
        document.querySelector(
          'label[for="splitExitOnlyBorderRadius"]',
        ).style.display = ["Split Exit Only", "Half Exit Only"].includes(
          variant,
        )
          ? ""
          : "none";

        document.querySelector("#exitOnlyOutsideGap").style.display =
          variant == "Half Exit Only" ? "" : "none";
        document.querySelector(
          'label[for="exitOnlyOutsideGap"]',
        ).style.display = variant == "Half Exit Only" ? "" : "none";
        document.querySelector("#exitOnlyOutsideGap").value =
          exitOnlyConfigs.exitOnlyOutsideGap;

        document.querySelector("#exitOnlyDisplayOutsideArrow").style.display =
          variant == "Half Exit Only" ? "" : "none";
        document.querySelector(
          'label[for="exitOnlyDisplayOutsideArrow"]',
        ).style.display = variant == "Half Exit Only" ? "" : "none";
        document.querySelector("#exitOnlyDisplayOutsideArrow").checked =
          exitOnlyConfigs.displayOutsideArrow;

        document.querySelector("#splitExitOnlyHorizPadding").value =
          exitOnlyConfigs.splitHorizontalPadding;
        document.querySelector("#splitExitOnlyVertPadding").value =
          exitOnlyConfigs.splitVerticalPadding;
        document.querySelector("#splitExitOnlyBorderRadius").value =
          exitOnlyConfigs.splitBorderRadius;

        document.querySelector("#exitOnlyText").value =
          exitOnlyConfigs.exitOnlyText;
        document.querySelector("#exitOnlyArrowCount").value =
          exitOnlyConfigs.numArrows;

        const exitOnlyArrow = standardArrowConfig.exitOnlyConfigs.arrow;
        document.querySelector("#exitOnlyArrowType").dataset.selectedOption =
          exitOnlyArrow.arrow;
        document.querySelector("#exitOnlyArrowSize").value = exitOnlyArrow.size;
        document.querySelector("#exitOnlyArrowRotation").value =
          exitOnlyArrow.rotation;
        document.querySelector("#exitOnlyArrowFlip").checked =
          exitOnlyArrow.flip;

        document.querySelector("#exitOnlyHorizontalPadding").value =
          exitOnlyConfigs.horizontalPadding;
        document.querySelector("#exitOnlyVerticalPadding").value =
          exitOnlyConfigs.verticalPadding;
        document.querySelector("#exitOnlyFontFamily").value =
          exitOnlyConfigs.fontFamily;
        document.querySelector("#exitOnlyFontSize").value =
          exitOnlyConfigs.fontSize;
        document.querySelector("#exitOnlyWordSpacing").value =
          exitOnlyConfigs.wordSpacing;
        document.querySelector("#exitOnlyLetterSpacing").value =
          exitOnlyConfigs.letterSpacing;
        document.querySelector("#exitOnlyBGColor").value =
          exitOnlyConfigs.backgroundColor;

        document.querySelector("#exitOnlyGap").value = exitOnlyConfigs.gap;
        document.querySelector("#exitOnlyTextGap").style.display =
          exitOnlyConfigs.numArrows < 1 ? "none" : "";
        document.querySelector('label[for="exitOnlyTextGap"]').style.display =
          exitOnlyConfigs.numArrows < 1 ? "none" : "";

        document.querySelector("#exitOnlyGap").style.display =
          exitOnlyConfigs.numArrows <= 2 ? "none" : "";
        document.querySelector('label[for="exitOnlyGap"]').style.display =
          exitOnlyConfigs.numArrows <= 2 ? "none" : "";

        document.querySelector("#exitOnlyTextGap").value =
          exitOnlyConfigs.textGap;
        document.querySelector(
          'label[for="exitOnlyRoundCorners"]',
        ).style.display =
          exitOnlyConfigs.borderMode == "White Border" ? "" : "none";
        document.querySelector("#exitOnlyRoundCorners").style.display =
          exitOnlyConfigs.borderMode == "White Border" ? "" : "none";
        document.querySelector("#exitOnlyRoundCorners").checked =
          exitOnlyConfigs.roundAllCorners;

        document
          .querySelectorAll(".sdExitOnlyGuide_rotationPreset")
          .forEach((button) => {
            button.className =
              "sdExitOnlyGuide_rotationPreset" +
              (exitOnlyArrow.rotation == parseInt(button.dataset.degrees)
                ? " activated"
                : "");
          });
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

      const subpanels = app.getCurrentPanel().sign.subPanels;
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

          aplContHolder.querySelector(".smAPLCat_numLanesLabel").remove();
          aplContHolder.querySelector(".smAPLCat_numLanes").remove();

          if (sign.lanePanelSize != 0) {
            aplContHolder.querySelector(".smAPLCat_minWidthLabel").remove();
            aplContHolder.querySelector(".smAPLCat_minWidth").remove();
          } else {
            aplContHolder.querySelector(".smAPLCat_minWidth").value =
              arrows.subpanelConfigs[i]?.minWidth;
            aplContHolder.querySelector(".smAPLCat_minWidth").disabled =
              !arrows.subpanelConfigs[i];
          }
        } else {
          aplContHolder.querySelector(".smAPLCat_minWidthLabel").remove();
          aplContHolder.querySelector(".smAPLCat_minWidth").remove();

          if (!arrows.subpanelConfigs[i]) {
            aplContHolder.querySelector(".smAPLCat_justifyLabel").remove();
            aplContHolder.querySelector(".smAPLCat_justifyAPLs").remove();
          } else {
            aplContHolder.querySelector(".smAPLCat_justifyAPLs").value =
              arrows.subpanelConfigs[i].justify;
          }

          aplContHolder.querySelector(".smAPLCat_numLanes").value =
            subpanels[i].laneWidth;
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
          const arrowDefinition = APLArrow.arrowTypes[arrow.arrowVariant];
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

        if (
          (i % 1 != 0 && aplList.length > 0) ||
          (app.getCurrentPanel().sign.lanePanelSize > 0 &&
            i % 1 == 0 &&
            aplList.length >=
              subpanels[i].laneWidth -
                (arrows.subpanels[i - 0.5] &&
                arrows.subpanels[i - 0.5].length > 0
                  ? 1
                  : 0))
        ) {
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

  const promptCustomIcon = () => {
    const modal = document.querySelector("#customImagePicker");
    const uploadField = document.querySelector("#customImageUploadField");
    const fileInput = document.querySelector("#customImageFile");
    const urlInput = document.querySelector("#customImageUrl");
    const list = document.querySelector("#customImageList");
    const modalHolder = document.querySelector("#modalHolder");
    const eventListeners = [];

    const trackListener = (element, type, handler) => {
      element.addEventListener(type, handler);
      eventListeners.push({ element, type, handler });
    };

    const cleanupListeners = () => {
      for (const { element, type, handler } of eventListeners) {
        element.removeEventListener(type, handler);
      }
      eventListeners.length = 0;
    };

    return new Promise(async (resolve) => {
      let closed = false;

      const close = (image) => {
        if (closed) return;
        closed = true;
        cleanupListeners();
        modalHolder.style.display = "none";
        if (modal.open) modal.close();
        resolve(image || null);
      };

      const renderList = async () => {
        list.innerHTML = "";

        for (const image of await window.customImages.getAllImages()) {
          const item = document.createElement("button");
          item.className = "customImageItem";

          const preview = document.createElement("img");
          preview.src = image.data;
          preview.className = "shieldItemImg";
          item.appendChild(preview);

          const name = document.createElement("span");
          name.className = "shieldItemName";
          name.textContent = image.fileName;
          item.appendChild(name);

          trackListener(item, "click", () => close(image));

          const deleteButton = document.createElement("button");
          deleteButton.type = "button";
          deleteButton.className = "deleteCustomImage";
          deleteButton.innerHTML =
            '<span class="material-symbols-outlined">delete</span>';
          trackListener(deleteButton, "click", async () => {
            if (!confirm("Are you sure you want to delete this image?")) return;
            await window.customImages.deleteImage(image.fileName);
            await renderList();
          });
          item.appendChild(deleteButton);
          list.appendChild(item);
        }
      };

      const uploadFile = async () => {
        if (!fileInput.files[0]) return;
        await window.customImages.uploadFile(fileInput.files[0]);
        fileInput.value = "";
        await renderList();
      };

      const uploadUrl = async () => {
        if (!urlInput.value) return;
        await window.customImages.uploadUrl(urlInput.value);
        urlInput.value = "";
        await renderList();
      };

      trackListener(
        document.querySelector("#customImagePickerClose"),
        "click",
        () => close(null),
      );
      trackListener(modal, "cancel", (event) => {
        event.preventDefault();
        close(null);
      });
      trackListener(modal, "close", () => close(null));
      trackListener(uploadField, "click", () => fileInput.click());
      trackListener(fileInput, "change", uploadFile);
      trackListener(urlInput, "keypress", (event) => {
        if (event.key === "Enter") uploadUrl();
      });
      trackListener(uploadField, "dragover", (event) => {
        event.preventDefault();
        event.stopPropagation();
        uploadField.classList.add("dragover");
      });
      trackListener(uploadField, "dragleave", () =>
        uploadField.classList.remove("dragover"),
      );
      trackListener(uploadField, "drop", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        uploadField.classList.remove("dragover");
        for (const file of event.dataTransfer.files) {
          await window.customImages.uploadFile(file);
        }
        await renderList();
      });

      await renderList();
      modalHolder.style.display = "block";
      modal.showModal();
    });
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
    promptCustomIcon,
    updateGuideArrowsSubform,
    vars: {
      get zoomLevel() {
        return zoomLevel;
      },
    },
  };
})();
