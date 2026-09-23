// Control.js
const fractionMap = {
  "1/2": "½",
  "1/3": "⅓",
  "2/3": "⅔",
  "1/4": "¼",
  "3/4": "¾",
  "1/5": "⅕",
  "2/5": "⅖",
  "3/5": "⅗",
  "4/5": "⅘",
  "1/6": "⅙",
  "5/6": "⅚",
  "1/7": "⅐",
  "1/8": "⅛",
  "3/8": "⅜",
  "5/8": "⅝",
  "7/8": "⅞",
  "1/9": "⅑",
  "1/10": "⅒",
};
const fractionRegex = new RegExp(Object.keys(fractionMap).join("|"), "g");

class TextElement {
  constructor({
    textContent = "New Sign",
    backgroundColor = "Inherit",
    fontFamily = "Clearview 5WR",
    fontSize = 100,
    useBannerFormatting = false,
    bannerFormattingSize = 100,
    bannerFirstLetterSize = 120,
    useNumeralFormatting = false,
    numeralFormattingSize = 150,
    alignment = "Center",
    textAlign = "Center",
    lineHeight = 100,
  } = {}) {
    this.textContent = textContent;
    this.fontFamily = fontFamily;
    this.backgroundColor = backgroundColor;
    this.fontSize = fontSize;
    this.useBannerFormatting = useBannerFormatting;
    this.useNumeralFormatting = useNumeralFormatting;
    this.bannerFormattingSize = bannerFormattingSize;
    this.numeralFormattingSize = numeralFormattingSize;
    this.bannerFirstLetterSize = bannerFirstLetterSize;
    this.alignment = alignment;
    this.lineHeight = lineHeight;
    this.textAlign = textAlign;
  }

  splitString(text) {
    let result = [text];
    let tagged = [];

    const numeralPattern = /(\d+\S*)|([\u00BC-\u00BE]+\S*)/;
    const lightNumeralPattern = new RegExp(
      numeralPattern.source + "|" + Object.values(fractionMap).join("|"),
      "g",
    );

    const bannerPattern = new RegExp(
      `(\\s*)(\\b(?:${Shield.prototype.bannerTypes.join("|")})\\b)(\\s*)`,
      "gi",
    );
    const lightBannerPattern = new RegExp(
      `(\\b(?:${Shield.prototype.bannerTypes.join("|")})\\b)`,
      "gi",
    );

    if (this.useBannerFormatting) {
      result = result[0].split(bannerPattern).filter(Boolean);
    }

    if (this.useNumeralFormatting) {
      let newResult = [];
      for (let i = 0; i < result.length; i++) {
        let currentResult = result[i]
          .split(numeralPattern)
          .filter(Boolean)
          .map((val) =>
            val.replace(fractionRegex, (match) => fractionMap[match]),
          );
        newResult = newResult.concat(currentResult);
      }
      result = newResult;
    }

    result = result.map((val) =>
      val.replace(/\\t/g, "\t").replace(/\\n/g, "\n"),
    );
    for (let i = 0; i < result.length; i++) {
      let r = result[i];
      if (lightNumeralPattern.test(r) && this.useNumeralFormatting) {
        tagged[i] = { type: "numeral", value: r };
      } else if (lightBannerPattern.test(r) && this.useBannerFormatting) {
        tagged[i] = { type: "banner", value: r };
      } else {
        tagged[i] = { type: "text", value: r };
      }
    }

    return tagged;
  }

  createElement() {
    const newText = document.createElement("div");
    newText.className = "bE-textElement";
    const usesHighwayGothic =
      typeof this.fontFamily === "string" &&
      this.fontFamily.toLowerCase().includes("series");

    newText.style.setProperty("--fontFamily", '"' + this.fontFamily + '"');
    newText.style.setProperty(
      "--fontSize",
      1.75 * (this.fontSize / 100) + "rem",
    );
    newText.style.setProperty(
      "--blockBgColor",
      this.backgroundColor == "Inherit"
        ? ""
        : (
            lib.colors[this.backgroundColor] || this.backgroundColor
          ).toLowerCase(),
    );
    newText.style.setProperty("--alignment", this.alignment);
    newText.style.setProperty("--textAlign", this.textAlign);
    newText.style.setProperty("--numeralSize", this.numeralFormattingSize);
    newText.style.setProperty("--bannerSize", this.bannerFormattingSize);
    newText.style.setProperty(
      "--bannerFirstLetterSize",
      this.bannerFirstLetterSize,
    );
    newText.style.setProperty("--lineHeight", this.lineHeight);
    if (usesHighwayGothic) {
      newText.style.setProperty(
        "--fhwaBaselineOffset",
        "var(--fhwaBaselineShift)",
      );
    }

    if (
      this.backgroundColor == "Orange" ||
      this.backgroundColor == "White" ||
      this.backgroundColor == "Yellow" ||
      this.backgroundColor == "Fluorescent Yellow-Green"
    ) {
      newText.style.color = "black";
    } else if (this.backgroundColor != "Inherit") {
      newText.style.color = "white";
    }

    for (const text of this.textContent.split("\\n")) {
      const lineElement = document.createElement("div");
      lineElement.className = "lineElement";

      let splitTextContent = this.splitString(text);

      for (let i = 0; i < splitTextContent.length; i++) {
        let text = splitTextContent[i];
        const newTextFragment = document.createElement("span");
        newTextFragment.className = "bE-" + text.type;
        newTextFragment.textContent = text.value;

        lineElement.appendChild(newTextFragment);
      }
      newText.appendChild(lineElement);
    }

    return newText;
  }
}

TextElement.prototype.fontFamily = [
  "Clearview 1B",
  "Clearview 1W",
  "Clearview 2B",
  "Clearview 2W",
  "Clearview 3B",
  "Clearview 3W",
  "Clearview 4B",
  "Clearview 4W",
  "Clearview 5B",
  "Clearview 5W",
  "Clearview 5WR",
  "Clearview 6B",
  "Series B",
  "Series C",
  "Series D",
  "Series E",
  "Series EM",
  "Series EEM",
  "Series F",
  "Arial",
  "Arial Bold",
  "Transport",
];

