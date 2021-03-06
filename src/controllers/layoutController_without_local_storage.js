// vim: set tabstop=4 expandtab : //
// Implements the Buchheim layout algorithm, adapted from
// http://billmill.org/pymag-trees/
//
// Notable in this implementation is that there is no
// assumption that each node of the tree is of equal width

// The basic structure of an argument map will consist of two main
// object types: Reasons and Claims.  A Reason contains one or more
// Claims.  To reflect the tree structure, there is sort of a
// co-mingling parent-child relationship of Reasons and Claims:
// -- A Reason is a container that contains one or more Claims.
// -- All Reasons except the main contention have a "parent" that is a Claim
//    (and similarly, if a Claim has "children" the children are Reasons).
// -- For laying out, the "children" of a Reason (in the sense of arranging
//    the argument map tree visually) are actually the children of the Claims
//    contained in that Reason.  Similarly the "parent" of a Reason would be
//    the Reason containing our parent Claim for layout.
//
//    Note, since parent is a Javascript keyword, parents will be fathers in this code.

// Prototype function for a Claim object
function Claim( id, reason, width, height, text, children ) {
    this.id = id;           // Our unique ID in the claimList
    this.reason = reason;	// the Reason that contains this Claim
    this.width = width;		// width in pixels
    this.height = height;	// height in pixels
    this.text = text;		// the text of this Claim

    if( typeof(children) === 'undefined' ) {
        this.children = [];	// the children of this Claim (these are
    } else {                // supporting or objecting Reasons, not Claims)
        this.children = children;
    }
}

Claim.prototype = {
    x : function() {   // returns the x-coordinate of this claim box
        var x = this.reason.x;   // start from left x-coordinate of containing reason
        x += amCanvas.border;    // skip left window border

        // add space for any claims that are to our left until we get to us
        for( var i=0, leni=this.reason.claims.length; i < leni; i++ ) {
            var claim = this.reason.claims[i];

            if( claim === this ) { return x; }

            x += claim.width + amCanvas.claimXPad;
        }

        // shouldn't get here
        console.log( "Problem in Claim.x" );
    },

    y : function() {   // return the y-coordinate of this claim box
        return this.reason.y + amCanvas.border;
    },

    // Returns the "essential data" of this Claim object, suitable for saving
    // in an undo/redo structure or converting to JSON and recording to storage.
    data : function() {
        var mydata = {
            id : this.id,
            reason : this.reason.id,
            width : this.width,
            height : this.height,
            text : this.text,
            children : []
        }

        // Fill the children[] array with each child's unique id
        for( var i=0, leni=this.children.length; i < leni; i++ ) {
            mydata.children[i] = this.children[i].id;
        }

        return mydata;
    }
}


// Prototype function for a Reason object
function Reason( id, type, father, claims ) {
    father = ( typeof father === 'undefined' ) ? null : father;

    this.id = id;		    // The index in reasonList of this Reason (effectively a unique identifier)
    this.type = type;		// One of: contention, support, refute, rebut
    this.father = father;	// The father Claim of this Reason

    if( typeof(claims) === 'undefined' ) {
        this.claims = [ claimList.newClaim( this, amCanvas.claimX, amCanvas.claimY, "" ) ];	// initially contain a single blank claim
    } else {
        this.claims = claims;

        for( var i = claims.length-1; i >=0; i-- ) {
            claims[i].reason = this;
        }
    }

    // Add this reason to the children of its parent either on left or right
    // (only if father is an actual claim --- when reading data in from file
    // father will initially be just a numeric id and this will have to be
    // done by hand).
    if( type==="support" ){
        father.children && father.children.unshift( this );    // support goes on the left
    } else if( type==="refute" || type==="rebut" ) {
        father.children && father.children.push( this );       // opposes go on the right
    } else if( type==="contention" ) {
        // nothing to do here (no parents)
    } else {
        // Should never get here
        console.log( "Reason() bad type: " +  type );
    }

    // Call our reset function to finish initializing everything
    // this.reset();
}

