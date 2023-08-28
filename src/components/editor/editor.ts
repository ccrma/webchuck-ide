//------------------------------------------------------------------
// title: Editor
// desc:  Monaco editor and functionality for WebChucK IDE
//        Depends on all files in the editor folder
//
// author: terry feng
// date:   May 2023
//------------------------------------------------------------------

import { monaco } from "./monacoLite";
import { editorConfig } from "./chuck-lang";
import { initVimMode } from "monaco-vim";
import { miniAudicleLight } from "./miniAudicleTheme";

// Define editor themes
monaco.editor.defineTheme("miniAudicleLight", miniAudicleLight);

let editor: monaco.editor.IStandaloneCodeEditor;
let vimMode: boolean = localStorage.getItem("vimMode") === "true";
let vimModule: any; // for the vim object from monaco-vim
let vimToggle: HTMLButtonElement;

export function createEditor(editorDiv: HTMLDivElement) {
    editor = monaco.editor.create(editorDiv, {
        // Params
        language: "chuck",
        minimap: {
            enabled: false,
        },

        model: editorConfig,
        theme: "miniAudicleLight",
    });

    // Connect vim toggle button
    vimToggle = document.querySelector<HTMLButtonElement>("#vim-toggle")!;
    vimToggle.addEventListener("click", () => {
        toggleVimMode();
    });

    // Initialize Vim mode
    vimMode ? vimModeOn() : vimModeOff();
}

function vimModeOn() {
    vimModule = initVimMode(editor, document.getElementById("vim-status"));
    localStorage.setItem("vimMode", "true");
    vimToggle.innerText = "Vim Mode: On";
    vimMode = true;
}

function vimModeOff() {
    vimModule?.dispose();
    localStorage.setItem("vimMode", "false");
    vimToggle.innerText = "Vim Mode: Off";
    vimMode = false;
}

export function toggleVimMode() {
    if (vimMode) {
        vimModeOff();
    } else {
        vimModeOn();
    }
}

export function getEditorCode(): string {
    // get the contents of the editor
    return editor?.getValue();
}
