// Use SndBuf / SndBuf2 (stereo) for playing wav files
// Play and loop 'were slammin' by takeo
SndBuf2 buf => dac;
buf.read("./were_slammin.wav"); // Read in our wav file
1 => buf.loop; // Set our track to loop

<<< "Looping this slammin beat for 1 week" >>>;
1::week => now;