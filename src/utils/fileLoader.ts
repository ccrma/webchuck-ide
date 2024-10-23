//-------------------------------------------------
// title: FileLoader
// desc:  Fetching and loading files into IDE
//
// author: terry feng
// date:   September 2023
//-------------------------------------------------

export interface File {
    name: string;
    data: string | Uint8Array;
}

/**
 * Load a text file, can be a .ck file or a generic plaintext file
 * @param url
 */
export async function fetchTextFile(url: string): Promise<File> {
    const filename = url.split("/").pop()!;
    const response = await fetch(url);
    const text = await response.text();
    return { name: filename, data: text };
}

/**
 * Load a binary file, good for loading wav files
 */
export async function fetchDataFile(url: string): Promise<File | null> {
    // const fileName = url.split('/').pop();
    // let response = await fetch(url)
    // let blob = await response.blob();
    // let data = new Uint8Array(await blob.arrayBuffer());
    // return { name: fileName!, data: data};

    let file: File | null = null;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load file: ${url}`);
        }
        const buffer = await response.arrayBuffer();
        file = {
            name: url.split("/").pop()!, // file name
            data: new Uint8Array(buffer), // file data
        };
    } catch (error) {
        console.error(error);
    }

    return file;
}
