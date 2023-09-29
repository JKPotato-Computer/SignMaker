// form.js - JK_Potato/Computer
// Responsible for changes within the website form (editor)

const borderReset = document.querySelector("#borderReset");
const minimumReset = document.querySelector("#minimumReset");
const sizeReset = document.querySelector("#sizeReset");

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