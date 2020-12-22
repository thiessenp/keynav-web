/**
 * Adds Keyboard navigation to HTML elements through data attributes.
 * 
 * User behavior would be tabbing to the container UL and then keying down and 
 * up through the list element. Once in the list, tabbing again would either 
 * navigate to a tabable element in that list item or the next tabable element 
 * in the DOM.
 * 
 * Example Usage:
 * ```
 * // JS: Once DOM ready
 * knw.keynav.init()    // Or if using this file directly: Keynav.init()
 * 
 * // JS: Add Behavior?
 * // Each list item has a listener to trigger a click on keying Enter or Space.
 * // This way any click listeners on a list element would fire.
 * 
 * // HTML: add keynav to a list using data-knw-keynav-list
 * <h2 id="keynavUpDown-label">List of Items - nav with up or down keys</h2>
 * <ul data-knw-keynav-list id="keynavUpDown-list" aria-labelledby="keynavUpDown-label">
 *  <li tabindex="-1">List Item A</li>
 *  <li tabindex="-1" data-knw-keynav-list-active>List Item B</li>
 *  <li tabindex="-1">List Item C</li>
 * </ul>
 * ```
 */

import {List} from './list';

const Keynav = {};

// Keynav.initialized = false; -- moved into Lists so can add Keynav.init more than once - reuse in components

// May be useful, should arguably remove since not using now
Keynav.lists = [];

Keynav.init = function(props={}) {
    // if (!this.initialized) {
        const items = props.items || List.createListsFromDOM({
            selectorList: props.selectorList || '[data-knw-list]',
            selectorListItem: props.selectorListItem || '[data-knw-list-item]'
        });

        this.lists = List.buildLists({
            items,
            activateCb: props.activateCb,
            deactivateCb: props.deactivateCb,
            focussedCb: props.focussedCb
        });

        // NOTE: not very useful but keep here for now, deprecate/remove later
        // this.initialized = true;
    // }
};

export default Keynav;
