class Sign {
  constructor({
    // arrow
    arrows = {
      arrowMode: "standard",
      standard: {},
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

    guideArrow = "None",
    guideArrowLanes = 1,
    useCanadianDownArrows = false,
    exitguideArrows = "Down Arrow",
    exitOnlyPadding = 0,
    exitOnlyBorderMode = "white-edge",
    exitOnlyLeftText = "EXIT",
    exitOnlyRightText = "ONLY",
    exitOnlyLabelPreset = "EXIT ONLY",
    hideExitArrow = false,

    // other
    otherSymbol = "None",
    oSNum = "",

    // subpanel
    subPanels = [],
    lanePanelSize = 0, // number

    // panel
    padding = "0.3rem 0.75rem 0.3rem 0.75rem",
    arrowPosition = "Middle",
  } = {}) {
    this.otherSymbol = otherSymbol;
    this.guideArrow = guideArrow;
    this.guideArrowLanes = guideArrowLanes;
    this.useCanadianDownArrows = useCanadianDownArrows;
    this.oSNum = oSNum;
    this.subPanels = subPanels;
    this.padding = padding;
    this.arrowPosition = arrowPosition;
    this.exitguideArrows = exitguideArrows;
    this.exitOnlyPadding = exitOnlyPadding;
    this.exitOnlyBorderMode = exitOnlyBorderMode;
    this.exitOnlyLeftText = exitOnlyLeftText;
    this.exitOnlyRightText = exitOnlyRightText;
    this.exitOnlyLabelPreset = exitOnlyLabelPreset;
    this.hideExitArrow = hideExitArrow;
    this.arrows = arrows;
    this.lanePanelSize = lanePanelSize;
  }

  // apls
  newAPL(subpanelNumber) {
    if (!this.arrows.apl.subpanels[subpanelNumber]) {
      this.arrows.apl.subpanels[subpanelNumber] = [];
      this.arrows.apl.subpanelConfigs[subpanelNumber] = {
        justify: "left",
      };
    }

    const newArrow = new APLArrow();
    this.arrows.apl.subpanels[subpanelNumber].push(newArrow);
    return this.arrows.apl.subpanels[subpanelNumber].length;
  }

  deleteAPL(subpanelNumber, aplIndex) {
    if (
      !this.arrows.apl.subpanels[subpanelNumber] ||
      (this.arrows.apl.subpanels[subpanelNumber] &&
        !this.arrows.apl.subpanels[subpanelNumber][aplIndex])
    ) {
      return;
    }

    this.arrows.apl.subpanels[subpanelNumber].splice(aplIndex, 1);
  }

  moveAPLSubpanel(subpanelNumber, aplIndex, newSubpanel) {
    if (
      !this.arrows.apl.subpanels[subpanelNumber] ||
      (this.arrows.apl.subpanels[subpanelNumber] &&
        !this.arrows.apl.subpanels[subpanelNumber][aplIndex]) ||
      !this.arrows.apl.subpanels[newSubpanel]
    ) {
      return;
    }

    const apl = this.arrows.apl.subpanels[subpanelNumber].splice(aplIndex, 1);
    this.arrows.apl.subpanels[newSubpanel].push(apl);
  }

  moveAPLWithin(subpanelNumber, aplIndex, newAplIndex) {
    if (
      !this.arrows.apl.subpanels[subpanelNumber] ||
      (this.arrows.apl.subpanels[subpanelNumber] &&
        !this.arrows.apl.subpanels[subpanelNumber][aplIndex])
    ) {
      return;
    }

    const apl = this.arrows.apl.subpanels[subpanelNumber].splice(aplIndex, 1);
    this.arrows.apl.subpanels[subpanelNumber].splice(newAplIndex, 0, apl);
  }

  // subpanels
  newSubPanel() {
    const new_subPanel = new SubPanels();
    this.subPanels.push(new_subPanel);
  }

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
