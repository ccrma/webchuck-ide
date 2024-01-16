//--------------------------------------------------------------------
// title: File System
// desc:  Logic Handling for File System
//
//
// author: terry feng
// date:   January 2024
//--------------------------------------------------------------------

import { theChuck } from "@/host";
import Editor from "./monaco/editor";
import Console from "./console";

export default class ProjectSystem {
    public static newFileButton: HTMLButtonElement;
    public static newProjectButton: HTMLButtonElement;
    public static uploadFilesButton: HTMLButtonElement;
    private static fileUploader: HTMLInputElement;
    public static fileExplorer: HTMLDivElement;

    constructor() {
        ProjectSystem.newFileButton =
            document.querySelector<HTMLButtonElement>("#newFile")!;
        ProjectSystem.newFileButton.addEventListener("click", () => {
            ProjectSystem.newFile();
        });

        ProjectSystem.fileUploader =
            document.querySelector<HTMLInputElement>("#fileUploader")!;
        ProjectSystem.uploadFilesButton =
            document.querySelector<HTMLButtonElement>("#uploadFiles")!;
        ProjectSystem.uploadFilesButton.addEventListener("click", () => {
            ProjectSystem.fileUploader.click();
        });
        ProjectSystem.fileUploader.addEventListener(
            "change",
            (event) => {
                ProjectSystem.uploadFiles(event);
            },
            false
        );

        ProjectSystem.newProjectButton =
            document.querySelector<HTMLButtonElement>("#newProject")!;
        ProjectSystem.newProjectButton.addEventListener("click", () => {
            ProjectSystem.newProject();
        });

        ProjectSystem.fileExplorer =
            document.querySelector<HTMLDivElement>("#fileExplorer")!;
    }

    /**
     * Create a new file and clear the editor
     */
    static newFile() {
        // Ask for new file name
        const filename = prompt("Enter new file name", "untitled.ck");
        if (filename === null) {
            return;
        }
        Editor.setFileName(filename);
        Editor.setEditorCode("");
        ProjectSystem.addFileToExplorer(filename);
    }

    /**
     * TODO: abstract this to a class
     * UI update function to add a file to the file explorer
     * @param filename Add a file to the file explorer
     */
    static addFileToExplorer(filename: string) {
        const fileItem = document.createElement("div");
        const fileExt = filename.split(".").pop()!;
        fileItem.className = "fileExplorerItem";
        fileItem.setAttribute("type", fileExt);

        fileItem.innerHTML += filename;
        console.log(filename);

        ProjectSystem.fileExplorer.appendChild(fileItem);
    }

    /**
     * Create a new project and clear the file system
     * Warn that current project will be lost
     */
    static newProject() {
        // Warn that current project will be lost
        if (
            confirm("Create a new project? You will lose your current files.")
        ) {
            ProjectSystem.clearFileSystem();
        }
    }

    /**
     * Clear the file system
     */
    static clearFileSystem() {
        // Clear the file system
        Editor.setEditorCode("");
        Editor.setFileName("untitled.ck");
    }

    /**
     * Upload files to the file system
     */
    static uploadFiles(event: Event) {
        // Handle multiple files uploaded
        const fileList: FileList | null = (event.target as HTMLInputElement)
            .files;
        if (fileList === null) {
            return;
        }

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            var reader = new FileReader();
            if (file.name.endsWith(".ck")) {
                reader.onload = (e) => {
                    const data = e.target!.result as string;
                    Editor.setFileName(file.name);
                    Editor.setEditorCode(data);

                    // If chuck is already running, create file
                    if (theChuck !== undefined) {
                        Console.print("Loaded ChucK file: " + file.name);
                        theChuck.createFile("", file.name, data);
                        ProjectSystem.addFileToExplorer(file.name);
                    } else {
                        // TODO: If chuck is not running, add file to preUploadFiles
                    }
                };
                reader.readAsText(file);
            } else {
                reader.onload = function (e) {
                    var data = new Uint8Array(e.target!.result as ArrayBuffer);

                    // If chuck is already running, create file
                    if (theChuck !== undefined) {
                        theChuck.createFile("", file.name, data);
                        Console.print("Loaded file: " + file.name);
                        ProjectSystem.addFileToExplorer(file.name);
                    } else {
                        // TODO: If chuck is not running, add file to preUploadFiles
                    }
                };
                reader.readAsArrayBuffer(file);
            }
        }
    }
}
