//---------------------------------------------------------
// title: Input Header Toggle
// desc: Define functionality for Input Panel Toggles
//       Hide or show the Input Panel and the GUI/HID interface
//
// author: terry feng
// date:   January 2024
//---------------------------------------------------------
import {
    accentColorClass,
    darkHoverColorClass,
    darkTextColorClass,
    hoverColorClass,
    textColorClass,
} from "@/utils/theme";
import HeaderToggle from "./headerToggle";
import InputPanelHeader from "../inputPanelHeader";

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
            this.button.classList.add(accentColorClass);
            this.button.classList.remove(textColorClass);
            this.button.classList.remove(hoverColorClass);
            this.button.classList.remove(darkTextColorClass);
            this.button.classList.remove(darkHoverColorClass);
            this.contentContainer.classList.remove("hidden");

            this.open = true;
        } else {
            // inactive
            this.button.classList.remove("underline");
            this.button.classList.remove(accentColorClass);
            this.button.classList.add(textColorClass);
            this.button.classList.add(hoverColorClass);
            this.button.classList.add(darkTextColorClass);
            this.button.classList.add(darkHoverColorClass);
            this.contentContainer.classList.add("hidden");

            this.open = false;
        }
    }
}
