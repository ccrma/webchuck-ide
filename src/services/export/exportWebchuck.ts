import JSZip from "jszip";
import ProjectSystem from "@/components/fileExplorer/projectSystem";
import Editor from "@/components/monaco/editor";
import { getGlobalVariables } from "@/utils/chuckPreprocess";
import { MIXER_JS } from "./exportSnippets";

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

    // Insert form values into template html
    wc_html.querySelector<HTMLHeadingElement>("#title")!.textContent = title;
    wc_html.getElementsByTagName("title")[0].textContent = title;
    wc_html.querySelector<HTMLHeadingElement>("#author")!.textContent = author;
    wc_html.querySelector<HTMLScriptElement>("#chuck")!.textContent = code;
    wc_html.querySelector<HTMLDivElement>("#description")!.textContent =
        description;

    // Check code for global variables to build mixer
    const globals = getGlobalVariables(code);
    const mixer_code = globals.float.length > 0 ? MIXER_JS : ""; // only look at floats
    wc_html = docFindReplace(wc_html, "{{{ MIXER_CODE }}}", mixer_code);
    if (globals.float.length == 0) {
        wc_html.getElementById("webchuck-gui")?.remove();
    }

    // Add in PRELOAD_FILES
    // get all projectFiles excluding the current active file
    const currentFile = ProjectSystem.activeFile;
    const projectFilesToPreload = ProjectSystem.getProjectFiles().filter(file => file !== currentFile);
    const preloadFileString = projectFilesToPreload.map(file => {
        return { "serverFilename": `./${file.getFilename()}`, "virtualFilename": file.getFilename() }
    });
    wc_html = docFindReplace(wc_html, "{{{ PRELOAD_FILES }}}", JSON.stringify(preloadFileString));

    // If exporting a single HTML or a HTML with auxillary files
    if (projectFilesToPreload.length === 0) {
        exportSingleWCFile(wc_html);
    } else {
        exportProjectWCFiles(wc_html, projectFilesToPreload);
    }

}

/**
 * Export a single index.html file
 * @param wc_html webchuck html document
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
 * @param wc_html webchuck html document
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

/**
 * Helper function to find and replace in a HTML Document file 
 * 
 */
function docFindReplace(doc: Document, find: string, replace: string): Document {
    doc.documentElement.innerHTML = doc.documentElement.outerHTML.replace(find, replace);
    return new DOMParser().parseFromString(doc.documentElement.outerHTML, "text/html");
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
