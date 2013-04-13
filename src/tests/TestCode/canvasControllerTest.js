var testClaim = Object.create(claim);
var testClaimController = Object.create(claimController);
var testCanvas = Object.create(canvas);
	
test('makeTextArea()', function() { 
	var text=claimController.getClaimText(testClaim);
    ok(testCanvas.makeTextArea(testClaim)==="<textarea rows='3' cols='20'>" + text + "</textarea>", "Successfully made textarea");
})
