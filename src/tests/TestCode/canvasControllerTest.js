test('makeTextArea()', function() { 
	localStorage.clear();
	store.set(0, {id: 0, type: 'support', text: "", parent: 900, x: 300,y: 300});
	var testId = claimController.makeNewClaim(0, 'refutation');
	var text=claimController.getClaimText(testId);
    ok(canvasController.makeTextArea(testId)==="<textarea rows='3' cols='20' id='working' onfocus='this.select();' onblur='canvasController.removeTextArea(someId)'>" + text + "</textarea>", "Successfully made textarea");
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
