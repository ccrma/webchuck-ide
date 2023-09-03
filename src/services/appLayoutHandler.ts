/****************************************************************************************************
 *
 *  Description : Allows the resizing of adjacent <div> elements (right-left or top-bottom)
 *                separated by a splitter element that is also a <div>
 *
 *  Usage       : - Set the class for vertical and horizontal splitter bar divs to 'classVSplit'
 *                  and 'classHSplit' respectively.
 *                - Set the thickness of the splitter bars to 6px
 *
 *  Limitations : Works only with CSS Grid areas
 *
 *****************************************************************************************************/
import Resizer from "../components/resizer";

const CLASS_V_SPLIT: string = "vSplit";
const CLASS_H_SPLIT: string = "hSplit";

export function initAppSplitters() {
    findSplitObjects(`.${CLASS_V_SPLIT},.${CLASS_H_SPLIT}`);
}

function findSplitObjects(selector: string) {
    const splits: HTMLElement[] = Array.from(
        document.querySelectorAll(selector)
    );
    if (splits.length !== 0) {
        splits.forEach((split) => {
            let isHorizDrag = split.classList.contains(CLASS_V_SPLIT);
            new Resizer(split, isHorizDrag);
        });
    }
}
