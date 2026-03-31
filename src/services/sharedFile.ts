import pako from "pako";

/**
 * Interface for a shared file, used for pako compression
 */
export interface SharedFile {
    name: string;
    data: string;
}

/**
 * Compress a SharedFile array into a compressed base64 string
 * @param fileData Array of SharedFile objects
 * @returns Base64 string
 */
export function compressSharedFile(fileData: SharedFile[]): string {
    const projectJSON = JSON.stringify(fileData);
    const input = new Uint8Array([...projectJSON].map((c) => c.charCodeAt(0)));
    let compressedPayload = "";
    try {
        const compressed = pako.deflate(input, { level: 9 });
        compressedPayload = btoa(String.fromCharCode(...compressed));
    } catch (e) {
        console.error("Failed to compress shared file for sharing", e);
        return "";
    }
    return compressedPayload;
}

/**
 * Decompress a compressed base64 string into a SharedFile array
 * @param compressedPayload Base64 string
 * @returns Array of SharedFile objects
 */
export function decompressSharedFile(compressedPayload: string): SharedFile[] {
    try {
        const decoded = atob(compressedPayload.replace(/ /g, "+"));
        const uncompressed = pako.inflate(
            new Uint8Array([...decoded].map((c) => c.charCodeAt(0)))
        );
        const decodedJSON = String.fromCharCode(...uncompressed);
        const files = JSON.parse(decodedJSON);
        return files;
    } catch (e) {
        console.error("Failed to decompress shared file", e);
        return [];
    }
}
