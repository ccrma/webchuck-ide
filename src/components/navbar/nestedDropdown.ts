/**
 * Dropdown class
 * @class Dropdown
 * @param {HTMLDivElement} container - The container div
 * @param {HTMLButtonElement} button - The button element
 * @param {HTMLDivElement} dropdown - The dropdown div
 * @param {boolean} open - Whether the dropdown is open or not
 */
export default class NestedDropdown {
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

        // // Click interactions for dropdown
        // this.button.addEventListener("click", (event: MouseEvent) => {
        //     event?.stopPropagation();
        //     this.toggle();
        // });

        // document.addEventListener("click", (event: MouseEvent) => {
        //     if (!this.dropdown.contains(event.target as Node)) {
        //         this.close();
        //     }
        // });

        // Hover interactions for dropdown
        this.container.addEventListener("mouseenter", () => {
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
