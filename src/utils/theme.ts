//--------------------------------------------------------------------
// title: Theme
// desc:  Handles the dark mode toggle and color scheme
//
// author: terry feng
// date:   August 2023
//--------------------------------------------------------------------

import Console from "@/components/console";

let darkModeToggle: HTMLButtonElement;

/* Header Theme */
let accentColorClass: string = "text-orange";
let textColorClass: string = "text-dark-5";
let inactiveHoverColorClass: string = "hover:text-dark-8";
let darkTextColorClass: string = "dark:text-dark-8";
let darkInactiveHoverColorClass: string = "dark:hover:text-dark-a";
export {accentColorClass, textColorClass, inactiveHoverColorClass, darkTextColorClass, darkInactiveHoverColorClass};

/**
 * Set the color scheme of the page
 */
export function setColorScheme() {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
        document.documentElement.classList.add("dark");
        Console.setDarkTheme();
        darkModeToggle.innerHTML = "Dark Mode: On";
    } else {
        document.documentElement.classList.remove("dark");
        Console.setLightTheme();
        darkModeToggle.innerHTML = "Dark Mode: Off";
    }
}

/**
 * Return the current color scheme
 * @returns {string} "dark" or "light"
 */
export function getColorScheme(): string {
    return localStorage.theme;
}

/**
 * Initialize the dark mode toggle button
 */
export function initTheme() {
    darkModeToggle =
        document.querySelector<HTMLButtonElement>("#darkModeToggle")!;
    darkModeToggle.addEventListener("click", () => {
        toggleDarkMode();
    });
    setColorScheme();
}

/**
 * Disable WebChucK IDE dark mode
 */
function darkModeOff() {
    // turn off dark mode
    localStorage.theme = "light";
    setColorScheme();
}

/**
 * Enable WebChucK IDE dark mode
 */
function darkModeOn() {
    // turn on dark mode
    localStorage.theme = "dark";
    setColorScheme();
}

/**
 * Switch between dark mode and light mode
 */
function toggleDarkMode() {
    if (localStorage.theme === "dark") {
        darkModeOff();
    } else {
        darkModeOn();
    }
}
