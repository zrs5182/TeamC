var nodeList = {
	nodes: [],
	addNode: function(node){
		this.nodes.push(node);
	},
	resetList: function(){
		for(item in this.nodes){
			var node = nodeList.nodes[item];
			node.x=0;
			node.mod=0;
			node.shift=0;
			node.change=0;
			node.thread=null;
			if(node.parent!=null && node.id!=nodeList.nodes[node.parent].children[0]){
				node.leftMostSibling = nodeList.nodes[node.parent].children[0];
				}
			if(node.parent!=null){
				node.number = nodeList.nodes[node.parent].children.indexOf(node.id)+1;
				if(node.number>1){
					node.leftBrother = nodeList.nodes[node.parent].children[node.number-2];
				}
			}
		}
	}
}
function newNode(newId, newType, newParent){
	newParent = ( typeof newParent == 'undefined') ? null : newParent;
	nodeList.addNode({
		id: newId,
		type: newType,
		parent: newParent,
		ancestor: newId,
		text: "",
		x: 0,
		y: 0,
		tree: 0,
		children: [],
		thread: null,
		change: 0,
		shift: 0,
		leftMostSibling: null,
		leftBrother: null,
		number: null,
		mod: 0
	});
	if(newType==="support"){
		nodeList.nodes[newParent].children.unshift(newId);
	}else if(newType==="refute"||newType==="rebut"){
		nodeList.nodes[newParent].children.push(newId);
	}
}
// newNode(0,"contention");
// newNode(1,"support",0);
// newNode(2,"refute",0);
// buchheim(0);
/////////////////////////////////
function buchheim(root){
	nodeList.resetList();
	firstWalk(root);
	secondWalk(root);
	localStorage.setItem("nodeList",JSON.stringify(nodeList.nodes));
}
function firstWalk(node){
	var v = nodeList.nodes[node];
	if(v.children[0]==null){
		if(v.leftBrother){
			v.x = nodeList.nodes[v.leftBrother].x+1;
		}else{
			v.x=0;
		}
	}else{
		var defaultAncestor = v.children[0];
		for(var w in v.children){
			firstWalk(v.children[w]);
			defaultAncestor=apportion(v.children[w], defaultAncestor);
		}
		executeShifts(v);
		var leftMostChild = nodeList.nodes[v.children[0]];
		var rightMostChild = nodeList.nodes[v.children[v.children.length-1]];
		var midpoint = (leftMostChild.x + rightMostChild.x)/2;
		var w = v.leftBrother;
		if(w!=null){
			v.x=nodeList.nodes[w].x+1;
			v.mod=v.x-midpoint;
		}else{
			v.x=midpoint;
		}
	}
}
function secondWalk(node, m=0, depth=0){
	var v = nodeList.nodes[node];
	v.x = v.x + m;
	v.y = depth;
	for(var w in v.children){
		secondWalk(v.children[w], m+v.mod, depth+1);
	}
}
function apportion(node, defaultAncestor){
	var v = nodeList.nodes[node];
	var w = v.leftBrother;
	if(w != null){
		var vir = v;
		var vor = v;
		var vil = nodeList.nodes[w];
		var vol = nodeList.nodes[v.leftMostSibling];
		var sir = vir.mod;
		var sor = vor.mod;
		var sil = vil.mod;
		var sol = vol.mod;
		var shift=0;
		while(right(vil) && left(vir)){
			vil = nodeList.nodes[right(vil)];
			vir = nodeList.nodes[left(vir)];
			vol = nodeList.nodes[left(vol)];
			vor = nodeList.nodes[right(vor)];
			vor.ancestor = v.id;
			shift = (vil.x+sil)-(vir.x+sir)+1;
			if(shift>0){
				moveSubtree(ancestor(vil,v,defaultAncestor),v,shift);
				sir = sir + shift;
				sor = sor + shift;
			}
			sil = sil + vil.mod;
			sir = sir + vir.mod;
			sol = sol + vol.mod;
			sor = sor + vor.mod;
		}
		if(right(vil) && !right(vor)){
			vor.thread=right(vil);
			vor.mod=vor.mod+sil-sor;
		}else{
			if(left(vir) && !left(vol)){
				vol.thread=left(vir);
				vol.mod=vol.mod+sir-sol;
			}
			defaultAncestor=v;
		}
	}
	return defaultAncestor;
}
function left(node){
	if(node.children[0]){
		return node.children[0];
	}
	return node.thread;
}
function right(node){
	if(node.children[0]){
		return node.children[node.children.length-1];
	}
	return node.thread;
}
function moveSubtree(wl, wr, shift){
	var subtrees = wr.number-wl.number; //-1?
	wr.change = wr.change - (shift/subtrees);
	wr.shift = wr.shift + shift;
	wl.change = wl.change + (shift/subtrees);
	wr.x = wr.x + shift;
	wr.mod = wr.mod + shift;
}
function ancestor(vil, v, defaultAncestor){
	if(nodeList.nodes[v.parent].children.indexOf(vil.ancestor)){
		return nodeList.nodes[vil.ancestor];
	}else{
		return nodeList.nodes[defaultAncestor];
	}
}
function executeShifts(v){
	var shift = 0;
	var change = 0;
	for(var w = v.children[v.children.length-1];v>0;v--){
		var child = nodeList.nodes[v.children[w]];
		child.x = child.x + shift;
		child.mod = child.mod + shift;
		change = change + child.change;
		shift = shift + child.shift + change;
	}
}