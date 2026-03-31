import Console from "@/components/outputPanel/console";
import ProjectSystem, {
    loadChuckFileFromURL,
    loadDataFileFromURL,
} from "@/components/fileExplorer/projectSystem";
import { parseURLParams, URLParams } from "./urlParamParser";
import { isPlaintextFile } from "webchuck/dist/utils";
import { SharedFile, decompressSharedFiles } from "./sharedFile";

/**
 * Handle IDE project startup sequence, loading files into the project system.
 * This will load files from URL params, local storage autosave, or fallback to
 * the default project.
 *
 * Flow:
 * 1. Chuck files via URL param (share, project, code)
 * 2. External chuck or data file via (url) param
 * 3. ChucK auto-save via Local Storage
 * 4. Default new project
 */
export function initProjectStartup() {
    const params: URLParams = parseURLParams();
    const files: SharedFile[] = [];

    if (params.share) {
        files.push(...decompressSharedFiles(params.share));
    }
    if (params.project) {
        files.push(...decompressSharedFiles(params.project));
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
            Console.print(
                `loaded project file: \x1b[38;2;34;178;254m${f.name}\x1b[0m`
            );
            ProjectSystem.addNewFile(f.name, f.data);
        });
    } else {
        // 3. & 4. Load Autosave or Default
        ProjectSystem.loadAutoSaveOrDefault();
    }
}
