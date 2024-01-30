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
     * Number of chuck files in the project
     * @returns the number of chuck files in the project
     */
    static numChuckFiles(): number {
        let size = 0;
        ProjectSystem.projectFiles.forEach((projectFile) => {
            if (projectFile.isChuckFile()) size++;
        });
        return size;
    }

    /**
     * Remove a file from the file explorer
     * @param filename file to remove
     */
    static removeFileFromExplorer(filename: string) {
        const wasActive = ProjectSystem.activeFile.isActive();

        ProjectSystem.projectFiles.delete(filename);

        if (ProjectSystem.numChuckFiles() === 0) {
            // must have at least one ck file
            ProjectSystem.addNewFile("untitled.ck", "");
        } else if (ProjectSystem.projectFiles.size === 0) {
            ProjectSystem.clearFileSystem();
            return;
        } else {
            if (wasActive) {
                ProjectSystem.setActiveFile(
                    ProjectSystem.projectFiles.values().next().value
                );
            }
        }
        ProjectSystem.updateFileExplorerUI();
    }

    /**
     * Update File Explorer UI with project files
     */
    static updateFileExplorerUI() {
        ProjectSystem.fileExplorer.innerHTML = "";

        ProjectSystem.projectFiles.forEach((projectFile) => {
            const fileEntry = document.createElement("div");
            fileEntry.className = "fileExplorerEntry";

            // File Info (icon + name)
            const fileItem = document.createElement("div");
            const filename = projectFile.getFilename();
            const fileExt = filename.split(".").pop()!;
            fileItem.className = "fileExplorerItem";
            fileItem.setAttribute("type", fileExt);
            fileItem.innerHTML += filename;
            // File Options
            const fileOptions = document.createElement("div");
            const deleteButton = document.createElement("button");
            fileOptions.className = "fileExplorerOptions hide";
            deleteButton.innerHTML = `<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/> </svg>`;
            fileOptions.appendChild(deleteButton);
            fileOptions.addEventListener("click", (e) => {
                e?.stopPropagation();
                ProjectSystem.removeFileFromExplorer(filename);
            });

            // Arm File Entry
            fileEntry.appendChild(fileItem);
            fileEntry.appendChild(fileOptions);
            if (projectFile.isActive()) {
                fileEntry.classList.add("active");
            }
            fileEntry.addEventListener("click", () => {
                ProjectSystem.setActiveFile(projectFile);
            });
            fileEntry.addEventListener("mouseover", () => {
                fileOptions.classList.remove("hide");
            });
            fileEntry.addEventListener("mouseout", () => {
                fileOptions.classList.add("hide");
            });
            ProjectSystem.fileExplorer.appendChild(fileEntry);
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
