import Console from "../outputPanel/console";
import SessionManager from "./sessionManager";

const CLOSED = 0;
const CREATING = 1;
const JOINING = 2;
const CREATE_LOADING = 3;
const JOIN_LOADING = 4;
const LOADED = 5;
const INFO = 6;

// Regex to validate alphanumeric, hyphens, and underscores
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,}$/;
const SESSIONID_REGEX = /^[A-Z0-9]{8}$/;

export default class SessionSystem {
    public static newSessionButton: HTMLButtonElement;
    public static joinSessionButton: HTMLButtonElement;
    public static closeSessionButton: HTMLButtonElement;
    public static sessionInfoButton: HTMLButtonElement;
    public static sessionModal: HTMLDialogElement;
    public static sessionModalOk: HTMLButtonElement;
    public static sessionModalClose: HTMLButtonElement;
    public static sessionModalCreateDiv: HTMLDivElement;
    public static sessionModalCreateUsername: HTMLInputElement;
    public static sessionModalJoinDiv: HTMLDivElement;
    public static sessionModalJoinUsername: HTMLInputElement;
    public static sessionModalJoinSessionId: HTMLInputElement;
    public static sessionModalLoadingDiv: HTMLDivElement;
    public static sessionModalLoadedDiv: HTMLDivElement;
    public static sessionModalLoadedMsg1: HTMLParagraphElement;
    public static sessionModalLoadedMsg2: HTMLParagraphElement;
    public static sessionModalLoadedId: HTMLSpanElement;
    public static sessionModalInfoDiv: HTMLDivElement;
    public static sessionModalUsers: HTMLParagraphElement;
    public static sessionModalInfoId: HTMLSpanElement;
    public static sessionInfoChuckBar: HTMLDivElement;
    public static sessionStatusChuckBar: HTMLSpanElement;
    public static sessionIdChuckBar: HTMLSpanElement;

    public static modalStatus: number = CLOSED;

    constructor() {
        SessionSystem.newSessionButton =
            document.querySelector<HTMLButtonElement>("#newSession")!;
        SessionSystem.newSessionButton.addEventListener("click", () => {
            SessionSystem.createNewSessionButtonClick();
        });

        SessionSystem.joinSessionButton =
            document.querySelector<HTMLButtonElement>("#joinSession")!;
        SessionSystem.joinSessionButton.addEventListener("click", () => {
            SessionSystem.joinExistingSessionButtonClick();
        });

        SessionSystem.closeSessionButton =
            document.querySelector<HTMLButtonElement>("#closeSession")!;
        SessionSystem.closeSessionButton.addEventListener("click", () => {
            SessionSystem.closeCurrentSessionButtonClick();
        });

        SessionSystem.sessionInfoButton =
            document.querySelector<HTMLButtonElement>("#sessionInfo")!;
        SessionSystem.sessionInfoButton.addEventListener("click", () => {
            SessionSystem.currentSessionInfoButtonClick();
        });

        SessionSystem.sessionModal =
            document.querySelector<HTMLDialogElement>("#session-modal")!;
        SessionSystem.sessionModal.addEventListener(
            "click",
            (event: MouseEvent) => {
                event.stopPropagation();
                event.target === SessionSystem.sessionModal &&
                    SessionSystem.closeModal();
            }
        );

        SessionSystem.sessionModalOk =
            document.querySelector<HTMLButtonElement>("#session-ok")!;
        SessionSystem.sessionModalOk.addEventListener(
            "click",
            SessionSystem.handleSessionModalOkClick
        );
        SessionSystem.sessionModalClose =
            document.querySelector<HTMLButtonElement>("#session-close")!;
        SessionSystem.sessionModalClose.addEventListener("click", () => {
            SessionSystem.closeModal();
        });

        SessionSystem.sessionModalCreateDiv =
            document.querySelector<HTMLDivElement>("#session-create")!;
        SessionSystem.sessionModalCreateUsername =
            document.querySelector<HTMLInputElement>(
                "#session-create-username"
            )!;
        SessionSystem.sessionModalJoinDiv =
            document.querySelector<HTMLDivElement>("#session-join")!;
        SessionSystem.sessionModalJoinUsername =
            document.querySelector<HTMLInputElement>("#session-join-username")!;
        SessionSystem.sessionModalJoinSessionId =
            document.querySelector<HTMLInputElement>(
                "#session-join-sessionId"
            )!;
        SessionSystem.sessionModalLoadingDiv =
            document.querySelector<HTMLDivElement>("#session-loading")!;
        SessionSystem.sessionModalLoadedDiv =
            document.querySelector<HTMLDivElement>("#session-loaded")!;
        SessionSystem.sessionModalLoadedMsg1 =
            document.querySelector<HTMLParagraphElement>(
                "#session-loaded-msg1"
            )!;
        SessionSystem.sessionModalLoadedMsg2 =
            document.querySelector<HTMLParagraphElement>(
                "#session-loaded-msg2"
            )!;
        SessionSystem.sessionModalLoadedId =
            document.querySelector<HTMLSpanElement>("#session-loaded-id")!;
        SessionSystem.sessionModalInfoDiv =
            document.querySelector<HTMLDivElement>("#session-info")!;
        SessionSystem.sessionModalUsers =
            document.querySelector<HTMLParagraphElement>("#session-users")!;
        SessionSystem.sessionModalInfoId =
            document.querySelector<HTMLSpanElement>("#session-info-id")!;
        SessionSystem.sessionInfoChuckBar =
            document.querySelector<HTMLDivElement>("#chuck-bar-session-info")!;
        SessionSystem.sessionStatusChuckBar =
            document.querySelector<HTMLSpanElement>(
                "#chuck-bar-session-status"
            )!;
        SessionSystem.sessionIdChuckBar =
            document.querySelector<HTMLSpanElement>("#chuck-bar-session-id")!;

        SessionSystem.hideModalDivs();
        SessionSystem.modalStatus = CLOSED;

        document.addEventListener("keydown", (event) => {
            if (
                (event.key === "Escape" || event.key === "Esc") &&
                SessionSystem.sessionModal.open
            ) {
                event.preventDefault();
                if (SessionSystem.sessionModal.open) {
                    SessionSystem.closeModal();
                }
            } else if (
                event.key === "Enter" &&
                SessionSystem.sessionModal.open
            ) {
                SessionSystem.sessionModalOk.click(); // Simulate OK button click
            }
        });
    }

