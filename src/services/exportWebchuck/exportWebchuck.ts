import Editor from "@/components/monaco/editor";

const exportWebchuckButton = document.querySelector<HTMLButtonElement>(
    "#exportWebchuck"
)!;

export function initExport() {
    exportWebchuckButton.addEventListener("click", () => {
        exportWebchuck();
    });
}

async function exportWebchuck() {
    let template = await (await fetch("templates/export.html")).text();
    // fill in template with information
    template = template.replace("${CODE}", Editor.getEditorCode());

    // Create blob
    const webchuckFileBlob = new Blob([template], { type: "text/plain" });
    window.URL = window.URL || window.webkitURL;
    const webchuckFileURL = window.URL.createObjectURL(webchuckFileBlob);
    // Create invisible download link
    const downloadLink = document.createElement("a");
    downloadLink.href = webchuckFileURL;
    downloadLink.download = "index.html";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

export {};