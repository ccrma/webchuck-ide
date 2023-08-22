import { monaco } from "./monacoLite";
import { editorConfig } from "./chuck-lang";
import { initVimMode } from "monaco-vim";
import { miniAudicleLight } from "./miniAudicleTheme";

// Define editor themes
monaco.editor.defineTheme("miniAudicleLight", miniAudicleLight);

let editor: monaco.editor.IStandaloneCodeEditor;
let vimMode: boolean = localStorage.getItem("vimMode") === "true";
let vimModule: any; // for the vim object from monaco-vim

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

    // Initialize Vim mode
    vimMode ? vimModeOn() : vimModeOff();
}

function vimModeOn() {
    vimModule = initVimMode(editor, document.getElementById("vim-status"));
    localStorage.setItem("vimMode", "true");
    vimMode = true;
}

function vimModeOff() {
    vimModule?.dispose();
    localStorage.setItem("vimMode", "false");
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
