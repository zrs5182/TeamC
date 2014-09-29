// vim: set tabstop=4 expandtab : //

// var container = document.getElementById("container");
//document.getElementById("menuArea").left = window.innerWidth - 50;

var stage = new Kinetic.Stage({
	container : "container",
	width : screen.width,
	height : screen.height,
	getWidth : function() {
		return this.width;
	},
	getHeight : function() {
		return this.height;
	},
	draggable : true
});

var layer = new Kinetic.Layer();

canvasController.newCanvas();

var moveClaimStarted = 0;
var dragging = 0;
var selected = null;

var dragPos = { x:0, y:0 };
stage.on('dragstart', function() {
    // Remember the starting position of this drag.  Short drags are really clicks.
    dragPos.x = stage.getPosition().x;
    dragPos.y = stage.getPosition().y;
    // layer.setListening(0);
});

stage.on('dragmove', function() {
    // If we've dragged far enough, then disable click events.  This really is a
    // drag and not just a nudge that came with a click by accident.
    var x = stage.getPosition().x;
    var y = stage.getPosition().y;
    if( Math.abs( dragPos.x - x ) > 3 || Math.abs( dragPos.y - y ) > 3 ) { 
        layer.setListening(0);
        layer.drawHit();
    }
});


stage.on('dragend', function() {
        layer.setListening(1);
        layer.draw();

        // Update the export image button
        imageBtn = document.getElementById("toImage");
        imageBtn.href = layer.getCanvas().toDataURL();
      });

