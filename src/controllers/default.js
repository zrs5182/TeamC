var container = document.getElementById("container");
var stage = new Kinetic.Stage({
	container : 'container',
	width : container.clientWidth,
	height : container.clientHeight,
	draggable : true
});
var layer = new Kinetic.Layer();

var contention = new Kinetic.Shape({
	drawFunc : function(canvas) {
		var context = canvas.getContext();
		context.beginPath();
		x = parseInt(claim.x);
		y = parseInt(claim.y);
		w = 200;
		h = 100;
		r = 11;
		context.moveTo(x - 0.5 * w + r, y - 0.5 * h);
		context.arcTo(x + 0.5 * w, y - 0.5 * h, x + 0.5 * w, y + 0.5 * h, r);
		context.arcTo(x + 0.5 * w, y + 0.5 * h, x - 0.5 * w, y + 0.5 * h, r);
		context.arcTo(x - 0.5 * w, y + 0.5 * h, x - 0.5 * w, y - 0.5 * h, r);
		context.arcTo(x - 0.5 * w, y - 0.5 * h, x + 0.5 * w, y - 0.5 * h, r);
		context.closePath();
		canvas.fillStroke(this);
	},
	fill : 'white',
	stroke : 'black',
	draggable : true,
	strokeWidth : 4,
	drawHitFunc : function(canvas) {
		var context = canvas.getContext();
		context.beginPath();
		x = parseInt(claim.x) - 100;
		y = parseInt(claim.y) - 50;
		w = 150;
		h = 75;
		r = 11;
		context.moveTo(x - 0.5 * w + r, y - 0.5 * h);
		context.arcTo(x + 0.5 * w, y - 0.5 * h, x + 0.5 * w, y + 0.5 * h, r);
		context.arcTo(x + 0.5 * w, y + 0.5 * h, x - 0.5 * w, y + 0.5 * h, r);
		context.arcTo(x - 0.5 * w, y + 0.5 * h, x - 0.5 * w, y - 0.5 * h, r);
		context.arcTo(x - 0.5 * w, y - 0.5 * h, x + 0.5 * w, y - 0.5 * h, r);
		context.closePath();
		canvas.fillStroke(this);
	}
});

//var testClaim = Object.create(claim);
//var testCounter = Object.create(counter);
//testClaim.setId(testCounter);
//claimController.setClaimText(testClaim,'foooooooobar');
localStorage.clear();
store.set(0, {id: 0, type: 'support', text: "", parent: 900, x: 500,y: 100});
var testId = claimController.makeNewClaim(0, 'refutation');
var text=claimController.getClaimText(testId);
var claim = store.get(testId);

layer.on('click', function(event) {
	alert(event.targetNode.getAbsolutePosition().x+","+event.targetNode.getAbsolutePosition().y);
	var node = event.targetNode;
	var div = document.getElementById('myTextArea');
	div.innerHTML=canvasController.makeTextArea(testId);
	document.getElementById('working').focus();
	//document.getElementById('working').textContent = "changed text";
	//document.getElementById('working').innerText = "changed text";
});

// add the contention to the layer
layer.add(contention);
// add the layer to the stage
stage.add(layer); 
alert(contention.getAbsolutePosition().x+","+contention.getAbsolutePosition().y);
/*for (var i = 0; i < localStorage.length; i++){	//iterate through every index of localStorage
    localStorage.setItem(localStorage.key(i),null);
}*/
