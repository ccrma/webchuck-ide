import { Chuck } from "webchuck";

let theChuck: Chuck;
let audioContext: AudioContext;

export async function startChuck() {
    audioContext = new AudioContext();

    const ChucK = (await import("webchuck")).Chuck;
    theChuck = await ChucK.init([], audioContext);
    theChuck.connect(audioContext.destination)
}

export { theChuck, audioContext }