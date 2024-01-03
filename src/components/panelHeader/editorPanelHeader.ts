import { toggleLeft } from "@utils/appLayout";
import SVGToggle from "@components/toggle/svgToggle";

/**
 * Editor Header class
 * @param fileToggle The file toggle button
 * @param filename The current file being edited
 */
export default class EditorPanelHeader {
    public static fileToggle: HTMLButtonElement;
    public static filenameElement: HTMLDivElement;

    public static filename: string = "untitled.ck";

    constructor() {
        EditorPanelHeader.fileToggle =
            document.querySelector<HTMLButtonElement>("#fileToggle")!;
        EditorPanelHeader.filenameElement =
            document.querySelector<HTMLDivElement>("#filename")!;

        // Build SVG Folder Toggle
        new SVGToggle(
            EditorPanelHeader.fileToggle,
            () => {
                toggleLeft();
            },
            false
        );
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
        EditorPanelHeader.filename = name;
        EditorPanelHeader.filenameElement.innerText = name;
    }

    /**
     * Get the current file name
     * @returns The current file name
     */
    static getFileName(): string {
        return EditorPanelHeader.filename;
    }
}
