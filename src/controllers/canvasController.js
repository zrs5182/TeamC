var amCanvas = {
	gridX: 300,
	gridY: 200,
	centerX: (window.innerWidth / 2) - 150, // half of gridX
	centerY: (window.innerHeight / 2) + 100, // half of gridY
}
var canvasController = {
	newCanvas : function() {
		localStorage.clear();
		stage.clear();
		stage.setOffsetX(-amCanvas.centerX);
		stage.setPosition(0);
		stage.setScale(1);
		stage.add(layer);
		canvasController.addClaim("contention");
	},
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
	displayMenu : function() {
		var menu = document.getElementById("nav");
		var currentMenuDisplay = menu.style.display;
		if (currentMenuDisplay == "none") {
			menu.style.display = "block";
		} else {
			menu.style.display = "none";
			document.getElementById("loadArea").style.display = "none";
		}
	},
	centerMap: function(){
		stage.setPosition(0,0);
		stage.setPosition(-(((window.innerWidth-100)/2))*(stage.getScale().x-1),0)
		stage.setOffset(-amCanvas.centerX,0);
		stage.draw();
	},
	makeTextArea : function(myId) {
		var claim = nodeList.nodes[myId];
		var gridX = amCanvas.gridX;
		var gridY = amCanvas.gridY;
		var scale = layer.getScale().x;
		var center = 0;
		var realX = Math.round(((claim.x - nodeList.nodes[0].x) * (amCanvas.gridX * 1.5) + center + 37) * scale) + stage.getAbsoluteTransform().getTranslation().x;
		var realY = Math.round(((claim.y * amCanvas.gridY * 1.5) + 37) * scale) + stage.getAbsoluteTransform().getTranslation().y;
		document.getElementById('myTextArea').style.left = realX + "px";
		document.getElementById('myTextArea').style.top = realY + "px";
		document.getElementById('myTextArea').style.zIndex = 2;
		return "<textarea style='font-size: " + (16 * scale) + "px; width: " + (((amCanvas.gridX) - 78) * scale) + "px; height: " + (amCanvas.gridY * scale * .6) + "px;' name='working' id=" + claim.id + " onfocus='this.select();' onblur='canvasController.removeTextArea(" + myId + ")'>" + nodeList.nodes[myId].text + "</textarea>"
	},
	extractText : function() {
		return document.getElementsByName('working')[0].value;
	},
	removeTextArea : function(myId) {
		var claim = nodeList.nodes[myId];
		claim.text = canvasController.extractText();
		document.getElementById('myTextArea').innerHTML = '';
		document.getElementById('myTextArea').style.zIndex = 0;
		var thisText = stage.get('.complexText')[myId];
		thisText.setText(nodeList.nodes[myId].text);
	},
	addClaim : function(type, parent) {
		parent = ( typeof parent == 'undefined') ? null : parent;
		var myId = nextClaimNumber;
		nextClaimNumber = myId + 1;
		nodeList.newNode(myId, type, parent);
		amTree.buchheim(0);
		canvasController.drawClaim(myId);
		//document.getElementById("myTextArea").innerHTML = canvasController.makeTextArea(myId);
		//setTimeout(function() {document.getElementsByName('working')[0].focus();}, 100);
	},
	/*removeClaim : function(id) {
		layer.destroy();
		layer = new Kinetic.Layer();
		stage.add(layer);
		var node = nodeList.nodes[id];

		if (node != 0) {
			var parent = nodeList.nodes[node.parent];
			console.log(parent.children.splice(node.number - 1, 1) + " removed");
			store.set(parent.id, parent);
		}
		localStorage.removeItem(id);
		console.log(parent.children);
		for (var key in localStorage) {
			if (key != "canvas") {
				canvasController.drawClaim(nodeList.nodes[key].id);
				console.log(layer.children);
				for (var shape in layer.children) {
					console.log(shape.name);
					if (shape.name != "connector") {
						shape.drawHitFunc();
					}
				}
			}
		}
		setTimeout(function() {
			readyTree(0);
		}, 100);
		setTimeout(function() {
			firstWalk(0);
			secondWalk(0);
			fixText(0);
		}, 500);
	},*/
	drawClaim : function(myId) {
		var claim = new Kinetic.Shape({
			id : myId,
			name : "claim",
			drawFunc : function(canvas) {
				var context = canvas.getContext();
				var x = ((nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3));
				var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
				var w = amCanvas.gridX;
				var h = amCanvas.gridY;
				var r = 12;
				var o = 30;
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
			drawHitFunc : function(canvas) {
				var context = canvas.getContext();
				var x = ((nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3));
				var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
				var w = amCanvas.gridX;
				var r = 12;
				var o = 30;
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
		var claimAddLeft = new Kinetic.Shape({
			id : myId,
			name : "claimAddLeft",
			drawFunc : function(canvas) {
				var context = canvas.getContext();
				var x = (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
				var y = (nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3)) + (amCanvas.gridY / 8);
				var w = amCanvas.gridX / 4;
				var h = amCanvas.gridY / 4 * 3;
				var r = 12;
				var o = 30;
				context.beginPath();
				context.moveTo(x - o, y);
				context.arcTo(x - w, y, x - w, y + r, r);
				context.arcTo(x - w, y + h, x - w + r, y + h, r);
				context.arcTo(x, y + h, x, y + h - r, r);
				context.arcTo(x, y, x - o, y, r);
				context.closePath();
				context.moveTo(x - w / 2, y + h / 10 * 4);
				context.lineTo(x - w / 2, y + h / 10 * 6);
				context.moveTo(x - w / 3, y + h / 2);
				context.lineTo(x - w / 3 * 2, y + h / 2);
				this.setFill('yellow');
				canvas.fillStroke(this);
			},
			stroke : 'black',
			strokeWidth : 5,
			drawHitFunc : function(canvas) {
				var context = canvas.getContext();
				var x = (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
				var y = (nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3)) + (amCanvas.gridY / 8);
				var w = amCanvas.gridX / 4;
				var h = amCanvas.gridY / 4 * 3;
				var r = 12;
				var o = 30;
				context.beginPath();
				context.moveTo(x - o, y);
				context.arcTo(x - w, y, x - w, y + r, r);
				context.arcTo(x - w, y + h, x - w + r, y + h, r);
				context.arcTo(x, y + h, x, y + h - r, r);
				context.arcTo(x, y, x - o, y, r);
				context.closePath();
				canvas.fillStroke(this);
			},
			opacity : 0
		});
		var claimAddRight = new Kinetic.Shape({
			id : myId,
			name : "claimAddRight",
			drawFunc : function(canvas) {
				var context = canvas.getContext();
				var x = amCanvas.gridX + (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
				var y = (nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3)) + (amCanvas.gridY / 8);
				var w = amCanvas.gridX / 4;
				var h = (amCanvas.gridY / 4) * 3;
				var r = 12;
				var o = 30;
				context.beginPath();
				context.moveTo(x + r, y);
				context.arcTo(x + w, y, x + w, y + r, r);
				context.arcTo(x + w, y + h, x + w - r, y + h, r);
				context.arcTo(x, y + h, x, y + h - r, r);
				context.arcTo(x, y, x+r, y, r);
				context.closePath();
				context.moveTo(x + w / 2, y + h / 10 * 4);
				context.lineTo(x + w / 2, y + h / 10 * 6);
				context.moveTo(x + w / 3, y + h / 2);
				context.lineTo(x + w / 3 * 2, y + h / 2);
				this.setFill('yellow');
				canvas.fillStroke(this);
			},
			stroke : 'black',
			strokeWidth : 5,
			drawHitFunc : function(canvas) {
				var context = canvas.getContext();
				var x = amCanvas.gridX + (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
				var y = (nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3)) + (amCanvas.gridY / 8);
				var w = amCanvas.gridX / 4;
				var h = (amCanvas.gridY / 4) * 3;
				var r = 12;
				var o = 30;
				context.beginPath();
				context.moveTo(x + r, y);
				context.arcTo(x + w, y, x + w, y + r, r);
				context.arcTo(x + w, y + h, x + w - r, y + h, r);
				context.arcTo(x, y + h, x, y + h - r, r);
				context.arcTo(x, y, x+r, y, r);
				context.closePath();
				canvas.fillStroke(this);
			},
			opacity : 0
		});
		var claimAddBottom = new Kinetic.Shape({
			id : myId,
			name : "claimAddBottom",
			drawFunc : function(canvas) {
				var context = canvas.getContext();
				var x = ((nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3));
				var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
				var w = amCanvas.gridX;
				var h = amCanvas.gridY;
				var r = 12;
				var o = 30;
				context.beginPath();
				context.moveTo(x + (w/6) + r, y + h);
				context.arcTo(x + (w/6*5), y + h, x + (w/6*5), y + h +r, r);
				context.arcTo(x + (w/6*5), y + (h/3*4), x + (w/6*5) - r, y + (h/3*4), r);
				context.arcTo(x + (w/6), y + (h/3*4), x + (w/6), y + (h/3*4) - r, r);
				context.arcTo(x + (w/6), y + h, x + (w/6) + r, y + h, r);
				context.closePath();
				context.moveTo(x + w/2, y + h/12*13);
				context.lineTo(x + w/2, y + h/12*15);
				context.moveTo(x + w/24*11, y + h/6*7);
				context.lineTo(x + w/24*13, y + h/6*7);
				this.setFill('yellow');
				canvas.fillStroke(this);
			},
			stroke : 'black',
			strokeWidth : 5,
			drawHitFunc : function(canvas) {
				var context = canvas.getContext();
				var x = ((nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3));
				var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
				var w = amCanvas.gridX;
				var h = amCanvas.gridY;
				var r = 12;
				var o = 30;
				context.beginPath();
				context.moveTo(x + (w/6) + r, y + h);
				context.arcTo(x + (w/6*5), y + h, x + (w/6*5), y + h +r, r);
				context.arcTo(x + (w/6*5), y + (h/3*4), x + (w/6*5) - r, y + (h/3*4), r);
				context.arcTo(x + (w/6), y + (h/3*4), x + (w/6), y + (h/3*4) - r, r);
				context.arcTo(x + (w/6), y + h, x + (w/6) + r, y + h, r);
				context.closePath();
				canvas.fillStroke(this);
			},
			opacity : 0
		});

		var claimTextArea = new Kinetic.Shape({
			id : myId,
			drawFunc : function(canvas) {
				var context = canvas.getContext();
				var x = (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
				var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
				var w = amCanvas.gridX;
				var h = amCanvas.gridY;
				var r = 12;
				var o = 30;
				context.beginPath();
				context.moveTo(x + r + o, y + o);
				context.arcTo(x + w - o, y + o, x + w - o, y + r / 2 + o, r / 2);
				context.arcTo(x + w - o, y + h - o, x + w - r / 2 - o, y + h - o, r / 2);
				context.arcTo(x + o, y + h - o, x + o, y + h - r / 2 - o, r / 2);
				context.arcTo(x + o, y + o, x + r / 2 + o, y + o, r / 2);
				context.closePath();
				this.setFill('white');
				if (nodeList.nodes[myId].type === "contention") {
					this.setFill('white');
					this.setStroke('black');
					this.setStrokeWidth(2);
				}
				canvas.fillStroke(this);
			},
			stroke : 'black',
			strokeWidth : 2,
			name : 'claimTextArea',
			drawHitFunc : function(canvas) {
				var context = canvas.getContext();
				var x = (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
				var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
				var w = amCanvas.gridX;
				var h = amCanvas.gridY;
				var r = 12;
				var o = 30;
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
		var supportButton = new Kinetic.Shape({
			id : myId,
			drawFunc : function(canvas) {
				var context = canvas.getContext();
				var x = (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
				var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
				var w = amCanvas.gridX;
				var h = amCanvas.gridY;
				var r = 12;
				var o = 30;
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
			drawHitFunc : function(canvas) {
				var context = canvas.getContext();
				var x = (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
				var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
				var w = amCanvas.gridX;
				var h = amCanvas.gridY;
				var r = 12;
				var o = 30;
				context.beginPath();
				context.moveTo(x, y + h - o - r);
				context.bezierCurveTo(x, y + h, x + w / 2, y + h - o - r, x + w / 2, y + h);
				context.arcTo(x, y + h, x, y + h - o - r, r);
				context.closePath();
				canvas.fillStroke(this);
			},
			opacity : 1

		});

		var refuteButton = new Kinetic.Shape({
			id : myId,
			drawFunc : function(canvas) {
				var context = canvas.getContext();
				var x = (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
				var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
				var w = amCanvas.gridX;
				var h = amCanvas.gridY;
				var r = 12;
				var o = 30;
				context.beginPath();
				context.moveTo(x + w, y + h - o - r);
				context.bezierCurveTo(x + w, y + h, x + w / 2, y + h - o - r, x + w / 2, y + h);
				context.arcTo(x + w, y + h, x + w, y + h - o - r, r);
				context.closePath();
				if (nodeList.nodes[myId].type !== "refute") {
					this.setFill('red');
				} else {
					this.setFill('orange');
				}
				canvas.fillStroke(this);
			},
			stroke : 'black',
			strokeWidth : 2,
			name : 'refuteButton',
			drawHitFunc : function(canvas) {
				var context = canvas.getContext();
				var x = (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
				var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
				var w = amCanvas.gridX;
				var h = amCanvas.gridY;
				var r = 12;
				var o = 30;
				context.beginPath();
				context.moveTo(x + w, y + h - o - r);
				context.bezierCurveTo(x + w, y + h, x + w / 2, y + h - o - r, x + w / 2, y + h);
				context.arcTo(x + w, y + h, x + w, y + h - o - r, r);
				context.closePath();
				canvas.fillStroke(this);
			},
			opacity : 1

		});

		var deleteButton = new Kinetic.Shape({
			id : myId,
			drawFunc : function(canvas) {
				var context = canvas.getContext();
				var x = (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
				var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
				var w = amCanvas.gridX;
				var h = amCanvas.gridY;
				var r = 12;
				var o = 30;
				context.beginPath();
				context.moveTo(x + w - 2 * o - r, y);
				context.bezierCurveTo(x + w - o, y, x + w, y + o, x + w, y + 2 * o + r);
				context.arcTo(x + w, y, x + w - o - r, y, r);
				context.closePath();
				this.setFill('#FFFF73');
				canvas.fillStroke(this);
			},
			stroke : 'black',
			strokeWidth : 2,
			name : 'deleteButton',
			drawHitFunc : function(canvas) {
				var context = canvas.getContext();
				var x = (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
				var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
				var w = amCanvas.gridX;
				var h = amCanvas.gridY;
				var r = 12;
				var o = 30;
				context.beginPath();
				context.moveTo(x + w - 2 * o - r, y);
				context.bezierCurveTo(x + w - o, y, x + w, y + o, x + w, y + 2 * o + r);
				context.arcTo(x + w, y, x + w - o - r, y, r);
				context.closePath();
				canvas.fillStroke(this);
			},
			opacity : 1

		});

		var complexText = new Kinetic.Text({
			id : myId,
			name : "complexText",
			x : ((nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3)) + 30,
			y : (nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3)) + 30,
			text : nodeList.nodes[myId].text,
			fontSize : 18,
			fontFamily : 'Calibri',
			fill : '#555',
			width : amCanvas.gridX - 60,
			padding : 20,
			align : 'left',
			opacity : 1
		});
		if (myId !== 0) {
			var connector = new Kinetic.Shape({
				id : myId,
				drawFunc : function(canvas) {
					var context = canvas.getContext();
					var x = (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
					var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
					var w = amCanvas.gridX;
					var h = amCanvas.gridY;
					var r = 12;
					var o = 30;
					var type = nodeList.nodes[myId].type;
					if (type !== "contention") {
						var parentX = ((nodeList.nodes[nodeList.nodes[myId].parent].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3));
						var parentY = nodeList.nodes[nodeList.nodes[myId].parent].y * ((amCanvas.gridY / 2) * 3);
						var parentW = amCanvas.gridX;
						var parentH = amCanvas.gridY;
						context.beginPath();
						if (nodeList.nodes[myId].type === "support" && nodeList.nodes[myId].x <= nodeList.nodes[nodeList.nodes[myId].parent].x) {
							var firstX = x + (w / 2) + (2 * o);
							var firstY = y + 1;
							var secondX = parentX + (parentW / 2);
							var secondY = parentY + parentH;
							var thirdX = parentX - 2;
							var thirdY = parentY + parentH - r - o - 5;
							var fourthX = x + (w / 2) - (2 * o);
							var fourthY = y + 1;
							var changeX12 = secondX - firstX;
							var changeX34 = thirdX - fourthX;
							var changeY12 = firstY - secondY;
							var changeY34 = fourthY - thirdY;
							var bufferLeft = -20;
							var bufferRight = +20;
							context.moveTo(firstX, firstY);
							context.bezierCurveTo(firstX + ((secondX - firstX) / 2) / changeX12, secondY + ((firstY - secondY) / 2) / changeY12 + bufferRight, secondX - ((secondX - firstX) / 2) / changeX12, firstY - ((firstY - secondY) / 2) / changeY12 + bufferLeft, secondX, secondY);
							context.arcTo(parentX, parentY + parentH, thirdX, thirdY, r);
							context.bezierCurveTo(thirdX - ((thirdX - fourthX) / 2) / changeX34, fourthY - ((fourthY - thirdY) / 2) / changeY34 + bufferLeft, fourthX + ((thirdX - fourthX) / 2) / changeX34, thirdY + ((fourthY - thirdY) / 2) / changeY34 + bufferRight, fourthX, fourthY);
							context.lineTo(firstX, firstY);
						} else if (nodeList.nodes[myId].type === "support") {
							var firstX = x + (w / 2) - (2 * o);
							var firstY = y + 1;
							var secondX = parentX + r;
							var secondY = parentY + parentH;
							var thirdX = parentX + (parentW / 2);
							var thirdY = parentY + parentH;
							var fourthX = x + (w / 2) + (2 * o);
							var fourthY = y + 1;
							var bufferLeft = 20;
							var bufferRight = -20;
							context.moveTo(firstX, firstY);
							context.bezierCurveTo(firstX + bufferRight, secondY + bufferLeft, secondX + bufferRight, firstY + bufferLeft, secondX, secondY);
							context.lineTo(thirdX, thirdY);
							context.bezierCurveTo(thirdX + 2 * bufferLeft, fourthY + bufferRight, fourthX + bufferLeft, thirdY + bufferRight, fourthX, fourthY);
							context.lineTo(firstX, firstY);
						} else if ((nodeList.nodes[myId].type === "refute" || nodeList.nodes[myId].type === "rebut") && nodeList.nodes[myId].x >= nodeList.nodes[nodeList.nodes[myId].parent].x) {
							var firstX = x + (w / 2) - (2 * o);
							var firstY = y + 1;
							var secondX = parentX + (parentW / 2);
							var secondY = parentY + parentH;
							var thirdX = parentX + parentW + 2;
							var thirdY = parentY + parentH - r - o - 5;
							var fourthX = x + (w / 2) + (2 * o);
							var fourthY = y + 1;
							var changeX12 = secondX - firstX;
							var changeX34 = thirdX - fourthX;
							var changeY12 = firstY - secondY;
							var changeY34 = fourthY - thirdY;
							var bufferLeft = -20;
							var bufferRight = +20;
							context.moveTo(firstX, firstY);
							context.bezierCurveTo(firstX + ((secondX - firstX) / 2) / changeX12, secondY + ((firstY - secondY) / 2) / changeY12 + bufferRight, secondX - ((secondX - firstX) / 2) / changeX12, firstY - ((firstY - secondY) / 2) / changeY12 + bufferLeft, secondX, secondY);
							context.arcTo(parentX + parentW, parentY + parentH, thirdX, thirdY, r);
							context.bezierCurveTo(thirdX - ((thirdX - fourthX) / 2) / changeX34, fourthY - ((fourthY - thirdY) / 2) / changeY34 + bufferLeft, fourthX + ((thirdX - fourthX) / 2) / changeX34, thirdY + ((fourthY - thirdY) / 2) / changeY34 + bufferRight, fourthX, fourthY);
							context.lineTo(firstX, firstY);
						} else {
							var firstX = x + (w / 2) + (2 * o);
							var firstY = y + 1;
							var secondX = parentX + parentW - r;
							var secondY = parentY + parentH;
							var thirdX = parentX + (parentW / 2);
							var thirdY = parentY + parentH;
							var fourthX = x + (w / 2) - (2 * o);
							var fourthY = y + 1;
							var bufferLeft = -20;
							var bufferRight = 20;
							context.moveTo(firstX, firstY);
							context.bezierCurveTo(firstX + bufferRight, secondY + bufferRight, secondX + bufferRight, firstY + bufferRight, secondX, secondY);
							context.lineTo(thirdX, thirdY);
							context.bezierCurveTo(thirdX + 2 * bufferLeft, fourthY + bufferLeft, fourthX + bufferLeft, thirdY + bufferLeft, fourthX, fourthY);
							context.lineTo(firstX, firstY);
						}
						context.closePath();
						this.setFillLinearGradientStartPoint([parentX, parentY + parentH]);
						this.setFillLinearGradientEndPoint([parentX, y]);
						if (nodeList.nodes[myId].type === "support") {
							this.setFillLinearGradientColorStops([1 / 5, 'green', 4 / 5, '#6CC54F']);
						} else if (nodeList.nodes[myId].type === "refute") {
							this.setFillLinearGradientColorStops([1 / 5, 'red', 4 / 5, '#E60000']);
						} else {
							this.setFill('orange');
						}
						canvas.fillStroke(this);
					}
				},
				name : 'connector',
				drawHitFunc : function(canvas) {
					var context = canvas.getContext();
					var x = (nodeList.nodes[myId].x - nodeList.nodes[0].x) * ((amCanvas.gridX / 2) * 3);
					var y = nodeList.nodes[myId].y * ((amCanvas.gridY / 2) * 3);
					var w = amCanvas.gridX;
					var r = 12;
					var o = 30;
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
		layer.add(claim);
		layer.add(claimTextArea);
		layer.add(supportButton);
		layer.add(refuteButton);
		layer.add(deleteButton);
		layer.add(complexText);
		layer.add(claimAddLeft);
		layer.add(claimAddRight);
		layer.add(claimAddBottom);
		if (myId !== 0) {
			layer.add(connector);
		}
		layer.draw();
	}
};
