import { Gyro, Accel } from "webchuck";
import ButtonToggle from "@/components/toggle/buttonToggle";
import InputMonitor from "./inputMonitor";

// Constants
const MAX_ELEMENTS = 1;

// Document elements
const gyroButton = document.querySelector<HTMLButtonElement>("#gyroButton")!;
const gyroLog = document.querySelector<HTMLDivElement>("#gyroLog")!;
const accelButton = document.querySelector<HTMLButtonElement>("#accelButton")!;
const accelLog = document.querySelector<HTMLDivElement>("#accelLog")!;

export default class SensorPanel {
    public static gyroMonitor: InputMonitor;
    public static accelMonitor: InputMonitor;
    public static mouseActive: boolean = false;
    public static keyboardActive: boolean = false;

    constructor(gyro: Gyro, accel: Accel) {
        SensorPanel.gyroMonitor = new InputMonitor(
            gyroLog,
            MAX_ELEMENTS,
            false
        );
        SensorPanel.accelMonitor = new InputMonitor(
            accelLog,
            MAX_ELEMENTS,
            false
        );

        // Gyro
        new ButtonToggle(
            gyroButton,
            false,
            "Gyro: On",
            "Gyro: Off",
            async () => {
                if (
                    typeof (DeviceOrientationEvent as any).requestPermission ===
                    "function"
                ) {
                    await (DeviceOrientationEvent as any).requestPermission();
                }
                gyro.enableGyro();
                window.addEventListener("deviceorientation", logOrientation);
                SensorPanel.gyroMonitor.setActive(true);
            },
            () => {
                gyro.disableGyro();
                window.removeEventListener("deviceorientation", logOrientation);
                SensorPanel.gyroMonitor.setActive(false);
            }
        );

        // Accel
        new ButtonToggle(
            accelButton,
            false,
            "Accel: On",
            "Accel: Off",
            async () => {
                if (
                    typeof (DeviceMotionEvent as any).requestPermission ===
                    "function"
                ) {
                    await (DeviceMotionEvent as any).requestPermission();
                }
                accel.enableAccel();
                window.addEventListener("devicemotion", logMotion);
                SensorPanel.accelMonitor.setActive(true);
            },
            () => {
                accel.disableAccel();
                window.removeEventListener("devicemotion", logMotion);
                SensorPanel.accelMonitor.setActive(false);
            }
        );

        gyroButton.disabled = false;
        accelButton.disabled = false;
    }
}

//-----------------------------------------------------------
// EVENT HANDLERS FOR SENSOR INPUT
//-----------------------------------------------------------
function logOrientation(event: DeviceOrientationEvent) {
    const x = event.alpha ? event.alpha : 0.0;
    const y = event.beta ? event.beta : 0.0;
    const z = event.gamma ? event.gamma : 0.0;
    SensorPanel.gyroMonitor.logEvent(
        `x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, z: ${z.toFixed(2)}`
    );
}

function logMotion(event: DeviceMotionEvent) {
    if (event.acceleration === null) return;
    const x = event.acceleration.x ? event.acceleration.x : 0.0;
    const y = event.acceleration.y ? event.acceleration.y : 0.0;
    const z = event.acceleration.z ? event.acceleration.z : 0.0;
    SensorPanel.accelMonitor.logEvent(
        `x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, z: ${z.toFixed(2)}`
    );
}
