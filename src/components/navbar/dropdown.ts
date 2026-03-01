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
        this.button.addEventListener("click", () => {
            if (currentDropdown && currentDropdown !== this) {
                currentDropdown.close();
            }
            this.toggle();
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            currentDropdown = this;
        });

        document.addEventListener("click", (event: MouseEvent) => {
            if (
                !this.button.contains(event.target as Node) &&
                !this.container.contains(event.target as Node)
            ) {
                this.close();
            }
        });

        // Close dropdown when focus leaves the container
        this.container.addEventListener("focusout", (event: FocusEvent) => {
            if (!this.container.contains(event.relatedTarget as Node)) {
                this.close();
            }
        });

        // Keyboard navigation
        this.container.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                this.close();
                this.button.focus();
            }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                const items = Array.from(
                    this.dropdown.querySelectorAll<HTMLElement>("[role=\"menuitem\"]")
                );
                if (items.length === 0) return;
                const current = document.activeElement as HTMLElement;
                const index = items.indexOf(current);
                let next: number;
                if (event.key === "ArrowDown") {
                    next = index < items.length - 1 ? index + 1 : 0;
                } else {
                    next = index > 0 ? index - 1 : items.length - 1;
                }
                items[next].focus();
            }
        });

        // Hover-to-switch: when a dropdown is already open, hovering
        // over another menu button switches to that dropdown
        this.button.addEventListener("mouseenter", () => {
            if (currentDropdown && currentDropdown !== this) {
                currentDropdown.close();
                this.open = true;
                this.button.setAttribute("aria-expanded", "true");
                this.dropdown.classList.remove("hidden");
                this.positionDropdown();
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                currentDropdown = this;
            }
        });

        // Initial accessibility state
        this.button.setAttribute("aria-expanded", "false");
        this.button.setAttribute("aria-haspopup", "true");

        // Move the dropdown when navbar scrolls
        NavBar.navbar.addEventListener("scroll", () => {
            if (this.open) this.positionDropdown();
        });
    }

    /**
     * Position the dropdown relative to its button, clamped to viewport edges
     */
    private positionDropdown() {
        const pos = this.button.getBoundingClientRect();
        let left = pos.left;
        const dropdownRect = this.dropdown.getBoundingClientRect();
        // Clamp right edge to viewport
        if (left + dropdownRect.width > window.innerWidth) {
            left = window.innerWidth - dropdownRect.width - 8;
        }
        // Clamp left edge
        if (left < 0) left = 8;
        this.dropdown.style.left = `${left}px`;
        this.dropdown.style.top = `${pos.bottom}px`;
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
        this.button.setAttribute("aria-expanded", "true");
        this.dropdown.classList.remove("hidden");
        this.positionDropdown();
    }

    close() {
        if (!this.open) return;
        this.open = false;
        this.button.setAttribute("aria-expanded", "false");
        this.dropdown.classList.add("hidden");
        if (currentDropdown === this) {
            currentDropdown = null;
        }
    }
}
