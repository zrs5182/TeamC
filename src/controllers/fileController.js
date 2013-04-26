var fileController = {
	saveMap: function(){
		var data = [];
		for (var i = 0; i < store.get("canvas").claimCount; i++) {
			
			data[i] = store.get(i);
			
		}
		dataString = JSON.stringify(data);
		return dataString;
	},
	loadMap: function(dataString){
		var data = JSON.parse(dataString);
		for (var i = 0; i < store.get("canvas").claimCount; i++) {
			
			store.set(data[i]);
			
		}
		return true;
	}
};