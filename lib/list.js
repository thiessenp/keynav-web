/**
 * NOTE: Only state is items[], HTML Data attributes are used to track active to make tracking state easier
 */

import {getKeyFromEvent, fireKey} from './keys';


export class List {
    items = [];
    isInitialized = false;
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

    constructor({items, isAutoInit=true, activateCb, deactivateCb, focusCb}) {
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

    handleKey(e) {
        const key = getKeyFromEvent(e);

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
                this.focusCb({item: next});
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                const prev = this.getPrev(e.target);
                this.focusCb({item: prev});
                break;
            case 'Home':
                const first = this.getFirst();
                this.focusCb({item: first});
                break;
            case 'End':
                const last = this.getLast();
                this.focusCb({item: last});
                break;
            case 'Delete':
                // Assumed behavior is to fist go the next (or prev?) item 
                fireKey({target: e.target, type: 'keydown', key: 'ArrowUp'});
                // Then remove it
                this.removeItem(e.target);
                break;
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