TextElement.prototype.alignment = ["Left", "Center", "Right"];

TextElement.prototype.backgroundColor = ["Inherit"].concat(
  Object.keys(lib.colors),
);

class ControlTextElement extends TextElement {
  constructor({
    smallCapitals = false,
    fontFamily = ControlTextElement.defaultFont,
  } = {}) {
    super();
    this.fontFamily = fontFamily;
    this.smallCapitals = smallCapitals;
  }

  createElement() {
    const newText = super.createElement();
    newText.style.fontVariant = this.smallCapitals ? "small-caps" : "normal";
    newText.classList.add("bE-controlTextElement");
    return newText;
  }
}

ControlTextElement.defaultFont = "Clearview 5WR";

class ActionMessageElement extends TextElement {
  constructor({ fontSize = 70, useNumeralFormatting = true } = {}) {
    super();
    this.fontSize = fontSize;
    this.useNumeralFormatting = useNumeralFormatting;
  }
}

class AdvisoryMessageElement extends TextElement {
  constructor({
    backgroundColor = "Yellow",
    fontFamily = "Series E",
    borderRadius = 4,
    useNumeralFormatting = true,
    horizPadding = 0.3,
    vertPadding = 0.3,
  } = {}) {
    super();
    this.backgroundColor = backgroundColor;
    this.fontFamily = fontFamily;
    this.borderRadius = borderRadius;
    this.useNumeralFormatting = useNumeralFormatting;
    this.horizPadding = horizPadding;
    this.vertPadding = vertPadding;
  }

  createElement() {
    const newText = super.createElement();
    newText.style.setProperty("--borderRadius", this.borderRadius + "px");
    newText.style.setProperty("--horizPadding", this.horizPadding);
    newText.style.setProperty("--vertPadding", this.vertPadding);
    newText.className = "bE-textElement bE-advisoryMessage";

    return newText;
  }
}

class ElectronicSignElement extends TextElement {
  constructor({
    fontFamily = "Electronic Highway Sign",
    textColor = "Orange",
    padding = 0.5,
    glow = true,
    setWidth = 0,
  } = {}) {
    super();
    this.fontFamily = fontFamily;
    this.textColor = textColor;
    this.backgroundColor = "Black";
    this.useNumeralFormatting = false;
    this.useBannerFormatting = false;
    this.padding = padding;
    this.glow = glow;
    this.setWidth = setWidth;
  }

  createElement(panel) {
    const newText = super.createElement(panel);
    newText.className = "bE-textElement bE-electronicSign";
    newText.style.setProperty(
      "--textColor",
      (lib.colors[this.textColor] || this.textColor).toLowerCase(),
    );
    newText.style.setProperty("--padding", this.padding + "rem");
    newText.style.setProperty(
      "--textShadow",
      this.glow
        ? "0 0 0.25rem var(--textColor), 0 0 0.25rem var(--textColor)"
        : "",
    );
    newText.style.width = this.setWidth != 0 ? this.setWidth + "rem" : "";

    return newText;
  }
}
ElectronicSignElement.prototype.fontFamily =
  TextElement.prototype.fontFamily.concat(["Electronic Highway Sign"]);
ElectronicSignElement.prototype.textColors = [
  "Orange",
  "White",
  "Yellow",
  "Red",
];

class ShieldGroupElement {
  f;
  constructor({
    shields = [],
    alignment = "Center",
    direction = "Horizontal",
    gap = 0.5,
  } = {}) {
    this.shields = shields;
    this.alignment = alignment;
    this.direction = direction;
    this.gap = gap;
  }

  newShield() {
    let shield = new Shield();
    this.shields.push(shield);
  }

  deleteShield(index) {
    if (index >= 0 && index < this.shields.length) {
      this.shields.splice(index, 1);
    }
  }

  duplicateShield(index) {
    if (index >= 0 && index < this.shields.length) {
      const shieldToDuplicate = this.shields[index];
      const duplicatedShield = Object.assign(
        shieldToDuplicate.constructor.prototype,
        shieldToDuplicate,
      );
      this.shields.splice(index + 1, 0, duplicatedShield);
    }
  }

  createElement() {
    const shieldGroupElem = document.createElement("div");
    shieldGroupElem.className = "bE-shieldGroupElement";

    if (this.direction == "Horizontal") {
      shieldGroupElem.style.flexDirection = "row";
    } else if (this.direction == "Vertical") {
      shieldGroupElem.style.flexDirection = "column";
    }
    shieldGroupElem.style.gap = this.gap + "rem";

    let lastGroup = null;
    let lastGroupInd = -1;
    for (const shield of this.shields) {
      if (shield.group == 0) {
        lastGroup = null;
        lastGroupInd = -1;

        const bannerShieldContainerElmt = shield.createBannerShieldElement();
        bannerShieldContainerElmt.appendChild(shield.createElement());
        shieldGroupElem.appendChild(bannerShieldContainerElmt);
      } else if (shield.group != lastGroupInd) {
        const [bannerShieldContainerElmt, groupedShieldElement] =
          shield.createBannerShieldElement(true);
        lastGroupInd = shield.group;
        lastGroup = groupedShieldElement;

        lastGroup.appendChild(shield.createElement());
        shieldGroupElem.appendChild(bannerShieldContainerElmt);
      } else if (shield.group == lastGroupInd) {
        lastGroup.appendChild(shield.createElement());
      }
    }

    return shieldGroupElem;
  }
}
ShieldGroupElement.prototype.direction = ["Horizontal", "Vertical"];

class DividerElement {
  constructor({
    dividerWidth = 100,
    dividerMeasurement = "%",
    dividerHeight = 0.2,
    alignment = "Center",
    visible = true,
    dividerColor = "White",
    fullBleed = false,
  } = {}) {
    this.dividerWidth = dividerWidth;
    this.dividerMeasurement = dividerMeasurement;
    this.dividerHeight = dividerHeight;
    this.alignment = alignment;
    this.visible = visible;
    this.dividerColor = dividerColor;
    this.fullBleed = fullBleed;
  }

