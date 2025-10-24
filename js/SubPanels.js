class SubPanels {
    
    constructor({
        shields = [],
        width = 1,
        height = "2",
		shieldDistance = 0.8,
		blockElements,
		} = {}
    ) {
        this.controlText = controlText;
        this.actionMessage = actionMessage;
        
		if (blockElements) {
			this.blockElements = blockElements;
		} else {
			this.blockElements = new Control();
			this.blockElements.addElement(ControlTextElement,{},0,0);
		}
        
        this.shields = shields;
        if ((parseInt(width) < 1) || (parseInt(width) == undefined)) {
            this.width = 1;
        } else {
            this.width = parseInt(width);
        }
		
		this.height = height;
		this.shieldDistance = shieldDistance
    }
    
    
}
