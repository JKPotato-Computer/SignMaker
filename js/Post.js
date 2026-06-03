class Post {
	/**
	 * Post that contains the panels.
	 * @param {string} polePosition - Position of the poles on which to display the panels.
	 * @param {number} [lanesWide=1] - How many lanes wide the post should appear to be.
	 * @param {string} [color=Post.prototype.colors[0]] - Visual color treatment for the post.
	 */
	constructor(polePosition, lanesWide = 1, color = Post.prototype.colors?.[0]) {
		if (this.polePositions.includes(polePosition)) {
			this.polePosition = polePosition;
		} else {
			this.polePosition = this.polePositions[0];
		}
		if (lanesWide >= 1 && lanesWide <= 6) {
			this.lanesWide = lanesWide;
		} else {
			this.lanesWide = 1;
		}
		const availableColors = Array.isArray(Post.prototype.colors)
			? Post.prototype.colors
			: ["Silver"];
		if (availableColors.includes(color)) {
			this.color = color;
		} else {
			this.color = availableColors[0];
		}

		const defaultThickness =
			typeof Post.prototype.defaultThickness === "number"
				? Post.prototype.defaultThickness
				: 1;
		this.thickness = this.normalizeThickness(defaultThickness);

		this.panels = [];
		this.panelSpacing = 0;
		this.panelOrientation = this.normalizePanelOrientation(
			Post.prototype.defaultPanelOrientation
		);
		this.copySignsOnly = true;
		this.copyScale = 8;
		this.showBlockBoundingBoxes = false;
	}

	/**
	 * Create a new panel for the post. Add it to the end of the list of existing panels.
	 */
	newPanel() {
		const newSign = new Sign();
		newSign.newSubPanel();


		const newPanel = new Panel(newSign, undefined);
		const exitTab = new ExitTab();
		newPanel.exitTabs.push(exitTab);

		this.panels.push(newPanel);
	}

	/**
	 * Duplicate an existing panel. Add it immediately after the panel being duplicated.
	 * @param {number} panelIndex - Position of the panel in the array of panels on this post.
	 */
	duplicatePanel(panelIndex) {
		const existingPanel = this.panels[panelIndex];
		if (!existingPanel) {
			return;
		}

		const newPanel = Post.clonePanel(existingPanel);
		this.panels.splice(panelIndex + 1, 0, newPanel);
	}

	/**
	 * Delete an existing panel at the requested index.
	 * @param {number} panelIndex - Position of the panel in the array of panels on this post to delete.
	 */
	deletePanel(panelIndex) {
		this.panels.splice(panelIndex, 1);
	}

	/**
	 * Shift the requested panel to the left one position swapping it with that panel to the left.
	 * @param {number} panelIndex - Position of the panel in the array of panels on this post to shift left.
	 * @return {number} The new index of the shifted panel.
	 */
	shiftLeft(panelIndex) {
		// If already at the far left end, return.
		if (panelIndex <= 0) {
			return panelIndex;
		}
		this.panels.splice(panelIndex - 1, 2, this.panels[panelIndex], this.panels[panelIndex - 1]);
		return panelIndex - 1;
	}

	/**
	 * Shift the requested panel to the right one position swaping it with that panel to the right.
	 * @param {number} panelIndex - Position of the panel in the array of panels on this post to shift right.
	 * @return {number} The new index of the shifted panel.
	 */
	shiftRight(panelIndex) {
		// If already at the far right end, return.
		if (panelIndex >= this.panels.length - 1) {
			return panelIndex;
		}
		this.panels.splice(panelIndex, 2, this.panels[panelIndex + 1], this.panels[panelIndex]);
		return panelIndex + 1;
	}

	/**
	 * Move a panel to a new position within the list.
	 * @param {number} fromIndex - Current position of the panel.
	 * @param {number} toIndex - Target insertion index (before adjustment for removal).
	 * @return {number} The new index of the moved panel.
	 */
	movePanel(fromIndex, toIndex) {
		const panelCount = this.panels.length;
		if (panelCount < 2) {
			return fromIndex;
		}

		const clampIndex = (value, max) => Math.max(0, Math.min(value, max));
		const normalizedFrom = clampIndex(fromIndex, panelCount - 1);
		let normalizedTo = clampIndex(toIndex, panelCount);

		if (
			normalizedFrom === normalizedTo ||
			normalizedFrom + 1 === normalizedTo
		) {
			return normalizedFrom;
		}

		const [panel] = this.panels.splice(normalizedFrom, 1);
		if (!panel) {
			return normalizedFrom;
		}

		if (normalizedTo > normalizedFrom) {
			normalizedTo--;
		}

		this.panels.splice(normalizedTo, 0, panel);
		return normalizedTo;
	}

	normalizeThickness(value) {
		const fallback =
			typeof Post.prototype.defaultThickness === "number"
				? Post.prototype.defaultThickness
				: 1;
		const parsed =
			typeof value === "string" ? parseFloat(value) : Number(value);
		if (!Number.isFinite(parsed)) {
			return Math.max(0, fallback);
		}
		return Math.max(0, parsed);
	}

	normalizePanelOrientation(value) {
		const options = Array.isArray(Post.prototype.panelOrientations)
			? Post.prototype.panelOrientations
			: ["Horizontal", "Vertical"];
		const fallback = Post.prototype.defaultPanelOrientation || options[0];
		if (typeof value !== "string") {
			return fallback;
		}
		const normalized = options.find(
			(option) => option.toLowerCase() === value.toLowerCase()
		);
		return normalized || fallback;
	}
}

Post.prototype.panelOrientations = ["Horizontal", "Vertical"];
Post.prototype.defaultPanelOrientation = "Horizontal";

