//-------------------------------------------------------
// title: WebChucK IDE Navbar
// desc:  Dropdowns and basic configuration functionality
//
// author: terry feng
// date:   August 2023
//-------------------------------------------------------

import Dropdown from "@/components/navbar/dropdown";
import NestedDropdown from "./nestedDropdown";

/**
 * NavBar class to handle dropdowns
 * @class NavBar
 */
export default class NavBar {
    public static FileDropdown: Dropdown;
    public static EditDropdown: Dropdown;
    public static ViewDropdown: Dropdown;
    public static ExamplesDropdown: Dropdown;
    public static HelpDropdown: Dropdown;

    public static ExportToNestedDropdown: NestedDropdown;

    constructor() {
        NavBar.buildDropdowns();
        NavBar.buildNestedDropdowns();
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
        NavBar.FileDropdown = new Dropdown(
            fileContainer,
            fileButton,
            fileDropdown
        );

        // Edit
        const editContainer =
            document.querySelector<HTMLDivElement>("#editContainer")!;
        const editButton =
            document.querySelector<HTMLButtonElement>("#editButton")!;
        const editDropdown =
            document.querySelector<HTMLDivElement>("#editDropdown")!;
        NavBar.EditDropdown = new Dropdown(
            editContainer,
            editButton,
            editDropdown
        );

        // View
        const viewContainer =
            document.querySelector<HTMLDivElement>("#viewContainer")!;
        const viewButton =
            document.querySelector<HTMLButtonElement>("#viewButton")!;
        const viewDropdown =
            document.querySelector<HTMLDivElement>("#viewDropdown")!;
        NavBar.ViewDropdown = new Dropdown(
            viewContainer,
            viewButton,
            viewDropdown
        );

        // Examples
        const examplesContainer =
            document.querySelector<HTMLDivElement>("#examplesContainer")!;
        const examplesButton =
            document.querySelector<HTMLButtonElement>("#examplesButton")!;
        const examplesDropdown =
            document.querySelector<HTMLDivElement>("#examplesDropdown")!;
        NavBar.ExamplesDropdown = new Dropdown(
            examplesContainer,
            examplesButton,
            examplesDropdown
        );

        // Help
        const helpContainer =
            document.querySelector<HTMLDivElement>("#helpContainer")!;
        const helpButton =
            document.querySelector<HTMLButtonElement>("#helpButton")!;
        const helpDropdown =
            document.querySelector<HTMLDivElement>("#helpDropdown")!;
        NavBar.HelpDropdown = new Dropdown(
            helpContainer,
            helpButton,
            helpDropdown
        );
    }

    /**
     * Build all the nested dropdown components in the navbar
     */
    static buildNestedDropdowns() {
        const exportToContainer =
            document.querySelector<HTMLLIElement>("#exportToContainer")!;
        const exportToButton =
            document.querySelector<HTMLButtonElement>("#exportToButton")!;
        const exportToDropdown =
            document.querySelector<HTMLDivElement>("#exportToDropdown")!;
        NavBar.ExportToNestedDropdown = new NestedDropdown(
            exportToContainer,
            exportToButton,
            exportToDropdown
        );
    }
}
