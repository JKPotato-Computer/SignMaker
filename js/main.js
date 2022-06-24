const app = (function() {
	let post = {};
	let currentlySelectedPanelIndex = -1;
	let currentlySelectedSubPanelIndex = 0;

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
		
		currentlySelectedSubPanelIndex = 0;
		
		updateForm();
	};
	
	const changeEditingSubPanel = function(number, panel) {
		if ((number >= 0) && (number < panel.sign.subPanels.length)) {
			currentlySelectedSubPanelIndex = number;
		} else if (number > panel.sign.subPanels.length) {
			currentlySelectedSubPanelIndex = (panel.sign.subPanels.length - 1)
		} else {
			currentlySelectedSubPanelIndex = 0;
		}
		updateForm();
	}
	
	const duplicateSubPanel = function() {
		const sign = post.panels[currentlySelectedPanelIndex].sign;
		sign.duplicateSubPanel(currentlySelectedSubPanelIndex);
		currentlySelectedSubPanelIndex++
		updateForm();
		redraw();
	}
	
	/**
	 * Add a new shield to the current panel's sign.
	 *   Update the shield subform with the new shield.
	 */
	const newShield = function(subPanelId,number) {
		const sign = post.panels[currentlySelectedPanelIndex].sign;
		sign.newShield(number);
		updateShieldSubform(subPanelId,number);
		redraw();
	};

	/**
	 * Delete a shield to the current panel's sign.
	 *   Update the shield subform with the new shield.
	 */
	const deleteShield = function(index,subPanelId,number) {
		const sign = post.panels[currentlySelectedPanelIndex].sign;
		sign.deleteShield(index,number);
		updateShieldSubform(subPanelId,number);
		redraw();
	};
    
    const clearShields = function(subPanelId,number) {
        var items = post.panels[currentlySelectedPanelIndex].sign.subPanels[number].shields.length;
        if (items != 0) {
            const sign = post.panels[currentlySelectedPanelIndex].sign;
            for (let i = 0 - items; i < items; i++) {
                sign.deleteShield(i,number);
                updateShieldSubform(subPanelId,number);
                redraw();
            }
        }
    };
    
    const duplicateShield = function(shieldIndex,subPanelId,number) {
        const sign = post.panels[currentlySelectedPanelIndex].sign;
        sign.duplicateShield(shieldIndex,number);
		updateShieldSubform(subPanelId,number);
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

        // Misc Shields
        panel.sign.shieldBacks = form["shieldBacks"].checked;

		// Sign
        
        for (let sub_index = 0;sub_index < panel.sign.subPanels.length;sub_index++) {
            var subPanel = panel.sign.subPanels[sub_index];
            // Shields
            for (let shieldIndex = 0, length = subPanel.shields.length; shieldIndex < length; shieldIndex++) {
                var previous = subPanel.shields[shieldIndex].type;
                var previous2 = subPanel.shields[shieldIndex].routeNumber;
                
                subPanel.shields[shieldIndex].type = document.getElementById(`${sub_index}/shield${shieldIndex}_type`).value;
                subPanel.shields[shieldIndex].routeNumber = document.getElementById(`${sub_index}/shield${shieldIndex}_routeNumber`).value;
                subPanel.shields[shieldIndex].to = document.getElementById(`${sub_index}/shield${shieldIndex}_to`).checked;
                subPanel.shields[shieldIndex].bannerType = document.getElementById(`${sub_index}/shield${shieldIndex}_bannerType`).value;
                subPanel.shields[shieldIndex].bannerPosition = document.getElementById(`${sub_index}/shield${shieldIndex}_bannerPosition`).value;
                subPanel.shields[shieldIndex].bannerType2 = document.getElementById(`${sub_index}/shield${shieldIndex}_bannerType2`).value;
                
                if ((previous != subPanel.shields[shieldIndex].type) || (previous2.length != subPanel.shields[shieldIndex].routeNumber.length)) {
					
					
					const specialBannerTypeSelectElmt = document.getElementById(`${sub_index}/shield${shieldIndex}_specialBannerType`);
                
					var break_check = false;
					
					
					if (previous2.length != subPanel.shields[shieldIndex].routeNumber.length) {
						
						for (const specialBannerType of Shield.prototype.specialBannerTypes) {
							var current =specialBannerType.split(":");
							
							if (current[0] == subPanel.shields[shieldIndex].type) {
								if (current[1].includes("/")) {
									var values = current[1].split("/");
									
									for (const value in values) {
										if (value.includes(";")) {
											const actual_Value = value.split(";");
											if (actual_value[0] == specialBannerType) {
												if (actual_value[1].parseInt() != subPanel.shields[shieldIndex].routeNumber.length) {
													break;
												} else {
													break_check = true;
													break;
												}
											}
										} else {
											if (value == specialBannerType) {
												break_check = true;
												break;
											}
										}
									}
								}
								break;
							}
						}
					}
					
					if (break_check) {
						break;
					}
					
					subPanel.shields[shieldIndex].specialBannerType = "None";
                
                    // Clearing
                    while (specialBannerTypeSelectElmt.firstChild) {
                        specialBannerTypeSelectElmt.removeChild(specialBannerTypeSelectElmt.firstChild);
                    }
                    
                    // Adding
                    for (const specialBannerType of Shield.prototype.specialBannerTypes) {
                            var current = specialBannerType;
                            current = current.split(":");
                           
                            
                            if (subPanel.shields[shieldIndex].type == current[0]) {
                                
                                if (current[1].includes("/")) {
                                    var currently = current[1].split("/")
                                    
                                    specialBannerTypeSelectElmt.style.visibility = "visible";
                                    
                                    for (let i = 0; i < currently.length; i++) {
                                        var value = currently[i];
                            
                                        if (value.includes(";")) {
                                            value = value.split(";")
                                            var lengths = subPanel.shields[shieldIndex].routeNumber.length;
                                            
                                            if (lengths < 2) {
                                                lengths = 2
                                            }
                                            
                                            if (lengths == value[1]) {
                                                const optionElmt = document.createElement("option");
                                                optionElmt.value = value[0];
                                                optionElmt.selected = (subPanel.shields[shieldIndex].specialBannerType || false);
                                                optionElmt.appendChild(document.createTextNode(value[0]));
                                                specialBannerTypeSelectElmt.appendChild(optionElmt);
                                            }
                                        } else {
                                            const optionElmt = document.createElement("option");
                                            optionElmt.value = value;
                                            optionElmt.selected = (subPanel.shields[shieldIndex].specialBannerType || false);
                                            optionElmt.appendChild(document.createTextNode(value));
                                            specialBannerTypeSelectElmt.appendChild(optionElmt);
                                        }
                                    }
                                    
                                    break;
                                }
								
                                
                            } else {
                                subPanel.shields[shieldIndex].specialBannerType = "None";
                                specialBannerTypeSelectElmt.style.visibility = "hidden";           
                    }
                }
                }    else {
                    subPanel.shields[shieldIndex].specialBannerType = (document.getElementById(`${sub_index}/shield${shieldIndex}_specialBannerType`).value || "None");
					
                }
             
            }
            
            subPanel.controlText = form["controlText" + (sub_index.toString())].value;
            subPanel.actionMessage = form["actionMessage" + (sub_index.toString())].value;
            subPanel.actionMessage = subPanel.actionMessage.replace("1/2", "½");
            subPanel.actionMessage = subPanel.actionMessage.replace("1/4", "¼");
            subPanel.actionMessage = subPanel.actionMessage.replace("3/4", "¾");
            subPanel.advisoryMessage = form["outActionMessage" + (sub_index.toString())].checked;
            if ((panel.sign.subPanels.length > 1) && (sub_index == 0)) {
                subPanel.width = parseInt(form["subPanelLength" + (sub_index.toString())].value);   
            } else if (sub_index != 0) {
                subPanel.height = form["subPanelHeight" + (sub_index.toString())].value + "rem";
                subPanel.width = parseInt(form["subPanelLength" + (sub_index.toString())].value);   
            }
        }
        
        
		
		panel.sign.shieldPosition = form["shieldsPosition"].value;
		
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
        
		
		if (panel.sign.guideArrow == "Split Exit Only") {
			
			if (form["arrowLocations"].childNodes[0] == "Middle") {
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
				}	
			} else {
				panel.sign.arrowPosition = form["arrowLocations"].value;
			}
		
        panel.sign.exitguideArrows = exitOnlyDirection_result;
        panel.sign.showExitOnly = form["showExitOnly"].checked;
        
		panel.sign.otherSymbol = form["otherSymbol"].value;
		panel.sign.oSNum = form["oSNum"].value;
        
        panel.sign.exitTabColor = form["exitColor"].value;
        panel.exitTab.oldFont = form["exitFont"].checked;

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
		const subPanelList = document.getElementById("subPanelList");
        
        while (panelList.firstChild) {
            panelList.removeChild(panelList.lastChild);
        }
		
		 while (subPanelList.firstChild) {
			subPanelList.removeChild(subPanelList.lastChild);
        }
		
		
        
        for (let panelIndex = 0, panelsLength = post.panels.length; panelIndex < panelsLength; panelIndex++) {
			var new_button = document.createElement("input");
            new_button.type = "button";
            new_button.id = "edit" + (panelIndex + 1);
            new_button.value = "Panel " + (panelIndex + 1);
			
			if (currentlySelectedPanelIndex == panelIndex) {
				new_button.className = "active"
			} else {
				new_button.className = "";
			}
			
            new_button.addEventListener("click", function() {
                changeEditingPanel(panelIndex);
				new_button.className = "active";
            });
            panelList.appendChild(new_button);
		}
		
		for (let subPanelIndex = 0, subPanelsLength = panel.sign.subPanels.length; subPanelIndex < subPanelsLength; subPanelIndex++) {
			var new_button = document.createElement("input");
            new_button.type = "button";
            new_button.id = "sub_edit" + (subPanelIndex + 1);
            new_button.value = "SubPanel " + (subPanelIndex + 1);
			
			if (currentlySelectedSubPanelIndex == subPanelIndex) {
				new_button.className = "active";
			} else {
				new_button.className = "";
			}
			
            new_button.addEventListener("click", function() {
                changeEditingSubPanel(subPanelIndex,panel);
				new_button.className = "active";
            });
            subPanelList.appendChild(new_button);
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
        
        const subPanelHolderEmlt = document.getElementById("subPanelHolder");
        
        while (subPanelHolderEmlt.firstChild) {
            subPanelHolderEmlt.removeChild(subPanelHolderEmlt.lastChild);
        }
        
        
        for (var subPanelIndex = 0;subPanelIndex < panel.sign.subPanels.length;subPanelIndex ++) {
			
			var subPanel_val = panel.sign.subPanels[subPanelIndex];
			
            var new_subPanel = document.createElement("div");
            new_subPanel.className = "subPanel";
            new_subPanel.id = "subPanel" + subPanelIndex.toString();
            
            subPanelHolderEmlt.appendChild(new_subPanel);
            
            var shieldLabel = document.createElement("b");
            shieldLabel.appendChild(document.createTextNode("Sign Shields:"));
            new_subPanel.appendChild(shieldLabel);

            var shieldsContainerElmt = document.createElement("div");
            shieldsContainerElmt.id = "shield_"+new_subPanel.id;
            shieldsContainerElmt.className = "shields";
            new_subPanel.appendChild(shieldsContainerElmt);
            
            updateShieldSubform(new_subPanel.id,subPanelIndex);
            
            var label1 = document.createElement("label");
            label1.setAttribute("for","controlText");
            label1.appendChild(document.createTextNode("Control Cities:"));
            label1.id = "controlCitiesLabel";
            
            var new_controlTextElmt = document.createElement("Textarea");
            new_controlTextElmt.id = "controlText" + subPanelIndex.toString();
            new_controlTextElmt.className = "controlTextArea";
            new_controlTextElmt.wrap = "hard";
            new_controlTextElmt.rows = "4";
			new_controlTextElmt.value = subPanel_val.controlText;
            new_controlTextElmt.addEventListener("blur", function() {
                readForm();
            })
            
            var label2 = document.createElement("label");
            label2.setAttribute("for","actionTextElmt");
            label2.appendChild(document.createTextNode("Action Message: "));
            label2.id = "actionMessageLabel";
            
            var new_actionTextElmt = document.createElement("input");
            new_actionTextElmt.type = "text";
            new_actionTextElmt.id = "actionMessage" + subPanelIndex.toString();
            new_actionTextElmt.className = "actionMessage"
            new_actionTextElmt.placeholder = "Action Message";
            new_actionTextElmt.name = "actionMessage";
			new_actionTextElmt.value = subPanel_val.actionMessage;
            new_actionTextElmt.addEventListener("blur", function() {
                readForm();
            });
            
            var label3 = document.createElement("label");
            label3.setAttribute("for","outActionMessage");
            label3.appendChild(document.createTextNode("Advisory Msg:"));
            label3.id = "outActionMessageLabel";
            
            var new_advisoryMessageElmt = document.createElement("input");
            new_advisoryMessageElmt.type = "checkbox";
            new_advisoryMessageElmt.id = "outActionMessage" + subPanelIndex.toString();
            new_advisoryMessageElmt.name = "outActionMessage";
            new_advisoryMessageElmt.value = "outActionMessage";
			new_advisoryMessageElmt.value = subPanel_val.advisoryMessage;
            new_advisoryMessageElmt.checked = true;
            new_advisoryMessageElmt.addEventListener("change", function() {
                readForm();
            });
            
            var label4 = document.createElement("label");
            label4.setAttribute("for","subPanelLength");
            label4.appendChild(document.createTextNode("Panel Length:"));
            label4.id = "subPanelLengthLabel";
            
            var subPanelLengthElmt = document.createElement("input");
            subPanelLengthElmt.type = "number";
            subPanelLengthElmt.id = "subPanelLength" + subPanelIndex.toString();
            subPanelLengthElmt.placeholder = 1;
			subPanelLengthElmt.value = subPanel_val.width;
            subPanelLengthElmt.addEventListener("change", function() {
                readForm();
            })
            
            var label5 = document.createElement("label");
            label5.setAttribute("for","subPanelHeight");
            label5.appendChild(document.createTextNode("Div Height (rem):"));
            label5.id = "subPanelLengthLabel";
            
            var subPanelHeightElmt = document.createElement("input");
            subPanelHeightElmt.type = "number";
            subPanelHeightElmt.id = "subPanelHeight" + subPanelIndex.toString();
            subPanelHeightElmt.placeholder = 1;
			subPanelHeightElmt.value = subPanel_val.height;
            subPanelHeightElmt.addEventListener("change", function() {
                readForm();
            })
            
            

            new_subPanel.appendChild(label1);
            new_subPanel.appendChild(new_controlTextElmt);
            new_subPanel.appendChild(document.createElement("br"));
            new_subPanel.appendChild(label2);
            new_subPanel.appendChild(new_actionTextElmt);
            new_subPanel.appendChild(document.createElement("br"));
            new_subPanel.appendChild(label3);
            new_subPanel.appendChild(new_advisoryMessageElmt);
            new_subPanel.appendChild(document.createElement("br"));
            
            if ((panel.sign.subPanels.length > 1) || (subPanelIndex != 0)) {
                if (panel.sign.subPanels.length > 1) {
                    new_subPanel.appendChild(label4);
                    new_subPanel.appendChild(subPanelLengthElmt);
                    if (subPanelIndex != 0) {
                        new_subPanel.appendChild(document.createElement("br"));
                        new_subPanel.appendChild(label5);
                        new_subPanel.appendChild(subPanelHeightElmt);
                    }
                } else {
                }
            }
            
        }
       

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
            showExitOnly.value = panel.sign.showExitOnly;
			exitOnlyDirection.value = panel.sign.exitOnlyDirection;
			
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
		
		const advisoryMessageElmt = document.getElementById("outActionMessage");
		advisoryMessageElmt.checked = panel.sign.advisoryMessage;
		
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

/**
	 * Update the fields in the form relating to shields to the values of the currently selected panel.
	 */
	const updateShieldSubform = function(subPanelId,number) {
		
        const subPanel = document.getElementById(subPanelId);
        const shieldsContainerElmt = document.getElementById("shield_"+subPanelId);
        
        while (shieldsContainerElmt.firstChild) {
            shieldsContainerElmt.removeChild(shieldsContainerElmt.lastChild);
        }
        
        
        const add = document.createElement("input");
        add.type = "button";
        add.id = "add" + number.toString();
        add.className = "add";
        add.value = "New Shield";
        add.addEventListener("click", function() {
            app.newShield(subPanelId,number);
        });
        
        const clear = document.createElement("input");
        clear.type = "button"
        clear.value = "Clear all Shields"
        clear.id = "clear" + number.toString();
        clear.className = "clear";
        clear.addEventListener("click", function() {
            app.clearShields(subPanelId,number);
        });
      		
		
		
        if (! document.getElementById("add" + number.toString()) && (! document.getElementById("clear" + number.toString()))) {
            subPanel.appendChild(document.createElement("br"));
            subPanel.appendChild(add);
            subPanel.appendChild(clear);
            subPanel.appendChild(document.createElement("br"));
        }
		
		
        const shields = post.panels[currentlySelectedPanelIndex].sign.subPanels[number].shields;



		for (let shieldIndex = 0, length = shields.length; shieldIndex < length; shieldIndex++) {
            
            
			const rowContainerElmt = document.createElement("div");
            rowContainerElmt.style.width = "100%";

			const toCheckElmt = document.createElement("input");
			toCheckElmt.type = "checkbox";
			toCheckElmt.id = `${number}/shield${shieldIndex}_to`;
			toCheckElmt.name = `shield${shieldIndex}_to`;
			toCheckElmt.checked = shields[shieldIndex].to;
			toCheckElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(toCheckElmt);

			const toCheckLabelElmt = document.createElement("label");
			toCheckLabelElmt.setAttribute("for", `${number}/shield${shieldIndex}_to`);
			toCheckLabelElmt.appendChild(document.createTextNode(" TO "));
			rowContainerElmt.appendChild(toCheckLabelElmt);

			// Populate shield options
			const typeSelectElmt = document.createElement("select");
			for (const type in Shield.prototype.types) {
				lib.appendOption(typeSelectElmt, Shield.prototype.types[type], {selected : (shields[shieldIndex].type == Shield.prototype.types[type]), text : type});
			}
			typeSelectElmt.id = `${number}/shield${shieldIndex}_type`;
			typeSelectElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(typeSelectElmt);

			const routeNumberElmt = document.createElement("input");
			routeNumberElmt.type = "text";
			routeNumberElmt.id = `${number}/shield${shieldIndex}_routeNumber`;
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
            
            specialBannerTypeSelectElmt.id = `${number}/shield${shieldIndex}_specialBannerType`;
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
			bannerTypeSelectElmt.id = `${number}/shield${shieldIndex}_bannerType`;
			bannerTypeSelectElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(bannerTypeSelectElmt);

			// Populate banner position options
			const bannerPositionSelectElmt = document.createElement("select");
			for (const bannerPosition of Shield.prototype.bannerPositions) {
				lib.appendOption(bannerPositionSelectElmt, bannerPosition, {selected : (shields[shieldIndex].bannerPosition == bannerPosition)});
			}
			bannerPositionSelectElmt.id = `${number}/shield${shieldIndex}_bannerPosition`;
			bannerPositionSelectElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(bannerPositionSelectElmt);
            
            rowContainerElmt.appendChild(document.createElement("br"));
            
            const bannerType2SelectElmt = document.createElement("select");
			for (const bannerType2 of Shield.prototype.bannerTypes) {
				lib.appendOption(bannerType2SelectElmt, bannerType2, {selected : (shields[shieldIndex].bannerType2 == bannerType2)});
			}
			bannerType2SelectElmt.id = `${number}/shield${shieldIndex}_bannerType2`;
			bannerType2SelectElmt.addEventListener("change", readForm);
			rowContainerElmt.appendChild(bannerType2SelectElmt);

			// Populate banner position options

            rowContainerElmt.appendChild(document.createElement("br"));
            
            const duplicateElmt = document.createElement("input");
			duplicateElmt.type = "button";
			duplicateElmt.value = "Duplicate";
			duplicateElmt.dataset.shieldIndex = shieldIndex;
			duplicateElmt.addEventListener("click", function() {
                duplicateShield(shieldIndex,subPanelId,number)
            });
			rowContainerElmt.appendChild(duplicateElmt);

			const deleteElmt = document.createElement("input");
			deleteElmt.type = "button";
			deleteElmt.value = "Delete";
			deleteElmt.dataset.shieldIndex = shieldIndex;
			deleteElmt.addEventListener("click", function() {
                deleteShield(deleteElmt.dataset.shieldIndex,subPanelId,number);
            });
            
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
			panelContainerElmt.appendChild(panelElmt);

			const exitTabCont = document.createElement("div");
			exitTabCont.className = `exitTabContainer ${panel.exitTab.position.toLowerCase()} ${panel.exitTab.width.toLowerCase()}`;
			panelElmt.appendChild(exitTabCont);

			const exitTabElmt = document.createElement("div");
			exitTabElmt.className = `exitTab ${panel.exitTab.position.toLowerCase()} ${panel.exitTab.width.toLowerCase()}`;
            exitTabCont.appendChild(exitTabElmt);

			const signCont = document.createElement("div");
			signCont.className = `signContainer exit-${panel.exitTab.width.toLowerCase()} exit-${panel.exitTab.position.toLowerCase()}`;
			panelElmt.appendChild(signCont);
            
			const signElmt = document.createElement("div");
			signElmt.className = `sign exit-${panel.exitTab.width.toLowerCase()} exit-${panel.exitTab.position.toLowerCase()}`;
			signCont.appendChild(signElmt);

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
			
			const sideLeftArrowElmt = document.createElement("div");
			sideLeftArrowElmt.className = "sideLeftArrow";
			sideLeftArrowElmt.appendChild(document.createTextNode(lib.specialCharacters.sideLeftArrow));
			signElmt.appendChild(sideLeftArrowElmt);
			
            for (let subPanelIndex = 0;subPanelIndex < panel.sign.subPanels.length;subPanelIndex++) {
      
                const subPanel = panel.sign.subPanels[subPanelIndex];
				var position;
				var locked = false;
				
				if (subPanelIndex > 0) {
                    const subDivider = document.createElement("div");
                    subDivider.className = "subDivider";
                    subDivider.id = "subDivider" + subPanelIndex.toString();
                    subDivider.style.height = panel.sign.subPanels[subPanelIndex].height;
                    signElmt.appendChild(subDivider);
                }
                
                const new_subPanel = document.createElement("div");
                new_subPanel.className = "subPanelDisplay";
                new_subPanel.id = "S_subPanel" + subPanelIndex.toString();
                signElmt.appendChild(new_subPanel);
                
                const signContentContainerElmt = document.createElement("div");
                signContentContainerElmt.className = `signContentContainer shieldPosition${panel.sign.shieldPosition}`;
                signContentContainerElmt.id = "signContentContainer" + subPanelIndex.toString();
                signElmt.appendChild(signContentContainerElmt);
                
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
					
				for (const shield of subPanel.shields) {
					if ((shield.bannerPosition != "Above") && ((shield.bannerType != "None") || (shield.bannerType2 != "None")) ) {
						position = shield.bannerPosition;
						break;
					}
				}
			
                // Shields
                for (const shield of subPanel.shields) {
					if ((shield.bannerPosition != "Above") && (shield.bannerType != "None") || (shield.bannerType2 != "None") && (! locked)) {
						position = shield.bannerPosition;
						locked = true;
					}
					
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


                    const shieldElmt = document.createElement("div");
                    shieldElmt.className = "shield";
					shieldElmt.id = "shield" + subPanel.shields.indexOf(shield).toString();
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
                    
                    const sameElement = ["AK","C","CO","FL","CD","DC","HI","ID","LA","MI","MN","MT","MT2","NB","NC","NE","NH","NM","NV","PEI","QC2","REC2","SC","TN","TX","UT","VA2","WA","WI","WY"];
                    
                    if (sameElement.includes(shield.type)) {
                                    lengthValue = 2;
                    }
                    
                    var imgFileConstr = shield.type + "-" + lengthValue;
                    
                    if (shield.specialBannerType != "None") {
                        imgFileConstr += "-" + shield.specialBannerType;  
                    }
                    
                    shieldImgElmt.data = imgDir + imgFileConstr + ".png";

                    //shield                    
					
					if ((shield.type == "I") && (shield.routeNumber.length == 3)) {
						shieldImgElmt.style.width = "3.8rem";
					}
					
					if (position == "Right") {
						shieldElmt.style.right = subPanel.shieldDistance.toString() + "rem";
					} else if (position == "Left") {
						shieldElmt.style.left = subPanel.shieldDistance.toString() + "rem";
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
                
                const controlTextArray = subPanel.controlText.split("\n");
                for (let lineNum = 0, length = controlTextArray.length - 1; lineNum < length; lineNum++) {
                    LineEditor(controlTextArray[lineNum])             
                    controlTextElmt.appendChild(document.createElement("br"));
                }
                
                LineEditor(controlTextArray[controlTextArray.length - 1]);
                
                if (post.fontType == true) {
                           controlTextElmt.style.fontFamily = "Series EM";
                }
                
                
                if (subPanel.actionMessage != "") {
                    if (post.fontType == true) {
                            actionMessageElmt.style.fontFamily = "Series E";
                    } else {
                        actionMessageElmt.style.fontFamily = "Clearview 4W";
                    }
                    actionMessageElmt.style.visibility = "visible";
                    actionMessageElmt.style.display = "inline-flex";
                    actionMessageElmt.className = `actionMessage action_message`;
                    const txtArr = subPanel.actionMessage.split(/(\d+\S*)/);
                    const txtFrac = txtArr[0].split(/([\u00BC-\u00BE]+\S*)/);
                    
                    actionMessageElmt.appendChild(document.createTextNode(txtFrac[0]));

                    
                    
                    if (((subPanel.actionMessage.includes("½")) || (subPanel.actionMessage.includes("¼")) || (subPanel.actionMessage.includes("¾"))) && (txtArr.length > 2)) {
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
            }

			// Exit tab
			
			if ((panel.sign.exitTabColor != "Panel Color") && (panel.sign.exitTabColor != undefined)) {
                exitTabElmt.className += ` ${panel.sign.exitTabColor.toLowerCase()}`
            } else {
                exitTabElmt.className += ` ${panel.color.toLowerCase()}`
            }
            
            if (panel.exitTab.oldFont) {
                exitTabElmt.style.fontFamily = "Series E";
            }
			
			
			if ((panel.exitTab.number) || (panel.left)) {
                
                const leftElmt = document.createElement("div");
                
                if (panel.left) {
                    leftElmt.className = `leftElmt ${panel.leftPosition.toLowerCase()}`;
                    leftElmt.appendChild(document.createTextNode("LEFT"));
                    exitTabElmt.appendChild(leftElmt);
					exitTabElmt.style.display = "inline-block";
                    
                    if (panel.exitTab.number) {
                        leftElmt.style.marginRight = "0.4rem";
                    }
                    
                    
                }
				
                
				const txtArr = panel.exitTab.number.toUpperCase().split(/(\d+\S*)/);
				const spanTextElmt = document.createElement("div");
				spanTextElmt.appendChild(document.createTextNode(txtArr[0]))
				exitTabElmt.appendChild(spanTextElmt);
				
				
				if (txtArr.length > 1) {
					spanTextElmt.className = "exitFormat";
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
            

			const sideRightArrowElmt = document.createElement("div");
			sideRightArrowElmt.className = "sideRightArrow";
			sideRightArrowElmt.appendChild(document.createTextNode(lib.specialCharacters.sideRightArrow));
			signElmt.appendChild(sideRightArrowElmt);
			
			// Guide arrows
			
			const ExitKeys = ["EA","EB","EC"];
			const MainKeys = ["A","B","C","D","E"];
			var path;
			
			
			const createArrowElmt = function(key,dir,name,extra) {
				
				if (dir == "MainArrows!ExitOnly") {
					key = key.split("/")[1];
				} else {
					key = key.split("/")[0];
				}
				
				
				if ((ExitKeys.includes(key.split("-")[0])) || (MainKeys.includes(key.split("-")[0])))  {
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
                arrowContElmt.style.cssFloat = "left";
                arrowContElmt.style.paddingLeft = "1rem";
                if (panel.sign.actionMessage != "") {
                    guideArrowsElmt.style.paddingBottom = "0.6rem";
                } else {
                    guideArrowsElmt.style.paddingBottom = "1rem";
                }
            } else if (panel.sign.arrowPosition == "Middle") {
                arrowContElmt.style.cssFloat = "none";
            } else if ((panel.sign.arrowPosition == "Right") && (panel.sign.guideArrow != "Exit Only") && (panel.sign.guideArrow != "Side Left") && (panel.sign.guideArrow != "Side Right") && (panel.sign.guideArrow != "Half Exit Only")) {
                arrowContElmt.style.cssFloat = "right";
                arrowContElmt.style.paddingRight = "1rem";
                if (panel.sign.actionMessage != "") {
                    guideArrowsElmt.style.paddingBottom = "0.6rem";
                } else {
                    guideArrowsElmt.style.paddingBottom = "1rem";
                }
            }
			
			if (panel.sign.guideArrow.includes("Exit Only")) {
				if (panel.sign.guideArrow == "Half Exit Only") {
					const secondaryContainer = document.createElement("div");
					secondaryContainer.className = `arrowContainer ${panel.sign.guideArrow.replace("/", "-").replace(" ", "_").toLowerCase()} ${panel.sign.arrowPosition.toLowerCase()}`;
					
					path = secondaryContainer
					
					const arrow = createArrowElmt(panel.sign.exitguideArrows.split(":")[1],"MainArrows!ExitOnly","halfarrow",panel.sign.arrowPosition.toLowerCase());
					
					if (panel.sign.arrowPosition.toLowerCase() == "left") {
						arrowContElmt.appendChild(secondaryContainer);
						arrowContElmt.appendChild(arrow);
						
						if (panel.sign.guideArrowLanes > 1) {
							
							var marginLeft = 1;
							
							for (let i=1;i <= panel.sign.guideArrowLanes - 2;i++) {
								if (i % 2 == 0) {
								marginLeft += 10;
								} else {
								marginLeft += 3;
								}
							}
							
							arrow.style.marginLeft = marginLeft.toString() + "rem";
						}
						
					} else {
						arrowContElmt.appendChild(arrow);
						arrowContElmt.appendChild(secondaryContainer);
						
						if (panel.sign.guideArrowLanes > 1) {
							
							var marginLeft = 1;
							
							for (let i=1;i <= panel.sign.guideArrowLanes - 2;i++) {
								if (i % 2 == 0) {
								marginLeft += 10;
								} else {
								marginLeft += 3;
								}
								
							}
							
							arrow.style.marginRight = marginLeft.toString() + "rem";
						}
						
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
				guideArrowsElmt.style.display = "block";
				guideArrowsElmt.style.visibility = "visible";
				if (panel.sign.guideArrowLanes %2 == 0 && panel.sign.guideArrow != "Exit Only" && panel.sign.actionMessage != "") {
					path.appendChild(actionMessageElmt);
					path.className += ` centerText`;
				}
				if (("Exit Only" == panel.sign.guideArrow) || ("Split Exit Only" == panel.sign.guideArrow) || ("Half Exit Only" == panel.sign.guideArrow)) {
					if (panel.sign.guideArrowLanes > 1) {
						guideArrowsElmt.style.padding = "0rem";
					}


					/*

                    if (panel.sign.advisoryMessage) {
                        actionMessageElmt.style.fontFamily = "Series E";
                    }
					
					*/

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
								path.appendChild(textExitOnlySpanElmt);
								
								if (panel.sign.guideArrow == "Split Exit Only") {
									path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1],"MainArrows!ExitOnly"));	
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
									path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1],"MainArrows!ExitOnly"));	
								} else {
									path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1]));	
								}
								
								if ((arrowIndex + 1 < length) && (arrowIndex + 1 != Math.ceil(length/2))&& (length != 2)) {
                                    const space = document.createElement("span")
                                    space.className = "exitOnlySpace";
                                    path.appendChild(space);
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
								
								path.appendChild(textExitSpanElmt);
								
								if (panel.sign.guideArrow == "Split Exit Only") {
									path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1],"MainArrows!ExitOnly"));	
								} else {
									path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1]));	
								}
								
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
								path.appendChild(textOnlySpanElmt);
							} else if (arrowIndex == Math.ceil(length/2)) {
								
								if (panel.sign.guideArrow == "Split Exit Only") {
									path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1],"MainArrows!ExitOnly"));	
								} else {
									path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1]));	
								}
                                
								if ((arrowIndex + 1 < length) && (arrowIndex + 1 != Math.floor(length/2))&& (length != 2)) {
                                    const space = document.createElement("span")
                                    space.className = "exitOnlySpace";
                                    path.appendChild(space);
                                }
							} else {
								
								if (panel.sign.guideArrow == "Split Exit Only") {
									path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1],"MainArrows!ExitOnly"));	
								} else {
									path.appendChild(createArrowElmt(panel.sign.exitguideArrows.split(":")[1]));	
								}
                                
								if ((arrowIndex + 1 < length) && (arrowIndex + 1 != Math.floor(length/2))&& (length != 2)) {
                                    const space = document.createElement("span")
                                    space.className = "exitOnlySpace";
                                    path.appendChild(space);
                                }
							}
						}
					}
				} else {
					
					for (let arrowIndex = 0, length = panel.sign.guideArrowLanes; arrowIndex < length; arrowIndex++) {
						if (arrowIndex %2 == 0) {
							arrowContElmt.insertBefore(createArrowElmt(panel.sign.guideArrow.split(":")[1],"MainArrows","arrow",panel.sign.guideArrow.split(":")[0].toLowerCase().replace(/ /g,'')), arrowContElmt.childNodes[0]);
						}
						else {
							arrowContElmt.appendChild(createArrowElmt(panel.sign.guideArrow.split(":")[1],"MainArrows","arrow",panel.sign.guideArrow.split(":")[0]));
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
			}
			
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
        importData : importData,
        newSubPanel : addSubPanel,
        removeSubPanel : removeSubPanel,
		changeEditingSubPanel : changeEditingSubPanel,
		duplicateSubPanel : duplicateSubPanel
	};
})();
