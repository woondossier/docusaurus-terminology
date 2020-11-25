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
  // Load the term files
  let termsFiles = [];
  try {
    termsFiles = await getFiles(options.termsDir, options.noParseFiles);
  } catch (err) {
    console.log(`\u26A0  Not able to get files from folder: ${options.termsDir}`);
    console.log(`Check the path in option "termsDir"\n\nError: ${err}`);
    process.exit(1);
  }
  if (!termsFiles.length) {
    console.log(`\u26A0 No term files found. Might be wrong path` +
    ` "${options.termsDir}" in option "termsDir" or empty folder`);
    process.exit(1);
  }
  const termsData = await preloadTerms(termsFiles);
  console.log("Iterate through the .md(x) files, looking for term patterns");
  let allFiles = [];
  try {
    allFiles = await getFiles(options.docsDir, options.noParseFiles);
  } catch (err) {
    console.log(`\u26A0  Not able to get files from folder: ${options.docsDir}`);
    console.log(`Check the path in option "docsDir"\n\nError: ${err}`);
    process.exit(1);
  }
  if (!allFiles.length) {
    console.log(`\u26A0 No files found. Might be wrong path` +
    ` "${options.docsDir}" in option "docsDir" or empty folder`);
    // process.exit(1);
  }
  // start counting number of term replacements
  let nmbMatches = 0;
  const regex = new RegExp(
    "\\%%.*?\\" + options.patternSeparator + ".*?\\%%",
    "g"
  );
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
        var diff = gitDiff(oldContent, content, {color: true});
        console.log(`\n! These changes will not be applied in the file ` +
          `${filepath}\nShowing the output below:\n\n${diff}\n\n`);
      } else {
        try {
          const result = await fs.promises.writeFile(filepath, content, "utf-8");
        } catch (err) {
          console.log(`\u26A0  An error occurred while writing new data ` +
            `to file: ${filepath}\n${err}`);
          process.exit(1);
        } finally {
          console.log(`\u00BB File ${filepath} is updated.`);
        }
      }
    }
  }
  console.log(`\u2713 ${nmbMatches} term replacements completed.`);
}

module.exports = parser;
