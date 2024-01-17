import Editor from "@/components/monaco/editor";

const exportWebchuckButton =
    document.querySelector<HTMLButtonElement>("#exportWebchuck")!;

const exportWebchuckCancel: HTMLButtonElement =
    document.querySelector<HTMLButtonElement>("#export-cancel-btn")!;
const exportDialog: HTMLDialogElement =
    document.querySelector<HTMLDialogElement>("#export-modal")!;
const exportBtn: HTMLButtonElement =
    document.querySelector<HTMLButtonElement>("#export-btn")!;

export function initExport() {
    exportWebchuckButton.addEventListener("click", () => {
        exportWebchuck();
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
        const template = await (await fetch("templates/export.html")).text();

        const doc: Document = new DOMParser().parseFromString(
            template,
            "text/html"
        );
        doc.querySelector<HTMLScriptElement>("#chuck")!.textContent =
            Editor.getEditorCode();
        doc.querySelector<HTMLDivElement>("#description")!.textContent =
            document.querySelector<HTMLTextAreaElement>(
                "#export-description"
            )!.value;
        doc.querySelector<HTMLHeadingElement>("#name")!.textContent =
            document.querySelector<HTMLInputElement>("#export-title")!.value;
        doc.querySelector<HTMLHeadingElement>("#author")!.textContent =
            document.querySelector<HTMLInputElement>("#export-author")!.value;

        // Create blob
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

        document.querySelector<HTMLTextAreaElement>(
            "#export-description"
        )!.value = "";
        document.querySelector<HTMLInputElement>("#export-title")!.value = "";
        document.querySelector<HTMLInputElement>("#export-author")!.value = "";
    });
}

/**
 * Opens the export dialog
 */
async function exportWebchuck() {
    exportDialog.showModal();
}
exportWebchuck();

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
