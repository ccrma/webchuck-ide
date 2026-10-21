import Console from "@/components/outputPanel/console";
import OutputHeaderToggle from "@components/toggle/outputHeaderToggle";
import FullscreenOverlay from "@/components/outputPanel/fullscreenOverlay";
import { engineMode, visual } from "@/host";

export default class OutputPanelHeader {
    public static consoleContainer: HTMLDivElement;
    public static vmMonitorContainer: HTMLDivElement;
    public static visualizerContainer: HTMLDivElement;
    public static canvasContainer: HTMLDivElement;

    public static fullscreenButton: HTMLButtonElement;
    private static fullscreenWrap: HTMLDivElement;

    constructor() {
        const isChuGL = engineMode === "webchugl";

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
        // Canvas (WebChuGL)
        const canvasButton =
            document.querySelector<HTMLButtonElement>("#canvasTab")!;
        OutputPanelHeader.canvasContainer =
            document.querySelector<HTMLDivElement>("#canvasContainer")!;

        // Fullscreen button (opens overlay for canvas or visualizer).
        // Must be queried before building toggles because OutputHeaderToggle's
        // constructor calls updateOutputPanel(), which touches fullscreenWrap.
        OutputPanelHeader.fullscreenWrap =
            document.querySelector<HTMLDivElement>("#fullscreenBtnWrap")!;
        OutputPanelHeader.fullscreenButton =
            document.querySelector<HTMLButtonElement>("#fullscreenBtn")!;
        OutputPanelHeader.fullscreenButton.addEventListener("click", () => {
            OutputPanelHeader.openFullscreen();
        });

        // Build toggles
        new OutputHeaderToggle(
            consoleButton,
            OutputPanelHeader.consoleContainer,
            true
        );
        new OutputHeaderToggle(
            vmMonitorButton,
            OutputPanelHeader.vmMonitorContainer,
            !isChuGL
        );
        new OutputHeaderToggle(
            visualizerButton,
            OutputPanelHeader.visualizerContainer
        );

        // Canvas tab: only in WebChuGL mode
        if (isChuGL) {
            canvasButton.classList.remove("hidden");
            new OutputHeaderToggle(
                canvasButton,
                OutputPanelHeader.canvasContainer,
                true
            );
        }

        // Recalculate split heights on window resize
        window.addEventListener("resize", () => {
            OutputPanelHeader.updateOutputPanel(OutputHeaderToggle.numActive);
        });
    }

    /**
     * Update the Output Panel after a tab toggle or resize.
     * Content uses absolute-inset-0 containment so CSS flex: 1 1 0%
     * handles equal sizing; we only need to re-fit xterm and the visualizer.
     * @param tabsActive number of tabs active
     */
    static updateOutputPanel(tabsActive: number) {
        // Show the fullscreen button only when canvas or visualizer is visible
        const visVisible =
            !OutputPanelHeader.visualizerContainer.classList.contains("hidden");
        const canvasVisible =
            !OutputPanelHeader.canvasContainer.classList.contains("hidden");
        const fsVisible = visVisible || canvasVisible;
        OutputPanelHeader.fullscreenWrap.classList.toggle("hidden", !fsVisible);

        if (tabsActive === 0) {
            return;
        }

        requestAnimationFrame(() => {
            Console.resizeConsole();
            visual?.resize();
        });
    }

    /**
     * Open the fullscreen overlay on whichever visual tab is active
     * (canvas takes priority if both are visible).
     */
    static openFullscreen() {
        if (!OutputPanelHeader.canvasContainer.classList.contains("hidden")) {
            FullscreenOverlay.open("canvas");
        } else if (
            !OutputPanelHeader.visualizerContainer.classList.contains("hidden")
        ) {
            FullscreenOverlay.open("visualizer");
        }
    }
}
