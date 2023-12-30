declare module "monaco-vim" {
    import type { monaco } from "./monacoLite";

    /**
     * Initialize Vim mode on a Monaco editor instance.
     * @param editor The editor instance to initialize Vim mode on.
     * @param status The status bar element to show Vim mode on.
     */
    export function initVimMode(
        editor: monaco.editor.IStandaloneCodeEditor,
        status?: HTMLElement | null
    ): VimMode;

    export class VimMode {
        static Vim;

        static defineEx(
            name: string,
            shorthand: string,
            callback: () => void
        ): void;
    }
}
