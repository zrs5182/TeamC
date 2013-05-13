var canvasController = {
  newCanvas : function(){
    localStorage.clear();
    stage.clear();
    store.set("canvas", {
      // minX : 0,
      // maxX : 0,
      // maxY : 1,
      gridX : 300,
      gridY : 200,
      center : container.clientWidth/2 - 150, //half of gridX
      // claimCount : 0
    });
    canvasController.addClaim("contention");
  },
    displayLoad: function(){
        var loadArea = document.getElementById("loadArea");
        var currentLoadDisplay=loadArea.style.display;
        if(currentLoadDisplay=="none"){
            loadArea.style.paddingRight="100px";
            loadArea.style.display="inline";
        }else{
            loadArea.style.display="none";
        }
    },
    displayMenu: function(){
        var menu=document.getElementById("nav");
        var currentMenuDisplay=menu.style.display;
        if(currentMenuDisplay=="none"){
            menu.style.display="block";
        }else{
            menu.style.display="none";
            document.getElementById("loadArea").style.display="none";
        }
    },
  makeTextArea : function(myId) {
    var claim = store.get(myId);
    var canvas = store.get("canvas");
    var gridX=(canvas.gridX);
    var gridY=(canvas.gridY);
    var scale=layer.getScale().x;
    var center=(canvas.center);
    var realX=Math.round((((claim.x)-(store.get(0).x))*(canvas.gridX)*1.5+center+37)*scale)+stage.getAbsoluteTransform().getTranslation().x;
    var realY=Math.round(((claim.y)*(canvas.gridY)*1.5+37)*scale)+stage.getAbsoluteTransform().getTranslation().y;
    document.getElementById('myTextArea').style.left = realX + "px";
    document.getElementById('myTextArea').style.top =  realY + "px";
    document.getElementById('myTextArea').style.zIndex = 2;
    return "<textarea style='font-size: "+(16*scale)+"px; width: "+(((store.get("canvas").gridX)-78)*scale)+"px; height: "+(store.get("canvas").gridY*scale*.6)+"px;' name='working' id="+claim.id+" onfocus='this.select();' onblur='canvasController.removeTextArea(" + myId + ")'>" + store.get(myId).text + "</textarea>"
  },
  extractText : function() {
    return document.getElementsByName('working')[0].value;
  },
  removeTextArea : function(myId) {
  	var claim = store.get(myId);
  	claim.text = canvasController.extractText();
  	store.set(myId, claim);
    document.getElementById('myTextArea').innerHTML = '';
    document.getElementById('myTextArea').style.zIndex = 0;
    var thisText = stage.get('.complexText')[myId];
    thisText.setText(store.get(myId).text);
  },
  addClaim : function(type, parent=null){
    var myId = nextClaimNumber;
    nextClaimNumber = myId+1;
    addNode(myId, type, parent);
    buckheim(0);
    canvasController.drawClaim(myId);
    document.getElementById("myTextArea").innerHTML=canvasController.makeTextArea(myId);
    document.getElementsByName('working')[0].focus();
  },
  removeClaim: function(id){
    layer.destroy();
    layer = new Kinetic.Layer();
    stage.add(layer);
    var node = store.get(id);
    
    if(node!=0){
      var parent = store.get(node.parent);
      console.log(parent.children.splice(node.number-1, 1)+" removed");
      store.set(parent.id,parent);
    }
    localStorage.removeItem(id);
    console.log(parent.children);
    for(var key in localStorage){
      if(key!="canvas"){
        canvasController.drawClaim(store.get(key).id);
        console.log(layer.children);
        for(var shape in layer.children){
          console.log(shape.name);
          if(shape.name != "connector"){
            shape.drawHitFunc();
          } 
        }
      }
    }
    setTimeout(function(){readyTree(0);},100);
    setTimeout(function(){
      firstWalk(0);
      secondWalk(0);
      fixText(0);
    },500);
  },
  drawClaim : function(myId){
    var claim = new Kinetic.Shape({
      id: myId,
      name: "claim",
      drawFunc: function(canvas) {
        var myCanvas = store.get("canvas");
        var context = canvas.getContext();
        var x=(myCanvas.center)+((store.get(myId).x)-(store.get(0).x))*(myCanvas.gridX)/2*3;
        var y=(store.get(myId).y)*(myCanvas.gridY)/2*3;
        var w=(myCanvas.gridX);
        var h=(myCanvas.gridY);
        var r=12;
        var o=30;
        // console.log("drawing claim "+myId+", x value "+x+", should be ");
        // console.log((myCanvas.center)+"+"+((store.get(myId).x)-(store.get(0).x))+"*"+(myCanvas.gridX)/2*3);
        // console.log((myCanvas.center)+((store.get(myId).x)-(store.get(0).x))*(myCanvas.gridX)/2*3)
        context.beginPath();
          context.moveTo(x+r,y);
          context.arcTo(x+w,y,x+w,y+r,r);
          context.arcTo(x+w,y+h,x+w-r,y+h,r);
          context.arcTo(x,y+h,x,y+h-r,r);
          context.arcTo(x,y,x+r,y,r);
        context.closePath();
        if(store.get(myId).type==="support"){
          this.setFill('#6CC54F');
        }else if(store.get(myId).type==="refute"){
          this.setFill('#E60000');
        }else if(store.get(myId).type==="rebut"){
          this.setFill('orange');
        }else{
          this.setFill('blue');
        }
        canvas.fillStroke(this);
      },
      stroke: 'black',
      strokeWidth: 2
    });
    
    var claimTextArea = new Kinetic.Shape({
      id: (store.get(myId).id),
      drawFunc: function(canvas) {
        var context = canvas.getContext();
        var x = (store.get("canvas").center)+((store.get(myId).x)-(store.get(0).x))*(store.get("canvas").gridX)/2*3;
        var y = (store.get(myId).y)*(store.get("canvas").gridY)/2*3;
        var w = (store.get("canvas").gridX);
        var h = (store.get("canvas").gridY);
        var r = 12;
        var o = 30;
        context.beginPath();
          context.moveTo(x+r+o,y+o);
          context.arcTo(x+w-o,y+o,x+w-o,y+r/2+o,r/2);
          context.arcTo(x+w-o,y+h-o,x+w-r/2-o,y+h-o,r/2);
          context.arcTo(x+o,y+h-o,x+o,y+h-r/2-o,r/2);
          context.arcTo(x+o,y+o,x+r/2+o,y+o,r/2);
          context.closePath();
          this.setFill('white');
          if(store.get(myId).type==="contention"){
            this.setFill('white');
            this.setStroke('black');
            this.setStrokeWidth(2);
          }
        canvas.fillStroke(this);
      },
      stroke: 'black',
      strokeWidth: 2,
      name: 'claimTextArea',
      drawHitFunc: function(canvas) {
        var context = canvas.getContext();
        var x = (store.get("canvas").center)+((store.get(myId).x)-(store.get(0).x))*(store.get("canvas").gridX)/2*3;
        var y = (store.get(myId).y)*(store.get("canvas").gridY)/2*3;
        var w = (store.get("canvas").gridX);
        var h = (store.get("canvas").gridY);
        var r = 12;
        var o = 30;
        context.beginPath();
        context.moveTo(x+r+o,y+o);
        context.arcTo(x+w-o,y+o,x+w-o,y+r/2+o,r/2);
        context.arcTo(x+w-o,y+h-o,x+w-r/2-o,y+h-o,r/2);
        context.arcTo(x+o,y+h-o,x+o,y+h-r/2-o,r/2);
        context.arcTo(x+o,y+o,x+r/2+o,y+o,r/2);
        context.closePath();
        canvas.fillStroke(this);
      }
    });
    var supportButton = new Kinetic.Shape({
      id: (store.get(myId).id),
      drawFunc: function(canvas) {
        var context = canvas.getContext();
        var x = (store.get("canvas").center)+((store.get(myId).x)-(store.get(0).x))*(store.get("canvas").gridX)/2*3;
        var y = (store.get(myId).y)*(store.get("canvas").gridY)/2*3;
        var w = (store.get("canvas").gridX);
        var h = (store.get("canvas").gridY);
        var r = 12;
        var o = 30;
        context.beginPath();
          context.moveTo(x,y+h-o-r);
          context.bezierCurveTo(x,y+h,x+w/2,y+h-o-r,x+w/2,y+h);
          context.arcTo(x,y+h,x,y+h-o-r,r);
          context.closePath();
         this.setFill('green');
        canvas.fillStroke(this);
      },
      stroke: 'black',
      strokeWidth: 2,
      name: 'supportButton',
      drawHitFunc: function(canvas) {
        var context = canvas.getContext();
        var x = (store.get("canvas").center)+((store.get(myId).x)-(store.get(0).x))*(store.get("canvas").gridX)/2*3;
        var y = (store.get(myId).y)*(store.get("canvas").gridY)/2*3;
        var w = (store.get("canvas").gridX);
        var h = (store.get("canvas").gridY);
        var r = 12;
        var o = 30;
        context.beginPath();
        context.moveTo(x,y+h-o-r);
        context.bezierCurveTo(x,y+h,x+w/2,y+h-o-r,x+w/2,y+h);
        context.arcTo(x,y+h,x,y+h-o-r,r);
        context.closePath();
        canvas.fillStroke(this);
      }
      
    });
    
    var refuteButton = new Kinetic.Shape({
      id: (store.get(myId).id),
      drawFunc: function(canvas) {
        var context = canvas.getContext();
        var x = (store.get("canvas").center)+((store.get(myId).x)-(store.get(0).x))*(store.get("canvas").gridX)/2*3;
        var y = (store.get(myId).y)*(store.get("canvas").gridY)/2*3;
        var w = (store.get("canvas").gridX);
        var h = (store.get("canvas").gridY);
        var r = 12;
        var o = 30;
        context.beginPath();
          context.moveTo(x+w,y+h-o-r);
          context.bezierCurveTo(x+w,y+h,x+w/2,y+h-o-r,x+w/2,y+h);
          context.arcTo(x+w,y+h,x+w,y+h-o-r,r);
          context.closePath();
          if(store.get(myId).type!=="refute"){
            this.setFill('red');
          }else{
            this.setFill('orange');
          }
        canvas.fillStroke(this);
      },
      stroke: 'black',
      strokeWidth: 2,
      name: 'refuteButton',
      drawHitFunc: function(canvas) {
        var context = canvas.getContext();
        var x = (store.get("canvas").center)+((store.get(myId).x)-(store.get(0).x))*(store.get("canvas").gridX)/2*3;
        var y = (store.get(myId).y)*(store.get("canvas").gridY)/2*3;
        var w = (store.get("canvas").gridX);
        var h = (store.get("canvas").gridY);
        var r = 12;
        var o = 30;
        context.beginPath();
        context.moveTo(x+w,y+h-o-r);
        context.bezierCurveTo(x+w,y+h,x+w/2,y+h-o-r,x+w/2,y+h);
        context.arcTo(x+w,y+h,x+w,y+h-o-r,r);
        context.closePath();
        canvas.fillStroke(this);
      }
      
    });
    
    var deleteButton = new Kinetic.Shape({
      id: (store.get(myId).id),
      drawFunc: function(canvas) {
        var context = canvas.getContext();
        var x = (store.get("canvas").center)+((store.get(myId).x)-(store.get(0).x))*(store.get("canvas").gridX)/2*3;
        var y = (store.get(myId).y)*(store.get("canvas").gridY)/2*3;
        var w = (store.get("canvas").gridX);
        var h = (store.get("canvas").gridY);
        var r = 12;
        var o = 30;
        context.beginPath();
          context.moveTo(x+w-2*o-r,y);
          context.bezierCurveTo(x+w-o,y,x+w,y+o,x+w,y+2*o+r);
          context.arcTo(x+w,y,x+w-o-r,y,r);
          context.closePath();
          this.setFill('#FFFF73');
        canvas.fillStroke(this);
      },
      stroke: 'black',
      strokeWidth: 2,
      name: 'deleteButton',
      drawHitFunc: function(canvas) {
        var context = canvas.getContext();
        var x = (store.get("canvas").center)+((store.get(myId).x)-(store.get(0).x))*(store.get("canvas").gridX)/2*3;
        var y = (store.get(myId).y)*(store.get("canvas").gridY)/2*3;
        var w = (store.get("canvas").gridX);
        var h = (store.get("canvas").gridY);
        var r = 12;
        var o = 30;
        context.beginPath();
        context.moveTo(x+w-2*o-r,y);
        context.bezierCurveTo(x+w-o,y,x+w,y+o,x+w,y+2*o+r);
        context.arcTo(x+w,y,x+w-o-r,y,r);
        context.closePath();
        canvas.fillStroke(this);
      }
      
    });
    
    var complexText = new Kinetic.Text({
      id: myId,
      name: "complexText",
      x: parseInt(store.get("canvas").center)+((store.get(myId).x)-(store.get(0).x))*(store.get("canvas").gridX)/2*3+30,
      y: (store.get(myId).y)*(store.get("canvas").gridY)/2*3+30,
      text: store.get(myId).text,
      fontSize: 18,
      fontFamily: 'Calibri',
      fill: '#555',
      width: store.get("canvas").gridX-60,
      padding: 20,
      align: 'left'
    });
    if(myId!==0){
      var connector = new Kinetic.Shape({
        id: myId,
        drawFunc: function(canvas) {
          var myCanvas = store.get("canvas");
          var context = canvas.getContext();
          var x = (myCanvas.center)+((store.get(myId).x)-(store.get(0).x))*(myCanvas.gridX)/2*3;
          var y = (store.get(myId).y)*(myCanvas.gridY)/2*3;
          var w = (myCanvas.gridX);
          var h = (myCanvas.gridY);
          var r = 12;
          var o = 30;
          var type = store.get(myId).type;
          if(type!=="contention"){
            var parentX=(myCanvas.center)+((store.get(store.get(myId).parent).x)-(store.get(0).x))*(myCanvas.gridX)/2*3;
            var parentY=(store.get(store.get(myId).parent).y)*(myCanvas.gridY)/2*3;
            var parentW=(myCanvas.gridX);
            var parentH=(myCanvas.gridY);
            context.beginPath();
              if(store.get(myId).type==="support"&&store.get(myId).x<=store.get(store.get(myId).parent).x){
                var firstX = x+(w/2)+(2*o);
                var firstY = y+1;
                var secondX = parentX+(parentW/2);
                var secondY = parentY+parentH;
                var thirdX = parentX-2;
                var thirdY = parentY+parentH-r-o-5;
                var fourthX = x+(w/2)-(2*o);
                var fourthY = y+1;
                var changeX12 = secondX-firstX;
                var changeX34 = thirdX-fourthX;
                var changeY12 = firstY-secondY;
                var changeY34 = fourthY-thirdY;
                var bufferLeft = -20;
                var bufferRight = +20;
                context.moveTo(firstX,firstY);
                context.bezierCurveTo(firstX+((secondX-firstX)/2)/changeX12,secondY+((firstY-secondY)/2)/changeY12+bufferRight,secondX-((secondX-firstX)/2)/changeX12,firstY-((firstY-secondY)/2)/changeY12+bufferLeft,secondX,secondY);
                context.arcTo(parentX,parentY+parentH,thirdX,thirdY,r);
                context.bezierCurveTo(thirdX-((thirdX-fourthX)/2)/changeX34,fourthY-((fourthY-thirdY)/2)/changeY34+bufferLeft,fourthX+((thirdX-fourthX)/2)/changeX34,thirdY+((fourthY-thirdY)/2)/changeY34+bufferRight,fourthX,fourthY);
                context.lineTo(firstX,firstY);
              }else if(store.get(myId).type==="support"){
                var firstX = x+(w/2)-(2*o);
                var firstY = y+1;
                var secondX = parentX+r;
                var secondY = parentY+parentH;
                var thirdX = parentX+(parentW/2);
                var thirdY = parentY+parentH;
                var fourthX = x+(w/2)+(2*o);
                var fourthY = y+1;
                var bufferLeft = 20;
                var bufferRight = -20;
                context.moveTo(firstX,firstY);
                context.bezierCurveTo(firstX+bufferRight,secondY+bufferLeft,secondX+bufferRight,firstY+bufferLeft,secondX,secondY);
                context.lineTo(thirdX,thirdY);
                context.bezierCurveTo(thirdX+2*bufferLeft,fourthY+bufferRight,fourthX+bufferLeft,thirdY+bufferRight,fourthX,fourthY);
                context.lineTo(firstX,firstY);
              }else if((store.get(myId).type==="refute"||store.get(myId).type==="rebut")&&store.get(myId).x>=store.get(store.get(myId).parent).x){
                var firstX = x+(w/2)-(2*o);
                var firstY = y+1;
                var secondX = parentX+(parentW/2);
                var secondY = parentY+parentH;
                var thirdX = parentX+parentW+2;
                var thirdY = parentY+parentH-r-o-5;
                var fourthX = x+(w/2)+(2*o);
                var fourthY = y+1;
                var changeX12 = secondX-firstX;
                var changeX34 = thirdX-fourthX;
                var changeY12 = firstY-secondY;
                var changeY34 = fourthY-thirdY;
                var bufferLeft = -20;
                var bufferRight = +20;
                context.moveTo(firstX,firstY);
                context.bezierCurveTo(firstX+((secondX-firstX)/2)/changeX12,secondY+((firstY-secondY)/2)/changeY12+bufferRight,secondX-((secondX-firstX)/2)/changeX12,firstY-((firstY-secondY)/2)/changeY12+bufferLeft,secondX,secondY);
                context.arcTo(parentX+parentW,parentY+parentH,thirdX,thirdY,r);
                context.bezierCurveTo(thirdX-((thirdX-fourthX)/2)/changeX34,fourthY-((fourthY-thirdY)/2)/changeY34+bufferLeft,fourthX+((thirdX-fourthX)/2)/changeX34,thirdY+((fourthY-thirdY)/2)/changeY34+bufferRight,fourthX,fourthY);
                context.lineTo(firstX,firstY);
              }else{
                var firstX = x+(w/2)+(2*o);
                var firstY = y+1;
                var secondX = parentX+parentW-r;
                var secondY = parentY+parentH;
                var thirdX = parentX+(parentW/2);
                var thirdY = parentY+parentH;
                var fourthX = x+(w/2)-(2*o);
                var fourthY = y+1;
                var bufferLeft = -20;
                var bufferRight = 20;
                context.moveTo(firstX,firstY);
                context.bezierCurveTo(firstX+bufferRight,secondY+bufferRight,secondX+bufferRight,firstY+bufferRight,secondX,secondY);
                context.lineTo(thirdX,thirdY);
                context.bezierCurveTo(thirdX+2*bufferLeft,fourthY+bufferLeft,fourthX+bufferLeft,thirdY+bufferLeft,fourthX,fourthY);
                context.lineTo(firstX,firstY);
              }
            context.closePath();
            this.setFillLinearGradientStartPoint([parentX,parentY+parentH]);
            this.setFillLinearGradientEndPoint([parentX,y]);
            if(store.get(myId).type==="support"){
              this.setFillLinearGradientColorStops([1/5, 'green', 4/5, '#6CC54F']);
            }else if(store.get(myId).type==="refute"){
              this.setFillLinearGradientColorStops([1/5, 'red', 4/5, '#E60000']);
            }else{
              this.setFill('orange');
            }
            canvas.fillStroke(this);
          }
        },
        name: 'connector'
        
      });
    }
    layer.add(claim);
    layer.add(claimTextArea);
    layer.add(supportButton);
    layer.add(refuteButton);
    layer.add(deleteButton);
    layer.add(complexText);
    if(myId!==0){
      layer.add(connector);
    }
    layer.draw();
    //console.log(group);
    //console.log(stage.get("#group"+0));
  }
};
