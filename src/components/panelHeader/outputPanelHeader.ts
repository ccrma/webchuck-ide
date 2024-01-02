import Console from "@/components/console";
import OutputHeaderToggle from "./toggle/outputHeaderToggle";
import { visual } from "@/host";
import { openOutputPanel } from "@/utils/appLayout";

const OUTPUT_HEADER_HEIGHT: number = 1.75; // rem

export default class OutputPanelHeader {
    public static consoleContainer: HTMLDivElement;
    public static visualizerContainer: HTMLDivElement;

    constructor() {
        // Setup Output Panel Header Tabs
        // Console
        const consoleButton =
            document.querySelector<HTMLButtonElement>("#consoleTab")!;
        OutputPanelHeader.consoleContainer =
            document.querySelector<HTMLDivElement>("#consoleContainer")!;
        // Visualizer
        const visualizerButton =
            document.querySelector<HTMLButtonElement>("#visualizerTab")!;
        OutputPanelHeader.visualizerContainer =
            document.querySelector<HTMLDivElement>("#visualizerContainer")!;

        // Build toggles
        new OutputHeaderToggle(
            consoleButton,
            OutputPanelHeader.consoleContainer,
            true
        );
        new OutputHeaderToggle(
            visualizerButton,
            OutputPanelHeader.visualizerContainer
        );
    }

    /**
     * Update the CSS for the Output Panel based on the number of tabs that are toggled
     * @param tabsActive number of tabs active
     * @param totalTabs total tabs
     * @returns
     */
    static updateOutputPanel(tabsActive: number) {
        // Open output panel if more than 0 tab is open
        if (tabsActive == 0) {
            openOutputPanel(false);
            return;
        }

        openOutputPanel(true);
        // Split the container heights evenly
        const splitHeight: string = `calc((100% - ${OUTPUT_HEADER_HEIGHT}rem)/${tabsActive})`;
        OutputPanelHeader.consoleContainer.style.height = splitHeight;
        OutputPanelHeader.visualizerContainer.style.height = splitHeight;

        Console.resizeConsole();
        visual?.resize();
    }
}
