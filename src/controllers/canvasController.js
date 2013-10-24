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

    // Create an editable text area, so we can change the content of a claim.
	makeTextArea : function(myId) {
        var claim = claimList.claims[myId];

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
        var anchor;
        var oldAnchorX, oldOffsetX;

        if( !leftRight ) {  // add to left
            // Because claim x-values are dynamic, when we add to the left, we have
            // to fix the offset by hand to make the tree "hold still" right.
            // Painfully clunky, but I couldn't think of a better approach.
            oldAnchorX = reason.claims[0].x();
            oldOffsetX = stage.getOffsetX();

            reason.claims.unshift( claim );
        } else {            // add to right
            reason.claims.push( claim );
            anchor = reason.claims[0];
        }

        // Remove all drawn objects from the KineticJS layer
        layer.removeChildren();

        // Layout the tree because things will move
        amTree.buchheim(reasonList.reasons[0], anchor );

        // Manual correction of the offset when adding to the left.
        if( typeof( oldAnchorX ) !== 'undefined' ) {
            stage.setOffsetX( oldOffsetX + reason.claims[1].x() - oldAnchorX );
        }

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
	addReason : function(type, father) {
		var reason = reasonList.newReason(type, father);
        var claim = reason.claims[0];

        // Layout the tree again and draw this reason
		amTree.buchheim(reasonList.reasons[0], father);
		canvasController.drawReason(reason.id);

        // Create a new Undo item for the current tree state.
        undoList.createUndo();

        // Activate the editable text area for immediate editing
		document.getElementById("myTextArea").innerHTML = canvasController.makeTextArea(claim.id);
		document.getElementsByName('working')[0].focus();
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
    // Remove a Reason and its Claims and the children of all the Claims recursively,
    // and draws the new argument map.
	removeReasonAndDraw : function(id){
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

            // Layout the tree to show the new structure anchoring on father Reason
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
			drawHitFunc : function(canvas) {    // Draws hit region for the Reason
				var context = canvas.getContext();
				var x = reason.x;
				var y = reason.y;
				var w = reason.width();

                // Clickable region in the top center of the reason.
                // Hit this for reparenting.
				context.beginPath();
				context.moveTo(x + (w / 2) - (2 * o), y);
				context.lineTo(x + (w / 2) + (2 * o), y);
				context.lineTo(x + (w / 2) + (2 * o), y + o);
				context.lineTo(x + (w / 2) - (2 * o), y + o);
				context.lineTo(x + (w / 2) - (2 * o), y);
				context.closePath();
				canvas.fillStroke(this);
			},
			opacity : 1
		});

        // This is a graphical area containing the text of a claim.  It is clickable,
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
                    if (reasonList.reasons[myId].type !== "contention") { // FIXME: why is this here?
                        this.setFill('white');
                        this.setStroke('black');
                        this.setStrokeWidth(2);
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
            // Remember this in our claim object so we can update it later.
            claim.complexText = complexText[i];

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
                // Another case of defining a function and immediately invoking.
                drawHitFunc : function( claim ) { return function(canvas) {    // Draws the clickable region for this text area
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

                    canvas.fillStroke(this);
                }; }(claim),
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
                // Another case of defining a function and immediately invoking.
                drawHitFunc : function( claim ) { return function(canvas) {    // Draws the clickable region for this text area
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

                    canvas.fillStroke(this);
                }; }(claim),
                opacity : 1
            });
        }

