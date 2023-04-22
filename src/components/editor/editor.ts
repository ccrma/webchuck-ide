import monaco from "./monacoLite";
import { editorConfig } from "./chuck-lang";
//import { initVimMode } from 'monaco-vim';

//const vimMode = initVimMode(editor, document.getElementById('my-statusbar'))

/*--------------------------  Monaco Worker --------------------------*/
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

self.MonacoEnvironment = {
    getWorker(_: any) {
        return new editorWorker();
    },
};

/*----------------------- EDITOR --------------------------*/

let editor : monaco.editor.IStandaloneCodeEditor;

export function createEditor(editorDiv: HTMLDivElement) {
    editor = monaco.editor.create(editorDiv, {
        // Params
        theme: "vs-light",
        language: "chuck",
        minimap: {
            enabled: false,
        },

        model: editorConfig,
    });
}


export function getEditorCode(): string {
    // get the contents of the editor
    return editor?.getValue();
}
