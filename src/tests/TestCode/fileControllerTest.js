//<script type="text/javascript" src="../../controllers/fileController.js"></script>

var testFileController = Object.create(fileController);

test('testFileController.saveMap()', function() { 
    ok(testFileController.saveMap({"name":"lol", "root":{"text":"Man never went to the moon.", "type":"support"}})===true, 'map saved successfully');
});

test('testFileController.loadMap()', function() { 
    ok(testFileController.loadMap("lol")===true, 'map loaded successfully');
});