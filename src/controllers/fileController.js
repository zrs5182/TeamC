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
        // Get position of the root of the tree to anchor
        var x = reasonList.reasons[0].x;
        var y = reasonList.reasons[0].y;

        // Remove all drawn objects from the KineticJS layer
        layer.removeChildren();

        // This will read a stringified state (technically, an undo
        // object) and read it into the inital position of the undoList.
        // Then we'll "doit" to recreate the argument map.
		var init = JSON.parse(dataString);
        var undo = new Undo( init.reasons, init.claims );
        undoList.init( undo );
        undoList.undos[0].doit();
        //
        // Set the position of the root of the tree
        reasonList.reasons[0].x = x;
        reasonList.reasons[0].y = y;

        // Layout the tree anchoring at the root claim
        amTree.buchheim(reasonList.reasons[0], reasonList.reasons[0].claims[0] );

        // Redraw each claim (which adds them back to KineticJS layer)
        for(var i=0, leni=reasonList.reasons.length; i<leni; i++ ) {
            canvasController.drawReason(i);
        }
	},
	save: function(){
	    var save_pattern=/(\S)/i;
	    var extension_pattern = /.am$/;
        var oldfilename=document.getElementById("downloader").download || "argument_map.am";
	    var filename=prompt("Save As...", oldfilename);

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
	    document.getElementById("downloader").href = "data:application/binary;charset=UTF-8," + encodeURIComponent(this.saveMap());

	    // Let the caller start the download.
	    return true;
    },
    load: function( files ) {
        // Sanity checks on the file
        if( !files ) return;
        var file = files[0];
        if( !file || !file.size ) return;

        var blob = file.slice(0, file.size);

        var reader = new FileReader();

        // This handler will get our data as a string and call loadMap()
        reader.onloadend = function(evt) {
            if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                fileController.loadMap( evt.target.result );
            }
        };

        reader.readAsText( blob );
    }
};
