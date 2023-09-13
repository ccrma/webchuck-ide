import { toggleLeft } from "@utils/appLayout";

/**
 * Editor Header class
 * @param fileToggle The file toggle button
 * @param fileName The current file being edited
 */
export default class EditorPanelHeader {
    public fileToggle: HTMLButtonElement;
    public fileName: HTMLDivElement;

    constructor() {
        this.fileToggle =
            document.querySelector<HTMLButtonElement>("#fileToggle")!;
        this.fileName = document.querySelector<HTMLDivElement>("#fileName")!;

        // read in both svg files

        EditorPanelHeader.buildFileToggle(this.fileToggle);
    }

    /**
     * Build the functionality for the file toggle button
     * @param fileToggle fileToggle button icon
     */
    static buildFileToggle(fileToggle: HTMLButtonElement) {
        fileToggle.addEventListener("click", () => {
            toggleLeft();
        });
    }
}
