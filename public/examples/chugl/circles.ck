//--------------------------------------------------------------------
// name: circles.ck
// desc: animated colorful circles with custom GGen
//
// author: Ge Wang
//   date: Fall 2024
//--------------------------------------------------------------------

GG.camera().posZ( 3 );

512 => int NUM_CIRCLES;
128 => int N;
1 => float RADIUS;

class Circle extends GGen
{
    GLines circle --> this;
    Math.random2f(2,3) => float rate;
    color( @(.5, 1, .5) );
    circle.width(.01);

    fun void init( int resolution, float radius )
    {
        2*pi / (resolution-2) => float theta;
        vec2 pos[resolution];
        @(radius) => vec2 prev;
        for( int i; i < pos.size(); i++ )
        {
            Math.cos(theta)*prev.x - Math.sin(theta)*prev.y => pos[i].x;
            Math.sin(theta)*prev.x + Math.cos(theta)*prev.y => pos[i].y;
            pos[i] => prev;
        }
        circle.positions( pos );
    }

    fun void color( vec3 c ) { circle.color( c ); }

    fun void update( float dt )
    {
        .35 + .25*Math.sin(now/second*rate) => float s;
        circle.sca( s );
    }
}

Circle circles[NUM_CIRCLES];
for( auto circ : circles )
{
    circ.init( N, RADIUS );
    circ --> GG.scene();
    @( Math.random2f(-1.5,1.5),
       Math.random2f(-1,1),
       Math.random2f(-1,1) ) => circ.pos;
}

while( true )
{
    GG.nextFrame() => now;
    for( auto circ : circles )
    {
        @( (1+Math.sin(now/second*.7))/2,
           (1+Math.sin(now/second*.8))/2,
           (1+Math.sin(now/second*.9))/2 ) => circ.color;
    }
}
