// Control.js
const fractionMap = {
  "1/2": "½",
  "1/3": "⅓",
  "2/3": "⅔",
  "1/4": "¼",
  "3/4": "¾",
  "1/5": "⅕",
  "2/5": "⅖",
  "3/5": "⅗",
  "4/5": "⅘",
  "1/6": "⅙",
  "5/6": "⅚",
  "1/7": "⅐",
  "1/8": "⅛",
  "3/8": "⅜",
  "5/8": "⅝",
  "7/8": "⅞",
  "1/9": "⅑",
  "1/10": "⅒",
};
const fractionRegex = new RegExp(Object.keys(fractionMap).join("|"), "g");

class TextElement {
  constructor({
    textContent = "New Sign",
    backgroundColor = "Inherit",
    fontFamily = "Clearview 5WR",
    fontSize = 100,
    useBannerFormatting = false,
    bannerFormattingSize = 100,
    bannerFirstLetterSize = 120,
    useNumeralFormatting = false,
    numeralFormattingSize = 150,
    alignment = "Center",
    justification = "Center",
    lineHeight = 100,
  } = {}) {
    this.textContent = textContent;
    this.fontFamily = fontFamily;
    this.backgroundColor = backgroundColor;
    this.fontSize = fontSize;
    this.useBannerFormatting = useBannerFormatting;
    this.useNumeralFormatting = useNumeralFormatting;
    this.bannerFormattingSize = bannerFormattingSize;
    this.numeralFormattingSize = numeralFormattingSize;
    this.bannerFirstLetterSize = bannerFirstLetterSize;
    this.alignment = alignment;
    this.justification = justification;
    this.lineHeight = lineHeight;
  }

  splitString() {
    let result = [this.textContent];
    let tagged = [];

    // Define the banner types to split by if useBannerFormating is true
    const numeralPattern = /(\d+\S*)|([\u00BC-\u00BE]+\S*)/;
    const lightNumeralPattern = new RegExp(
      numeralPattern.source + "|" + Object.values(fractionMap).join("|"),
      "g"
    );

    const bannerPattern = new RegExp(
      `(\\s*)(\\b(?:${Shield.prototype.bannerTypes.join("|")})\\b)(\\s*)`,
      "gi"
    );
    const lightBannerPattern = new RegExp(
      `(\\b(?:${Shield.prototype.bannerTypes.join("|")})\\b)`,
      "gi"
    );

    if (this.useBannerFormatting) {
      result = result[0].split(bannerPattern).filter(Boolean);
    }

    if (this.useNumeralFormatting) {
      let newResult = [];
      for (let i = 0; i < result.length; i++) {
        let currentResult = result[i]
          .split(numeralPattern)
          .filter(Boolean)
          .map((val) =>
            val.replace(fractionRegex, (match) => fractionMap[match])
          );
        newResult = newResult.concat(currentResult);
      }
      result = newResult;
    }

    result = result.map((val) =>
      val.replace(/\\t/g, "\t").replace(/\\n/g, "\n")
    );
    for (let i = 0; i < result.length; i++) {
      let r = result[i];
      if (lightNumeralPattern.test(r) && this.useNumeralFormatting) {
        tagged[i] = { type: "numeral", value: r };
      } else if (lightBannerPattern.test(r) && this.useBannerFormatting) {
        tagged[i] = { type: "banner", value: r };
      } else {
        tagged[i] = { type: "text", value: r };
      }
    }

    return tagged;
  }

  createElement(panel) {
    const newText = document.createElement("div");
    newText.className = "bE-textElement";
    const usesHighwayGothic =
      typeof this.fontFamily === "string" &&
      this.fontFamily.toLowerCase().includes("series");

    // Set custom CSS properties here based off the this. properties
    newText.style.setProperty("--fontFamily", '"' + this.fontFamily + '"');
    newText.style.fontFamily = '"' + this.fontFamily + '", "Series EM"';
    newText.dataset.exportFontFamily = this.fontFamily;
    newText.style.setProperty(
      "--fontSize",
      1.75 * (this.fontSize / 100) + "rem"
    );
    newText.style.setProperty(
      "--blockBgColor",
      this.backgroundColor == "Inherit"
        ? ""
        : (
          lib.colors[this.backgroundColor] || this.backgroundColor
        ).toLowerCase()
    );
    newText.style.setProperty("--alignment", this.alignment);
    newText.style.setProperty("--justification", (this.justification || "Center").toLowerCase());
    newText.style.setProperty("--numeralSize", this.numeralFormattingSize);
    newText.style.setProperty("--bannerSize", this.bannerFormattingSize);
    newText.style.setProperty(
      "--bannerFirstLetterSize",
      this.bannerFirstLetterSize
    );
    newText.style.setProperty("--lineHeight", this.lineHeight);
    if (usesHighwayGothic) {
      newText.style.setProperty(
        "--fhwaBaselineOffset",
        "var(--fhwaBaselineShift)"
      );
    }

    if (
      this.backgroundColor == "Orange" ||
      this.backgroundColor == "White" ||
      this.backgroundColor == "Yellow" ||
      this.backgroundColor == "Fluorescent Yellow-Green"
    ) {
      newText.style.color = "black";
    } else if (this.backgroundColor != "Inherit") {
      newText.style.color = "white";
    }

    let splitTextContent = this.splitString();
    for (let i = 0; i < splitTextContent.length; i++) {
      let text = splitTextContent[i];
      const newTextFragment = document.createElement("span");
      newTextFragment.className = "bE-" + text.type;
      newTextFragment.textContent = text.value;

      newText.appendChild(newTextFragment);
    }

    return newText;
  }
}

TextElement.prototype.fontFamily = [
  "Clearview 1B",
  "Clearview 1W",
  "Clearview 2B",
  "Clearivew 2W",
  "Clearview 3B",
  "Clearview 3W",
  "Clearview 4B",
  "Clearview 4W",
  "Clearivew 5B",
  "Clearivew 5W",
  "Clearview 5WR",
  "Clearview 6B",
  "Series A",
  "Series B",
  "Series C",
  "Series D",
  "Series E",
  "Series EM",
  "Series F",
  "Arial",
  "Arial Bold",
  "Transport",
  "Modern VMS",
];

TextElement.prototype.alignment = ["Left", "Center", "Right"];

TextElement.prototype.justification = ["Left", "Center", "Right"];

TextElement.prototype.backgroundColor = ["Inherit"].concat(
  Object.keys(lib.colors)
);

class ControlTextElement extends TextElement {
  constructor(options = {}) {
    const {
      spacing = 0,
      smallCapitals = false,
      textColor = ControlTextElement.defaultTextColor,
    } = options;
    const resolvedOptions = { ...options };
    const availableFonts =
      TextElement && TextElement.prototype
        ? TextElement.prototype.fontFamily
        : null;
    const providedFont = resolvedOptions.fontFamily;
    if (
      !providedFont ||
      !Array.isArray(availableFonts) ||
      !availableFonts.includes(providedFont)
    ) {
      const defaultFont =
        typeof ControlTextElement.getDefaultFont === "function"
          ? ControlTextElement.getDefaultFont()
          : ControlTextElement.defaultFont;
      if (defaultFont) {
        resolvedOptions.fontFamily = defaultFont;
      }
    }
    super(resolvedOptions);
    this.spacing = spacing;
    this.smallCapitals = smallCapitals;
    this.textColor =
      typeof textColor === "string" && textColor.trim().length
        ? textColor
        : ControlTextElement.defaultTextColor;
  }

  createElement(panel) {
    const newText = super.createElement(panel);
    newText.style.setProperty("--spacing", this.spacing + "rem");
    newText.style.fontVariant = this.smallCapitals ? "small-caps" : "normal";
    newText.classList.add("bE-controlTextElement");

    const shouldOverrideTextColor =
      typeof this.textColor === "string" &&
      this.textColor.trim().length > 0 &&
      this.textColor !== ControlTextElement.defaultTextColor;
    if (shouldOverrideTextColor) {
      const resolvedTextColor =
        (lib?.colors && lib.colors[this.textColor]) || this.textColor;
      if (typeof resolvedTextColor === "string") {
        newText.style.color = resolvedTextColor.toLowerCase();
      } else if (resolvedTextColor) {
        newText.style.color = resolvedTextColor;
      }
    }

    return newText;
  }
}

ControlTextElement.defaultFont = TextElement.prototype.fontFamily.includes(
  "Series E"
)
  ? "Series E"
  : TextElement.prototype.fontFamily[0];

ControlTextElement.getDefaultFont = function () {
  const availableFonts = TextElement.prototype.fontFamily;
  const currentDefault = ControlTextElement.defaultFont || availableFonts[0];
  return availableFonts.includes(currentDefault)
    ? currentDefault
    : availableFonts[0];
};

ControlTextElement.setDefaultFont = function (font) {
  const availableFonts = TextElement.prototype.fontFamily;
  if (!font || !availableFonts.includes(font)) {
    return false;
  }
  ControlTextElement.defaultFont = font;
  return true;
};

ControlTextElement.defaultTextColor = "Match BG";
ControlTextElement.getTextColorOptions = function () {
  const palette = Object.keys(lib.colors);
  const options = [ControlTextElement.defaultTextColor];
  for (const color of palette) {
    if (!options.includes(color)) {
      options.push(color);
    }
  }
  return options;
};

class ActionMessageElement extends TextElement {
  constructor(options = {}) {
    const {
      fontSize = 70,
      useNumeralFormatting = true,
      textColor = ActionMessageElement.defaultTextColor,
    } = options;
    const resolvedOptions = { ...options };
    const availableFonts =
      TextElement && TextElement.prototype
        ? TextElement.prototype.fontFamily
        : null;
    const providedFont = resolvedOptions.fontFamily;
    if (
      !providedFont ||
      !Array.isArray(availableFonts) ||
      !availableFonts.includes(providedFont)
    ) {
      const defaultFont =
        typeof ActionMessageElement.getDefaultFont === "function"
          ? ActionMessageElement.getDefaultFont()
          : ActionMessageElement.defaultFont;
      if (defaultFont) {
        resolvedOptions.fontFamily = defaultFont;
      }
    }

    super({
      ...resolvedOptions,
      fontSize,
      useNumeralFormatting,
    });

    this.fontSize = fontSize;
    this.useNumeralFormatting = useNumeralFormatting;
    this.textColor =
      typeof textColor === "string" && textColor.trim().length
        ? textColor
        : ActionMessageElement.defaultTextColor;
  }

  createElement(panel) {
    const newText = super.createElement(panel);

    const shouldOverrideTextColor =
      typeof this.textColor === "string" &&
      this.textColor.trim().length > 0 &&
      this.textColor !== ActionMessageElement.defaultTextColor;
    if (shouldOverrideTextColor) {
      const resolvedTextColor =
        (lib?.colors && lib.colors[this.textColor]) || this.textColor;
      if (typeof resolvedTextColor === "string") {
        newText.style.color = resolvedTextColor.toLowerCase();
      } else if (resolvedTextColor) {
        newText.style.color = resolvedTextColor;
      }
    }

    return newText;
  }
}

ActionMessageElement.defaultFont = TextElement.prototype.fontFamily.includes(
  "Series E"
)
  ? "Series E"
  : TextElement.prototype.fontFamily[0];

ActionMessageElement.getDefaultFont = function () {
  const availableFonts = TextElement.prototype.fontFamily;
  const currentDefault = ActionMessageElement.defaultFont || availableFonts[0];
  return availableFonts.includes(currentDefault)
    ? currentDefault
    : availableFonts[0];
};

ActionMessageElement.setDefaultFont = function (font) {
  const availableFonts = TextElement.prototype.fontFamily;
  if (!font || !availableFonts.includes(font)) {
    return false;
  }
  ActionMessageElement.defaultFont = font;
  return true;
};

ActionMessageElement.defaultTextColor = "Match BG";
ActionMessageElement.getTextColorOptions = function () {
  const palette = Object.keys(lib.colors);
  const options = [ActionMessageElement.defaultTextColor];
  for (const color of palette) {
    if (!options.includes(color)) {
      options.push(color);
    }
  }
  return options;
};

class AdvisoryMessageElement extends TextElement {
  constructor({
    backgroundColor = "Yellow",
    fontFamily = "Series E",
    borderRadius = 4,
    useNumeralFormatting = true,
    horizPadding = 0.3,
    vertPadding = 0.3,
    textColor = AdvisoryMessageElement.defaultTextColor,
  } = {}) {
    super();
    this.backgroundColor = backgroundColor;
    this.fontFamily = fontFamily;
    this.borderRadius = borderRadius;
    this.useNumeralFormatting = useNumeralFormatting;
    this.horizPadding = horizPadding;
    this.vertPadding = vertPadding;
    this.textColor =
      typeof textColor === "string" && textColor.trim().length
        ? textColor
        : AdvisoryMessageElement.defaultTextColor;
  }

  createElement(panel) {
    const newText = super.createElement(panel);
    newText.style.setProperty("--borderRadius", this.borderRadius + "px");
    newText.style.setProperty("--horizPadding", this.horizPadding);
    newText.style.setProperty("--vertPadding", this.vertPadding);
    newText.className = "bE-textElement bE-advisoryMessage";

    if (this.fontFamily.includes("Series")) {
      newText.classList.add("hgFix");
    }

    const shouldOverrideTextColor =
      typeof this.textColor === "string" &&
      this.textColor.trim().length > 0 &&
      this.textColor !== AdvisoryMessageElement.defaultTextColor;
    if (shouldOverrideTextColor) {
      const resolvedTextColor =
        (lib?.colors && lib.colors[this.textColor]) || this.textColor;
      if (typeof resolvedTextColor === "string") {
        newText.style.color = resolvedTextColor.toLowerCase();
      } else if (resolvedTextColor) {
        newText.style.color = resolvedTextColor;
      }
    }

    return newText;
  }
}

AdvisoryMessageElement.defaultTextColor = "Match BG";
AdvisoryMessageElement.getTextColorOptions = function () {
  const palette = Object.keys(lib.colors);
  const options = [AdvisoryMessageElement.defaultTextColor];
  for (const color of palette) {
    if (!options.includes(color)) {
      options.push(color);
    }
  }
  return options;
};

class ElectronicSignElement extends TextElement {
  constructor({
    fontFamily = "Electronic Highway Sign",
    textColor = "Orange",
    padding = 0.5,
    glow = true,
    setWidth = 0,
  } = {}) {
    super();
    this.fontFamily = fontFamily;
    this.textColor = textColor;
    this.backgroundColor = "Black";
    this.useNumeralFormatting = false;
    this.useBannerFormatting = false;
    this.padding = padding;
    this.glow = glow;
    this.setWidth = setWidth;
  }

  createElement(panel) {
    const newText = super.createElement(panel);
    newText.className = "bE-textElement bE-electronicSign";
    newText.style.setProperty(
      "--textColor",
      (lib.colors[this.textColor] || this.textColor).toLowerCase()
    );
    newText.style.setProperty("--padding", this.padding + "rem");
    newText.style.setProperty(
      "--textShadow",
      this.glow
        ? "0 0 0.25rem var(--textColor), 0 0 0.25rem var(--textColor)"
        : ""
    );
    newText.style.width = this.setWidth != 0 ? this.setWidth + "rem" : "";

    if (
      this.fontFamily.includes("Series") ||
      this.fontFamily.includes("Electronic")
    ) {
      newText.classList.add("hgFix");
    }

    return newText;
  }
}
ElectronicSignElement.prototype.fontFamily = Array.from(
  new Set(TextElement.prototype.fontFamily.concat(["Electronic Highway Sign"]))
);
ElectronicSignElement.prototype.textColors = [
  "Orange",
  "White",
  "Yellow",
  "Red",
];

