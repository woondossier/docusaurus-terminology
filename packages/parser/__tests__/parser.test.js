const { addImportStatement } = require('../src/lib.js');
const { getRelativePath } = require('../src/lib.js');
const { getHoverText } = require('../src/lib.js');

describe('add import statement', () => {
    const content = 'some-content';
    const string = 'some-string';
    const cases = [
	[0, string + content],
	[1, content.substring(0, 1) + string + content.substring(1, content.length)],
	[2, content.substring(0, 2) + string + content.substring(2, content.length)],
    ];
    test.each(cases)(
	'Test with index = %p',
	(index, expected) => {
	    const result = addImportStatement(content, index, string);
	    expect(result).toBe(expected);
	}
    );
});

describe('get relative path', () => {
    const source = '/docs/file1.md';
    const target = '/docs/dir/file2.md';
    const path = getRelativePath(source, target);
    it('finds the file', () => {
      expect(path).toBe('dir/file2.md');
    });
});
