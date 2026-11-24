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

  duplicateExitTabRow(index) {}
}

<<<<<<< HEAD
Panel.prototype.cornerType = ["Sharp", "Round", "Double-Struck"];
Panel.prototype.defaultBorderRadius = 0.75;
=======
Panel.prototype.cornerType = ["Sharp", "Round", "Square"];
Panel.panelAppearance = ["Standard", "Circle Pixels", "Square Pixels"];
>>>>>>> 6e2e4cb4162eb25e1ab93928a13578fc02c90856

window.Panel = Panel;
