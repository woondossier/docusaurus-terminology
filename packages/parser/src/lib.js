const path = require("path");
const fs = require("fs");
const parseMD = require("parse-md").default;

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
  addImportStatement: addImportStatement,
  getRelativePath: getRelativePath,
  getHoverText: getHoverText,
  getTermTitle: getTermTitle,
};
