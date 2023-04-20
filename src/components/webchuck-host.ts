import type { Chuck } from "webchuck";
import { getEditorCode } from "./editor/editor";

export class WebchuckHost {
    static theChuck: Chuck;

    public static async startChuck(button: HTMLButtonElement) {
        button.disabled = true;
        const ChucK = (await import("webchuck")).Chuck;
        // const ChucK = (await import("webchuck")).Chuck;
        this.theChuck = await ChucK.init([]);

        button.innerText = "WebChucK is Ready!";
        button.disabled = true;
    }

    public static runCode(code: string) {
        this.theChuck.runCode(code);
    }

    public static removeLastCode() {
        this.theChuck.removeLastCode();
    }

    public static runEditorCode() {
        this.theChuck.runCode(getEditorCode());
    }
}
