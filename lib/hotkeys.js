import {getKeyFromEvent, getModifierKeyFromEvent} from './keys.js';


/**
 * Adds keyboard key triggers "hotkeys" to elements either on the global document
 * or with in an element container. This is done by adding the default or
 * custom attributes on any hotkey element. These elements are parsed and stored
 * in a list to trigger when keyed. When a hotkey is triggered, a click event
 * is fired on it. Any behavior added to the hotkey element is triggered.
 *
 * There are two types of Hotkeys:
 * - Global used on the entire document/page, build with Hotkeys.buildGlobal(...)
 * - Dialog used on a container so hotkeys only fire when active, build with
 *      Hotkeys.buildDialog(...). When active the global hotkeys are disabled.
 *
 * Why not subclass Hotkeys?
 * JS allows inheritance on instance methods but instance vars get "hidden", dumb..
 *
 * @class
 */
export class Hotkeys {
    // List of Els containing hotkeys
    items = [];

    // List of hotkeys
    hotkeys = [];

    // Useful for sandboxing Hotkeys inside a container, like in a Dialog
    containerEl = window.document;

    // Customize the Hotkey attribute selector (used in parsing)
    // -or- IF Dialog 'data-knw-hotkeys-dialog-key'
    selectorHotkeys = 'data-knw-hotkeys-key';

    // Active means hotkeys are usable, otherwise unusable
    isActive = true;

    // Otherwise is a container (e.g. Dialog) and isActive=false when global enabled
    isGlobal = true;

    // Event subscription pointers stored for later unsubscribing
    _subs = [];

    /**
     * Creates a Hotkeys
     * @param {Object|Array} items hotkey elements
     * @param {Object|Element} containerEl element to add hotkey to
     * @param {Object|String} selectorHotkeys overrides default selector to find Hotkeys
     * @param {Object|Boolean} isActive whether hotkeys are active (default is true for active)
     * @param {Object|Boolean} isGlobal true for global keys, if false then treated as a dialog
     * @param {Object|Boolean} isAutoInit whether to add behavior etc on creation (default is true)
     */
    constructor({items, containerEl, selectorHotkeys, isActive, isGlobal, isAutoInit=true}) {
      if (!items || items.length === undefined) {
        throw new Error('Error: called Hotkey constructor without items list');
      }
      this.items = Array.from(items);

      if (containerEl) {
        this.containerEl = containerEl;
      }
      if (selectorHotkeys) {
        this.selectorHotkeys = selectorHotkeys;
      }
      if (isActive !== undefined) {
        this.isActive = isActive;
      }
      if (isGlobal !== undefined) {
        this.isGlobal = isGlobal;
      }
      if (isAutoInit) {
        this.init();
      }
    }

    /**
     * Initializes Hotkeys
     */
    init() {
      this.parseHotkeys();
      this.addBehavior();
    }

    /**
     * Adds Hotkey behavior to Hotkeys. Any event added can later be removed.
     */
    addBehavior() {
      // Case: enable a dialog and disabling the global (and other dialogs) keys
      this.sub({
        topic: 'knw.hotkeys.activateDialog',
        callback: (e) => {
          const targetEl = e.detail.targetEl;

          // Found the relate dialog to enable
          if (this.containerEl === targetEl) {
            this.isActive = true;
            return;
          }

          // Unrelated, so disalbe it
          this.isActive = false;
        },
      });

      // Case: disabling a dialog and re-enabling the global (non-dialog) keys
      this.sub({
        topic: 'knw.hotkeys.activate',
        callback: () => {
          // Not a dialog, so enable the keys
          if (this.isGlobal) {
            this.isActive = true;
            return;
          }

          // Is a dialog, so disable the keys
          this.isActive = false;
        },
      });

      // Validates whether an element has a Hotkey attribute and if so, clicks it.
      // Then any click event handlers on the element with triggered.
      this.sub({
        // topic: 'keyup',
        topic: 'keydown', // Needed to include escape key
        // Delegating on the entire document, so on any key check if it's a hotkey
        callback: (e) => {
          // Do some checks. Note worthy, avoid hotkeys in inputs (for obvious reasons) and only alpha or meta keys.
          if (!this.isActive) return;

          const key = getKeyFromEvent(e);
          const modifier = getModifierKeyFromEvent(e);

          // Still want escape to function in an input
          const isInputException = (key === 'Escape');

          if (this.isInputElement(e) && !isInputException) {
            return;
          }

          if (!this.isValidHotkey(key)) {
            return;
          }

          // Parse the key to a string
          let combinedKey = '';
          if (modifier === 'Alt') {
            combinedKey = 'alt+';
          }
          if (modifier === 'Ctrl') {
            combinedKey = 'ctrl+';
          }
          if (modifier === 'Shift') {
            combinedKey = 'shift+';
          }
          combinedKey += key.toLowerCase();

          // Use the key string to get the related key object
          const keyObj = this.hotkeys[combinedKey];
          if (!keyObj) return;
          // This should never happen (so it probably will... it's just life..)
          if (!keyObj.triggerEl) {
            console.log('Error: no trigger element for key=' + combinedKey);
            return;
          }

          // Trigger that related key object with a DOM click
          keyObj.triggerEl.click();
        },
      });
    }