    static createNewSessionButtonClick() {
        SessionSystem.sessionModal.showModal();
        SessionSystem.sessionModalCreateDiv.classList.remove("hidden");
        SessionSystem.sessionModalOk.innerText = "Start Session";
        SessionSystem.modalStatus = CREATING;
    }

    static joinExistingSessionButtonClick() {
        SessionSystem.sessionModal.showModal();
        SessionSystem.sessionModalJoinDiv.classList.remove("hidden");
        SessionSystem.sessionModalOk.innerText = "Join Session";
        SessionSystem.modalStatus = JOINING;
    }

    static closeCurrentSessionButtonClick() {
        const closedSessionId = SessionManager.currentSession?.sessionId;
        SessionManager.currentSession?.close();
        SessionSystem.sessionInfoChuckBar.classList.add("hidden");
        SessionSystem.sessionIdChuckBar.innerText = "";
        SessionSystem.sessionStatusChuckBar.innerText = "OFF";
        SessionSystem.closeSessionButton.disabled = true;
        SessionSystem.sessionInfoButton.disabled = true;
        Console.print(`Session closed: ${closedSessionId}`);
    }

    static currentSessionInfoButtonClick() {
        SessionSystem.sessionModal.showModal();
        SessionSystem.sessionModalInfoDiv.classList.remove("hidden");
        SessionSystem.sessionModalOk.classList.remove("hidden");
        SessionSystem.sessionModalClose.classList.add("hidden");
        SessionSystem.sessionModalOk.innerText = "OK";
        SessionSystem.sessionModalUsers.innerHTML = `<b>Users</b>: ${SessionManager.getUsers().join(
            ", "
        )}`;
        SessionSystem.sessionModalInfoId.innerText =
            SessionManager.currentSession?.sessionId || "?";
        SessionSystem.modalStatus = INFO;
    }

    static closeModal() {
        if (
            SessionSystem.modalStatus === CREATE_LOADING ||
            SessionSystem.modalStatus === JOIN_LOADING
        )
            return;

        SessionSystem.sessionModal.close();
        SessionSystem.hideModalDivs();
        SessionSystem.sessionModalClose.classList.remove("hidden");
        SessionSystem.sessionModalOk.classList.remove("hidden");
        SessionSystem.modalStatus = CLOSED;
    }

