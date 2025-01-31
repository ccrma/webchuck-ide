//------------------------------------------------------------------
// title: Editor
// desc:  Monaco editor and functionality for WebChucK IDE
//        Depends on all files in the editor folder
//
// author: terry feng
// date:   May 2023
//------------------------------------------------------------------

import ChuckBar from "@/components/chuckBar/chuckBar";

import { diffChars, Change } from "diff";
import { monaco } from "./monacoLite";
import { editorConfig } from "./chuck-lang";
import { initVimMode, VimMode } from "monaco-vim";
import { miniAudicleLight, miniAudicleDark } from "./miniAudicleTheme";
import { File, fetchTextFile } from "@/utils/fileLoader";
import EditorPanelHeader from "@/components/editor/editorPanelHeader";
import Console from "@/components/outputPanel/console";
import ProjectSystem from "../../fileExplorer/projectSystem";
import GUI from "@/components/inputPanel/gui/gui";
import SessionManager from "@/components/session/sessionManager";

// Constants
const HEADER_HEIGHT: string = "2rem";
const VIM_STATUS_HEIGHT: string = "1.75rem";

// Define editor themes
monaco.editor.defineTheme("miniAudicleLight", miniAudicleLight);
monaco.editor.defineTheme("miniAudicleDark", miniAudicleDark);

