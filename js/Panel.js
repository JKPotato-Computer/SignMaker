class Panel {
	/**
	 * Creates a new Panel consisting of a sign and an exit tab.
	 * @param {string} color - Background color of the sign and exit tab.
	 * @param {Sign} sign - Sign to make up the panel.
	 * @param {String} corner - Choice of Sharp or Rounded Corners on the Panel
	 * @param {ExitTab} [exitTab=null] - Optional exit tab to include in the panel.
	 */
	constructor(sign, color, exitTab = null, corner) {
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
		this.exitTab = exitTab;
	}
}
Panel.prototype.cornerType = ["Round", "Sharp"];
