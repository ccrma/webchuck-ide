import ProjectSystem from "@/components/fileExplorer/projectSystem";

const exportWebchuglButton =
    document.querySelector<HTMLButtonElement>("#exportWebchugl")!;
const exportChuglCancel =
    document.querySelector<HTMLButtonElement>("#export-chugl-cancel-btn")!;
const exportDialog =
    document.querySelector<HTMLDialogElement>("#export-webchugl-modal")!;
const exportBtn =
    document.querySelector<HTMLButtonElement>("#export-chugl-btn")!;
const exportChuglFileSelect = document.querySelector<HTMLSelectElement>(
    "#export-chugl-file-select"
)!;
const exportChuglTitle =
    document.querySelector<HTMLInputElement>("#export-chugl-title")!;

/**
 * Export Project Files to a WebChuGL Web App
 */
export function initExportWebChuGL() {
    exportWebchuglButton.addEventListener("click", () => {
        // Populate main file select
        const allCkfiles = ProjectSystem.getProjectFiles().filter((file) =>
            file.isChuckFile()
        );
        exportChuglFileSelect.innerHTML = "";
        allCkfiles.forEach((file) => {
            const option = document.createElement("option");
            option.value = file.getFilename();
            option.textContent = file.getFilename();
            exportChuglFileSelect.appendChild(option);
        });
        exportChuglFileSelect.disabled = allCkfiles.length == 1;
        const activeFile = ProjectSystem.activeFile;
        if (activeFile.isChuckFile()) {
            exportChuglFileSelect.value = activeFile.getFilename();
        }

        exportDialog.showModal();
    });

    exportChuglCancel.addEventListener("click", () => {
        exportDialog.close();
    });
    exportDialog.addEventListener(
        "mousedown",
        (e: MouseEvent): any =>
            e.target === exportDialog && exportDialog.close()
    );

    exportBtn.addEventListener("click", async () => {
        const title = exportChuglTitle.value;
        const mainFile = exportChuglFileSelect.value;

        await exportWebchugl(title, mainFile);

        exportChuglTitle.value = "";
    });
}

/**
 * Export project to a WebChuGL standalone web app zip
 * @param title project title
 * @param mainFile entry point .ck file
 */
async function exportWebchugl(title: string, mainFile: string) {
    // 1. Fetch the HTML template
    const templateText = await (
        await fetch("templates/webchugl/shell.html")
    ).text();

    // 2. Apply template substitutions
    let html = templateText;
    html = html.replace("{{{ TITLE }}}", title || "WebChuGL");
    html = html.replace("{{{ MAIN_FILE }}}", mainFile);

    // 3. Create bundle.zip from all project files
    const { default: JSZip } = await import("jszip");
    const bundleZip = new JSZip();
    const projectFiles = ProjectSystem.getProjectFiles();
    projectFiles.forEach((file) => {
        bundleZip.file(file.getFilename(), file.getData());
    });
    const bundleBlob = await bundleZip.generateAsync({ type: "blob" });

    // 4. Fetch static assets
    const [swText, logoLight, logoDark] = await Promise.all([
        fetch("templates/webchugl/sw.js").then((r) => r.text()),
        fetch("templates/webchugl/assets/chugl_logo_light.png").then((r) => r.blob()),
        fetch("templates/webchugl/assets/chugl_logo_dark.png").then((r) => r.blob())
    ]);

    // 5. Package everything into the export zip
    const exportZip = new JSZip();
    exportZip.file("index.html", html);
    exportZip.file("bundle.zip", bundleBlob);
    exportZip.file("sw.js", swText);
    exportZip.file("assets/chugl_logo_light.png", logoLight);
    exportZip.file("assets/chugl_logo_dark.png", logoDark);

    const exportBlob = await exportZip.generateAsync({ type: "blob" });

    // 6. Trigger download
    const zipName = title ? `${title} Project.zip` : `${mainFile.split(".")[0]} Project.zip`;
    const url = URL.createObjectURL(exportBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = zipName;
    downloadLink.click();
    URL.revokeObjectURL(url);
}

// Save/restore title across dialog open/close
exportDialog.addEventListener("close", () => {
    sessionStorage.setItem("export-chugl-title", exportChuglTitle.value);
});
exportDialog.addEventListener("show", () => {
    exportChuglTitle.value =
        sessionStorage.getItem("export-chugl-title") || "";
});
