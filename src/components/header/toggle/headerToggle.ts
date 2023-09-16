export default class HeaderToggle {
    public button: HTMLButtonElement;
    public contentContainer: HTMLDivElement;

    protected open: boolean = false;

    constructor(
        button: HTMLButtonElement,
        contentContainer: HTMLDivElement,
        initialOpen: boolean = false
    ) {
        this.button = button;
        this.contentContainer = contentContainer;

        this.button.addEventListener("click", () => {
            this.toggle();
        });

        // If intialOpen is true, then
        if (initialOpen) {
            this.toggle();
        }
    }

    // Default implementation
    toggle() {
        if (this.open) {
            this.close();
            this.open = false;
            return;
        }
        // toggle to true
        this.open = true;
        this.contentContainer.classList.remove("hidden");
    }

    close() {
        // toggle to false
        if (!this.open) return;
        this.open = false;
        this.contentContainer.classList.add("hidden");
    }
}
