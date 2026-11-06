//-----------------------------------------------------------------------------
// name: lissajous.ck
// desc: Lissajous audio-visual oscilloscope
//
// author: Andrew Zhu Aday
//   date: Fall 2024
//-----------------------------------------------------------------------------

GG.bloom( true );
GG.bloomPass().intensity(1.0);
GG.camera().orthographic();
GG.camera().viewSize(4);

1024 => int WINDOW_SIZE;
dac.chan(0) => Flip accum_r => blackhole;
dac.chan(1) => Flip accum_l => blackhole;
WINDOW_SIZE => accum_l.size;
WINDOW_SIZE => accum_r.size;
float left_waveform[WINDOW_SIZE];
float right_waveform[WINDOW_SIZE];

fun void audio()
{
    while (true) {
        WINDOW_SIZE::samp => now;
        accum_l.upchuck(); accum_l.output(left_waveform);
        accum_r.upchuck(); accum_r.output(right_waveform);
    }
} spork ~ audio();

SinOsc left_osc => dac.chan(0);
SinOsc right_osc => dac.chan(1);
261 => left_osc.freq; 326 => right_osc.freq;
.1 => left_osc.gain => right_osc.gain;

GLines lissajous --> GG.scene();
lissajous.width(.05);
lissajous.color(@(1./32., 1.0, 1./32.));
vec2 positions[WINDOW_SIZE];

while (true)
{
    GG.nextFrame() => now;
    for (int i; i < WINDOW_SIZE; i++) {
        10 * @(left_waveform[i], right_waveform[i]) => positions[i];
        lissajous.positions(positions);
    }
}
