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

  // output file for logs
  const outputFile = options.logOutputFile;
  fs.unlink(outputFile, function(err) { if(err) return; });
//  var logger = fs.createWriteStream(outputFile, {
//    flags: "a" // "a" for appending (old data will be preserved)
//  });
  let nmbMatches = 0;

  const termsFiles = await getFiles(options.termsDir, options.noParseFiles);
//  options.debug && logger.write("Load the term files\n");
  const termsData = await preloadTerms(termsFiles);
  const regex = new RegExp(
    "\\%%.*?\\" + options.patternSeparator + ".*?\\%%",
    "g"
  );
  console.log("Iterate through the files, looking for term patterns");
  const allFiles = await getFiles(options.docsDir, options.noParseFiles);
  for (const filepath of allFiles) {
//    options.debug && logger.write(`\n* File: ${filepath}\n`);
    let content = await fs.promises.readFile(filepath, "utf8", (err, data) => {
      (err.code === 'ENOENT') ? console.log(`File ${filepath} not found`) :
      console.log(err);
    });
//    options.debug && logger.write(`Looking for the pattern ` +
//      `"%%term_text${options.patternSeparator}term_name%%"...\n`);
    // get all regex matches
    const regex_matches = content.match(regex);
    // iterate only pages with regex matches
    if(regex_matches !== null) {
//      options.debug && logger.write(`${regex_matches.length} match(es) found\n`);
      nmbMatches += regex_matches.length;
      for(match of regex_matches) {
//        options.debug && logger.write(`Replace "${match}" with the <Term /> component\n`)
        const tokens = getCleanTokens(match, options.patternSeparator);
        // for ease of use
        const text = tokens[0];
        const ref = tokens[1];
        const termReference = termsData.find(item => item.id === ref);
        if(!termReference) {
          console.log(`\nParsing file "${filepath}"...`);
          console.log(`! Could not find the correct term from id "${ref}", ` +
            `maybe typo or missing term file?\n`);
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
        var oldContent = await fs.promises.readFile(filepath, "utf8");
        var diff = gitDiff(oldContent, content);
        await fs.promises.appendFile(outputFile,
          `\n! These changes will not be applied in the file ` +
          `${filepath}\nShowing the output below:\n\n${diff}\n\n`,
          function (err) {
            if (err) console.log(err);
          }
        );
      } else {
//        options.debug && logger.write("Write file with updated content\n");
        const result = await fs.promises.writeFile(filepath, content, "utf-8");
        // TODO: maybe handle result
      }
    }
  }
  console.log(`\u2713 ${nmbMatches} term replacements completed.`)
}

module.exports = parser;
