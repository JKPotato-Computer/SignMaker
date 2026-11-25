class Sign {
  constructor(options = {}) {
    const {
      arrows,

      otherSymbol,
      oSNum,
      oSArrow,
      oSArrowPositioning,

      actionMessage,
      actionMessageArrow,
      actionMessagePositioning,

      subPanels,
      lanePanelSize,
    } = MUTCDVariants.get("Sign", options);
    if (
      arrows.standard?.exitOnlyConfigs?.arrow &&
      !(arrows.standard.exitOnlyConfigs.arrow instanceof StandardArrow)
    ) {
      arrows.standard.exitOnlyConfigs.arrow = new StandardArrow(
        arrows.standard.exitOnlyConfigs.arrow,
      );
    }
    this.otherSymbol = otherSymbol;
    this.oSNum = oSNum;
    this.oSArrow = oSArrow;
    this.oSArrowPositioning = oSArrowPositioning;
    this.actionMessage = actionMessage;
    this.actionMessageArrow = actionMessageArrow;
    this.actionMessagePositioning = actionMessagePositioning;
    this.subPanels = subPanels;
    this.arrows = arrows;
    this.lanePanelSize = lanePanelSize;
  }

  // apls
  newAPL(subpanelNumber) {
    if (!this.arrows.apl.subpanels[subpanelNumber]) {
      this.arrows.apl.subpanels[subpanelNumber] = [];
      this.arrows.apl.subpanelConfigs[subpanelNumber] = {
        justify: false,
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

  // Guide Arrows
  newStandardArrow(arrowProperties) {
    const newArrow = new StandardArrow({
      size: 2,
      ...arrowProperties,
    });
    this.arrows.standard.arrowList.push(newArrow);
  }

  deleteStandardArrow(arrowIndex) {
    this.arrows.standard.arrowList.splice(arrowIndex, 1);
  }

  moveStandardArrow(arrowIndex, newArrowIndex) {
    const arrow = this.arrows.standard.arrowList.splice(arrowIndex, 1)[0];
    this.arrows.standard.arrowList.splice(newArrowIndex, 0, arrow);
  }

  duplicateStandardArrow(arrowIndex) {
    const existingArrow = this.arrows.standard.arrowList[arrowIndex];
    if (!existingArrow) {
      return;
    }

    const newArrow = lib.clone(existingArrow);
    this.arrows.standard.arrowList.splice(arrowIndex + 1, 0, newArrow);
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
    if (!existingSubPanel) {
      return;
    }

    this.subPanels.splice(
      subPanelIndex + 1,
      0,
      lib.clone(existingSubPanel),
    );
  }
}

Sign.guideArrows = [
  "None",
  "Side Left",
  "Side Right",
  "Exit Only",
  "Split Exit Only",
  "Half Exit Only",
  "Custom",
];

Sign.standardArrowJustify = ["Left", "Center", "Right", "Space Between"];
Sign.exitOnlyJustify = ["Left", "Center", "Right"];

Sign.otherSymbols = ["None", "Quebec-Style Exit Marker", "Quebec-Left"];

Sign.exitOnlyBorderTypes = [
  "Full Black Border",
  "Partial Black Border",
  "Ontario Black Border",
  "White Border",
];

Sign.otherSymbols = [
  "None",
  "Quebec-Style Exit Marker",
  "Quebec-Style LEFT Exit Marker",
];

Sign.otherSymbolsPositioning = ["Left", "Right"];

window.Sign = Sign;
