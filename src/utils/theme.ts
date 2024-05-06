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
    DARK_HOVER_COLOR_CLASS,
    DARK_TEXT_HOVER_CLASS,
    HOVER_COLOR_CLASS,
    TEXT_COLOR_CLASS,
};

/**
 * Set the color scheme of the page
 */
export function setColorScheme() {
    switch (localStorage.getItem("colorPreference")) {
    case null:
    case "system":
        localStorage.colorPreference = "system";
        setThemeFromPreference();
        darkModeToggle.innerHTML = "Dark Mode: Browser Preference";
        break;
    case "dark":
        localStorage.theme = "dark";
        darkModeOn();
        darkModeToggle.innerHTML = "Dark Mode: Dark";
        break;
    case "light":
        localStorage.theme = "light";
        darkModeOff();
        darkModeToggle.innerHTML = "Dark Mode: Light";
        break;
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

    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", setDarkTheme);
    setColorScheme();
}

function setThemeFromPreference() {
    if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        darkModeOn();
    } else {
        darkModeOff();
    }
}

function setDarkTheme(event) {
    if (localStorage.colorPreference !== "system") {
        return;
    }
    if (event.matches) {
        darkModeOn();
    } else {
        darkModeOff();
    }
}

/**
 * Disable WebChucK IDE dark mode
 */
function darkModeOff() {
    // turn off dark mode
    localStorage.theme = "light";
    document.documentElement.classList.remove("dark");
    Console.setLightTheme();
    visual?.theme(false);
    Editor.setTheme(false);
    GUI.setTheme(false);
}

/**
 * Enable WebChucK IDE dark mode
 */
function darkModeOn() {
    // turn on dark mode
    localStorage.theme = "dark";
    document.documentElement.classList.add("dark");
    Console.setDarkTheme();
    visual?.theme(true);
    Editor.setTheme(true);
    GUI.setTheme(true);
}

/**
 * Switch between dark mode and light mode
 */
function toggleDarkMode() {
    switch (localStorage.colorPreference) {
    case "system":
        localStorage.colorPreference = "dark";
        break;
    case "dark":
        localStorage.colorPreference = "light";
        break;
    case "light":
        localStorage.colorPreference = "system";
        break;
    }

    setColorScheme();
}
