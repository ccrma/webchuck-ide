# WebChucK IDE

[![Node.js Build](https://github.com/ccrma/webchuck-ide/actions/workflows/node.js.yml/badge.svg)](https://github.com/ccrma/webchuck-ide/actions/workflows/node.js.yml)

A web-based integrated development environment (IDE) for real-time sound synthesis and music creation with [ChucK](https://chuck.stanford.edu)!

Try it here: [https://chuck.stanford.edu/ide/](https://chuck.stanford.edu/ide/)

## What is WebChucK IDE?

Write and run ChucK code in the browser, learn ChucK with interactive examples, and prototype projects with WebChucK IDE! 
WebChucK IDE uses [WebChucK](https://chuck.stanford.edu/webchuck) to bring the latest version of ChucK to the web, runnning via WebAssembly and the Web Audio API. Try ChucK online and share  projects on the web!

Learn more about WebChucK here:

1. [Github](https://github.com/ccrma/webchuck) for WebChucK 
2. [WebChucK Tutorials](https://chuck.stanford.edu/webchuck/tutorial) by Mike Mulshine

## WebChucK IDE Features

- Syntax highlighting with [Monaco editor](https://github.com/microsoft/monaco-editor)

- Monitor runtime of ChucK's virtual machine

- Spectral frequency and waveform visualizer

- Auto-generated GUI

- HID monitoring for keyboard and mouse events

- ChucK's [Example Library](https://chuck.stanford.edu/doc/examples/)

- Export to WebChucK web app

## Usage

Clone this repository 

```
git clone https://github.com/ccrma/webchuck-ide
```

Install [Node](https://nodejs.org/en/download) and dependencies

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

## Contributing

Contributions are welcome! Please report issues and open PRs to the `dev` branch.

Check out the [Developer Guide](./DEVELOPER_GUIDE.md) to get started.