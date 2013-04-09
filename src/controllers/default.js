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
        strokeWidth: 4
      });

      // add the triangle shape to the layer
      layer.add(contention);

      // add the layer to the stage
      stage.add(layer);