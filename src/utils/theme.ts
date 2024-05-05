//--------------------------------------------------------------------
// title: Theme
// desc:  Handles the dark mode toggle and color scheme
//
// author: terry feng
// date:   August 2023
//--------------------------------------------------------------------

import Console from "@components/console";
import GUI from "@components/gui/gui";
import Editor from "@components/monaco/editor";
import { visual } from "@/host";

let darkModeToggle: HTMLButtonElement;

/* Header Theme */
const ACCENT_COLOR_CLASS: string = "text-orange";
const TEXT_COLOR_CLASS: string = "text-dark-5";
const HOVER_COLOR_CLASS: string = "hover:text-dark-8";
const DARK_TEXT_HOVER_CLASS: string = "dark:text-dark-a";
const DARK_HOVER_COLOR_CLASS: string = "dark:hover:text-dark-c";

export {
    ACCENT_COLOR_CLASS,
    TEXT_COLOR_CLASS,
    HOVER_COLOR_CLASS,
    DARK_TEXT_HOVER_CLASS,
    DARK_HOVER_COLOR_CLASS,
};

/**
 * Set the color scheme of the page
 */
export function setColorScheme() {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (localStorage.theme === "dark") {
        // Dark theme
        document.documentElement.classList.add("dark");
        Console.setDarkTheme();
        visual?.theme(true);
        Editor.setTheme(true);
        GUI.setTheme(true);
        darkModeToggle.innerHTML = "Dark Mode: On";
    } else {
        // Light theme
        document.documentElement.classList.remove("dark");
        Console.setLightTheme();
        visual?.theme(false);
        Editor.setTheme(false);
        GUI.setTheme(false);
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
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        darkModeOn();
    } else {
        darkModeOff();
    };
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
