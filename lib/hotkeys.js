// import {getKeyFromEvent, getModifierKeyFromEvent, fireKey} from './keys';

/*
Zeh Plan.
- subscribe at DOC ROOT (must)
- publish anywhere (but DOC ROOT probably cleanest)
- NO attribute composition, leave that for other Libs that use this Lib
- ONE TYPE, use properties to determine Container behavior, global? or scoped? <<< needs more thought
*/
export class Hotkeys {
    // List of hotkeys
    items = [];

    // Useful for sandboxing Hotkeys inside a container, like in a Dialog
    containerEl = window.document;

    // Active means hotkeys are usable, otherwise unusable
    isActive = true;

    // Otherwise is a container (e.g. Dialog) and isActive=false when global enabled
    isGlobal = true;

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
        this.sub();
        this.parseHotkeys();
        this.addHotkeysBehavior();
    }

    // API something like: 
    // pub knw.hotkeys.activate
    // pub knw.hotkeys.activateDialog, data={targetEl: el}
    pub({topic}) {
        const e = new CustomEvent(topic, {
            detail: { targetEl: this.containerEl },
            bubbles: true
          });
        document.dispatchEvent(e);
    }

    sub() {
        // Case: enable a dialog and disabling the global (and other dialogs) keys
        this._subs[0] = (e) => {
            const targetEl = e.detail.targetEl;
            
            // Found the relate dialog to enable
            if (this.containerEl === targetEl) {
                this.isActive = true;
                return;
            }

            // Unrelated, so disalbe it
            this.isActive = false;
        };
        document.addEventListener('knw.hotkeys.activateDialog', this._subs[0]);

        // Case: disabling a dialog and re-enabling the global (non-dialog) keys
        this._subs[1] = () => {
            // Not a dialog, so enable the keys
            if (this.isGlobal) {
                this.isActive = true;
                return;
            }

            // Is a dialog, so disable the keys
            this.isActive = false;
        }
        document.addEventListener('knw.hotkeys.activate', this._subs[1]);
    }

    unsub() {
        document.removeEventListener('knw.hotkeys.activateDialog', this._subs[0]);
        document.removeEventListener('knw.hotkeys.activate', this._subs[1]);
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
     * 
     * @DEPRECATED
     * @param el Optional DOM element container. Default is document body element
     */
    parseHotkeys(/*el*/) {
        // Note: isEnabled not checked here so can easily enable it. Add check if problems.
        var containerEl = this.containerEl; //el || document;
        var hotkeyEls = this.items;  //containerEl.querySelectorAll('[data-knw-hotkey]');

        hotkeyEls.forEach((hotkeyEl) => {
            // Get hotkey
            var hotkey = hotkeyEl.dataset.knwHotkeysKey || hotkeyEl.dataset.knwHotkeysDialogKey;
            if (!hotkey) {
                console.log('Hotkeys: no hotkey for ' + hotkey);
                return;
            }

            // Key combo?
            var hasAltKey = /^alt/i.test(hotkey);
            var hasCtrlKey = /^ctrl/i.test(hotkey);

            // Valid key?
            var validKey = hasAltKey || hasCtrlKey ? hotkey.split('+')[1] : hotkey;
            if (!this.isValidHotkey(validKey)) { 
                console.log('Hotkeys: invalid hotkey ' + hotkey);
                return; 
            }

            // Is it a key in an overlay? (only active when modal open)
            // var isOverlay = Boolean(hotkeyEl.dataset.cmpHotkeyOverlay);

            // Get related element for triggering, or if none, assume container should be triggered
            var triggerEl = containerEl.querySelector(hotkey);
            if (!triggerEl) { triggerEl = hotkeyEl; }

            // Map the hotkey to related data
            this.items[hotkey] = {
                triggerEl: triggerEl,
                // isOverlay: isOverlay
            };
        });
    }

    /**
     * Defines what to do when a keynav element is triggered. In this case, the 
     * triggered element is clicked, then any event handlers added to that element
     * will also be triggered.
     *
     * Example: trigger key and action on same element
     * // HTML
     * <button data-cmp-hotkey="x">Hotkey <kbd>x</kbd></button>
     * // JavaScript
     * document.addEventListener('keydown', function(e) {
     *      if (e.key === 'x') { console.log('Do something when key A is keyed'); }
     * });
     *
     * Example: trigger key and action on *different* element
     * // HTML
     * <div data-cmp-hotkey="b" data-cmp-hotkey-selector=".cmp-hotkey-b">Hotkey <kbd>x</kbd></div>
     * <div class="cmp-hotkey-b">Something happens here when <kbd>b</kbd> is keyed</button>
     * // JavaScript
     * document.addEventListener('keydown', function(e) {
     *      if (e.key === 'b') { console.log('Do something when key B is keyed'); }
     * });
     */
    addHotkeysBehavior() {
        // Delegating on the entire document, so on any key check if it's a hotkey
        document.addEventListener('keyup', (e) => {
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
        });
    }

    // Whitelist these keys as valid hotkeys currently just letters
    isValidHotkey(hotkey) {
        return /[a-z]/i.test(hotkey);
    }

    // Avoid activating behavior (like a hotkey) if the current element is an input related element.
    isInputElement(e) {
        return /input|textarea|select/i.test(e.target.tagName);
    }

}






