var container=document.getElementById("container");
var stage = new Kinetic.Stage({
  container: 'container',
  width: container.clientWidth,
  height: container.clientHeight,
  draggable: true
});
var layer = new Kinetic.Layer();

var contention = new Kinetic.Shape({
  drawFunc: function(canvas) {
    var context = canvas.getContext();
    context.beginPath();
    x=container.clientWidth/2;
    y=container.clientHeight/2;
    w=200;
    h=100;
    r=11;
    context.moveTo(x-0.5*w+r, y-0.5*h);
    context.arcTo(x+0.5*w, y-0.5*h, x+0.5*w, y+0.5*h, r);
    context.arcTo(x+0.5*w, y+0.5*h, x-0.5*w, y+0.5*h, r);
    context.arcTo(x-0.5*w, y+0.5*h, x-0.5*w, y-0.5*h, r);
    context.arcTo(x-0.5*w, y-0.5*h, x+0.5*w, y-0.5*h, r);
    context.closePath();
    canvas.fillStroke(this);
  },
  fill: 'white',
  stroke: 'black',
  draggable: true,
  strokeWidth: 4
});
var supportButton = new Kinetic.Shape({
  drawFunc: function(canvas) {
    var context = canvas.getContext();
    context.beginPath();
    x=container.clientWidth/2;
    y=container.clientHeight/2;
    w=50;
    h=50;
    r=5;
    context.moveTo(x-0.5*w+r, y-0.5*h);
    context.arcTo(x+0.5*w, y-0.5*h, x+0.5*w, y+0.5*h, r);
    context.arcTo(x+0.5*w, y+0.5*h, x-0.5*w, y+0.5*h, r);
    context.arcTo(x-0.5*w, y+0.5*h, x-0.5*w, y-0.5*h, r);
    context.arcTo(x-0.5*w, y-0.5*h, x+0.5*w, y-0.5*h, r);
    context.closePath();
    canvas.fillStroke(this);
  },
  fill: 'green',
  stroke: 'black',
  strokeWidth: 2,
        drawHitFunc: function(canvas) {
          var context = canvas.getContext();
          context.beginPath();
          x=container.clientWidth/2;
          y=container.clientHeight/2;
          w=50;
          h=50;
          r=5;
          context.moveTo(x-0.5*w+r, y-0.5*h);
          context.arcTo(x+0.5*w, y-0.5*h, x+0.5*w, y+0.5*h, r);
          context.arcTo(x+0.5*w, y+0.5*h, x-0.5*w, y+0.5*h, r);
          context.arcTo(x-0.5*w, y+0.5*h, x-0.5*w, y-0.5*h, r);
          context.arcTo(x-0.5*w, y-0.5*h, x+0.5*w, y-0.5*h, r);
          context.closePath();
          canvas.fillStroke(this);
        }
});

supportButton.on('mousedown', function() {
        alert('Mousedown supportButton');
});

// add the contention to the layer
layer.add(contention);
layer.add(supportButton);

// add the layer to the stage
stage.add(layer);

if (typeof(supportButton)!=='undefined'){
  alert('support button exists');
};