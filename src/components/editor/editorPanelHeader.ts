import { toggleLeft } from "@utils/appLayout";
import BottomSheet from "@components/mobile/bottomSheet";
import { isMobile } from "@utils/mobile";

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

        EditorPanelHeader.fileToggle.addEventListener("click", () => {
            if (isMobile()) {
                BottomSheet.open();
            } else {
                toggleLeft();
            }
        });
    }

    static updateFileName(filename: string) {
        EditorPanelHeader.filenameElement.innerText = filename;
    }
}
