# WebChucK IDE Developer Guide

How to contribute to WebChucK IDE development!

**NOTE**: All development is done on the `dev` branch. `main` is reserved for 
release.

## Table of Contents
- [WebChucK IDE Developer Guide](#webchuck-ide-developer-guide)
  - [Table of Contents](#table-of-contents)
  - [Setup](#setup)
  - [Development](#development)
  - [Building](#building)
  - [Deploy and Release](#deploy-and-release)

## Setup

Make sure you have [Git](https://git-scm.com) and [Node](https://nodejs.org) installed.

Clone the repository if you haven't already. 

```
git clone https://github.com/ccrma/webchuck-ide.git
```

In the webchuck-ide repo, install npm dependencies

```
npm install
```

## Development 

To run WebChucK IDE on a local development server for testing:

```
npm run dev
```

## Accessibility Testing

To run local accessibility testing, make sure the local development server is running (see above), then:

```
npm run a11y
```

Make sure that the accessibility test passes before deploying.

## Building

Build WebChucK IDE to a static site by running: 

```
npm run build
```

This will build WebChucK IDE and place all necessary files in the `./dist` folder.

## Deploy and Release

To release a new version of WebChucK IDE:

1. **On the `dev` branch**, bump the version number (without creating a tag yet):

```
npm version patch --no-git-tag-version    # or minor/major as appropriate
git add package.json package-lock.json
git commit -m "Bump version to X.X.X"
git push origin dev
```

2. **Create a pull request** merging `dev` into `main` with the version bump

3. **Once merged to `main`**, build and deploy:

```
npm run clean
npm install
npm run build
```

Copy the `./dist/` folder to hosting destination.

4. **Tag the release** on the `main` merge commit:

```
git tag -a vX.X.X -m "Release version X.X.X"
git push origin vX.X.X
```

This will trigger a GitHub release. Talk to **@gewang** to update the [WebChucK IDE](https://chuck.stanford.edu/ide) site.
