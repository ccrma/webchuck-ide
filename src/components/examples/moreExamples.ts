//-----------------------------------------------
// title: More Examples
// desc:  Browse all ChucK examples and search
//        for examples by name/keyword
//
//        Uses the moreExamples.json file containing
//        all the chuck examples
//
// author: terry feng
// date:   Janurary 2024
//-----------------------------------------------
import ProjectSystem from "@/components/fileExplorer/projectSystem";
import Examples from "./examples";
import DropdownElement from "../navbar/dropdownElement";
import * as JsSearch from "js-search";
import { fetchDataFile } from "@/utils/fileLoader";

// JSON Structure
interface MoreExamplesJSON {
    [key: string]: Array<string | Record<string, ChuckExample>>;
}
interface ChuckExample {
    name: string;
    code: string;
    data: string[];
}

// SVGS for breadcrumbs
const HOME_SVG = `<svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"> <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/> </svg>`;
const ARROW_SVG = `<svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"> <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"></path> </svg>`;

export default class MoreExamples {
    public static moreExamplesModal: HTMLDialogElement;
    public static moreExamplesSearch: HTMLInputElement;
    public static moreExamplesAutoComplete: HTMLInputElement;
    public static moreExamplesAutoCompleteList: HTMLUListElement;
    public static moreExamplesClose: HTMLButtonElement;
    public static moreExamplesLoad: HTMLButtonElement;
    public static moreExamplesBreadCrumbs: HTMLOListElement;
    public static moreExamplesExplorer: HTMLDivElement;
    public static moreExamplesPreviewName: HTMLSpanElement;
    public static moreExamplesPreviewCode: HTMLPreElement;

    private static moreExamplesJSON: MoreExamplesJSON;
    private static search: JsSearch.Search;
    private static previewExample: ChuckExample;
    private static breadCrumbPath: string[] = [];

    private static autoCompleteVisible: boolean = false;

    constructor() {
        // Create more examples button in examples navbar dropdown
        const moreExamplesDropdownItem = Examples.newExample(
            "More Examples...",
            () => {
                MoreExamples.showModal();
            }
        );
        moreExamplesDropdownItem.buttonElement.disabled = true;

        MoreExamples.moreExamplesModal =
            document.querySelector<HTMLDialogElement>("#more-examples-modal")!;
        // Search
        MoreExamples.moreExamplesSearch =
            document.querySelector<HTMLInputElement>("#more-examples-search")!;
        MoreExamples.moreExamplesAutoComplete =
            document.querySelector<HTMLInputElement>(
                "#more-examples-autocomplete"
            )!;
        MoreExamples.moreExamplesAutoCompleteList =
            document.querySelector<HTMLUListElement>("#autocomplete-list")!;
        // Explorer
        MoreExamples.moreExamplesBreadCrumbs =
            document.querySelector<HTMLOListElement>(
                "#more-examples-breadcrumbs"
            )!;
        MoreExamples.moreExamplesExplorer =
            document.querySelector<HTMLDivElement>("#more-examples-explorer")!;
        // Preview
        MoreExamples.moreExamplesPreviewName =
            document.querySelector<HTMLSpanElement>(
                "#more-examples-preview-name"
            )!;
        MoreExamples.moreExamplesPreviewCode =
            document.querySelector<HTMLPreElement>(
                "#more-examples-preview-code"
            )!;

        MoreExamples.moreExamplesClose =
            document.querySelector<HTMLButtonElement>("#more-examples-close")!;
        MoreExamples.moreExamplesLoad =
            document.querySelector<HTMLButtonElement>("#more-examples-load")!;

        MoreExamples.initMoreExamples(moreExamplesDropdownItem);
    }

