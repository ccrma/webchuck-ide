import NavBar from "@/components/navbar/navbar";
import ProjectSystem from "@/components/fileExplorer/projectSystem";

const exportChuckButton =
    document.querySelector<HTMLButtonElement>("#exportChuck")!;

/**
 * Export Project Files for downlaod
 */
export function initExportChuck() {
    exportChuckButton.addEventListener("click", async () => {
        // Check how many files are in the project
        const projectFiles = ProjectSystem.getProjectFiles();
        if (projectFiles.length === 1) {
            exportSingleFile();
        } else {
            exportProjectFiles();
        }
        NavBar.FileDropdown.close();
    });
}

/**
 * Export a single .ck file
 */
function exportSingleFile() {
    const projectFiles = ProjectSystem.getProjectFiles();
    const currentFile = projectFiles[0];
    const chuckFileBlob = new Blob([currentFile.getData()], {
        type: "text/plain",
    });
    window.URL = window.URL || window.webkitURL;
    const chuckFileURL = window.URL.createObjectURL(chuckFileBlob);
    // Create invisible download link
    const downloadLink = document.createElement("a");
    downloadLink.href = chuckFileURL;
    downloadLink.download = currentFile.getFilename();
    downloadLink.click();
}

/**
 * Export all project files as a .zip
 */
async function exportProjectFiles() {
    const { default: JSZip } = await import("jszip");
    const projectFiles = ProjectSystem.getProjectFiles();
    const zip = new JSZip();
    projectFiles.forEach((file) => {
        zip.file(file.getFilename(), file.getData());
    });
    zip.generateAsync({ type: "blob" }).then((content) => {
        window.URL = window.URL || window.webkitURL;
        const zipURL = window.URL.createObjectURL(content);
        // Create invisible download link
        const downloadLink = document.createElement("a");
        downloadLink.href = zipURL;
        downloadLink.download = `${
            ProjectSystem.activeFile.getFilename().split(".")[0]
        } Project.zip`;
        downloadLink.click();
    });
}
