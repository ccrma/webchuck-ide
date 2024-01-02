import InputHeaderToggle from "./toggle/inputHeaderToggle";
import { openInputPanel } from "@/utils/appLayout";

export default class InputPanelHeader {
    public static inputButtons: HTMLButtonElement[] = [];
    public static inputContainers: HTMLDivElement[] = [];
    public static inputToggles: InputHeaderToggle[] = [];

    public static activeToggleIndex: number = -1;

    constructor() {
        // Setup Input Tabs and Containers
        // GUI
        InputPanelHeader.inputButtons.push(
            document.querySelector<HTMLButtonElement>("#GUITab")!
        );
        InputPanelHeader.inputContainers.push(
            document.querySelector<HTMLDivElement>("#GUIContainer")!
        );
        // HID
        InputPanelHeader.inputButtons.push(
            document.querySelector<HTMLButtonElement>("#HIDTab")!
        );
        InputPanelHeader.inputContainers.push(
            document.querySelector<HTMLDivElement>("#HIDContainer")!
        );

        // Build toggles with containers
        for (let i = 0; i < InputPanelHeader.inputButtons.length; i++) {
            InputPanelHeader.inputToggles.push(
                new InputHeaderToggle(
                    InputPanelHeader.inputButtons[i],
                    InputPanelHeader.inputContainers[i],
                    i
                )
            );
        }
    }
    /**
     * Set newToggleIndex tab to be active
     * Turn on the toggle for this tab and turn off toggles for all other tabs
     * Show the current index container and hide all the other ones
     * If new is same as activeToggleIndex, minimize
     * @param newToggleIndex which tab to turn on
     */
    static updateActiveTab(newToggleIndex: number) {
        for (let i = 0; i < InputPanelHeader.inputButtons.length; i++) {
            InputPanelHeader.inputToggles[i].setActive(
                i == newToggleIndex &&
                newToggleIndex != InputPanelHeader.activeToggleIndex
            );
        }

        // If newToggle same as old, close panel
        // else set net active tab
        if (newToggleIndex == InputPanelHeader.activeToggleIndex) {
            openInputPanel(false);
            InputPanelHeader.activeToggleIndex = -1;
        } else {
            openInputPanel(true);
            InputPanelHeader.activeToggleIndex = newToggleIndex;
        }
    }
}