  createElement(panel) {
    const newDivider = document.createElement("div");
    newDivider.className = "dividerElement";
    newDivider.style.visibility = this.visible ? "visible" : "hidden";
    newDivider.style.setProperty(
      "--dividerWidth",
      this.dividerWidth + this.dividerMeasurement,
    );
    newDivider.style.setProperty("--dividerHeight", this.dividerHeight + "rem");
    newDivider.style.marginTop = "0";
    newDivider.style.marginBottom = "0";

    if (this.dividerColor && this.dividerColor !== "Default") {
      const resolvedColor =
        lib.colors[this.dividerColor] || this.dividerColor || "";
      if (resolvedColor) {
        newDivider.style.backgroundColor = resolvedColor;
      }
    }

    if (this.fullBleed) {
      newDivider.classList.add("fullBleed");
      const paddingString = panel?.sign?.padding || "";
      const paddingValues = paddingString.trim().split(/\s+/).filter(Boolean);

      let top = "0rem",
        right = "0rem",
        bottom = "0rem",
        left = "0rem";

      if (paddingValues.length === 1) {
        top = right = bottom = left = paddingValues[0];
      } else if (paddingValues.length === 2) {
        top = bottom = paddingValues[0];
        right = left = paddingValues[1];
      } else if (paddingValues.length === 3) {
        [top, right, bottom] = paddingValues;
        left = right;
      } else if (paddingValues.length >= 4) {
        [top, right, bottom, left] = paddingValues;
      }

      newDivider.style.setProperty("--dividerBleedLeft", left || "0rem");
      newDivider.style.setProperty("--dividerBleedRight", right || "0rem");
    } else {
      newDivider.classList.remove("fullBleed");
      newDivider.style.setProperty("--dividerBleedLeft", "0rem");
      newDivider.style.setProperty("--dividerBleedRight", "0rem");
    }

    return newDivider;
  }
}

DividerElement.prototype.dividerMeasurement = ["%", "rem"];
DividerElement.prototype.dividerColors = [
  { value: "White", label: "White" },
  { value: "Black", label: "Black" },
];

class IconElement {
  constructor({
    icon = "AIRPORT",
    iconSize = 100,
    backgroundColor = "Inherit",
    border = false,
    borderRadius = 4,
    borderColor = "White",
    spacing = 4,
  } = {}) {
    this.icon = icon;
    this.iconSize = iconSize;
    this.backgroundColor = backgroundColor;
    this.border = border;
    this.borderRadius = borderRadius;
    this.borderColor = borderColor;
    this.spacing = spacing;
  }

  createElement() {
    const iconHolder = document.createElement("div");
    iconHolder.className = "bE-iconElement";

    iconHolder.style.setProperty("--iconSize", this.iconSize);
    iconHolder.style.setProperty("--iconPadding", this.spacing + "px");

    if (this.border) {
      iconHolder.style.setProperty(
        "--iconBorderRadius",
        this.borderRadius + "px",
      );
      iconHolder.style.setProperty(
        "--iconBorderColor",
        lib.colors[this.borderColor] || this.borderColor,
      );
    }

    iconHolder.style.setProperty(
      "--iconBackgroundColor",
      lib.colors[this.backgroundColor] || this.backgroundColor,
    );

    const iconElement = document.createElement("img");
    iconElement.src = `./assets/icons/${this.icons[this.icon]}`;
    iconElement.alt = this.icon;
    iconElement.className = "bE-iconImage";

    if (lib.checkForContrast(this.backgroundColor.toLowerCase())) {
      iconElement.style.filter = "invert(1)";
    }

    iconHolder.appendChild(iconElement);
    return iconHolder;
  }
}

