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

  const isClass = function (obj) {
    return (
      typeof obj === "function" &&
      /^class\s/.test(Function.prototype.toString.call(obj))
    );
  };

  return {
    clearChildren,
    appendOption,
    isClass,
  };
})();