    /**
     * Add event listeners to the more examples modal
     * @param moreExamplesDropdownItem button to activate
     */
    static initMoreExamples(moreExamplesDropdownItem: DropdownElement) {
        // LOAD moreExamples.json FILE!!
        // and enable the more examples button
        // Render the examples in the examples folder
        // run asynchronously
        fetch("examples/moreExamples.json")
            .then((response) => response.json())
            .then((data) => {
                MoreExamples.moreExamplesJSON = data;
                // Process the data for search
                MoreExamples.search = new JsSearch.Search("name");
                MoreExamples.search.indexStrategy =
                    new JsSearch.AllSubstringsIndexStrategy();
                MoreExamples.search.addIndex("name");
                MoreExamples.search.addIndex("code");
                MoreExamples.search.addDocuments(
                    parseJSON(MoreExamples.moreExamplesJSON)
                );
                // Starting examples folder
                MoreExamples.goToFolder("examples");

                moreExamplesDropdownItem.buttonElement.disabled = false;
            });

        // More Examples Search
        MoreExamples.moreExamplesSearch.addEventListener("input", () => {
            MoreExamples.searchExamples(MoreExamples.moreExamplesSearch.value);
            if (!MoreExamples.autoCompleteVisible) {
                MoreExamples.moreExamplesAutoComplete.classList.remove(
                    "hidden"
                );
                MoreExamples.autoCompleteVisible = true;
            }
        });
        MoreExamples.moreExamplesSearch.addEventListener(
            "click",
            (e: MouseEvent) => {
                e.stopPropagation();
                if (!MoreExamples.autoCompleteVisible) {
                    MoreExamples.moreExamplesAutoComplete.classList.remove(
                        "hidden"
                    );
                    MoreExamples.autoCompleteVisible = true;
                }
            }
        );
        MoreExamples.moreExamplesModal.addEventListener(
            "click",
            (e: MouseEvent) => {
                e.stopPropagation();
                if (MoreExamples.autoCompleteVisible) {
                    MoreExamples.moreExamplesAutoComplete.classList.add(
                        "hidden"
                    );
                    MoreExamples.autoCompleteVisible = false;
                }
                e.target === MoreExamples.moreExamplesModal &&
                    MoreExamples.hideModal();
            }
        );

        // Close Modal and Load Example Button
        MoreExamples.moreExamplesClose.addEventListener("click", () => {
            MoreExamples.hideModal();
        });
        MoreExamples.moreExamplesLoad.addEventListener("click", () => {
            MoreExamples.loadChuckFile();
            MoreExamples.hideModal();
        });
    }

    //-----------------------------------------------------------
    // EXAMPLE SEARCH
    //-----------------------------------------------------------
    /**
     * Search for examples by name/keyword
     */
    static searchExamples(query: string) {
        const results = MoreExamples.search.search(query);
        MoreExamples.populateAutoComplete(query, results);
    }

    /**
     * Populate the autocomplete with search results
     * @param query
     * @param results search results
     */
    static populateAutoComplete(query: string, results: any[]) {
        const autoComplete = MoreExamples.moreExamplesAutoCompleteList;
        autoComplete.innerHTML = "";
        const size = results.length > 5 ? 5 : results.length;
        for (let i = 0; i < size; i++) {
            const result = results[i];
            const option = document.createElement("li");
            const name = document.createElement("b");
            const code = document.createElement("span");
            name.innerHTML = highlightText(result.name, query);
            code.innerHTML =
                " - " + highlightText(focusCode(result.code, query), query);
            option.appendChild(name);
            option.appendChild(code);
            option.addEventListener("click", (event: MouseEvent) => {
                event.stopPropagation();
                MoreExamples.setPreview(result);
            });
            autoComplete.appendChild(option);
        }
    }

    /**
     * Display the current folder in the file explorer.
     * Do a lookup in the moreExamples.json file and display the examples in the folder
     * @param folder current folder in chuck more examples
     */
    static goToFolder(folder: string) {
        const contents = MoreExamples.retrieveFolderContents(folder);
        // Update BreadCrumbs
        if (MoreExamples.breadCrumbPath.includes(folder)) {
            // if folder is in breadcrumbPath, remove all elements after folder
            MoreExamples.breadCrumbPath = MoreExamples.breadCrumbPath.slice(
                0,
                MoreExamples.breadCrumbPath.indexOf(folder) + 1
            );
        } else {
            MoreExamples.breadCrumbPath.push(folder); // push
        }
        MoreExamples.renderBreadCrumbs();
        // Update Explorer
        const folders = contents.folders.sort();
        const files = contents.files.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
        // Render the folders and files
        MoreExamples.moreExamplesExplorer.innerHTML = "";
        for (let i = 0; i < folders.length; i++) {
            MoreExamples.createExplorerFolder(folders[i]);
        }
        for (let i = 0; i < files.length; i++) {
            MoreExamples.createExplorerFile(files[i]);
        }
    }

    //-----------------------------------------------------------
    // BREADCRUMBS
    //-----------------------------------------------------------
    /**
     * Render the breadcrumbs as list items
     * Read from the breadCrumbPath and render the breadcrumbs
     * Add event listeners to each breadcrumb item except the last one
     */
    static renderBreadCrumbs() {
        MoreExamples.moreExamplesBreadCrumbs.innerHTML = "";
        for (let i = 0; i < MoreExamples.breadCrumbPath.length; i++) {
            const item = document.createElement("li");
            item.classList.add("inline-flex", "items-center");
            if (i === 0) {
                // First item is home
                const button = document.createElement("button");
                button.classList.add("breadcrumb-item", "hover");
                button.innerHTML = HOME_SVG + MoreExamples.breadCrumbPath[i];
                button.addEventListener("click", () => {
                    MoreExamples.goToFolder(MoreExamples.breadCrumbPath[i]);
                });
                item.appendChild(button);
            } else if (i < MoreExamples.breadCrumbPath.length - 1) {
                // Middle items
                console.log(MoreExamples.breadCrumbPath[i]);
                const div = document.createElement("div");
                div.classList.add("flex", "items-center");
                div.innerHTML = ARROW_SVG;
                const button = document.createElement("button");
                button.classList.add("ms-1", "breadcrumb-item", "hover");
                button.innerHTML = MoreExamples.breadCrumbPath[i];
                button.addEventListener("click", () => {
                    MoreExamples.goToFolder(MoreExamples.breadCrumbPath[i]);
                });
                item.appendChild(div);
                item.appendChild(button);
            } else {
                // Last item
                const div = document.createElement("div");
                div.classList.add("flex", "items-center");
                div.innerHTML = ARROW_SVG;
                const span = document.createElement("span");
                span.classList.add("ms-1", "breadcrumb-item");
                span.innerHTML = MoreExamples.breadCrumbPath[i];
                item.appendChild(div);
                item.appendChild(span);
            }
            item.addEventListener("click", () => {
                MoreExamples.goToFolder(MoreExamples.breadCrumbPath[i]);
            });
            MoreExamples.moreExamplesBreadCrumbs.appendChild(item);
        }
    }

