class Shield {
  constructor(options = {}) {
    const {
      shieldType,
      shieldName,
      shieldValue,
      variant,
      shieldBacks,
      shieldBackColor,
      shieldBackRadius,
      imageType,
      imageData,
      banners,
      bannerSettings,
      group,
      designation,
      routeNumber,
      scale,
      horizMargin,
      vertMargin,
      customShields,
    } = MUTCDVariants.get("Shield", options);
    // Shield Image
    this.shieldType = shieldType;
    this.shieldName = shieldName;
    this.shieldValue = shieldValue;
    this.variant = variant;
    this.shieldBacks = shieldBacks;
    this.shieldBackColor = shieldBackColor;
    this.shieldBackRadius = shieldBackRadius;
    this.imageType = imageType;
    this.imageData = imageData;
    this.designation = designation;
    this.routeNumber = routeNumber;
    this.scale = scale;

    // Banner
    this.banners = banners;
    this.bannerSettings = bannerSettings;

    // Shield Groups
    this.group = group;

    this.customShields = {
      route_scale: 100,
      route_xOffset: 0,
      route_yOffset: 0,
      route_letterSpacing: 0,
      route_fontFamily: "",
      route_color: "",

      designation_scale: 100,
      designation_xOffset: 0,
      designation_yOffset: 0,
      designation_letterSpacing: 0,
      designation_fontFamily: "",
      designation_color: "",
      ...customShields,
    };

    this.horizMargin = horizMargin;
    this.vertMargin = vertMargin;
  }

  getImageData() {
    if (this.shieldType === "custom" && this.imageData) {
      return this.imageData;
    } else {
      const previewVariant =
        this.variant === "Auto"
          ? Shield.prototype.getPreviewVariant()
          : this.variant;
      return Shield.prototype.getDirectoryFromShield(
        this.shieldValue,
        previewVariant,
      );
    }
  }

  createBannerShieldElement(isGrouped) {
    const bannerShieldContainerElmt = document.createElement("div");
    bannerShieldContainerElmt.className = "bannerShieldContainer";

    for (const bannerAlignment in this.banners) {
      const bannerGroup = this.banners[bannerAlignment];
      const bannerGroupElem = document.createElement("div");
      bannerGroupElem.className =
        "bannerGroupElem " + bannerAlignment.toLowerCase();
      bannerGroupElem.style.setProperty(
        "--bannerJustifyContent",
        this.bannerSettings[bannerAlignment].alignment,
      );
      bannerGroupElem.style.setProperty(
        "--bannerInset",
        this.bannerSettings[bannerAlignment].inset + "rem",
      );
      bannerGroupElem.style.setProperty(
        "--bannerGap",
        this.bannerSettings[bannerAlignment].gap + "rem",
      );

      for (const banner of bannerGroup) {
        bannerGroupElem.appendChild(banner.createElement());
      }

      bannerShieldContainerElmt.appendChild(bannerGroupElem);
    }

    if (isGrouped) {
      const shieldGroup = document.createElement("div");
      shieldGroup.className = "shieldGroupContainer";
      bannerShieldContainerElmt.appendChild(shieldGroup);

      return [bannerShieldContainerElmt, shieldGroup];
    }

    return bannerShieldContainerElmt;
  }

  createElement() {
    const shieldElmt = document.createElement("div");
    shieldElmt.className = "shield";
    shieldElmt.style.setProperty("--shieldScale", this.scale / 100);
    shieldElmt.style.setProperty(
      "--horizShieldMargin",
      this.horizMargin + "px",
    );
    shieldElmt.style.fontSize = this.scale / 100 + "rem";
    shieldElmt.style.setProperty("--vertShieldMargin", this.vertMargin + "px");

    const shieldImgElmt = document.createElement("img");
    shieldImgElmt.className = "shieldImg";

    const routeNumberElmt = document.createElement("span");
    routeNumberElmt.className = "routeNumber";

    routeNumberElmt.style.setProperty(
      "--routeScale",
      this.customShields.route_scale / 100,
    );
    routeNumberElmt.style.setProperty(
      "--routeXOffset",
      this.customShields.route_xOffset + "%",
    );
    routeNumberElmt.style.setProperty(
      "--routeYOffset",
      this.customShields.route_yOffset + "%",
    );

    if (this.customShields.route_color != null) {
      routeNumberElmt.style.color =
        lib.colors[this.customShields.route_color] ||
        this.customShields.route_color.toLowerCase();
    }

    if (this.customShields.route_letterSpacing != 0) {
      routeNumberElmt.style.letterSpacing =
        this.customShields.route_letterSpacing + "px";
    }
    if (this.customShields.route_fontFamily != "") {
      routeNumberElmt.style.fontFamily =
        '"' + this.customShields.route_fontFamily + '"';
    }

    if (this.designation != "") {
      const designationElmt = document.createElement("span");
      designationElmt.className = "designation";
      designationElmt.style.setProperty(
        "--designationScale",
        this.customShields.designation_scale / 100,
      );
      designationElmt.style.setProperty(
        "--designationXOffset",
        this.customShields.designation_xOffset + "%",
      );
      designationElmt.style.setProperty(
        "--designationYOffset",
        this.customShields.designation_yOffset + "%",
      );

      if (this.customShields.designation_color != null) {
        designationElmt.style.color =
          lib.colors[this.customShields.designation_color] ||
          this.customShields.designation_color.toLowerCase();
      }

      if (this.customShields.designation_letterSpacing != 0) {
        designationElmt.style.letterSpacing =
          this.customShields.designation_letterSpacing + "px";
      }
      if (this.customShields.designation_fontFamily != "") {
        designationElmt.style.fontFamily =
          '"' + this.customShields.designation_fontFamily + '"';
      }

      designationElmt.textContent = this.designation;
      shieldElmt.appendChild(designationElmt);
    }
    routeNumberElmt.textContent = this.routeNumber;

    if (this.shieldType == "preset") {
      let renderVariant = this.variant;
      if (this.variant === "Auto") {
        const properties = Shield.prototype.getPropertiesFromName(
          this.shieldValue,
        );
        const digitVariants = properties.variants
          .filter((variant) => variant.endsWith(" Digit"))
          .map((variant) => parseInt(variant.match(/^(\d+) Digit$/)[1], 10))
          .sort((a, b) => a - b);
        const digitCount =
          digitVariants.find((digits) => digits >= this.routeNumber.length) ||
          digitVariants[digitVariants.length - 1];
        renderVariant = digitCount + " Digit";
      }
      const classMap = {
        1: "One",
        2: "Two",
        3: "Three",
        4: "Four",
        " ": "",
        "": "",
      };

      shieldElmt.classList.add(this.shieldValue);

      let classVal = renderVariant.replace(
        / |\d/g,
        (matched) => classMap[matched],
      );
      if (classVal != "") {
        shieldElmt.classList.add(classVal);
      }
      shieldImgElmt.src = Shield.prototype.getDirectoryFromShield(
        this.shieldValue,
        renderVariant,
      );
    } else {
      shieldImgElmt.src = this.imageData;
    }

    if (this.shieldBacks) {
      shieldImgElmt.classList.add("shieldBacks");
      shieldImgElmt.style.setProperty(
        "--sbColor",
        (
          lib.colors[this.shieldBackColor] || this.shieldBackColor
        ).toLowerCase(),
      );
      shieldImgElmt.style.setProperty(
        "--sbRadius",
        this.shieldBackRadius + "px",
      );
    }

    shieldElmt.appendChild(routeNumberElmt);
    shieldElmt.appendChild(shieldImgElmt);
    return shieldElmt;
  }

