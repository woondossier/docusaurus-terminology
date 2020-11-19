const fs = require("fs");
const path = require("path");
var gitDiff = require('git-diff')
const {
  getFiles,
  getCleanTokens,
  preloadTerms,
  getRelativePath,
  addJSImportStatement
} = require("../lib.js");

async function parser(options) {
  if(options.dryRun) console.info("\n* Dry run enabled *\n");
  if (!options.debug) {
    console = console || {};
    console.log = function(){};
  }
  console.log("\n* Debug logging enabled *\n");
  const termsFiles = await getFiles(options.termsDir, options.noParseFiles);
  console.log('Load the term files');
  const termsData = await preloadTerms(termsFiles);
  const regex = new RegExp(
    "\\%%.*?\\" + options.patternSeparator + ".*?\\%%",
    "g"
  );
  console.log('Iterate through the files, looking for term patterns');
  const allFiles = await getFiles(options.docsDir, options.noParseFiles);
  for (const filepath of allFiles) {
    console.log(`File: ${filepath}`);
    let content = await fs.promises.readFile(filepath, "utf8");
    console.log(`  Looking for the pattern ` +
      `"%%term_text${options.patternSeparator}term_name%%"...`);
    // get all regex matches
    const regex_matches = content.match(regex);
    // iterate only pages with regex matches
    if(regex_matches !== null) {
      console.log(`  ${regex_matches.length} match(es) found`);
      for(match of regex_matches) {
        console.log(`  Replace "${match}" with the <Term /> component`)
        const tokens = getCleanTokens(match, options.patternSeparator);
        // for ease of use
        const text = tokens[0];
        const ref = tokens[1];
        const termReference = termsData.find(item => item.id === ref);
        if(!termReference) {
          console.log(`\nParsing file "${filepath}"...`);
          console.log(`Could not find the correct term from id "${ref}", maybe typo or missing term file?\n`);
          process.exit(1);
        }
        const current_file_path = path.resolve(process.cwd(), filepath);
        const relativePath =
          getRelativePath(current_file_path, termReference.filepath);
        const component = `<Term popup="${termReference.hoverText}" ` +
          `reference="${relativePath}">${text}</Term>`;
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
        //${content}\n
        console.info(`\n  These changes will not be applied in the file ` +
        `${filepath}\n  Showing the output below:\n\n`);
        var oldContent = await fs.promises.readFile(filepath, "utf8");
        var diff = gitDiff(oldContent, content, {color: true});
        console.info(diff);
      } else {
        console.log("  Write file with updated content\n")
        const result = await fs.promises.writeFile(filepath, content, "utf-8");
        // TODO: maybe handle result
      }
    } else {
      console.log("  No matches found\n")
    }
  }
}

module.exports = parser;