    static hideModalDivs() {
        SessionSystem.sessionModalCreateDiv.classList.add("hidden");
        SessionSystem.sessionModalJoinDiv.classList.add("hidden");
        SessionSystem.sessionModalLoadingDiv.classList.add("hidden");
        SessionSystem.sessionModalLoadedDiv.classList.add("hidden");
        SessionSystem.sessionModalInfoDiv.classList.add("hidden");
    }

    static async handleSessionModalOkClick() {
        if (
            SessionSystem.modalStatus === CREATING ||
            SessionSystem.modalStatus === JOINING
        ) {
            const userId =
                SessionSystem.modalStatus === CREATING
                    ? SessionSystem.sessionModalCreateUsername.value
                    : SessionSystem.sessionModalJoinUsername.value;
            const sessionId = SessionSystem.sessionModalJoinSessionId.value;

            if (!USERNAME_REGEX.test(userId)) {
                alert(
                    "Invalid username. Must be at least 3 characters long and only contain letters, numbers, hyphens, or underscores."
                );
                return;
            }

            if (
                SessionSystem.modalStatus === JOINING &&
                !SESSIONID_REGEX.test(sessionId)
            ) {
                alert(
                    "Invalid input! Please enter exactly 8 characters consisting of uppercase letters and numbers only."
                );
                return;
            }

            SessionSystem.hideModalDivs();
            SessionSystem.sessionModalLoadingDiv.classList.remove("hidden");
            SessionSystem.sessionModalClose.classList.add("hidden");
            SessionSystem.sessionModalOk.classList.add("hidden");

            if (SessionSystem.modalStatus === CREATING) {
                SessionSystem.modalStatus = CREATE_LOADING;
                await SessionManager.open(userId);
            } else {
                SessionSystem.modalStatus = JOIN_LOADING;
                await SessionManager.open(userId, sessionId);
            }

            setTimeout(SessionSystem.handleLoadingComplete, 1000); // Intentional extra wait time
        } else if (SessionSystem.modalStatus === LOADED) {
            SessionSystem.modalStatus = CLOSED;
            SessionSystem.closeModal();
        } else if (SessionSystem.modalStatus === INFO) {
            SessionSystem.modalStatus = CLOSED;
            SessionSystem.closeModal();
        }
    }

    static handleLoadingComplete() {
        if (SessionManager.lastSessionErrorMsg.length > 0) {
            alert(SessionManager.lastSessionErrorMsg);
            SessionSystem.modalStatus = CLOSED; // this line allows closeModal to execute
            SessionSystem.closeModal();
            return;
        }

        SessionSystem.hideModalDivs();
        SessionSystem.sessionModalLoadedDiv.classList.remove("hidden");
        SessionSystem.sessionModalOk.classList.remove("hidden");
        SessionSystem.sessionModalOk.innerText = "OK";

        if (SessionSystem.modalStatus === CREATE_LOADING) {
            SessionSystem.sessionModalLoadedMsg1.innerText =
                "Your session is live!";
            SessionSystem.sessionModalLoadedMsg2.innerText =
                "Share the session ID below to start collaborating:";
        } else if (SessionSystem.modalStatus === JOIN_LOADING) {
            SessionSystem.sessionModalLoadedMsg1.innerText =
                "Welcome to the Co-Chuck session!";
            SessionSystem.sessionModalLoadedMsg2.innerText =
                "You've joined successfully. Start collaborating now.";
        }

        SessionSystem.modalStatus = LOADED;
        SessionSystem.sessionModalLoadedId.innerText =
            SessionManager.currentSession?.sessionId || "?";

        SessionSystem.sessionInfoChuckBar.classList.remove("hidden");
        SessionSystem.sessionIdChuckBar.innerText =
            SessionManager.currentSession?.sessionId!;
        SessionSystem.sessionStatusChuckBar.innerText = "ON";

        SessionSystem.closeSessionButton.disabled = false;
        SessionSystem.sessionInfoButton.disabled = false;

        Console.print(
            `Connected to session: ${SessionManager.currentSession?.sessionId}`
        );
    }
}
