import NavBar from "./navbar";

// Keep track of current open dropdown
let currentDropdown: Dropdown | null = null;

/**
 * Dropdown class
 * @class Dropdown
 * @param {HTMLDivElement} container - The container div
 * @param {HTMLButtonElement} button - The button element
 * @param {HTMLDivElement} dropdown - The dropdown div
 * @param {boolean} open - Whether the dropdown is open or not
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

        // Open and Close
        this.button.addEventListener("click", (/* event: MouseEvent */) => {
            // TODO: Fix this, shouldn't need to stop propagation
            // event?.stopPropagation();
            if (currentDropdown && currentDropdown !== this) {
                currentDropdown.close();
            }
            // Get the position of the button
            const pos = this.button.getBoundingClientRect();
            // Set the position of the dropdown relative to the button
            this.dropdown.style.left = `${pos.left}px`;
            this.dropdown.style.top = `${pos.bottom}px`;

            this.toggle();
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            currentDropdown = this;
        });

        this.container.addEventListener("click", () => {
            const mouseLeaveHandler = () => {
                this.close();
                this.container.removeEventListener(
                    "mouseleave",
                    mouseLeaveHandler
                );
            };
            this.container.addEventListener("mouseleave", mouseLeaveHandler);
        });

        document.addEventListener("click", (event: MouseEvent) => {
            if (
                !this.button.contains(event.target as Node) &&
                !this.container.contains(event.target as Node)
            ) {
                this.close();
            }
        });

        // Move the dropdown when navbar scrolls
        NavBar.navbar.addEventListener("scroll", () => {
            const pos = this.button.getBoundingClientRect();
            this.dropdown.style.left = `${pos.left}px`;
            this.dropdown.style.top = `${pos.bottom}px`;
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
        if (currentDropdown === this) {
            currentDropdown = null;
        }
    }
}