    //-----------------------------------------------------------
    // FILE EXPLORER
    //-----------------------------------------------------------
    /**
     * Use path list to retrieve list of files/folders from JSON object
     * @returns {Object} Object with two lists, folders and files
     */
    static retrieveFolderContents(folder: string): {
        folders: string[];
        files: ChuckExample[];
    } {
        const contents = MoreExamples.moreExamplesJSON[folder];
        const folders: string[] = [];
        const files: ChuckExample[] = [];

        for (const item in contents) {
            const value = contents[item];
            if (typeof value === "object") {
                files.push(Object.values(value)[0]);
            } else {
                folders.push(value);
            }
        }

        return { folders: folders, files: files };
    }

    /**
     * Create an item in the file explorer
     * @param name
     */
    static createExplorerFolder(name: string) {
        const item = document.createElement("button");
        item.classList.add("explorer-item", "folder");
        item.innerHTML = name;
        item.addEventListener("click", () => {
            MoreExamples.goToFolder(name);
        });
        MoreExamples.moreExamplesExplorer.appendChild(item);
    }

    static createExplorerFile(file: ChuckExample) {
        const item = document.createElement("button");
        item.classList.add("explorer-item");
        item.innerHTML = file.name;
        item.addEventListener("click", () => {
            MoreExamples.setPreview(file);
        });
        MoreExamples.moreExamplesExplorer.appendChild(item);
    }

    //-----------------------------------------------------------
    // EXAMPLE PREVIEW
    //-----------------------------------------------------------
    /**
     * Preview an example
     * @param example chuck example
     */
    static setPreview(example: { name: string; code: string; data: string[] }) {
        MoreExamples.previewExample = example;
        // Set the preview name and code
        MoreExamples.moreExamplesPreviewName.innerHTML = example.name;
        MoreExamples.moreExamplesPreviewCode.innerHTML = example.code;
    }

    /**
     * Load example from preview into editor
     */
    static loadChuckFile() {
        ProjectSystem.addNewFile(
            MoreExamples.previewExample.name,
            MoreExamples.previewExample.code
        );
        MoreExamples.previewExample.data.forEach(async (url: string) => {
            const file = await fetchDataFile(url);
            if (file !== null) {
                ProjectSystem.addNewFile(file.name, file.data);
            }
        });
        MoreExamples.hideModal();
    }

    //-----------------------------------------------------------
    // MODAL
    //-----------------------------------------------------------
    /**
     * Show the more examples modal
     */
    static showModal() {
        MoreExamples.moreExamplesModal.showModal();
    }

    /**
     * Hide the more examples modal
     */
    static hideModal() {
        MoreExamples.moreExamplesModal.close();
    }
}

// HELPER FUNCTIONS
/**
 * Process JSON file to Object[] for JsSearch
 * @param data json file
 * @returns Object[] for JsSearch
 */
function parseJSON(data: MoreExamplesJSON): ChuckExample[] {
    const parseObjects = [];
    for (const folder in data) {
        for (const file in data[folder]) {
            // if is an object
            if (typeof data[folder][file] === "object") {
                parseObjects.push(Object.values(data[folder][file])[0]);
            }
        }
    }
    return parseObjects;
}

/**
 * Find query in code and slice it out
 * @param code code to highlight
 * @param query query to highlight
 * @returns focused code
 */
function focusCode(code: string, query: string): string {
    const index = code.toLowerCase().indexOf(query.toLowerCase());
    let start = index - 15;
    let end = index + 15;
    let pre = "...";
    let post = "...";
    if (start < 0) {
        start = 0;
        pre = "";
    }
    if (end > code.length) {
        end = code.length;
        post = "";
    }
    return pre + code.slice(start, end) + post;
}

/**
 * Highlight text with query
 * @param text text to find query in
 * @param query query to highligh
 * @returns highlighted text via span
 */
function highlightText(text: string, query: string): string {
    return text.replace(query, `<span class="highlight">${query}</span>`);
}
