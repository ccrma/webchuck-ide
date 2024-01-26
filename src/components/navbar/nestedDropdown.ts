/**
 * Nested Dropdown Class 
 * @class Dropdown
 * @param {HTMLDivElement} container - The container div
 * @param {HTMLButtonElement} button - The button element
 * @param {HTMLDivElement} dropdown - The dropdown div
 * @param {boolean} open - Whether the dropdown is open or not
 */
export default class NestedDropdown {
    public container: HTMLLIElement;
    public button: HTMLButtonElement;
    public dropdown: HTMLDivElement;

    private open: boolean = false;

    /**
     * Turn a dropdown element into a nested dropdown
     * Add event listeners for opening nested dropdown
     * @param container
     * @param button
     * @param dropdown
     */
    constructor(
        container: HTMLLIElement,
        button: HTMLButtonElement,
        dropdown: HTMLDivElement
    ) {
        this.container = container;
        this.button = button;
        this.dropdown = dropdown;

        // // Click interactions for dropdown
        this.button.addEventListener("click", (event: MouseEvent) => {
            event?.stopPropagation();
            this.toggle();
        });

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

    static createNewNestedDropdown(
        parentUlContainer: HTMLUListElement,
        id: string,
        name: string
    ): HTMLUListElement {
        // HTML for nested dropdown
        /*
        <li id="hidExamplesContainer" class="relative">
            <button id="hidExamplesButton" type="button" class="dropdownItem nestedDropdownButton">
                HID
                <svg class="w-2.5 h-2.5 ml-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" stroke-linecap="" stroke-linejoin="round" stroke-width="1.5" d="m1 9 4-4-4-4"/>
                </svg>
            </button>
            <div id="hidExamplesDropdown" class="nestedDropdown w-36 hidden">
                <ul class="py-2 text-base text-gray-700 dark:text-gray-200">
                </ul>
            </div>
        </li>
        */
        const li = document.createElement("li");
        li.id = id + "Container";
        li.classList.add("relative");
        const button = document.createElement("button");
        button.id = id + "Button";
        button.type = "button";
        button.classList.add("dropdownItem", "nestedDropdownButton");
        button.innerText = name;
        button.innerHTML += `<svg class="w-2.5 h-2.5 ml-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"> <path stroke="currentColor" stroke-linecap="" stroke-linejoin="round" stroke-width="1.5" d="m1 9 4-4-4-4"/> </svg>`;
        const div = document.createElement("div");
        div.id = id + "Dropdown";
        div.classList.add("nestedDropdown", "w-48", "hidden");
        const ul = document.createElement("ul");
        ul.classList.add(
            "py-2",
            "text-base",
            "text-gray-700",
            "dark:text-gray-200"
        );
        div.appendChild(ul);
        li.appendChild(button);
        li.appendChild(div);
        parentUlContainer.appendChild(li);

        new NestedDropdown(li, button, div);

        // Return nested dropdown ul to populate
        return ul;
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
