import ProjectSystem from "@/components/fileExplorer/projectSystem";
import Editor from "../editor/monaco/editor";
import ProjectFile from "../fileExplorer/projectFile";
import { compressSharedFiles, SharedFile } from "@/services/sharedFile";
import { generateURLFromParams, URLParams } from "@/services/urlParamParser";

export default class ShareModal {
    public static shareCodeButton: HTMLButtonElement;
    public static shareModal: HTMLDialogElement;
    public static shareCodeURLField: HTMLInputElement;
    public static shareFileUrlField: HTMLInputElement;
    public static shareCodeCopyButton: HTMLButtonElement;
    public static shareProjectFilesCheckbox: HTMLInputElement;
    public static shareScopeCurrent: HTMLButtonElement;
    public static shareScopeAll: HTMLButtonElement;
    public static shareCurrentFilename: HTMLSpanElement;
    public static advancedOptions: HTMLDetailsElement | null;
    public static advancedBtn: HTMLButtonElement | null;
    public static advancedBtnIcon: SVGSVGElement | null | undefined;
    public static closer: HTMLButtonElement;

    constructor() {
        ShareModal.shareCodeButton =
            document.querySelector<HTMLButtonElement>("#shareCode")!;
        ShareModal.shareModal =
            document.querySelector<HTMLDialogElement>("#share-code-modal")!;
        ShareModal.shareCodeURLField =
            document.querySelector<HTMLInputElement>("#share-code-url")!;
        ShareModal.shareFileUrlField =
            document.querySelector<HTMLInputElement>("#share-file-url")!;
        ShareModal.shareCodeCopyButton =
            document.querySelector<HTMLButtonElement>("#share-code-copy")!;
        ShareModal.shareProjectFilesCheckbox =
            document.querySelector<HTMLInputElement>("#share-project-files")!;
        ShareModal.shareScopeCurrent =
            document.querySelector<HTMLButtonElement>("#share-scope-current")!;
        ShareModal.shareScopeAll =
            document.querySelector<HTMLButtonElement>("#share-scope-all")!;
        ShareModal.shareCurrentFilename =
            document.querySelector<HTMLSpanElement>("#share-current-filename")!;
        ShareModal.advancedOptions = document.querySelector<HTMLDetailsElement>(
            "#share-advanced-options"
        );
        ShareModal.advancedBtn = document.querySelector<HTMLButtonElement>(
            "#share-advanced-btn"
        );
        ShareModal.advancedBtnIcon =
            ShareModal.advancedBtn?.querySelector("svg");
        ShareModal.closer =
            document.querySelector<HTMLButtonElement>("#share-code-done")!;

        ShareModal.initEventListeners();
    }