// TEMP: Block-specific shield support will be replaced when the main shield
// system is integrated. Please treat this class as a stop-gap.
class ShieldElement extends Shield {
  constructor({
    shieldBase,
    shieldType,
    routeNumber = "1",
    type,
    specialBannerType,
    to = false,
    alignment = "Center",
    bannerType = ShieldElement.prototype.defaultBannerType,
    bannerType2 = ShieldElement.prototype.defaultBannerType,
    bannerPosition = ShieldElement.prototype.defaultBannerPosition,
    bannerPosition2 = ShieldElement.prototype.defaultBannerPosition,
    indentFirstLetter = true,
    indentFirstLetter2 = undefined,
    smallCaps = true,
    smallCaps2 = undefined,
    fontSize = ShieldElement.prototype.defaultBannerFontSize,
    bannerFontFamily = ShieldElement.prototype.defaultBannerFontFamily,
    bannerFontFamily2 = undefined,
    countyText = "",
    shieldSize,
    useOfficialDimensions = true,
    scaleBannersWithShield = ShieldElement.prototype.defaultScaleBannersWithShield,
    size,
  } = {}) {
    super();
    const resolvedBase =
      shieldBase || type || ShieldElement.prototype.defaultShieldBase;
    const resolvedVariant =
      shieldType || specialBannerType || ShieldElement.prototype.defaultVariant;

    this.shieldBase = resolvedBase;
    this.shieldType = resolvedVariant;
    this.routeNumber =
      `${routeNumber ?? ""}`.trim() ||
      ShieldElement.prototype.defaultRouteNumber;

    this.to = !!to;
    const validAlignments = Array.isArray(TextElement.prototype.alignment)
      ? TextElement.prototype.alignment
      : [];
    this.alignment = validAlignments.includes(alignment) ? alignment : "Center";
    this.indentFirstLetter = indentFirstLetter !== false;
    const normalizedIndentSecond =
      indentFirstLetter2 !== undefined ? indentFirstLetter2 : indentFirstLetter;
    this.indentFirstLetter2 = normalizedIndentSecond !== false;
    this.smallCaps = smallCaps !== false;
    const normalizedSmallCapsSecond =
      smallCaps2 !== undefined ? smallCaps2 : smallCaps;
    this.smallCaps2 = normalizedSmallCapsSecond !== false;
    this.bannerType = ShieldElement.prototype.normalizeBannerType(bannerType);
    this.bannerType2 = ShieldElement.prototype.normalizeBannerType(bannerType2);
    this.bannerPosition = ShieldElement.prototype.normalizeBannerPosition(
      bannerPosition
    );
    this.bannerPosition2 = ShieldElement.prototype.normalizeBannerPosition(
      bannerPosition2 || bannerPosition
    );
    this.fontSize = ShieldElement.prototype.normalizeFontSize(fontSize);
    this.bannerFontFamily =
      ShieldElement.prototype.normalizeBannerFontFamily(bannerFontFamily);
    this.bannerFontFamily2 =
      ShieldElement.prototype.normalizeBannerFontFamily(
        bannerFontFamily2 || this.bannerFontFamily
      );
    this.countyText = typeof countyText === "string" ? countyText : "";
    this.shieldSize = ShieldElement.prototype.normalizeShieldSize(
      shieldSize !== undefined ? shieldSize : size
    );
    this.useOfficialDimensions = useOfficialDimensions !== false;
    this.scaleBannersWithShield = scaleBannersWithShield !== false;

    // Legacy properties used by older save data and helpers
    this.type = resolvedBase;
    this.specialBannerType = "None";
  }

  createElement() {
    const wrapper = document.createElement("div");
    wrapper.className = "bE-shieldElement";

    if (this.to) {
      const toEl = document.createElement("p");
      toEl.className = "to";
      toEl.textContent = "TO";
      toEl.style.display = "inline";
      wrapper.appendChild(toEl);
    }

    const config = ShieldElement.prototype.getBlockShieldConfig(
      this.shieldBase
    );
    const normalizedRoute = `${this.routeNumber ?? ""}`.trim();
    const routeText = normalizedRoute;
    const migratedShieldType =
      ShieldElement.prototype.migrateLegacyBlockVariant(
        this.shieldType,
        config
      );
    if (migratedShieldType !== this.shieldType) {
      this.shieldType = migratedShieldType;
    }
    const variant = ShieldElement.prototype.resolveBlockVariant(
      migratedShieldType,
      routeText,
      config
    );
    const variantKey = ShieldElement.prototype.formatVariantKey(variant);
    const shieldPath = ShieldElement.prototype.getShieldAssetPath(
      config,
      variantKey
    );
    const officialPhysicalDimensions = config?.officialDimensions
      ? ShieldElement.prototype.getVariantMetadata(
          config,
          "physicalDimensionsByVariant",
          variantKey
        )
      : null;
    const routeNumberStyle = ShieldElement.prototype.getVariantMetadata(
      config,
      "routeNumberByVariant",
      variantKey
    );
    const renderedRouteText = routeNumberStyle
      ? routeText.toUpperCase()
      : routeText;
    const variablePanelWidth = routeNumberStyle?.variablePanelWidth || null;
    const physicalDimensions = this.useOfficialDimensions
      ? officialPhysicalDimensions
      : null;
    const normalizedShieldSize = ShieldElement.prototype.normalizeShieldSize(
      this.shieldSize
    );
    const physicalWidthRem = physicalDimensions?.widthIn
      ? ShieldElement.prototype.inchesToRem(physicalDimensions.widthIn)
      : null;
    const physicalHeightRem = physicalDimensions?.heightIn
      ? ShieldElement.prototype.inchesToRem(physicalDimensions.heightIn)
      : null;
    const renderedShieldHeight = physicalHeightRem || normalizedShieldSize;
    const shieldScale = ShieldElement.prototype.getShieldScale(
      renderedShieldHeight
    );
    const bannerScale = this.scaleBannersWithShield ? shieldScale : 1;
    const fontSizeCss = ShieldElement.prototype.getFontSizeCss(this.fontSize);
    const bannerFontFamily =
      ShieldElement.prototype.normalizeBannerFontFamily(this.bannerFontFamily);
    const bannerFontFamily2 =
      ShieldElement.prototype.normalizeBannerFontFamily(
        this.bannerFontFamily2 || bannerFontFamily
      );
    wrapper.style.setProperty("--shieldScale", shieldScale.toString());
    wrapper.style.setProperty(
      "--shieldSize",
      renderedShieldHeight + "rem"
    );
    if (physicalWidthRem && physicalHeightRem) {
      wrapper.style.setProperty("--shieldWidth", physicalWidthRem + "rem");
      wrapper.style.setProperty("--shieldHeight", physicalHeightRem + "rem");
    }
    if (officialPhysicalDimensions) {
      wrapper.dataset.widthIn = String(officialPhysicalDimensions.widthIn);
      wrapper.dataset.heightIn = String(officialPhysicalDimensions.heightIn);
    }
    wrapper.style.setProperty("--bannerScale", bannerScale.toString());

    const shieldContainer = document.createElement("div");
    const containerClass = config.className || config.value;
    shieldContainer.className = `bannerShieldContainer ${containerClass}`;
    const usesOfficialShieldRendering = Boolean(officialPhysicalDimensions);
    shieldContainer.classList.toggle(
      "officialFdotShield",
      usesOfficialShieldRendering && config?.standard === "FDOT"
    );
    shieldContainer.classList.toggle(
      "officialCfxShield",
      usesOfficialShieldRendering && config?.standard === "CFX"
    );
    shieldContainer.classList.toggle(
      "variableGuideWidth",
      Boolean(variablePanelWidth)
    );
    if (variantKey) {
      shieldContainer.classList.add(
        "variant-" + variantKey.toLowerCase().replace(/[^a-z0-9_-]/g, "-")
      );
    }
    const containerSizeClass = ShieldElement.prototype.getContainerSizeClass(
      routeText
    );
    if (containerSizeClass) {
      shieldContainer.classList.add(containerSizeClass);
    }

    const routeCharacterCount =
      ShieldElement.prototype.getRouteCharacterCount(routeText);
    const routeHasOne = routeText.includes("1");
    shieldContainer.classList.toggle(
      "threeNoOne",
      routeCharacterCount === 3 &&
        !routeHasOne &&
        SERIES_C_THREE_CHAR_NO_ONE_SHIELDS.some((className) =>
          shieldContainer.classList.contains(className)
        )
    );
    shieldContainer.classList.toggle(
      "threeWithOne",
      routeCharacterCount === 3 &&
        routeHasOne &&
        SERIES_D_THREE_CHAR_WITH_ONE_SHIELDS.some((className) =>
          shieldContainer.classList.contains(className)
        )
    );

    const hasBannerA = ShieldElement.prototype.hasBannerValue(this.bannerType);
    const hasBannerB = ShieldElement.prototype.hasBannerValue(this.bannerType2);
    const normalizedBannerPosition =
      ShieldElement.prototype.normalizeBannerPosition(this.bannerPosition);
    const normalizedBannerPosition2 =
      ShieldElement.prototype.normalizeBannerPosition(this.bannerPosition2);
    const shouldStackSamePosition =
      hasBannerA &&
      hasBannerB &&
      normalizedBannerPosition === normalizedBannerPosition2;

    if (shouldStackSamePosition) {
      const stackedBannerSlot =
        ShieldElement.prototype.createStackedBannerSlot(
          normalizedBannerPosition,
          [
            {
              bannerClass: "bannerA",
              bannerValue: this.bannerType,
              containerClass: "bannerContainer",
              indentFirstLetter: this.indentFirstLetter,
              smallCaps: this.smallCaps,
              bannerFontFamily,
            },
            {
              bannerClass: "bannerB",
              bannerValue: this.bannerType2,
              containerClass: "bannerContainer2",
              indentFirstLetter: this.indentFirstLetter2,
              smallCaps: this.smallCaps2,
              bannerFontFamily: bannerFontFamily2,
            },
          ],
          fontSizeCss,
          this.indentFirstLetter,
          bannerFontFamily,
          this.smallCaps
        );
      shieldContainer.appendChild(stackedBannerSlot);
    } else if (hasBannerA) {
      const bannerContainerElmt = ShieldElement.prototype.createBannerContainer(
        "bannerContainer",
        "bannerA",
        this.bannerType,
        fontSizeCss,
        this.indentFirstLetter,
        bannerFontFamily,
        false,
        normalizedBannerPosition,
        this.smallCaps
      );
      shieldContainer.appendChild(bannerContainerElmt);
    }

    const shieldEl = document.createElement("div");
    shieldEl.className = "shield";
    if (physicalWidthRem && physicalHeightRem) {
      shieldEl.style.width = physicalWidthRem + "rem";
      shieldEl.style.height = physicalHeightRem + "rem";
    } else if (variablePanelWidth && officialPhysicalDimensions) {
      shieldEl.style.width = `calc(var(--shieldSize) * ${
        officialPhysicalDimensions.widthIn / officialPhysicalDimensions.heightIn
      })`;
      shieldEl.style.height = "var(--shieldSize)";
    }

    const img = document.createElement("img");
    img.className = "shieldImg";
    const imageSizeClass = ShieldElement.prototype.getImageSizeClass(routeText);
    if (imageSizeClass) {
      img.classList.add(imageSizeClass);
    }
    img.src = shieldPath;
    img.alt = `${config.label} shield`;
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;
    if (physicalWidthRem && physicalHeightRem) {
      img.style.width = physicalWidthRem + "rem";
      img.style.height = physicalHeightRem + "rem";
    } else if (variablePanelWidth && officialPhysicalDimensions) {
      const assetWidthIn = Number(variablePanelWidth.assetWidthIn);
      img.style.width = `calc(var(--shieldSize) * ${
        assetWidthIn / officialPhysicalDimensions.heightIn
      })`;
      img.style.height = "var(--shieldSize)";
    }
    if (variablePanelWidth && officialPhysicalDimensions) {
      const assetWidthIn = Number(variablePanelWidth.assetWidthIn);
      const assetWidthCss = this.useOfficialDimensions
        ? `${ShieldElement.prototype.inchesToRem(assetWidthIn)}rem`
        : `calc(var(--shieldSize) * ${
            assetWidthIn / officialPhysicalDimensions.heightIn
          })`;
      shieldEl.style.setProperty("--variableGuideAssetWidth", assetWidthCss);
      shieldEl.style.setProperty(
        "--variableGuideRadius",
        `calc(var(--shieldSize) * ${
          1.25 / officialPhysicalDimensions.heightIn
        })`
      );
      shieldEl.style.setProperty(
        "--variableGuideSeamCover",
        `calc(var(--shieldSize) * ${
          1.5 / officialPhysicalDimensions.heightIn
        })`
      );
    }
    shieldEl.appendChild(img);

    const routeEl = document.createElement("p");
    routeEl.className = "routeNumber";
    if (routeNumberStyle) {
      routeEl.classList.add("officialRouteNumber");
      if (Number.isFinite(routeNumberStyle.topIn)) {
        routeEl.style.setProperty(
          "--officialRouteCapTop",
          `${ShieldElement.prototype.inchesToRem(routeNumberStyle.topIn)}rem`
        );
      }
      const capHeightIn =
        routeNumberStyle.capHeightInByCharacterCount?.[routeCharacterCount] ||
        routeNumberStyle.capHeightIn;
      const routeFontFamily =
        routeNumberStyle.fontFamilyByCharacterCount?.[routeCharacterCount] ||
        routeNumberStyle.fontFamily;
      if (capHeightIn) {
        routeEl.style.fontSize = ShieldElement.prototype.cssRemFromCapHeight(
          capHeightIn
        );
      }
      if (routeFontFamily) {
        routeEl.style.fontFamily = `"${routeFontFamily}"`;
      }
      if (routeNumberStyle.color) {
        routeEl.style.color = routeNumberStyle.color;
      }
    }
    const usesV22NumberStyle =
      ShieldElement.prototype.usesV22NumberStyle(config);
    if (usesV22NumberStyle) {
      routeEl.textContent = renderedRouteText;
    } else {
      routeEl.replaceChildren(
        ...Array.from(renderedRouteText).map((character) => {
          const characterEl = document.createElement("span");
          characterEl.className = "routeChar";
          if (/^[0-9A-Za-z]$/.test(character)) {
            characterEl.classList.add(`routeChar-${character.toUpperCase()}`);
          } else if (character === " ") {
            characterEl.classList.add("routeChar-space");
            characterEl.textContent = "\u00a0";
            return characterEl;
          }
          characterEl.textContent = character;
          return characterEl;
        })
      );
    }

    if (ShieldElement.prototype.isCountyShield(config)) {
      const countyLabel = document.createElement("p");
      countyLabel.className = "countyLabel";
      countyLabel.textContent = (this.countyText || "").trim().toUpperCase();
      if (countyLabel.textContent.length > 0) {
        shieldEl.appendChild(countyLabel);
      }
    }

    if (
      !config?.suppressRouteNumber &&
      !ShieldElement.prototype.isFixedRouteVariant(config, variantKey)
    ) {
      shieldEl.appendChild(routeEl);
    }

    shieldContainer.appendChild(shieldEl);

    if (!shouldStackSamePosition && hasBannerB) {
      const bannerContainerElmt2 = ShieldElement.prototype.createBannerContainer(
        "bannerContainer2",
        "bannerB",
        this.bannerType2,
        fontSizeCss,
        this.indentFirstLetter2,
        bannerFontFamily2,
        true,
        normalizedBannerPosition2,
        this.smallCaps2
      );
      shieldContainer.appendChild(bannerContainerElmt2);
    }

    if (!hasBannerA && !hasBannerB) {
      shieldContainer.classList.add("noBanners");
    }

    wrapper.appendChild(shieldContainer);

    if (
      routeEl.parentElement &&
      routeNumberStyle &&
      officialPhysicalDimensions
    ) {
      ShieldElement.prototype.scheduleOfficialRouteNumberLayout({
        wrapper,
        routeEl,
        shieldEl,
        img,
        routeText: renderedRouteText,
        routeNumberStyle,
        routeCharacterCount,
        officialPhysicalDimensions,
        useOfficialDimensions: this.useOfficialDimensions,
      });
    }

    if (routeEl.parentElement && !usesV22NumberStyle) {
      requestAnimationFrame(() => {
        if (!routeEl.isConnected) {
          return;
        }
        const routeFont = getComputedStyle(routeEl).fontFamily.toLowerCase();
        shieldContainer.classList.toggle(
          "seriesDSpacingFix",
          routeFont.includes("series d")
        );
      });
    }

    return wrapper;
  }
}

const SERIES_C_THREE_CHAR_NO_ONE_SHIELDS = [
  "AZ",
  "AZLOOP",
  "CA",
  "CO",
  "HI",
  "IN",
  "MB",
  "MD",
  "ME",
  "MN",
  "MNBUS",
  "SC",
  "WI",
  "WY",
];
const SERIES_D_THREE_CHAR_WITH_ONE_SHIELDS =
  SERIES_C_THREE_CHAR_NO_ONE_SHIELDS;
const V22_NUMBER_STYLE_SHIELDS = [
  "I",
  "I-BUS",
  "I-BL",
  "I-BS",
  "I-DL",
  "I-DS",
  "I-F",
  "US",
  "USCA",
];

