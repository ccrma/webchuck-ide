import Editor from "@/components/editor/monaco/editor";
import { parseURLParams } from "./urlParamParser";
import ProjectSystem, { loadChuckFileFromURL, loadDataFileFromURL } from "@/components/fileExplorer/projectSystem";
import Console from "@/components/outputPanel/console";
import { isPlaintextFile } from "webchuck/dist/utils";
import { SharedFile, decompressSharedFile } from "./sharedFile";

/**
 * Handle IDE startup sequence, namely project loading and URL parsing
 * Flow:
 * 1. URL parameters (share, project, code)
 * 2. URL parameter (url)
 * 3. Local Storage (Last auto-save)
 * 4. Default Fallback
 */
export function initStartup() {
    const params = parseURLParams();
    const files: SharedFile[] = [];

    if (params.share) {
        files.push(...decompressSharedFile(params.share));
    }
    if (params.project) {
        files.push(...decompressSharedFile(params.project));
    }
    if (params.code) {
        files.push({ name: "code.ck", data: params.code });
    }

    if (params.url) {
        if (isPlaintextFile(params.url)) {
            loadChuckFileFromURL(params.url);
        } else {
            loadDataFileFromURL(params.url);
        }
    }

    if (files.length > 0) {
        // 1. & 2. Load project from URL parameters
        ProjectSystem.clearFileSystem();
        files.forEach((f: SharedFile) => {
            Console.print(`loaded project file: \x1b[38;2;34;178;254m${f.name}\x1b[0m`);
            ProjectSystem.addNewFile(f.name, f.data)
        });
    } else {
        // 3. & 4. Load Autosave or Default
        Editor.loadAutoSaveOrDefault();
    }
}
