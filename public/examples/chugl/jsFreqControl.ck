//-----------------------------------------------------------------------------
// name: jsFreqControl.ck
// desc: Sine wave with visual feedback, controlled by JavaScript
//       Pair with jsFreqControl.js which sweeps the frequency
//
//   JS: ck.setFloat("freq", value) to change frequency
//-----------------------------------------------------------------------------

// Global float that JavaScript will modify
global float freq;
440 => freq;

// Audio: sine oscillator
SinOsc osc => dac;
0.3 => osc.gain;

// Visual: sphere whose size responds to frequency
GSphere sphere --> GG.scene();
GG.camera().posZ( 5 );

while( true )
{
    GG.nextFrame() => now;

    // Apply frequency from JS
    freq => osc.freq;

    // Map frequency (200-880) to sphere scale
    .5 + (freq - 200.0) / 800.0 => float s;
    @(s, s, s) => sphere.sca;

    // Rotate for visual interest
    GG.dt() => sphere.rotateY;
}