// Advance, left ink edge, and right ink edge, normalized to the 1,000-unit
// cap height in the bundled Roadgeek 2014 fonts. Safari reports the advance
// box as actualBoundingBox*, so official placements use these font metrics.
const OFFICIAL_ROADGEEK_METRICS = {
  "Series C": {
    "0": [0.706, 0.059983, 0.646],
    "1": [0.407, 0.09, 0.297],
    "2": [0.677, 0.06, 0.617],
    "3": [0.677, 0.06, 0.617],
    "4": [0.738, 0.03, 0.648],
    "5": [0.677, 0.06, 0.617],
    "6": [0.738, 0.09, 0.648],
    "7": [0.678, 0.03, 0.588],
    "8": [0.677, 0.06, 0.617],
    "9": [0.677, 0.06, 0.617],
    A: [0.699, 0.03, 0.669],
    B: [0.732, 0.11, 0.672],
    C: [0.738, 0.09, 0.648],
    D: [0.762, 0.11, 0.672],
    E: [0.679, 0.11, 0.619],
    F: [0.649, 0.11, 0.619],
    G: [0.738, 0.09, 0.648],
    H: [0.782, 0.11, 0.672],
    I: [0.36, 0.11, 0.25],
    J: [0.649, 0.03, 0.539],
    K: [0.732, 0.11, 0.672],
    L: [0.649, 0.11, 0.619],
    M: [0.881, 0.11, 0.771],
    N: [0.782, 0.11, 0.672],
    O: [0.766, 0.089983, 0.676],
    P: [0.762, 0.11, 0.672],
    Q: [0.766, 0.090496, 0.677],
    R: [0.732, 0.11, 0.672],
    S: [0.677, 0.06, 0.617],
    T: [0.569, 0.03, 0.539],
    U: [0.782, 0.11, 0.672],
    V: [0.678, 0.03, 0.648],
    W: [0.819, 0.03, 0.789],
    X: [0.646, 0.03, 0.616],
    Y: [0.699, 0.03, 0.669],
    Z: [0.67, 0.06, 0.61],
    " ": [0.428, 0, 0],
    "-": [0.411, 0.03, 0.381],
  },
  "Series D": {
    "0": [0.909, 0.1, 0.809],
    "1": [0.473, 0.1, 0.353],
    "2": [0.881, 0.1, 0.781],
    "3": [0.956, 0.18, 0.856],
    "4": [0.888, 0.02, 0.768],
    "5": [0.881, 0.1, 0.781],
    "6": [0.881, 0.1, 0.781],
    "7": [0.817, 0.07, 0.747],
    "8": [0.881, 0.1, 0.781],
    "9": [0.881, 0.1, 0.781],
    A: [0.906, 0.03, 0.876],
    B: [0.85, 0.12, 0.8],
    C: [0.881, 0.099987, 0.781],
    D: [0.9, 0.12, 0.8],
    E: [0.79, 0.12, 0.74],
    F: [0.77, 0.12, 0.74],
    G: [0.881, 0.099985, 0.781],
    H: [0.92, 0.12, 0.8],
    I: [0.401, 0.12, 0.281],
    J: [0.789, 0.03, 0.669],
    K: [0.867, 0.12, 0.817],
    L: [0.77, 0.12, 0.74],
    M: [1.018, 0.12, 0.898],
    N: [0.92, 0.12, 0.8],
    O: [0.909, 0.1, 0.809],
    P: [0.83, 0.12, 0.8],
    Q: [0.909, 0.1, 0.809],
    R: [0.85, 0.12, 0.8],
    S: [0.78, 0.05, 0.73],
    T: [0.678, 0.03, 0.648],
    U: [0.92, 0.119978, 0.8],
    V: [0.819, 0.03, 0.789],
    W: [0.949, 0.03, 0.919],
    X: [0.78, 0.05, 0.73],
    Y: [0.914, 0.03, 0.884],
    Z: [0.78, 0.05, 0.73],
    " ": [0.599, 0, 0],
    "-": [0.411, 0.03, 0.381],
  },
};

ShieldElement.prototype.defaultShieldBase = "I";
ShieldElement.prototype.defaultVariant = "Auto";
ShieldElement.prototype.defaultRouteNumber = "1";
ShieldElement.prototype.defaultBannerType = "None";
ShieldElement.prototype.defaultBannerPosition = "Above";
ShieldElement.prototype.defaultBannerFontSize = 1.4;
ShieldElement.prototype.defaultBannerFontFamily = "Series E";
ShieldElement.prototype.defaultCountyText = "";
ShieldElement.prototype.defaultShieldSize = 3;
ShieldElement.prototype.defaultScaleBannersWithShield = true;
ShieldElement.prototype.alignment = TextElement.prototype.alignment;
ShieldElement.prototype.inchesPerRem = 12;
ShieldElement.prototype.roadgeekCapHeightRatio = 4 / 7;

ShieldElement.prototype.inchesToRem = function (inches) {
  const value = Number(inches);
  return Number.isFinite(value)
    ? value / ShieldElement.prototype.inchesPerRem
    : 0;
};

ShieldElement.prototype.cssRemFromCapHeight = function (inches) {
  const capHeightRem = ShieldElement.prototype.inchesToRem(inches);
  const fontSizeRem =
    capHeightRem / ShieldElement.prototype.roadgeekCapHeightRatio;
  return `${fontSizeRem.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}rem`;
};

ShieldElement.prototype.measureOfficialRouteInk = function ({
  routeText,
  routeFontFamily,
  capHeightPixels,
  letterSpacingPixels = 0,
  context,
}) {
  const characters = Array.from(routeText);
  const familyMetrics = OFFICIAL_ROADGEEK_METRICS[routeFontFamily];
  let cursor = 0;
  let inkLeft = Number.POSITIVE_INFINITY;
  let inkRight = Number.NEGATIVE_INFINITY;

  characters.forEach((rawCharacter, index) => {
    const character = rawCharacter.toUpperCase();
    const glyphMetrics = familyMetrics?.[character];
    if (glyphMetrics) {
      const [advance, left, right] = glyphMetrics;
      if (right > left) {
        inkLeft = Math.min(inkLeft, cursor + left * capHeightPixels);
        inkRight = Math.max(inkRight, cursor + right * capHeightPixels);
      }
      cursor += advance * capHeightPixels;
    } else {
      const metrics = context.measureText(rawCharacter);
      const left = cursor - Number(metrics.actualBoundingBoxLeft || 0);
      const right = cursor + Number(metrics.actualBoundingBoxRight || metrics.width);
      inkLeft = Math.min(inkLeft, left);
      inkRight = Math.max(inkRight, right);
      cursor += metrics.width;
    }

    if (index < characters.length - 1) {
      cursor += letterSpacingPixels;
    }
  });

  if (!Number.isFinite(inkLeft) || !Number.isFinite(inkRight)) {
    inkLeft = 0;
    inkRight = 0;
  }
  return { inkLeft, inkRight, inkWidth: inkRight - inkLeft };
};

ShieldElement.prototype.scheduleOfficialRouteNumberLayout = function ({
  wrapper,
  routeEl,
  shieldEl,
  img,
  routeText,
  routeNumberStyle,
  routeCharacterCount,
  officialPhysicalDimensions,
  useOfficialDimensions,
}) {
  const layout = () => {
    if (!routeEl.isConnected || !shieldEl.isConnected) {
      return;
    }
    const shieldBounds = shieldEl.getBoundingClientRect();
    const officialHeight = Number(officialPhysicalDimensions.heightIn);
    if (!(shieldBounds.height > 0) || !(officialHeight > 0)) {
      return;
    }

    const pixelsPerInch = shieldBounds.height / officialHeight;
    const capHeightIn = Number(
      routeNumberStyle.capHeightInByCharacterCount?.[routeCharacterCount] ||
        routeNumberStyle.capHeightIn
    );
    const routeFontFamily =
      routeNumberStyle.fontFamilyByCharacterCount?.[routeCharacterCount] ||
      routeNumberStyle.fontFamily;
    const fontSizePixels =
      (capHeightIn * pixelsPerInch) /
      ShieldElement.prototype.roadgeekCapHeightRatio;
    routeEl.style.fontSize = `${fontSizePixels}px`;
    routeEl.style.fontFamily = `"${routeFontFamily}"`;
    routeEl.style.top = `${
      Number(routeNumberStyle.topIn) * pixelsPerInch - fontSizePixels / 7
    }px`;
    routeEl.style.letterSpacing = "0px";

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.fontKerning = "none";
    context.font = `${fontSizePixels}px "${routeFontFamily}"`;
    const capHeightPixels = capHeightIn * pixelsPerInch;
    let measuredInk = ShieldElement.prototype.measureOfficialRouteInk({
      routeText,
      routeFontFamily,
      capHeightPixels,
      context,
    });

    if (
      routeNumberStyle.allowOpticalSpacing &&
      routeCharacterCount > 1 &&
      Number(routeNumberStyle.maxWidthIn) > 0
    ) {
      const maximumWidth = routeNumberStyle.maxWidthIn * pixelsPerInch;
      if (measuredInk.inkWidth > maximumWidth) {
        const spacingAdjustment =
          (maximumWidth - measuredInk.inkWidth) / (routeCharacterCount - 1);
        routeEl.style.letterSpacing = `${spacingAdjustment}px`;
        measuredInk = ShieldElement.prototype.measureOfficialRouteInk({
          routeText,
          routeFontFamily,
          capHeightPixels,
          letterSpacingPixels: spacingAdjustment,
          context,
        });
      }
    }

    const { inkLeft, inkRight } = measuredInk;

    const variablePanelWidth = routeNumberStyle.variablePanelWidth;
    if (variablePanelWidth) {
      const minWidthIn = Number(variablePanelWidth.minWidthIn);
      const maxWidthIn = Number(variablePanelWidth.maxWidthIn);
      const assetWidthIn = Number(variablePanelWidth.assetWidthIn);
      const leftClearanceIn = Number(routeNumberStyle.leftIn);
      const rightClearanceIn = Number(variablePanelWidth.rightClearanceIn);
      const requiredWidthIn =
        leftClearanceIn +
        (inkRight - inkLeft) / pixelsPerInch +
        rightClearanceIn;
      const renderedWidthIn = Math.min(
        maxWidthIn,
        Math.max(minWidthIn, requiredWidthIn)
      );
      const renderedWidthCss = useOfficialDimensions
        ? `${ShieldElement.prototype.inchesToRem(renderedWidthIn)}rem`
        : `calc(var(--shieldSize) * ${renderedWidthIn / officialHeight})`;
      const assetWidthCss = useOfficialDimensions
        ? `${ShieldElement.prototype.inchesToRem(assetWidthIn)}rem`
        : `calc(var(--shieldSize) * ${assetWidthIn / officialHeight})`;

      shieldEl.style.width = renderedWidthCss;
      img.style.width = assetWidthCss;
      shieldEl.style.setProperty("--variableGuideAssetWidth", assetWidthCss);
      wrapper.style.setProperty("--shieldWidth", renderedWidthCss);
      wrapper.dataset.widthIn = String(renderedWidthIn);
    }

    let targetPosition;
    let sourcePosition;
    if (Number.isFinite(routeNumberStyle.leftIn)) {
      targetPosition = routeNumberStyle.leftIn * pixelsPerInch;
      sourcePosition = inkLeft;
    } else if (Number.isFinite(routeNumberStyle.rightIn)) {
      targetPosition = routeNumberStyle.rightIn * pixelsPerInch;
      sourcePosition = inkRight;
    } else {
      const centerXIn = Number.isFinite(routeNumberStyle.centerXIn)
        ? routeNumberStyle.centerXIn
        : officialPhysicalDimensions.widthIn / 2;
      targetPosition = centerXIn * pixelsPerInch;
      sourcePosition = (inkLeft + inkRight) / 2;
    }
    routeEl.style.transform = `translateX(${targetPosition - sourcePosition}px)`;
  };

  queueMicrotask(layout);
  requestAnimationFrame(layout);
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      layout();
      requestAnimationFrame(layout);
    });
  }
};

ShieldElement.prototype.normalizeShieldCode = function (code) {
  if (typeof code !== "string") {
    return "";
  }
  return code.replace(/\s+/g, "").replace(/2nd$/i, "2");
};

ShieldElement.prototype.formatVariantKey = function (variant) {
  if (typeof variant !== "string") {
    return "";
  }
  return variant.replace(/\s+/g, "");
};

ShieldElement.prototype.getShieldClassNames = function (code) {
  const normalized = ShieldElement.prototype.normalizeShieldCode(code);
  if (!normalized) {
    return "";
  }

  if (normalized.includes("-")) {
    const [base, ...rest] = normalized.split("-");
    const modifier = rest.join("-").toLowerCase();
    return modifier ? `${base} ${modifier}` : base;
  }

  const prefixedModifiers = [
    "FL",
    "GA",
    "NE",
    "NB",
    "NS",
    "TX",
  ];
  const matchedPrefix = prefixedModifiers.find(
    (prefix) => normalized.startsWith(prefix) && normalized.length > prefix.length
  );

  if (matchedPrefix && !/\d/.test(normalized.slice(matchedPrefix.length))) {
    const modifier = normalized.slice(matchedPrefix.length).toLowerCase();
    return modifier ? `${matchedPrefix} ${modifier}` : matchedPrefix;
  }

  return normalized;
};

