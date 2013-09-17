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
	    var save_pattern=/(\S)/i;
	    var extension_pattern = /.am$/;
	    var filename=prompt("Save As...","argument_map");

	    // If the user pressed cancel or emptied the field of letters, we'll abort.
	    if( filename == null || !save_pattern.test(filename)) {
		return false;
	    }

	    // Add a missing extension.
	    if( !extension_pattern.test( filename )) {
		filename=filename+".am";
	    }
	    //  Fill in the anchor to download to this file name.
	    document.getElementById("downloader").download=filename;
	    document.getElementById("downloader").href = "data:application;charset=UTF-8," + encodeURIComponent(JSON.stringify(localStorage));

	    // Let the caller start the download.
	    return true;
    }
};
