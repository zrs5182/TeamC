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
      if(myName==="complexText"||myName==="claimTextArea"){
        var div = document.getElementById('myTextArea');
        div.innerHTML = canvasController.makeTextArea(myId);
        document.getElementsByName('working')[0].focus();
      }else if(myName==="supportButton"){
        canvasController.addClaim("support", myX, parseInt(myY)+1, myId);
      }else if(myName==="refuteButton"){
        if(myType==="refute"){
          canvasController.addClaim("rebut", myX, parseInt(myY)+1, myId);
        }else{
          canvasController.addClaim("refute", myX, parseInt(myY)+1, myId);
        }
      }else if(myName==="deleteButton"){
      	//console.log(myId);
      	claimController.removeClaim(myId);
      	      		
      }
      var claim = stage.get(".claim")[stage.get(".claim").length-1];
      var support = stage.get(".supportButton")[stage.get(".supportButton").length-1];
      var refute = stage.get(".refuteButton")[stage.get(".refuteButton").length-1];
      var deleteButton = stage.get(".deleteButton")[stage.get(".deleteButton").length-1];
      var connector = stage.get(".connector")[stage.get(".connector").length-1];
      claim.transitionTo({
          opacity: 1,
          duration: .25
      });
      support.transitionTo({
        opacity: 1,
        duration: .25
      });
      refute.transitionTo({
        opacity: 1,
        duration: .25
      });
      deleteButton.transitionTo({
        opacity: 1,
        duration: .25
      });
      connector.transitionTo({
        opacity: 1,
        duration: .25
      });
    
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
    var oldScalar = layer.getScale().x;
    var scalar=layer.getScale().x+zoomAmount;
    if(scalar<0) scalar=.1;
    layer.setScale(scalar);
    if(document.getElementsByName("working")[0]){
      var workingArea = document.getElementsByName("working")[0];
      var textArea = document.getElementById("myTextArea");
      var canvas = store.get("canvas");
      var claim = store.get(document.getElementsByName("working")[0].id);
      var gridX=parseInt(canvas.gridX);
      var gridY=parseInt(canvas.gridY);
      var scale=layer.getScale().x;
      var center=parseInt(canvas.center);
      var realX=Math.round((parseInt(claim.x)*parseInt(canvas.gridX)*1.5+center+37)*scale)+stage.getAbsoluteTransform().getTranslation().x;
      var realY=Math.round((parseInt(claim.y)*parseInt(canvas.gridY)*1.5+37)*scale)+stage.getAbsoluteTransform().getTranslation().y;
      textArea.style.left = realX + "px";
      textArea.style.top =  realY + "px";
      workingArea.style.fontSize = (16*scale)+"px"
      workingArea.style.width=(parseInt(canvas.gridX)-78)*scalar+"px";
      workingArea.style.height=(parseInt(store.get("canvas").gridY)*scale*.6)+"px";
    }
    layer.draw();
}