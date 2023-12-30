//--------------------------------------------------------
// title: Time
// desc:  Time utility function for display and calculation
//
// author: Ge Wang
// date:   July 2023
//--------------------------------------------------------

let displayDigits: number = 0; // e.g. 5 in 44100

/**
 * Calculate the number of digits to display for a sample rate
 * @param sampleRate The sample rate
 */
export function calculateDisplayDigits(sampleRate: number) {
    displayDigits = (Math.log(sampleRate) * Math.LOG10E + 1) | 0;
}

/**
 * Convert number to time string for HH:MM:SS
 * @param i current time as a number
 * @returns time string
 */
export function displayFormatTime(i: number): string {
    if (i < 10) {
        return "0" + i;
    }
    return i.toString();
}

/**
 * Convert number to samples string
 * @param i current samples as a number
 * @returns samples string
 */
export function displayFormatSamples(i: number): string {
    let str = i.toString();
    while (str.length < displayDigits) {
        str = "0" + str;
    }
    return str;
}
