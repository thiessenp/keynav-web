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
 *  const items = props.items || List.createListsFromDOM({
 *      selectorList: props.selectorList || '[data-knw-list]',
 *      selectorListItem: props.selectorListItem || '[data-knw-list-item]'
 *   });
 *
 *   this.lists = List.buildLists({
 *       items,
 *       activateCb: props.activateCb,
 *       deactivateCb: props.deactivateCb,
 *       focussedCb: props.focussedCb,
 *       customKeys: props.customKeys
 *   });
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

import {getKeyFromEvent, getModifierKeyFromEvent, fireKey} from './keys';

export function ListNavConfigurableBuilder(props={}) {
    const items = props.items || ListNavConfigurable.createListsFromDOM({
        selectorList: props.selectorList || '[data-knw-list]',
        selectorListItem: props.selectorListItem || '[data-knw-list-item]'
    });

    this.lists = ListNavConfigurable.buildLists({
        items,
        activateCb: props.activateCb,
        deactivateCb: props.deactivateCb,
        focussedCb: props.focussedCb,
        customKeys: props.customKeys
    });
};


export class ListNavConfigurable {
    // Delegation NOT used to allow a more flexible list structure & traversal
    items = [];

    // Stop bugs where can accidentally initialize N-Times
    isInitialized = false;

    // Interface: OPERATION: {keys: [], run: fn}
    // WARNING: run must NOT be an arrow function because would get bound to wrong `this`
    // NOTE: run functions must be bound to Class instance (`this`)
    // NOTE: cannot be a `static` property since acts on Class instance
    NAV = {
        ACTIVATE: {
            keys: ['Enter','Space'],
            // NOTE: Could use arrow functions here but since cannot in as a
            // passed prop, using normal function for clarity.
            run: function(e) {
                console.log('ACTIVATE', this);
                // Stop unwanted browser default behavior like scrolling when arrowing around
                e.preventDefault();
                const item = e.target;
                // Click done here so can use setActive in getClick without x2 click problem
                if (item) { item.click(); }
            }
        },
        NEXT: {
            keys: ['ArrowDown','ArrowRight'],
            run: (e) => {
                e.preventDefault();
                const next = this.getNext(e.target);
                this.focusCb({item: next});
            }
        },
        PREV: {
            keys: ['ArrowUp', 'ArrowLeft'],
            run: (e) => {
                e.preventDefault();
                const prev = this.getPrev(e.target);
                this.focusCb({item: prev});
            }
        },
        LAST: {
            keys: ['End'],
            run: (e) => {
                e.preventDefault();
                const last = this.getLast();
                this.focusCb({item: last});
            }
        },
        FIRST: {
            keys: ['Home'],
            run: (e) => {
                e.preventDefault();
                const first = this.getFirst();
                this.focusCb({item: first});
            }
        },
        REMOVE: {
            keys: ['Delete'],
            run: (e) => {
                e.preventDefault();
                // Assumed behavior is to fist go the next (or prev?) item 
                fireKey({target: e.target, type: 'keydown', key: 'ArrowUp'});
                // Then remove it
                this.removeItem(e.target);
            }
        }
    };

    activateCb = ({item}) => {
        if (!item) { return; }
        // Only update if el is not currently active, avoids DOM confusion
        if (item.getAttribute('tabindex') !== '0') {
            // Deactivate old active item
            const oldActiveItem = this.items.find(item => item.getAttribute('tabindex') === '0');
            this.deactivateCb({item: oldActiveItem});
            // Set new active item
            item.setAttribute('tabindex', '0');
        }
    };

    deactivateCb = ({item}) => {
        if (!item) { return; }
        if (item.getAttribute('tabindex') !== '-1') {
            item.setAttribute('tabindex', '-1');
        }   
    };

    focusCb = ({item}) => {
        if (!item) { return; }
        // Make sure attribute has a tabindex so can be focussed
        if (item.getAttribute('tabindex') !== '-1' && item.getAttribute('tabindex') !== '0') {
            item.setAttribute('tabindex', '-1');
        }
        item.focus();
    };


    constructor({items, isAutoInit=true, activateCb, deactivateCb, focusCb, customKeys}) {
        if (!items || items.length === undefined) {
            throw new Error('Error: called List constructor without items list');
        }
        this.items = Array.from(items);

        // Potentially enable callbacks for increased flexibility on item activation
        if (activateCb && typeof activateCb === 'function') {
            this.activateCb = activateCb;
        }
        if (deactivateCb && typeof deactivateCb === 'function') {
            this.deactivateCb = deactivateCb;
        }
        if (focusCb && typeof focusCb === 'function') {
            this.focusCb = focusCb;
        }

        if (customKeys) {  this.addCustomKeys(customKeys); }

        if (isAutoInit) { this.init(); }
    }

    init() {
        if (this.isInitialized) { return; }
        
        this.addBehavior();
        
        // Create an entry point by using existing Active or default to first item
        const item = this.getActive() || this.getFirst();
        // isInit is a flag for other libs using this to kickoff/filter based on it
        this.activateCb({item, isInit: true});

        this.isInitialized = true;
    }

