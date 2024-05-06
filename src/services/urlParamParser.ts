import ProjectSystem, {
    loadChuckFileFromURL,
} from "@/components/fileExplorer/projectSystem";
import pako from "pako";

/**
 * Parse URL parameters:
 * - code=... : Load code from URL
 * - url=... : Load chuck file from url string
 */
export function parseURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get("url");
    const code = urlParams.get("code");

    // Process params
    if (url) {
        // Load the chuck file
        loadChuckFileFromURL(url);
    } else if (code) {
        try {
            // Try decode base64 compressed code (long files)
            const decoded = atob(code);
            const uncompressed = pako.inflate(
                new Uint8Array([...decoded].map((c) => c.charCodeAt(0)))
            );
            const decoded_code = String.fromCharCode(...uncompressed);
            ProjectSystem.addNewFile("code.ck", decoded_code);
        } catch (e) {
            // Load the code string
            ProjectSystem.addNewFile("code.ck", code);
        }
    }
}
