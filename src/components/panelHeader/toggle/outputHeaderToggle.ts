import OutputPanelHeader from "@/components/panelHeader/outputPanelHeader";
import { getTabsActive, setTabsActive } from "@/utils/outputLayout";
import {
    accentColorClass,
    darkHoverColorClass,
    darkTextColorClass,
    hoverColorClass,
    textColorClass,
} from "@/utils/theme";
import HeaderToggle from "./headerToggle";

export default class OutputHeaderToggle extends HeaderToggle {
    constructor(
        button: HTMLButtonElement,
        contentContainer: HTMLDivElement,
        initialOpen: boolean = false
    ) {
        super(button, contentContainer, initialOpen);
        this.setActive(initialOpen);
        setTabsActive(getTabsActive());
    }

    toggle() {
        this.setActive(!this.open);
    }

    setActive(open: boolean) {
        if (open) {
            // active
            this.button.classList.add("underline");
            this.button.classList.add(accentColorClass);
            this.button.classList.remove(hoverColorClass);
            this.button.classList.remove(darkHoverColorClass);

            this.button.classList.remove(textColorClass);
            this.button.classList.remove(darkTextColorClass);
            this.contentContainer.classList.remove("hidden");

            setTabsActive(getTabsActive() + 1);

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

            setTabsActive(getTabsActive() - 1);

            this.open = false;
        }

        // Update the CSS
        OutputPanelHeader.updateSplitHeight();
    }
}
