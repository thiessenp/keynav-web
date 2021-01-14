/**
 * Simpler version of ./list.js, main purpose is to be easier to understand or
 * copy and paste into code / similar (isolated code).
 */

export class ListNav {
    listEl;

    // Avoid a static list since size may change, dynamic lookup using a selector
    listItemsSelector;

    // Reduce DOM access by cacheing an initial User access then for future User 
    // access use the cached version for about 5 seconds before refreshing. 
    // Risk is the list could be updated during that 5 seconds and mess the UI.
    // NOTE: perf vs minor Risk may not pay off, if one or more bugs, rem cache.
    _itemsCacheTime = Date.now();
    _itemsCache;
    items = function() {
        // Use the cached list unless it's more than 10 seconds stale
        const certifiedFresh = ((Date.now() - this._itemsCacheTime)/1000) < 5;
        if (this._itemsCache && certifiedFresh) { return this._itemsCache; }

        // Stale, update the cached list
        let listItems = this.listEl.querySelectorAll(this.listItemsSelector) || [];
        listItems = Array.from(listItems);
        this._itemsCache = listItems;
        this._itemsCacheTime = Date.now();
        return listItems;
    };

    // Stop bugs where can accidentally initialize N-Times
    isInitialized = false;

    eventPointers = {};

    activateCb = ({item}) => {
        if (!item) { return; }
        // Only update if el is not currently active, avoids DOM confusion
        if (item.getAttribute('tabindex') !== '0') {
            // Deactivate old active item
            const oldActiveItem = this.items().find(item => item.getAttribute('tabindex') === '0');
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

    constructor({listEl, listItemsSelector, isAutoInit=true, activateCb, deactivateCb, focusCb}) {
        if (!listEl || !listItemsSelector) {
            throw new Error('ListSimple invoked without a valid listEl or listItemsSelector');
        }
        this.listEl = listEl;
        this.listItemsSelector = listItemsSelector;

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
        const ALLOWED_KEYS = /Enter|Space|ArrowDown|ArrowRight|ArrowUp|ArrowLeft|End|Home|Delete/;

        // Store the event function to remove later
        this.eventPointers['keydown'] = (e) => {
            // Does key match related keys?
            let key = e.key;
            if (e.code === 'Space') { key = 'Space'; } // Handle e.key space = ' '
            if (!ALLOWED_KEYS.test(key)) { return; }

            // Does target element match/contained in container?
            let listEl = e.target.closest(this.listItemsSelector);
            if (!listEl.contains(listEl)) { return; }

            // Yes, checks out, do something with the key
            this.handleKey(e, key); 
        };

        // Delegate on container
        this.listEl.addEventListener('keydown', this.eventPointers['keydown']);

        this.eventPointers['click'] = (e) => {
            // Check target element vs container to see if element we want
            let listEl = e.target.closest(this.listItemsSelector);
            if (!listEl.contains(listEl)) { return; }

            // Checks out, do something with the key
            this.handleClick(e); 
        };

        this.listEl.addEventListener('click', this.eventPointers['click']);
    }

    removeBehavior() {
        this.listEl.removeEventListener('keydown', this.eventPointers['keydown']);
        this.listEl.removeEventListener('click', this.eventPointers['click']);
    }

    handleKey(e, key) {
        if (!e || !key) { return; }

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
            case 'End':
                const last = this.getLast();
                this.focusCb({item: last});
            case 'Home':
                const first = this.getFirst();
                this.focusCb({item: first});
                break;
            case 'Delete':
                // Assumed behavior is to fist go to next (or prev?) item 
                const customKeyEvent = new KeyboardEvent('keydown', {
                    key: 'ArrowUp',
                    bubbles: true
                });
                e.target.dispatchEvent(customKeyEvent);
                // Then remove it
                this.removeItem(e.target);
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
        const index = this.items().indexOf(item);
        // Not found
        if (index < 0) { return this.items()[0]; }
        // End of list
        if (!this.items()[index + 1]) { return this.items()[0]; }
        // Got it
        return this.items()[index + 1];
    }

    getPrev(item) {
        const index = this.items().indexOf(item);
        // Not found
        if (index < 0) { return this.items()[0]; }
        // Passed Begining of list
        if (!this.items()[index - 1]) { return this.items()[this.items().length - 1]; }
        // Got it
        return this.items()[index - 1];
    }

    getLast() {
        return this.items()[this.items().length - 1];  
    }

    getFirst() {
        return this.items()[0];
    }

    getActive() {
        return this.items().find(item => item.getAttribute('tabindex') === '0');
    }

    removeItem(item) {
        const removeIndex = this.items().indexOf(item);
        if (removeIndex > -1) { this.items().splice(removeIndex, 1); }
    }
}
