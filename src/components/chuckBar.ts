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
import VmMonitor from "@/components/vmMonitor";
import Recorder, { RecordState } from "@/components/recorder";
import Console from "@/components/console";


// detect operating system
const isWindows = navigator.userAgent.includes("Windows");
const metaKey = isWindows ? "Ctrl" : "⌘";

export default class ChuckBar {
    public static webchuckButton: HTMLButtonElement;
    public static micButton: HTMLButtonElement;
    public static playButton: HTMLButtonElement;
    public static replaceButton: HTMLButtonElement;
    public static removeButton: HTMLButtonElement;
    public static recordButton: HTMLButtonElement;

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
        ChuckBar.recordButton =
            document.querySelector<HTMLButtonElement>("#recordButton")!;

        // Add tooltips
        ChuckBar.webchuckButton.title = `Start ChucK VM [${metaKey} + .]`;
        ChuckBar.micButton.title = `Connect Microphone`;
        ChuckBar.playButton.title = `Run [${metaKey} + Enter]`;
        ChuckBar.replaceButton.title = `Replace [${metaKey} + \\]`;
        ChuckBar.removeButton.title = `Remove [${metaKey} + ⌫]`;
        ChuckBar.recordButton.title = `Record`;

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

        // Configure the recorder button
        new Recorder(ChuckBar.recordButton);
    }

    static runEditorCode() {
        theChuck?.runCode(Editor.getEditorCode()).then(
            // Success
            (shredID: number) => { 
                VmMonitor.addShredRow(shredID);
                Console.print("[chuck]: \x1b[32m" + `(VM) sporking incoming shred: ${shredID} (compiled.code)...\x1b[0m`)
            },
            () => {} // Failure, do nothing
        );
    }

    static replaceCode() {
        theChuck?.replaceCode(Editor.getEditorCode()).then(
            // Success
            (shreds: { oldShred: number; newShred: number }) => {
                VmMonitor.removeShredRow(shreds.oldShred);
                VmMonitor.addShredRow(shreds.newShred);
            },
            () => {} // Failure, do nothing
        );
    }

    static removeCode() {
        theChuck?.removeLastCode().then(
            // Success
            (shredID: number) => {
                VmMonitor.removeShredRow(shredID);
                // Also stop recording if no shreds
                if (
                    Recorder.state === RecordState.recording &&
                    VmMonitor.getNumShreds() === 0
                ) {
                    Recorder.stopRecording();
                }
            },
            () => {} // Failure, do nothing
        );
    }

    static async startWebchuck() {
        if (ChuckBar.running) {
            return;
        }

        ChuckBar.webchuckButton.disabled = true;

        // Start WebChuck Host
        await startChuck();
        ChuckBar.webchuckButton.innerText = "WebChucK running...";
        ChuckBar.running = true;

        // Enable the ChuckBar buttons
        ChuckBar.micButton.disabled = false;
        ChuckBar.playButton.disabled = false;
        ChuckBar.replaceButton.disabled = false;
        ChuckBar.removeButton.disabled = false;
        ChuckBar.recordButton.disabled = false;
    }
}
