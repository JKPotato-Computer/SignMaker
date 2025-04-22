// form.js - JK_Potato/Computer
// Responsible for changes within the website form (editor)

const borderReset = document.querySelector("#borderReset");
const minimumReset = document.querySelector("#minimumReset");
const sizeReset = document.querySelector("#sizeReset");
const paddingReset = document.querySelector("#paddingReset")
const aplBtn = document.querySelector("#aplArrowsBtn");
const standardBtn = document.querySelector("#standardArrowsBtn");

borderReset.onclick = function() {
	document.querySelector("#borderThickness").value = 0.2;
	document.querySelector("#borderValue").textContent = 0.2;
	
	app.readForm();
}

minimumReset.onclick = function() {
	document.querySelector("#minHeight").value = 2.25;
	document.querySelector("#minValue").textContent = 2.25;
	
	app.readForm();
}


sizeReset.onclick = function() {
	document.querySelector("#fontSize").value = 16;
	document.querySelector("#fontValue").textContent = 16;
	
	app.readForm();
}

paddingReset.onclick = function() {
	document.querySelector("#exitOnlyPadding").value = 0.25;
	document.querySelector("#paddingValue").textContent = 0.25;
	
	app.readForm();
}

aplBtn.onclick = function() {
	if (document.querySelector("#guideArrowSettings").dataset.arrowMode != "APL") {
		document.querySelector("#guideArrowSettings").dataset.arrowMode = "APL";
		aplBtn.className = "active";
		standardBtn.className = "";
		
		app.readForm();
	}
}

standardBtn.onclick = function() {
	if (document.querySelector("#guideArrowSettings").dataset.arrowMode != "Standard") {
		document.querySelector("#guideArrowSettings").dataset.arrowMode = "Standard";
		aplBtn.className = "";
		standardBtn.className = "active";
		
		app.readForm();
	}
}