IconElement.prototype.icons = {
  511: "511.svg",
  AIRPORT: "AIRPORT.svg",
  ALLTERRAIN_TRAIL: "ALLTERRAIN_TRAIL.svg",
  ALTERNATIVE_FUEL_COMPRESSED_NATURAL_GAS:
    "ALTERNATIVE_FUEL_COMPRESSED_NATURAL_GAS.svg",
  ALTERNATIVE_FUEL_ETHANOL: "ALTERNATIVE_FUEL_ETHANOL.svg",
  ARCHERY: "ARCHERY.svg",
  BASEBALL: "BASEBALL.svg",
  BEACH: "BEACH.svg",
  BEAR_VIEWING_AREA: "BEAR_VIEWING_AREA.svg",
  BIKE: "BIKE.svg",
  BIOFUEL: "BIOFUEL.svg",
  BOAT_RAMP: "BOAT_RAMP.svg",
  BUS_STATION: "BUS_STATION.svg",
  BUS_STOP: "BUS_STOP.svg",
  CAMPFIRES: "CAMPFIRES.svg",
  CAMPING: "CAMPING.svg",
  CANOEING: "CANOEING.svg",
  CHAIR_LIFTSKI_LIFT: "CHAIR_LIFTSKI_LIFT.svg",
  CLIMBING: "CLIMBING.svg",
  CONE: "CONE.png",
  CROSS_COUNTRY_SKIING: "CROSS_COUNTRY_SKIING.svg",
  DEER_VIEWING_AREA: "DEER_VIEWING_AREA.svg",
  DIESEL_FUEL: "DIESEL_FUEL.svg",
  DOG_SLEDDING: "DOG_SLEDDING.svg",
  DONT_WALK: "DONT_WALK.svg",
  ELECTRICAL_HOOKUP: "ELECTRICAL_HOOKUP.svg",
  ELECTRIC_VEHICLE_CHARGING: "ELECTRIC_VEHICLE_CHARGING.svg",
  EMERGENCY_MEDICAL_SERVICES: "EMERGENCY_MEDICAL_SERVICES.svg",
  EXIT_INSERT: "EXIT_INSERT.png",
  FIRE_EXTINGUISHER: "FIRE_EXTINGUISHER.svg",
  FIRST_AID: "FIRST_AID.svg",
  FISHING_AREA: "FISHING_AREA.svg",
  FOOD: "FOOD.svg",
  GAS: "GAS.svg",
  GOLFING: "GOLFING.svg",
  HOSPITAL: "H.png",
  HAND_LAUNCHSMALL_BOAT_LAUNCH: "HAND_LAUNCHSMALL_BOAT_LAUNCH.svg",
  HIKING_TRAIL: "HIKING_TRAIL.svg",
  "HAZARDOUS MATERIALS": "HM.png",
  HORSE_TRAIL: "HORSE_TRAIL.svg",
  HOSPITAL: "HOSPITAL.svg",
  HOV: "HOV.svg",
  "HOV TRANSPARENT": "HOVTransparent.svg",
  "HOV Car": "HOVCarBlank.png",
  "2+ HOV Car": "HOVCar2Plus.png",
  "3+ HOV Car": "HOVCar3Plus.png",
  HYDROGEN_FUEL: "HYDROGEN_FUEL.svg",
  INLINE_SKATING: "INLINE_SKATING.svg",
  INTERNATIONAL_SYMBOL_OF_ACCESSIBILITY:
    "INTERNATIONAL_SYMBOL_OF_ACCESSIBILITY.svg",
  JET_SKIPERSONAL_WATERCRAFT: "JET_SKIPERSONAL_WATERCRAFT.svg",
  LAUNDROMAT: "LAUNDROMAT.svg",
  LIBRARY: "LIBRARY.svg",
  LIGHTHOUSE: "LIGHTHOUSE.svg",
  LIGHT_RAIL_TRANSIT_STATION: "LIGHT_RAIL_TRANSIT_STATION.svg",
  LIQUEFIED_NATURAL_GAS: "LIQUEFIED_NATURAL_GAS.svg",
  LIQUEFIED_PETROLEUM_GAS: "LIQUEFIED_PETROLEUM_GAS.svg",
  LITTER_CONTAINER: "LITTER_CONTAINER.svg",
  LODGING: "LODGING.svg",
  LOOKOUT_TOWER: "LOOKOUT_TOWER.svg",
  MARINA: "MARINA.svg",
  MENS_RESTROOM: "MENS_RESTROOM.svg",
  MOTORBOATING: "MOTORBOATING.svg",
  NATURE_STUDY_AREA: "NATURE_STUDY_AREA.svg",
  "NO HAZARDOUS MATERIALS": "NO-HM.png",
  orange_county: "orange_county.svg",
  PARKING: "PARKING.svg",
  PASSENGERS_ONLY_FERRY_TERMINAL: "PASSENGERS_ONLY_FERRY_TERMINAL.svg",
  PEDESTRIAN: "PEDESTRIAN.svg",
  PHARMACY: "PHARMACY.svg",
  PICKUP_TRUCKS: "PICKUP_TRUCKS.svg",
  PICNIC_SHELTER: "PICNIC_SHELTER.svg",
  PICNIC_SITE: "PICNIC_SITE.svg",
  POLICE: "POLICE.svg",
  POST_OFFICE: "POST_OFFICE.svg",
  RECREATIONAL_VEHICLE_SITE: "RECREATIONAL_VEHICLE_SITE.svg",
  RECYCLING: "RECYCLING.svg",
  RESTROOMS: "RESTROOMS.svg",
  RV_SANITARY_STATION: "RV_SANITARY_STATION.svg",
  SCHOOL_BUS: "SCHOOL_BUS.svg",
  SCHOOL_CROSSING: "SCHOOL_CROSSING.svg",
  SCUBA_DIVING: "SCUBA_DIVING.svg",
  SEAL_VIEWING: "SEAL_VIEWING.svg",
  SEATBELT: "SEATBELT.png",
  SEA_PLANE: "SEA_PLANE.svg",
  SHOWERS: "SHOWERS.svg",
  SKATEBOARDING: "SKATEBOARDING.svg",
  SLEDDING: "SLEDDING.svg",
  SLEEPING_SHELTER: "SLEEPING_SHELTER.svg",
  SMOKING: "SMOKING.svg",
  SNOWSHOEING: "SNOWSHOEING.svg",
  SNOW_TUBING: "SNOW_TUBING.svg",
  SPELUNKINGCAVES: "SPELUNKINGCAVES.svg",
  STOP: "STOP.svg",
  SWIMMING: "SWIMMING.svg",
  TECHNICAL_ROCK_CLIMBING: "TECHNICAL_ROCK_CLIMBING.svg",
  TELECOMMUNICATIONS_DEVICE_FOR_THE_DEAF:
    "TELECOMMUNICATIONS_DEVICE_FOR_THE_DEAF.svg",
  TELEPHONE: "TELEPHONE.svg",
  TENNIS: "TENNIS.svg",
  TOURIST_INFORMATION: "TOURIST_INFORMATION.svg",
  TRAILER_SITE: "TRAILER_SITE.svg",
  TRAIN_STATION: "TRAIN_STATION.svg",
  TRAMWAY: "TRAMWAY.svg",
  TRASH_DUMPSTER: "TRASH_DUMPSTER.svg",
  TRUCK_EXTERNAL_POWER: "TRUCK_EXTERNAL_POWER.svg",
  TRUCK_PARKING: "TRUCK_PARKING.svg",
  TUNNEL: "TUNNEL.svg",
  VEHICLE_FERRY_STATION: "VEHICLE_FERRY_STATION.svg",
  VIEWING_AREA: "VIEWING_AREA.svg",
  WATERSKIING: "WATERSKIING.svg",
  WHALE_VIEWING: "WHALE_VIEWING.svg",
  WILDLIFE_VIEWING: "WILDLIFE_VIEWING.svg",
  WINTER_RECREATIONAL_AREA: "WINTER_RECREATIONAL_AREA.svg",
  WIRELESS_INTERNET: "WIRELESS_INTERNET.svg",
  WOMENS_RESTROOM: "WOMENS_RESTROOM.svg",
  YIELD: "YIELD.svg",
};

