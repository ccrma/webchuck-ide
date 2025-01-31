//--------------------------------------------------------------------
// title: Project System
// desc:  Logic Handling for Project File System
//
//
// author: terry feng
// date:   January 2024
//--------------------------------------------------------------------

import { theChuck } from "@/host";
import { isPlaintextFile } from "webchuck/dist/utils";
import {
    File as FileData,
    fetchDataFile,
    fetchTextFile,
} from "@/utils/fileLoader";
import Console from "../outputPanel/console";
import ProjectFile from "./projectFile";
import SessionManager from "../session/sessionManager";

// Currently, we cannot upload files larger than 10MB due to FastAPI
// implementation's limitation (files are stored in memory only)
// TODO: Implement chunked file upload after FastAPI supports it
const MAX_FILE_SIZE = 10 * 1024 * 1024 - 1; // 10MB in bytes

export default class ProjectSystem {
    public static newFileButton: HTMLButtonElement;
    public static newProjectButton: HTMLButtonElement;
    public static uploadFilesButton: HTMLButtonElement;
    public static fileExplorerContainer: HTMLDivElement;
    public static fileExplorer: HTMLDivElement;
    public static fileExplorerUploadPrompt: HTMLDivElement;
    public static activeFile: ProjectFile;

    private static projectFiles: Map<string, ProjectFile>;
    private static fileUploader: HTMLInputElement;

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
            () => {
                ProjectSystem.uploadFiles(ProjectSystem.fileUploader.files);
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
        ProjectSystem.fileExplorerContainer =
            document.querySelector<HTMLDivElement>("#fileExplorerContainer")!;
        ProjectSystem.fileExplorerUploadPrompt =
            document.querySelector<HTMLDivElement>(
                "#fileExplorerUploadPrompt"
            )!;

        ProjectSystem.projectFiles = new Map();
    }

    static size(): number {
        return ProjectSystem.projectFiles.size;
    }

    /**
     * Create a new file and clear the editor
     */
    static createNewFile() {
        // Ask for new file name
        let filename: string | null = prompt(
            "Enter new file name",
            "untitled.ck"
        );
        if (filename === null || filename === "") {
            return;
        }
        if (ProjectSystem.projectFiles.has(filename)) {
            Console.print(`${filename} already exists`);
            return;
        }
        filename = filename.endsWith(".ck") ? filename : filename + ".ck";
        const newFile = new ProjectFile(filename, "");
        if (newFile.isChuckFile()) {
            ProjectSystem.setActiveFile(newFile);
        }
        ProjectSystem.addFileToExplorer(newFile);
        SessionManager.addFile(newFile);
    }

