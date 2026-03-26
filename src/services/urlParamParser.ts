import ProjectSystem, {
    loadChuckFileFromURL,
    loadDataFileFromURL,
} from "@/components/fileExplorer/projectSystem";
import { isPlaintextFile } from "@/utils/fileLoader";
import pako from "pako";

/**
 * Parse URL parameters:
 * - url=... : Load a file from url (ck file or data file)
 * - project=... : Load a project of ck files (pako compressed JSON array)
 * - share=... : Load a ck file (pako compressed string)
 * - code=... : Load a ck file (string)
 */
export function parseURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get("url");
    const projectCode = urlParams.get("project");
    const shareCode = urlParams.get("share");
    const code = urlParams.get("code");

    if (url) {
        if (isPlaintextFile(url)) {
            loadChuckFileFromURL(url);
        } else {
            loadDataFileFromURL(url);
        }
    }

    if (projectCode) {
        try {
            const decoded = atob(projectCode.replace(/ /g, "+"));
            const uncompressed = pako.inflate(
                new Uint8Array([...decoded].map((c) => c.charCodeAt(0)))
            );
            const decodedJSON = String.fromCharCode(...uncompressed);
            const files = JSON.parse(decodedJSON);
            if (Array.isArray(files)) {
                files.forEach((f: any) => ProjectSystem.addNewFile(f.name, f.data));
            }
        } catch (e) {
            console.error("Failed to parse project param", e);
        }
    } else if (shareCode) {
        try {
            // Try decode base64 compressed code
            const decoded = atob(shareCode.replace(/ /g, "+"));
            const uncompressed = pako.inflate(
                new Uint8Array([...decoded].map((c) => c.charCodeAt(0)))
            );
            const decodedCode = String.fromCharCode(...uncompressed);
            ProjectSystem.addNewFile("code.ck", decodedCode);
        } catch (e) {
            console.error("Failed to parse share param", e);
        }
    } else if (code) {
        ProjectSystem.addNewFile("code.ck", code);
    }
}
