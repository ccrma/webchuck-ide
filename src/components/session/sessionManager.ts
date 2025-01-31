import ChuckBar from "../chuckBar/chuckBar";
import DiffMatchPatch from "diff-match-patch";
import Editor from "@/components/editor/monaco/editor";
import ProjectFile from "../fileExplorer/projectFile";
import ProjectSystem from "@/components/fileExplorer/projectSystem";
import * as SessionTypes from "@components/session/sessionTypes";
import SessionSystem from "./sessionSystem";

import { monaco } from "@components/editor/monaco/monacoLite";
import { Mutex } from "async-mutex";

// Constants
const WS_PROCOTOL = "wss://";
const HTTP_PROTOCOL = "https://";
const API_URL = "cochuck.stuartsul.com/api/"; // TODO: set to a permanent URL
// const WS_PROCOTOL = "ws://";
// const HTTP_PROTOCOL = "http://";
// const API_URL = "localhost:8000/";
const WEBSOCKET_PATH = "websocket";
const SYNC_PATH = "sync";
const FILE_PATH = "file";
const PROJECT_CLEAR_PATH = "clear-project";
const BROADCAST_PATH = "broadcast";
const dmp = new DiffMatchPatch();
const SYNC_INTERVAL = 1000; // 1 second
const USER_CIRCLE_TOL = 60000; // 60 seconds
const USER_CURSOR_TOL = 30000; // 30 seconds
const USER_POPUP_TOL = 5000; // 5 seconds

export default class SessionManager {
    // Members
    private mutex = new Mutex();

    public userId!: string;
    public sessionId!: string;
    public static currentSession: SessionManager | undefined;
    public static lastSessionErrorMsg: string;

    private ws!: WebSocket;
    private syncEnabled: boolean = false;
    private syncTimeoutId: number | undefined;

    private sessionGroundtruth: SessionTypes.SessionGroundTruth | null = null;

    private globalUserCircles = new Map<string, HTMLDivElement>();
    private static globalUserCirclesDiv: HTMLDivElement =
        document.querySelector<HTMLDivElement>("#global-user-circles")!;

    private localUserCircles = new Map<string, HTMLDivElement>();
    private static localUserCirclesDiv: HTMLDivElement =
        document.querySelector<HTMLDivElement>("#local-user-circles")!;

    private localUserCursors = new Map<
        string,
        monaco.editor.IEditorDecorationsCollection
    >();
    private localUserPopupWidgets = new Map<
        string,
        monaco.editor.IContentWidget
    >();

    public static userColors: string[] = [
        "red",
        "green",
        "blue",
        "pink",
        "yellow",
        "cyan",
        "purple",
        "forest",
    ];

    private constructor(userId: string, sessionId: string) {
        this.userId = userId;
        this.sessionId = sessionId;
    }

    static async open(userId: string, sessionId: string | null = null) {
        SessionManager.lastSessionErrorMsg = "";

        const newSession = new SessionManager(
            userId,
            sessionId ?? SessionManager.generateSessionId()
        );

        if (SessionManager.currentSession)
            SessionManager.currentSession.close();

        try {
            if (sessionId) {
                // Specifying a session ID indicates joining an existing session
                await newSession.joinSession();
            } else {
                await newSession.createSession();
            }
            newSession.openWebSocket();
        } catch (error) {
            newSession.close();
            console.error("Error initializing SessionManager:", error);
            return;
        }

        SessionManager.currentSession = newSession;
        newSession.startSync();

        if (ChuckBar.running) {
            ChuckBar.broadcastPlayButton.disabled = false;
            ChuckBar.broadcastRemoveButton.disabled = false;
        }
    }

    private openWebSocket() {
        try {
            // Initialize WebSocket connection
            this.ws = new WebSocket(
                WS_PROCOTOL +
                    API_URL +
                    WEBSOCKET_PATH +
                    `?sessionId=${this.sessionId}` +
                    `&userId=${this.userId}`
            );
            this.ws.binaryType = "arraybuffer";

            this.ws.addEventListener("open", () => {
                console.log("INFO: WebSocket connected");
            });

            this.ws.addEventListener("error", (error) => {
                console.error("ERROR: Failed to create websocket.", error);
            });

            this.ws.addEventListener("message", (event) =>
                this.handleWebSocketMessage(event)
            );

            window.addEventListener("beforeunload", () => {
                if (this.ws) {
                    this.ws.close();
                }
            });
        } catch (error) {
            SessionManager.lastSessionErrorMsg =
                "Failed to join session: couldn't establish WebSocket connection.";
            throw `WebSocket error during session sync.`;
        }
    }

