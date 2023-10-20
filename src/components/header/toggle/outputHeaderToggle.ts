import OutputPanelHeader from "@components/header/outputPanelHeader";
import { getTabsActive, setTabsActive } from "@/utils/outputLayout";
import { accentColorClass, darkInactiveHoverColorClass, inactiveHoverColorClass, textColorClass } from "@/utils/theme";
import HeaderToggle from "./headerToggle";

export default class OutputHeaderToggle extends HeaderToggle {
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
            this.button.classList.add(accentColorClass);
            this.button.classList.remove(textColorClass);
            this.button.classList.remove(inactiveHoverColorClass);
            this.button.classList.remove(darkInactiveHoverColorClass);
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
        this.button.classList.remove(accentColorClass);
        this.button.classList.add(textColorClass);
        this.button.classList.add(inactiveHoverColorClass);
        this.button.classList.add(darkInactiveHoverColorClass);
        this.contentContainer.classList.add("hidden");
    }
}
