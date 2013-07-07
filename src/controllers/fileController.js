var fileController = {
	saveMap: function(){
		var data = [];
		for (var i = 0; i < store.get("canvas").claimCount; i++) {
			
			data[i] = nodeList.nodes[i];
			
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
	},
	save: function(){
        var save_pattern=/(\S)/i
        var filename=prompt("Save As...","argument_map");
    if(!save_pattern.test(filename) || filename == null){
            filename="argument_map";
        }
        filename=filename+".am";
        document.getElementById("downloader").download=filename;
        document.getElementById("downloader").href = "data:application;charset=UTF-8," + encodeURIComponent(JSON.stringify(localStorage));
    }
};