  addBanner(alignment) {
    if (this.banners[alignment] == undefined) {
      this.banners[alignment] = [];
    }

    const newBanner = new Banner();
    switch (alignment) {
      case "Top":
      case "Bottom":
        newBanner.verticalMargin = 14;
        break;
      case "Left":
      case "Right":
        newBanner.horizontalMargin = 9;
        break;
      default:
    }

    this.banners[alignment].push(newBanner);
    return newBanner;
  }

  removeBanner(alignment, bannerIndex) {
    if (this.banners[alignment] == undefined) {
      return;
    }

    this.banners[alignment].splice(bannerIndex, 1);

    if (this.banners[alignment].length == 0) {
      delete this.banners[alignment];
    }
  }

  moveBanner(oldAlignment, bannerIndex, newAlignment) {
    if (this.banners[oldAlignment] == undefined) {
      return;
    }

    const banner = this.banners[oldAlignment].splice(bannerIndex, 1)[0];
    if (this.banners[oldAlignment].length == 0) {
      delete this.banners[oldAlignment];
    }

    if (this.banners[newAlignment] == undefined) {
      this.banners[newAlignment] = [];
    }
    this.banners[newAlignment].push(banner);
    return banner;
  }
}

class Banner {
  constructor(options = {}) {
    const {
      textContent,
      firstLetterSize,
      fontSize,
      backgroundColor,
      horizontalPadding,
      verticalPadding,
      horizontalMargin,
      verticalMargin,
      borderRadius,
      fontFamily,
    } = MUTCDVariants.get("Banner", options);
    this.textContent = textContent;
    this.firstLetterSize = firstLetterSize;
    this.fontSize = fontSize;
    this.backgroundColor = backgroundColor;
    this.horizontalPadding = horizontalPadding;
    this.verticalPadding = verticalPadding;
    this.borderRadius = borderRadius;
    this.fontFamily = fontFamily;
    this.horizontalMargin = horizontalMargin;
    this.verticalMargin = verticalMargin;
  }

  createElement() {
    const bannerElmt = document.createElement("div");
    bannerElmt.className = "bannerElmt";
    bannerElmt.style.setProperty(
      "--bgColor",
      this.backgroundColor == "Inherit"
        ? "transparent"
        : (
            lib.colors[this.backgroundColor] || this.backgroundColor
          ).toLowerCase(),
    );
    bannerElmt.style.setProperty("--fontSize", this.fontSize + "rem");
    bannerElmt.style.setProperty(
      "--horizontalPadding",
      this.horizontalPadding + "px",
    );
    bannerElmt.style.setProperty(
      "--verticalPadding",
      this.verticalPadding + "px",
    );
    bannerElmt.style.setProperty("--borderRadius", this.borderRadius + "px");
    bannerElmt.style.setProperty("--fontFamily", '"' + this.fontFamily + '"');
    bannerElmt.style.setProperty(
      "--firstLetterSize",
      this.firstLetterSize / 100,
    );
    bannerElmt.style.setProperty(
      "--horizontalMargin",
      this.horizontalMargin + "px",
    );
    bannerElmt.style.setProperty(
      "--verticalMargin",
      this.verticalMargin + "px",
    );

    if (
      lib.checkForContrast(
        this.backgroundColor == "Inherit"
          ? "transparent"
          : this.backgroundColor.toLowerCase(),
      )
    ) {
      bannerElmt.style.color = "black";
    }

    let modifiedText = this.textContent.replace(/\\n/g, "\n");
    if (modifiedText.split("\n").length == 2) {
      let text1 = modifiedText.split("\n")[0];
      let text2 = modifiedText.split("\n")[1];

      const bannerText1 = document.createElement("span");
      bannerText1.className = "bannerElmt_specialTop";
      bannerText1.textContent = text1;

      const bannerSpecialDivider = document.createElement("div");
      bannerSpecialDivider.className = "bannerElmt_specialDivider";

      const bannerText2 = document.createElement("span");
      bannerText2.className = "bannerElmt_specialBottom";
      bannerText2.textContent = text2;

      bannerElmt.appendChild(bannerText1);
      bannerElmt.appendChild(bannerSpecialDivider);
      bannerElmt.appendChild(bannerText2);
    } else {
      bannerElmt.textContent = modifiedText;
    }
    return bannerElmt;
  }
}

