# OpenAPI Autodoc

A Website and a CLI that generates documentation formatted for GitBook from an
OpenAPI Specification

## Usage

Make sure you have a recent version of Node.js installed.

### CLI

In your CLI run

```sh
$ npx @gitbook/openapi-autodoc -f ./path/to/my/openapi.yaml
```

The CLI will generate documentation in your current working directory.

Use the Git Sync feature of GitBook to push your generated docs to your GitBook
Space.

### In a continuous integration environment

You can set up @gitbook/openapi-autodoc in your continuous integration
environment to automatically generate documentation from an OpenAPI
specification in your repository, or one generated earlier in the build process.

This is intended to be used with GitBook Git Sync to keep your documentation up
to date - so make sure to set up a Git Sync space first.

Each CI environment differs, and we can't provide instructions for each one.
Here, we try to provide general instructions that can be applied to whatever CI
solution you use.

1. Make sure your CI can make a commit, and push to your repository. Since
   the generated documentation must be stored in your repo, your CI will need to
   push a commit containing the generated documentation.
2. Install Node in your CI environment, if it's not already available.
3. If necessary, generate your openapi spec.
4. Run `npx @gitbook/openapi-autodoc -f ./path/to/my/openapi.yaml` in the root
   directory of your repository.
5. If your generated documentation files have changed, commit them and push them
   to the repository. Files to look for are `.gitbook.yaml` and the `docs` folder.

Your CI will likely be triggered by this commit.

_Warning: If your OpenAPI spec is generated in a different way each time, this
will trigger an infinite CI loop. Make sure your OpenAPI spec is generated in
exactly the same way each time - no timestamps, or random examples of
parameters._

When the second CI run finishes, GitBook Sync will automatically take the new
generated documentation and push it to your GitBook Space.

### Website

This repository also contains a website that can be used to generate a ZIP file
containing the generated documentation. To run the website, run the following
commands:

```sh
$ npm install
$ npm start
```
