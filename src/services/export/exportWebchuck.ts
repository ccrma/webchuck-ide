import Editor from "@/components/monaco/editor";

const exportWebchuckButton =
    document.querySelector<HTMLButtonElement>("#exportWebchuck")!;
const exportWebchuckCancel: HTMLButtonElement =
    document.querySelector<HTMLButtonElement>("#export-cancel-btn")!;
const exportDialog: HTMLDialogElement =
    document.querySelector<HTMLDialogElement>("#export-webchuck-modal")!;
const exportBtn: HTMLButtonElement =
    document.querySelector<HTMLButtonElement>("#export-btn")!;

/**
 * Export editor code to a webchuck index.html
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
    const doc: Document = new DOMParser().parseFromString(
        template,
        "text/html"
    );

    // Replace template values
    doc.querySelector<HTMLHeadingElement>("#title")!.textContent = title;
    doc.getElementsByTagName("title")[0].textContent = title;
    doc.querySelector<HTMLHeadingElement>("#author")!.textContent = author;
    doc.querySelector<HTMLScriptElement>("#chuck")!.textContent = code;
    doc.querySelector<HTMLDivElement>("#description")!.textContent =
        description;

    // Download file
    const webchuckFileBlob = new Blob([doc.documentElement.outerHTML], {
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
