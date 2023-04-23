import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const miniAudicleLight: monaco.editor.IStandaloneThemeData = {
    base: "vs",
    inherit: true,
    rules: [
        {
            token: "",
            foreground: "000000",
        },
        {
            token: "keyword",
            foreground: "0000FF",
        },
        {
            token: "event",
            foreground: "800023",
        },
        {
            token: "library",
            foreground: "A200EC",
        },
        {
            token: "comment",
            foreground: "609010",
        },
        {
            token: "string",
            foreground: "404040",
        },
        {
            token: "number",
            foreground: "D48010",
        }


    ],
    colors: {
    },
};

export { miniAudicleLight };
