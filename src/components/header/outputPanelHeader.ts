import textHeaderToggle from "./textHeaderToggle";

export default class OutputPanelHeader {
    // Setup the Output Panel Header
    constructor() {
        // Console
        const consoleButton = document.querySelector<HTMLButtonElement>("#consoleTab")!;
        const consoleContent = document.querySelector<HTMLDivElement>("#console")!;
        new textHeaderToggle(consoleButton, consoleContent, true);

        // Visualizer
        const visualizerButton = document.querySelector<HTMLButtonElement>("#visualizerTab")!;
        const visualizerContent = document.querySelector<HTMLDivElement>("#visualizer")!;
        new textHeaderToggle(visualizerButton, visualizerContent);
    }
}