/**
 * Abstract Header Toggle Implementation Class
 */
export default class HeaderToggle {
    public button: HTMLButtonElement;
    public contentContainer: HTMLDivElement;
    protected open: boolean = false;
    protected openCallback: () => void;
    protected closeCallback: () => void;

    constructor(
        button: HTMLButtonElement,
        contentContainer: HTMLDivElement,
        initialOpen: boolean = false,
        openCallback: () => void = () => {},
        closeCallback: () => void = () => {}
    ) {
        this.button = button;
        this.contentContainer = contentContainer;

        this.button.addEventListener("click", () => {
            this.toggle();
        });
        this.openCallback = openCallback;
        this.closeCallback = closeCallback;
        this.setActive(initialOpen);
    }

    // Default implementation
    toggle() {
        this.setActive(!this.open);
    }

    setActive(open: boolean) {
        if (open) {
            this.contentContainer.classList.remove("hidden");
            this.openCallback();
            this.open = true;
        } else {
            this.contentContainer.classList.add("hidden");
            this.closeCallback();
            this.open = false;
        }
    }
}
