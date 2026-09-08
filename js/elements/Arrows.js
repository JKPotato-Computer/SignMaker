class APLArrow {
  constructor({
    arrowVariant = "Up Arrow",
    offset = 0,
    size = 4.5,

    exitOnlyEnabled = false,
    exitTextContent = ["EXIT", "ONLY"],
    exitBGColor = "Yellow",
    exitTextRoundness = 4,
    exitTextHorizontalPadding = 5,
    exitTextMargins = [0, 0],
    exitTextSize = 16,
    exitTextLineHeight = 100,
    fontFamily = "Series E",
  } = {}) {
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
    image.src = `assets/arrow/${this.arrowTypes[this.arrowVariant].asset}`;
    image.className =
      "sMGA_APLArrow " +
      (this.arrowTypes[this.arrowVariant].flipped ? "flipped" : "") +
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
          lib.colors[this.exitBGColor] || this.exitBGColor.toLowerCase(),
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
          : lib.checkForContrast(this.exitBGColor.toLowerCase())
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

APLArrow.prototype.arrowTypes = {
  ["Up Arrow"]: { asset: "APL_Up.svg", flipped: false },
  ["Left Choice Arrow"]: { asset: "APL_Choice.svg", flipped: true },
  ["Right Choice Arrow"]: { asset: "APL_Choice.svg", flipped: false },
  ["Left Arrow"]: { asset: "APL_Turn.svg", flipped: true },
  ["Right Arrow"]: { asset: "APL_Turn.svg", flipped: false },
  ["Dual Turn"]: { asset: "APL_DualTurn.svg", flipped: false },
  ["CFX Left Choice Arrow"]: { asset: "APL_CFXChoice.svg", flipped: true },
  ["CFX Right Choice Arrow"]: { asset: "APL_CFXChoice.svg", flipped: false },
  ["CFX Left Arrow"]: { asset: "APL_CFXTurn.svg", flipped: true },
  ["CFX Right Arrow"]: { asset: "APL_CFXTurn.svg", flipped: false },
  ["CFX Up Arrow"]: { asset: "APL_CFXUp.svg", flipped: false },
};

APLArrow.prototype.backgroundColors = [
  "Yellow",
  "White",
  "Transparent",
  "Outline",
];
APLArrow.prototype.justifyAPLs = ["Left", "Right", "Center"];
