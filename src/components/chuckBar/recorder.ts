//--------------------------------------------------------
// title: Recorder
// desc:  Recording audio from ChucK VM with a simple button
//        - when no shreds, arm recorder waiting for addShred (play)
//        - when shreds, start recording
//        - when recording and no shreds, stop recording
//        adapted from celeste betancur 220a recorder
//
// author: terry feng (tzfeng@ccrma.stanford.edu)
// date: April 2024
//--------------------------------------------------------

import Console from "@components/outputPanel/console";
import ProjectSystem from "@components/fileExplorer/projectSystem";
import VmMonitor from "@components/vmMonitor";

export enum RecordState {
    stopped = 0,
    recording = 1,
    armed = 2,
}

enum RecordButtonImage {
    stop = "img/stop-button.svg",
    record = "img/record-button.svg",
    armed = "img/armed-button.svg",
}

export default class Recorder {
    public static state: RecordState = RecordState.stopped;
    public static recordButton: HTMLButtonElement;
    public static recordImage: HTMLImageElement;
    public static playButton: HTMLButtonElement;
    public static removeButton: HTMLButtonElement;

    private static stream: MediaStreamAudioDestinationNode;
    private static recorder: MediaRecorder;
    private static buffer: Blob[];

    constructor(recordButton: HTMLButtonElement) {
        Recorder.recordButton = recordButton;
        Recorder.recordButton.title = `Record`;
        Recorder.recordButton.addEventListener("click", async () => {
            Recorder.recordPressed();
        });
        Recorder.recordImage = document.getElementById(
            "recordImage"
        )! as HTMLImageElement;

        // Get references to Chuck Buttons
        Recorder.playButton = document.getElementById(
            "playButton"
        )! as HTMLButtonElement;
        Recorder.removeButton = document.getElementById(
            "removeButton"
        )! as HTMLButtonElement;
    }

    static configureRecorder(audioContext: AudioContext, gainNode: GainNode) {
        // Record functionality
        Recorder.stream = audioContext.createMediaStreamDestination();
        Recorder.recorder = new MediaRecorder(Recorder.stream.stream);
        gainNode.connect(Recorder.stream);
        Recorder.buffer = [];

        // Write record data to buffer
        Recorder.recorder.ondataavailable = (e) => {
            Recorder.buffer.push(e.data);
        };

        // When stop recording, convert buffer to wav blob
        Recorder.recorder.onstop = async () => {
            // Convert buffer to wav blob
            const blob = new Blob(Recorder.buffer, {
                type: Recorder.recorder.mimeType,
            });
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const wavBlob = await convertAudioBufferToWavBlob(audioBuffer);

            // Get current filename and local date_time
            const filename = ProjectSystem.activeFile
                .getFilename()
                .slice(0, -3);
            const now = new Date();
            const date = now.toLocaleDateString().replace(/\//g, "-");
            const time = now
                .toLocaleTimeString()
                .replace(/:/g, "-")
                .replace(/\s/g, "");
            const dateTime = `${date}_${time}`;

            // Save file
            const blobLink = getBlobLink(
                wavBlob,
                filename + "_" + dateTime + ".wav"
            );
            Console.print(
                `download recording here: \x1b[38;2;34;178;254m${blobLink}\x1b[0m`
            );

            Recorder.buffer = [];
        };
    }

    static recordPressed() {
        const numActiveShreds = VmMonitor.getNumShreds();

        // Record button FSM
        switch (Recorder.state) {
            case RecordState.stopped:
                if (numActiveShreds === 0) {
                    Recorder.armRecorder();
                } else {
                    Recorder.startRecording();
                }
                break;
            case RecordState.recording:
                Recorder.stopRecording();
                break;
            case RecordState.armed:
                Recorder.disarmRecorder();
                break;
        }
    }

    static startRecording() {
        Recorder.state = RecordState.recording;
        Console.print("\x1b[31mrecording...\x1b[0m"); // Print in red
        Recorder.recordImage.src = RecordButtonImage.stop;

        Recorder.playButton.removeEventListener(
            "click",
            Recorder.startRecording
        );
        Recorder.recorder.start();
    }

    static stopRecording() {
        Recorder.state = RecordState.stopped;
        Console.print("recording stopped...");
        Recorder.recordImage.src = RecordButtonImage.record;

        Recorder.recorder.stop();
    }

    static armRecorder() {
        Recorder.state = RecordState.armed;
        Console.print("armed for recording...");
        Recorder.recordImage.src = RecordButtonImage.armed;

        Recorder.playButton.addEventListener("click", Recorder.startRecording);
    }

    static disarmRecorder() {
        Recorder.state = RecordState.stopped;
        Recorder.recordImage.src = RecordButtonImage.record;
        Recorder.playButton.removeEventListener(
            "click",
            Recorder.startRecording
        );
    }
}

//--------------------------------------
// Recorder Utility Functions
//--------------------------------------
/**
 * Convert an AudioBuffer to a Wav Blob
 * @param audioBuffer audio buffer to convert
 * @returns Promise that resolves to a Blob
 */
async function convertAudioBufferToWavBlob(
    audioBuffer: AudioBuffer
): Promise<Blob> {
    return new Promise<Blob>((resolve) => {
        // This file is in `public/js`
        const worker = new Worker("./js/wave-worker.js");

        worker.onmessage = (e: MessageEvent) => {
            const blob = new Blob([e.data.buffer], { type: "audio/wav" });
            resolve(blob);
        };

        const pcmArrays: Float32Array[] = [];
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            pcmArrays.push(audioBuffer.getChannelData(i));
        }

        worker.postMessage({
            pcmArrays,
            config: { sampleRate: audioBuffer.sampleRate },
        });
    });
}

/**
 * Get the link to download a blob
 * @param blob blob to download
 * @param name name of blob
 * @returns url to the blob
 */
function getBlobLink(blob: Blob, name: string): string {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = name;
    // link.click();
    return link.href;
}
