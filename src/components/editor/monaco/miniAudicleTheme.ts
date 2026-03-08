import type { monaco } from "./monacoLite";

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
            token: "type",
            foreground: "A200EC",
        },
        {
            token: "event",
            foreground: "800023",
        },
        {
            token: "library",
            foreground: "800023",
        },
        {
            token: "comment",
            foreground: "4B7A00",
        },
        {
            token: "string",
            foreground: "404040",
        },
        {
            token: "number",
            foreground: "A06000",
        },
    ],
    colors: {
        "editor.background": "#FEFEFF",
    },
};

const miniAudicleDark: monaco.editor.IStandaloneThemeData = {
    base: "vs-dark",
    inherit: true,
    rules: [
        // {
        //     token: "keyword",
        //     foreground: "9999ff",
        // },
        {
            token: "type",
            foreground: "d07ff5",
        },
        {
            token: "event",
            foreground: "800023",
        },
        {
            token: "library",
            foreground: "a64c65",
        },
        {
            token: "comment",
            foreground: "6A9956",
        },
        // {
        //     token: "string",
        //     foreground: "a0a0a0",
        // },
        {
            token: "number",
            foreground: "E49020",
        },
    ],
    colors: {},
};

export { miniAudicleLight, miniAudicleDark };
