# Docusaurus terminology

**docusaurus-terminology** is a yarn package for creating a terminology structure 
in your docusaurus project. This plugin allows you to use terms in your pages, 
that 'stick out' of the surrounding text, where hovering over them makes a 
popup appear with a short explanation of the term, and clicking on the term 
navigates the user to the page that documents the concept.

You can also generate a glossary with the list of your terms.

### How it works

This plugin, once it's installed in a docusaurus project, parses docs in two ways:

  1. Parses all `*.md(x)` files under `docs/` and replaces each pattern with an
  appropriate React component supporting a tooltip functionality (see below)
  2. Generates a glossary page with all terms corresponding to the `*.md` files 
  under `docs/terms/`


## Installation

To install the plugin to your docusaurus repository, use the command:

```shell script
$ yarn add @docusaurus-terminology/parser @docusaurus-terminology/term
```

Then, you can add the plugin to `docusaurus.config.js` file of your repository:

```
  plugins: [
    '@docusaurus-terminology/parser'
  ]
};
```

## Usage

### Replace patterns with dynamical elements

When writing docs inside `docs/*.md(x)` files, in order to refer to a term, 
you may use the following syntax:


```
%%term_text|term_name%%
```

where:
- `term_text`: The terminology text you want it to be visible in the documentation
page
- `term_name`: The filename of the term file, which resides under `./docs/terms` 
directory

After successfully running the script, the above occurrence will be replaced by 
a React component, which will render `term_text` as a link to the corresponding 
term page, which is in turn generated from the `term_name` attribute; 
furthermore, *hovering* over `term_text` displays a term summary, as extracted 
from the corresponding term page.

### Example usage

Say you want to reference a term that exists under the `./docs/terms/` directory,
e.g. `./docs/terms/party.md`. You can use the following syntax to reference
this term in your documentation page:

```
Some content that wants to reference the %%Party|party%% term
```

When the script runs, this will be replaced as follows:

```
Some content that wants to reference the <Term reference="party" popup="Popup text">Party</Term> term
```

which supports the functionality explained above.

### How to correctly write a term

This plugin assumes that you follow the structure, as explained below:

Each term should have its own `.md` file, inside the `./docs/terms` directory,
and it needs to consist of the following structure:

```title="./docs/terms/term.md"
---
id: term
title: Term page
hoverText: This hover text will appear in the documentation page that you reference this term
---

### Term explanation

content here
```

> Pay attention to the `hoverText` attribute, as it's important to provide this
>attribute (along with the default docusaurus attributes), so the plugin can
>fetch the correct popup text to show when referencing a term.

### Running the script

When you are finished referencing terms and have written corresponding term pages,
you can test this locally by running the following command:

```.shell script
$ yarn parse
yarn run v1.22.5
 docusaurus parse
Replacing patterns with <Term />
Done in 1.41s.
```

This will replace all `%%term_text|term_name%%` occurrences with the React 
component supporting the required functionality.

### Generate the glossary page

If everything works well with the above procedure, you can then generate a
glossary page, by running the following command:

```.shell script
$ yarn glossary
yarn run v1.22.5
 docusaurus glossary
Alphabetical list of terms
Done in 1.53s.
```

This will generate a file in `./docs/glossary.md` where every term that has been
mentioned above, will be populated in the `glossary.md` page.

## How to contribute

To build and use the plugin locally in a project, apply changes etc., follow the 
instructions below.

Clone the repository [https://gitlab.grnet.gr/devs/docusaurus-terminology](https://gitlab.grnet.gr/devs/docusaurus-terminology)

Then run the following commands:

```.shell script
$ cd docusaurus-terminology
$ yarn install
$ yarn run lerna bootstrap
$ yarn run lerna run build
```

After running those commands, all packages will be initialized and built, so 
they are ready to be linked locally with a docusaurus project.

We first need to use the command `yarn link` to create symlinks for each of our 
packages, in order to "install" them (symlink them actually) with another 
docusaurus project. Run the following commands:

```.shell script
$ cd packages/parser
$ yarn link
$ cd ../term
$ yarn link
```

Right now we have created the symlinks for these packages, so they are ready 
to be "installed" in another docusaurus project. Let's go to a docusaurus project 
and link them:

```.shell script
$ yarn link @docusaurus-terminology/parser
$ yarn link @docusaurus-terminology/term
```

After running those commands inside the docusaurus project, we are ready to 
replace the custom integrations with our new packages. As the term component 
will be injected automatically, we only need to replace the parser integration 
`docusaurus.config.js`:

```
  plugins: [
    '@docusaurus-terminology/parser'
  ]
};
```

And then we are ready to run our well-known commands:

```.shell script
$ yarn parse
$ yarn glossary
$ yarn build
```

You can use a package named `serve` to create instantly a nodejs webserver to 
serve these files (as used in the dockerfile). You can run the following:

```
$ yarn global add serve
$ cd build
$ serve
```
