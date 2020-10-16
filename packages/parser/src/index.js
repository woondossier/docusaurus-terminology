const glob = require("glob");
const fs = require("fs");
const parseMD = require("parse-md").default;
const path = require("path");

const { addImportStatement } = require("./lib.js");
const { getRelativePath } = require("./lib.js");
const { getHoverText } = require("./lib.js");
const { getTermTitle } = require("./lib.js");

const searchTerm = "---";
const importStatement = `\n\nimport Term from '@docusaurus-terminology/term';\n`;
const DEFAULT_OPTIONS = {
  termsDir: "./docs/terms/",
  glossaryFilepath: "./docs/glossary.md",
  patternSeparator: "|",
  noParseFiles: [],
  noGlossaryFiles: [],
};

let options = {};
var getDirectories = function (src, callback) {
  glob(src, callback);
};

async function parser(err, files) {
  if (err) {
    console.log("Error", err);
  } else {
    // Iterate through the .md(x) files and exclude the not-to-be-parsed files
    for (let filepath of files.filter(
      (filepath) => options.noParseFiles.indexOf(filepath) == -1
    )) {
      let content = "";
      try {
        content = await fs.promises.readFile(filepath, "utf8");
      } catch (err) {
        console.log(err);
      }
      if (err) throw err;
      // Regex for finding the pattern:  %%token_1|token_2%%
      var regex = new RegExp(
        "\\%%.*?\\" + options.patternSeparator + ".*?\\%%",
        "g"
      );
      // If there is at least one match between the content of the file and
      // the regex, proceed
      if ((regex_matches = content.match(regex)) !== null) {
        for (let regex_match of regex_matches) {
          var token = regex_match.split(options.patternSeparator);

          // Find the path of the term
          var reference = token[1].replace(/[%" ]/g, "");
          var text = token[0].replace(/[%"]/g, "");

          let referencePath = options.termsDir + reference + ".md";
          // Get the popup text for the term
          let hoverText = await getHoverText(referencePath);

          const current_file_path = path.resolve(process.cwd(), filepath);
          const term_path = path.resolve(
            process.cwd(),
            options.termsDir,
            reference
          );
          const new_final_url = getRelativePath(current_file_path, term_path);
          if (hoverText === undefined) {
            var new_text =
              '<Term reference="' + new_final_url + '">' + text + "</Term>";
          } else {
            var new_text =
              '<Term popup="' +
              hoverText +
              '" reference="' +
              new_final_url +
              '">' +
              text +
              "</Term>";
          }
          content = content.replace(regex_match, new_text);
        }
        // Find the index of the 2nd occurrence of '---'
        var indexOfSecond = content.indexOf(searchTerm, 1);
        // Add the import statement
        content = addImportStatement(
          content,
          indexOfSecond + 3,
          importStatement
        );

        // Write the file with the updated content
        fs.writeFile(filepath, content, "utf8", function (err) {
          if (err) return console.log(err);
        });
      }
    }
  }
}

async function getGlossaryTerms(files) {
  //we will save here all the required data
  let arr = [];
  options.noGlossaryFiles.forEach(function (file, index) {
    this[index] = path.resolve(file);
  }, options.noGlossaryFiles);
  // Iterate through the term files (the ones to be included in the glossary)
  for (let filepath of files.filter(
    (filepath) => options.noGlossaryFiles.indexOf(filepath) == -1
  )) {
    let content = "";
    try {
      content = await fs.promises.readFile(filepath, "utf8");
    } catch (err) {
      console.log(err);
    }
    //gather all metadata
    let { metadata } = parseMD(content);
    //keep only the required keys
    if (metadata.title) {
      arr.push({
        title: metadata.title,
        hoverText: metadata.hoverText,
        filepath: filepath.slice(1, -3),
      });
    }
  }
  return arr;
}

function generateGlossary(data) {
  //append all markdown terms in a variable
  let content = "";
  data.forEach((item) => {
    if (item.title !== undefined) {
      if (item.hoverText === undefined) {
        content = content + `\n\n- **[${item.title}](${item.filepath})**\n`;
      } else {
        content =
          content +
          `\n\n- **[${item.title}](${item.filepath})**: ${item.hoverText}\n`;
      }
    }
  });
  if (!fs.existsSync(options.glossaryFilepath)) {
    //create file with initial content
    console.log("Glossary file does not exist. Generating new glossary page");
    const glossaryHeader =
      searchTerm + "\nid: glossary\ntitle: Glossary\n" + searchTerm;
    fs.writeFile(options.glossaryFilepath, glossaryHeader, "utf8", function (
      err
    ) {
      if (err) return console.log(err);
    });
  }
  fs.readFile(options.glossaryFilepath, "utf8", function (
    err,
    glossaryContent
  ) {
    if (err) throw err;
    var indexOfSecond = glossaryContent.indexOf(searchTerm, 1);
    newContent = glossaryContent.slice(0, indexOfSecond + 3);
    newContent = newContent + content;
    // Write the list of terms to the glossary page
    fs.writeFile(options.glossaryFilepath, newContent, "utf8", function (err) {
      if (err) return console.log(err);
    });
  });
}

async function parseGlossary(err, files) {
  if (err) {
    console.log(err);
    return -1;
  }
  //get all terms in an array of objects
  const data = await getGlossaryTerms(files);
  //sort them alphabetically
  data.sort((a, b) =>
    a.title.toLowerCase() > b.title.toLowerCase()
      ? 1
      : b.title.toLowerCase() > a.title.toLowerCase()
      ? -1
      : 0
  );
  //write the glossary.md file
  generateGlossary(data);
}

module.exports = function (context, opts) {
  options = Object.assign({}, DEFAULT_OPTIONS, opts);
  options.termsDir = path.resolve(options.termsDir) + "/";
  options.glossaryFilepath = path.resolve(options.glossaryFilepath);
  return {
    name: "terminology-parser",
    extendCli(cli) {
      cli
        .command("parse")
        .description("Parse all md files to replace terms")
        .action(() => {
          console.log("Replacing patterns with <Term />");
          getDirectories("./docs/**/*.md*", parser);
        });
      cli
        .command("glossary")
        .description("Generate a glossary of terms")
        .action(() => {
          console.log("Alphabetical list of terms");
          getDirectories(options.termsDir + "*.md*", parseGlossary);
        });
    },
  };
};
