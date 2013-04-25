var supportButton = new Kinetic.Shape({
  drawFunc: function(canvas) {
    var context = canvas.getContext();
    context.beginPath();
    x=container.clientWidth/2.28;
    y=container.clientHeight/1.84;
    w=38;
    h=16;
    r=2;
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
          x=container.clientWidth/2.28;
          y=container.clientHeight/1.84;
          w=38;
          h=16;
          r=2;
          context.moveTo(x-0.5*w+r, y-0.5*h);
          context.arcTo(x+0.5*w, y-0.5*h, x+0.5*w, y+0.5*h, r);
          context.arcTo(x+0.5*w, y+0.5*h, x-0.5*w, y+0.5*h, r);
          context.arcTo(x-0.5*w, y+0.5*h, x-0.5*w, y-0.5*h, r);
          context.arcTo(x-0.5*w, y-0.5*h, x+0.5*w, y-0.5*h, r);
          context.closePath();
          canvas.fillStroke(this);
        }
});


var refuteButton = new Kinetic.Shape({
  drawFunc: function(canvas) {
    var context = canvas.getContext();
    context.beginPath();
    x=container.clientWidth/1.78;
    y=container.clientHeight/1.84;
    w=38;
    h=16;
    r=2;
    context.moveTo(x-0.5*w+r, y-0.5*h);
    context.arcTo(x+0.5*w, y-0.5*h, x+0.5*w, y+0.5*h, r);
    context.arcTo(x+0.5*w, y+0.5*h, x-0.5*w, y+0.5*h, r);
    context.arcTo(x-0.5*w, y+0.5*h, x-0.5*w, y-0.5*h, r);
    context.arcTo(x-0.5*w, y-0.5*h, x+0.5*w, y-0.5*h, r);
    context.closePath();
    canvas.fillStroke(this);
  },
  fill: 'red',
  stroke: 'black',
  strokeWidth: 2,
        drawHitFunc: function(canvas) {
          var context = canvas.getContext();
          context.beginPath();
          x=container.clientWidth/1.78;
          y=container.clientHeight/1.84;
          w=38;
          h=16;
          r=2;
          context.moveTo(x-0.5*w+r, y-0.5*h);
          context.arcTo(x+0.5*w, y-0.5*h, x+0.5*w, y+0.5*h, r);
          context.arcTo(x+0.5*w, y+0.5*h, x-0.5*w, y+0.5*h, r);
          context.arcTo(x-0.5*w, y+0.5*h, x-0.5*w, y-0.5*h, r);
          context.arcTo(x-0.5*w, y-0.5*h, x+0.5*w, y-0.5*h, r);
          context.closePath();
          canvas.fillStroke(this);
        }
});

var closeButton = new Kinetic.Shape({
  drawFunc: function(canvas) {
    var context = canvas.getContext();
    context.beginPath();
    x=container.clientWidth/1.75;
    y=container.clientHeight/2.2;
    w=15;
    h=15;
    r=2;
    context.moveTo(x-0.5*w+r, y-0.5*h);
    context.arcTo(x+0.5*w, y-0.5*h, x+0.5*w, y+0.5*h, r);
    context.arcTo(x+0.5*w, y+0.5*h, x-0.5*w, y+0.5*h, r);
    context.arcTo(x-0.5*w, y+0.5*h, x-0.5*w, y-0.5*h, r);
    context.arcTo(x-0.5*w, y-0.5*h, x+0.5*w, y-0.5*h, r);
    context.closePath();
    canvas.fillStroke(this);
  },
  fill: 'blue',
  stroke: 'black',
  strokeWidth: 2,
        drawHitFunc: function(canvas) {
          var context = canvas.getContext();
          context.beginPath();
          x=container.clientWidth/1.75;
          y=container.clientHeight/2.2;
          w=15;
          h=15;
          r=2;
          context.moveTo(x-0.5*w+r, y-0.5*h);
          context.arcTo(x+0.5*w, y-0.5*h, x+0.5*w, y+0.5*h, r);
          context.arcTo(x+0.5*w, y+0.5*h, x-0.5*w, y+0.5*h, r);
          context.arcTo(x-0.5*w, y+0.5*h, x-0.5*w, y-0.5*h, r);
          context.arcTo(x-0.5*w, y-0.5*h, x+0.5*w, y-0.5*h, r);
          context.closePath();
          canvas.fillStroke(this);
        }
});

supportButton.on('mousedown', function(claim) {
		alert('onclick supportButton');
});

refuteButton.on('mousedown', function(claim) {
        alert('onclick refuteButton');
});

closeButton.on('mousedown', function(claim) {
        alert('onclick closeButton');
});

