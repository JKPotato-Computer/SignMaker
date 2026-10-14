// Control.js

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
    wordSpacing = 0,
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
    this.wordSpacing = wordSpacing;
    this.textAlign = textAlign;
  }

  splitString(text) {
    let result = [text];
    let tagged = [];

    const numeralPattern = /(\d+\/\d+)|(\d\S*)/g;

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
          .map((val) => val.replace(numeralPattern, (match) => match));
        newResult = newResult.concat(currentResult);
      }
      result = newResult;
    }

    result = result.map((val) =>
      val.replace(/\\t/g, "\t").replace(/\\n/g, "\n"),
    );
    for (let i = 0; i < result.length; i++) {
      let r = result[i];
      if (numeralPattern.test(r) && this.useNumeralFormatting) {
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
    newText.style.setProperty("--wordSpacing", this.wordSpacing + "rem");
    if (usesHighwayGothic) {
      newText.style.setProperty(
        "--fhwaBaselineOffset",
        "var(--fhwaBaselineShift)",
      );
    }

    if (lib.checkForContrast(this.backgroundColor.toLowerCase())) {
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
        if (/\d+\/\d+/g.test(text.value) && text.type == "numeral") {
          let firstFrac = text.value.split("/")[0];
          let secondFrac = text.value.split("/")[1];

          const fractionHolder = document.createElement("div");
          fractionHolder.className = "bE-fraction";

          const numerator = document.createElement("span");
          numerator.className = "bE-numerator";
          numerator.textContent = firstFrac;

          const denominator = document.createElement("span");
          denominator.className = "bE-denominator";
          denominator.textContent = secondFrac;

          const slash = document.createElement("span");
          slash.className = "bE-slash";
          slash.textContent = "/";

          fractionHolder.appendChild(numerator);
          fractionHolder.appendChild(slash);
          fractionHolder.appendChild(denominator);
          lineElement.appendChild(fractionHolder);
        } else {
          const newTextFragment = document.createElement("span");
          newTextFragment.className = "bE-" + text.type;
          newTextFragment.textContent = text.value;

          lineElement.appendChild(newTextFragment);
        }
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
  constructor({ smallCapitals = false, wordSpacing = 0 } = {}) {
    super();
    this.smallCapitals = smallCapitals;
    this.wordSpacing = wordSpacing;
  }

  createElement() {
    const newText = super.createElement();
    newText.style.fontVariant = this.smallCapitals ? "small-caps" : "normal";
    newText.classList.add("bE-controlTextElement");
    return newText;
  }
}

class ActionMessageElement extends TextElement {
  constructor({
    fontSize = 70,
    useNumeralFormatting = true,
    wordSpacing = 0,
  } = {}) {
    super();
    this.fontSize = fontSize;
    this.useNumeralFormatting = useNumeralFormatting;
    this.wordSpacing = wordSpacing;
  }

  createElement() {
    const newText = super.createElement();
    newText.classList.add("bE-actionMessageElement");
    return newText;
  }
}

class AdvisoryMessageElement extends TextElement {
  constructor({
    backgroundColor = "Yellow",
    fontFamily = "Series E",
    borderRadius = 4,
    border = false,
    borderWidth = 2,
    borderColor = "White",
    useNumeralFormatting = true,
    horizPadding = 0.3,
    vertPadding = 0.2,
    wordSpacing = 0,
  } = {}) {
    super();
    this.borderColor = borderColor;
    this.backgroundColor = backgroundColor;
    this.fontFamily = fontFamily;
    this.borderRadius = borderRadius;
    this.border = border;
    this.borderWidth = borderWidth;
    this.useNumeralFormatting = useNumeralFormatting;
    this.horizPadding = horizPadding;
    this.vertPadding = vertPadding;
    this.wordSpacing = wordSpacing;
  }

  createElement() {
    const newText = super.createElement();
    newText.style.setProperty("--borderRadius", this.borderRadius + "px");
    newText.style.setProperty("--horizPadding", this.horizPadding);
    newText.style.setProperty("--vertPadding", this.vertPadding);

    if (this.border) {
      newText.style.border = this.borderWidth + "px solid";
      newText.style.borderColor = this.borderColor;
    }

    newText.className = "bE-textElement bE-advisoryMessage";

    return newText;
  }
}

class ElectronicSignElement extends TextElement {
  constructor({
    fontFamily = "Electronic Highway Sign",
    textColor = "Orange",
    horizPadding = 0.5,
    vertPadding = 0.5,
    glow = true,
    setWidth = 0,
    wordSpacing = 0,
  } = {}) {
    super();
    this.fontFamily = fontFamily;
    this.textColor = textColor;
    this.useNumeralFormatting = false;
    this.useBannerFormatting = false;
    this.horizPadding = horizPadding;
    this.vertPadding = vertPadding;
    this.glow = glow;
    this.setWidth = setWidth;
    this.wordSpacing = wordSpacing;
    Object.defineProperty(this, "backgroundColor", {
      get: function () {
        return "Black";
      },
      set: function () {},
    });
  }

  createElement(panel) {
    const newText = super.createElement(panel);
    newText.className = "bE-textElement bE-electronicSign";
    newText.style.setProperty(
      "--textColor",
      (lib.colors[this.textColor] || this.textColor).toLowerCase(),
    );
    newText.style.setProperty("--horizPadding", this.horizPadding + "rem");
    newText.style.setProperty("--vertPadding", this.vertPadding + "rem");
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
  TextElement.prototype.fontFamily.concat([
    "Electronic Highway Sign",
    "VCR Mono",
  ]);
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

      newDivider.style.setProperty(
        "--dividerBleedLeft",
        `${panel.sign.paddingLeft + 0.2}rem`,
      );
      newDivider.style.setProperty(
        "--dividerBleedRight",
        `${panel.sign.paddingRight + 0.2}rem`,
      );
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
    iconType = "preset",
    iconData = "",
    iconSize = 100,
    backgroundColor = "Inherit",
    border = false,
    borderRadius = 4,
    borderColor = "White",
    spacing = 4,
  } = {}) {
    this.icon = icon;
    this.iconType = iconType;
    this.iconData = iconData;
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

    if (this.iconType == "custom") {
      iconHolder.style.aspectRatio = "unset";
    }

    iconHolder.style.setProperty(
      "--iconBackgroundColor",
      lib.colors[this.backgroundColor] || this.backgroundColor,
    );

    const iconElement = document.createElement("img");
    iconElement.src =
      this.iconType === "custom"
        ? this.iconData
        : `./assets/icons/${this.icons[this.icon]}`;
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
    arrow = "TYPE_A",
    rotation = 0,
    size = 1.75,
    marginHorizontal = 0,
    marginVertical = 0,
    flip = false,
    paddingHorizontal = 0,
    paddingVertical = 0,
    alignment = "Center",
  } = {}) {
    this.standardArrow = new StandardArrow({
      arrow,
      rotation,
      size,
      marginHorizontal,
      marginVertical,
      flip,
    });
    this.alignment = alignment;
    this.paddingHorizontal = paddingHorizontal;
    this.paddingVertical = paddingVertical;
    this.marginHorizontal = marginHorizontal;
    this.marginVertical = marginVertical;
  }

  createElement() {
    const container = document.createElement("div");
    container.className = "bE-arrowElement";
    container.style.setProperty(
      "--arrowPaddingHorizontal",
      this.paddingHorizontal + "rem",
    );
    container.style.setProperty(
      "--arrowPaddingVertical",
      this.paddingVertical + "rem",
    );

    const arrow = this.standardArrow.createElement();
    container.appendChild(arrow);

    return container;
  }
}