class BeaconElement {
  constructor({
    size = 2,
    alignment = "Center",
    flashDuration = 1,
    color = "Yellow",
    backplate = false,
    flashOpposite = false,
  } = {}) {
    const parsedSize = parseFloat(size);
    this.size = Number.isFinite(parsedSize) ? Math.max(parsedSize, 0.5) : 2;
    const parsedDuration = parseFloat(flashDuration);
    this.flashDuration =
      Number.isFinite(parsedDuration) && parsedDuration > 0
        ? parsedDuration
        : 1;
    const validAlignments = Array.isArray(TextElement.prototype.alignment)
      ? TextElement.prototype.alignment
      : [];
    this.alignment = validAlignments.includes(alignment) ? alignment : "Center";
    const availableColors = Array.isArray(BeaconElement.prototype.colors)
      ? BeaconElement.prototype.colors
      : [];
    this.color = availableColors.includes(color)
      ? color
      : availableColors[0] || "Yellow";
    this.backplate =
      backplate === true ||
      backplate === "true" ||
      backplate === 1 ||
      backplate === "1";
    this.flashOpposite =
      flashOpposite === true ||
      flashOpposite === "true" ||
      flashOpposite === 1 ||
      flashOpposite === "1";
  }

  createElement() {
    const parsedSize = parseFloat(this.size);
    const beaconSize = Number.isFinite(parsedSize) ? parsedSize : 2;
    const parsedDuration = parseFloat(this.flashDuration);
    const flashDuration =
      Number.isFinite(parsedDuration) && parsedDuration > 0
        ? parsedDuration
        : 1;

    const container = document.createElement("div");
    container.className = "bE-beaconElement";
    container.style.setProperty(
      "--beaconSize",
      Math.max(beaconSize, 0.5) + "rem",
    );
    container.style.setProperty("--beaconFlashDuration", flashDuration + "s");
    const resolvedColor =
      (lib?.colors && lib.colors[this.color]) || this.color || "Yellow";
    container.style.setProperty(
      "--beaconBulbColor",
      typeof resolvedColor === "string" ? resolvedColor : "Yellow",
    );
    container.style.setProperty(
      "--beaconBackplateThickness",
      BeaconElement.prototype.backplateThicknessRem + "rem",
    );
    container.style.setProperty(
      "--beaconBackplateRadius",
      BeaconElement.prototype.backplateCornerRadiusRem + "rem",
    );
    const backplateColorReference = BeaconElement.prototype.backplateColor;
    const resolvedBackplateColor =
      (lib?.colors && lib.colors[backplateColorReference]) ||
      BeaconElement.prototype.backplateFallbackColor ||
      backplateColorReference;
    container.style.setProperty(
      "--beaconBackplateColor",
      resolvedBackplateColor,
    );
    if (this.backplate) {
      container.classList.add("hasBackplate");
    }
    if (this.flashOpposite) {
      container.classList.add("flashOpposite");
    }

    const bulb = document.createElement("div");
    bulb.className = "bE-beaconBulb";
    container.appendChild(bulb);

    return container;
  }
}

BeaconElement.prototype.colors = ["Yellow", "Red", "Purple"];
BeaconElement.prototype.halfInchInRem = 0.5 / 12;
BeaconElement.prototype.backplateThicknessRem =
  BeaconElement.prototype.halfInchInRem * 3;
BeaconElement.prototype.backplateCornerRadiusRem = 0.15;
BeaconElement.prototype.backplateColor = "Yellow";
BeaconElement.prototype.backplateFallbackColor = "#ffd200";

class ArrowElement {
  constructor({
    arrow = ArrowElement.prototype.defaultArrow,
    rotation = 0,
    size = null,
    padding = null,
    paddingHorizontal = null,
    paddingVertical = null,
    flip = false,
    alignment = "Center",
  } = {}) {
    const resolveArrowKey = ArrowElement.prototype.arrows[arrow]
      ? arrow
      : ArrowElement.prototype.defaultArrow;
    this.arrow = resolveArrowKey;
    this.rotation = rotation;
    this.flip =
      flip === true ||
      flip === "true" ||
      flip === 1 ||
      flip === "1" ||
      flip === "on";
    this.alignment = alignment;

    const arrowDefinition = ArrowElement.prototype.arrows[this.arrow] || {};
    const defaultSize =
      typeof arrowDefinition.defaultSize === "number"
        ? arrowDefinition.defaultSize
        : ArrowElement.prototype.defaultSize;

    const normalizeNumber = (value, fallback = 0) => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? fallback : parsed;
    };

    if (size === null || size === undefined || size === "") {
      this.size = defaultSize;
    } else {
      this.size = normalizeNumber(size, defaultSize);
    }

    const fallbackPadding =
      padding !== null && padding !== undefined ? padding : 0;
    this.paddingHorizontal = normalizeNumber(
      paddingHorizontal !== null && paddingHorizontal !== undefined
        ? paddingHorizontal
        : fallbackPadding,
      0,
    );
    this.paddingVertical = normalizeNumber(
      paddingVertical !== null && paddingVertical !== undefined
        ? paddingVertical
        : fallbackPadding,
      0,
    );
  }

  createElement() {
    const container = document.createElement("div");
    container.className = "bE-arrowElement";

    const arrowDefinition =
      ArrowElement.prototype.arrows[this.arrow] ||
      ArrowElement.prototype.arrows[ArrowElement.prototype.defaultArrow];
    const img = document.createElement("img");
    img.src = arrowDefinition.src;
    img.alt = arrowDefinition.label;
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;
    container.appendChild(img);

    const parsedRotation = parseFloat(this.rotation);
    if (!isNaN(parsedRotation)) {
      container.style.setProperty("--arrowRotation", parsedRotation + "deg");
    }

    const parsedSize = parseFloat(this.size);
    if (!isNaN(parsedSize)) {
      container.style.setProperty(
        "--arrowSize",
        Math.max(parsedSize, 0) + "rem",
      );
    }

    const horizontalPadding = parseFloat(
      this.paddingHorizontal !== undefined
        ? this.paddingHorizontal
        : this.padding,
    );
    const verticalPadding = parseFloat(
      this.paddingVertical !== undefined ? this.paddingVertical : this.padding,
    );

    container.style.setProperty(
      "--arrowPaddingHorizontal",
      Math.max(isNaN(horizontalPadding) ? 0 : horizontalPadding, 0) + "rem",
    );
    container.style.setProperty(
      "--arrowPaddingVertical",
      Math.max(isNaN(verticalPadding) ? 0 : verticalPadding, 0) + "rem",
    );

    container.style.setProperty("--arrowFlip", this.flip ? "-1" : "1");

    return container;
  }
}

