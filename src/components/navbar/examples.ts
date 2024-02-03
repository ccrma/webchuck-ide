//----------------------------------------------------------------------
// title: examples
// desc: basic examples dropdown in navbar
//       loads examples from public/examples
//
// author: terry feng
// date:   August 2023
//----------------------------------------------------------------------

import { File, fetchDataFile, fetchTextFile } from "@/utils/fileLoader";
import DropdownElement from "./dropdownElement";
import Console from "@/components/console";
import { theChuck } from "@/host";
import NestedDropdown from "./nestedDropdown";
import ProjectSystem from "@components/projectSystem";

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
        Examples.newExample("Harmonic Series Arp", () =>
            loadExample("examples/harmonicSeriesArp.ck")
        );
        Examples.newExample("Play Lofi Beats", () => {
            loadExample("examples/slammin/slammin.ck");
            loadExampleDataFile("examples/slammin/were_slammin.wav");
        });

        // OTF Nested Examples
        const otfNested = NestedDropdown.createNewNestedDropdown(
            this.examplesDropdownContainer,
            "otf",
            "On-the-fly"
        );
        Examples.newExample(
            "otf_01.ck",
            () => {
                loadExample("examples/otf/otf_01.ck");
                loadExampleDataFile("examples/otf/data/kick.wav");
            },
            otfNested
        );
        Examples.newExample(
            "otf_02.ck",
            () => {
                loadExample("examples/otf/otf_02.ck");
                loadExampleDataFile("examples/otf/data/hihat.wav");
            },
            otfNested
        );
        Examples.newExample(
            "otf_03.ck",
            () => {
                loadExample("examples/otf/otf_03.ck");
                loadExampleDataFile("examples/otf/data/hihat-open.wav");
            },
            otfNested
        );
        Examples.newExample(
            "otf_04.ck",
            () => {
                loadExample("examples/otf/otf_04.ck");
                loadExampleDataFile("examples/otf/data/snare-hop.wav");
            },
            otfNested
        );
        Examples.newExample(
            "otf_05.ck",
            () => {
                loadExample("examples/otf/otf_05.ck");
            },
            otfNested
        );
        Examples.newExample(
            "otf_06.ck",
            () => {
                loadExample("examples/otf/otf_06.ck");
            },
            otfNested
        );
        Examples.newExample(
            "otf_07.ck",
            () => {
                loadExample("examples/otf/otf_07.ck");
                loadExampleDataFile("examples/otf/data/snare.wav");
            },
            otfNested
        );

        // GUI Nested Examples
        const guiNested = NestedDropdown.createNewNestedDropdown(
            this.examplesDropdownContainer,
            "gui",
            "GUI"
        );
        Examples.newExample(
            "Hello Sine GUI",
            () => loadExample("examples/helloSineGUI.ck"),
            guiNested
        );

        // HID Nested Examples
        const hidNested = NestedDropdown.createNewNestedDropdown(
            this.examplesDropdownContainer,
            "hid",
            "HID"
        );
        Examples.newExample(
            "Mouse PWM HID",
            () => loadExample("examples/mouseHID.ck"),
            hidNested
        );
        Examples.newExample(
            "Keyboard Organ HID",
            () => loadExample("examples/keyboardHID.ck"),
            hidNested
        );
    }

    /**
     * Create a new example in the examples dropdown
     * @param name name of examples
     * @param callback code to execute when example is clicked
     */
    static newExample(
        name: string,
        callback: () => void,
        nestedParent: HTMLUListElement = Examples.examplesDropdownContainer
    ) {
        new DropdownElement(nestedParent, name, callback);
    }
}

//----------------------------------------
// Helper Functions
//----------------------------------------
/**
 * Load a chuck example from a url
 * @param url url to fetch example from
 */
export async function loadExample(url: string): Promise<void> {
    const example: File = await fetchTextFile(url);
    // TODO: create a new file in the file system
    ProjectSystem.addNewFile(example.name, example.data as string);
    Console.print(`Loaded ChucK file: ${example.name}`);
}

/**
 * Load a data file from a url
 * @param url url to data file
 */
async function loadExampleDataFile(url: string): Promise<void> {
    const example: File = await fetchDataFile(url);
    ProjectSystem.addNewFile(example.name, example.data as Uint8Array);
    Console.print(`Loaded file: ${example.name}`);
}
