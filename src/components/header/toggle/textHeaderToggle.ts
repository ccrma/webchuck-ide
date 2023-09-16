import HeaderToggle from "./headerToggle";

export default class TextHeaderToggle extends HeaderToggle {
    constructor(
        button: HTMLButtonElement,
        contentContainer: HTMLDivElement,
        initialOpen: boolean = false
    ) {
        super(button, contentContainer, initialOpen);
    }

    toggle() {
        // Default implementation
        if (this.open) {
            this.close();
            this.open = false;
            return;
        }
        // toggle to true
        this.open = true;
        this.button.classList.add("underline");
        this.button.classList.add("text-orange");
        this.contentContainer.classList.remove("hidden");
    }

    close() {
        // toggle to false
        if (!this.open) return;
        this.open = false;
        this.button.classList.remove("underline");
        this.button.classList.remove("text-orange");
        this.contentContainer.classList.add("hidden");
    }
}
