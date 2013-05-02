test('makeTextArea()', function() { 
	localStorage.clear();
	store.set(0, {id: 0, type: 'support', text: "", parent: 900, x: 300,y: 300});
	var myId = claimController.makeNewClaim(0, 'refutation');
	var text=claimController.getClaimText(myId);
    ok(canvasController.makeTextArea(myId)==="<textarea rows='7' cols='25' id='working' onfocus='this.select();' onblur='canvasController.removeTextArea(" + myId + ")'>" + claimController.getClaimText(myId) + "</textarea>", "Successfully made textarea");
})

test('extractText()', function() {
	localStorage.clear();
	store.set(0, {id: 0, type: 'support', text: "", parent: 900, x: 300,y: 300});
	var testId = claimController.makeNewClaim(0, 'refutation');
	claimController.setClaimText(testId,'foooooooooooooo... *splat*');
	document.getElementById('myTextArea').innerHTML=canvasController.makeTextArea(testId);
	ok(canvasController.extractText()===claimController.getClaimText(testId));
	canvasController.removeTextArea(testId);
})

test('removeTextArea()', function() {
	localStorage.clear();
	store.set(0, {id: 0, type: 'support', text: "", parent: 900, x: 300,y: 300});
	var testId = claimController.makeNewClaim(0, 'refutation');
	var text=claimController.getClaimText(testId);
	document.getElementById('myTextArea').innerHTML=canvasController.makeTextArea(testId);
	canvasController.removeTextArea(testId);
	ok(document.getElementById('myTextArea').innerHTML==='');
})