ArrowElement.prototype.arrows = {
  TYPE_A: { label: "Type A", src: "assets/arrowBlocks/TYPE_A.svg" },
  TYPE_A_EXTENDED: {
    label: "Type A Extended",
    src: "assets/arrowBlocks/TYPE_A_EXTENDED.svg",
  },
  TYPE_B: { label: "Type B", src: "assets/arrowBlocks/TYPE_B.svg" },
  TYPE_C_45: { label: "Type C 45", src: "assets/arrowBlocks/TYPE_C_45.svg" },
  TYPE_C_45_ALT: {
    label: "Type C 45 (alt)",
    src: "assets/arrowBlocks/TYPE_C_45_ALT.svg",
  },
  TYPE_C_90: { label: "Type C 90", src: "assets/arrowBlocks/TYPE_C_90.svg" },
  TYPE_D: { label: "Type D", src: "assets/arrowBlocks/TYPE_D.svg" },
  DOWN: {
    label: "Down",
    src: "assets/arrowBlocks/DOWN.svg",
    defaultSize: 2.75,
  },
  DOWN_CA: {
    label: "Down (CA)",
    src: "assets/arrowBlocks/DOWN_CA.svg",
    defaultSize: 2.75,
  },
  UK: { label: "UK", src: "assets/arrowBlocks/UK.svg" },
};
ArrowElement.prototype.defaultArrow = "TYPE_A";
ArrowElement.prototype.defaultSize = 1.75;
ArrowElement.prototype.arrowKeys = Object.keys(ArrowElement.prototype.arrows);

class TollLogoElement {
  constructor({
    logo = TollLogoElement.prototype.defaultLogo,
    logoHeight = 3,
    spacing = 0,
    horizontalPadding = 0.2,
    verticalPadding = 0.05,
    background = false,
    backgroundColor = "White",
    alignment = "Center",
    squareIcon = false,
    borderRadius = 8,
    hasOnlyBlock = false,
  } = {}) {
    this.logo = logo;
    this.logoHeight = logoHeight;
    this.spacing = spacing;
    this.background = background;
    this.squareIcon = squareIcon;
    this.borderRadius = borderRadius;
    this.backgroundColor = backgroundColor;
    this.horizontalPadding = horizontalPadding;
    this.verticalPadding = verticalPadding;
    this.hasOnlyBlock = hasOnlyBlock;
    this.alignment = alignment;
  }

  createElement() {
    const container = document.createElement("div");
    container.className = "bE-tollLogoElement";

    const parsedSpacing = parseFloat(this.spacing);
    const spacing = isNaN(parsedSpacing) ? 0 : parsedSpacing;
    container.style.setProperty("--spacing", spacing + "rem");
    container.style.setProperty(
      "--tollBgColor",
      lib.colors[this.backgroundColor] || this.backgroundColor.toLowerCase(),
    );
    container.style.setProperty("--borderRadius", this.borderRadius + "px");
    container.style.setProperty(
      "--horizPadding",
      this.horizontalPadding + "rem",
    );
    container.style.setProperty("--vertPadding", this.verticalPadding + "rem");
    container.style.setProperty("--tollLogoHeight", this.logoHeight + "rem");

    if (this.background) {
      container.classList.add("hasBackground");
    }

    if (this.squareIcon) {
      container.style.aspectRatio = "1 / 1";
    }

    const logoDefinition =
      TollLogoElement.prototype.logos[this.logo] ||
      TollLogoElement.prototype.logos[TollLogoElement.prototype.defaultLogo];

    if (logoDefinition) {
      const img = document.createElement("img");
      img.src = logoDefinition.src;
      img.alt = logoDefinition.label;
      img.loading = "lazy";
      img.decoding = "async";
      img.draggable = false;
      container.appendChild(img);
    } else {
      container.textContent = "Toll logo unavailable";
    }

    if (this.hasOnlyBlock) {
      const onlyBlock = document.createElement("div");
      onlyBlock.className = "bE-tollOnlyBlock";
      onlyBlock.textContent = "ONLY";
      container.appendChild(onlyBlock);
      container.classList.add("hasOnlyBlock");

      if (
        this.backgroundColor.toLowerCase() == "white" ||
        this.backgroundColor.toLowerCase() == "yellow" ||
        this.backgroundColor.toLowerCase() == "fluorescent yellow-green" ||
        this.backgroundColor.toLowerCase() == "orange"
      ) {
        container.classList.add("inverseColor");
      }
    }

    return container;
  }
}

