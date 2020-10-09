const { addImportStatement } = require('../src/lib.js');
const { getRelativePath } = require('../src/lib.js');
const { getHoverText } = require('../src/lib.js');
const { getTermTitle } = require('../src/lib.js');

describe('get relative path', () => {
    const source = '/docs/file1.md';
    const target = '/docs/dir/file2.md';
    const path = getRelativePath(source, target);
    it('finds the file', () => {
      expect(path).toBe('dir/file2.md');
    });
});
