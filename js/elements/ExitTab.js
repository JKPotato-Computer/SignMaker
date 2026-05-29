class ExitTab {
  /**
   * Creates a new ExitTab.
   * @param {string} number - Number to display on the exit tab.
   * @param {string} [position=null] - Position to display the exit tab relative to the sign.
   * @param {string} [width=null] - Width of the exit tab (narrow or wide).
   */
  constructor({
    number = null,
    position = null,
    width = null,
    color = null,
    variant = "Default",
    icon = null,
    useTextBasedIcon = false,
    fullBorder = false,
    squareCorners = false,
    topOffset = true,
    showLeft = false,
    borderThickness = 0.2,
    minHeight = 2.25,
    nestedExitTabs = [],
    FHWAFont = false,
    fontSize = 18,
    tollLogoOnly = true,
    tollLogoSquare = false,
    tollLogoSize = null,
  } = {}) {
    this.number = number;
    if (this.positions.includes(position)) {
      this.position = position;
    } else {
      this.position = this.positions[1];
    }
    if (this.widths.includes(width)) {
      this.width = width;
    } else {
      this.width = this.widths[0];
    }
    if (this.colors.includes(color)) {
      this.color = color;
    } else {
      this.color = this.colors[0];
    }

    if (this.variants.includes(variant)) {
      this.variant = variant;
    } else {
      this.variant = this.variants[0];
    }

    this.fullBorder = fullBorder;
    this.squareCorners = squareCorners;
    const parsedBorderThickness =
      typeof borderThickness === "number"
        ? borderThickness
        : parseFloat(borderThickness);
    const fallbackBorderThickness =
      typeof ExitTab.prototype.defaultBorderThickness === "number"
        ? ExitTab.prototype.defaultBorderThickness
        : 0.2;
    this.borderThickness = Number.isFinite(parsedBorderThickness)
      ? Math.max(0, parsedBorderThickness)
      : fallbackBorderThickness;
    this.topOffset = topOffset;
    this.minHeight = minHeight;
    this.nestedExitTabs = nestedExitTabs;
    this.FHWAFont = FHWAFont;
    this.icon = icon;
    this.showLeft = showLeft;
    this.fontSize = fontSize;
    const defaultTollLogoSize =
      typeof ExitTab.prototype.defaultTollLogoSize === "number"
        ? ExitTab.prototype.defaultTollLogoSize
        : 3;
    this.tollLogoOnly = !!tollLogoOnly;
    this.tollLogoSquare = !!tollLogoSquare;
    const parsedTollLogoSize =
      typeof tollLogoSize === "number"
        ? tollLogoSize
        : parseFloat(tollLogoSize);
    this.tollLogoSize =
      Number.isFinite(parsedTollLogoSize) && parsedTollLogoSize > 0
        ? parsedTollLogoSize
        : defaultTollLogoSize;
    if (
      Array.isArray(this.nestedExitTabs) &&
      ExitTab.prototype.maxNested != null &&
      this.nestedExitTabs.length > ExitTab.prototype.maxNested
    ) {
      this.nestedExitTabs = this.nestedExitTabs.slice(
        0,
        ExitTab.prototype.maxNested
      );
    }
  }

  nestExitTab() {
    if (this.nestedExitTabs.length >= ExitTab.prototype.maxNested) {
      return null;
    }
    const exitTab = new ExitTab();
    this.nestedExitTabs.push(exitTab);
    return exitTab;
  }

  deleteNestExitTab(index) {
    this.nestedExitTabs.splice(index, 1);
  }

  duplicateNestExitTab(index) {
    if (this.nestedExitTabs.length >= ExitTab.prototype.maxNested) {
      return null;
    }
    const exisitingTab = this.nestedExitTabs[index];
    if (!exisitingTab) {
      return null;
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
      tollLogoOnly: exisitingTab.tollLogoOnly,
      tollLogoSquare: exisitingTab.tollLogoSquare,
      tollLogoSize: exisitingTab.tollLogoSize,
    });

    this.nestedExitTabs.push(exitTab);
    return exitTab;
  }

  /**
   * Render this exit tab and nested tabs to a container
   * @param {HTMLElement} parentContainer - Parent container to render into
   * @param {Object} options - Rendering options { post, panel, applyHighwayGothicStyling, FHWA_EXIT_TAB_FONT_SCALE }
   */
  renderTab(parentContainer, options = {}) {
    const {
      post = window.post,
      panel,
      applyHighwayGothicStyling,
      FHWA_EXIT_TAB_FONT_SCALE = 1,
    } = options;

    // Create main container for this tab level
    const exitTabCont = document.createElement("div");
    exitTabCont.className = `exitTabContainer ${this.position.toLowerCase()} ${this.width.toLowerCase()}`;
    parentContainer.appendChild(exitTabCont);

    // Render primary tab and nested tabs
    const nestedCount = this.nestedExitTabs.length;

    for (let nestIndex = -1; nestIndex < nestedCount; nestIndex++) {
      const currentTab =
        nestIndex === -1 ? this : this.nestedExitTabs[nestIndex];

      // Check if tab has content
      const hasContent =
        currentTab.number ||
        currentTab.showLeft ||
        currentTab.variant !== "Default";

      const exitTabElmt = document.createElement("div");
      exitTabElmt.className = `exitTab ${currentTab.position.toLowerCase()} ${currentTab.width.toLowerCase()}`;
      if (currentTab.squareCorners) {
        exitTabElmt.className += " squareCorners";
      }

      // Simplify border thickness logic
      const borderThickness = currentTab.borderThickness || 0.2;
      const isBorderless = borderThickness <= 0;
      const borderThicknessRem = borderThickness.toString() + "rem";

      if (isBorderless) {
        exitTabElmt.classList.add("borderless");
      }

      const usesHighwayGothicFont =
        currentTab.FHWAFont || post.fontType === true;

      // Helper: register text styling
      const registerText = (element) => {
        if (!element) return element;
        element.classList.add("exitTabText");
        return element;
      };

      // Helper: render exit number
      const renderNumber = (parentElmt, tabRef) => {
        if (!parentElmt || !tabRef.number) return;

        const normalizedText = String(tabRef.number).replace(/\\n/g, "\n");
        const numberLines = normalizedText.split("\n");

        const renderSegments = (targetElmt, lineText) => {
          if (!targetElmt) return;

          const safeText =
            typeof lineText === "string" ? lineText : String(lineText || "");
          const txtArr = safeText.toUpperCase().split(/(\d+\S*)/);

          const divTextElmt = document.createElement("div");
          registerText(divTextElmt);
          if (usesHighwayGothicFont) {
            divTextElmt.style.setProperty(
              "--exitTabAdditionalOffset",
              "-0.5px"
            );
          }

          const leadingText = txtArr[0] || "";
          divTextElmt.appendChild(
            document.createTextNode(
              leadingText.length > 0
                ? leadingText
                : safeText.length === 0
                ? "\u00a0"
                : ""
            )
          );
          targetElmt.appendChild(divTextElmt);

          if (txtArr.length > 1) {
            divTextElmt.classList.add("exitFormat");
            if (leadingText && leadingText.trim().length > 0) {
              const spacer = document.createElement("span");
              spacer.textContent = " ";
              spacer.classList.add("exitTabTextSpacer");
              registerText(spacer);
              targetElmt.appendChild(spacer);
            }
            const numeral = document.createElement("span");
            numeral.className = "numeral";
            registerText(numeral);
            numeral.appendChild(document.createTextNode(txtArr[1]));
            targetElmt.appendChild(numeral);

            const trailing = txtArr.slice(2).join("");
            if (trailing) {
              const trailingSpan = document.createElement("span");
              trailingSpan.textContent = trailing;
              registerText(trailingSpan);
              targetElmt.appendChild(trailingSpan);
            }

            if (tabRef.topOffset === false) {
              divTextElmt.style.setProperty("--exitTabTextBaseOffset", "0rem");
            }
          }
        };

        if (numberLines.length <= 1) {
          renderSegments(parentElmt, normalizedText);
          return;
        }

        const multiContainer = document.createElement("div");
        multiContainer.className = "exitTabNumberLinesContainer";
        parentElmt.appendChild(multiContainer);

        numberLines.forEach((line) => {
          const lineWrapper = document.createElement("div");
          lineWrapper.className = "exitTabNumberLine";
          multiContainer.appendChild(lineWrapper);
          renderSegments(lineWrapper, line || "");
        });
      };

      // Create holder element
      const exitTabHolderElmt = document.createElement("div");
      exitTabHolderElmt.className = "exitTabHolder";
      exitTabHolderElmt.appendChild(exitTabElmt);
      exitTabCont.appendChild(exitTabHolderElmt);

      // Set color
      if (currentTab.color && currentTab.color !== "Panel Color") {
        exitTabElmt.className += ` ${currentTab.color.toLowerCase()}`;
        exitTabHolderElmt.className += ` ${currentTab.color.toLowerCase()}`;
      } else if (panel) {
        exitTabElmt.className += ` ${panel.color.toLowerCase()}`;
        exitTabHolderElmt.className += ` ${panel.color.toLowerCase()}`;
      }

      // Apply Highway Gothic styling
      if (usesHighwayGothicFont && applyHighwayGothicStyling) {
        applyHighwayGothicStyling(exitTabElmt);
        exitTabElmt.style.setProperty(
          "--fhwaBaselineOffset",
          "calc(var(--fhwaBaselineShift) + 1px)"
        );
        exitTabElmt.style.setProperty("--exitTabNumeralScale", "0.95");
      }

      // Render content based on variant
      if (hasContent) {
        if (currentTab.variant === "Default") {
          if (currentTab.showLeft) {
            const leftElmt = document.createElement("div");
            leftElmt.classList.add("yellowElmt");
            registerText(leftElmt);
            leftElmt.appendChild(document.createTextNode("LEFT"));
            exitTabElmt.appendChild(leftElmt);
            exitTabElmt.style.display = "inline-block";

            if (currentTab.number) {
              leftElmt.style.marginRight = "0.4rem";
            }
          }

          renderNumber(exitTabElmt, currentTab);
        } else if (currentTab.variant === "Toll Logo") {
          exitTabCont.classList.add("tollLogoExitTabContainer");
          exitTabHolderElmt.classList.add("tollLogoExitHolder");

          const tollLogoContainerElmt = document.createElement("div");
          tollLogoContainerElmt.className = "tollLogoLogoWrapper";
          const tollLogoHolderElmt = document.createElement("div");
          tollLogoHolderElmt.className = "tollLogoImageHolder";
          if (currentTab.tollLogoSquare) {
            tollLogoHolderElmt.classList.add("squareIcon");
          }

          const tollLogoSize = parseFloat(currentTab.tollLogoSize) || 3;
          exitTabElmt.style.setProperty(
            "--tollLogoSize",
            tollLogoSize.toString() + "rem"
          );
          tollLogoHolderElmt.style.setProperty(
            "--tollLogoSize",
            tollLogoSize.toString() + "rem"
          );

          const tollLogos =
            typeof TollLogoElement !== "undefined" &&
            TollLogoElement.prototype?.logos
              ? TollLogoElement.prototype.logos
              : null;
          const tollLogoKey =
            tollLogos && currentTab.icon && tollLogos[currentTab.icon]
              ? currentTab.icon
              : tollLogos && TollLogoElement.prototype?.defaultLogo
              ? TollLogoElement.prototype.defaultLogo
              : null;
          const tollLogoDef =
            tollLogos && tollLogoKey ? tollLogos[tollLogoKey] : null;

          if (tollLogoDef) {
            const tollLogoImgElmt = document.createElement("img");
            tollLogoImgElmt.src = tollLogoDef.src;
            tollLogoImgElmt.alt = tollLogoDef.label || "Toll logo";
            tollLogoImgElmt.className = "tollLogoImage";
            tollLogoImgElmt.loading = "lazy";
            tollLogoImgElmt.decoding = "async";
            tollLogoHolderElmt.appendChild(tollLogoImgElmt);
          } else if (currentTab.icon) {
            const fallbackLogoElmt = document.createElement("span");
            fallbackLogoElmt.textContent = currentTab.icon.toUpperCase();
            registerText(fallbackLogoElmt);
            tollLogoHolderElmt.appendChild(fallbackLogoElmt);
          }

          tollLogoContainerElmt.appendChild(tollLogoHolderElmt);
          exitTabElmt.appendChild(tollLogoContainerElmt);
          exitTabElmt.classList.add("tollLogoExitTab");

          if (currentTab.tollLogoOnly) {
            exitTabElmt.classList.add("logoOnly");
            exitTabHolderElmt.classList.add("logoOnly");
            exitTabCont.classList.add("logoOnly");
          } else {
            const tollLogoNumberWrapperElmt = document.createElement("div");
            tollLogoNumberWrapperElmt.className = "tollLogoNumberWrapper";
            renderNumber(tollLogoNumberWrapperElmt, currentTab);
            exitTabElmt.appendChild(tollLogoNumberWrapperElmt);
          }
        } else if (currentTab.variant === "Icon") {
          // Icon variant handling
        } else if (currentTab.variant === "Full Left") {
          exitTabElmt.classList.add("fullLeft");
          const bannerElmt = document.createElement("div");
          bannerElmt.className = "fullLeftBanner";
          registerText(bannerElmt);
          bannerElmt.appendChild(document.createTextNode("LEFT"));
          exitTabElmt.appendChild(bannerElmt);

          const numberWrapperElmt = document.createElement("div");
          numberWrapperElmt.className = "fullLeftNumber";
          exitTabElmt.appendChild(numberWrapperElmt);
          renderNumber(numberWrapperElmt, currentTab);
        } else if (currentTab.variant === "HOV 1") {
          exitTabCont.classList.add("hovExitTabContainer");
          exitTabHolderElmt.classList.add("hovExitTabHolder");
          exitTabElmt.classList.add("hovExitTab");

          const hovIconColumnElmt = document.createElement("div");
          hovIconColumnElmt.className = "hovIconColumn";
          const hovIconImgElmt = document.createElement("img");
          hovIconImgElmt.className = "hovIcon";
          hovIconImgElmt.src = "assets/icons/HOV.png";
          hovIconImgElmt.alt = "HOV symbol";
          hovIconColumnElmt.appendChild(hovIconImgElmt);

          const hovContentColumnElmt = document.createElement("div");
          hovContentColumnElmt.className = "hovContentColumn";

          const hovTextRowElmt = document.createElement("div");
          hovTextRowElmt.className = "hovTextRow";
          const hovTextElmt = document.createElement("span");
          registerText(hovTextElmt);
          const hovExitNumber =
            typeof currentTab.number === "string"
              ? currentTab.number.trim().toUpperCase()
              : "";
          hovTextElmt.textContent = hovExitNumber
            ? `HOV EXIT ${hovExitNumber}`
            : "HOV EXIT";
          hovTextRowElmt.appendChild(hovTextElmt);
          hovContentColumnElmt.appendChild(hovTextRowElmt);

          const hovBottomBarElmt = document.createElement("div");
          hovBottomBarElmt.className = "hovBottomBar";
          hovContentColumnElmt.appendChild(hovBottomBarElmt);

          exitTabElmt.appendChild(hovIconColumnElmt);
          exitTabElmt.appendChild(hovContentColumnElmt);
        } else if (currentTab.variant === "HOV 2") {
          // HOV 2 variant handling
        }

        // Set visibility and borders
        exitTabElmt.style.visibility = "visible";
        exitTabCont.className += " tabVisible";

        const cornerRadius = currentTab.squareCorners ? "0.25rem" : "0.5rem";

        if (currentTab.fullBorder === true) {
          exitTabElmt.style.borderBottomWidth = borderThicknessRem;
          exitTabElmt.style.borderBottomStyle = isBorderless ? "" : "solid";
          exitTabElmt.style.borderRadius = isBorderless ? "0" : cornerRadius;
        } else {
          exitTabElmt.style.borderBottomWidth = "";
          exitTabElmt.style.borderBottomStyle = "";
          exitTabElmt.style.borderRadius = "";
        }

        exitTabElmt.style.borderTopWidth = borderThicknessRem;
        exitTabElmt.style.borderLeftWidth = borderThicknessRem;
        exitTabElmt.style.borderRightWidth = borderThicknessRem;

        // Set font size
        let fontSize = currentTab.fontSize || 0;
        if (typeof fontSize === "string") {
          fontSize = parseFloat(fontSize);
        }
        if (!Number.isFinite(fontSize)) {
          fontSize = 0;
        }
        if (usesHighwayGothicFont) {
          fontSize *= FHWA_EXIT_TAB_FONT_SCALE;
        }
        exitTabElmt.style.fontSize = fontSize.toString() + "px";

        // Set min height
        exitTabElmt.style.minHeight = currentTab.minHeight.toString() + "rem";
        if (currentTab.variant === "Toll Logo" && currentTab.tollLogoOnly) {
          exitTabElmt.style.minHeight = "0";
        }
      }
    }

    // Hide container if no tabs have content (primary or nested)
    const hasAnyContent =
      this.number ||
      this.showLeft ||
      this.variant !== "Default" ||
      this.nestedExitTabs.some(
        (tab) => tab.number || tab.showLeft || tab.variant !== "Default"
      );
    if (!hasAnyContent) {
      exitTabCont.style.display = "none";
    }

    return exitTabCont;
  }
}

ExitTab.prototype.positions = ["Left", "Center", "Right"];
ExitTab.prototype.variants = [
  "Default",
  "Toll Logo",
  "Icon",
  "Full Left",
  "HOV 1",
  "HOV 2",
];
ExitTab.prototype.widths = ["Narrow", "Wide", "Full", "Edge", "Out"];
ExitTab.prototype.defaultBorderThickness = 0.2;
ExitTab.prototype.defaultTollLogoSize = 3;
ExitTab.prototype.colors = (() => {
  const colors = ["Panel Color"];
  if (typeof lib !== "undefined" && lib?.colors) {
    colors.push(...Object.keys(lib.colors));
  } else {
    colors.push(
      "Green",
      "Blue",
      "Brown",
      "Yellow",
      "White",
      "Black",
      "Purple",
      "Orange",
      "Red",
      "Fluorescent Pink",
      "Fluorescent Yellow-Green"
    );
  }
  return colors;
})();
ExitTab.prototype.icons = [
  "Hazardous Materials:HM.png:var(--white):var(--white)",
  "No Hazardous Materials:NO-HM.png:var(--white):var(--white)",
  "Hospital:H.png:var(--blue):var(--white)",
];
ExitTab.prototype.maxNested = 999;