Shield.prototype.getPreviewVariant = () => "2 Digit";

Shield.prototype.getImageData = (shieldData) => {
  if (typeof shieldData === "object") {
    if (shieldData.shieldType === "custom" && shieldData.imageData) {
      return shieldData.imageData;
    } else {
      const previewVariant =
        shieldData.variant === "Auto"
          ? Shield.prototype.getPreviewVariant()
          : shieldData.variant;
      return Shield.prototype.getDirectoryFromShield(
        shieldData.shieldValue,
        previewVariant,
      );
    }
  }
};

Shield.prototype.getDirectoryFromShield = (name, variant) => {
  variant = variant.replace(/\s/g, "");

  let directory = "assets/shields/";
  const search = (dir, str) => {
    for (const category in dir) {
      const cat = dir[category];
      if (cat.type == "category") {
        const catSearch = search(cat, str);
        if (catSearch != null) {
          return category + "/" + catSearch;
        }
      } else if (cat.type == "shield" && category == name) {
        if (cat.variants.length > 0 && variant) {
          str += name + "-" + variant + (cat.extension || ".svg");
        } else {
          str += name + (cat.extension || ".svg");
        }
        return str;
      }
    }
    return null;
  };
  directory += search(Shield.prototype.shieldDirectory, "", "");
  return directory;
};

Shield.prototype.getPropertiesFromName = (name) => {
  const search = (dir, str) => {
    for (const category in dir) {
      const cat = dir[category];
      if (cat.type == "category") {
        const catSearch = search(cat, str);
        if (catSearch != null) {
          return catSearch;
        }
      } else if (cat.type == "shield" && category == name) {
        return cat;
      }
    }
    return null;
  };
  return search(Shield.prototype.shieldDirectory, "", "");
};

