//--------------------------------------------------------
// title: Host (Web Audio)
// desc:  Audio Host for WebChucK IDE, managing everything
//        related to Web Audio API
//
//        Creates the AudioContext and WebChucK Web Audio
//        Node instance (Chuck)
//
// author: terry feng
// date:   August 2023
//--------------------------------------------------------

import { Chuck, HID, Gyro, Accel } from "webchuck";
import { calculateDisplayDigits } from "@utils/time";
import { ChuckNow } from "@/components/vmMonitor";
import { loadWebChugins } from "@/utils/webChugins";
import Console from "@/components/outputPanel/console";
import Visualizer from "@/components/outputPanel/visualizer";
import HidPanel from "@/components/inputPanel/hidPanel";
import SensorPanel from "@/components/inputPanel/sensorPanel";
import ChuckBar from "@/components/chuckBar/chuckBar";
import ProjectSystem from "@/components/fileExplorer/projectSystem";
import Recorder from "@/components/chuckBar/recorder";
import NavBar from "./components/navbar/navbar";

// WebChucK source
const DEV_CHUCK_SRC = "https://chuck.stanford.edu/webchuck/dev/"; // dev webchuck src
const PROD_CHUCK_SRC = "https://chuck.stanford.edu/webchuck/src/"; // prod webchuck src
const BACKUP_CHUCK_SRC = "./wc/"; // backup webchuck src
let whereIsChuck: string =
    localStorage.getItem("chuckVersion") === "dev"
        ? DEV_CHUCK_SRC
        : PROD_CHUCK_SRC;

let theChuck: Chuck;
let chuckVersion: string = "1.5.X.X";
let audioContext: AudioContext;
let sampleRate: number = 0;

// Audio Devices
let currentMicStream: MediaStream | null = null;
let currentAdcNode: MediaStreamAudioSourceNode | null = null;
let selectedInputDeviceId: string =
    localStorage.getItem("audioInputDevice") || "default";
let selectedOutputDeviceId: string =
    localStorage.getItem("audioOutputDevice") || "default";

// Audio Visualizer
let analyser: AnalyserNode;
let visual: Visualizer;

// Recorder
let recordGain: GainNode;

export { theChuck, chuckVersion, audioContext, sampleRate, visual };

// Chuck Time
let chuckNowCached: number = 0;

export async function selectChuckSrc(production: boolean) {
    // TODO: this doesn't really do much now
    whereIsChuck = production ? PROD_CHUCK_SRC : DEV_CHUCK_SRC;
}

/**
 * Initialize theChuck and audio context on page load
 * Audio Context will be suspended until the user presses "Start WebChucK"
 */
