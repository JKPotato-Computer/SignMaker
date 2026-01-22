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
];

TextElement.prototype.alignment = ["Left", "Center", "Right"];

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
  "Clearview 5WR"
)
  ? "Clearview 5WR"
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
  constructor({ fontSize = 70, useNumeralFormatting = true } = {}) {
    super();
    this.fontSize = fontSize;
    this.useNumeralFormatting = useNumeralFormatting;
  }
}

class AdvisoryMessageElement extends TextElement {
  constructor({
    backgroundColor = "Yellow",
    fontFamily = "Series E",
    borderRadius = 4,
    useNumeralFormatting = true,
    horizPadding = 0.3,
    vertPadding = 0.3,
  } = {}) {
    super();
    this.backgroundColor = backgroundColor;
    this.fontFamily = fontFamily;
    this.borderRadius = borderRadius;
    this.useNumeralFormatting = useNumeralFormatting;
    this.horizPadding = horizPadding;
    this.vertPadding = vertPadding;
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

    return newText;
  }
}

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
ElectronicSignElement.prototype.fontFamily =
  TextElement.prototype.fontFamily.concat([
    "Electronic Highway Sign",
    "Modern VMS",
  ]);
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
    countyText = "",
    shieldSize,
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
    this.countyText = typeof countyText === "string" ? countyText : "";
    this.shieldSize = ShieldElement.prototype.normalizeShieldSize(
      shieldSize !== undefined ? shieldSize : size
    );
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
    const variant = ShieldElement.prototype.resolveBlockVariant(
      this.shieldType,
      routeText,
      config
    );
    const variantKey = ShieldElement.prototype.formatVariantKey(variant);
    const shieldPath = ShieldElement.prototype.getShieldAssetPath(
      config,
      variantKey
    );
    const normalizedShieldSize = ShieldElement.prototype.normalizeShieldSize(
      this.shieldSize
    );
    const shieldScale =
      ShieldElement.prototype.getShieldScale(normalizedShieldSize);
    const bannerScale = this.scaleBannersWithShield ? shieldScale : 1;
    const fontSizeCss = ShieldElement.prototype.getFontSizeCss(this.fontSize);
    const bannerFontFamily =
      ShieldElement.prototype.normalizeBannerFontFamily(this.bannerFontFamily);
    wrapper.style.setProperty("--shieldScale", shieldScale.toString());
    wrapper.style.setProperty(
      "--shieldSize",
      normalizedShieldSize + "rem"
    );
    wrapper.style.setProperty("--bannerScale", bannerScale.toString());

    const shieldContainer = document.createElement("div");
    const containerClass = config.className || config.value;
    shieldContainer.className = `bannerShieldContainer ${containerClass}`;
    const containerSizeClass = ShieldElement.prototype.getContainerSizeClass(
      routeText
    );
    if (containerSizeClass) {
      shieldContainer.classList.add(containerSizeClass);
    }

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
            },
            {
              bannerClass: "bannerB",
              bannerValue: this.bannerType2,
              containerClass: "bannerContainer2",
              indentFirstLetter: this.indentFirstLetter2,
              smallCaps: this.smallCaps2,
            },
          ],
          fontSizeCss,
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
    shieldEl.appendChild(img);

    const routeEl = document.createElement("p");
    routeEl.className = "routeNumber";
    routeEl.textContent = routeText;

    if (ShieldElement.prototype.isCountyShield(config)) {
      const countyLabel = document.createElement("p");
      countyLabel.className = "countyLabel";
      countyLabel.textContent = (this.countyText || "").trim().toUpperCase();
      if (countyLabel.textContent.length > 0) {
        shieldEl.appendChild(countyLabel);
      }
    }

    shieldEl.appendChild(routeEl);

    shieldContainer.appendChild(shieldEl);

    if (!shouldStackSamePosition && hasBannerB) {
      const bannerContainerElmt2 = ShieldElement.prototype.createBannerContainer(
        "bannerContainer2",
        "bannerB",
        this.bannerType2,
        fontSizeCss,
        this.indentFirstLetter2,
        bannerFontFamily,
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

    return wrapper;
  }
}

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

  const traverse = (node, pathParts = []) => {
    if (!node || typeof node !== "object") {
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (!value || typeof value !== "object") {
        continue;
      }
      if (value.type === "category") {
        traverse(value, pathParts.concat(key));
      } else if (value.type === "shield") {
        const normalizedCode = ShieldElement.prototype.normalizeShieldCode(key);
        const variants = Array.isArray(value.variants) ? value.variants.slice() : [];
        shields.push({
          value: normalizedCode,
          label: value.name || normalizedCode,
          variants,
          assetFolder: ["img/shields"].concat(pathParts).join("/"),
          className: ShieldElement.prototype.getShieldClassNames(normalizedCode),
          assetName: normalizedCode,
          categories: pathParts.slice(),
        });
      }
    }
  };

  traverse(directory);

  const ensureShield = (value, label, variants, assetFolder, categories = []) => {
    const normalizedValue = ShieldElement.prototype.normalizeShieldCode(value);
    if (
      shields.some(
        (shield) =>
          ShieldElement.prototype.normalizeShieldCode(shield.value) ===
          normalizedValue
      )
    ) {
      return;
    }
    shields.push({
      value: normalizedValue,
      label: label || normalizedValue,
      variants: variants || [],
      assetFolder,
      className: ShieldElement.prototype.getShieldClassNames(normalizedValue),
      assetName: normalizedValue,
      categories,
    });
  };

  ensureShield(
    "cir",
    "Circle",
    ["2 Digit", "3 Digit"],
    "img/shields/United States",
    ["United States"]
  );
  ensureShield(
    "elp",
    "Ellipse",
    ["2 Digit", "3 Digit"],
    "img/shields/United States",
    ["United States"]
  );
  ensureShield(
    "rec",
    "Rectangle",
    ["2 Digit", "3 Digit"],
    "img/shields/United States",
    ["United States"]
  );
  ensureShield(
    "rec2",
    "Rectangle (Alt)",
    ["2 Digit", "3 Digit"],
    "img/shields/United States",
    ["United States"]
  );

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
  const options = Shield.prototype.bannerTypes || [];
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) {
    return ShieldElement.prototype.defaultBannerType;
  }
  if (!options.length || options.includes(trimmed)) {
    return trimmed;
  }
  return trimmed;
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
  return typeof value === "string" && value !== "None" && value.trim().length > 0;
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
  bannerEl.textContent =
    bannerValue && bannerValue !== "None" ? bannerValue : " ";
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
    ({ bannerClass, bannerValue, containerClass, indentFirstLetter: bannerSpecificIndent, smallCaps: bannerSpecificSmallCaps }) => {
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
      const bannerEl = ShieldElement.prototype.createBannerElement(
        bannerClass,
        bannerValue,
        fontSizeCss,
        bannerIndent,
        bannerFontFamily,
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
    return allowed[0] || normalized;
  }
  const fallback = allowed[0] || ShieldElement.prototype.defaultVariant;
  const inferred = ShieldElement.prototype.getVariantFromRoute(routeNumber, config);
  return allowed.includes(inferred) ? inferred : fallback;
};

