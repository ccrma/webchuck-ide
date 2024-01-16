# WebChucK IDE

[![Node.js Build](https://github.com/terryzfeng/webchuck-ide/actions/workflows/node.js.yml/badge.svg)](https://github.com/terryzfeng/webchuck-ide/actions/workflows/node.js.yml)

A web-based integrated development environment (IDE) for real-time sound synthesis and music creation with [ChucK](https://chuck.stanford.edu)!

Try it here: [https://chuck.stanford.edu/ide/](https://chuck.stanford.edu/ide/)

## What is WebChucK IDE?

Write and run ChucK code in the browser, learn ChucK with interactive examples, and prototype projects with WebChucK IDE! 
WebChucK IDE runs the latest version of ChucK through [WebChucK](https://chuck.stanford.edu/webchuck), WebAsembly running via the Web Audio API. Try ChucK online and share your projects on the web!

Learn more about WebChucK here:

1. [Github](https://github.com/ccrma/webchuck) for WebChucK 
2. [WebChucK Tutorials](https://chuck.stanford.edu/webchuck/tutorial) by Mike Mulshine

## WebChucK IDE Features

- Syntax highlighting with [Monaco editor](https://github.com/microsoft/monaco-editor)

- Monitor runtime of ChucK's virtual machine

- Spectral frequency and waveform visualizer

- Auto-generated GUI

- ChucK's [Example Library](https://chuck.stanford.edu/doc/examples/)

- Export to WebChucK web app

- *Coming soon: Ability to load and share your code via Github Gists*

## Usage

Clone this repository 

```
git clone https://github.com/ccrma/webchuck-ide
```

Install [Node](https://nodejs.org/en/download) dependencies

```
npm install
```

Run development server to run WebChucK IDE

```
npm run dev
```

(Deployment) Build static WebChucK IDE website to `/dist` folder

```
npm run build
```