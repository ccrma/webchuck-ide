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
 * Pad number to 2 digit time string for HH:MM:SS usage
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

/**
 * Convert current time in samples to HH:MM:SS.SSSSS (samples)
 * @param samples current samples to convert
 * @param sampleRate sample rate
 * @returns time string
 */
export function samplesToTimeHMSS(samples: number, sampleRate: number): string {
    // samples
    const samplesDisplay = samples % sampleRate;
    // seconds
    const secondsTotal = samples / sampleRate;
    const secondsDisplay = Math.floor(secondsTotal % 60);
    // minutes
    const minutesTotal = secondsTotal / 60;
    const minutesDisplay = Math.floor(minutesTotal % 60);
    // hours
    const hoursTotal = minutesTotal / 60;
    const hoursDisplay = Math.floor(hoursTotal);

    // the display value
    const timeStr =
        displayFormatTime(hoursDisplay) +
        ":" +
        displayFormatTime(minutesDisplay) +
        ":" +
        displayFormatTime(secondsDisplay) +
        "." +
        displayFormatSamples(samplesDisplay);

    return timeStr;
}
