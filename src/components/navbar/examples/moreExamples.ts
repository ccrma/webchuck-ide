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


export default class MoreExamples {
    public static moreExamplesModal: HTMLDialogElement;
    public static moreExamplesSearch: HTMLInputElement;
    public static moreExamplesAutoComplete: HTMLInputElement;
    public static moreExamplesClose: HTMLButtonElement;
    public static moreExamplesLoad: HTMLButtonElement;

    private static moreExamplesJSON: any;

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
        MoreExamples.moreExamplesClose =
            document.querySelector<HTMLButtonElement>("#more-examples-close")!;
        MoreExamples.moreExamplesLoad =
            document.querySelector<HTMLButtonElement>("#more-examples-load")!;

        MoreExamples.initMoreExamples(moreExamplesDropdownItem);

        MoreExamples.showMoreExamples();
    }

    /**
     * Add event listeners to the more examples modal
     */
    static initMoreExamples(moreExamplesDropdownItem: DropdownElement) {
        // Load all examples from moreExamples.json
        // and enable the more examples button
        fetch("/examples/moreExamples.json")
            .then((response) => response.json())
            .then((data) => {
                MoreExamples.moreExamplesJSON = data;
                moreExamplesDropdownItem.buttonElement.disabled = false;
            });

        // More Examples Search
        MoreExamples.moreExamplesSearch.addEventListener("input", () => {
            MoreExamples.searchExamples(MoreExamples.moreExamplesSearch.value);
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
    static searchExamples(search: string) {
        const lowerSearch = search.toLowerCase();
        // search json file for examples
        const results = MoreExamples.moreExamplesJSON.filter((example: any) => {
            return example.name.toLowerCase().includes(lowerSearch) || example.keywords.some((keyword: string) => keyword.toLowerCase().includes(lowerSearch));
        });

        console.log(results);
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