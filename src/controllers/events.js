var container = document.getElementById("container");
//document.getElementById("menuArea").left = window.innerWidth - 50;

var stage = new Kinetic.Stage({
	container : 'container',
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
var nextClaimNumber = 0;

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
      });
layer.on('click', function(event) {
	if(moving===0){
		var node = event.targetNode;
		var myName = node.attrs.name;
		var myId = node.getParent().getId();
		var myType = nodeList.nodes[myId].type;
		if (myName === "complexText" || myName === "claimTextArea") {
			var div = document.getElementById('myTextArea');
			div.innerHTML = canvasController.makeTextArea(myId);
			document.getElementsByName('working')[0].focus();
		} else if (myName === "supportButton") {
			canvasController.addClaim("support", myId);
		} else if (myName === "refuteButton") {
			if (myType === "refute") {
				canvasController.addClaim("rebut", myId);
			} else {
				canvasController.addClaim("refute", myId);
			}
		} else if (myName === "deleteButton") {
			canvasController.removeClaim(myId);
		} else if (myName === "claim" || myName === "connector") {
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
		var myType = nodeList.nodes[myId].type;
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
			var oldParent = nodeList.nodes[nodeList.nodes[selected].parent];
			var children = oldParent.children;
			children.splice(children.indexOf(selected),1);
			var newParent = nodeList.nodes[nodeList.nodes[myId].parent];
			children = newParent.children;
			children.splice(children.indexOf(myId),0,selected);
			newParent.children = children;
			var claim = nodeList.nodes[selected];
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
			amTree.buchheim(0);
		}else if(myName === "claimAddRight"){
			var oldParent = nodeList.nodes[nodeList.nodes[selected].parent];
			var children = oldParent.children;
			children.splice(children.indexOf(selected),1);
			var newParent = nodeList.nodes[nodeList.nodes[myId].parent];
			children = newParent.children;
			children.splice(children.indexOf(myId)+1,0,selected);
			newParent.children = children;
			var claim = nodeList.nodes[selected];
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
			amTree.buchheim(0);
		}else if(myName === "claimAddBottom"){
			var oldParent = nodeList.nodes[nodeList.nodes[selected].parent];
			var children = oldParent.children;
			children.splice(children.indexOf(selected),1);
			var newParent = nodeList.nodes[myId];
			children = newParent.children;
			if(nodeList.nodes[selected].type==="support"){
				children.unshift(selected);
			}else{
				children.push(selected);
			}
			newParent.children = children;
			var claim = nodeList.nodes[selected];
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
			amTree.buchheim(0);
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

