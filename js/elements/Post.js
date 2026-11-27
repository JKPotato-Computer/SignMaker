class Post {
  constructor(options = {}) {
    const {
      polePosition,
      color,
      cornerRadius,
      showPost,
      offsetPost,
      variant,
      panelSpacing,
      thickness,
      spacing,
      mutcdVariant,
      userColors,
      postPanelSpacing,
      alignPanels,
    } = MUTCDVariants.get("Post", options);
    this.polePosition = polePosition;
    this.color = color;
    this.cornerRadius = cornerRadius;
    this.showPost = true;
    this.offsetPost = offsetPost;
    this.variant = variant;
    this.panelSpacing = panelSpacing;
    this.thickness = thickness;
    this.spacing = spacing;
    this.mutcdVariant = mutcdVariant;
    this.userColors = userColors;
    this.postPanelSpacing = postPanelSpacing;
    this.alignPanels = alignPanels;

    if (Post.polePositions.includes(polePosition)) {
      this.polePosition = polePosition;
    } else {
      this.polePosition = Post.polePositions[0];
    }

    if (Post.colors.includes(color)) {
      this.color = color;
    } else {
      this.color = Post.colors[0];
    }

    this.thickness = thickness;

    this.panels = [];
    this.panelSpacing = panelSpacing;
    this.cornerRadius = cornerRadius;
    this.showPost = showPost;
    this.offsetPost = offsetPost;

    if (Post.postVariants.includes(variant)) {
      this.variant = variant;
    } else {
      this.variant = "Standard";
    }

    this.spacing = spacing || 1;
  }

  newPanel(panelGroupIndex = this.panels.length - 1) {
    const newSign = new Sign();
    newSign.newSubPanel();

    const newPanel = new Panel({ sign: newSign });
    if (this.panels.length === 0) {
      this.panels.push([]);
      panelGroupIndex = 0;
    }
    this.panels[panelGroupIndex].push(newPanel);
  }

  duplicatePanel([panelGroupIndex, panelIndex]) {
    const panelGroup = this.panels[panelGroupIndex];
    if (!panelGroup || !panelGroup[panelIndex]) {
      return;
    }

    panelGroup.splice(panelIndex + 1, 0, lib.clone(panelGroup[panelIndex]));
  }

  deletePanel(panelIndex) {
    this.panels[panelIndex[0]].splice(panelIndex[1], 1);
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
      this.offsetPost && this.variant === "Standard" ? "1rem" : "",
    );

    const cornerRadVar = this.cornerRadius;
    const cornerRadVar2 = cornerRadVar * 2;
    postContainerElmt.style.setProperty("--cornerRad", cornerRadVar + "%");
    postContainerElmt.style.setProperty("--cornerRad2", cornerRadVar2 + "%");

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

Post.polePositions = ["Left", "Right", "Overhead"];

Post.colors = ["Silver", "Black", "Brown", "Red", "Blue"];

Post.postVariants = ["Standard", "Curved", "Curved 2", "Rural", "Center"];
Post.alignPanelOptions = ["Start", "Center", "End"];

window.Post = Post;
