const ColorLibrary = (() => {
  const colorLibrary = {};
  let defaultColors = [];

  const updateDefaultColors = () => {
    // pre-req; post exists
    const post = App.getPost();
    if (!post) {
      return;
    }

    let mutcdVariant = post.mutcdVariant;
    let colorsList = {
      ...MUTCDVariants.MUTCD.VariantInfo.ColorPalette,
      ...MUTCDVariants[mutcdVariant].VariantInfo.ColorPalette,
    };

    for (const color in colorLibrary) {
      delete colorLibrary[color];
    }

    defaultColors = Object.keys(colorsList);

    for (const color in colorsList) {
      colorLibrary[color] = colorsList[color];
    }

    for (const color in post.userColors) {
      colorLibrary[color] = post.userColors[color];
    }
  };

  const isDefaultColor = (color) => {
    return defaultColors.includes(color);
  };

  const addColor = (colorName, colorValue) => {
    const post = App.getPost();
    if (!post) {
      return;
    }

    if (colorLibrary[colorName] || defaultColors.includes(colorName)) {
      return;
    }

    if (colorName.trim() == "") {
      return;
    }

    if (!/^#[0-9A-F]{6}$/i.test(colorValue)) {
      return;
    }

    colorLibrary[colorName] = colorValue;
    post.userColors[colorName] = colorValue;
  };

  const updateColor = (oldColorName, newColorName, newColorValue) => {
    const post = App.getPost();
    if (!post) {
      return;
    }

    if (!colorLibrary[oldColorName]) {
      return;
    }

    if (colorLibrary[newColorName] && oldColorName !== newColorName) {
      return;
    }

    if (defaultColors.includes(oldColorName) || defaultColors.includes(newColorName)) {
      return;
    }

    if (oldColorName !== newColorName) {
      delete colorLibrary[oldColorName];
      delete post.userColors[oldColorName];
    }

    colorLibrary[newColorName] = newColorValue;
    post.userColors[newColorName] = newColorValue;
  };

  const removeColor = (colorName) => {
    const post = App.getPost();
    if (!post) {
      return;
    }

    if (!colorLibrary[colorName]) {
      return;
    }

    if (defaultColors.includes(colorName)) {
      return;
    }

    delete colorLibrary[colorName];
    delete post.userColors[colorName];
  };

  const checkForContrast = (color) => {
    let col = colorLibrary[color] || color;

    if (!/^#[0-9A-F]{6}$/i.test(col)) {
      return;
    }

    let r = parseInt(col.substring(1, 3), 16) / 255;
    let g = parseInt(col.substring(3, 5), 16) / 255;
    let b = parseInt(col.substring(5, 7), 16) / 255;

    let r_l = r < 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    let g_l = g < 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    let b_l = b < 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    let l = 0.2126 * r_l + 0.7152 * g_l + 0.0722 * b_l;

    if (r == 1 && g == 0 && b == 0) {
      // red is white for some reason
      return false;
    }

    return l > 0.1791;
  };

  return {
    colorLibrary,
    addColor,
    updateColor,
    removeColor,
    updateDefaultColors,
    checkForContrast,
    isDefaultColor,
  };
})();

window.ColorLibrary = ColorLibrary;
