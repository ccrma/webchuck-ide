/**
 * Abstract Header Toggle Implementation Class
 */
export default class HeaderToggle {
    public button: HTMLButtonElement;
    public contentContainer: HTMLDivElement;
    public hidden: boolean;
    protected open: boolean = false;

    constructor(
        button: HTMLButtonElement,
        contentContainer: HTMLDivElement,
        initialOpen: boolean = false,
        hidden: boolean = false
    ) {
        this.button = button;
        this.contentContainer = contentContainer;
        this.hidden = hidden;
        this.button.classList.toggle("hidden", hidden);

        this.button.addEventListener("click", () => {
            this.toggle();
        });
        this.setActive(initialOpen && !hidden);
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