// export const Hotkeys = {};

// Hotkeys.items = [];

// Hotkeys.init = function(props={}) {
//     const items = props.items || Hotkey.buildItems({
//         roleSelector: props.roleSelector || 'data-knw-hotkey', 
//         propertySelector: props.propertySelector || 'data-knw-hotkey-key',
//         propertyRootSelector: props.propertyRootSelector || 'data-knw-hotkey-root-key'
//     });

//     console.log('Hotkeys.init Items=', items);

//     this.items = Hotkey.build({
//         items
//     });

//     console.log('Hotkeys.init Built Items=', this.items);
// };


// delegate on container? - no would fail on container in containers - unless shut off on a container
//
// global toggle to deactivate all but a containers Hotkeys?
//  - list-property? on control-active, flag active=false on all other containers
//
//  - attribute? look for attribute on container, but how deactivate? search *entire* DOM for attributes?
//
// container open, add listeners, remove on close? help with Focus Trap, a bonus best practice for cleanliness
// one dialog, replace content on open? lose potential to store state - does that matter
//
// container
//      data-focus-trap
export class Hotkey {
    // List of container(s) with hotkey items (elements)
    items = null;

    // Useful for sandboxing Hotkeys inside a container, like in a Dialog
    container = window.document;

    // Useful for Composing Components together, so use the parent Component
    // Selector instead
    roleSelector = 'data-knw-hotkey';

    propertySelector = 'data-knw-hotkey-key';

    propertyRootSelector = 'data-knw-hotkey-root-key';

    // Useful for Composing Components together, so delay initialization until 
    // the parent Component is ready
    isInitialized = false;

    // Useful for disabling when another modal thing like a Dialog is active
    isDisabled = false;


    constructor({items, container, roleSelector, propertySelector, propertyRootSelector, isDisabled, isAutoInit=true}) {
        if (!items || items.length === undefined) {
            throw new Error('Error: called Hotkey constructor without items list');
        }
        this.items = Array.from(items);

        if (container) { this.container = container; }

        if (roleSelector) { this.roleSelector = roleSelector; }

        if (propertySelector) { this.propertySelector = propertySelector; }

        if (propertyRootSelector) { this.propertyRootSelector = propertyRootSelector; }

        if (isDisabled !== undefined) { this.isDisabled = isDisabled; }

        if (isAutoInit) { this.init(); }
    }

    init() {
        if (this.isInitialized) { return; }

        this.add();

        // TODO: focus first focussable element in container? (or leave for other component?)
        this.isInitialized = true;
    }

    add() {
        console.log('TODO add');
    }

    remove() {
        console.log('TODO remove');
    }

    handle(e) {
        console.log('TODO handle', e);
    }

    static buildItems({roleSelector, propertySelector, propertyRootSelector}) {
        if (!roleSelector || !propertySelector) {
            throw new Error('Error: Hotkeys buildItems requires both roleSelector and propertySelector');
        }

        const containerItems = [];

        // Add any items not in a container (exceptions)
        const propertyRootEls = Array.from(document.querySelectorAll(`[${propertyRootSelector}]`));
        if (propertyRootEls.length > 0) {
            containerItems.push({
                container: window.document,
                items: propertyRootEls
            });
        }

        // Add any items in containers
        const containerItemEls = Array.from(document.querySelectorAll(`[${roleSelector}]`));
        containerItemEls.forEach(function(containerItemEl) {
            const propertyEls = Array.from(containerItemEl.querySelectorAll(`[${propertySelector}]`));
            containerItems.push({
                container: containerItemEl,
                items: propertyEls
            });
        })

        return containerItems;
    }

    static build({items, roleSelector, propertySelector, propertyRootSelector}) {
        const builtItems = items.map(function(item) {
            if (!item || !item.container || !item.items || item.items.length === undefined) {
                throw new Error('Error: Hotkeys build received an invalid item for item=', item);
            }
            return new Hotkey({
                container: item.container,
                items: item.items,
                roleSelector,
                propertySelector,
                propertyRootSelector
            });
        });

        console.log('builtItems=', builtItems)
        
        return builtItems;
    }
}

























