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

var moving = 0;
var dragging = 0;
var selected = null;

stage.on('dragstart', function() {
        layer.setListening(0);
      });

stage.on('dragend', function() {
        layer.setListening(1);
        layer.draw();

        // Update the export image button
        imageBtn = document.getElementById("toImage");
        imageBtn.href = layer.getCanvas().toDataURL();
      });

layer.on('click', function(event) {
	if(moving===0){
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
		} else if (myName === "deleteButton") {
			canvasController.removeReasonAndDraw(myId);
		} else if (myName === "addClaimLeft" ) {
            canvasController.addClaimToReason( myId, 0 );
		} else if (myName === "addClaimRight" ) {
            canvasController.addClaimToReason( myId, 1 );
        }else if (myName === "claim" || myName === "connector") {
			for (var element in layer.children) {
				for (var child in layer.children[element].children){
					if ((layer.children[element].children[child].attrs.id != myId && layer.children[element].children[child].attrs.name!="claimAddLeft" && layer.children[element].children[child].attrs.name!="claimAddRight" && layer.children[element].children[child].attrs.name!="claimAddBottom") || layer.children[element].children[child].attrs.name === "connector") {
						layer.children[element].children[child].setAttr("opacity", 0.25);
					}else{
						layer.children[element].children[child].setAttr("opacity",1);
					}
				}
			}
			moving=1;
			selected = myId;
			document.getElementById("container").style.backgroundColor='lightgray';
			layer.draw();
		}
	}else{
		var node = event.targetNode;
		var myName = node.attrs.name;
		var myId = node.attrs.id;
		var myType = reasonList.reasons[myId].type;
		if ((myName === "claim" || myName === "connector")&& myId===selected) {
			for (var element in layer.children) {
				for (var child in layer.children[element].children){
					if (layer.children[element].children[child].attrs.id != myId || layer.children[element].children[child].attrs.name === "connector") {
						layer.children[element].children[child].setAttr("opacity", 1);
					}
					if (layer.children[element].children[child].attrs.name==="claimAddLeft" || layer.children[element].children[child].attrs.name==="claimAddRight" || layer.children[element].children[child].attrs.name==="claimAddBottom"){
						layer.children[element].children[child].setAttr("opacity",0);
					}
				}
			}
			moving=0;
			selected=null;
			document.getElementById("container").style.backgroundColor='white';
			layer.draw();
		}else if (myName === "claimAddLeft"){
			var oldParent = reasonList.reasons[reasonList.reasons[selected].parent];
			var children = oldParent.children;
			children.splice(children.indexOf(selected),1);
			var newParent = reasonList.reasons[reasonList.reasons[myId].parent];
			children = newParent.children;
			children.splice(children.indexOf(myId),0,selected);
			newParent.children = children;
			var claim = reasonList.reasons[selected];
			claim.parent = newParent.id;
			for (element in layer.children) {
				if (layer.children[element].attrs.id != selected || layer.children[element].attrs.name === "connector") {
					layer.children[element].setAttr("opacity", 1);
				}
				if (layer.children[element].attrs.name==="claimAddLeft" || layer.children[element].attrs.name==="claimAddRight" || layer.children[element].attrs.name==="claimAddBottom"){
					layer.children[element].setAttr("opacity",0);
				}
			}
			moving=0;
			selected=null;
			document.getElementById("container").style.backgroundColor='white';
			amTree.buchheim(reasonList.reasons[0]);
		}else if(myName === "claimAddRight"){
			var oldParent = reasonList.reasons[reasonList.reasons[selected].parent];
			var children = oldParent.children;
			children.splice(children.indexOf(selected),1);
			var newParent = reasonList.reasons[reasonList.reasons[myId].parent];
			children = newParent.children;
			children.splice(children.indexOf(myId)+1,0,selected);
			newParent.children = children;
			var claim = reasonList.reasons[selected];
			claim.parent = newParent.id;
			for (element in layer.children) {
				if (layer.children[element].attrs.id != selected || layer.children[element].attrs.name === "connector") {
					layer.children[element].setAttr("opacity", 1);
				}
				if (layer.children[element].attrs.name==="claimAddLeft" || layer.children[element].attrs.name==="claimAddRight" || layer.children[element].attrs.name==="claimAddBottom"){
					layer.children[element].setAttr("opacity",0);
				}
			}
			moving=0;
			selected=null;
			document.getElementById("container").style.backgroundColor='white';
			amTree.buchheim(reasonList.reasons[0]);
		}else if(myName === "claimAddBottom"){
			var oldParent = reasonList.reasons[reasonList.reasons[selected].parent];
			var children = oldParent.children;
			children.splice(children.indexOf(selected),1);
			var newParent = reasonList.reasons[myId];
			children = newParent.children;
			if(reasonList.reasons[selected].type==="support"){
				children.unshift(selected);
			}else{
				children.push(selected);
			}
			newParent.children = children;
			var claim = reasonList.reasons[selected];
			claim.parent = myId;
			for (element in layer.children) {
				if (layer.children[element].attrs.id != selected || layer.children[element].attrs.name === "connector") {
					layer.children[element].setAttr("opacity", 1);
				}
				if (layer.children[element].attrs.name==="claimAddLeft" || layer.children[element].attrs.name==="claimAddRight" || layer.children[element].attrs.name==="claimAddBottom"){
					layer.children[element].setAttr("opacity",0);
				}
			}
			moving=0;
			selected=null;
			document.getElementById("container").style.backgroundColor='white';
			amTree.buchheim(reasonList.reasons[0]);
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


window.addEventListener('resize', canvasResize(), false);

