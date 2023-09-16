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

import { theChuck, startChuck } from "@/Host";
import Editor from "@/components/monaco/editor";
import VmMonitor from "@/components/vmMonitor";

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
        ChuckBar.micButton.addEventListener("click", async () => {});
        ChuckBar.playButton.addEventListener("click", async () => {
            ChuckBar.runEditorCode();
        });
        ChuckBar.replaceButton.addEventListener("click", async () => {
            ChuckBar.replaceCode();
            // TODO: Replace shred in shred table...
        });
        ChuckBar.removeButton.addEventListener("click", async () => {
            ChuckBar.removeCode();
            // TODO: Remove shred from shred table...
        });
    }

    static runEditorCode() {
        theChuck?.runCode(Editor.getEditorCode()).then(
            (shredID) => VmMonitor.addShredRow(shredID as number),
            () => {}
        );
    }

    static replaceCode() {
        theChuck?.replaceCode(Editor.getEditorCode());
    }

    static removeCode() {
        theChuck?.removeLastCode();
    }

    static async startWebchuck() {
        if (ChuckBar.running) {
            return;
        }

        // Start WebChuck Host
        ChuckBar.webchuckButton.innerText = "Loading...";
        await startChuck();
        ChuckBar.webchuckButton.innerText = "WebChucK running...";
        ChuckBar.webchuckButton.disabled = true;

        // Enable the ChuckBar buttons
        ChuckBar.micButton.disabled = false;
        ChuckBar.playButton.disabled = false;
        ChuckBar.replaceButton.disabled = false;
        ChuckBar.removeButton.disabled = false;

        ChuckBar.running = true;
    }
}
