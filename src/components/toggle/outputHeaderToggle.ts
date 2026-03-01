//---------------------------------------------------------
// title: Output Header Toggle
// desc: Define functionality for Output Panel Toggles
//       Hide or show the Console and Visualizer Container
//
// author: terry feng
// date:   December 2023
//---------------------------------------------------------
import OutputPanelHeader from "@/components/outputPanel/outputPanelHeader";
import {
    ACCENT_COLOR_CLASS,
    DARK_HOVER_COLOR_CLASS,
    DARK_TEXT_HOVER_CLASS,
    HOVER_COLOR_CLASS,
    TEXT_COLOR_CLASS,
} from "@/utils/theme";
import HeaderToggle from "./headerToggle";

export default class OutputHeaderToggle extends HeaderToggle {
    public static numToggles = 0;
    public static numActive = 0;

    constructor(
        button: HTMLButtonElement,
        contentContainer: HTMLDivElement,
        initialOpen: boolean = false
    ) {
        OutputHeaderToggle.numToggles++;
        // If initialOpen, increment active
        if (initialOpen) {
            OutputHeaderToggle.numActive++;
        }
        super(button, contentContainer, initialOpen);
    }

    toggle() {
        // If already open
        if (this.open) {
            OutputHeaderToggle.numActive--;
        } else {
            OutputHeaderToggle.numActive++;
        }
        this.setActive(!this.open);
    }

    setActive(open: boolean) {
        this.button.setAttribute("aria-selected", String(open));

        if (open) {
            // active
            this.button.classList.add("underline");
            this.button.classList.add(ACCENT_COLOR_CLASS);
            this.button.classList.remove(TEXT_COLOR_CLASS);
            this.button.classList.remove(HOVER_COLOR_CLASS);
            this.button.classList.remove(DARK_TEXT_HOVER_CLASS);
            this.button.classList.remove(DARK_HOVER_COLOR_CLASS);
            this.contentContainer.classList.remove("hidden");

            this.open = true;
        } else {
            // inactive
            this.button.classList.remove("underline");
            this.button.classList.remove(ACCENT_COLOR_CLASS);
            this.button.classList.add(TEXT_COLOR_CLASS);
            this.button.classList.add(HOVER_COLOR_CLASS);
            this.button.classList.add(DARK_TEXT_HOVER_CLASS);
            this.button.classList.add(DARK_HOVER_COLOR_CLASS);
            this.contentContainer.classList.add("hidden");

            this.open = false;
        }

        // Update the CSS
        OutputPanelHeader.updateOutputPanel(OutputHeaderToggle.numActive);
    }
}
