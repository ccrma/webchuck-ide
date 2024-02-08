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
import ProjectSystem from "@/components/projectSystem";
import Examples from "./examples";
import DropdownElement from "../dropdownElement";
import * as JsSearch from 'js-search';
import { fetchDataFile } from "@/utils/fileLoader";


export default class MoreExamples {
    public static moreExamplesModal: HTMLDialogElement;
    public static moreExamplesSearch: HTMLInputElement;
    public static moreExamplesAutoComplete: HTMLInputElement;
    public static moreExamplesAutoCompleteList: HTMLUListElement;
    public static moreExamplesClose: HTMLButtonElement;
    public static moreExamplesLoad: HTMLButtonElement;

    private static moreExamplesJSON: any;
    private static search: JsSearch.Search;

    private static autoCompleteVisible: boolean = false;

    constructor() {
        // Create more examples button in examples navbar dropdown
        const moreExamplesDropdownItem = Examples.newExample("More Examples...", () => {
            MoreExamples.showMoreExamples();
        });
        moreExamplesDropdownItem.buttonElement.disabled = true;

        MoreExamples.moreExamplesModal =
            document.querySelector<HTMLDialogElement>("#more-examples-modal")!;
        MoreExamples.moreExamplesSearch =
            document.querySelector<HTMLInputElement>("#more-examples-search")!;
        MoreExamples.moreExamplesAutoComplete =
            document.querySelector<HTMLInputElement>("#more-examples-autocomplete")!;
        MoreExamples.moreExamplesAutoCompleteList
            = document.querySelector<HTMLUListElement>("#autocomplete-list")!;
        MoreExamples.moreExamplesClose =
            document.querySelector<HTMLButtonElement>("#more-examples-close")!;
        MoreExamples.moreExamplesLoad =
            document.querySelector<HTMLButtonElement>("#more-examples-load")!;

        MoreExamples.initMoreExamples(moreExamplesDropdownItem);

        MoreExamples.showMoreExamples();
    }

    /**
     * Add event listeners to the more examples modal
     * @param moreExamplesDropdownItem button to activate
     */
    static initMoreExamples(moreExamplesDropdownItem: DropdownElement) {
        // Load all examples from moreExamples.json
        // and enable the more examples button
        // run asynchronously
        fetch("/examples/moreExamples.json")
            .then((response) => response.json())
            .then((data) => {
                MoreExamples.moreExamplesJSON = data;
                moreExamplesDropdownItem.buttonElement.disabled = false;
                // Process the data
                MoreExamples.search = new JsSearch.Search("name");
                MoreExamples.search.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
                MoreExamples.search.addIndex("name");
                MoreExamples.search.addIndex("code");
                // MoreExamples.search.addIndex("code");
                MoreExamples.search.addDocuments(parseJSON(data));
            });

        // More Examples Search
        MoreExamples.moreExamplesSearch.addEventListener("input", () => {
            MoreExamples.searchExamples(MoreExamples.moreExamplesSearch.value);
            if (!MoreExamples.autoCompleteVisible) {
                MoreExamples.moreExamplesAutoComplete.classList.remove("hidden");
                MoreExamples.autoCompleteVisible = true;
            }
        });
        MoreExamples.moreExamplesSearch.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            if (!MoreExamples.autoCompleteVisible) {
                MoreExamples.moreExamplesAutoComplete.classList.remove("hidden");
                MoreExamples.autoCompleteVisible = true;
            }
        });
        MoreExamples.moreExamplesModal.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            if (MoreExamples.autoCompleteVisible) {
                MoreExamples.moreExamplesAutoComplete.classList.add("hidden");
                MoreExamples.autoCompleteVisible = false;
            }
            e.target === MoreExamples.moreExamplesModal && MoreExamples.hideMoreExamples();
        });

        // Close Modal and Load Example Button
        MoreExamples.moreExamplesClose.addEventListener("click", () => {
            MoreExamples.hideMoreExamples();
        });
        MoreExamples.moreExamplesLoad.addEventListener("click", () => {
            MoreExamples.loadExample();
            MoreExamples.hideMoreExamples();
        });
    }

    /**
     * Search for examples by name/keyword
     */
    static searchExamples(query: string) {
        const results = MoreExamples.search.search(query);
        MoreExamples.populateAutoComplete(query, results);
    }

    /**
     * Populate the autocomplete with search results
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
            code.innerHTML = " - " + highlightText(focusCode(result.code, query), query) + "...";
            option.appendChild(name);
            option.appendChild(code);
            option.addEventListener("click", () => {
                // TODO: Make this preload
                ProjectSystem.addNewFile(result.name, result.code);
                result.data.forEach(async (url: string) => {
                    const file = await fetchDataFile(url);
                    ProjectSystem.addNewFile(file.name, file.data);
                });
                MoreExamples.hideMoreExamples();
            });
            autoComplete.appendChild(option);
        }
    }

    static loadExample() {
        ProjectSystem.addNewFile("example.ck", "Hello World!");
        MoreExamples.hideMoreExamples();
    }

    static showMoreExamples() {
        MoreExamples.moreExamplesModal.showModal();
    }

    static hideMoreExamples() {
        MoreExamples.moreExamplesModal.close();
    }
}

// HELPER FUNCTIONS
/**
 * Process JSON file to Object[] for JsSearch
 * @param data json file
 * @returns Object[] for JsSearch
 */
function parseJSON(data: any): any[] {
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
    const start = index - 15 > 0 ? index - 10 : 0;
    const end = index + 15 < code.length ? index + 10 : code.length;
    return code.slice(start, end);
}

function highlightText(text: string, query: string): string {
    return text.replace(query, `<span style="background-color: #FA3">${query}</span>`);
}