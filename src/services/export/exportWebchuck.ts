import ProjectSystem from "@/components/fileExplorer/projectSystem";
import Editor from "@/components/monaco/editor";
import JSZip from "jszip";

const exportWebchuckButton =
    document.querySelector<HTMLButtonElement>("#exportWebchuck")!;
const exportWebchuckCancel: HTMLButtonElement =
    document.querySelector<HTMLButtonElement>("#export-cancel-btn")!;
const exportDialog: HTMLDialogElement =
    document.querySelector<HTMLDialogElement>("#export-webchuck-modal")!;
const exportBtn: HTMLButtonElement =
    document.querySelector<HTMLButtonElement>("#export-btn")!;

/**
 * Export Project Files to a WebChucK Web App
 */
export function initExportWebChuck() {
    exportWebchuckButton.addEventListener("click", () => {
        exportDialog.showModal();
    });
    exportWebchuckCancel.addEventListener("click", () => {
        exportDialog.close();
    });
    exportDialog.addEventListener(
        "mousedown",
        (e: MouseEvent): any =>
            e.target === exportDialog && exportDialog.close()
    );

    exportBtn.addEventListener("click", async () => {
        const code = Editor.getEditorCode();
        const exportTitle =
            document.querySelector<HTMLInputElement>("#export-title")!;
        const exportAuthor =
            document.querySelector<HTMLInputElement>("#export-author")!;
        const exportDesc = document.querySelector<HTMLTextAreaElement>(
            "#export-description"
        )!;

        exportWebchuck(
            code,
            exportTitle.value,
            exportAuthor.value,
            exportDesc.value
        );

        exportTitle.value = "";
        exportAuthor.value = "";
        exportDesc.value = "";
    });
}

/**
 * Export editor code to a webchuck index.html
 * @param code code to export
 * @param title code title
 * @param author code author
 * @param description webchuck description
 */
async function exportWebchuck(
    code: string,
    title: string,
    author: string,
    description: string
) {
    const template = await (await fetch("templates/export.html")).text();
    let wc_html: Document = new DOMParser().parseFromString(
        template,
        "text/html"
    );

    // Replace template values
    wc_html.querySelector<HTMLHeadingElement>("#title")!.textContent = title;
    wc_html.getElementsByTagName("title")[0].textContent = title;
    wc_html.querySelector<HTMLHeadingElement>("#author")!.textContent = author;
    wc_html.querySelector<HTMLScriptElement>("#chuck")!.textContent = code;
    wc_html.querySelector<HTMLDivElement>("#description")!.textContent =
        description;
    // Add in PRELOAD_FILES
    // get all projectFiles excluding the current active file
    const currentFile = ProjectSystem.activeFile;
    const projectFilesToPreload = ProjectSystem.getProjectFiles().filter(file => file !== currentFile);
    const preloadFileString = projectFilesToPreload.map(file => {
        return { "serverFilename": `./${file.getFilename()}`, "virtualFilename": file.getFilename() }
    });
    const wc_html_preload_string = wc_html.documentElement.outerHTML.replace("PRELOAD_FILES", JSON.stringify(preloadFileString));
    wc_html = new DOMParser().parseFromString(wc_html_preload_string, "text/html");

    // If exporting a single HTML or a HTML with auxillary files
    if (projectFilesToPreload.length === 0) {
        exportSingleWCFile(wc_html);
    } else {
        exportProjectWCFiles(wc_html, projectFilesToPreload);
    }

}

/**
 * Export a single index.html file
 */
function exportSingleWCFile(wc_html: Document) {
    // Download a single HTML file
    const webchuckFileBlob = new Blob([wc_html.documentElement.outerHTML], {
        type: "text/html",
    });
    window.URL = window.URL || window.webkitURL;
    const webchuckFileURL = window.URL.createObjectURL(webchuckFileBlob);
    // Create invisible download link
    const downloadLink = document.createElement("a");
    downloadLink.href = webchuckFileURL;
    downloadLink.download = "index.html";
    downloadLink.click();
}

/**
 * Export all project files as a .zip
 */
function exportProjectWCFiles(wc_html: Document, projectFiles: any) {
    const zip = new JSZip();
    zip.file("index.html", wc_html.documentElement.outerHTML);
    projectFiles.forEach((file: any) => {
        zip.file(file.getFilename(), file.getData());
    });
    zip.generateAsync({ type: "blob" }).then((content) => {
        window.URL = window.URL || window.webkitURL;
        const zipURL = window.URL.createObjectURL(content);
        // Create invisible download link
        const downloadLink = document.createElement("a");
        downloadLink.href = zipURL;
        downloadLink.download = "project.zip";
        downloadLink.click();
    });
}

// --------------------------------------
// EXPORT DIALOG FORM AUTOSAVE
// --------------------------------------
// Save form input values before closing the dialog
exportDialog.addEventListener("close", () => {
    sessionStorage.setItem(
        "export-description",
        document.querySelector<HTMLTextAreaElement>("#export-description")!
            .value
    );
    sessionStorage.setItem(
        "export-title",
        document.querySelector<HTMLInputElement>("#export-title")!.value
    );
    sessionStorage.setItem(
        "export-author",
        document.querySelector<HTMLInputElement>("#export-author")!.value
    );
});

// Restore form input values when opening the dialog
exportDialog.addEventListener("show", () => {
    document.querySelector<HTMLTextAreaElement>("#export-description")!.value =
        sessionStorage.getItem("export-description") || "";
    document.querySelector<HTMLInputElement>("#export-title")!.value =
        sessionStorage.getItem("export-title") || "";
    document.querySelector<HTMLInputElement>("#export-author")!.value =
        sessionStorage.getItem("export-author") || "";
});