ShieldElement.prototype.buildBlockShieldList = function () {
  const shields = [];
  const directory = Shield.prototype.shieldDirectory;

  const traverse = (node, assetPathParts = [], categoryParts = []) => {
    if (!node || typeof node !== "object") {
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (!value || typeof value !== "object") {
        continue;
      }
      if (value.type === "category") {
        traverse(
          value,
          assetPathParts.concat(value.folder || key),
          categoryParts.concat(key)
        );
      } else if (value.type === "shield") {
        const normalizedCode = ShieldElement.prototype.normalizeShieldCode(key);
        const variants = Array.isArray(value.variants) ? value.variants.slice() : [];
        shields.push({
          value: normalizedCode,
          label: value.name || normalizedCode,
          variants,
          fixedRouteVariants: Array.isArray(value.fixedRouteVariants)
            ? value.fixedRouteVariants.slice()
            : [],
          assetFolder: ["img/shields"].concat(assetPathParts).join("/"),
          className:
            value.className ||
            ShieldElement.prototype.getShieldClassNames(normalizedCode),
          assetName: value.assetName || normalizedCode,
          assetPath: value.assetPath || null,
          assetPathByVariant: value.assetPathByVariant || null,
          suppressRouteNumber: value.suppressRouteNumber === true,
          county: value.county === true,
          standard: value.standard || null,
          officialDimensions: value.officialDimensions === true,
          physicalDimensionsByVariant: value.physicalDimensionsByVariant || null,
          routeNumberByVariant: value.routeNumberByVariant || null,
          autoVariantByCharacterCount:
            value.autoVariantByCharacterCount || null,
          legacyVariantAliases: value.legacyVariantAliases || null,
          categories: categoryParts.slice(),
        });
      }
    }
  };

  traverse(directory);

  const upsertShield = (definition) => {
    const normalizedValue = ShieldElement.prototype.normalizeShieldCode(
      definition.value
    );
    const normalizedDefinition = {
      value: normalizedValue,
      label: definition.label || normalizedValue,
      variants: Array.isArray(definition.variants)
        ? definition.variants.slice()
        : [],
      fixedRouteVariants: Array.isArray(definition.fixedRouteVariants)
        ? definition.fixedRouteVariants.slice()
        : [],
      assetFolder: definition.assetFolder || "img/shields",
      className:
        definition.className ||
        ShieldElement.prototype.getShieldClassNames(normalizedValue),
      assetName: definition.assetName || normalizedValue,
      assetPath: definition.assetPath || null,
      assetPathByVariant: definition.assetPathByVariant || null,
      suppressRouteNumber: definition.suppressRouteNumber === true,
      county: definition.county === true,
      standard: definition.standard || null,
      officialDimensions: definition.officialDimensions === true,
      physicalDimensionsByVariant:
        definition.physicalDimensionsByVariant || null,
      routeNumberByVariant: definition.routeNumberByVariant || null,
      autoVariantByCharacterCount:
        definition.autoVariantByCharacterCount || null,
      legacyVariantAliases: definition.legacyVariantAliases || null,
      categories: Array.isArray(definition.categories)
        ? definition.categories.slice()
        : [],
    };
    const existing = shields.find(
      (shield) =>
        ShieldElement.prototype.normalizeShieldCode(shield.value) ===
        normalizedValue
    );
    if (existing) {
      Object.assign(existing, normalizedDefinition);
    } else {
      shields.push(normalizedDefinition);
    }
  };

  const addVariantGroup = (assetFolder, categories, definitions) => {
    definitions.forEach(
      ([value, label, variants = ["2 Digit", "3 Digit"], assetName = value, className]) => {
        const assetPathByVariant = {};
        variants.forEach((variant) => {
          const variantKey = ShieldElement.prototype.formatVariantKey(variant);
          assetPathByVariant[variantKey] =
            `${assetFolder}/${assetName}-${variantKey}.svg`;
        });
        upsertShield({
          value,
          label,
          variants,
          assetFolder,
          assetName,
          assetPathByVariant,
          className,
          categories,
        });
      }
    );
  };

  const addExactGroup = (assetFolder, categories, definitions) => {
    definitions.forEach(
      ([value, label, fileName, suppressRouteNumber = true, className]) => {
        upsertShield({
          value,
          label,
          variants: ["Image"],
          assetFolder,
          assetName: value,
          assetPath: `${assetFolder}/${fileName}`,
          suppressRouteNumber,
          className,
          categories,
        });
      }
    );
  };

  addVariantGroup("img/shields/United States", ["United States"], [
    ["cir", "Circle"],
    ["elp", "Ellipse"],
    ["rec", "Rectangle"],
    ["rec2", "Rectangle (Alt)"],
  ]);

  addVariantGroup(
    "img/shields/United States/Interstate",
    ["United States", "Interstate"],
    [
      ["I", "Interstate"],
      ["I-BUS", "Interstate Business"],
      ["I-BL", "Interstate Business Loop"],
      ["I-BS", "Interstate Business Spur"],
      ["I-DL", "Interstate Downtown Loop"],
      ["I-DS", "Interstate Downtown Spur"],
      ["I-F", "Future Interstate"],
    ]
  );

  addVariantGroup(
    "img/shields/United States/US Route",
    ["United States", "U.S. Route"],
    [
      ["US", "U.S. Route"],
      ["USCA", "U.S. Route (California style)", undefined, "US-CA", "USCA"],
    ]
  );

  addVariantGroup("img/shields/United States/AZ", ["United States", "Arizona"], [
    ["AZ", "Arizona"],
    ["AZLOOP", "Arizona Loop", ["3 Digit"]],
  ]);
  addVariantGroup("img/shields/United States/GA", ["United States", "Georgia"], [
    ["GA", "Georgia"],
    ["GAALT", "Georgia Alternate"],
    ["GABYP", "Georgia Bypass"],
    ["GACONN", "Georgia Connector"],
    ["GALOOP", "Georgia Loop"],
    ["GASPUR", "Georgia Spur"],
  ]);
  addVariantGroup("img/shields/United States/IN", ["United States", "Indiana"], [
    ["IN", "Indiana"],
  ]);
  addExactGroup("img/shields/United States/IN", ["United States", "Indiana"], [
    ["INTR", "Indiana Toll Road", "INTR.png"],
  ]);
  addVariantGroup("img/shields/United States/KS", ["United States", "Kansas"], [
    ["KS", "Kansas"],
  ]);
  addExactGroup("img/shields/United States/KS", ["United States", "Kansas"], [
    ["KSTP", "Kansas Turnpike", "KSTP.png"],
  ]);
  addVariantGroup("img/shields/United States/KY", ["United States", "Kentucky"], [
    ["KY", "Kentucky"],
  ]);
  addExactGroup("img/shields/United States/KY", ["United States", "Kentucky"], [
    ["KYAA", "AA Highway", "KYAA.png"],
    ["KYAU", "Audubon Parkway", "KYAU.png"],
    ["KYBG", "Bluegrass Parkway", "KYBG.png"],
    ["KYCM", "Cumberland Parkway", "KYCM.png"],
    ["KYHR", "Hal Rogers Parkway", "KYHR.png"],
    ["KYMT", "Mountain Parkway", "KYMT.png"],
    ["KYPR", "Pennyrile Parkway", "KYPR.png"],
    ["KYPU", "Purchase Parkway", "KYPU.png"],
    ["KYWK", "Western Kentucky Parkway", "KYWK.png"],
    ["KYWN", "Natcher Parkway", "KYWN.png"],
  ]);
  addVariantGroup("img/shields/United States/MA", ["United States", "Massachusetts"], [
    ["MA", "Massachusetts"],
  ]);
  addExactGroup("img/shields/United States/MA", ["United States", "Massachusetts"], [
    ["MATP", "Massachusetts Turnpike", "MATP.png"],
  ]);
  addVariantGroup("img/shields/United States/ME", ["United States", "Maine"], [
    ["ME", "Maine"],
  ]);
  addExactGroup("img/shields/United States/ME", ["United States", "Maine"], [
    ["METP", "Maine Turnpike", "METP.png"],
  ]);
  addVariantGroup("img/shields/United States/MN", ["United States", "Minnesota"], [
    ["MN", "Minnesota", ["2 Digit"]],
    ["MNBUS", "Minnesota Business", ["2 Digit"]],
  ]);
  addVariantGroup("img/shields/United States/NE", ["United States", "Nebraska"], [
    ["NE", "Nebraska"],
    ["NELINK", "Nebraska Link", ["2 Digit"]],
    ["NESPUR", "Nebraska Spur", ["2 Digit"]],
  ]);
  upsertShield({
    value: "NV",
    label: "Nevada",
    variants: ["2 Digit", "3 Digit", "CC215"],
    fixedRouteVariants: ["CC215"],
    assetFolder: "img/shields/United States",
    assetPathByVariant: {
      "2Digit": "img/shields/United States/NV-2Digit.svg",
      "3Digit": "img/shields/United States/NV-3Digit.svg",
      CC215: "img/shields/United States/Nevada/NV-CC215.svg",
    },
    categories: ["United States", "Nevada"],
  });
  addVariantGroup("img/shields/United States/NJ", ["United States", "New Jersey"], [
    ["NJ", "New Jersey"],
  ]);
  addExactGroup("img/shields/United States/NJ", ["United States", "New Jersey"], [
    ["GSP", "Garden State Parkway", "GSP.png"],
    ["NJTP", "New Jersey Turnpike", "NJTP.png"],
    ["PIP", "Palisades Interstate Parkway", "PIP.png"],
  ]);
  addVariantGroup("img/shields/United States/NY", ["United States", "New York"], [
    ["NY", "New York"],
  ]);
  addExactGroup("img/shields/United States/NY", ["United States", "New York"], [
    ["B", "Bethpage Parkway", "B.png"],
    ["BMP", "Bear Mountain Parkway", "BMP.png"],
    ["BP", "Belt Parkway", "BP.png"],
    ["BR", "Bronx River Parkway", "BR.png"],
    ["BRP", "Bronx River Parkway (alternate)", "BRP.png"],
    ["CCP", "Cross County Parkway", "CCP.png"],
    ["CI", "Cross Island Parkway", "CI.png"],
    ["FDR", "FDR Drive", "FDR.png"],
    ["GCP", "Grand Central Parkway", "GCP.png"],
    ["H", "Heckscher Parkway", "H.png"],
    ["HH", "Henry Hudson Parkway", "HH.png"],
    ["HR", "Hutchinson River Parkway", "HR.png"],
    ["HRD", "Harlem River Drive", "HRD.png"],
    ["HRP", "Hutchinson River Parkway (alternate)", "HRP.png"],
    ["JR", "Jackie Robinson Parkway", "JR.png"],
    ["KWV", "Korean War Veterans Parkway", "KWV.png"],
    ["LOSP", "Lake Ontario State Parkway", "LOSP.png"],
    ["M", "Meadowbrook Parkway", "M.png"],
    ["MP", "Mosholu Parkway", "MP.png"],
    ["N", "Northern State Parkway", "N.png"],
    ["NSP", "Niagara Scenic Parkway", "NSP.png"],
    ["NYST", "New York State Thruway", "NYST.png"],
    ["O", "Ocean Parkway", "O.png"],
    ["Pe", "Pelham Parkway", "Pe.png", true, "Pe"],
    ["RM", "Robert Moses Causeway", "RM.png"],
    ["SA", "Sagtikos Parkway", "SA.png"],
    ["SBP", "Sprain Brook Parkway", "SBP.png"],
    ["SM", "Sunken Meadow Parkway", "SM.png"],
    ["SMP", "Saw Mill Parkway", "SMP.png"],
    ["SO", "Southern State Parkway", "SO.png"],
    ["TSP", "Taconic State Parkway", "TSP.png"],
    ["W", "Wantagh Parkway", "W.png"],
  ]);
  addVariantGroup("img/shields/United States/OH", ["United States", "Ohio"], [
    ["OH", "Ohio"],
  ]);
  addExactGroup("img/shields/United States/OH", ["United States", "Ohio"], [
    ["OHTP", "Ohio Turnpike", "OHTP.png"],
  ]);
  addVariantGroup("img/shields/United States/OK", ["United States", "Oklahoma"], [
    ["OK", "Oklahoma"],
  ]);
  addExactGroup("img/shields/United States/OK", ["United States", "Oklahoma"], [
    ["OKCH", "Cherokee Turnpike", "OKCH.png"],
    ["OKCR", "Creek Turnpike", "OKCR.png"],
    ["OKHB", "H.E. Bailey Turnpike", "OKHB.png"],
    ["OKIN", "Indian Nation Turnpike", "OKIN.png"],
    ["OKKC", "Kickapoo Turnpike", "OKKC.png"],
    ["OKKL", "Kilpatrick Turnpike", "OKKL.png"],
    ["OKMS", "Muskogee Turnpike", "OKMS.png"],
    ["OKTU", "Turner Turnpike", "OKTU.png"],
    ["OKWR", "Will Rogers Turnpike", "OKWR.png"],
  ]);
  addVariantGroup("img/shields/United States/PA", ["United States", "Pennsylvania"], [
    ["PA", "Pennsylvania"],
    ["PATP", "Pennsylvania Turnpike Route"],
  ]);
  addExactGroup("img/shields/United States/PA", ["United States", "Pennsylvania"], [
    ["PATPLOGO", "Pennsylvania Turnpike", "PATP.png"],
  ]);
  addVariantGroup("img/shields/United States/TX", ["United States", "Texas"], [
    ["TX", "Texas"],
    ["TXBELT", "Texas Beltway", ["2 Digit"], "TXBELTWAY", "TX BELTWAY"],
    ["TXEXPRESS", "Texas Express Toll", undefined, "TXEXPRESS", "TX EXPRESS"],
    ["TXFM", "Texas Farm to Market", ["4 Digit"], "TXFM", "TX FM"],
    ["TXLOOP", "Texas Loop", ["2 Digit", "3 Digit", "4 Digit"], "TXLOOP", "TX LOOP"],
    ["TXPARK", "Texas Park Road", ["2 Digit", "3 Digit"], "TXPARK", "TX PARK"],
    ["TXRM", "Texas Ranch to Market", ["2 Digit"], "TXRM", "TX RM"],
    ["TXSPUR", "Texas Spur", ["2 Digit", "3 Digit", "4 Digit"], "TXSPUR", "TX SPUR"],
    ["TXTOLL", "Texas Toll", undefined, "TXTOLL", "TX TOLL"],
  ]);
  addExactGroup("img/shields/United States/TX", ["United States", "Texas"], [
    ["HTR", "Hardy Toll Road", "HTR.png"],
    ["SHT", "Sam Houston Tollway", "SHT.png"],
    ["TXTOLLCTRMA", "Central Texas Regional Mobility Authority", "TXTollCTRMA.svg", false, "TX tollctrma"],
    ["TXTOLLNTTA", "North Texas Tollway Authority", "TXTollNTTA.svg", false, "TX tollntta"],
    ["TXTOLLFBTR", "Fort Bend Toll Road", "TXTollFBTR.png"],
    ["WPT", "Westpark Tollway", "WPT.png"],
  ]);
  addVariantGroup("img/shields/United States/WI", ["United States", "Wisconsin"], [
    ["WI", "Wisconsin"],
    ["WICo", "Wisconsin County"],
  ]);

  addVariantGroup("img/shields/Canada", ["Canada"], [
    ["TCH", "Trans-Canada Highway"],
    ["TCHLeaf", "Trans-Canada Highway Leaf"],
  ]);
  addVariantGroup("img/shields/Canada/AB", ["Canada", "Alberta"], [
    ["AB", "Alberta"],
    ["AB2", "Alberta Oval"],
    ["ABTC", "Alberta Trans-Canada Highway"],
  ]);
  addVariantGroup("img/shields/Canada/BC", ["Canada", "British Columbia"], [
    ["BC", "British Columbia"],
    ["BCYH", "British Columbia Yellowhead Highway"],
    ["BCTC", "British Columbia Trans-Canada Highway"],
  ]);
  addVariantGroup("img/shields/Canada/MB", ["Canada", "Manitoba"], [
    ["MB", "Manitoba"],
    ["MB2", "Manitoba Secondary"],
    ["MBTC", "Manitoba Trans-Canada Highway"],
  ]);
  addVariantGroup("img/shields/Canada/NB", ["Canada", "New Brunswick"], [
    ["NB", "New Brunswick"],
    ["NBCONN", "New Brunswick Connector", undefined, "NBCONN", "NBCONN"],
    ["NBLOCAL", "New Brunswick Local", undefined, "NBLOCAL", "NBLOCAL"],
    ["NBTC", "New Brunswick Trans-Canada Highway", undefined, "NBTC", "NB TC"],
  ]);
  addVariantGroup("img/shields/Canada/NL", ["Canada", "Newfoundland and Labrador"], [
    ["NL", "Newfoundland and Labrador"],
    ["NLTC", "Newfoundland and Labrador Trans-Canada Highway"],
  ]);
  addVariantGroup("img/shields/Canada/NS", ["Canada", "Nova Scotia"], [
    ["NS", "Nova Scotia"],
    ["NSCONN", "Nova Scotia Connector", ["2 Digit"], "NSCONN", "NSCONN"],
    ["NSTC", "Nova Scotia Trans-Canada Highway", undefined, "NSTC", "NSTC"],
  ]);
  addVariantGroup("img/shields/Canada/ON", ["Canada", "Ontario"], [
    ["ON", "Ontario"],
    ["ON2", "Ontario Secondary"],
    ["ON3", "Ontario County"],
    ["ONTC", "Ontario Trans-Canada Highway"],
  ]);
  addExactGroup("img/shields/Canada/ON", ["Canada", "Ontario"], [
    ["ONDVP", "Don Valley Parkway", "ON-DVP.png"],
    ["ONGAR", "Gardiner Expressway", "ON-GAR.png"],
    ["ONTCCOR", "Central Ontario Route", "ONTC-COR.svg"],
    ["ONTCGBR", "Georgian Bay Route", "ONTC-GBR.svg"],
    ["ONTCLSR", "Lake Superior Route", "ONTC-LSR.svg"],
    ["ONTCNOR", "Northern Ontario Route", "ONTC-NOR.svg"],
    ["ONTCOVR", "Ottawa Valley Route", "ONTC-OVR.svg"],
  ]);
  addVariantGroup("img/shields/Canada/PEI", ["Canada", "Prince Edward Island"], [
    ["PEI", "Prince Edward Island", ["2 Digit"]],
  ]);
  addVariantGroup("img/shields/Canada/QC", ["Canada", "Quebec"], [
    ["QC", "Quebec Autoroute"],
    ["QC2", "Quebec Route"],
    ["QCTC", "Quebec Trans-Canada Highway"],
  ]);
  addVariantGroup("img/shields/Canada/SK", ["Canada", "Saskatchewan"], [
    ["SK", "Saskatchewan"],
    ["SK2", "Saskatchewan Secondary"],
    ["SKTC", "Saskatchewan Trans-Canada Highway"],
  ]);

  addVariantGroup("img/shields/Australia", ["Australia"], [
    ["ALPHANUM", "Alphanumeric Route", ["2 Digit", "3 Digit", "4 Digit"]],
    ["NAT", "National Route", ["1 Digit", "2 Digit", "3 Digit"]],
    ["SR", "State Route", ["2 Digit"]],
    ["NR", "National Route (black)", ["2 Digit"]],
    ["MR", "Metroad", ["1 Digit", "2 Digit"]],
    ["TOLLBLUE", "Tollway", ["2 Digit", "3 Digit", "4 Digit"]],
    ["TD", "Tourist Drive", ["2 Digit", "3 Digit"]],
    ["FNSW", "New South Wales Freeway (retired)", ["2 Digit"]],
  ]);
  addVariantGroup("img/shields/New Zealand", ["New Zealand"], [
    ["SH", "State Highway", ["1 Digit", "2 Digit"]],
  ]);

  return shields;
};

