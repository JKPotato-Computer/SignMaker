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
  }

  splitString() {
    let result = [this.textContent];
    let tagged = [];

    // Define the banner types to split by if useBannerFormating is true
    const numeralPattern = /(\d+\S*)|([\u00BC-\u00BE]+\S*)/;
    const bannerPattern = new RegExp(
      `(\\s*)(\\b(?:${Shield.prototype.bannerTypes.join("|")})\\b)(\\s*)`,
      "gi"
    );
    const lightBannerPattern = new RegExp(
      `(\\b(?:${Shield.prototype.bannerTypes.join("|")})\\b)`,
      "gi"
    );

    if (this.useBannerFormatting) {
      result = result[0].split(bannerPattern).filter(Boolean);
    }

    if (this.useNumeralFormatting) {
      let newResult = [];
      console.log(result);
      for (let i = 0; i < result.length; i++) {
        let currentResult = result[i].split(numeralPattern).filter(Boolean);
        newResult = newResult.concat(currentResult);
      }
      result = newResult;
    }

    for (let i = 0; i < result.length; i++) {
      let r = result[i];
      if (new RegExp(numeralPattern).test(r) && this.useNumeralFormatting) {
        tagged[i] = { type: "numeral", value: r };
      } else if (lightBannerPattern.test(r) && this.useBannerFormatting) {
        tagged[i] = { type: "banner", value: r };
      } else {
        tagged[i] = { type: "text", value: r };
      }
    }

    return tagged;
  }

  createElement(panel) {
    const newText = document.createElement("div");
    newText.className = "bE-textElement";

    // Set custom CSS properties here based off the this. properties
    newText.style.setProperty("--fontFamily", '"' + this.fontFamily + '"');
    newText.style.setProperty(
      "--fontSize",
      1.75 * (this.fontSize / 100) + "rem"
    );
    newText.style.setProperty(
      "--blockBgColor",
      this.backgroundColor == "Inherit"
        ? ""
        : (
            lib.colors[this.backgroundColor] || this.backgroundColor
          ).toLowerCase()
    );
    newText.style.setProperty("--alignment", this.alignment);
    newText.style.setProperty("--numeralSize", this.numeralFormattingSize);
    newText.style.setProperty("--bannerSize", this.bannerFormattingSize);
    newText.style.setProperty(
      "--bannerFirstLetterSize",
      this.bannerFirstLetterSize
    );

    if (
      this.backgroundColor == "Orange" ||
      this.backgroundColor == "White" ||
      this.backgroundColor == "Yellow"
    ) {
      newText.style.color = "black";
    }

    let splitTextContent = this.splitString();
    for (let i = 0; i < splitTextContent.length; i++) {
      let text = splitTextContent[i];
      if (text.value == "" || text.value == " ") {
        if (i + 1 >= splitTextContent.length) {
          continue;
        } else if (
          i + 1 < splitTextContent.length &&
          splitTextContent[i + 1].type != "banner" &&
          i - 1 > 0 &&
          splitTextContent[i - 1].type != "banner"
        ) {
          continue;
        }
      }

      const newTextFragment = document.createElement("span");
      newTextFragment.className = "bE-" + text.type;
      newTextFragment.textContent = text.value;

      newText.appendChild(newTextFragment);
    }

    return newText;
  }
}

TextElement.prototype.fontFamily = [
  "Clearview 3W",
  "Clearview 5WR",
  "Clearview 4W",
  "Series A",
  "Series B",
  "Series C",
  "Series D",
  "Series E",
  "Series EM",
  "Series F",
];

TextElement.prototype.alignment = ["Left", "Center", "Right"];

TextElement.prototype.backgroundColor = ["Inherit"].concat(
  Object.keys(lib.colors)
);

class ControlTextElement extends TextElement {
  constructor({
    spacing = 0,
    smallCapitals = false,
    firstLetterSize = 120,
  } = {}) {
    super();
    this.spacing = spacing;
    this.smallCapitals = smallCapitals;
    this.firstLetterSize = firstLetterSize;
  }

