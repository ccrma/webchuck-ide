//------------------------------------------------------------------
// title: Project File
// desc:  Logic handling for Project Files
//
// author: terry Feng
// date:   January 2024
//------------------------------------------------------------------

import { isPlaintextFile } from "@/utils/fileLoader";
import Editor from "@/components/editor/monaco/editor";

export default class ProjectFile {
    private filename: string;
    private data: string | Uint8Array;
    private isCk: boolean;
    private isPlaintext: boolean;
    private active: boolean;

    constructor(filename: string, data: string | Uint8Array) {
        this.filename = filename;
        this.data = data;
        this.active = false;
        this.isCk = filename.endsWith(".ck");
        this.isPlaintext = isPlaintextFile(filename);
    }
    loadFile() {
        if (!this.active && this.isPlaintext) {
            Editor.setFileName(this.filename);
            Editor.setEditorCode(this.data as string);
            this.active = true;
        }
    }
    unloadFile() {
        if (this.active) {
            this.data = Editor.getEditorCode();
            this.active = false;
        }
    }
    // Getters and Setters
    getFilename(): string {
        return this.filename;
    }
    getData(): string | Uint8Array {
        return this.data;
    }
    setData(data: string) {
        this.data = data;
    }
    isActive(): boolean {
        return this.active;
    }
    setActive(active: boolean) {
        this.active = active;
    }
    isChuckFile(): boolean {
        return this.isCk;
    }
    isPlaintextFile(): boolean {
        return this.isPlaintext;
    }
}
