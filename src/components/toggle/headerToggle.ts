/**
 * Abstract Header Toggle Implementation Class
 */
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
        this.setActive(initialOpen);
    }

    // Default implementation
    toggle() {
        this.setActive(!this.open);
    }

    setActive(open: boolean) {
        if (open) {
            this.contentContainer.classList.remove("hidden");
            this.open = true;
        } else {
            this.contentContainer.classList.add("hidden");
            this.open = false;
        }
    }
}