TollLogoElement.prototype.defaultLogo = "EZPass";
TollLogoElement.prototype.logos = {
  EZPass: { label: "E-ZPass", src: "assets/tolls/EZPass.png" },
  TollTag: { label: "TollTag", src: "assets/tolls/NTTA.svg" },
  TxTag: { label: "TxTag", src: "assets/tolls/TXTAG.svg" },
  EZTAG: { label: "EZ TAG Square", src: "assets/tolls/EZTAG.svg" },
  EZTAG2: { label: "EZ TAG Wide", src: "assets/tolls/EZTAG-Sign-Wide.svg" },
  EZTAG3: {
    label: "EZ TAG FHWA Wide",
    src: "assets/tolls/EZTAG-Sign-Wide-Alt.svg",
  },
  FasTrak: { label: "FasTrak", src: "assets/tolls/FASTrak.png" },
  FreedomPass: { label: "Freedom Pass", src: "assets/tolls/FREEDOMPASS.svg" },
  PeachPass: { label: "Peach Pass", src: "assets/tolls/PEACHPASS.svg" },
  PeachPassAlt: {
    label: "Peach Pass (alt)",
    src: "assets/tolls/PEACHPASS_ALT.png",
  },
  NCQuickPass: { label: "NC Quick Pass", src: "assets/tolls/NCQUICKPASS.svg" },
  EPASS: { label: "E-PASS", src: "assets/tolls/EPASS.svg" },
  SunPassOld: { label: "SunPass (old)", src: "assets/tolls/SUNPASS-1.svg" },
  SunPassNew: { label: "SunPass (new)", src: "assets/tolls/SUNPASS-2.svg" },
  ZipCash: { label: "ZipCash", src: "assets/tolls/ZIPCASH.svg" },
  LEEWAY: { label: "LeeWay", src: "assets/tolls/LEEWAY.svg" },
  KTAG: { label: "K-TAG", src: "assets/tolls/KTAG.svg" },
  PikePassOld: {
    label: "Pikepass (old)",
    src: "assets/tolls/PIKEPASS-OLD.svg",
  },
  PikePassNew: {
    label: "Pikepass (new)",
    src: "assets/tolls/PIKEPASS-NEW.svg",
  },
  PlatePay: { label: "PlatePay", src: "assets/tolls/PLATEPAY.svg" },
  PayByMail: { label: "Pay By Mail", src: "assets/tolls/PAY_BY_MAIL.png" },
  IPASS: { label: "I-Pass", src: "assets/tolls/I-Pass.svg" },
  GeauxPass: { label: "GeauxPass", src: "assets/tolls/GEAUXPASS.svg" },
  GoodToGo: { label: "Good To Go!", src: "assets/tolls/GOODTOGO.svg" },
  ExpressToll: { label: "ExpressToll", src: "assets/tolls/EXPRESSTOLL.svg" },
  DPASS: { label: "D-PASS", src: "assets/tolls/DPASS.svg" },
  MUTCD: { label: "MUTCD", src: "assets/tolls/MUTCD.svg" },
};
TollLogoElement.prototype.alignment = TextElement.prototype.alignment;

class Block {
  constructor({
    topPadding = 0,
    bottomPadding = 0,
    backgroundColor = "Inherit",
    backgroundFullWidth = true,
    width = 0,
    stretchLeft = true,
    stretchCenter = true,
    stretchRight = true,
  } = {}) {
    this.topPadding = topPadding;
    this.bottomPadding = bottomPadding;
    this.backgroundColor = backgroundColor;
    this.backgroundFullWidth = backgroundFullWidth;
    this.width = width;
    this.stretchLeft = stretchLeft;
    this.stretchCenter = stretchCenter;
    this.stretchRight = stretchRight;
  }
}

class Control {
  constructor({ rows = [], blockProperties = [] } = {}) {
    this.rows = rows;
    this.blockProperties = blockProperties;
  }

  addElement(element, properties, row, column) {
    let newElement = new element(properties);
    if (!this.rows[row]) {
      this.rows[row] = [];
      this.blockProperties[row] = new Block();
    }

    if (column) {
      this.rows[row].splice(column, 0, newElement);
    } else {
      this.rows[row].push(newElement);
    }
  }

  replaceElement(element, row, column) {
    let exisitngElement = this.rows[row][column];
    if (!exisitngElement) {
      return;
    }

    let newElement = new element();
    for (const key in exisitngElement) {
      if (exisitngElement.hasOwnProperty(key)) {
        newElement[key] = exisitngElement[key];
      }
    }
    this.rows[row][column] = newElement;
  }

  removeElement(row, column) {
    if (row == null || column == null) {
      return;
    }

    this.rows[row].splice(column, 1);
    if (this.rows[row].length == 0) {
      this.rows.splice(row, 1);
      this.blockProperties.splice(row, 1);
      return true;
    }
    return false;
  }

  addRow(row, element) {
    if (this.rows[row] && this.rows[row].length != 0) {
      this.rows.splice(row, 0, []);
      this.blockProperties.splice(row, 0, new Block());
    }
    this.addElement(Control.prototype.blockToClassElems[element], {}, row, 0);
  }

  duplicateRow(row) {
    let newRows = [];
    for (const e of this.rows[row]) {
      const blockElemType = Control.prototype.blockToClassElems.getElem(e);
      let newObject = structuredClone(e);
      newObject = Object.setPrototypeOf(
        newObject,
        Control.prototype.blockToClassElems[blockElemType].prototype,
      );

      newRows.push(newObject);
    }
    this.rows.splice(row + 1, 0, newRows);
    this.blockProperties.splice(row + 1, 0, new Block());
  }

  deleteRow(row) {
    this.rows.splice(row, 1);
    this.blockProperties.splice(row, 1);
  }

