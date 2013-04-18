var canvasController = {
	makeTextArea: function(claim){
		document.getElementById('myTextArea').style.left='590px';
		document.getElementById('myTextArea').style.top='290px';
		return "<textarea rows='3' cols='20' id='working' onfocus='this.select();' onblur='canvasController.removeTextArea(claim)'>" + claimController.getClaimText(claim) + "</textarea>"
	},
	extractText: function(){
		return document.getElementById('working').innerHTML;
	},
	removeTextArea: function(claim){
		claimController.setClaimText(claim,this.extractText());
		document.getElementById('myTextArea').innerHTML='';
	},
	addClaim: function(){	//Fires when addSupportButton or addRefuteButton are clicked
		
	},
	removeClaim: function(){	//Fires when closeButton of a claim are clicked
		
	},
	clearCanvas: function(){	//Fires when closeButton of contention is clicked
		
	}
};