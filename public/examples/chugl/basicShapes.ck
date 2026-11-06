//-----------------------------------------------------------------------------
// name: basicShapes.ck
// desc: drawing 3D primitives with basic GGens
//
// author: Andrew Zhu Aday, Ge Wang
//   date: Fall 2024
//-----------------------------------------------------------------------------

// empty group to hold all our primitives
GGen group --> GG.scene();

// 3D primitives
GCube cube --> group;
GSphere sphere --> group;
GTorus torus --> group; torus.sca(.7);
GCylinder cylinder --> group;
GKnot knot --> group; knot.sca(.5);
GSuzanne suzanne --> group; suzanne.sca(.5);

// 2D primitives
GPlane plane --> group;
GCircle circle --> group;

// put into an array
[ cube, sphere, circle, plane, torus, cylinder, knot, suzanne ] @=> GMesh ggens[];

0 => int pos;
for( GMesh obj : ggens )
{
    -ggens.size() + 2 * pos++ => obj.posX;
    Color.random() => (obj.mat() $ PhongMaterial).color;
}

GG.camera().posZ( 10 );

while( true )
{
    GG.nextFrame() => now;
    // animate the cube with a sine wave
    2 => cube.posY;
    Math.sin(now/second) => cube.posX;
}