  createElement(panel, subPanel) {
    const flexBox = document.createElement("div");
    flexBox.className = "blockElementMaster";

    const parsePadding = (paddingString = "") => {
      const defaultPadding = {
        top: "0rem",
        right: "0rem",
        bottom: "0rem",
        left: "0rem",
      };

      if (!paddingString || typeof paddingString !== "string") {
        return defaultPadding;
      }

      const values = paddingString.trim().split(/\s+/).filter(Boolean);
      if (values.length === 0) {
        return defaultPadding;
      }

      if (values.length === 1) {
        return {
          top: values[0],
          right: values[0],
          bottom: values[0],
          left: values[0],
        };
      }

      if (values.length === 2) {
        return {
          top: values[0],
          right: values[1],
          bottom: values[0],
          left: values[1],
        };
      }

      if (values.length === 3) {
        return {
          top: values[0],
          right: values[1],
          bottom: values[2],
          left: values[1],
        };
      }

      return {
        top: values[0],
        right: values[1],
        bottom: values[2],
        left: values[3],
      };
    };

    const signPadding = parsePadding(panel?.sign?.padding);

    const totalRows = this.rows.length;
    for (let i = 0; i < totalRows; i++) {
      const row = this.rows[i];
      const properties = this.blockProperties[i];
      const topPadding = parseFloat(properties.topPadding) || 0;
      const bottomPadding = parseFloat(properties.bottomPadding) || 0;
      const topSpacing = topPadding + "rem";
      const bottomSpacing = bottomPadding + "rem";
      const bleedTop = i === 0 ? signPadding.top : "0rem";
      const bleedBottom = i === totalRows - 1 ? signPadding.bottom : "0rem";

      const flexRow = document.createElement("div");
      flexRow.className = "blockElementRow";
      flexRow.style.setProperty("--marginTop", topSpacing);
      flexRow.style.setProperty("--marginBottom", bottomSpacing);
      flexRow.style.setProperty("--blockPaddingTopExtra", "0rem");
      flexRow.style.setProperty("--blockPaddingBottomExtra", "0rem");
      const resolvedBackgroundColor =
        properties.backgroundColor == "Inherit"
          ? ""
          : (
              lib.colors[properties.backgroundColor] ||
              properties.backgroundColor
            ).toLowerCase();
      flexRow.style.setProperty(
        "--masterBlockBgColor",
        resolvedBackgroundColor,
      );

      const usesLightBleedBackground =
        properties.backgroundColor == "Orange" ||
        properties.backgroundColor == "White" ||
        properties.backgroundColor == "Yellow" ||
        properties.backgroundColor == "Fluorescent Yellow-Green" ||
        properties.backgroundColor == "Fluorescent Pink";

      if (properties.backgroundFullWidth) {
        flexRow.classList.add("fullBleed");
        flexRow.style.setProperty("--blockBleedLeft", signPadding.left);
        flexRow.style.setProperty("--blockBleedRight", signPadding.right);
        flexRow.style.setProperty("--blockBleedTop", bleedTop);
        flexRow.style.setProperty("--blockBleedBottom", bleedBottom);
        flexRow.style.width = "";
        flexRow.style.setProperty("--marginTop", "0rem");
        flexRow.style.setProperty("--marginBottom", "0rem");
        flexRow.style.setProperty("--blockPaddingTopExtra", topSpacing);
        flexRow.style.setProperty("--blockPaddingBottomExtra", bottomSpacing);
      } else {
        flexRow.classList.remove("fullBleed");
        flexRow.style.setProperty("--blockBleedLeft", "0rem");
        flexRow.style.setProperty("--blockBleedRight", "0rem");
        flexRow.style.setProperty("--blockBleedTop", "0rem");
        flexRow.style.setProperty("--blockBleedBottom", "0rem");
        flexRow.style.setProperty("--marginTop", topSpacing);
        flexRow.style.setProperty("--marginBottom", bottomSpacing);
        flexRow.style.width =
          properties.width == 0 ? "" : properties.width + "rem";
      }

      if (usesLightBleedBackground) {
        flexRow.style.color = "black";
        if (properties.backgroundFullWidth) {
          flexRow.dataset.fullBleedBorderColor =
            (lib.colors && lib.colors.Black) || "rgb(0, 0, 0)";
        }
      }

      const leftAlignment = document.createElement("div");
      leftAlignment.className = "blockElementLeft";
      const centerAlignment = document.createElement("div");
      centerAlignment.className = "blockElementCenter";
      const rightAlignment = document.createElement("div");
      rightAlignment.className = "blockElementRight";

      let lastKnownAlignment = centerAlignment;
      let dividerBorderColor = null;
      for (let i = 0; i < row.length; i++) {
        let elem = row[i];
        switch (elem.alignment) {
          case "Left":
            lastKnownAlignment = leftAlignment;
            break;
          case "Right":
            lastKnownAlignment = rightAlignment;
            break;
          case "Center":
            lastKnownAlignment = centerAlignment;
            break;
          default:
        }

        if (
          elem instanceof DividerElement &&
          elem.fullBleed === true &&
          dividerBorderColor === null
        ) {
          if (elem.dividerColor && elem.dividerColor !== "Default") {
            dividerBorderColor =
              lib.colors[elem.dividerColor] || elem.dividerColor;
          } else {
            dividerBorderColor = lib.colors.White || "white";
          }
        }

        lastKnownAlignment.appendChild(elem.createElement(panel, subPanel));
      }

      leftAlignment.style.flexGrow =
        properties.stretchLeft && leftAlignment.children.length > 0 ? "1" : "0";
      centerAlignment.style.flexGrow =
        properties.stretchCenter && centerAlignment.children.length > 0
          ? "1"
          : "0";
      rightAlignment.style.flexGrow =
        properties.stretchRight && rightAlignment.children.length > 0
          ? "1"
          : "0";

      if (dividerBorderColor) {
        flexRow.dataset.fullBleedBorderColor = dividerBorderColor.toLowerCase();
      }

      flexRow.dataset.lightBackground = usesLightBleedBackground
        ? "true"
        : "false";

      flexRow.appendChild(leftAlignment);
      flexRow.appendChild(centerAlignment);
      flexRow.appendChild(rightAlignment);
      flexBox.appendChild(flexRow);
    }

    return flexBox;
  }
}

Control.prototype.blockToClassElems = {
  ControlTextElement: ControlTextElement,
  DividerElement: DividerElement,
  ShieldGroupElement: ShieldGroupElement,
  AdvisoryMessageElement: AdvisoryMessageElement,
  IconElement: IconElement,
  BeaconElement: BeaconElement,
  ArrowElement: ArrowElement,
  TollLogoElement: TollLogoElement,
  ActionMessageElement: ActionMessageElement,
  ElectronicSignElement: ElectronicSignElement,
  getElem: (elemObj) => {
    for (const key in Control.prototype.blockToClassElems) {
      if (elemObj instanceof Control.prototype.blockToClassElems[key]) {
        return key;
      }
    }
    return null;
  },
};

Control.prototype.blockElements = {
  ControlTextElement: "Control Text",
  ActionMessageElement: "Action Message",
  AdvisoryMessageElement: "Advisory Message",
  ShieldGroupElement: "Shield Group",
  ArrowElement: "Arrow",
  DividerElement: "Divider",
  IconElement: "Icon",
  BeaconElement: "Flashing Beacon",
  TollLogoElement: "Toll Logo",
  ElectronicSignElement: "Electronic Sign",
};

Control.prototype.blockInternalElements = {
  ControlTextElement: "sdCtrlText",
  DividerElement: "sdBlocker",
  ShieldGroupElement: "sdShieldGroup",
  AdvisoryMessageElement: "sdAdvisory",
  IconElement: "sdIcon",
  BeaconElement: "sdBeacon",
  ArrowElement: "sdArrow",
  TollLogoElement: "sdTollLogo",
  ActionMessageElement: "sdActionMessage",
  ElectronicSignElement: "sdElectronicSign",
};
