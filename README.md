# Docusaurus terminology

**docusaurus-terminology** is a yarn package for creating a
terminology structure in your [Docusaurus](https://docusaurus.io/)
project. This plugin allows you to use terms in your pages that
'stick out' of the surrounding text, while hovering over them makes a
popup appear with a short explanation of the term and clicking on the
term navigates the user to the page that documents the concept.

![Term in text example](website/static/img/terminology_example.gif)

You can also generate a glossary with the list of your terms.

### How it works

This plugin, once it's installed in a docusaurus project, parses docs
in two ways:

  1. Parses all `*.md(x)` files under `docs/` and replaces each pattern with an
  appropriate React component supporting a tooltip functionality (see below).
  2. Generates a glossary page with all terms corresponding to the
  `*.md(x)` files under `docs/terms/`.

## Prerequisites

In order to use this plugin, you will need:

  1. Node.js version >= 10.15.1
  2. Yarn version >= 1.5
  3. Docusaurus v2 repository (tested against 2.0.0-alpha-65 and above)

## Installation

To install the plugin to your Docusaurus repository, use the command:

```commandline
yarn add @docusaurus-terminology/parser @docusaurus-terminology/term
```

Then, you can add the plugin to `docusaurus.config.js` file of your repository:

```js
module.exports = {
  // ...
  plugins: [
    '@docusaurus-terminology/parser'
  ]
}
```

Or, you can use it with extra options defined (with more examples in
the next sections): 

```js
  plugins: [
    [
      "@docusaurus-terminology/parser",
      {
        //options
      }
    ]
  ]
```

## Usage

### Defining a term

This plugin assumes that you follow the structure, as explained below:

Each term should have its own `.md(x)` file, inside the `./docs/terms` directory,
and it needs to consist of the following structure:

```markdown
---
id: term_name
title: Term page
hoverText: This hover text will appear in the documentation page that you reference this term
---

### Term explanation

content here
```

> Pay attention to the `hoverText` attribute, as it is important to provide this
> attribute (along with the default docusaurus attributes), so the plugin can
> fetch the correct popup text to show when referencing a term.


### Use patterns to reference a term

When writing docs inside `docs/*.md(x)` files, in order to refer to a term, 
you may use the following syntax:


```
%%term_text|term_name%%
```

where:
- `term_text`: The terminology text you want it to be visible in the
documentation page
- `term_name`: The value of the `id` attribute, which resides in the
header of the term file:
  > ```markdown
  > ---
  > id: term_name
  > ...
  > ---
  > ```

After successfully running the script, the above occurrence will be replaced by 
a reference (technically a React component) that  will render `term_text` as a 
link to the corresponding term page, which is in turn generated from the 
`term_name` attribute; furthermore, *hovering* over `term_text` displays a term 
summary, as extracted from the corresponding term page.

### Example usage

Say you want to reference a term that exists under the `./docs/terms/` directory,
e.g., `./docs/terms/party.md`. You can use the following syntax to reference
this term in your documentation page:

```markdown
Some content that wants to reference the %%Party|party%% term
```

When the script runs, this will be replaced as follows:

```html
Some content that wants to reference the <Term reference="party" popup="Popup text">Party</Term> term
```

which supports the functionality explained above.

And finally, all you will see in your compiled documentation page, will be:

```markdown
Some content that wants to reference the Party term
```

with the word **Party** containing the described functionality.

## Testing the changes locally

After writing terms and patterns in your `.md` files, you can always validate 
these changes, by running a dry-run command, in order to see compile errors
and a sample output of all the changes that will be made from the actual 
script. You can do that by running:

```commandline
yarn docusaurus parse --dry-run
```

and you will see in the command line the expected output of the actual command.

## Generating the terminology documentation

When you are finished referencing terms and have written corresponding term 
pages, you can test this locally by running:

```commandline
yarn docusaurus parse
```

This will replace all `%%term_text|term_name%%` occurrences with the React 
component supporting the required functionality.

## Generating the glossary page

If everything works well with the above procedure, you can then generate a
glossary page, by running:

```commandline
yarn docusaurus glossary
```

This will generate a file in `./docs/glossary.md` where every term that has been
mentioned above will be populated in the `glossary.md` page.

## When to generate the terminology docs

As the terminology plugin actually edits all markdown files, your Git repository 
will show changes in the `git diff` command. It is highly recommended to avoid 
committing the changes, as the plugin will no longer be able to detect
patterns that have been altered. 

Your best case scenario will be to use the scripts in CI, just before building 
and deploying the documentation.

The following example of a Gitlab CI job shows how to perform these steps in 
the CI environment:

```yaml
...

generate-docs:
	image: node:lts
	stage: build
	before_script:
		- yarn install
	script:
		- yarn docusaurus parse
		- yarn docusaurus glossary
		- yarn build
```
and then you can use the `build` directory to serve your documentation.

## Configuration options

For using the plugin with the default options, you can provide just the plugin 
name in `docusaurus.config.js` file of your repository:

```js
  plugins: [
    '@docusaurus-terminology/parser'
  ]
```

You can also use some of the following options specified by wrapping the name 
and an options object in an array inside your configuration:

|      Option      |                                                Description                                                |  Type  |    Default value   |
|:----------------:|:---------------------------------------------------------------------------------------------------------:|:------:|:------------------:|
|     termsDir     |                                the directory used to collect the term files                               | string |    ./docs/terms    |
| glossaryFilepath |                            specify the directory and name of the glossary file                            | string | ./docs/glossary.md |
| patternSeparator | the special character used to separate `term_text` <br>and `term_name` in the replace pattern for parsing | string |         \|         |
|   noParseFiles   |                             array of files to be excluded from search/replace                             |  array |         []         |
|  noGlossaryFiles |                         array of term files to not be listed on the glossary page                         |  array |         []         |

**IMPORTANT NOTE**: All file paths need to be relative to the
project's root directory. If you want to exclude a file, you should
write `./docs/excude-me.md`. 

Example:

```js
plugins: [
  [
    '@docusaurus-terminology/parser',
    {
      termsDir: './docs/terminology/',
      noParseFiles: ['./docs/terminology/agent.md', './docs/terminology/actor.md'],
      noGlossaryFiles: ['./docs/terminology/agent.md'],
    }
  ]
]
```

## How to contribute

To build and use the plugin locally in a project, apply changes etc., follow the 
instructions below.

Clone the repository [https://gitlab.grnet.gr/devs/docusaurus-terminology](https://gitlab.grnet.gr/devs/docusaurus-terminology)

Then run the following commands:

```commandline
cd docusaurus-terminology
yarn install
yarn bootstrap
yarn build
```

After running those commands, all packages will be initialized and
built, and you are ready for development. 

In the `website` directory there is a Docusaurus project, ready with
the plugin initialized, which can be used for testing purposes. There
are already some markdown files and terms, but new files can be added
for further testing.

After making changes in the packages, you should always build the
packages and then test them with the local website directory. So first
you need to run:

```commandline
yarn build
```

from the root directory of the repository. And then we are ready to
test everything in the local docusaurus project, so we run the
following commands: 

```commandline
cd website
yarn docusaurus parse
yarn docusaurus glossary
```

When we are ready to do a test build to see if our website compiles
successfully, we can use the following:

```commandline
cd website
yarn build
```

And this will output our compiled website in a directory called
`build`. You can use a package named `serve` to create instantly a
nodejs webserver to serve these files (as used in the dockerfile). You
can run: 

```commandline
yarn global add serve
cd build
serve
```
