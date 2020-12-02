---
id: contribute
title: How to contribute
---

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

After running those commands, all packages will be initialized and built, and you are ready for development.

In the directory `website`, there is a docusaurus project, ready with the plugin initialized, which can be used for testing purposes. There are already some markdown files and terms, but new files can be added for further testing.

After making changes in the packages, you should always build the packages and then test them with the local website directory. So first you need to run:

```commandline
yarn build
```

from the root directory of the repository. And then we are ready to test everything in the local docusaurus project, so we run the following commands:

```commandline
cd website
yarn docusaurus parse
yarn docusaurus glossary
```

When we are ready to do a test build to see if our website compiles successfully, we can use the following command:

```commandline
cd website
yarn build
```

And this will output our compiled website in a directory called `build`. You can use a package named `serve` to create instantly a nodejs webserver to serve these files (as used in the dockerfile). You can run the following:

```commandline
yarn global add serve
cd build
serve
```
