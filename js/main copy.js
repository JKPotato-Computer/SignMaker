const app = (function() {
	let post = {};
	let currentlySelectedPanelIndex = -1;

	/**
	 * Initialize the application.
	 */
	const init = function() {
		// Create the post on which to place panels
		post = new Post(Post.prototype.polePositions[0]);

		// Populate post position options
		const postPositionSelectElmt = document.getElementById("postPosition");
		for (const polePosition of Post.prototype.polePositions) {
			lib.appendOption(postPositionSelectElmt, polePosition, {selected : (polePosition == "Left")});
		}

		// Populate color options
		const colorSelectElmt = document.getElementById("panelColor");
		for (const color in lib.colors) {
			lib.appendOption(colorSelectElmt, color, {text : color});
		}
		const cornerTypeSelectElmt = document.getElementById("panelCorner");
		for (const corner of Panel.prototype.cornerType) {
			lib.appendOption(cornerTypeSelectElmt, corner, {selected : (corner == "Round")});
		}

		// Populate exit tab position options
		const exitTabPositionSelectElmt = document.getElementById("exitTabPosition");
		for (const position of ExitTab.prototype.positions) {
			lib.appendOption(exitTabPositionSelectElmt, position, {selected : (position == "Right")});
		}

		// Populate exit tab width options
		const exitTabWidthSelectElmt = document.getElementById("exitTabWidth");
		for (const width of ExitTab.prototype.widths) {
			lib.appendOption(exitTabWidthSelectElmt, width, {selected : (width == "Narrow")});
		}
        
        // Populate left options
        const leftPositionElmt = document.getElementById("LeftPosition");
        for (const position of Sign.prototype.leftPositions) {
            lib.appendOption(leftPositionElmt, position, {selected : (position == "Above")})
        }

		// Populate the shield position options
		const shieldPositionsSelectElmt = document.getElementById("shieldsPosition");
		for (const position of Sign.prototype.shieldPositions) {
			lib.appendOption(shieldPositionsSelectElmt, position, {selected : (position == "Above")});
		}

		// Populate the guide arrow options
		const guideArrowSelectElmt = document.getElementById("guideArrow");
		for (const guideArrow of Sign.prototype.guideArrows) {
			lib.appendOption(guideArrowSelectElmt, guideArrow);
		}
        
        // Populate the exit only guide arrow options
        const exitOnlyDirectionElmt = document.getElementById("exitOnlyDirection");
		for (const exitguideArrows of Sign.prototype.exitguideArrows) {
			lib.appendOption(exitOnlyDirectionElmt, exitguideArrows);
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
        
        // Populate the exit color options
        const exitColorSelectElement = document.getElementById("exitColor");
        for (const exitColor of ExitTab.prototype.colors) {
            lib.appendOption(exitColorSelectElement,exitColor);
        }
        
        
        // Start the "import" function
        
        const modal = document.getElementById("uploadModal");
        const btn = document.getElementById("Import");
        const span = document.getElementsByClassName("close")[0];
                
                
        btn.onclick = function() {
            modal.style.display = "block";
        }
                
        span.onclick = function() {
            modal.style.display = "none";
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }   
        

		newPanel();
	};

	/**
	 * Create a new panel and add it to the post.
	 *   Set the currently selected panel for editing to the new panel.
	 *   Update the form to reflect the new panel.
	 *   Redraw the page.
	 */
	const newPanel = function() {
		post.newPanel();
		currentlySelectedPanelIndex = post.panels.length - 1;
		updateForm();
		redraw();
	};

	/**
	 * Duplicate the currently selected panel.
	 *   Set the currently selected panel for editing to the newly duplicated panel.
	 *   Update the form to reflect the new panel.
	 *   Redraw the page.
	 */
	const duplicatePanel = function() {
		post.duplicatePanel(currentlySelectedPanelIndex);
		currentlySelectedPanelIndex++;
		updateForm();
		redraw();
	};

	/**
	 * Delete the currently selected panel.
	 *   Set the currently selected panel for editing to the panel ahead of the deleted panel.
	 *   Update the form to reflect the newly selected panel.
	 *   Redraw the page.
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

	/**
	 * Shift the currently selected panel left.
	 *   Set the currently selected panel for editing to the new index.
	 *   Redraw the page.
	 */
	const shiftLeft = function() {
		currentlySelectedPanelIndex = post.shiftLeft(currentlySelectedPanelIndex);
		redraw();
	};

	/**
	 * Shift the currently selected panel right.
	 *   Set the currently selected panel for editing to the new index.
	 *   Redraw the page.
	 */
	const shiftRight = function() {
		currentlySelectedPanelIndex = post.shiftRight(currentlySelectedPanelIndex);
		redraw();
	};

	/**
	 * Change the current panel being edited.
	 *   Update the form to reflect the newly selected panel.
	 */
	const changeEditingPanel = function(number) {
        if ((number >= 0) && (number < post.panels.length)) {
            currentlySelectedPanelIndex = number;
        } else if (number > post.panels.length) {
            currentlySelectedPanelIndex = (post.panels.length - 1);
        } else {
            currentlySelectedPanelIndex = 0;
        }
		updateForm();
	};

	/**
	 * Add a new shield to the current panel's sign.
	 *   Update the shield subform with the new shield.
	 */
	const newShield = function() {
		const sign = post.panels[currentlySelectedPanelIndex].sign;
		sign.newShield();
		updateShieldSubform();
		redraw();
	};

	/**
	 * Delete a shield to the current panel's sign.
	 *   Update the shield subform with the new shield.
	 */
	const deleteShield = function() {
		const sign = post.panels[currentlySelectedPanelIndex].sign;
		sign.deleteShield(this.dataset.shieldIndex);
		updateShieldSubform();
		redraw();
	};
    
    const clearShields = function() {
        var items = post.panels[currentlySelectedPanelIndex].sign.shields.length
        if (items != 0) {
            const sign = post.panels[currentlySelectedPanelIndex].sign;
            for (let i = 0 - items; i < items; i++) {
                sign.deleteShield(i);
                updateShieldSubform();
                redraw();
            }
        }
    };
    
    const duplicateShield = function(shieldIndex) {
        const sign = post.panels[currentlySelectedPanelIndex].sign;
        sign.duplicateShield(shieldIndex);
		updateShieldSubform();
		redraw();
    }
    
    const importData = function(data) {
            var newData = data.split("+");
            for (let i = 0;i < newData.length;i++) {
                
                if (i != 0) {
                    post.newPanel();
                    currentlySelectedPanelIndex = post.panels.length - 1
                }
                
                var split_data = newData[i].split(":");
                
                var panels_data = split_data[0] + "";
                panels_data = panels_data.split(";");
                var exit_data = split_data[1] + "";
                exit_data = exit_data.split(";");
                var shield_data;
                
                if (split_data[2] == "None") {
                    shield_data = "None";
                } else {
                    shield_data = split_data[2] + "";
                    shield_data = shield_data.split(",");
                }
                
                var shield_info_data = split_data[3] + "";
                shield_info_data = shield_info_data.split(";");
                var sign_data = split_data[4] + "";
                sign_data = sign_data.split(";");
                var other_data = split_data[5] + "";
                other_data = other_data.split(";");
                var other_other_data = split_data[6] + "";
                other_other_data = other_other_data.split(";");
                
                var minus_val = 0;
                
                if (i == 0) {
                    post.polePosition = panels_data[0];
                } else {
                    minus_val = 1;
                }
                
                var current_panel = post.panels[i];
                
                current_panel.color = panels_data[1 - minus_val];
                current_panel.corner = panels_data[2 - minus_val];
                
                if (exit_data[0] == "null") {
                    current_panel.exitTab.number = ""
                } else {
                     current_panel.exitTab.number = exit_data[0];
                }
                
                current_panel.exitTab.position = exit_data[1];
                current_panel.exitTab.width = exit_data[2];
                
                var shields = current_panel.sign.shields;
                
                if (shield_data != "None") {
                    if (shield_data.length > 1) {
                        for (let i = 0; i < shield_data.length; i++) {
                            
                            current_panel.sign.newShield();
                            
                            var current_shield = shields[i];
                            var current_data = shield_data[i].split(";");
                            
                            
                            current_shield.type = current_data[0];
                            current_shield.routeNumber = current_data[1];
                            if (current_data[2].toString() == "true") {
                                current_shield.to = true;
                            } else {
                                current_shield.to = false;
                            }
                            current_shield.specialBannerType = current_data[3];
                            current_shield.bannerType = current_data[4];
                            current_shield.bannerType2 = current_data[5];
                            current_shield.bannerPosition = current_data[6];
                        }
                    } else {
                        
                        current_panel.sign.newShield();
                        
                        var current_shield = shields[0];
                        var current_data = shield_data[0].split(";")
                        
                        
                        current_shield.type = current_data[0];
                        current_shield.routeNumber = current_data[1];
                        if (current_data[2].toString() == "true") {
                                current_shield.to = true;
                            } else {
                                current_shield.to = false;
                        }
                        current_shield.specialBannerType = current_data[3];
                        current_shield.bannerType = current_data[4];
                        current_shield.bannerType2 = current_data[5];
                        current_shield.bannerPosition = current_data[6];
                    }
                }
                
                var current_sign = current_panel.sign;
                
                current_sign.shieldPosition = shield_info_data[0];
                
                if (shield_info_data[1] == "false") {
                    current_sign.shieldBacks = false;
                } else {
                    current_sign.shieldBacks = true;
                }
                       
                current_sign.controlText = sign_data[0].replaceAll(`"`,"");
                current_sign.guideArrow = sign_data[1];
                current_sign.arrowPosition = sign_data[2];
                current_sign.guideArrowLanes = sign_data[3];
                current_sign.exitguideArrows = sign_data[4].replaceAll(`"`,"");
                
                if (sign_data[4] == "false") {
                    current_sign.showExitOnly = false;
                } else {
                    current_sign.showExitOnly = true;
                }
                
                current_sign.otherSymbol = other_data[0];
                
                if (other_data[1] == "null") {
                    current_sign.oSNum = "";
                } else {
                    current_sign.oSNum = other_data[1];
                }
                current_sign.actionMessage = other_data[2].replaceAll(`"`,"");
                
                if (other_other_data == "true") {
                    current_sign.advisoryMessage = true;
                } else {
                    current_sign.advisoryMessage = false;
                }
                
                current_sign.exitTabColor = other_other_data[1];
                
            }
            
            updateForm();
            redraw();
    }
    
    const exportData = function() {
        var dataToSave = post.polePosition + ";";
        for (let i = 0; i < post.panels.length; i++) {
            var panel = post.panels[i];
            function add(data) {
                dataToSave += data + ";";
            };
            
            function add2(data) {
                 dataToSave += data;
            }
            
            function add_string(data) {
                dataToSave += `"` + data + `";`;
            };
            
             function add_string2(data) {
                dataToSave += `"` + data + `"`;
            };
            
            
            
            function new_chunk() {
                dataToSave += ":";
            };
            
            function shield(shieldIndex) {
                add(panel.sign.shields[shieldIndex].type);
                add(panel.sign.shields[shieldIndex].routeNumber);
                add(panel.sign.shields[shieldIndex].to);
                add(panel.sign.shields[shieldIndex].specialBannerType);
                add(panel.sign.shields[shieldIndex].bannerType);
                add(panel.sign.shields[shieldIndex].bannerType2);
                add2(panel.sign.shields[shieldIndex].bannerPosition);
                dataToSave += ","
            }
            
            function specialshield(shieldIndex) {
                add(panel.sign.shields[shieldIndex].type);
                add(panel.sign.shields[shieldIndex].routeNumber);
                add(panel.sign.shields[shieldIndex].to);
                add(panel.sign.shields[shieldIndex].specialBannerType);
                add(panel.sign.shields[shieldIndex].bannerType);
                add(panel.sign.shields[shieldIndex].bannerType2);
                add2(panel.sign.shields[shieldIndex].bannerPosition);
            }
            
            add(panel.color);
            add2(panel.corner);
            new_chunk();
            
            var value = panel.exitTab.number;
            
            if ((value == "") || (value == null)) {
                value = null;
            }
            
            add(value);
            add(panel.exitTab.position);
            add2(panel.exitTab.width);
            new_chunk();
            if (panel.sign.shields.length != 0) {
                for (let shieldIndex = 0;shieldIndex < panel.sign.shields.length;shieldIndex++) {
                    if (shieldIndex != panel.sign.shields.length - 1) {
                        shield(shieldIndex);
                    } else {
                        specialshield(shieldIndex);
                    }
                }
            } else {
                add2("None");
            }
            new_chunk();
            add(panel.sign.shieldPosition);
            add2(panel.sign.shieldBacks);
            new_chunk();
            add_string(panel.sign.controlText);
            add(panel.sign.guideArrow);
            add(panel.sign.guideArrowLanes);
            add(panel.sign.arrowPosition || "Middle");
            var value3 = panel.sign.exitguideArrows;
            if (value3 == "Down Arrow,Up Arrow,Left/Down Arrow,Left Arrow,Left/Up Arrow,Right/Down Arrow,Right Arrow,Right/Up Arrow") {
                value3 = "Down Arrow";
            }
            add_string(value3);
            
            var value4 = panel.sign.showExitOnly;
            
            if ((value4 == undefined) || (value4 == "undefined")) {
                value4 = false;
            }
            
            add2(value4);
            new_chunk();
            add(panel.sign.otherSymbol);
            var value2 = panel.sign.oSNum;
            
            if ((value2 == "") || (value2 == null)) {
                value2 = null;
            }
            add(value2);
            add_string2(panel.sign.actionMessage);
            new_chunk();
            add(panel.sign.advisoryMessage);
            add2(panel.sign.exitTabColor);
            if ((post.panels.length > 0) && (i != post.panels.length - 1)) {
                dataToSave += "+"
            }
        }
        var hiddenElement = document.createElement("a");
        hiddenElement.href = "data:attachment/text," + encodeURI(dataToSave);
        hiddenElement.target = "_blank";
        hiddenElement.download = "exportedData.txt";
        hiddenElement.click();
    }

	/**
	 * Read the form and update the currently selected panel with the new values.
	 *   Redraw the page.
	 */
	const readForm = function() {
		const form = document.forms[0];
		const panel = post.panels[currentlySelectedPanelIndex];

		// Post
		post.polePosition = form["postPosition"].value;
        
        post.fontType = form["fontChange"].checked;
        
        post.showPost = form["showPost"].checked;
        if (post.firstPanel == false) {
            var current = parseInt(form["panelNo"].value) - 1;
            
            if (current < 0) {
                current = 0
            } else if (current > post.panels.length - 1) {
                current = post.panels.length - 1
            }
            
            post.panelNo = current;
            
        } else {
            post.panelNo = 0;
        }
        

		// Exit Tab
		panel.color = form["panelColor"].value;
		panel.corner = form["panelCorner"].value;
		panel.exitTab.number = form["exitNumber"].value;
		panel.exitTab.width = form["exitTabWidth"].value;
		panel.exitTab.position = form["exitTabPosition"].value;
        
        // Left Tab
        panel.left = form["showLeft"].checked;
        panel.leftPosition = form["LeftPosition"].value;

		// Sign
		panel.sign.controlText = form["controlText"].value;
		panel.sign.shieldPosition = form["shieldsPosition"].value;
		panel.sign.guideArrow = form["guideArrow"].value;
		panel.sign.guideArrowLanes = form["guideArrowLanes"].value;
        panel.sign.arrowPosition = form["arrowLocations"].value;
        
        panel.sign.exitguideArrows = form["exitOnlyDirection"].value;
        panel.sign.showExitOnly = form["showExitOnly"].checked;
        
		panel.sign.otherSymbol = form["otherSymbol"].value;
		panel.sign.oSNum = form["oSNum"].value;
		panel.sign.actionMessage = form["actionMessage"].value;
		panel.sign.actionMessage = panel.sign.actionMessage.replace("1/2", "½");
		panel.sign.actionMessage = panel.sign.actionMessage.replace("1/4", "¼");
		panel.sign.actionMessage = panel.sign.actionMessage.replace("3/4", "¾");
        panel.sign.advisoryMessage = form["outActionMessage"].checked;
        
        panel.sign.exitTabColor = form["exitColor"].value;
        panel.exitTab.oldFont = form["exitFont"].checked;
        

		// Shields
		panel.sign.shieldBacks = form["shieldBacks"].checked;
		for (let shieldIndex = 0, length = panel.sign.shields.length; shieldIndex < length; shieldIndex++) {
            var previous = panel.sign.shields[shieldIndex].type;
            var previous2 = panel.sign.shields[shieldIndex].routeNumber;
            
			panel.sign.shields[shieldIndex].type = document.getElementById(`shield${shieldIndex}_type`).value;
			panel.sign.shields[shieldIndex].routeNumber = document.getElementById(`shield${shieldIndex}_routeNumber`).value;
			panel.sign.shields[shieldIndex].to = document.getElementById(`shield${shieldIndex}_to`).checked;
			panel.sign.shields[shieldIndex].bannerType = document.getElementById(`shield${shieldIndex}_bannerType`).value;
			panel.sign.shields[shieldIndex].bannerPosition = document.getElementById(`shield${shieldIndex}_bannerPosition`).value;
            panel.sign.shields[shieldIndex].bannerType2 = document.getElementById(`shield${shieldIndex}_bannerType2`).value;
            
            if ((previous != panel.sign.shields[shieldIndex].type) || (previous2 != panel.sign.shields[shieldIndex].routeNumber)) {
                const specialBannerTypeSelectElmt = document.getElementById(`shield${shieldIndex}_specialBannerType`);
            
            
                // Clearing
                while (specialBannerTypeSelectElmt.firstChild) {
                    specialBannerTypeSelectElmt.removeChild(specialBannerTypeSelectElmt.firstChild);
                }
                
                // Adding
                for (const specialBannerType of Shield.prototype.specialBannerTypes) {
                        var current = specialBannerType;
                        current = current.split(":");
                       
                        
                        if (panel.sign.shields[shieldIndex].type == current[0]) {
                            
                            if (current[1].includes("/")) {
                                var currently = current[1].split("/")
                                
                                specialBannerTypeSelectElmt.style.visibility = "visible";
                                
                                for (let i = 0; i < currently.length; i++) {
                                    var value = currently[i];
                        
                                    if (value.includes(";")) {
                                        value = value.split(";")
                                        var lengths = panel.sign.shields[shieldIndex].routeNumber.length;
                                        
                                        if (lengths < 2) {
                                            lengths = 2
                                        }
                                        
                                        if (lengths == value[1]) {
                                            const optionElmt = document.createElement("option");
                                            optionElmt.value = value[0];
                                            optionElmt.selected = (panel.sign.shields[shieldIndex].specialBannerType || false);
                                            optionElmt.appendChild(document.createTextNode(value[0]));
                                            specialBannerTypeSelectElmt.appendChild(optionElmt);
                                        }
                                    } else {
                                        const optionElmt = document.createElement("option");
                                        optionElmt.value = value;
                                        optionElmt.selected = (panel.sign.shields[shieldIndex].specialBannerType || false);
                                        optionElmt.appendChild(document.createTextNode(value));
                                        specialBannerTypeSelectElmt.appendChild(optionElmt);
                                    }
                                }
                                
                                break;
                            }
                            
                        } else {
                            panel.sign.shields[shieldIndex].specialBannerType = "None";
                            specialBannerTypeSelectElmt.style.visibility = "hidden";           
                }
            }
            }    else {
                panel.sign.shields[shieldIndex].specialBannerType = (document.getElementById(`shield${shieldIndex}_specialBannerType`).value || "None");
            }
         
        }

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
        
        if ((panel.sign.guideArrow != "Exit Only") && (panel.sign.guideArrow != "Split Exit Only")) {
            exitOnlyDirectionLabel.style.visibility = "hidden";
            showExitOnlyLabel.style.visibility = "hidden";
            exitOnlyDirection.style.visibility = "hidden";
            showExitOnly.style.visibility = "hidden";
        }
        else {
            exitOnlyDirectionLabel.style.visibility = "visible";
            showExitOnlyLabel.style.visibility = "visible";
            exitOnlyDirection.style.visibility = "visible";
            showExitOnly.style.visibility = "visible";
        }
        
       
       
        
		

		redraw();
	};

	/**
	 * Update the fields in the form to the values of the currently selected panel.
	 */
	const updateForm = function() {
        const panel = post.panels[currentlySelectedPanelIndex];
        
        const panelList = document.getElementById("panelList");
        
        while (panelList.firstChild) {
            panelList.removeChild(panelList.lastChild);
        }
        
        for (let panelIndex = 0, panelsLength = post.panels.length; panelIndex < panelsLength; panelIndex++) {
			var new_button = document.createElement("input");
            new_button.type = "button";
            new_button.id = "edit" + (panelIndex + 1);
            new_button.value = "Panel " + (panelIndex + 1);
            new_button.addEventListener("click", function() {
                changeEditingPanel(panelIndex);
            });
            panelList.appendChild(new_button);
		}
        
        document.getElementById("panelNumberLabel").innerHTML = "Panel " + String(currentlySelectedPanelIndex + 1);
        

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

		const exitNumberElmt = document.getElementById("exitNumber");
		exitNumberElmt.value = panel.exitTab.number;

		const exitTabPositionSelectElmt = document.getElementById("exitTabPosition");
		for (const option of exitTabPositionSelectElmt.options) {
			if (option.value == panel.exitTab.position) {
				option.selected = true;
				break;
			}
		}

		const exitTabWidthSelectElmt = document.getElementById("exitTabWidth");
		for (const option of exitTabWidthSelectElmt.options) {
			if (option.value == panel.exitTab.width) {
				option.selected = true;
				break;
			}
		}

		updateShieldSubform();

		const shieldPositionsSelectElmt = document.getElementById("shieldsPosition");
		for (const option of shieldPositionsSelectElmt.options) {
			if (option.value == panel.sign.shieldPosition) {
				option.selected = true;
				break;
			}
		}

		const shieldBacksElmt = document.getElementById("shieldBacks");
		shieldBacksElmt.checked = panel.sign.shieldBacks;

		const controlTextElmt = document.getElementById("controlText");
		controlTextElmt.value = panel.sign.controlText;

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
        
        
        if (panel.sign.guideArrow != "Exit Only") {
            exitOnlyDirectionLabel.style.visibility = "hidden";
            showExitOnlyLabel.style.visibility = "hidden";
            exitOnlyDirection.style.visibility = "hidden";
            showExitOnly.style.visibility = "hidden";
        }
        else {
            exitOnlyDirectionLabel.style.visibility = "visible";
            showExitOnlyLabel.style.visibility = "visible";
            exitOnlyDirection.style.visibility = "visible";
            showExitOnly.style.visibility = "visible";
            exitOnlyDirection.value = panel.sign.exitOnlyDirection;
            showExitOnly.value = panel.sign.showExitOnly;
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

		const actionMessageElmt = document.getElementById("actionMessage");
		actionMessageElmt.value = panel.sign.actionMessage;
	};

/**
	 * Update the fields in the form relating to shields to the values of the currently selected panel.
	 */
	const updateShieldSubform = function() {
		const shieldsContainerElmt = document.getElementById("shields");
		lib.clearChildren(shieldsContainerElmt);

		const shields = post.panels[currentlySelectedPanelIndex].sign.shields;

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
				lib.appendOption(typeSelectElmt, Shield.prototype.types[type], {selected : (shields[shieldIndex].type == Shield.prototype.types[type]), text : type});
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
            
            for (const specialBannerType of Shield.prototype.specialBannerTypes) {
                var current = specialBannerType;
                current = current.split(":");
                if (typeSelectElmt.value == current[0]) {
                    var currently = current[1].split("/")
                    
                    for (let i = 0; i < currently.length; i++) {
                        var value = currently[i];
                        
                        if (value.includes(";")) {
                            value = value.split(";")
                            var lengths = value[1].length;
                            
                            if (lengths < 2) {
                                lengths = 2
                            }
                            
                            if (lengths == value[1]) {
                                const optionElmt = document.createElement("option");
                                optionElmt.value = value[0];
                                optionElmt.selected = (shields[shieldIndex].specialBannerType || false);
                                optionElmt.appendChild(document.createTextNode(value[0]));
                                specialBannerTypeSelectElmt.appendChild(optionElmt);
                            }
                        } else {
                            const optionElmt = document.createElement("option");
                            optionElmt.value = value;
                            optionElmt.selected =  (shields[shieldIndex].specialBannerType || false);
                            optionElmt.appendChild(document.createTextNode(value));
                            specialBannerTypeSelectElmt.appendChild(optionElmt);
                        }
                        
                    }
                }
            }
            
            specialBannerTypeSelectElmt.id = `shield${shieldIndex}_specialBannerType`;
            specialBannerTypeSelectElmt.addEventListener("change",readForm);
            rowContainerElmt.appendChild(specialBannerTypeSelectElmt);
            
            rowContainerElmt.appendChild(document.createElement("br"));
            
            rowContainerElmt.appendChild(document.createTextNode("Banners:"));
            
            rowContainerElmt.appendChild(document.createElement("br")); 
            
            // Populate banner type options
			const bannerTypeSelectElmt = document.createElement("select");
			for (const bannerType of Shield.prototype.bannerTypes) {
				lib.appendOption(bannerTypeSelectElmt, bannerType, {selected : (shields[shieldIndex].bannerType == bannerType)});
			}
			bannerTypeSelectElmt.id = `shield${shieldIndex}_bannerType`;
			bannerTypeSelectElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(bannerTypeSelectElmt);

			// Populate banner position options
			const bannerPositionSelectElmt = document.createElement("select");
			for (const bannerPosition of Shield.prototype.bannerPositions) {
				lib.appendOption(bannerPositionSelectElmt, bannerPosition, {selected : (shields[shieldIndex].bannerPosition == bannerPosition)});
			}
			bannerPositionSelectElmt.id = `shield${shieldIndex}_bannerPosition`;
			bannerPositionSelectElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(bannerPositionSelectElmt);
            
            rowContainerElmt.appendChild(document.createElement("br"));
            
            const bannerType2SelectElmt = document.createElement("select");
			for (const bannerType2 of Shield.prototype.bannerTypes) {
				lib.appendOption(bannerType2SelectElmt, bannerType2, {selected : (shields[shieldIndex].bannerType2 == bannerType2)});
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
			deleteElmt.addEventListener("click", deleteShield);
			rowContainerElmt.appendChild(deleteElmt);

			shieldsContainerElmt.appendChild(rowContainerElmt);
		}
	};


	/**
	 * Redraw the panels on the post.
	 */
     
	const redraw = function() {
		const postContainerElmt = document.getElementById("postContainer");
        
		postContainerElmt.className = `polePosition${post.polePosition}`;
        
        if (post.showPost == true) {
            var item = document.getElementsByClassName("post");
            for (let i = 0; i < item.length; i++) {
                item[i].style.visibility = "hidden";
            }
            
            const panelContainer = document.getElementById("panelContainer");
            
            panelContainer.style.visibility = "hidden";
            
            
        } else {
            var item = document.getElementsByClassName("post");
            for (let i = 0; i < item.length; i++) {
                
                if (post.polePosition.toLowerCase() != "overhead") {
                    item[0].style.visibility = "visible";
                } else {
                    item[i].style.visibility = "visible";
                }
            }
            
            const panelContainer = document.getElementById("panelContainer");
            
            panelContainer.style.visibility = "visible";
        }

		const panelContainerElmt = document.getElementById("panelContainer");

		
		lib.clearChildren(panelContainerElmt);
		for (const panel of post.panels) {
			const panelElmt = document.createElement("div");
			panelElmt.className = `panel ${panel.color.toLowerCase()} ${panel.corner.toLowerCase()}`;

			const exitTabCont = document.createElement("div");
			exitTabCont.className = `exitTabContainer ${panel.exitTab.position.toLowerCase()} ${panel.exitTab.width.toLowerCase()}`;
			panelElmt.appendChild(exitTabCont);

			const exitTabElmt = document.createElement("div");
			exitTabElmt.className = `exitTab ${panel.exitTab.position.toLowerCase()} ${panel.exitTab.width.toLowerCase()}`;
            
            if ((panel.sign.exitTabColor != "Panel Color") && (panel.sign.exitTabColor != undefined)) {
                exitTabElmt.className += ` ${panel.sign.exitTabColor.toLowerCase()}`
            } else {
                exitTabElmt.className += ` ${panel.color.toLowerCase()}`
            }
            
            if (panel.exitTab.oldFont) {
                exitTabElmt.style.fontFamily = "Series E";
            }
            
            exitTabCont.appendChild(exitTabElmt);
            
            

			const signCont = document.createElement("div");
			signCont.className = `signContainer exit-${panel.exitTab.width.toLowerCase()} exit-${panel.exitTab.position.toLowerCase()}`;
			panelElmt.appendChild(signCont);
            
			const signElmt = document.createElement("div");
			signElmt.className = `sign exit-${panel.exitTab.width.toLowerCase()} exit-${panel.exitTab.position.toLowerCase()}`;
			signCont.appendChild(signElmt);
            

			const sideLeftArrowElmt = document.createElement("div");
			sideLeftArrowElmt.className = "sideLeftArrow";
			sideLeftArrowElmt.appendChild(document.createTextNode(lib.specialCharacters.sideLeftArrow));
			signElmt.appendChild(sideLeftArrowElmt);

			const signContentContainerElmt = document.createElement("div");
			signContentContainerElmt.className = `signContentContainer shieldPosition${panel.sign.shieldPosition}`;
			signElmt.appendChild(signContentContainerElmt);

			const shieldsContainerElmt = document.createElement("div");
			shieldsContainerElmt.className = `shieldsContainer ${panel.sign.shieldBacks ? "shieldBacks" : ""}`;
			signContentContainerElmt.appendChild(shieldsContainerElmt);

			const controlTextElmt = document.createElement("p");
			controlTextElmt.className = "controlText";
			signContentContainerElmt.appendChild(controlTextElmt);

			const sideRightArrowElmt = document.createElement("div");
			sideRightArrowElmt.className = "sideRightArrow";
			sideRightArrowElmt.appendChild(document.createTextNode(lib.specialCharacters.sideRightArrow));
			signElmt.appendChild(sideRightArrowElmt);

			const guideArrowsElmt = document.createElement("div");
			guideArrowsElmt.className = `guideArrows ${panel.sign.guideArrow.replace("/", "-").replace(" ", "_").toLowerCase()}`;
			signCont.appendChild(guideArrowsElmt);

			const otherSymbolsElmt = document.createElement("div");
			otherSymbolsElmt.className = `otherSymbols ${panel.sign.otherSymbol.replace("/", "-").replace(" ", "_").toLowerCase()}`;
			guideArrowsElmt.appendChild(otherSymbolsElmt);

			const oSNumElmt = document.createElement("div");
			oSNumElmt.className = `oSNum`;
			otherSymbolsElmt.appendChild(oSNumElmt);

			const actionMessageElmt = document.createElement("div");
			actionMessageElmt.className = `actionMessage`;
			if ((panel.sign.advisoryMessage == true)) {
                guideArrowsElmt.appendChild(actionMessageElmt);   
            } else if ((panel.sign.advisoryMessage == false) && (panel.sign.guideArrow == "Exit Only")) {
                signElmt.appendChild(actionMessageElmt);
                signContentContainerElmt.style.paddingBottom = "0rem";
                signElmt.style.display = "block";
            } else if ((panel.sign.advisoryMessage == false) && (panel.sign.guideArrow != "Exit Only")) {
                guideArrowsElmt.appendChild(actionMessageElmt);  
            }
            

			const arrowContElmt = document.createElement("div");
            arrowContElmt.className = `arrowContainer`;
            guideArrowsElmt.appendChild(arrowContElmt);
            
           
            
            if ((panel.sign.arrowPosition == "Left") && (panel.sign.guideArrow != "Exit Only") && (panel.sign.guideArrow != "Side Left") && (panel.sign.guideArrow != "Side Right")) {
                arrowContElmt.style.cssFloat = "left";
                arrowContElmt.style.paddingLeft = "1rem";
                if (panel.sign.actionMessage != "") {
                    guideArrowsElmt.style.paddingBottom = "0.6rem";
                } else {
                    guideArrowsElmt.style.paddingBottom = "1rem";
                }
            } else if (panel.sign.arrowPosition == "Middle") {
                arrowContElmt.style.cssFloat = "none";
            } else if ((panel.sign.arrowPosition == "Right") && (panel.sign.guideArrow != "Exit Only") && (panel.sign.guideArrow != "Side Left") && (panel.sign.guideArrow != "Side Right")) {
                arrowContElmt.style.cssFloat = "right";
                arrowContElmt.style.paddingRight = "1rem";
                if (panel.sign.actionMessage != "") {
                    guideArrowsElmt.style.paddingBottom = "0.6rem";
                } else {
                    guideArrowsElmt.style.paddingBottom = "1rem";
                }
            }
			
            
            

			panelContainerElmt.appendChild(panelElmt);

			// Exit tab
			if ((panel.exitTab.number) || (panel.left)) {
                
                const leftElmt = document.createElement("span");
                
                if (panel.left) {
                    leftElmt.className = `leftElmt ${panel.leftPosition.toLowerCase()}`;
                    leftElmt.appendChild(document.createTextNode("LEFT"));
                    exitTabElmt.appendChild(leftElmt);
                    
                    exitTabElmt.appendChild(document.createElement(`br`))
                    
                    if (panel.exitTab.number) {
                        leftElmt.style.marginRight = "0.4rem";
                    }
                    
                    
                }
                
				const txtArr = panel.exitTab.number.toUpperCase().split(/(\d+\S*)/);
				const spanTextElmt = document.createElement("span");
				spanTextElmt.appendChild(document.createTextNode(txtArr[0]))
				exitTabElmt.appendChild(spanTextElmt);
                
				if (txtArr.length > 1) {
					const spanNumeralElmt = document.createElement("span");
					spanNumeralElmt.className = "numeral";
					spanNumeralElmt.appendChild(document.createTextNode(txtArr[1]));
					exitTabElmt.appendChild(spanNumeralElmt);
					exitTabElmt.appendChild(document.createTextNode(txtArr.slice(2).join("")));
				}
				exitTabElmt.style.visibility = "visible";
				exitTabCont.className += " tabVisible";
				signElmt.className += " tabVisible";
                
                
                if (post.fontType == true) {
                        exitTabElmt.style.fontFamily = "Series E";
                };
			}

			// Shields
			for (const shield of panel.sign.shields) {
				const toElmt = document.createElement("p");
				toElmt.className = "to";
				toElmt.appendChild(document.createTextNode("TO"));
				shieldsContainerElmt.appendChild(toElmt);

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
				shieldsContainerElmt.appendChild(bannerShieldContainerElmt);

                const bannerContainerElmt = document.createElement("div");
                
                bannerContainerElmt.className = `bannerContainer`

                bannerShieldContainerElmt.appendChild(bannerContainerElmt);
                
                
                

				const bannerElmt = document.createElement("p");
				bannerElmt.className = "bannerA";
				bannerContainerElmt.appendChild(bannerElmt);
                
                
                if (shield.bannerType == "Toll") {
                    bannerElmt.className += " TOLL"
                }
                

				const shieldElmt = document.createElement("div");
				shieldElmt.className = "shield";
				bannerShieldContainerElmt.appendChild(shieldElmt);
                
                const shieldImgElmt = document.createElement("object");
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
					default:
						shieldImgElmt.className += " three";
						break;
				}
                
				shieldElmt.appendChild(shieldImgElmt);
                
                const bannerContainerElmt2 = document.createElement("div");
                
                bannerContainerElmt2.className = `bannerContainer2`

                bannerShieldContainerElmt.appendChild(bannerContainerElmt2);

                const bannerElmt2 = document.createElement("p");
				bannerElmt2.className = "bannerB";
				bannerContainerElmt2.appendChild(bannerElmt2);
                
                if (shield.bannerType2 == "Toll") {
                    bannerElmt2.className += "TOLL"
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
				if (shield.routeNumber.length > 3) {
					lengthValue = 3;
				}
				else if (shield.routeNumber.length == 1) {
					lengthValue = 2;
				}
                
                const sameElement = ["AK","C","CD","DC","HI","ID","LA","MI","MN","MT","MT2","NB","NC","NE","NH","NM","NV","PEI","QC2","REC2","SC","TN","TX","UT","VA2","WA","WI","WY"];
                
                if (sameElement.includes(shield.type)) {
                                lengthValue = 2;
                }
                
                var imgFileConstr = shield.type + "-" + lengthValue;
                
                if (shield.specialBannerType != "None") {
                    imgFileConstr += "-" + shield.specialBannerType
                }
                
                shieldImgElmt.data = imgDir + imgFileConstr + ".png";
                

                
				//shield
				

				// Route Number
				routeNumberElmt.appendChild(document.createTextNode(shield.routeNumber));

				// Route banner
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

			// Control text
			// Remove and re-add the controlText text
            
            function LineEditor(line) {
                if (line.includes("</>")) {
                    line = line.split("</>");
                    controlTextElmt.appendChild(document.createTextNode(line[0] + "⠀⠀⠀⠀⠀⠀⠀⠀⠀" + line[1]));
                } else if (line.includes("<-->")) {
                    // Line elmt
                } else {
                	controlTextElmt.appendChild(document.createTextNode(line));   
                }
            }
            
			const controlTextArray = panel.sign.controlText.split("\n");
			for (let lineNum = 0, length = controlTextArray.length - 1; lineNum < length; lineNum++) {
                LineEditor(controlTextArray[lineNum])             
				controlTextElmt.appendChild(document.createElement("br"));
			}
            
			LineEditor(controlTextArray[controlTextArray.length - 1]);
            
            if (post.fontType == true) {
                       controlTextElmt.style.fontFamily = "Series EM";
            }
            
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
			}
			
			if (panel.sign.actionMessage != "") {
                if (post.fontType == true) {
                        actionMessageElmt.style.fontFamily = "Series E";
                } else {
                    actionMessageElmt.style.fontFamily = "Clearview 4W";
                }
				signElmt.style.borderBottomLeftRadius = "0";
				signElmt.style.borderBottomRightRadius = "0";
				signElmt.style.borderBottomWidth = "0";
				guideArrowsElmt.style.display = "block";
				guideArrowsElmt.style.visibility = "visible";
				actionMessageElmt.style.visibility = "visible";
				actionMessageElmt.style.display = "inline-flex";
				actionMessageElmt.className = `actionMessage action_message`;
				const txtArr = panel.sign.actionMessage.split(/(\d+\S*)/);
				const txtFrac = txtArr[0].split(/([\u00BC-\u00BE]+\S*)/);
                
				actionMessageElmt.appendChild(document.createTextNode(txtFrac[0]));
                
                console.log(txtArr.length)
                
                if (((panel.sign.actionMessage.includes("½")) || (panel.sign.actionMessage.includes("¼")) || (panel.sign.actionMessage.includes("¾"))) && (txtArr.length > 2)) {
                        const spanElmt = document.createElement("span");
                        spanElmt.className = "numeral special";
                        
                        if (post.fontType) {
                            spanElmt.style.fontSize = "1.5rem";
                        }
                        
                        spanElmt.appendChild(document.createTextNode(txtArr[1]));
                        actionMessageElmt.appendChild(spanElmt);
                        
                        const spanFractionElmt = document.createElement("span");
                        spanFractionElmt.className = "fraction special";
                        
                        if (post.fontType) {
                            spanFractionElmt.style.fontSize = "1.15rem";
                            spanFractionElmt.style.top = "-0.15rem";
                            spanFractionElmt.style.position = "relative";
                        }
                            
                            
                        spanFractionElmt.appendChild(document.createTextNode(txtArr[2].split(/([\u00BC-\u00BE]+\S*)/)[1]));
                        actionMessageElmt.appendChild(spanFractionElmt);
                        actionMessageElmt.appendChild(document.createTextNode(txtArr[2].split(/([\u00BC-\u00BE]+\S*)/).slice(2).join("")));
                        
                        
                } else {
                    if (txtArr.length > 1) {
                        const spanElmt = document.createElement("span");
                        spanElmt.className = "numeral";
                        
                        if (post.fontType) {
                            spanElmt.style.fontSize = "1.5rem";
                        }
                        
                        spanElmt.appendChild(document.createTextNode(txtArr[1]));
                        actionMessageElmt.appendChild(spanElmt);
                        actionMessageElmt.appendChild(document.createTextNode(txtArr.slice(2).join("")));
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
                            actionMessageElmt.appendChild(spanFractionElmt);
                            actionMessageElmt.appendChild(document.createTextNode(txtFrac.slice(2).join("")));
                        }
                }
                
				
			}
			else {
				actionMessageElmt.style.display = "none";
			}
			// Guide arrows
			if ("Side Left" == panel.sign.guideArrow) {
				sideLeftArrowElmt.style.display = "block";
			} else if ("Side Right" == panel.sign.guideArrow) {
				sideRightArrowElmt.style.display = "block";
			} else if ("None" != panel.sign.guideArrow) {
				signElmt.style.borderBottomLeftRadius = "0";
				signElmt.style.borderBottomRightRadius = "0";
				signElmt.style.borderBottomWidth = "0";
				guideArrowsElmt.style.display = "block";
				guideArrowsElmt.style.visibility = "visible";
				if (panel.sign.guideArrowLanes %2 == 0 && panel.sign.guideArrow != "Exit Only" && panel.sign.actionMessage != "") {
					arrowContElmt.appendChild(actionMessageElmt);
					arrowContElmt.className += ` centerText`;
				}
				if (("Exit Only" == panel.sign.guideArrow) || "Split Exit Only" == panel.sign.guideArrow) {
                    const ArrowElmt = function(direction) {
                        const downArrowElmt = document.createElement("span");
						downArrowElmt.className = "arrow";
                        if ((direction == "Up Arrow") || (direction == "Down Arrow") || (direction == null) || (direction.includes("/Down"))) {
                            if (direction.includes("/Down")) {
                                downArrowElmt.className += " special";
                            }
                            downArrowElmt.style.fontFamily = "Arrows Two";
                        }
                        else {
                            if (direction.includes("/Up")) {
                                downArrowElmt.className += " specialUp";
                            }
                            downArrowElmt.style.fontFamily = "Arrows One";
                        }
						downArrowElmt.appendChild(document.createTextNode(lib.specialCharacters[direction || "Down Arrow"]));
                        return downArrowElmt;
                    }
                    
					const exitOnlyArrowElmt = function(direction) {
						const downArrowElmt = document.createElement("span");
						downArrowElmt.className = "exitOnlyArrow";
                        if ((direction == "Up Arrow") || (direction == "Down Arrow") || (direction == null) || (direction.includes("/Down"))) {
                            if (direction.includes("/Down")) {
                                downArrowElmt.className += " special";
                            }
                            downArrowElmt.style.fontFamily = "Arrows Two";
                        }
                        else {
                            if (direction.includes("/Up")) {
                                downArrowElmt.className += " specialUp";
                            }
                            downArrowElmt.style.fontFamily = "Arrows One";
                        }
						downArrowElmt.appendChild(document.createTextNode(lib.specialCharacters[direction || "Down Arrow"]));
						return downArrowElmt;
					}

                    if (panel.sign.advisoryMessage) {
                        actionMessageElmt.style.fontFamily = "Series E";
                    }

					// Interlase arrows and the words EXIT and ONLY, ensuring
					//   EXIT ONLY is centered between all the arrows.
					for (let arrowIndex = 0, length = panel.sign.guideArrowLanes; arrowIndex < length; arrowIndex++) {
						// Evens
						if (length %2 == 0) {
							if (arrowIndex == Math.floor(length/2)) {
								const textExitOnlySpanElmt = document.createElement("span");
                                if (panel.sign.showExitOnly == false) {
                                    textExitOnlySpanElmt.appendChild(document.createTextNode("EXIT ONLY"));
                                    
                                    var bonus = "";
                                    
                                    if (panel.sign.guideArrow == "Split Exit Only") {
                                        bonus = " split"
                                    }
                                    
                                    textExitOnlySpanElmt.className = "exitOnlyText" + bonus;
                                }
                                else {
                                    textExitOnlySpanElmt.appendChild(document.createTextNode("⠀⠀⠀⠀ ⠀⠀⠀⠀"));
								textExitOnlySpanElmt.className = "exitOnlyText";
                                }
								arrowContElmt.appendChild(textExitOnlySpanElmt);
								arrowContElmt.appendChild(exitOnlyArrowElmt(panel.sign.exitguideArrows));
                                
                                if ((arrowIndex + 1 < length) && (length != 2)) {
                                    const space = document.createElement("span")
                                    space.className = "exitOnlySpace";
                                    arrowContElmt.appendChild(space);
                                }
							} else {
                                arrowContElmt.appendChild(exitOnlyArrowElmt(panel.sign.exitguideArrows));
                                                                console.log(arrowIndex + 1)
								if ((arrowIndex + 1 < length) && (arrowIndex + 1 != Math.ceil(length/2))&& (length != 2)) {
                                    const space = document.createElement("span")
                                    space.className = "exitOnlySpace";
                                    arrowContElmt.appendChild(space);
                                }
							}
						} else { // Odds
							if (arrowIndex == Math.floor(length/2)) {
                                const textExitSpanElmt = document.createElement("span");
                                if (panel.sign.showExitOnly == false) {
                                    textExitSpanElmt.appendChild(document.createTextNode("EXIT"));
                                    
                                    var bonus = "";
                                    
                                    if (panel.sign.guideArrow == "Split Exit Only") {
                                        bonus = " split"
                                    }
                                    
                                    textExitSpanElmt.className = "exitOnlyText" + bonus;
                                }
                                else {
                                    textExitSpanElmt.appendChild(document.createTextNode("⠀⠀⠀⠀"));
                                    textExitSpanElmt.className = "exitOnlyText";
                                }
								arrowContElmt.appendChild(textExitSpanElmt);
								arrowContElmt.appendChild(exitOnlyArrowElmt(panel.sign.exitguideArrows));
                                const textOnlySpanElmt = document.createElement("span");
                                if (panel.sign.showExitOnly == false) {
                                    textOnlySpanElmt.appendChild(document.createTextNode("ONLY"));
                                    
                                    var bonus = "";
                                    
                                    if (panel.sign.guideArrow == "Split Exit Only") {
                                        bonus = " split"
                                    }
                                    
                                    textOnlySpanElmt.className = "exitOnlyText" + bonus;
                                }
                                else {
                                    textOnlySpanElmt.appendChild(document.createTextNode("⠀⠀⠀⠀"));
                                    textOnlySpanElmt.className = "exitOnlyText";
                                }
								arrowContElmt.appendChild(textOnlySpanElmt);
							} else if (arrowIndex == Math.ceil(length/2)) {
								arrowContElmt.appendChild(exitOnlyArrowElmt(panel.sign.exitguideArrows));
                                if ((arrowIndex + 1 < length) && (arrowIndex + 1 != Math.floor(length/2))&& (length != 2)) {
                                    const space = document.createElement("span")
                                    space.className = "exitOnlySpace";
                                    arrowContElmt.appendChild(space);
                                }
							} else {
								arrowContElmt.appendChild(exitOnlyArrowElmt(panel.sign.exitguideArrows));
                                if ((arrowIndex + 1 < length) && (arrowIndex + 1 != Math.floor(length/2))&& (length != 2)) {
                                    const space = document.createElement("span")
                                    space.className = "exitOnlySpace";
                                    arrowContElmt.appendChild(space);
                                }
							}
						}
					}
				} else {
                    var arrowChoice = panel.sign.guideArrow;
                    var font = "None", bonus = "";
					if ((arrowChoice == "Up Arrow") || (arrowChoice == "Down Arrow")  || (arrowChoice.includes("/Down"))) {
                            if (arrowChoice.includes("/Down")) {
                                bonus += " special";
                            }
                            font = "Arrows Two";
                        }
                        else {
                            if (arrowChoice.includes("/Up")) {
                               bonus += " specialUp";
                            }
                            font = "Arrows One";
                        }
					for (let arrowIndex = 0, length = panel.sign.guideArrowLanes; arrowIndex < length; arrowIndex++) {
						const arrowElmt = document.createElement("span");
						arrowElmt.className = "arrow" + bonus;
                        arrowElmt.style.fontFamily = font;
                        
                        if (length == 1) {
                            arrowElmt.style.fontSize = "3.5rem";
                        }
                        
						arrowElmt.appendChild(document.createTextNode(lib.specialCharacters[arrowChoice]));
                        
						if (arrowIndex %2 == 0) {
							arrowContElmt.insertBefore(arrowElmt, arrowContElmt.childNodes[0]);
						}
						else {
							arrowContElmt.appendChild(arrowElmt);
						}
					}
				}
			}
			// Bottom Symbols
			switch(panel.sign.otherSymbol) {
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
		
            var width = signCont.offsetWidth;
            var exitWidth = exitTabCont.offsetWidth;
            
            if ((exitWidth > width) && (panel.exitTab.width == "Full") ) {
                signCont.style.width = (exitWidth + 1) + "px";
            } else if ((exitWidth > width) && (panel.exitTab.width == "Wide") )
                 signCont.style.width = Math.floor(exitWidth * 1.1) + "px";
            
        
        }
        
        
        
	};

	return {
		init : init,
		newPanel : newPanel,
		duplicatePanel : duplicatePanel,
		deletePanel : deletePanel,
		shiftLeft : shiftLeft,
		shiftRight : shiftRight,
		changeEditingPanel : changeEditingPanel,
		newShield : newShield,
        clearShields : clearShields,
		readForm : readForm,
        exportData : exportData,
        importData : importData
	};
})();
