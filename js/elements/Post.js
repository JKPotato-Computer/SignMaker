class Post {
  constructor(
    polePosition,
    lanesWide = 1,
    color = Post.prototype.colors?.[0],
    cornerRadius = 30,
    showPost = true,
    offsetPost = true,
    variant = "Standard",
    panelSpacing = 0,
    thickness = 1,
    spacing = 5,
  ) {
    if (this.polePositions.includes(polePosition)) {
      this.polePosition = polePosition;
    } else {
      this.polePosition = this.polePositions[0];
    }
    if (lanesWide >= 1 && lanesWide <= 6) {
      this.lanesWide = lanesWide;
    } else {
      this.lanesWide = 1;
    }
    const availableColors = Array.isArray(Post.prototype.colors)
      ? Post.prototype.colors
      : ["Silver"];
    if (availableColors.includes(color)) {
      this.color = color;
    } else {
      this.color = availableColors[0];
    }

    this.thickness = thickness;

    this.panels = [];
    this.panelSpacing = panelSpacing;
    this.cornerRadius = cornerRadius;
    this.showPost = showPost;
    this.offsetPost = offsetPost;

    if (this.postVariants.includes(variant)) {
      this.variant = variant;
    } else {
      this.variant = "Standard";
    }

    this.spacing = spacing || 1;
  }

  /**
   * Create a new panel for the post. Add it to the end of the list of existing panels.
   */
  newPanel() {
    const newSign = new Sign();
    newSign.newSubPanel();

    const newPanel = new Panel({ sign: newSign });
    this.panels.push(newPanel);
  }

  /**
   * Duplicate an existing panel. Add it immediately after the panel being duplicated.
   * @param {number} panelIndex - Position of the panel in the array of panels on this post.
   */
  duplicatePanel(panelIndex) {
    const existingPanel = this.panels[panelIndex];
    const newSubPanels = [];
    for (const subPanel of existingPanel.sign.subPanels) {
      newSubPanels.push(Object.assign(new SubPanels(), subPanel));
    }

    const newExitTabs = [];
    const cloneExitTab = (tab) => {
      const clonedTab = Object.assign(new ExitTab(), tab);
      if (Array.isArray(tab?.nestedExitTabs)) {
        clonedTab.nestedExitTabs = tab.nestedExitTabs.map((nested) =>
          cloneExitTab(nested),
        );
      } else {
        clonedTab.nestedExitTabs = [];
      }
      return clonedTab;
    };
    for (const exitTab of existingPanel.exitTabs) {
      newExitTabs.push(cloneExitTab(exitTab));
    }

    const newSign = new Sign({
      shieldPosition: existingPanel.sign.shieldPosition,
      subPanels: newSubPanels,
      sheildBacks: existingPanel.sign.sheildBacks,
      guideArrow: existingPanel.sign.guideArrow,
      guideArrowLanes: existingPanel.sign.guideArrowLanes,
      useCanadianDownArrows: existingPanel.sign.useCanadianDownArrows,
    });
    const newPanel = Object.assign(new Panel(), existingPanel);
    newPanel.sign = newSign;
    newPanel.exitTabs = newExitTabs;
    this.panels.splice(++panelIndex, 0, newPanel);
  }

  /**
   * Delete an existing panel at the requested index.
   * @param {number} panelIndex - Position of the panel in the array of panels on this post to delete.
   */
  deletePanel(panelIndex) {
    this.panels.splice(panelIndex, 1);
  }

  /**
   * Shift the requested panel to the left one position swapping it with that panel to the left.
   * @param {number} panelIndex - Position of the panel in the array of panels on this post to shift left.
   * @return {number} The new index of the shifted panel.
   */
  shiftLeft(panelIndex) {
    // If already at the far left end, return.
    if (panelIndex <= 0) {
      return panelIndex;
    }
    this.panels.splice(
      panelIndex - 1,
      2,
      this.panels[panelIndex],
      this.panels[panelIndex - 1],
    );
    return panelIndex - 1;
  }

  /**
   * Shift the requested panel to the right one position swaping it with that panel to the right.
   * @param {number} panelIndex - Position of the panel in the array of panels on this post to shift right.
   * @return {number} The new index of the shifted panel.
   */
  shiftRight(panelIndex) {
    // If already at the far right end, return.
    if (panelIndex >= this.panels.length - 1) {
      return panelIndex;
    }
    this.panels.splice(
      panelIndex,
      2,
      this.panels[panelIndex + 1],
      this.panels[panelIndex],
    );
    return panelIndex + 1;
  }

  /**
   * Move a panel to a new position within the list.
   * @param {number} fromIndex - Current position of the panel.
   * @param {number} toIndex - Target insertion index (before adjustment for removal).
   * @return {number} The new index of the moved panel.
   */
  movePanel(fromIndex, toIndex) {
    const panelCount = this.panels.length;
    if (panelCount < 2) {
      return fromIndex;
    }

    const clampIndex = (value, max) => Math.max(0, Math.min(value, max));
    const normalizedFrom = clampIndex(fromIndex, panelCount - 1);
    let normalizedTo = clampIndex(toIndex, panelCount);

    if (
      normalizedFrom === normalizedTo ||
      normalizedFrom + 1 === normalizedTo
    ) {
      return normalizedFrom;
    }

    const [panel] = this.panels.splice(normalizedFrom, 1);
    if (!panel) {
      return normalizedFrom;
    }

    if (normalizedTo > normalizedFrom) {
      normalizedTo--;
    }

    this.panels.splice(normalizedTo, 0, panel);
    return normalizedTo;
  }

  renderPost(postContainerElmt, panelContainerElmt, posts) {
    const variantClass = this.variant.replace(/\s+/g, "-");
    postContainerElmt.className = `polePosition${this.polePosition} postColor${this.color} postVariant${variantClass}`;
    postContainerElmt.style.setProperty(
      "--postThickness",
      this.thickness + "rem",
    );
    postContainerElmt.style.setProperty(
      "--postCornerRadius",
      this.cornerRadius + "%",
    );
    postContainerElmt.style.setProperty(
      "--postOffset",
      this.offsetPost ? "1rem" : "",
    );
    // Set curved post specific CSS variables
    const cornerRadVar = this.cornerRadius;
    const cornerRadVar2 = cornerRadVar * 2;
    postContainerElmt.style.setProperty("--cornerRad", cornerRadVar + "%");
    postContainerElmt.style.setProperty("--cornerRad2", cornerRadVar2 + "%");

    // Set spacing multiplier (subtract 1 for CSS transform)
    const spacingMultiplier = (this.spacing || 1) - 1;
    postContainerElmt.style.setProperty(
      "--spacingMultiplier",
      spacingMultiplier.toString(),
    );

    switch (this.polePosition) {
      case "Left":
        posts[0].style.visibility = this.showPost ? "" : "hidden";
        posts[1].style.visibility = "hidden";
        break;
      case "Right":
        posts[0].style.visibility = "hidden";
        posts[1].style.visibility = this.showPost ? "" : "hidden";
        break;
      case "Overhead":
        posts[0].style.visibility = this.showPost ? "" : "hidden";
        posts[1].style.visibility = this.showPost ? "" : "hidden";
        break;
    }

    panelContainerElmt.style.background = this.showPost ? "" : "none";
  }
}

Post.prototype.polePositions = ["Left", "Right", "Overhead"];

Post.prototype.colors = ["Silver", "Black", "Brown", "Red"];

Post.prototype.postVariants = [
  "Standard",
  "Curved",
  "Curved 2",
  "Rural",
  "Center",
];
