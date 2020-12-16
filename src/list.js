/**
 * NOTE: Only state is items[], HTML Data attributes are used to track active to make tracking state easier
 */

import {getKeyByEvent} from './keys';


export class List {
    items = [];
    activateCb = (item) => {
        if (!item) { return; }
        // Only update if el is not currently active, avoids DOM confusion
        if (item.getAttribute('tabindex') !== '0') {
            // Deactivate old active item
            const oldActiveItem = this.items.find(item => item.getAttribute('tabindex') === '0');
            this.deactivateCb(oldActiveItem);
            // Set new active item
            item.setAttribute('tabindex', '0');
        }
    };
    deactivateCb = (item) => {
        if (!item) { return; }
        if (item.getAttribute('tabindex') !== '-1') {
            item.setAttribute('tabindex', '-1');
        }   
    };
    focussedCb = (item) => {
        if (!item) { return; }
        // Make sure attribute has a tabindex so can be focussed
        if (item.getAttribute('tabindex') !== '-1' && item.getAttribute('tabindex') !== '0') {
            item.setAttribute('tabindex', '-1');
        }
        item.focus();
    };

    constructor({items, isAutoInit=true, activateCb, deactivateCb, focussedCb}) {
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
        if (focussedCb && typeof focussedCb === 'function') {
            this.focussedCb = focussedCb;
        }

        if (isAutoInit) { this.init(); }
    }

    init() {
        this.addBehavior();
        // Create an entry point by using existing Active or default to first item
        const firstItem = this.getActive() || this.getFirst();
        this.activateCb(firstItem);
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

    handleKey(e) {
        const key = getKeyByEvent(e);

        // List of keys part of behavior, if not do nothing
        // NOTE: have to add key here and switch, difficult to maintain?
        if(!/^Arrow[Up|Down|Right|Left]|Enter|Space|Home|End|Delete/.test(key)) { return; }

        // Stop unwanted browser default behavior like scrolling when arrowing around
        e.preventDefault();

        // Below simulates actions on the keynav list like arrowing around, enter as a click..
        switch(key) {
            case 'Enter':
            case 'Space':
                const item = e.target;
                // Click done here so can use setActive in getClick without x2 click problem
                if (item) { item.click(); }
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                const next = this.getNext(e.target);
                this.focussedCb(next);
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                const prev = this.getPrev(e.target);
                this.focussedCb(prev);
                break;
            case 'Home':
                const first = this.getFirst();
                this.focussedCb(first);
                break;
            case 'End':
                const last = this.getLast();
                this.focussedCb(last);
                break;
            case 'Delete':
                // Assumed behavior, is to then go the next item (prev?)
                const customKeyEvent = new KeyboardEvent('keydown', {key: 'ArrowUp', code: 'ArrowUp', which: 38});
                e.target.dispatchEvent(customKeyEvent);
                // Then remove it
                this.removeItem(e.target);
                break;
        }    
    }

    handleClick(e) {
        // Case of entering list, focus this element as the entry point
        this.focussedCb(e.target);
        // NOTE: no need to click, since natively done - otherwise would be double click
        // plus intention to handle click with custom behavior, so prevent it actually.
        this.activateCb(e.target);
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

    static buildLists({items, activateCb, deactivateCb}) {
        // Convert non-array to an array to make easier to work with
        items = Array.from(items);
        items = items.map(listItems => {
            if (!listItems || listItems.length === undefined) {
                throw new Error('Error: Lists addListItems received a non array like list of items in listItems');
            }
            listItems = Array.from(listItems);
            return new List({
                items: listItems,
                activateCb,
                deactivateCb
            });
        });
        return items;
    }
}