Post.cloneData = function (value) {
	if (Array.isArray(value)) {
		return value.map((item) => Post.cloneData(item));
	}

	if (value && typeof value === "object") {
		const clone = {};
		for (const [key, entry] of Object.entries(value)) {
			clone[key] = Post.cloneData(entry);
		}
		return clone;
	}

	return value;
};

Post.cloneShield = function (shieldData) {
	const safeData =
		shieldData && typeof shieldData === "object"
			? Post.cloneData(shieldData)
			: {};
	const shield = new Shield(safeData);
	return Object.assign(shield, safeData);
};

Post.cloneArrow = function (arrowData) {
	const safeData =
		arrowData && typeof arrowData === "object"
			? Post.cloneData(arrowData)
			: {};

	if (typeof Arrow === "function") {
		const arrow = new Arrow(safeData);
		return Object.assign(arrow, safeData);
	}

	return safeData;
};

Post.cloneExitTab = function (exitTabData) {
	const safeData =
		exitTabData && typeof exitTabData === "object"
			? Post.cloneData(exitTabData)
			: {};
	const nestedExitTabs = Array.isArray(exitTabData?.nestedExitTabs)
		? exitTabData.nestedExitTabs.map((nestedTab) => Post.cloneExitTab(nestedTab))
		: [];
	const exitTab = new ExitTab({
		...safeData,
		nestedExitTabs,
	});
	Object.assign(exitTab, safeData);
	exitTab.nestedExitTabs = nestedExitTabs;
	return exitTab;
};

Post.cloneBlock = function (blockData) {
	const safeData =
		blockData && typeof blockData === "object"
			? Post.cloneData(blockData)
			: {};

	if (typeof Block === "function") {
		const block = new Block(safeData);
		return Object.assign(block, safeData);
	}

	return safeData;
};

Post.cloneControlElement = function (elementData) {
	const safeData =
		elementData && typeof elementData === "object"
			? Post.cloneData(elementData)
			: {};
	const registry = Control?.prototype?.blockToClassElems;
	const elementType =
		registry && typeof registry.getElem === "function"
			? registry.getElem(elementData)
			: null;

	if (elementType && typeof registry[elementType] === "function") {
		const ElementClass = registry[elementType];
		const element =
			elementType === "GroupedBlockElement"
				? new ElementClass({
					...safeData,
					blockElements: Post.cloneControl(elementData?.blockElements),
				})
				: new ElementClass(safeData);
		Object.assign(element, safeData);
		if (elementType === "GroupedBlockElement") {
			element.blockElements = Post.cloneControl(elementData?.blockElements);
		}
		return element;
	}

	return safeData;
};

Post.cloneControl = function (controlData) {
	const rowSource = Array.isArray(controlData?.rows) ? controlData.rows : [];
	const blockSource = Array.isArray(controlData?.blockProperties)
		? controlData.blockProperties
		: [];
	const rows = rowSource.map((row) =>
		Array.isArray(row)
			? row.map((element) => Post.cloneControlElement(element))
			: []
	);
	const blockProperties = rows.map((_, index) => {
		const blockData = blockSource[index];
		return blockData ? Post.cloneBlock(blockData) : new Block();
	});

	return new Control({
		rows,
		blockProperties,
	});
};

Post.cloneSubPanel = function (subPanelData) {
	const safeData =
		subPanelData && typeof subPanelData === "object"
			? Post.cloneData(subPanelData)
			: {};
	const shields = Array.isArray(subPanelData?.shields)
		? subPanelData.shields.map((shield) => Post.cloneShield(shield))
		: [];
	const blockElements = Post.cloneControl(subPanelData?.blockElements);
	const subPanel = new SubPanels({
		...safeData,
		shields,
		blockElements,
	});
	Object.assign(subPanel, safeData);
	subPanel.shields = shields;
	subPanel.blockElements = blockElements;
	return subPanel;
};

Post.cloneSign = function (signData) {
	const safeData =
		signData && typeof signData === "object"
			? Post.cloneData(signData)
			: {};
	const subPanels = Array.isArray(signData?.subPanels)
		? signData.subPanels.map((subPanel) => Post.cloneSubPanel(subPanel))
		: [];
	const shields = Array.isArray(signData?.shields)
		? signData.shields.map((shield) => Post.cloneShield(shield))
		: [];
	const arrows = Array.isArray(signData?.arrows)
		? signData.arrows.map((arrow) => Post.cloneArrow(arrow))
		: [];
	const aplArrows = Array.isArray(signData?.aplArrows)
		? Post.cloneData(signData.aplArrows)
		: [];
	const sign = new Sign({
		...safeData,
		subPanels,
		shields,
		arrows,
		aplArrows,
	});
	Object.assign(sign, safeData);
	sign.subPanels = subPanels;
	sign.shields = shields;
	sign.arrows = arrows;
	sign.aplArrows = aplArrows;
	return sign;
};

Post.clonePanel = function (panelData) {
	const safeData =
		panelData && typeof panelData === "object"
			? Post.cloneData(panelData)
			: {};
	const sign = Post.cloneSign(panelData?.sign);
	const exitTabs = Array.isArray(panelData?.exitTabs)
		? panelData.exitTabs.map((exitTab) => Post.cloneExitTab(exitTab))
		: [];
	const panel = new Panel(
		sign,
		safeData.color,
		exitTabs,
		safeData.corner,
		safeData.borderRadius
	);
	Object.assign(panel, safeData);
	panel.sign = sign;
	panel.exitTabs = exitTabs;
	return panel;
};

Post.prototype.polePositions = [
	"Left",
	"Right",
	"Overhead",
	"Rural",
	"Center"
];

Post.prototype.colors = [
	"Silver",
	"Black",
	"Brown",
	"Red"
];

Post.prototype.defaultThickness = 1;
