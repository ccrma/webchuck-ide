// Monaco is too big so we import only the necessary parts
// TODO: this actually is not working, it's still bundling all of the languages...
import 'monaco-editor/esm/vs/editor/editor.main.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export default monaco;

/*--------------------------  Monaco Web Worker --------------------------*/
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

self.MonacoEnvironment = {
    getWorker(_: any) {
        return new editorWorker();
    },
};
