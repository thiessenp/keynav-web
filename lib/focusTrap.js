import {getKeyFromEvent, getModifierKeyFromEvent} from './keys';

/**
 * tab/shift+tab only the list of focussable items in a Dialog
 */
export class FocusTrap {
    // No Default (document) since intended to be used in a container
    containerEl;
    
    // Holds list of activatable elements
    // NOTE: may want to add a dynamic cache encase of DOM updates on container
    items;

    // NOTE: SLOWLY addin private vars to see how Babble/child-Babble projs react
    // input[type="text"]:not([disabled]), 
    // input[type="radio"]:not([disabled]), 
    // input[type="checkbox"]:not([disabled]), 
    #events = [];
    #selectorsActiveatable = `
        a[href]:not([disabled]), 
        button:not([disabled]), 
        textarea:not([disabled]), 
        input:not([disabled]),
        select:not([disabled]), 
        [data-knw-activatable]
    `;

    constructor({containerEl, items, selectorsActiveatable, isAutoInit=true}) {
        if (!containerEl) {
            throw new Error('TabTrap contructor requires a containerEl and tabs');
        }
        this.containerEl = containerEl;

        if (items) { this.items; }
        if (selectorsActiveatable) { this.#selectorsActiveatable}

        if (isAutoInit) { 
            this.init();
        }
    }

    init() {
        // Allows a custom Items to be sent or use default to creat items[]
        if (!this.items) {
            let items = this.containerEl.querySelectorAll(this.#selectorsActiveatable);
            this.items = Array.from(items);
        }

        this.addBehavior();
    }

    addBehavior() {
        this.#events[0] = {
            topic: 'keydown',
            callback: (e) => {
                const key = getKeyFromEvent(e);
                const modifier = getModifierKeyFromEvent(e);
                const activeEl = document.activeElement;

                // Only care if it's a tab key - for forward/back focus
                if (key !== 'Tab') { return; }

                // Check back in list (shift+tab keyed)
                if (modifier === 'Shift') {
                    if (activeEl === this.getFirstItem()) {
                        e.preventDefault();
                        // Beginning of list so loop around focus the last item
                        this.getLastItem().focus();
                    }
                }
                // Check forward in list (tab keyed)
                else {
                    if(activeEl === this.getLastItem()) {
                        e.preventDefault();
                        // End of the list so loop around to the first item
                        this.getFirstItem().focus();
                    }
                }
            }
        };
        
        this.containerEl.addEventListener(
            this.#events[0].topic,
            this.#events[0].callback
        );
    }

    // TODO:
    // Think of how to deal with a zero size list better
    getFirstItem() { return this.items[0]; }
    getLastItem() { return this.items[this.items.length - 1]; }

    remove() {
        this.containerEl.removeEventListener(
            this.#events[0].topic,
            this.#events[0].callback
        );
    }
}