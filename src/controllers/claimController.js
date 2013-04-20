var claimController = {
	makeNewClaim: function(parent, newType){
		var myParent = store.get(parent);
		var myId = localStorage.length;
		var myX = parseInt(myParent.x)+100;
		var myY = parseInt(myParent.y)+100;
		store.set(myId, {id: myId, type: newType, text: "", parent: myParent.id, x: myX,y: myY})
		return myId;
	},
	getClaimText: function(id){
		return store.get(id).text;
	},
	setClaimText: function(myId, newText){
		var claim = store.get(myId);
		claim.text=newText;
		store.set(myId, claim);
	}
};