layer.on('click', function(event) {
	if(moveClaimStarted===0){
		var node = event.targetNode;
		var myName = node.attrs.name;

		var myId = node.getParent().getId();        // Unique ID of the reason this click goes to
        var reason = reasonList.reasons[myId];      // (which is recorded in the group).

        var myId2 = node.getId();                   // Unique ID of the claim this click goes to if applicable
		var myType = reason.type;

		if (myName === "complexText" || myName === "claimTextArea") {
			var div = document.getElementById('myTextArea');
			div.innerHTML = canvasController.makeTextArea(myId2);
			document.getElementsByName('working')[0].focus();
		} else if (myName === "supportButton") {
			canvasController.addReason("support", claimList.claims[myId2]);
		} else if (myName === "refuteButton") {
			if (myType === "refute") {
				canvasController.addReason("rebut", claimList.claims[myId2]);
			} else {
				canvasController.addReason("refute", claimList.claims[myId2]);
			}
		} else if (myName === "claimDeleteButton") {
            claimId = node.attrs.id;
			canvasController.removeClaimAndDraw(claimId);
		} else if (myName === "claimMoveButton") {
            moveClaimStarted = 1;
            claimId = node.attrs.id;
			canvasController.startMovingClaim(claimId);
		} else if (myName === "deleteButton") {
			canvasController.removeReasonAndDraw(myId);
		} else if (myName === "addClaimLeft" ) {
            canvasController.addClaimToReason( myId, 0 );
		} else if (myName === "addClaimRight" ) {
            canvasController.addClaimToReason( myId, 1 );
        }
	}else{
        moveClaimStarted = 0;

        // We're going to drop the claim in a new place
		var node = event.targetNode;
		var myName = node.attrs.name;
        var claimId, reasonId;
        var claim, reason;

        // Check first if this is a disallowed target, so we can
        // abort the move.  All of these are parts of a Reason.
        if( myName==="reason" || myName=="deleteButton" || myName==="addClaimLeft" || myName==="addClaimRight" ) {
            reasonId = node.attrs.id;
            reason = reasonList.reasons[ reasonId ];

            if( reason.disallowedTarget ) {
                canvasController.moveClaimAbort();
                return;
            }
        }

        // We do a similar check for all of the objects associated
        // to a Claim.
        if( myName==="claimTextArea" || myName=="complexText" || myName==="claimDeleteButton" || myName==="claimMoveButton" ) {
            claimId = node.attrs.id;
            claim = claimList.claims[ claimId ];

            if( claim.disallowedTarget ) {
                canvasController.moveClaimAbort();
                return;
            }
        }

        // And finally, we check the Support and Refute buttons
        if( myName==="supportButton" || myName==="refuteButton" ) {
            claimId = node.attrs.id;
            claim = claimList.claims[ claimId ];

            var button;
            if( myName=="supportButton" ) {
                button = claim.supportButton;
            } else {
                button = claim.refuteButton;
            }

            if( button.disallowedTarget ) {
                canvasController.moveClaimAbort();
                return;
            }
        }


        // At this point, we should have a valid target, or we clicked
        // on something not associated to a Claim or Reason (like a ribbon).
        // We should complete the move and redraw the canvas.
        if (myName === "reason" ) {
            reasonId = node.attrs.id;
            reason = reasonList.reasons[reasonId];

            var ptr = stage.getPointerPosition();
            var pos = stage.getPosition();
            var offset = stage.getOffset();
            var scale = stage.getScale();

            // The mouse position relative to this Reason
            var mouseX = (ptr.x - pos.x)/scale.x + offset.x - reason.x;

            // The item number where we should insert our Claim
            var itemOrigin = amCanvas.border - amCanvas.claimXPad/2.0;
            var itemWidth = amCanvas.claimX + amCanvas.claimXPad;
            var itemNumber = Math.round(( mouseX - itemOrigin)/itemWidth);

            canvasController.moveClaimToDestinationAndDraw( reason, itemNumber );
		} else if (myName === "addClaimLeft" ) {
            reasonId = node.attrs.id;
            reason = reasonList.reasons[reasonId];

            canvasController.moveClaimToDestinationAndDraw( reason, 0 );
		} else if (myName === "addClaimRight" || myName === "deleteButton" ) {
            reasonId = node.attrs.id;
            reason = reasonList.reasons[reasonId];

            canvasController.moveClaimToDestinationAndDraw( reason, reason.claims.length );
        } else if (myName === "complexText" || myName === "claimTextArea") {
            var claimId = node.attrs.id;
            var claim = claimList.claims[claimId];
            var reason = claim.reason;
            var itemNumber = reason.claims.indexOf( claim );

            var ptr = stage.getPointerPosition();
            var pos = stage.getPosition();
            var offset = stage.getOffset();
            var scale = stage.getScale();

            // The mouse position relative to this Reason
            var mouseX = (ptr.x - pos.x)/scale.x + offset.x - claim.x();

            itemNumber = itemNumber + Math.round( mouseX / claim.width );

            canvasController.moveClaimToDestinationAndDraw( reason, itemNumber );
		} else if (myName === "claimDeleteButton") {
            var claimId = node.attrs.id;
            var claim = claimList.claims[claimId];
            var reason = claim.reason;
            var itemNumber = reason.claims.indexOf( claim );

            canvasController.moveClaimToDestinationAndDraw( reason, itemNumber );
		} else if (myName === "claimMoveButton") {
            var claimId = node.attrs.id;
            var claim = claimList.claims[claimId];
            var reason = claim.reason;
            var itemNumber = reason.claims.indexOf( claim ) + 1;

            canvasController.moveClaimToDestinationAndDraw( reason, itemNumber );
		} else if (myName === "supportButton") {
            canvasController.moveClaimToNewSupportAndDraw( claimId );
		} else if (myName === "refuteButton") {
            canvasController.moveClaimToNewRefutationAndDraw( claimId );
        } else {
            // We clicked a ribbon or something else.
            canvasController.moveClaimAbort();
        }
    }
});


window.onload = function() {
	if (window.addEventListener) //adding the event listener for Mozilla
		document.addEventListener('DOMMouseScroll', zoom, false);
	document.onmousewheel = zoom; //for IE/OPERA etc
}

var mousePos = {x:0,y:0};
window.addEventListener('mousemove', function(event) {
    // Update the mouse position if we can (i.e. when not in a textbox)
    if( typeof( stage.getPointerPosition()) === 'undefined' ) {
        return;
    }
	mousePos.x = (stage.getPointerPosition().x-stage.getPosition().x)/stage.getScale().x;
	mousePos.y = (stage.getPointerPosition().y-stage.getPosition().y)/stage.getScale().y;
  }, false);

