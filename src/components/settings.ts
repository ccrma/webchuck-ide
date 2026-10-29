//---------------------------------------------------
// title: Settings
// desc:  IDE settings modal for Audio and ChucK versions
//
// author: terry feng
// date:   April 2024
//---------------------------------------------------

import {
    selectChuckSrc,
    getAudioOutputDevice,
    setAudioOutputDevice,
    getAudioSampleRate,
    setAudioSampleRate,
    getSystemSampleRate,
    getAudioOutputChannels,
    setAudioOutputChannels,
    getMaxOutputChannels
} from "@/host";
import { getAudioInputDevice, setAudioInputDevice } from "@/services/micInput";

export const versionString = Object.freeze({
    stable: "stable",
    dev: "dev"
});

export interface SettingsState {
    chuckVersion: string;
    audioInput: string;
    audioOutput: string;
    sampleRate: string;
    outputChannels: string;
}

// Any setting in this list requires a full page reload when changed
const RELOADABLE_KEYS: (keyof SettingsState)[] = [
    "chuckVersion",
    "sampleRate",
    "outputChannels"
];

export default class Settings {
    public static openButton: HTMLButtonElement;
    public static modal: HTMLDialogElement;
    public static closeButton: HTMLButtonElement;
    public static applyButton: HTMLButtonElement;

    public static versionSelect: HTMLSelectElement;
    public static versionDescription: HTMLParagraphElement;
    public static audioInputSelect: HTMLSelectElement;
    public static audioOutputSelect: HTMLSelectElement;
    public static sampleRateSelect: HTMLSelectElement;
    public static outputChannelsSelect: HTMLSelectElement;
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
        Settings.sampleRateSelect = document.querySelector(
            "#audio-srate-select"
        )!;
        Settings.outputChannelsSelect = document.querySelector(
            "#audio-channels-select"
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
            Settings.modal.close()
        );
        Settings.modal.addEventListener("click", (e) => {
            if (e.target === Settings.modal) Settings.modal.close();
        });

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
            Settings.updateSelectTitle(Settings.audioInputSelect);
        });

        Settings.audioOutputSelect.addEventListener("change", () => {
            Settings.setPending(
                "audioOutput",
                Settings.audioOutputSelect.value
            );
            Settings.updateSelectTitle(Settings.audioOutputSelect);
        });

        Settings.sampleRateSelect.addEventListener("change", () => {
            Settings.setPending("sampleRate", Settings.sampleRateSelect.value);
        });

        Settings.outputChannelsSelect.addEventListener("change", () => {
            Settings.setPending(
                "outputChannels",
                Settings.outputChannelsSelect.value
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
        Settings.resetState();
        await Settings.populateAudioDevices();
        // Silently probe if permission was already granted previously
        if (!Settings.hasDeviceLabels) {
            const status = await navigator.permissions
                .query({ name: "microphone" as PermissionName })
                .catch(() => null);
            if (status?.state === "granted") {
                await Settings.requestMicPermission();
            }
        }
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

            Settings.pending.audioInput = Settings.initial.audioInput;
            Settings.pending.audioOutput = Settings.initial.audioOutput;

            await Settings.populateAudioDevices();
            return true;
        } catch (err) {
            console.warn("Microphone access was not granted:", err);
            return false;
        } finally {
            Settings.isProbing = false;
        }
    }

    /**
     * Read currently saved settings from localStorage or fallback defaults
     */
    static getSavedSettings(): SettingsState {
        return {
            chuckVersion:
                localStorage.getItem("chuckVersion") || versionString.stable,
            audioInput: getAudioInputDevice(),
            audioOutput: getAudioOutputDevice(),
            sampleRate: getAudioSampleRate(),
            outputChannels: getAudioOutputChannels()
        };
    }

    /**
     * Reset initial and pending state back to saved settings
     */
    static resetState() {
        Settings.initial = Settings.getSavedSettings();
        Settings.pending = { ...Settings.initial };
        Settings.versionSelect.value = Settings.pending.chuckVersion;
        Settings.updateVersionDescription(Settings.pending.chuckVersion);
        Settings.populateSampleRates();
        Settings.populateOutputChannels();
        Settings.updateApplyButton();
    }

    /**
     * Update sample rate dropdown default label and selection
     */
    private static populateSampleRates() {
        const sysRate = getSystemSampleRate();
        const defaultOpt = Settings.sampleRateSelect.options[0];
        if (defaultOpt) {
            defaultOpt.text = sysRate
                ? `System Default (${sysRate})`
                : "System Default";
        }
        Settings.sampleRateSelect.value = Settings.pending.sampleRate;
        if (!Settings.sampleRateSelect.value) {
            Settings.sampleRateSelect.value = "default";
            Settings.pending.sampleRate = "default";
        }
    }

    /**
     * Populate output channel options from 1 up to maxChannelCount
     */
    private static populateOutputChannels() {
        const maxCh = getMaxOutputChannels();
        const active = Settings.pending.outputChannels;
        const select = Settings.outputChannelsSelect;

        select.innerHTML = "";
        select.add(
            new Option(
                `System Default (${maxCh})`,
                "default",
                false,
                active === "default"
            )
        );
        for (let ch = 1; ch <= maxCh; ch++) {
            select.add(
                new Option(String(ch), String(ch), false, active === String(ch))
            );
        }
        Settings.pending.outputChannels = select.value;
        Settings.initial.outputChannels = select.value;
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
     * Sync a select element's hover tooltip with its currently selected option text
     */
    private static updateSelectTitle(select: HTMLSelectElement) {
        select.title = select.selectedOptions[0]?.text || "";
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
            Settings.permissionPrompt.classList.toggle(
                "hidden",
                Settings.hasDeviceLabels
            );

            const activeInputId = Settings.hasDeviceLabels
                ? Settings.pending.audioInput
                : "default";
            const activeOutputId = Settings.hasDeviceLabels
                ? Settings.pending.audioOutput
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
            Settings.updateSelectTitle(Settings.audioInputSelect);

            // Populate Audio Outputs
            const sinkIdSupported = "setSinkId" in AudioContext.prototype;

            Settings.audioOutputSelect.disabled = !sinkIdSupported;
            Settings.fillDeviceSelect(
                Settings.audioOutputSelect,
                sinkIdSupported && Settings.hasDeviceLabels ? audioOutputs : [],
                "Output",
                "Speaker",
                sinkIdSupported ? activeOutputId : "default"
            );
            Settings.audioOutputSelect.title = sinkIdSupported
                ? Settings.audioOutputSelect.selectedOptions[0]?.text || ""
                : "This browser does not support choosing an output device";

            Settings.pending.audioInput = Settings.audioInputSelect.value;
            Settings.pending.audioOutput = Settings.audioOutputSelect.value;
        } catch (err) {
            console.error("Error communicating with audio devices:", err);
        }
    }

    /**
     * Apply settings and close modal (or reload if required)
     */
    static applySettings() {
        const needsReload = Settings.requiresReload();

        // Commit audio settings only if device labels were unlocked
        // (setters save, apply live, and no-op when unchanged)
        if (Settings.hasDeviceLabels) {
            setAudioInputDevice(Settings.pending.audioInput);
            setAudioOutputDevice(Settings.pending.audioOutput);
        }

        setAudioSampleRate(Settings.pending.sampleRate);
        setAudioOutputChannels(Settings.pending.outputChannels);

        localStorage.setItem("chuckVersion", Settings.pending.chuckVersion);
        selectChuckSrc(Settings.pending.chuckVersion === versionString.stable);

        Settings.modal.close();

        if (needsReload) {
            location.reload();
        }
    }
}