export async function initChuck() {
    audioContext = new AudioContext();
    audioContext.suspend();
    sampleRate = audioContext.sampleRate;
    calculateDisplayDigits(sampleRate);

    // TODO: Hack for WebChugins 7/16/2024
    const chugins: string[] = loadWebChugins();
    chugins.forEach((chuginPath) => Chuck.loadChugin(chuginPath));

    // Create theChuck
    let targetSrc = whereIsChuck;

    // 1. Skip if explicitly offline
    if (!navigator.onLine) {
        targetSrc = BACKUP_CHUCK_SRC;
    } else {
        // 2. Quick pre-flight check to see if Stanford is up
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second ping timeout

        try {
            // Check headers of an essential file to test uptime
            await fetch(whereIsChuck + "webchuck.js", {
                method: "HEAD",
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (e) {
            console.warn(
                "Stanford CCRMA server unreachable or slow, using backup src."
            );
            targetSrc = BACKUP_CHUCK_SRC;
        }
    }

    try {
        if (targetSrc === BACKUP_CHUCK_SRC) {
            Chuck.chuginsToLoad = [];
        }
        theChuck = await Chuck.init(
            [],
            audioContext,
            audioContext.destination.maxChannelCount,
            targetSrc
        );
    } catch (error) {
        console.error("Failed to initialize WebChucK", error);
        // Additional backup
        if (targetSrc !== BACKUP_CHUCK_SRC) {
            console.error("Falling to backup WebChucK WASM + JS");
            Chuck.chuginsToLoad = [];
            theChuck = await Chuck.init(
                [],
                audioContext,
                audioContext.destination.maxChannelCount,
                BACKUP_CHUCK_SRC
            );
        }
    }
    theChuck.connect(audioContext.destination);

    // Apply saved audio output device if supported
    if (selectedOutputDeviceId && selectedOutputDeviceId !== "default") {
        setAudioOutputDevice(selectedOutputDeviceId);
    }

    Console.print("WebChucK is ready!");

    onChuckReady();
}

/**
 * Called when theChuck is ready
 */
export async function onChuckReady() {
    ChuckBar.webchuckButton.disabled = false;
    ChuckBar.webchuckButton.innerText = "Start WebChucK";
    ProjectSystem.uploadFilesButton.disabled = false;
    ProjectSystem.uploadFilesIcon.disabled = false;
    ProjectSystem.initDragUpload();
    ProjectSystem.syncFilesToChuck();
    theChuck.getParamString("VERSION").then((value: string) => {
        chuckVersion = value;
    });
    NavBar.aboutButton.disabled = false;
}

/**
 * Start theChuck (when user presses "Start WebChucK")
 * Audio context will resume
 * Build theChuck connections for VM time, HID, and visualizer
 */
export async function startChuck() {
    audioContext.resume();

    // Hook up theChuck to the console
    theChuck.chuckPrint = Console.print;
    theChuck.setParamInt("TTY_COLOR", 1);
    theChuck.setParamInt("TTY_WIDTH_HINT", Console.getWidth());
    Console.print("starting virtual machine...");

    // Print audio info
    theChuck.getParamInt("SAMPLE_RATE").then((value: number) => {
        Console.print("sample rate: " + value);
    });
    theChuck.getParamString("VERSION").then((value: string) => {
        chuckVersion = value;
        Console.print("chuck version: " + value);
    });
    Console.print(
        "number of channels: " + audioContext.destination.maxChannelCount
    );

    setInterval(updateChuckNow, 50);

    // Start audio visualizer
    startVisualizer();

    // Configure Recorder
    recordGain = audioContext.createGain();
    recordGain.gain.value = 0.98; // Prevents weird clipping artifacts
    theChuck.connect(recordGain);
    Recorder.configureRecorder(audioContext, recordGain);

    // Enable WebChucK Packages
    // HID, mouse and keyboard on
    new HidPanel(await HID.init(theChuck));
    new SensorPanel(
        await Gyro.init(theChuck, false),
        await Accel.init(theChuck, false)
    );

    // TODO: for debugging, make theChuck global
    (window as any).theChuck = theChuck;

    // TODO: EZScore HACKS @terryfeng @alexhan
    try {
        await theChuck
            .loadFile(
                "https://raw.githubusercontent.com/tae1han/ChucKTonal/main/src/ezchord.ck"
            )
            .then(() => {
                theChuck.runFile("ezchord.ck");
            });
        await theChuck
            .loadFile(
                "https://raw.githubusercontent.com/tae1han/ChucKTonal/main/src/ezscore.ck"
            )
            .then(() => {
                theChuck.runFile("ezscore.ck");
            });
        await theChuck
            .loadFile(
                "https://raw.githubusercontent.com/tae1han/ChucKTonal/main/src/ezscale.ck"
            )
            .then(() => {
                theChuck.runFile("ezscale.ck");
            });
        await theChuck
            .loadFile(
                "https://raw.githubusercontent.com/tae1han/ChucKTonal/main/src/scoreplayer.ck"
            )
            .then(() => {
                theChuck.runFile("scoreplayer.ck");
            });
    } catch (error) {
        console.error("Failed to load EZScore", error);
    }
}

/**
 * Get the current time from theChuck
 * Cache the value to TS
 */
function updateChuckNow() {
    theChuck.now().then((samples: number) => {
        chuckNowCached = samples;
        // Update time in visualizer
        ChuckNow.updateChuckNow(samples);
    });
}

/**
 * Return the current saved time in samples
 */
export function getChuckNow(): number {
    return chuckNowCached;
}

/**
 * Set the audio output device sink ID
 */
export async function setAudioOutputDevice(deviceId: string): Promise<boolean> {
    selectedOutputDeviceId = deviceId;
    if (!audioContext) return false;
    if ("setSinkId" in AudioContext.prototype) {
        try {
            await (audioContext as any).setSinkId(
                deviceId === "default" ? "" : deviceId
            );
            return true;
        } catch (err) {
            console.error("Failed to set audio sink ID:", err);
            return false;
        }
    } else {
        console.warn(
            "AudioContext.setSinkId is not supported in this browser."
        );
        return false;
    }
}

/**
 * Set the preferred audio input device and switch live if mic is already active
 */
export async function setAudioInputDevice(deviceId: string): Promise<void> {
    if (deviceId === selectedInputDeviceId) {
        return;
    }
    selectedInputDeviceId = deviceId;
    // If microphone is currently active, switch to the newly selected device live
    if (isMicConnected()) {
        await connectMic(deviceId);
    }
}

/**
 * Connect or switch microphone input to theChuck
 */
export async function connectMic(deviceId?: string): Promise<boolean> {
    if (deviceId !== undefined) {
        selectedInputDeviceId = deviceId;
    }
    if (!audioContext || !theChuck) {
        return false;
    }

    // Disconnect previous mic if any
    disconnectMic();

    const baseConstraints: MediaTrackConstraints = {
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false
    };

    const audioConstraints: MediaTrackConstraints = {
        ...baseConstraints,
        ...(selectedInputDeviceId && selectedInputDeviceId !== "default"
            ? { deviceId: { exact: selectedInputDeviceId } }
            : {})
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: audioConstraints
        });
        currentMicStream = stream;
        currentAdcNode = audioContext.createMediaStreamSource(stream);
        currentAdcNode.connect(theChuck);
        return true;
    } catch (err: any) {
        // Fallback to default microphone if the saved device was unplugged
        if (
            err?.name === "OverconstrainedError" ||
            err?.name === "NotFoundError"
        ) {
            console.warn(
                "Saved microphone not found, falling back to default input."
            );
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: false,
                    audio: baseConstraints
                });
                currentMicStream = stream;
                currentAdcNode = audioContext.createMediaStreamSource(stream);
                currentAdcNode.connect(theChuck);
                return true;
            } catch (fallbackErr) {
                console.error(
                    "Failed to connect fallback microphone:",
                    fallbackErr
                );
            }
        } else {
            console.error("Failed to connect microphone:", err);
        }
        return false;
    }
}

/**
 * Disconnect and stop the microphone stream
 */
export function disconnectMic(): void {
    if (currentAdcNode) {
        currentAdcNode.disconnect();
        currentAdcNode = null;
    }
    if (currentMicStream) {
        currentMicStream.getTracks().forEach((track) => track.stop());
        currentMicStream = null;
    }
}

/**
 * Check if microphone stream is currently active
 */
export function isMicConnected(): boolean {
    return currentMicStream !== null;
}

/**
 * Start the audio visualizer for time/frequency domain
 */
function startVisualizer() {
    const cnv: HTMLCanvasElement = document.getElementById(
        "visualizer"
    )! as HTMLCanvasElement;

    analyser = audioContext.createAnalyser();
    // instantiate visualizer
    visual = new Visualizer(cnv, analyser);
    // connect chuck output to analyser
    theChuck.connect(analyser);
    // start visualizer
    visual.drawVisualization_();
    visual.start();
}