Reason.prototype = {
    fatherR : function() {	// Helper function returns the Reason containing our parent Claim
        if( this.father !== null ) {
            return this.father.reason;
        } else {
            return null;
        }
    },

    children : function() {	// Helper function -- returns the children (Reasons) of our Claims
        var c = [];     // collected children
        for( var i=0, leni=this.claims.length; i < leni; i++ ) {
            var claim = this.claims[i];
            for( var j=0, lenj=claim.children.length; j < lenj; j++ ) {
                c.push( claim.children[j] );
            }
        }
        return c;
    },

    // Returns the left-most child of all the claims in this reason
    firstchild : function() {
        return this.children()[0];
    },

    // Returns the right-most child of all the claims in this reason
    lastchild : function() {
        var children = this.children();
        return children[ children.length - 1 ];
    },

    // Check to see if given reason is a child of one of our claims
    isChild : function( reason ) {
        for( var i = 0, leni = this.claims.length; i < leni; i++ ) {
            claim = this.claims[i];
            for( var j = 0, lenj = claim.children.length; j < lenj; j++ ) {
                if( reason === claim.children[j] ) return true;
            }
        }
        return false;
    },

    width : function() {	// The total width of this Reason
        // Add up the width of all the contained claims and padding and borders
        var w = 0;
        for( var i=0, leni=this.claims.length; i < leni; i++ ) {
            w += this.claims[i].width;
        }
        // Add the separating space between claims
        w += (this.claims.length - 1)*amCanvas.claimXPad;
        // Add the border space at the left and right edges of the reason
        w += 2*amCanvas.border;
        return w;
    },

    height : function() { // The total height of this Reason
        // Find height of tallest claim
        var h = 0;
        for( var i=0, leni=this.claims.length; i < leni; i++ ) {
            h = (this.claims[i].height > h) ? this.claims[i].height : h;
        }
        // Add upper and lower border
        h += 2*amCanvas.border;
        return h;
    },

    // Returns the "essential data" of this Reason object, suitable for saving
    // in an undo/redo structure or converting to JSON and recording to storage.
    data : function() {
        var mydata = {
            id : this.id,
            type : this.type,
            father : ( this.father === null ? this.father : this.father.id ),
            claims : []
        }

        // Fill the claims[] array with each claim's unique id
        for( var i=0, leni=this.claims.length; i < leni; i++ ) {
            mydata.claims[i] = this.claims[i].id;
        }

        return mydata;
    },

    // Resets/initializes all of the values needed to run the Buchheim layout algorithm
    reset : function () {
        this.x = 0;
        this.y = 0;
        this.tree = 0;
        this.ancestor = this;
        this.thread = null;
        this.change = 0;
        this.shift = 0;
        this.leftMostSibling = null;
        this.leftBrother = null;
        this.number = null;
        this.mod = 0;

        // If we aren't the first child of our parent, then there is a left-most child and a left-sibling.
        // (We won't call this if fatherR() doesn't have children, like when setting up from data.)
        if( this.fatherR() !== null && this.fatherR().children ) {
            var siblings = this.fatherR().children();

            // If the left-most child is not us, then set it as our left-most sibling
            if( siblings[0] !== this ) this.leftMostSibling = siblings[0];

            // Count through our siblings to find our immediately-left sibling
            for( var i=0, leni=siblings.length; i < leni; i++ ) {
                if( siblings[i] !== this ) {
                    this.leftBrother = siblings[i];
                } else {
                    // and remember what number child we were for counting subtrees later
                    this.number = i;
                    break;
                }
            }
        }
    }
}

// The basic structure required to undo an operation is the list
// of claims and reasons that existed before.
function Undo( reasons, claims ) {
    this.reasons = ( typeof(reasons) !== 'undefined' ? reasons : [] );
    this.claims =  ( typeof(claims) !== 'undefined' ? claims : [] );

}

Undo.prototype = {
    // Applies an undo, re-creating the state of the argument map as it existed previously.
    doit : function() {
        // These arrays will hold the Reasons and Claims as we re-construct the argument map
        var reasons = [];
        var claims = [];

        // Build back the reason list, just from data at first (then we'll hook
        // up all the object references).
        for( var i=0, leni=this.reasons.length; i<leni; i++ ) {
            var reason = this.reasons[i];

            reasons[i] = new Reason( reason.id, reason.type, reason.father, reason.claims.slice(0) );
        }

        // Build back the claim list, just from data at first (then we'll hook
        // up all the object references).
        for( var i=0, leni=this.claims.length; i<leni; i++ ) {
            var claim = this.claims[i];

            claims[i] = new Claim( claim.id, claim.reason, claim.width, claim.height,
                   claim.text, claim.children.slice(0) );
        }

        // Hook up the father and all the claims in each reason, replacing the index
        // values with references to the actual object.
        for( var i=0, leni=reasons.length; i<leni; i++ ) {
            var reason = reasons[i];

            if( reason.father !== null ) {
                reason.father = claims[ reason.father ];
            }

            for( var j=0, lenj=reason.claims.length; j<lenj; j++ ) {
                reason.claims[j] = claims[ reason.claims[j] ];
            }
        }

        // Hook up the (containing) reason and all the children in each claim, replacing the
        // index values with references to the actual object.
        for( var i=0, leni=claims.length; i<leni; i++ ) {
            var claim = claims[i];

            claim.reason = reasons[ claim.reason ];

            for( var j=0, lenj=claim.children.length; j<lenj; j++ ) {
                claim.children[j] = reasons[ claim.children[j] ];
            }
        }

        // Now hook these into the actual claimList and reasonList
        claimList.claims = claims;
        claimList.nextClaimNumber = claims.length;

        reasonList.reasons = reasons;
        reasonList.nextReasonNumber = reasons.length;
    }
}

