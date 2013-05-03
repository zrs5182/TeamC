var claimController = {
  makeNewClaim : function(parent, newType) {
    var myParent = store.get(parent);
    var myId = localStorage.length;
    var myX = parseInt(myParent.x) + 100;
    var myY = parseInt(myParent.y) + 100;
    store.set(myId, {
      id : myId,
      type : newType,
      text : "",
      parent : myParent.id,
      x : myX,
      y : myY
    })
    return myId;
  },
  getClaimText : function(id) {
    return store.get(id).text;
  },
    setClaimText : function(myId, newText) {
    var claim = store.get(myId);
    claim.text = newText;
    store.set(myId, claim);
  },
  removeClaim : function (myId){
		//	console.log(store.get(myId));
		 // var x = store.get(myId).x;
		 // var y = store.get(myId).y;
		 // localStorage.removeItem("grid["+x+","+y+"]"); 
      	 localStorage.removeItem(myId);
      	
      	//localStorage.setItem(myId);
      	// console.log("Local Storage After Delete:");
      	//console.log(localStorage);
   },
};