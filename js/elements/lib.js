const lib = (function () {
  const clearChildren = function (parentElmt) {
    while (parentElmt.firstChild) {
      parentElmt.removeChild(parentElmt.firstChild);
    }
  };

  /**
   * Creates and appends an option element to a given Select element.
   * @param {Element} selectElmt - Select element to be appended to.
   * @param {string} value - Value to be held by the option.
   * @param {boolean} [selected=false] - Whether or not the new option should be auto-selected.
   * @param {string} [text] - Display text for the option.
   */
  const appendOption = function (
    selectElmt,
    value,
    { selected = false, text } = {},
  ) {
    if (!text) {
      text = value;
    }
    const optionElmt = document.createElement("option");
    optionElmt.value = value;
    optionElmt.selected = selected;
    optionElmt.appendChild(document.createTextNode(text));
    selectElmt.appendChild(optionElmt);
    return optionElmt;
  };

  const deepMerge = (target, source) => {
    for (const key of Object.keys(source)) {
      if (
        source[key] instanceof Object &&
        key in target &&
        !Array.isArray(source[key])
      ) {
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  };

  // FHW-defined colors.
  const colors = {
    Green: "rgb(0, 95, 77)",
    Blue: "rgb(0, 67, 123)",
    Brown: "rgb(98, 51, 30)",
    Yellow: "rgb(252, 207, 52)",
    White: "rgb(255, 255, 255)",
    Black: "rgb(0, 0, 0)",
    Purple: "#4B0082",
    Orange: "rgb(255, 89, 4)",
    Red: "rgb(255, 0, 0)",
    "Fluorescent Pink": "rgb(255, 51, 204)",
    "Fluorescent Yellow-Green": "rgb(153, 255, 0)",
    "Avarian Green": "rgb(0, 64, 64)",
    "Avarian Blue": "rgb(0, 47, 108)",
    "Avarian Brown": "rgb(105, 63, 35)",
    "Avarian Yellow": "rgb(254, 209, 65)",
    "Avarian Purple": "rgb(105, 13, 163)",
    "Avarian Orange": "rgb(229, 114, 0)",
    "Avarian Red": "rgb(175, 39, 47)",
    "Avarian Coral": "rgb(223, 70, 97)",
  };

  const checkForContrast = (color) => {
    let contrastColors = [
      "white",
      "orange",
      "yellow",
      "fluorescent pink",
      "flourescent yellow-green",
    ];
    if (contrastColors.includes(color)) {
      return true;
    }

    color = color.replace(/(rgb\()|\)/g, "");
    color = color.split(",");
    let r = parseInt(color[0]) / 255;
    let g = parseInt(color[1]) / 255;
    let b = parseInt(color[2]) / 255;

    let r_l = r < 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    let g_l = g < 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    let b_l = b < 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    let l = 0.2126 * r_l + 0.7152 * g_l + 0.0722 * b_l;
    return l > 0.1791;
  };

  return {
    clearChildren,
    appendOption,
    colors,
    checkForContrast,
    deepMerge,
  };
})();