window.addEventListener('drag', function() {
	if (document.getElementsByName("working")[0]) {
		document.getElementsByName("working")[0].blur();
	}
  }, false);

var oldMousePos = {x:0,y:0};
function zoom(event) {
	var delta = 0;
	if (!event)
		event = window.event; // normalize the delta
	if (event.wheelDelta) {
		delta = event.wheelDelta; // IE and Opera
	} else if (event.detail) {
		delta = -event.detail; // W3C
	}
	var zoomAmount; //= delta * 0.05;
	if(delta>0){
		zoomAmount=.15;
	}else{
		zoomAmount=-.15;
	}
	var oldScalar = stage.getScale().x;
	var scalar = stage.getScale().x + zoomAmount;
	if (scalar < 0){
		scalar = .1;
	}
	var offset = ((amCanvas.centerX+amCanvas.gridX/2)/scalar) - (amCanvas.centerX+amCanvas.gridX/2);
	stage.setScale(scalar);
	oldMousePos.x = mousePos.x;
	oldMousePos.y = mousePos.y;
	mousePos.x = (mousePos.x*oldScalar/scalar);
	mousePos.y = (mousePos.y*oldScalar/scalar);
	stage.setOffsetX(stage.getOffsetX()-(mousePos.x-oldMousePos.x));
	stage.setOffsetY(stage.getOffsetY()-(mousePos.y-oldMousePos.y));
	if (document.getElementsByName("working")[0]) {
		document.getElementsByName("working")[0].blur();
	}	
	stage.draw();

    // Update the export image button
    imageBtn = document.getElementById("toImage");
    imageBtn.href = layer.getCanvas().toDataURL();

	// window.onresize = function(){
	// alert("Resized");
	// console.log("Resizing");
	// console.log("Window: "+window.innerWidth+", "+window.innerHeight);
	// console.log("Layer: "+layer.getWidth()+", "+layer.getHeight());
	// layer.setSize(window.innerWidth, window.innerHeight);
	// console.log("Resized");
	// console.log("Window: "+window.innerWidth+", "+window.innerHeight);
	// console.log("Layer: "+layer.getWidth()+", "+layer.getHeight());
	// layer.draw();
	// }
}

function canvasResize() {
	var container = document.getElementById('container');
	var newWidth = window.innerWidth;
	var newHeight = window.innerHeight;
	container.style.width = newWidth + 'px';
	container.style.height = newHeight + 'px';
	// alert("Resized");
	//layer.draw()
}

//Captures key presses and handles them if needed or returns to browser for handling
document.onkeydown = function(e) {
	e = e || window.event;

    // Esc and Enter both finish an edit
    if( e.keyCode == 27 || e.which == 27 || e.keyCode == 13 || e.which == 13 ) {
        if (document.getElementsByName("working")[0]) {
            document.getElementsByName("working")[0].blur();
        }

        if( moveClaimStarted ) {
            moveClaimStarted = 0;
            canvasController.moveClaimAbort();
        }
    }

    //If the control key is pressed on the keyboard event, check to see if 'z' or 'y' are pressed for undo or redo, respectively.
    if( e.ctrlKey )
    {
    	//If the 'z' key is also pressed, undo the last action.
    	if( e.keyCode == 90 || e.which == 90 )
    	{
            // If we're eding something, stop that too.
            if (document.getElementsByName("working")[0]) {
                document.getElementsByName("working")[0].blur();
            }

            // Undo and redo cancel a pending move when they rebuild the tree
            moveClaimStarted = 0;

    		canvasController.undo()
    	}
    	//If the 'y' key is also pressed, redo the last action
    	else if( e.keyCode == 89 || e.which == 89 )
    	{
            // If we're eding something, stop that too.
            if (document.getElementsByName("working")[0]) {
                document.getElementsByName("working")[0].blur();
            }

            // Undo and redo cancel a pending move when they rebuild the tree
            moveClaimStarted = 0;

    		canvasController.redo()
    	}
    	else
    	{
    		return;
    	}
    }
    else
    {
    	return;
    }
    e.preventDefault();
   }
    	

window.addEventListener('resize', canvasResize(), false);

