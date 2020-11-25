const fs = require("fs");
const path = require("path");
const gitDiff = require("git-diff")
const {
  getFiles,
  getCleanTokens,
  preloadTerms,
  getRelativePath,
  addJSImportStatement
} = require("../lib.js");

async function parser(options) {
  options.dryRun && console.log("\n* Dry run enabled *\n");
  options.debug && console.log("\n* Debug logging enabled *\n");
  // Remove previous log output file, if present
  fs.existsSync(options.logOutputFile) && fs.unlinkSync(options.logOutputFile);
  let nmbMatches = 0;
  const termsFiles = await getFiles(options.termsDir, options.noParseFiles, "termsDir");
  const termsData = await preloadTerms(termsFiles);
  const regex = new RegExp(
    "\\%%.*?\\" + options.patternSeparator + ".*?\\%%",
    "g"
  );
  console.log("Iterate through the files, looking for term patterns");
  const allFiles = await getFiles(options.docsDir, options.noParseFiles, "docsDir");
  for (const filepath of allFiles) {
    let content = await fs.promises.readFile(filepath, "utf8").catch(
      function(err) {
        console.log(`\u26A0 Error occurred while reading file: ${filepath}`);
        process.exit(1);
    });
    const oldContent = content;
    // get all regex matches
    const regex_matches = content.match(regex);
    // iterate only pages with regex matches
    if(regex_matches !== null) {
      nmbMatches += regex_matches.length;
      for(match of regex_matches) {
        const tokens = getCleanTokens(match, options.patternSeparator);
        // for ease of use
        const text = tokens[0];
        const ref = tokens[1];
        const termReference = termsData.find(item => item.id === ref);
        if(!termReference) {
          console.log(`\nParsing file "${filepath}"...`);
          console.log(`\u26A0  Could not find the correct term from id ` +
          `"${ref}" in regex match "${match}". Maybe typo or missing term file?\n`);
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
        var diff = gitDiff(oldContent, content);
        await fs.promises.appendFile(options.logOutputFile,
          `\n! These changes will not be applied in the file ` +
          `${filepath}\nShowing the output below:\n\n${diff}\n\n`,
          (error) => { if (error) throw error; });
      } else {
        const result = await fs.promises.writeFile(filepath, content, "utf-8",
          (error) => {
            if (error) throw error;
        });
      }
    }
  }
  console.log(`\u2713 ${nmbMatches} term replacements completed.`)
}

module.exports = parser;
