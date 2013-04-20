var canvasController = {
	makeTextArea: function(myId, shapeX, shapeY){
		var myClaim = store.get(myId);
		document.getElementById('myTextArea').style.left=shapeX+7 + "px";
		document.getElementById('myTextArea').style.top=shapeY+15 + "px";
    document.getElementById('myTextArea').style.width=300 + "px";
    document.getElementById('myTextArea').style.height=200 + "px";
		return "<textarea rows='3' cols='20' id='working' onfocus='this.select();' onblur='canvasController.removeTextArea("+myId+")'>" + claimController.getClaimText(myId) + "</textarea>"
	},
	extractText: function(){
		return document.getElementById('working').value;
	},
	removeTextArea: function(myId){
		claimController.setClaimText(myId,this.extractText());
		document.getElementById('myTextArea').innerHTML='';
		//document.getElementById('myTextArea').style.left=0 + "px";
    //document.getElementById('myTextArea').style.top=0 + "px";
    document.getElementById('myTextArea').style.width=0 + "px";
    document.getElementById('myTextArea').style.height=0 + "px";
	},
	addClaim: function(){	//Fires when addSupportButton or addRefuteButton are clicked
		
	},
	removeClaim: function(){	//Fires when closeButton of a claim are clicked
		
	},
	clearCanvas: function(){	//Fires when closeButton of contention is clicked
		
	}
};