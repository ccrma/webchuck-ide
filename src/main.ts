//-------------------------------------------------------------------
// title: Main
// desc: Main entry point for WebChucK IDE
//       All component are imported and initialized here
// author: terry feng
// date: August 2023
//-------------------------------------------------------------------

import NavBar from "@/components/navbar/navbar";
import Examples from "@/components/navbar/examples";
import ChuckBar from "@components/chuckBar";
import Editor from "@components/monaco/editor";
import EditorPanelHeader from "@/components/panelHeader/editorPanelHeader";
import InputPanelHeader from "@/components/panelHeader/inputPanelHeader";
import OutputPanelHeader from "@/components/panelHeader/outputPanelHeader";
import Console from "@/components/console";
import VmMonitor from "@/components/vmMonitor";
import ProjectSystem from "@/components/projectSystem";

import { initChuck } from "@/host";
import { initAppSplitters } from "@utils/appLayout";
import { initTheme } from "@utils/theme";
import { initExportWebChuck } from "@/services/export/exportWebchuck";
import { initExportChuck } from "@/services/export/exportChuck";

class Main {
    public static navBar: NavBar;
    public static chuckBar: ChuckBar;
    public static projectSystem: ProjectSystem;
    public static editor: Editor;
    public static editorPanelHeader: EditorPanelHeader;
    public static vmMonitor: VmMonitor;
    public static inputPanelHeader: InputPanelHeader;
    public static outputPanelHeader: OutputPanelHeader;
    public static console: Console;
    public static examples: Examples;

    constructor() {
        initTheme(); // Set color scheme

        // CONSTRUCT IDE COMPONENTS
        Main.navBar = new NavBar();
        Main.chuckBar = new ChuckBar();
        Main.projectSystem = new ProjectSystem();

        // CONSTRUCT APP COMPONENTS
        Main.vmMonitor = new VmMonitor();
        Main.inputPanelHeader = new InputPanelHeader();
        Main.outputPanelHeader = new OutputPanelHeader();
        Main.editorPanelHeader = new EditorPanelHeader();
        Main.console = new Console();
        Main.editor = new Editor(
            document.querySelector<HTMLDivElement>("#monacoEditor")!
        );
        Main.examples = new Examples();
    }

    init() {
        initAppSplitters(); // Drag resizable panels

        Main.keyboardShortcuts();

        // Prevent accidental page refresh/close
        // window.addEventListener("beforeunload", (e) => {
        //     e.preventDefault();
        //     e.returnValue = "";
        // });

        // SERVICES
        initExportChuck();
        initExportWebChuck();

        // Init WebChucK
        window.addEventListener("load", () => {
            initChuck();
        });
    }

    static keyboardShortcuts() {
        // global keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            // cmd + . or ctrl + .
            if ((e.metaKey || e.ctrlKey) && e.key === ".") {
                e.preventDefault();
                ChuckBar.startWebchuck();
            }

            if (ChuckBar.running == false) return;

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
