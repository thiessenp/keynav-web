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


export class Keynav {
    // Moving to delegation - NOPE > Delegation NOT used to allow a more flexible list structure & traversal
    // items = [];

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
      if (this._itemsCache && certifiedFresh) {
        return this._itemsCache;
      }

      // Stale, update the cached list
      let listItems = this.listEl.querySelectorAll(this.listItemsSelector) || [];
      listItems = Array.from(listItems);
      this._itemsCache = listItems;
      this._itemsCacheTime = Date.now();
      return listItems;
    };

    // Stop bugs where can accidentally initialize N-Times
    isInitialized = false;

    // Stores any added behavior for use with removing that behavior later
    eventPointers = {};

    // Default key behavior, override by passing customKeys to the constructor
    // customKeys Interface: 
    //    OPERATION: {keys: [], run: fn}
    //
    // WARNING: run must NOT be an arrow function because would get bound to wrong `this`
    // NOTE: run functions must be bound to Class instance (`this`)
    // NOTE: cannot be a `static` property since acts on Class instance
    NAV = {
      ACTIVATE: {
        keys: ['Enter', 'Space'],
        // NOTE: Could use arrow functions here but since cannot in as a
        // passed prop, using normal function for clarity.
        run: function(e) {
          console.log('ACTIVATE', this);
          // Stop unwanted browser default behavior like scrolling when arrowing around
          e.preventDefault();
          const item = e.target;
          // Click done here so can use setActive in getClick without x2 click problem
          if (item) {
            item.click();
          }
        },
      },
      NEXT: {
        keys: ['ArrowDown', 'ArrowRight'],
        run: (e) => {
          console.log(1)
          e.preventDefault();
          const next = this.getNext(e.target);
          this.focusCb({item: next});
        },
      },
      PREV: {
        keys: ['ArrowUp', 'ArrowLeft'],
        run: (e) => {
          e.preventDefault();
          const prev = this.getPrev(e.target);
          this.focusCb({item: prev});
        },
      },
      LAST: {
        keys: ['End'],
        run: (e) => {
          e.preventDefault();
          const last = this.getLast();
          this.focusCb({item: last});
        },
      },
      FIRST: {
        keys: ['Home'],
        run: (e) => {
          e.preventDefault();
          const first = this.getFirst();
          this.focusCb({item: first});
        },
      },
      // TODO: fix to work with cache, probably using a flag vs removing item
      REMOVE: {
        keys: ['Delete'],
        run: (e) => {
          e.preventDefault();
          // Assumed behavior is to fist go the next (or prev?) item
          fireKey({target: e.target, type: 'keydown', key: 'ArrowUp'});
          // Then remove it
          this.removeItem(e.target);
        },
      },
    };

    activateCb = ({item}) => {
      if (!item) {
        return;
      }
      // Only update if el is not currently active, avoids DOM confusion
      if (item.getAttribute('tabindex') !== '0') {
        // Deactivate old active item
        const oldActiveItem = this.items().find((item) => item.getAttribute('tabindex') === '0');
        this.deactivateCb({item: oldActiveItem});
        // Set new active item
        item.setAttribute('tabindex', '0');
      }
    };

    deactivateCb = ({item}) => {
      if (!item) {
        return;
      }
      if (item.getAttribute('tabindex') !== '-1') {
        item.setAttribute('tabindex', '-1');
      }
    };

    focusCb = ({item}) => {
      if (!item) {
        return;
      }
      // Make sure attribute has a tabindex so can be focussed
      if (item.getAttribute('tabindex') !== '-1' && item.getAttribute('tabindex') !== '0') {
        item.setAttribute('tabindex', '-1');
      }
      item.focus();
    };

    /**
     * Creates a ListNav.
     * @param {Element} listEl - container element to add the list behavior to
     * @param {String} listItemsSelector - select to use to find list item elements
     * @param {Boolean} isAutoInit - (optional) whether to initialise the Class automatically (default=true)
     * @param {Function} activateCb - (optional) callback function to override the default activation behavior
     * @param {Function} deactivateCb - (optional) callback function to overide the default deactivate behavior
     * @param {Function} focusCb - (optional) callback function to overide the default focus behavior
     * @param {Object} customKeys - (optional) any custom keys, overrides defaults
     */
    // constructor({items, isAutoInit=true, activateCb, deactivateCb, focusCb, customKeys}) {
    constructor({listEl, listItemsSelector, isAutoInit=true, activateCb, deactivateCb, focusCb, customKeys}) {
      // if (!items || items.length === undefined) {
      //   throw new Error('Error: called List constructor without items list');
      // }
      // this.items = Array.from(items);

      if (!listEl || !listItemsSelector) {
        throw new Error('Keynav invoked without a valid listEl or listItemsSelector');
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

      if (customKeys) {
        this.addCustomKeys(customKeys);
      }

      if (isAutoInit) {
        this.init();
      }
    }

    init() {
      if (this.isInitialized) {
        return;
      }

      this.addBehavior();

      // Create an entry point by using existing Active or default to first item
      const item = this.getActive() || this.getFirst();
      // isInit is a flag for other libs using this to kickoff/filter based on it
      this.activateCb({item, isInit: true});

      this.isInitialized = true;
    }

    /**
     * Adds behavior using an event to the list element. The event can later be
     * removed using removeBehavior()
     */
    addBehavior() {
      // Delegate using Selectors
      // NOPE > NOTE: no way to delegate since Parent > Child relationship can be any nesting
      // this.items.forEach((item) => {
      //   if (!item) {
      //     return;
      //   }
      //   // NOTE: keep arrow invocation this way so can call with Class's `this`
      //   item.addEventListener('keydown', (e) => {
      //     this.handleKey(e);
      //   });
      //   item.addEventListener('click', (e) => {
      //     this.handleClick(e);
      //   });
      // });

      // TODO: make configureable
      const ALLOWED_KEYS = /Enter|Space|ArrowDown|ArrowRight|ArrowUp|ArrowLeft|End|Home|Delete/;

      // Store the event function to remove later
      this.eventPointers['keydown'] = (e) => {
        // Does key match related keys?
        let key = e.key;
        if (e.code === 'Space') {
          key = 'Space';
        } // Handle e.key space = ' '
        if (!ALLOWED_KEYS.test(key)) {
          return;
        }

        // Does target element match/contained in container?
        const listEl = e.target.closest(this.listItemsSelector);
        if (!listEl || !listEl.contains(listEl)) {
          return;
        }

        // Yes, checks out, do something with the key
        this.handleKey(e, key);
      };

      // Delegate on container
      this.listEl.addEventListener('keydown', this.eventPointers['keydown']);

      this.eventPointers['click'] = (e) => {
        // Check target element vs container to see if element we want
        const listEl = e.target.closest(this.listItemsSelector);
        if (!listEl || !listEl.contains(listEl)) {
          return;
        }

        // Checks out, do something with the key
        this.handleClick(e);
      };

      this.listEl.addEventListener('click', this.eventPointers['click']);
    }

    /**
     * Removes any event listeners added by the list nav
     */
     removeBehavior() {
      this.listEl.removeEventListener('keydown', this.eventPointers['keydown']);
      this.listEl.removeEventListener('click', this.eventPointers['click']);
    }

    /**
     * Used to override the default keys with any custom keys
     * 
     * Custom Keys Interface:
     * { OPERATION_STRING: {keys: [KEY_NAME], run: ACTION_FUNCTION} }
     * 
     * Example:
     * { 
     *    NEXT: {
     *      keys: ['ArrowDown', 'ArrowRight'], 
     *      // Has access to event and instance `this`
     *      run: function(e) {console.log('next', e, this)}} 
     * }
     * 
     * @param {Object} customKeys keys to override default behavior
     */
    addCustomKeys(customKeys) {
      const opperationNames = Object.keys(this.NAV);
      const customOpperationNames = Object.keys(customKeys);

      if (customOpperationNames.length > 0) {
        // NOTE: foreEach is more convenient but having to pass in a `this`
        // context ran into weird behavior when transpiled by Babel (avoiding).
        // NOTE: map would make more sense, but using FOR for funzies.
        for (let i=0, l=opperationNames.length; i < l; i++) {
          // const operationName = opperationNames[i];

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
      if (ignoreKeys.test(e.key)) {
        return;
      }
      // Combine a key combination if one exists to search for later
      const modifierKey = getModifierKeyFromEvent(e);
      const keyedKey = getKeyFromEvent(e);
      const key = modifierKey === '' ? keyedKey : `${modifierKey}+${keyedKey}`;

      // Below simulates actions on the keynav list like arrowing around, enter as a click..
      const opperations = Object.keys(this.NAV);
      // NOTE: foreEach is more convenient but having to pass in a `this`
      // context ran into weird behavior when transpiled by Babel (avoiding).
      for (let i=0, l=opperations.length; i < l; i++) {
        const opperation = opperations[i];
        // search keys for key
        if (this.NAV[opperation].keys.indexOf(key) > -1) {
          // found? call run
          // NOTE: Strategy pattern used, important to feel smart sometimes.
          // also must call in `this` context... (fails if an arrow function)
          this.NAV[opperation].run.call(this, e);
        }
      }
    }

    /**
     * @param {Event} e - document event to use to handle the click (focus/activate)
     */
    handleClick(e) {
      // Case of entering list, focus this element as the entry point
      this.focusCb({item: e.target, isClick: true});
      // NOTE: no need to click, since natively done - otherwise would be double click
      // plus intention to handle click with custom behavior, so prevent it actually.
      this.activateCb({item: e.target, isClick: true});
    }

    /**
     * @param {Element} item - the element to use as current.
     * @return {Element} next item from the current item in the list of nav items.
     * If the end of the list is reached, the first item is returned.
     */
    getNext(item) {
      const index = this.items().indexOf(item);
      // Not found
      if (index < 0) {
        return this.items()[0];
      }
      // End of list
      if (!this.items()[index + 1]) {
        return this.items()[0];
      }
      // Got it
      return this.items()[index + 1];
    }

    /**
     * @param {Element} item - the element to use as current.
     * @return {Element} previous item from the current item in the list of nav items.
     * If the end of the list is reached, the last item is returned.
     */
    getPrev(item) {
      const index = this.items().indexOf(item);
      // Not found
      if (index < 0) {
        return this.items()[0];
      }
      // Passed Begining of list
      if (!this.items()[index - 1]) {
        return this.items()[this.items().length - 1];
      }
      // Got it
      return this.items()[index - 1];
    }

    /**
     * @return {Element} last item in items.
     */
    getLast() {
      return this.items()[this.items().length - 1];
    }

    /**
     * @return {Element} first item in items.
     */
    getFirst() {
      return this.items()[0];
    }

    /**
     * @return {Element} currently active element in the items.
     */
    getActive() {
      return this.items().find((item) => item.getAttribute('tabindex') === '0');
    }

    /**
     * @param {Element} item - the element to remove from the list of nav items.
     */
    removeItem(item) {
      const removeIndex = this.items().indexOf(item);
      if (removeIndex > -1) {
        this.items().splice(removeIndex, 1);
      }
    }

    ////////////////////////////////////////////////////////////////////////////
    // DEPRECATED BELOW
    ////////////////////////////////////////////////////////////////////////////

    /**
     * @deprecated
     * Would like to remove for simplicity and focus on just Keynav
     * Do API stuff in Libs that use this
     * 
     * Use to create a static list of items (Using Delegation via selector instead)
     * 
     * @param {String} selectorList
     * @param {Array} selectorListItem
     * @returns 
     */
    static createListsFromDOM({selectorList, selectorListItem}) {
      const containerListEls = document.querySelectorAll(selectorList);
      // Array of NodeLists
      const childListsEls = [];
      containerListEls.forEach(function(containerListEl) {
        childListsEls.push(containerListEl.querySelectorAll(selectorListItem));
      });
      return childListsEls;
    }

    /**
     * @deprecated
     * Would like to remove for simplicity and focus on just Keynav
     * Do API stuff in Libs that use this
     * 
     * Use to create a static list of items (Using Delegation via selector instead)
     * 
     * Creates a ListNav.
     * @param {Element} items - static list of items
     * @param {Function} activateCb - (optional) callback function to override the default activation behavior
     * @param {Function} deactivateCb - (optional) callback function to overide the default deactivate behavior
     * @param {Function} focusCb - (optional) callback function to overide the default focus behavior
     * @param {Object} customKeys - (optional) any custom keys, overrides defaults
     */
    static buildLists({items, activateCb, deactivateCb, customKeys}) {
      // Convert non-array to an array to make easier to work with
      items = Array.from(items);
      items = items.map((listItems) => {
        if (!listItems || listItems.length === undefined) {
          throw new Error('Error: Lists addListItems received a non array like list of items in listItems');
        }
        listItems = Array.from(listItems);
        return new Keynav({
          items: listItems,
          activateCb,
          deactivateCb,
          customKeys,
        });
      });
      return items;
    }
}


////////////////////////////////////////////////////////////////////////////
// DEPRECATED BELOW
////////////////////////////////////////////////////////////////////////////


// DEPRECATED: Would like to remove for simplicity and focus on just Keynav
// Do API stuff in Libs that use this
export function KeynavBuilder(props={}) {
  const items = props.items || Keynav.createListsFromDOM({
    selectorList: props.selectorList || '[data-knw-list]',
    selectorListItem: props.selectorListItem || '[data-knw-list-item]',
  });

  this.lists = Keynav.buildLists({
    items,
    activateCb: props.activateCb,
    deactivateCb: props.deactivateCb,
    focussedCb: props.focussedCb,
    customKeys: props.customKeys,
  });
}
