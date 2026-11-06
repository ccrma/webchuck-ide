import js from "@eslint/js";
import globals from "globals";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
    js.configs.recommended,
    {
        ignores: [
            "dist/",
            "node_modules/",
            "**/*.d.ts",
            "src/components/monaco/chuck-lang.ts",
            "src/components/editor/monaco/chuck-lang.ts"
        ]
    },
    {
        files: ["**/*.ts", "**/*.js"],
        plugins: {
            "@typescript-eslint": tsPlugin
        },
        languageOptions: {
            parser: tsParser,
            globals: {
                ...globals.browser,
                ...globals.es2021
            }
        },
        rules: {
            // --- Formatting (match .prettierrc.json) ---
            // Indentation is left to Prettier: ESLint's `indent` rule
            // disagrees with Prettier on multi-line ternaries.
            indent: "off",
            "linebreak-style": ["error", "unix"],
            // avoidEscape matches Prettier, which uses single quotes when a
            // string contains double quotes (e.g. '[role="menuitem"]').
            quotes: [
                "error",
                "double",
                { allowTemplateLiterals: true, avoidEscape: true }
            ],
            semi: ["error", "always"],
            "comma-dangle": ["error", "never"],

            // --- TypeScript: disable base rules that TS handles better ---
            "no-undef": "off",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off",

            // --- Other disabled rules ---
            "no-useless-assignment": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-expressions": "off"
        }
    }
];
