const MUTCDVariants = (() => {
  const variants = {
    // tagToReplace: if promopted to update elements to a new configuration, ONLY change those variables.
    // note: pls do not change MUTCD - the code sees these variables as the source of truth so don't like delete anything or else idk the entire program explodes
    MUTCD: {
      VariantInfo: {
        FullName: "MUTCD: Standard Highway Designs",
        Tags: [
          "MUTCD",
          "SHS",
          "FHWA",
          "Standard Highway Signage",
          "US Highway Signage",
        ],
        ColorPalette: {
          Green: "#005f4d",
          Blue: "#00437b",
          Brown: "#62331e",
          Yellow: "#fccf34",
          White: "#ffffff",
          Black: "#000000",
          Purple: "#4B0082",
          Orange: "#ff5904",
          Red: "#ff0000",
          "Fluorescent Pink": "#ff33cc",
          "Fluorescent Yellow-Green": "#99ff00",
          Coral: "#cc0033",
          "Light Blue": "#71b1dd",
        },
      },
      APLArrow: {
        arrowVariant: "Up Arrow",
        offset: 0,
        size: 4.5,
        exitOnlyEnabled: false,
        exitTextContent: ["EXIT", "ONLY"],
        exitBGColor: "Yellow",
        exitTextRoundness: 4,
        exitTextHorizontalPadding: 5,
        exitTextMargins: [0, 0],
        exitTextSize: 16,
        exitTextLineHeight: 100,
        fontFamily: "Series E",
      },
      StandardArrow: {
        arrow: "TYPE_A",
        rotation: 0,
        size: 1.75,
        marginHorizontal: 0,
        marginVertical: 0,
        flip: false,
      },
      Post: {
        polePosition: "Left",
        lanesWide: 1,
        color: "Silver",
        cornerRadius: 30,
        showPost: true,
        offsetPost: true,
        variant: "Standard",
        panelSpacing: 1,
        thickness: 1,
        spacing: 5,
        mutcdVariant: "MUTCD",
        panels: [],
        userColors: {},
      },
      Panel: {
        sign: null,
        color: "Green",
        exitTabs: [],
        corner: "Sharp",
        borderRadius: 0.75,
        tagToReplace: ["corner", "borderRadius"],
      },
      Sign: {
        arrows: {
          arrowMode: "standard",
          standard: {
            variant: "None",
            arrowList: [],
            customConfig: {
              horizontalPadding: 1,
              verticalTopPadding: 0,
              verticalBottomPadding: 0.5,
              gap: 1,
              justify: "Space Between",
            },
            exitOnlyConfigs: {
              borderMode: "Partial Black Border",
              exitOnlyText: "EXIT ONLY",
              exitOnlyTextPosition: "Center",
              horizontalPadding: 1,
              verticalPadding: 0.5,
              splitHorizontalPadding: 0.25,
              splitVerticalPadding: 0.25,
              splitBorderRadius: 4,
              exitOnlyOutsideGap: 5,
              fontFamily: "Series E",
              fontSize: 24,
              wordSpacing: 0,
              letterSpacing: 0,
              arrowLocation: "Center",
              arrow: {
                arrow: "DOWN",
                rotation: 0,
                size: 1.75,
                marginHorizontal: 0,
                marginVertical: 0,
                flip: false,
              },
              numArrows: 0,
              gap: 4,
              textGap: 0.5,
              displayOutsideArrow: true,
              backgroundColor: "Yellow",
              roundAllCorners: false,
            },
          },
          apl: {
            horizontalPadding: 0,
            verticalTopPadding: 0,
            verticalBottomPadding: 0.25,
            subpanels: {},
            subpanelConfigs: {},
          },
          diagrammic: {
            diagramData: {},
            scale: 100,
            preset: "None",
          },
        },
        otherSymbol: "None",
        oSNum: "",
        subPanels: [],
        lanePanelSize: 0,
      },
      SubPanels: {
        laneWidth: 0,
        blockElements: null,
        verticalAlign: "Start",
        dividerHeight: 50,
        dividerHeightUnit: "%",
      },
      TextElement: {
        textContent: "New Sign",
        backgroundColor: "Inherit",
        fontFamily: "Series EM",
        fontSize: 100,
        useBannerFormatting: false,
        bannerFormattingSize: 100,
        bannerFirstLetterSize: 120,
        useNumeralFormatting: false,
        numeralFormattingSize: 150,
        spaceNumeralsLetters: true,
        alignment: "Center",
        textAlign: "Center",
        lineHeight: 100,
        wordSpacing: 0,
        tagToReplace: ["fontFamily", "lineHeight", "wordSpacing"],
      },
      ControlTextElement: {
        smallCapitals: false,
        capitalSize: 200,
      },
      ActionMessageElement: {
        fontSize: 70,
        useNumeralFormatting: true,
      },
      AdvisoryMessageElement: {
        backgroundColor: "Yellow",
        fontFamily: "Series E",
        borderRadius: 4,
        border: false,
        borderWidth: 2,
        borderColor: "White",
        useNumeralFormatting: true,
        horizPadding: 0.3,
        vertPadding: 0.2,
        tagToReplace: ["fontFamily"],
      },
      ElectronicSignElement: {
        fontFamily: "Electronic Highway Sign",
        textColor: "Orange",
        textFormat: "Full Text",
        formatSize: 0.05,
        horizPadding: 0.5,
        vertPadding: 0.5,
        glow: true,
        setWidth: 0,
      },
      ShieldGroupElement: {
        shields: [],
        alignment: "Center",
        direction: "Horizontal",
        gap: 0.5,
      },
      DividerElement: {
        dividerWidth: 100,
        dividerMeasurement: "%",
        dividerHeight: 0.2,
        alignment: "Center",
        visible: true,
        dividerColor: "White",
        fullBleed: false,
      },
      IconElement: {
        icon: "AIRPORT",
        iconType: "preset",
        iconData: "",
        iconSize: 100,
        backgroundColor: "Inherit",
        border: false,
        borderRadius: 4,
        borderColor: "White",
        spacing: 4,
      },
      BeaconElement: {
        size: 2,
        alignment: "Center",
        flashDuration: 1,
        color: "Yellow",
        backplate: false,
        flashOpposite: false,
      },
      ArrowElement: {
        arrow: "TYPE_A",
        rotation: 0,
        size: 1.75,
        marginHorizontal: 0,
        marginVertical: 0,
        flip: false,
        paddingHorizontal: 0,
        paddingVertical: 0,
        alignment: "Center",
      },
      TollLogoElement: {
        logo: "TollTag",
        logoHeight: 3,
        spacing: 0,
        horizontalPadding: 0.25,
        verticalPadding: 0.25,
        background: false,
        backgroundColor: "Purple",
        alignment: "Center",
        squareIcon: false,
        containerBorderRadius: 8,
        tollBorderRadius: 8,
        onlyBorderRadius: 4,
        border: 3,
        showOnlyBlock: false,
        onlyBlockDirection: "Horizontal",
        onlyBlockSpacing: 0.25,
        onlyBlockFontSize: 24,
        fontFamily: "Series D",
        onlyBlockHorizPadding: 0.2,
        onlyBlockVertPadding: 0.25,
        containerHorizontalPadding: 0.25,
        containerVerticalPadding: 0.25,
        containerBorderWidth: 0,
        containerBackgroundColor: "Purple",
      },
      Block: {
        topMargin: 0,
        topPadding: 0.3,
        bottomMargin: 0,
        bottomPadding: 0.3,
        leftPadding: 0.75,
        rightPadding: 0.75,
        backgroundColor: "Inherit",
        backgroundFullWidth: true,
        width: 0,
        stretchLeft: true,
        stretchCenter: true,
        stretchRight: true,
      },
      GroupElement: {
        blockElements: null,
        direction: "Vertical",
        width: 0,
        boxFormat: "Normal",
        formatSize: 0.04,
        border: false,
        borderWidth: 5,
        borderColor: "Black",
      },
      Control: {
        rows: [],
        blockProperties: [],
        isGroup: false,
      },
      ExitTab: {
        textContent: "EXIT 1",
        subTextContent: "",
        shields: { left: [], right: [] },
        backgroundColor: "inherit",
        borderStyle: "square",
        borderThickness: 0.2,
        borderRadius: 0.5,
        roundBottomBorder: true,
        useFullBorder: true,
        horizontalPadding: 2,
        verticalPadding: 0.5,
        minimumHeight: 2.25,
        holderPadding: 0,
        fontSize: 20,
        lineHeight: 100,
        enlargeNumerals: true,
        enlargeNumeralsSize: 150,
        spaceLettersNumerals: true,
        numeralWordSpacing: 0.75,
        offsetNonNumerals: false,
        fontFamily: "Series E",
        numeralFontFamily: "Inherit",
        letterSpacing: 0,
        numeralLetterSpacing: 0,
        useTrimFormat: true,
        shieldsDirection: "horizontal",
        shieldsGap: 0.5,
        shieldWordSpacing: 0.25,
        contentDirection: "horizontal",
        alignment: "right",
        width: "auto",
        widthSize: 0,
        variant: "Normal",
        variantSettings: {
          icon: {
            icon: "AIRPORT",
            iconType: "preset",
            iconData: "",
            tollIcon: "EZPass",
            isTextBased: false,
            iconBackgroundConfiguration: {
              backgroundColor: "Transparent",
              horizontalPadding: 0,
              verticalPadding: 0,
              borderRadius: 0,
            },
            addon: "none",
            iconSize: 3,
            isSquare: true,
            isTollIcon: false,
            showBackground: true,
            onlyHorizontalPadding: 0.25,
            pbmPadding: 0.25,
            pbmIsSquare: true,
            fontFamily: "Series E",
            underline: false,
            fontSize: 0,
          },
          fullLeft: {
            minimumWidth: 7,
            fontFamily: "Series E",
            letterSpacing: 0,
            bottomSpacing: 1.25,
            flipJustify: false,
          },
          partialLeft: {
            separateRow: true,
            horizontalPadding: 0.6,
            verticalPadding: 0.3,
            letterSpacing: 2,
            minWidth: 7,
            spacing: 1.5,
            fontFamily: "Series E",
            borderRadius: 4,
          },
          hovVariant1: {
            height: 0,
            width: 0,
            verticalPadding: 0.125,
            roundCorners: false,
          },
          hovVariant2: {
            height: 0,
            width: 0,
            verticalPadding: 0.125,
          },
        },
        tagToReplace: [
          "fontFamily",
          "useTrimFormat",
          "numeralFontFamily",
          "borderStyle",
        ],
      },
      ExitTabRow: {
        exitTabs: [],
        gap: 0,
        panelEdgeType: "separate",
        position: "top",
        marginBottom: 0.3,
        independentWidth: false,
        hideTopBorder: false,
        hideBottomBorder: false,
        padding: 0,
      },
      Shield: {
        shieldType: "preset",
        shieldName: "Interstate",
        shieldValue: "I",
        variant: "Auto",
        shieldBacks: false,
        shieldBackColor: "Black",
        shieldBackRadius: 4,
        imageType: "",
        imageData: "",
        banners: {},
        bannerSettings: {
          top: { alignment: "start", gap: 0 },
          left: { alignment: "start", gap: 0, inset: 0.9 },
          right: { alignment: "start", gap: 0, inset: 0.9 },
          bottom: { alignment: "end", gap: 0 },
        },
        group: 0,
        designation: "",
        routeNumber: "1",
        scale: 100,
        horizMargin: 8,
        vertMargin: 8,
        customShields: {
          route_scale: 100,
          route_xOffset: 0,
          route_yOffset: 0,
          route_letterSpacing: 0,
          route_fontFamily: "",
          route_color: "",
          designation_scale: 100,
          designation_xOffset: 0,
          designation_yOffset: 0,
          designation_letterSpacing: 0,
          designation_fontFamily: "",
          designation_color: "",
        },
      },
      Banner: {
        textContent: "NORTH",
        firstLetterSize: 125,
        fontSize: 1.3,
        backgroundColor: "Inherit",
        horizontalPadding: 0,
        verticalPadding: 0,
        horizontalMargin: 0,
        verticalMargin: 0,
        borderRadius: 4,
        fontFamily: "Series E",
        tagToReplace: ["fontFamily"],
      },
    },
    TMUTCD: {
      VariantInfo: {
        FullName: "TMUTCD: Texas's Standard Highway Sign Designs",
        Tags: [
          "TMUTCD",
          "SHSD",
          "TEXAS",
          "TXDOT",
          "Texas Highway Signage",
          "Texas Highway Sign Designs",
        ],
      },
      Post: {
        mutcdVariant: "TMUTCD",
      },
      TextElement: {
        fontFamily: "Clearview 5WR",
        lineHeight: 100,
        tagToReplace: ["fontFamily", "lineHeight"],
      },
      Banner: {
        fontFamily: "Clearview 5WR",
        tagToReplace: ["fontFamily"],
      },
      ExitTab: {
        fontFamily: "Clearview 4W",
        useTrimFormat: false,
        useFullBorder: true,
        numeralWordSpacing: 0.25,
        horizontalPadding: 0.5,
        verticalPadding: 0.5,
        borderStyle: "round",
        tagToReplace: [
          "fontFamily",
          "useTrimFormat",
          "borderStyle",
          "useFullBorder",
          "horizontalPadding",
          "verticalPadding",
          "numeralWordSpacing",
        ],
      },
    },
    NVUTCDG: {
      VariantInfo: {
        FullName:
          "NVUTCDG: North Veridian Universal Traffic Control Device Guidelines",
        Tags: ["NVUTCDG"],
        ColorPalette: {
          Green: "#004040",
          Blue: "#002f6c",
          Brown: "#693f23",
          Yellow: "#fed141",
          Purple: "#690da3",
          Orange: "#e57200",
          Red: "#af272f",
          Coral: "#df4661",
        },
      },
      APLArrow: {
        arrowVariant: "Up Arrow",
        offset: 0,
        size: 4.5,
        exitOnlyEnabled: false,
        exitTextContent: ["RAMP", "ONLY"],
        exitBGColor: "White",
        exitTextRoundness: 4,
        exitTextHorizontalPadding: 5,
        exitTextMargins: [0, 0],
        exitTextSize: 16,
        exitTextLineHeight: 100,
        fontFamily: "Transport",
        tagToReplace: ["exitTextContent", "exitBGColor", "fontFamily"],
      },
      StandardArrow: {
        arrow: "TYPE_A",
        rotation: 180,
        size: 1.75,
        marginHorizontal: 0,
        marginVertical: 0,
        flip: false,
      },
      Post: {
        mutcdVariant: "NVUTCDG",
      },
      Panel: {
        sign: null,
        color: "Purple",
        exitTabs: [],
        corner: "Veridian",
        borderRadius: 0.0,
        tagToReplace: ["color"],
      },
      Sign: {
        arrows: {
          arrowMode: "standard",
          standard: {
            variant: "None",
            arrowList: [],
            customConfig: {
              horizontalPadding: 1,
              verticalTopPadding: 0,
              verticalBottomPadding: 0.5,
              gap: 1,
              justify: "Space Between",
            },
            exitOnlyConfigs: {
              borderMode: "White Border",
              exitOnlyText: "RAMP ONLY",
              exitOnlyTextPosition: "Center",
              horizontalPadding: 1,
              verticalPadding: 0.5,
              splitHorizontalPadding: 0.25,
              splitVerticalPadding: 0.25,
              splitBorderRadius: 4,
              exitOnlyOutsideGap: 5,
              fontFamily: "Transport",
              fontSize: 24,
              wordSpacing: 0,
              letterSpacing: 0,
              arrowLocation: "Center",
              arrow: {
                arrow: "TYPE_B",
                rotation: 45,
                size: 1.5,
                marginHorizontal: 0,
                marginVertical: 0,
                flip: false,
              },
              numArrows: 0,
              gap: 4,
              textGap: 0.5,
              displayOutsideArrow: true,
              backgroundColor: "White",
              roundAllCorners: false,
            },
          },
          apl: {
            horizontalPadding: 0,
            verticalTopPadding: 0,
            verticalBottomPadding: 0.25,
            subpanels: {},
            subpanelConfigs: {},
          },
          diagrammic: {
            diagramData: {},
            scale: 100,
            preset: "None",
          },
        },
        otherSymbol: "None",
        oSNum: "",
        subPanels: [],
        lanePanelSize: 0,
        paddingLeft: 0.75,
        paddingRight: 0.75,
        paddingTop: 0.3,
        paddingBottom: 0.3,
        tagToReplace: ["borderMode", "fontFamily", "backgroundColor"],
      },
      SubPanels: {
        laneWidth: 0,
        blockElements: null,
        verticalAlign: "Start",
        dividerHeight: 50,
        dividerHeightUnit: "%",
      },
      TextElement: {
        textContent: "New Block",
        backgroundColor: "Inherit",
        fontFamily: "Transport",
        fontSize: 100,
        useBannerFormatting: false,
        bannerFormattingSize: 100,
        bannerFirstLetterSize: 120,
        useNumeralFormatting: false,
        numeralFormattingSize: 150,
        spaceNumeralsLetters: true,
        alignment: "Center",
        textAlign: "Center",
        lineHeight: 100,
        wordSpacing: 0,
        tagToReplace: ["fontFamily"],
      },
      AdvisoryMessageElement: {
        backgroundColor: "White",
        fontFamily: "Transport",
        borderRadius: 4,
        border: false,
        borderWidth: 2,
        borderColor: "White",
        useNumeralFormatting: true,
        horizPadding: 0.3,
        vertPadding: 0.2,
        wordSpacing: 0,
        tagToReplace: ["backgroundColor", "fontFamily"],
      },
      ElectronicSignElement: {
        fontFamily: "VCR Mono",
        textColor: "White",
        textFormat: "Full Text",
        tagToReplace: ["fontFamily", "textColor"],
      },
      TollLogoElement: {
        logo: "VeriTag",
        logoHeight: 2,
        tagToReplace: ["logo"],
      },
      ExitTab: {
        textContent: "RAMP 1A",
        subTextContent: "",
        shields: { left: [], right: [] },
        backgroundColor: "inherit",
        borderStyle: "round",
        borderThickness: 0.2,
        borderRadius: 0,
        useFullBorder: true,
        horizontalPadding: 0.5,
        verticalPadding: 0,
        minimumHeight: 2.25,
        holderPadding: 0,
        fontSize: 20,
        lineHeight: 100,
        enlargeNumerals: true,
        enlargeNumeralsSize: 150,
        spaceLettersNumerals: true,
        numeralWordSpacing: 0.25,
        offsetNonNumerals: false,
        fontFamily: "Transport",
        numeralFontFamily: "Inherit",
        letterSpacing: 0,
        numeralLetterSpacing: 0,
        useTrimFormat: false,
        shieldsDirection: "horizontal",
        shieldsGap: 0.5,
        shieldWordSpacing: 0.25,
        contentDirection: "horizontal",
        alignment: "right",
        width: "full",
        widthSize: 0,
        variant: "Normal",
        variantSettings: {
          icon: {
            icon: "AIRPORT",
            iconType: "preset",
            iconData: "",
            tollIcon: "VeriTag",
            isTextBased: false,
            iconBackgroundConfiguration: {
              backgroundColor: "Transparent",
              horizontalPadding: 0,
              verticalPadding: 0,
              borderRadius: 0,
            },
            addon: "none",
            iconSize: 3,
            isSquare: true,
            isTollIcon: false,
            showBackground: true,
            onlyHorizontalPadding: 0.25,
            pbmPadding: 0.25,
            pbmIsSquare: true,
            fontFamily: "Transport",
            underline: false,
            fontSize: 0,
          },
          fullLeft: {
            minimumWidth: 7,
            fontFamily: "Transport",
            letterSpacing: 0,
            bottomSpacing: 1.25,
            flipJustify: false,
          },
          partialLeft: {
            separateRow: true,
            horizontalPadding: 0.6,
            verticalPadding: 0.3,
            letterSpacing: 2,
            minWidth: 7,
            spacing: 1.5,
            fontFamily: "Transport",
            borderRadius: 4,
          },
          hovVariant1: {
            height: 0,
            width: 0,
            verticalPadding: 0.125,
            roundCorners: false,
          },
          hovVariant2: {
            height: 0,
            width: 0,
            verticalPadding: 0.125,
          },
        },
        tagToReplace: [
          "fontFamily",
          "containerBackgroundColor",
          "borderStyle",
          "tollIcon",
        ],
      },
      Shield: {
        shieldType: "preset",
        shieldName: "Interlink",
        shieldValue: "ILG",
        variant: "Auto",
        shieldBacks: false,
        shieldBackColor: "Black",
        shieldBackRadius: 4,
        imageType: "",
        imageData: "",
        banners: {},
        bannerSettings: {
          top: { alignment: "start", gap: 0 },
          left: { alignment: "start", gap: 0, inset: 0.5 },
          right: { alignment: "start", gap: 0, inset: 0.5 },
          bottom: { alignment: "end", gap: 0 },
        },
        group: 0,
        designation: "",
        routeNumber: "10",
        scale: 100,
        horizMargin: 8,
        vertMargin: 8,
        customShields: {
          route_scale: 100,
          route_xOffset: 0,
          route_yOffset: 0,
          route_letterSpacing: 0,
          route_fontFamily: "",
          route_color: "",
          designation_scale: 100,
          designation_xOffset: 0,
          designation_yOffset: 0,
          designation_letterSpacing: 0,
          designation_fontFamily: "",
          designation_color: "",
        },
      },
      Banner: {
        textContent: "NORTH",
        firstLetterSize: 125,
        fontSize: 0.8,
        backgroundColor: "Inherit",
        horizontalPadding: 0,
        verticalPadding: 0,
        horizontalMargin: 0,
        verticalMargin: 0,
        borderRadius: 4,
        fontFamily: "Series EEM",
        tagToReplace: ["fontFamily"],
      },
    },
  };

  const isPlainObject = (value) =>
    value !== null && typeof value === "object" && value.constructor === Object;

  const cloneValue = (value) => {
    if (Array.isArray(value)) return value.map((item) => cloneValue(item));
    if (!isPlainObject(value)) return value;

    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, cloneValue(val)]),
    );
  };

  const merge = (target, source) => {
    for (const key in source) {
      const val = source[key];
      if (val === undefined) continue;

      if (Array.isArray(val)) {
        target[key] = cloneValue(val);
      } else if (isPlainObject(val)) {
        if (!isPlainObject(target[key])) target[key] = {};
        merge(target[key], val);
      } else {
        target[key] = val;
      }
    }
    return target;
  };

  const getClassNames = (className) => {
    let currentClass = window[className];

    if (typeof currentClass !== "function") return [];

    const classNames = [currentClass.name];

    while (currentClass) {
      const parentClass = Object.getPrototypeOf(currentClass);

      if (
        !parentClass ||
        parentClass === Function.prototype ||
        parentClass === Object.prototype ||
        parentClass.name === ""
      ) {
        break;
      }

      classNames.push(parentClass.name);
      currentClass = parentClass;
    }

    return classNames.reverse();
  };

  const getDefaults = (className, guide) => {
    const defaults = {};

    for (const currentClassName of getClassNames(className)) {
      merge(defaults, variants.MUTCD[currentClassName] || {});
      if (guide !== "MUTCD") {
        merge(defaults, variants[guide]?.[currentClassName] || {});
      }
    }

    return defaults;
  };

  const get = (className, options = {}) => {
    const guide =
      typeof App !== "undefined" && App.getPost()
        ? App.getPost().mutcdVariant
        : "MUTCD";
    return merge(getDefaults(className, guide), options);
  };

  variants.get = get;
  variants.getClassNames = getClassNames;
  variants.getVariableNames = (className) => {
    const variableNames = new Set();
    for (const currentClassName of getClassNames(className)) {
      for (const key of Object.keys(variants.MUTCD[currentClassName] || {})) {
        variableNames.add(key);
      }
    }
    return [...variableNames];
  };

  return variants;
})();
