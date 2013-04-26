test('fileController.saveMap()', function() {
	var data=[];
	for (var i = 0; i < store.get("canvas").claimCount; i++) {
		
		data[i] = store.get(i);
		
	}
    ok(JSON.parse(fileController.saveMap())===data, 'map saved successfully');
});

test('fileController.loadMap()', function() {
	var dataString = JSON.parse('[{"id":0,"type":"contention","text":"","x":0,"y":0,"parent":null}]');
    var flag = true;
	
	for (var i = 0; i < store.get("canvas").claimCount; i++) {
		flag = dataString[i] === store.get(i);
		
	}
	
	ok(flag, 'map loaded successfully');
});