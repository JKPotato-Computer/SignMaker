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
		const newSubPanels = [];
		for (const subPanel of existingPanel.sign.subPanels) {
			newSubPanels.push(Object.assign(new SubPanels(), subPanel));
		}

		const newExitTabs = [];
		const cloneExitTab = (tab) => {
			const clonedTab = Object.assign(new ExitTab(), tab);
			if (Array.isArray(tab?.nestedExitTabs)) {
				clonedTab.nestedExitTabs = tab.nestedExitTabs.map((nested) =>
					cloneExitTab(nested)
				);
			} else {
				clonedTab.nestedExitTabs = [];
			}
			return clonedTab;
		};
		for (const exitTab of existingPanel.exitTabs) {
			newExitTabs.push(cloneExitTab(exitTab));
		}

		const newSign = new Sign({
			shieldPosition: existingPanel.sign.shieldPosition,
			subPanels: newSubPanels,
			sheildBacks: existingPanel.sign.sheildBacks,
			guideArrow: existingPanel.sign.guideArrow,
			guideArrowLanes: existingPanel.sign.guideArrowLanes,
			useCanadianDownArrows: existingPanel.sign.useCanadianDownArrows,
		});
		const newPanel = Object.assign(new Panel(), existingPanel);
		newPanel.sign = newSign;
		newPanel.exitTabs = newExitTabs;
		this.panels.splice(++panelIndex, 0, newPanel);
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
}

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
