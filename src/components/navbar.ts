//-------------------------------------------------------
// title: WebChucK IDE Navbar
// desc:  Dropdowns and basic configuration functionality
//
// author: terry feng
// date:   August 2023
//-------------------------------------------------------

/**
 * Dropdown class
 * @class Dropdown
 * @param {HTMLDivElement} container - The container div
 * @param {HTMLButtonElement} button - The button element
 * @param {HTMLDivElement} dropdown - The dropdown div
 */
class Dropdown {
    public container: HTMLDivElement;
    public button: HTMLButtonElement;
    public dropdown: HTMLDivElement;

    private open: boolean = false;

    constructor(
        container: HTMLDivElement,
        button: HTMLButtonElement,
        dropdown: HTMLDivElement
    ) {
        this.container = container;
        this.button = button;
        this.dropdown = dropdown;

        this.button.addEventListener("click", () => {
            this.toggle();
        });

        this.container.addEventListener("mouseleave", () => {
            this.close();
        });
    }

    toggle() {
        if (this.open) {
            this.close();
            this.open = false;
            return;
        }
        // set focus to file button
        this.button.focus();
        this.open = true;
        this.dropdown.classList.remove("hidden");
    }
    close() {
        if (!this.open) return;
        this.open = false;
        this.dropdown.classList.add("hidden");
    }
}

/**
 * NavBar class to handle dropdowns
 * @class NavBar
 */
export class NavBar {
    constructor() {
        NavBar.buildDropdowns();
    }

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
}
