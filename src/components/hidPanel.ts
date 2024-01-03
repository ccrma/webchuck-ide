import { HID } from "webchuck";
import ButtonToggle from "@/components/toggle/buttonToggle";

export default class HidPanel {

    constructor(hid: HID) {
        const mouseButton = document.querySelector<HTMLButtonElement>("#mouseHIDButton")!;
        const keyboardButton = document.querySelector<HTMLButtonElement>("#keyboardHIDButton")!;

        new ButtonToggle(
            mouseButton,
            true,
            "Mouse: On",
            "Mouse: Off",
            () => hid.enableMouse(),
            () => hid.disableMouse()
        )

        new ButtonToggle(
            keyboardButton,
            true,
            "Keyboard: On",
            "Keyboard: Off",
            () => hid.enableKeyboard,
            () => hid.disableKeyboard
        )

        mouseButton.disabled = false;
        keyboardButton.disabled = false;
    }
}