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

## Building

Build WebChucK IDE to a static site by running: 

```
npm run build
```

This will build WebChucK IDE and place all necessary files in the `./dist` folder.

## Deploy and Release

To package and release a new version of WebChucK IDE, make sure all changes are 
PR'ed onto the `main` branch. From `main`, make a clean build of WebChucK IDE, 
then tag the version for release.

```
npm run clean
npm install
npm run build
npm version patch
```

Copy the `./dist/` folder to hosting destination.

Talk to **@gewang** to update the [WebChucK IDE](https://chuck.stanford.edu/ide) site.
