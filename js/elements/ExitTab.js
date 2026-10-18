const defaultExitTabConfig = {
  // Content
  textContent: "EXIT 1",
  subTextContent: "",
  shields: {
    left: [],
    right: [],
  },

  // Appearance
  backgroundColor: "inherit",
  borderStyle: "round",
  borderThickness: 0.2,
  borderRadius: 0.5,
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
  fontFamily: "Clearview 5WR",
  numeralFontFamily: "Inherit",
  letterSpacing: 0,
  numeralLetterSpacing: 0,
  useTrimFormat: false,

  shieldsDirection: "horizontal",
  shieldsGap: 0.5,
  shieldWordSpacing: 0.25,

  contentDirection: "horizontal",

  // Positioning
  alignment: "right",
  width: "auto",
  widthSize: 0,

  // Variant
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
};

class ExitTab {
  constructor(options = {}) {
    const freshConfig = structuredClone(defaultExitTabConfig);

    Object.assign(this, freshConfig);

    if (Object.keys(options).length > 0) {
      lib.deepMerge(this, options);
    }
  }

  splitText(text) {
    if (!this.enlargeNumerals) {
      return text.split(/\s+/).filter(Boolean);
    }

    const tokens = text.match(/\d+[\w-]*|[^\s\d]+/g) || [];

    if (this.spaceLettersNumerals) {
      return tokens.map((token) => {
        if (/^\d+[\w-]+$/.test(token)) {
          const digits = token.match(/^\d+/)[0];
          const letters = token.slice(digits.length);
          return [digits, letters];
        }
        return token;
      });
    }

    return tokens;
  }

