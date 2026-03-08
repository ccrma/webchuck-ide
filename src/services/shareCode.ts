import Editor from "@/components/editor/monaco/editor";
import pako from "pako";

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
    let code = Editor.getEditorCode();
    console.log("code length:", code.length);

    // Compress if longer than 2000 characters
    if (code.length > 2000) {
        // LZ compression and then base64 encoding
        const input = new Uint8Array([...code].map((c) => c.charCodeAt(0)));
        const compressed = pako.deflate(input, { level: 9 });
        code = btoa(String.fromCharCode(...compressed));
        console.log("over 2000 characters, compressed to:", code.length);
    }

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
    shareCodeCopyButton.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(shareCodeURLField.value);
        } catch {
            shareCodeURLField.select();
            document.execCommand("copy");
        }
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
