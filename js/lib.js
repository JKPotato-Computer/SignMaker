const lib = (function() {

	/**
	 * Clears out the children from a given element.
	 * @param {Element} parentElmt - Parent element to be cleared of children.
	 */
	const clearChildren = function(parentElmt) {
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
	const appendOption = function(selectElmt, value, {selected = false, text} = {}) {
		if (!text) {
			text = value;
		}
		const optionElmt = document.createElement("option");
		optionElmt.value = value;
		optionElmt.selected = selected;
		optionElmt.appendChild(document.createTextNode(text));
		selectElmt.appendChild(optionElmt);
	};

	// FHW-defined colors.
	const colors = {
		Green : "rgb(0, 95, 77)",
		Blue : "rgb(0, 67, 123)",
		Brown : "rgb(98, 51, 30)",
		Yellow : "rgb(255, 178, 0)",
		White : "rgb(255, 255, 255)",
		Black : "rgb(0, 0, 0)",
        Purple : "#4B0082",
		Orange : "rgb(255, 89, 4)"
	};


	const shieldPositions = {
		Left : "row",
		Above : "column",
		Right : "row-reverse"
	};

	return {
		clearChildren : clearChildren,
		appendOption : appendOption,
		colors : colors,
		shieldPositions : shieldPositions
	};
})();
