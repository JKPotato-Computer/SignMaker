class Shield {
  constructor({
    shieldType = "preset",
    shieldName = "Interstate",
    shieldValue = "I",
    variant = "Auto",

    shieldBacks = false,
    shieldBackColor = "Black",
    shieldBackRadius = 4,

    imageType = "",
    imageData = "",

    banners = {},
    bannerSettings = {
      top: {
        alignment: "start",
        gap: 0,
      },
      left: {
        alignment: "start",
        gap: 0,
        inset: 0.5,
      },
      right: {
        alignment: "start",
        gap: 0,
        inset: 0.5,
      },
      bottom: {
        alignment: "end",
        gap: 0,
      },
    },
    group = 0,

    designation = "",
    routeNumber = "1",

    scale = 100,
    horizMargin = 8,
    vertMargin = 8,

    customShields = {
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
    },
  } = {}) {
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
  constructor({
    textContent = "NORTH",
    firstLetterSize = 125,
    fontSize = 1.3,
    backgroundColor = "Inherit",
    horizontalPadding = 0,
    verticalPadding = 0,
    horizontalMargin = 0,
    verticalMargin = 0,
    borderRadius = 4,
    fontFamily = "Clearview 5WR",
  } = {}) {
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

    bannerElmt.textContent = this.textContent;
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
    NR: { type: "shield", name: "National Route (NR)", variants: ["2 Digit"] },
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
        name: "Alberta (alt)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      ABTC: {
        type: "shield",
        name: "Alberta Trunk",
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
        name: "British Columbia Trunk",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      BCYH: {
        type: "shield",
        name: "British Columbia Yellowhead",
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
        name: "Manitoba (alt)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      MBTC: {
        type: "shield",
        name: "Manitoba Trunk",
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
        name: "New Brunswick Connector",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      NBLOCAL: {
        type: "shield",
        name: "New Brunswick Local",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      NBTC: {
        type: "shield",
        name: "New Brunswick Trunk",
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
        name: "Newfoundland and Labrador Trunk",
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
        name: "Nova Scotia Connector",
        variants: ["2 Digit"],
      },
      NSTC: {
        type: "shield",
        name: "Nova Scotia Trunk",
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
        name: "Ontario (alt)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      ON3: {
        type: "shield",
        name: "Ontario (third)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      ONTC: {
        type: "shield",
        name: "Ontario Trunk",
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
        name: "Quebec",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      QC2: {
        type: "shield",
        name: "Quebec (alt)",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      QCTC: {
        type: "shield",
        name: "Quebec Trunk",
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
        name: "Saskatchewan Trunk",
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
        name: "Arizona State Route",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      AZLOOP: {
        type: "shield",
        name: "Arizona Loop",
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
      FL_TURNPIKE_TOLL: {
        type: "shield",
        name: "Florida's Turnpike Toll",
        variants: [],
      },
      FLCFXToll: {
        type: "shield",
        name: "Florida CFX Toll",
        variants: ["Current", "Old"],
      },
      FLToll: {
        type: "shield",
        name: "Florida Toll",
        variants: ["Current", "Old"],
      },
      FLTP: { type: "shield", name: "Florida's Turnpike", variants: [] },
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
        name: "Georgia Alternate",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      GABYP: {
        type: "shield",
        name: "Georgia Bypass",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      GACONN: {
        type: "shield",
        name: "Georgia Connector",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      GALOOP: {
        type: "shield",
        name: "Georgia Loop",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      GASPUR: {
        type: "shield",
        name: "Georgia Spur",
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
      "I-BL": {
        type: "shield",
        name: "Interstate Business Loop",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      "I-BS": {
        type: "shield",
        name: "Interstate Business Spur",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      "I-BUS": {
        type: "shield",
        name: "Interstate Business",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      "I-DL": {
        type: "shield",
        name: "Interstate Directional Loop",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      "I-DS": {
        type: "shield",
        name: "Interstate Directional Spur",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      "I-F": {
        type: "shield",
        name: "Interstate Future",
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
      LA: { type: "shield", name: "Louisiana", variants: ["3 Digit"] },
      KYAA: {
        type: "shield",
        name: "Kentucky Appalachian Access",
        variants: [],
        extension: ".png",
      },
      KYAU: {
        type: "shield",
        name: "Kentucky Audubon",
        variants: [],
        extension: ".png",
      },
      KYBG: {
        type: "shield",
        name: "Kentucky Bluegrass",
        variants: [],
        extension: ".png",
      },
      KYCM: {
        type: "shield",
        name: "Kentucky Cumberland",
        variants: [],
        extension: ".png",
      },
      KYHR: {
        type: "shield",
        name: "Kentucky Hal Rogers",
        variants: [],
        extension: ".png",
      },
      KYMT: {
        type: "shield",
        name: "Kentucky Mountain Parkway",
        variants: [],
        extension: ".png",
      },
      KYPR: {
        type: "shield",
        name: "Kentucky Purchase Parkway",
        variants: [],
        extension: ".png",
      },
      KYPU: {
        type: "shield",
        name: "Kentucky Parkway",
        variants: [],
        extension: ".png",
      },
      KYWK: {
        type: "shield",
        name: "Kentucky Western Kentucky Parkway",
        variants: [],
        extension: ".png",
      },
      KYWN: {
        type: "shield",
        name: "Kentucky William H. Natcher Parkway",
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
        name: "Minnesota Business",
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
      NELINK: { type: "shield", name: "Nebraska Link", variants: ["2 Digit"] },
      NESPUR: { type: "shield", name: "Nebraska Spur", variants: ["2 Digit"] },
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
      B: { type: "shield", name: "B", variants: [], extension: ".png" },
      BMP: { type: "shield", name: "BMP", variants: [], extension: ".png" },
      BP: { type: "shield", name: "BP", variants: [], extension: ".png" },
      BR: { type: "shield", name: "BR", variants: [], extension: ".png" },
      BRP: { type: "shield", name: "BRP", variants: [], extension: ".png" },
      CCP: { type: "shield", name: "CCP", variants: [], extension: ".png" },
      CI: { type: "shield", name: "CI", variants: [], extension: ".png" },
      FDR: { type: "shield", name: "FDR", variants: [], extension: ".png" },
      GCP: { type: "shield", name: "GCP", variants: [], extension: ".png" },
      H: { type: "shield", name: "H", variants: [], extension: ".png" },
      HH: { type: "shield", name: "HH", variants: [], extension: ".png" },
      HR: { type: "shield", name: "HR", variants: [], extension: ".png" },
      HRD: { type: "shield", name: "HRD", variants: [], extension: ".png" },
      HRP: { type: "shield", name: "HRP", variants: [], extension: ".png" },
      JR: { type: "shield", name: "JR", variants: [], extension: ".png" },
      KWV: { type: "shield", name: "KWV", variants: [], extension: ".png" },
      LOSP: { type: "shield", name: "LOSP", variants: [], extension: ".png" },
      M: { type: "shield", name: "M", variants: [], extension: ".png" },
      MP: { type: "shield", name: "MP", variants: [], extension: ".png" },
      N: { type: "shield", name: "N", variants: [], extension: ".png" },
      NSP: { type: "shield", name: "NSP", variants: [], extension: ".png" },
      O: { type: "shield", name: "O", variants: [], extension: ".png" },
      Pe: { type: "shield", name: "Pe", variants: [], extension: ".png" },
      PIP: { type: "shield", name: "PIP", variants: [], extension: ".png" },
      RM: { type: "shield", name: "RM", variants: [], extension: ".png" },
      SA: { type: "shield", name: "SA", variants: [], extension: ".png" },
      SBP: { type: "shield", name: "SBP", variants: [], extension: ".png" },
      SM: { type: "shield", name: "SM", variants: [], extension: ".png" },
      SMP: { type: "shield", name: "SMP", variants: [], extension: ".png" },
      SO: { type: "shield", name: "SO", variants: [], extension: ".png" },
      NYST: {
        type: "shield",
        name: "New York State Thruway",
        variants: [],
        extension: ".png",
      },
      TSP: { type: "shield", name: "TSP", variants: [], extension: ".png" },
      W: { type: "shield", name: "W", variants: [], extension: ".png" },
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
        name: "Oklahoma CH Route",
        variants: [],
        extension: ".png",
      },
      OKCR: {
        type: "shield",
        name: "Oklahoma CR Route",
        variants: [],
        extension: ".png",
      },
      OKHB: {
        type: "shield",
        name: "Oklahoma HB Route",
        variants: [],
        extension: ".png",
      },
      OKIN: {
        type: "shield",
        name: "Oklahoma IN Route",
        variants: [],
        extension: ".png",
      },
      OKKC: {
        type: "shield",
        name: "Oklahoma KC Route",
        variants: [],
        extension: ".png",
      },
      OKKL: {
        type: "shield",
        name: "Oklahoma KL Route",
        variants: [],
        extension: ".png",
      },
      OKMS: {
        type: "shield",
        name: "Oklahoma MS Route",
        variants: [],
        extension: ".png",
      },
      OKTU: {
        type: "shield",
        name: "Oklahoma TU Route",
        variants: [],
        extension: ".png",
      },
      OKWR: {
        type: "shield",
        name: "Oklahoma WR Route",
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
        name: "Texas Beltway",
        variants: ["2 Digit"],
      },
      TXEXPRESS: {
        type: "shield",
        name: "Texas Express",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      TXFM: {
        type: "shield",
        name: "Texas FM",
        variants: ["2 Digit", "3 Digit", "4 Digit"],
        supportsAuto: true,
      },
      TXLOOP: {
        type: "shield",
        name: "Texas Loop",
        variants: ["2 Digit", "3 Digit", "4 Digit"],
        supportsAuto: true,
      },
      TXPARK: {
        type: "shield",
        name: "Texas Park",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      TXRM: {
        type: "shield",
        name: "Texas RM",
        variants: ["2 Digit", "3 Digit", "4 Digit"],
        supportsAuto: true,
      },
      TXSPUR: {
        type: "shield",
        name: "Texas Spur",
        variants: ["2 Digit", "3 Digit", "4 Digit"],
        supportsAuto: true,
      },
      TXTOLL: {
        type: "shield",
        name: "Texas Toll",
        variants: ["2 Digit", "3 Digit"],
        supportsAuto: true,
      },
      TXTollCTRMA: { type: "shield", name: "Texas CTRMA Toll", variants: [] },
      TXTollNTTA: { type: "shield", name: "Texas NTTA Toll", variants: [] },
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
        name: "US Route California Alternate",
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
      name: "El Paso",
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
      name: "Montana (2nd)",
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
      name: "Recreational",
      variants: ["2 Digit", "3 Digit"],
      supportsAuto: true,
    },
    rec2: {
      type: "shield",
      name: "Recreational (2nd)",
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
      name: "Tennessee (2nd)",
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
      name: "Virginia (2nd)",
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
      name: "Vermont (2nd)",
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
};

Shield.prototype.bannerTypes = [
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
