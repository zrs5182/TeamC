test('claimController.getClaimText()', function() { 
	localStorage.clear();
	store.set(0, {id: 0, type: 'support', text: "", parent: 900, x: 300,y: 300});
	var testId = claimController.makeNewClaim(0, 'refutation');
    ok(claimController.getClaimText(testId)=="", "controller's getText matches claim's text field");
})

test('claimController.setClaimText()', function() { 
	localStorage.clear();
	store.set(0, {id: 0, type: 'support', text: "", parent: 900, x: 300,y: 300});
	var testId = claimController.makeNewClaim(0, 'refutation');
	var claim = store.get(testId);
	claimController.setClaimText(testId,"bar");
    ok(claimController.getClaimText(testId)=="bar", "controller's setClaimText works");
})

test('claimController.makeNewClaim()', function() {
	localStorage.clear();
	store.set(0, {id: 0, type: 'support', text: "", parent: 900, x: 300,y: 300});
	var testId = claimController.makeNewClaim(0, 'refutation');
	var testClaim = store.get(testId);
	ok(testClaim.type === 'refutation', "type set");
	ok(parseInt(testClaim.id) === testId, "id matches");
	ok(parseInt(testClaim.parent) === 0, "parent matches");
	ok(testClaim.text==="", "text matches");
	ok(parseInt(testClaim.x)===400, "x is placed correctly");
	ok(parseInt(testClaim.y)===400, "y is placed correctly");
	
	testId = claimController.makeNewClaim(testClaim.id, 'rebuttal');
	testClaim2 = store.get(testId);
	ok(testClaim2.type === 'rebuttal', "2nd type set");
	ok(parseInt(testClaim2.id) === testId, "2nd id matches");
	ok(parseInt(testClaim2.parent) === testClaim.id, "2nd parent matches");
	ok(testClaim2.text==="", "2nd text matches");
	ok(parseInt(testClaim2.x)===500, "2nd x is placed correctly");
	ok(parseInt(testClaim2.y)===500, "2nd y is placed correctly");
})


test('claimController.removeclaim()', function() { 
	localStorage.clear();
	store.set(0, {id: 0, type: 'support', text: "", parent: 900, x: 300,y: 300});
	var testId = claimController.removeClaim(0);
	var claim = store.get(testId); 
	claimController.removeClaim(claim);
    ok(claimController.removeClaim(claim)== null, "controller's setClaimText works");
})


