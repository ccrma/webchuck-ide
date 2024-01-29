//--------------------------------------------------------------------
// title: Project System
// desc:  Logic Handling for Project File System
//
//
// author: terry feng
// date:   January 2024
//--------------------------------------------------------------------

import { theChuck } from "@/host";
import Editor from "./monaco/editor";
import Console from "./console";
import ProjectFile from "./projectFile";
import { isPlaintextFile } from "webchuck/dist/utils";

export default class ProjectSystem {
    public static newFileButton: HTMLButtonElement;
    public static newProjectButton: HTMLButtonElement;
    public static uploadFilesButton: HTMLButtonElement;
    private static fileUploader: HTMLInputElement;
    public static fileExplorer: HTMLDivElement;

    public static activeFile: ProjectFile;

    private static projectFiles: Map<string, ProjectFile>;

    constructor() {
        ProjectSystem.newFileButton =
            document.querySelector<HTMLButtonElement>("#newFile")!;
        ProjectSystem.newFileButton.addEventListener("click", () => {
            ProjectSystem.createNewFile();
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

        ProjectSystem.projectFiles = new Map();
    }

    /**
     * Create a new file and clear the editor
     */
    static createNewFile() {
        // Ask for new file name
        const filename = prompt("Enter new file name", "untitled.ck");
        if (filename === null) {
            return;
        }
        const newFile = new ProjectFile(filename, "");
        if (isPlaintextFile(filename)) {
            ProjectSystem.setActiveFile(newFile);
        }
        ProjectSystem.addFileToExplorer(newFile);
    }

    /**
     * Add new file to the file system
     * @param filename name of the file
     * @param data data of the file
     */
    static addNewFile(filename: string, data: string) {
        const newFile = new ProjectFile(filename, data);
        if (isPlaintextFile(filename)) {
            ProjectSystem.setActiveFile(newFile);
        }
        ProjectSystem.addFileToExplorer(newFile);
    }
    /**
     * Set a new file active in the editor
     * @param projectFile file to set as active
     */
    static setActiveFile(projectFile: ProjectFile) {
        if (projectFile.isPlaintextFile()) {
            ProjectSystem.activeFile?.unloadFile();
            ProjectSystem.activeFile = projectFile;
            ProjectSystem.activeFile.loadFile();
            this.updateFileExplorerUI();
        }
    }

    /**
     * TODO: abstract ProjectSystem to a class
     * UI update function to add a file to the file explorer
     * @param filename Add a file to the file explorer
     */
    static addFileToExplorer(projectFile: ProjectFile) {
        ProjectSystem.projectFiles.set(projectFile.getFilename(), projectFile);

        // sort files that end with .ck first
        const sortedFiles = Array.from(ProjectSystem.projectFiles).sort(
            (a, b) => {
                if (a[0].endsWith(".ck") && !b[0].endsWith(".ck")) {
                    return -1;
                } else if (!a[0].endsWith(".ck") && b[0].endsWith(".ck")) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
        ProjectSystem.projectFiles = new Map(sortedFiles);
        ProjectSystem.updateFileExplorerUI();
    }

    /**
     * Remove a file from the file explorer
     * @param filename file to remove
     */
    static removeFileFromExplorer(filename: string) {
        ProjectSystem.projectFiles.delete(filename);
        ProjectSystem.updateFileExplorerUI();
    }

    /**
     * Update File Explorer UI with project files
     */
    static updateFileExplorerUI() {
        ProjectSystem.fileExplorer.innerHTML = "";

        ProjectSystem.projectFiles.forEach((projectFile) => {
            const filename = projectFile.getFilename();
            const fileItem = document.createElement("div");
            const fileExt = filename.split(".").pop()!;
            fileItem.className = "fileExplorerItem";
            fileItem.setAttribute("type", fileExt);
            fileItem.innerHTML += filename;
            if (projectFile.isActive()) {
                fileItem.classList.add("active");
            }
            fileItem.addEventListener("click", () => {
                ProjectSystem.setActiveFile(projectFile);
            });
            ProjectSystem.fileExplorer.appendChild(fileItem);
        });
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
        // delete all files
        ProjectSystem.projectFiles.clear();
        const newFile = new ProjectFile("untitled.ck", "");
        ProjectSystem.setActiveFile(newFile);
        ProjectSystem.addFileToExplorer(newFile);
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
            const reader = new FileReader();
            if (file.name.endsWith(".ck")) {
                reader.onload = (e) => {
                    const data = e.target!.result as string;
                    Editor.setFileName(file.name);
                    Editor.setEditorCode(data);

                    // If chuck is already running, create file
                    if (theChuck !== undefined) {
                        Console.print("Loaded ChucK file: " + file.name);
                        theChuck.createFile("", file.name, data);
                        ProjectSystem.addNewFile(file.name, data);
                    } else {
                        // TODO: If chuck is not running, add file to preUploadFiles
                    }
                };
                reader.readAsText(file);
            } else {
                reader.onload = function (e) {
                    const data = new Uint8Array(
                        e.target!.result as ArrayBuffer
                    );

                    // If chuck is already running, create file
                    if (theChuck !== undefined) {
                        theChuck.createFile("", file.name, data);
                        Console.print("Loaded file: " + file.name);
                        ProjectSystem.addNewFile(file.name, "");
                    } else {
                        // TODO: If chuck is not running, add file to preUploadFiles
                    }
                };
                reader.readAsArrayBuffer(file);
            }
        }
    }
}
