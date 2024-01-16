import { toggleLeft } from "@utils/appLayout";
import SVGToggle from "@components/toggle/svgToggle";

/**
 * Editor Header class
 * @param fileToggle The file toggle button
 * @param filenameElement Display file name being edited
 */
export default class EditorPanelHeader {
    public static fileToggle: HTMLButtonElement;
    public static filenameElement: HTMLDivElement;

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

    static updateFileName(filename: string) {
        EditorPanelHeader.filenameElement.innerText = filename;
    }
}
