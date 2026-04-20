// jsSceneBuilder.js
// Build an entire ChuGL scene from JavaScript using ck.runCode()

// Camera + render loop (runs as a background shred)
await ck.runCode([
    "GG.camera().posZ( 10 );",
    "while( true ) { GG.nextFrame() => now; }",
].join("\n"));

// Create a ring of shapes
const N = 10;
for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2;
    const x = Math.cos(angle) * 3;
    const y = Math.sin(angle) * 3;
    const shape = i % 2 === 0 ? "GCube" : "GSphere";

    await ck.runCode(
        shape + " s --> GG.scene();\n" +
        x.toFixed(2) + " => s.posX;\n" +
        y.toFixed(2) + " => s.posY;\n" +
        "Color.random() => (s.mat() $ PhongMaterial).color;"
    );

    console.log("Added " + shape + " #" + (i + 1));
}

console.log("Scene complete: " + N + " shapes in a ring!");
