class SubPanels {
    
    constructor({
        controlText = "New Sign",
        actionMessage = "",
        shields = [],
        width = 1,
        height = "2",
		shieldDistance = 0.8
        } = {}
    ) {
        this.controlText = controlText;
        this.actionMessage = actionMessage;
        
        
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