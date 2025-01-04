const app = (function() {

	let post = {};
	let currentlySelectedPanelIndex = -1;
	let currentlySelectedSubPanelIndex = 0;
	let currentlySelectedExitTabIndex = 0;
	let currentlySelectedNestedExitTabIndex = -1;

	let fileInfo = {

		fileType: "png",
		panel: -1,

	};
	
	const clamp = function(number, min, max) {
		return Math.max(min, Math.min(number, max));
	}

	// Initialize the application, and populates dropdowns and the default post.

	const init = function() {
		// Create the post on which to place panels
		post = new Post(Post.prototype.polePositions[0]);

		// Populate post position options
		const postPositionSelectElmt = document.getElementById("postPosition");
		for (const polePosition of Post.prototype.polePositions) {
			lib.appendOption(postPositionSelectElmt, polePosition, {
				selected: (polePosition == "Left")
			});
		}


		// Populate color options
		const colorSelectElmt = document.getElementById("panelColor");
		for (const color in lib.colors) {
			lib.appendOption(colorSelectElmt, color, {
				text: color
			});
		}

		const cornerTypeSelectElmt = document.getElementById("panelCorner");
		for (const corner of Panel.prototype.cornerType) {
			lib.appendOption(cornerTypeSelectElmt, corner, {
				selected: (corner == "Round")
			});
		}


		// Populate exit tab position options
		const exitTabPositionSelectElmt = document.getElementById("exitTabPosition");
		for (const position of ExitTab.prototype.positions) {
			lib.appendOption(exitTabPositionSelectElmt, position, {
				selected: (position == "Right")
			});
		}

		// Populate exit tab width options
		const exitTabWidthSelectElmt = document.getElementById("exitTabWidth");
		for (const width of ExitTab.prototype.widths) {
			lib.appendOption(exitTabWidthSelectElmt, width, {
				selected: (width == "Narrow")
			});
		}

		// Populate the exit color options
		const exitColorSelectElement = document.getElementById("exitColor");
		for (const exitColor of ExitTab.prototype.colors) {
			lib.appendOption(exitColorSelectElement, exitColor);
		}

		// Populate the exit variants
		const exitVariantSelectElmt = document.getElementById("exitVariant");
		for (const exitVariant of ExitTab.prototype.variants) {
			lib.appendOption(exitVariantSelectElmt, exitVariant)
		}

		// Populate the exit icons
		const iconSelectSelectElmt = document.getElementById("iconSelect");
		for (const icons of ExitTab.prototype.icons) {
			lib.appendOption(exitVariantSelectElmt, icons.split(":")[0]);
		}

		// Populate the shield position options
		const shieldPositionsSelectElmt = document.getElementById("shieldsPosition");
		for (const position of Sign.prototype.shieldPositions) {
			lib.appendOption(shieldPositionsSelectElmt, position, {
				selected: (position == "Above")
			});
		}

		// Populate global positioning
		const globalPosition = document.getElementById("globalPosition");
		for (const position of Sign.prototype.globalPositioning) {
			lib.appendOption(globalPosition, position, {
				selected: (position == "Top")
			});
		}

		// Populate the guide arrow options
		const guideArrowSelectElmt = document.getElementById("guideArrow");
		for (const guideArrow of Sign.prototype.guideArrows) {

			const display = guideArrow.split(":")[0];

			lib.appendOption(guideArrowSelectElmt, display);
		}

		// Populate the exit only guide arrow options
		const exitOnlyDirectionElmt = document.getElementById("exitOnlyDirection");
		for (const exitguideArrows of Sign.prototype.exitguideArrows) {

			const display = exitguideArrows.split(":")[0];

			lib.appendOption(exitOnlyDirectionElmt, display);
		}

		// Populate the arrow directions
		const arrowDirectionElmt = document.getElementById("arrowLocations");
		for (const arrowDirection of Sign.prototype.arrowPositions) {
			lib.appendOption(arrowDirectionElmt, arrowDirection);
		}

		// Populate the other symbol options
		const otherSymbolSelectElement = document.getElementById("otherSymbol");
		for (const otherSymbol of Sign.prototype.otherSymbols) {
			lib.appendOption(otherSymbolSelectElement, otherSymbol);
		}

		const downloadSign = document.getElementById("downloadSign");
		const downloadModal = document.getElementById("downloadModal");
		const downloadClose = document.getElementById("cancelDownload");

		downloadSign.onclick = function() {
			downloadModal.style.display = "block";
			updatePreview();
		}

		downloadClose.onclick = function() {
			downloadModal.style.display = "none";
		}

		window.onclick = function(event) {
			if (event.target == downloadModal) {
				downloadModal.style.display = "none";
			}
		}


		newPanel();
	};

	// Create a new panel, set the current editing panel to that panel, update the form, and redraw.
	const newPanel = function() {
		post.newPanel();
		currentlySelectedPanelIndex = post.panels.length - 1;
		updateForm();
		redraw();
	};

	// Clone the panel, set the current editing panel to that panel, update the form and redraw.
	const duplicatePanel = function() {
		post.duplicatePanel(currentlySelectedPanelIndex);
		currentlySelectedPanelIndex++;
		updateForm();
		redraw();
	};

	/*
		Delete the current panel, set the current editing panel to the panel before, update the form and redraw.
		If no panel is found, create a new one.
	*/
	const deletePanel = function() {
		post.deletePanel(currentlySelectedPanelIndex);
		if (currentlySelectedPanelIndex > 0) {
			currentlySelectedPanelIndex--;
		}
		if (post.panels.length == 0) {
			newPanel();
		} else {
			updateForm();
			redraw();
		}
	};

	// Shift a panel to the left, and redraw.
	const shiftLeft = function() {
		currentlySelectedPanelIndex = post.shiftLeft(currentlySelectedPanelIndex);
		redraw();
	};

	// Shift a panel to the right, and redraw.
	const shiftRight = function() {
		currentlySelectedPanelIndex = post.shiftRight(currentlySelectedPanelIndex);
		redraw();
	};

	// Set the current panel based off parameter number, within the correct range (0 < # of panels - 1)
	const changeEditingPanel = function(panelNumber) {
		currentlySelectedPanelIndex = clamp(panelNumber, 0, post.panels.length - 1)
		currentlySelectedSubPanelIndex = 0;
		updateForm();
	};
	
	const addSubPanel = function() {
		const sign = post.panels[currentlySelectedPanelIndex].sign;
		sign.newSubPanel();
		currentlySelectedSubPanelIndex++
		updateForm();
		redraw();
	}

	const removeSubPanel = function() {
		const sign = post.panels[currentlySelectedPanelIndex].sign;
		if (sign.subPanels.length > 1) {
			sign.deleteSubPanel((sign.subPanels.length - 2));
			currentlySelectedSubPanelIndex--
			updateForm();
			redraw();
		}
	}

	// Duplicate the current subpanel, set the editing to that subpanel, update the form, and redraw.
	const duplicateSubPanel = function() {
		const sign = post.panels[currentlySelectedPanelIndex].sign;
		sign.duplicateSubPanel(currentlySelectedSubPanelIndex);
		currentlySelectedSubPanelIndex++;
		updateForm();
		redraw();
	};

	// Set the current editing (SUB)panel based off paramter number, within the correct range (0 < # of panels - 1)
	const changeEditingSubPanel = function(subPanelNumber) {
		currentlySelectedSubPanelIndex = clamp(subPanelNumber, -1, post.panels[currentlySelectedPanelIndex].sign.subPanels.length - 1)
		updateForm();
	};

	// Create a new exit tab, update the form, and redraw.
	const newExitTab = function() {
		const panel = post.panels[currentlySelectedPanelIndex];
		panel.newExitTab();
		currentlySelectedExitTabIndex = panel.exitTabs.length - 1;
		updateForm();
		redraw();
	}

	// Create a new nested exit tab within the parent exit tab.
	const newNestExitTab = function() {
		const exitTab = post.panels[currentlySelectedPanelIndex].exitTabs[currentlySelectedExitTabIndex];
		exitTab.nestExitTab();
		currentlySelectedNestedExitTabIndex = exitTab.nestedExitTabs.length - 1;
		updateForm();
		redraw();
	}

	// Create a duplicate of the exit tab.
	const duplicateExitTab = function(exitTabIndex) {
		const panel = post.panels[currentlySelectedPanelIndex];
		panel.duplicateExitTab(exitTabIndex);
		currentlySelectedExitTabIndex++;
		updateForm();
		redraw();
	}

	// Delete the exit tab.
	const removeExitTab = function(exitTabIndex) {
		const panel = post.panels[currentlySelectedPanelIndex];
		panel.deleteExitTab(exitTabIndex);
		currentlySelectedExitTabIndex--
		updateForm();
		redraw();
	}

	// Delete the exit tab within the parent exitTab
	const deleteNestExitTab = function(nestExitTabIndex) {
		const exitTab = post.panels[currentlySelectedPanelIndex].exitTabs[currentlySelectedExitTabIndex];
		exitTab.deleteNestExitTab(nestExitTabIndex);
		currentlySelectedNestedExitTabIndex--
		updateForm();
		redraw();
	}

	// Set the current editing exit tab based off paramter number, its child, within the correct range (0 < # of exit Tabs - 1 // Secondary: 0 < # of child exit Tabs)
	const changeEditingExitTab = function(exitTabNumber, nestedExitTabNumber) {
		currentlySelectedExitTabIndex = clamp(exitTabNumber, 0, post.panels[currentlySelectedPanelIndex].exitTabs.length - 1);
		currentlySelectedNestedExitTabIndex = (nestedExitTabNumber != null) ? clamp(nestedExitTabNumber, -1, post.panels[currentlySelectedPanelIndex].exitTabs[currentlySelectedExitTabIndex].nestedExitTabs.length - 1) : -1;
		updateForm();
	};

	// Add a new shield to the current panel's sign, update the shield subform, and redraw the sign.
	const newShield = function() {
		const sign = post.panels[currentlySelectedPanelIndex].sign;
		sign.newShield(currentlySelectedSubPanelIndex);
		updateShieldSubform();
		redraw();
	};

	// Delete the current shield, update the shield subform, and redraw the sign
	const deleteShield = function(shieldIndex) {
		const sign = post.panels[currentlySelectedPanelIndex].sign;
		sign.deleteShield(shieldIndex, currentlySelectedSubPanelIndex);
		updateShieldSubform();
		redraw();
	};

	// Delete all shields of a sign
	const clearShields = function() {
		const subPanel = post.panels[currentlySelectedPanelIndex].sign.subPanels[currentlySelectedSubPanelIndex];
		const shields = subPanel.shields;

		while (shields.length > 0) {
			deleteShield(shields.length - 1, currentlySelectedSubPanelIndex);
		};
	};

	// Duplicate a shield
	const duplicateShield = function(shieldIndex) {
		const sign = post.panels[currentlySelectedPanelIndex].sign;
		sign.duplicateShield(shieldIndex, currentlySelectedSubPanelIndex);
		updateShieldSubform();
		redraw();
	}

	const checkSpecialShield = function(shieldIndex, specialShield) {
		const shields = post.panels[currentlySelectedPanelIndex].sign.subPanels[currentlySelectedSubPanelIndex].shields;
		const shield = shields[shieldIndex];
		const specialShieldType = Shield.prototype.specialBannerTypes[shield.type][specialShield];

		if (specialShieldType != undefined) {
			if (shield.routeNumber.length >= specialShieldType) {
				return true;
			}
		}

		return false;
	}

	// Read the form and update the page by redrawing it.
	const readForm = function() {
		const form = document.forms[0];
		const panel = post.panels[currentlySelectedPanelIndex];
		const subPanel = (currentlySelectedSubPanelIndex != -1) ? panel.sign.subPanels[currentlySelectedSubPanelIndex] : panel.sign;
		const exitTab = (currentlySelectedNestedExitTabIndex != -1) ? exitTab.nestedExitTabs[currentlySelectedNestedExitTabIndex] : panel.exitTabs[currentlySelectedExitTabIndex];

		// Post
		post.polePosition = form["postPosition"].value;
		post.fontType = form["fontChange"].checked;
		post.showPost = form["showPost"].checked;
		post.secondExitOnly = form["secondExitOnly"].checked;

		// Panel
		panel.color = form["panelColor"].value;
		panel.corner = form["panelCorner"].value;

		// Exit Tab
		exitTab.number = form["exitNumber"].value;
		exitTab.width = form["exitTabWidth"].value;
		exitTab.position = form["exitTabPosition"].value;
		exitTab.color = form["exitColor"].value;
		exitTab.variant = form["exitVariant"].value;

		if (exitTab.variant == "Toll") {
			for (const tollOption of document.getElementsByName("tollOption")) {
				if (tollOption.checked == true) {
					if (tollOption.value != "custom") {
						exitTab.icon = tollOption.value;
						exitTab.useTextBasedIcon = false;
					} else {
						exitTab.icon = form["customTag"].value;
						exitTab.useTextBasedIcon = true;
					}
					break;
				}
			}
		} else if (exitTab.variant == "Icon") {
			exitTab.icon = form["iconSelect"].value;
		} else {
			exitTab.icon = null;
		}

		exitTab.FHWAFont = form["exitFont"].checked;
		exitTab.showLeft = form["showLeft"].checked;
		exitTab.fullBorder = form["fullBorder"].checked;
		exitTab.topOffset = form["topOffset"].checked;
		exitTab.borderThickness = form["borderThickness"].value;
		exitTab.minHeight = form["minHeight"].value;
		exitTab.fontSize = form["fontSize"].value;

		// Misc Shields
		panel.sign.shieldBacks = form["shieldBacks"].checked;

		// Sign
		if (document.getElementById("Visual").style.display == "block") {
			panel.sign.padding = form["paddingTop"].value.toString() + "rem " + form["paddingRight"].value.toString() + "rem " + form["paddingBottom"].value.toString() + "rem " + form["paddingLeft"].value.toString() + "rem";
		} else {
			panel.sign.padding = form["manualTop"].value.toString() + "rem " + form["manualRight"].value.toString() + "rem " + form["manualBottom"].value.toString() + "rem " + form["manualLeft"].value.toString() + "rem";
		}

		// Global Settings
		panel.sign.globalPositioning = form["globalPosition"].value;


		// Shields
		for (let shieldIndex = 0, length = subPanel.shields.length; shieldIndex < length; shieldIndex++) {
			let shield = subPanel.shields[shieldIndex];
			shield.type = document.getElementById(`shield${shieldIndex}_type`).value;
			shield.routeNumber = document.getElementById(`shield${shieldIndex}_routeNumber`).value;
			shield.to = document.getElementById(`shield${shieldIndex}_to`).checked;
			shield.bannerType = document.getElementById(`shield${shieldIndex}_bannerType`).value;
			shield.bannerPosition = document.getElementById(`shield${shieldIndex}_bannerPosition`).value;
			shield.bannerType2 = document.getElementById(`shield${shieldIndex}_bannerType2`).value;
			shield.specialBannerType = (document.getElementById(`shield${shieldIndex}_specialBannerType`).value || "None");
			shield.indentFirstLetter = document.getElementById(`shield${shieldIndex}_indentFirstLetter`).checked;
			shield.fontSize = String(document.getElementById(`shield${shieldIndex}_fontSize`).value) + "rem";

			const specialBannerTypeSelectElmt = document.getElementById(`shield${shieldIndex}_specialBannerType`);

			if (Shield.prototype.specialBannerTypes[shield.type] != undefined) {

				while (specialBannerTypeSelectElmt.firstChild) {
					specialBannerTypeSelectElmt.removeChild(specialBannerTypeSelectElmt.firstChild);
				}

				for (const specialBannerType of Object.keys(Shield.prototype.specialBannerTypes[shield.type])) {
					if (checkSpecialShield(shieldIndex, specialBannerType)) {
						const optionElmt = document.createElement("option");
						optionElmt.value = specialBannerType;
						optionElmt.selected = (shield.specialBannerType == specialBannerType || false);
						optionElmt.appendChild(document.createTextNode(specialBannerType));
						specialBannerTypeSelectElmt.appendChild(optionElmt);
					} else {
						if (shield.specialBannerType == specialBannerType) {
							shield.specialBannerType = "None";
						}
					}
				}
				
				let optionElmt = document.createElement("option");
				optionElmt.value = "None";
				optionElmt.selected = ("None" == shield.specialBannerType || false);
				optionElmt.appendChild(document.createTextNode("None"));
				specialBannerTypeSelectElmt.appendChild(optionElmt);
				specialBannerTypeSelectElmt.style.visibility = "";
			} else {
				shield.specialBannerType = "None";
				specialBannerTypeSelectElmt.style.visibility = "hidden";
			}

		}

		subPanel.controlText = form["controlText"].value;
		subPanel.actionMessage = form["actionMessage"].value;
		subPanel.actionMessage = subPanel.actionMessage.replace("1/2", "½");
		subPanel.actionMessage = subPanel.actionMessage.replace("1/4", "¼");
		subPanel.actionMessage = subPanel.actionMessage.replace("3/4", "¾");
		subPanel.advisoryMessage = form["outActionMessage"].checked;
		subPanel.advisoryText = form["g_actionMessage"].value;
		if ((panel.sign.subPanels.length > 1) && (currentlySelectedSubPanelIndex == 0)) {
			subPanel.width = parseInt(form["subPanelLength"].value);
		} else if (currentlySelectedSubPanelIndex != 0) {
			subPanel.height = form["subPanelHeight"].value + "rem";
			subPanel.width = parseInt(form["subPanelLength"].value);
		}



		panel.sign.shieldPosition = form["shieldsPosition"].value;


		panel.sign.arrowMode = document.getElementById("guideArrowSettings").dataset.arrowMode;

		var guideArrow_result = form["guideArrow"].value;


		for (const guideArrow_value of Sign.prototype.guideArrows) {
			if (guideArrow_result == guideArrow_value.split(":")[0]) {
				guideArrow_result = guideArrow_value;
				break;
			}
		}


		panel.sign.guideArrow = guideArrow_result;
		panel.sign.guideArrowLanes = form["guideArrowLanes"].value;
		panel.sign.arrowPosition = form["arrowLocations"].value;

		var exitOnlyDirection_result = form["exitOnlyDirection"].value;
		for (const exitOnlyDirection_value of Sign.prototype.exitguideArrows) {
			if (exitOnlyDirection_result == exitOnlyDirection_value.split(":")[0]) {
				exitOnlyDirection_result = exitOnlyDirection_value;
				break;
			}
		}
		
		if (panel.sign.guideArrow == "Half Exit Only") {

			if (form["arrowLocations"].value == "Middle") {
				while (form["arrowLocations"].firstChild) {
					form["arrowLocations"].removeChild(form["arrowLocations"].lastChild);
				}

				for (const arrowPosition of Sign.prototype.arrowPositions) {
					if (arrowPosition != "Middle") {
						lib.appendOption(form["arrowLocations"], arrowPosition);
					}
				}

				form["arrowLocations"].value = "Left";
				panel.sign.arrowPosition = "Left";

			} else {
				panel.sign.arrowPosition = form["arrowLocations"].value;
				
				if (!form["arrowLocations"].querySelector("option[value=Middle]")) {
					lib.appendOption(form["arrowLocations"], "Middle")
				}
				
			}
		} else {
			panel.sign.arrowPosition = form["arrowLocations"].value;
			
			if (!form["arrowLocations"].querySelector("option[value=Middle]")) {
				lib.appendOption(form["arrowLocations"], "Middle")
			}
			
		}

		panel.sign.exitguideArrows = exitOnlyDirection_result;
		panel.sign.showExitOnly = form["showExitOnly"].checked;
		panel.sign.exitOnlyPadding = form["exitOnlyPadding"].value;

		panel.sign.otherSymbol = form["otherSymbol"].value;
		panel.sign.oSNum = form["oSNum"].value;

		// Other Symbols Extra
		if (panel.sign.otherSymbol != "None") {
			form["oSNum"].style.display = "block";
		} else {
			form["oSNum"].style.display = "none";
		}

		const exitOnlyDirectionLabel = document.getElementById("exitOnlyDirectionLabel");
		const showExitOnlyLabel = document.getElementById("showExitOnlyLabel");
		const exitOnlyDirection = document.getElementById("exitOnlyDirection");
		const showExitOnly = document.getElementById("showExitOnly");

		if ((panel.sign.guideArrow != "Exit Only") && (panel.sign.guideArrow != "Split Exit Only") && (panel.sign.guideArrow != "Half Exit Only")) {
			exitOnlyDirectionLabel.style.visibility = "hidden";
			showExitOnlyLabel.style.visibility = "hidden";
			exitOnlyDirection.style.visibility = "hidden";
			showExitOnly.style.visibility = "hidden";
		} else {
			exitOnlyDirectionLabel.style.visibility = "visible";
			showExitOnlyLabel.style.visibility = "visible";
			exitOnlyDirection.style.visibility = "visible";
			showExitOnly.style.visibility = "visible";
		}

		var paddingValues = panel.sign.padding.split("rem");


		var left = parseFloat(paddingValues[3]);
		var ctop = parseFloat(paddingValues[0]);
		var right = parseFloat(paddingValues[1]);
		var bottom = parseFloat(paddingValues[2]);

		const paddingLeft = document.getElementById("paddingLeft");
		const paddingTop = document.getElementById("paddingTop");
		const paddingRight = document.getElementById("paddingRight");
		const paddingBottom = document.getElementById("paddingBottom");

		paddingLeft.value = left;
		paddingTop.value = ctop;
		paddingRight.value = right;
		paddingBottom.value = bottom;

		const manualLeft = document.getElementById("manualLeft");
		const manualTop = document.getElementById("manualTop");
		const manualRight = document.getElementById("manualRight");
		const manualBottom = document.getElementById("manualBottom");

		manualLeft.value = left;
		manualTop.value = ctop;
		manualRight.value = right;
		manualBottom.value = bottom;

		updateForm();
		redraw();
	};

	/**
	 * Update the fields in the form to the values of the currently selected panel.
	 */
	const updateForm = function() {
		const panel = post.panels[currentlySelectedPanelIndex];
		const sign = (currentlySelectedSubPanelIndex != -1) ? (panel.sign.subPanels[currentlySelectedSubPanelIndex]) : (panel.sign);
		const exitTab = (currentlySelectedNestedExitTabIndex != -1) ? (panel.exitTabs[currentlySelectedExitTabIndex].nestedExitTabs[currentlySelectedNestedExitTabIndex]) : (panel.exitTabs[currentlySelectedExitTabIndex]);

		const panelList = document.getElementById("panelList");
		const subPanelList = document.getElementById("subPanelList");
		const exitTabList = document.getElementById("exitTabList");

		while (panelList.firstChild) {
			panelList.removeChild(panelList.lastChild);
		}

		while (subPanelList.firstChild) {
			subPanelList.removeChild(subPanelList.lastChild);

			if (subPanelList.lastChild == document.getElementById("global")) {
				if (currentlySelectedSubPanelIndex == -1) {
					document.getElementById("global").className = "active";
				} else {
					document.getElementById("global").className = "";
				}

				break;
			}
		}

		while (exitTabList.firstChild) {
			exitTabList.removeChild(exitTabList.lastChild);
		}

		for (let panelIndex = 0, panelsLength = post.panels.length; panelIndex < panelsLength; panelIndex++) {
			const panelButton = document.createElement("input");
			panelButton.type = "button";
			panelButton.id = "edit" + (panelIndex + 1);
			panelButton.value = "Panel " + (panelIndex + 1);
			panelButton.className = (currentlySelectedPanelIndex == panelIndex) ? "active" : "";
			
			panelButton.addEventListener("click", function() {
				changeEditingPanel(panelIndex);
				panelButton.className = "active";
			});
			
			panelList.appendChild(panelButton);
		}

		for (let subPanelIndex = 0, subPanelsLength = panel.sign.subPanels.length; subPanelIndex < subPanelsLength; subPanelIndex++) {
			const subPanelButton = document.createElement("input");
			subPanelButton.type = "button";
			subPanelButton.id = "sub_edit" + (subPanelIndex + 1);
			subPanelButton.value = "SubPanel " + (subPanelIndex + 1);
			subPanelButton.className = (currentlySelectedSubPanelIndex == subPanelIndex) ? "active" : "";

			subPanelButton.addEventListener("click", function() {
				changeEditingSubPanel(subPanelIndex, panel);
				subPanelButton.className = "active";
			});
			
			subPanelList.appendChild(subPanelButton);
		}


		for (let exitTabIndex = 0, exitTabLength = panel.exitTabs.length; exitTabIndex < exitTabLength; exitTabIndex++) {
			const nestedExitTab = panel.exitTabs[exitTabIndex].nestedExitTabs.length;

			const exitTabButton = document.createElement("select");
			exitTabButton.id = "tab_edit" + (exitTabIndex + 1);
			exitTabButton.className = "exitTabSelect" + (currentlySelectedExitTabIndex == exitTabIndex) ? " active" : "";

			for (let nestIndex = -1; nestIndex < nestedExitTab; nestIndex++) {
				lib.appendOption(exitTabButton, nestIndex, {
					selected: (currentlySelectedNestedExitTabIndex == nestIndex),
					text: (nestIndex == -1) ? "Exit Tab " : "Nest Exit Tab " + (nestIndex + 1).toString()
				});
			}

			exitTabButton.addEventListener("change", function() {
				changeEditingExitTab(exitTabIndex, parseInt(exitTabButton.value));
			})

			exitTabButton.addEventListener("click", function() {
				changeEditingExitTab(exitTabIndex);
			})
			
			exitTabList.appendChild(exitTabButton);
		}

		// Panel Setting Config
		
		// Panel Config
		const panelColorSelectElmt = document.getElementById("panelColor");
		for (const option of panelColorSelectElmt.options) {
			if (option.value == panel.color) {
				option.selected = true;
				break;
			}
		}

		const panelCornerSelectElmt = document.getElementById("panelCorner");
		for (const option of panelCornerSelectElmt.options) {
			if (option.value == panel.corner) {
				option.selected = true;
				break;
			}
		}

		// Global Panel
		const outActionMessage = document.getElementById("outActionMessage");
		const outActionMessageLabel = document.getElementById("outActionMessageLabel");
		const globalPositioning = document.getElementById("globalPosition");
		const globalPositionLabel = document.getElementById("globalPositionLabel");
		const g_actionMessage = document.getElementById("g_actionMessage");

		g_actionMessage.className = (currentlySelectedSubPanelIndex != -1) ? "invisible" : "";
		outActionMessage.className = (currentlySelectedSubPanelIndex != -1) ? "invisible" : "";
		outActionMessageLabel.className = (currentlySelectedSubPanelIndex != -1) ? "invisible" : "";
		g_actionMessage.className = (currentlySelectedSubPanelIndex != -1) ? "invisible" : "";
		globalPositioning.className = (currentlySelectedSubPanelIndex != -1) ? "invisible" : "";
		globalPositionLabel.className = (currentlySelectedSubPanelIndex != -1) ? "invisible" : "";
	
		outActionMessage.checked = panel.sign.advisoryMessage;
		
		// Sub Panel
		const subPanelHeight = document.getElementById("subPanelHeight");
		const subPanelHeightLabel = document.getElementById("subPanelHeightLabel");
		const subPanelLength = document.getElementById("subPanelLength");
		const subPanelLengthLabel = document.getElementById("subPanelLengthLabel");
		
		subPanelHeight.style.display = (currentlySelectedSubPanelIndex > 0) ? "initial" : "none";
		subPanelHeightLabel.style.display = (currentlySelectedSubPanelIndex > 0) ? "inline-block" : "none";
		
		subPanelLength.style.display = (currentlySelectedSubPanelIndex != -1 && panel.sign.subPanels.length > 1) ? "initial" : "none";
		subPanelLengthLabel.style.display = (currentlySelectedSubPanelIndex != -1 && panel.sign.subPanels.length > 1) ? "inline-block" : "none";

		// Exit Tabs
		const exitNumberElmt = document.getElementById("exitNumber");
		exitNumberElmt.value = exitTab.number;

		const exitTabPositionSelectElmt = document.getElementById("exitTabPosition");
		for (const option of exitTabPositionSelectElmt.options) {
			if (option.value == exitTab.position) {
				option.selected = true;
				break;
			}
		}

		const exitTabWidthSelectElmt = document.getElementById("exitTabWidth");
		for (const option of exitTabWidthSelectElmt.options) {
			if (option.value == exitTab.width) {
				option.selected = true;
				break;
			}
		}
		
		const exitTabColorElmt = document.querySelector("#exitColor");
		for (const option of exitTabColorElmt.options) {
			if (option.value == exitTab.color) {
				option.selected = true;
				break;
			}
		}
		
		const exitTabVariantElmt = document.querySelector("#exitVariant");
		for (const option of exitTabColorElmt.options) {
			if (option.value == exitTab.color) {
				option.selected = true;
				break;
			}
		}


		const tollSettingOptions = document.getElementsByName("tollOption");
		for (const tollSettingOption of tollSettingOptions) {
			if (tollSettingOption.value == exitTab.icon) {
				tollSettingOption.selected = true;
				break;
			}
		}

		const iconSetting = document.getElementById("iconSelect");
		iconSetting.value = exitTab.icon;

		for (const option of iconSetting.options) {
			if (option.value == exitTab.icon) {
				option.selected = true;
				break;
			}
		}
		
		document.getElementById("extraSettings").style.display = (exitTab.variant == "Default") ? "none" : "";

		const exitFont = document.getElementById("exitFont");
		exitFont.checked = exitTab.FHWAFont;

		const showLeft = document.getElementById("showLeft");
		showLeft.checked = exitTab.showLeft;

		const fullBorder = document.getElementById("fullBorder");
		fullBorder.checked = exitTab.fullBorder;

		const topOffset = document.getElementById("topOffset");
		topOffset.checked = exitTab.topOffset;

		const borderThickness = document.getElementById("borderThickness");
		borderThickness.value = exitTab.borderThickness;
		document.getElementById("borderValue").innerHTML = borderThickness.value.toString();


		const minHeight = document.getElementById("minHeight");
		minHeight.value = exitTab.minHeight;
		document.getElementById("minValue").innerHTML = minHeight.value.toString();

		// Shields

		updateShieldSubform();
		
		const controlTextElmt = document.getElementById("controlText");
		controlTextElmt.value = sign.controlText;

		const actionMessageElmt = document.getElementById("actionMessage");
		actionMessageElmt.value = sign.actionMessage;

		const shieldPositionsSelectElmt = document.getElementById("shieldsPosition");
		for (const option of shieldPositionsSelectElmt.options) {
			if (option.value == panel.sign.shieldPosition) {
				option.selected = true;
				break;
			}
		}

		const shieldBacksElmt = document.getElementById("shieldBacks");
		shieldBacksElmt.checked = panel.sign.shieldBacks;

		const guideArrowSelectElmt = document.getElementById("guideArrow");
		for (const option of guideArrowSelectElmt.options) {
			if (option.value == panel.sign.guideArrow) {
				option.selected = true;
				break;
			}
		}

		const guideArrowLanesElmt = document.getElementById("guideArrowLanes");
		guideArrowLanesElmt.value = panel.sign.guideArrowLanes;

		const exitOnlyDirectionLabel = document.getElementById("exitOnlyDirectionLabel");
		const showExitOnlyLabel = document.getElementById("showExitOnlyLabel");
		const exitOnlyDirection = document.getElementById("exitOnlyDirection");
		const showExitOnly = document.getElementById("showExitOnly");
		const exitOnlyPadding = document.getElementById("exitOnlyPadding");
		const exitOnlyPaddingValue = document.getElementById("paddingValue");
		const exitOnlyPaddingLabel = document.getElementById("exitOnlyPaddingLabel");

		exitOnlyDirectionLabel.className = (!panel.sign.guideArrow.includes("Exit Only")) ? "invisible" : "";
		exitOnlyPaddingLabel.className = ((!panel.sign.guideArrow.includes("Exit Only"))  || (panel.sign.guideArrow == "Split Exit Only")) ? "invisible" : "";
		showExitOnlyLabel.className= (!panel.sign.guideArrow.includes("Exit Only")) ? "invisible" : "";
		exitOnlyDirection.className= (!panel.sign.guideArrow.includes("Exit Only")) ? "invisible" : "";
		exitOnlyPadding.className= ((!panel.sign.guideArrow.includes("Exit Only"))  || (panel.sign.guideArrow == "Split Exit Only")) ? "invisible" : "";
		showExitOnly.className = (!panel.sign.guideArrow.includes("Exit Only")) ? "invisible" : "";
		paddingValue.className = ((!panel.sign.guideArrow.includes("Exit Only")) || (panel.sign.guideArrow == "Split Exit Only")) ? "invisible" : "";
		showExitOnly.value = panel.sign.showExitOnly;
		
		document.getElementById("standardArrows").style.display = (panel.sign.arrowMode == "Standard") ? "block" : "none";
		document.getElementById("aplArrows").style.display = (panel.sign.arrowMode == "APL") ? "flex" : "none";
	
		
		for (const option of exitOnlyDirection.options) {
			if (option.value == panel.sign.exitguideArrows) {
				option.selected = true;
				break;
			}
		}

		const otherSymbolSelectElement = document.getElementById("otherSymbol");
		for (const option of otherSymbolSelectElement.options) {
			if (option.value == panel.sign.otherSymbol) {
				option.selected = true;
				break;
			}
		}

		const oSNumElmt = document.getElementById("oSNum");
		oSNumElmt.value = panel.sign.oSNum;

		const advisoryMessageElmt = document.getElementById("outActionMessage");
		advisoryMessageElmt.checked = panel.sign.advisoryMessage;

	};

	/**
	 * Update the fields in the form relating to shields to the values of the currently selected panel.
	 */
	const updateShieldSubform = function() {

		const shieldsContainerElmt = document.getElementById("shields");
		var subPanel;

		if (currentlySelectedSubPanelIndex == -1) {
			subPanel = post.panels[currentlySelectedPanelIndex].sign;
		} else {
			subPanel = post.panels[currentlySelectedPanelIndex].sign.subPanels[currentlySelectedSubPanelIndex];
		}
		const shields = subPanel.shields;

		while (shieldsContainerElmt.firstChild) {
			shieldsContainerElmt.removeChild(shieldsContainerElmt.lastChild);
		}

		for (let shieldIndex = 0, length = shields.length; shieldIndex < length; shieldIndex++) {

			const rowContainerElmt = document.createElement("div");
			rowContainerElmt.style.width = "100%";

			const toCheckElmt = document.createElement("input");
			toCheckElmt.type = "checkbox";
			toCheckElmt.id = `shield${shieldIndex}_to`;
			toCheckElmt.name = `shield${shieldIndex}_to`;
			toCheckElmt.checked = shields[shieldIndex].to;
			toCheckElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(toCheckElmt);

			const toCheckLabelElmt = document.createElement("label");
			toCheckLabelElmt.setAttribute("for", `shield${shieldIndex}_to`);
			toCheckLabelElmt.appendChild(document.createTextNode(" TO "));
			rowContainerElmt.appendChild(toCheckLabelElmt);

			// Populate shield options
			const typeSelectElmt = document.createElement("select");
			for (const type in Shield.prototype.types) {
				lib.appendOption(typeSelectElmt, Shield.prototype.types[type], {
					selected: (shields[shieldIndex].type == Shield.prototype.types[type]),
					text: type
				});
			}
			typeSelectElmt.id = `shield${shieldIndex}_type`;
			typeSelectElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(typeSelectElmt);

			const routeNumberElmt = document.createElement("input");
			routeNumberElmt.type = "text";
			routeNumberElmt.id = `shield${shieldIndex}_routeNumber`;
			routeNumberElmt.placeholder = "00";
			routeNumberElmt.value = shields[shieldIndex].routeNumber;
			routeNumberElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(routeNumberElmt);

			// Populate special banner type options
			const specialBannerTypeSelectElmt = document.createElement("select");

			if (Shield.prototype.specialBannerTypes[shields[shieldIndex].type] != undefined) {
				for (const specialBannerType of Object.keys(Shield.prototype.specialBannerTypes[shields[shieldIndex].type])) {
					if (checkSpecialShield(shieldIndex,specialBannerType)) {
						const optionElmt = document.createElement("option");
						optionElmt.value = specialBannerType
						if (specialBannerType == shields[shieldIndex].specialBannerType) {
							optionElmt.selected = true;
						} else {
							optionElmt.selected = false;
						}
						optionElmt.appendChild(document.createTextNode(specialBannerType));
						specialBannerTypeSelectElmt.appendChild(optionElmt);
					}
				}
				
				let optionElmt = document.createElement("option");
				optionElmt.value = "None";
				if ("None" == shields[shieldIndex].specialBannerType) {
					optionElmt.selected = true;
				} else {
					optionElmt.selected = false;
				}
				optionElmt.appendChild(document.createTextNode("None"));
				specialBannerTypeSelectElmt.appendChild(optionElmt);
				specialBannerTypeSelectElmt.style.visibility = "";
			} else {
				specialBannerTypeSelectElmt.style.visibility = "hidden";
			}

			specialBannerTypeSelectElmt.id = `shield${shieldIndex}_specialBannerType`;
			specialBannerTypeSelectElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(specialBannerTypeSelectElmt);

			rowContainerElmt.appendChild(document.createElement("br"));
			
			const indentElmt = document.createElement("input");
			indentElmt.type = "checkbox";
			indentElmt.id = `shield${shieldIndex}_indentFirstLetter`;
			indentElmt.checked = shields[shieldIndex].indentFirstLetter;
			indentElmt.onchange = readForm;
			rowContainerElmt.appendChild(indentElmt);
			
			const indentLabelElmt = document.createElement("label");
			indentLabelElmt.setAttribute("for",`shield${shieldIndex}_indentFirstLetter`)
			indentLabelElmt.appendChild(document.createTextNode("Enlarge First Letter"));
			rowContainerElmt.appendChild(indentLabelElmt);
			
			const fontSizeLabelElmt = document.createElement("label");
			fontSizeLabelElmt.setAttribute("for",`shield${shieldIndex}_fontSize`);
			fontSizeLabelElmt.appendChild(document.createTextNode("Text Size: "));
			fontSizeLabelElmt.style.marginLeft = "2rem";
			rowContainerElmt.appendChild(fontSizeLabelElmt);
			
			const fontSizeText = document.createElement("input");
			fontSizeText.type = "number";
			fontSizeText.id = `shield${shieldIndex}_fontSize`;
			fontSizeText.placeholder = 1.4;
			fontSizeText.value = parseFloat(shields[shieldIndex].fontSize.split("rem")[0]);
			fontSizeText.min = 1;
			fontSizeText.max = 3;
			fontSizeText.style.width = "4rem";
			fontSizeText.onchange = readForm;
			rowContainerElmt.appendChild(fontSizeText);

			
			rowContainerElmt.appendChild(document.createElement("br"));

			rowContainerElmt.appendChild(document.createTextNode("Banners:"));

			rowContainerElmt.appendChild(document.createElement("br"));

			// Populate banner type options
			const bannerTypeSelectElmt = document.createElement("select");
			for (const bannerType of Shield.prototype.bannerTypes) {
				lib.appendOption(bannerTypeSelectElmt, bannerType, {
					selected: (shields[shieldIndex].bannerType == bannerType)
				});
			}
			bannerTypeSelectElmt.id = `shield${shieldIndex}_bannerType`;
			bannerTypeSelectElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(bannerTypeSelectElmt);

			// Populate banner position options
			const bannerPositionSelectElmt = document.createElement("select");
			for (const bannerPosition of Shield.prototype.bannerPositions) {
				lib.appendOption(bannerPositionSelectElmt, bannerPosition, {
					selected: (shields[shieldIndex].bannerPosition == bannerPosition)
				});
			}
			bannerPositionSelectElmt.id = `shield${shieldIndex}_bannerPosition`;
			bannerPositionSelectElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(bannerPositionSelectElmt);

			rowContainerElmt.appendChild(document.createElement("br"));

			const bannerType2SelectElmt = document.createElement("select");
			for (const bannerType2 of Shield.prototype.bannerTypes) {
				lib.appendOption(bannerType2SelectElmt, bannerType2, {
					selected: (shields[shieldIndex].bannerType2 == bannerType2)
				});
			}
			bannerType2SelectElmt.id = `shield${shieldIndex}_bannerType2`;
			bannerType2SelectElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(bannerType2SelectElmt);

			// Populate banner position options

			rowContainerElmt.appendChild(document.createElement("br"));

			const duplicateElmt = document.createElement("input");
			duplicateElmt.type = "button";
			duplicateElmt.value = "Duplicate";
			duplicateElmt.dataset.shieldIndex = shieldIndex;
			duplicateElmt.addEventListener("click", function() {
				duplicateShield(shieldIndex)
			});
			rowContainerElmt.appendChild(duplicateElmt);

			const deleteElmt = document.createElement("input");
			deleteElmt.type = "button";
			deleteElmt.value = "Delete";
			deleteElmt.dataset.shieldIndex = shieldIndex;
			deleteElmt.addEventListener("click", function() {
				deleteShield(deleteElmt.dataset.shieldIndex);
			});

			rowContainerElmt.appendChild(deleteElmt);

			shieldsContainerElmt.appendChild(rowContainerElmt);
		}
	};

	/**
		Download the sign from options
	*/

	const downloadFile = function(dataURL,ending) {
		let a = document.createElement(`a`);
		a.setAttribute("href", dataURL);
		a.setAttribute("download", "downloadedSign" + ending);
		a.click();
		a.remove();
	}

	function getFile() {
		var screenshotTarget;
		var postClass;

		if (fileInfo.panel == -1) {
			screenshotTarget = document.querySelector("#postContainer");
		} else {
			screenshotTarget = document.getElementById("panel" + fileInfo.panel.toString());
		}


		return screenshotTarget;
	}
	
	const saveToPng = async function(file,isPreview,isSVG) {
		file.style.scale = "2";
		return new Promise((resolve, reject) => {
			let svg = htmlToImage.toSvg(file);
			file.style.scale = "";
			svg.then(function(dataUrl) {
				if (isSVG) {
					if (isPreview) {
						resolve(dataUrl);
					}
					downloadFile(dataUrl,".svg");
					return;
				}

				let tmpCanvas = document.createElement("canvas");
				let ctx = tmpCanvas.getContext("2d");
			
				let tmpImg = new Image();
				tmpImg.addEventListener("load", onTempImageLoad);
				tmpImg.src = dataUrl;
			
				console.log(tmpImg.width, tmpImg.height);

				tmpCanvas.width = tmpCanvas.height = 512;

				// let targetImg = new Image();

				function onTempImageLoad(e) {
					tmpCanvas.width = e.target.width;
					tmpCanvas.height = e.target.height;

					ctx.drawImage(e.target, 0, 0);
					if (isPreview) {
						resolve(tmpCanvas.toDataURL());
					} else {
						downloadFile(tmpCanvas.toDataURL(),".png");
						resolve(true);
					}
				};
				
			}).catch(function(error) {
				console.error("Error Saving!", error);
			});
		})
	}

	const downloadSign = async function() {
		const downloadPreview = document.getElementById("downloadPreview");
		const entirePost_option = document.getElementById("entirePost");
		const panelContainer = document.getElementById("panelContainer");
		const panelNumberSelector = document.getElementById("singularPanel");

		let background = "";

		if (entirePost_option.checked == true) {
			fileInfo.panel = -1;
			panelNumberSelector.style.display = "none";
			document.getElementById("downloadContents").style.verticalAlign = "10rem";
		} else {
			const panelNumber = document.getElementById("selectPanel");
			fileInfo.panel = (panelNumber.value - 1);
			panelNumberSelector.style.display = "block";
			document.getElementById("downloadContents").style.verticalAlign = "";
		}

		if (fileInfo.fileType == "png") {
			saveToPng(getFile(),false);
		} else if (fileInfo.fileType == "svg") {
			saveToPng(getFile(),false,true);
		}
	}

	const updatePreview = async function() {
		const downloadPreview = document.getElementById("downloadPreview");
		const entirePost_option = document.getElementById("entirePost");
		const panelContainer = document.getElementById("panelContainer");
		const panelNumberSelector = document.getElementById("singularPanel");

		let background = "";

		if (entirePost_option.checked == true) {
			fileInfo.panel = -1;
			panelNumberSelector.style.display = "none";
			document.getElementById("downloadContents").style.verticalAlign = "10rem";
		} else {
			const panelNumber = document.getElementById("selectPanel");
			fileInfo.panel = (panelNumber.value - 1);
			panelNumberSelector.style.display = "block";
			document.getElementById("downloadContents").style.verticalAlign = "";
		}
		
		while (downloadPreview.firstChild) {
			downloadPreview.removeChild(downloadPreview.lastChild);
		}
		
		const targetImg = new Image();
		targetImg.src = await saveToPng(getFile(),true);
		downloadPreview.appendChild(targetImg);
	}

	const updateFileType = function(fileType) {
		fileInfo.fileType = fileType;
		updatePreview();

		if (fileType == "png") {
			document.getElementById("PNG").className = "activated";
			document.getElementById("SVG").className = "";
		} else if (fileType == "svg") {
			document.getElementById("PNG").className = "";
			document.getElementById("SVG").className = "activated";
		}
	}
	
	const resetPadding = function(mode, params) {
		const panel = post.panels[currentlySelectedPanelIndex];
		panel.sign.padding = "0.5rem 0.75rem 0.5rem 0.75rem";
		
		document.getElementById("paddingTop").value = 0.5;
		document.getElementById("paddingRight").value = 0.75;
		document.getElementById("paddingBottom").value = 0.5;
		document.getElementById("paddingLeft").value = 0.75;
		
		updateForm();
		redraw();
	}

	/**
	 * Redraw the panels on the post.
	 */

	const redraw = function() {
		const postContainerElmt = document.getElementById("postContainer");

		postContainerElmt.className = `polePosition${post.polePosition}`;

		// post

		if (post.showPost == true) {
			var item = document.getElementsByClassName("post");
			for (let i = 0; i < item.length; i++) {
				item[i].style.visibility = "hidden";
			}

			const panelContainer = document.getElementById("panelContainer");

			panelContainer.style.background = "none";


		} else {
			var item = document.getElementsByClassName("post");
			for (let i = 0; i < item.length; i++) {

				if (post.polePosition.toLowerCase() != "overhead") {
					if (post.polePosition.toLowerCase() == "left") {
						item[0].style.visibility = "visible";
						item[1].style.visibility = "hidden";
					} else if (post.polePosition.toLowerCase() == "right") {
						item[0].style.visibility = "hidden";
						item[1].style.visibility = "visible";
					} else if (post.polePosition.toLowerCase() == "center" || post.polePosition.toLowerCase() == "rural") {
						//hide both
						item[0].style.visibility = "hidden";
						item[1].style.visibility = "hidden";
					}
					
				} else {
					item[i].style.visibility = "visible";
				}
			}

			const panelContainer = document.getElementById("panelContainer");

			if (post.polePosition.toLowerCase() == "center") {
				panelContainer.style.background = "linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 45%,rgba(191,191,191,1) 45%,rgba(240,240,240,1) 49%,rgba(128,128,128,1) 55%,rgba(255,255,255,0) 55%)";
			} else if (post.polePosition.toLowerCase() == "rural") {
				panelContainer.style.background = "linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 20%,rgba(191,191,191,1) 20%,rgba(240,240,240,1) 22%,rgba(128,128,128,1) 25%,rgba(255,255,255,0) 25%,rgba(255,255,255,0) 75%,rgba(191,191,191,1) 75%,rgba(240,240,240,1) 77%,rgba(128,128,128,1) 80%,rgba(255,255,255,0) 80%)"
			} else {
				panelContainer.style.background = "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 47%, rgba(191,191,191,1) 47%, rgba(240,240,240,1) 49%, rgba(128,128,128,1) 52%, rgba(255,255,255,0) 52%, rgba(255,255,255,0) 64%, rgba(191,191,191,1) 64%, rgba(240,240,240,1) 66%, rgba(128,128,128,1) 69%, rgba(255,255,255,0) 69%";
			}
		}

		const panelContainerElmt = document.getElementById("panelContainer");
		lib.clearChildren(panelContainerElmt);

		var index = -1;
		var firstExitTab = null;

		for (const panel of post.panels) {
			index++


			const panelElmt = document.createElement("div");
			panelElmt.className = `panel ${panel.color.toLowerCase()} ${panel.corner.toLowerCase()}`;
			panelElmt.id = "panel" + index;
			panelContainerElmt.appendChild(panelElmt);

			for (let exitTabIndex = panel.exitTabs.length - 1; exitTabIndex > -1; exitTabIndex--) {

				var exitTab = panel.exitTabs[exitTabIndex];

				const exitTabCont = document.createElement("div");
				exitTabCont.className = `exitTabContainer ${exitTab.position.toLowerCase()} ${exitTab.width.toLowerCase()}`;
				panelElmt.appendChild(exitTabCont);

				var nestedExitTabs = exitTab.nestedExitTabs.length;

				for (let nestIndex = -1; nestIndex < nestedExitTabs; nestIndex++) {
					if (nestIndex != -1) {
						exitTab = exitTab.nestedExitTabs[nestIndex];
					}

					const exitTabElmt = document.createElement("div");
					exitTabElmt.className = `exitTab ${exitTab.position.toLowerCase()} ${exitTab.width.toLowerCase()}`;

					const exitTabHolderElmt = document.createElement("div");
					exitTabHolderElmt.className = "exitTabHolder"
					exitTabHolderElmt.appendChild(exitTabElmt);

					exitTabCont.appendChild(exitTabHolderElmt);

					if ((exitTab.color != "Panel Color") && (exitTab.color != undefined)) {
						exitTabElmt.className += ` ${exitTab.color.toLowerCase()}`
						exitTabHolderElmt.className += ` ${exitTab.color.toLowerCase()}`
					} else {
						exitTabElmt.className += ` ${panel.color.toLowerCase()}`
						exitTabHolderElmt.className += ` ${panel.color.toLowerCase()}`
					}

					if (exitTab.FHWAFont) {
						exitTabElmt.style.fontFamily = "Series E";
					}


					if ((exitTab.number) || (exitTab.showLeft) || (exitTab.variant != "Default")) {
						if (exitTab.variant == "Default") {
							const leftElmt = document.createElement("div");

							if (exitTab.showLeft) {
								leftElmt.className = `yellowElmt`;
								leftElmt.appendChild(document.createTextNode("LEFT"));
								exitTabElmt.appendChild(leftElmt);
								exitTabElmt.style.display = "inline-block";

								if (exitTab.number) {
									leftElmt.style.marginRight = "0.4rem";
								}


							}

							const txtArr = exitTab.number.split(/(\d+\S*)/);
							const divTextElmt = document.createElement("div");
							divTextElmt.appendChild(document.createTextNode(txtArr[0]))
							exitTabElmt.appendChild(divTextElmt);


							if (txtArr.length > 1) {
								divTextElmt.className = "exitFormat";
								const spanNumeralElmt = document.createElement("span");
								spanNumeralElmt.className = "numeral";
								spanNumeralElmt.appendChild(document.createTextNode(txtArr[1]));
								exitTabElmt.appendChild(spanNumeralElmt);
								exitTabElmt.appendChild(document.createTextNode(txtArr.slice(2).join("")));
								if (exitTab.topOffset == false) {
									divTextElmt.style.top = "0rem";
								}
							}
						} else if (exitTab.variant == "Toll") {
							let tollAuthority = exitTab.icon;
	
							if (exitTab.useTextBasedIcon) {
								const tagElement = document.createElement("span");
								tagElement.textContent = tollAuthority.toUpperCase();
								tagElement.className = "tagText";

								const onlyElement = document.createElement("span");
								onlyElement.textContent = "ONLY";
								onlyElement.className = "tagOnlyText"

								exitTabElmt.appendChild(tagElement);
								exitTabElmt.appendChild(onlyElement);
							}
						} else if (exittab.variant == "Icon") {

						} else if (exitTab.variant == "Full Left") {

						} else if (exitTab.variant == "HOV 1") {

						} else if (exitTab.variant == "HOV 2") {

						}

						exitTabElmt.style.visibility = "visible";
						exitTabCont.className += " tabVisible";

						if (post.fontType == true) {
							exitTabElmt.style.fontFamily = "Series E";
						};

						if (exitTab.fullBorder == true) {
							exitTabElmt.style.borderBottomWidth = exitTab.borderThickness.toString() + "rem";
							exitTabElmt.style.borderBottomStyle = "solid";
							exitTabElmt.style.borderRadius = "0.5rem";
						}

						exitTabElmt.style.borderTopWidth = exitTab.borderThickness.toString() + "rem";
						exitTabElmt.style.borderLeftWidth = exitTab.borderThickness.toString() + "rem";
						exitTabElmt.style.borderRightWidth = exitTab.borderThickness.toString() + "rem";
						exitTabElmt.style.fontSize = exitTab.fontSize.toString() + "px";

						exitTabElmt.style.minHeight = exitTab.minHeight.toString() + "rem";

					}
				}


				if (exitTabIndex == 0) {
					firstExitTab = exitTabCont;
				}

				exitTabCont.style.display = "flex";

			}

			function createShield(i, p) {
				/*
					i: index (table parent)
					p: parent (object)
				*/

				var position;

				for (const shield of i) {
					if ((shield.bannerPosition != "Above") && ((shield.bannerType != "None") || (shield.bannerType2 != "None"))) {
						position = shield.bannerPosition;
						break;
					}
				}

				for (const shield of i) {
					if ((shield.bannerPosition != "Above") && (shield.bannerType != "None") || (shield.bannerType2 != "None") && (!locked)) {
						position = shield.bannerPosition;
						locked = true;
					}

					const toElmt = document.createElement("p");
					toElmt.className = "to";
					toElmt.appendChild(document.createTextNode("TO"));
					p.appendChild(toElmt);

					const bannerShieldContainerElmt = document.createElement("div");
					bannerShieldContainerElmt.className = `bannerShieldContainer ${shield.type} ${shield.specialBannerType.toLowerCase()} bannerPosition${shield.bannerPosition}`;

					switch (shield.routeNumber.length) {
						case 1:
							bannerShieldContainerElmt.className += " one";
							break;
						case 2:
							bannerShieldContainerElmt.className += " two";
							break;
						case 3:
							bannerShieldContainerElmt.className += " three";
							break;
						default:
							bannerShieldContainerElmt.className += " three";
							break;
					}

					p.appendChild(bannerShieldContainerElmt);

					const bannerContainerElmt = document.createElement("div");
					bannerContainerElmt.className = `bannerContainer`
					bannerShieldContainerElmt.appendChild(bannerContainerElmt);

					const bannerElmt = document.createElement("p");
					bannerElmt.className = "bannerA" + ((! shield.indentFirstLetter) ? " noIndent" : "");
					bannerElmt.style = "--fontSize:" + shield.fontSize;
					bannerContainerElmt.appendChild(bannerElmt);


					const shieldElmt = document.createElement("div");
					shieldElmt.className = "shield";
					shieldElmt.id = "shield" + i.indexOf(shield).toString();
					bannerShieldContainerElmt.appendChild(shieldElmt);

					const shieldImgElmt = document.createElement("img");
					shieldImgElmt.type = "image/png";
					shieldImgElmt.className = "shieldImg";

					switch (shield.routeNumber.length) {
						case 1:
							shieldImgElmt.className += " one";
							break;
						case 2:
							shieldImgElmt.className += " two";
							break;
						case 3:
							shieldImgElmt.className += " three";
							break;
						case 4:
							shieldImgElmt.className += " four";
							break;
						default:
							shieldImgElmt.className += " three";
							break;
					}

					shieldElmt.appendChild(shieldImgElmt);

					const bannerContainerElmt2 = document.createElement("div");
					bannerContainerElmt2.className = `bannerContainer2`
					bannerShieldContainerElmt.appendChild(bannerContainerElmt2);

					const bannerElmt2 = document.createElement("p");
					bannerElmt2.className = "bannerB" + ((! shield.indentFirstLetter) ? " noIndent" : "");
					bannerElmt2.style = "--fontSize:" + shield.fontSize;
					bannerContainerElmt2.appendChild(bannerElmt2);

					if (shield.bannerType2 == "Toll") {
						bannerElmt2.className += " TOLL"
					}

					const routeNumberElmt = document.createElement("p");
					routeNumberElmt.className = "routeNumber";
					shieldElmt.appendChild(routeNumberElmt);

					if (shield.to) {
						toElmt.style.display = "inline";
						bannerShieldContainerElmt.style.marginLeft = "0";
					}

					// If "Shield Backs" is checked, use directory with images of shields with backs
					//   else, use directory with images of shields with no backs
					let imgDir;
					if (panel.sign.shieldBacks) {
						imgDir = "img/shields-with-backs/";
					} else {
						imgDir = "img/shields-without-backs/";
					}

					// Shield type
					var lengthValue = shield.routeNumber.length;

					if (shield.routeNumber.length == 1) {
						lengthValue = 2;
					}

					const sameElement = ["AK", "C", "CO", "FL", "CD", "DC", "HI", "ID", "LA", "MI", "MN", "MT", "MT2", "NB", "NC", "NE", "NH", "NM", "NV", "PEI", "QC2", "REC2", "SC", "TN", "UT", "VA2", "WA", "WI", "WY"];

					if (sameElement.includes(shield.type)) {
						lengthValue = 2;
					}

					var imgFileConstr = shield.type + "-" + lengthValue;

					if (shield.specialBannerType != "None") {
						imgFileConstr += "-" + shield.specialBannerType.toUpperCase();
					}

					shieldImgElmt.src = imgDir + imgFileConstr + ".png";

					//shield                    

					if ((shield.type == "I") && (shield.routeNumber.length == 3)) {
						shieldImgElmt.style.width = "3.8rem";
					}


					if (position == "Right") {
						var shieldDistance;

						if (i == panel.sign.shields) {
							shieldDistance = panel.sign.shieldDistance;
						} else {
							shieldDistance = panel.sign.subPanels[currentlySelectedSubPanelIndex].shieldDistance;
						}

						shieldElmt.style.right = shieldDistance.toString() + "rem";

						if (shield.bannerType2 != "None") {
							bannerContainerElmt2.style.right = (shieldDistance * 2).toString() + "rem";
							bannerContainerElmt2.style.position = "relative"
							p.style.marginLeft = (i.length * shieldDistance * 2).toString() + "rem";
						} else {
							p.style.marginLeft = (i.length * shieldDistance).toString() + "rem";
						}
					} else if (position == "Left") {
						var shieldDistance;

						if (i == panel.sign.shields) {
							shieldDistance = panel.sign.shieldDistance;
						} else {
							shieldDistance = panel.sign.subPanels[currentlySelectedSubPanelIndex].shieldDistance;
						}

						shieldElmt.style.left = shieldDistance.toString() + "rem";

						if (shield.bannerType2 != "None") {
							bannerContainerElmt2.style.left = (shieldDistance * 2).toString() + "rem";
							bannerContainerElmt2.style.position = "relative"
							p.style.marginRight = (i.length * shieldDistance * 2).toString() + "rem";
						} else {
							p.style.marginRight = (i.length * shieldDistance).toString() + "rem";
						}
					}

					// Route Number
					routeNumberElmt.appendChild(document.createTextNode(shield.routeNumber));

					// Route banner

					if (shield.bannerType == "Toll") {
						bannerElmt.className += " TOLL"
					}

					if (shield.bannerType != "None") {
						bannerElmt.appendChild(document.createTextNode(shield.bannerType));
					} else {
						bannerElmt.appendChild(document.createTextNode(" "));
					}

					if (shield.bannerType2 != "None") {
						bannerElmt2.appendChild(document.createTextNode(shield.bannerType2));
					} else {
						bannerElmt2.appendChild(document.createTextNode(" "));
					}

					// Font change

					if (post.fontType == true) {
						toElmt.style.fontFamily = "Series E";
						bannerElmt.style.fontFamily = "Series E";
						bannerElmt2.style.fontFamily = "Series E";
					};

				}
			}

			function monitorActionMessage(i, p) {
				/*
					i: Array
					p: Parent (element)
				*/

				if (i.actionMessage != "") {
					if (post.fontType == true) {
						p.style.fontFamily = "Series E";
					} else {
						p.style.fontFamily = "Clearview 5WR";
					}
					p.style.visibility = "visible";
					p.style.display = "inline-flex";
					p.className = `actionMessage action_message`;
					const txtArr = i.actionMessage.split(/(\d+\S*)/);
					const txtFrac = txtArr[0].split(/([\u00BC-\u00BE]+\S*)/);

					p.appendChild(document.createTextNode(txtFrac[0]));



					if (((i.actionMessage.includes("½")) || (i.actionMessage.includes("¼")) || (i.actionMessage.includes("¾"))) && (txtArr.length > 2)) {
						const spanElmt = document.createElement("span");
						spanElmt.className = "numeral special";

						if (post.fontType) {
							spanElmt.style.fontSize = "1.5rem";
						}

						spanElmt.appendChild(document.createTextNode(txtArr[1]));
						p.appendChild(spanElmt);

						const spanFractionElmt = document.createElement("span");
						spanFractionElmt.className = "fraction special";

						if (post.fontType) {
							spanFractionElmt.style.fontSize = "1.15rem";
							spanFractionElmt.style.top = "-0.15rem";
							spanFractionElmt.style.position = "relative";
						}


						spanFractionElmt.appendChild(document.createTextNode(txtArr[2].split(/([\u00BC-\u00BE]+\S*)/)[1]));
						p.appendChild(spanFractionElmt);
						p.appendChild(document.createTextNode(txtArr[2].split(/([\u00BC-\u00BE]+\S*)/).slice(2).join("")));


					} else {
						if (txtArr.length > 1) {
							const spanElmt = document.createElement("span");
							spanElmt.className = "numeral";

							if (post.fontType) {
								spanElmt.style.fontSize = "1.5rem";
							}

							spanElmt.appendChild(document.createTextNode(txtArr[1]));
							p.appendChild(spanElmt);
							p.appendChild(document.createTextNode(txtArr.slice(2).join("")));
						}
						if (txtFrac.length > 1) {
							const spanFractionElmt = document.createElement("span");
							spanFractionElmt.className = "fraction";

							if (post.fontType) {
								spanFractionElmt.style.fontSize = "1.15rem";
								spanFractionElmt.style.top = "-0.15rem";
								spanFractionElmt.style.position = "relative";
							}

							spanFractionElmt.appendChild(document.createTextNode(txtFrac[1]));
							p.appendChild(spanFractionElmt);
							p.appendChild(document.createTextNode(txtFrac.slice(2).join("")));
						}
					}


				} else {
					p.style.display = "none";
				}
			}

			function monitorControlText(i, p) {
				function LineEditor(line) {
					if (line.includes("</>")) {
						line = line.split("</>");
						p.appendChild(document.createTextNode(line[0] + "⠀⠀⠀⠀⠀⠀⠀⠀⠀" + line[1]));
					} else if (line.includes("<-->")) {} else {
						p.appendChild(document.createTextNode(line));
					}
				}

				const controlTextArray = i.controlText.split("\n");
				for (let lineNum = 0, length = controlTextArray.length - 1; lineNum < length; lineNum++) {
					LineEditor(controlTextArray[lineNum])
					p.appendChild(document.createElement("br"));
				}

				LineEditor(controlTextArray[controlTextArray.length - 1]);
			}

			const signCont = document.createElement("div");
			signCont.className = `signContainer ${panel.exitTabs[0].width.toLowerCase()}`;
			panelElmt.appendChild(signCont);

			const signElmt = document.createElement("div");
			signElmt.className = `sign ${panel.exitTabs[0].width.toLowerCase()}`;

			if ((panel.exitTabs.length > 0) && (panel.exitTabs[0].number != null)) {
				signElmt.className += " tabVisible";
			}

			signCont.appendChild(signElmt);

			const g_top = document.createElement("div");
			g_top.className = `globalTop`;
			signElmt.appendChild(g_top);

			const signHolderElmt = document.createElement("div");
			signHolderElmt.className = `signHolder`;
			signElmt.appendChild(signHolderElmt);

			const g_bottom = document.createElement("div");
			g_bottom.className = `globalBottom`;
			signElmt.appendChild(g_bottom);

			const g_shieldsContainerElmt = document.createElement("div");
			g_shieldsContainerElmt.className = `shieldsContainer ${panel.sign.shieldBacks ? "shieldBacks" : ""}`;

			createShield(panel.sign.shields, g_shieldsContainerElmt);

			const g_controlTextElmt = document.createElement("p");
			g_controlTextElmt.className = "controlText";

			if (post.fontType) {
				g_controlTextElmt.style.fontFamily = "Series EM";
			}

			monitorControlText(panel.sign, g_controlTextElmt);

			const g_actionMessageElmt = document.createElement("div");
			g_actionMessageElmt.className = `actionMessage`;

			if (post.fontType) {
				g_actionMessage.className = "Series E";
			}

			monitorActionMessage(panel.sign, g_actionMessageElmt);

			if ((panel.sign.shields.length != 0) || (panel.sign.controlText != "") || (panel.sign.actionMessage != "")) {
				if (panel.sign.globalPositioning.toLowerCase() == "top") {
					g_top.appendChild(g_shieldsContainerElmt);
					g_top.appendChild(g_controlTextElmt);
					g_top.appendChild(g_actionMessageElmt);
					g_top.style.padding = "0.5rem 0rem 0.5rem 0rem";
				} else if (panel.sign.globalPositioning.toLowerCase() == "bottom") {
					g_bottom.appendChild(g_shieldsContainerElmt);
					g_bottom.appendChild(g_controlTextElmt);
					g_bottom.appendChild(g_actionMessageElmt);
					g_bottom.style.padding = "0.5rem 0rem 0.5rem 0rem";
				} else if (panel.sign.globalPositioning.toLowerCase() == "shield top") {
					g_top.appendChild(g_shieldsContainerElmt);
					g_bottom.appendChild(g_controlTextElmt);
					g_bottom.appendChild(g_actionMessageElmt);
					g_top.style.padding = "0.5rem 0rem 0.5rem 0rem";
					g_bottom.style.padding = "0.5rem 0rem 0.5rem 0rem";
				} else if (panel.sign.globalPositioning.toLowerCase() == "control top") {
					g_bottom.appendChild(g_shieldsContainerElmt);
					g_top.appendChild(g_controlTextElmt);
					g_top.appendChild(g_actionMessageElmt);
					g_top.style.padding = "0.5rem 0rem 0.5rem 0rem";
					g_bottom.style.padding = "0.5rem 0rem 0.5rem 0rem";
				}
			}

			const guideArrowsElmt = document.createElement("div");
			guideArrowsElmt.className = `guideArrows ${panel.sign.guideArrow.replace("/", "-").replace(" ", "_").toLowerCase()} ${panel.sign.arrowPosition.toLowerCase()}`;
			signCont.appendChild(guideArrowsElmt);

			const otherSymbolsElmt = document.createElement("div");
			otherSymbolsElmt.className = `otherSymbols ${panel.sign.otherSymbol.replace("/", "-").replace(" ", "_").toLowerCase()}`;
			guideArrowsElmt.appendChild(otherSymbolsElmt);

			const oSNumElmt = document.createElement("div");
			oSNumElmt.className = `oSNum`;
			otherSymbolsElmt.appendChild(oSNumElmt);

			const arrowContElmt = document.createElement("div");
			arrowContElmt.className = `arrowContainer`;
			guideArrowsElmt.appendChild(arrowContElmt);

			const sideLeftArrowElmt = document.createElement("img");
			sideLeftArrowElmt.className = "sideLeftArrow";
			sideLeftArrowElmt.src = "img/arrows/MainArrows/A-4.png";
			signHolderElmt.appendChild(sideLeftArrowElmt);

			// subpanels

			for (let subPanelIndex = 0; subPanelIndex < panel.sign.subPanels.length; subPanelIndex++) {

				const subPanel = panel.sign.subPanels[subPanelIndex];
				let locked = false;

				if (subPanelIndex > 0) {
					const subDivider = document.createElement("div");
					subDivider.className = "subDivider";
					subDivider.id = "subDivider" + subPanelIndex.toString();
					subDivider.style.height = panel.sign.subPanels[subPanelIndex].height;
					signHolderElmt.appendChild(subDivider);
				}

				const new_subPanel = document.createElement("div");
				new_subPanel.className = "subPanelDisplay";
				new_subPanel.id = "S_subPanel" + subPanelIndex.toString();
				signHolderElmt.appendChild(new_subPanel);

				const signContentContainerElmt = document.createElement("div");
				signContentContainerElmt.className = `signContentContainer shieldPosition${panel.sign.shieldPosition}`;
				signContentContainerElmt.id = "signContentContainer" + subPanelIndex.toString();
				signHolderElmt.appendChild(signContentContainerElmt);


				const shieldsContainerElmt = document.createElement("div");
				shieldsContainerElmt.className = `shieldsContainer ${panel.sign.shieldBacks ? "shieldBacks" : ""}`;
				shieldsContainerElmt.id = "shieldsContainer" + subPanelIndex.toString();
				signContentContainerElmt.appendChild(shieldsContainerElmt);

				const controlTextElmt = document.createElement("p");
				controlTextElmt.className = "controlText";
				controlTextElmt.id = "controlText" + subPanelIndex.toString();
				signContentContainerElmt.appendChild(controlTextElmt);

				const actionMessageElmt = document.createElement("div");
				actionMessageElmt.className = `actionMessage`;
				actionMessageElmt.id = "actionMessage" + subPanelIndex.toString();
				signContentContainerElmt.appendChild(actionMessageElmt);

				// Shields
				createShield(subPanel.shields, shieldsContainerElmt);

				// sign
				signContentContainerElmt.style.padding = panel.sign.padding;

				monitorControlText(subPanel, controlTextElmt);


				if (post.fontType == true) {
					controlTextElmt.style.fontFamily = "Series EM";
				}

				monitorActionMessage(subPanel, actionMessageElmt);

			}

			const sideRightArrowElmt = document.createElement("img");
			sideRightArrowElmt.className = "sideRightArrow";
			sideRightArrowElmt.src = "img/arrows/MainArrows/A-1.png";
			signHolderElmt.appendChild(sideRightArrowElmt);

			// Guide arrows

			const ExitKeys = ["EA", "EB", "EC"];
			const MainKeys = ["A", "B", "C", "D", "E"];
			var path;


			const createArrowElmt = function(key, dir, name, extra) {

				if (dir == "MainArrows!ExitOnly") {
					key = key.split("/")[1];
				} else {
					key = key.split("/")[0];
				}


				if ((ExitKeys.includes(key.split("-")[0])) || (MainKeys.includes(key.split("-")[0]))) {
					const downArrowElmt = document.createElement("img");
					downArrowElmt.className = name || "exitOnlyArrow ";

					if (extra) {
						downArrowElmt.className += " " + extra;
					}

					var directory = "ExitOnlyArrows";

					if (dir == "MainArrows!ExitOnly") {
						directory = "MainArrows";
					} else if (dir) {
						directory = dir;
					}

					downArrowElmt.src = "img/arrows/" + directory + "/" + key + ".png";
					return downArrowElmt;
				}
			}

			if ((panel.sign.arrowPosition == "Left") && (panel.sign.guideArrow != "Exit Only") && (panel.sign.guideArrow != "Side Left") && (panel.sign.guideArrow != "Side Right") && (panel.sign.guideArrow != "Half Exit Only")) {
				arrowContElmt.style.justifyContent = "left";
			} else if (panel.sign.arrowPosition == "Middle") {
				arrowContElmt.style.justifyContent = "";
			} else if ((panel.sign.arrowPosition == "Right") && (panel.sign.guideArrow != "Exit Only") && (panel.sign.guideArrow != "Side Left") && (panel.sign.guideArrow != "Side Right") && (panel.sign.guideArrow != "Half Exit Only")) {
				arrowContElmt.style.justifyContent = "right";
			}

			if (panel.sign.guideArrow.includes("Exit Only")) {
				
				if ((!post.secondExitOnly) && (panel.sign.guideArrow != "Split Exit Only")) {
					guideArrowsElmt.style.padding = panel.sign.exitOnlyPadding + "rem";
				}
				
				if (panel.sign.guideArrow == "Half Exit Only") {
					const secondaryContainer = document.createElement("div");
					secondaryContainer.className = `arrowContainer ${panel.sign.guideArrow.replace("/", "-").replace(" ", "_").toLowerCase()} ${panel.sign.arrowPosition.toLowerCase()}`;

					guideArrowsElmt.className += (post.secondExitOnly) ? " new2" : " default";
					

					path = secondaryContainer

					const arrow = createArrowElmt(panel.sign.exitguideArrows.split(":")[1], "MainArrows!ExitOnly", "halfarrow", panel.sign.arrowPosition.toLowerCase());

					if (panel.sign.arrowPosition.toLowerCase() == "left") {
						arrowContElmt.appendChild(secondaryContainer);
						arrowContElmt.appendChild(arrow);

						if (panel.sign.guideArrowLanes > 1) {

							var marginLeft = 4;

							for (let i = 1; i <= panel.sign.guideArrowLanes - 2; i++) {
								if (i % 2 == 0) {
									marginLeft += 12;
								} else {
									marginLeft += 4;
								}
							}
						}

					} else {
						arrowContElmt.appendChild(arrow);
						arrowContElmt.appendChild(secondaryContainer);

						if (panel.sign.guideArrowLanes > 1) {

							var marginLeft = 11;

							for (let i = 1; i <= panel.sign.guideArrowLanes - 2; i++) {
								if (i % 2 == 0) {
									marginLeft += 12;
								} else {
									marginLeft += 4;
								}

							}
						}
					}
					
					if (post.secondExitOnly && (panel.sign.guideArrow != "Split Exit Only")) {
						path.style.padding = panel.sign.exitOnlyPadding + "rem";
					}
					

				} else {
					path = arrowContElmt
				}
			}



			if ("Side Left" == panel.sign.guideArrow) {
				sideLeftArrowElmt.style.display = "block";
			} else if ("Side Right" == panel.sign.guideArrow) {
				sideRightArrowElmt.style.display = "block";
			} else if ("None" != panel.sign.guideArrow) {
				signElmt.style.borderBottomLeftRadius = "0";
				signElmt.style.borderBottomRightRadius = "0";
				signElmt.style.borderBottomWidth = "0";
				signElmt.style.width = "100%";
				guideArrowsElmt.style.display = "block";
				guideArrowsElmt.style.visibility = "visible";
				if (("Exit Only" == panel.sign.guideArrow) || ("Split Exit Only" == panel.sign.guideArrow) || ("Half Exit Only" == panel.sign.guideArrow)) {

					if ((post.secondExitOnly == true) || (panel.sign.guideArrow == "Half Exit Only")) {
						if (panel.sign.guideArrow == "Exit Only") {
							guideArrowsElmt.className += " new";
							arrowContElmt.className += " new";
						} if (panel.sign.guideArrow == "Half Exit Only") {
							path.className += " new2";
							arrowContElmt.className += " new2";
							arrowContElmt.style.justifyContent = "space-between";
							arrowContElmt.style.gap = "5rem";
						}
						guideArrowsElmt.style.display = "flex";
					}
					
					if ((post.secondExitOnly) && (panel.sign.guideArrow == "Exit Only")) {
						console.log("hi");
						path.style.padding = panel.sign.exitOnlyPadding + "rem";
					}
					
					/*

						if (panel.sign.advisoryMessage) {
							actionMessageElmt.style.fontFamily = "Series E";
						}
					
					*/

					// Interlase arrows and the words EXIT and ONLY, ensuring
					//   EXIT ONLY is centered between all the arrows.
					if (panel.sign.guideArrowLanes == 0 && panel.sign.advisoryMessage == true) {
						const actionMessage = document.createElement("span");
						actionMessage.className = "exitOnlyText";
						actionMessage.appendChild(document.createTextNode(panel.sign.advisoryText));
						path.appendChild(actionMessage);
					} else {
						for (let arrowIndex = 0, length = panel.sign.guideArrowLanes; arrowIndex < length; arrowIndex++) {
							// Evens
							if (length % 2 == 0) {
								if (arrowIndex == Math.floor(length / 2)) {
									const textExitOnlySpanElmt = document.createElement("span");
									if (panel.sign.showExitOnly == false) {
										textExitOnlySpanElmt.appendChild(document.createTextNode("EXIT ONLY"));

										var bonus = "";

										if (panel.sign.guideArrow == "Split Exit Only") {
											bonus = " yellowElmt"
										}

										textExitOnlySpanElmt.className = "exitOnlyText" + bonus;
									} else {
										textExitOnlySpanElmt.appendChild(document.createTextNode("⠀⠀⠀⠀ ⠀⠀⠀⠀"));
										textExitOnlySpanElmt.className = "exitOnlyText";
									}
									path.appendChild(textExitOnlySpanElmt);

									if (panel.sign.guideArrow == "Split Exit Only") {
										path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1], "MainArrows!ExitOnly"));
									} else {
										path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1]));
									}

									if ((arrowIndex + 1 < length) && (length != 2)) {
										const space = document.createElement("span")
										space.className = "exitOnlySpace";
										path.appendChild(space);
									}
								} else {

									if (panel.sign.guideArrow == "Split Exit Only") {
										path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1], "MainArrows!ExitOnly"));
									} else {
										path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1]));
									}

									if ((arrowIndex + 1 < length) && (arrowIndex + 1 != Math.ceil(length / 2)) && (length != 2)) {
										const space = document.createElement("span")
										space.className = "exitOnlySpace";
										path.appendChild(space);
									}
								}
							} else { // Odds
								if (arrowIndex == Math.floor(length / 2)) {
									const textExitSpanElmt = document.createElement("span");
									if (panel.sign.showExitOnly == false) {
										textExitSpanElmt.appendChild(document.createTextNode("EXIT"));

										var bonus = "";

										if (panel.sign.guideArrow == "Split Exit Only") {
											bonus = " yellowElmt"
										}

										textExitSpanElmt.className = "exitOnlyText" + bonus;
									} else {
										textExitSpanElmt.appendChild(document.createTextNode("⠀⠀⠀⠀"));
										textExitSpanElmt.className = "exitOnlyText";
									}

									path.appendChild(textExitSpanElmt);

									if (panel.sign.guideArrow == "Split Exit Only") {
										path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1], "MainArrows!ExitOnly"));
									} else {
										path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1]));
									}

									const textOnlySpanElmt = document.createElement("span");
									if (panel.sign.showExitOnly == false) {
										textOnlySpanElmt.appendChild(document.createTextNode("ONLY"));

										var bonus = "";

										if (panel.sign.guideArrow == "Split Exit Only") {
											bonus = " yellowElmt"
										}

										textOnlySpanElmt.className = "exitOnlyText" + bonus;
									} else {
										textOnlySpanElmt.appendChild(document.createTextNode("⠀⠀⠀⠀"));
										textOnlySpanElmt.className = "exitOnlyText";
									}
									path.appendChild(textOnlySpanElmt);
								} else if (arrowIndex == Math.ceil(length / 2)) {

									if (panel.sign.guideArrow == "Split Exit Only") {
										path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1], "MainArrows!ExitOnly"));
									} else {
										path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1]));
									}

									if ((arrowIndex + 1 < length) && (arrowIndex + 1 != Math.floor(length / 2)) && (length != 2)) {
										const space = document.createElement("span")
										space.className = "exitOnlySpace";
										path.appendChild(space);
									}
								} else {

									if (panel.sign.guideArrow == "Split Exit Only") {
										path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1], "MainArrows!ExitOnly"));
									} else {
										path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1]));
									}

									if ((arrowIndex + 1 < length) && (arrowIndex + 1 != Math.floor(length / 2)) && (length != 2)) {
										const space = document.createElement("span")
										space.className = "exitOnlySpace";
										path.appendChild(space);
									}
								}
							}
						}
					}
				} else {

					for (let arrowIndex = 0, length = panel.sign.guideArrowLanes; arrowIndex < length; arrowIndex++) {
						if (arrowIndex % 2 == 0) {
							arrowContElmt.insertBefore(createArrowElmt(panel.sign.guideArrow.split(":")[1], "MainArrows", "arrow", panel.sign.guideArrow.split(":")[0].toLowerCase().replace(/ /g, '')), arrowContElmt.childNodes[0]);
						} else {
							arrowContElmt.appendChild(createArrowElmt(panel.sign.guideArrow.split(":")[1], "MainArrows", "arrow", panel.sign.guideArrow.split(":")[0]));
						}
					}
				}
			}
			// Bottom Symbols


			if (panel.sign.oSNum != "" && panel.sign.otherSymbol != "None") {
				signElmt.style.borderBottomLeftRadius = "0";
				signElmt.style.borderBottomRightRadius = "0";
				signElmt.style.borderBottomWidth = "0";
				guideArrowsElmt.style.display = "block";
				guideArrowsElmt.style.visibility = "visible";
				oSNumElmt.style.visibility = "visible";
				oSNumElmt.className = `oSNum`;
				oSNumElmt.appendChild(document.createTextNode(panel.sign.oSNum));
				switch (panel.sign.oSNum.length) {
					case 1:
						oSNumElmt.className += " short";
						break;
					case 2:
						oSNumElmt.className += " short";
						break;
					case 3:
						oSNumElmt.className += " three";
						break;
					case 5:
						oSNumElmt.className += " five";
						break;
					default:
						oSNumElmt.className += " three";
						break;
				}
			} else {
				otherSymbolsElmt.style.display = "none";
			}

			switch (panel.sign.otherSymbol) {
				case "Quebec-Style Exit Marker": //Fallthrough
				case "Quebec-Left":
					const markerElmt = document.createElement("object");
					markerElmt.className = "markerImg";
					markerElmt.type = "image/svg+xml";
					markerElmt.data = "img/other-symbols/QC-Exit.svg";
					if (panel.sign.otherSymbol == "Quebec-Left") {
						otherSymbolsElmt.className += " left";
					}
					otherSymbolsElmt.appendChild(markerElmt);
				default:

			}

			var width = signCont.clientWidth;
			var exitWidth = firstExitTab.clientWidth;

			if (exitWidth > width) {
				signCont.style.width = firstExitTab.clientWidth + "px";
			}

		}



	};

	const getPost = function() {
		return post;
	}
	
	const setPost = function(newPost) {
		post = newPost;
		currentlySelectedPanelIndex = 0;
		updateForm();
		redraw();
	}

	return {
		init: init,
		newPanel: newPanel,
		duplicatePanel: duplicatePanel,
		deletePanel: deletePanel,
		shiftLeft: shiftLeft,
		shiftRight: shiftRight,
		changeEditingPanel: changeEditingPanel,
		newShield: newShield,
		clearShields: clearShields,
		readForm: readForm,
		newSubPanel: addSubPanel,
		removeSubPanel: removeSubPanel,
		changeEditingSubPanel: changeEditingSubPanel,
		duplicateSubPanel: duplicateSubPanel,
		downloadSign: downloadSign,
		updatePreview: updatePreview,
		updateFileType: updateFileType,
		resetPadding: resetPadding,
		newExitTab: newExitTab,
		duplicateExitTab: duplicateExitTab,
		removeExitTab: removeExitTab,
		changeEditingExitTab: changeEditingExitTab,
		newNestExitTab: newNestExitTab,
		deleteNestExitTab: deleteNestExitTab,
		getPost: getPost,
		setPost: setPost
	};
})();
