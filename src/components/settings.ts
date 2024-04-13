import { selectChuckSrc } from "@/host";

const versionString = Object.freeze({
    stable: "stable",
    dev: "dev",
});

export default class Settings {
    public static openButton: HTMLButtonElement;
    public static modal: HTMLDialogElement;
    public static closeButton: HTMLButtonElement;
    public static applyButton: HTMLButtonElement;
    public static versionSelect: HTMLSelectElement;
    public static versionDescription: HTMLParagraphElement;

    constructor() {
        Settings.openButton =
            document.querySelector<HTMLButtonElement>("#openSettings")!;
        Settings.modal =
            document.querySelector<HTMLDialogElement>("#settings-modal")!;
        Settings.closeButton =
            document.querySelector<HTMLButtonElement>("#settings-close")!;
        Settings.applyButton =
            document.querySelector<HTMLButtonElement>("#settings-apply")!;
        Settings.versionSelect = document.querySelector<HTMLSelectElement>(
            "#chuck-version-select"
        )!;
        Settings.versionDescription =
            document.querySelector<HTMLParagraphElement>(
                "#chuck-version-desc"
            )!;

        // Open settings
        Settings.openButton.addEventListener("click", () => {
            Settings.modal.showModal();
        });
        // Close settings
        Settings.closeButton.addEventListener("click", () => {
            Settings.modal.close();
        });
        Settings.modal.addEventListener("click", (e) => {
            if (e.target === Settings.modal) {
                Settings.modal.close();
            }
        });
        // Apply button
        Settings.applyButton.addEventListener("click", () => {
            this.applySettings();
        });

        // Chuck version select
        Settings.versionSelect.addEventListener("change", () => {
            this.selectChucKVersion(Settings.versionSelect.value);
        });
        this.selectChucKVersion(
            localStorage.getItem("chuckVersion") || versionString.stable
        );
    }

    /**
     * Select ChucK version
     * @param version stable or dev version of ChucK
     */
    selectChucKVersion(version: string) {
        if (version === versionString.stable) {
            Settings.versionDescription.innerHTML =
                "Latest stable version of ChucK.";
        } else {
            Settings.versionDescription.innerHTML =
                "Bleeding edge version of ChucK. Built from the tip of <a href='https://github.com/ccrma/chuck' target='_blank' class='text-orange-light underline'>main</a>";
        }
        Settings.versionSelect.value = version;
    }

    static setAudioContextSink(index: number) {
        // TODO: Set the audio context sink
        // audioContext.setSinkId(index.toString());
        console.log("Setting audio context sink to", index);
    }

    /**
     * Apply settings and refresh the page
     */
    applySettings() {
        const version = Settings.versionSelect.value === versionString.stable;
        selectChuckSrc(version);
        localStorage.setItem(
            "chuckVersion",
            version ? versionString.stable : versionString.dev
        );

        // TODO: Reload the page for now, but should be able to just change the AudioWorkletNode/AudioContext
        location.reload();
    }
}
