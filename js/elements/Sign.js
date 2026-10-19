class Sign {
  constructor({
    // arrow
    arrows = {
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
          arrowLocation: "Center", // Half Exit ("Left"/"Right"); Split Exit ("Left","Right","Center")

          arrow: new StandardArrow({ arrow: "DOWN", size: 1.75, rotation: 0 }),
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

    // other
    otherSymbol = "None",
    oSNum = "",

    // subpanel
    subPanels = [],
    lanePanelSize = 0, // number

    paddingLeft = 0.75,
    paddingRight = 0.75,
    paddingTop = 0.3,
    paddingBottom = 0.3,
  } = {}) {
    this.otherSymbol = otherSymbol;
    this.oSNum = oSNum;
    this.subPanels = subPanels;
    this.paddingLeft = paddingLeft;
    this.paddingRight = paddingRight;
    this.paddingTop = paddingTop;
    this.paddingBottom = paddingBottom;
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
    const newArrow = new StandardArrow({
      ...existingArrow,
    });
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
  "Custom",
];

Sign.prototype.standardArrowJustify = [
  "Left",
  "Center",
  "Right",
  "Space Between",
];
Sign.prototype.exitOnlyJustify = ["Left", "Center", "Right"];

Sign.prototype.otherSymbols = [
  "None",
  "Quebec-Style Exit Marker",
  "Quebec-Left",
];

Sign.prototype.exitOnlyBorderTypes = [
  "Full Black Border",
  "Partial Black Border",
  "White Border",
];

window.Sign = Sign;
