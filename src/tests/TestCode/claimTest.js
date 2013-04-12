var testClaim = Object.create(claim);

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

