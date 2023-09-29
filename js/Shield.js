class Shield {
	/**
	 * Creates anew a route shield.
	 * @param {string} [type="I-"] - Type of shield.
	 * @param {number} [routeNumber="1"] - Route number to display on shield.
	 * @param {boolean} [to=false] - Whether or not the shield should be signed as "TO".
	 * @param {string} [bannerType] - Directional banner to display.
	 * @param {string} [bannerPosition] - Where to place the directional banner relative to the shield.
	 */
	constructor({
		type = "I", 
		routeNumber = "1", 
		to = false, 
		indentFirstLetter = true,
		fontSize = "1.4rem",
		specialBannerType, 
		bannerType, 
		bannerType2, 
		bannerPosition
		} = {}
	) {
		if (Object.keys(this.types).includes(type)) {
			this.type = type;
		} else {
			this.type = "I";
		}
		this.type = type;
		this.routeNumber = routeNumber;
		this.to = to;
		this.indentFirstLetter = indentFirstLetter;
		this.fontSize = fontSize;
		
		if (this.bannerTypes.includes(bannerType)) {
			this.bannerType = bannerType;
		} else {
			this.bannerType = this.bannerTypes[0];
		}
        if (this.bannerTypes.includes(bannerType2)) {
			this.bannerType2 = bannerType2;
		} else {
			this.bannerType2 = this.bannerTypes[0];
		}
        
		if (this.bannerPositions.includes(bannerPosition)) {
			this.bannerPosition = bannerPosition;
		} else {
			this.bannerPosition = this.bannerPositions[0];
		}
        
		let selectedSpecialBannerType = this.specialBannerTypes[type][specialBannerType];
		
		if (selectedSpecialBannerType == undefined) {
			this.specialBannerType = this.bannerTypes[0];
		} else {
			if (routeNumber.length >= selectedSpecialBannerType) {
				this.specialBannerType = specialBannerType;
			} else {
				this.specialBannerType = this.bannerTypes[0];
			}
		}
		
	}
}

Shield.prototype.specialBannerTypes = {
    ["AZ"] : {
		["Loop"] : 3
	},
	["FL"] : {
		["Toll"] : 0
	},
	["GA"] : {
		["Loop"] : 0,
		["Spur"] : 0,
		["Alt"] : 0,
		["Byp"] : 0,
		["Conn"] : 0
	},
	["I"] : {
		["Business"] : 0
	},
	["NB"] : {
		["Conn"] : 3,
		["Local"] : 3
	},
	["NE"] : {
		["Link"] : 2,
		["Spur"] : 2
	},
	["NS"] : {
		["Conn"] : 3
	},
	["TX"] : {
		["Loop"] : 0,
		["Spur"] : 0,
		["Toll"] : 0,
		["Express"] : 0,
		["Fm"] : 4,
		["Park"] : 0,
		["Rm"] : 0
	}
};

Shield.prototype.bannerTypes = [
	"None",
	"Arterial",
	"North",
	"East",
	"South",
	"West",
	"Jct",
	"Begin",
	"End",
	"Spur",
	"Alt",
	"Truck",
	"Trunk",
	"Business",
	"Byp",
	"Loop",
	"Express",
	"Local",
	"Inner",
	"Outer",
	"Future",
	"Toll",
	"City",
	"Conn",
	"To"
];
Shield.prototype.bannerPositions = ["Above", "Right", "Left"];
Shield.prototype.types = {
	"I-" : "I",
	"US" : "US",
	"AL" : "AL",
	"AK" : "AK",
	"AZ" : "AZ",
	"AR" : "AR",
	"CA" : "CA",
	"CO" : "CO",
	"CT" : "rec2",
	"DE" : "cir",
	"DC" : "DC",
	"FL" : "FL",
	"GA" : "GA",
	"HI" : "HI",
	"ID" : "ID",
	"IL" : "IL",
	"IN" : "IN",
	"IA" : "cir",
	"KS" : "KS",
	"KY" : "cir",
	"LA" : "LA",
	"ME" : "rec",
	"MD" : "MD",
	"MA" : "rec",
	"MI" : "MI",
	"MN" : "MN",
	"MS" : "elp",
	"MO" : "MO",
	"MT" : "MT",
	"MT 2nd" : "MT2",
	"NB" : "NB",
	"NE" : "NE",
	"NL" : "NL",
	"NS" : "NS",
	"NV" : "NV",
	"NH" : "NH",
	"NJ" : "elp",
	"NM" : "NM",
	"NY" : "NY",
	"NC" : "NC",
	"ND" : "ND",
	"OH" : "OH",
	"OK" : "OK",
	"OR" : "OR",
	"PA" : "PA",
	"PEI" : "PEI",
	"QC" : "QC",
	"QC 2nd" : "QC2",
	"RI" : "RI",
	"SC" : "SC",
	"SD" : "SD",
	"TN" : "TN",
	"TN 2nd" : "TN2",
	"TX" : "TX",
	"UT" : "UT",
	"VT" : "VT",
	"VT 2nd" : "cir",
	"VA" : "VA",
	"VA 2nd" : "VA2",
	"WA" : "WA",
	"WV" : "rec2",
	"WI" : "WI",
	"WY" : "WY",
	"C-" : "C"
};
