var testClaim = Object.create(claim);
var testClaimController = Object.create(claimController);

test('testClaimController.getClaimText()', function() { 
    ok(testClaimController.getClaimText(testClaim)===testClaim.getText(), "controller's getText matches claim's getText");
})

test('testClaim.setClaimText()', function() { 
	testClaimController.setClaimText(testClaim,"bar");
    ok(testClaimController.getClaimText(testClaim)===testClaim.getText(), "controller's setClaimText works");
})
