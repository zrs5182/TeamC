var container = document.getElementById("container");
document.getElementById("menuArea").left = window.innerWidth - 50;
//var myText = 'foo';

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
stage.add(layer);

var moving = 0;
var selected = null;
layer.on('click', function(event) {
	if(moving===0){
		var node = event.targetNode;
		var myName = node.attrs.name;
		var myId = node.attrs.id;
		var myType = store.get(myId).type;
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
				if ((layer.children[element].attrs.id != myId && layer.children[element].attrs.name!="claimAddLeft" && layer.children[element].attrs.name!="claimAddRight")|| layer.children[element].attrs.name === "connector") {
					layer.children[element].setAttr("opacity", 0.25);
				}else{
					layer.children[element].setAttr("opacity",1);
				}
			}
			moving=1;
			selected = myId;
			console.log(selected+" selected");
			layer.draw();
		}
	}else{
		var node = event.targetNode;
		var myName = node.attrs.name;
		var myId = node.attrs.id;
		var myType = store.get(myId).type;
		console.log(myName+","+myId);
		if ((myName === "claim" || myName === "connector")&& myId===selected) {
			for (element in layer.children) {
				if (layer.children[element].attrs.id != myId || layer.children[element].attrs.name === "connector") {
					layer.children[element].setAttr("opacity", 1);
				}
				if (layer.children[element].attrs.name==="claimAddLeft" || layer.children[element].attrs.name==="claimAddRight"){
					layer.children[element].setAttr("opacity",0);
				}
			}
			moving=0;
			selected=null;
			layer.draw();
		}else if (myName === "claimAddLeft"){
			var oldParent = store.get(store.get(selected).parent);
			var children = oldParent.children;
			children.splice(children.indexOf(selected),1);
			store.set(oldParent.id,oldParent);
			var newParent = store.get(store.get(myId).parent);
			children = newParent.children;
			children.splice(children.indexOf(myId),0,selected);
			store.set(newParent.id, newParent)
			newParent.children = children;
			store.set(newParent.id, newParent);
			var claim = store.get(selected);
			claim.parent = newParent.id;
			store.set(claim.id,claim);
			for (element in layer.children) {
				if (layer.children[element].attrs.id != selected || layer.children[element].attrs.name === "connector") {
					layer.children[element].setAttr("opacity", 1);
				}
				if (layer.children[element].attrs.name==="claimAddLeft" || layer.children[element].attrs.name==="claimAddRight"){
					layer.children[element].setAttr("opacity",0);
				}
			}
			moving=0;
			selected=null;
			buchheim(0);
		}else if(myName === "claimAddRight"){
			var oldParent = store.get(store.get(selected).parent);
			var children = oldParent.children;
			children.splice(children.indexOf(selected),1);
			store.set(oldParent.id,oldParent);
			var newParent = store.get(store.get(myId).parent);
			children = newParent.children;
			children.splice(children.indexOf(myId)+1,0,selected);
			store.set(newParent.id, newParent)
			newParent.children = children;
			store.set(newParent.id, newParent);
			var claim = store.get(selected);
			claim.parent = newParent.id;
			store.set(claim.id,claim);
			for (element in layer.children) {
				if (layer.children[element].attrs.id != selected || layer.children[element].attrs.name === "connector") {
					layer.children[element].setAttr("opacity", 1);
				}
				if (layer.children[element].attrs.name==="claimAddLeft" || layer.children[element].attrs.name==="claimAddRight"){
					layer.children[element].setAttr("opacity",0);
				}
			}
			moving=0;
			selected=null;
			buchheim(0);
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
	layer.setScale(scalar);
	if (document.getElementsByName("working")[0]) {
		document.getElementsByName("working")[0].blur();
		// var workingArea = document.getElementsByName("working")[0];
		// var textArea = document.getElementById("myTextArea");
		// var canvas = store.get("canvas");
		// var claim = store.get(document.getElementsByName("working")[0].id);
		// var gridX=parseInt(canvas.gridX);
		// var gridY=parseInt(canvas.gridY);
		// var scale=layer.getScale().x;
		// var center=parseInt(canvas.center);
		// var realX=Math.round(((parseInt(claim.x))*parseInt(canvas.gridX)*1.5+center+37)*scale)+stage.getAbsoluteTransform().getTranslation().x;
		// var realY=Math.round((parseInt(claim.y)*parseInt(canvas.gridY)*1.5+37)*scale)+stage.getAbsoluteTransform().getTranslation().y;
		// textArea.style.left = realX + "px";
		// textArea.style.top =  realY + "px";
		// workingArea.style.fontSize = (16*scale)+"px"
		// workingArea.style.width=(parseInt(canvas.gridX)-78)*scalar+"px";
		// workingArea.style.height=(parseInt(store.get("canvas").gridY)*scale*.6)+"px";
	}
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