//------------------------------------------------------------
// title: App Layout
// desc:  Handles the responsive layout of the app
//        Allows the resizing of adjacent <div> elements (right-left or top-bottom)
//        separated by a splitter element that is also a <div>
//
// usage: - Set the class for vertical and horizontal splitter bar divs to 'classVSplit'
//          and 'classHSplit' respectively.
//        - Set the thickness of the splitter bars to 2px
//
// author: terry feng
// date:   September 2023
//------------------------------------------------------------

import Resizer from "../components/resizer";

const CLASS_V_SPLIT: string = "vSplit";
const CLASS_H_SPLIT: string = "hSplit";

const SPLITTER_THICKNESS: number = 2;
const MIN_SIZE_H: number = 64;
const MIN_SIZE_V: number = 24;

const LEFT_WIDTH: number = 16.67;
const MIDDLE_WIDTH: number = 50;
const RIGHT_WIDTH: number = 33.33;

// Globals
// let left = document.getElementById("app-left")!;
// let middle = document.getElementById("app-middle")!;
// let right = document.getElementById("app-right")!;
let splitContainer = document.getElementById("app")!;
let left_width: number;
let middle_width: number;
let right_width: number;

// export Constants
export const AppLayoutConstants = {
    SPLITTER_THICKNESS: SPLITTER_THICKNESS,
    MIN_SIZE_H: MIN_SIZE_H,
    MIN_SIZE_V: MIN_SIZE_V,
    LEFT_WIDTH: LEFT_WIDTH,
    MIDDLE_WIDTH: MIDDLE_WIDTH,
    RIGHT_WIDTH: RIGHT_WIDTH,
};

// Initialize the app splitters
export function initAppSplitters() {
    findSplitObjects(`.${CLASS_V_SPLIT},.${CLASS_H_SPLIT}`);
}

//-----------------------------------
// Global Functions
//-----------------------------------
export function getCurrentWidths(): [number, number, number] {
    return [left_width, middle_width, right_width];
}

/**
 * Three widths in percents for the left, middle, and right
 * @param colWidths
 */
export function setCurrentWidths(colPercents: number[]) {
    left_width = colPercents[0];
    middle_width = colPercents[1];
    right_width = colPercents[2];

    let cols: string[] = [
        `${colPercents[0]}%`,
        `${SPLITTER_THICKNESS}px`,
        `${colPercents[1]}%`,
        `${SPLITTER_THICKNESS}px`,
        `${colPercents[2]}%`,
    ];
    splitContainer.style.gridTemplateColumns = cols.join(" ");
}

/**
 * Toggle the left file Explorer visibility
 */
export function toggleLeft() {
    if (localStorage.leftVisible === "true") {
        // hide left
        const widths = getCurrentWidths();
        setCurrentWidths([0, widths[0] + widths[1], widths[2]]);
        localStorage.leftVisible = "false";
    } else {
        // show left
        const widths = getCurrentWidths();
        setCurrentWidths([
            LEFT_WIDTH,
            widths[0] + widths[1] - LEFT_WIDTH,
            widths[2],
        ]);
        localStorage.leftVisible = "true";
    }
}

//-----------------------------------
// Helper Function for resizers
//-----------------------------------
function findSplitObjects(selector: string) {
    const splits: HTMLElement[] = Array.from(
        document.querySelectorAll(selector)
    );
    if (splits.length !== 0) {
        splits.forEach((split) => {
            let isHorizDrag = split.classList.contains(CLASS_V_SPLIT);
            new Resizer(split, isHorizDrag);
        });
    }
}
