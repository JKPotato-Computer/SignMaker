class Shield {
	/**
	 * Creates anew a route shield.
	 * @param {string} [type="I-"] - Type of shield.
	 * @param {number} [routeNumber="1"] - Route number to display on shield.
	 * @param {boolean} [to=false] - Whether or not the shield should be signed as "TO".
	 * @param {string} [bannerType] - Directional banner to display.
	 * @param {string} [bannerPosition] - Where to place the directional banner relative to the shield.
	 */
	constructor({type = "I", routeNumber = "1", to = false, specialBannerType, bannerType, bannerType2, bannerPosition} = {}) {
		if (Object.keys(this.types).includes(type)) {
			this.type = type;
		} else {
			this.type = "I";
		}
		this.type = type;
		this.routeNumber = routeNumber;
		this.to = to;
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
        
        
        for (let i = 0; i < this.specialBannerTypes.length; i++) {
            var current = this.specialBannerTypes[i];
            current = current.split(":")
            if (current[1].includes("/")) {
                var currently = current[1].split("/");
                for (let ice = 0; ice < currently.length; ice++) {
                    var currentli = currently[ice];
                    if (currentli.includes(";")) {
                        currentli = currentli.split(";")
                        var length = routeNumber.length
                        
                        if (routeNumber.length < 2) {
                            length = 2
                        }
                        
                        if ((type = current[0]) && (specialBannerType == currentli[0]) && (length == currentli[1])) {
                            this.specialBannerType = specialBannerType.toUpperCase();
                        } else {
                            this.specialBannerType = this.bannerTypes[0];
                        }
                    } else {
                        if ((type == current[0]) && (specialBannerType == currentli)) {
                            this.specialBannerType = specialBannerType.toUpperCase();
                        } else {
                            this.specialBannerType = this.bannerTypes[0];
                        }
                    }
                    break;
                }
            } else {
                if ((type == current[0]) && (specialBannerType == current[1])) {
                    this.specialBannerType = specialBannerType.toUpperCase();
                } else {
                    this.specialBannerType = this.bannerTypes[0];
                }
                break;
            }
        }
	}
}

Shield.prototype.specialBannerTypes = [
    "AZ:Loop;3/None",
    "FL:Toll/None",
    "GA:Loop/Spur/Alt/Byp/Conn/None",
    "I:Bus/None",
    "NB:Conn;3/Local;3/None",
    "NE:Link;2/Spur;2/None",
    "NS:Conn;3/None",
    "TX:Loop;2/Spur/Toll/Express/None"
];

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
	"Bus",
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
