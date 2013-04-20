test('fileController.saveMap()', function() { 
    ok(fileController.saveMap({"name":"lol", "root":{"text":"Man never went to the moon.", "type":"support"}})===true, 'map saved successfully');
});

test('fileController.loadMap()', function() { 
    ok(fileController.loadMap("lol")===true, 'map loaded successfully');
});