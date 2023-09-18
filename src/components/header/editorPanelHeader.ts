import { toggleLeft } from "@utils/appLayout";

/**
 * Editor Header class
 * @param fileToggle The file toggle button
 * @param fileName The current file being edited
 */
export default class EditorPanelHeader {
    public static fileToggle: HTMLButtonElement;
    public static fileNameElement: HTMLDivElement;

    public static fileName: string = "untitled.ck";

    constructor() {
        EditorPanelHeader.fileToggle =
            document.querySelector<HTMLButtonElement>("#fileToggle")!;
        EditorPanelHeader.fileNameElement =
            document.querySelector<HTMLDivElement>("#fileName")!;

        // read in both svg files

        EditorPanelHeader.buildFileToggle();
    }

    /**
     * Build the functionality for the file toggle button
     * @param fileToggle fileToggle button icon
     */
    static buildFileToggle() {
        EditorPanelHeader.fileToggle.addEventListener("click", () => {
            toggleLeft();
        });
    }

    /**
     * Set the file name
     * @param name The file name
     */
    static setFileName(name: string) {
        EditorPanelHeader.fileName = name;
        EditorPanelHeader.fileNameElement.innerText = name;
    }

    static getFileName(): string {
        return EditorPanelHeader.fileName;
    }
}
