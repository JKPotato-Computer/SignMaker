class ExitTab {
	/**
	 * Creates a new ExitTab.
	 * @param {string} number - Number to display on the exit tab.
	 * @param {string} [position=null] - Position to display the exit tab relative to the sign.
	 * @param {string} [width=null] - Width of the exit tab (narrow or wide).
	 */
	constructor ({
		number = null,
		position = null,
		width = null,
		color = null,
		variant = "Default",
		icon = null,
		useTextBasedIcon = false,
		fullBorder = false,
		topOffset = true,
		showLeft = false,
		borderThickness = 0.2,
		minHeight = 2.25,
		nestedExitTabs = [],
		FHWAFont = false,
		fontSize = 18
		} = {}
	)  {
		this.number = number;
		if (this.positions.includes(position)) {
			this.position = position;
		} else {
			this.position = this.positions[1];
		}
		if (this.widths.includes(width)) {
			this.width = width;
		} else {
			this.width = this.widths[0];
		}
        if (this.colors.includes(color)) {
            this.color = color;
        } else {
            this.color = this.colors[0];
        }
		
		if (this.variants.includes(variant)) {
			this.variant = variant;
		} else {
			this.variant = this.variants[0];
		}
		
		this.fullBorder = fullBorder;
		this.borderThickness = borderThickness;
		this.topOffset = topOffset;
		this.minHeight = minHeight;
		this.nestedExitTabs = nestedExitTabs;
		this.FHWAFont = FHWAFont;
		this.icon = icon;
		this.showLeft = showLeft;
		this.fontSize = fontSize;
	}
	
	nestExitTab() {
		const exitTab = new ExitTab();
		this.nestedExitTabs.push(exitTab);
	}
	
	deleteNestExitTab(index) {
		this.nestedExitTabs.splice(index, 1);
	}
	
	duplicateNestExitTab(index) {
		const exisitingTab = this.nestedExitTabs[index];
		const exitTab = new ExitTab({
			number : exisitingTab.number,
			position : exisitingTab.position,
			width : exisitingTab.width,
			color : exisitingTab.color,
			variant : exisitingTab.variant,
			icon : exisitingTab.icon,
			fullBorder : exisitingTab.fullBorder,
			borderThickness : exisitingTab.borderThickness,
			minHeight : exisitingTab.minHeight
		});
		
		this.nestedExitTabs.push(exitTab);
	}
}

ExitTab.prototype.positions = ["Left", "Center", "Right"];
ExitTab.prototype.widths = ["Narrow", "Wide", "Full", "Edge","Out"];
ExitTab.prototype.colors = ["Panel Color","Green","Blue","Brown","Yellow","White","Black","Purple"]
ExitTab.prototype.variants = ["Default","Toll","Icon","Full Left","HOV 1","HOV 2"];
ExitTab.prototype.icons = [
	"Hazardous Materials:HM.png:var(--white):var(--white)",
	"No Hazardous Materials:NO-HM.png:var(--white):var(--white)",
	"Hospital:H.png:var(--blue):var(--white)"
]