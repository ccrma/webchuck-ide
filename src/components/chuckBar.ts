//--------------------------------------------------------------------
// title: ChuckBar
// desc:  Button interface for communicating with ChucK VM.
//
//        Left:
//        Start VM, Mic On, Compile and Play, Replace Shred,
//        Remove Shred
//
//        Right:
//        ChucK Time
//        Share Button
//
// author: terry feng
// date:   August 2023
//--------------------------------------------------------------------

import { theChuck, startChuck, connectMic } from "@/host";
import Editor from "@/components/monaco/editor";
import VmMonitor from "@/components/app-right/vmMonitor";

export default class ChuckBar {
    public static webchuckButton: HTMLButtonElement;
    public static micButton: HTMLButtonElement;
    public static playButton: HTMLButtonElement;
    public static replaceButton: HTMLButtonElement;
    public static removeButton: HTMLButtonElement;

    public static running: boolean = false;

    constructor() {
        // Connect all buttons
        ChuckBar.webchuckButton =
            document.querySelector<HTMLButtonElement>("#webchuckButton")!;
        ChuckBar.micButton =
            document.querySelector<HTMLButtonElement>("#micButton")!;
        ChuckBar.playButton =
            document.querySelector<HTMLButtonElement>("#playButton")!;
        ChuckBar.replaceButton =
            document.querySelector<HTMLButtonElement>("#replaceButton")!;
        ChuckBar.removeButton =
            document.querySelector<HTMLButtonElement>("#removeButton")!;

        // Add button event listeners
        ChuckBar.webchuckButton.addEventListener("click", async () => {
            await ChuckBar.startWebchuck();
        });
        ChuckBar.micButton.addEventListener("click", async () => {
            connectMic();
            ChuckBar.micButton.disabled = true;
        });
        ChuckBar.playButton.addEventListener("click", async () => {
            ChuckBar.runEditorCode();
        });
        ChuckBar.replaceButton.addEventListener("click", async () => {
            ChuckBar.replaceCode();
        });
        ChuckBar.removeButton.addEventListener("click", async () => {
            ChuckBar.removeCode();
        });
    }

    static runEditorCode() {
        theChuck?.runCode(Editor.getEditorCode()).then(
            // Success
            (shredID) => VmMonitor.addShredRow(shredID as number),
            () => {} // Failure, do nothing
        );
    }

    static replaceCode() {
        theChuck?.replaceCode(Editor.getEditorCode()).then(
            // Success
            (shreds) => {
                VmMonitor.removeShredRow(shreds.oldShred);
                VmMonitor.addShredRow(shreds.newShred);
            },
            () => {} // Failure, do nothing
        );
    }

    static removeCode() {
        theChuck?.removeLastCode().then(
            // Success
            (shredID) => VmMonitor.removeShredRow(shredID as number),
            () => {} // Failure, do nothing
        );
    }

    static async startWebchuck() {
        if (ChuckBar.running) {
            return;
        }

        // Start WebChuck Host
        ChuckBar.webchuckButton.disabled = true;
        ChuckBar.webchuckButton.innerText = "Loading...";
        await startChuck();
        ChuckBar.webchuckButton.innerText = "WebChucK running...";

        // Enable the ChuckBar buttons
        ChuckBar.micButton.disabled = false;
        ChuckBar.playButton.disabled = false;
        ChuckBar.replaceButton.disabled = false;
        ChuckBar.removeButton.disabled = false;

        ChuckBar.running = true;
    }
}
