import 'regenerator-runtime/runtime';
const { addJSImportStatement } = require('../src/lib.js');
const { getRelativePath } = require('../src/lib.js');
const { getCleanTokens } = require('../src/lib.js');
const { getFiles } = require('../src/lib.js');

describe('get relative path', () => {
    const source = '/docs/file1.md';
    const target = '/docs/dir/file2.md';
    const path = getRelativePath(source, target);
    it('finds the file', () => {
      expect(path).toBe('dir/file2');
    });
});

describe('add import statement', () => {
    const content = '--- id: hospitality ---';
    var newContent = addJSImportStatement(content);
    it('gets the updated content with the import statement', () => {
      expect(newContent).toBe(content
        + '\n\nimport Term from "@docusaurus-terminology/term";\n');
    });
});


describe('get the term name and reference from the regex match', () => {
    const matchPattern = '%%Term name$term%%';
    const separator = '$';
    var tokens = getCleanTokens(matchPattern, separator);
    it('the clean tokens', () => {
      expect(tokens).toStrictEqual(['Term name', 'term']);
    });
});

it('get list of files to parse', async () => {
  const basePath = './test_docs/'
  const excludeList = ['./test_docs/exclude.md'];
  const files = await getFiles(basePath, excludeList);
  expect(files).toEqual([]);
});

//it('get list of files to parse', async () => {
//  expect.assertions(1);
//  const basePath = './test_docs/'
//  const excludeList = ['./test_docs/exclude.md'];
//  await expect(getFiles(basePath, excludeList)).resolves.toEqual([]);
//});

