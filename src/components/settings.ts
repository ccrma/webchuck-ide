//---------------------------------------------------
// title: Settings
// desc:  IDE settings modal for Audio and ChucK versions
//
// author: terry feng
// date:   April 2024
//---------------------------------------------------

import {
    selectChuckSrc,
    setAudioOutputDevice,
    setAudioInputDevice
} from "@/host";

export const versionString = Object.freeze({
    stable: "stable",
    dev: "dev"
});

export interface SettingsState {
    chuckVersion: string;
    audioInput: string;
    audioOutput: string;
}

// Any setting in this list requires a full page reload when changed
const RELOADABLE_KEYS: (keyof SettingsState)[] = ["chuckVersion"];

export default class Settings {
    public static openButton: HTMLButtonElement;
    public static modal: HTMLDialogElement;
    public static closeButton: HTMLButtonElement;
    public static applyButton: HTMLButtonElement;

    public static versionSelect: HTMLSelectElement;
    public static versionDescription: HTMLParagraphElement;
    public static audioInputSelect: HTMLSelectElement;
    public static audioOutputSelect: HTMLSelectElement;
    public static permissionPrompt: HTMLDivElement;
    public static grantPermissionButton: HTMLButtonElement;

    private static initial: SettingsState;
    private static pending: SettingsState;
    private static hasDeviceLabels: boolean = false;
    private static isProbing: boolean = false;

    constructor() {
        Settings.openButton = document.querySelector("#openSettings")!;
        Settings.modal = document.querySelector("#settings-modal")!;
        Settings.closeButton = document.querySelector("#settings-close")!;
        Settings.applyButton = document.querySelector("#settings-apply")!;

        Settings.versionSelect = document.querySelector(
            "#chuck-version-select"
        )!;
        Settings.versionDescription = document.querySelector(
            "#chuck-version-desc"
        )!;
        Settings.audioInputSelect = document.querySelector(
            "#audio-input-select"
        )!;
        Settings.audioOutputSelect = document.querySelector(
            "#audio-output-select"
        )!;
        Settings.permissionPrompt = document.querySelector(
            "#audio-permission-prompt"
        )!;
        Settings.grantPermissionButton = document.querySelector(
            "#audio-grant-permission"
        )!;

        // Initialize state snapshot and form UI
        Settings.resetState();

        // Modal open / close handlers
        Settings.openButton.addEventListener("click", () => {
            Settings.openModal();
        });
        Settings.closeButton.addEventListener("click", () =>
            Settings.closeModal()
        );
        Settings.modal.addEventListener("click", (e) => {
            if (e.target === Settings.modal) Settings.closeModal();
        });
        Settings.modal.addEventListener("close", () => Settings.resetState());

        // Apply changes
        Settings.applyButton.addEventListener("click", () =>
            Settings.applySettings()
        );

        // Grant audio permission button
        Settings.grantPermissionButton.addEventListener("click", async () => {
            await Settings.requestMicPermission();
        });

        // Setting input change listeners
        Settings.versionSelect.addEventListener("change", () => {
            Settings.setPending("chuckVersion", Settings.versionSelect.value);
        });

        Settings.audioInputSelect.addEventListener("change", () => {
            Settings.setPending("audioInput", Settings.audioInputSelect.value);
        });

        Settings.audioOutputSelect.addEventListener("change", () => {
            Settings.setPending(
                "audioOutput",
                Settings.audioOutputSelect.value
            );
        });

        // Refresh devices when audio hardware is plugged or unplugged
        navigator.mediaDevices?.addEventListener("devicechange", () => {
            Settings.populateAudioDevices();
        });
    }

    /**
     * Open the settings modal
     */
    static async openModal() {
        // Silently probe if permission was already granted previously
        if (!Settings.hasDeviceLabels && navigator.permissions?.query) {
            try {
                const status = await navigator.permissions.query({
                    name: "microphone" as PermissionName
                });
                if (status.state === "granted") {
                    await Settings.requestMicPermission();
                }
            } catch {
                // Permissions query not supported in all browsers
            }
        }
        await Settings.populateAudioDevices();
        Settings.resetState();
        Settings.modal.showModal();
    }

