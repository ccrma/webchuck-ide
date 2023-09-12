import { monaco } from "./monacoLite";
import chuck_modules from "./chuck-modules";
import ckdocJSON from "./ckdoc.json";

// Documentation Type for ckdoc
interface docType {
    description: string[];
    method: string[];
    example: string[];
}
const ckdoc: { [key: string]: docType } = ckdocJSON;

// Register a new language for Monaco
monaco.languages.register({ id: "chuck" });

// Register a tokens provider for the language
monaco.languages.setMonarchTokensProvider("chuck", {
    // Set defaultToken to invalid to see what you do not tokenize yet
    // defaultToken: 'invalid',

    keywords: [
        "if",
        "else",
        "while",
        "until",
        "for",
        "repeat",
        "break",
        "continue",
        "return",
        "switch",
        "class",
        "extends",
        "public",
        "static",
        "pure",
        "this",
        "super",
        "interface",
        "implements",
        "protected",
        "private",
        "function",
        "fun",
        "spork",
        "new",
        "const",
        "global",
        "now",
        "true",
        "false",
        "maybe",
        "null",
        "NULL",
        "me",
        "pi",
        "samp",
        "ms",
        "second",
        "minute",
        "hour",
        "day",
        "week",
        "dac",
        "adc",
        "blackhole",
    ],

    typeKeywords: ["int", "float", "time", "dur", "void", "same"],

    operators: [
        "++",
        "--",
        ":",
        "+",
        "-",
        "*",
        "/",
        "%",
        "::",
        "==",
        "!=",
        "<",
        ">",
        "<=",
        ">=",
        "&&",
        "||",
        "&",
        "|",
        "^",
        ">>",
        "<<",
        "=",
        "?",
        "!",
        "~",
        "<<<",
        ">>>",
        "=>",
        "!=>",
        "=^",
        "@=>",
        "+=>",
        "-=>",
        "*=>",
        "/=>",
        "&=>",
        "|=>",
        "^=>",
        ">>=>",
        "<<=>",
        "%=>",
        "@",
        "@@",
        "->",
        "<-",
    ],

    // we include these common regular expressions
    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    // C# style strings
    escapes:
        /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // The main tokenizer for our languages
    tokenizer: {
        root: [
            // identifiers and keywords
            [
                /[a-z_$][\w$]*/,
                {
                    cases: {
                        "@typeKeywords": "keyword",
                        "@keywords": "keyword",
                        "@default": "identifier",
                    },
                },
            ],
            [/[A-Z][\w\$]*/, "type.identifier"], // to show class names nicely

            // whitespace
            { include: "@whitespace" },

            // delimiters and operators
            [/[{}()\[\]]/, "@brackets"],
            [/[<>](?!@symbols)/, "@brackets"],
            [
                /@symbols/,
                {
                    cases: {
                        "@operators": "operator",
                        "@default": "",
                    },
                },
            ],

            // @ annotations.
            // As an example, we emit a debugging log message on these tokens.
            // Note: message are supressed during the first load -- change some lines to see them.
            [
                /@\s*[a-zA-Z_\$][\w\$]*/,
                { token: "annotation", log: "annotation token: $0" },
            ],

            // numbers
            [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
            [/0[xX][0-9a-fA-F]+/, "number.hex"],
            [/\d+/, "number"],

            // delimiter: after number because of .\d floats
            [/[;,.]/, "delimiter"],

            // strings
            [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
            [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

            // characters
            [/'[^\\']'/, "string"],
            [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
            [/'/, "string.invalid"],
        ],

        comment: [
            [/[^\/*]+/, "comment"],
            [/\/\*/, "comment", "@push"], // nested comment
            ["\\*/", "comment", "@pop"],
            [/[\/*]/, "comment"],
        ],

        string: [
            [/[^\\"]+/, "string"],
            [/@escapes/, "string.escape"],
            [/\\./, "string.escape.invalid"],
            [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
        ],

        whitespace: [
            [/[ \t\r\n]+/, "white"],
            [/\/\*/, "comment", "@comment"],
            [/\/\/.*$/, "comment"],
        ],
    },
});

// Register a completion item provider for the new language
monaco.languages.registerCompletionItemProvider("chuck", {
    provideCompletionItems: (model, position) => {
        var word = model.getWordUntilPosition(position);
        var range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
        };

        const chuck_module_suggestions = chuck_modules.map((module: any) => {
            return {
                label: module,
                kind: monaco.languages.CompletionItemKind.Text,
                insertText: module,
                range: range,
            };
        });
        const chuck_statement_suggestions = [
            {
                label: "random",
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: "Math.random2f(${1:condition})",
                insertTextRules:
                    monaco.languages.CompletionItemInsertTextRule
                        .InsertAsSnippet,
                range: range,
            },
            {
                label: "ifelse",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: [
                    "if (${1:condition}) {",
                    "\t$0",
                    "} else {",
                    "\t",
                    "}",
                ].join("\n"),
                insertTextRules:
                    monaco.languages.CompletionItemInsertTextRule
                        .InsertAsSnippet,
                documentation: "If-Else Statement",
                range: range,
            },
            {
                label: "for",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: [
                    "for (0 => int i; i < ${1:condition}; i++)",
                    "{",
                    "\t$0",
                    "}",
                ].join("\n"),
                insertTextRules:
                    monaco.languages.CompletionItemInsertTextRule
                        .InsertAsSnippet,
                documentation: "For Statement",
                range: range,
            },
            {
                label: "while",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: ["while (${1:condition})", "{", "\t$0", "}"].join(
                    "\n"
                ),
                insertTextRules:
                    monaco.languages.CompletionItemInsertTextRule
                        .InsertAsSnippet,
                documentation: "While Statement",
                range: range,
            },
        ];

        var suggestions = chuck_module_suggestions.concat(
            chuck_statement_suggestions
        );
        return { suggestions: suggestions };
    },
});

// Register a hover provider for the new language
monaco.languages.registerHoverProvider("chuck", {
    provideHover: function (model, position) {
        // Get the word at current mouse position
        const word: monaco.editor.IWordAtPosition =
            model.getWordAtPosition(position)!; // ! TS check that word is not null
        const token: string = word?.word;

        // If we have a hover for that word
        if (chuck_modules.includes(token)) {
            const word_doc: docType = ckdoc[token];
            return {
                // Where to show the hover
                range: new monaco.Range(
                    position.lineNumber,
                    word.startColumn,
                    position.lineNumber,
                    word.endColumn
                ),
                // Hover contents
                contents: [
                    {
                        value: word_doc.description.join("\n\n"),
                    },
                    {
                        value: word_doc.method.join("\n\n"),
                    },
                    {
                        value: word_doc.example.join("\n\n"),
                    },
                ],
            };
        }

        // If we don't have a hover
        return null;
    },
});

export const editorConfig = monaco.editor.createModel("", "chuck");
