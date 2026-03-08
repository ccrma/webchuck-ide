import Console from "@/components/outputPanel/console";
import Editor from "@/components/editor/monaco/editor";
import OutputHeaderToggle from "@components/toggle/outputHeaderToggle";
import { visual } from "@/host";
import { getAppColumnWidths, setAppColumnWidths } from "@/utils/appLayout";

export default class OutputPanelHeader {
    public static consoleContainer: HTMLDivElement;
    public static vmMonitorContainer: HTMLDivElement;
    public static visualizerContainer: HTMLDivElement;
    private static savedColumnWidths: [number, number, number] | null = null;

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
        const collapsed = tabsActive === 0;
        document.getElementById("app")?.classList.toggle(
            "output-collapsed",
            collapsed
        );

        // Collapse/expand the right column on desktop only
        if (window.innerWidth > 640) {
            if (collapsed && !OutputPanelHeader.savedColumnWidths) {
                OutputPanelHeader.savedColumnWidths = getAppColumnWidths();
                const app = document.getElementById("app")!;
                const [left] = OutputPanelHeader.savedColumnWidths;
                app.style.gridTemplateColumns = `${left}% 2px 1fr 2px auto`;
                requestAnimationFrame(() => Editor.resizeEditor());
            } else if (!collapsed && OutputPanelHeader.savedColumnWidths) {
                setAppColumnWidths(OutputPanelHeader.savedColumnWidths);
                OutputPanelHeader.savedColumnWidths = null;
            }
        }

        // Show console font size buttons only when console is visible
        const consoleFontSize = document.getElementById("consoleFontSize");
        if (consoleFontSize) {
            const consoleVisible = !OutputPanelHeader.consoleContainer.classList.contains("hidden");
            consoleFontSize.classList.toggle("hidden", !consoleVisible);
        }

        if (collapsed) {
            requestAnimationFrame(() => Editor.resizeEditor());
            return;
        }

        requestAnimationFrame(() => {
            Console.resizeConsole();
            visual?.resize();
        });
    }
}
