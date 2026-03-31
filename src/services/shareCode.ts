import Editor from "@/components/editor/monaco/editor";
import ProjectSystem from "@/components/fileExplorer/projectSystem";
import pako from "pako";

/**
 * Generate a shareable URL
 * See `parseURLParams` for how to parse the URL
 */
export function getShareURL(
    shareProjectFiles: boolean,
    shareFileUrl: string
): string {
    const url = new URL(window.location.href);
    url.search = "";

    let fileData: SharedFile[] = [];

    if (shareProjectFiles) {
        // Update active file
        ProjectSystem.updateActiveFile(Editor.getEditorCode());

        const files = ProjectSystem.getProjectFiles().filter((f) =>
            f.isChuckFile()
        );
        fileData = files.map((file) => ({
            name: file.getFilename(),
            data: file.getData() as string,
        }));
    } else {
        // Single File Share
        fileData = [
            {
                name: Editor.getFileName(),
                data: Editor.getEditorCode(),
            },
        ];
    }

    const projectJSON = JSON.stringify(fileData);
    const input = new Uint8Array([...projectJSON].map((c) => c.charCodeAt(0)));
    let compressedPayload = "";
    try {
        const compressed = pako.deflate(input, { level: 9 });
        compressedPayload = btoa(String.fromCharCode(...compressed));
    } catch (e) {
        console.error("Failed to compress project files for sharing", e);
        return url.toString();
    }

    url.searchParams.append("project", compressedPayload);

    if (shareFileUrl) {
        url.searchParams.append("url", shareFileUrl);
    }

    return url.toString();
}