ShieldElement.prototype.buildBlockShieldVariants = function (shields) {
  const variants = new Set(["Auto"]);
  (shields || []).forEach((shield) => {
    (shield.variants || []).forEach((variant) => variants.add(variant));
  });
  return Array.from(variants).map((variant) => ({
    value: variant,
    label: variant,
  }));
};

(() => {
  const shields = ShieldElement.prototype.buildBlockShieldList();
  ShieldElement.prototype.blockShieldBases = shields;
  ShieldElement.prototype.blockShieldVariants =
    ShieldElement.prototype.buildBlockShieldVariants(shields);
  if (shields.length && shields[0].value) {
    ShieldElement.prototype.defaultShieldBase = shields[0].value;
  }
})();
ShieldElement.prototype.blockBannerPositions = [
  "Above",
  "Below",
  "Left",
  "Right",
];

ShieldElement.prototype.getBannerPositionOptions = function () {
  return ShieldElement.prototype.blockBannerPositions;
};

ShieldElement.prototype.getBannerFontOptions = function () {
  return TextElement.prototype.fontFamily;
};

ShieldElement.prototype.normalizeBannerType = function (value) {
  if (typeof value !== "string" || value.length === 0) {
    return ShieldElement.prototype.defaultBannerType;
  }
  return value;
};

ShieldElement.prototype.normalizeBannerPosition = function (value) {
  const options = ShieldElement.prototype.getBannerPositionOptions();
  if (typeof value === "string" && options.includes(value)) {
    return value;
  }
  return ShieldElement.prototype.defaultBannerPosition;
};

ShieldElement.prototype.normalizeBannerFontFamily = function (value) {
  const options = ShieldElement.prototype.getBannerFontOptions();
  if (typeof value === "string" && options.includes(value)) {
    return value;
  }
  return (
    ShieldElement.prototype.defaultBannerFontFamily ||
    (options.length ? options[0] : "")
  );
};

ShieldElement.prototype.normalizeFontSize = function (value) {
  const parsed = parseFloat(
    typeof value === "string" ? value.replace(/rem$/i, "") : value
  );
  if (Number.isFinite(parsed)) {
    return Math.max(parsed, 0.1);
  }
  return ShieldElement.prototype.defaultBannerFontSize;
};

ShieldElement.prototype.getFontSizeCss = function (value) {
  const normalized = ShieldElement.prototype.normalizeFontSize(value);
  return normalized + "rem";
};

