class APLArrow {
  constructor(options = {}) {
    const {
      arrowVariant,
      offset,
      size,
      exitOnlyEnabled,
      exitTextContent,
      exitBGColor,
      exitTextRoundness,
      exitTextHorizontalPadding,
      exitTextMargins,
      exitTextSize,
      exitTextLineHeight,
      fontFamily,
    } = MUTCDVariants.get("APLArrow", options);
    this.arrowVariant = arrowVariant;
    this.offset = offset;
    this.size = size;
    this.exitOnlyEnabled = exitOnlyEnabled;
    this.exitTextContent = exitTextContent;
    this.exitBGColor = exitBGColor;
    this.exitTextRoundness = exitTextRoundness;
    this.exitTextHorizontalPadding = exitTextHorizontalPadding;
    this.exitTextMargins = exitTextMargins;
    this.fontFamily = fontFamily;
    this.exitTextSize = exitTextSize;
    this.exitTextLineHeight = exitTextLineHeight;
  }

  createElement() {
    const holder = document.createElement("div");
    holder.className = "sMGA_APLArrowHolder";
    holder.style.setProperty("--arrowOffset", `${this.offset}px`);

    const image = document.createElement("img");
    image.src = `assets/arrow/${APLArrow.arrowTypes[this.arrowVariant].asset}`;
    image.className =
      "sMGA_APLArrow " +
      (APLArrow.arrowTypes[this.arrowVariant].flipped ? "flipped" : "") +
      " " +
      this.arrowVariant.replace(/\s+/g, "-").toLowerCase();
    image.style.setProperty("--arrowSize", `${this.size}rem`);

    holder.appendChild(image);

    if (this.exitOnlyEnabled) {
      for (let i = 0; i < this.exitTextContent.length; i++) {
        if (this.exitTextContent[i].trim() === "") continue;

        const exitText = document.createElement("div");
        exitText.className =
          "sMGA_APLArrow_exitText " + (i == 0 ? "left" : "right");
        exitText.textContent = this.exitTextContent[i];
        exitText.style.setProperty(
          "--exitBGColor",
          ColorLibrary.colorLibrary[this.exitBGColor] || this.exitBGColor,
        );
        exitText.style.setProperty(
          "--exitTextRoundness",
          `${this.exitTextRoundness}px`,
        );
        exitText.style.setProperty(
          "--exitTextHorizontalPadding",
          `${this.exitTextHorizontalPadding}px`,
        );
        exitText.style.setProperty(
          "--exitTextMargin",
          `${this.exitTextMargins[i]}px`,
        );
        exitText.style.setProperty("--exitTextSize", `${this.exitTextSize}px`);
        exitText.style.setProperty(
          "--exitTextLineHeight",
          `${this.exitTextLineHeight}%`,
        );
        exitText.style.setProperty("--fontFamily", `"${this.fontFamily}"`);
        exitText.style.color = ["Transparent", "Outline"].includes(
          this.exitBGColor,
        )
          ? "auto"
          : ColorLibrary.checkForContrast(this.exitBGColor)
            ? "black"
            : "white";

        if (this.exitBGColor == "Outline") {
          exitText.style.border = "4px solid white";
        }

        if (i == 0) {
          holder.insertBefore(exitText, image);
        } else {
          holder.appendChild(exitText);
        }
      }
    }

    return holder;
  }
}

APLArrow.arrowTypes = {
  ["Up Arrow"]: { asset: "APL_Up.svg", flipped: false },
  ["Left Choice Arrow"]: { asset: "APL_Choice.svg", flipped: true },
  ["Right Choice Arrow"]: { asset: "APL_Choice.svg", flipped: false },
  ["ALT Up Arrow"]: { asset: "APL_UpAlt.svg", flipped: false },
  ["ALT Left Choice Arrow"]: { asset: "APL_ChoiceAlt.svg", flipped: true },
  ["ALT Right Choice Arrow"]: { asset: "APL_ChoiceAlt.svg", flipped: false },
  ["Left Arrow"]: { asset: "APL_Turn.svg", flipped: true },
  ["Right Arrow"]: { asset: "APL_Turn.svg", flipped: false },
  ["ALT Left Arrow"]: { asset: "APL_TurnAlt.svg", flipped: true },
  ["ALT Right Arrow"]: { asset: "APL_TurnAlt.svg", flipped: false },
  ["Dual Turn"]: { asset: "APL_DualTurn.svg", flipped: false },
  ["Split Turn"]: { asset: "APL_Split.svg", flipped: false },
  ["ALT Dual Turn"]: { asset: "APL_DualTurnAlt.svg", flipped: false },
  ["CFX Left Choice Arrow"]: { asset: "APL_CFXChoice.svg", flipped: true },
  ["CFX Right Choice Arrow"]: { asset: "APL_CFXChoice.svg", flipped: false },
  ["CFX Left Arrow"]: { asset: "APL_CFXTurn.svg", flipped: true },
  ["CFX Right Arrow"]: { asset: "APL_CFXTurn.svg", flipped: false },
  ["CFX Up Arrow"]: { asset: "APL_CFXUp.svg", flipped: false },
};