  createElement() {
    const exitTabHolder = document.createElement("div");
    exitTabHolder.className = `ET-tabHolder ${this.alignment} ${this.width.replace(/\s/g, "-")}`;
    exitTabHolder.style.setProperty(
      "--width",
      this.widthSize + (this.width == "custom percent" ? "%" : "rem"),
    );
    exitTabHolder.style.padding = this.holderPadding + "px";

    const exitTabElement = document.createElement("div");
    exitTabElement.className = `ET-tab ${this.useTrimFormat ? "useTrim" : ""} ${this.variant.toLowerCase().replace(/\s/g, "-")} ${this.borderStyle} ${this.useFullBorder ? "fullBorder" : ""}`;

    if (this.backgroundColor != "inherit") {
      exitTabHolder.style.setProperty(
        "--backgroundColor",
        lib.colors[
          this.backgroundColor.replace(/\p{L}+/gu, (word) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
        ] || this.backgroundColor.toLowerCase(),
      );

      if (lib.checkForContrast(this.backgroundColor.toLowerCase())) {
        exitTabElement.style.color = "black";
        exitTabElement.style.borderColor = "black";
      }
    }

    exitTabElement.style.setProperty(
      "--minimumHeight",
      this.minimumHeight + "rem",
    );
    exitTabElement.style.setProperty(
      "--horizontalPadding",
      this.horizontalPadding + "rem",
    );
    exitTabElement.style.setProperty(
      "--verticalPadding",
      this.verticalPadding + "rem",
    );

    exitTabElement.style.setProperty(
      "--direction",
      this.contentDirection == "horizontal" ? "row" : "column",
    );

    exitTabElement.style.setProperty(
      "--borderThickness",
      this.borderThickness + "rem",
    );
    if (this.borderStyle == "round") {
      exitTabElement.style.setProperty(
        "--borderRadius",
        this.borderRadius + "rem",
      );
    }

    exitTabElement.style.setProperty(
      "--letterSpacing",
      this.letterSpacing + "rem",
    );
    exitTabElement.style.setProperty(
      "--numeralLetterSpacing",
      this.numeralLetterSpacing + "rem",
    );
    exitTabElement.style.setProperty(
      "--fontFamily",
      '"' + this.fontFamily + '"',
    );
    exitTabElement.style.setProperty(
      "--numeralFontFamily",
      '"' +
        (this.numeralFontFamily == "Inherit"
          ? this.fontFamily
          : this.numeralFontFamily) +
        '"',
    );
    exitTabElement.style.setProperty("--fontSize", this.fontSize + "px");
    exitTabElement.style.setProperty("--lineHeight", this.lineHeight + "%");
    exitTabElement.style.setProperty(
      "--extraMarginLeft",
      this.numeralWordSpacing + "rem",
    );

    if (this.enlargeNumerals) {
      exitTabElement.style.setProperty(
        "--enlargeNumeralPercent",
        this.enlargeNumeralsSize / 100,
      );
    }

    exitTabElement.style.gap = this.fontSize * 0.25 + "px";

    if (this.variant == "FullLeft") {
      let leftElement = document.createElement("div");
      leftElement.className = "ET-FullLeftHolder";

      let leftElementContent = document.createElement("div");
      leftElementContent.textContent = "LEFT";
      leftElementContent.className = "ET-FullLeft";

      exitTabElement.style.minWidth =
        this.variantSettings.fullLeft.minimumWidth + "rem";
      leftElementContent.style.setProperty(
        "--fontFamily",
        '"' + this.variantSettings.fullLeft.fontFamily + '"',
      );
      leftElementContent.style.setProperty(
        "--letterSpacing",
        this.variantSettings.fullLeft.letterSpacing + "px",
      );
      exitTabElement.style.setProperty(
        "--bottomSpacing",
        this.variantSettings.fullLeft.bottomSpacing + "rem",
      );

      if (this.variantSettings.fullLeft.flipJustify) {
        exitTabElement.style.justifyContent =
          this.alignment == "left"
            ? "right"
            : this.alignment == "right"
              ? "left"
              : "center";
      }

      leftElement.appendChild(leftElementContent);
      exitTabElement.appendChild(leftElement);
    } else if (this.variant == "PartialLeft") {
      let leftElement = document.createElement("div");
      leftElement.textContent = "LEFT";
      leftElement.className =
        "ET-PartialLeft " +
        (this.variantSettings.partialLeft.separateRow ? "separateRow" : "");
      exitTabElement.style.minWidth =
        this.variantSettings.partialLeft.minWidth + "rem";
      leftElement.style.setProperty(
        "--horizontalPadding",
        this.variantSettings.partialLeft.horizontalPadding + "rem",
      );
      leftElement.style.setProperty(
        "--verticalPadding",
        this.variantSettings.partialLeft.verticalPadding + "rem",
      );
      leftElement.style.setProperty(
        "--letterSpacing",
        this.variantSettings.partialLeft.letterSpacing + "px",
      );
      exitTabElement.style.setProperty(
        "--partialLeftSpacing",
        this.variantSettings.partialLeft.spacing + "rem",
      );
      leftElement.style.setProperty(
        "--fontFamily",
        '"' + this.variantSettings.partialLeft.fontFamily + '"',
      );
      leftElement.style.setProperty(
        "--partialLeftBorderRadius",
        this.variantSettings.partialLeft.borderRadius + "px",
      );

      exitTabElement.appendChild(leftElement);
    }

    let textParentElement = exitTabElement;

    if (["HOVVariant1", "HOVVariant2"].includes(this.variant)) {
      const hovElement = document.createElement("img");
      hovElement.className = "ET-HOV";
      hovElement.src = "./assets/icons/HOV.svg";

      if (
        this.variantSettings[
          this.variant == "HOVVariant1" ? "hovVariant1" : "hovVariant2"
        ].width != 0
      ) {
        hovElement.style.width =
          this.variantSettings[
            this.variant == "HOVVariant1" ? "hovVariant1" : "hovVariant2"
          ].width + "rem";
      }

      if (
        this.variantSettings[
          this.variant == "HOVVariant1" ? "hovVariant1" : "hovVariant2"
        ].height != 0
      ) {
        hovElement.style.height =
          this.variantSettings[
            this.variant == "HOVVariant1" ? "hovVariant1" : "hovVariant2"
          ].height + "rem";
      }

      hovElement.style.padding =
        this.variantSettings[
          this.variant == "HOVVariant1" ? "hovVariant1" : "hovVariant2"
        ].verticalPadding + "rem";

      exitTabElement.appendChild(hovElement);

      if (this.variant == "HOVVariant2") {
        const textElemHolder = document.createElement("div");
        textElemHolder.className = "ET-TextHolder";
        exitTabElement.appendChild(textElemHolder);
        textParentElement = textElemHolder;
      } else {
        if (this.variantSettings.hovVariant1.roundCorners) {
          hovElement.classList.add("roundCorners");
        }
      }
    }

    if (
      ["Normal", "PartialLeft", "FullLeft", "HOVVariant2"].includes(
        this.variant,
      )
    ) {
      let afterShieldElems = null;

      for (const shieldDirection of ["left", "right"]) {
        if (
          !this.shields[shieldDirection] ||
          this.shields[shieldDirection].length === 0
        ) {
          continue;
        }

        const shieldHolder = document.createElement("div");
        shieldHolder.className = `ET-shieldHolder ${shieldDirection} ${this.shieldsDirection}`;
        shieldHolder.style.gap = this.shieldsGap + "rem";
        shieldHolder.style.flexDirection =
          this.shieldsDirection == "horizontal" ? "row" : "column";

        if (shieldDirection == "left") {
          shieldHolder.style.marginRight = this.shieldWordSpacing + "rem";
        } else {
          shieldHolder.style.marginLeft = this.shieldWordSpacing + "rem";
        }

        for (const shield of this.shields[shieldDirection]) {
          const shieldElement = shield.createElement();
          shieldHolder.appendChild(shieldElement);
        }

        if (shieldDirection == "left") {
          if (this.variant == "HOVVariant2") {
            textParentElement.insertBefore(
              shieldHolder,
              textParentElement.firstChild,
            );
          } else {
            textParentElement.appendChild(shieldHolder);
          }
        } else {
          afterShieldElems = shieldHolder;
        }
      }

      let splitText = this.splitText(this.textContent);
      for (let i = 0; i < splitText.length; i++) {
        let item = splitText[i];
        if (Array.isArray(item)) {
          const groupHolder = document.createElement("span");
          groupHolder.className = "ET-numeralGroup";
          groupHolder.style.gap = this.fontSize * 0.25 + "px";

          const wordElem1 = document.createElement("span");
          wordElem1.textContent = item[0];
          wordElem1.className = "ET-numeral";

          groupHolder.appendChild(wordElem1);

          if (item[1] === "") {
            textParentElement.appendChild(groupHolder);
            continue;
          }

          const wordElem2 = document.createElement("span");
          wordElem2.textContent = item[1];
          wordElem2.className = "ET-trailing";

          groupHolder.appendChild(wordElem2);
          textParentElement.appendChild(groupHolder);
        } else {
          const wordElem = document.createElement("span");
          wordElem.textContent = item
            .replace(/\\t/g, "\t")
            .replace(/\\n/g, "\n");

          if (/\d/.test(item)) {
            wordElem.className = "ET-numeral";
          } else {
            wordElem.className = "ET-word";
          }

          if (wordElem.className == "ET-word" && this.offsetNonNumerals) {
            wordElem.style.bottom = "calc(var(--fontSize) / 4)";
          }

          if (
            i == 0 &&
            (this.subTextContent != "") & (wordElem.className == "ET-word")
          ) {
            wordElem.textContent = item + "\n" + this.subTextContent;
            wordElem.style.textAlign = "left";
          }

          textParentElement.appendChild(wordElem);
        }
      }

      if (afterShieldElems) {
        textParentElement.appendChild(afterShieldElems);
      }
    }

    if (this.variant == "Icon") {
      const iconSettings = this.variantSettings.icon;
      const iconLibrary = iconSettings.isTollIcon
        ? TollLogoElement.logos
        : IconElement.icons;
      const iconDefinition = iconSettings.isTollIcon
        ? iconLibrary[iconSettings.tollIcon]
        : iconLibrary[iconSettings.icon];

      if (!iconSettings.showBackground) {
        exitTabHolder.style.background = "none";
        exitTabElement.style.border = "none";
      }

      exitTabElement.style.setProperty(
        "--iconSize",
        iconSettings.iconSize + "rem",
      );

      exitTabElement.style.setProperty(
        "--iconFontFamily",
        '"' + iconSettings.fontFamily + '"',
      );
      exitTabElement.style.setProperty(
        "--onlyHorizontalPadding",
        iconSettings.onlyHorizontalPadding + "rem",
      );
      exitTabElement.style.setProperty(
        "--pbmPadding",
        iconSettings.pbmPadding + "rem",
      );

      exitTabElement.style.setProperty(
        "--iconHorizontalPadding",
        iconSettings.showBackground ? "var(--horizontalPadding)" : "0rem",
      );
      exitTabElement.style.setProperty(
        "--iconVerticalPadding",
        iconSettings.showBackground ? "var(--verticalPadding)" : "0rem",
      );
      exitTabElement.classList.add(
        iconSettings.addon.toLowerCase().replace(/\s/g, "-"),
      );

      const imageHolder = document.createElement("div");
      imageHolder.className = "ET-iconImageHolder";

      const imageElement = document.createElement("img");
      imageElement.className =
        "ET-iconImage " + (iconSettings.isSquare ? "square" : "");
      imageElement.src = iconSettings.isTollIcon
        ? iconDefinition.src
        : iconSettings.iconType === "custom"
          ? iconSettings.iconData
          : `./assets/icons/${iconDefinition}`;
      imageHolder.appendChild(imageElement);

      if (
        iconSettings.iconBackgroundConfiguration.backgroundColor !=
        "Transparent"
      ) {
        imageHolder.style.setProperty(
          "--iconBackgroundColor",
          lib.colors[
            iconSettings.iconBackgroundConfiguration.backgroundColor
          ] ||
            iconSettings.iconBackgroundConfiguration.backgroundColor.toLowerCase(),
        );
        imageHolder.style.setProperty(
          "--iconBackgroundHorizontalPadding",
          iconSettings.iconBackgroundConfiguration.horizontalPadding + "rem",
        );
        imageHolder.style.setProperty(
          "--iconBackgroundVerticalPadding",
          iconSettings.iconBackgroundConfiguration.verticalPadding + "rem",
        );
        imageHolder.style.setProperty(
          "--iconBackgroundBorderRadius",
          iconSettings.iconBackgroundConfiguration.borderRadius + "px",
        );

        if (
          lib.checkForContrast(
            iconSettings.iconBackgroundConfiguration.backgroundColor.toLowerCase(),
          ) &&
          !iconSettings.isTollIcon
        ) {
          imageElement.style.filter = "invert(1)";
        }
      }

      exitTabElement.style.gap = "";

      if (iconSettings.addon.toLowerCase() == "only") {
        if (iconSettings.isTextBased) {
          const textElement = document.createElement("span");
          textElement.className = "ET-iconText ";
          textElement.textContent = this.textContent;
          if (this.subTextContent) {
            textElement.textContent += "\n" + this.subTextContent;
          }
          exitTabElement.appendChild(textElement);
        } else {
          exitTabElement.appendChild(imageHolder);
        }

        const onlyElement = document.createElement("span");
        onlyElement.className = "ET-iconOnly";
        onlyElement.textContent = "ONLY";
        exitTabElement.appendChild(onlyElement);

        exitTabElement.style.padding = "";
      } else if (iconSettings.addon.toLowerCase() == "or variant") {
        exitTabElement.appendChild(imageHolder);

        const orElement = document.createElement("span");
        orElement.className = "ET-iconOr";
        orElement.textContent = "OR";
        exitTabElement.appendChild(orElement);

        const payByMailElement = document.createElement("span");
        payByMailElement.className =
          "ET-iconPayByMail ET-iconImage " +
          (iconSettings.pbmIsSquare ? "square" : "");
        payByMailElement.textContent = this.textContent;

        if (iconSettings.fontSize > 0) {
          payByMailElement.style.fontSize = iconSettings.fontSize + "rem";
        }

        exitTabElement.style.padding = "";
        exitTabElement.appendChild(payByMailElement);
      } else {
        const textElement = document.createElement("span");
        textElement.className = "ET-iconText ";
        textElement.textContent = this.textContent
          .replace(/\\t/g, "\t")
          .replace(/\\n/g, "\n");
        if (this.subTextContent) {
          textElement.textContent += "\n" + this.subTextContent;
        }

        exitTabElement.appendChild(textElement);

        if (
          iconSettings.underline &&
          (this.textContent != "" || this.subTextContent != "")
        ) {
          const divider = document.createElement("div");
          divider.className = "ET-iconDivider";
          exitTabElement.appendChild(divider);
        }

        exitTabElement.style.padding = "0";
        exitTabElement.appendChild(imageHolder);
      }
    }

    exitTabHolder.appendChild(exitTabElement);
    return exitTabHolder;
  }
}

ExitTab.prototype.defaultExitTabConfig = structuredClone(defaultExitTabConfig);
delete ExitTab.prototype.defaultExitTabConfig.textContent;
delete ExitTab.prototype.defaultExitTabConfig.subTextContent;
delete ExitTab.prototype.defaultExitTabConfig.shields;
delete ExitTab.prototype.defaultExitTabConfig.variant;

ExitTab.backgroundColors = ["Inherit"].concat(Object.keys(lib.colors));
ExitTab.borderStyles = ["Round", "Square"];
ExitTab.fontFamilies = TextElement.fontFamilies;
ExitTab.numeralFontFamilies = ["Inherit"].concat(
  ...ExitTab.fontFamilies,
);
ExitTab.shieldsDirections = ["Horizontal", "Vertical"];
ExitTab.contentDirections = ["Horizontal", "Vertical"];
ExitTab.shieldsPositions = ["Start", "End"];
ExitTab.alignments = ["Left", "Center", "Right"];
ExitTab.widthPresets = [
  "Auto",
  "Full",
  "Custom Percent",
  "Custom Size",
];
ExitTab.variants = [
  "Normal",
  "Icon",
  "PartialLeft",
  "FullLeft",
  "HOVVariant1",
  "HOVVariant2",
];

ExitTab.iconVariantAddons = ["None", "Only", "Or Variant"];
ExitTab.tollIconBackgrounds = ["Transparent"].concat(
  Object.keys(lib.colors),
);

class ExitTabRow {
  constructor({
    exitTabs = [],
    gap = 0,
    panelEdgeType = "separate",
    position = "top",
    marginBottom = 0.3,
    independentWidth = false,
    hideTopBorder = false,
    hideBottomBorder = false,
  } = {}) {
    this.exitTabs = exitTabs;
    this.gap = gap;
    this.panelEdgeType = panelEdgeType;
    this.position = position;
    this.marginBottom = marginBottom;
    this.independentWidth = independentWidth;
    this.hideTopBorder = hideTopBorder;
    this.hideBottomBorder = hideBottomBorder;
  }

