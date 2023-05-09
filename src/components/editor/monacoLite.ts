// Monaco is too big so we import only the necessary parts
import 'monaco-editor/esm/vs/editor/editor.all.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export { monaco };

/*--------------------------  Monaco Web Worker --------------------------*/
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

self.MonacoEnvironment = {
    getWorker(_: any) {
        return new editorWorker();
    },
};
