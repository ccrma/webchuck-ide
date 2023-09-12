//-------------------------------------------------------
// title: WebChucK IDE Navbar
// desc:  Dropdowns and basic configuration functionality
//
// author: terry feng
// date:   August 2023
//-------------------------------------------------------

import Dropdown from "./dropdown";

/**
 * NavBar class to handle dropdowns
 * @class NavBar
 */
export default class NavBar {
    public static darkModeToggle: HTMLButtonElement;
    constructor() {
        NavBar.buildDropdowns();

        // Dark Mode
        NavBar.darkModeToggle = document.querySelector<HTMLButtonElement>("#darkModeToggle")!;
        NavBar.setColorScheme(); // read from local storage
        NavBar.darkModeToggle.addEventListener("click", () => {
            NavBar.toggleDarkMode();
        });
    }

    /**
     * Set the color scheme of the page
     */
    static setColorScheme() {
        // On page load or when changing themes, best to add inline in `head` to avoid FOUC
        if ( localStorage.theme === "dark" || (!("theme" in localStorage ) && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }

    /**
     * Build all the dropdown components in the navbar
     * Initializes the expand and collapse functionality
     */
    static buildDropdowns() {
        // File
        let fileContainer =
            document.querySelector<HTMLDivElement>("#fileContainer")!;
        let fileButton =
            document.querySelector<HTMLButtonElement>("#fileButton")!;
        let fileDropdown =
            document.querySelector<HTMLDivElement>("#fileDropdown")!;
        new Dropdown(fileContainer, fileButton, fileDropdown);

        // Edit
        let editContainer =
            document.querySelector<HTMLDivElement>("#editContainer")!;
        let editButton =
            document.querySelector<HTMLButtonElement>("#editButton")!;
        let editDropdown =
            document.querySelector<HTMLDivElement>("#editDropdown")!;
        new Dropdown(editContainer, editButton, editDropdown);

        // View
        let viewContainer =
            document.querySelector<HTMLDivElement>("#viewContainer")!;
        let viewButton =
            document.querySelector<HTMLButtonElement>("#viewButton")!;
        let viewDropdown =
            document.querySelector<HTMLDivElement>("#viewDropdown")!;
        new Dropdown(viewContainer, viewButton, viewDropdown);

        // Examples
        let examplesContainer =
            document.querySelector<HTMLDivElement>("#examplesContainer")!;
        let examplesButton =
            document.querySelector<HTMLButtonElement>("#examplesButton")!;
        let examplesDropdown =
            document.querySelector<HTMLDivElement>("#examplesDropdown")!;
        new Dropdown(examplesContainer, examplesButton, examplesDropdown);

        // Help
        let helpContainer =
            document.querySelector<HTMLDivElement>("#helpContainer")!;
        let helpButton =
            document.querySelector<HTMLButtonElement>("#helpButton")!;
        let helpDropdown =
            document.querySelector<HTMLDivElement>("#helpDropdown")!;
        new Dropdown(helpContainer, helpButton, helpDropdown);
    }

    /**
     * Disable WebChucK IDE dark mode
     */
    static darkModeOff() {
        // turn off dark mode
        localStorage.theme = "light";
        NavBar.darkModeToggle.innerHTML = "Dark Mode: On";
        this.setColorScheme();
    }

    /**
     * Enable WebChucK IDE dark mode
     */
    static darkModeOn() {
        // turn on dark mode
        localStorage.theme = "dark";
        NavBar.darkModeToggle.innerHTML = "Dark Mode: Off";
        this.setColorScheme();
    }

    /**
     * Switch between dark mode and light mode
     */
    static toggleDarkMode() {
        if (localStorage.theme === "dark") {
            this.darkModeOff();
        } else {
            this.darkModeOn();
        }
    }
}
