import Editor from "@/components/monaco/editor";
import NavBar from "@/components/navbar/navbar";

const exportChuckButton =
    document.querySelector<HTMLButtonElement>("#exportChuck")!;

/**
 * Export Editor code to a .ck file
 */
export function initExportChuck() {
    exportChuckButton.addEventListener("click", async () => {
        const code = Editor.getEditorCode();
        const filename = Editor.getFileName();
        NavBar.FileDropdown.close();
        const chuckFileBlob = new Blob([code], {
            type: "text/plain",
        });
        window.URL = window.URL || window.webkitURL;
        const chuckFileURL = window.URL.createObjectURL(chuckFileBlob);
        // Create invisible download link
        const downloadLink = document.createElement("a");
        downloadLink.href = chuckFileURL;
        downloadLink.download = filename;
        downloadLink.click();
    });
}
