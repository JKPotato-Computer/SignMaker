class Panel {
	/**
	 * Creates a new Panel consisting of a sign and an exit tab.
	 * @param {string} color - Background color of the sign and exit tab.
	 * @param {Sign} sign - Sign to make up the panel.
	 * @param {String} corner - Choice of Sharp or Rounded Corners on the Panel
	 * @param {ExitTab} [exitTab=null] - Optional exit tab to include in the panel.
	 */
	constructor(sign, color, exitTabs = [], corner) {
		if (Object.keys(lib.colors).includes(color)) {
			this.color = color;
		} else {
			this.color = "Green";
		}
		if (Object.keys(this.cornerType).includes(corner)) {
			this.corner = corner;
		} else {
			this.corner = this.cornerType[0];
		}
		
		this.sign = sign;
		this.exitTabs = exitTabs;
	
		}
	
	newExitTab() {
		const exitTab = new ExitTab();
		
		this.exitTabs.push(exitTab);
	}
		
	deleteExitTab(index,secondaryIndex) {
		if (this.exitTabs.nestedExitTabs.length > 0) {
			this.exitTabs.nestedExitTabs.splice(secondaryIndex, 1);
		} else {
			this.exitTabs.splice(index,1);
		}
	}
		
	duplicateExitTab(index) {
		const exisitingTab = this.exitTabs[index];
		
		const newNest = []

		for (const nest of exisitingTab.nestedExitTabs) {
			newNest.push(Object.assign(new ExitTab(), nest))
		}
		
		const exitTab = new ExitTab({
			number : exisitingTab.number,
			position : exisitingTab.position,
			width : exisitingTab.width,
			color : exisitingTab.color,
			variant : exisitingTab.variant,
			icon : exisitingTab.icon,
			fullBorder : exisitingTab.fullBorder,
			borderThickness : exisitingTab.borderThickness,
			minHeight : exisitingTab.minHeight,
			nestedExitTabs : newNest
		});
		
		this.exitTabs.push(exitTab);
	}
}
	
Panel.prototype.cornerType = ["Round", "Sharp"];
