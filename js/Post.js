class Post {
	/**
	 * Post that contains the panels.
	 * @param {string} polePosition - Position of the poles on which to display the panels.
	 * @param {number} [lanesWide=1] - How many lanes wide the post should appear to be.
	 */
	constructor(polePosition, lanesWide = 1) {
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
		this.panels = [];
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
		for (const exitTab of existingPanel.exitTabs) {
			newExitTab.push(Object.assign(new ExitTab(), exitTab));
		}
		
		const newSign = new Sign({
			shieldPosition : existingPanel.sign.shieldPosition,
			subPanels : newSubPanels,
			sheildBacks : existingPanel.sign.sheildBacks,
			guideArrow : existingPanel.sign.guideArrow,
			guideArrowLanes : existingPanel.sign.guideArrowLanes,
		});
		const newPanel = Object.assign(new Panel(), existingPanel);
		newPanel.sign = newSign;
		newPanel.exitTab = newExitTabs;
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
}

Post.prototype.polePositions = [
	"Left",
	"Right",
	"Overhead",
	"Rural",
	"Center"
];
