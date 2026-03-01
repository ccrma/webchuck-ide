import ProjectSystem from "./projectSystem";
import Editor from "@/components/editor/monaco/editor";

const fileExplorerPanel =
    document.querySelector<HTMLDivElement>("#fileExplorerPanel")!;
const searchInput =
    document.querySelector<HTMLInputElement>("#searchInput")!;
const searchResults =
    document.querySelector<HTMLDivElement>("#searchResults")!;
const searchToggleBtn =
    document.querySelector<HTMLButtonElement>("#searchToggleBtn")!;
const searchCloseBtn =
    document.querySelector<HTMLButtonElement>("#searchCloseBtn")!;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export default class FindInProject {
    constructor() {
        searchToggleBtn.addEventListener("click", () => {
            FindInProject.show();
        });

        searchCloseBtn.addEventListener("click", () => {
            FindInProject.hide();
        });

        searchInput.addEventListener("input", () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                FindInProject.search(searchInput.value);
            }, 200);
        });

        searchInput.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                FindInProject.hide();
            }
        });
    }

    static toggle() {
        if (fileExplorerPanel.dataset.mode === "search") {
            FindInProject.hide();
        } else {
            FindInProject.show();
        }
    }

    static show() {
        fileExplorerPanel.dataset.mode = "search";
        searchInput.focus();
        searchInput.select();
    }

    static hide() {
        fileExplorerPanel.dataset.mode = "";
        searchInput.value = "";
        searchResults.innerHTML = "";
    }

    // TODO: nice to have: regex search
    static search(query: string) {
        searchResults.textContent = "";

        if (!query || query.length < 2) return;

        const files = ProjectSystem.getProjectFiles();
        const lowerQuery = query.toLowerCase();
        const fragment = document.createDocumentFragment();
        let totalMatches = 0;
        const MAX_RESULTS = 500;

        for (const file of files) {
            if (!file.isPlaintextFile()) continue;

            const data = file.isActive()
                ? Editor.getEditorCode()
                : file.getData();
            if (typeof data !== "string") continue;

            const lines = data.split("\n");
            const matches: { line: number; text: string }[] = [];

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].toLowerCase().includes(lowerQuery)) {
                    matches.push({ line: i + 1, text: lines[i].trim() });
                    if (++totalMatches >= MAX_RESULTS) break;
                }
            }

            if (matches.length === 0) continue;

            fragment.appendChild(
                createFileHeader(`${file.getFilename()} (${matches.length})`)
            );

            for (const match of matches) {
                const entry = createMatchEntry(match, query);
                entry.addEventListener("click", () => {
                    ProjectSystem.setActiveFile(file);
                    setTimeout(() => Editor.revealLine(match.line), 50);
                });
                fragment.appendChild(entry);
            }

            if (totalMatches >= MAX_RESULTS) break;
        }

        if (fragment.children.length === 0) {
            fragment.appendChild(createFileHeader("No results found"));
        }

        searchResults.appendChild(fragment);
    }
}

function createFileHeader(text: string): HTMLDivElement {
    const el = document.createElement("div");
    el.className =
        "px-1 py-0.5 font-semibold text-dark-5 dark:text-dark-a text-xs mt-1";
    el.textContent = text;
    return el;
}

function createMatchEntry(
    match: { line: number; text: string },
    query: string
): HTMLButtonElement {
    const entry = document.createElement("button");
    entry.className =
        "w-full text-left px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-dark-4 " +
        "rounded cursor-pointer flex items-baseline gap-1 focus:outline-none " +
        "focus-visible:ring-1 focus-visible:ring-blue-600";
    entry.innerHTML =
        `<span class="text-dark-5 dark:text-dark-a text-xs flex-none">${match.line}</span>` +
        `<span class="truncate">${highlightMatch(match.text, query)}</span>`;
    return entry;
}

function highlightMatch(text: string, query: string): string {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return escapeHtml(text);
    const before = text.substring(0, idx);
    const match = text.substring(idx, idx + query.length);
    const after = text.substring(idx + query.length);
    return (
        escapeHtml(before) +
        `<span class="text-orange font-semibold">${escapeHtml(match)}</span>` +
        escapeHtml(after)
    );
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