class TollLogoElement {
  constructor({
    logo = TollLogoElement.prototype.defaultLogo,
    logoHeight = 3,
    spacing = 0,
    horizontalPadding = 0.25,
    verticalPadding = 0.25,
    background = false,
    backgroundColor = "Purple",
    alignment = "Center",
    squareIcon = false,

    containerBorderRadius = 8,
    tollBorderRadius = 8,
    onlyBorderRadius = 4,

    border = 3,
    showOnlyBlock = false,
    onlyBlockDirection = "Horizontal",
    onlyBlockSpacing = 0.25,
    onlyBlockFontSize = 24,
    fontFamily = "Series D",
    onlyBlockHorizPadding = 0.2,
    onlyBlockVertPadding = 0.25,
    containerHorizontalPadding = 0.25,
    containerVerticalPadding = 0.25,
    containerBorderWidth = 0,
    containerBackgroundColor = "Purple",
  } = {}) {
    this.logo = logo;
    this.logoHeight = logoHeight;
    this.spacing = spacing;
    this.background = background;
    this.squareIcon = squareIcon;
    this.tollBorderRadius = tollBorderRadius;
    this.containerBorderRadius = containerBorderRadius;
    this.onlyBorderRadius = onlyBorderRadius;
    this.border = border;
    this.backgroundColor = backgroundColor;
    this.horizontalPadding = horizontalPadding;
    this.verticalPadding = verticalPadding;
    this.showOnlyBlock = showOnlyBlock;
    this.onlyBlockDirection = onlyBlockDirection;
    this.onlyBlockSpacing = onlyBlockSpacing;
    this.onlyBlockFontSize = onlyBlockFontSize;
    this.fontFamily = fontFamily;
    this.onlyBlockHorizPadding = onlyBlockHorizPadding;
    this.onlyBlockVertPadding = onlyBlockVertPadding;
    this.containerHorizontalPadding = containerHorizontalPadding;
    this.containerVerticalPadding = containerVerticalPadding;
    this.containerBorderWidth = containerBorderWidth;
    this.containerBackgroundColor = containerBackgroundColor;
    this.alignment = alignment;
  }

