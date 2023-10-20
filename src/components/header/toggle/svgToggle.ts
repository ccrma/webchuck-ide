import { accentColorClass, darkInactiveHoverColorClass, inactiveHoverColorClass, textColorClass } from "@/utils/theme";

export default class SVGToggle {
    public button: HTMLButtonElement;
    public callback: () => void;
    protected open: boolean = false;
    constructor(
        button: HTMLButtonElement,
        callback: () => void,
        initialOpen: boolean = false
    ) {
        this.button = button;
        this.callback = callback;

        this.button.addEventListener("click", () => {
            this.toggle();
        });

        // If intialOpen is true, then
        if (initialOpen) {
            this.toggle();
        }

        this.button.classList.add(accentColorClass);
        this.button.classList.add("hover:scale-90");
    }

    toggle() {
        // Default implementation
        if (this.open) {
            this.call();
            this.open = false;
            return;
        }
        // toggle to true
        this.open = true;
        this.callback();
        this.button.classList.remove(accentColorClass);
        this.button.classList.add(textColorClass);
        this.button.classList.add(inactiveHoverColorClass);
        this.button.classList.add(darkInactiveHoverColorClass);
    }

    call() {
        // toggle to false
        if (!this.open) return;
        this.open = false;
        this.callback();
        this.button.classList.add(accentColorClass);
        this.button.classList.remove(textColorClass);
        this.button.classList.remove(inactiveHoverColorClass);
        this.button.classList.remove(darkInactiveHoverColorClass);
    }
}
