var claimController = {
	sendClick: function(){
		return 1;
	},
	getClaimText: function(claim){
		return claim.getText();
	},
	setClaimText: function(claim, text){
		claim.setText(text);
	}
};
