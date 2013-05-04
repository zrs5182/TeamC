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
    
    //Need to remove the canvas objects, localStorage(myId), and localStorage(grid[myX,myY])
    //Readjust the tree (myX,myY outwards) back towards the center
    
		//	console.log(store.get(myId));
		
		 var things = stage.get("#"+myId);
		 console.log(things);
		 for(thing in things){
		   //console.log(things);
		 }
		
		 var x = store.get(myId).x;
		 var y = store.get(myId).y;
		 localStorage.removeItem("grid["+x+","+y+"]"); 
     localStorage.removeItem(myId);
      	
      	//localStorage.setItem(myId);
      	// console.log("Local Storage After Delete:");
      	//console.log(localStorage);
   },
};