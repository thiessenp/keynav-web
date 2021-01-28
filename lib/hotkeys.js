// TODO:
// Consider extending to Hotkeys and HotkeysDialog to simplify code and use

// TODO:
// Consider using 'keydown' instead of 'keyup; to listen for keypresses and 
// use the functions from the below lib maybe:
// - import {getKeyFromEvent, getModifierKeyFromEvent, fireKey} from './keys';


/**
 * Notes:
 * - pubs and subs on document root to simplify event bubbling/tree-order
 * - composition mainly, "Attribute authoring" mainly left to developers
 * - currently one type of Hotkeys but plan to extend to HotkeysDialog
 */
export class Hotkeys {
    // List of hotkeys
    // TODO: 
    // - separate, currently a mix of Els and Hotkey objects
    items = [];

    // Useful for sandboxing Hotkeys inside a container, like in a Dialog
    containerEl = window.document;

    // Active means hotkeys are usable, otherwise unusable
    isActive = true;

    // Otherwise is a container (e.g. Dialog) and isActive=false when global enabled
    isGlobal = true;

    // Event subscription pointers stored for later unsubscribing
    _subs = [];

    constructor({items, containerEl, isActive, isGlobal, isAutoInit=true}) {
        if (!items || items.length === undefined) {
            throw new Error('Error: called Hotkey constructor without items list');
        }
        this.items = Array.from(items);

        if (containerEl) { this.containerEl = containerEl; }
        if (isActive !== undefined) { this.isActive = isActive; }
        if (isGlobal !== undefined) { this.isGlobal = isGlobal; }
        if (isAutoInit) { this.init(); }
    }

    init() {
        this.parseHotkeys();
        this.addBehavior();
    }

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
            }
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
            }
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
                if (this.isInputElement(e)) return;
                if (!this.isValidHotkey(e.key)) return;
    
                // Parse the key to a string
                var key = '';
                if (e.altKey) { key = 'alt+'; }
                if (e.ctrlKey) { key = 'ctrl+'; }
                key += e.key.toLowerCase();
    
                // Use the key string to get the related key object
                var keyObj = this.items[key];
                if (!keyObj) return;
                // This should never happen (so it probably will... it's just life..)
                if (!keyObj.triggerEl) { console.log('Error: no trigger element for key=' + key); return; }
    
                // Trigger that related key object with a DOM click
                // if ((!this.isOverlayState && !keyObj.isOverlay) || (this.isOverlayState && keyObj.isOverlay)) {
                    keyObj.triggerEl.click();
                // }
            }
        });
    }

    pub({topic}) {
        const e = new CustomEvent(topic, {
            // IMPORTANT: only necessary to compare self IF DIALOG
            detail: { targetEl: this.containerEl },
            // Note: not necessary with this model but may use later on
            bubbles: true
          });
        document.dispatchEvent(e);
    }

    sub({topic, callback}) {
        this._subs.push({topic, callback});
        document.addEventListener(topic, callback);
    }

    unsub() {
        this._subs.forEach(sub => {
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
            var hotkey = hotkeyEl.dataset.knwHotkeysKey || hotkeyEl.dataset.knwHotkeysDialogKey;
            if (!hotkey) {
                console.log('Hotkeys: no hotkey for ' + hotkey);
                return;
            }
            hotkey = hotkey.toLowerCase();

            // Key combo?
            var hasAltKey = /^alt/i.test(hotkey);
            var hasCtrlKey = /^ctrl/i.test(hotkey);

            // Valid key?
            var validKey = (hasAltKey || hasCtrlKey) ? hotkey.split('+')[1] : hotkey;
            if (!this.isValidHotkey(validKey)) { 
                console.log('Hotkeys: invalid hotkey ' + hotkey);
                return; 
            }

            // Get related element for triggering, or if none, assume container should be triggered
            var triggerEl = this.containerEl.querySelector(hotkey);
            if (!triggerEl) { triggerEl = hotkeyEl; }

            // Map the hotkey to related data
            this.items[hotkey] = {
                triggerEl: triggerEl
            };
        });
    }

    // Whitelist these keys as valid hotkeys currently just letters, with a tiny
    // exception, the Escape key that can act like a Hotkey
    isValidHotkey(hotkey) {
        return /[a-z0-9]|Escape/i.test(hotkey);
    }

    // Avoid activating behavior (like a hotkey) if the current element is an input related element.
    isInputElement(e) {
        return /input|textarea|select/i.test(e.target.tagName);
    }
}
