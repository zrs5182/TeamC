var testCounter = Object.create(counter);
var testClaim = Object.create(claim);
testClaim.setId(testCounter);
var testClaimController = Object.create(claimController);
var testCanvasController = Object.create(canvasController);
	
test('makeTextArea()', function() { 
	var text=claimController.getClaimText(testClaim);
    ok(testCanvasController.makeTextArea(testClaim)==="<textarea rows='3' cols='20' id='working' onfocus='this.select();' onblur='canvasController.removeTextArea(claim)'>" + text + "</textarea>", "Successfully made textarea");
})

test('extractTest()', function() {
	var div = document.getElementById('testing');
	testClaimController.setClaimText(testClaim,'foooooooooooooo... *splat*');
	div.innerHTML=testCanvasController.makeTextArea(testClaim);
	ok(testCanvasController.extractText()===testClaimController.getClaimText(testClaim));
})
