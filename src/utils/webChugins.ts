//------------------------------------------------------------------------------
// title: Web Chugins
// desc: Hacky way to load webchugins stored online
// date: July 2024
// author: terry feng 
//------------------------------------------------------------------------------

const WEBCHUGIN_URL = "https://ccrma.stanford.edu/~tzfeng/static/webchugins/"

const chugins = [
    "ABSaturator.chug.wasm", 
    "AmbPan.chug.wasm", 
    "Binaural.chug.wasm", 
    "Bitcrusher.chug.wasm", 
    "Elliptic.chug.wasm", 
    "ExpDelay.chug.wasm", 
    "ExpEnv.chug.wasm", 
    "FIR.chug.wasm", 
    "FoldbackSaturator.chug.wasm", 
    "GVerb.chug.wasm", 
    "KasFilter.chug.wasm", 
    "Ladspa.chug.wasm", 
    "Line.chug.wasm", 
    "MagicSine.chug.wasm", 
    "Mesh2D.chug.wasm", 
    "Multicomb.chug.wasm", 
    "NHHall.chug.wasm", 
    "Overdrive.chug.wasm", 
    "PanN.chug.wasm", 
    "Patch.chug.wasm", 
    "Perlin.chug.wasm", 
    "PitchTrack.chug.wasm", 
    "PowerADSR.chug.wasm", 
    "Random.chug.wasm", 
    "Range.chug.wasm", 
    "RegEx.chug.wasm", 
    "Sigmund.chug.wasm", 
    "Spectacle.chug.wasm", 
    "WPDiodeLadder.chug.wasm", 
    "WPKorg35.chug.wasm", 
    "Wavetable.chug.wasm", 
    "WinFuncEnv.chug.wasm", 
    "XML.chug.wasm"
]

/**
 * Create paths to webchugins for loading into WebChucK
 * TODO: implement some kind of caching
 * @returns {string[]} array of chugin paths 
 */
export function loadWebChugins(): string[] {
    return chugins.map((chuginName) => {
        return WEBCHUGIN_URL + chuginName;
    })
}