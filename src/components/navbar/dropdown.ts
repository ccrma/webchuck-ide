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

        this.button.addEventListener("click", (event: MouseEvent) => {
            event?.stopPropagation();
            if (currentDropdown && currentDropdown !== this) {
                currentDropdown.close();
            }
            this.toggle();
            currentDropdown = this;
        });

        this.container.addEventListener("click", (event: MouseEvent) => {
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
