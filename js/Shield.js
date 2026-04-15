/*
class Shield {
   * Creates anew a route shield.
   * @param {string} [type="I-"] - Type of shield.
   * @param {number} [routeNumber="1"] - Route number to display on shield.
   * @param {boolean} [to=false] - Whether or not the shield should be signed as "TO".
   * @param {string} [bannerType] - Directional banner to display.
   * @param {string} [bannerPosition] - Where to place the directional banner relative to the shield.
  constructor({
    type = "I",
    routeNumber = "1",
    to = false,
    indentFirstLetter = true,
    fontSize = "1.4rem",
    specialBannerType,
    bannerType,
    bannerType2,
    bannerPosition,
  } = {}) {
    if (Object.keys(this.types).includes(type)) {
      this.type = type;
    } else {
      this.type = "I";
    }
    this.type = type;
    this.routeNumber = routeNumber;
    this.to = to;
    this.indentFirstLetter = indentFirstLetter;
    this.fontSize = fontSize;

    if (this.bannerTypes.includes(bannerType)) {
      this.bannerType = bannerType;
    } else {
      this.bannerType = this.bannerTypes[0];
    }
    if (this.bannerTypes.includes(bannerType2)) {
      this.bannerType2 = bannerType2;
    } else {
      this.bannerType2 = this.bannerTypes[0];
    }

    if (this.bannerPositions.includes(bannerPosition)) {
      this.bannerPosition = bannerPosition;
    } else {
      this.bannerPosition = this.bannerPositions[0];
    }

    let selectedSpecialBannerType =
      this.specialBannerTypes[type][specialBannerType];

    if (selectedSpecialBannerType == undefined) {
      this.specialBannerType = this.bannerTypes[0];
    } else {
      if (routeNumber.length >= selectedSpecialBannerType) {
        this.specialBannerType = specialBannerType;
      } else {
        this.specialBannerType = this.bannerTypes[0];
      }
    }
  }
}
*/

class Shield {
  constructor({
    shieldType = "preset",
    shieldName = "Interstate",
    shieldValue = "I",
    variant = "2 Digit",

    shieldBacks = false,
    shieldBackColor = "Black",
    shieldBorderRadius = 4,

    imageType = "",
    imageData = "",
  } = {}) {
    const defaultBannerFont = ShieldElement.prototype.defaultBannerFontFamily;
    this.indentFirstLetter = true;
    this.indentFirstLetter2 = true;
    this.smallCaps = true;
    this.smallCaps2 = true;
    this.bannerFontFamily = defaultBannerFont;
    this.shieldType = shieldType;
    this.shieldName = shieldName;
    this.shieldValue = shieldValue;
    this.variant = variant;
    this.shieldBacks = shieldBacks;
    this.shieldBackColor = shieldBackColor;
    this.shieldBorderRadius = shieldBorderRadius;
    this.imageType = imageType;
    this.imageData = imageData;
  }
}

class Banner {
  constructor({
    textContent = "",
    firstLetterSize = 100,
    fontSize = 1,
    backgroundColor = "None",
    padding = .01,
    borderRadius = 4,
    fontFamily = "Series E",
    margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }
  } = {}) {
    this.textContent = textContent;
    this.firstLetterSize = firstLetterSize;
    this.fontSize = fontSize;
    this.backgroundColor = backgroundColor;
    this.padding = padding;
    this.borderRadius = borderRadius;
    this.fontFamily = fontFamily;
    this.margins = margins;
  }
}

class BannerGroup {
  constructor({
    position = "left",
    gap = .5,
    direction = "vertical",
  } = {}) {
    this.position = position;
    this.gap = gap;
    this.direction = direction;
  }
}

class ShieldBlock {
  constructor({ } = {}) { }
}

class ShieldContainer {
  constructor({ } = {}) { }
}

Shield.prototype.getDirectoryFromShield = (name, variant) => {
  variant = variant.replace(/\s/g, "");

  let directory = "img/shields/";
  const search = (dir, str) => {
    for (const category in dir) {
      const cat = dir[category];
      if (cat.type == "category") {
        const catSearch = search(cat, str, category);
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
        const catSearch = search(cat, str, category);
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
      variants: ["2 Digit", "3 Digit", "Merritt"],
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
    KY: { type: "shield", name: "Kentucky", variants: ["2 Digit", "3 Digit", "AA"] },
    KYPKWY: {type: "shield", name: "Kentucky Parkway", variants: ["Audubon", "Bluegrass", "Cumberland", "Hal Rogers", "Mountain", "Western KY"] },
    LA: { type: "shield", name: "Louisiana", variants: ["2 Digit", "3 Digit"] },
    ME: { type: "shield", name: "Maine", variants: ["2 Digit", "3 Digit", "Turnpike"] },
    MD: { type: "shield", name: "Maryland", variants: ["2 Digit", "3 Digit"] },
    MA: {
      type: "shield",
      name: "Massachusetts",
      variants: ["2 Digit", "3 Digit", "Turnpike"],
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
      variants: ["2 Digit", "3 Digit", "Blue", "Spaulding", "Everett"],
    },
    NJ: {
      type: "shield",
      name: "New Jersey",
      variants: ["2 Digit", "3 Digit", "NJTP", "GSP"],
    },
    NM: {
      type: "shield",
      name: "New Mexico",
      variants: ["2 Digit", "3 Digit"],
    },
    NY: { type: "shield", name: "New York", variants: ["2 Digit", "3 Digit", "Thruway"] },
    NYPKWY: { type: "shield", name: "New York Parkway", variants: ["Bear Mountain", "Belt", "Bethpage", "Bronx River 1", "Bronx River 2", "Cross County", "Cross Island", "FDR Drive", "Grand Central", "Harlem River Drive", "Heckscher", "Henry Hudson", "Hutchinson River 1", "Hutchinson River 2", "Jackie Robinson", "Korean War Vets", "Lake Ontario", "Loop", "Meadowbrook", "Mosholu", "Niagra Scenic", "Northern", "Ocean", "Palisades Interstate", "Pelham", "Robert Moses Causeway", "Sagitkos", "Saw Mill", "Southern", "Sprain Brook", "Sunken Meadow", "Taconic State", "Wantagh"] },
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
    AB: {
      type: "shield",
      name: "Alberta",
      variants: ["2 Digit"],
    },
      AB2: {
      type: "shield",
      name: "Alberta (alt)",
      variants: ["3 Digit"],
    },
    NS: {
      type: "shield",
      name: "Nova Scotia",
      variants: ["2 Digit", "3 Digit"],
    },
    QC: { type: "shield", name: "Quebec", variants: ["2 Digit", "3 Digit"] },
    QC2: {
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
  DuskSMP: {
    type: "category",
    DUSKSMP: {
      type: "shield",
      name: "DuskSMP",
      variants: [],
    },
    DUSKSMP_TOLL: {
      type: "shield",
      name: "DuskSMP Toll",
      variants: [],
    },
  },
};

Shield.prototype.bannerTypes = [
  "None",
  "North",
  "East",
  "South",
  "West",
  "Arterial",
  "Jct",
  "Begin",
  "End",
  "Spur",
  "Alt",
  "Truck",
  "Business",
  "Bus",
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
  "Turnpike",
  "Nord",
  "Est",
  "Sud",
  "Ouest",
];
Shield.prototype.bannerPositions = ["Above", "Right", "Left"];
