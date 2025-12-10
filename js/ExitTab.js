class ExitTab {
	/**
	 * Creates a new ExitTab.
	 * @param {string} number - Number to display on the exit tab.
	 * @param {string} [position=null] - Position to display the exit tab relative to the sign.
	 * @param {string} [width=null] - Width of the exit tab (narrow or wide).
	 */
	constructor({
		number = null,
		position = null,
		width = null,
		color = null,
		variant = "Default",
		icon = null,
		useTextBasedIcon = false,
		fullBorder = false,
		squareCorners = false,
		topOffset = true,
		showLeft = false,
		borderThickness = 0.2,
		minHeight = 2.25,
		nestedExitTabs = [],
		FHWAFont = false,
		fontSize = 18,
		tollLogoOnly = true,
		tollLogoSquare = false,
		tollLogoSize = null
	} = {}
	) {
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
		this.squareCorners = squareCorners;
		const parsedBorderThickness =
			typeof borderThickness === "number"
				? borderThickness
				: parseFloat(borderThickness);
		const fallbackBorderThickness =
			typeof ExitTab.prototype.defaultBorderThickness === "number"
				? ExitTab.prototype.defaultBorderThickness
				: 0.2;
		this.borderThickness = Number.isFinite(parsedBorderThickness)
			? Math.max(0, parsedBorderThickness)
			: fallbackBorderThickness;
		this.topOffset = topOffset;
		this.minHeight = minHeight;
		this.nestedExitTabs = nestedExitTabs;
		this.FHWAFont = FHWAFont;
		this.icon = icon;
		this.showLeft = showLeft;
		this.fontSize = fontSize;
		const defaultTollLogoSize =
			typeof ExitTab.prototype.defaultTollLogoSize === "number"
				? ExitTab.prototype.defaultTollLogoSize
				: 3;
		this.tollLogoOnly = !!tollLogoOnly;
		this.tollLogoSquare = !!tollLogoSquare;
		const parsedTollLogoSize =
			typeof tollLogoSize === "number" ? tollLogoSize : parseFloat(tollLogoSize);
		this.tollLogoSize = Number.isFinite(parsedTollLogoSize) && parsedTollLogoSize > 0
			? parsedTollLogoSize
			: defaultTollLogoSize;
		if (
			Array.isArray(this.nestedExitTabs) &&
			ExitTab.prototype.maxNested != null &&
			this.nestedExitTabs.length > ExitTab.prototype.maxNested
		) {
			this.nestedExitTabs = this.nestedExitTabs.slice(
				0,
				ExitTab.prototype.maxNested
			);
		}
	}

	nestExitTab() {
		if (this.nestedExitTabs.length >= ExitTab.prototype.maxNested) {
			return null;
		}
		const exitTab = new ExitTab();
		this.nestedExitTabs.push(exitTab);
		return exitTab;
	}

	deleteNestExitTab(index) {
		this.nestedExitTabs.splice(index, 1);
	}

	duplicateNestExitTab(index) {
		if (this.nestedExitTabs.length >= ExitTab.prototype.maxNested) {
			return null;
		}
		const exisitingTab = this.nestedExitTabs[index];
		if (!exisitingTab) {
			return null;
		}
		const exitTab = new ExitTab({
			number: exisitingTab.number,
			position: exisitingTab.position,
			width: exisitingTab.width,
			color: exisitingTab.color,
			variant: exisitingTab.variant,
			icon: exisitingTab.icon,
			squareCorners: exisitingTab.squareCorners,
			fullBorder: exisitingTab.fullBorder,
			borderThickness: exisitingTab.borderThickness,
			minHeight: exisitingTab.minHeight,
			tollLogoOnly: exisitingTab.tollLogoOnly,
			tollLogoSquare: exisitingTab.tollLogoSquare,
			tollLogoSize: exisitingTab.tollLogoSize
		});

		this.nestedExitTabs.push(exitTab);
		return exitTab;
	}
}

ExitTab.prototype.positions = ["Left", "Center", "Right"];
ExitTab.prototype.variants = ["Default", "Toll Logo", "Icon", "Full Left", "Stacked", "HOV 1", "HOV 2"];
ExitTab.prototype.widths = ["Narrow", "Wide", "Full", "Edge", "Out", "Side"];
ExitTab.prototype.defaultBorderThickness = 0.2;
ExitTab.prototype.defaultTollLogoSize = 3;
ExitTab.prototype.colors = (() => {
	const colors = ["Panel Color"];
	if (typeof lib !== "undefined" && lib?.colors) {
		colors.push(...Object.keys(lib.colors));
	} else {
		colors.push(
			"Green",
			"Blue",
			"Brown",
			"Yellow",
			"White",
			"Black",
			"Purple",
			"Orange",
			"Red",
			"Fluorescent Pink",
			"Fluorescent Yellow-Green"
		);
	}
	return colors;
})();
ExitTab.prototype.icons = [
	"Hazardous Materials:HM.png:var(--white):var(--white)",
	"No Hazardous Materials:NO-HM.png:var(--white):var(--white)",
	"Hospital:H.png:var(--blue):var(--white)"
]
ExitTab.prototype.maxNested = 999;
