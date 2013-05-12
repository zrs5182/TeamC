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
var fileController = {
	saveMap: function(){
		var data = [];
		for (var i = 0; i < store.get("canvas").claimCount; i++) {
			
			data[i] = store.get(i);
			
		}
		dataString = JSON.stringify(data);
		return dataString;
	},
	loadMap: function(dataString){
		var data = JSON.parse(dataString);
		for (var i = 0; i < store.get("canvas").claimCount; i++) {
			
			store.set(data[i]);
			
		}
		return true;
	},
	save: function(){
        var save_pattern=/(\S)\.am/i
        var filename=prompt("Save As...","argument_map");
 
        if(filename===null){

        }else{
        if(!save_pattern.test(filename)){
            filename="argument_map";
        }
        filename=filename+".am";
        document.getElementById("downloader").download=filename;
        document.getElementById("downloader").href = "data:application;charset=UTF-8," + encodeURIComponent(JSON.stringify(localStorage));
        }
    }
};