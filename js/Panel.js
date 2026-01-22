class Panel {
  /**
   * Creates a new Panel consisting of a sign and an exit tab.
   * @param {string} color - Background color of the sign and exit tab.
   * @param {Sign} sign - Sign to make up the panel.
   * @param {String} corner - Choice of Sharp or Rounded Corners on the Panel
   * @param {ExitTab} [exitTab=null] - Optional exit tab to include in the panel.
   */
  constructor(sign, color, exitTabs = [], corner, borderRadius) {
    if (Object.keys(lib.colors).includes(color)) {
      this.color = color;
    } else {
      this.color = "Green";
    }
    if (Object.keys(this.cornerType).includes(corner)) {
      this.corner = corner;
    } else {
      this.corner = this.cornerType[1];
    }

    this.sign = sign;
    this.exitTabs = exitTabs;

    if (typeof borderRadius === "number" && borderRadius >= 0) {
      this.borderRadius = borderRadius;
    } else {
      this.borderRadius = Panel.prototype.defaultBorderRadius;
    }
  }

  newExitTab() {
    const exitTab = new ExitTab();

    this.exitTabs.push(exitTab);
  }

  deleteExitTab(index, secondaryIndex) {
    const exitTab = this.exitTabs[index];
    if (!exitTab) {
      return;
    }

    if (
      typeof secondaryIndex === "number" &&
      secondaryIndex > -1 &&
      exitTab.nestedExitTabs &&
      secondaryIndex < exitTab.nestedExitTabs.length
    ) {
      exitTab.nestedExitTabs.splice(secondaryIndex, 1);
      return;
    }

    this.exitTabs.splice(index, 1);
  }

  duplicateExitTab(index) {
    const exisitingTab = this.exitTabs[index];

    const newNest = [];

    const maxNested =
      typeof ExitTab !== "undefined" && ExitTab.prototype.maxNested != null
        ? ExitTab.prototype.maxNested
        : exisitingTab.nestedExitTabs.length;

    for (const nest of exisitingTab.nestedExitTabs) {
      if (newNest.length >= maxNested) {
        break;
      }
      newNest.push(Object.assign(new ExitTab(), nest));
    }

    const exitTab = new ExitTab({
      number: exisitingTab.number,
      position: exisitingTab.position,
      width: exisitingTab.width,
      color: exisitingTab.color,
      variant: exisitingTab.variant,
      icon: exisitingTab.icon,
      squareCorners: exisitingTab.squareCorners,
      fullBorder: exisitingTab.fullBorder,
      borderThickness: exisitingTab.borderThickness,
      minHeight: exisitingTab.minHeight,
      nestedExitTabs: newNest,
      verticalArrangement: exisitingTab.verticalArrangement,
      caStyle: exisitingTab.caStyle,
    });

    this.exitTabs.push(exitTab);
  }
}

/* vvv DO NOT CHANGE THIS, IDK WHY BUT THE ENTIRE PROGRAM BREAKS WITHOUT THIS LINE vvv */
Panel.prototype.cornerType = ["Sharp", "Round"];
/* ^^^ DO NOT CHANGE THIS, IDK WHY BUT THE ENTIRE PROGRAM BREAKS WITHOUT THIS LINE ^^^ */

Panel.prototype.defaultBorderRadius = 0.75;
