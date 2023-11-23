import Console from "@/components/console";
import OutputHeaderToggle from "./toggle/outputHeaderToggle";
import { splitHeightCSS, getTabsActive } from "@/utils/outputLayout";
import { visual } from "@/host";

export default class OutputPanelHeader {
    public static consoleContent: HTMLDivElement;
    public static visualizerContent: HTMLDivElement;

    private static prevTabsActive: number = 0;

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
            document.querySelector<HTMLDivElement>("#visualizerContainer")!;

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

        OutputPanelHeader.updateSplitHeight();
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
        visual?.resize();
    }
}