APLArrow.prototype.justifyAPLs = ["Left", "Right", "Center"];
APLArrow.prototype.backgroundColors = [
  "Yellow",
  "White",
  "Transparent",
  "Outline",
];

class StandardArrow {
  constructor(options = {}) {
    const { arrow, rotation, size, marginHorizontal, marginVertical, flip } =
      MUTCDVariants.get("StandardArrow", options);
    this.arrow = arrow;
    this.rotation = rotation;
    this.size = size;
    this.marginHorizontal = marginHorizontal;
    this.marginVertical = marginVertical;
    this.flip = flip;
  }

  createElement() {
    const img = document.createElement("img");
    img.className = "bE-arrowImage";
    img.src = this.arrows[this.arrow].src;

    img.style.setProperty("--arrowRotation", this.rotation + "deg");
    img.style.setProperty("--arrowSize", this.size + "rem");
    img.style.setProperty("--arrowFlip", this.flip ? "-1" : "1");
    img.style.setProperty(
      "--arrowMarginHorizontal",
      this.marginHorizontal + "rem",
    );
    img.style.setProperty("--arrowMarginVertical", this.marginVertical + "rem");

    return img;
  }
}

StandardArrow.prototype.arrows = {
  TYPE_A: { label: "Type A", src: "assets/arrow/TypeA.svg" },
  TYPE_A_EXTENDED: {
    label: "Type A Extended",
    src: "assets/arrow/TypeAExtended.svg",
  },
  TYPE_B: { label: "Type B", src: "assets/arrow/TypeB.svg" },
  TYPE_C_45: { label: "Type C (45∘)", src: "assets/arrow/TypeC45.svg" },
  TYPE_C_45_ALT: {
    label: "Type C (45∘) (alt)",
    src: "assets/arrow/TypeC45Alt.svg",
  },
  TYPE_C_90: { label: "Type C (90∘)", src: "assets/arrow/TypeC90.svg" },
  TYPE_D: { label: "Type D", src: "assets/arrow/TypeD.svg" },
  DOWN: {
    label: "Down",
    src: "assets/arrow/Down.svg",
    defaultSize: 2.75,
  },
  DOWN_CA: {
    label: "Down (Ontario)",
    src: "assets/arrow/CanadaDown.svg",
    defaultSize: 2.75,
  },
  UK: { label: "Up (United Kingdom)", src: "assets/arrow/ArrowUK.svg" },
  ["Up Arrow"]: {
    label: "Up Arrow",
    src: "assets/arrow/APL_Up.svg",
    flipped: false,
  },
  ["Choice Turning Arrow"]: {
    label: "Choice Turning Arrow",
    src: "assets/arrow/APL_Choice.svg",
  },
  ["ALT Up Arrow"]: {
    label: "ALT Up Arrow",
    src: "assets/arrow/APL_UpAlt.svg",
  },
  ["ALT Choice Turning Arrow"]: {
    label: "ALT Choice Turning Arrow",
    src: "assets/arrow/APL_ChoiceAlt.svg",
  },
  ["Turning Arrow"]: {
    label: "Turning Arrow",
    src: "assets/arrow/APL_Turn.svg",
  },
  ["ALT Turning Arrow"]: {
    label: "ALT Turning Arrow",
    src: "assets/arrow/APL_TurnAlt.svg",
  },
  ["Dual Turn"]: {
    label: "Dual Turn",
    src: "assets/arrow/APL_DualTurn.svg",
  },
  ["Split Turn"]: {
    label: "Split Turn",
    src: "assets/arrow/APL_Split.svg",
    flipped: false,
  },
  ["ALT Dual Turn"]: {
    label: "ALT Dual Turn",
    src: "assets/arrow/APL_DualTurnAlt.svg",
  },
  ["CFX Choice Turning Arrow"]: {
    label: "CFX Choice Turning Arrow",
    src: "assets/arrow/APL_CFXChoice.svg",
  },
  ["CFX Turning Arrow"]: {
    label: "CFX Turning Arrow",
    src: "assets/arrow/APL_CFXTurn.svg",
  },
  ["CFX Up Arrow"]: {
    label: "CFX Up Arrow",
    src: "assets/arrow/APL_CFXUp.svg",
  },
};

window.APLArrow = APLArrow;
window.StandardArrow = StandardArrow;