ShieldElement.prototype.normalizeShieldSize = function (value) {
  if (typeof value === "string") {
    value = value.replace(/rem$/i, "");
  }
  const parsed = parseFloat(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return ShieldElement.prototype.defaultShieldSize;
};

ShieldElement.prototype.getShieldScale = function (size) {
  const base =
    ShieldElement.prototype.defaultShieldSize && ShieldElement.prototype.defaultShieldSize > 0
      ? ShieldElement.prototype.defaultShieldSize
      : 3;
  const normalizedSize = ShieldElement.prototype.normalizeShieldSize(size);
  return normalizedSize / base;
};

ShieldElement.prototype.normalizeScaleBannersWithShield = function (value) {
  if (
    value === false ||
    value === 0 ||
    value === "0" ||
    (typeof value === "string" && value.toLowerCase() === "false")
  ) {
    return false;
  }
  return true;
};

ShieldElement.prototype.hasBannerValue = function (value) {
  return typeof value === "string" && value !== "None" && value.length > 0;
};

ShieldElement.prototype.createBannerElement = function (
  bannerClass,
  bannerValue,
  fontSizeCss,
  indentFirstLetter,
  bannerFontFamily,
  smallCaps = true
) {
  const bannerEl = document.createElement("p");
  const shouldIndent = indentFirstLetter !== false;
  bannerEl.className =
    bannerClass + (shouldIndent ? "" : " noIndent") + (smallCaps ? "" : " noSmallCaps");
  bannerEl.style.setProperty("--fontSize", fontSizeCss);
  const normalizedFont =
    ShieldElement.prototype.normalizeBannerFontFamily(bannerFontFamily);
  if (normalizedFont) {
    bannerEl.style.setProperty("--bannerFontFamily", `"${normalizedFont}"`);
    bannerEl.style.fontFamily = `"${normalizedFont}"`;
  }
  if (bannerValue === "Toll") {
    bannerEl.classList.add("TOLL");
  }
  const displayText = Shield.prototype.getBannerDisplayText(bannerValue);
  bannerEl.textContent = displayText;
  if (displayText.includes("\n")) {
    bannerEl.classList.add("multilineBanner");
  }
  return bannerEl;
};

ShieldElement.prototype.createStackedBannerSlot = function (
  position,
  banners,
  fontSizeCss,
  indentFirstLetter,
  bannerFontFamily,
  smallCaps = true
) {
  const normalizedPosition = ShieldElement.prototype.normalizeBannerPosition(
    position
  );
  const container = document.createElement("div");
  container.className = "stackedBannerSlot bannerSlot";
  container.classList.add(
    `bannerSlot-${normalizedPosition.toLowerCase()}`
  );

  banners.forEach(
    ({
      bannerClass,
      bannerValue,
      containerClass,
      indentFirstLetter: bannerSpecificIndent,
      smallCaps: bannerSpecificSmallCaps,
      bannerFontFamily: bannerSpecificFontFamily,
    }) => {
      if (containerClass) {
        container.classList.add(containerClass);
      }
      const bannerIndent =
        typeof bannerSpecificIndent === "boolean"
          ? bannerSpecificIndent
          : indentFirstLetter;
      const bannerSmallCaps =
        typeof bannerSpecificSmallCaps === "boolean"
          ? bannerSpecificSmallCaps
          : smallCaps;
      const bannerFont = bannerSpecificFontFamily || bannerFontFamily;
      const bannerEl = ShieldElement.prototype.createBannerElement(
        bannerClass,
        bannerValue,
        fontSizeCss,
        bannerIndent,
        bannerFont,
        bannerSmallCaps
      );
      container.appendChild(bannerEl);
    });

  return container;
};

ShieldElement.prototype.createBannerContainer = function (
  containerClass,
  bannerClass,
  bannerValue,
  fontSizeCss,
  indentFirstLetter,
  bannerFontFamily,
  isSecond,
  position,
  smallCaps = true
) {
  const container = document.createElement("div");
  container.className = containerClass;
  container.classList.add("bannerSlot");
  const normalizedPosition = ShieldElement.prototype.normalizeBannerPosition(
    position
  );
  container.classList.add(
    `bannerSlot-${normalizedPosition.toLowerCase()}`
  );
  const bannerEl = ShieldElement.prototype.createBannerElement(
    bannerClass,
    bannerValue,
    fontSizeCss,
    indentFirstLetter,
    bannerFontFamily,
    smallCaps
  );
  container.appendChild(bannerEl);
  return container;
};

ShieldElement.prototype.getBlockShieldConfig = function (base) {
  const options = ShieldElement.prototype.blockShieldBases;
  const normalizedBase = ShieldElement.prototype.normalizeShieldCode(base);
  return (
    options.find(
      (option) =>
        ShieldElement.prototype.normalizeShieldCode(option.value) === normalizedBase
    ) || options[0]
  );
};

ShieldElement.prototype.resolveBlockVariant = function (
  desiredVariant,
  routeNumber,
  config
) {
  const allowed = config?.variants || [];
  if (!allowed.length) {
    return "";
  }
  const normalized = (desiredVariant || "").trim();
  if (normalized && normalized.toLowerCase() !== "auto") {
    if (allowed.includes(normalized)) {
      return normalized;
    }
    const legacyVariantKey = ShieldElement.prototype.formatVariantKey(
      normalized
    );
    const migratedVariant = config?.legacyVariantAliases?.[legacyVariantKey];
    if (migratedVariant && allowed.includes(migratedVariant)) {
      return migratedVariant;
    }
    return allowed[0] || normalized;
  }
  const fallback = allowed[0] || ShieldElement.prototype.defaultVariant;
  const inferred = ShieldElement.prototype.getVariantFromRoute(routeNumber, config);
  return allowed.includes(inferred) ? inferred : fallback;
};

ShieldElement.prototype.migrateLegacyBlockVariant = function (
  desiredVariant,
  config
) {
  if (typeof desiredVariant !== "string") {
    return desiredVariant;
  }
  const requested = desiredVariant.trim();
  const allowed = config?.variants || [];
  if (
    !requested ||
    requested.toLowerCase() === "auto" ||
    allowed.includes(requested)
  ) {
    return desiredVariant;
  }
  const legacyKey = ShieldElement.prototype.formatVariantKey(requested);
  const migrated = config?.legacyVariantAliases?.[legacyKey];
  return migrated && allowed.includes(migrated) ? migrated : desiredVariant;
};

ShieldElement.prototype.getVariantFromRoute = function (routeNumber, config) {
  const characterCount =
    ShieldElement.prototype.getRouteCharacterCount(routeNumber);
  const officialAutoVariants = config?.autoVariantByCharacterCount;
  if (officialAutoVariants) {
    return characterCount >= 3
      ? officialAutoVariants.threeOrMore
      : officialAutoVariants.oneToTwo;
  }
  const supportsOneDigit =
    Array.isArray(config?.variants) && config.variants.includes("1 Digit");
  const supportsFourDigit =
    Array.isArray(config?.variants) && config.variants.includes("4 Digit");
  if (supportsOneDigit && characterCount <= 1) {
    return "1 Digit";
  }
  if (supportsFourDigit && characterCount >= 4) {
    return "4 Digit";
  }
  return characterCount >= 3 ? "3 Digit" : "2 Digit";
};

ShieldElement.prototype.getRouteCharacterCount = function (routeNumber) {
  const rawRoute = String(routeNumber || "").trim();
  if (!rawRoute) {
    return 0;
  }
  try {
    return (rawRoute.match(/[\p{L}\p{N}]/gu) || []).length;
  } catch (error) {
    return (rawRoute.match(/[A-Za-z0-9]/g) || []).length;
  }
};

ShieldElement.prototype.getRouteSizeClassFromCount = function (count) {
  if (!count) {
    return "";
  }
  if (count <= 1) {
    return "one";
  }
  if (count === 2) {
    return "two";
  }
  if (count === 3) {
    return "three";
  }
  if (count === 4) {
    return "four";
  }
  if (count === 5) {
    return "five";
  }
  return "six";
};

ShieldElement.prototype.getContainerSizeClass = function (routeNumber) {
  return ShieldElement.prototype.getRouteSizeClassFromCount(
    ShieldElement.prototype.getRouteCharacterCount(routeNumber)
  );
};

ShieldElement.prototype.getImageSizeClass = function (routeNumber) {
  return ShieldElement.prototype.getRouteSizeClassFromCount(
    ShieldElement.prototype.getRouteCharacterCount(routeNumber)
  );
};

ShieldElement.prototype.getShieldAssetPath = function (config, variantKey) {
  if (config?.assetPathByVariant?.[variantKey]) {
    return config.assetPathByVariant[variantKey];
  }
  if (config?.assetPath) {
    return config.assetPath;
  }
  const assetFolder = config?.assetFolder || "img/shields";
  const assetName = config?.assetName || config?.value || "I";
  const suffix = variantKey ? `-${variantKey}` : "";
  return `${assetFolder}/${assetName}${suffix}.svg`;
};

ShieldElement.prototype.getVariantMetadata = function (
  config,
  propertyName,
  variantKey
) {
  const values = config?.[propertyName];
  if (!values || typeof values !== "object") {
    return null;
  }
  return values[variantKey] || values.Default || null;
};

ShieldElement.prototype.usesV22NumberStyle = function (config) {
  if (config?.standard === "FDOT" || config?.standard === "CFX") {
    return true;
  }
  const normalized = ShieldElement.prototype.normalizeShieldCode(
    config?.value || config?.assetName || ""
  );
  return V22_NUMBER_STYLE_SHIELDS.includes(normalized);
};

ShieldElement.prototype.isFixedRouteVariant = function (config, variantKey) {
  return Array.isArray(config?.fixedRouteVariants) &&
    config.fixedRouteVariants
      .map((variant) => ShieldElement.prototype.formatVariantKey(variant))
      .includes(variantKey);
};

ShieldElement.prototype.isCountyShield = function (config) {
  const normalized = ShieldElement.prototype.normalizeShieldCode(
    config?.value || config?.assetName || ""
  );
  return config?.county === true || normalized === "C";
};

class DividerElement {
  constructor({
    dividerWidth = 1,
    dividerMeasurement = "rem",
    dividerHeight = 0.2,
    orientation = DividerElement.prototype.defaultOrientation,
    alignment = "Center",
    visible = true,
    dividerColor = "White",
    fullBleed = false,
  } = {}) {
    this.dividerWidth = dividerWidth;
    this.dividerMeasurement = dividerMeasurement;
    this.dividerHeight = dividerHeight;
    this.orientation =
      DividerElement.prototype.normalizeOrientation(orientation);
    this.alignment = alignment;
    this.visible = visible;
    this.dividerColor = dividerColor;
    this.fullBleed = fullBleed;
  }

  createElement(panel) {
    const newDivider = document.createElement("div");
    const isVertical =
      this.orientation === DividerElement.prototype.verticalOrientation;
    newDivider.className = "dividerElement" + (isVertical ? " vertical" : "");
    newDivider.style.visibility = this.visible ? "visible" : "hidden";
    const lengthValue = this.dividerWidth + this.dividerMeasurement;
    const thicknessValue = this.dividerHeight + "rem";
    newDivider.style.setProperty(
      "--dividerWidth",
      lengthValue
    );
    newDivider.style.setProperty("--dividerHeight", thicknessValue);
    newDivider.style.setProperty("--dividerLength", lengthValue);
    newDivider.style.setProperty("--dividerThickness", thicknessValue);
    newDivider.style.marginTop = "0";
    newDivider.style.marginBottom = "0";

    if (this.dividerColor && this.dividerColor !== "Default") {
      const resolvedColor =
        lib.colors[this.dividerColor] || this.dividerColor || "";
      if (resolvedColor) {
        newDivider.style.backgroundColor = resolvedColor;
      }
    }

    if (this.fullBleed) {
      newDivider.classList.add("fullBleed");
      const paddingString = panel?.sign?.padding || "";
      const paddingValues = paddingString.trim().split(/\s+/).filter(Boolean);

      let top = "0rem",
        right = "0rem",
        bottom = "0rem",
        left = "0rem";

      if (paddingValues.length === 1) {
        top = right = bottom = left = paddingValues[0];
      } else if (paddingValues.length === 2) {
        top = bottom = paddingValues[0];
        right = left = paddingValues[1];
      } else if (paddingValues.length === 3) {
        [top, right, bottom] = paddingValues;
        left = right;
      } else if (paddingValues.length >= 4) {
        [top, right, bottom, left] = paddingValues;
      }

      newDivider.style.setProperty(
        "--dividerBleedLeft",
        !isVertical ? left || "0rem" : "0rem"
      );
      newDivider.style.setProperty(
        "--dividerBleedRight",
        !isVertical ? right || "0rem" : "0rem"
      );
      newDivider.style.setProperty(
        "--dividerBleedTop",
        isVertical ? top || "0rem" : "0rem"
      );
      newDivider.style.setProperty(
        "--dividerBleedBottom",
        isVertical ? bottom || "0rem" : "0rem"
      );
    } else {
      newDivider.classList.remove("fullBleed");
      newDivider.style.setProperty("--dividerBleedLeft", "0rem");
      newDivider.style.setProperty("--dividerBleedRight", "0rem");
      newDivider.style.setProperty("--dividerBleedTop", "0rem");
      newDivider.style.setProperty("--dividerBleedBottom", "0rem");
    }

    return newDivider;
  }
}

DividerElement.prototype.dividerMeasurement = ["rem", "%"];
DividerElement.prototype.orientations = ["Horizontal", "Vertical"];
DividerElement.prototype.defaultOrientation = "Horizontal";
DividerElement.prototype.verticalOrientation = "Vertical";
DividerElement.prototype.normalizeOrientation = function (value) {
  const options = DividerElement.prototype.orientations || [];
  return options.includes(value)
    ? value
    : DividerElement.prototype.defaultOrientation;
};
DividerElement.prototype.dividerColors = [{ value: "Default", label: "Default" }].concat(
  Object.keys(lib.colors || {}).map((colorName) => ({
    value: colorName,
    label: colorName,
  }))
);

class IconElement {
  constructor({
    icon = "Airplane",
    iconSize = 3,
    backgroundColor = "Inherit",
    border = false,
    borderRadius = 4,
    borderColor = "White",
    spacing = 0,
    alignment = "Center",
    invertColor = false,
  } = {}) {
    this.icon = IconElement.prototype.icons[icon]
      ? icon
      : IconElement.prototype.defaultIcon;
    this.iconSize = iconSize;
    this.backgroundColor = backgroundColor;
    this.border = border;
    this.borderRadius = borderRadius;
    this.borderColor = borderColor;
    this.spacing = spacing;
    this.invertColor =
      invertColor === true ||
      invertColor === "true" ||
      invertColor === 1 ||
      invertColor === "1" ||
      invertColor === "on";
    const validAlignments = Array.isArray(TextElement.prototype.alignment)
      ? TextElement.prototype.alignment
      : [];
    this.alignment = validAlignments.includes(alignment) ? alignment : "Center";
  }

  createElement() {
    const container = document.createElement("div");
    container.className = "bE-iconElement";

    const parsedSpacing = parseFloat(this.spacing);
    const spacing = isNaN(parsedSpacing) ? 0 : parsedSpacing;
    container.style.setProperty("--spacing", spacing + "rem");

    const resolvedBgColor = lib.colors[this.backgroundColor] || this.backgroundColor.toLowerCase();
    container.style.setProperty("--iconBgColor", resolvedBgColor);

    container.style.setProperty("--borderRadius", this.borderRadius + "px");

    const resolvedBorderColor = lib.colors[this.borderColor] || this.borderColor.toLowerCase();
    container.style.setProperty("--iconBorderColor", resolvedBorderColor);

    const parsedSize = parseFloat(this.iconSize);
    const size = isNaN(parsedSize) ? 3 : parsedSize;
    container.style.setProperty("--iconSize", size + "rem");

    if (this.border) {
      container.classList.add("hasBorder");
    }

    if (this.backgroundColor !== "Inherit") {
      container.classList.add("hasBackground");
    }

    if (this.invertColor) {
      container.classList.add("invertColor");
    }

    const iconDefinition =
      IconElement.prototype.icons[this.icon] ||
      IconElement.prototype.icons[IconElement.prototype.defaultIcon];

    if (iconDefinition) {
      const img = document.createElement("img");
      img.src = iconDefinition.src;
      img.alt = iconDefinition.label;
      img.loading = "lazy";
      img.decoding = "async";
      img.draggable = false;
      container.appendChild(img);
    } else {
      container.textContent = "Icon unavailable";
    }

    return container;
  }
}

IconElement.prototype.defaultIcon = "AIRPORT";
IconElement.prototype.icons = {
  "511": { label: "511", src: "img/icons/511.svg" },
  "AIRPORT": { label: "Airport", src: "img/icons/AIRPORT.svg" },
  "ALLTERRAIN_TRAIL": { label: "All-Terrain Trail", src: "img/icons/ALLTERRAIN_TRAIL.svg" },
  "ALTERNATIVE_FUEL_COMPRESSED_NATURAL_GAS": { label: "Alternative Fuel (Compressed Natural Gas)", src: "img/icons/ALTERNATIVE_FUEL_COMPRESSED_NATURAL_GAS.svg" },
  "ALTERNATIVE_FUEL_ETHANOL": { label: "Alternative Fuel (Ethanol)", src: "img/icons/ALTERNATIVE_FUEL_ETHANOL.svg" },
  "ARCHERY": { label: "Archery", src: "img/icons/ARCHERY.svg" },
  "BASEBALL": { label: "Baseball", src: "img/icons/BASEBALL.svg" },
  "BEACH": { label: "Beach", src: "img/icons/BEACH.svg" },
  "BEAR_VIEWING_AREA": { label: "Bear Viewing Area", src: "img/icons/BEAR_VIEWING_AREA.svg" },
  "BIKE": { label: "Bike", src: "img/icons/BIKE.svg" },
  "BIOFUEL": { label: "Biofuel", src: "img/icons/BIOFUEL.svg" },
  "BOAT_RAMP": { label: "Boat Ramp", src: "img/icons/BOAT_RAMP.svg" },
  "BUS_STATION": { label: "Bus Station", src: "img/icons/BUS_STATION.svg" },
  "BUS_STOP": { label: "Bus Stop", src: "img/icons/BUS_STOP.svg" },
  "CAMPFIRES": { label: "Campfires", src: "img/icons/CAMPFIRES.svg" },
  "CAMPING": { label: "Camping", src: "img/icons/CAMPING.svg" },
  "CANOEING": { label: "Canoeing", src: "img/icons/CANOEING.svg" },
  "CHAIR_LIFTSKI_LIFT": { label: "Chair Lift/Ski Lift", src: "img/icons/CHAIR_LIFTSKI_LIFT.svg" },
  "CLIMBING": { label: "Climbing", src: "img/icons/CLIMBING.svg" },
  "CROSS_COUNTRY_SKIING": { label: "Cross Country Skiing", src: "img/icons/CROSS_COUNTRY_SKIING.svg" },
  "DEER_VIEWING_AREA": { label: "Deer Viewing Area", src: "img/icons/DEER_VIEWING_AREA.svg" },
  "DIESEL_FUEL": { label: "Diesel Fuel", src: "img/icons/DIESEL_FUEL.svg" },
  "DOG_SLEDDING": { label: "Dog Sledding", src: "img/icons/DOG_SLEDDING.svg" },
  "DONT_WALK": { label: "Don't Walk", src: "img/icons/DONT_WALK.svg" },
  "ELECTRICAL_HOOKUP": { label: "Electrical Hookup", src: "img/icons/ELECTRICAL_HOOKUP.svg" },
  "ELECTRIC_VEHICLE_CHARGING": { label: "EV Charging", src: "img/icons/ELECTRIC_VEHICLE_CHARGING.svg" },
  "EMERGENCY_MEDICAL_SERVICES": { label: "EMS", src: "img/icons/EMERGENCY_MEDICAL_SERVICES.svg" },
  "EXIT_INSERT": { label: "Exit Insert", src: "img/icons/EXIT_INSERT.png" },
  "FIRE_EXTINGUISHER": { label: "Fire Extinguisher", src: "img/icons/FIRE_EXTINGUISHER.svg" },
  "FIRST_AID": { label: "First Aid", src: "img/icons/FIRST_AID.svg" },
  "FISHING_AREA": { label: "Fishing Area", src: "img/icons/FISHING_AREA.svg" },
  "FOOD": { label: "Food", src: "img/icons/FOOD.svg" },
  "GAS": { label: "Gas", src: "img/icons/GAS.svg" },
  "GOLFING": { label: "Golfing", src: "img/icons/GOLFING.svg" },
  "HAND_LAUNCHSMALL_BOAT_LAUNCH": { label: "Hand Launch/Small Boat Launch", src: "img/icons/HAND_LAUNCHSMALL_BOAT_LAUNCH.svg" },
  "HIKING_TRAIL": { label: "Hiking Trail", src: "img/icons/HIKING_TRAIL.svg" },
  "HM": { label: "HM", src: "img/icons/HM.png" },
  "HORSE_TRAIL": { label: "Horse Trail", src: "img/icons/HORSE_TRAIL.svg" },
  "HOSPITAL": { label: "Hospital", src: "img/icons/HOSPITAL.svg" },
  "HOV": { label: "HOV", src: "img/icons/HOV.png" },
  "HYDROGEN_FUEL": { label: "Hydrogen Fuel", src: "img/icons/HYDROGEN_FUEL.svg" },
  "INLINE_SKATING": { label: "Inline Skating", src: "img/icons/INLINE_SKATING.svg" },
  "INTERNATIONAL_SYMBOL_OF_ACCESSIBILITY": { label: "Accessibility", src: "img/icons/INTERNATIONAL_SYMBOL_OF_ACCESSIBILITY.svg" },
  "JET_SKIPERSONAL_WATERCRAFT": { label: "Jet Ski", src: "img/icons/JET_SKIPERSONAL_WATERCRAFT.svg" },
  "LAUNDROMAT": { label: "Laundromat", src: "img/icons/LAUNDROMAT.svg" },
  "LIBRARY": { label: "Library", src: "img/icons/LIBRARY.svg" },
  "LIGHTHOUSE": { label: "Lighthouse", src: "img/icons/LIGHTHOUSE.svg" },
  "LIGHT_RAIL_TRANSIT_STATION": { label: "Light Rail Station", src: "img/icons/LIGHT_RAIL_TRANSIT_STATION.svg" },
  "LIQUEFIED_NATURAL_GAS": { label: "Liquefied Natural Gas", src: "img/icons/LIQUEFIED_NATURAL_GAS.svg" },
  "LIQUEFIED_PETROLEUM_GAS": { label: "Liquefied Petroleum Gas", src: "img/icons/LIQUEFIED_PETROLEUM_GAS.svg" },
  "LITTER_CONTAINER": { label: "Litter Container", src: "img/icons/LITTER_CONTAINER.svg" },
  "LODGING": { label: "Lodging", src: "img/icons/LODGING.svg" },
  "LOOKOUT_TOWER": { label: "Lookout Tower", src: "img/icons/LOOKOUT_TOWER.svg" },
  "MARINA": { label: "Marina", src: "img/icons/MARINA.svg" },
  "MENS_RESTROOM": { label: "Men's Restroom", src: "img/icons/MENS_RESTROOM.svg" },
  "MOTORBOATING": { label: "Motorboating", src: "img/icons/MOTORBOATING.svg" },
  "NATURE_STUDY_AREA": { label: "Nature Study Area", src: "img/icons/NATURE_STUDY_AREA.svg" },
  "NO-HM": { label: "No HM", src: "img/icons/NO-HM.png" },
  "PARKING": { label: "Parking", src: "img/icons/PARKING.svg" },
  "PASSENGERS_ONLY_FERRY_TERMINAL": { label: "Passengers Only Ferry Terminal", src: "img/icons/PASSENGERS_ONLY_FERRY_TERMINAL.svg" },
  "PEDESTRIAN": { label: "Pedestrian", src: "img/icons/PEDESTRIAN.svg" },
  "PHARMACY": { label: "Pharmacy", src: "img/icons/PHARMACY.svg" },
  "PICKUP_TRUCKS": { label: "Pickup Trucks", src: "img/icons/PICKUP_TRUCKS.svg" },
  "PICNIC_SHELTER": { label: "Picnic Shelter", src: "img/icons/PICNIC_SHELTER.svg" },
  "PICNIC_SITE": { label: "Picnic Site", src: "img/icons/PICNIC_SITE.svg" },
  "POLICE": { label: "Police", src: "img/icons/POLICE.svg" },
  "POST_OFFICE": { label: "Post Office", src: "img/icons/POST_OFFICE.svg" },
  "RECREATIONAL_VEHICLE_SITE": { label: "RV Site", src: "img/icons/RECREATIONAL_VEHICLE_SITE.svg" },
  "RECYCLING": { label: "Recycling", src: "img/icons/RECYCLING.svg" },
  "RESTROOMS": { label: "Restrooms", src: "img/icons/RESTROOMS.svg" },
  "RV_SANITARY_STATION": { label: "RV Sanitary Station", src: "img/icons/RV_SANITARY_STATION.svg" },
  "SCHOOL_BUS": { label: "School Bus", src: "img/icons/SCHOOL_BUS.svg" },
  "SCHOOL_CROSSING": { label: "School Crossing", src: "img/icons/SCHOOL_CROSSING.svg" },
  "SCUBA_DIVING": { label: "Scuba Diving", src: "img/icons/SCUBA_DIVING.svg" },
  "SEAL_VIEWING": { label: "Seal Viewing", src: "img/icons/SEAL_VIEWING.svg" },
  "SEA_PLANE": { label: "Sea Plane", src: "img/icons/SEA_PLANE.svg" },
  "SHOWERS": { label: "Showers", src: "img/icons/SHOWERS.svg" },
  "SKATEBOARDING": { label: "Skateboarding", src: "img/icons/SKATEBOARDING.svg" },
  "SLEDDING": { label: "Sledding", src: "img/icons/SLEDDING.svg" },
  "SLEEPING_SHELTER": { label: "Sleeping Shelter", src: "img/icons/SLEEPING_SHELTER.svg" },
  "SMOKING": { label: "Smoking", src: "img/icons/SMOKING.svg" },
  "SNOWSHOEING": { label: "Snowshoeing", src: "img/icons/SNOWSHOEING.svg" },
  "SNOW_TUBING": { label: "Snow Tubing", src: "img/icons/SNOW_TUBING.svg" },
  "SPELUNKINGCAVES": { label: "Spelunking/Caves", src: "img/icons/SPELUNKINGCAVES.svg" },
  "STOP": { label: "Stop", src: "img/icons/STOP.svg" },
  "SWIMMING": { label: "Swimming", src: "img/icons/SWIMMING.svg" },
  "TECHNICAL_ROCK_CLIMBING": { label: "Technical Rock Climbing", src: "img/icons/TECHNICAL_ROCK_CLIMBING.svg" },
  "TELECOMMUNICATIONS_DEVICE_FOR_THE_DEAF": { label: "Telecommunications Device for the Deaf", src: "img/icons/TELECOMMUNICATIONS_DEVICE_FOR_THE_DEAF.svg" },
  "TELEPHONE": { label: "Telephone", src: "img/icons/TELEPHONE.svg" },
  "TENNIS": { label: "Tennis", src: "img/icons/TENNIS.svg" },
  "TOURIST_INFORMATION": { label: "Tourist Information", src: "img/icons/TOURIST_INFORMATION.svg" },
  "TRAILER_SITE": { label: "Trailer Site", src: "img/icons/TRAILER_SITE.svg" },
  "TRAIN_STATION": { label: "Train Station", src: "img/icons/TRAIN_STATION.svg" },
  "TRAMWAY": { label: "Tramway", src: "img/icons/TRAMWAY.svg" },
  "TRASH_DUMPSTER": { label: "Trash Dumpster", src: "img/icons/TRASH_DUMPSTER.svg" },
  "TRUCK_EXTERNAL_POWER": { label: "Truck External Power", src: "img/icons/TRUCK_EXTERNAL_POWER.svg" },
  "TRUCK_PARKING": { label: "Truck Parking", src: "img/icons/TRUCK_PARKING.svg" },
  "TUNNEL": { label: "Tunnel", src: "img/icons/TUNNEL.svg" },
  "VEHICLE_FERRY_STATION": { label: "Vehicle Ferry", src: "img/icons/VEHICLE_FERRY_STATION.svg" },
  "VIEWING_AREA": { label: "Viewing Area", src: "img/icons/VIEWING_AREA.svg" },
  "WATERSKIING": { label: "Waterskiing", src: "img/icons/WATERSKIING.svg" },
  "WHALE_VIEWING": { label: "Whale Viewing", src: "img/icons/WHALE_VIEWING.svg" },
  "WILDLIFE_VIEWING": { label: "Wildlife Viewing", src: "img/icons/WILDLIFE_VIEWING.svg" },
  "WINTER_RECREATIONAL_AREA": { label: "Winter Rec Area", src: "img/icons/WINTER_RECREATIONAL_AREA.svg" },
  "WIRELESS_INTERNET": { label: "WiFi", src: "img/icons/WIRELESS_INTERNET.svg" },
  "WOMENS_RESTROOM": { label: "Women's Restroom", src: "img/icons/WOMENS_RESTROOM.svg" },
  "YIELD": { label: "Yield", src: "img/icons/YIELD.svg" },
  "CONE": { label: "Cone", src: "img/icons/Cone.png" },
  "SEATBELT": { label: "Seatbelt", src: "img/icons/Seatbelt.png" },

  "ORANGE_COUNTY": { label: "Orange", src: "img/icons/orange_county.svg"},
};

class BeaconElement {
  constructor({
    size = 2,
    alignment = "Center",
    flashDuration = 1,
    color = "Yellow",
    backplate = false,
    flashOpposite = false,
  } = {}) {
    const parsedSize = parseFloat(size);
    this.size = Number.isFinite(parsedSize) ? Math.max(parsedSize, 0.5) : 2;
    const parsedDuration = parseFloat(flashDuration);
    this.flashDuration =
      Number.isFinite(parsedDuration) && parsedDuration > 0
        ? parsedDuration
        : 1;
    const validAlignments = Array.isArray(TextElement.prototype.alignment)
      ? TextElement.prototype.alignment
      : [];
    this.alignment = validAlignments.includes(alignment) ? alignment : "Center";
    const availableColors = Array.isArray(BeaconElement.prototype.colors)
      ? BeaconElement.prototype.colors
      : [];
    this.color = availableColors.includes(color)
      ? color
      : availableColors[0] || "Yellow";
    this.backplate =
      backplate === true ||
      backplate === "true" ||
      backplate === 1 ||
      backplate === "1";
    this.flashOpposite =
      flashOpposite === true ||
      flashOpposite === "true" ||
      flashOpposite === 1 ||
      flashOpposite === "1";
  }

  createElement() {
    const parsedSize = parseFloat(this.size);
    const beaconSize = Number.isFinite(parsedSize) ? parsedSize : 2;
    const parsedDuration = parseFloat(this.flashDuration);
    const flashDuration =
      Number.isFinite(parsedDuration) && parsedDuration > 0
        ? parsedDuration
        : 1;

    const container = document.createElement("div");
    container.className = "bE-beaconElement";
    container.style.setProperty("--beaconSize", Math.max(beaconSize, 0.5) + "rem");
    container.style.setProperty("--beaconFlashDuration", flashDuration + "s");
    const resolvedColor =
      (lib?.colors && lib.colors[this.color]) || this.color || "Yellow";
    container.style.setProperty(
      "--beaconBulbColor",
      typeof resolvedColor === "string" ? resolvedColor : "Yellow"
    );
    container.style.setProperty(
      "--beaconBackplateThickness",
      BeaconElement.prototype.backplateThicknessRem + "rem"
    );
    container.style.setProperty(
      "--beaconBackplateRadius",
      BeaconElement.prototype.backplateCornerRadiusRem + "rem"
    );
    const backplateColorReference = BeaconElement.prototype.backplateColor;
    const resolvedBackplateColor =
      (lib?.colors && lib.colors[backplateColorReference]) ||
      BeaconElement.prototype.backplateFallbackColor ||
      backplateColorReference;
    container.style.setProperty(
      "--beaconBackplateColor",
      resolvedBackplateColor
    );
    if (this.backplate) {
      container.classList.add("hasBackplate");
    }
    if (this.flashOpposite) {
      container.classList.add("flashOpposite");
    }

    const bulb = document.createElement("div");
    bulb.className = "bE-beaconBulb";
    container.appendChild(bulb);

    return container;
  }
}

BeaconElement.prototype.colors = ["Yellow", "Red", "Purple"];
BeaconElement.prototype.halfInchInRem = 0.5 / 12;
BeaconElement.prototype.backplateThicknessRem =
  BeaconElement.prototype.halfInchInRem * 3;
BeaconElement.prototype.backplateCornerRadiusRem = 0.15;
BeaconElement.prototype.backplateColor = "Yellow";
BeaconElement.prototype.backplateFallbackColor = "#ffd200";

class ArrowElement {
  constructor({
    arrow = ArrowElement.prototype.defaultArrow,
    rotation = 0,
    size = null,
    padding = null,
    paddingHorizontal = null,
    paddingVertical = null,
    flip = false,
  } = {}) {
    const resolveArrowKey = ArrowElement.prototype.arrows[arrow]
      ? arrow
      : ArrowElement.prototype.defaultArrow;
    this.arrow = resolveArrowKey;
    this.rotation = rotation;
    this.flip =
      flip === true ||
      flip === "true" ||
      flip === 1 ||
      flip === "1" ||
      flip === "on";

    const arrowDefinition = ArrowElement.prototype.arrows[this.arrow] || {};
    const defaultSize =
      typeof arrowDefinition.defaultSize === "number"
        ? arrowDefinition.defaultSize
        : ArrowElement.prototype.defaultSize;

    const normalizeNumber = (value, fallback = 0) => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? fallback : parsed;
    };

    if (size === null || size === undefined || size === "") {
      this.size = defaultSize;
    } else {
      this.size = normalizeNumber(size, defaultSize);
    }

    const fallbackPadding =
      padding !== null && padding !== undefined ? padding : 0;
    this.paddingHorizontal = normalizeNumber(
      paddingHorizontal !== null && paddingHorizontal !== undefined
        ? paddingHorizontal
        : fallbackPadding,
      0
    );
    this.paddingVertical = normalizeNumber(
      paddingVertical !== null && paddingVertical !== undefined
        ? paddingVertical
        : fallbackPadding,
      0
    );
  }

  createElement() {
    const container = document.createElement("div");
    container.className = "bE-arrowElement";

    const arrowDefinition =
      ArrowElement.prototype.arrows[this.arrow] ||
      ArrowElement.prototype.arrows[ArrowElement.prototype.defaultArrow];
    const img = document.createElement("img");
    img.src = arrowDefinition.src;
    img.alt = arrowDefinition.label;
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;
    container.appendChild(img);

    const parsedRotation = parseFloat(this.rotation);
    if (!isNaN(parsedRotation)) {
      container.style.setProperty("--arrowRotation", parsedRotation + "deg");
    }

    const parsedSize = parseFloat(this.size);
    if (!isNaN(parsedSize)) {
      container.style.setProperty(
        "--arrowSize",
        Math.max(parsedSize, 0) + "rem"
      );
    }

    const horizontalPadding = parseFloat(
      this.paddingHorizontal !== undefined
        ? this.paddingHorizontal
        : this.padding
    );
    const verticalPadding = parseFloat(
      this.paddingVertical !== undefined ? this.paddingVertical : this.padding
    );

    container.style.setProperty(
      "--arrowPaddingHorizontal",
      Math.max(isNaN(horizontalPadding) ? 0 : horizontalPadding, 0) + "rem"
    );
    container.style.setProperty(
      "--arrowPaddingVertical",
      Math.max(isNaN(verticalPadding) ? 0 : verticalPadding, 0) + "rem"
    );

    container.style.setProperty("--arrowFlip", this.flip ? "-1" : "1");

    return container;
  }
}

