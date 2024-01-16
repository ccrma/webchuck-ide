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

import { Chuck, HID } from "webchuck";
import {
    calculateDisplayDigits,
    displayFormatSamples,
    displayFormatTime,
} from "@utils/time";
import { ChuckNow } from "@/components/vmMonitor";
import Console from "@/components/console";
import Visualizer from "@/components/visualizer";
import HidPanel from "@/components/hidPanel";
import ChuckBar from "@/components/chuckBar";
import ProjectSystem from "@/components/ProjectSystem";

let theChuck: Chuck;
let audioContext: AudioContext;

// Audio Visualizer
let analyser: AnalyserNode;
let visual: Visualizer;

// HID
let hid: HID;

export { theChuck, audioContext, visual, hid };

// Chuck Time
let sampleRate: number = 0;
let chuckNowCached: number = 0;

export { sampleRate, chuckNowCached };

export async function initChuck() {
    audioContext = new AudioContext();
    sampleRate = audioContext.sampleRate;
    calculateDisplayDigits(sampleRate);

    // Create theChuck
    theChuck = await Chuck.init([], audioContext);
    theChuck.connect(audioContext.destination);
    Console.print("WebChucK is ready!");

    audioContext.suspend();
    onChuckReady();
}

export async function onChuckReady() {
    ChuckBar.webchuckButton.disabled = false;
    ChuckBar.webchuckButton.innerText = "Start WebChucK";
    ProjectSystem.uploadFilesButton.disabled = false;
}

export async function startChuck() {
    audioContext.resume();

    // Hook up theChuck to the console
    theChuck.chuckPrint = Console.print;
    theChuck.setParamInt("TTY_COLOR", 1);
    theChuck.setParamInt("TTY_WIDTH_HINT", Console.getWidth());

    // Print audio info
    theChuck.getParamInt("SAMPLE_RATE").then((value: number) => {
        Console.print("sample rate: " + value);
    });
    theChuck.getParamString("VERSION").then((value: string) => {
        Console.print("system version: " + value);
    });
    // .finally(() => Console.print("WebChucK is running!"));

    setInterval(chuckGetNow, 50);

    // Start audio visualizer
    startVisualizer();

    // Start HID, mouse and keyboard on
    hid = await HID.init(theChuck);
    new HidPanel(hid);

    // TODO: for debugging, make theChuck global
    (window as any).theChuck = theChuck;
}

/**
 * Get the current time from theChuck
 * Cache the value to TS
 */
function chuckGetNow() {
    theChuck.now().then((samples: number) => {
        chuckNowCached = samples;

        // Update time in visualizer
        // samples
        const samplesDisplay = samples % sampleRate;
        // seconds
        const secondsTotal = samples / sampleRate;
        const secondsDisplay = Math.floor(secondsTotal % 60);
        // minutes
        const minutesTotal = secondsTotal / 60;
        const minutesDisplay = Math.floor(minutesTotal % 60);
        // hours
        const hoursTotal = minutesTotal / 60;
        const hoursDisplay = Math.floor(hoursTotal);

        // the display value
        const timeStr =
            displayFormatTime(hoursDisplay) +
            ":" +
            displayFormatTime(minutesDisplay) +
            ":" +
            displayFormatTime(secondsDisplay) +
            "." +
            displayFormatSamples(samplesDisplay);

        ChuckNow.updateChuckNow(timeStr);
    });
}

/**
 * Connect microphone input to theChuck
 */
export async function connectMic() {
    // Get microphone with no constraints
    navigator.mediaDevices
        .getUserMedia({
            video: false,
            audio: {
                echoCancellation: false,
                autoGainControl: false,
                noiseSuppression: false,
            },
        })
        .then((stream) => {
            const adc = audioContext.createMediaStreamSource(stream);
            adc.connect(theChuck);
        });
}

/**
 * Start the audio visualizer for time/frequency domain
 *
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
