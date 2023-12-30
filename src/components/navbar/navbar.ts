//-------------------------------------------------------
// title: WebChucK IDE Navbar
// desc:  Dropdowns and basic configuration functionality
//
// author: terry feng
// date:   August 2023
//-------------------------------------------------------

import Dropdown from "@/components/navbar/dropdown";

/**
 * NavBar class to handle dropdowns
 * @class NavBar
 */
export default class NavBar {
    constructor() {
        NavBar.buildDropdowns();
    }

    /**
     * Build all the dropdown components in the navbar
     * Initializes the expand and collapse functionality
     */
    static buildDropdowns() {
        // File
        const fileContainer =
            document.querySelector<HTMLDivElement>("#fileContainer")!;
        const fileButton =
            document.querySelector<HTMLButtonElement>("#fileButton")!;
        const fileDropdown =
            document.querySelector<HTMLDivElement>("#fileDropdown")!;
        new Dropdown(fileContainer, fileButton, fileDropdown);

        // Edit
        const editContainer =
            document.querySelector<HTMLDivElement>("#editContainer")!;
        const editButton =
            document.querySelector<HTMLButtonElement>("#editButton")!;
        const editDropdown =
            document.querySelector<HTMLDivElement>("#editDropdown")!;
        new Dropdown(editContainer, editButton, editDropdown);

        // View
        const viewContainer =
            document.querySelector<HTMLDivElement>("#viewContainer")!;
        const viewButton =
            document.querySelector<HTMLButtonElement>("#viewButton")!;
        const viewDropdown =
            document.querySelector<HTMLDivElement>("#viewDropdown")!;
        new Dropdown(viewContainer, viewButton, viewDropdown);

        // Examples
        const examplesContainer =
            document.querySelector<HTMLDivElement>("#examplesContainer")!;
        const examplesButton =
            document.querySelector<HTMLButtonElement>("#examplesButton")!;
        const examplesDropdown =
            document.querySelector<HTMLDivElement>("#examplesDropdown")!;
        new Dropdown(examplesContainer, examplesButton, examplesDropdown);

        // Help
        const helpContainer =
            document.querySelector<HTMLDivElement>("#helpContainer")!;
        const helpButton =
            document.querySelector<HTMLButtonElement>("#helpButton")!;
        const helpDropdown =
            document.querySelector<HTMLDivElement>("#helpDropdown")!;
        new Dropdown(helpContainer, helpButton, helpDropdown);
    }
}
