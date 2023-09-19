import { File, fetchDataFile, fetchTextFile } from "@/utils/fileLoader";
import DropdownElement from "./dropdownElement";
import Editor from "@components/monaco/editor";
import EditorPanelHeader from "@components/header/editorPanelHeader";
import Console from "@components/console";
import { theChuck } from "@/Host";

export default class Examples {
    public static examplesDropdownContainer: HTMLUListElement;
    constructor() {
        Examples.examplesDropdownContainer =
            document.querySelector<HTMLUListElement>(
                "#examplesDropdownContainer"
            )!;
        Examples.buildBasicExamples();
    }

    /**
     * Create all the basic example buttons to load
     */
    static buildBasicExamples() {
        Examples.newExample("Hello Sine", () =>
            loadExample("examples/helloSine.ck")
        );
        Examples.newExample("Hello Sine GUI", () =>
            loadExample("examples/helloSineGUI.ck")
        );
        Examples.newExample("Harmonic Series Arp", () =>
            loadExample("examples/harmonicSeriesArp.ck")
        );
        Examples.newExample("Play Lofi Beats", () => {
            loadExample("examples/slammin/slammin.ck");
            loadExampleDataFile("examples/slammin/were_slammin.wav");
        });
    }

    /**
     * Create a new example in the examples dropdown
     * @param name name of examples
     * @param callback code to execute when example is clicked
     */
    static newExample(name: string, callback: () => void) {
        new DropdownElement(Examples.examplesDropdownContainer, name, callback);
    }
}

//----------------------------------------
// Helper Functions
//----------------------------------------
/**
 * Load a chuck example from a url
 * @param url url to fetch example from
 */
async function loadExample(url: string): Promise<void> {
    let example: File = await fetchTextFile(url);
    // TODO: create a new file in the file system
    Editor.setEditorCode(example.data as string);
    EditorPanelHeader.setFileName(example.name);
    const type =
        example.name.split(".").pop() === "ck"
            ? "chuck"
            : example.name.split(".").pop();
    Console.print(`Loaded ${type} file: ${example.name}`);
}

/**
 * Load a data file from a url
 * @param url url to data file
 */
async function loadExampleDataFile(url: string): Promise<void> {
    let example: File = await fetchDataFile(url);
    // TODO: check for preloading/file system
    theChuck?.createFile("", example.name, example.data);
    Console.print(`Loaded file: ${example.name}`);
}
