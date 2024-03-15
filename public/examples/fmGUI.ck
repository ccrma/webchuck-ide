//-----------------------------------------------------------------------------
// name: GUI-Controlled FM Synthesis
// desc: Play with FM synthesis through global variables in ChucK
//       Global "Event" variables can be broadcast via GUI buttons
//
//       1. Open the GUI Panel below the editor and hit "Generate GUI"
//       2. Run this code
//       3. Broadcast the "START" event and adjust parameters
// 
//       Open the visualizer to see FM synthesis
//
//       Adapted from fm.ck
//       https://chuck.stanford.edu/doc/examples/basic/fm.ck
//
//       Learn about pulse width oscillator modulation:
//       https://ccrma.stanford.edu/~jos/sasp/Frequency_Modulation_FM_Synthesis.html
//
// author: terry feng
//-----------------------------------------------------------------------------

// GUI Button
global Event START;

<<< "Code is running, waiting for START event" >>>;

// Wait for START event to continue execution
START => now;

// FM Synthesis
// carrier
SinOsc c => dac;
// modulator
SinOsc m => blackhole;

// carrier frequency
220 => float cf;
// modulator frequency
550 => float mf => m.freq;
// index of modulation
200 => float index;

// GUI float sliders; 0-1
global float CF;
global float MF;
global float INDEX;

// Receive GUI updates to update UGen parameters
// FM Control
fun void control() {
    while (true) {
        CF * 220 + 110 => cf;
        MF * 5050 + 110 => m.freq;
        INDEX * 400 + 100 => index;
        1::samp => now;
    }
}
spork ~ control(); // run async

// FM Audio
while( true )
{
    // modulate
    cf + (index * m.last()) => c.freq;
    // advance time by 1 samp
    1::samp => now;
}
