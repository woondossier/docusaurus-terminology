const fs = require("fs");
const path = require("path");
const {
  getFiles,
  preloadTerms,
  getCleanTokens,
  cleanGlossaryTerms,
  getRelativePath,
  getGlossaryTerm,
  sortFiles,
  getOrCreateGlossaryFile
} = require("../lib.js");

async function glossary(options) {
  options.dryRun && console.log("\n* Dry run enabled *\n");
  let glossaryContent = "";
  const termsFiles = await getFiles(options.termsDir, options.noParseFiles)
  const termsData = await preloadTerms(termsFiles);
  // remove terms that don't have title or hoverText
  let cleanTerms = cleanGlossaryTerms(termsData);
  // sort termsData alphabetically
  sortFiles(cleanTerms);
  for (const term of cleanTerms) {
    const current_file_path = path.resolve(process.cwd(), options.glossaryFilepath);
    const relativePath = getRelativePath(current_file_path, term.filepath);
    const glossaryTerm = getGlossaryTerm(term, relativePath);
    glossaryContent = glossaryContent + glossaryTerm;
  }
  if(options.dryRun) {
    const outputFile = options.logOutputFile;
    fs.writeFileSync(outputFile,
      `\n! These changes will not be applied in the glossary file.` +
      `\nShowing the output below:\n\n${(glossaryContent)}\n\n`, "utf8");
  } else {
    const glossaryFile = getOrCreateGlossaryFile(options.glossaryFilepath);
    fs.writeFileSync(options.glossaryFilepath, glossaryFile+glossaryContent, "utf8");
  }
  console.log(`\u2713 ${cleanTerms.length} terms found.`)
};

module.exports = glossary;
