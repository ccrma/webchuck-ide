//-------------------------------------------------------------------
// title: Main
// desc: Main entry point for WebChucK IDE
//       All component are imported and initialized here
// author: terry feng
// date: August 2023
//-------------------------------------------------------------------

import NavBar from "@/components/navbar/navbar";
import ChuckBar from "@/components/chuckBar/chuckBar";
import Editor from "@/components/editor/monaco/editor";
import EditorPanelHeader from "@/components/editor/editorPanelHeader";
import InputPanelHeader from "@/components/inputPanel/inputPanelHeader";
import OutputPanelHeader from "@/components/outputPanel/outputPanelHeader";
import Console from "@/components/outputPanel/console";
import VmMonitor from "@/components/vmMonitor";
import ProjectSystem from "@/components/fileExplorer/projectSystem";
import FindInProject from "@/components/fileExplorer/findInProject";
import Examples from "@/components/examples/examples";
import MoreExamples from "@/components/examples/moreExamples";
import Settings from "@/components/settings";
import GUI from "@/components/inputPanel/gui/gui";
import BottomSheet from "@/components/mobile/bottomSheet";

import { initChuck } from "@/host";
import { initAppSplitters } from "@utils/appLayout";
import { initTheme } from "@utils/theme";
import { initExportWebChuck } from "@/services/export/exportWebchuck";
import { initExportChuck } from "@/services/export/exportChuck";
import { parseURLParams as initParseURLParams } from "./services/urlParamParser";
import { initShareCode } from "./services/shareCode";

class Main {
    public static navBar: NavBar;
    public static chuckBar: ChuckBar;
    public static projectSystem: ProjectSystem;
    public static findInProject: FindInProject;
    public static editor: Editor;
    public static editorPanelHeader: EditorPanelHeader;
    public static vmMonitor: VmMonitor;
    public static inputPanelHeader: InputPanelHeader;
    public static outputPanelHeader: OutputPanelHeader;
    public static console: Console;
    public static examples: Examples;
    public static moreExamples: MoreExamples;
    public static settings: Settings;
    public static GUI: GUI;
    public static bottomSheet: BottomSheet;

    constructor() {
        initTheme(); // Set color scheme

        // CONSTRUCT IDE COMPONENTS
        Main.navBar = new NavBar();
        Main.chuckBar = new ChuckBar();
        Main.projectSystem = new ProjectSystem();
        Main.findInProject = new FindInProject();

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
        Main.moreExamples = new MoreExamples();
        Main.settings = new Settings();
        Main.GUI = new GUI();
        Main.bottomSheet = new BottomSheet();
    }

    init() {
        initAppSplitters(); // Drag resizable panels

        Main.keyboardShortcuts();

        // Prevent accidental page refresh/close
        window.addEventListener("beforeunload", (e) => {
            if (ProjectSystem.size() > 1) {
                e.preventDefault();
                e.returnValue = "";
            }
        });

        // SERVICES
        initExportChuck();
        initExportWebChuck();
        initShareCode();
        initParseURLParams();

        // Init WebChucK
        window.addEventListener("load", async () => {
            await initChuck();
        });
    }

    static keyboardShortcuts() {
        // global keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            // cmd + shift + f or ctrl + shift + f — Find in Files
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "F") {
                e.preventDefault();
                FindInProject.toggle();
                return;
            }

            // cmd + shift + p or ctrl + shift + p — Command Palette
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "P") {
                e.preventDefault();
                Editor.openCommandPalette();
                return;
            }

            // cmd + . or ctrl + .
            if ((e.metaKey || e.ctrlKey) && e.key === ".") {
                e.preventDefault();
                ChuckBar.startWebchuck();
            }

            if (!ChuckBar.running) return;

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

            // cmd + s or ctrl + s
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                GUI.generateGUI();
            }
        });
    }
}

// Main entry point
const main = new Main();
main.init();

// Suppress Monaco's harmless CancellationError from its clipboard workaround.
// Monaco logs these via its internal logService.error(), which calls console.error().
// See: https://github.com/compiler-explorer/compiler-explorer/issues/7181
const _consoleError = console.error;
console.error = (...args: any[]) => {
    if (args.some((a) => a?.name === "Canceled" && a?.message === "Canceled")) {
        return;
    }
    _consoleError.apply(console, args);
};
