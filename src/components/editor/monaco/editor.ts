//------------------------------------------------------------------
// title: Editor
// desc:  Monaco editor and functionality for WebChucK IDE
//        Depends on all files in the editor folder
//
// author: terry feng
// date:   May 2023
//------------------------------------------------------------------

import ChuckBar from "@/components/chuckBar/chuckBar";

import { monaco } from "./monacoLite";
import { editorConfig } from "./chuck-lang";
import { initVimMode, VimMode } from "monaco-vim";
import { miniAudicleLight, miniAudicleDark } from "./miniAudicleTheme";
import EditorPanelHeader from "@/components/editor/editorPanelHeader";
import Console from "@/components/outputPanel/console";
import ProjectSystem from "../../fileExplorer/projectSystem";
import FindInProject from "../../fileExplorer/findInProject";
import GUI from "@/components/inputPanel/gui/gui";

// Constants
const VIM_STATUS_HEIGHT: string = "1.75rem";

// Define editor themes
monaco.editor.defineTheme("miniAudicleLight", miniAudicleLight);
monaco.editor.defineTheme("miniAudicleDark", miniAudicleDark);

export default class Editor {
    // Private variables
    private static editor: monaco.editor.IStandaloneCodeEditor;
    // Staic variables
    public static filename: string = "untitled.ck";
    public static editorContainer: HTMLDivElement;
    public static vimStatus: HTMLDivElement;
    public static vimToggle: HTMLButtonElement;
    public static vimMode: boolean = localStorage.getItem("vimMode") === "true";
    private static vimModule: any; // for the vim object from monaco-vim
    private static saveTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(editorContainer: HTMLDivElement) {
        Editor.editorContainer = editorContainer;
        Editor.editor = monaco.editor.create(editorContainer, {
            // Params
            language: "chuck",
            minimap: {
                enabled: false
            },
            model: editorConfig,
            theme:
                localStorage.theme === "dark"
                    ? "miniAudicleDark"
                    : "miniAudicleLight",
            automaticLayout: false,
            scrollBeyondLastLine: false,
            find: { addExtraSpaceOnTop: false },
            fontSize: parseInt(localStorage.getItem("editorFontSize") || "14"),
            cursorBlinking: "smooth",
            stickyScroll: { enabled: false }
        });

        // Editor autosave will be loaded by startup service
        // When the editor is changed, save the code to local storage & project system
        Editor.editor.onDidChangeModelContent(() => {
            ProjectSystem.updateActiveFile(Editor.getEditorCode());
            if (Editor.saveTimer) clearTimeout(Editor.saveTimer);
            Editor.saveTimer = setTimeout(() => Editor.saveCode(), 300);
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

        // Editor font size controls
        document
            .getElementById("editorFontDown")
            ?.addEventListener("click", () => Editor.changeEditorFontSize(-1));
        document
            .getElementById("editorFontUp")
            ?.addEventListener("click", () => Editor.changeEditorFontSize(1));

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
            theme: dark ? "miniAudicleDark" : "miniAudicleLight"
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

        // Ctrl+F and Ctrl+H (find / find-and-replace) using WinCtrl
        // so the physical Ctrl key works on all platforms (including Mac,
        // where CtrlCmd maps to Cmd and Ctrl+H would otherwise delete a char).
        Editor.editor.addCommand(
            monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyF,
            () => {
                Editor.editor.trigger("", "actions.find", null);
            }
        );
        Editor.editor.addCommand(
            monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyH,
            () => {
                Editor.editor.trigger(
                    "",
                    "editor.action.startFindReplaceAction",
                    null
                );
            }
        );

        // Command palette & Find in Files keybindings
        // These must be Monaco keybindings (not just document listeners)
        // so they work when the editor has focus on all platforms.
        Editor.editor.addAction({
            id: "webchuck.findInFiles",
            label: "Find in Files",
            keybindings: [
                monaco.KeyMod.CtrlCmd |
                    monaco.KeyMod.Shift |
                    monaco.KeyCode.KeyF
            ],
            run: () => {
                FindInProject.toggle();
            }
        });

        Editor.editor.addAction({
            id: "webchuck.commandPalette",
            label: "Command Palette",
            keybindings: [
                monaco.KeyMod.CtrlCmd |
                    monaco.KeyMod.Shift |
                    monaco.KeyCode.KeyP
            ],
            run: () => {
                Editor.openCommandPalette();
            }
        });
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
     * Open Monaco's command palette programmatically
     */
    static openCommandPalette() {
        Editor.editor.focus();
        Editor.editor.trigger("", "editor.action.quickCommand", null);
    }

    /**
     * Reveal and highlight a specific line in the editor
     */
    static revealLine(lineNumber: number) {
        Editor.editor?.revealLineInCenter(lineNumber);
        Editor.editor?.setPosition({ lineNumber, column: 1 });
        Editor.editor?.focus();
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
     * Change the editor and console font size by delta
     */
    static changeEditorFontSize(delta: number) {
        // Reset Monaco zoom to avoid desync with command palette zoom
        monaco.editor.EditorZoom.setZoomLevel(0);
        const current = parseInt(
            localStorage.getItem("editorFontSize") || "14"
        );
        const next = Math.max(10, Math.min(24, current + delta));
        Editor.editor.updateOptions({ fontSize: next });
        Editor.syncFontSize(next);
    }

    /**
     * Sync font size to console and localStorage
     */
    private static syncFontSize(size: number) {
        localStorage.setItem("editorFontSize", String(size));
        Console.changeFontSize(size);
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
        // Adjust editor bottom to make room for Vim status bar
        Editor.editorContainer.setAttribute(
            "style",
            `bottom: ${VIM_STATUS_HEIGHT}`
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
        // Reset editor to stretch to bottom
        Editor.editorContainer.setAttribute("style", "bottom: 0");
        Editor.resizeEditor();
        Editor.vimModule?.dispose();
        Editor.editor.updateOptions({
            cursorStyle: "line",
            cursorBlinking: "smooth"
        });
        Editor.vimToggle.innerText = "Vim Mode: Off";
        Editor.vimStatus?.setAttribute("style", "display: none !important");

        localStorage.setItem("vimMode", "false");
        Editor.vimMode = false;
    }
}
