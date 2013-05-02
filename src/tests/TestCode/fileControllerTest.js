var container=document.getElementById("container");
var stage = new Kinetic.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight
});
var layer = new Kinetic.Layer();
test('fileController.saveMap()', function() {
    localStorage.clear();
    stage.clear();
    store.set("canvas", {
      minX : 0,
      maxX : 0,
      maxY : 1,
      gridX : 300,
      gridY : 200,
      center : container.clientWidth/2 - 150, //half of gridX
      claimCount : 0
    });
	var data=[];
	for (var i = 0; i < store.get("canvas").claimCount; i++) {
		
		data[i] = store.get(i);
		
	}
    ok(JSON.parse(fileController.saveMap())===data, 'map saved successfully');
});

test('fileController.loadMap()', function() {
    localStorage.clear();
    stage.clear();
    store.set("canvas", {
      minX : 0,
      maxX : 0,
      maxY : 1,
      gridX : 300,
      gridY : 200,
      center : container.clientWidth/2 - 150, //half of gridX
      claimCount : 0
    });
	var dataString = JSON.parse('[{"id":0,"type":"contention","text":"","x":0,"y":0,"parent":null}]');
    var flag = true;
	
	for (var i = 0; i < store.get("canvas").claimCount; i++) {
		flag = dataString[i] === store.get(i);
		
	}
	
	ok(flag, 'map loaded successfully');
});