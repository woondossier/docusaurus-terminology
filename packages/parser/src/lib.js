const path = require("path");
const fs = require("fs");
const parseMD = require("parse-md").default;
const globby = require("globby");

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

async function getFiles(basePath, noParseFiles) {
  let files = [];
  // get all files under dir
  files = await globby(basePath+'**/*.{md,mdx}');
  // filter with the noParseFiles option and return
  return files.diff(noParseFiles);
}

async function preloadTerms(termsFiles) {
  let terms = [];
  for (term of termsFiles) {
    let fileContent = await fs.promises.readFile(term, "utf8");
    let { metadata } = parseMD(fileContent);
    if (!metadata.id) {
      console.log(`the file "${term}" does not have an id and so is excluded from the term parsing functionality`);
    } else {
      const data = {
        content: fileContent,
        filepath:  term,
        hoverText: metadata.hoverText || "",
        id: metadata.id,
        title: metadata.title || ""
      }
      terms.push(data);
    }
  }
  return terms;
}

function getCleanTokens(match, separator) {
  let tokens = match.split(separator);
  tokens.forEach((token, index) => {
    tokens[index] = token.replace(/[\%.]/g, "")
  });
  return tokens;
}

function splice(cont, idx, rem, str) {
    return cont.slice(0, idx) + str + cont.slice(idx + Math.abs(rem));
}

function addJSImportStatement(content) {
  const importStatement = `\n\nimport Term from @docusaurus-terminology/term;\n`;
  const index = content.indexOf("---", 1) + "---".length;
  return splice(content, index, 0, importStatement);
}

function addImportStatement(content, index, string) {
  if (index > 0) {
    return (
      content.substring(0, index) +
      string +
      content.substring(index, content.length)
    );
  } else {
    return string + content;
  }
}

function getRelativePath(source, target) {
  // calculate relative path from each file's parent dir
  const sourceDir = source.substr(0, source.lastIndexOf("/"));
  const targetDir = target.substr(0, target.lastIndexOf("/"));
  const relative_url = path.relative(sourceDir, targetDir);
  // construct the final url by appending the target's filename
  // if the relative url is empty, it means that the referenced
  // term is in the same dir, so add a `.`
  return relative_url === ""
    ? "." + target.substr(target.lastIndexOf("/"))
    : relative_url + target.substr(target.lastIndexOf("/"));
}

async function getHoverText(filePath) {
  let data = await fs.promises.readFile(filePath, "utf8");
  let { metadata } = parseMD(data);
  return metadata.hoverText;
}

function getTermTitle(filePath) {
  let data = fs.readFileSync(filePath, "utf8");
  let { metadata } = parseMD(data);
  return metadata.title;
}

module.exports = {
  getFiles: getFiles,
  addImportStatement: addImportStatement,
  getRelativePath: getRelativePath,
  getHoverText: getHoverText,
  getTermTitle: getTermTitle,
  getCleanTokens: getCleanTokens,
  preloadTerms: preloadTerms,
  addJSImportStatement: addJSImportStatement
};
