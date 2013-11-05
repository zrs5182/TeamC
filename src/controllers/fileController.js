// vim: set tabstop=4 expandtab : //

var fileController = {
	saveMap: function(){
        // Since undoIndex always trails the 'current undo state' by
        // one, we stringify the previous undo object in the undoList
        // to get data for saving.
        dataString = JSON.stringify( undoList.undos[undoList.undoIndex-1] );
        return dataString;
	},
	loadMap: function(dataString){
        // This will read a stringified state (technically, an undo
        // object) and read it into the inital position of the undoList.
        // Then we'll "doit" to recreate the argument map.
		var initialState = JSON.parse(dataString);
        undoList.init( initialState );
        undoList.undos[0].doit();
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
	    document.getElementById("downloader").href = "data:application;charset=UTF-8," + encodeURIComponent(this.saveMap());

	    // Let the caller start the download.
	    return true;
    }
};
