test('testClaim.getText()', function() { 
	var testCounter = Object.create(counter);
	var testClaim = Object.create(claim);
	testClaim.setId(testCounter);
    ok(testClaim.getText()!=='null', 'claim has a text field');
})

test('testClaim.setText()', function() {
	var testCounter = Object.create(counter);
	var testClaim = Object.create(claim);
	testClaim.setId(testCounter);
	testClaim.setText("foo");
	ok(testClaim.getText()==="foo", 'claim text changed to foo');
})

test('testClaim.getType()', function() {
	var testCounter = Object.create(counter);
	var testClaim = Object.create(claim);
	testClaim.setId(testCounter);
	ok(testClaim.getType()!=='null', 'claim has a type field');
})

test('testClaim.setType()', function() {
	var testCounter = Object.create(counter);
	var testClaim = Object.create(claim);
	testClaim.setId(testCounter);
	testClaim.setType("refute");
	ok(testClaim.getType()==="refute", 'claim type has changed to refute');
})

test('testClaim.getId()', function() {
	var testCounter = Object.create(counter);
	var testClaim = Object.create(claim);
	testClaim.setId(testCounter);
	var testClaim2 = Object.create(claim);
	testClaim2.setId(testCounter);
	ok(testClaim.getId()!==testClaim2.getId(), 'claims have different Ids');
})

test('testClaim.getId()', function() {
	var testCounter = Object.create(counter);
	var testClaim = Object.create(claim);
	ok(testClaim.getId()===testClaim.getId(), 'claim keeps its uniqueId');
})

test('testClaim.setId()', function(){
	var testCounter = Object.create(counter);
	var testClaim = Object.create(claim);
	ok(testClaim.getId()===null, 'claim is constructed with no Id');
	testClaim.setId(testCounter);
	ok(testClaim.getId()===1, 'claim Id has been successfully assigned');	
})
