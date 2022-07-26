class Sign {

	/**
	 * Cretes a new sign.
	 * @param {Object} [opt] - Optional parameters.
	 * @param {string} [opt.controlText="New Sign"] - Control cities to display on the sign.
	 * @param {string} [opt.shieldPosition] - Where the shields should be displayed relative to the control cities.
	 * @param {boolean} [opt.shieldBacks=false] - Whether or not shields should be displayed with backings.
	 * @param {string} [opt.guideArrow] - Which guide arrow to display on the sign, if any.
	 * @param {number} [opt.guideArrowLanes=1] - Number of lanes actoss to display guide arrows.
	 * @param {string} [opt.otherSymbols] - Other symbols on the bottom of signs (like Quebec style exit markers)
	 * @param {string} [opt.oSNum=""] - Number to place on otherSymbol
	 * @param {string} [opt.actionMessage=""] - Custom subtext to display on the sign.
	 * @param {Shield[]} [opt.shields] - Array of shields to include on sign.
	 */
	constructor({
			shieldPosition,
			shieldBacks = false,
			guideArrow,
			guideArrowLanes = 1,
            subPanels = [],
			otherSymbol,
			oSNum = "",
            actionMessage = "",
			advisoryMessage = true,
			extraWidth = "0rem",
			extraHeight = "0rem",
			arrowPosition = "Middle"
		} = {}
	) {
		if (this.shieldPositions.includes(shieldPosition)) {
			this.shieldPosition = shieldPosition;
		} else {
			this.shieldPosition = "Above";
		}
		if (this.otherSymbols.includes(otherSymbol)) {
			this.otherSymbol = otherSymbol;
		}
		else {
			this.otherSymbol = "None";
		}
		this.shieldBacks = shieldBacks;
		if (this.guideArrows.includes(guideArrow)) {
			this.guideArrow = guideArrow;
		} else {
			this.guideArrow = "None";
		}
		if (guideArrowLanes >= 0 && guideArrowLanes <= 6) {
			this.guideArrowLanes = guideArrowLanes;
		} else {
			this.guideArrowLanes = 0;
		}
		this.oSNum = oSNum;
		this.actionMessage = actionMessage;
        this.subPanels = subPanels;
		this.advisoryMessage = advisoryMessage;
		this.extraHeight = extraHeight;
		this.extraWidth = extraWidth;
		this.arrowPosition = arrowPosition
	}

	/**
	 * Create a new shield for the post. Add it to the end of the list of existing shields.
	 */
     
	newShield(number) {
		const newShield = new Shield();
		this.subPanels[number].shields.push(newShield);
	}
    
    duplicateShield(shieldIndex,number) {
        const existingShield = this.subPanels[number].shields[shieldIndex];
        const newShield = new Shield({
            type: existingShield.type,
            routeNumber: existingShield.routeNumber,
            to: existingShield.to,
            specialBannerType: existingShield.specialBannerType,
            bannerType: existingShield.bannerType,
            bannerType2: existingShield.bannerType2,
            bannerPosition: existingShield.bannerPosition
        })
        this.subPanels[number].shields.splice(++shieldIndex,0,newShield)
        
    }

	/**
	 * Delete an existing shield at the requested index.
	 * @param {number} shieldIndex - Position of the shield in the array of shields on this sign to delete.
	 */
	deleteShield(shieldIndex,number) {
		this.subPanels[number].shields.splice(shieldIndex, 1);
	}
    
    /**
     * Creates a new subpanel
    */
    
    newSubPanel() {
        const new_subPanel = new SubPanels();
        this.subPanels.push(new_subPanel);
    }
    
    /**
      * Deletes a subpanel
      * @param {number} subPanelIndex - you already know lol
    */
    
    deleteSubPanel(subPanelIndex) {
        this.subPanels.splice(subPanelIndex, 1);
    }
	
	duplicateSubPanel(subPanelIndex) {
		const existingSubPanel = this.subPanels[subPanelIndex];
		const new_SubPanel = new SubPanels({
			controlText : existingSubPanel.controlText,
			actionMessage : existingSubPanel.actionMessage,
			shields : existingSubPanel.shields,
			width : existingSubPanel.width,
			height : existingSubPanel.height
		})
		this.subPanels.push(new_SubPanel);
	}
    
}

Sign.prototype.shieldPositions = ["Left", "Above", "Right"];
Sign.prototype.guideArrows = [
	"None",
	"Side Left",
	"Side Right",
	"Exit Only",
    "Split Exit Only",
	"Half Exit Only",
	"Left/Down Arrow:A-3",
	"Left Arrow:D-1",
	"Left/Up Arrow:A-4",
	"Right/Down Arrow:A-2",
	"Right Arrow:D-2",
	"Right/Up Arrow:A-1",
	"Down Arrow:C-1",
	"Up Arrow:C-2",
	"alt. Left/Down Arrow:B-3",
	"alt. Left/Up Arrow:B-4",
	"alt. Right/Up Arrow:B-1",
	"alt. Right/Down Arrow:B-2",
	"Sharp Left:E-1",
	"Sharp Right:E-2"
];
Sign.prototype.exitguideArrows = [
    "Down Arrow:EC-3/C-1",
	"Left/Up Arrow:EB-6/B-4",
	"alt. Left/Up Arrow:EA-6/A-4",
	"Right/Up Arrow:EB-5/B-1",
	"alt. Right/Up Arrow:EA-5/A-1"

];

Sign.prototype.arrowPositions = [
    "Middle",
    "Left",
    "Right"
]

Sign.prototype.otherSymbols = [
	"None",
	"Quebec-Style Exit Marker",
	"Quebec-Left"
]