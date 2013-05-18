var container = document.getElementById("container");
//document.getElementById("menuArea").left = window.innerWidth - 50;

var stage = new Kinetic.Stage({
	container : 'container',
	width : window.innerWidth,
	height : window.innerHeight,
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
var selected = null;
layer.on('click', function(event) {
	if(moving===0){
		var node = event.targetNode;
		var myName = node.attrs.name;
		var myId = node.attrs.id;
		var myType = nodeList.nodes[myId].type;
		console.log(myName+" clicked");
		if (myName === "complexText" || myName === "claimTextArea") {
			var div = document.getElementById('myTextArea');
			div.innerHTML = canvasController.makeTextArea(myId);
			document.getElementsByName('working')[0].focus();
		} else if (myName === "supportButton") {
			console.log("support clicked");
			canvasController.addClaim("support", myId);
		} else if (myName === "refuteButton") {
			if (myType === "refute") {
				canvasController.addClaim("rebut", myId);
			} else {
				canvasController.addClaim("refute", myId);
			}
		} else if (myName === "deleteButton") {
	
		} else if (myName === "claim" || myName === "connector") {
			for (element in layer.children) {
				if ((layer.children[element].attrs.id != myId && layer.children[element].attrs.name!="claimAddLeft" && layer.children[element].attrs.name!="claimAddRight" && layer.children[element].attrs.name!="claimAddBottom") || layer.children[element].attrs.name === "connector") {
					layer.children[element].setAttr("opacity", 0.25);
				}else{
					layer.children[element].setAttr("opacity",1);
				}
			}
			moving=1;
			selected = myId;
			console.log(selected+" selected");
			document.getElementById("container").style.backgroundColor='lightgray';
			layer.draw();
		}
	}else{
		var node = event.targetNode;
		var myName = node.attrs.name;
		var myId = node.attrs.id;
		var myType = nodeList.nodes[myId].type;
		console.log(myName+","+myId);
		if ((myName === "claim" || myName === "connector")&& myId===selected) {
			for (element in layer.children) {
				if (layer.children[element].attrs.id != myId || layer.children[element].attrs.name === "connector") {
					layer.children[element].setAttr("opacity", 1);
				}
				if (layer.children[element].attrs.name==="claimAddLeft" || layer.children[element].attrs.name==="claimAddRight" || layer.children[element].attrs.name==="claimAddBottom"){
					layer.children[element].setAttr("opacity",0);
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
	//adding the event listener for Mozilla
	if (window.addEventListener)
		document.addEventListener('DOMMouseScroll', zoom, false);
	//for IE/OPERA etc
	document.onmousewheel = zoom;
}
var mousePos = {x:626,y:205};
window.addEventListener('mousemove', function() {
	mousePos = stage.getMousePosition();
    mousePos.x = mousePos.x - amCanvas.centerX - 150;
    console.log(mousePos);
  }, false);
window.addEventListener('drag', function() {
	if (document.getElementsByName("working")[0]) {
		document.getElementsByName("working")[0].blur();
	}
  }, false);


function zoom(event) {
	var delta = 0;
	if (!event)
		event = window.event;
	// normalize the delta
	if (event.wheelDelta) {
		// IE and Opera
		delta = event.wheelDelta;
	} else if (event.detail) {
		// W3C
		delta = -event.detail;
	}
	var zoomAmount = delta * 0.05;
	var oldScalar = layer.getScale().x;
	var scalar = layer.getScale().x + zoomAmount;
	if (scalar < 0)
		scalar = .1;
	layer.setX(mousePos.x);
	layer.setY(mousePos.y);
	layer.setScale(scalar);
	layer.setX(-mousePos.x);
	layer.setY(-mousePos.y);
	//console.log(scalar);
	if (document.getElementsByName("working")[0]) {
		document.getElementsByName("working")[0].blur();
	}
	
	//94 and 75 have to do with window.innerWidth of 1252 and window.innerHeight of 594.
	//Changed to window.innerWidth/13.33 and window.innerHeight/6.9
	//innerHeight/6.9 is wrong for height of 594, right for 428
	//They need to change based on window size somehow.
	//Also need to find the right point after dragging the stage.
	//Absolute position of mouse:
	//	stage.getPointerPosition().x-stage.getPosition().x
	//	stage.getPointerPosition().y-stage.getPosition().y
	
	// if(zoomAmount>0){
		// layer.setX((layer.getX()-(window.innerWidth/13.33))-(mousePos.x-amCanvas.centerX-150)*(zoomAmount));
		// layer.setY((layer.getY()-(window.innerHeight/6.9))-(mousePos.y-amCanvas.centerY-100)*(zoomAmount));
	// }else{
		// if(scalar-oldScalar<0){ //stop adjusting when zoom-out is maxed
			// layer.setX((layer.getX()+(window.innerWidth/13.33))-(mousePos.x-amCanvas.centerX-150)*(zoomAmount));
			// layer.setY((layer.getY()+(window.innerHeight/6.9))-(mousePos.y-amCanvas.centerY-100)*(zoomAmount));
		// }
	// }
	
	layer.draw();
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

}