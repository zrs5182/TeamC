var canvasController = {
  newCanvas : function(){
    localStorage.clear();
    stage.clear();
    store.set("canvas", {
      minX : 0,
      maxX : 0,
      maxY : 1,
      gridX : 300,
      gridY : 200,
      center : container.clientWidth/2 - 150, //half of gridX
      claimCount : 0
    });
    canvasController.newClaim("contention", 0, 0, null);
  },
  makeTextArea : function(myId) {
    var claim = store.get(myId);
    var canvas = store.get("canvas");
    var gridX=parseInt(canvas.gridX);
    var gridY=parseInt(canvas.gridY);
    var scale=layer.getScale().x;
    var center=parseInt(canvas.center);
    var realX=Math.round((parseInt(claim.x)*parseInt(canvas.gridX)*1.5+center+37)*scale)+stage.getAbsoluteTransform().getTranslation().x;
    var realY=Math.round((parseInt(claim.y)*parseInt(canvas.gridY)*1.5+37)*scale)+stage.getAbsoluteTransform().getTranslation().y;
    document.getElementById('myTextArea').style.left = realX + "px";
    document.getElementById('myTextArea').style.top =  realY + "px";
    document.getElementById('myTextArea').style.zIndex = 2;
    return "<textarea style='font-size: "+(16*scale)+"px; width: "+((parseInt(store.get("canvas").gridX)-78)*scale)+"px; height: "+(store.get("canvas").gridY*scale*.6)+"px;' name='working' id="+claim.id+" onfocus='this.select();' onblur='canvasController.removeTextArea(" + myId + ")'>" + claimController.getClaimText(myId) + "</textarea>"
  },
  extractText : function() {
    return document.getElementsByName('working')[0].value;
  },
  removeTextArea : function(myId) {
    claimController.setClaimText(myId, canvasController.extractText());
    document.getElementById('myTextArea').innerHTML = '';
    document.getElementById('myTextArea').style.zIndex = 0;
    var thisText = stage.get('.complexText')[myId];
    thisText.setText(store.get(myId).text);
  },
  addClaim : function(myType, myX, myY, myParent){
    if(!store.get("grid["+myX+","+myY+"]")){  //empty slot: insert claim
      canvasController.newClaim(myType,myX,myY, myParent);
    }else if(store.get(store.get("grid["+myX+","+myY+"]")).parent===myParent){  //full slot,same parent: move left/right(support/refute) and try again
      if(myType==="support"){
        canvasController.addClaim(myType,myX-1,myY,myParent);
      }else{
        canvasController.addClaim(myType,myX+1,myY,myParent);
      }
    }else{  //full slot, different parents: shift everything above and outside outwards, then insert
      if(myType==="support"){
        if(myX<=0){
          for(var i=parseInt(store.get("canvas").minX); i<=myX;i++){
            for(var j=parseInt(store.get("canvas").maxY);j>0;j--){
              if(store.get("grid["+i+","+j+"]")!=null){
                var oldClaim = store.get(store.get("grid["+i+","+j+"]"));
                store.set ("grid["+(i-1)+","+j+"]",oldClaim.id)
                oldClaim.x = parseInt(oldClaim.x)-1;
                if(oldClaim.x<parseInt(store.get("canvas").minX)){
                  var oldCanvas = store.get("canvas");
                  oldCanvas.minX = parseInt(oldCanvas.minX)-1;
                  store.set("canvas", oldCanvas);
                }
                store.set(oldClaim.id, oldClaim);
                var oldText = stage.get(".complexText")[oldClaim.id];
                oldText.setAttr("x", parseInt(store.get("canvas").center)+parseInt(oldClaim.x)*parseInt(store.get("canvas").gridX)/2*3+30);
                localStorage.removeItem("grid["+i+","+j+"]");
              }
            }
          }
        }else{
          myX+=1;
          for(var i=parseInt(store.get("canvas").maxX); i>=myX;i--){
            for(var j=parseInt(store.get("canvas").maxY);j>0;j--){
              if(store.get("grid["+i+","+j+"]")!=null){
                var oldClaim = store.get(store.get("grid["+i+","+j+"]"));
                store.set ("grid["+(i+1)+","+j+"]",oldClaim.id)
                oldClaim.x = parseInt(oldClaim.x)+1;
                if(oldClaim.x>parseInt(store.get("canvas").maxX)){
                  var oldCanvas = store.get("canvas");
                  oldCanvas.maxX = parseInt(oldCanvas.maxX)+1;
                  store.set("canvas", oldCanvas);
                }
                store.set(oldClaim.id, oldClaim);
                var oldText = stage.get(".complexText")[oldClaim.id];
                oldText.setAttr("x", parseInt(store.get("canvas").center)+parseInt(oldClaim.x)*parseInt(store.get("canvas").gridX)/2*3+30);
                localStorage.removeItem("grid["+i+","+j+"]");
              }
            }
          }
        }
        
        canvasController.newClaim(myType, myX, myY, myParent);
      }else{
        if(myX>0){
          for(var i=parseInt(store.get("canvas").maxX); i>=myX;i--){
            for(var j=parseInt(store.get("canvas").maxY);j>0;j--){
              if(store.get("grid["+i+","+j+"]")!=null){
                var oldClaim = store.get(store.get("grid["+i+","+j+"]"));
                store.set ("grid["+(i+1)+","+j+"]",oldClaim.id)
                oldClaim.x = parseInt(oldClaim.x)+1;
                if(oldClaim.x>parseInt(store.get("canvas").maxX)){
                  var oldCanvas = store.get("canvas");
                  oldCanvas.maxX = parseInt(oldCanvas.maxX)+1;
                  store.set("canvas", oldCanvas);
                }
                store.set(oldClaim.id, oldClaim);
                var oldText = stage.get(".complexText")[oldClaim.id];
                oldText.setAttr("x", parseInt(store.get("canvas").center)+parseInt(oldClaim.x)*parseInt(store.get("canvas").gridX)/2*3+30);
                localStorage.removeItem("grid["+i+","+j+"]");
              }              
            }
          }
        }else{
          myX-=1;
          for(var i=parseInt(store.get("canvas").minX); i<=myX;i++){
            for(var j=parseInt(store.get("canvas").maxY);j>0;j--){
              if(store.get("grid["+i+","+j+"]")!=null){
                var oldClaim = store.get(store.get("grid["+i+","+j+"]"));
                store.set ("grid["+(i-1)+","+j+"]",oldClaim.id)
                oldClaim.x = parseInt(oldClaim.x)-1;
                if(oldClaim.x>parseInt(store.get("canvas").minX)){
                  var oldCanvas = store.get("canvas");
                  oldCanvas.minX = parseInt(oldCanvas.minX)-1;
                  store.set("canvas", oldCanvas);
                }
                store.set(oldClaim.id, oldClaim);
                var oldText = stage.get(".complexText")[oldClaim.id];
                oldText.setAttr("x", parseInt(store.get("canvas").center)+parseInt(oldClaim.x)*parseInt(store.get("canvas").gridX)/2*3+30);
                localStorage.removeItem("grid["+i+","+j+"]");
              }              
            }
          }
        }
        canvasController.newClaim(myType, myX, myY, myParent);
      }
    }
    layer.draw();
  },
  newClaim : function(myType, myX, myY, myParent){
    var myCanvas = store.get("canvas");
    var myId = myCanvas.claimCount;
    store.set(myCanvas.claimCount, {
      id : myId,
      type : myType,
      text : myId,
      x : myX,
      y : myY,
      parent : myParent
    });
    myCanvas.claimCount++;
    store.set("canvas",myCanvas);
    canvasController.drawClaim(myId);
    store.set("grid["+myX+","+myY+"]", myId);
    if(myX<store.get("canvas").minX){
      var canvas = store.get("canvas");
      canvas.minX=myX;
      store.set("canvas",canvas);
    }else if(myX>store.get("canvas").maxX){
      var canvas = store.get("canvas");
      canvas.maxX=myX;
      store.set("canvas",canvas);     
    }
    if(myY>store.get("canvas").maxY){
      var canvas = store.get("canvas");
      canvas.maxY=myY;
      store.set("canvas",canvas);
    }    
    document.getElementById("myTextArea").innerHTML=canvasController.makeTextArea(myId);
    document.getElementsByName('working')[0].focus();
  },
  drawClaim : function(myId){
    var claim = new Kinetic.Shape({
      id: myId,
      name: "claim",
      drawFunc: function(canvas) {
        var myCanvas = store.get("canvas");
        var context = canvas.getContext();
        var x=parseInt(myCanvas.center)+parseInt(store.get(myId).x)*parseInt(myCanvas.gridX)/2*3;
        var y=parseInt(store.get(myId).y)*parseInt(myCanvas.gridY)/2*3;
        var w=parseInt(myCanvas.gridX);
        var h=parseInt(myCanvas.gridY);
        var r=12;
        var o=30;
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
      strokeWidth: 2,
      opacity: 0
    });
    if(localStorage.length==2){
      claim.setOpacity(1);
    }
    var claimTextArea = new Kinetic.Shape({
      id: parseInt(store.get(myId).id),
      drawFunc: function(canvas) {
        var context = canvas.getContext();
        var x = parseInt(store.get("canvas").center)+parseInt(store.get(myId).x)*parseInt(store.get("canvas").gridX)/2*3;
        var y = parseInt(store.get(myId).y)*parseInt(store.get("canvas").gridY)/2*3;
        var w = parseInt(store.get("canvas").gridX);
        var h = parseInt(store.get("canvas").gridY);
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
        var x = parseInt(store.get("canvas").center)+parseInt(store.get(myId).x)*parseInt(store.get("canvas").gridX)/2*3;
        var y = parseInt(store.get(myId).y)*parseInt(store.get("canvas").gridY)/2*3;
        var w = parseInt(store.get("canvas").gridX);
        var h = parseInt(store.get("canvas").gridY);
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
      id: parseInt(store.get(myId).id),
      drawFunc: function(canvas) {
        var context = canvas.getContext();
        var x = parseInt(store.get("canvas").center)+parseInt(store.get(myId).x)*parseInt(store.get("canvas").gridX)/2*3;
        var y = parseInt(store.get(myId).y)*parseInt(store.get("canvas").gridY)/2*3;
        var w = parseInt(store.get("canvas").gridX);
        var h = parseInt(store.get("canvas").gridY);
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
        var x = parseInt(store.get("canvas").center)+parseInt(store.get(myId).x)*parseInt(store.get("canvas").gridX)/2*3;
        var y = parseInt(store.get(myId).y)*parseInt(store.get("canvas").gridY)/2*3;
        var w = parseInt(store.get("canvas").gridX);
        var h = parseInt(store.get("canvas").gridY);
        var r = 12;
        var o = 30;
        context.beginPath();
        context.moveTo(x,y+h-o-r);
        context.bezierCurveTo(x,y+h,x+w/2,y+h-o-r,x+w/2,y+h);
        context.arcTo(x,y+h,x,y+h-o-r,r);
        context.closePath();
        canvas.fillStroke(this);
      },
      opacity: 0
    });
    if(localStorage.length==2){
      supportButton.setOpacity(1);
    }
    var refuteButton = new Kinetic.Shape({
      id: parseInt(store.get(myId).id),
      drawFunc: function(canvas) {
        var context = canvas.getContext();
        var x = parseInt(store.get("canvas").center)+parseInt(store.get(myId).x)*parseInt(store.get("canvas").gridX)/2*3;
        var y = parseInt(store.get(myId).y)*parseInt(store.get("canvas").gridY)/2*3;
        var w = parseInt(store.get("canvas").gridX);
        var h = parseInt(store.get("canvas").gridY);
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
        var x = parseInt(store.get("canvas").center)+parseInt(store.get(myId).x)*parseInt(store.get("canvas").gridX)/2*3;
        var y = parseInt(store.get(myId).y)*parseInt(store.get("canvas").gridY)/2*3;
        var w = parseInt(store.get("canvas").gridX);
        var h = parseInt(store.get("canvas").gridY);
        var r = 12;
        var o = 30;
        context.beginPath();
        context.moveTo(x+w,y+h-o-r);
        context.bezierCurveTo(x+w,y+h,x+w/2,y+h-o-r,x+w/2,y+h);
        context.arcTo(x+w,y+h,x+w,y+h-o-r,r);
        context.closePath();
        canvas.fillStroke(this);
      },
      opacity: 0
    });
    if(localStorage.length==2){
      refuteButton.setOpacity(1);
    }
    var deleteButton = new Kinetic.Shape({
      id: parseInt(store.get(myId).id),
      drawFunc: function(canvas) {
        var context = canvas.getContext();
        var x = parseInt(store.get("canvas").center)+parseInt(store.get(myId).x)*parseInt(store.get("canvas").gridX)/2*3;
        var y = parseInt(store.get(myId).y)*parseInt(store.get("canvas").gridY)/2*3;
        var w = parseInt(store.get("canvas").gridX);
        var h = parseInt(store.get("canvas").gridY);
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
        var x = parseInt(store.get("canvas").center)+parseInt(store.get(myId).x)*parseInt(store.get("canvas").gridX)/2*3;
        var y = parseInt(store.get(myId).y)*parseInt(store.get("canvas").gridY)/2*3;
        var w = parseInt(store.get("canvas").gridX);
        var h = parseInt(store.get("canvas").gridY);
        var r = 12;
        var o = 30;
        context.beginPath();
        context.moveTo(x+w-2*o-r,y);
        context.bezierCurveTo(x+w-o,y,x+w,y+o,x+w,y+2*o+r);
        context.arcTo(x+w,y,x+w-o-r,y,r);
        context.closePath();
        canvas.fillStroke(this);
      },
      opacity: 0
    });
    if(localStorage.length==2){
      deleteButton.setOpacity(1);
    }
    var complexText = new Kinetic.Text({
      id: myId,
      name: "complexText",
      x: parseInt(store.get("canvas").center)+parseInt(store.get(myId).x)*parseInt(store.get("canvas").gridX)/2*3+30,
      y: parseInt(store.get(myId).y)*parseInt(store.get("canvas").gridY)/2*3+30,
      text: store.get(myId).text,
      fontSize: 18,
      fontFamily: 'Calibri',
      fill: '#555',
      width: store.get("canvas").gridX-60,
      padding: 20,
      align: 'left'
    });
    var connector = new Kinetic.Shape({
      id: myId,
      drawFunc: function(canvas) {
        var myCanvas = store.get("canvas");
        var context = canvas.getContext();
        var x = parseInt(myCanvas.center)+parseInt(store.get(myId).x)*parseInt(myCanvas.gridX)/2*3;
        var y = parseInt(store.get(myId).y)*parseInt(myCanvas.gridY)/2*3;
        var w = parseInt(myCanvas.gridX);
        var h = parseInt(myCanvas.gridY);
        var r = 12;
        var o = 30;
        var type = store.get(myId).type;
        if(type!=="contention"){
          var parentX=parseInt(myCanvas.center)+parseInt(store.get(store.get(myId).parent).x)*parseInt(myCanvas.gridX)/2*3;
          var parentY=parseInt(store.get(store.get(myId).parent).y)*parseInt(myCanvas.gridY)/2*3;
          var parentW=parseInt(myCanvas.gridX);
          var parentH=parseInt(myCanvas.gridY);
          context.beginPath();
            if(store.get(myId).type==="support"){
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
            }else{
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
      name: 'connector',
      opacity: 0
    });

    layer.add(claim);
    layer.add(claimTextArea);
    layer.add(supportButton);
    layer.add(refuteButton);
    layer.add(deleteButton);
    layer.add(complexText);
    layer.add(connector);
  }
};
