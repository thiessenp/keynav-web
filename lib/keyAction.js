import {getKeyFromEvent, getModifierKeyFromEvent} from './keys';


/**
 * Adds Keyboard trigger(s) to HTML elements, probably something like an
 * element being used like a button. The idea is to make it convenient to use
 * keyboard controls -vs- simple actions should use something else.
 *
 * @class
 */
export class KeyAction {
    itemEl;

    // Avoid a static list since size may change, dynamic lookup using a selector
    listItemsSelector;

    // Stop bugs where can accidentally initialize N-Times
    isInitialized = false;

    // Cases like a default button where a tabindex is unnecessary, then set false
    isAddTabindex;

    // Stores any added behavior for use with removing that behavior later
    eventPointers = {};

    // Default key behavior, override by passing customKeys to the constructor
    // customKeys Interface:
    //    ACTIONS : { OPERATION: {keys: [], run: fn} }
    //
    // WARNING: run must NOT be an arrow function because would get bound to wrong `this`
    // NOTE: run functions must be bound to Class instance (`this`)
    // NOTE: cannot be a `static` property since acts on Class instance
    ACTIONS = {
      ACTIVATE: {
        keys: ['Enter', 'Space'],
        // NOTE: Could use arrow functions here but since cannot in as a
        // passed prop, using normal function for clarity.
        run: function(e) {
          // Stop unwanted browser default behavior like scrolling when arrowing around
          e.preventDefault();
          const item = e.target;
          // Click done here so can use setActive in getClick without x2 click problem
          if (item) {
            item.click();
          }
        },
      },
    };

    activateCb = ({item}) => {
      if (!item) {
        return;
      }
      // Do Something
    };

    /**
     * Creates a KeyTrigger.
     * @param {Element} itemEl - container element to add the list behavior to
     * @param {Boolean} isAutoInit - (optional) whether to initialise the Class automatically (default=true)
     * @param {Boolean} isManageTabindex - (optional) whether to add and update
     * a Tabindex attribute on the element (default=true)
     * @param {Function} activateCb - (optional) callback function to override the default activation behavior
     * @param {Object} customKeys - (optional) any custom keys, overrides defaults
     */
    constructor({itemEl, isAutoInit=true, isManageTabindex=true, activateCb, customKeys}) {
      if (!itemEl) {
        throw new Error('KeyTrigger invoked without a valid itemEl');
      }
      this.itemEl = itemEl;

      // Potentially enable callbacks for increased flexibility on item activation
      if (activateCb && typeof activateCb === 'function') {
        this.activateCb = activateCb;
      }

      if (customKeys) {
        this.addCustomKeys(customKeys);
      }

      if (isManageTabindex) {
        this.isManageTabindex = isManageTabindex;
      }

      if (isAutoInit) {
        this.init();
      }
    }

    /**
     * Initialises an instance of this class to be ready for use in the DOM.
     */
    init() {
      if (this.isInitialized) {
        return;
      }

      if (this.isManageTabindex) {
        this.itemEl.setAttribute('tabindex', '0');
      }

      this.addBehavior();

      this.isInitialized = true;
    }

    /**
     * Adds behavior using an event to the list element. The event can later be
     * removed using removeBehavior()
     */
    addBehavior() {
      // TODO: make configureable
      // const ALLOWED_KEYS = /Enter|Space|ArrowDown|ArrowRight|ArrowUp|ArrowLeft|End|Home|Delete/;

      // Store the event function to remove later
      this.eventPointers['keydown'] = (e) => {
        // Does key match related keys?
        let key = e.key;
        if (e.code === 'Space') {
          key = 'Space';
        } // Handle e.key space = ' '
        // if (!ALLOWED_KEYS.test(key)) {
        //   return;
        // }

        // // Does target element match/contained in container?
        // const listEl = e.target.closest(this.listItemsSelector);
        // if (!listEl || !listEl.contains(listEl)) {
        //   return;
        // }

        // Yes, checks out, do something with the key
        this.handleKey(e, key);
      };

      // Delegate on container
      this.itemEl.addEventListener('keydown', this.eventPointers['keydown']);

      this.eventPointers['click'] = (e) => {
        // Check target element vs container to see if element we want
        // const listEl = e.target.closest(this.listItemsSelector);
        // if (!listEl || !listEl.contains(listEl)) {
        //   return;
        // }

        // Checks out, do something with the key
        this.handleClick(e);
      };

      this.itemEl.addEventListener('click', this.eventPointers['click']);
    }

    /**
     * Removes any event listeners added by the list nav
     */
    removeBehavior() {
      this.itemEl.removeEventListener('keydown', this.eventPointers['keydown']);
      this.itemEl.removeEventListener('click', this.eventPointers['click']);
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
      const opperationNames = Object.keys(this.ACTIONS);
      const customOpperationNames = Object.keys(customKeys);

      if (customOpperationNames.length > 0) {
        // NOTE: foreEach is more convenient but having to pass in a `this`
        // context ran into weird behavior when transpiled by Babel (avoiding).
        // NOTE: map would make more sense, but using FOR for funzies.
        for (let i=0, l=opperationNames.length; i < l; i++) {
          for (let j=0, k=customOpperationNames.length; j < k; j++) {
            const customOperationName = customOpperationNames[j];

            // Does custom opperation already exist? Then override
            if (this.ACTIONS[customOperationName]) {
              // Any keys to override on this opperation?
              if (Array.isArray(customKeys[customOperationName].keys)) {
                this.ACTIONS[customOperationName].keys = customKeys[customOperationName].keys;
              }
              // Custom function for this opperation?
              if (typeof customKeys[customOperationName].run === 'function') {
                this.ACTIONS[customOperationName].run = customKeys[customOperationName].run;
              }

              // Nope, add opperation but check it first TRUST NO ONE!
            } else if (customKeys[customOperationName].keys.length > 0 &&
                            typeof customKeys[customOperationName].run === 'function') {
              this.ACTIONS[customOperationName] = customKeys[customOperationName];
            }
          }
        }
      }
    }

    /**
     * Decides how to handle the key that was triggered.
     *
     * @param {Event} e DOM event triggered
     */
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
      const opperations = Object.keys(this.ACTIONS);
      // NOTE: foreEach is more convenient but having to pass in a `this`
      // context ran into weird behavior when transpiled by Babel (avoiding).
      for (let i=0, l=opperations.length; i < l; i++) {
        const opperation = opperations[i];
        // search keys for key
        if (this.ACTIONS[opperation].keys.indexOf(key) > -1) {
          // found? call run
          // NOTE: Strategy pattern used, important to feel smart sometimes.
          // also must call in `this` context... (fails if an arrow function)
          this.ACTIONS[opperation].run.call(this, e);
        }
      }
    }

    /**
     * @param {Event} e - document event to use to handle the click (focus/activate)
     */
    handleClick(e) {
      // NOTE: no need to click, since natively done - otherwise would be double click
      // plus intention to handle click with custom behavior, so prevent it actually.
      this.activateCb({item: e.target, isClick: true});
    }
}

