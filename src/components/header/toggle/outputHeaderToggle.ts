import TextHeaderToggle from "./textHeaderToggle";
import OutputPanelHeader from "@components/header/outputPanelHeader";
import { getTabsActive, setTabsActive } from "@/utils/outputLayout";

export default class OutputHeaderToggle extends TextHeaderToggle {
    constructor(
        button: HTMLButtonElement,
        contentContainer: HTMLDivElement,
        initialOpen: boolean = false
    ) {
        super(button, contentContainer, initialOpen);
    }

    toggle() {
        // Default implementation
        if (this.open) {
            this.close();
            this.open = false;
            setTabsActive(getTabsActive() - 1);
        } else {
            // toggle to true
            this.open = true;
            this.button.classList.add("underline");
            this.button.classList.add("text-orange");
            this.contentContainer.classList.remove("hidden");
            setTabsActive(getTabsActive() + 1);
        }

        // Update the CSS
        OutputPanelHeader.updateSplitHeight();
    }

    close() {
        // toggle to false
        if (!this.open) return;
        this.open = false;
        this.button.classList.remove("underline");
        this.button.classList.remove("text-orange");
        this.contentContainer.classList.add("hidden");
    }
}