ArrowElement.prototype.arrows = {
  TYPE_A: { label: "Type A", src: "img/arrowBlocks/TYPE_A.svg" },
  TYPE_A_EXTENDED: {
    label: "Type A Extended",
    src: "img/arrowBlocks/TYPE_A_EXTENDED.svg",
  },
  TYPE_B: { label: "Type B", src: "img/arrowBlocks/TYPE_B.svg" },
  TYPE_C_45: { label: "Type C 45", src: "img/arrowBlocks/TYPE_C_45.svg" },
  TYPE_C_45_ALT: { label: "Type C 45 (alt)", src: "img/arrowBlocks/TYPE_C_45_ALT.svg" },
  TYPE_C_90: { label: "Type C 90", src: "img/arrowBlocks/TYPE_C_90.svg" },
  TYPE_D: { label: "Type D", src: "img/arrowBlocks/TYPE_D.svg" },
  DOWN: { label: "Down", src: "img/arrowBlocks/DOWN.svg", defaultSize: 2.75 },
  DOWN_CA: {
    label: "Down (CA)",
    src: "img/arrowBlocks/DOWN_CA.svg",
    defaultSize: 2.75,
  },
  UK: { label: "UK", src: "img/arrowBlocks/UK.svg" },
  APL_UP: { label: "APL Up", src: "img/arrowBlocks/APL_UP.svg" },
  APL_UP_TURN: { label: "APL Up Turn", src: "img/arrowBlocks/APL_UP_TURN.svg" },
  APL_TURN: { label: "APL Turn", src: "img/arrowBlocks/APL_TURN.svg" },
  APL_DUAL_TURN: { label: "APL Dual Turn", src: "img/arrowBlocks/APL_DUAL_TURN.svg" },
  APL_UP_CFX: { label: "APL Up CFX", src: "img/arrowBlocks/APL_UP_CFX.svg" },
  APL_UP_TURN_CFX: {
    label: "APL Up Turn CFX",
    src: "img/arrowBlocks/APL_UP_TURN_CFX.svg",
  },
  APL_TURN_CFX: {
    label: "APL Turn CFX",
    src: "img/arrowBlocks/APL_TURN_CFX.svg",
  },
};
ArrowElement.prototype.defaultArrow = "TYPE_A";
ArrowElement.prototype.defaultSize = 1.75;
ArrowElement.prototype.arrowKeys = Object.keys(ArrowElement.prototype.arrows);

class TollLogoElement {
  constructor({
    logo = TollLogoElement.prototype.defaultLogo,
    logoHeight = 3,
    spacing = 0,
    horizontalPadding = 0.2,
    verticalPadding = 0.05,
    background = false,
    backgroundColor = "White",
    alignment = "Center",
    squareIcon = false,
    borderRadius = 8,
    hasOnlyBlock = false,
  } = {}) {
    this.logo = TollLogoElement.prototype.logos[logo]
      ? logo
      : TollLogoElement.prototype.defaultLogo;
    this.logoHeight = logoHeight;
    this.spacing = spacing;
    this.background = background;
    this.squareIcon = squareIcon;
    this.borderRadius = borderRadius;
    this.backgroundColor = backgroundColor;
    this.horizontalPadding = horizontalPadding;
    this.verticalPadding = verticalPadding;
    this.hasOnlyBlock = hasOnlyBlock;
    const validAlignments = Array.isArray(TextElement.prototype.alignment)
      ? TextElement.prototype.alignment
      : [];
    this.alignment = validAlignments.includes(alignment) ? alignment : "Center";
  }

  createElement() {
    const container = document.createElement("div");
    container.className = "bE-tollLogoElement";

    const parsedSpacing = parseFloat(this.spacing);
    const spacing = isNaN(parsedSpacing) ? 0 : parsedSpacing;
    container.style.setProperty("--spacing", spacing + "rem");
    container.style.setProperty(
      "--tollBgColor",
      lib.colors[this.backgroundColor] || this.backgroundColor.toLowerCase()
    );
    container.style.setProperty("--borderRadius", this.borderRadius + "px");
    container.style.setProperty(
      "--horizPadding",
      this.horizontalPadding + "rem"
    );
    container.style.setProperty("--vertPadding", this.verticalPadding + "rem");
    container.style.setProperty("--tollLogoHeight", this.logoHeight + "rem");

    if (this.background) {
      container.classList.add("hasBackground");
    }

    if (this.squareIcon) {
      container.style.aspectRatio = "1 / 1";
    }

    const logoDefinition =
      TollLogoElement.prototype.logos[this.logo] ||
      TollLogoElement.prototype.logos[TollLogoElement.prototype.defaultLogo];

    if (logoDefinition) {
      const img = document.createElement("img");
      img.src = logoDefinition.src;
      img.alt = logoDefinition.label;
      img.loading = "lazy";
      img.decoding = "async";
      img.draggable = false;
      container.appendChild(img);
    } else {
      container.textContent = "Toll logo unavailable";
    }

    if (this.hasOnlyBlock) {
      const onlyBlock = document.createElement("div");
      onlyBlock.className = "bE-tollOnlyBlock";
      onlyBlock.textContent = "ONLY";
      container.appendChild(onlyBlock);
      container.classList.add("hasOnlyBlock");

      if (
        this.backgroundColor.toLowerCase() == "white" ||
        this.backgroundColor.toLowerCase() == "yellow" ||
        this.backgroundColor.toLowerCase() == "fluorescent yellow-green" ||
        this.backgroundColor.toLowerCase() == "orange"
      ) {
        container.classList.add("inverseColor");
      }
    }

    return container;
  }
}

TollLogoElement.prototype.defaultLogo = "EZPass";
TollLogoElement.prototype.logos = {
  EZPass: { label: "E-ZPass", src: "img/tolls/EZPass.png" },
  TollTag: { label: "TollTag", src: "img/tolls/NTTA.svg" },
  TxTag: { label: "TxTag", src: "img/tolls/TXTAG.svg" },
  EZTAG: { label: "EZ TAG Square", src: "img/tolls/EZTAG.svg" },
  EZTAG2: { label: "EZ TAG Wide", src: "img/tolls/EZTAG-Sign-Wide.svg" },
  EZTAG3: {
    label: "EZ TAG FHWA Wide",
    src: "img/tolls/EZTAG-Sign-Wide-Alt.svg",
  },
  FasTrak: { label: "FasTrak", src: "img/tolls/FASTrak.png" },
  FreedomPass: { label: "Freedom Pass", src: "img/tolls/FREEDOMPASS.svg" },
  PeachPass: { label: "Peach Pass", src: "img/tolls/PEACHPASS.svg" },
  PeachPassAlt: { label: "Peach Pass (alt)", src: "img/tolls/PEACHPASS_ALT.png" },
  NCQuickPass: { label: "NC Quick Pass", src: "img/tolls/NCQUICKPASS.svg" },
  EPASS: { label: "E-PASS", src: "img/tolls/EPASS.svg" },
  SunPassOld: { label: "SunPass (old)", src: "img/tolls/SUNPASS-1.svg" },
  SunPassNew: { label: "SunPass (new)", src: "img/tolls/SUNPASS-2.svg" },
  ZipCash: { label: "ZipCash", src: "img/tolls/ZIPCASH.svg" },
  LEEWAY: { label: "LeeWay", src: "img/tolls/LEEWAY.svg" },
  KTAG: { label: "K-TAG", src: "img/tolls/KTAG.svg" },
  PikePassOld: { label: "Pikepass (old)", src: "img/tolls/PIKEPASS-OLD.svg" },
  PikePassNew: { label: "Pikepass (new)", src: "img/tolls/PIKEPASS-NEW.svg" },
  PlatePay: { label: "PlatePay", src: "img/tolls/PLATEPAY.svg" },
  PayByMail: { label: "Pay By Mail", src: "img/tolls/PAY_BY_MAIL.png" },
  IPASS: { label: "I-Pass", src: "img/tolls/I-Pass.svg" },
  GeauxPass: { label: "GeauxPass", src: "img/tolls/GEAUXPASS.svg" },
  GoodToGo: { label: "Good To Go!", src: "img/tolls/GOODTOGO.svg" },
  ExpressToll: { label: "ExpressToll", src: "img/tolls/EXPRESSTOLL.svg" },
  DPASS: { label: "D-PASS", src: "img/tolls/DPASS.svg" },
  CATag: { label: "CATag", src: "img/tolls/CATag.png" },
  CAToll: { label: "CAToll", src: "img/tolls/CAToll.png" },
  Telepass: { label: "Telepass", src: "img/tolls/Telepass.png" },
  FASTag: { label: "FASTag", src: "img/tolls/FASTag.png" },
  MUTCD: { label: "MUTCD", src: "img/tolls/MUTCD.svg" },
};
TollLogoElement.prototype.alignment = TextElement.prototype.alignment;

class Block {
  constructor({
    topPadding = 0,
    bottomPadding = 0,
    backgroundColor = "Inherit",
    borderColor = "Match BG",
    backgroundFullWidth = true,
    width = 0,
    stretchLeft = true,
    stretchCenter = true,
    stretchRight = true,
  } = {}) {
    this.topPadding = topPadding;
    this.bottomPadding = bottomPadding;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.backgroundFullWidth = backgroundFullWidth;
    this.width = width;
    this.stretchLeft = stretchLeft;
    this.stretchCenter = stretchCenter;
    this.stretchRight = stretchRight;
  }
}
Block.defaultBorderColor = "Match BG";

const resolveFullBleedDividerBorderColor = ({
  dividerBorderColor,
  rowBorderColor,
  defaultDividerColor,
  isHorizontalDivider,
  backgroundFullWidth,
  usesLightBleedBackground,
}) => {
  const normalizeColor = (color) =>
    typeof color === "string" ? color.trim().toLowerCase() : color;
  const shouldPreserveRowBorder =
    isHorizontalDivider &&
    backgroundFullWidth &&
    usesLightBleedBackground &&
    rowBorderColor &&
    normalizeColor(dividerBorderColor) === normalizeColor(defaultDividerColor);

  return shouldPreserveRowBorder ? rowBorderColor : dividerBorderColor;
};

class Control {
  constructor({ rows = [], blockProperties = [] } = {}) {
    this.rows = rows;
    this.blockProperties = blockProperties;
  }

  addElement(element, properties, row, column) {
    let newElement = new element(properties);
    if (!this.rows[row]) {
      this.rows[row] = [];
      this.blockProperties[row] = this.createBlockWithNeighborBackground(row);
    }

    if (column) {
      this.rows[row].splice(column, 0, newElement);
    } else {
      this.rows[row].push(newElement);
    }
  }

  removeElement(row, column) {
    if (row == null || column == null) {
      return;
    }

    this.rows[row].splice(column, 1);
    if (this.rows[row].length == 0) {
      this.rows.splice(row, 1);
      this.blockProperties.splice(row, 1);
      return true;
    }
    return false;
  }

