//-----------------------------------------------------------------------------
// name: Mouse Oscillator
// desc: Use your mouse to control a pulse wave oscillator
//       x-pos: frequency
//       y-pos: pulse wave width
//       click to mute
//
//       Adapted from mouse.ck by Ge Wang
//       https://chuck.stanford.edu/doc/examples/hid/mouse.ck
//
// author: Terry Feng
//-----------------------------------------------------------------------------

// HID input and a HID message
Hid hi;
HidMsg msg;

// WebChuck mouse is device 0
0 => int device;
// open mouse 0, exit on fail
if( !hi.openMouse( device ) ) me.exit();
<<< "mouse '" + hi.name() + "' ready", "" >>>;

// Pulse Wave Oscillator
// Initialize with frequency of 220Hz
PulseOsc foo(220) => dac;
0.3 => foo.gain;

// infinite event loop
while( true )
{
    // wait on HidIn as event
    hi => now;

    // messages received
    while( hi.recv( msg ) )
    {
        // mouse motion
        if( msg.isMouseMotion() )
        {
            // get the scaled X-Y screen cursor position
            <<< "mouse scaled position:",
               "x:", msg.scaledCursorX, "y:", msg.scaledCursorY >>>;
               
            // x => oscillator frequency
            220 + msg.scaledCursorX * 220 => foo.freq;
            // y => oscillator width
            msg.scaledCursorY => foo.width;
        }
        
        // mouse button down
        else if( msg.isButtonDown() )
        {
            <<< "mouse button", msg.which, "down" >>>;
            
            // Mute oscillator
            if (msg.which == 1) {
                foo.gain(0);
            }
        }
        
        // mouse button up
        else if( msg.isButtonUp() )
        {
            <<< "mouse button", msg.which, "up" >>>;
            
            // Unmute oscillator
            if (msg.which == 1) {
                foo.gain(0.3);
            }
        }
        
        // mouse wheel motion (unused)
        else if( msg.isWheelMotion() )
        {
            if( msg.deltaX )
            {
                <<< "mouse wheel:", msg.deltaX, "on x-axis" >>>;
            }
            
            if( msg.deltaY )
            {
                <<< "mouse wheel:", msg.deltaY, "on y-axis" >>>;
            }
            
            // What do you want to do with this parameter?
        }
    }
}