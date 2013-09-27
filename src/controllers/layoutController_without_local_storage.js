// Implements the Buchheim layout algorithm, adapted from
// http://billmill.org/pymag-trees/
//
// Notable in this implementation is that there is no
// assumption that each node of the tree is of equal width

// This is a representation of our argument tree containing
// all of the attributes required to do the Buchheim
// layout algorithm.
var nodeList = {
	nodes: [],					// List of the nodes in this tree
	// Push a new node (with default attributes) onto the list
	newNode: function(newId, newType, newParent, newClaims){
		newParent = ( typeof newParent == 'undefined') ? null : newParent;
		this.nodes.push({
			id: newId,
			type: newType,
			parent: newParent,
			ancestor: newId,
			claims: newClaims,
			width: function() {
				return this.claims*amCanvas.claimX + o;
			},
			text: "",	// eventually this should be an array of texts (for each claim)
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
	},
	// Reset all of the attributes of each node (called just before laying out)
	resetList: function(){
		for( var i=0, len=this.nodes.length; i < len; i++ ) {
			var node = nodeList.nodes[i];
			node.ancestor=node.id;	// Set our anscestor node to us
			node.x=0;
			node.mod=0;
			node.shift=0;
			node.change=0;
			node.thread=null;		// these 'threads' are special links in the tree
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
				// Our x needs to leave space for our left brother
				v.x = nodeList.nodes[v.leftBrother].x + 
				    nodeList.nodes[v.leftBrother].width() +
					amCanvas.padX;
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
			var midpoint = (leftMostChild.x + rightMostChild.x + rightMostChild.width())/2;
			var w = v.leftBrother;
			if(w!=null){
				v.x=nodeList.nodes[w].x + nodeList.nodes[w].width() + amCanvas.padX;
				v.mod=v.x-midpoint + v.width()/2;
			}else{
				v.x=midpoint - v.width()/2;
			}
		}
	},
	secondWalk: function(node, m, y){
		m = ( typeof m == 'undefined') ? 0 : m;
		y = ( typeof y == 'undefined') ? 0 : y;
		var v = nodeList.nodes[node];
		v.x = v.x + m;
		v.y = y;
		for(var w in v.children){
			this.secondWalk(v.children[w], m+v.mod, y+amCanvas.gridY+amCanvas.padY );
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
				shift = (vil.x+sil)-(vir.x+sir)+vir.width() + amCanvas.padX;
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
