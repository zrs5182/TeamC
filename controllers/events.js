/**
 * Project Map
 * Copyright 2013, Kyle Penniston and Zach Schwartz
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: May 11 2013
 *
 * Copyright (C) 2013 by Kyle Penniston and Zach Schwartz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var container=document.getElementById("container");
document.getElementById("menuArea").left=window.innerWidth-50;

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
var nextClaimNumber = 0;

canvasController.newCanvas();
stage.add(layer);

layer.on('click', function(event) {
      var node = event.targetNode;
      var myName = node.attrs.name;
      var myId = node.attrs.id;
      var myType = store.get(myId).type;
      if(myName==="complexText"||myName==="claimTextArea"){
        var div = document.getElementById('myTextArea');
        div.innerHTML = canvasController.makeTextArea(myId);
        document.getElementsByName('working')[0].focus();
      }else if(myName==="supportButton"){
        canvasController.addClaim("support", myId);
      }else if(myName==="refuteButton"){
        if(myType==="refute"){
          canvasController.addClaim("rebut", myId);
        }else{
          canvasController.addClaim("refute", myId);
        }
      }else if(myName==="deleteButton"){
      	 		
      }
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
      document.getElementsByName("working")[0].blur();
      // var workingArea = document.getElementsByName("working")[0];
      // var textArea = document.getElementById("myTextArea");
      // var canvas = store.get("canvas");
      // var claim = store.get(document.getElementsByName("working")[0].id);
      // var gridX=parseInt(canvas.gridX);
      // var gridY=parseInt(canvas.gridY);
      // var scale=layer.getScale().x;
      // var center=parseInt(canvas.center);
      // var realX=Math.round(((parseInt(claim.x))*parseInt(canvas.gridX)*1.5+center+37)*scale)+stage.getAbsoluteTransform().getTranslation().x;
      // var realY=Math.round((parseInt(claim.y)*parseInt(canvas.gridY)*1.5+37)*scale)+stage.getAbsoluteTransform().getTranslation().y;
      // textArea.style.left = realX + "px";
      // textArea.style.top =  realY + "px";
      // workingArea.style.fontSize = (16*scale)+"px"
      // workingArea.style.width=(parseInt(canvas.gridX)-78)*scalar+"px";
      // workingArea.style.height=(parseInt(store.get("canvas").gridY)*scale*.6)+"px";
    }
    layer.draw();
    // window.onresize = function(){
        // alert("Resized");
        // console.log("Resizing");
        // console.log("Window: "+window.innerWidth+", "+window.innerHeight);
        // console.log("Layer: "+layer.getWidth()+", "+layer.getHeight());
        // layer.setSize(window.innerWidth, window.innerHeight);
        // console.log("Resized");
        // console.log("Window: "+window.innerWidth+", "+window.innerHeight);
        // console.log("Layer: "+layer.getWidth()+", "+layer.getHeight());
        // layer.draw();
    // }
    function canvasResize(){
    var container = document.getElementById('container');
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;
    container.style.width = newWidth + 'px';
    container.style.height = newHeight + 'px';
}

window.addEventListener('resize', canvasResize(), false);

}

function locate(){
	layer.setAbsolutePosition(store.get("canvas").center,0);
	layer.draw();
}