  createElement() {
    const exitTabHolder = document.createElement("div");
    exitTabHolder.className =
      "ET-row " + this.panelEdgeType.toLowerCase().replace(/\s/g, "-");
    exitTabHolder.style.setProperty("--spacing", this.gap + "rem");
    exitTabHolder.style.setProperty(
      "--marginBottom",
      this.marginBottom + "rem",
    );

    const leftAlignment = document.createElement("div");
    leftAlignment.className = "ET-alignment left";

    const centerAlignment = document.createElement("div");
    centerAlignment.className = "ET-alignment center";

    const rightAlignment = document.createElement("div");
    rightAlignment.className = "ET-alignment right";

    for (let i = 0; i < this.exitTabs.length; i++) {
      const exitTab = this.exitTabs[i];
      const elem = exitTab.createElement();

      if (exitTab.alignment == "left") {
        leftAlignment.appendChild(elem);
      } else if (exitTab.alignment == "center") {
        centerAlignment.appendChild(elem);
      } else if (exitTab.alignment == "right") {
        rightAlignment.appendChild(elem);
      }
    }

    exitTabHolder.appendChild(leftAlignment);
    exitTabHolder.appendChild(centerAlignment);
    exitTabHolder.appendChild(rightAlignment);

    return exitTabHolder;
  }

  newExitTab(alignment = "center") {
    const exitTab = new ExitTab();
    exitTab.alignment = alignment;
    this.exitTabs.push(exitTab);

    return exitTab;
  }

  duplicateExitTab(index) {
    const exitTab = this.exitTabs[index];
    const cloneExitTab = structuredClone(exitTab);
    Object.setPrototypeOf(cloneExitTab, ExitTab.prototype);
    this.exitTabs.splice(index + 1, 0, cloneExitTab);

    return cloneExitTab;
  }

  deleteExitTab(index) {
    this.exitTabs.splice(index, 1);
  }
}
ExitTabRow.prototype.panelEdgeType = ["Separate", "Extend", "Meet Corners"];
ExitTabRow.prototype.position = [
  "Top",
  "Bottom",
  "Left",
  "Right",
  "Within Panel",
];

window.ExitTab = ExitTab;
window.ExitTabRow = ExitTabRow;