  createElement(panel) {
    const newText = super.createElement(panel);
    newText.style.setProperty("--spacing", this.spacing + "rem");
    newText.style.fontVariant = this.smallCapitals ? "small-caps" : "normal";
    newText.style.setProperty("--firstLetterSize", this.firstLetterSize);
    return newText;
  }
}

class ActionMessageElement extends TextElement {
  constructor({ useNumeralFormatting = true } = {}) {
    super();
    this.useNumeralFormatting = useNumeralFormatting;
  }
}

class AdvisoryMessageElement extends TextElement {
  constructor({
    backgroundColor = "Yellow",
    fontFamily = "Series E",
    formatNumeral = true,
    borderRadius = 4,
    useNumeralFormatting = true,
  } = {}) {
    super();
    this.backgroundColor = backgroundColor;
    this.fontFamily = fontFamily;
    this.formatNumeral = formatNumeral;
    this.borderRadius = borderRadius;
    this.useNumeralFormatting = useNumeralFormatting;
  }

  createElement(panel) {
    const newText = super.createElement(panel);
    newText.style.setProperty("--borderRadius", this.borderRadius + "px");
    newText.className = "bE-textElement bE-advisoryMessage";
    return newText;
  }
}

class ShieldElement extends Shield {
  constructor({ shieldBase = "I-", shieldType = "", routeNumber = 1 } = {}) {
    super();
    this.type = shieldBase;
    this.specialBannerType = shieldType;
    this.routeNumber = routeNumber;
  }
}

class DividerElement {
  constructor({
    dividerWidth = 100,
    dividerMeasurement = "%",
    dividerHeight = 0.5,
    alignment = "Center",
  } = {}) {
    this.dividerWidth = dividerWidth;
    this.dividerMeasurement = dividerMeasurement;
    this.dividerHeight = dividerHeight;
    this.alignment = alignment;
  }
}

DividerElement.prototype.dividerMeasurement = ["%", "rem"];

class IconElement {
  constructor({
    icon = "Airplane",
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
}

IconElement.prototype.icons = ["Airplane"];

class Control {
  constructor({ rows = [] } = {}) {
    this.rows = rows;
  }

  addElement(element, properties, row, column) {
    let newElement = new element(properties);
    if (!this.rows[row]) {
      this.rows[row] = [];
    }

    if (column) {
      this.rows[row].splice(column, 0, newElement);
    } else {
      this.rows[row].push(newElement);
    }
  }

  removeElement(row, column) {
    if (row == null || column == null) {
      return;
    }

    this.rows[row].splice(column, 1);
    if (this.rows[row].length == 0) {
      this.rows.splice(row, 1);
      return true;
    }
    return false;
  }

  addRow(row) {
    this.addElement(ControlTextElement, {}, row, 0);
  }

  duplicateRow(row) {
    let newRows = [];
    for (const e of this.rows[row]) {
      const blockElemType = Control.prototype.blockToClassElems.getElem(e);
      newRows.push(
        Object.assign(
          new Control.prototype.blockToClassElems[blockElemType](),
          e
        )
      );
    }
    this.rows.splice(row + 1, 0, newRows);
  }

  deleteRow(row) {
    this.rows.splice(row, 1);
  }

  createElement(panel, subPanel) {
    const flexBox = document.createElement("div");
    flexBox.className = "blockElementMaster";

    for (const row of this.rows) {
      const flexRow = document.createElement("div");
      flexRow.className = "blockElementRow";

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
  ShieldElement: ShieldElement,
  AdvisoryMessageElement: AdvisoryMessageElement,
  IconElement: IconElement,
  ActionMessageElement: ActionMessageElement,
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
  DividerElement: "Divider",
  ShieldElement: "Shield",
  AdvisoryMessageElement: "Advisory Message",
  IconElement: "Icon",
  ActionMessageElement: "Action Message",
};

Control.prototype.blockInternalElements = {
  ControlTextElement: "sdCtrlText",
  DividerElement: "sdBlocker",
  ShieldElement: "sdShield",
  AdvisoryMessageElement: "sdAdvisory",
  IconElement: "sdIcon",
  ActionMessageElement: "sdActionMessage",
};
