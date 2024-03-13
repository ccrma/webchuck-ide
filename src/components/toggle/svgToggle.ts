import {
    ACCENT_COLOR_CLASS,
    DARK_HOVER_COLOR_CLASS,
    HOVER_COLOR_CLASS,
    TEXT_COLOR_CLASS,
} from "@/utils/theme";

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

        this.button.classList.add(ACCENT_COLOR_CLASS);
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
        this.button.classList.remove(ACCENT_COLOR_CLASS);
        this.button.classList.add(TEXT_COLOR_CLASS);
        this.button.classList.add(HOVER_COLOR_CLASS);
        this.button.classList.add(DARK_HOVER_COLOR_CLASS);
    }

    call() {
        // toggle to false
        if (!this.open) return;
        this.open = false;
        this.callback();
        this.button.classList.add(ACCENT_COLOR_CLASS);
        this.button.classList.remove(TEXT_COLOR_CLASS);
        this.button.classList.remove(HOVER_COLOR_CLASS);
        this.button.classList.remove(DARK_HOVER_COLOR_CLASS);
    }
}
