import Console from "@/components/app-right/console";
import OutputHeaderToggle from "./toggle/outputHeaderToggle";
import { splitHeightCSS, getTabsActive } from "@/utils/outputLayout";

export default class OutputPanelHeader {
    public static consoleContent: HTMLDivElement;
    public static visualizerContent: HTMLDivElement;

    private static prevTabsActive: number = 1;

    constructor() {
        // Setup the Output Panel Header
        // Console
        const consoleButton =
            document.querySelector<HTMLButtonElement>("#consoleTab")!;
        OutputPanelHeader.consoleContent =
            document.querySelector<HTMLDivElement>("#consoleContainer")!;
        // Visualizer
        const visualizerButton =
            document.querySelector<HTMLButtonElement>("#visualizerTab")!;
        OutputPanelHeader.visualizerContent =
            document.querySelector<HTMLDivElement>("#visualizer")!;

        // Build toggles
        new OutputHeaderToggle(
            consoleButton,
            OutputPanelHeader.consoleContent,
            true
        );
        new OutputHeaderToggle(
            visualizerButton,
            OutputPanelHeader.visualizerContent
        );
    }

    /**
     * Updates the split height css based on the number of
     * tabs active in the Output panel header
     */
    static updateSplitHeight() {
        const tabsActive: number = getTabsActive();
        if (OutputPanelHeader.prevTabsActive === tabsActive) return;

        const splitHeight: string = splitHeightCSS;
        OutputPanelHeader.consoleContent.style.height = splitHeight;
        Console.resizeConsole();
        OutputPanelHeader.visualizerContent.style.height = splitHeight;

        this.prevTabsActive = tabsActive;
    }
}
