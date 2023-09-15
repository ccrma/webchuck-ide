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

import { Chuck } from "webchuck";
import Console from "@components/console";

let theChuck: Chuck;
let audioContext: AudioContext;

// Chuck Time 
// let sampleRate: number = 0;
// let chuckNowCached: number = 0;
// let displayDigits: number = 0;

export async function startChuck() {
    audioContext = new AudioContext();
    // sampleRate = audioContext.sampleRate;

    // Create theChuck
    Console.print("Starting WebChucK...")
    const ChucK = (await import("webchuck")).Chuck;
    theChuck = await ChucK.init([], audioContext);
    theChuck.connect(audioContext.destination);

    // Hook up theChuck to the console
    theChuck.chuckPrint = Console.print;
    theChuck.setParamInt("TTY_COLOR", 1);
    theChuck.setParamInt("TTY_WIDTH_HINT", Console.getWidth());

     // Print audio info
     theChuck.getParamInt("SAMPLE_RATE")
     .then( (value) => { Console.print("sample rate: " + value); } );
     theChuck.getParamString("VERSION")
     .then( (value) => { Console.print("system version: " + value); } )
     .finally( () => Console.print("WebChucK is ready!") );

     // TODO: temporary
     (window as any).theChuck = theChuck;
}

export { theChuck, audioContext };
