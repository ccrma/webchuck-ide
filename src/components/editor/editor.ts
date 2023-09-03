//------------------------------------------------------------------
// title: Editor
// desc:  Monaco editor and functionality for WebChucK IDE
//        Depends on all files in the editor folder
//
// author: terry feng
// date:   May 2023
//------------------------------------------------------------------

import ChuckBar from "../chuckBar";

import { monaco } from "./monacoLite";
import { editorConfig } from "./chuck-lang";
import { initVimMode } from "monaco-vim";
import { miniAudicleLight } from "./miniAudicleTheme";

// Constants
const HEADER_HEIGHT: string = "1.5rem";
const VIM_STATUS_HEIGHT: string = "1.75rem";

// Define editor themes
monaco.editor.defineTheme("miniAudicleLight", miniAudicleLight);

export default class Editor {
    // Private variables
    private static editor: monaco.editor.IStandaloneCodeEditor;
    // Staic variables
    public static editorContainer: HTMLDivElement;
    public static vimStatus: HTMLDivElement;
    public static vimToggle: HTMLButtonElement;
    public static vimMode: boolean = localStorage.getItem("vimMode") === "true";
    private static vimModule: any; // for the vim object from monaco-vim

    constructor(editorContainer: HTMLDivElement) {
        Editor.editorContainer = editorContainer;
        Editor.editor = monaco.editor.create(editorContainer, {
            // Params
            language: "chuck",
            minimap: {
                enabled: false,
            },
            model: editorConfig,
            theme: "miniAudicleLight",
            scrollBeyondLastLine: false,
            fontSize: 14,
            cursorBlinking: "smooth",
        });

        /*
        // we need the parent of the editor
const parent = editorContainer.parentElement;

// when rows or columns change, style changes, etc.
window.addEventListener('resize', () => {
  // make editor as small as possible
  Editor.editor.layout({ width: 0, height: 0 })

  // wait for next frame to ensure last layout finished
  window.requestAnimationFrame(() => {
    // get the parent dimensions and re-layout the editor
    const rect = parent!.getBoundingClientRect()
    Editor.editor.layout({ width: rect.width, height: rect.height })
  })
})
*/

        // Connect vim toggle button
        Editor.vimToggle =
            document.querySelector<HTMLButtonElement>("#vimToggle")!;
        Editor.vimToggle.addEventListener("click", () => {
            this.toggleVimMode();
        });

        // Initialize Vim mode
        Editor.vimStatus =
            document.querySelector<HTMLDivElement>("#vimStatus")!;
        Editor.vimMode ? this.vimModeOn() : this.vimModeOff();

        // Keybindings
        this.initMonacoKeyBindings();
    }

    /**
     * Add custom keybindings to the editor
     */
    initMonacoKeyBindings() {
        // Experimental shortcut
        Editor.editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Period,
            () => {
                ChuckBar.startWebchuck();
            }
        );
        // global keyboard shortcuts
        Editor.editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            () => {
                ChuckBar.runEditorCode();
            }
        );

        Editor.editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backslash,
            () => {
                ChuckBar.replaceCode();
            }
        );

        Editor.editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backspace,
            () => {
                ChuckBar.removeCode();
            }
        );
    }

    /**
     * Toggle Vim mode
     */
    toggleVimMode() {
        Editor.vimMode ? this.vimModeOff() : this.vimModeOn();
    }

    /**
     * Get the contents of the editor
     * @returns the contents of the editor
     */
    public static getEditorCode(): string {
        // get the contents of the editor
        return Editor.editor.getValue();
    }

    /**
     * Set the contents of the editor
     * @param code code to replace in the editor
     */
    setEditorCode(code: string) {
        Editor.editor.setValue(code);
    }

    /**
     * Turn on Vim mode and configure the editor height
     */
    vimModeOn() {
        // Change Monaco Editor Height to compensate for Vim status bar
        Editor.editorContainer.setAttribute(
            "style",
            `height: calc(100% - ${HEADER_HEIGHT} - ${VIM_STATUS_HEIGHT} - 1px)`
        );
        Editor.editor.layout();
        Editor.vimModule = initVimMode(Editor.editor, Editor.vimStatus);
        // editor block cursor
        Editor.vimToggle.innerText = "Vim Mode: On";
        Editor.vimStatus.setAttribute("style", "display: flex !important");

        localStorage.setItem("vimMode", "true");
        Editor.vimMode = true;
    }

    /**
     * Turn off Vim mode
     */
    vimModeOff() {
        // Change Monaco Editor Height to compensate for Vim status bar
        Editor.editorContainer.setAttribute(
            "style",
            `height: calc(100% - ${HEADER_HEIGHT} - 1px)`
        );
        Editor.editor.layout();
        Editor.vimModule?.dispose();
        Editor.editor.updateOptions({
            cursorStyle: "line",
            cursorBlinking: "smooth",
        });
        Editor.vimToggle.innerText = "Vim Mode: Off";
        Editor.vimStatus?.setAttribute("style", "display: none !important");

        localStorage.setItem("vimMode", "false");
        Editor.vimMode = false;
    }
}