    addBehavior() {
        //NOTE: no way to delegate since Parent > Child relationship can be any nesting
        this.items.forEach(item => {
            if (!item) { return; }
            // NOTE: keep arrow invocation this way so can call with Class's `this`
            item.addEventListener('keydown', e => { this.handleKey(e); });
            item.addEventListener('click', (e) => { this.handleClick(e); });
        });
    }

    addCustomKeys(customKeys) {
        const opperationNames = Object.keys(this.NAV);
        const customOpperationNames = Object.keys(customKeys);

        if (customOpperationNames.length > 0) {
            // NOTE: foreEach is more convenient but having to pass in a `this` 
            // context ran into weird behavior when transpiled by Babel (avoiding).
            // NOTE: map would make more sense, but using FOR for funzies.
            for (let i=0, l=opperationNames.length; i < l; i++) {
                //const operationName = opperationNames[i];

                for (let j=0, k=customOpperationNames.length; j < k; j++) {
                    const customOperationName = customOpperationNames[j];

                    // Does custom opperation already exist? Then override
                    if (this.NAV[customOperationName]) {
                        // Any keys to override on this opperation?
                        if (Array.isArray(customKeys[customOperationName].keys)) {
                            this.NAV[customOperationName].keys = customKeys[customOperationName].keys;
                        }
                        // Custom function for this opperation?
                        if (typeof customKeys[customOperationName].run === 'function') {
                            this.NAV[customOperationName].run = customKeys[customOperationName].run;
                        }
                    }
                    // Nope, add opperation but check it first TRUST NO ONE!
                    else if (customKeys[customOperationName].keys.length > 0 && 
                            typeof customKeys[customOperationName].run === 'function') {
                        this.NAV[customOperationName] = customKeys[customOperationName];
                    }
                }
            }
        }
    }

    handleKey(e) {
        // Handle case of multi-key opperations - need extra logic to make work
        // with `keydown`. (note: but if `keyup` then unable to preventDefault)
        //
        // Only care if e.g. shift + some_key (not shift + shift)
        const ignoreKeys = /Shift|Alt|Control/i;
        if (ignoreKeys.test(e.key)) { return; }
        // Combine a key combination if one exists to search for later
        const modifierKey = getModifierKeyFromEvent(e);
        const keyedKey = getKeyFromEvent(e);
        const key = modifierKey === '' ? keyedKey : `${modifierKey}+${keyedKey}`;

        // Below simulates actions on the keynav list like arrowing around, enter as a click..
        const opperations = Object.keys(this.NAV);
        // NOTE: foreEach is more convenient but having to pass in a `this` 
        // context ran into weird behavior when transpiled by Babel (avoiding).
        for (let i=0, l=opperations.length; i < l; i++) {
            let opperation = opperations[i];
            // search keys for key
            if (this.NAV[opperation].keys.indexOf(key) > -1) {
                // found? call run
                // NOTE: Strategy pattern used, important to feel smart sometimes.
                // also must call in `this` context... (fails if an arrow function)
                this.NAV[opperation].run.call(this, e);
            }
        }
    }

    handleClick(e) {
        // Case of entering list, focus this element as the entry point
        this.focusCb({item: e.target, isClick: true});
        // NOTE: no need to click, since natively done - otherwise would be double click
        // plus intention to handle click with custom behavior, so prevent it actually.
        this.activateCb({item: e.target, isClick: true});
    }

    getNext(item) {
        const index = this.items.indexOf(item);
        // Not found
        if (index < 0) { return this.items[0]; }
        // End of list
        if (!this.items[index + 1]) { return this.items[0]; }
        // Got it
        return this.items[index + 1];
    }

    getPrev(item) {
        const index = this.items.indexOf(item);
        // Not found
        if (index < 0) { return this.items[0]; }
        // Passed Begining of list
        if (!this.items[index - 1]) { return this.items[this.items.length - 1]; }
        // Got it
        return this.items[index - 1];       
    }

    getLast() {
        return this.items[this.items.length - 1];  
    }

    getFirst() {
        return this.items[0];
    }

    getActive() {
        return this.items.find(item => item.getAttribute('tabindex') === '0');
    }

    removeItem(item) {
        const removeIndex = this.items.indexOf(item);
        if (removeIndex > -1) { this.items.splice(removeIndex, 1); }
    }

    static createListsFromDOM({selectorList, selectorListItem}) {
        const containerListEls = document.querySelectorAll(selectorList);
        // Array of NodeLists
        let childListsEls = [];
        containerListEls.forEach(function(containerListEl) {
            childListsEls.push(containerListEl.querySelectorAll(selectorListItem));
        });
        return childListsEls;
    }

    static buildLists({items, activateCb, deactivateCb, customKeys}) {
        // Convert non-array to an array to make easier to work with
        items = Array.from(items);
        items = items.map(listItems => {
            if (!listItems || listItems.length === undefined) {
                throw new Error('Error: Lists addListItems received a non array like list of items in listItems');
            }
            listItems = Array.from(listItems);
            return new ListNavConfigurable({
                items: listItems,
                activateCb,
                deactivateCb,
                customKeys
            });
        });
        return items;
    }
}
