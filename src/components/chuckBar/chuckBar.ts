//--------------------------------------------------------------------
// title: ChuckBar
// desc:  Button interface for communicating with ChucK VM.
//
//        Left:
//        Start VM, Mic Toggle, Compile and Play, Replace Shred,
//        Remove Shred
//
//        Right:
//        ChucK Time
//        Share Button
//
// author: terry feng
// date:   August 2023
//--------------------------------------------------------------------

import {
    theChuck,
    startChuck,
    connectMic,
    disconnectMic,
    isMicConnected,
    onMicStateChange
} from "@/host";
import Editor from "@/components/editor/monaco/editor";
import VmMonitor from "@/components/vmMonitor";
import Recorder, { RecordState } from "./recorder";
import Console from "@/components/outputPanel/console";

// detect operating system
const isWindows = navigator.userAgent.includes("Windows");
const metaKey = isWindows ? "Ctrl" : "⌘";

const MicButtonIcon = {
    off: `<svg viewBox="13 9 24 33" fill="none" class="w-5 h-5"><path d="M25 10.1667C22.3764 10.1667 20.25 12.2931 20.25 14.9167V24.4167C20.25 27.0402 22.3764 29.1667 25 29.1667C27.6236 29.1667 29.75 27.0402 29.75 24.4167V14.9167C29.75 12.2931 27.6236 10.1667 25 10.1667ZM15.6392 24.4167C14.6797 24.4167 13.9069 25.2681 14.062 26.2165C14.8377 30.966 18.6368 34.6909 23.4167 35.3763V38.6667C23.4167 39.5407 24.126 40.25 25 40.25C25.874 40.25 26.5834 39.5407 26.5834 38.6667V35.3763C31.3632 34.6909 35.1624 30.966 35.938 26.2165C36.0932 25.2681 35.3204 24.4167 34.3609 24.4167C33.5787 24.4167 32.9337 24.9923 32.8023 25.765C32.161 29.4937 28.9124 32.3333 25 32.3333C21.0876 32.3333 17.839 29.4937 17.1978 25.765C17.0664 24.9923 16.4229 24.4167 15.6392 24.4167Z" fill="white"/><line x1="15" y1="12" x2="35" y2="38" stroke="white" stroke-width="3" stroke-linecap="round"/></svg>`,
    on: `<svg viewBox="13 9 24 33" fill="none" class="w-5 h-5"><path d="M25 10.1667C22.3764 10.1667 20.25 12.2931 20.25 14.9167V24.4167C20.25 27.0402 22.3764 29.1667 25 29.1667C27.6236 29.1667 29.75 27.0402 29.75 24.4167V14.9167C29.75 12.2931 27.6236 10.1667 25 10.1667ZM15.6392 24.4167C14.6797 24.4167 13.9069 25.2681 14.062 26.2165C14.8377 30.966 18.6368 34.6909 23.4167 35.3763V38.6667C23.4167 39.5407 24.126 40.25 25 40.25C25.874 40.25 26.5834 39.5407 26.5834 38.6667V35.3763C31.3632 34.6909 35.1624 30.966 35.938 26.2165C36.0932 25.2681 35.3204 24.4167 34.3609 24.4167C33.5787 24.4167 32.9337 24.9923 32.8023 25.765C32.161 29.4937 28.9124 32.3333 25 32.3333C21.0876 32.3333 17.839 29.4937 17.1978 25.765C17.0664 24.9923 16.4229 24.4167 15.6392 24.4167Z" fill="white"/></svg>`
};

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

        ChuckBar.micButton.disabled = true;
        ChuckBar.playButton.disabled = true;
        ChuckBar.replaceButton.disabled = true;
        ChuckBar.removeButton.disabled = true;
        ChuckBar.recordButton.disabled = true;

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
            await ChuckBar.toggleMic();
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

        // Listen for external microphone connection changes
        onMicStateChange((active: boolean) => {
            ChuckBar.setMicButtonState(active);
        });
    }

    static async toggleMic() {
        if (isMicConnected()) {
            disconnectMic();
        } else {
            await connectMic();
        }
    }

    static setMicButtonState(active: boolean) {
        if (active) {
            ChuckBar.micButton.innerHTML = MicButtonIcon.on;
            ChuckBar.micButton.classList.add("ring-2", "ring-purple-500");
            ChuckBar.micButton.title = "Disconnect Microphone";
            ChuckBar.micButton.setAttribute(
                "aria-label",
                "Disconnect Microphone"
            );
            ChuckBar.micButton.setAttribute("aria-pressed", "true");
        } else {
            ChuckBar.micButton.innerHTML = MicButtonIcon.off;
            ChuckBar.micButton.classList.remove("ring-2", "ring-purple-500");
            ChuckBar.micButton.title = "Connect Microphone";
            ChuckBar.micButton.setAttribute("aria-label", "Connect Microphone");
            ChuckBar.micButton.setAttribute("aria-pressed", "false");
        }
    }

    static runEditorCode() {
        theChuck?.runCode(Editor.getEditorCode()).then(
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
