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

import Editor from "@/components/editor/monaco/editor";
import Resizer from "@/components/resizer";
import Console from "@/components/outputPanel/console";

const CLASS_V_SPLIT: string = "vSplit";
const CLASS_H_SPLIT: string = "hSplit";
const SPLITTER_THICKNESS: number = 2; // px
const MIN_SIZE_H: number = 64; // px
const MIN_SIZE_V: number = 28; // px

// Default Layout Opened Dimensions (%)
const LEFT_WIDTH: number = 16.67;
const MIDDLE_WIDTH: number = 50;
const RIGHT_WIDTH: number = 33.33;
const EDITOR_PANEL_HEIGHT: number = window.innerWidth <= 800 ? 60 : 70; // mobile
const INPUT_PANEL_HEIGHT: number = window.innerWidth <= 800 ? 40 : 30;

// if mobile, set INPUT height to 50
// if mobile, set OUTPUT height to 50
// detect if mobile
// if (window.innerWidth <= 800) {
//     INPUT_PANEL_HEIGHT = 50;

// App Layout Panels
const appContainer = document.getElementById("app")!;
const left_panel = document.getElementById("app-left")!;
const middle_panel = document.getElementById("app-middle")!;
// const editor_panel = document.getElementById("editorPanel")!;
// const input_panel = document.getElementById("inputPanel")!;
// const output_panel = document.getElementById("outputPanel")!;

// Initialize App Dimensions
let left_width: number = LEFT_WIDTH;
let middle_width: number = MIDDLE_WIDTH;
let right_width: number = RIGHT_WIDTH;

// App State (Open Panels)
let left_open = true;
// let middle_open = true;
// let right_open = true;
//let editor_open = true;
let input_panel_open = false;

// App Layout Splitters
const splitters: Resizer[] = [];

// Export Constants
export const AppLayoutConstants = {
    SPLITTER_THICKNESS,
    MIN_SIZE_H,
    MIN_SIZE_V,
    LEFT_WIDTH,
    MIDDLE_WIDTH,
    RIGHT_WIDTH,
    EDITOR_PANEL_HEIGHT,
    INPUT_PANEL_HEIGHT,
};

// Initialize the app splitters
export function initAppSplitters() {
    findSplitObjects(`.${CLASS_V_SPLIT},.${CLASS_H_SPLIT}`);
}

//-----------------------------------
// APP LAYOUT FUNCTIONS
//-----------------------------------
export function getAppColumnWidths(): [number, number, number] {
    return [left_width, middle_width, right_width];
}

/**
 * Three widths in percents for the left, middle, and right
 * @param colPercents
 */
export function setAppColumnWidths(colPercents: number[]) {
    left_width = colPercents[0];
    middle_width = colPercents[1];
    right_width = colPercents[2]; // estimated percent

    const cols: string[] = [
        `${colPercents[0]}%`,
        `${SPLITTER_THICKNESS}px`,
        `${middle_width}%`,
        `${SPLITTER_THICKNESS}px`,
        `calc(${100 - (left_width + middle_width)}% - ${
            2 * SPLITTER_THICKNESS
        }px)`, // actual percent in CSS
    ];
    appContainer.style.gridTemplateColumns = cols.join(" ");
}

/**
 * Vertical Height Set
 */
export function setContainerRowHeights(
    container: HTMLElement,
    _top: number,
    bottom: number | string
) {
    let heights: string[];
    // If a percent is passed in, the bottom panel is open
    // if a string is passed in, that is to mean the closed height of the bottom panel
    let isBottomOpen: boolean;
    if (typeof bottom === "number") {
        heights = [`1fr`, `${SPLITTER_THICKNESS}px`, `${bottom}%`];
        isBottomOpen = true;
    } else {
        heights = [`1fr`, `${SPLITTER_THICKNESS}px`, bottom];
        isBottomOpen = false;
    }
    if (container.id == "app-middle") {
        input_panel_open = isBottomOpen;
    }
    container.style.gridTemplateRows = heights.join(" ");
}

/**
 * Toggle the left file Explorer visibility
 */
export function toggleLeft() {
    if (left_open) {
        // hide left
        const widths = getAppColumnWidths();
        const left = 0;
        const middle = widths[1] + widths[0] / 2.0;
        const right = 100 - middle;
        setAppColumnWidths([left, middle, right]);
        splitters[0].deactivate(); // Deactive the left resizer
        left_panel.classList.add("hidden"); // Hide the left panel
        left_open = false;
    } else {
        // show left
        const widths = getAppColumnWidths();
        setAppColumnWidths([
            LEFT_WIDTH,
            widths[1] - LEFT_WIDTH / 2.0,
            100 - LEFT_WIDTH - (widths[1] - LEFT_WIDTH / 2.0),
        ]);
        left_panel.classList.remove("hidden");
        splitters[0].activate();
        left_open = true;
    }
    Editor.resizeEditor();
    Console.resizeConsole();
}

/**
 * Open the Input Panel to the default height
 * @param open
 */
export function openInputPanel(open: boolean) {
    if (open == input_panel_open) return;

    if (open) {
        // open input panel
        setContainerRowHeights(
            middle_panel,
            EDITOR_PANEL_HEIGHT,
            INPUT_PANEL_HEIGHT
        );
        input_panel_open = true;
    } else {
        // close input panel
        setContainerRowHeights(middle_panel, -1, `${MIN_SIZE_V}px`);
        input_panel_open = false;
    }
    Editor.resizeEditor();
}

/**
 * Helper Function for resizers
 */
function findSplitObjects(selector: string) {
    const splits: HTMLElement[] = Array.from(
        document.querySelectorAll(selector)
    );
    if (splits.length !== 0) {
        splits.forEach((split) => {
            const isHorizDrag = split.classList.contains(CLASS_V_SPLIT);
            splitters.push(new Resizer(split, isHorizDrag));
        });
    }
}
