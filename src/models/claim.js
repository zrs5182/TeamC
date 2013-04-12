var claim = {
	text: "",
	type: "",
	getText: function() {
		return this.text;
	},
	setText: function(newText) {
		this.text=newText;
	},
	getType: function() {
		return this.type;
	},
	setType: function(newType) {
		this.type=newType;
	}
};