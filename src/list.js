import {getKeyByEvent} from './keys';

// TODO: Delete Behavior - keying delete removes the current tab from the tab list and places focus on the previous tab.

// Static: methods nor static properties can be called on instances of the class
// Static: methods are often utility functions, such as functions to create or clone objects

// NOTE: Only state is items[], Data attribute used to track active to make tracking state easier
// NOTE: no way to delegate since Parent > Child relationship can be any nesting -- or hm mmaybe?

export class List {
    items = [];
    activateCb = (item) => {
        if (!item) { return; }
        // Only update if el is not currently active, avoids DOM confusion
        if (item.getAttribute('tabindex') !== '0') {
            console.log('0')
            item.setAttribute('tabindex', '0');
        }
    };
    deactivateCb = (item) => {
        if (!item) { return; }
        if (item.getAttribute('tabindex') !== '-1') {
            console.log('-1')
            item.setAttribute('tabindex', '-1');
        }   
    };

    constructor({items, isAutoInit=true, activateCb, deactivateCb}) {
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
            item.addEventListener('click', (e) => { this.handleClick(e); });
        });
    }

    handleKey(e) {
        const key = getKeyByEvent(e);

        // Simulates a Click
        if (key === 'Enter' || key === 'Space') {
            e.preventDefault();
            // Click done here so can use setActive in getClick without x2 click problem
            const item = e.target;
            if (item) { item.click(); }
        }
        // Simulates moving focus UP the list using keys
        else if (key === 'ArrowDown' || key === 'ArrowRight') {
            e.preventDefault();	
            const next =  this.getNext(e.target);
            this.setFocussed(next);
            next.focus();
        }
        // Simulates moving focus DOWN the list using keys
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

    setActive(item) {
        // NOTE: Could also place in Callback but then requires knowledge of innerworkings (Comprise here)
        // Remove any old state to make way for the New Active!
        this.removeActive();
        this.activateCb(item);
    }

    removeActive() {
        const item = this.getActive();
        this.deactivateCb(item);
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

    static createListsFromDOM(selectorList='[data-knw-list]', selectorListItem='[data-knw-list-item]') {
        const containerListEls = document.querySelectorAll(selectorList);
        // Array of NodeLists
        let childListsEls = [];

        containerListEls.forEach(function(containerListEl) {
            childListsEls.push(containerListEl.querySelectorAll(selectorListItem));
        });

        return childListsEls;
    }

    static buildKeynavLists({listItems, selectorList, selectorListItem, activateCb, deactivateCb}) {
        // Can either send custom list or use convenience method to creat it for you
        listItems = listItems || List.createListsFromDOM(selectorList, selectorListItem);

        // Convert non-array to an array to make easier to work with
        listItems = Array.from(listItems);

        listItems = listItems.map(items => {
            if (!items || items.length === undefined) {
                throw new Error('Error: Lists addListItems received a non array like list of items in listItems');
            }
            items = Array.from(items);
            return new List({
                items,
                selectorList,
                selectorListItem,
                activateCb,
                deactivateCb
            });
        });

        return listItems;
    }
}
