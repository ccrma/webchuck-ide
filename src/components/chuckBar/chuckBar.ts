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
import Editor from "@/components/editor/monaco/editor";
import VmMonitor from "@/components/vmMonitor";
import Recorder, { RecordState } from "./recorder";
import Console from "@/components/outputPanel/console";
import SessionManager from "../session/sessionManager";

// detect operating system
const isWindows = navigator.userAgent.includes("Windows");
const metaKey = isWindows ? "Ctrl" : "⌘";

export default class ChuckBar {
    public static webchuckButton: HTMLButtonElement;
    public static micButton: HTMLButtonElement;
    public static playButton: HTMLButtonElement;
    public static broadcastPlayButton: HTMLButtonElement;
    public static replaceButton: HTMLButtonElement;
    public static removeButton: HTMLButtonElement;
    public static broadcastRemoveButton: HTMLButtonElement;
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
        ChuckBar.broadcastPlayButton =
            document.querySelector<HTMLButtonElement>("#broadcastPlayButton")!;
        ChuckBar.replaceButton =
            document.querySelector<HTMLButtonElement>("#replaceButton")!;
        ChuckBar.removeButton =
            document.querySelector<HTMLButtonElement>("#removeButton")!;
        ChuckBar.broadcastRemoveButton =
            document.querySelector<HTMLButtonElement>(
                "#broadcastRemoveButton"
            )!;
        ChuckBar.recordButton =
            document.querySelector<HTMLButtonElement>("#recordButton")!;

        // Add tooltips
        ChuckBar.webchuckButton.title = `Start ChucK VM [${metaKey} + .]`;
        ChuckBar.micButton.title = `Connect Microphone`;
        ChuckBar.playButton.title = `Run [${metaKey} + Enter]`;
        ChuckBar.broadcastPlayButton.title = `Run (broadcast to all users in the session)`;
        ChuckBar.replaceButton.title = `Replace [${metaKey} + \\]`;
        ChuckBar.removeButton.title = `Remove [${metaKey} + ⌫]`;
        ChuckBar.broadcastRemoveButton.title = `Remove (broadcast to all users in the session)`;
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
        ChuckBar.broadcastPlayButton.addEventListener("click", async () => {
            ChuckBar.broadcastAndRunEditorCode();
        });
        ChuckBar.replaceButton.addEventListener("click", async () => {
            ChuckBar.replaceCode();
        });
        ChuckBar.removeButton.addEventListener("click", async () => {
            ChuckBar.removeCode();
        });
        ChuckBar.broadcastRemoveButton.addEventListener("click", async () => {
            ChuckBar.broadcastAndRemoveCode();
        });

        // Configure the recorder button
        new Recorder(ChuckBar.recordButton);
    }

    static runCode(code: string) {
        theChuck?.runCode(code).then(
            // Success
            (shredID: number) => {
                VmMonitor.addShredRow(shredID);
                Console.print(
                    "[chuck]: \x1b[32m" +
                        `(VM) sporking incoming shred: ${shredID} (compiled.code)...\x1b[0m`
                );
            },
            () => {} // Failure, do nothing
        );
    }

    static runEditorCode() {
        ChuckBar.runCode(Editor.getEditorCode());
    }

    static broadcastAndRunEditorCode() {
        SessionManager.broadcast("play", Editor.getFileName());
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

    static broadcastAndRemoveCode() {
        SessionManager.broadcast("remove");
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

        if (SessionManager.currentSession) {
            ChuckBar.broadcastPlayButton.disabled = false;
            ChuckBar.broadcastRemoveButton.disabled = false;
        }
    }
}
