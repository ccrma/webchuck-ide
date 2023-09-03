//-------------------------------------------------------------------
// title: Main
// desc: Main entry point for WebChucK IDE
//       All component are imported and initialized here
// author: terry feng
// date: August 2023
//-------------------------------------------------------------------

import NavBar from "./components/navbar";
import ChuckBar from "./components/chuckBar";
import Editor from "./components/editor/editor";
import { initAppSplitters } from "./services/appLayoutHandler";

class Main {
    public navBar: NavBar;
    public chuckBar: ChuckBar;
    public Editor: Editor;

    constructor() {
        this.navBar = new NavBar();
        this.chuckBar = new ChuckBar();

        // Create Monaco Editor
        this.Editor = new Editor(
            document.querySelector<HTMLDivElement>("#monacoEditor")!
        );
    }

    init() {
        initAppSplitters();
        Main.keyboardShortcuts();
    }

    static keyboardShortcuts() {
        // global keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            // cmd + enter or ctrl + enter
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                ChuckBar.runEditorCode();
            }

            // cmd + \ or ctrl + \
            if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
                e.preventDefault();
                ChuckBar.replaceCode();
            }

            // cmd + backspace or ctrl + backspace
            if ((e.metaKey || e.ctrlKey) && e.key === "Backspace") {
                e.preventDefault();
                ChuckBar.removeCode();
            }
        });
    }
}

// Main entry point
const main = new Main();
main.init();
