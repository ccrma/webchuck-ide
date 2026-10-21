// jsFreqControl.js
// Sweep the sine frequency from JavaScript using ck.setFloat()

let freq = 220;
let step = 5;

setInterval(async () => {
    freq += step;
    if (freq >= 880 || freq <= 220) step = -step;
    await ck.setFloat("freq", freq);
}, 30);

console.log("Frequency sweep active (220 - 880 Hz)");