// -- Draws a region to add something to the left, right, or bottom of a Reason
//		var claimAddLeft = new Kinetic.Shape({
//			//id : myId,
//			name : "claimAddLeft",
//			drawFunc : function(canvas) {
//				var context = canvas.getContext();
//				var x = reasonList.reasons[myId].x;
//				var y = reasonList.reasons[myId].y + (amCanvas.gridY / 8);
//				var w = amCanvas.gridX / 4;
//				var h = amCanvas.gridY / 4 * 3;
//				context.beginPath();
//				context.moveTo(x - o, y);
//				context.arcTo(x - w, y, x - w, y + r, r);
//				context.arcTo(x - w, y + h, x - w + r, y + h, r);
//				context.arcTo(x, y + h, x, y + h - r, r);
//				context.arcTo(x, y, x - o, y, r);
//				context.closePath();
//				context.moveTo(x - w / 2, y + h / 10 * 4);
//				context.lineTo(x - w / 2, y + h / 10 * 6);
//				context.moveTo(x - w / 3, y + h / 2);
//				context.lineTo(x - w / 3 * 2, y + h / 2);
//				this.setFill('yellow');
//				canvas.fillStroke(this);
//			},
//			stroke : 'black',
//			strokeWidth : 5,
//			drawHitFunc : function(canvas) {
//				var context = canvas.getContext();
//				var x = reasonList.reasons[myId];
//				var y = reasonList.reasons[myId].y + (amCanvas.gridY / 8);
//				var w = amCanvas.gridX / 4;
//				var h = amCanvas.gridY / 4 * 3;
//				context.beginPath();
//				context.moveTo(x - o, y);
//				context.arcTo(x - w, y, x - w, y + r, r);
//				context.arcTo(x - w, y + h, x - w + r, y + h, r);
//				context.arcTo(x, y + h, x, y + h - r, r);
//				context.arcTo(x, y, x - o, y, r);
//				context.closePath();
//				canvas.fillStroke(this);
//			},
//			opacity : 0
//		});
//		var claimAddRight = new Kinetic.Shape({
//			//id : myId,
//			name : "claimAddRight",
//			drawFunc : function(canvas) {
//				var context = canvas.getContext();
//				var x = reasonList.reasons[myId].x;		// This might be a FIXME.
//				var y = reasonList.reasons[myId].y + (amCanvas.gridY / 8);
//				var w = amCanvas.gridX / 4;
//				var h = (amCanvas.gridY / 4) * 3;
//				context.beginPath();
//				context.moveTo(x + r, y);
//				context.arcTo(x + w, y, x + w, y + r, r);
//				context.arcTo(x + w, y + h, x + w - r, y + h, r);
//				context.arcTo(x, y + h, x, y + h - r, r);
//				context.arcTo(x, y, x+r, y, r);
//				context.closePath();
//				context.moveTo(x + w / 2, y + h / 10 * 4);
//				context.lineTo(x + w / 2, y + h / 10 * 6);
//				context.moveTo(x + w / 3, y + h / 2);
//				context.lineTo(x + w / 3 * 2, y + h / 2);
//				this.setFill('yellow');
//				canvas.fillStroke(this);
//			},
//			stroke : 'black',
//			strokeWidth : 5,
//			drawHitFunc : function(canvas) {
//				var context = canvas.getContext();
//				var x = amCanvas.gridX + reasonList.reasons[myId].x;	// Might be a FIXME
//				var y = reasonList.reasons[myId].y + (amCanvas.gridY / 8);
//				var w = amCanvas.gridX / 4;
//				var h = (amCanvas.gridY / 4) * 3;
//				context.beginPath();
//				context.moveTo(x + r, y);
//				context.arcTo(x + w, y, x + w, y + r, r);
//				context.arcTo(x + w, y + h, x + w - r, y + h, r);
//				context.arcTo(x, y + h, x, y + h - r, r);
//				context.arcTo(x, y, x+r, y, r);
//				context.closePath();
//				canvas.fillStroke(this);
//			},
//			opacity : 0
//		});
//		var claimAddBottom = new Kinetic.Shape({
//			//id : myId,
//			name : "claimAddBottom",
//			drawFunc : function(canvas) {
//				var context = canvas.getContext();
//				var x = reasonList.reasons[myId].x;
//				var y = reasonList.reasons[myId].y;
//				var w = amCanvas.gridX;
//				var h = amCanvas.gridY;
//				context.beginPath();
//				context.moveTo(x + (w/6) + r, y + h);
//				context.arcTo(x + (w/6*5), y + h, x + (w/6*5), y + h +r, r);
//				context.arcTo(x + (w/6*5), y + (h/3*4), x + (w/6*5) - r, y + (h/3*4), r);
//				context.arcTo(x + (w/6), y + (h/3*4), x + (w/6), y + (h/3*4) - r, r);
//				context.arcTo(x + (w/6), y + h, x + (w/6) + r, y + h, r);
//				context.closePath();
//				context.moveTo(x + w/2, y + h/12*13);
//				context.lineTo(x + w/2, y + h/12*15);
//				context.moveTo(x + w/24*11, y + h/6*7);
//				context.lineTo(x + w/24*13, y + h/6*7);
//				this.setFill('yellow');
//				canvas.fillStroke(this);
//			},
//			stroke : 'black',
//			strokeWidth : 5,
//			drawHitFunc : function(canvas) {
//				var context = canvas.getContext();
//				var x = reasonList.reasons[myId].x;
//				var y = reasonList.reasons[myId].y;
//				var w = amCanvas.gridX;
//				var h = amCanvas.gridY;
//				context.beginPath();
//				context.moveTo(x + (w/6) + r, y + h);
//				context.arcTo(x + (w/6*5), y + h, x + (w/6*5), y + h +r, r);
//				context.arcTo(x + (w/6*5), y + (h/3*4), x + (w/6*5) - r, y + (h/3*4), r);
//				context.arcTo(x + (w/6), y + (h/3*4), x + (w/6), y + (h/3*4) - r, r);
//				context.arcTo(x + (w/6), y + h, x + (w/6) + r, y + h, r);
//				context.closePath();
//				canvas.fillStroke(this);
//			},
//			opacity : 0
//		});

        // Draws a yellow utility/delete button on the right top corner of a Reason.
        // Also creates a custom hit region of the same shape.
		var deleteButton = new Kinetic.Shape({
			//id : myId,
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
			drawHitFunc : function(canvas) {    // Draw hit region of utility button
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

				canvas.fillStroke(this);
			},
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

                    // Ribbons draw one way when we are to the left of our parent.
//                    context.beginPath();
//                    if (type === "support" && x <= parentX ) {
//                        var firstX = x + (w / 2) + (2 * o);
//                        var firstY = y + 1;
//                        var secondX = parentX + (parentW / 2);
//                        var secondY = parentY + parentH;
//                        var thirdX = parentX - 2;
//                        var thirdY = parentY + parentH - r - o - 5;
//                        var fourthX = x + (w / 2) - (2 * o);
//                        var fourthY = y + 1;
//                        var changeX12 = secondX - firstX;
//                        var changeX34 = thirdX - fourthX;
//                        var changeY12 = firstY - secondY;
//                        var changeY34 = fourthY - thirdY;
//                        var bufferLeft = -20;
//                        var bufferRight = +20;
//                        context.moveTo(firstX, firstY);
//                        context.bezierCurveTo(firstX + ((secondX - firstX) / 2) / changeX12, secondY + ((firstY - secondY) / 2) / changeY12 + bufferRight, secondX - ((secondX - firstX) / 2) / changeX12, firstY - ((firstY - secondY) / 2) / changeY12 + bufferLeft, secondX, secondY);
//                        context.arcTo(parentX, parentY + parentH, thirdX, thirdY, r);
//                        context.bezierCurveTo(thirdX - ((thirdX - fourthX) / 2) / changeX34, fourthY - ((fourthY - thirdY) / 2) / changeY34 + bufferLeft, fourthX + ((thirdX - fourthX) / 2) / changeX34, thirdY + ((fourthY - thirdY) / 2) / changeY34 + bufferRight, fourthX, fourthY);
//                        context.lineTo(firstX, firstY);
//                    } else if (type === "support") {
//                        // They draw another when we are to the right of our parent
//                        var firstX = x + (w / 2) - (2 * o);
//                        var firstY = y + 1;
//                        var secondX = parentX + r;
//                        var secondY = parentY + parentH;
//                        var thirdX = parentX + (parentW / 2);
//                        var thirdY = parentY + parentH;
//                        var fourthX = x + (w / 2) + (2 * o);
//                        var fourthY = y + 1;
//                        var bufferLeft = 20;
//                        var bufferRight = -20;
//                        context.moveTo(firstX, firstY);
//                        context.bezierCurveTo(firstX + bufferRight, secondY + bufferLeft, secondX + bufferRight, firstY + bufferLeft, secondX, secondY);
//                        context.lineTo(thirdX, thirdY);
//                        context.bezierCurveTo(thirdX + 2 * bufferLeft, fourthY + bufferRight, fourthX + bufferLeft, thirdY + bufferRight, fourthX, fourthY);
//                        context.lineTo(firstX, firstY);
//                    } else if ((type === "refute" || type === "rebut") && x >= parentX ) {
//                        // Objects draw one way when to the right
//                        var firstX = x + (w / 2) - (2 * o);
//                        var firstY = y + 1;
//                        var secondX = parentX + (parentW / 2);
//                        var secondY = parentY + parentH;
//                        var thirdX = parentX + parentW + 2;
//                        var thirdY = parentY + parentH - r - o - 5;
//                        var fourthX = x + (w / 2) + (2 * o);
//                        var fourthY = y + 1;
//                        var changeX12 = secondX - firstX;
//                        var changeX34 = thirdX - fourthX;
//                        var changeY12 = firstY - secondY;
//                        var changeY34 = fourthY - thirdY;
//                        var bufferLeft = -20;
//                        var bufferRight = +20;
//                        context.moveTo(firstX, firstY);
//                        context.bezierCurveTo(firstX + ((secondX - firstX) / 2) / changeX12, secondY + ((firstY - secondY) / 2) / changeY12 + bufferRight, secondX - ((secondX - firstX) / 2) / changeX12, firstY - ((firstY - secondY) / 2) / changeY12 + bufferLeft, secondX, secondY);
//                        context.arcTo(parentX + parentW, parentY + parentH, thirdX, thirdY, r);
//                        context.bezierCurveTo(thirdX - ((thirdX - fourthX) / 2) / changeX34, fourthY - ((fourthY - thirdY) / 2) / changeY34 + bufferLeft, fourthX + ((thirdX - fourthX) / 2) / changeX34, thirdY + ((fourthY - thirdY) / 2) / changeY34 + bufferRight, fourthX, fourthY);
//                        context.lineTo(firstX, firstY);
//                    } else {
//                        // And they draw another way when objections are to the left.
//                        var firstX = x + (w / 2) + (2 * o);
//                        var firstY = y + 1;
//                        var secondX = parentX + parentW - r;
//                        var secondY = parentY + parentH;
//                        var thirdX = parentX + (parentW / 2);
//                        var thirdY = parentY + parentH;
//                        var fourthX = x + (w / 2) - (2 * o);
//                        var fourthY = y + 1;
//                        var bufferLeft = -20;
//                        var bufferRight = 20;
//                        context.moveTo(firstX, firstY);
//                        context.bezierCurveTo(firstX + bufferRight, secondY + bufferRight, secondX + bufferRight, firstY + bufferRight, secondX, secondY);
//                        context.lineTo(thirdX, thirdY);
//                        context.bezierCurveTo(thirdX + 2 * bufferLeft, fourthY + bufferLeft, fourthX + bufferLeft, thirdY + bufferLeft, fourthX, fourthY);
//                        context.lineTo(firstX, firstY);
//                    }
//                    context.closePath();
//                    this.setFillLinearGradientStartPoint([parentX, parentY + parentH]);
//                    this.setFillLinearGradientEndPoint([parentX, y]);
//                    if (reasonList.reasons[myId].type === "support") {
//                        this.setFillLinearGradientColorStops([1 / 5, 'green', 4 / 5, '#6CC54F']);
//                    } else if (reasonList.reasons[myId].type === "refute") {
//                        this.setFillLinearGradientColorStops([1 / 5, 'red', 4 / 5, '#E60000']);
//                    } else {
//                        this.setFill('orange');
//                    }
//                    canvas.fillStroke(this);
				},
				name : 'connector',
				drawHitFunc : function(canvas) {    // Draws clickable area just above our Reason
					var context = canvas.getContext();
                    var x = reason.x;
                    var y = reason.y;
                    var w = reason.width();

					context.beginPath();
					context.moveTo(x + (w / 2) - (2 * o), y);
					context.lineTo(x + (w / 2) + (2 * o), y);
					context.lineTo(x + (w / 2) + (2 * o), y - o);
					context.lineTo(x + (w / 2) - (2 * o), y - o);
					context.lineTo(x + (w / 2) - (2 * o), y);
					context.closePath();
					canvas.fillStroke(this);
				},
				opacity : 1
			});

            // A hit region for expanding a reason on the right edge with another claim.
            var addClaimLeft = new Kinetic.Shape({
                name : 'addClaimLeft',
                stroke : 'black',
                strokeWidth : 2,
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
                opacity : 1
            });

            // A hit region for expanding a reason on the right edge with another claim.
            var addClaimRight = new Kinetic.Shape({
                name : 'addClaimRight',
                stroke : 'black',
                strokeWidth : 2,
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
                opacity : 1
            });

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
