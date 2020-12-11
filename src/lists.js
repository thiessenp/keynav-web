import {getKeyByEvent} from './keys';

// TODO: Delete Behavior - keying delete removes the current tab from the tab list and places focus on the previous tab.
// Static: methods nor static properties can be called on instances of the class
// Static: methods are often utility functions, such as functions to create or clone objects

export class Lists {
    initialized = false
    listItems = []

    constructor(props={}) {
        // Can either send custom list or use convenience method to creat it for you
        this.listItems = props.listItems || Lists.createListsFromDOM(props.selectorList, props.selectorListItem);
        // Convert non-array to an array to make easier to work with
        this.listItems = Array.from(this.listItems);
        // Allow delaying DOM interaction but would need to send custom list also to work
        if (props.isAutoInit !== false) {
            this.init();
        }
    }

    init() {
        if (!this.initialized) {         
            this.addListItems();
            this.initialized = true;
        }
    }

    addListItems() {
        this.listItems = this.listItems.map(items => {
            if (!items || items.length === undefined) {
                throw new Error('Error: Lists addListItems received a non array like list of items in listItems');
            }
            items = Array.from(items);
            return new List({items});
        });
    }

    static createListsFromDOM(selectorList='[data-knw-list]', selectorListItem='[data-knw-list-item]') {
        const containerListEls = document.querySelectorAll(selectorList);
        // Array of NodeLists
        let childListsEls = [];

        containerListEls.forEach(function(containerListEl) {
            childListsEls.push(containerListEl.querySelectorAll(selectorListItem));
        });

        return childListsEls;
    }
}

// NOTE: no way to delegate since Parent > Child relationship can be any nesting -- or hm mmaybe?
// NOTE: Data attribute used to track active to make tracking state easier

export class List {
    items = [];

    constructor({items, isAutoInit=true}) {
        if (!items || items.length === undefined) {
            throw new Error('Error: called List constructor without items list');
        }
        this.items = Array.from(items);
        if (isAutoInit) { this.init(); }
    }

    init() {
        this.addBehavior();
        // Create an entry point by use existing Active or default to first item
        const firstItem = this.getActive() || this.items[0];
        this.setActive(firstItem);
    }

    addBehavior() {
        this.items.forEach(item => {
            if (!item) { return; }
            // NOTE: keep arrow invocation this way so can call with Class's `this`
            item.addEventListener('keydown', e => { this.handleKey(e); });
            item.addEventListener('blur', e => { this.handleBlurr(e); });
            item.addEventListener('click', (e) => { this.handleClick(e); });
        });
    }

    handleKey(e) {
        const key = getKeyByEvent(e);

        if (key === 'Enter' || key === 'Space') {
            e.preventDefault();
            this.setActive(e.target);
            // Click done here so can use setActive in getClick without x2 click problem
            const active = this.getActive();
            if (active) { active.click(); }
        }
        else if (key === 'ArrowDown' || key === 'ArrowRight') {
            e.preventDefault();	
            const next =  this.getNext(e.target);
            this.setFocussed(next);
            next.focus();
        }
        else if (key === 'ArrowUp' || key === 'ArrowLeft') {
            e.preventDefault();
            const prev =  this.getPrev(e.target);
            this.setFocussed(prev);
            prev.focus();
        }

        // TODO:
        else if (key === 'Home') {}
        else if (key === 'End') {}        
    }

    handleClick(e) {
        // NOTE: no need to click, since natively done - otherwise would be double click
        // plus intention to handle click with custom behavior, so prevent it actually.
        this.setActive(e.target);
    }

    handleBlurr(e) {
        this.removeFocussed();
    }

    setActive(item) {
        if (!item) { return; }
        // Only update if el is not currently active, avoids DOM confusion
        if (item.getAttribute('tabindex') !== '0') {
            // Remove any old state to make way for the New Active!
            this.removeActive();
            item.setAttribute('tabindex', '0');
        }
    }

    removeActive() {
        const item = this.getActive();
        if (!item) { return; }
        item.setAttribute('tabindex', '-1');
    }

    setFocussed(item) {
        if (!item) { return; }
        // Make sure attribute has a tabindex so can be focussed
        if (item.getAttribute('tabindex') !== '-1' && item.getAttribute('tabindex') !== '0') {
            item.setAttribute('tabindex', '-1');
        }
    }

    getActive() {
        return this.items.find(item => item.getAttribute('tabindex') === '0');
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
}
