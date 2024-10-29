import InputHeaderToggle from "@components/toggle/inputHeaderToggle";
import GUI from "@/components/inputPanel/gui/gui";
import { openInputPanel } from "@/utils/appLayout";

export default class InputPanelHeader {
    public static inputButtons: HTMLButtonElement[] = [];
    public static inputContainers: HTMLDivElement[] = [];
    public static inputToggles: InputHeaderToggle[] = [];
    public static inputPings: HTMLSpanElement[] = [];

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
        InputPanelHeader.inputPings.push(
            document.querySelector<HTMLSpanElement>("#GUIPing")!
        );

        // HID
        InputPanelHeader.inputButtons.push(
            document.querySelector<HTMLButtonElement>("#HIDTab")!
        );
        InputPanelHeader.inputContainers.push(
            document.querySelector<HTMLDivElement>("#HIDContainer")!
        );
        InputPanelHeader.inputPings.push(
            document.querySelector<HTMLSpanElement>("#HIDPing")!
        );

        // Sensor
        InputPanelHeader.inputButtons.push(
            document.querySelector<HTMLButtonElement>("#SensorTab")!
        );
        InputPanelHeader.inputContainers.push(
            document.querySelector<HTMLDivElement>("#SensorContainer")!
        );
        InputPanelHeader.inputPings.push(  
            document.querySelector<HTMLSpanElement>("#SensorPing")!
        );

        // Build toggles with containers
        for (let i = 0; i < InputPanelHeader.inputButtons.length; i++) {
            InputPanelHeader.inputToggles.push(
                new InputHeaderToggle(
                    InputPanelHeader.inputButtons[i],
                    InputPanelHeader.inputContainers[i],
                    InputPanelHeader.inputPings[i],
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

        // Resize GUI
        GUI.onResize();
    }

    /**
     * Set the notification ping to be visible
     */
    static setNotificationPing(tabIndex: number, on: boolean) {
        for (let i = 0; i < InputPanelHeader.inputButtons.length; i++) {
            InputPanelHeader.inputToggles[i].setNotificationPing(i == tabIndex && on);
        }
    }
}