    /**
     * Add new file to the file system
     * @param filename name of the file
     * @param data data of the file
     */
    static addNewFile(
        filename: string,
        data: string | Uint8Array,
        setActive: boolean = true,
        synchronize: boolean = true
    ) {
        const newFile = new ProjectFile(filename, data);
        theChuck?.createFile("", filename, data);

        if (isPlaintextFile(filename) && setActive) {
            ProjectSystem.setActiveFile(newFile);
        }

        ProjectSystem.addFileToExplorer(newFile);

        if (synchronize) {
            SessionManager.addFile(newFile);
        }
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
            SessionManager.setActiveFile();
        }
    }

    /**
     * Update the active file in the editor
     * @param data data to update the active file with
     */
    static updateActiveFile(data: string) {
        ProjectSystem.activeFile.setData(data);
    }

    /**
     * Add a file to the file explorer UI in the IDE
     * @param projectFile
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
        return Array.from(ProjectSystem.projectFiles.values()).reduce(
            (a, v) => (v.isChuckFile() ? a + 1 : a),
            0
        );
    }

    /**
     * Remove a file from the file explorer
     * @param filename file to remove
     */
    static removeFileFromExplorer(
        filename: string,
        synchronize: boolean = true
    ) {
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
                    ProjectSystem.projectFiles.values().next().value!
                );
            }
        }
        ProjectSystem.updateFileExplorerUI();

        if (synchronize) {
            SessionManager.removeFile(filename);
        }
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
            deleteButton.className = "fileEntryDelete";
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
    static clearFileSystem(createDefaultFile: boolean = true) {
        // delete all files
        ProjectSystem.projectFiles.clear();
        ProjectSystem.fileUploader.value = "";
        if (createDefaultFile) {
            const newFile = new ProjectFile("untitled.ck", "");
            ProjectSystem.setActiveFile(newFile);
            ProjectSystem.addFileToExplorer(newFile);
        }
        SessionManager.clearProject();
    }

    /**
     * Upload files to the file system
     */
    static uploadFiles(files: FileList | null) {
        // Handle multiple files uploaded
        const fileList: FileList | null = files;
        if (fileList === null || fileList.length === 0) {
            return;
        }

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.size > MAX_FILE_SIZE) {
                alert(
                    `File "${file.name}" is too large. Currently, max file size is 10MB (will be increased in the future).`
                );
                continue;
            }
            const reader = new FileReader();
            if (isPlaintextFile(file.name)) {
                reader.onload = (e) => {
                    const data = e.target!.result as string;

                    // If chuck is already running, create file
                    if (theChuck !== undefined) {
                        if (file.name.endsWith(".ck")) {
                            Console.print("loaded ChucK file: " + file.name);
                        } else {
                            Console.print("loaded file: " + file.name);
                        }
                        ProjectSystem.addNewFile(file.name, data);
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
                        Console.print("loaded file: " + file.name);
                        ProjectSystem.addNewFile(file.name, data);
                    }
                };
                reader.readAsArrayBuffer(file);
            }
        }
    }

    /**
     * Get the project files
     * @returns the project files
     */
    static getProjectFiles(): ProjectFile[] {
        return Array.from(ProjectSystem.projectFiles.values());
    }

    /**
     * Get the project files in its original map format
     * @returns the project files
     */
    static getProjectFileMap(): Map<string, ProjectFile> {
        return ProjectSystem.projectFiles;
    }

    /**
     * Initialize drag and drop upload support
     */
    static initDragUpload() {
        ProjectSystem.fileExplorerContainer.addEventListener(
            "dragover",
            (e) => {
                e.preventDefault();
                ProjectSystem.fileExplorerUploadPrompt.classList.replace(
                    "opacity-0",
                    "opacity-100"
                );
            }
        );
        // end drag
        ProjectSystem.fileExplorerContainer.addEventListener(
            "dragleave",
            (e) => {
                e.preventDefault();
                ProjectSystem.fileExplorerUploadPrompt.classList.replace(
                    "opacity-100",
                    "opacity-0"
                );
            }
        );
        ProjectSystem.fileExplorerContainer.addEventListener("dragend", (e) => {
            e.preventDefault();
            ProjectSystem.fileExplorerUploadPrompt.classList.replace(
                "opacity-100",
                "opacity-0"
            );
        });
        // drop
        ProjectSystem.fileExplorerContainer.addEventListener("drop", (e) => {
            e.preventDefault();
            ProjectSystem.dragUploadFiles(e);
            ProjectSystem.fileExplorerUploadPrompt.classList.replace(
                "opacity-100",
                "opacity-0"
            );
        });
    }

    /**
     * Upload files to the file system via drag and drop
     * @param event file drag event
     */
    static dragUploadFiles(event: DragEvent) {
        if (event.dataTransfer?.files.length === 0) {
            return;
        }

        let fileList: File[];

        // Populate fileList with files from event
        if (event.dataTransfer?.items) {
            // event.dataTransfer.items only supported by Chrome
            fileList = Array.from(event.dataTransfer?.items)
                .map((item) => {
                    if (item.kind === "file") {
                        return item.getAsFile();
                    }
                    return null;
                })
                .filter((file): file is File => file !== null);
        } else {
            fileList = Array.from(event.dataTransfer!.files);
        }

        // Loop through the FileList and load files into IDE/ChucK
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.size > MAX_FILE_SIZE) {
                alert(
                    `File "${file.name}" is too large. Currently, max file size is 10MB (will be increased in the future).`
                );
                continue;
            }
            const reader = new FileReader();
            if (isPlaintextFile(file.name)) {
                reader.onload = (e) => {
                    const data = e.target!.result as string;
                    if (file.name.endsWith(".ck")) {
                        Console.print("loaded ChucK file: " + file.name);
                    } else {
                        Console.print("loaded file: " + file.name);
                    }
                    ProjectSystem.addNewFile(file.name, data as string);
                };
                reader.readAsText(file);
            } else {
                reader.onload = function (e) {
                    const data = new Uint8Array(
                        e.target!.result as ArrayBuffer
                    );
                    Console.print("loaded file: " + file.name);
                    ProjectSystem.addNewFile(file.name, data as Uint8Array);
                };
                reader.readAsArrayBuffer(file);
            }
        }
    }
}

//----------------------------------------
// Helper Functions
//----------------------------------------
/**
 * Load a chuck file from a url
 * @param url url to fetch example from
 */
export async function loadChuckFileFromURL(url: string) {
    const chuckFile: FileData = await fetchTextFile(url);
    ProjectSystem.addNewFile(chuckFile.name, chuckFile.data as string);
    Console.print(`loaded ChucK file: ${chuckFile.name}`);
}

/**
 * Load a data file from a url
 * @param url url to data file
 */
export async function loadDataFileFromURL(url: string) {
    const dataFile: FileData | null = await fetchDataFile(url);
    if (dataFile !== null) {
        ProjectSystem.addNewFile(dataFile.name, dataFile.data as Uint8Array);
        Console.print(`loaded file: ${dataFile.name}`);
    }
}
