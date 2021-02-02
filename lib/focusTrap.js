import {getKeyFromEvent, getModifierKeyFromEvent} from './keys';

/**
 * tab/shift+tab only the list of focussable items in a Dialog
 */
export class FocusTrap {
    // No Default (document) since intended to be used in a container
    containerEl;
    items;
    #events = [];
    #selectorsActiveatable = `
        a[href]:not([disabled]), 
        button:not([disabled]), 
        textarea:not([disabled]), 
        input[type="text"]:not([disabled]), 
        input[type="radio"]:not([disabled]), 
        input[type="checkbox"]:not([disabled]), 
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
                if (modifier === 'Shift' && activeEl === this.getFirstItem()) {
                    // Beginning of list so loop around focus the last item
                    this.getLastItem().focus();
                }
                // Check forward in list (tab keyed)
                else if(activeEl === this.getLastItem()) {
                    // End of the list so loop around to the first item
                    this.getFirstItem().focus();
                }
            }
        };
        
        this.containerEl.addEventListener(
            this.#events[0].topic,
            this.#events[0].callback
        );
    }

    getFirstItem() { return this.items[0]; }

    getLastItem() { return this.items[this.items.length - 1]; }

    remove() {
        this.containerEl.removeEventListener(
            this.#events[0].topic,
            this.#events[0].callback
        );
    }
}