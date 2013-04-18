var testCounter = Object.create(counter);
var testClaim = Object.create(claim);
testClaim.setId(testCounter);

test('testClaim.getText()', function() { 
    ok(testClaim.getText()!=='null', 'claim has a text field');
})

test('testClaim.setText()', function() {
	testClaim.setText("foo");
	ok(testClaim.getText()==="foo", 'claim text changed to foo');
})

test('testClaim.getType()', function() {
	ok(testClaim.getType()!=='null', 'claim has a type field');
})

test('testClaim.setType()', function() {
	testClaim.setType("refute");
	ok(testClaim.getType()==="refute", 'claim type has changed to refute');
})

test('testClaim.getId()', function() {
	var testClaim2 = Object.create(claim);
	testClaim2.setId(testCounter);
	ok(testClaim.getId()!==testClaim2.getId(), 'claims have different Ids');
})

test('testClaim.getId()', function() {
	ok(testClaim.getId()===testClaim.getId(), 'claim keeps its uniqueId');
})