//--------------------------------------------------------
// title: Host (Audio)
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

let theChuck: Chuck;
let audioContext: AudioContext;

export async function startChuck() {
    audioContext = new AudioContext();

    const ChucK = (await import("webchuck")).Chuck;
    theChuck = await ChucK.init([], audioContext);
    theChuck.connect(audioContext.destination);
}

export { theChuck, audioContext };
