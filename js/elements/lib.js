const lib = (function () {
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

  function clone(objToCopy) {
    if (objToCopy === null || typeof objToCopy !== "object") {
      return objToCopy;
    }

    if (Array.isArray(objToCopy)) {
      return objToCopy.map(clone);
    }

    const newObj = Object.create(Object.getPrototypeOf(objToCopy));
    for (const key of Object.keys(objToCopy)) {
      if (key === "constructor") {
        continue;
      }
      newObj[key] = clone(objToCopy[key]);
    }

    return newObj;
  }

  return {
    appendOption,
    isClass,
    clone,
  };
})();
