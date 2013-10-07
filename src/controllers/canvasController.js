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
		nodeList.nodes=[];
		localStorage.clear();
		layer.removeChildren();
		stage.removeChildren();
		stage.setOffsetX( amCanvas.mainX/2 - amCanvas.centerX );
		stage.setPosition(0);
		stage.setScale(1);
		stage.add(layer);
		nextReasonNumber=0;
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
		stage.setOffset( nodeList.nodes[0].x + nodeList.nodes[0].width()/2 - amCanvas.centerX, 0 );
		stage.draw();

        // Update the export image button
        imageBtn = document.getElementById("toImage");
        imageBtn.href = layer.getCanvas().toDataURL();
	},
    // Create an editable text area, so we can change the content of a claim.
    // When this function is re-written it'll get a claim (not a reason like right now).
	makeTextArea : function(myId) {
		var reason = nodeList.nodes[myId];
        var claim = reason.claims[0];

		var scale = stage.getScale().x;
		var realX = (claim.x() + 7) * scale + stage.getAbsoluteTransform().getTranslation().x;
		var realY = (claim.y() + 7) * scale + stage.getAbsoluteTransform().getTranslation().y;
		document.getElementById('myTextArea').style.left = realX + "px";
		document.getElementById('myTextArea').style.top = realY + "px";
		document.getElementById('myTextArea').style.zIndex = 2;
		return "<textarea style='font-size: " + (16 * scale) + "px; width: " + ((claim.width) * scale) + "px; height: " + (claim.height * scale) + "px;' name='working' id=" + reason.id + " onfocus='this.select();' onblur='canvasController.removeTextArea(" + myId + ")'>" + claim.text + "</textarea>"
	},
    // Get the text out of our editable text area (so it can be set back to a claim)
	extractText : function() {
		return document.getElementsByName('working')[0].value;
	},
    // Set the edited text back to our claim and make the editable text area
    // disappear.  This function will need a rewrite for individual claims.
	removeTextArea : function(myId) {
        // Save the text in our argument map
		var reason = nodeList.nodes[myId];
		reason.setText( canvasController.extractText());
        // Make the editable text area disappear
		document.getElementById('myTextArea').innerHTML = '';
		document.getElementById('myTextArea').style.zIndex = 0;
        // Write the new text into clickable text box
		var thisText = stage.get('.complexText')[myId];
		thisText.setText(nodeList.nodes[myId].text());

        layer.draw();

        // Update the export image button
        imageBtn = document.getElementById("toImage");
        imageBtn.href = layer.getCanvas().toDataURL();
	},
    // Don't really know what this does yet.
	fixText: function(){
		for(node in nodeList.nodes){
			if(stage.get(".complexText")[node]){
				stage.get(".complexText")[node].setX(nodeList.nodes[node].x + 30)
			}
		}
	},
    // Adds a new reason to the argument map as a child of one of the existing claims.
	addReason : function(type, father) {
		var myId = nextReasonNumber;
		nextReasonNumber++;
		nodeList.newNode(myId, type, father);
		amTree.buchheim(nodeList.nodes[0], father);
		canvasController.drawReason(myId);
		document.getElementById("myTextArea").innerHTML = canvasController.makeTextArea(myId);
		document.getElementsByName('working')[0].focus();
	},
    removeReason : function(id) {
        // Recursively remove a Reason and its children from argument map
        var reason = nodeList.nodes[id];
        var children = reason.children();
        for(var i = children.length-1; i >= 0; i--){
            canvasController.removeReason(children[i].id);
        }

        // Now remove us from the father Claim's children list
        var pchildren = reason.father.children;
        pchildren.splice(pchildren.indexOf(reason), 1);

        nodeList.nodes.splice(id, 1);
        nextReasonNumber--;
        for(var i=id, leni=nodeList.nodes.length; i<leni; i++ ) {
            nodeList.nodes[i].id = i;
        }
    },
    // Remove a Reason and its Claims and the children of all the Claims recursively,
    // and draws the new argument map.
	removeReasonAndDraw : function(id){
		if(id===0){
			canvasController.newCanvas();
		}else{
            // Recurse through the (adopted) child Reasons of this one and remove them
			var reason = nodeList.nodes[id];
            var father = reason.father;

            // Remove this Reason and child Reasons from argument map
            canvasController.removeReason(id);

            // Remove all drawn objects from the KineticJS layer
			layer.removeChildren();

            // Layout the tree to show the new structure anchoring on father Reason
			amTree.buchheim(nodeList.nodes[0], father);

            // Redraw each claim (which adds them back to KineticJS layer)
			for(var i=0, leni=nodeList.nodes.length; i<leni; i++ ) {
				canvasController.drawReason(i);
			}
		}
	},
	drawReason : function(myId) {
        var reason = nodeList.nodes[myId];

        // This is the background shape and color of a Reason.  It has a clickable
        // region at the top center for reparenting, and will have Claims layered
        // on top of it (including their support and object buttons).
		var claimShape = new Kinetic.Shape({
			id : myId,
			name : "claim",
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

				if (nodeList.nodes[myId].type === "support") {
					this.setFill('#6CC54F');
				} else if (nodeList.nodes[myId].type === "refute") {
					this.setFill('#E60000');
				} else if (nodeList.nodes[myId].type === "rebut") {
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

// -- Draws a region to add something to the left, right, or bottom of a Reason
//		var claimAddLeft = new Kinetic.Shape({
//			//id : myId,
//			name : "claimAddLeft",
//			drawFunc : function(canvas) {
//				var context = canvas.getContext();
//				var x = nodeList.nodes[myId].x;
//				var y = nodeList.nodes[myId].y + (amCanvas.gridY / 8);
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
//				var x = nodeList.nodes[myId];
//				var y = nodeList.nodes[myId].y + (amCanvas.gridY / 8);
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
//				var x = nodeList.nodes[myId].x;		// This might be a FIXME.
//				var y = nodeList.nodes[myId].y + (amCanvas.gridY / 8);
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
//				var x = amCanvas.gridX + nodeList.nodes[myId].x;	// Might be a FIXME
//				var y = nodeList.nodes[myId].y + (amCanvas.gridY / 8);
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
//				var x = nodeList.nodes[myId].x;
//				var y = nodeList.nodes[myId].y;
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
//				var x = nodeList.nodes[myId].x;
//				var y = nodeList.nodes[myId].y;
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

        // This is a graphical area containing the text of a claim.  It is clickable,
        // and will present an editable textbox when clicked.  FIXME: needs to be
        // updated for multi-claim reasons.
		var claimTextArea = new Kinetic.Shape({
			//id : myId,
			drawFunc : function(canvas) {   // Draw the text area and fill it with text
				var context = canvas.getContext();
				var x = reason.x;
				var y = reason.y;
				var w = reason.width();
				var h = reason.height();

				context.beginPath();
				context.moveTo(x + r + o, y + o);
				context.arcTo(x + w - o, y + o, x + w - o, y + r / 2 + o, r / 2);
				context.arcTo(x + w - o, y + h - o, x + w - r / 2 - o, y + h - o, r / 2);
				context.arcTo(x + o, y + h - o, x + o, y + h - r / 2 - o, r / 2);
				context.arcTo(x + o, y + o, x + r / 2 + o, y + o, r / 2);
				context.closePath();

				this.setFill('white');
				if (nodeList.nodes[myId].type === "contention") { // FIXME: why is this here?
					this.setFill('white');
					this.setStroke('black');
					this.setStrokeWidth(2);
				}
				canvas.fillStroke(this);
			},
			stroke : 'black',
			strokeWidth : 2,
			name : 'claimTextArea',
			drawHitFunc : function(canvas) {    // Draws the clickable region for this text area
				var context = canvas.getContext();
				var x = reason.x;
				var y = reason.y;
				var w = reason.width();
				var h = reason.height();

				context.beginPath();
				context.moveTo(x + r + o, y + o);
				context.arcTo(x + w - o, y + o, x + w - o, y + r / 2 + o, r / 2);
				context.arcTo(x + w - o, y + h - o, x + w - r / 2 - o, y + h - o, r / 2);
				context.arcTo(x + o, y + h - o, x + o, y + h - r / 2 - o, r / 2);
				context.arcTo(x + o, y + o, x + r / 2 + o, y + o, r / 2);
				context.closePath();
				canvas.fillStroke(this);
			},
			opacity : 1
		});

        // Draws a green support button on the left bottom corner of a Reason.
        // Also creates a custom hit region of the same shape.
        // FIXME: should draw under each Claim
		var supportButton = new Kinetic.Shape({
			//id : myId,
			drawFunc : function(canvas) {   // Draw background of support button
				var context = canvas.getContext();
				var x = reason.x;
				var y = reason.y;
				var w = reason.width();
				var h = reason.height();

				context.beginPath();
				context.moveTo(x, y + h - o - r);
				context.bezierCurveTo(x, y + h, x + w / 2, y + h - o - r, x + w / 2, y + h);
				context.arcTo(x, y + h, x, y + h - o - r, r);
				context.closePath();

				this.setFill('green');
				canvas.fillStroke(this);
			},
			stroke : 'black',
			strokeWidth : 2,
			name : 'supportButton',
			drawHitFunc : function(canvas) {    // Draw hit region of support button
				var context = canvas.getContext();
				var x = reason.x;
				var y = reason.y;
				var w = reason.width();
				var h = reason.height();

				context.beginPath();
				context.moveTo(x, y + h - o - r);
				context.bezierCurveTo(x, y + h, x + w / 2, y + h - o - r, x + w / 2, y + h);
				context.arcTo(x, y + h, x, y + h - o - r, r);
				context.closePath();

				canvas.fillStroke(this);
			},
			opacity : 1
		});

        // Draws a green support button on the right bottom corner of a Reason.
        // Also creates a custom hit region of the same shape.
        // FIXME: should draw under each Claim
		var refuteButton = new Kinetic.Shape({
			//id : myId,
			drawFunc : function(canvas) {   // Draw background of refute button
				var context = canvas.getContext();
				var x = reason.x;
				var y = reason.y;
				var w = reason.width();
				var h = reason.height();

				context.beginPath();
				context.moveTo(x + w, y + h - o - r);
				context.bezierCurveTo(x + w, y + h, x + w / 2, y + h - o - r, x + w / 2, y + h);
				context.arcTo(x + w, y + h, x + w, y + h - o - r, r);
				context.closePath();

				if (nodeList.nodes[myId].type !== "refute") {
					this.setFill('red');    // for objection
				} else {
					this.setFill('orange'); // for rebuttal
				}
				canvas.fillStroke(this);
			},
			stroke : 'black',
			strokeWidth : 2,
			name : 'refuteButton',
			drawHitFunc : function(canvas) {    // Draw hit region of refute button
				var context = canvas.getContext();
				var x = reason.x;
				var y = reason.y;
				var w = reason.width();
				var h = reason.height();

				context.beginPath();
				context.moveTo(x + w, y + h - o - r);
				context.bezierCurveTo(x + w, y + h, x + w / 2, y + h - o - r, x + w / 2, y + h);
				context.arcTo(x + w, y + h, x + w, y + h - o - r, r);
				context.closePath();

				canvas.fillStroke(this);
			},
			opacity : 1

		});

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

        // Draws the text on top of our claimTextArea.  FIXME: needs to be updated
        // for multiclaim reasons.
		var complexText = new Kinetic.Text({
			//id : myId,
			name : "complexText",
			x : reason.x + o,
			y : reason.y + o,
			width : reason.width() - 2*o,
			text : reason.text(),

			fontSize : 18,
			fontFamily : 'Calibri',
			fill : '#555',
			padding : 20,
			align : 'left',
			opacity : 1
		});

        // If we aren't a contention then we need to draw a
        // support/refute/rebut ribbon from us to our parent Claim.
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

                    var endLeftY, endRightY;
                    endLeftY = parentY + parentH + o;       // End at the reason's edge
                    endRightY = parentY + parentH + o;      // End at the reason's edge

                    // End values depend on whether this is a support or refut/rebut
                    if(type === "support" ) {
                        endLeftX = parentX;                 // End at left edge
                        endRightX = parentX + parentW/2;    // End at middle
                    } else {
                        endLeftX = parentX + parentW/2;     // End at middle
                        endRightX = parentX + parentW;      // End at right edge
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
                    context.lineTo(endRightX,endRightY);
                    context.bezierCurveTo(endRightX,rightCtrlY2,startRightX,rightCtrlY1,startRightX, startY );
                    context.closePath();

                    this.setFillLinearGradientStartPoint([endLeftX, endLeftY]);
                    this.setFillLinearGradientEndPoint([endLeftX, startY] );
                    if (nodeList.nodes[myId].type === "support") {
                        this.setFillLinearGradientColorStops([1 / 5, 'green', 4 / 5, '#6CC54F']);
                    } else if (nodeList.nodes[myId].type === "refute") {
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
//                    if (nodeList.nodes[myId].type === "support") {
//                        this.setFillLinearGradientColorStops([1 / 5, 'green', 4 / 5, '#6CC54F']);
//                    } else if (nodeList.nodes[myId].type === "refute") {
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
		}

		var group = new Kinetic.Group({id:myId});
		group.add(claimShape);
		group.add(claimTextArea);
		group.add(supportButton);
		group.add(refuteButton);
		group.add(deleteButton);
		group.add(complexText);
		//group.add(claimAddLeft);
		//group.add(claimAddRight);
		//group.add(claimAddBottom);
		if (reason.type !== "contention") {
			group.add(connector);
		}
		layer.add(group);
		layer.draw();

        // Update the export image button
        imageBtn = document.getElementById("toImage");
        imageBtn.href = layer.getCanvas().toDataURL();
	}
};
