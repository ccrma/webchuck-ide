//--------------------------------------------------------
// title: Host (Web Audio)
// desc:  Audio Host for WebChucK IDE, managing everything
//        related to Web Audio API
//
//        Creates the AudioContext and WebChucK Web Audio
//        Node instance (Chuck) — or initializes WebChuGL
//        when in ChuGL engine mode.
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
import { getEngineMode, type EngineMode } from "@/components/settings";
import {
    type ChucKAdapter,
    WebChucKAdapter,
    WebChuGLAdapter
} from "@/adapter";

// WebChucK source
const DEV_CHUCK_SRC = "https://chuck.stanford.edu/webchuck/dev/"; // dev webchuck src
const PROD_CHUCK_SRC = "https://chuck.stanford.edu/webchuck/src/"; // prod webchuck src
const BACKUP_CHUCK_SRC = "./wc/"; // backup webchuck src
let whereIsChuck: string =
    localStorage.getItem("chuckVersion") === "dev"
        ? DEV_CHUCK_SRC
        : PROD_CHUCK_SRC;

// Engine mode
export const engineMode: EngineMode = getEngineMode();

// The unified ChucK adapter (set during init)
let theChuck: ChucKAdapter;
let chuckVersion: string = "1.5.X.X";
let audioContext: AudioContext;
let sampleRate: number = 0;

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
 * Initialize theChuck — dispatches to WebChucK or WebChuGL
 * based on the engine mode setting.
 */
export async function initChuck() {
    if (engineMode === "webchugl") {
        Console.print("[WebChuGL IDE console]");
        await initWebChuGL();
    } else {
        Console.print("[WebChucK IDE console]");
        await initWebChuCK();
    }
}

/**
 * Initialize WebChucK (audio-only mode)
 * Audio Context will be suspended until the user presses "Start WebChucK"
 */
async function initWebChuCK() {
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

    let rawChuck: Chuck;
    try {
        if (targetSrc === BACKUP_CHUCK_SRC) {
            Chuck.chuginsToLoad = [];
        }
        rawChuck = await Chuck.init(
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
            rawChuck = await Chuck.init(
                [],
                audioContext,
                audioContext.destination.maxChannelCount,
                BACKUP_CHUCK_SRC
            );
        } else {
            throw error;
        }
    }

    theChuck = new WebChucKAdapter(rawChuck);
    theChuck.connect(audioContext.destination);
    Console.print("WebChucK is ready!");

    onChuckReady();
}

/**
 * Initialize WebChuGL (audio + graphics mode)
 * Loaded dynamically from the jsDelivr CDN so we always get the latest build.
 */
async function initWebChuGL() {
    // TS can't resolve an https:// URL import, but Vite and the browser
    // handle it natively (see /* @vite-ignore */ below).
    const { default: ChuGL } = await import(
        // @ts-expect-error — URL module import is runtime-resolved
        /* @vite-ignore */ "https://cdn.jsdelivr.net/npm/webchugl/+esm"
    );

    const canvas =
        document.querySelector<HTMLCanvasElement>("#chuglCanvas")!;

    // Collect chugin URLs for ChuGL config
    const chugins: string[] = loadWebChugins();

    const ck = await ChuGL.init({
        canvas,
        chugins,
        serviceWorker: false // COOP/COEP headers provided by server
    });

    if (!ck) {
        Console.print(
            "\x1b[31mWebChuGL failed to initialize. Check browser WebGPU support.\x1b[0m"
        );
        console.error("[WebChuGL] Init returned null");
        return;
    }

    theChuck = new WebChuGLAdapter(ck);
    audioContext = theChuck.audioContext;
    sampleRate = audioContext.sampleRate;
    calculateDisplayDigits(sampleRate);

    Console.print("WebChuGL is ready!");

    onChuckReady();
}

/**
 * Called when theChuck is ready
 */
export async function onChuckReady() {
    ChuckBar.webchuckButton.disabled = false;
    ChuckBar.webchuckButton.innerText =
        engineMode === "webchugl" ? "Start WebChuGL" : "Start WebChucK";
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

    // HID/Sensors — only for WebChucK mode (WebChuGL has built-in support)
    if (engineMode === "webchuck") {
        new HidPanel(await HID.init(theChuck.rawRuntime));
        new SensorPanel(
            await Gyro.init(theChuck.rawRuntime, false),
            await Accel.init(theChuck.rawRuntime, false)
        );
    }

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
 * Connect microphone input to theChuck
 * In WebChuGL mode, mic is managed internally — this is a no-op.
 */
export async function connectMic() {
    if (engineMode === "webchugl") {
        Console.print("Microphone is managed internally by WebChuGL");
        return;
    }

    // Get microphone with no constraints
    navigator.mediaDevices
        .getUserMedia({
            video: false,
            audio: {
                echoCancellation: false,
                autoGainControl: false,
                noiseSuppression: false
            }
        })
        .then((stream) => {
            const adc = audioContext.createMediaStreamSource(stream);
            adc.connect(theChuck as any);
        });
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
