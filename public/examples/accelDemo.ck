//------------------------------------------------------------------------------
// name: accelDemo.ck
// desc: Accel-erometer WebChucK Demo (mobile only)
//       Use mobile accelerometer to control sound synthesis
//       NOTE: enable accelerometer in sensor settings
// 
//       Accel WebChucK Docs:
//       https://chuck.stanford.edu/webchuck/docs/classes/Accel.html
//
// author: Mike Mulshine 
//------------------------------------------------------------------------------

Accel ac;
AccelMsg msg;

0 => int device;

// open accel 
if( !ac.openAccel( device ) ) me.exit();
<<< "accel '" + ac.name() + "' ready", "" >>>;

<<< "only on mobile" >>>;

SinOsc osc => Envelope gain => dac;
Noise noise => LPF filter => gain;

100 => float rootOscFreq;
rootOscFreq => osc.freq;

500 => float rootFilterFreq;
rootFilterFreq => filter.freq;

0.5 => filter.gain;

10::ms => gain.duration;
1.0 => gain.target;

// infinite event loop
while( true )
{
    // wait on accel event
    ac => now;

    // get one or more messages
    while( ac.recv( msg ) )
    {
        // print accel values
        <<< msg.getAccelX() + " " + msg.getAccelY() + " " + msg.getAccelZ() >>>;
        // compute average acceleration
        (Math.fabs(msg.getAccelX()) + 
         Math.fabs(msg.getAccelY()) + 
         Math.fabs(msg.getAccelZ())) * 0.3333 => float avgAccel; 
        
        // control synthesis/filter freq
        avgAccel * 10.0 => float dFreq;
        rootOscFreq + dFreq => osc.freq; 
        rootFilterFreq + dFreq * 2.0 => filter.freq;
        // control gain
        avgAccel / 150.0 => float newGain;
        newGain => gain.target;
    }
       
    10::ms => now;
}
