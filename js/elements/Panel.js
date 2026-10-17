class Panel {
  constructor({
    sign,
    color = "Green",
    exitTabs = [],
    corner = "Sharp",
    borderRadius = 0.75,
  } = {}) {
    this.color = color;
    this.corner = corner;
    this.sign = sign;
    this.exitTabs = exitTabs;
    this.borderRadius = borderRadius;
  }

  newExitTabRow() {
    const exitTab = new ExitTabRow();
    exitTab.newExitTab("right");
    this.exitTabs.push(exitTab);
  }

  newExitTab(exitTabRow, alignment) {
    return exitTabRow.newExitTab(alignment || "right");
  }

  deleteExitTab(exitTabRow, index) {
    exitTabRow.deleteExitTab(index);
  }

  deleteExitTabRow(index) {
    const exitTab = this.exitTabs[index];
    if (!exitTab) {
      return;
    }

    this.exitTabs.splice(index, 1);
  }

  duplicateExitTabRow(index) {}
}

Panel.prototype.cornerType = ["Sharp", "Round"];
Panel.prototype.defaultBorderRadius = 0.75;

window.Panel = Panel;
