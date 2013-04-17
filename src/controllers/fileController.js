var fileController = {
	saveMap: function(map){
		localStorage[map.name]=JSON.stringify(map);
		return localStorage[map.name] !== null;
	},
	loadMap: function(mapname){
		console.log(mapname);
		JSON.parse(localStorage[mapname]);
		return true;
	}
};