  createElement() {
    const container = document.createElement("div");
    container.className =
      "bE-tollLogoElement" + (this.squareIcon ? " squareIcon" : "");

    const imgHolder = document.createElement("div");
    imgHolder.className = "bE-tollLogoImageHolder";
    container.appendChild(imgHolder);

    const img = document.createElement("img");
    img.src = TollLogoElement.prototype.logos[this.logo].src;
    imgHolder.appendChild(img);

    imgHolder.style.setProperty("--tollLogoHeight", this.logoHeight + "rem");

    if (this.background) {
      imgHolder.classList.add("hasBackground");

      if (this.backgroundColor != "Inherit") {
        imgHolder.style.setProperty(
          "--tollBgColor",
          lib.colors[this.backgroundColor] ||
            this.backgroundColor.toLowerCase(),
        );
      }

      imgHolder.style.setProperty(
        "--logoHorizontalPadding",
        this.horizontalPadding + "rem",
      );
      imgHolder.style.setProperty(
        "--logoVerticalPadding",
        this.verticalPadding + "rem",
      );
      imgHolder.style.setProperty("--tollBorderWidth", this.border + "px");

      imgHolder.style.setProperty(
        "--tollBorderRadius",
        this.tollBorderRadius + "px",
      );

      if (lib.checkForContrast(this.backgroundColor.toLowerCase())) {
        imgHolder.style.borderColor = "black";
      } else {
        imgHolder.style.borderColor = "white";
      }
    }

    container.style.setProperty("--spacing", this.spacing + "rem");

    if (this.showOnlyBlock) {
      container.style.setProperty(
        "--onlyBlockDirection",
        TollLogoElement.prototype.direction[this.onlyBlockDirection],
      );
      container.style.setProperty(
        "--onlyBlockSpacing",
        this.onlyBlockSpacing + "rem",
      );
      container.style.setProperty(
        "--onlyBlockFontFamily",
        '"' + this.fontFamily + '"',
      );
      container.style.setProperty(
        "--onlyBlockFontSize",
        this.onlyBlockFontSize + "px",
      );
      container.style.setProperty(
        "--onlyBlockHorizPadding",
        this.onlyBlockHorizPadding + "rem",
      );
      container.style.setProperty(
        "--onlyBlockVertPadding",
        this.onlyBlockVertPadding + "rem",
      );
      container.style.setProperty(
        "--containerHorizontalPadding",
        this.containerHorizontalPadding + "rem",
      );
      container.style.setProperty(
        "--containerVerticalPadding",
        this.containerVerticalPadding + "rem",
      );
      container.style.setProperty(
        "--containerBorderWidth",
        this.containerBorderWidth + "px",
      );
      container.style.setProperty(
        "--containerBackgroundColor",
        lib.colors[this.containerBackgroundColor] ||
          this.containerBackgroundColor.toLowerCase(),
      );
      container.style.setProperty(
        "--containerBorderRadius",
        this.containerBorderRadius + "px",
      );
      container.style.setProperty(
        "--onlyBorderRadius",
        this.onlyBorderRadius + "px",
      );

      const onlyBlock = document.createElement("div");
      onlyBlock.className = "bE-tollOnlyBlock";
      onlyBlock.textContent = "ONLY";
      container.appendChild(onlyBlock);
      container.classList.add("hasOnlyBlock");

      if (lib.checkForContrast(this.backgroundColor.toLowerCase())) {
        container.style.borderColor = "black";
        onlyBlock.style.color = "white";
        onlyBlock.style.backgroundColor = "black";
      } else {
        container.style.borderColor = "white";
        onlyBlock.style.backgroundColor = "white";
        onlyBlock.style.color = "black";
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
  IPASS2: { label: "I-Pass (new)", src: "assets/tolls/IPASS-NEW.svg" },
  GeauxPass: { label: "GeauxPass", src: "assets/tolls/GEAUXPASS.svg" },
  GoodToGo: { label: "Good To Go!", src: "assets/tolls/GOODTOGO.svg" },
  ExpressToll: { label: "ExpressToll", src: "assets/tolls/EXPRESSTOLL.svg" },
  DPASS: { label: "D-PASS", src: "assets/tolls/DPASS.svg" },
  MUTCD: { label: "MUTCD", src: "assets/tolls/MUTCD.svg" },
};
TollLogoElement.prototype.alignment = TextElement.prototype.alignment;
TollLogoElement.prototype.direction = {
  Horizontal: "row",
  Vertical: "column",
};

class Block {
  constructor({
    topMargin = 0,
    topPadding = 0,

    bottomMargin = 0,
    bottomPadding = 0,

    leftPadding = 0,
    rightPadding = 0,

    backgroundColor = "Inherit",
    backgroundFullWidth = true,
    width = 0,
    stretchLeft = true,
    stretchCenter = true,
    stretchRight = true,
  } = {}) {
    this.topMargin = topMargin;
    this.topPadding = topPadding;
    this.bottomMargin = bottomMargin;
    this.bottomPadding = bottomPadding;
    this.backgroundColor = backgroundColor;
    this.backgroundFullWidth = backgroundFullWidth;
    this.width = width;
    this.stretchLeft = stretchLeft;
    this.stretchCenter = stretchCenter;
    this.stretchRight = stretchRight;
    this.leftPadding = leftPadding;
    this.rightPadding = rightPadding;
  }
}

// basically control but w/o some of the block properties
class GroupElement {
  constructor({ blockElements, direction = "Vertical", width = 0 } = {}) {
    if (this.blockElements) {
      this.blockElements = blockElements;
    } else {
      this.blockElements = new Control();
      this.blockElements.addElement(ControlTextElement, {}, 0, 0);
    }

    this.blockElements.isGroup = true;
    this.direction = direction;
    this.width = width;
  }

  createElement(panel, subPanel) {
    const blockElementHolder = this.blockElements.createElement(
      panel,
      subPanel,
    );
    if (this.direction == "Horizontal") {
      blockElementHolder.style.flexDirection = "row";
    } else {
      blockElementHolder.style.flexDirection = "column";
    }

    if (this.width > 0) {
      blockElementHolder.style.width = this.width + "rem";
    }

    return blockElementHolder;
  }
}
GroupElement.prototype.blockDirection = ["Horizontal", "Vertical"];

class Control {
  constructor({ rows = [], blockProperties = [], isGroup = false } = {}) {
    this.rows = rows;
    this.blockProperties = blockProperties;
    this.isGroup = isGroup;
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

    const totalRows = this.rows.length;
    for (let i = 0; i < totalRows; i++) {
      const row = this.rows[i];
      const properties = this.blockProperties[i];

      const flexRow = document.createElement("div");
      flexRow.className = "blockElementRow";

      flexRow.style.setProperty("--marginTop", `${properties.topMargin}rem`);
      flexRow.style.setProperty(
        "--marginBottom",
        `${properties.bottomMargin}rem`,
      );

      flexRow.style.setProperty(
        "--blockPaddingLeft",
        `${properties.leftPadding}rem`,
      );
      flexRow.style.setProperty(
        "--blockPaddingRight",
        `${properties.rightPadding}rem`,
      );
      flexRow.style.setProperty(
        "--blockPaddingTop",
        `${properties.topPadding}rem`,
      );
      flexRow.style.setProperty(
        "--blockPaddingBottom",
        `${properties.bottomPadding}rem`,
      );

      flexRow.style.setProperty(
        "--masterBlockBgColor",
        properties.backgroundColor == "Inherit"
          ? ""
          : (
              lib.colors[properties.backgroundColor] ||
              properties.backgroundColor
            ).toLowerCase(),
      );

      const blockBackgroundColor = (
        properties.backgroundColor == "Inherit"
          ? lib.colors[panel.color] || panel.color
          : lib.colors[properties.backgroundColor] || properties.backgroundColor
      ).toLowerCase();
      const usesBlackBorder = lib.checkForContrast(blockBackgroundColor);
      flexRow.dataset.blockBackgroundColor = blockBackgroundColor;
      flexRow.dataset.blockBorderColor = usesBlackBorder ? "black" : "white";

      if (
        properties.backgroundFullWidth &&
        panel.sign.arrows.arrowMode != "diagrammic"
      ) {
        flexRow.classList.add("fullBleed");

        flexRow.style.setProperty(
          "--blockBleedLeft",
          `${panel.sign.paddingLeft}rem`,
        );
        flexRow.style.setProperty(
          "--blockBleedRight",
          `${panel.sign.paddingRight}rem`,
        );
        flexRow.style.setProperty(
          "--blockBleedTop",
          i == 0 ? `${panel.sign.paddingTop}rem` : "0rem",
        );
        flexRow.style.setProperty(
          "--blockBleedBottom",
          i == totalRows - 1 ? `${panel.sign.paddingBottom}rem` : "0rem",
        );

        flexRow.style.setProperty("--marginBorderLeft", "0rem");
        flexRow.style.setProperty("--marginBorderRight", "0rem");
        flexRow.style.setProperty("--marginBorderTop", "0rem");
        flexRow.style.setProperty("--marginBorderBottom", "0rem");

        if (totalRows == 1 && panel.sign.subPanels.length == 1) {
          flexRow.style.setProperty(
            "--blockBorderRadiusTopLeft",
            `${panel.borderRadius}rem`,
          );
          flexRow.style.setProperty(
            "--blockBorderRadiusTopRight",
            `${panel.borderRadius}rem`,
          );
          flexRow.style.setProperty(
            "--blockBorderRadiusBottomLeft",
            `${panel.borderRadius}rem`,
          );
          flexRow.style.setProperty(
            "--blockBorderRadiusBottomRight",
            `${panel.borderRadius}rem`,
          );
        }

        if (i == totalRows - 1 && panel.sign.subPanels[0] === subPanel) {
          flexRow.style.setProperty(
            "--blockBorderRadiusBottomLeft",
            `${panel.borderRadius}rem`,
          );
        }

        if (
          i == totalRows - 1 &&
          panel.sign.subPanels[panel.sign.subPanels.length - 1] === subPanel
        ) {
          flexRow.style.setProperty(
            "--blockBorderRadiusBottomRight",
            `${panel.borderRadius}rem`,
          );
        }

        if (i == 0 && panel.sign.subPanels[0] === subPanel) {
          flexRow.style.setProperty(
            "--blockBorderRadiusTopLeft",
            `${panel.borderRadius}rem`,
          );
        }

        if (
          i == 0 &&
          panel.sign.subPanels[panel.sign.subPanels.length - 1] === subPanel
        ) {
          flexRow.style.setProperty(
            "--blockBorderRadiusTopRight",
            `${panel.borderRadius}rem`,
          );
        }

        if (
          panel.color != properties.backgroundColor &&
          properties.backgroundColor != "Inherit"
        ) {
          if (i == 0) {
            flexRow.style.borderTop = `.2rem solid`;
            flexRow.style.setProperty("--marginBorderTop", "-0.2rem");
          }

          if (i == totalRows - 1) {
            flexRow.style.borderBottom = `.2rem solid`;
            flexRow.style.setProperty("--marginBorderBottom", "-0.2rem");
          }

          if (panel.sign.subPanels[0] === subPanel) {
            flexRow.style.borderLeft = `.2rem solid`;
            flexRow.style.setProperty("--marginBorderLeft", "-0.2rem");
          }

          if (
            panel.sign.subPanels[panel.sign.subPanels.length - 1] === subPanel
          ) {
            flexRow.style.borderRight = `.2rem solid`;
            flexRow.style.setProperty("--marginBorderRight", "-0.2rem");
          }
        }
      } else {
        flexRow.style.width =
          properties.width == 0 ? "" : properties.width + "rem";
      }

      if (
        lib.checkForContrast(
          properties.backgroundColor == "Inherit"
            ? ""
            : (
                lib.colors[properties.backgroundColor] ||
                properties.backgroundColor
              ).toLowerCase(),
        )
      ) {
        flexRow.style.borderColor = "black";
        flexRow.style.color = "black";
      }

      const leftAlignment = document.createElement("div");
      leftAlignment.className = "blockElementLeft";
      const centerAlignment = document.createElement("div");
      centerAlignment.className = "blockElementCenter";
      const rightAlignment = document.createElement("div");
      rightAlignment.className = "blockElementRight";

      let lastKnownAlignment = centerAlignment;
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
  GroupElement: GroupElement,
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
  GroupElement: "Group Element",
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
  GroupElement: "sdGroup",
};
