var container=document.getElementById("container");
document.getElementById("menuArea").left=window.innerWidth-50;
var myText = 'foo';
var stage = new Kinetic.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight,
  getWidth : function(){
    return this.width;
  },
  getHeight : function(){
    return this.height;
  },
  draggable: true
});
var layer = new Kinetic.Layer();

canvasController.newCanvas();

stage.add(layer);

layer.on('click', function(event) {
      var node = event.targetNode;
      var myName = node.attrs.name;
      var myId = node.attrs.id;
      var myType = store.get(myId).type;
      var myX = store.get(myId).x;
      var myY = store.get(myId).y;
      console.log("layer: " + event.targetNode.getAbsoluteTransform().getTranslation().x + ", " + event.targetNode.getAbsoluteTransform().getTranslation().y);
      //console.log(event.targetNode.getAbsoluteTransform().getTranslation());
      if(myName==="complexText"||myName==="claimTextArea"){
        var div = document.getElementById('myTextArea');
        div.innerHTML = canvasController.makeTextArea(myId);
        document.getElementById('working').focus();
      }else if(myName==="supportButton"){
        canvasController.addClaim("support", myX, parseInt(myY)+1, myId);
      }else if(myName==="refuteButton"){
        if(myType==="refute"){
          canvasController.addClaim("rebut", myX, parseInt(myY)+1, myId);
        }else{
          canvasController.addClaim("refute", myX, parseInt(myY)+1, myId);
        }
      }else if(myName==="deleteButton"){
        
      }
      // console.log(localStorage);
    });

window.onload = function()
{
    //adding the event listener for Mozilla
    if(window.addEventListener)
        document.addEventListener('DOMMouseScroll', zoom, false);
    //for IE/OPERA etc
    document.onmousewheel = zoom;
}
function zoom(event)
{
    var delta = 0;
    if (!event) event = window.event;
    // normalize the delta
    if (event.wheelDelta) {
        // IE and Opera
        delta = event.wheelDelta;
    } else if (event.detail) {
        // W3C
        delta = -event.detail;
    }
    var zoomAmount = delta*0.05;
    var scalar=layer.getScale().x+zoomAmount;
    //store.get(canvas).offset = parseFloat(store.get(canvas).offset)+layer.getAbsoluteTransform().getMatrix()[0]*zoomAmount*100;
    if(scalar<0) scalar=.1;
    layer.setScale(scalar);
    if(document.getElementById("working")!==null){
      document.getElementById("working").style.width=(parseInt(store.get("canvas").gridX)*scalar*.73)+"px";
      document.getElementById("working").style.height=(parseInt(store.get("canvas").gridY)*scalar*.6)+"px";
    }
    //layer.setOffset(parseFloat(store.get(canvas).offset),parseFloat(store.get(canvas).offset));   //figure out how to manipulate the offset correctly!!!
    layer.draw();
}