// const Hotkeys = {};

// // Hotkeys Hash of found in DOM attributes
// Hotkeys.keys = {}

// // Disable/enable keynav dynamically but remember to call addHotkeys again
// Hotkeys.isHotkeysEnabled = true;

// Hotkeys.init = function(el) {
//     addHotkeys(el);
//     addHotkeysBehavior();
// }

// export default Hotkeys;


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
 * 
 * @param el Optional DOM element container. Default is document body element
 */
function addHotkeys(el) {
    // Note: isEnabled not checked here so can easily enable it. Add check if problems.
    var containerEl = el || document;
    var hotkeyEls = containerEl.querySelectorAll('[data-knw-hotkey]');

    hotkeyEls.forEach(function(hotkeyEl) {
        // Get hotkey
        var hotkey = hotkeyEl.dataset.knwHotkey;
        if (!hotkey) {
            log('Hotkeys: no hotkey for ' + hotkey);
            return;
        }

        // Key combo?
        var hasAltKey = /^alt/i.test(hotkey);
        var hasCtrlKey = /^ctrl/i.test(hotkey);

        // Valid key?
        var validKey = hasAltKey || hasCtrlKey ? hotkey.split('+')[1] : hotkey;
        if (!isValidHotkey(validKey)) { 
            log('Hotkeys: invalid hotkey ' + hotkey);
            return; 
        }

        // Is it a key in an overlay? (only active when modal open)
        // var isOverlay = Boolean(hotkeyEl.dataset.cmpHotkeyOverlay);

        // Get related element for triggering, or if none, assume container should be triggered
        var triggerEl = containerEl.querySelector(hotkey);
        if (!triggerEl) { triggerEl = hotkeyEl; }

        // Map the hotkey to related data
        Hotkeys.keys[hotkey] = {
            triggerEl: triggerEl,
            // isOverlay: isOverlay
        };
    });
}

/**
 * Defines what to do when a keynav element is triggered. In this case, the 
 * triggered element is clicked, then any event handlers added to that element
 * will also be triggered.
 *
 * Example: trigger key and action on same element
 * // HTML
 * <button data-cmp-hotkey="x">Hotkey <kbd>x</kbd></button>
 * // JavaScript
 * document.addEventListener('keydown', function(e) {
 *      if (e.key === 'x') { console.log('Do something when key A is keyed'); }
 * });
 *
 * Example: trigger key and action on *different* element
 * // HTML
 * <div data-cmp-hotkey="b" data-cmp-hotkey-selector=".cmp-hotkey-b">Hotkey <kbd>x</kbd></div>
 * <div class="cmp-hotkey-b">Something happens here when <kbd>b</kbd> is keyed</button>
 * // JavaScript
 * document.addEventListener('keydown', function(e) {
 *      if (e.key === 'b') { console.log('Do something when key B is keyed'); }
 * });
 */
function addHotkeysBehavior() {
    // Delegating on the entire document, so on any key check if it's a hotkey
    document.addEventListener('keyup', function(e) {
        // Do some checks. Note worthy, avoid hotkeys in inputs (for obvious reasons) and only alpha or meta keys.
        if (!Hotkeys.isHotkeysEnabled) return;
        if (isInputElement(e)) return;
        if (!isValidHotkey(e.key)) return;

        // Parse the key to a string
        var key = '';
        if (e.altKey) { key = 'alt+'; }
        if (e.ctrlKey) { key = 'ctrl+'; }
        key += e.key.toLowerCase();

        // Use the key string to get the related key object
        var keyObj = Hotkeys.keys[key];
        if (!keyObj) return;
        // This should never happen (so it probably will... it's just life..)
        if (!keyObj.triggerEl) { log('Error: no trigger element for key=' + key); return; }

        // Trigger that related key object with a DOM click
        // if ((!this.isOverlayState && !keyObj.isOverlay) || (this.isOverlayState && keyObj.isOverlay)) {
            keyObj.triggerEl.click();
        // }
    });
};

// Whitelist these keys as valid hotkeys currently just letters
function isValidHotkey(hotkey) {
    return /[a-z]/i.test(hotkey);
}

// Avoid activating behavior (like a hotkey) if the current element is an input related element.
function isInputElement(e) {
    return /input|textarea|select/i.test(e.target.tagName);
}

// Convenience method to only log errors when enabled (probably only in DEV environment)
function log(logString) {
    // if (!this.isLog) return;
    console.log('Hotkeys Error: ' + logString);
}
