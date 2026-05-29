class Sign {
  /**
   * Cretes a new sign.
   * @param {Object} [opt] - Optional parameters.
   * @param {string} [opt.controlText="New Sign"] - Control cities to display on the sign.
   * @param {string} [opt.shieldPosition] - Where the shields should be displayed relative to the control cities.
   * @param {boolean} [opt.shieldBacks=false] - Whether or not shields should be displayed with backings.
   * @param {string} [opt.guideArrow] - Which guide arrow to display on the sign, if any.
   * @param {number} [opt.guideArrowLanes=1] - Number of lanes actoss to display guide arrows.
   * @param {string} [opt.otherSymbols] - Other symbols on the bottom of signs (like Quebec style exit markers)
   * @param {string} [opt.oSNum=""] - Number to place on otherSymbol
   * @param {string} [opt.actionMessage=""] - Custom subtext to display on the sign.
   * @param {Shield[]} [opt.shields] - Array of shields to include on sign.
   */
  constructor({
    // arrow
    arrowMode = "Standard",
    arrows = [],
    guideArrow,
    guideArrowLanes = 1,
    useCanadianDownArrows = false,
    exitguideArrows = "Down Arrow",
    exitOnlyPadding = 0,
    exitOnlyBorderMode,
    exitOnlyLeftText = "EXIT",
    exitOnlyRightText = "ONLY",
    exitOnlyLabelPreset = "EXIT ONLY",
    hideExitArrow = false,

    // other
    otherSymbol,
    oSNum = "",

    // subpanel
    subPanels = [],

    // panel
    padding = "0.3rem 0.75rem 0.3rem 0.75rem",
    arrowPosition = "Middle",
  } = {}) {
    if (this.otherSymbols.includes(otherSymbol)) {
      this.otherSymbol = otherSymbol;
    } else {
      this.otherSymbol = "None";
    }
    if (this.guideArrows.includes(guideArrow)) {
      this.guideArrow = guideArrow;
    } else {
      this.guideArrow = "None";
    }
    if (guideArrowLanes >= 0 && guideArrowLanes <= 6) {
      this.guideArrowLanes = guideArrowLanes;
    } else {
      this.guideArrowLanes = 0;
    }
    this.useCanadianDownArrows = useCanadianDownArrows;
    this.oSNum = oSNum;
    this.subPanels = subPanels;
    this.padding = padding;
    this.arrowPosition = arrowPosition;
    this.arrowMode = arrowMode;
    this.arrows = arrows;
    this.exitguideArrows = exitguideArrows;
    this.exitOnlyPadding = exitOnlyPadding;
    const exitOnlyBorderModes = Sign.prototype.exitOnlyBorderModes;
    if (exitOnlyBorderModes.includes(exitOnlyBorderMode)) {
      this.exitOnlyBorderMode = exitOnlyBorderMode;
    } else {
      const defaultBorderMode =
        this.guideArrow === "Half Exit Only" ? "edge" : "white-edge";
      this.exitOnlyBorderMode = exitOnlyBorderModes.includes(defaultBorderMode)
        ? defaultBorderMode
        : exitOnlyBorderModes[0];
    }
    let resolvedLeft =
      typeof exitOnlyLeftText === "string" ? exitOnlyLeftText : undefined;
    let resolvedRight =
      typeof exitOnlyRightText === "string" ? exitOnlyRightText : undefined;
    if (
      (typeof resolvedLeft === "undefined" ||
        typeof resolvedRight === "undefined") &&
      typeof exitOnlyLabelPreset === "string" &&
      exitOnlyLabelPreset.trim().length > 0
    ) {
      const parts = exitOnlyLabelPreset.trim().split(/\s+/);
      const presetLeft = parts.length ? parts[0] : "EXIT";
      const presetRight =
        parts.length > 1 ? parts.slice(1).join(" ") : presetLeft;
      if (typeof resolvedLeft === "undefined") {
        resolvedLeft = presetLeft;
      }
      if (typeof resolvedRight === "undefined") {
        resolvedRight = presetRight;
      }
    }
    if (typeof resolvedLeft !== "string") {
      resolvedLeft = "EXIT";
    }
    if (typeof resolvedRight !== "string") {
      resolvedRight = "ONLY";
    }
    this.exitOnlyLeftText = resolvedLeft;
    this.exitOnlyRightText = resolvedRight;
    const combinedLabel = [resolvedLeft, resolvedRight]
      .filter((part) => typeof part === "string" && part.trim().length > 0)
      .join(" ")
      .trim();
    this.exitOnlyLabelPreset = combinedLabel || "EXIT ONLY";
    this.hideExitArrow = !!hideExitArrow;
  }

  /**
   * Create a new shield for the post. Add it to the end of the list of existing shields.
   */

  newArrow() {
    const newArrow = new Arrow();
    this.arrows.push(newArrow);
  }

  deleteArrow(parentIndex, arrowIndex) {
    var selectedArrow;

    for (const arrow of this.arrows) {
      if (arrow.parentIndex == parentIndex && arrow.arrowIndex == arrowIndex) {
        selectedArrow = arrow;
        break;
      }
    }

    this.arrows.splice(this.arrows.indexOf(selectedArrow), 1);
  }

  newSubPanel() {
    const new_subPanel = new SubPanels();
    this.subPanels.push(new_subPanel);
  }

  /**
   * Deletes a subpanel
   * @param {number} subPanelIndex - you already know lol
   */

  deleteSubPanel(subPanelIndex) {
    this.subPanels.splice(subPanelIndex, 1);
  }

  duplicateSubPanel(subPanelIndex) {
    const existingSubPanel = this.subPanels[subPanelIndex];
    const new_SubPanel = new SubPanels({
      controlText: existingSubPanel.controlText,
      actionMessage: existingSubPanel.actionMessage,
      shields: existingSubPanel.shields,
      width: existingSubPanel.width,
      height: existingSubPanel.height,
      customDividerHeight: existingSubPanel.customDividerHeight,
    });
    this.subPanels.push(new_SubPanel);
  }
}

Sign.prototype.shieldPositions = ["Left", "Above", "Right"];
Sign.prototype.guideArrows = [
  "None",
  "Side Left",
  "Side Right",
  "Exit Only",
  "Split Exit Only",
  "Half Exit Only",
  "Left/Down Arrow:A-3",
  "Left Arrow:D-1",
  "Left/Up Arrow:A-4",
  "Right/Down Arrow:A-2",
  "Right Arrow:D-2",
  "Right/Up Arrow:A-1",
  "Down Arrow:C-1",
  "Up Arrow:C-2",
  "alt. Left/Down Arrow:B-3",
  "alt. Left/Up Arrow:B-4",
  "alt. Right/Up Arrow:B-1",
  "alt. Right/Down Arrow:B-2",
  "Sharp Left:E-1",
  "Sharp Right:E-2",
];
Sign.prototype.exitguideArrows = [
  "Down Arrow:EC-1/C-1",
  "Left/Up Arrow:EB-4/B-4",
  "alt. Left/Up Arrow:EA-4/A-4",
  "Right/Up Arrow:EB-1/B-1",
  "alt. Right/Up Arrow:EA-1/A-1",
];

Sign.prototype.exitOnlyBorderModes = ["edge", "white-edge"];

Sign.prototype.arrowPositions = ["Middle", "Left", "Right"];

Sign.prototype.otherSymbols = [
  "None",
  "Quebec-Style Exit Marker",
  "Quebec-Left",
];

// this needs to be deprecreated in favor of block elements (add vertical dividers maybe?)
