const path = require("path");
const fs = require("fs");
const parseMD = require("parse-md").default;
const globby = require("globby");

const glossaryHeader = `---
id: glossary
title: Glossary
---`;

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

async function getFiles(basePath, noParseFiles) {
  let files = [];
  // get all files under dir
  files = await globby(basePath+"**/*.{md,mdx}");
  // filter with the noParseFiles option and return
  return files.diff(noParseFiles);
}

async function preloadTerms(termsFiles) {
  let terms = [];
  for (const term of termsFiles) {
    let fileContent = await fs.promises.readFile(term, "utf8");
    let { metadata } = parseMD(fileContent);
    if (!metadata.id) {
      console.log(`The file "${term}" does not have an id and so is ` +
      `excluded from the term parsing functionality`);
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
  // remove file extension, if present
  tokens[1] = tokens[1].replace(/\.[^/.]+$/, "");
  tokens.forEach((token, index) => {
    tokens[index] = token.replace(/[\%]/g, "");
  });
  return tokens;
}

function splice(cont, idx, rem, str) {
    return cont.slice(0, idx) + str + cont.slice(idx + Math.abs(rem));
}

function addJSImportStatement(content) {
  const importStatement = `\n\nimport Term ` +
  `from "@docusaurus-terminology/term";\n`;
  const index = content.indexOf("---", 1) + "---".length;
  return splice(content, index, 0, importStatement);
}

function sortFiles(files) {
  files.sort((a, b) =>
    a.title.toLowerCase() > b.title.toLowerCase()
    ? 1
    : b.title.toLowerCase() > a.title.toLowerCase()
    ? -1
    : 0
  );
}

function cleanGlossaryTerms(terms) {
  const cleanTerms = terms.filter(item => {
    return item.title && item.title.length > 0 ? true : false;
  });
  // handle debug case here
  return cleanTerms;
}

function getGlossaryTerm(term, path) {
  const hover = term.hoverText != undefined ? term.hoverText : "";
  return `\n\n- **[${term.title}](${path})**: ${hover}\n`;
}

function getOrCreateGlossaryFile(path) {
  let fileContent = "";
  if(!fs.existsSync(path)) {
    console.log("Glossary file does not exist in path: " + path + ". Creating...");
    fileContent = glossaryHeader;
    fs.writeFileSync(path, fileContent, "utf8");
  } else {
    // keep only the header of file
    const content = fs.readFileSync(path, "utf8");
    const index = content.indexOf("---", 1) + "---".length;
    fileContent = content.slice(0,index);
  }
  return fileContent;
}

function getRelativePath(source, target) {
  // calculate relative path from each file's parent dir
  const sourceDir = source.substr(0, source.lastIndexOf("/"));
  const targetDir = target.substr(0, target.lastIndexOf("/"));
  const relative_url = path.relative(sourceDir, targetDir);
  // construct the final url by appending the target's filename
  // if the relative url is empty, it means that the referenced
  // term is in the same dir, so add a `.`
  let final_url = relative_url === ""
    ? "." + target.substr(target.lastIndexOf("/"))
    : relative_url + target.substr(target.lastIndexOf("/"));
    //  remove .mdx suffix
  return final_url.replace(/(\.mdx?)/g, "")
}

module.exports = {
  getFiles: getFiles,
  getRelativePath: getRelativePath,
  getCleanTokens: getCleanTokens,
  preloadTerms: preloadTerms,
  addJSImportStatement: addJSImportStatement,
  sortFiles: sortFiles,
  cleanGlossaryTerms: cleanGlossaryTerms,
  getGlossaryTerm: getGlossaryTerm,
  getOrCreateGlossaryFile: getOrCreateGlossaryFile
};