export default class Editor {
    // Private variables
    public static editor: monaco.editor.IStandaloneCodeEditor; // COCHUCK TODO: make private again
    // Staic variables
    public static filename: string = "untitled.ck";
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
            theme:
                localStorage.theme === "dark"
                    ? "miniAudicleDark"
                    : "miniAudicleLight",
            // TODO: change automaticLayout to false
            // For some reason, monaco height can't be resized to smaller, doesn't respond
            // This trick temp fixes it but is really slow
            automaticLayout: true,
            scrollBeyondLastLine: false,
            fontSize: 14,
            cursorBlinking: "smooth",
        });

        // Editor autosave config
        Editor.loadAutoSave();
        // When the editor is changed, save the code to local storage & project system
        Editor.editor.onDidChangeModelContent(() => {
            SessionManager.handleEditorKeyboardInput();
            ProjectSystem.updateActiveFile(Editor.getEditorCode());
            Editor.saveCode();
        });

        // Vim Toggle
        Editor.vimToggle =
            document.querySelector<HTMLButtonElement>("#vimToggle")!;
        Editor.vimToggle.addEventListener("click", () => {
            this.toggleVimMode();
            Editor.resizeEditor();
        });
        // Initialize Vim mode
        Editor.vimStatus =
            document.querySelector<HTMLDivElement>("#vimStatus")!;
        Editor.vimMode ? this.vimModeOn() : this.vimModeOff();

        // Resize editor on window resize
        window.addEventListener("resize", () => {
            Editor.resizeEditor();
        });

        // VimMode.Vim.defineEx(name, shorthand, callback);
        VimMode.Vim.defineEx("write", "w", function () {
            ProjectSystem.updateActiveFile(Editor.getEditorCode());
            Editor.saveCode();
            GUI.generateGUI();
        });
        // Keybindings
        this.initMonacoKeyBindings();
    }

    /**
     * Load the autosave from local storage
     */
    static loadAutoSave() {
        const filename =
            localStorage.getItem("editorFilename") || "untitled.ck";
        const code = localStorage.getItem("editorCode") || "";
        if (code === "") {
            Editor.loadDefault();
            return;
        }
        ProjectSystem.addNewFile(filename, code);
        Console.print(
            `loaded autosave: \x1b[38;2;34;178;254m${
                Editor.filename
            }\x1b[0m (${localStorage.getItem("editorCodeTime")})`
        );
    }

    static async loadDefault() {
        const code: File = await fetchTextFile("./examples/helloSine.ck");
        ProjectSystem.addNewFile("untitled.ck", code.data as string);
    }

    /**
     * Save the code to local storage
     */
    static saveCode() {
        localStorage.setItem("editorCode", Editor.getEditorCode());
        localStorage.setItem("editorFilename", Editor.getFileName());
        localStorage.setItem("editorCodeTime", new Date().toLocaleString());
    }

    /**
     * Resize the editor
     */
    static resizeEditor() {
        Editor.editor?.layout();
    }

    /**
     * Set the editor theme
     */
    static setTheme(dark: boolean) {
        Editor.editor?.updateOptions({
            theme: dark ? "miniAudicleDark" : "miniAudicleLight",
        });
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
                if (ChuckBar.running) ChuckBar.runEditorCode();
            }
        );

        Editor.editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backslash,
            () => {
                if (ChuckBar.running) ChuckBar.replaceCode();
            }
        );

        Editor.editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backspace,
            () => {
                if (ChuckBar.running) ChuckBar.removeCode();
            }
        );

        Editor.editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            () => {
                GUI.generateGUI();
            }
        );
    }

    /**
     * Get the contents of the editor
     * @returns the contents of the editor
     */
    public static getEditorCode(): string {
        return Editor.editor?.getValue();
    }

    /**
     * Set the contents of the editor
     * @param code code to replace in the editor
     */
    public static setEditorCode(code: string) {
        Editor.editor.setScrollTop(0);
        Editor.editor.setPosition({ lineNumber: 1, column: 1 });
        Editor.editor.setValue(code);
    }

    /**
     * Update the contents of the editor
     * Unlike setEditorCode(), this preserves current cursor/selection locations.
     * It is meant for marginal updates, rather than whole text replacement.
     * @param code code to update in the editor
     */
    public static updateEditorCode(newCode: string) {
        const currentCode = Editor.getEditorCode();
        if (currentCode === newCode) return;

        const currentSelections = Editor.editor.getSelections();
        if (!currentSelections) return;

        const editorModel = Editor.editor.getModel();
        if (!editorModel) return;

        // Compute diffs between old and new text
        const diffs = diffChars(currentCode, newCode);

        // Compute new cursor/selection locations based on diffs
        const newSelections = currentSelections.map((selection) => {
            const startOffset = editorModel.getOffsetAt(
                selection.getStartPosition()
            );
            const endOffset = editorModel.getOffsetAt(
                selection.getEndPosition()
            );

            const newStartOffset = Editor.calculateNewOffset(
                startOffset,
                diffs
            );
            const newEndOffset = Editor.calculateNewOffset(endOffset, diffs);

            const newStart = editorModel.getPositionAt(newStartOffset);
            const newEnd = editorModel.getPositionAt(newEndOffset);

            return new monaco.Selection(
                newStart.lineNumber,
                newStart.column,
                newEnd.lineNumber,
                newEnd.column
            );
        });

        // Apply the new text & restore all selections
        editorModel.pushEditOperations(
            currentSelections,
            [
                {
                    range: editorModel.getFullModelRange(),
                    text: newCode,
                },
            ],
            () => newSelections
        );
    }

    /**
     * Given the original cursor offset and list of changes to a text,
     * Calculate the new cursor offset.
     */
    public static calculateNewOffset(
        oldOffset: number,
        diffs: Change[]
    ): number {
        let newOffset = oldOffset;
        let currentIndex = 0;

        for (const diff of diffs) {
            if (diff.added) {
                newOffset += diff.count!;
                currentIndex += diff.count!;
            } else if (diff.removed) {
                newOffset -= diff.count!;
            } else {
                currentIndex += diff.count!;
            }

            if (currentIndex >= newOffset) break;
        }

        return newOffset;
    }

    /**
     * Set the file name
     * @param name The file name
     */
    static setFileName(name: string) {
        Editor.filename = name;
        localStorage.setItem("editorFilename", name);
        EditorPanelHeader.updateFileName(name);
    }

    /**
     * Get the current file name
     * @returns The current file name
     */
    static getFileName(): string {
        return Editor.filename;
    }

    /**
     * Get the current cursor position
     * @returns The current cursor position
     */
    static getPosition() {
        let position = Editor.editor.getPosition();
        if (!position) {
            Editor.editor.setPosition({ lineNumber: 1, column: 1 });
            position = Editor.editor.getPosition();
        }
        return position;
    }

    /**
     * Toggle Vim mode
     */
    toggleVimMode() {
        Editor.vimMode ? this.vimModeOff() : this.vimModeOn();
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
        Editor.resizeEditor();
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
        Editor.resizeEditor();
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