    /**
     * Arm event listeners for the share modal
     */
    static initEventListeners() {
        // Advanced Options
        if (ShareModal.advancedBtn && ShareModal.advancedOptions) {
            ShareModal.advancedBtn.addEventListener("click", () => {
                ShareModal.advancedOptions!.open =
                    !ShareModal.advancedOptions!.open;
                if (ShareModal.advancedBtnIcon) {
                    ShareModal.advancedBtnIcon.classList.toggle(
                        "rotate-180",
                        ShareModal.advancedOptions!.open
                    );
                }
            });
        }

        // Scope: Current
        if (ShareModal.shareScopeCurrent) {
            ShareModal.shareScopeCurrent.addEventListener("click", () => {
                if (ShareModal.shareProjectFilesCheckbox.checked) {
                    ShareModal.shareProjectFilesCheckbox.checked = false;
                    ShareModal.shareProjectFilesCheckbox.dispatchEvent(
                        new Event("change")
                    );
                    ShareModal.updateScopeUI();
                }
            });
        }

        // Scope: All Project Files
        if (ShareModal.shareScopeAll) {
            ShareModal.shareScopeAll.addEventListener("click", () => {
                if (!ShareModal.shareProjectFilesCheckbox.checked) {
                    ShareModal.shareProjectFilesCheckbox.checked = true;
                    ShareModal.shareProjectFilesCheckbox.dispatchEvent(
                        new Event("change")
                    );
                    ShareModal.updateScopeUI();
                }
            });
        }

        // Disable share project files if there are no .ck files

        // Save form input values before closing the dialog
        ShareModal.shareModal.addEventListener("close", () => {
            sessionStorage.setItem(
                "share-file-url",
                ShareModal.shareFileUrlField.value
            );
            sessionStorage.setItem(
                "share-project-files",
                ShareModal.shareProjectFilesCheckbox.checked.toString()
            );
        });

        // Open Modal
        ShareModal.shareCodeButton.addEventListener("click", () => {
            ShareModal.shareModal.showModal();

            const urlParams = new URLSearchParams(window.location.search);
            const urlParamUrl = urlParams.get("url");

            if (sessionStorage.getItem("share-file-url") !== null) {
                ShareModal.shareFileUrlField.value =
                    sessionStorage.getItem("share-file-url") || "";
            } else if (urlParamUrl !== null) {
                ShareModal.shareFileUrlField.value = urlParamUrl;
            }

            if (sessionStorage.getItem("share-project-files") !== null) {
                ShareModal.shareProjectFilesCheckbox.checked =
                    sessionStorage.getItem("share-project-files") === "true";
            }

            if (ShareModal.advancedOptions) {
                ShareModal.advancedOptions.open =
                    ShareModal.shareFileUrlField.value !== "";
                if (ShareModal.advancedBtnIcon) {
                    ShareModal.advancedBtnIcon.classList.toggle(
                        "rotate-180",
                        ShareModal.advancedOptions.open
                    );
                }
            }

            const activeFile = ProjectSystem.getProjectFiles().find((f) =>
                f.isActive()
            );
            if (activeFile && ShareModal.shareCurrentFilename) {
                ShareModal.shareCurrentFilename.textContent =
                    activeFile.getFilename();
            }

            ShareModal.updateScopeUI();

            ShareModal.updateShareURL();
            ShareModal.shareCodeURLField.setSelectionRange(0, 0);
        });

        // Update URL on input
        ShareModal.shareFileUrlField.addEventListener("input", () => {
            ShareModal.updateShareURL();
        });

        ShareModal.shareProjectFilesCheckbox.addEventListener("change", () => {
            if (ShareModal.shareProjectFilesCheckbox.checked) {
                const projectFiles = ProjectSystem.getProjectFiles();
                if (projectFiles.some((f) => !f.isChuckFile())) {
                    alert(
                        "Note: Only ChucK files (.ck) are packaged into the project URL. Data files will be excluded."
                    );
                }
            }
            ShareModal.updateShareURL();
        });

        // Copy URL
        ShareModal.shareCodeCopyButton.addEventListener("click", async () => {
            ShareModal.shareCodeURLField.select();
            try {
                await navigator.clipboard.writeText(
                    ShareModal.shareCodeURLField.value
                );
            } catch {
                ShareModal.shareCodeURLField.select();
                document.execCommand("copy");
            }
            ShareModal.shareCodeURLField.setSelectionRange(0, 0);

            const originalHTML = ShareModal.shareCodeCopyButton.innerHTML;
            ShareModal.shareCodeCopyButton.innerHTML = `
            <svg class="-m-0.5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M4 12.6111L8.92308 17.5L20 6.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Copied!`;

            setTimeout(() => {
                ShareModal.shareCodeCopyButton.innerHTML = originalHTML;
            }, 2000);
        });

        // Close Modal
        ShareModal.closer.addEventListener("click", () => {
            ShareModal.shareModal.close();
        });

        ShareModal.shareModal.addEventListener("click", (e) => {
            if (e.target === ShareModal.shareModal) {
                ShareModal.shareModal.close();
            }
        });
    }

    /**
     * Updates scope UI based on scope selection
     */
    static updateScopeUI() {
        const multipleChuckFiles = ProjectSystem.numChuckFiles() > 1;

        if (multipleChuckFiles) {
            ShareModal.shareScopeAll.disabled = false;
            ShareModal.shareProjectFilesCheckbox.disabled = false;
        } else {
            // Only single file
            ShareModal.shareScopeAll.disabled = true;
            ShareModal.shareProjectFilesCheckbox.disabled = true;
        }

        if (
            multipleChuckFiles &&
            ShareModal.shareProjectFilesCheckbox.checked
        ) {
            ShareModal.shareScopeAll.classList.add("active");
            ShareModal.shareScopeCurrent.classList.remove("active");
        } else {
            ShareModal.shareScopeAll.classList.remove("active");
            ShareModal.shareScopeCurrent.classList.add("active");
        }
    }

    /**
     * Updates the share URL based on the selected file scope and file URL
     */
    static updateShareURL() {
        const urlParams: URLParams = {
            url: null,
            project: null,
            share: null,
            code: null,
        };
        let shareFiles: SharedFile[] = [];

        if (ShareModal.shareProjectFilesCheckbox.checked) {
            ProjectSystem.updateActiveFile(Editor.getEditorCode());
            const projectFiles: ProjectFile[] =
                ProjectSystem.getProjectFiles().filter((f) => f.isChuckFile());
            shareFiles = projectFiles.map((f) => ({
                name: f.getFilename(),
                data: f.getData() as string,
            }));
            urlParams.project = compressSharedFiles(shareFiles);
        } else {
            shareFiles = [
                {
                    name: Editor.getFileName(),
                    data: Editor.getEditorCode(),
                },
            ];
            urlParams.share = compressSharedFiles(shareFiles);
        }

        if (ShareModal.shareFileUrlField.value !== "") {
            urlParams.url = ShareModal.shareFileUrlField.value;
        }

        ShareModal.shareCodeURLField.value = generateURLFromParams(urlParams);
    }
}
