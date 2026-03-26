// Monaco is too big so we import only the necessary parts
import "monaco-editor/esm/vs/editor/editor.all.js";
// Command palette (quick access) support
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export { monaco };

/*--------------------------  Monaco Web Worker --------------------------*/
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

self.MonacoEnvironment = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getWorker(_: any) {
        return new editorWorker();
    },
};