Shield.prototype.shieldDirectory = {
  Australia: {
    type: "category",
    ALPHANUM: {
      type: "shield",
      name: "Australian Alphanumeric",
      variants: ["2 Digit", "3 Digit", "4 Digit"],
      supportsAuto: true,
    },
    FNSW: {
      type: "shield",
      name: "New South Wales Freeway",
      variants: ["2 Digit"],
    },
    MR: {
      type: "shield",
      name: "Metropolitan Route",
      variants: ["1 Digit", "2 Digit"],
      supportsAuto: true,
    },
    NAT: {
      type: "shield",
      name: "National Route",
      variants: ["1 Digit", "2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    NR: {
      type: "shield",
      name: "National Route (NR)",
      variants: ["1 Digit", "2 Digit"],
    },
    SR: { type: "shield", name: "State Route (SR)", variants: ["2 Digit"] },
    TD: {
      type: "shield",
      name: "Tourist Drive",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    TOLLBLUE: {
      type: "shield",
      name: "Australian Toll",
      variants: ["2 Digit", "3 Digit", "4 Digit"],
      supportsAuto: true,
    },
  },
  Canada: {
    type: "category",
    Alberta: {
      type: "category",
      AB: {
        type: "shield",
        name: "Alberta",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      AB2: {
        type: "shield",
        name: "Alberta (Local)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      ABTC: {
        type: "shield",
        name: "Alberta (Trans-Canada)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    "British Columbia": {
      type: "category",
      BC: {
        type: "shield",
        name: "British Columbia",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      BCTC: {
        type: "shield",
        name: "British Columbia (Trans-Canada)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      BCYH: {
        type: "shield",
        name: "British Columbia (Yellowhead)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    Manitoba: {
      type: "category",
      MB: {
        type: "shield",
        name: "Manitoba",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      MB2: {
        type: "shield",
        name: "Manitoba (Secondary)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      MBTC: {
        type: "shield",
        name: "Manitoba (Trans-Canada)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    "New Brunswick": {
      type: "category",
      NB: {
        type: "shield",
        name: "New Brunswick",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      NBCONN: {
        type: "shield",
        name: "New Brunswick (Connector)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      NBLOCAL: {
        type: "shield",
        name: "New Brunswick (Local)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      NBTC: {
        type: "shield",
        name: "New Brunswick (Trans-Canada)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    "Newfoundland and Labrador": {
      type: "category",
      NL: {
        type: "shield",
        name: "Newfoundland and Labrador",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      NLTC: {
        type: "shield",
        name: "Newfoundland and Labrador (Trans-Canada)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    "Nova Scotia": {
      type: "category",
      NS: {
        type: "shield",
        name: "Nova Scotia",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      NSCONN: {
        type: "shield",
        name: "Nova Scotia (Connector)",
        variants: ["2 Digit"],
      },
      NSTC: {
        type: "shield",
        name: "Nova Scotia (Trans-Canada)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    Ontario: {
      type: "category",
      ON: {
        type: "shield",
        name: "Ontario",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      ON2: {
        type: "shield",
        name: "Ontario (Secondary)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      ON3: {
        type: "shield",
        name: "Ontario (Regional)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      ONTC: {
        type: "shield",
        name: "Ontario (Trans-Canada)",
        variants: ["2 Digit", "3 Digit", "COR", "GBR", "LSR", "NOR", "OVR"],
        supportsAuto: true,
      },
      "ON-DVP": {
        type: "shield",
        name: "Don Valley Parkway",
        variants: [],
        extension: ".png",
      },
      "ON-GAR": {
        type: "shield",
        name: "Gardiner Expressway",
        variants: [],
        extension: ".png",
      },
    },
    "Prince Edward Island": {
      type: "category",
      PEI: {
        type: "shield",
        name: "Prince Edward Island",
        variants: ["2 Digit"],
      },
    },
    Quebec: {
      type: "category",
      QC: {
        type: "shield",
        name: "Quebec (Autoroute)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      QC2: {
        type: "shield",
        name: "Quebec (Provincial)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      QCTC: {
        type: "shield",
        name: "Quebec (Trans-Canada)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    Saskatchewan: {
      type: "category",
      SK: {
        type: "shield",
        name: "Saskatchewan",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      SK2: {
        type: "shield",
        name: "Saskatchewan (alt)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      SKTC: {
        type: "shield",
        name: "Saskatchewan (Trans-Canada)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    TCH: {
      type: "shield",
      name: "Trans-Canada Highway",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    TCHLeaf: {
      type: "shield",
      name: "Trans-Canada Highway (leaf)",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
  },
  "New Zealand": {
    type: "category",
    SH: {
      type: "shield",
      name: "State Highway",
      variants: ["1 Digit", "2 Digit"],
      supportsAuto: true,
    },
  },
  "United States": {
    type: "category",
    Arizona: {
      type: "category",
      AZ: {
        type: "shield",
        name: "Arizona",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      AZLOOP: {
        type: "shield",
        name: "Arizona (Loop)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    Florida: {
      type: "category",
      FL: {
        type: "shield",
        name: "Florida",
        variants: ["2 Digit", "3 Digit", "No Outline"],
        supportsAuto: true,
      },
      FLToll: {
        type: "shield",
        name: "Florida (Toll)",
        variants: ["Current", "Old"],
      },
      FLCFXToll: {
        type: "shield",
        name: "Florida (CFX Toll)",
        variants: ["Current", "Old"],
      },
      FLTP: { type: "shield", name: "Florida's Turnpike", variants: [] },
      FL_TURNPIKE_TOLL: {
        type: "shield",
        name: "Florida's Turnpike (Toll)",
        variants: [],
      },
    },
    Georgia: {
      type: "category",
      GA: {
        type: "shield",
        name: "Georgia",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      GAALT: {
        type: "shield",
        name: "Georgia (Alternate)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      GABYP: {
        type: "shield",
        name: "Georgia (Bypass)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      GACONN: {
        type: "shield",
        name: "Georgia (Connector)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      GALOOP: {
        type: "shield",
        name: "Georgia (Loop)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      GASPUR: {
        type: "shield",
        name: "Georgia (Spur)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    Indiana: {
      type: "category",
      IN: {
        type: "shield",
        name: "Indiana",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      INTR: {
        type: "shield",
        name: "Indiana Toll Road",
        variants: [],
        extension: ".png",
      },
    },
    "Interstate Routes": {
      type: "category",
      I: {
        type: "shield",
        name: "Interstate",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      "I-F": {
        type: "shield",
        name: "Interstate (Future)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      "I-BUS": {
        type: "shield",
        name: "Interstate (Business)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      "I-BL": {
        type: "shield",
        name: "Interstate (Business Loop)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      "I-BS": {
        type: "shield",
        name: "Interstate (Business Spur)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      "I-DL": {
        type: "shield",
        name: "Interstate (Downtown Loop)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      "I-DS": {
        type: "shield",
        name: "Interstate (Downtown Spur)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    Kansas: {
      type: "category",
      KS: {
        type: "shield",
        name: "Kansas",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      KSTP: {
        type: "shield",
        name: "Kansas Turnpike",
        variants: [],
        extension: ".png",
      },
    },
    Kentucky: {
      type: "category",
      KY: {
        type: "shield",
        name: "Kentucky",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      KYAA: {
        type: "shield",
        name: "Kentucky (AA Highway)",
        variants: [],
        extension: ".png",
      },
      KYAU: {
        type: "shield",
        name: "Kentucky (Audubon Parkway)",
        variants: [],
        extension: ".png",
      },
      KYBG: {
        type: "shield",
        name: "Kentucky (Bluegrass Parkway)",
        variants: [],
        extension: ".png",
      },
      KYCM: {
        type: "shield",
        name: "Kentucky (Cumberland Parkway)",
        variants: [],
        extension: ".png",
      },
      KYHR: {
        type: "shield",
        name: "Kentucky (Hal Rogers Parkway)",
        variants: [],
        extension: ".png",
      },
      KYMT: {
        type: "shield",
        name: "Kentucky (Mountain Parkway)",
        variants: [],
        extension: ".png",
      },
      KYPR: {
        type: "shield",
        name: "Kentucky (Pennyrile Parkway)",
        variants: [],
        extension: ".png",
      },
      KYPU: {
        type: "shield",
        name: "Kentucky (Purchase Parkway)",
        variants: [],
        extension: ".png",
      },
      KYWK: {
        type: "shield",
        name: "Kentucky (Western Kentucky Parkway)",
        variants: [],
        extension: ".png",
      },
      KYWN: {
        type: "shield",
        name: "Kentucky (William H. Natcher Parkway)",
        variants: [],
        extension: ".png",
      },
    },
    Massachusetts: {
      type: "category",
      MA: {
        type: "shield",
        name: "Massachusetts",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      MATP: {
        type: "shield",
        name: "Massachusetts Turnpike",
        variants: [],
        extension: ".png",
      },
    },
    Maine: {
      type: "category",
      ME: {
        type: "shield",
        name: "Maine",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      METP: {
        type: "shield",
        name: "Maine Turnpike",
        variants: [],
        extension: ".png",
      },
    },
    Minnesota: {
      type: "category",
      MN: { type: "shield", name: "Minnesota", variants: ["2 Digit"] },
      MNBUS: {
        type: "shield",
        name: "Minnesota (Business)",
        variants: ["2 Digit"],
      },
    },
    Nebraska: {
      type: "category",
      NE: {
        type: "shield",
        name: "Nebraska",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      NELINK: {
        type: "shield",
        name: "Nebraska (Link)",
        variants: ["2 Digit"],
      },
      NESPUR: {
        type: "shield",
        name: "Nebraska (Spur)",
        variants: ["2 Digit"],
      },
    },
    "New Jersey": {
      type: "category",
      NJ: {
        type: "shield",
        name: "New Jersey",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      GSP: {
        type: "shield",
        name: "Garden State Parkway",
        variants: [],
        extension: ".png",
      },
      NJTP: {
        type: "shield",
        name: "New Jersey Turnpike",
        variants: [],
        extension: ".png",
      },
      PIP: {
        type: "shield",
        name: "Palisades Interstate Parkway",
        variants: [],
        extension: ".png",
      },
    },
    "New York": {
      type: "category",
      NY: {
        type: "shield",
        name: "New York",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      B: {
        type: "shield",
        name: "Bethpage Parkway",
        variants: [],
        extension: ".png",
      },
      BMP: {
        type: "shield",
        name: "Bear Mountain Parkway",
        variants: [],
        extension: ".png",
      },
      BP: {
        type: "shield",
        name: "Belt Parkway",
        variants: [],
        extension: ".png",
      },
      BR: {
        type: "shield",
        name: "Bronx River Parkway",
        variants: [],
        extension: ".png",
      },
      BRP: {
        type: "shield",
        name: "Bronx River Parkway (alt)",
        variants: [],
        extension: ".png",
      },
      CCP: {
        type: "shield",
        name: "Cross County Parkway",
        variants: [],
        extension: ".png",
      },
      CI: {
        type: "shield",
        name: "Cross Island Parkway",
        variants: [],
        extension: ".png",
      },
      FDR: {
        type: "shield",
        name: "FDR Drive",
        variants: [],
        extension: ".png",
      },
      GCP: {
        type: "shield",
        name: "Grand Central Parkway",
        variants: [],
        extension: ".png",
      },
      H: {
        type: "shield",
        name: "Heckscher Parkway",
        variants: [],
        extension: ".png",
      },
      HH: {
        type: "shield",
        name: "Henry Hudson Parkway",
        variants: [],
        extension: ".png",
      },
      HR: {
        type: "shield",
        name: "Hutchinson River Parkway",
        variants: [],
        extension: ".png",
      },
      HRP: {
        type: "shield",
        name: "Hutchinson River Parkway (alt)",
        variants: [],
        extension: ".png",
      },
      HRD: {
        type: "shield",
        name: "Harlem River Drive",
        variants: [],
        extension: ".png",
      },
      JR: {
        type: "shield",
        name: "Jackie Robinson Parkway",
        variants: [],
        extension: ".png",
      },
      KWV: {
        type: "shield",
        name: "Korean War Vets Parkway",
        variants: [],
        extension: ".png",
      },
      LOSP: {
        type: "shield",
        name: "Lake Ontario State Parkway",
        variants: [],
        extension: ".png",
      },
      M: {
        type: "shield",
        name: "Meadowbrook Parkway",
        variants: [],
        extension: ".png",
      },
      MP: {
        type: "shield",
        name: "Mosholu Parkway",
        variants: [],
        extension: ".png",
      },
      N: {
        type: "shield",
        name: "Northern Parkway",
        variants: [],
        extension: ".png",
      },
      NSP: {
        type: "shield",
        name: "Niagra Scenic Parkway",
        variants: [],
        extension: ".png",
      },
      O: {
        type: "shield",
        name: "Ocean Parkway",
        variants: [],
        extension: ".png",
      },
      Pe: {
        type: "shield",
        name: "Pelham Parkway",
        variants: [],
        extension: ".png",
      },
      PIP: {
        type: "shield",
        name: "Palisades Interstate Parkway",
        variants: [],
        extension: ".png",
      },
      RM: {
        type: "shield",
        name: "Robert Moses Causeway",
        variants: [],
        extension: ".png",
      },
      SA: {
        type: "shield",
        name: "Sagtikos Parkway",
        variants: [],
        extension: ".png",
      },
      SBP: {
        type: "shield",
        name: "Sprain Brook Parkway",
        variants: [],
        extension: ".png",
      },
      SM: {
        type: "shield",
        name: "Sunken Meadow Parkway",
        variants: [],
        extension: ".png",
      },
      SMP: {
        type: "shield",
        name: "Saw Mill Parkway",
        variants: [],
        extension: ".png",
      },
      SO: {
        type: "shield",
        name: "Southern Parkway",
        variants: [],
        extension: ".png",
      },
      NYST: {
        type: "shield",
        name: "New York State Thruway",
        variants: [],
        extension: ".png",
      },
      TSP: {
        type: "shield",
        name: "Taconic State Parkway",
        variants: [],
        extension: ".png",
      },
      W: {
        type: "shield",
        name: "Wantigh Parkway",
        variants: [],
        extension: ".png",
      },
    },
    Ohio: {
      type: "category",
      OH: {
        type: "shield",
        name: "Ohio",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      OHTP: {
        type: "shield",
        name: "Ohio Turnpike",
        variants: [],
        extension: ".png",
      },
    },
    Oklahoma: {
      type: "category",
      OK: {
        type: "shield",
        name: "Oklahoma",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      OKCH: {
        type: "shield",
        name: "Cherokee Turnpike",
        variants: [],
        extension: ".png",
      },
      OKCR: {
        type: "shield",
        name: "Creek Turnpike",
        variants: [],
        extension: ".png",
      },
      OKHB: {
        type: "shield",
        name: "H.E. Bailey Turnpike",
        variants: [],
        extension: ".png",
      },
      OKIN: {
        type: "shield",
        name: "Indian Nation Turnpike",
        variants: [],
        extension: ".png",
      },
      OKKC: {
        type: "shield",
        name: "Kickapoo Turnpike",
        variants: [],
        extension: ".png",
      },
      OKKL: {
        type: "shield",
        name: "Kilpatrick Turnpike",
        variants: [],
        extension: ".png",
      },
      OKMS: {
        type: "shield",
        name: "Muskogee Turnpike",
        variants: [],
        extension: ".png",
      },
      OKTU: {
        type: "shield",
        name: "Turner Turnpike",
        variants: [],
        extension: ".png",
      },
      OKWR: {
        type: "shield",
        name: "Will Rogers Turnpike",
        variants: [],
        extension: ".png",
      },
    },
    Pennsylvania: {
      type: "category",
      PA: {
        type: "shield",
        name: "Pennsylvania",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      PATP: {
        type: "shield",
        name: "Pennsylvania Turnpike",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    Texas: {
      type: "category",
      TX: {
        type: "shield",
        name: "Texas",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      TXBELTWAY: {
        type: "shield",
        name: "Texas (Beltway)",
        variants: ["2 Digit"],
      },
      TXEXPRESS: {
        type: "shield",
        name: "Texas (Express)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      TXFM: {
        type: "shield",
        name: "Texas (Farm-to-Market Road)",
        variants: ["2 Digit", "3 Digit", "4 Digit"],
        supportsAuto: true,
      },
      TXLOOP: {
        type: "shield",
        name: "Texas (Loop)",
        variants: ["2 Digit", "3 Digit", "4 Digit"],
        supportsAuto: true,
      },
      TXPARK: {
        type: "shield",
        name: "Texas (Park Road)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      TXRM: {
        type: "shield",
        name: "Texas (Ranch-to-Market Road)",
        variants: ["2 Digit", "3 Digit", "4 Digit"],
        supportsAuto: true,
      },
      TXSPUR: {
        type: "shield",
        name: "Texas (Spur)",
        variants: ["2 Digit", "3 Digit", "4 Digit"],
        supportsAuto: true,
      },
      TXTOLL: {
        type: "shield",
        name: "Texas (Toll)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      TXTollCTRMA: { type: "shield", name: "Texas (CTRMA Toll)", variants: [] },
      TXTollNTTA: { type: "shield", name: "Texas (NTTA Toll)", variants: [] },
      HTR: {
        type: "shield",
        name: "Hardy Toll Road",
        variants: [],
        extension: ".png",
      },
      SHT: {
        type: "shield",
        name: "Sam Houston Tollway",
        variants: [],
        extension: ".png",
      },
      TXTollFBTR: {
        type: "shield",
        name: "Fort Bend Tollway",
        variants: [],
        extension: ".png",
      },
      WPT: {
        type: "shield",
        name: "Westpark Tollway",
        variants: [],
        extension: ".png",
      },
    },
    "US Routes": {
      type: "category",
      US: {
        type: "shield",
        name: "US Route",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      "US-CA": {
        type: "shield",
        name: "US Route (California)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    Wisconsin: {
      type: "category",
      WI: {
        type: "shield",
        name: "Wisconsin State Route",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      WICo: {
        type: "shield",
        name: "Wisconsin County",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },
    AK: {
      type: "shield",
      name: "Alaska",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    AL: {
      type: "shield",
      name: "Alabama",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    AR: {
      type: "shield",
      name: "Arkansas",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    C: {
      type: "shield",
      name: "County",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    CA: {
      type: "shield",
      name: "California",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    cir: {
      type: "shield",
      name: "Circle",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    CO: {
      type: "shield",
      name: "Colorado",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    CT: {
      type: "shield",
      name: "Connecticut",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    DC: {
      type: "shield",
      name: "District of Columbia",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    DE: {
      type: "shield",
      name: "Delaware",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    elp: {
      type: "shield",
      name: "Ellipse",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    HI: {
      type: "shield",
      name: "Hawaii",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    IA: {
      type: "shield",
      name: "Iowa",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    ID: {
      type: "shield",
      name: "Idaho",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    IL: {
      type: "shield",
      name: "Illinois",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    LA: {
      type: "shield",
      name: "Louisiana",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    MD: {
      type: "shield",
      name: "Maryland",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    MI: {
      type: "shield",
      name: "Michigan",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    MO: {
      type: "shield",
      name: "Missouri",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    MS: {
      type: "shield",
      name: "Mississippi",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    MT: {
      type: "shield",
      name: "Montana",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    MT2: {
      type: "shield",
      name: "Montana (secondary)",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    NC: {
      type: "shield",
      name: "North Carolina",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    ND: {
      type: "shield",
      name: "North Dakota",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    NH: {
      type: "shield",
      name: "New Hampshire",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    NM: {
      type: "shield",
      name: "New Mexico",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    NV: {
      type: "shield",
      name: "Nevada",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    OR: {
      type: "shield",
      name: "Oregon",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    rec: {
      type: "shield",
      name: "Rectangle",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    rec2: {
      type: "shield",
      name: "Rectangle (alt)",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    RI: {
      type: "shield",
      name: "Rhode Island",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    SC: {
      type: "shield",
      name: "South Carolina",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    SD: {
      type: "shield",
      name: "South Dakota",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    TN: {
      type: "shield",
      name: "Tennessee",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    TN2: {
      type: "shield",
      name: "Tennessee (secondary)",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    UT: {
      type: "shield",
      name: "Utah",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    VA: {
      type: "shield",
      name: "Virginia",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    VA2: {
      type: "shield",
      name: "Virginia (secondary)",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    VT: {
      type: "shield",
      name: "Vermont",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    VT2: {
      type: "shield",
      name: "Vermont (local)",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    WA: {
      type: "shield",
      name: "Washington",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    WV: {
      type: "shield",
      name: "West Virginia",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    WY: {
      type: "shield",
      name: "Wyoming",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
  },
  Avaris: {
    type: "category",
    Selenitia: {
      type: "category",
      A: {
        type: "shield",
        name: "Arteriell",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      SE: {
        type: "shield",
        name: "Selenitia",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
    },

    Veridia: {
      type: "category",
      Interlink: {
        type: "category",
        "Guide Signs": {
          type: "category",
          ILG: {
            type: "shield",
            name: "Interlink",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILGF: {
            type: "shield",
            name: "Interlink (Future)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILGO: {
            type: "shield",
            name: "Interlink (Historic)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILGH: {
            type: "shield",
            name: "Interlink (Heavy)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILGD: {
            type: "shield",
            name: "Interlink (Detour)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILGL: {
            type: "shield",
            name: "Interlink (Loop)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILGS: {
            type: "shield",
            name: "Interlink (Spur)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILGB: {
            type: "shield",
            name: "Interlink (Business)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILGT: {
            type: "shield",
            name: "Interlink (Toll)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
        },
        Trailblazers: {
          type: "category",
          ILT: {
            type: "shield",
            name: "Interlink",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILTF: {
            type: "shield",
            name: "Interlink (Future)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILTO: {
            type: "shield",
            name: "Interlink (Historic)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILTH: {
            type: "shield",
            name: "Interlink (Heavy)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILTD: {
            type: "shield",
            name: "Interlink (Detour)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILTL: {
            type: "shield",
            name: "Interlink (Loop)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILTS: {
            type: "shield",
            name: "Interlink (Spur)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILTB: {
            type: "shield",
            name: "Interlink (Business)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
          ILTT: {
            type: "shield",
            name: "Interlink (Toll)",
            variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
            supportsAuto: true,
          },
        },
      },
      "V-Route": {
        type: "category",
        V: {
          type: "shield",
          name: "V-Route",
          variants: ["1 Digit", "2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        VRF: {
          type: "shield",
          name: "V-Route (Future)",
          variants: ["1 Digit", "2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        VRO: {
          type: "shield",
          name: "V-Route (Historic)",
          variants: ["1 Digit", "2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        VRH: {
          type: "shield",
          name: "V-Route (Heavy)",
          variants: ["1 Digit", "2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        VRD: {
          type: "shield",
          name: "V-Route (Detour)",
          variants: ["1 Digit", "2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        VRL: {
          type: "shield",
          name: "V-Route (Loop)",
          variants: ["1 Digit", "2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        VRS: {
          type: "shield",
          name: "V-Route (Spur)",
          variants: ["1 Digit", "2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        VRB: {
          type: "shield",
          name: "V-Route (Business)",
          variants: ["2 Digit", "3 Digit"],
          variants: ["1 Digit", "2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        VRT: {
          type: "shield",
          name: "V-Route (Toll)",
          variants: ["1 Digit", "2 Digit", "3 Digit"],
          supportsAuto: true,
        },
      },
      Baland: {
        type: "category",
        BA: {
          type: "shield",
          name: "Baland",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        BAF: {
          type: "shield",
          name: "Baland (Future)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        BAO: {
          type: "shield",
          name: "Baland (Historic)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        BAH: {
          type: "shield",
          name: "Baland (Heavy)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        BAD: {
          type: "shield",
          name: "Baland (Detour)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        BAL: {
          type: "shield",
          name: "Baland (Loop)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        BAS: {
          type: "shield",
          name: "Baland (Spur)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        BATA: {
          type: "shield",
          name: "Baland (Toparchia)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        BAB: {
          type: "shield",
          name: "Baland (Business)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        BAT: {
          type: "shield",
          name: "Baland (Toll)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        BATP: {
          type: "shield",
          name: "Baland Turnpike",
          variants: [],
          supportsAuto: false,
        },
      },
      Chautauqua: {
        type: "category",
        CH: {
          type: "shield",
          name: "Chautauqua",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        CHF: {
          type: "shield",
          name: "Chautauqua (Future)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        CHO: {
          type: "shield",
          name: "Chautauqua (Historic)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        CHH: {
          type: "shield",
          name: "Chautauqua (Heavy)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        CHD: {
          type: "shield",
          name: "Chautauqua (Detour)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        CHL: {
          type: "shield",
          name: "Chautauqua (Loop)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        CHS: {
          type: "shield",
          name: "Chautauqua (Spur)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        CHTA: {
          type: "shield",
          name: "Chautauqua (Toparchia)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        CHP: {
          type: "shield",
          name: "Chautauqua (Park)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        CHB: {
          type: "shield",
          name: "Chautauqua (Business)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        CHT: {
          type: "shield",
          name: "Chautauqua (Toll)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
      },
      Desicalia: {
        type: "category",
        DS: {
          type: "shield",
          name: "Desicalia",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        DSF: {
          type: "shield",
          name: "Desicalia (Future)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        DSO: {
          type: "shield",
          name: "Desicalia (Historic)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        DSH: {
          type: "shield",
          name: "Desicalia (Heavy)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        DSD: {
          type: "shield",
          name: "Desicalia (Detour)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        DSL: {
          type: "shield",
          name: "Desicalia (Loop)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        DSS: {
          type: "shield",
          name: "Desicalia (Spur)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        DSB: {
          type: "shield",
          name: "Desicalia (Business)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        DST: {
          type: "shield",
          name: "Desicalia (Toll)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
      },
      Leoria: {
        type: "category",
        LE: {
          type: "shield",
          name: "Leoria",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        LEF: {
          type: "shield",
          name: "Leoria (Future)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        LEO: {
          type: "shield",
          name: "Leoria (Historic)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        LEH: {
          type: "shield",
          name: "Leoria (Heavy)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        LED: {
          type: "shield",
          name: "Leoria (Detour)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        LEL: {
          type: "shield",
          name: "Leoria (Loop)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        LES: {
          type: "shield",
          name: "Leoria (Spur)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        LETA: {
          type: "shield",
          name: "Leoria (Spur)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        LEB: {
          type: "shield",
          name: "Leoria (Business)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        LET: {
          type: "shield",
          name: "Leoria (Toll)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
      },
      "Palo Duro": {
        type: "category",
        PD: {
          type: "shield",
          name: "Palo Duro",
          variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
          supportsAuto: true,
        },
        PDF: {
          type: "shield",
          name: "Palo Duro (Future)",
          variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
          supportsAuto: true,
        },
        PDO: {
          type: "shield",
          name: "Palo Duro (Historic)",
          variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
          supportsAuto: true,
        },
        PDH: {
          type: "shield",
          name: "Palo Duro (Heavy)",
          variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
          supportsAuto: true,
        },
        PDD: {
          type: "shield",
          name: "Palo Duro (Detour)",
          variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
          supportsAuto: true,
        },
        PDL: {
          type: "shield",
          name: "Palo Duro (Loop)",
          variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
          supportsAuto: true,
        },
        PLE: {
          type: "shield",
          name: "Palo Duro (Spur)",
          variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
          supportsAuto: true,
        },
        PDTA: {
          type: "shield",
          name: "Palo Duro (Toparchia)",
          variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
          supportsAuto: true,
        },
        PDTA2: {
          type: "shield",
          name: "Palo Duro (Toparchia - Alt)",
          variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
          supportsAuto: true,
        },
        PDB: {
          type: "shield",
          name: "Palo Duro (Business)",
          variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
          supportsAuto: true,
        },
        PDT: {
          type: "shield",
          name: "Palo Duro (Toll)",
          variants: ["1 Digit", "2 Digit", "3 Digit", "4 Digit"],
          supportsAuto: true,
        },
        TSTP: {
          type: "shield",
          name: "Palo Duro (Twin Star Turnpike)",
          variants: [],
          supportsAuto: false,
        },
      },
      Roanoke: {
        type: "category",
        RO: {
          type: "shield",
          name: "Roanoke",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        ROF: {
          type: "shield",
          name: "Roanoke (Future)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        ROO: {
          type: "shield",
          name: "Roanoke (Historic)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        ROH: {
          type: "shield",
          name: "Roanoke (Heavy)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        ROD: {
          type: "shield",
          name: "Roanoke (Detour)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        ROL: {
          type: "shield",
          name: "Roanoke (Loop)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        ROS: {
          type: "shield",
          name: "Roanoke (Spur)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        ROTA: {
          type: "shield",
          name: "Roanoke (Toparchia)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        ROTA2: {
          type: "shield",
          name: "Roanoke (Toparchia Alt)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        ROB: {
          type: "shield",
          name: "Roanoke (Business)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        ROT: {
          type: "shield",
          name: "Roanoke (Toll)",
          variants: ["2 Digit", "3 Digit"],
          supportsAuto: true,
        },
        ROTP: {
          type: "shield",
          name: "Roanoke Turnpike",
          variants: ["Blank", "North", "East", "South", "West"],
          supportsAuto: false,
        },
      },
      "Airport Icons": {
        type: "category",
        VAIRPORT: {
          type: "shield",
          name: "Airport",
          variants: ["Shield"],
          supportsAuto: false,
        },
        VAIRSTRIP: {
          type: "shield",
          name: "Airstrip",
          variants: ["Shield"],
          supportsAuto: false,
        },
      },
    },
  },
};
// SHIELD FORM
Shield.bannerTypes = [
  "None",
  "Arterial",
  "North",
  "East",
  "South",
  "West",
  "Jct",
  "Begin",
  "End",
  "Spur",
  "Alt",
  "Truck",
  "Trunk",
  "Business",
  "Byp",
  "Loop",
  "Express",
  "Local",
  "Inner",
  "Outer",
  "Future",
  "Toll",
  "City",
  "Conn",
  "To",
];

Shield.prototype.bannerPositions = ["Top", "Bottom", "Left", "Right"];
Shield.prototype.bannerAlignments = ["Center", "Start", "End"];

window.Shield = Shield;
window.Banner = Banner;
