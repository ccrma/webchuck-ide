/**
 * The GUI Panel (below the editor) allows user control for global variables 
 * via sliders and buttons. GUI float sliders go from [0.0,1.0]
 */

/* Play a sine wave and control the frequency with the GUI */
/*
    1. Open the GUI Panel below and hit "Generate GUI".
    2. Run the code.
    3. Play with the slider f to change the frequency.
*/

SinOsc osc => dac;
0 => global float f; // global variables create a GUI slider

while(samp => now){
    // update frequency
    (f * 440)+220 => osc.freq;
}
