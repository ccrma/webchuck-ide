import Console from "@/components/outputPanel/console";
import OutputHeaderToggle from "@components/toggle/outputHeaderToggle";
import { visual } from "@/host";

export default class OutputPanelHeader {
    public static consoleContainer: HTMLDivElement;
    public static vmMonitorContainer: HTMLDivElement;
    public static visualizerContainer: HTMLDivElement;

    constructor() {
        // Setup Output Panel Header Tabs
        // Console
        const consoleButton =
            document.querySelector<HTMLButtonElement>("#consoleTab")!;
        OutputPanelHeader.consoleContainer =
            document.querySelector<HTMLDivElement>("#consoleContainer")!;
        // VM Monitor
        const vmMonitorButton =
            document.querySelector<HTMLButtonElement>("#vmMonitorTab")!;
        OutputPanelHeader.vmMonitorContainer =
            document.querySelector<HTMLDivElement>("#vmMonitorContainer")!;
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
            vmMonitorButton,
            OutputPanelHeader.vmMonitorContainer,
            true
        );
        new OutputHeaderToggle(
            visualizerButton,
            OutputPanelHeader.visualizerContainer
        );

        // Recalculate split heights on window resize
        window.addEventListener("resize", () => {
            OutputPanelHeader.updateOutputPanel(
                OutputHeaderToggle.numActive
            );
        });
    }

    /**
     * Update the Output Panel after a tab toggle or resize.
     * Content uses absolute-inset-0 containment so CSS flex: 1 1 0%
     * handles equal sizing; we only need to re-fit xterm and the visualizer.
     * @param tabsActive number of tabs active
     */
    static updateOutputPanel(tabsActive: number) {
        document.getElementById("app")?.classList.toggle(
            "output-collapsed",
            tabsActive === 0
        );

        if (tabsActive === 0) {
            return;
        }

        requestAnimationFrame(() => {
            Console.resizeConsole();
            visual?.resize();
        });
    }
}
