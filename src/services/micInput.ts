//--------------------------------------------------------
// title: Mic Input
// desc:  Microphone input to ChucK (adc). Owns the mic
//        stream lifecycle (off / connecting / on), the
//        selected input device, and its persistence.
//
//        Requests are versioned so a newer connect or a
//        disconnect cancels any pending getUserMedia call.
//
// author: terry feng
// date:   October 2026
//--------------------------------------------------------

import { audioContext, theChuck } from "@/host";
import Console from "@/components/outputPanel/console";

export type InputState = "off" | "connecting" | "on";
type InputStateCallback = (state: InputState) => void;

const STORAGE_KEY = "audioInputDevice";

let state: InputState = "off";
let requestId: number = 0;
let selectedDeviceId: string = localStorage.getItem(STORAGE_KEY) || "default";
let currentStream: MediaStream | null = null;
let currentAdcNode: MediaStreamAudioSourceNode | null = null;
const callbacks: InputStateCallback[] = [];

/**
 * Subscribe to microphone state changes
 */
export function onMicStateChange(callback: InputStateCallback): void {
    callbacks.push(callback);
}

function setState(next: InputState) {
    state = next;
    callbacks.forEach((cb) => cb(next));
}

/**
 * Check if microphone stream is currently active
 */
export function isMicConnected(): boolean {
    return state === "on";
}

/**
 * Check if a microphone connection is pending (e.g. awaiting permission)
 */
export function isMicConnecting(): boolean {
    return state === "connecting";
}

/**
 * Get the selected (saved) audio input device ID
 */
export function getAudioInputDevice(): string {
    return selectedDeviceId;
}

/**
 * Set and save the preferred audio input device, switching live if the mic
 * is already active (or connecting)
 */
export async function setAudioInputDevice(deviceId: string): Promise<void> {
    if (deviceId === selectedDeviceId) {
        return;
    }
    selectedDeviceId = deviceId;
    localStorage.setItem(STORAGE_KEY, deviceId);
    if (state !== "off") {
        await connectMic();
    }
}

/**
 * Connect (or switch) the selected microphone into theChuck
 */
export async function connectMic(): Promise<boolean> {
    if (!audioContext || !theChuck) {
        return false;
    }

    const id = ++requestId;

    // Only show a pending state when turning the mic on from off. When
    // switching devices live, the current stream keeps playing (and the
    // button stays "on") until the new stream replaces it.
    if (state === "off") {
        setState("connecting");
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
                echoCancellation: false,
                autoGainControl: false,
                noiseSuppression: false,
                ...(selectedDeviceId !== "default"
                    ? { deviceId: { ideal: selectedDeviceId } }
                    : {})
            }
        });

        // If another connect or disconnect occurred while waiting, discard this stream
        if (id !== requestId) {
            stream.getTracks().forEach((track) => track.stop());
            return false;
        }

        // Replace previous mic stream only after new stream is ready
        releaseStream();

        // Listen for hardware disconnection or permission revocation
        stream.getAudioTracks()[0]?.addEventListener("ended", () => {
            if (currentStream === stream) {
                disconnectMic();
            }
        });

        currentStream = stream;
        currentAdcNode = audioContext.createMediaStreamSource(stream);
        currentAdcNode.connect(theChuck);
        setState("on");
        return true;
    } catch (err) {
        // Superseded requests are handled by whoever superseded them
        if (id !== requestId) {
            return false;
        }
        // A failed device switch keeps the existing stream
        setState(currentStream ? "on" : "off");
        console.error("Failed to connect microphone:", err);
        Console.print(`\x1b[31m${describeMicError(err)}\x1b[0m`);
        return false;
    }
}

/**
 * Disconnect and stop the microphone stream (also cancels a pending connect)
 */
export function disconnectMic(): void {
    ++requestId;
    releaseStream();
    setState("off");
}

function releaseStream() {
    currentAdcNode?.disconnect();
    currentAdcNode = null;
    currentStream?.getTracks().forEach((track) => track.stop());
    currentStream = null;
}

/**
 * Human-readable message for a getUserMedia failure
 */
function describeMicError(err: unknown): string {
    const name = err instanceof DOMException ? err.name : "";
    switch (name) {
        case "NotAllowedError":
            return "microphone permission denied";
        case "NotFoundError":
            return "no microphone input device found";
        case "NotReadableError":
            return "microphone is in use or unavailable";
        default:
            return "failed to connect microphone";
    }
}
