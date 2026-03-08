//-------------------------------------------------------
// title: WebChucK IDE Navbar
// desc:  Dropdowns and basic configuration functionality
//
// author: terry feng
// date:   August 2023
//-------------------------------------------------------

import Dropdown from "@/components/navbar/dropdown";
import NestedDropdown from "./nestedDropdown";
import Console from "@/components/outputPanel/console";
import { version } from "@/../package.json";
import { chuckVersion } from "@/host";

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

    public static navbar: HTMLDivElement;
    public static aboutButton: HTMLButtonElement;

    constructor() {
        NavBar.navbar = document.querySelector<HTMLDivElement>("#navbar")!;
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

        // Help > About
        NavBar.aboutButton =
            document.querySelector<HTMLButtonElement>("#about-ide")!;
        NavBar.aboutButton.addEventListener("click", () => {
            Console.print("|========================================|");
            Console.print(`|          WebChucK IDE v${version}           |`);
            Console.print("|========================================|");
            Console.print("| authors: terry feng & chuck team       |");
            Console.print("| date: 2023 - present                   |");
            Console.print(`| ide version: ${version.padEnd(21)}     |`);
            Console.print(`| chuck version: ${chuckVersion.padEnd(23)} |`);
            Console.print("| source:                                |");
            Console.print(
                "| \x1b[38;2;34;178;254mhttps://github.com/ccrma/webchuck-ide\x1b[0m  |"
            );
            Console.print("|========================================|");
            NavBar.HelpDropdown.close();
        });

        // Help > Keyboard Shortcuts
        const shortcutsButton = document.querySelector<HTMLButtonElement>("#keyboard-shortcuts")!;
        const shortcutsModal = document.querySelector<HTMLDialogElement>("#shortcuts-modal")!;
        const shortcutsClose = document.querySelector<HTMLButtonElement>("#shortcuts-close")!;

        shortcutsButton.addEventListener("click", () => {
            shortcutsModal.showModal();
            NavBar.HelpDropdown.close();
        });
        shortcutsClose.addEventListener("click", () => {
            shortcutsModal.close();
        });
        shortcutsModal.addEventListener("mousedown", (e: MouseEvent) => {
            if (e.target === shortcutsModal) shortcutsModal.close();
        });
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
