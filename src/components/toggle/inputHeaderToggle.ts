//---------------------------------------------------------
// title: Input Header Toggle
// desc: Define functionality for Input Panel Toggles
//       Hide or show the Input Panel and the GUI/HID interface
//
// author: terry feng
// date:   January 2024
//---------------------------------------------------------
import {
    ACCENT_COLOR_CLASS,
    DARK_HOVER_COLOR_CLASS,
    DARK_TEXT_HOVER_CLASS,
    HOVER_COLOR_CLASS,
    TEXT_COLOR_CLASS,
} from "@/utils/theme";
import HeaderToggle from "./headerToggle";
import InputPanelHeader from "../inputPanel/inputPanelHeader";

export default class InputHeaderToggle extends HeaderToggle {
    public tabIndex: number;

    constructor(
        button: HTMLButtonElement,
        contentContainer: HTMLDivElement,
        tabIndex: number
    ) {
        super(button, contentContainer, false);
        this.tabIndex = tabIndex;
    }

    toggle() {
        InputPanelHeader.updateActiveTab(this.tabIndex);
    }

    /**
     * Boolean to activate/deactivate this Toggle Container
     * @param open open or close the tab/container
     */
    setActive(open: boolean) {
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
    }
}