    private async handleWebSocketMessage(event: MessageEvent) {
        try {
            if (typeof event.data === "string") {
                const data = JSON.parse(event.data);

                if (data.type == "ping") {
                    console.log("INFO: Received ping from websocket server.");
                    this.ws.send(
                        JSON.stringify({
                            type: "pong",
                            clientTime: performance.now() / 1000,
                        })
                    );
                } else if (data.type == "play") {
                    const projectFiles = ProjectSystem.getProjectFileMap();
                    if (
                        !ChuckBar.running ||
                        !projectFiles.has(data.filename) ||
                        !projectFiles.get(data.filename)?.isChuckFile
                    )
                        return;

                    const code = projectFiles
                        .get(data.filename)
                        ?.getData() as string;
                    runAtTargetTime(data.targetTime * 1000, () =>
                        ChuckBar.runCode(code)
                    );
                } else if (data.type == "remove") {
                    if (!ChuckBar.running) return;

                    ChuckBar.removeCode();
                } else {
                    console.warn("WARNING: Unhandled message type:", data);
                }
            } else {
                console.warn("WARNING: Unhandled message type:", event.data);
            }
        } catch (error) {
            console.error("ERROR: Failed to process WebSocket message.", error);
        }
    }

    close() {
        this.userId = "";
        this.sessionId = "";

        this.stopSync();
        this.sessionGroundtruth = null;

        SessionManager.globalUserCirclesDiv.innerHTML = "";
        SessionManager.localUserCirclesDiv.innerHTML = "";

        for (const userId of this.localUserCursors.keys()) {
            this.removeRemoteCursor(userId);
        }

        for (const userId of this.localUserPopupWidgets.keys()) {
            this.removeRemoteUserPopup(userId);
        }

        if (this.ws) {
            this.ws.close();
        }

        ChuckBar.broadcastPlayButton.disabled = true;
        ChuckBar.broadcastRemoveButton.disabled = true;
    }

    static generateSessionId() {
        const randomNum = Math.random() * Number.MAX_SAFE_INTEGER;
        return randomNum.toString(36).toUpperCase().slice(0, 8);
    }

