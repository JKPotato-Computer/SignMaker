class Shield {
  constructor({
    shieldType = "preset",
    shieldName = "Interstate",
    shieldValue = "I",
    variant = "2 Digit",

    shieldBacks = false,
    shieldBackColor = "Black",
    shieldBackRadius = 4,

    imageType = "",
    imageData = "",

    banners = { top: [new Banner()] },
    group = 0,

    designation = "TEXAS",
    routeNumber = "1",

    scale = 100,

    customShields = {
      route_scale: 100,
      route_xOffset: 0,
      route_yOffset: 0,
      route_fontFamily: "",

      designation_scale: 100,
      designation_xOffset: 0,
      designation_yOffset: 0,
      designation_fontFamily: "",
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

    // Shield Groups
    this.group = group;

    this.customShields = customShields;
  }

  createBannerShieldElement(isGrouped) {
    const bannerShieldContainerElmt = document.createElement("div");
    bannerShieldContainerElmt.className = "bannerShieldContainer";

    for (const bannerAlignment in this.banners) {
      const bannerGroup = this.banners[bannerAlignment];
      const bannerGroupElem = document.createElement("div");
      bannerGroupElem.className =
        "bannerGroupElem " + bannerAlignment.toLowerCase();

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

    const shieldImgElmt = document.createElement("img");
    shieldImgElmt.className = "shieldImg";

    const routeNumberElmt = document.createElement("span");
    routeNumberElmt.className = "routeNumber";

    routeNumberElmt.style.setProperty(
      "--routeScale",
      this.customShields.route_scale / 100
    );
    routeNumberElmt.style.setProperty(
      "--routeXOffset",
      this.customShields.route_xOffset + "%"
    );
    routeNumberElmt.style.setProperty(
      "--routeYOffset",
      this.customShields.route_yOffset + "%"
    );
    if (this.customShields.route_fontFamily != "") {
      routeNumberElmt.style.fontFamily = this.customShields.route_fontFamily;
    }

    if (this.designation != "") {
      const designationElmt = document.createElement("span");
      designationElmt.className = "designation";
      designationElmt.style.setProperty(
        "--designationScale",
        this.customShields.designation_scale / 100
      );
      designationElmt.style.setProperty(
        "--designationXOffset",
        this.customShields.designation_xOffset + "%"
      );
      designationElmt.style.setProperty(
        "--designationYOffset",
        this.customShields.designation_yOffset + "%"
      );
      if (this.customShields.designation_fontFamily != "") {
        designationElmt.style.fontFamily =
          this.customShields.designation_fontFamily;
      }

      designationElmt.textContent = this.designation;
      shieldElmt.appendChild(designationElmt);
    }
    routeNumberElmt.textContent = this.routeNumber;

    if (this.shieldType == "preset") {
      const classMap = {
        1: "One",
        2: "Two",
        3: "Three",
        4: "Four",
        " ": "",
      };

      shieldElmt.classList.add(this.shieldValue);
      shieldElmt.classList.add(
        this.variant.replace(/ |\d/g, (matched) => classMap[matched])
      );
      shieldImgElmt.src = Shield.prototype.getDirectoryFromShield(
        this.shieldValue,
        this.variant
      );
    } else {
      shieldImgElmt.src = this.imageData;
    }

    if (this.shieldBacks) {
      shieldImgElmt.classList.add("shieldBacks");
      shieldImgElmt.style.setProperty(
        "--sbColor",
        (lib.colors[this.backgroundColor] || this.backgroundColor).toLowerCase()
      );
      shieldImgElmt.style.setProperty(
        "--sbRadius",
        this.shieldBackRadius + "px"
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
}

class Banner {
  constructor({
    textContent = "North",
    firstLetterSize = 125,
    fontSize = 1,
    backgroundColor = "Panel Color",
    horizontalPadding = 0,
    verticalPadding = 0,
    horziontalMargin = 0,
    verticalMargin = 0,
    lineHeight = 100,
    borderRadius = 4,
    fontFamily = "Clearview 5WR",
  } = {}) {
    this.textContent = textContent;
    this.firstLetterSize = firstLetterSize;
    this.fontSize = fontSize;
    this.backgroundColor = backgroundColor;
    this.horizontalPadding = horizontalPadding;
    this.verticalPadding = verticalPadding;
    this.lineHeight = lineHeight;
    this.borderRadius = borderRadius;
    this.fontFamily = fontFamily;
    this.horziontalMargin = horziontalMargin;
    this.verticalMargin = verticalMargin;
  }

  createElement() {
    const bannerElmt = document.createElement("div");
    bannerElmt.className = "bannerElmt";
    bannerElmt.style.setProperty(
      "--bgColor",
      this.backgroundColor == "Panel Color"
        ? "transparent"
        : (
            lib.colors[this.backgroundColor] || this.backgroundColor
          ).toLowerCase()
    );
    bannerElmt.style.setProperty("--fontSize", this.fontSize + "rem");
    bannerElmt.style.setProperty(
      "--horizontalPadding",
      this.horizontalPadding + "px"
    );
    bannerElmt.style.setProperty(
      "--verticalPadding",
      this.verticalPadding + "px"
    );
    bannerElmt.style.setProperty("--lineHeight", this.lineHeight + "%");
    bannerElmt.style.setProperty("--borderRadius", this.borderRadius + "px");
    bannerElmt.style.setProperty("--fontFamily", '"' + this.fontFamily + '"');
    bannerElmt.style.setProperty(
      "--firstLetterSize",
      this.firstLetterSize / 100
    );
    bannerElmt.style.setProperty(
      "--horizontalMargin",
      this.horizontalMargin + "px"
    );
    bannerElmt.style.setProperty(
      "--verticalMargin",
      this.verticalMargin + "px"
    );

    bannerElmt.textContent = this.textContent;
    return bannerElmt;
  }
}

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
          str += name + "-" + variant + ".svg";
        } else {
          str += name + ".svg";
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
  "United States": {
    type: "category",
    I: {
      type: "shield",
      name: "Interstate",
      variants: ["2 Digit", "3 Digit"],
    },
    "I-BUS": {
      type: "shield",
      name: "Interstate Business",
      variants: ["2 Digit", "3 Digit"],
    },
    US: {
      type: "shield",
      name: "US Route",
      variants: ["2 Digit", "3 Digit"],
    },
    AL: { type: "shield", name: "Alabama", variants: ["2 Digit", "3 Digit"] },
    AK: { type: "shield", name: "Alaska", variants: ["2 Digit", "3 Digit"] },
    Arizona: {
      type: "category",
      AZ: {
        type: "shield",
        name: "Arizona State Route",
        variants: ["2 Digit", "3 Digit"],
      },
      AZLOOP: {
        type: "shield",
        name: "Arizona Loop",
        variants: ["3 Digit"],
      },
    },
    AR: { type: "shield", name: "Arkansas", variants: ["2 Digit", "3 Digit"] },
    CA: {
      type: "shield",
      name: "California",
      variants: ["2 Digit", "3 Digit"],
    },
    CO: { type: "shield", name: "Colorado", variants: ["2 Digit", "3 Digit"] },
    CT: {
      type: "shield",
      name: "Connecticut",
      variants: ["2 Digit", "3 Digit"],
    },
    DE: { type: "shield", name: "Delaware", variants: ["2 Digit", "3 Digit"] },
    DC: {
      type: "shield",
      name: "District of Columbia",
      variants: ["2 Digit", "3 Digit"],
    },
    Florida: {
      type: "category",
      FL: {
        type: "shield",
        name: "Florida",
        variants: ["2 Digit", "3 Digit", "No Outline"],
      },
      FLTURNPIKE: { type: "shield", name: "Florida's Turnpike", variants: [] },
      FLToll: {
        type: "shield",
        name: "Florida Toll",
        variants: ["Current", "Old"],
      },
      FLCFXToll: {
        type: "shield",
        name: "Florida CFX Toll",
        variants: ["Current", "Old"],
      },
    },
    Georgia: {
      type: "category",
      GA: { type: "shield", name: "Georgia", variants: ["2 Digit", "3 Digit"] },
      GALOOP: {
        type: "shield",
        name: "Georgia Loop",
        variants: ["2 Digit", "3 Digit"],
      },
      GASPUR: {
        type: "shield",
        name: "Georgia Spur",
        variants: ["2 Digit", "3 Digit"],
      },
      GAALT: {
        type: "shield",
        name: "Georgia Alternate",
        variants: ["2 Digit", "3 Digit"],
      },
      GABYP: {
        type: "shield",
        name: "Georgia Bypass",
        variants: ["2 Digit", "3 Digit"],
      },
      GACONN: {
        type: "shield",
        name: "Georgia Connector",
        variants: ["2 Digit", "3 Digit"],
      },
    },
    HI: { type: "shield", name: "Hawaii", variants: ["2 Digit", "3 Digit"] },
    ID: { type: "shield", name: "Idaho", variants: ["2 Digit", "3 Digit"] },
    IL: { type: "shield", name: "Illinois", variants: ["2 Digit", "3 Digit"] },
    IN: { type: "shield", name: "Indiana", variants: ["2 Digit", "3 Digit"] },
    IA: { type: "shield", name: "Iowa", variants: ["2 Digit", "3 Digit"] },
    KS: { type: "shield", name: "Kansas", variants: ["2 Digit", "3 Digit"] },
    KY: { type: "shield", name: "Kentucky", variants: ["2 Digit", "3 Digit"] },
    LA: { type: "shield", name: "Louisiana", variants: ["2 Digit", "3 Digit"] },
    ME: { type: "shield", name: "Maine", variants: ["2 Digit", "3 Digit"] },
    MD: { type: "shield", name: "Maryland", variants: ["2 Digit", "3 Digit"] },
    MA: {
      type: "shield",
      name: "Massachusetts",
      variants: ["2 Digit", "3 Digit"],
    },
    MI: { type: "shield", name: "Michigan", variants: ["2 Digit", "3 Digit"] },
    Minnesota: {
      type: "category",
      MN: { type: "shield", name: "Minnesota", variants: ["2 Digit"] },
      MNBUS: {
        type: "shield",
        name: "Minnesota Business",
        variants: ["2 Digit"],
      },
    },
    MS: {
      type: "shield",
      name: "Mississippi",
      variants: ["2 Digit", "3 Digit"],
    },
    MO: { type: "shield", name: "Missouri", variants: ["2 Digit", "3 Digit"] },
    MT: { type: "shield", name: "Montana", variants: ["2 Digit", "3 Digit"] },
    "MT 2nd": {
      type: "shield",
      name: "Montana (2nd)",
      variants: ["2 Digit", "3 Digit"],
    },
    Nebraska: {
      type: "category",
      NE: {
        type: "shield",
        name: "Nebraska",
        variants: ["2 Digit", "3 Digit"],
      },
      NELINK: {
        type: "shield",
        name: "Nebraska Link",
        variants: ["2 Digit"],
      },
      NESPUR: {
        type: "shield",
        name: "Nebraska Spur",
        variants: ["2 Digit"],
      },
    },
    NV: { type: "shield", name: "Nevada", variants: ["2 Digit", "3 Digit"] },
    NH: {
      type: "shield",
      name: "New Hampshire",
      variants: ["2 Digit", "3 Digit"],
    },
    NJ: {
      type: "shield",
      name: "New Jersey",
      variants: ["2 Digit", "3 Digit"],
    },
    NM: {
      type: "shield",
      name: "New Mexico",
      variants: ["2 Digit", "3 Digit"],
    },
    NY: { type: "shield", name: "New York", variants: ["2 Digit", "3 Digit"] },
    NC: {
      type: "shield",
      name: "North Carolina",
      variants: ["2 Digit", "3 Digit"],
    },
    ND: {
      type: "shield",
      name: "North Dakota",
      variants: ["2 Digit", "3 Digit"],
    },
    OH: { type: "shield", name: "Ohio", variants: ["2 Digit", "3 Digit"] },
    OK: { type: "shield", name: "Oklahoma", variants: ["2 Digit", "3 Digit"] },
    OR: { type: "shield", name: "Oregon", variants: ["2 Digit", "3 Digit"] },
    PA: {
      type: "shield",
      name: "Pennsylvania",
      variants: ["2 Digit", "3 Digit"],
    },
    RI: {
      type: "shield",
      name: "Rhode Island",
      variants: ["2 Digit", "3 Digit"],
    },
    SC: {
      type: "shield",
      name: "South Carolina",
      variants: ["2 Digit", "3 Digit"],
    },
    SD: {
      type: "shield",
      name: "South Dakota",
      variants: ["2 Digit", "3 Digit"],
    },
    TN: { type: "shield", name: "Tennessee", variants: ["2 Digit", "3 Digit"] },
    "TN 2nd": {
      type: "shield",
      name: "Tennessee (2nd)",
      variants: ["2 Digit", "3 Digit"],
    },
    Texas: {
      type: "category",
      TX: { type: "shield", name: "Texas", variants: ["2 Digit", "3 Digit"] },
      TXLOOP: {
        type: "shield",
        name: "Texas Loop",
        variants: ["2 Digit", "3 Digit"],
      },
      TXSPUR: {
        type: "shield",
        name: "Texas Spur",
        variants: ["2 Digit", "3 Digit"],
      },
      TXTOLL: {
        type: "shield",
        name: "Texas Toll",
        variants: ["2 Digit", "3 Digit"],
      },
      TXEXPRESS: {
        type: "shield",
        name: "Texas Express",
        variants: ["2 Digit", "3 Digit"],
      },
      TXFM: { type: "shield", name: "Texas FM", variants: ["4 Digit"] },
      TXPARK: { type: "shield", name: "Texas Park", variants: ["2 Digit"] },
      TXRM: { type: "shield", name: "Texas RM", variants: ["2 Digit"] },
      TXBELTWAY: {
        type: "shield",
        name: "Texas Beltway",
        variants: ["2 Digit"],
      },
    },
    UT: { type: "shield", name: "Utah", variants: ["2 Digit", "3 Digit"] },
    VT: { type: "shield", name: "Vermont", variants: ["2 Digit", "3 Digit"] },
    "VT 2nd": {
      type: "shield",
      name: "Vermont (2nd)",
      variants: ["2 Digit", "3 Digit"],
    },
    VA: { type: "shield", name: "Virginia", variants: ["2 Digit", "3 Digit"] },
    "VA 2nd": {
      type: "shield",
      name: "Virginia (2nd)",
      variants: ["2 Digit", "3 Digit"],
    },
    WA: {
      type: "shield",
      name: "Washington",
      variants: ["2 Digit", "3 Digit"],
    },
    WV: {
      type: "shield",
      name: "West Virginia",
      variants: ["2 Digit", "3 Digit"],
    },
    WI: { type: "shield", name: "Wisconsin", variants: ["2 Digit", "3 Digit"] },
    WY: { type: "shield", name: "Wyoming", variants: ["2 Digit", "3 Digit"] },
    C: { type: "shield", name: "County", variants: ["2 Digit", "3 Digit"] },
  },
  Canada: {
    type: "category",
    PEI: {
      type: "shield",
      name: "Prince Edward Island",
      variants: ["2 Digit", "3 Digit"],
    },
    NS: {
      type: "shield",
      name: "Nova Scotia",
      variants: ["2 Digit", "3 Digit"],
    },
    QC: { type: "shield", name: "Quebec", variants: ["2 Digit", "3 Digit"] },
    "QC 2nd": {
      type: "shield",
      name: "Quebec (alt)",
      variants: ["2 Digit", "3 Digit"],
    },
    NL: {
      type: "shield",
      name: "Newfoundland and Labrador",
      variants: ["2 Digit", "3 Digit"],
    },
    "New Brunswick": {
      type: "category",
      NB: {
        type: "shield",
        name: "New Brunswick",
        variants: ["2 Digit", "3 Digit"],
      },
      NBCONN: {
        type: "shield",
        name: "New Brunswick Connector",
        variants: ["3 Digit"],
      },
      NBLOCAL: {
        type: "shield",
        name: "New Brunswick Local",
        variants: ["3 Digit"],
      },
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
Shield.prototype.bannerPositions = ["Above", "Right", "Left"];
