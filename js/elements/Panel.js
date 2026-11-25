class Panel {
  constructor(options = {}) {
    const {
      sign,
      color,
      exitTabs,
      corner,
      borderRadius,
      panelAppearance,
      appearanceBorderThickness,
      appearancePadding,
      appearancePixelSize,
    } = MUTCDVariants.get("Panel", options);
    this.color = color;
    this.corner = corner;
    this.sign = sign;
    this.exitTabs = exitTabs;
    this.borderRadius = borderRadius;
    this.panelAppearance = panelAppearance;

    this.appearanceBorderThickness = appearanceBorderThickness;
    this.appearancePadding = appearancePadding;
    this.appearancePixelSize = appearancePixelSize;
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

  duplicateExitTabRow(index) {
    const exitTab = this.exitTabs[index];
    if (!exitTab) {
      return;
    }

    this.exitTabs.splice(index + 1, 0, lib.clone(exitTab));
  }
}

Panel.prototype.cornerType = ["Sharp", "Round", "Square", "Double-Struck"];
Panel.prototype.defaultBorderRadius = 0.75;
Panel.panelAppearance = ["Standard", "Circle Pixels", "Square Pixels"];

window.Panel = Panel;
