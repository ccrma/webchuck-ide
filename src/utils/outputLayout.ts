const OUTPUT_HEADER_HEIGHT: number = 1.75; // rem

let tabsActive: number = 0;
let splitHeightCSS: string = `calc((100% - ${OUTPUT_HEADER_HEIGHT}rem)/${tabsActive})`;
export { splitHeightCSS }

/**
 * Update the number of tabs active
 * @param num number of tabs active
 */
export function setTabsActive(num: number) {
    tabsActive = num;
    if (num == 0) { return; }
    splitHeightCSS = `calc((100% - ${OUTPUT_HEADER_HEIGHT}rem)/${tabsActive})`;
}

export function getTabsActive() {
    return tabsActive;
}
