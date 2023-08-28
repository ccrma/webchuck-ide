//-------------------------------------------------------------------
// title: Main
// desc: Main entry point for WebChucK IDE
//       All component are imported and initialized here
// author: terry feng
// date: August 2023
//-------------------------------------------------------------------

import { createEditor, toggleVimMode } from "./components/editor/editor";
import { NavBar } from "./components/navbar";
import { ChuckBar } from "./components/chuckBar";

class Main {
    public navBar: NavBar;
    public chuckBar: ChuckBar;

    constructor() {
        this.navBar = new NavBar();
        this.chuckBar = new ChuckBar();
    }

    init() {
        createEditor(document.querySelector<HTMLDivElement>("#monaco")!);

        // local logic


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

            // cmd + backspace or ctrl + backspace
            if ((e.metaKey || e.ctrlKey) && e.key === "Backspace") {
                e.preventDefault();
                ChuckBar.removeCode();
            }
        });
    }
}

const main = new Main();
main.init();
