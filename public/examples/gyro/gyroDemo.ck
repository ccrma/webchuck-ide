//------------------------------------------------------------------------------
// name: gyroDemo.ck
// desc: Gyro-scope WebChucK Demo (mobile only)
//       Use mobile gyroscope to control audio playback 
//       NOTE: enable gyroscope in sensor settings
// 
//       Gyro WebChucK Docs:
//       https://chuck.stanford.edu/webchuck/docs/classes/Gyro.html
//
// author: Mike Mulshine 
//------------------------------------------------------------------------------

Gyro gy;
GyroMsg msg;

0 => int device;

// open gyro 
if( !gy.openGyro( device ) ) me.exit();
<<< "gyro '" + gy.name() + "' ready", "" >>>;

<<< "only on mobile" >>>;

SndBuf buf => Envelope gain => dac;
buf.read("gyroloop.wav");
0 => buf.pos;
1 => buf.loop;

10::ms => gain.duration;
1.0 => gain.target;

function float clamp(float val, float min, float max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}

// infinite event loop
while( true )
{
    // wait on gyro event
    gy => now;

    // get one or more messages
    while( gy.recv( msg ) )
    {
        // print gyro values
        <<< msg.getGyroX() + " " + msg.getGyroY() + " " + msg.getGyroZ() >>>;

        // normalize Y/Z gyro values to 0.0 to 1.0
        Math.fabs(clamp(msg.getGyroY(), -90, 90)) / 90.0 => float gY;
        (clamp(msg.getGyroZ(), -90, 90) + 90.0) / 180.0 => float gZ; 

        // control playback rate and envelope
        gY => gain.target;
        gZ * 2.0 => buf.rate;
    }
       
    10::ms => now;
}
