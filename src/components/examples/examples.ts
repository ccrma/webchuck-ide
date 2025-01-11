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
import InputPanelHeader from "@/components/inputPanel/inputPanelHeader";
import {
    loadChuckFileFromURL,
    loadDataFileFromURL,
} from "@components/fileExplorer/projectSystem";

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
            loadChuckFileFromURL("examples/helloSine.ck")
        );
        Examples.newExample("Harmonic Series Arp", () =>
            loadChuckFileFromURL("examples/harmonicSeriesArp.ck")
        );
        Examples.newExample("Play Lofi Beats", () => {
            loadChuckFileFromURL("examples/slammin/slammin.ck");
            loadDataFileFromURL("examples/slammin/were_slammin.wav");
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
                loadChuckFileFromURL("examples/otf/otf_01.ck");
                loadDataFileFromURL("examples/otf/data/kick.wav");
            },
            otfNested
        );
        Examples.newExample(
            "otf_02.ck",
            () => {
                loadChuckFileFromURL("examples/otf/otf_02.ck");
                loadDataFileFromURL("examples/otf/data/hihat.wav");
            },
            otfNested
        );
        Examples.newExample(
            "otf_03.ck",
            () => {
                loadChuckFileFromURL("examples/otf/otf_03.ck");
                loadDataFileFromURL("examples/otf/data/hihat-open.wav");
            },
            otfNested
        );
        Examples.newExample(
            "otf_04.ck",
            () => {
                loadChuckFileFromURL("examples/otf/otf_04.ck");
                loadDataFileFromURL("examples/otf/data/snare-hop.wav");
            },
            otfNested
        );
        Examples.newExample(
            "otf_05.ck",
            () => {
                loadChuckFileFromURL("examples/otf/otf_05.ck");
            },
            otfNested
        );
        Examples.newExample(
            "otf_06.ck",
            () => {
                loadChuckFileFromURL("examples/otf/otf_06.ck");
            },
            otfNested
        );
        Examples.newExample(
            "otf_07.ck",
            () => {
                loadChuckFileFromURL("examples/otf/otf_07.ck");
                loadDataFileFromURL("examples/otf/data/snare.wav");
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
            () => {
                loadChuckFileFromURL("examples/helloSineGUI.ck");
                InputPanelHeader.setNotificationPing(0, true);
            },
            guiNested
        );
        Examples.newExample(
            "FM Synthesis GUI",
            () => {
                loadChuckFileFromURL("examples/fmGUI.ck");
                InputPanelHeader.setNotificationPing(0, true);
            },
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
            () => {
                loadChuckFileFromURL("examples/mouseHID.ck"),
                    InputPanelHeader.setNotificationPing(1, true);
            },
            hidNested
        );
        Examples.newExample(
            "Keyboard Organ HID",
            () => {
                loadChuckFileFromURL("examples/keyboardHID.ck");
                InputPanelHeader.setNotificationPing(1, true);
            },
            hidNested
        );

        // Sensor Nested Examples
        const sensorNested = NestedDropdown.createNewNestedDropdown(
            this.examplesDropdownContainer,
            "sensor",
            "Sensor"
        );
        Examples.newExample(
            "Gyro Demo",
            () => {
                loadChuckFileFromURL("examples/gyro/gyroDemo.ck");
                loadDataFileFromURL("examples/gyro/gyroLoop.wav");
                InputPanelHeader.setNotificationPing(2, true);
            },
            sensorNested
        );
        Examples.newExample(
            "Accel Demo",
            () => {
                loadChuckFileFromURL("examples/accelDemo.ck");
                InputPanelHeader.setNotificationPing(2, true);
            },
            sensorNested
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