var undoList = {
    undos: [],              // List of all Undo objects we're tracking
    undoIndex: 0,           // Where we are in the Undo list (for undo/redo)

    init: function( initialState ) {
        this.undos = [];

        if( typeof initialState === 'undefined' ) {
            this.undoIndex = 0;
            this.createUndo();   // create initial undo state
        } else {
            this.undoIndex = 1;
            this.undos[0] = initialState;   // load the initial state from data
                                            // (like reading a file for example)
        }
    },

    // Creates a new Undo object at the current index in the list, possibly truncating
    // some possible "redos" if we have exercised the undo feature already.  We'll call
    // this function after each argument map changing action.
    createUndo: function() {
        // These arrays will be "just the data" and not actual Reasons and Claims
        var reasons = [];
        var claims = [];

        // If we're mid-list then delete the tail of Undos before inserting new one
        if( this.undoIndex < this.undos.length ) {
            this.undos.splice( this.undoIndex, this.undos.length-this.undoIndex );
        }

        // Get array of all reason data
        for( var i=0,leni=reasonList.nextReasonNumber; i<leni; i++ ) {
            reasons[i] = reasonList.reasons[i].data();
        }

        // Get array of all claim data
        for( var i=0,leni=claimList.nextClaimNumber; i<leni; i++ ) {
            claims[i] = claimList.claims[i].data();
        }

        this.undos[this.undoIndex++] = new Undo( reasons, claims );

        // FIXME: possibly truncate the oldest member of the array for size?
    },

    applyUndo: function() {
        // Return if there is nothing to undo
        if( this.undoIndex <= 1 ) return;

        this.undoIndex--;
        this.undos[ this.undoIndex-1 ].doit();
    },

    applyRedo: function() {
        // Return if there is nothing to redo
        if( this.undoIndex >= this.undos.length ) return;

        this.undoIndex++;
        this.undos[ this.undoIndex-1 ].doit();
    },
}


// This is a master list of all claims in our argument map.
// Basically we use this to keep the association between
// individual claim objects and their integer unique ID numbers.
var claimList = {
    claims: [],                 // List of all claims
    nextClaimNumber: 0,         // Unique ID of next claim to create

    newClaim: function( reason, width, height, text ) {
        this.claims[this.nextClaimNumber] = new Claim( this.nextClaimNumber, reason, width, height, text );
        return this.claims[this.nextClaimNumber++];
    },

    deleteClaim: function( claim ) {
        var id = claim.id;

        // Remove the claim and decrease the next claim number
        this.claims.splice( id, 1 );
        this.nextClaimNumber--;

        // Update the id field of all the affected claims
        for(var i=id, leni=this.nextClaimNumber; i<leni; i++ ) {
            this.claims[i].id = i;
        }
    },

    init: function() {
        this.claims = [];
        this.nextClaimNumber = 0;
    }
}


// This is a representation of our argument tree containing
// all of the attributes required to do the Buchheim
// layout algorithm.
var reasonList = {
	reasons: [],					// List of the nodes in this tree
    nextReasonNumber : 0,

    init: function() {
        this.reasons = [];
        this.nextReasonNumber = 0;
    },

	// Push a new node (with default attributes) onto the list
    // Argument are a unique identifier, the type of reason to add,
    // and the Claim that is our direct parent.
    newReason: function( type, father, claims ) {
		father = ( typeof father === 'undefined') ? null : father;
        this.reasons[this.nextReasonNumber] = new Reason( this.nextReasonNumber, type, father, claims );
        return this.reasons[this.nextReasonNumber++];
    },

    deleteReason: function( reason ) {
        var id = reason.id;

        // Remove the claim and decrease the next claim number
        this.reasons.splice( id, 1 );
        this.nextReasonNumber--;

        // Update the id field of all the affected claims
        for(var i=id, leni=this.nextReasonNumber; i<leni; i++ ) {
            this.reasons[i].id = i;
        }
    },

	// Reset all of the attributes of each node (called just before laying out)
	resetList: function(){
		for( var i=0, leni=this.reasons.length; i < leni; i++ ) {
			reasonList.reasons[i].reset();
		}
	}
}

