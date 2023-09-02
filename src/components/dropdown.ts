/**
 * Dropdown class
 * @class Dropdown
 * @param {HTMLDivElement} container - The container div
 * @param {HTMLButtonElement} button - The button element
 * @param {HTMLDivElement} dropdown - The dropdown div
 */
export default class Dropdown {
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
