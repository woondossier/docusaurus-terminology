const fs = require("fs");
const path = require("path");
const {
  getFiles,
  getCleanTokens,
  preloadTerms,
  getRelativePath,
  addJSImportStatement
} = require("../lib.js");

async function parser(options) {
  const termsFiles = await getFiles(options.termsDir, options.noParseFiles)
  const termsData = await preloadTerms(termsFiles);
  const regex = new RegExp(
    "\\%%.*?\\" + options.patternSeparator + ".*?\\%%",
    "g"
  );
  const allFiles = await getFiles(options.docsDir, options.noParseFiles);
  for (const filepath of allFiles) {
    let content = await fs.promises.readFile(filepath, "utf8");
    // get all regex matches
    const regex_matches = content.match(regex);
    // iterate only pages with regex matches
    if(regex_matches !== null) {
      for(match of regex_matches) {
        const tokens = getCleanTokens(match, options.patternSeparator);
        // for ease of use
        const text = tokens[0];
        const ref = tokens[1];
        const termReference = termsData.find(item => item.id === ref);
        const current_file_path = path.resolve(process.cwd(), filepath);
        const relativePath = getRelativePath(current_file_path, termReference.filepath);
        const component = `<Term popup="${termReference.hoverText}" reference="${relativePath}">${text}</Term>`;
        content = content.replace(match, component);
      };
      // since we are inside the if function
      // we can safely assume that we have
      // replaced at least 1 term, so we can
      // now add the import statement after
      // the second `---` occurrence
      content = addJSImportStatement(content);
      // now the new content can be replaced
      // in the opened file
      // check: dry-run
      if(options.dryRun) {
        console.log("\ndry-run enabled: changes will not be applied in this file. Showing the output below:\n");
        console.log(filepath+"\n");
        console.log(content);
      } else {
        const result = await fs.promises.writeFile(filepath, content, "utf-8");
        // TODO: maybe handle result
      }
    }
  }
}

module.exports = parser;
