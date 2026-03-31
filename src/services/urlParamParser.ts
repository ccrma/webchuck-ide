/**
 * Interface for URL parameter parsing
 */
export interface URLParams {
    url: string | null; // A ck file or data file from external url
    project: string | null; // A pako compressed SharedFile[]
    share: string | null; // A pako compressed SharedFile[] (length 1)
    code: string | null; // Legacy: A ck file (string)
}

/**
 * Parse URL parameters and return a URLParams object
 * @returns URLParams object
 */
export function parseURLParams(): URLParams {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        url: urlParams.get("url"),
        project: urlParams.get("project"),
        share: urlParams.get("share"),
        code: urlParams.get("code"),
    }
}    

/**
 * Generate a URL from URLParams
 * @param params URLParams object
 * @returns URL string
 */
export function generateURLFromParams(params: URLParams): string {
    const url = new URL(window.location.href);
    url.search = "";
    if (params.url) {
        url.searchParams.append("url", params.url);
    }
    if (params.project) {
        url.searchParams.append("project", params.project);
    }
    if (params.share) {
        url.searchParams.append("share", params.share);
    }
    if (params.code) {
        url.searchParams.append("code", params.code);
    }
    return url.toString();
}