    /**
     * Probe for microphone permissions to unlock real device labels
     */
    static async requestMicPermission(): Promise<boolean> {
        if (Settings.isProbing) return false;
        Settings.isProbing = true;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            // Stop probe stream tracks immediately
            stream.getTracks().forEach((track) => track.stop());

            // Restore saved devices from localStorage or default
            const savedInput =
                localStorage.getItem("audioInputDevice") || "default";
            const savedOutput =
                localStorage.getItem("audioOutputDevice") || "default";
            Settings.pending.audioInput = savedInput;
            Settings.pending.audioOutput = savedOutput;

            await Settings.populateAudioDevices();
            return true;
        } catch (err) {
            console.warn("Microphone access was not granted:", err);
            Settings.setPending("audioInput", "default");
            Settings.audioInputSelect.value = "default";
            return false;
        } finally {
            Settings.isProbing = false;
        }
    }

    /**
     * Read currently saved settings from localStorage or fallback defaults
     */
    static getSavedSettings(): SettingsState {
        const savedInput =
            localStorage.getItem("audioInputDevice") || "default";
        const savedOutput =
            localStorage.getItem("audioOutputDevice") || "default";
        return {
            chuckVersion:
                localStorage.getItem("chuckVersion") || versionString.stable,
            audioInput:
                Settings.hasDeviceLabels && savedInput !== "none"
                    ? savedInput
                    : "default",
            audioOutput: Settings.hasDeviceLabels ? savedOutput : "default"
        };
    }

    /**
     * Reset initial and pending state back to saved settings
     */
    static resetState() {
        Settings.initial = Settings.getSavedSettings();
        Settings.pending = { ...Settings.initial };
        Settings.syncUIWithPending();
        Settings.updateApplyButton();
    }

    /**
     * Synchronize form inputs and descriptions with the pending settings state
     */
    static syncUIWithPending() {
        Settings.versionSelect.value = Settings.pending.chuckVersion;
        Settings.updateVersionDescription(Settings.pending.chuckVersion);
        Settings.audioInputSelect.value = Settings.pending.audioInput;
        Settings.audioOutputSelect.value = Settings.pending.audioOutput;

        // Ensure valid selection fallback if saved value doesn't match available options
        if (!Settings.audioInputSelect.value) {
            Settings.audioInputSelect.value = "default";
            Settings.pending.audioInput = "default";
        }
        if (!Settings.audioOutputSelect.value) {
            Settings.audioOutputSelect.value = "default";
            Settings.pending.audioOutput = "default";
        }
    }

    /**
     * Check if any reloadable setting differs between pending and initial state
     */
    static requiresReload(): boolean {
        return RELOADABLE_KEYS.some(
            (key) => Settings.pending[key] !== Settings.initial[key]
        );
    }

    /**
     * Update the apply button label depending on whether a reload is required
     */
    static updateApplyButton() {
        Settings.applyButton.innerText = Settings.requiresReload()
            ? "Reload"
            : "Apply";
    }

    /**
     * Update a single setting in pending state
     */
    static setPending<K extends keyof SettingsState>(
        key: K,
        value: SettingsState[K]
    ) {
        Settings.pending[key] = value;
        if (key === "chuckVersion") {
            Settings.updateVersionDescription(value);
        }
        Settings.updateApplyButton();
    }

    /**
     * Update ChucK version description text based on the selected version
     */
    static updateVersionDescription(version: string) {
        Settings.versionDescription.innerHTML =
            version === versionString.stable
                ? "Latest stable version of ChucK available via <a href='https://chuck.stanford.edu/webchuck' target='_blank' class='text-orange-light underline'>WebChucK</a>"
                : "Bleeding edge version of ChucK. Built from the tip of <a href='https://github.com/ccrma/chuck' target='_blank' class='text-orange-light underline'>main</a>";
    }

    /**
     * Fill a device <select> with a "System Default" entry followed by each
     * hardware device. Chromium exposes virtual "default"/"communications"
     * entries that duplicate real devices; those are folded into the default
     * label (e.g. "System Default (MacBook Pro Microphone)") instead.
     */
    private static fillDeviceSelect(
        select: HTMLSelectElement,
        devices: MediaDeviceInfo[],
        kind: "Input" | "Output",
        fallbackName: string,
        activeId: string
    ) {
        const systemDefault = devices.find((d) => d.deviceId === "default");
        const resolvedName = systemDefault?.label.replace(
            /^Default\s*-\s*/,
            ""
        );
        const defaultLabel = resolvedName
            ? `System Default (${resolvedName})`
            : `System Default ${kind}`;

        select.innerHTML = "";
        select.add(
            new Option(defaultLabel, "default", false, activeId === "default")
        );

        devices
            .filter(
                (d) =>
                    d.deviceId !== "default" && d.deviceId !== "communications"
            )
            .forEach((device, idx) => {
                select.add(
                    new Option(
                        device.label || `${fallbackName} ${idx + 1}`,
                        device.deviceId,
                        false,
                        device.deviceId === activeId
                    )
                );
            });
    }

    /**
     * Populate available audio I/O devices into select dropdowns
     */
    static async populateAudioDevices() {
        if (!navigator.mediaDevices?.enumerateDevices) {
            Settings.audioInputSelect.disabled = true;
            Settings.audioOutputSelect.disabled = true;
            return;
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter((d) => d.kind === "audioinput");
            const audioOutputs = devices.filter(
                (d) => d.kind === "audiooutput"
            );

            // Check if human-readable labels are available (requires permission)
            Settings.hasDeviceLabels = devices.some(
                (d) =>
                    (d.kind === "audioinput" || d.kind === "audiooutput") &&
                    d.label.length > 0
            );

            // Toggle permission banner
            if (Settings.permissionPrompt) {
                if (Settings.hasDeviceLabels) {
                    Settings.permissionPrompt.classList.add("hidden");
                } else {
                    Settings.permissionPrompt.classList.remove("hidden");
                }
            }

            const activeInputId = Settings.hasDeviceLabels
                ? Settings.pending?.audioInput || "default"
                : "default";
            const activeOutputId = Settings.hasDeviceLabels
                ? Settings.pending?.audioOutput || "default"
                : "default";

            // Populate Audio Inputs
            Settings.audioInputSelect.disabled = false;
            Settings.fillDeviceSelect(
                Settings.audioInputSelect,
                Settings.hasDeviceLabels ? audioInputs : [],
                "Input",
                "Microphone",
                activeInputId
            );

            // Populate Audio Outputs
            const sinkIdSupported =
                typeof AudioContext !== "undefined" &&
                "setSinkId" in AudioContext.prototype;

            Settings.audioOutputSelect.disabled = !sinkIdSupported;
            Settings.audioOutputSelect.title = sinkIdSupported
                ? ""
                : "This browser does not support choosing an output device";
            Settings.fillDeviceSelect(
                Settings.audioOutputSelect,
                sinkIdSupported && Settings.hasDeviceLabels ? audioOutputs : [],
                "Output",
                "Speaker",
                sinkIdSupported ? activeOutputId : "default"
            );

            // Explicitly set values on select elements and sync pending state
            Settings.audioInputSelect.value = activeInputId;
            Settings.audioOutputSelect.value = activeOutputId;
            if (!Settings.audioInputSelect.value) {
                Settings.audioInputSelect.value = "default";
            }
            if (!Settings.audioOutputSelect.value) {
                Settings.audioOutputSelect.value = "default";
            }
            if (Settings.pending) {
                Settings.pending.audioInput = Settings.audioInputSelect.value;
                Settings.pending.audioOutput = Settings.audioOutputSelect.value;
            }
        } catch (err) {
            console.error("Error communicating with audio devices:", err);
        }
    }

    /**
     * Cancel changes and close modal
     */
    static closeModal() {
        Settings.resetState();
        Settings.modal.close();
    }

    /**
     * Apply settings and close modal (or reload if required)
     */
    static applySettings() {
        const needsReload = Settings.requiresReload();

        // Commit audio settings only if device labels were unlocked
        if (Settings.hasDeviceLabels) {
            localStorage.setItem(
                "audioInputDevice",
                Settings.pending.audioInput
            );
            localStorage.setItem(
                "audioOutputDevice",
                Settings.pending.audioOutput
            );
            if (Settings.pending.audioInput !== Settings.initial.audioInput) {
                setAudioInputDevice(Settings.pending.audioInput);
            }
            if (Settings.pending.audioOutput !== Settings.initial.audioOutput) {
                setAudioOutputDevice(Settings.pending.audioOutput);
            }
        }

        localStorage.setItem("chuckVersion", Settings.pending.chuckVersion);
        selectChuckSrc(Settings.pending.chuckVersion === versionString.stable);

        // Update settings state snapshot
        Settings.initial = { ...Settings.pending };

        Settings.modal.close();

        if (needsReload) {
            location.reload();
        }
    }
}
