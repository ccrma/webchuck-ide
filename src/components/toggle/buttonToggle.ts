/**
 * Abstract class for Switch Buttons with callback
 */
export default class ButtonToggle {
    public button: HTMLButtonElement;
    public state: boolean;
    public activeText: string;
    public inactiveText: string;
    public activeCallback: () => void;
    public inactiveCallback: () => void;

    constructor(
        button: HTMLButtonElement,
        initialState: boolean,
        activeText: string,
        inactiveText: string,
        activeCallback: () => void,
        inactiveCallback: () => void
    ) {
        this.button = button;
        this.state = initialState;
        this.activeText = activeText;
        this.inactiveText = inactiveText;
        this.activeCallback = activeCallback;
        this.inactiveCallback = inactiveCallback;
        this.setActive(initialState);

        button.addEventListener("click", () => this.toggle());
    }

    toggle() {
        this.setActive(!this.state);
    }

    setActive(newState: boolean) {
        if (newState) {
            // button on
            this.button.innerText = this.activeText;
            this.button.classList.add("active");
            this.activeCallback();

            this.state = true;
        } else {
            // button off
            this.button.innerText = this.inactiveText;
            this.button.classList.remove("active");
            this.inactiveCallback();

            this.state = false;
        }
        this.button.setAttribute("aria-pressed", String(newState));
    }
}
