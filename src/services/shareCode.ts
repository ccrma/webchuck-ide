import Editor from "@/components/monaco/editor";

const shareCodeButton =
    document.querySelector<HTMLButtonElement>("#shareCode")!;

const shareModal =
    document.querySelector<HTMLDialogElement>("#share-code-modal")!;
const shareCodeURLField =
    document.querySelector<HTMLInputElement>("#share-code-url")!;
const shareCodeCopyButton =
    document.querySelector<HTMLButtonElement>("#share-code-copy")!;
const shareModalClose =
    document.querySelector<HTMLButtonElement>("#share-code-close")!;

/**
 * Share code as a URL
 */
function getShareURL(): string {
    const code = Editor.getEditorCode();
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.append("code", code);
    return url.toString();
}

/**
 * Initialize share code functionality
 */
export function initShareCode() {
    // Open Modal
    shareCodeButton.addEventListener("click", () => {
        shareModal.showModal();
        shareCodeURLField.value = getShareURL();
        shareCodeURLField.setSelectionRange(0, 0);
    });

    // Copy URL
    shareCodeCopyButton.addEventListener("click", () => {
        // copy to clipboard
        shareCodeURLField.select();
        document.execCommand("copy");
        shareCodeURLField.setSelectionRange(0, 0);

        shareCodeCopyButton.textContent = "Copied!";
        setTimeout(() => {
            shareCodeCopyButton.textContent = "Copy";
        }, 2000);
    });

    // Close Modal
    shareModalClose.addEventListener("click", () => {
        shareModal.close();
    });

    shareModal.addEventListener("click", (e) => {
        if (e.target === shareModal) {
            shareModal.close();
        }
    });
}