var amTree = {
	buchheim: function(root, anchor){
        // If we had an "anchor" claim, we'll make sure that one is held
        // steady after the layout is complete.
        var oldAnchorX, oldOffsetX;
        if( typeof( anchor ) !== 'undefined' ) {
            oldAnchorX = anchor.x();
            oldOffsetX = stage.getOffsetX();
        }
		reasonList.resetList();
		this.firstWalk(root);
		this.secondWalk(root);
        // Reset the offset so the anchor doesn't move
        if( typeof( anchor ) !== 'undefined' ) {
            stage.setOffsetX( oldOffsetX + anchor.x() - oldAnchorX );
        }
		canvasController.fixText();
		layer.draw();
		// localStorage.setItem("reasonList",JSON.stringify(reasonList.reasons));
	},
	firstWalk: function(v){
        //console.log( 'firstWalk: begins for v.id=' + v.id );
		//console.log(node);
		/*for(var child in reasonList.reasons){
			console.log(reasonList.reasons[child].id);
			if(reasonList.reasons[child].id==node){
				var v = reasonList.reasons[child];
				break;
			}
		}*/

        // If we don't have any children, then our horizontal position
        // will only depend on any siblings to the left.
        var vchildren = v.children();       // list of children of all Claims of v
		if(vchildren.length == 0){
            // If we have a left brother, then our position is directly right
			if(v.leftBrother){
				v.x = v.leftBrother.x + 
				    v.leftBrother.width() +
					amCanvas.padX;
			}else{ // Otherwise our position is 0
				v.x=0;
			}
		}else{
            // If we do have children, then we need to arrange all of them first,
            // and our position will be the midpoint between left-most and
            // right-most children.
			var defaultAncestor = vchildren[0];
			for(var w=0, lenw=vchildren.length; w < lenw; w++ ){
				this.firstWalk(vchildren[w]);
				defaultAncestor=this.apportion(vchildren[w], defaultAncestor);
			}
			this.executeShifts(v);
			var leftMostChild = v.firstchild();
			var rightMostChild = v.lastchild();
			var midpoint = (leftMostChild.x + rightMostChild.x + rightMostChild.width())/2
                - v.width()/2;

            // If we have a leftBrother, then both its position and the layout
            // of our children determine our position.  Otherwise, just the
            // children matter.
			var w = v.leftBrother;
			if(w!=null){
				v.x=w.x + w.width() + amCanvas.padX;
				v.mod=v.x-midpoint;
			}else{
				v.x=midpoint;
			}
		}
	},
	secondWalk: function(v, m, y){
		m = ( typeof m == 'undefined') ? 0 : m;
		y = ( typeof y == 'undefined') ? 0 : y;
		
		v.x = v.x + m;
		v.y = y;

        var vchildren=v.children();       // list of children of all Claims of v
        for(var w=0, lenw=vchildren.length; w < lenw; w++ ){
			this.secondWalk(vchildren[w], m+v.mod, y+amCanvas.gridY+amCanvas.padY );
		}
	},
	apportion: function(v, defaultAncestor){
		var w = v.leftBrother;
		if(w != null){
			var vir = v;
			var vor = v;
			var vil = w;
			var vol = v.leftMostSibling;
			var sir = vir.mod;
			var sor = vor.mod;
			var sil = vil.mod;
			var sol = vol.mod;
			var shift=0;

			while(this.right(vil) && this.left(vir)){
				vil = this.right(vil);
				vir = this.left(vir);
				vol = this.left(vol);
				vor = this.right(vor);
				vor.ancestor = v;
				shift = (vil.x+sil)-(vir.x+sir)+vil.width() + amCanvas.padX;
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
	left: function(node){       // return left-most child of a node (or sometimes a thread)
		if(node.firstchild()){
			return node.firstchild();
		}
		return node.thread;
	},
	right: function(node){      // return right-most child of a node (or sometimes a thread)
		if(node.lastchild()){
			return node.lastchild();
		}
		return node.thread;
	},
	moveSubtree: function(wl, wr, shift){
		var subtrees = wr.number-wl.number;
		wr.change -= shift/subtrees;
		wr.shift += shift;
		wl.change += shift/subtrees;
		wr.x += shift;
		wr.mod += shift;
	},
	ancestor: function(vil, v, defaultAncestor){
        if( v.fatherR().isChild( vil.ancestor )) {
			return vil.ancestor;
		}else{
			return defaultAncestor;
		}
	},
	executeShifts: function(v){
        var children = v.children();

		var shift = 0;
		var change = 0;

		for( var i = children.length-1; i>=0; i--){
			var w = children[i];
			w.x += shift;
			w.mod += shift;
			change += w.change;
			shift += w.shift + change;
		}
	}
}
