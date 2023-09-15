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
import { initTheme } from "./utils/theme";
import OutputPanelHeader from "@/components/header/outputPanelHeader";
import Console from "@components/console";

class Main {
    public static navBar: NavBar;
    public static chuckBar: ChuckBar;
    public static Editor: Editor;
    public static outputPanelHeader: OutputPanelHeader;
    public static console: Console;

    constructor() {
        // CONSTRUCT IDE COMPONENTS
        Main.navBar = new NavBar();
        Main.chuckBar = new ChuckBar();

        // CONSTRUCT APP COMPONENTS
        Main.outputPanelHeader = new OutputPanelHeader();
        Main.Editor = new Editor(
            document.querySelector<HTMLDivElement>("#monacoEditor")!
        );
        Main.console = new Console();
    }

    init() {
        initTheme(); // Set theme
        initAppSplitters(); // Drag resizable panels

        Main.keyboardShortcuts();
    }

    static keyboardShortcuts() {
        // global keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            // cmd + . or ctrl + .
            if ((e.metaKey || e.ctrlKey) && e.key === ".") {
                e.preventDefault();
                ChuckBar.startWebchuck();
            }

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
