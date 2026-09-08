class SubPanels {
  constructor({ laneWidth = 0, blockElements, verticalAlign = "Start" } = {}) {
    if (blockElements) {
      this.blockElements = blockElements;
    } else {
      this.blockElements = new Control();
      this.blockElements.addElement(ControlTextElement, {}, 0, 0);
    }

    this.laneWidth = laneWidth;
    this.verticalAlign = verticalAlign;
  }
}

SubPanels.prototype.verticalAlign = ["Start", "Center", "End"];
