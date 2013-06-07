var nodeList = {
	nodes: [],
	addNode: function(node){
		this.nodes.push(node);
	},
	resetList: function(){
		for(item in this.nodes){
			var node = nodeList.nodes[item];
			node.ancestor=node.id;
			node.x=0;
			node.mod=0;
			node.shift=0;
			node.change=0;
			node.thread=null;
			node.leftBrother = null;
			node.leftMostSibling = null;
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
	},
	newNode: function(newId, newType, newParent){
		newParent = ( typeof newParent == 'undefined') ? null : newParent;
		this.addNode({
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
			this.nodes[newParent].children.unshift(newId);
		}else if(newType==="refute"||newType==="rebut"){
			this.nodes[newParent].children.push(newId);
		}
	}
}
var amTree = {
	buchheim: function(root){
		nodeList.resetList();
		this.firstWalk(root);
		this.secondWalk(root);
		canvasController.fixText();
		layer.draw();
		localStorage.setItem("nodeList",JSON.stringify(nodeList.nodes));
	},
	firstWalk: function(node){
		//console.log(node);
		/*for(var child in nodeList.nodes){
			console.log(nodeList.nodes[child].id);
			if(nodeList.nodes[child].id==node){
				var v = nodeList.nodes[child];
				break;
			}
		}*/
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
				this.firstWalk(v.children[w]);
				defaultAncestor=this.apportion(v.children[w], defaultAncestor);
			}
			this.executeShifts(v);
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
	},
	secondWalk: function(node, m, depth){
		m = ( typeof m == 'undefined') ? 0 : m;
		depth = ( typeof depth == 'undefined') ? 0 : depth;
		var v = nodeList.nodes[node];
		v.x = v.x + m;
		v.y = depth;
		for(var w in v.children){
			this.secondWalk(v.children[w], m+v.mod, depth+1);
		}
	},
	apportion: function(node, defaultAncestor){
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
			while(this.right(vil) && this.left(vir)){
				vil = nodeList.nodes[this.right(vil)];
				vir = nodeList.nodes[this.left(vir)];
				vol = nodeList.nodes[this.left(vol)];
				vor = nodeList.nodes[this.right(vor)];
				vor.ancestor = v.id;
				shift = (vil.x+sil)-(vir.x+sir)+1;
				if(shift>0){
					this.moveSubtree(this.ancestor(vil,v,defaultAncestor),v,shift);
					sir = sir + shift;
					sor = sor + shift;
				}
				sil = sil + vil.mod;
				sir = sir + vir.mod;
				sol = sol + vol.mod;
				sor = sor + vor.mod;
			}
			if(this.right(vil) && !this.right(vor)){
				vor.thread=this.right(vil);
				vor.mod=vor.mod+sil-sor;
			}else{
				if(this.left(vir) && !this.left(vol)){
					vol.thread=this.left(vir);
					vol.mod=vol.mod+sir-sol;
				}
				defaultAncestor=v;
			}
		}
		return defaultAncestor;
	},
	left: function(node){
		if(node.children[0]){
			return node.children[0];
		}
		return node.thread;
	},
	right: function(node){
		if(node.children[0]){
			return node.children[node.children.length-1];
		}
		return node.thread;
	},
	moveSubtree: function(wl, wr, shift){
		var subtrees = wr.number-wl.number;
		wr.change = wr.change - (shift/subtrees);
		wr.shift = wr.shift + shift;
		wl.change = wl.change + (shift/subtrees);
		wr.x = wr.x + shift;
		wr.mod = wr.mod + shift;
	},
	ancestor: function(vil, v, defaultAncestor){
		if(nodeList.nodes[v.parent].children.indexOf(vil.ancestor)){
			return nodeList.nodes[vil.ancestor];
		}else{
			return nodeList.nodes[defaultAncestor];
		}
	},
	executeShifts: function(v){
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
}