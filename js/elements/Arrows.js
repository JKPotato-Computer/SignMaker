class Arrow {
	/**
		* Creates a new arrow
		* @param {Object} [opt] - Optional parameters.
		* @param {string} [opt.arrowType] - Arrow type
		* @param {string} [opt.leftText] - For EXIT ONLY, left text
		* @param {string} [opt.rightText] - For EXIT ONLY, right text
		* @param {boolean} [opt.individual] - For EXIT ONLY, if possible, combine with next arrow
	*/
	
	constructor({
		
		// Arrow Information
		
		arrowType = "",
		leftText = "",
		rightText = "",
		individual = true,
		
		// Arrow location
		
		parentIndex = 0,
		arrowIndex = 0
		
	} = {}
	) {
		this.arrowType = arrowType;
		this.lefttext = leftText;
		this.rightText = rightText;
		this.individual = individual;
		
		this.parentIndex = parentIndex;
		this.arrowIndex = arrowIndex;
		
	}
}

Arrow.prototype.arrows = [
	"Slighter Left:H-1",
	"Slighter Right:H-2",
	"Slight Left:F-1",
	"Slight Right:F-2",
	"Full Left:I-1",
	"Full Right:I-2",
	"Straight and Left:G-1",
	"Straight at Right:G-2",
	"Straight:J-1",
	"Down:J-2"
]