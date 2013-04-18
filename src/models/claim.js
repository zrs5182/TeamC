var claim = {
	text : "",
	type : "",
	uniqueId : 0,
	getText : function() {
		return this.text;
	},
	setText : function(newText) {
		this.text = newText;
	},
	getType : function() {
		return this.type;
	},
	setType : function(newType) {
		this.type = newType;
	},
	setId : function(count) {
		count.incrementCount();
		this.uniqueId = count.getCount();
	},
	getId : function() {
		return this.uniqueId;
	}
};
var counter = {
	count : 0,
	incrementCount : function(){
		this.count++;
	},
	getCount : function(){
		return this.count;
	}
}
