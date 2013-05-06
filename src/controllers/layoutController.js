addNode = function(newId, newType, newParent=null){
  var newNode = {
    id: newId,
    type: newType,
    text: newId,
    x: 0,
    y: 0,
    tree: 0,
    children: [],
    parent: newParent,
    thread: null,
    //offset: 0,
    ancestor: newId,
    change: 0,
    shift: 0,
    leftMostSibling: null,
    leftBrother: null,
    number: null,
    mod: 0
  }
  var myParent = store.get(newParent);
  if(newType==="support"){
    myParent.children.unshift(newId);
  }else if(newType==="refute"||newType==="rebut"){
    myParent.children.push(newId);
  }
  store.set(newId, newNode);
  if(myParent){
    store.set(myParent.id, myParent);
  }
}
/////////////////////////////////
function buckheim(root){
  readyTree(root);
  firstWalk(root);
  secondWalk(root);
  fixText(root);
}
function fixText(node){
  setTimeout(function(){
    for(key in localStorage){
      if(key!="canvas"){
        item = store.get(key).id;
        var oldText = stage.get(".complexText")[item];
        if(oldText){
          oldText.setAttr("x", parseInt(store.get("canvas").center)+((store.get(item).x)-(store.get(0).x))*parseInt(store.get("canvas").gridX)/2*3+30);
        }
      }
      layer.draw();
      console.log(localStorage);
    }
  },.01);
}
function readyTree(node){
  for(key in localStorage){
    if(key!="canvas"){
      var item = store.get(key);
      item.x = 0;
      item.mod = 0;
      item.shift = 0;
      item.change = 0;
      item.thread = null;
      //item.leftBrother = null;
      //item.leftMostSibling = null;
      store.set(item.id, item);
    }
  }
  var v = store.get(node);
  if(v.parent!=null && v.id!=store.get(v.parent).children[0]){
    v.leftMostSibling = store.get(v.parent).children[0];
  }
  if(v.parent!=null){
    v.number = store.get(v.parent).children.indexOf(v.id)+1;
    if(v.number>1){
      leftBrotherIndex = v.number-2;
      v.leftBrother = store.get(v.parent).children[leftBrotherIndex];
    }
  }
  store.set(v.id, v);
  for(var w in v.children){
    readyTree(v.children[w]);
  }
}

function firstWalk(node){
  var v = store.get(node);
  if(v.children[0]==null){
    if(v.leftBrother){
      v.x = store.get(v.leftBrother).x+1;
    }else{
      v.x=0;
    }
  }else{
    var defaultAncestor = v.children[0];
    for(var w in v.children){
      firstWalk(v.children[w]);
      defaultAncestor=apportion(v.children[w], defaultAncestor);////////////////////
    }
    executeShifts(v);
    var leftMostChild = store.get(v.children[0]);
    var rightMostChild = store.get(v.children[v.children.length-1]);
    var midpoint = (leftMostChild.x + rightMostChild.x)/2;
    var w = v.leftBrother;
    if(w!=null){
      v.x=store.get(w).x+1;
      v.mod=v.x-midpoint;
    }else{
      v.x=midpoint;
    }
  }
  store.set(v.id, v);
}
function secondWalk(node, m=0, depth=0){
  var v = store.get(node);
  // if(v.x+m<store.get(0).x){
  //  v.x = Math.ceil(v.x + m);
  // }else{
  //  v.x = Math.floor(v.x + m);
  // }
  v.x = v.x + m;
  v.y = depth;
  store.set(v.id, v);
  for(var w in v.children){
    secondWalk(v.children[w], m+v.mod, depth+1);
  }
  var oldText = stage.get(".complexText")[node.id];
  //oldText.setAttr("x", parseInt(store.get("canvas").center)+parseInt(node.x)*parseInt(store.get("canvas").gridX)/2*3+30);
                
}
function apportion(node, defaultAncestor){
  var v = store.get(node);
  var w = v.leftBrother;
  if(w != null){
    var vir = v;
    var vor = v;
    var vil = store.get(w);
    var vol = store.get(v.leftMostSibling);
    var sir = vir.mod;
    var sor = vor.mod;
    var sil = vil.mod;
    var sol = vol.mod;
    var shift=0;
    while(right(vil) && left(vir)){
      vil = store.get(right(vil));
      vir = store.get(left(vir));
      vol = store.get(left(vol));
      vor = store.get(right(vor));
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
    store.set(vor.id, vor);
    store.set(vol.id, vol);
  }
  return defaultAncestor;////////////////////////
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
  store.set(wl.id, wl);
  store.set(wr.id, wr);
}
function ancestor(vil, v, defaultAncestor){
  if(store.get(v.parent).children.indexOf(vil.ancestor)){
    return store.get(vil.ancestor);
  }else{
    return store.get(defaultAncestor);
  }
}
function executeShifts(v){
  var shift = 0;
  var change = 0;
  //v.children.reverse();
  for(var w in v.children){
    var child = store.get(v.children[w]);
    child.x = child.x + shift;
    child.mod = child.mod + shift;
    change = change + child.change;
    shift = shift + child.shift + change;
    store.set(child.id, child);
  }
  //v.children.reverse();
}
// 
// addNode(0,"contention");
// //buckheim(0);
// addNode(1,"refute",0);
// //buckheim(0);
// addNode(2,"refute", 0);
// //buckheim(0);
// addNode(3,"support",0);
// //buckheim(0);
// addNode(4,"support",0);
// //buckheim(0);
// addNode(5,"support",0);
// //buckheim(0);
// addNode(6,"support",1);
// //buckheim(0);
// addNode(7,"support",1);
// buckheim(0);
// console.log(localStorage);
// for(var key = 0; key<localStorage.length; key++){
  // var node = store.get(key);
  // console.log(node.id+": "+node.x+","+node.y+" -parent: "+node.parent);
// }