//-----------------------------------------------------------------------------
// name: solarSystem.ck
// desc: solar system — nested scene graph transforms
//
// author: Andrew Zhu Aday, Ge Wang
//   date: Fall 2023
//-----------------------------------------------------------------------------

GGen sunSystem, earthSystem, moonSystem;
GSphere sun, earth, moon;

for( auto x : [ sun, earth, moon ] )
    x.mat().wireframe(true);

GG.scene().ambient(@(.5,.5,.5));

sun.color( Color.YELLOW );
earth.color( (Color.SKYBLUE + Color.BLUE) / 2 );
moon.color( Color.GRAY );

earthSystem.pos(@(2.2, 0.0, 0.0));
moonSystem.pos(@(.55, 0.0, 0.0));

sun.sca(@(2.0, 2.0, 2.0));
earth.sca(@(0.4, 0.4, 0.4));
moon.sca(@(0.12, 0.12, 0.12));

moonSystem --> earthSystem --> sunSystem --> GG.scene();
sun --> sunSystem;
earth --> earthSystem;
moon --> moonSystem;

GG.camera().pos( @(0, 5, 7) );
GG.camera().lookAt( @(0, 0, 0) );

while (true)
{
    GG.nextFrame() => now;
    sunSystem.rotateY(.5 * GG.dt());
    earthSystem.rotateY(.7 * GG.dt());
    sun.rotateY(-1 * GG.dt());
    earth.rotateY(.4 * GG.dt());
    moon.rotateY(.9 * GG.dt());
}