    /**
     * Broadcasts a Hotkey event, Hotkey instances decide what to do based on
     * whether the target element matches themself or not.
     * Note: broadcast is on document, so app wide
     * @param {String} topic event name to use
     */
    pub({topic}) {
      const e = new CustomEvent(topic, {
        // IMPORTANT: only necessary to compare self IF DIALOG
        detail: {targetEl: this.containerEl},
        // Note: not necessary with this model but may use later on
        bubbles: true,
      });
      document.dispatchEvent(e);
    }

    /**
     * Subscribes a Hotkey event.
     * Note: Subs should be on the window.document, or if not - need to refactor unsub()
     * @param {Object|String} topic event name to use
     * @param {Object|Function} callback function to trigger when published to
     */
    sub({topic, callback}) {
      this._subs.push({topic, callback});
      document.addEventListener(topic, callback);
    }

    /**
     * Removes any Hotkey events added.
     */
    unsub() {
      this._subs.forEach((sub) => {
        document.removeEventListener(sub.topic, sub.callback);
      });
    }

    /**
     * Creates a list of hotkeys from the data attributes in the DOM. The list maps
     * each hotkey to an element to be used for triggering.
     *
     * Example:
     * <button click="doSomething()">'x' Triggers Me</button>
     *
     * Example CSS Mapping:
     * <li data-hotkey-web="x" data-hotkey-web-selector=".hotkey-web-x">
     *  <a class="hotkey-web-x" href="#x">Hotkey 'x' triggers me</a>
     * </li>
     */
    parseHotkeys() {
      // Note: isEnabled not checked here so can easily enable it. Add check if problems.
      this.items.forEach((hotkeyEl) => {
        // Get hotkey
        // NOTE: Had to use `getAttribute` since selection on element itself
        // also Data API was not possible, since need dynamic var access.
        const selector = this.selectorHotkeys.replace(/\[|\]/ig, '');
        let hotkey = hotkeyEl.getAttribute(selector);
        if (!hotkey) {
          console.log('Hotkeys: no hotkey for ' + hotkey);
          return;
        }
        // Needed since may be a number
        hotkey = String(hotkey).toLowerCase();

        // Key combo?
        const hasAltKey = /^alt/i.test(hotkey);
        const hasCtrlKey = /^ctrl/i.test(hotkey);

        // Valid key?
        const validKey = (hasAltKey || hasCtrlKey) ? hotkey.split('+')[1] : hotkey;
        if (!this.isValidHotkey(validKey)) {
          console.log('Hotkeys: invalid hotkey ' + hotkey);
          return;
        }

        // Get related element for triggering, or if none, assume container should be triggered
        // var triggerEl = this.containerEl.querySelector(hotkey);
        // if (!triggerEl) { triggerEl = hotkeyEl; }

        // Map the hotkey to related data
        this.hotkeys[hotkey] = {
          triggerEl: hotkeyEl,
        };
      });
    }

    /**
     * Whitelist these keys as valid hotkeys currently just letters, with a tiny
     * exception, the Escape key that can act like a Hotkey
     * @param {String} hotkey key to validate
     * @return {Boolean} true if valid and false if not
     */
    isValidHotkey(hotkey) {
      return /[a-z0-9]|Escape/i.test(hotkey);
    }

    /**
     * Avoid activating behavior (like a hotkey) if the current element is an input related element.
     * @param {Event} e test whether an element is an input (want to disable hotkeys here)
     * @return {Boolean} true if an input and false if not
     */
    isInputElement(e) {
      return /input|textarea|select/i.test(e.target.tagName);
    }

    /**
     * Utility method to build a generic global Hotkeys
     * @param {Object|Element} containerEl element to use as a container (optional)
     * @param {Object|String} selectorContainer use instead to get the containerEl (optional)
     * @param {Object|String} selectorHotkeys gets hotkey elements within the container
     * @return {Hotkeys} build Hotkeys (intended for global use)
     */
    static buildGlobal({containerEl, selectorContainer, selectorHotkeys}) {
      containerEl = containerEl || document.querySelector(selectorContainer) || document;
      const hotkeyEls = containerEl.querySelectorAll(selectorHotkeys);
      if (!hotkeyEls) {
        console.log('Error: buildGlobal missing hotkeys from selectorHotkeys');
      }
      const globalHotkeys = new Hotkeys({
        containerEl,
        items: hotkeyEls,
        selectorHotkeys,
      });
      return globalHotkeys;
    }

    /**
     * Utility method to build a specialized ("scoped") Dialog Hotkeys
     * @param {Object|Element} containerEl element to use as a container (optional)
     * @param {Object|String} selectorContainer use instead to get the containerEl (optional)
     * @param {Object|String} selectorHotkeys gets hotkey elements within the container
     * @return {Hotkeys} build Hotkeys (intended for scoped dialog use)
     */
    static buildDialog({containerEl, selectorContainer, selectorHotkeys}) {
      containerEl = containerEl || document.querySelector(selectorContainer) || document;
      const hotkeyEls = containerEl.querySelectorAll(selectorHotkeys);
      if (!hotkeyEls) {
        console.log('Error: buildDialog missing hotkeys from selectorHotkeys');
      }
      const dialogHotkeys = new Hotkeys({
        containerEl,
        items: hotkeyEls,
        selectorHotkeys,
        isGlobal: false,
        isActive: false,
      });
      return dialogHotkeys;
    }
}