ShieldElement.prototype.getVariantFromRoute = function (routeNumber, config) {
  const digitsOnly = (routeNumber || "").replace(/[^0-9]/g, "");
  const supportsFourDigit =
    Array.isArray(config?.variants) && config.variants.includes("4 Digit");
  if (supportsFourDigit && digitsOnly.length >= 4) {
    return "4 Digit";
  }
  return digitsOnly.length >= 3 ? "3 Digit" : "2 Digit";
};

ShieldElement.prototype.getContainerSizeClass = function (routeNumber) {
  const length = (routeNumber || "").trim().length;
  if (length === 0) {
    return "";
  }
  if (length <= 1) {
    return "one";
  }
  if (length === 2) {
    return "two";
  }
  if (length === 3) {
    return "three";
  }
  return "four";
};

ShieldElement.prototype.getImageSizeClass = function (routeNumber) {
  const length = (routeNumber || "").trim().length;
  if (length === 0) {
    return "";
  }
  if (length <= 1) {
    return "one";
  }
  if (length === 2) {
    return "two";
  }
  if (length === 3) {
    return "three";
  }
  return "four";
};

ShieldElement.prototype.getShieldAssetPath = function (config, variantKey) {
  const assetFolder = config?.assetFolder || "img/shields";
  const assetName = config?.assetName || config?.value || "I";
  const suffix = variantKey ? `-${variantKey}` : "";
  return `${assetFolder}/${assetName}${suffix}.svg`;
};

ShieldElement.prototype.isCountyShield = function (config) {
  const normalized = ShieldElement.prototype.normalizeShieldCode(
    config?.value || config?.assetName || ""
  );
  return normalized === "C";
};

class DividerElement {
  constructor({
    dividerWidth = 100,
    dividerMeasurement = "%",
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

DividerElement.prototype.dividerMeasurement = ["%", "rem"];
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
  "YIELD": { label: "Yield", src: "img/icons/YIELD.svg" }
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

class Control {
  constructor({ rows = [], blockProperties = [] } = {}) {
    this.rows = rows;
    this.blockProperties = blockProperties;
  }

  addElement(element, properties, row, column) {
    let newElement = new element(properties);
    if (!this.rows[row]) {
      this.rows[row] = [];
      this.blockProperties[row] = new Block();
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

  addRow(row, element) {
    if (this.rows[row] && this.rows[row].length != 0) {
      this.rows.splice(row, 0, []);
      this.blockProperties.splice(row, 0, new Block());
    }
    this.addElement(Control.prototype.blockToClassElems[element], {}, row, 0);
  }

  duplicateRow(row) {
    let newRows = [];
    for (const e of this.rows[row]) {
      const blockElemType = Control.prototype.blockToClassElems.getElem(e);
      newRows.push(
        Object.assign(
          new Control.prototype.blockToClassElems[blockElemType](),
          e
        )
      );
    }
    this.rows.splice(row + 1, 0, newRows);
    this.blockProperties.splice(row + 1, 0, new Block());
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
      const bleedTop = i === 0 ? signPadding.top : "0rem";
      const bleedBottom = i === totalRows - 1 ? signPadding.bottom : "0rem";

      const flexRow = document.createElement("div");
      flexRow.className = "blockElementRow";
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
        }

        const blockElmt = elem.createElement(panel, subPanel);
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
        const normalizedDividerColor =
          typeof dividerBorderColor === "string"
            ? dividerBorderColor.toLowerCase()
            : dividerBorderColor;
        flexRow.dataset.fullBleedBorderColor = normalizedDividerColor;
        appliedFullBleedBorderColor = normalizedDividerColor;
      }

      flexRow.dataset.lightBackground = usesLightBleedBackground
        ? "true"
        : "false";

      flexRow.appendChild(leftAlignment);
      flexRow.appendChild(centerAlignment);
      flexRow.appendChild(rightAlignment);
      flexBox.appendChild(flexRow);
    }

    return flexBox;
  }
}

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
};
