import { loadExample } from "@/components/examples/examples";
import ProjectSystem from "@/components/fileExplorer/projectSystem";

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
        loadExample(url);
    } else if (code) {
        // Load the code string
        ProjectSystem.addNewFile("untitled.ck", code);
    }
}
