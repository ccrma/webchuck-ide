//-------------------------------------------------
// title: ChucK Preprocess
// desc:  Preprocess ChucK code string for specific globals
//        and keywords
//
// author: terry feng
// date:   January 2024
//-------------------------------------------------

export interface ChuckGlobals {
    Event: string[];
    float: string[];
}

/**
 * Clean comments from Code
 * @param code Chuck Code
 * @returns code with no comments
 */
function cleanComments(code: string): string {
    code = code.replace(/\/\/.*/g, ""); // Remove all comments
    code = code.trim(); // Remove leading and trailing whitespace
    return code;
}

/**
 * Take in ChucK code and return the global Event and float variable names.
 * NOTE: does not return global ints
 * @param code Chuck Code to preprocess
 * @returns json of Event and float variable names
 */
export function chuckPreprocess(code: string): ChuckGlobals {
    code = cleanComments(code);

    // Get variable names of global Events and floats
    const events = (code.match(/global Event (\w+)/g) || []).map(
        (e) => e.split(" ")[2]
    );
    const floats = (code.match(/global float (\w+)/g) || []).map(
        (e) => e.split(" ")[2]
    );
    const uniqueEvents = [...new Set(events)];
    const uniqueFloats = [...new Set(floats)];

    return { Event: uniqueEvents, float: uniqueFloats };
}