    static generateUserColor(userId: string) {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash ^= userId.charCodeAt(i);
        }
        const colorNum = hash & 7; // Efficient modulo 8 using bitwise AND
        return SessionManager.userColors[
            colorNum % SessionManager.userColors.length
        ];
    }

    startSync() {
        this.syncEnabled = true;
        this.syncSession();
    }

    stopSync() {
        this.syncEnabled = false;
        clearTimeout(this.syncTimeoutId);
        this.syncTimeoutId = undefined;
    }

    static handleEditorKeyboardInput() {
        if (
            !SessionManager.currentSession ||
            !SessionManager.currentSession.syncEnabled ||
            !SessionManager.currentSession.syncTimeoutId
        )
            return;

        clearTimeout(SessionManager.currentSession.syncTimeoutId);
        SessionManager.currentSession.syncTimeoutId = setTimeout(
            () => SessionManager.currentSession?.syncSession(),
            SYNC_INTERVAL
        );

        if (SessionManager.currentSession.localUserPopupWidgets.size > 0) {
            for (const userId of SessionManager.currentSession.localUserPopupWidgets.keys()) {
                SessionManager.currentSession.removeRemoteUserPopup(userId);
            }
        }
    }

    async sendSyncRequest(
        syncBody:
            | SessionTypes.SessionCreateReq
            | SessionTypes.SessionJoinReq
            | SessionTypes.SessionSyncReq
    ): Promise<{
        ok: boolean;
        status: number;
        groundtruth: SessionTypes.SessionGroundTruth | undefined;
    }> {
        try {
            const response = await fetch(
                HTTP_PROTOCOL +
                    API_URL +
                    SYNC_PATH +
                    `?sessionId=${this.sessionId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(syncBody),
                }
            );

            let body: SessionTypes.SessionSyncResp | null = null;
            if (response.ok) {
                body = await response.json();
            } else {
                throw `HTTP error during session sync. Status: ${response.status}, ${response.statusText}`;
            }

            return {
                ok: response.ok,
                status: response.status,
                groundtruth: body?.["groundtruth"],
            };
        } catch (error) {
            console.error(error);
            alert(
                "Unable to connect to the server. Closing the current session."
            );
            SessionSystem.closeCurrentSessionButtonClick();
            return {
                ok: false,
                status: -1,
                groundtruth: undefined,
            };
        }
    }

    async createSession() {
        const position = Editor.getPosition();
        const filename = Editor.getFileName();
        const files: { [key: string]: SessionTypes.SessionFile } = {};
        const currentFiles = ProjectSystem.getProjectFileMap();

        for (const filename of currentFiles.keys()) {
            files[filename] = { filename: filename, code: null };

            const file = currentFiles.get(filename);
            if (file?.isPlaintextFile()) {
                files[filename].code = file.getData() as string;
            }
        }

        const response = await this.sendSyncRequest({
            type: "create",
            userId: this.userId,
            userColor: SessionManager.generateUserColor(this.userId),
            sessionId: this.sessionId,
            files: files,
            filename: filename,
            lineNumber: position?.lineNumber ?? 1,
            column: position?.column ?? 1,
        });

        if (!response.ok) {
            throw `HTTP error during session sync. Status: ${response.status}`;
        }

        await this.setSessionGroundtruth(response.groundtruth!);
    }

    async joinSession() {
        const response = await this.sendSyncRequest({
            type: "join",
            sessionId: this.sessionId,
            userId: this.userId,
            userColor: SessionManager.generateUserColor(this.userId),
        });

        if (!response.ok) {
            if (response.status === 409) {
                SessionManager.lastSessionErrorMsg =
                    "Failed to join session: username already exists.";
            } else if (response.status === 429) {
                SessionManager.lastSessionErrorMsg =
                    "Failed to join session: too many users in the session.";
            }
            throw `HTTP error during session sync. Status: ${response.status}`;
        }

        // Clear file system
        ProjectSystem.clearFileSystem(false);

        // Update groundtruth
        this.sessionGroundtruth = response.groundtruth!;

        // Add session files
        const groundtruthFiles = this.sessionGroundtruth!.files;
        for (const filename in groundtruthFiles) {
            if (typeof groundtruthFiles[filename].code === "string") {
                ProjectSystem.addNewFile(
                    filename,
                    groundtruthFiles[filename].code!,
                    false,
                    false
                );
            } else {
                const fileData = await this.getfile(filename);
                if (fileData) {
                    ProjectSystem.addNewFile(filename, fileData, false, false);
                }
            }
        }

        // Set first chuck/plaintext file as active file (try chuck files first)
        const currentFiles = ProjectSystem.getProjectFileMap();
        for (const filename of currentFiles.keys()) {
            if (currentFiles.get(filename)?.isChuckFile()) {
                ProjectSystem.setActiveFile(currentFiles.get(filename)!);
                return;
            }
        }
        for (const filename of currentFiles.keys()) {
            if (currentFiles.get(filename)?.isPlaintextFile()) {
                ProjectSystem.setActiveFile(currentFiles.get(filename)!);
                return;
            }
        }

        // Sync session user info (presence, location, and cursors)
        this.syncSessionUsers();
    }

    async syncSession() {
        await this.mutex.runExclusive(async () => await this._syncSession());
    }

    private async _syncSession() {
        if (!this.syncEnabled) return;

        try {
            const position = Editor.getPosition();
            const filename = Editor.getFileName();
            const currentCode = Editor.getEditorCode();
            let patches_serialized = "";

            if (!this.sessionGroundtruth!.files[filename]) {
                this.sessionGroundtruth!.files[filename] = {
                    filename: filename,
                    code: "", // The server also assumes patch on empty string if file doesn't exist
                };
            }

            if (
                this.sessionGroundtruth!.files[filename]["code"] !== currentCode
            ) {
                const patches = dmp.patch_make(
                    this.sessionGroundtruth!.files[filename]["code"]!,
                    currentCode
                );
                patches_serialized = dmp.patch_toText(patches);
            }

            const response = await this.sendSyncRequest({
                type: "sync",
                userId: this.userId,
                sessionId: this.sessionId,
                filename: filename,
                patchString: patches_serialized,
                lineNumber: position?.lineNumber ?? 1,
                column: position?.column ?? 1,
            });

            if (!response.ok) {
                throw `HTTP error during session sync. Status: ${response.status}`;
            }

            await this.setSessionGroundtruth(response.groundtruth!);
        } catch (error) {
            console.error("Session sync error:", error);
        } finally {
            // Schedule the next sync
            if (this.syncEnabled) {
                clearTimeout(this.syncTimeoutId); // remove redundant timeouts
                this.syncTimeoutId = setTimeout(
                    () => this.syncSession(),
                    SYNC_INTERVAL
                );
            }
        }
    }

    async setSessionGroundtruth(groundtruth: SessionTypes.SessionGroundTruth) {
        // Update groundtruth
        this.sessionGroundtruth = groundtruth;

        const filename = Editor.getFileName();
        const currentCode = Editor.getEditorCode();

        // Sync editor
        if (
            filename in this.sessionGroundtruth.files &&
            this.sessionGroundtruth.files[filename]["code"] !== currentCode
        ) {
            Editor.updateEditorCode(
                this.sessionGroundtruth!.files[filename]["code"]!
            );
        }

        // Sync files
        await this.syncFiles();

        // Sync session user info (presence, location, and cursors)
        this.syncSessionUsers();
    }

    syncSessionUsers() {
        const filename = Editor.getFileName();
        const users: { [key: string]: SessionTypes.SessionUser } =
            this.sessionGroundtruth!.users;
        const timestamp = Date.now();
        const userCircleTimeLimit = (timestamp - USER_CIRCLE_TOL) / 1000;
        const userCursorTimeLimit = (timestamp - USER_CURSOR_TOL) / 1000;
        const userPopupTimeLimit = (timestamp - USER_POPUP_TOL) / 1000;

        for (const userId in users) {
            const userColor = users[userId].userColor;

            if (
                !this.globalUserCircles.has(userId) &&
                userCircleTimeLimit <= users[userId].lastActive
            ) {
                const userCircleDiv = document.createElement("div");
                userCircleDiv.classList.add("global-user-circle-wrapper");
                userCircleDiv.innerHTML = `
                    <div class="global-user-circle user-color-${userColor} user-border-${userColor}">
                        ${userId[0]}
                    </div>
                    <div class="global-user-tooltip">
                        ${userId}${userId == this.userId ? " (You)" : ""}
                    </div>
                `;
                SessionManager.globalUserCirclesDiv.appendChild(userCircleDiv);
                this.globalUserCircles.set(userId, userCircleDiv);
            }

            if (
                filename === users[userId].filename &&
                !this.localUserCircles.has(userId) &&
                userCircleTimeLimit <= users[userId].lastActive
            ) {
                const userCircleDiv = document.createElement("div");
                userCircleDiv.classList.add("local-user-circle-wrapper");
                userCircleDiv.innerHTML = `
                    <div class="local-user-circle user-color-${userColor} user-border-${userColor}">
                        ${userId[0]}
                    </div>
                    <div class="local-user-tooltip">
                        ${userId}${userId == this.userId ? " (You)" : ""}
                    </div>
                `;
                SessionManager.localUserCirclesDiv.appendChild(userCircleDiv);
                this.localUserCircles.set(userId, userCircleDiv);
            }

            if (filename === users[userId].filename && userId !== this.userId) {
                const remotePosition = {
                    lineNumber: users[userId].lineNumber,
                    column: users[userId].column,
                };

                if (userCursorTimeLimit <= users[userId].lastEdited) {
                    this.addOrMoveRemoteCursor(
                        userId,
                        remotePosition,
                        userColor
                    );
                }

                if (userPopupTimeLimit <= users[userId].lastEdited) {
                    this.showRemoteUserPopup(userId, remotePosition, userColor);
                }
            }
        }

        for (const userId of this.globalUserCircles.keys()) {
            if (
                !(userId in users) ||
                userCircleTimeLimit > users[userId].lastActive
            ) {
                this.globalUserCircles.get(userId)?.remove();
                this.globalUserCircles.delete(userId);
            }
        }

        for (const userId of this.localUserCircles.keys()) {
            if (
                !(userId in users) ||
                users[userId].filename !== filename ||
                userCircleTimeLimit > users[userId].lastActive
            ) {
                this.localUserCircles.get(userId)?.remove();
                this.localUserCircles.delete(userId);
            }
        }

        for (const userId of this.localUserCursors.keys()) {
            if (
                !(userId in users) ||
                users[userId].filename !== filename ||
                userCursorTimeLimit > users[userId].lastEdited
            ) {
                this.removeRemoteCursor(userId);
            }
        }

        for (const userId of this.localUserPopupWidgets.keys()) {
            if (
                !(userId in users) ||
                users[userId].filename !== filename ||
                userPopupTimeLimit > users[userId].lastEdited
            ) {
                this.removeRemoteUserPopup(userId);
            }
        }
    }

    addOrMoveRemoteCursor(
        userId: string,
        position: monaco.IPosition,
        color: string
    ) {
        // Check if the user already has a cursor; if not, create a new collection
        if (!this.localUserCursors.has(userId)) {
            this.localUserCursors.set(
                userId,
                Editor.editor.createDecorationsCollection()
            );
        }

        // Get the user's cursor collection and update the cursor position
        this.localUserCursors.get(userId)?.set([
            {
                range: new monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column + 1
                ),
                options: {
                    className: `local-user-cursor user-border-${color}`,
                    isWholeLine: false,
                },
            },
        ]);
    }

    removeRemoteCursor(userId: string) {
        if (this.localUserCursors.has(userId)) {
            this.localUserCursors.get(userId)!.set([]);
            this.localUserCursors.delete(userId);
        }
    }

    showRemoteUserPopup(
        userId: string,
        position: monaco.IPosition,
        color: string
    ) {
        let popupWidget: monaco.editor.IContentWidget;

        if (!this.localUserPopupWidgets.has(userId)) {
            const domNode = document.createElement("div");
            domNode.textContent = userId;
            domNode.className = `local-user-popup user-background-${color}`;

            // Add the pop-up to the editor
            popupWidget = {
                getId: () => `user-popup-${userId}`,
                getDomNode: () => domNode,
                getPosition: () => ({
                    position,
                    preference: [
                        monaco.editor.ContentWidgetPositionPreference.BELOW,
                    ],
                }),
            };

            this.localUserPopupWidgets.set(userId, popupWidget);
            Editor.editor.addContentWidget(popupWidget!);
        } else {
            popupWidget = this.localUserPopupWidgets.get(userId)!;
            popupWidget!["getPosition"] = () => ({
                position,
                preference: [
                    monaco.editor.ContentWidgetPositionPreference.BELOW,
                ],
            });

            Editor.editor.layoutContentWidget(popupWidget);
        }
    }

    removeRemoteUserPopup(userId: string) {
        if (this.localUserPopupWidgets.has(userId)) {
            const popupWidget = this.localUserPopupWidgets.get(userId);
            this.localUserPopupWidgets.delete(userId);
            Editor.editor.removeContentWidget(popupWidget!);
        }
    }

    async syncFiles() {
        const currentFileName = Editor.getFileName();
        const currentFiles = ProjectSystem.getProjectFileMap();
        const groundtruthFiles = this.sessionGroundtruth!.files;

        // New & existing file updates
        for (const filename in groundtruthFiles) {
            if (currentFileName === filename || filename.length === 0) {
                // already handled during editor sync
                continue;
            } else if (!currentFiles.has(filename)) {
                // New file
                if (typeof groundtruthFiles[filename].code === "string") {
                    ProjectSystem.addNewFile(
                        filename,
                        groundtruthFiles[filename].code!,
                        false,
                        false
                    );
                } else {
                    const fileData = await this.getfile(filename);
                    if (fileData) {
                        ProjectSystem.addNewFile(
                            filename,
                            fileData,
                            false,
                            false
                        );
                    }
                }
            } else {
                // Existing file
                const currentFile = currentFiles.get(filename)!;
                if (currentFile.isPlaintextFile())
                    // *non-text files cannot be modified in WebChuck IDE
                    currentFile.setData(groundtruthFiles[filename].code!);
            }
        }

        // File deletions
        for (const filename of currentFiles.keys()) {
            if (currentFileName === filename) {
                // don't delete current file (bad UX)
                continue;
            } else if (!(filename in groundtruthFiles)) {
                ProjectSystem.removeFileFromExplorer(filename, false);
            }
        }
    }

    static setActiveFile() {
        if (
            !SessionManager.currentSession ||
            !SessionManager.currentSession.syncEnabled
        )
            return;
        SessionManager.currentSession._setActiveFile();
    }

    private async _setActiveFile() {
        this.mutex.runExclusive(async () => {
            try {
                this.sessionGroundtruth!.users[this.userId].filename =
                    Editor.getFileName();
                this.syncSessionUsers();
            } catch (error) {
                console.error("Sync error while changing active file:", error);
            }
        });
    }

    private async getfile(filename: string) {
        const response = await fetch(
            HTTP_PROTOCOL +
                API_URL +
                FILE_PATH +
                `?sessionId=${this.sessionId}` +
                `&filename=${filename}`,
            { method: "GET" }
        );

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);

        return fileData;
    }

    static addFile(newFile: ProjectFile) {
        if (
            !SessionManager.currentSession ||
            !SessionManager.currentSession.syncEnabled
        )
            return;
        SessionManager.currentSession._addFile(newFile);
    }

    private async _addFile(newFile: ProjectFile) {
        this.mutex.runExclusive(async () => {
            const formData = new FormData();
            const fileName = newFile.getFilename();
            const fileData = newFile.getData();
            const mimeType =
                typeof fileData === "string"
                    ? "text/plain"
                    : "application/octet-stream";
            const blob = new Blob(
                [
                    typeof fileData === "string"
                        ? new TextEncoder().encode(fileData)
                        : fileData,
                ],
                { type: mimeType }
            );

            // Append the file to FormData
            formData.append("file", blob, fileName);

            const response = await fetch(
                HTTP_PROTOCOL +
                    API_URL +
                    FILE_PATH +
                    `?sessionId=${this.sessionId}`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (response.ok) {
                this.sessionGroundtruth!.files[fileName] = {
                    filename: fileName,
                    code: typeof fileData === "string" ? fileData : null,
                }; // A workaround to immediately change groundtruth
                console.log("File uploaded successfully.");
            } else {
                console.error("Upload failed:", response.statusText);
            }
        });
    }

    static removeFile(filename: string) {
        if (
            !SessionManager.currentSession ||
            !SessionManager.currentSession.syncEnabled
        )
            return;
        SessionManager.currentSession._removeFile(filename);
    }

    private async _removeFile(filename: string) {
        this.mutex.runExclusive(async () => {
            const response = await fetch(
                HTTP_PROTOCOL +
                    API_URL +
                    FILE_PATH +
                    `?sessionId=${this.sessionId}` +
                    `&userId=${this.userId}` +
                    `&filename=${filename}`,
                { method: "DELETE" }
            );

            if (response.ok) {
                delete this.sessionGroundtruth!.files[filename];
                console.log("File deleted successfully.");
            } else {
                if (response.status === 400) {
                    alert(
                        "The file wasn't deleted because another user is working on it."
                    );
                }
                console.error("File delete failed:", response.statusText);
            }
        });
    }

    static clearProject() {
        if (
            !SessionManager.currentSession ||
            !SessionManager.currentSession.syncEnabled
        )
            return;
        SessionManager.currentSession._clearProject();
    }

    private async _clearProject() {
        this.mutex.runExclusive(async () => {
            const response = await fetch(
                HTTP_PROTOCOL +
                    API_URL +
                    PROJECT_CLEAR_PATH +
                    `?sessionId=${this.sessionId}`,
                { method: "POST" }
            );

            if (response.ok) {
                this.sessionGroundtruth!.files = {};
                console.log("Project cleared successfully.");
            } else {
                console.error("Project clear failed:", response.statusText);
            }
        });
    }

    static async broadcast(action: string, filename: string | null = null) {
        if (
            !SessionManager.currentSession ||
            !SessionManager.currentSession.syncEnabled
        )
            return;

        const response = await fetch(
            HTTP_PROTOCOL +
                API_URL +
                BROADCAST_PATH +
                `?sessionId=${SessionManager.currentSession.sessionId}` +
                `&userId=${SessionManager.currentSession.userId}` +
                `&action=${action}` +
                `&filename=${filename}`,
            { method: "POST" }
        );

        if (!response.ok) {
            console.error("Broadcast failed:", response.statusText);
            alert(
                "Unable to connect to the server. Closing the current session."
            );
            SessionSystem.closeCurrentSessionButtonClick();
        }
    }

    static getUsers(): string[] {
        if (
            SessionManager.currentSession &&
            SessionManager.currentSession.sessionGroundtruth
        ) {
            return Object.keys(
                SessionManager.currentSession.sessionGroundtruth.users!
            ).map((userId) => {
                if (userId === SessionManager.currentSession!.userId)
                    return `${userId} (You)`;
                else return userId;
            });
        } else {
            return [];
        }
    }
}

// Helper function
function runAtTargetTime(targetTime: number, callback: Function) {
    function checkTime() {
        if (performance.now() >= targetTime) {
            callback();
        } else {
            requestAnimationFrame(checkTime);
        }
    }
    console.log(targetTime, performance.now());

    if (targetTime - performance.now() > 10000) {
        console.error("Cannot schedule event because they occur too late.");
        return;
    }

    requestAnimationFrame(checkTime);
}
