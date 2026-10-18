class SubPanels {
  constructor({
    laneWidth = 0,
    blockElements,
    verticalAlign = "Start",
    dividerHeight = 50,
    dividerHeightUnit = "%",
  } = {}) {
    if (blockElements) {
      this.blockElements = blockElements;
    } else {
      this.blockElements = new Control();
      this.blockElements.addElement(ControlTextElement, {}, 0, 0);
    }

    this.laneWidth = laneWidth;
    this.verticalAlign = verticalAlign;
    this.dividerHeight = dividerHeight;
    this.dividerHeightUnit = dividerHeightUnit;
  }
}

SubPanels.verticalAlignments = ["Start", "Center", "End"];
SubPanels.prototype.dividerHeightUnits = ["%", "rem"];

window.SubPanels = SubPanels;
