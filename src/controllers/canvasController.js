// vim: set tabstop=4 expandtab : //

var r = 12;	// radius of the box corners for a reason
var o = 30;	// offset from the box edges of a reason to the claims inside

var amCanvas = {
    claimX : 240,   // how much each claim adds to width of a reason
    claimY : 140,   // how much each claim adds to width of a reason
    claimXPad : o,  // how much space is between claims in the same reason
    border : o,     // the border thickness
    mainX : 240 + o + o,	// width of main contention (has only one claim)
    gridX: 300,     // width of a "stock" reason (will change when we allow multi-claim reasons)
    gridY: 200,     // height of a reason
    padX: 150,      // empty horiz space between adjacent reasons
    padY: 100,      // empty vertical space between rows of the map
    centerX: (window.innerWidth / 2), // window center
}
var canvasController = {
    moveClaimOrigin : undefined,
    // Initialize the initial canvas and insert main contention
	newCanvas : function() {
		reasonList.init();
		claimList.init();
		localStorage.clear();
		layer.removeChildren();
		stage.removeChildren();
		stage.setOffsetX( amCanvas.mainX/2 - amCanvas.centerX );
		stage.setPosition(0);
		stage.setScale(1);
		stage.add(layer);
		canvasController.addReason("contention");
	},
    // To be rewritten.  Should load an argument map from storage.
	displayLoad : function() {
		var loadArea = document.getElementById("loadArea");
		var currentLoadDisplay = loadArea.style.display;
		if (currentLoadDisplay == "none") {
			loadArea.style.paddingRight = "100px";
			loadArea.style.display = "inline";
		} else {
			loadArea.style.display = "none";
		}
	},
	// Hide or suppress the "hamburger" menu.
	displayMenu : function() {
	    var menu = document.getElementById("nav");
	    var currentMenuDisplay = menu.style.display;

	    if (currentMenuDisplay != "block") {
		menu.style.display = "block";
	    } else {
		menu.style.display = "none";
		document.getElementById("loadArea").style.display = "none";
	    }
	},
    // Center the argument map with main contention at the top center of window
	centerMap: function(){
		stage.setPosition(0,0);		// Next line might be a FIXME?
		stage.setPosition(-(((window.innerWidth-100)/2))*(stage.getScale().x-1),0)
		stage.setOffset( reasonList.reasons[0].x + reasonList.reasons[0].width()/2 - amCanvas.centerX, 0 );
		stage.draw();

        // Update the export image button
        imageBtn = document.getElementById("toImage");
        imageBtn.href = layer.getCanvas().toDataURL();
	},

    undo: function() {
        // Get position of the root of the tree to anchor
        var x = reasonList.reasons[0].x;
        var y = reasonList.reasons[0].y;

        canvasController.turnOffAllListeners();
        // Remove all drawn objects from the KineticJS layer
        layer.removeChildren();

        // Apply the undo
        undoList.applyUndo();

        // Set the position of the root of the tree
        reasonList.reasons[0].x = x;
        reasonList.reasons[0].y = y;

        // Layout the tree anchoring at the root claim
        amTree.buchheim(reasonList.reasons[0], reasonList.reasons[0].claims[0] );

        // Redraw each claim (which adds them back to KineticJS layer)
        for(var i=0, leni=reasonList.reasons.length; i<leni; i++ ) {
            canvasController.drawReason(i);
        }
    },

    redo: function() {
        // Get position of the root of the tree to anchor
        var x = reasonList.reasons[0].x;
        var y = reasonList.reasons[0].y;

        canvasController.turnOffAllListeners();
        // Remove all drawn objects from the KineticJS layer
        layer.removeChildren();

        // Apply the undo
        undoList.applyRedo();

        // Set the position of the root of the tree
        reasonList.reasons[0].x = x;
        reasonList.reasons[0].y = y;

        // Layout the tree anchoring at the root claim
        amTree.buchheim(reasonList.reasons[0], reasonList.reasons[0].claims[0] );

        // Redraw each claim (which adds them back to KineticJS layer)
        for(var i=0, leni=reasonList.reasons.length; i<leni; i++ ) {
            canvasController.drawReason(i);
        }
    },

    // Create an editable text area, so we can change the content of a claim.
	makeTextArea : function(myId) {
        var claim = claimList.claims[myId];

        // FIXME: suppress Ctrl-Z undo and Ctrl-Y redo until editing is done

		var scale = stage.getScale().x;
		var realX = claim.x()*scale + stage.getAbsoluteTransform().getTranslation().x;
		var realY = claim.y()*scale + stage.getAbsoluteTransform().getTranslation().y;
		document.getElementById('myTextArea').style.left = realX + "px";
		document.getElementById('myTextArea').style.top = realY + "px";
		document.getElementById('myTextArea').style.zIndex = 2;
		return "<textarea style='font-size: " + (16 * scale) + "px; width: " + ((claim.width) * scale) + "px; height: " + (claim.height * scale) + "px;' name='working' id=" + myId + " onfocus='this.select();' onblur='canvasController.removeTextArea(" + myId + ")'>" + claim.text + "</textarea>"
	},
    // Get the text out of our editable text area (so it can be set back to a claim)
	extractText : function() {
		return document.getElementsByName('working')[0].value;
	},
    // Set the edited text back to our claim and make the editable text area
    // disappear.  The argument is the unique identifier of the claim.
	removeTextArea : function(myId) {
        // Save the text in our argument map
		var claim = claimList.claims[myId];
        var oldtext = claim.text;
        var newtext = canvasController.extractText();

        // Update the old text if changed
        if( oldtext !== newtext ) {
            claim.text = newtext;
            // Write the text into complexText box
            claim.complexText.setText( claim.text );

            // Create a new undo object
            undoList.createUndo();
        }

        // Make the editable text area disappear
		document.getElementById('myTextArea').innerHTML = '';
		document.getElementById('myTextArea').style.zIndex = 0;

        // Redraw the layer or the text won't appear in the new imageBtn URL
        layer.draw();

        // Update the export image button to show the new text
        imageBtn = document.getElementById("toImage");
        imageBtn.href = layer.getCanvas().toDataURL();

        // FIXME: restore Ctrl-Z undo and Ctrl-Y redo now that editing is done
	},
    // Walks through all of the claims and sets the complexText area to the claim coordinates.
    // Really, this is a bit weird because probably changing the x coordinate of the Reason
    // should update the x coordinate of the Claims and by extension the complexText objects.
	fixText: function(){
        for( var i=0, leni=claimList.claims.length; i < leni; i++ ) {
            var claim = claimList.claims[i];
            // If a complexText area is defined, set the coordinate
            claim.complexText && claim.complexText.setX( claim.x() );
        }
	},
    // Adds a new claim box to the left or right edge of a reason
    addClaimToReason : function( id, leftRight ) {
        var reason = reasonList.reasons[id];
        var claim = claimList.newClaim( reason, amCanvas.claimX, amCanvas.claimY, "" );
        var anchor = reason.father;

        if( !leftRight ) {  // add to left
            reason.claims.unshift( claim );
        } else {            // add to right
            reason.claims.push( claim );
        }

        canvasController.turnOffAllListeners();
        // Remove all drawn objects from the KineticJS layer
        layer.removeChildren();

        // Layout the tree because things will move
        amTree.buchheim(reasonList.reasons[0], anchor );

        // Redraw each claim (which adds them back to KineticJS layer)
        for(var i=0, leni=reasonList.reasons.length; i<leni; i++ ) {
            canvasController.drawReason(i);
        }

        // Create a new Undo item for the current tree state.
        undoList.createUndo();

        // Activate the editable text area for immediate editing
		document.getElementById("myTextArea").innerHTML = canvasController.makeTextArea(claim.id);
		document.getElementsByName('working')[0].focus();
    },
    // Adds a new reason to the argument map as a child of one of the existing claims.
	addReason : function(type, father, claims) {
		var reason = reasonList.newReason(type, father, claims);
        var claim = reason.claims[0];

        if( typeof( claims ) === "undefined" ) {
            // Layout the tree again and draw this reason
            amTree.buchheim(reasonList.reasons[0], father);
            canvasController.drawReason(reason.id);

            // Create a new Undo item for the current tree state.
            undoList.createUndo();

            // Activate the editable text area for immediate editing
            document.getElementById("myTextArea").innerHTML = canvasController.makeTextArea(claim.id);
            document.getElementsByName('working')[0].focus();
        }
	},
    removeReason : function(id) {
        // Recursively remove a Reason and its children from argument map
        var reason = reasonList.reasons[id];
        var children = reason.children();
        var claims = reason.claims;

        for(var i = children.length-1; i >= 0; i--){
            canvasController.removeReason(children[i].id);
        }

        // Now remove us from the father Claim's children list
        var pchildren = reason.father.children;
        pchildren.splice(pchildren.indexOf(reason), 1);

        // Remove our claims from the claimList
        for(var i = claims.length-1; i >= 0; i-- ) {
            claimList.deleteClaim( claims[i] );
        }

        // And remove us from the reasonList
        reasonList.deleteReason( reason );
    },
    unmarkDisallowedTargets : function( reason ) {
        var claims = reason.claims;
        var children = reason.children();

        reason.disallowedTarget = undefined;

        for( var i = claims.length-1; i >= 0; i-- ) {
            reason.claims[i].disallowedTarget = undefined;
        }

        for( var i = children.length-1; i >= 0; i-- ) {
            canvasController.unmarkDisallowedTargets( children[i] );
        }
    },
    markDisallowedMoveReasonTargets : function( reason ) {
        var claims = reason.claims;

        reason.disallowedTarget = 1;
        reason.reasonShape.setAttr("opacity", 0.1);
        reason.deleteButton.setAttr("opacity", 0.1);

        for( var i = claims.length-1; i >= 0; i-- ) {
            claim = claims[i];

            claim.disallowedTarget = 1;
            claim.textArea.setAttr("opacity", 0.1);
            claim.complexText.setAttr("opacity", 0.1);

            canvasController.markDisallowedMoveButtonTargets( claim );
        }

    },
    markDisallowedMoveButtonTargets : function( claim ) {
        var children = claim.children;

        claim.supportButton.disallowedTarget = 1;
        claim.supportButton.setAttr("opacity", 0.1);

        claim.refuteButton.disallowedTarget = 1;
        claim.refuteButton.setAttr("opacity", 0.1);

        for(var i = children.length-1; i >= 0; i--){
            canvasController.markDisallowedMoveReasonTargets(children[i]);
        }
    },
    markDisallowedRibbonTargets : function( reason ) {
        var children = reason.children();

        if( reason.ribbon ) {
            reason.ribbon.setAttr( "opacity", 0.5 );
        }

        for( var i = children.length-1; i >= 0; i-- ) {
            child = children[i];

            if( child ) {
                canvasController.markDisallowedRibbonTargets( child );
            }
        }
    },
    // Start moving a Claim
    startMovingClaim : function(id){
        var claim = claimList.claims[id];

        canvasController.moveClaimOrigin = claim;

        claim.deleteButton.setAttr("opacity", 0);
        claim.moveButton.setAttr("opacity", 1);

        canvasController.turnOffAllListeners();

        // Indicate the claim to move by highlighting the border
        claim.complexText.setStroke( "blue" );

        // Mark buttons and children of this claim as disallowed targets for this move
        canvasController.markDisallowedMoveButtonTargets( claim );

        // Mark the main contention as a disallowed target too
        var reason = reasonList.reasons[0];
        claim = claimList.claims[0];
        reason.disallowedTarget = 1;
        claim.disallowedTarget = 1;
        reason.reasonShape.setAttr("opacity", 0.1);
        reason.deleteButton.setAttr("opacity", 0.1);
        claim.textArea.setAttr( "opacity", 0.1);
        claim.complexText.setAttr( "opacity", 0.1);

        // All ribbons are disallowed -- recursively marked from the main contention
        canvasController.markDisallowedRibbonTargets( reason );

        layer.draw();
    },
    // Finish moving a Claim by deleting it from its current location
    // and inserting it at the destination location.
    moveClaimToDestinationAndDraw : function(reason, position) {
        var origin = canvasController.moveClaimOrigin;
        var siblings = origin.reason.claims;

        // We might be moving back to the same Reason
        if( origin.reason===reason ) {
            if( position===siblings.indexOf(origin) || position===siblings.indexOf(origin)+1 ) {
                canvasController.moveClaimAbort();
                return;
            } else if( position>siblings.indexOf(origin) ) {
                position--;
            }
        }

        // Remove this Claim from our enclosing Reason
        siblings.splice(siblings.indexOf(origin), 1);

        // Splice it into the destination Reason
        reason.claims.splice(position, 0, origin );

        // If this was the last claim, then remove the whole Reason
        if( siblings.length === 0 ) {
            canvasController.removeReason( origin.reason.id );
        }

        origin.reason = reason;

        // Remove all drawn objects from the KineticJS layer
        layer.removeChildren();

        // Layout the tree because things will move
        amTree.buchheim(reasonList.reasons[0], reason.father );

        // Redraw each claim (which adds them back to KineticJS layer)
        for(var i=0, leni=reasonList.reasons.length; i<leni; i++ ) {
            canvasController.drawReason(i);
        }

        // Create a new Undo item for the current tree state.
        undoList.createUndo();

        canvasController.moveClaimOrigin = undefined;
        canvasController.unmarkDisallowedTargets( reasonList.reasons[0] );
    },
    reassignRebutsAndRefutes : function( reason ) {
        var children = reason.children();

        if( reason.fatherR() ) {
            if( reason.fatherR().type==="rebut" && reason.type==="rebut" ) {
                reason.type = "refute";
            } else if( reason.fatherR().type==="refute" && reason.type==="refute" ) {
                reason.type = "rebut";
            }
        }

        for( var i = children.length-1; i >= 0; i-- ) {
            canvasController.reassignRebutsAndRefutes( children[i] );
        }
    },
    moveClaimToNewRefutationAndDraw : function(claimId) {
        var father = claimList.claims[claimId];
        var origin = canvasController.moveClaimOrigin;
        var reason = origin.reason;
        var siblings = reason.claims;

        // Remove this Claim from our enclosing Reason
        siblings.splice(siblings.indexOf(origin), 1);

        // If this was the last claim, then remove the whole Reason
        if( siblings.length === 0 ) {
            canvasController.removeReason( reason.id );
        }

        if( father.reason.type === "refute" ) {
            canvasController.addReason("rebut", father, [ origin ] );
        } else {
            canvasController.addReason("refute", father, [ origin ] );
        }

        canvasController.reassignRebutsAndRefutes( origin.reason );

        // Remove all drawn objects from the KineticJS layer
        layer.removeChildren();

        // Layout the tree because things will move
        amTree.buchheim(reasonList.reasons[0], father );

        // Redraw each claim (which adds them back to KineticJS layer)
        for(var i=0, leni=reasonList.reasons.length; i<leni; i++ ) {
            canvasController.drawReason(i);
        }

        // Create a new Undo item for the current tree state.
        undoList.createUndo();

        canvasController.moveClaimOrigin = undefined;
        canvasController.unmarkDisallowedTargets( reasonList.reasons[0] );
    },
    moveClaimToNewSupportAndDraw : function(claimId) {
        var father = claimList.claims[claimId];
        var origin = canvasController.moveClaimOrigin;
        var reason = origin.reason;
        var siblings = reason.claims;

        // Remove this Claim from our enclosing Reason
        siblings.splice(siblings.indexOf(origin), 1);

        // If this was the last claim, then remove the whole Reason
        if( siblings.length === 0 ) {
            canvasController.removeReason( reason.id );
        }

        canvasController.addReason("support", father, [ origin ] );

        // Remove all drawn objects from the KineticJS layer
        layer.removeChildren();

        // Layout the tree because things will move
        amTree.buchheim(reasonList.reasons[0], father );

        // Redraw each claim (which adds them back to KineticJS layer)
        for(var i=0, leni=reasonList.reasons.length; i<leni; i++ ) {
            canvasController.drawReason(i);
        }

        // Create a new Undo item for the current tree state.
        undoList.createUndo();

        canvasController.moveClaimOrigin = undefined;
        canvasController.unmarkDisallowedTargets( reasonList.reasons[0] );
    },
    moveClaimAbort : function() {
        canvasController.moveClaimOrigin = undefined;
        canvasController.unmarkDisallowedTargets( reasonList.reasons[0] );

        // Remove all drawn objects from the KineticJS layer
        layer.removeChildren();

        // Redraw each claim (which adds them back to KineticJS layer)
        for(var i=0, leni=reasonList.reasons.length; i<leni; i++ ) {
            canvasController.drawReason(i);
        }
    },
    turnOffAllListeners : function() {
        for(var i = 0; i < claimList.nextClaimNumber ; i++ ) {
            // We only turn them off if they exist....
            if( claimList.claims[i].deleteButton ) {
                claimList.claims[i].deleteButton.off( 'mouseenter mouseleave' );
                claimList.claims[i].moveButton.off( 'mouseenter mouseleave' );
                claimList.claims[i].textArea.off( 'mouseenter mouseleave' );
                claimList.claims[i].complexText.off( 'mouseenter mouseleave' );
            }
        }
        for(var i = 0; i < reasonList.nextReasonNumber ; i++ ) {
            if( reasonList.reasons[i].addClaimLeft ) {
                reasonList.reasons[i].addClaimLeft.off( 'mouseenter mouseleave' );
                reasonList.reasons[i].addClaimRight.off( 'mouseenter mouseleave' );
            }
        }
    },
    // Remove a Claim and the children recursively,
    // and draws the new argument map.
	removeClaimAndDraw : function(id){
        var claim = claimList.claims[id];
        var children = claim.children;
        var reason = claim.reason;
        var siblings = reason.claims;

        canvasController.turnOffAllListeners();

        // If we delete the main contention, just make a new canvas instead.
		if( reason.id===0 ){
			canvasController.newCanvas();
		}else if( siblings.length===1 ) {
            // If we are the only Claim in the Reason, just remove the Reason
            canvasController.removeReasonAndDraw( reason.id );
        } else {
            // Recurse through the child Reasons of this claim and remove them
            for(var i = children.length-1; i >= 0; i--){
                canvasController.removeReason(children[i].id);
            }

            // Remove this Claim from our enclosing Reason
            siblings.splice(siblings.indexOf(claim), 1);

            // Remove this Claim from the claimList
            claimList.deleteClaim( claim );

            // Remove all drawn objects from the KineticJS layer
			layer.removeChildren();

            // Layout the tree to show the new structure anchoring on left most Claim
			amTree.buchheim(reasonList.reasons[0], reason.father );

            // Redraw each claim (which adds them back to KineticJS layer)
			for(var i=0, leni=reasonList.reasons.length; i<leni; i++ ) {
				canvasController.drawReason(i);
			}

            // Create a new Undo item for the current tree state.
            undoList.createUndo();
		}
	},
    // Remove a Reason and its Claims and the children of all the Claims recursively,
    // and draws the new argument map.
	removeReasonAndDraw : function(id){
        canvasController.turnOffAllListeners();

		if(id===0){
			canvasController.newCanvas();
		}else{
            // Recurse through the (adopted) child Reasons of this one and remove them
			var reason = reasonList.reasons[id];
            var father = reason.father;

            // Remove this Reason and child Reasons from argument map
            canvasController.removeReason(id);

            // Remove all drawn objects from the KineticJS layer
			layer.removeChildren();

            // Layout the tree to show the new structure anchoring on father Claim
			amTree.buchheim(reasonList.reasons[0], father);

            // Redraw each claim (which adds them back to KineticJS layer)
			for(var i=0, leni=reasonList.reasons.length; i<leni; i++ ) {
				canvasController.drawReason(i);
			}

            // Create a new Undo item for the current tree state.
            undoList.createUndo();
		}
	},
	drawReason : function(myId) {
        var reason = reasonList.reasons[myId];
        var claimTextArea = [];
        var complexText = [];
        var addClaimLeft = [];
        var addClaimRight = [];
        var claimDeleteButton = [];
        var claimMoveButton = [];
        var supportButton = [];
        var refuteButton = [];

        // This is the background shape and color of a Reason.  It has a clickable
        // region at the top center for reparenting, and will have Claims layered
        // on top of it (including their support and object buttons).
		var reasonShape = new Kinetic.Shape({
			id : myId,
			name : "reason",
			drawFunc : function(canvas) {   // Draws the background area and fills it
				var context = canvas.getContext();
				var x = reason.x;
				var y = reason.y;
				var w = reason.width();
				var h = reason.height();

				context.beginPath();
				context.moveTo(x + r, y);
				context.arcTo(x + w, y, x + w, y + r, r);
				context.arcTo(x + w, y + h, x + w - r, y + h, r);
				context.arcTo(x, y + h, x, y + h - r, r);
				context.arcTo(x, y, x + r, y, r);
				context.closePath();

				if (reasonList.reasons[myId].type === "support") {
					this.setFill('#6CC54F');
				} else if (reasonList.reasons[myId].type === "refute") {
					this.setFill('#E60000');
				} else if (reasonList.reasons[myId].type === "rebut") {
					this.setFill('orange');
				} else {
					this.setFill('blue');
				}
				canvas.fillStroke(this);
			},
			stroke : 'black',
			strokeWidth : 2,
			opacity : 1
		});

        // Draws a yellow utility/delete button on the right top corner of a Reason.
        // Also creates a custom hit region of the same shape.
		var deleteButton = new Kinetic.Shape({
			id : myId,
			drawFunc : function(canvas) {   // Draw background of utility button
				var context = canvas.getContext();
				var x = reason.x;
				var y = reason.y;
				var w = reason.width();
				var h = reason.height();

				context.beginPath();
				context.moveTo(x + w - 2 * o - r, y);
				context.bezierCurveTo(x + w - o, y, x + w, y + o, x + w, y + 2 * o + r);
				context.arcTo(x + w, y, x + w - o - r, y, r);
				context.closePath();

				this.setFill('#FFFF73');    // yellow
				canvas.fillStroke(this);
			},
			stroke : 'black',
			strokeWidth : 2,
			name : 'deleteButton',
			opacity : 1

		});

        // If we aren't a contention then we need to draw a
        // support/refute/rebut ribbon from us to our parent Claim.
        //
        // We also create hit-buttons for adding claims on left or right edge
        var type = reason.type;
        if (type !== "contention") {
			var connector = new Kinetic.Shape({
				//id : myId,
                drawFunc : function(canvas) {
                    var context = canvas.getContext();
                    var x = reason.x;
                    var y = reason.y;
                    var w = reason.width();
                    var h = reason.height();

                    var parentX = reason.father.x();
                    var parentY = reason.father.y();
                    var parentW = reason.father.width;
                    var parentH = reason.father.height;

                    // Ribbons draw one way to the left and differently to the right,
                    // because the "outside" edge of the ribbon is higher than the
                    // "inside" edge.

                    // Start values will be from the child Reason and End values on the parent
                    var startLeftX = x + w*1/3;     // Start 1/3 width over
                    var startRightX = x + w*2/3;    // Start 2/3 width over
                    var startY = y;                 // Start at top edge of box

                    var endLeftY, endRightY, cornerX, cornerY;

                    // End values depend on whether this is a support or refut/rebut
                    if(type === "support" ) {
                        endLeftX = parentX - r/2;           // End at left edge
                        endRightX = parentX + parentW/2;    // End at middle
                        endLeftY = parentY + parentH + o - r;   // End just above the reason's edge
                        endRightY = parentY + parentH + o;      // End at the reason's edge
                        cornerX = endLeftX;
                        cornerY = endRightY;
                    } else {
                        endLeftX = parentX + parentW/2;     // End at middle
                        endRightX = parentX + parentW + r/2;// End at right edge
                        endLeftY = parentY + parentH + o;   // End at the reason's edge
                        endRightY = parentY + parentH + o - r;    // End just above the reason's edge
                        cornerX = endRightX;
                        cornerY = endLeftY;
                    }
                    var yDist = parentY + parentH + o - startY;

                    // Is parent more left-oriented or right-oriented to child?
                    var leftCtrlY1, leftCtrlY2, rightCtrlY1, rightCtrlY2;
                    var oriented = (endLeftX - startLeftX) + (endRightX - startRightX);
                    if( oriented >=0 ) {    // left edge is 'outside' edge
                        leftCtrlY1 = startY + yDist*2/3;
                        leftCtrlY2 = startY + yDist*1/2;
                        rightCtrlY1 = startY + yDist*1/2;
                        rightCtrlY2 = startY + yDist*1/2;
                    } else {
                        leftCtrlY1 = startY + yDist*1/2;
                        leftCtrlY2 = startY + yDist*1/2;
                        rightCtrlY1 = startY + yDist*2/3;
                        rightCtrlY2 = startY + yDist*1/2;
                    }

                    // Draw the ribbon
                    context.beginPath()
                    context.moveTo(startLeftX, startY);
                    context.bezierCurveTo(startLeftX,leftCtrlY1,endLeftX,leftCtrlY2,endLeftX,endLeftY);
                    context.arcTo(cornerX,cornerY,endRightX,endRightY,r);
                    context.lineTo(endRightX,endRightY);
                    context.bezierCurveTo(endRightX,rightCtrlY2,startRightX,rightCtrlY1,startRightX, startY );
                    context.closePath();

                    this.setFillLinearGradientStartPoint([endLeftX, endLeftY]);
                    this.setFillLinearGradientEndPoint([endLeftX, startY] );
                    if (reasonList.reasons[myId].type === "support") {
                        this.setFillLinearGradientColorStops([1 / 5, 'green', 4 / 5, '#6CC54F']);
                    } else if (reasonList.reasons[myId].type === "refute") {
                        this.setFillLinearGradientColorStops([1 / 5, 'red', 4 / 5, '#E60000']);
                    } else {
                        this.setFill('orange');
                    }
                    canvas.fillStroke(this);

				},
				name : 'connector',
				opacity : 1
			});

            // A hit region for expanding a reason on the right edge with another claim.
            var addClaimLeft = new Kinetic.Shape({
                name : 'addClaimLeft',
                id : myId,
                stroke : 'black',
                strokeWidth : 2,
                drawFunc : function(canvas) {
                    var context = canvas.getContext();
                    var x = reason.x;
                    var y = reason.y;
                    var w = reason.width();
                    var h = reason.height();

                    context.beginPath();
                    context.moveTo(x + o/3, y + h*1/2 );
                    context.lineTo(x + o*2/3, y + h*1/3 );
                    context.lineTo(x + o*2/3, y + h*2/3 );
                    context.closePath();

                    this.setFill('white');

                    canvas.fillStroke(this);
                },
                drawHitFunc : function(canvas) {
                    var context = canvas.getContext();
                    var x = reason.x;
                    var y = reason.y;
                    var w = reason.width();
                    var h = reason.height();

                    context.beginPath();
                    context.moveTo(x, y + h*1/3 );
                    context.lineTo(x + o, y + h*1/3 );
                    context.lineTo(x + o, y + h*2/3 );
                    context.lineTo(x, y + h*2/3 );
                    context.closePath();

                    canvas.fillStroke(this);
                },
                opacity : 0
            });

            addClaimLeft.on( 'mouseenter',
                    function( addClaimLeft ) { return function(canvas) {    // Show delete button on entering claim
                        addClaimLeft.setAttr("opacity", 0.5);
                        addClaimLeft.draw();
                    }; }(addClaimLeft) );

            addClaimLeft.on( 'mouseleave',
                    function( addClaimLeft,reasonShape,deleteButton,textArea,complexText ) { return function(canvas) {    // Show delete button on entering claim
                        addClaimLeft.setAttr("opacity", 0);
                        layer.draw();
                    }; }(addClaimLeft) );

            // A hit region for expanding a reason on the right edge with another claim.
            var addClaimRight = new Kinetic.Shape({
                name : 'addClaimRight',
                id : myId,
                stroke : 'black',
                strokeWidth : 2,
                drawFunc : function(canvas) {
                    var context = canvas.getContext();
                    var x = reason.x;
                    var y = reason.y;
                    var w = reason.width();
                    var h = reason.height();

                    context.beginPath();
                    context.moveTo(x + w - o/3, y + h*1/2 );
                    context.lineTo(x + w - o*2/3, y + h*1/3 );
                    context.lineTo(x + w - o*2/3, y + h*2/3 );
                    context.closePath();

                    this.setFill('white');

                    canvas.fillStroke(this);
                },
                drawHitFunc : function(canvas) {
                    var context = canvas.getContext();
                    var x = reason.x;
                    var y = reason.y;
                    var w = reason.width();
                    var h = reason.height();

                    context.beginPath();
                    context.moveTo(x + w - o, y + h*1/3 );
                    context.lineTo(x + w, y + h*1/3 );
                    context.lineTo(x + w, y + h*2/3 );
                    context.lineTo(x + w - o, y + h*2/3 );
                    context.closePath();

                    canvas.fillStroke(this);
                },
                opacity : 0
            });

            addClaimRight.on( 'mouseenter',
                    function( addClaimRight ) { return function(canvas) {    // Show delete button on entering claim
                        addClaimRight.setAttr("opacity", 0.5);
                        addClaimRight.draw();
                    }; }(addClaimRight) );

            addClaimRight.on( 'mouseleave',
                    function( addClaimRight ) { return function(canvas) {    // Show delete button on entering claim
                        addClaimRight.setAttr("opacity", 0);
                        layer.draw();
                    }; }(addClaimRight) );

            reason.ribbon = connector;
            reason.addClaimLeft = addClaimLeft;
            reason.addClaimRight = addClaimRight;
		}

        reason.reasonShape = reasonShape;
        reason.deleteButton = deleteButton;

        // This is a graphical area lying behind the text of a claim.  It is clickable,
        // and will present an editable textbox when clicked.  There will be one text
        // area for each claim in the reason.
        for( var i = 0, leni = reason.claims.length; i < leni; i++ ) {
            claim = reason.claims[i];

            claimTextArea[i] = new Kinetic.Shape({
                id : claim.id,
                // Here we do something unusual.  We define a function (containing another
                // function declaration) and immediately invoke it.  This is so that the
                // the drawFunc function that gets created is bound to the value of claim
                // that existed when the variable was defined and not to some later value.
                drawFunc : function( claim ) { return function(canvas) {   // Draw the text area and fill it with white
                    var context = canvas.getContext();
                    var x = claim.x();
                    var y = claim.y();
                    var w = claim.width;
                    var h = claim.height;

                    context.beginPath();
                    context.moveTo(x + r/2, y);
                    context.arcTo(x + w, y, x + w, y + r/2, r/2);
                    context.arcTo(x + w, y + h, x + w - r/2, y + h, r/2);
                    context.arcTo(x, y + h, x, y + h - r/2, r/2);
                    context.arcTo(x, y, x + r/2, y, r/2);
                    context.closePath();

                    this.setFill('white');
                    
                    // All claims are outlined in black, except the main contention (which
                    // doesn't need it because of it's dark blue frame).
                    if (reasonList.reasons[myId].type !== "contention") {
                        this.setStroke('black');
                        this.setStrokeWidth(2);
                    } else {
                        this.setStroke("white");
                    }
                    canvas.fillStroke(this);
                }; }(claim),
                stroke : 'black',
                strokeWidth : 2,
                name : 'claimTextArea',
                // Another case of defining a function and immediately invoking.
                drawHitFunc : function( claim ) { return function(canvas) {    // Draws the clickable region for this text area
                    var context = canvas.getContext();
                    var x = claim.x();
                    var y = claim.y();
                    var w = claim.width;
                    var h = claim.height;

                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x + w, y );
                    context.lineTo(x + w, y + h );
                    context.lineTo(x, y + h );
                    context.lineTo(x, y );
                    context.closePath();
                    canvas.fillStroke(this);
                }; }(claim),
                opacity : 1
            });

            // Draws the text on top of our claimTextArea.
            complexText[i] = new Kinetic.Text({
                id : claim.id,
                name : "complexText",
                x : claim.x(),
                y : claim.y(),
                width : claim.width,
                text : claim.text,

                fontSize : 18,
                fontFamily : 'Calibri',
                fill : '#555',
                padding : 20,
                align : 'left',
                opacity : 1
            });

            // Except on the main contention we want delete and move buttons on each claim
            if( reason.type !== 'contention' ) {
                // Draws the <-> button in the corner of a claim to move it.
                claimMoveButton[i] = new Kinetic.Shape({
                    id : claim.id,
                    name : "claimMoveButton",
                    drawFunc : function( claim ) { return function(canvas) {   // Draw the delete button
                        var context = canvas.getContext();
                        var x = claim.x() + claim.width - 2;
                        var y = claim.y() + 12;

                        context.beginPath();
                        context.moveTo(x,y);
                        context.lineTo(x-10,y+10);
                        context.lineTo(x-10,y+4);
                        context.lineTo(x-20,y+4);
                        context.lineTo(x-20,y+10);
                        context.lineTo(x-30,y);
                        context.lineTo(x-20,y-10);
                        context.lineTo(x-20,y-4);
                        context.lineTo(x-10,y-4);
                        context.lineTo(x-10,y-10);
                        context.closePath();

                        this.setFill( 'blue' );
                        canvas.fill(this);
                    }; }(claim),
                    drawHitFunc : function( claim ) { return function(canvas) {    // Draws the clickable region for this text area
                        var context = canvas.getContext();
                        var x = claim.x() + claim.width - 2;
                        var y = claim.y() + 12;

                        context.beginPath();
                        context.moveTo(x,y);
                        context.lineTo(x-10,y+10);
                        context.lineTo(x-20,y+10);
                        context.lineTo(x-30,y);
                        context.lineTo(x-20,y-10);
                        context.lineTo(x-10,y-10);
                        context.closePath();

                        canvas.fill( this );
                    }; }(claim),
                    opacity : 0
                });

                // Draws the [x] button in the corner of a claim to delete it.
                claimDeleteButton[i] = new Kinetic.Shape({
                    id : claim.id,
                    name : "claimDeleteButton",
                    drawFunc : function( claim ) { return function(canvas) {   // Draw the delete button
                        var context = canvas.getContext();
                        var x = claim.x() + 12;
                        var y = claim.y() + 12;
                        var r = 10;

                        context.beginPath();
                        context.moveTo(x-r,y);
                        context.arcTo(x-r,y-r, x,y-r, r );
                        context.arcTo(x+r,y-r, x+r,y, r );
                        context.arcTo(x+r,y+r, x,y+r, r );
                        context.arcTo(x-r,y+r, x-r,y, r );
                        context.closePath();

                        this.setFill( 'red' );
                        canvas.fill(this);

                        this.setStroke( 'white' );

                        context.moveTo( x-r/2, y-r/2 );
                        context.lineTo( x+r/2, y+r/2 );

                        context.moveTo( x+r/2, y-r/2 );
                        context.lineTo( x-r/2, y+r/2 );

                        canvas.stroke(this);

                    }; }(claim),
                    drawHitFunc : function( claim ) { return function(canvas) {    // Draws the clickable region for this text area
                        var context = canvas.getContext();
                        var x = claim.x() + 12;
                        var y = claim.y() + 12;
                        var r = 10;

                        context.beginPath();
                        context.moveTo(x-r,y);
                        context.arcTo(x-r,y-r, x,y-r, r );
                        context.arcTo(x+r,y-r, x+r,y, r );
                        context.arcTo(x+r,y+r, x,y+r, r );
                        context.arcTo(x-r,y+r, x-r,y, r );
                        context.closePath();

                        canvas.fillStroke( this );
                    }; }(claim),
                    opacity : 0
                });
                // The claimDeleteButton and claimMoveButton only appear when your mouse enters a claim (either
                // the background area or the text or the delete button itself).  They disappear
                // when you leave the area.
                claimDeleteButton[i].on( 'mouseenter',
                        function( deleteButton,moveButton,textarea,complextext ) { return function(canvas) {    // Show delete button on entering claim
                            textarea.draw();
                            complextext.draw();
                            deleteButton.setAttr("opacity", 1);
                            deleteButton.draw();
                            moveButton.setAttr("opacity", 0.2);
                            moveButton.draw();
                        }; }(claimDeleteButton[i],claimMoveButton[i], claimTextArea[i], complexText[i]) );
                claimDeleteButton[i].on( 'mouseleave',
                        function( deleteButton, moveButton,textarea,complextext ) { return function(canvas) {    // Show delete button on entering claim
                            deleteButton.setAttr("opacity", 0);
                            moveButton.setAttr("opacity", 0);
                            textarea.draw();
                            complextext.draw();
                            deleteButton.draw();
                            moveButton.draw();
                        }; }(claimDeleteButton[i], claimMoveButton[i], claimTextArea[i], complexText[i]) );
                claimMoveButton[i].on( 'mouseenter',
                        function( deleteButton, moveButton ) { return function(canvas) {    // Show delete button on entering claim
                            moveButton.setAttr("opacity", 1);
                            deleteButton.setAttr("opacity", 0.2);
                            moveButton.draw();
                            deleteButton.draw();
                        }; }(claimDeleteButton[i],claimMoveButton[i]) );
                claimMoveButton[i].on( 'mouseleave',
                        function( deleteButton,moveButton,textarea,complextext ) { return function(canvas) {    // Show delete button on entering claim
                            deleteButton.setAttr("opacity", 0);
                            moveButton.setAttr("opacity", 0);
                            textarea.draw();
                            complextext.draw();
                            deleteButton.draw();
                            moveButton.draw();
                        }; }(claimDeleteButton[i], claimMoveButton[i], claimTextArea[i], complexText[i]) );
                complexText[i].on( 'mouseenter',
                        function( deleteButton, moveButton, textarea, complextext ) { return function(canvas) {    // Show delete button on entering claim
                            deleteButton.setAttr("opacity", 0.2);
                            moveButton.setAttr("opacity", 0.2);
                            textarea.draw();
                            complextext.draw();
                            deleteButton.draw();
                            moveButton.draw();
                        }; }(claimDeleteButton[i], claimMoveButton[i], claimTextArea[i], complexText[i]) );
                complexText[i].on( 'mouseleave',
                        function( deleteButton, moveButton,textarea,complextext ) { return function(canvas) {    // Show delete button on entering claim
                            deleteButton.setAttr("opacity", 0);
                            moveButton.setAttr("opacity", 0);
                            textarea.draw();
                            complextext.draw();
                            deleteButton.draw();
                            moveButton.draw();
                        }; }(claimDeleteButton[i], claimMoveButton[i], claimTextArea[i], complexText[i]) );
                claimTextArea[i].on( 'mouseenter',
                        function( deleteButton, moveButton,textarea,complextext ) { return function(canvas) {    // Show delete button on entering claim
                            deleteButton.setAttr("opacity", 0.2);
                            moveButton.setAttr("opacity", 0.2);
                            textarea.draw();
                            complextext.draw();
                            deleteButton.draw();
                            moveButton.draw();
                        }; }(claimDeleteButton[i], claimMoveButton[i], claimTextArea[i], complexText[i]) );
                claimTextArea[i].on( 'mouseleave',
                        function( deleteButton,moveButton,textarea,complextext ) { return function(canvas) {    // Show delete button on entering claim
                            deleteButton.setAttr("opacity", 0);
                            moveButton.setAttr("opacity", 0);
                            textarea.draw();
                            complextext.draw();
                            deleteButton.draw();
                            moveButton.draw();
                        }; }(claimDeleteButton[i], claimMoveButton[i], claimTextArea[i], complexText[i]) );
            }

            // Draws a green support button on the left bottom corner of a Claim.
            // Also creates a custom hit region of the same shape.
            supportButton[i] = new Kinetic.Shape({
                id : claim.id,
                // Another case of defining a function and immediately invoking.
                drawFunc : function( claim ) { return function(canvas) {   // Draw the text area and fill it with white
                    var context = canvas.getContext();
                    var x = claim.x();
                    var y = claim.y();
                    var w = claim.width;
                    var h = claim.height;

                    context.beginPath();
                    context.moveTo(x - r/2, y + h - r/2);
                    context.bezierCurveTo(x - r/2, y + h + o, x + w/2, y + h - r/2, x + w/2, y + h + o);
                    context.arcTo(x - r/2, y + h + o, x - r/2, y + h - r/2, r);
                    context.closePath();

                    this.setFill('green');
                    canvas.fillStroke(this);
                }; }(claim),
                stroke : 'black',
                strokeWidth : 2,
                name : 'supportButton',
                opacity : 1
            });

            // Draws a red/orange refute/rebut button on the right bottom corner of a Claim.
            // Also creates a custom hit region of the same shape.
            refuteButton[i] = new Kinetic.Shape({
                id : claim.id,
                // Another case of defining a function and immediately invoking.
                drawFunc : function( claim ) { return function(canvas) {   // Draw the text area and fill it with white
                    var context = canvas.getContext();
                    var x = claim.x();
                    var y = claim.y();
                    var w = claim.width;
                    var h = claim.height;

                    context.beginPath();
                    context.moveTo(x + w + r/2, y + h - r/2);
                    context.bezierCurveTo(x + w + r/2, y + h + o, x + w/2, y + h - r/2, x + w/2, y + h + o);
                    context.arcTo(x + w + r/2, y + h + o, x + w + r/2, y + h - r/2, r);
                    context.closePath();

                    if (claim.reason.type !== "refute") {
                        this.setFill('red');    // for objection
                    } else {
                        this.setFill('orange'); // for rebuttal
                    }
                    canvas.fillStroke(this);
                }; }(claim),
                stroke : 'black',
                strokeWidth : 2,
                name : 'refuteButton',
                opacity : 1
            });

            // Remember these in our claim object so we can update them later.
            claim.textArea = claimTextArea[i];
            claim.complexText = complexText[i];
            claim.deleteButton = claimDeleteButton[i];
            claim.moveButton = claimMoveButton[i];
            claim.supportButton = supportButton[i];
            claim.refuteButton = refuteButton[i];
        }


		var group = new Kinetic.Group({id:myId});
		group.add(reasonShape);

		if (reason.type !== "contention") {
			group.add(connector);
            group.add(addClaimLeft);
            group.add(addClaimRight);
		}

        for( var i=0, leni=claimTextArea.length; i < leni; i++ ) {
            group.add(claimTextArea[i]);
            group.add(complexText[i]);
            if (reason.type !== "contention") {
                group.add(claimDeleteButton[i]);
                group.add(claimMoveButton[i]);
            }
            group.add(supportButton[i]);
            group.add(refuteButton[i]);
        }

		group.add(deleteButton);
		//group.add(claimAddLeft);
		//group.add(claimAddRight);
		//group.add(claimAddBottom);
		layer.add(group);
		layer.draw();

        // Update the export image button
        imageBtn = document.getElementById("toImage");
        imageBtn.href = layer.getCanvas().toDataURL();
	}
};
