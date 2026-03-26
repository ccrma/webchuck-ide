import Editor from "@/components/editor/monaco/editor";
import ProjectSystem from "@/components/fileExplorer/projectSystem";
import pako from "pako";

const shareCodeButton =
    document.querySelector<HTMLButtonElement>("#shareCode")!;

const shareModal =
    document.querySelector<HTMLDialogElement>("#share-code-modal")!;
const shareCodeURLField =
    document.querySelector<HTMLInputElement>("#share-code-url")!;
const shareFileUrlField =
    document.querySelector<HTMLInputElement>("#share-file-url")!;
const shareCodeCopyButton =
    document.querySelector<HTMLButtonElement>("#share-code-copy")!;
const shareProjectFilesCheckbox =
    document.querySelector<HTMLInputElement>("#share-project-files")!;

/**
 * Generate a shareable URL
 * See `parseURLParams` for how to parse the URL
 */
function getShareURL(): string {
    const url = new URL(window.location.href);
    url.search = "";

    if (shareProjectFilesCheckbox.checked) {
        // Share entire project (.ck files) 
        const files = ProjectSystem.getProjectFiles().filter(f => f.isChuckFile());

        // Ensure active file is up to date
        files.forEach(file => {
            if (file.isActive()) {
                file.setData(Editor.getEditorCode()); 
            }
        });

        const fileData = files.map(file => ({
            name: file.getFilename(),
            data: file.getData() as string
        }));

        const projectJSON = JSON.stringify(fileData);
        const input = new Uint8Array([...projectJSON].map((c) => c.charCodeAt(0)));
        const compressed = pako.deflate(input, { level: 9 });
        const compressedProject = btoa(String.fromCharCode(...compressed));

        url.searchParams.append("project", compressedProject);
    } else {
        // Single File Share
        let code = Editor.getEditorCode();
        const input = new Uint8Array([...code].map((c) => c.charCodeAt(0)));
        const compressed = pako.deflate(input, { level: 9 });
        const compressedCode = btoa(String.fromCharCode(...compressed));

        if (compressedCode.length < code.length) {
            url.searchParams.append("share", compressedCode);
        } else {
            url.searchParams.append("code", code);
        }
    }

    if (shareFileUrlField.value) {
        url.searchParams.append("url", shareFileUrlField.value);
    }

    return url.toString();
}

/**
 * Initialize share code functionality
 */
export function initShareCode() {
    const shareScopeCurrent = document.querySelector<HTMLButtonElement>("#share-scope-current")!;
    const shareScopeAll = document.querySelector<HTMLButtonElement>("#share-scope-all")!;
    const shareCurrentFilename = document.querySelector<HTMLSpanElement>("#share-current-filename")!;
    const advancedOptions = document.querySelector<HTMLDetailsElement>("#share-advanced-options");
    const advancedBtn = document.querySelector<HTMLButtonElement>("#share-advanced-btn");

    const updateScopeUI = () => {
        const allFilesActive = shareProjectFilesCheckbox.checked;
        shareScopeAll.classList.toggle("active", allFilesActive);
        shareScopeCurrent.classList.toggle("active", !allFilesActive);
    };

    if (shareScopeCurrent) {
        shareScopeCurrent.addEventListener("click", () => {
            if (shareProjectFilesCheckbox.checked) {
                shareProjectFilesCheckbox.checked = false;
                shareProjectFilesCheckbox.dispatchEvent(new Event("change"));
                updateScopeUI();
            }
        });
    }

    if (shareScopeAll) {
        shareScopeAll.addEventListener("click", () => {
            if (!shareProjectFilesCheckbox.checked) {
                shareProjectFilesCheckbox.checked = true;
                shareProjectFilesCheckbox.dispatchEvent(new Event("change"));
                updateScopeUI();
            }
        });
    }

    if (advancedBtn && advancedOptions) {
        advancedBtn.addEventListener("click", () => {
            advancedOptions.open = !advancedOptions.open;
        });
    }

    // Open Modal
    shareCodeButton.addEventListener("click", () => {
        shareModal.showModal();

        const urlParams = new URLSearchParams(window.location.search);
        shareFileUrlField.value = urlParams.get("url") || "";

        if (advancedOptions) {
            advancedOptions.open = shareFileUrlField.value !== "";
        }

        // Set current file name
        const activeFile = ProjectSystem.getProjectFiles().find(f => f.isActive());
        if (activeFile && shareCurrentFilename) {
            shareCurrentFilename.textContent = activeFile.getFilename();
        }
        
        // Setup initial scope UI
        updateScopeUI();

        shareCodeURLField.value = getShareURL();
        shareCodeURLField.setSelectionRange(0, 0);
    });

    // Update URL on input
    shareFileUrlField.addEventListener("input", () => {
        shareCodeURLField.value = getShareURL();
    });

    shareProjectFilesCheckbox.addEventListener("change", () => {
        if (shareProjectFilesCheckbox.checked) {
            const projectFiles = ProjectSystem.getProjectFiles();
            if (projectFiles.some(f => !f.isChuckFile())) {
                alert("Note: Only ChucK files (.ck) are packaged into the project URL. Data files will be excluded.");
            }
        }
        shareCodeURLField.value = getShareURL();
    });

    // Copy URL
    shareCodeCopyButton.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(shareCodeURLField.value);
        } catch {
            shareCodeURLField.select();
            document.execCommand("copy");
        }
        shareCodeURLField.setSelectionRange(0, 0);

        // Update button text to checkmark + Copied
        const originalHTML = shareCodeCopyButton.innerHTML;
        shareCodeCopyButton.innerHTML = `<svg class="w-[0.95rem] h-[0.95rem]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Copied!`;
        
        setTimeout(() => {
            shareCodeCopyButton.innerHTML = originalHTML;
        }, 2000);
    });

    // Close Modal
    const closers = document.querySelectorAll<HTMLButtonElement>("#share-code-close, #share-code-cancel, #share-code-done");
    closers.forEach(btn => btn.addEventListener("click", () => {
        shareModal.close();
    }));

    shareModal.addEventListener("click", (e) => {
        if (e.target === shareModal) {
            shareModal.close();
        }
    });
}