  createBlockWithNeighborBackground(row, sourceRowIndex) {
    const newBlock = new Block();
    const neighborIndexes = [];

    if (Number.isInteger(sourceRowIndex)) {
      neighborIndexes.push(sourceRowIndex);
    }

    neighborIndexes.push(row - 1, row);

    for (const index of [...new Set(neighborIndexes)]) {
      const neighborProperties = this.blockProperties[index];
      if (
        neighborProperties &&
        typeof neighborProperties.backgroundColor === "string"
      ) {
        newBlock.backgroundColor = neighborProperties.backgroundColor;
        break;
      }
    }

    return newBlock;
  }

  addRow(row, element, { sourceRowIndex } = {}) {
    const newBlockProperties = this.createBlockWithNeighborBackground(
      row,
      sourceRowIndex
    );

    if (this.rows[row] && this.rows[row].length != 0) {
      this.rows.splice(row, 0, []);
      this.blockProperties.splice(row, 0, newBlockProperties);
    } else if (!this.rows[row]) {
      this.rows[row] = [];
      this.blockProperties[row] = newBlockProperties;
    } else if (!this.blockProperties[row]) {
      this.blockProperties[row] = newBlockProperties;
    }
    this.addElement(Control.prototype.blockToClassElems[element], {}, row, 0);
  }

  duplicateRow(row) {
    let newRows = [];
    for (const e of this.rows[row]) {
      newRows.push(this.cloneElement(e));
    }
    this.rows.splice(row + 1, 0, newRows);
    this.blockProperties.splice(
      row + 1,
      0,
      this.cloneBlockProperties(this.blockProperties[row])
    );
  }

  deleteRow(row) {
    this.rows.splice(row, 1);
    this.blockProperties.splice(row, 1);
  }

  createElement(panel, subPanel) {
    const flexBox = document.createElement("div");
    flexBox.className = "blockElementMaster";
    const resolveColorValue = (colorValue) => {
      if (typeof colorValue !== "string") {
        return "";
      }
      const trimmed = colorValue.trim();
      if (!trimmed) {
        return "";
      }
      const paletteValue =
        (lib && lib.colors && lib.colors[trimmed]) || trimmed;
      if (typeof paletteValue === "string") {
        return paletteValue.toLowerCase();
      }
      return paletteValue || "";
    };

    const parsePadding = (paddingString = "") => {
      const defaultPadding = {
        top: "0rem",
        right: "0rem",
        bottom: "0rem",
        left: "0rem",
      };

      if (!paddingString || typeof paddingString !== "string") {
        return defaultPadding;
      }

      const values = paddingString.trim().split(/\s+/).filter(Boolean);
      if (values.length === 0) {
        return defaultPadding;
      }

      if (values.length === 1) {
        return {
          top: values[0],
          right: values[0],
          bottom: values[0],
          left: values[0],
        };
      }

      if (values.length === 2) {
        return {
          top: values[0],
          right: values[1],
          bottom: values[0],
          left: values[1],
        };
      }

      if (values.length === 3) {
        return {
          top: values[0],
          right: values[1],
          bottom: values[2],
          left: values[1],
        };
      }

      return {
        top: values[0],
        right: values[1],
        bottom: values[2],
        left: values[3],
      };
    };

    const signPadding = parsePadding(panel?.sign?.padding);

    const totalRows = this.rows.length;
    for (let i = 0; i < totalRows; i++) {
      const row = this.rows[i];
      const properties = this.blockProperties[i];
      const topPadding = parseFloat(properties.topPadding) || 0;
      const bottomPadding = parseFloat(properties.bottomPadding) || 0;
      const topSpacing = topPadding + "rem";
      const bottomSpacing = bottomPadding + "rem";
      const rowBleedTop = topSpacing;
      const rowBleedBottom = bottomSpacing;
      const bleedTop = i === 0 ? signPadding.top : "0rem";
      const bleedBottom = i === totalRows - 1 ? signPadding.bottom : "0rem";
      const hasVerticalDivider = row.some(
        (elem) =>
          elem instanceof DividerElement &&
          elem.orientation === DividerElement.prototype.verticalOrientation
      );
      const flexRow = document.createElement("div");
      flexRow.className = "blockElementRow";
      flexRow.dataset.blockBackgroundColor =
        typeof properties.backgroundColor === "string"
          ? properties.backgroundColor.trim().toLowerCase()
          : "inherit";
      if (hasVerticalDivider) {
        flexRow.classList.add("hasVerticalDivider");
      }
      flexRow.style.setProperty("--marginTop", topSpacing);
      flexRow.style.setProperty("--marginBottom", bottomSpacing);
      flexRow.style.setProperty("--blockPaddingTopExtra", "0rem");
      flexRow.style.setProperty("--blockPaddingBottomExtra", "0rem");
      const resolvedBackgroundColor =
        properties.backgroundColor == "Inherit"
          ? ""
          : (
            lib.colors[properties.backgroundColor] ||
            properties.backgroundColor
          ).toLowerCase();
      flexRow.style.setProperty(
        "--masterBlockBgColor",
        resolvedBackgroundColor
      );

      const usesLightBleedBackground =
        properties.backgroundColor == "Orange" ||
        properties.backgroundColor == "White" ||
        properties.backgroundColor == "Yellow" ||
        properties.backgroundColor == "Fluorescent Yellow-Green" ||
        properties.backgroundColor == "Fluorescent Pink";

      let appliedFullBleedBorderColor = "";
      if (properties.backgroundFullWidth) {
        flexRow.classList.add("fullBleed");
        flexRow.style.setProperty("--blockBleedLeft", signPadding.left);
        flexRow.style.setProperty("--blockBleedRight", signPadding.right);
        flexRow.style.setProperty("--blockBleedTop", bleedTop);
        flexRow.style.setProperty("--blockBleedBottom", bleedBottom);
        flexRow.style.width = "";
        flexRow.style.setProperty("--marginTop", "0rem");
        flexRow.style.setProperty("--marginBottom", "0rem");
        flexRow.style.setProperty("--blockPaddingTopExtra", topSpacing);
        flexRow.style.setProperty("--blockPaddingBottomExtra", bottomSpacing);
        const chosenBorderColor =
          typeof properties.borderColor === "string" &&
            properties.borderColor.trim().length
            ? properties.borderColor
            : Block.defaultBorderColor;
        const resolvedBorderColor =
          chosenBorderColor === Block.defaultBorderColor
            ? usesLightBleedBackground
              ? (lib.colors && lib.colors.Black) || "black"
              : (lib.colors && lib.colors.White) || "white"
            : resolveColorValue(chosenBorderColor);
        if (resolvedBorderColor) {
          flexRow.dataset.fullBleedBorderColor = resolvedBorderColor;
          appliedFullBleedBorderColor = resolvedBorderColor;
        } else {
          delete flexRow.dataset.fullBleedBorderColor;
        }
      } else {
        flexRow.classList.remove("fullBleed");
        flexRow.style.setProperty("--blockBleedLeft", "0rem");
        flexRow.style.setProperty("--blockBleedRight", "0rem");
        flexRow.style.setProperty("--blockBleedTop", "0rem");
        flexRow.style.setProperty("--blockBleedBottom", "0rem");
        flexRow.style.setProperty("--marginTop", topSpacing);
        flexRow.style.setProperty("--marginBottom", bottomSpacing);
        flexRow.style.width =
          properties.width == 0 ? "" : properties.width + "rem";
        delete flexRow.dataset.fullBleedBorderColor;
      }

      if (usesLightBleedBackground) {
        flexRow.style.color = "black";
        if (properties.backgroundFullWidth && !appliedFullBleedBorderColor) {
          const fallbackBorderColor =
            (lib.colors && lib.colors.Black) || "rgb(0, 0, 0)";
          flexRow.dataset.fullBleedBorderColor = fallbackBorderColor;
          appliedFullBleedBorderColor = fallbackBorderColor;
        }
      }

      const leftAlignment = document.createElement("div");
      leftAlignment.className = "blockElementLeft";
      const centerAlignment = document.createElement("div");
      centerAlignment.className = "blockElementCenter";
      const rightAlignment = document.createElement("div");
      rightAlignment.className = "blockElementRight";

      let lastKnownAlignment = centerAlignment;
      let dividerBorderColor = null;
      let fullBleedDividerIsHorizontal = false;
      for (let blockIdx = 0; blockIdx < row.length; blockIdx++) {
        let elem = row[blockIdx];
        switch (elem.alignment) {
          case "Left":
            lastKnownAlignment = leftAlignment;
            break;
          case "Right":
            lastKnownAlignment = rightAlignment;
            break;
          case "Center":
            lastKnownAlignment = centerAlignment;
            break;
          default:
        }

        if (
          elem instanceof DividerElement &&
          elem.fullBleed === true &&
          dividerBorderColor === null
        ) {
          if (elem.dividerColor && elem.dividerColor !== "Default") {
            dividerBorderColor =
              lib.colors[elem.dividerColor] || elem.dividerColor;
          } else {
            dividerBorderColor = lib.colors.White || "white";
          }
          fullBleedDividerIsHorizontal =
            elem.orientation !== DividerElement.prototype.verticalOrientation;
        }

        const blockElmt = elem.createElement(panel, subPanel);
        if (
          elem instanceof DividerElement &&
          elem.fullBleed === true &&
          elem.orientation === DividerElement.prototype.verticalOrientation
        ) {
          blockElmt.style.setProperty(
            "--dividerBleedTop",
            i === 0 ? bleedTop : "0rem"
          );
          blockElmt.style.setProperty(
            "--dividerBleedBottom",
            i === totalRows - 1 ? bleedBottom : "0rem"
          );
          blockElmt.style.setProperty("--dividerRowBleedTop", rowBleedTop);
          blockElmt.style.setProperty("--dividerRowBleedBottom", rowBleedBottom);
        }
        blockElmt.dataset.signRow = i;
        blockElmt.dataset.signBlock = blockIdx;
        lastKnownAlignment.appendChild(blockElmt);
      }

      leftAlignment.style.flexGrow =
        properties.stretchLeft && leftAlignment.children.length > 0 ? "1" : "0";
      centerAlignment.style.flexGrow =
        properties.stretchCenter && centerAlignment.children.length > 0
          ? "1"
          : "0";
      rightAlignment.style.flexGrow =
        properties.stretchRight && rightAlignment.children.length > 0
          ? "1"
          : "0";

      if (dividerBorderColor) {
        const resolvedDividerBorderColor =
          resolveFullBleedDividerBorderColor({
            dividerBorderColor,
            rowBorderColor: appliedFullBleedBorderColor,
            defaultDividerColor: (lib.colors && lib.colors.White) || "white",
            isHorizontalDivider: fullBleedDividerIsHorizontal,
            backgroundFullWidth: !!properties.backgroundFullWidth,
            usesLightBleedBackground,
          });
        const normalizedDividerColor =
          typeof resolvedDividerBorderColor === "string"
            ? resolvedDividerBorderColor.toLowerCase()
            : resolvedDividerBorderColor;
        flexRow.dataset.fullBleedBorderColor = normalizedDividerColor;
        appliedFullBleedBorderColor = normalizedDividerColor;
      }

      flexRow.dataset.lightBackground = usesLightBleedBackground
        ? "true"
        : "false";
      if (
        properties.backgroundFullWidth &&
        usesLightBleedBackground &&
        appliedFullBleedBorderColor
      ) {
        flexRow.dataset.fullBleedStroke = "true";
        flexRow.style.setProperty(
          "--fullBleedBorderColor",
          appliedFullBleedBorderColor
        );
      } else {
        delete flexRow.dataset.fullBleedStroke;
        flexRow.style.removeProperty("--fullBleedBorderColor");
      }

      flexRow.appendChild(leftAlignment);
      flexRow.appendChild(centerAlignment);
      flexRow.appendChild(rightAlignment);
      flexBox.appendChild(flexRow);
    }

    return flexBox;
  }
}

class GroupedBlockElement {
  constructor({
    label = GroupedBlockElement.defaultLabel,
    alignment = "Center",
    blockElements,
  } = {}) {
    this.label =
      typeof label === "string" && label.trim().length
        ? label
        : GroupedBlockElement.defaultLabel;
    this.alignment = TextElement.prototype.alignment.includes(alignment)
      ? alignment
      : "Center";

    if (blockElements instanceof Control) {
      this.blockElements = blockElements;
    } else if (blockElements && Array.isArray(blockElements.rows)) {
      this.blockElements = new Control(blockElements);
    } else {
      this.blockElements = new Control({
        rows: [[new ControlTextElement({ textContent: "Grouped Block" })]],
        blockProperties: [new Block()],
      });
    }
  }

  createElement(panel, subPanel) {
    const wrapper = document.createElement("div");
    wrapper.className = "bE-groupedBlockElement";
    wrapper.dataset.groupLabel = this.label;

    const nestedPanel =
      panel && panel.sign
        ? {
          ...panel,
          sign: {
            ...panel.sign,
            padding: "0rem 0rem 0rem 0rem",
          },
        }
        : panel;
    const nestedBlockElements = this.blockElements.createElement(
      nestedPanel,
      subPanel
    );
    nestedBlockElements.classList.add("bE-groupedBlockElementContent");
    wrapper.appendChild(nestedBlockElements);
    return wrapper;
  }
}

GroupedBlockElement.defaultLabel = "Group";
GroupedBlockElement.prototype.alignment = TextElement.prototype.alignment;

Control.prototype.cloneBlockProperties = function (properties) {
  const clonedProperties = new Block(properties || {});
  if (properties && typeof properties === "object") {
    Object.assign(clonedProperties, properties);
  }
  return clonedProperties;
};

Control.prototype.cloneElement = function (element) {
  if (!element || typeof element !== "object") {
    return element;
  }

  const blockElemType = Control.prototype.blockToClassElems.getElem(element);
  const Constructor = blockElemType
    ? Control.prototype.blockToClassElems[blockElemType]
    : null;
  if (typeof Constructor !== "function") {
    return Object.assign({}, element);
  }

  const clonedElement = Object.assign(new Constructor(element), element);
  delete clonedElement._elementType;

  if (blockElemType === "GroupedBlockElement") {
    clonedElement.blockElements =
      element.blockElements && typeof element.blockElements.clone === "function"
        ? element.blockElements.clone()
        : new Control(element.blockElements || {});
  }

  return clonedElement;
};

Control.prototype.clone = function () {
  const rows = Array.isArray(this.rows)
    ? this.rows.map((row) =>
      Array.isArray(row) ? row.map((elem) => this.cloneElement(elem)) : []
    )
    : [];
  const blockProperties = rows.map((row, index) =>
    this.cloneBlockProperties(this.blockProperties[index])
  );

  return new Control({ rows, blockProperties });
};

Control.prototype.blockToClassElems = {
  ControlTextElement: ControlTextElement,
  DividerElement: DividerElement,
  ShieldElement: ShieldElement,
  AdvisoryMessageElement: AdvisoryMessageElement,
  IconElement: IconElement,
  BeaconElement: BeaconElement,
  ArrowElement: ArrowElement,
  TollLogoElement: TollLogoElement,
  ActionMessageElement: ActionMessageElement,
  ElectronicSignElement: ElectronicSignElement,
  GroupedBlockElement: GroupedBlockElement,
  getElem: (elemObj) => {
    for (const key in Control.prototype.blockToClassElems) {
      if (elemObj instanceof Control.prototype.blockToClassElems[key]) {
        return key;
      }
    }
    return null;
  },
};

Control.prototype.blockElements = {
  ControlTextElement: "Control Text",
  ActionMessageElement: "Action Message",
  AdvisoryMessageElement: "Advisory Message",
  ShieldElement: "Shield",
  ArrowElement: "Arrow",
  DividerElement: "Divider",
  IconElement: "Icon",
  BeaconElement: "Flashing Beacon",
  TollLogoElement: "Toll Logo",
  ElectronicSignElement: "Electronic Sign",
  GroupedBlockElement: "Grouped Block",
};

Control.prototype.blockInternalElements = {
  ControlTextElement: "sdCtrlText",
  DividerElement: "sdBlocker",
  ShieldElement: "sdShield",
  AdvisoryMessageElement: "sdAdvisory",
  IconElement: "sdIcon",
  BeaconElement: "sdBeacon",
  ArrowElement: "sdArrow",
  TollLogoElement: "sdTollLogo",
  ActionMessageElement: "sdActionMessage",
  ElectronicSignElement: "sdElectronicSign",
  GroupedBlockElement: "sdGroupedBlock",
};
