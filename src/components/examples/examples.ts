//----------------------------------------------------------------------
// title: examples
// desc: basic examples dropdown in navbar
//       loads examples from public/examples
//
// author: terry feng
// date:   August 2023
//----------------------------------------------------------------------

import DropdownElement from "@/components/navbar/dropdownElement";
import NestedDropdown from "@/components/navbar/nestedDropdown";
import { loadChuckFile, loadDataFile } from "@components/fileExplorer/projectSystem";

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
            loadChuckFile("examples/helloSine.ck")
        );
        Examples.newExample("Harmonic Series Arp", () =>
            loadChuckFile("examples/harmonicSeriesArp.ck")
        );
        Examples.newExample("Play Lofi Beats", () => {
            loadChuckFile("examples/slammin/slammin.ck");
            loadDataFile("examples/slammin/were_slammin.wav");
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
                loadChuckFile("examples/otf/otf_01.ck");
                loadDataFile("examples/otf/data/kick.wav");
            },
            otfNested
        );
        Examples.newExample(
            "otf_02.ck",
            () => {
                loadChuckFile("examples/otf/otf_02.ck");
                loadDataFile("examples/otf/data/hihat.wav");
            },
            otfNested
        );
        Examples.newExample(
            "otf_03.ck",
            () => {
                loadChuckFile("examples/otf/otf_03.ck");
                loadDataFile("examples/otf/data/hihat-open.wav");
            },
            otfNested
        );
        Examples.newExample(
            "otf_04.ck",
            () => {
                loadChuckFile("examples/otf/otf_04.ck");
                loadDataFile("examples/otf/data/snare-hop.wav");
            },
            otfNested
        );
        Examples.newExample(
            "otf_05.ck",
            () => {
                loadChuckFile("examples/otf/otf_05.ck");
            },
            otfNested
        );
        Examples.newExample(
            "otf_06.ck",
            () => {
                loadChuckFile("examples/otf/otf_06.ck");
            },
            otfNested
        );
        Examples.newExample(
            "otf_07.ck",
            () => {
                loadChuckFile("examples/otf/otf_07.ck");
                loadDataFile("examples/otf/data/snare.wav");
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
            () => loadChuckFile("examples/helloSineGUI.ck"),
            guiNested
        );
        Examples.newExample(
            "FM Synthesis GUI",
            () => loadChuckFile("examples/fmGUI.ck"),
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
            () => loadChuckFile("examples/mouseHID.ck"),
            hidNested
        );
        Examples.newExample(
            "Keyboard Organ HID",
            () => loadChuckFile("examples/keyboardHID.ck"),
            hidNested
        );
    }

    /**
     * Create a new example in the examples dropdown
     * @param name name of examples
     * @param callback code to execute when example is clicked
     * @param nestedParent
     */
    static newExample(
        name: string,
        callback: () => void,
        nestedParent: HTMLUListElement = Examples.examplesDropdownContainer
    ) {
        return new DropdownElement(nestedParent, name, callback);
    }
}
