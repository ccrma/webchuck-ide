//-------------------------------------------------------------------
// title: Main
// desc: Main entry point for WebChucK IDE
//       All component are imported and initialized here
// author: terry feng
// date: August 2023
//-------------------------------------------------------------------

import NavBar from "@components/navbar";
import ChuckBar from "@components/chuckBar";
import Editor from "@components/monaco/editor";
import { initAppSplitters } from "@utils/appLayout";
import { initDarkModeToggle, setColorScheme } from "./utils/theme";

class Main {
    public static navBar: NavBar;
    public static chuckBar: ChuckBar;
    public static Editor: Editor;

    constructor() {
        // Set Color Scheme
        setColorScheme();

        // Construct Components
        Main.navBar = new NavBar();
        Main.chuckBar = new ChuckBar();
        // Create Monaco Editor
        Main.Editor = new Editor(
            document.querySelector<HTMLDivElement>("#monacoEditor")!
        );
    }

    init() {
        // Layout and Buttons
        initAppSplitters();
        initDarkModeToggle();

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
