//---------------------------------------------------------
// title: Output Header Toggle
// desc: Define functionality for Output Panel Toggles
//       Hide or show the Console and Visualizer Container
//
// author: terry feng
// date:   December 2023
//---------------------------------------------------------
import OutputPanelHeader from "@/components/panelHeader/outputPanelHeader";
import {
    accentColorClass,
    darkHoverColorClass,
    darkTextColorClass,
    hoverColorClass,
    textColorClass,
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

        // Update the CSS
        OutputPanelHeader.updateOutputPanel(OutputHeaderToggle.numActive);
    }
}
