const Hotkeys = {};

// Hotkeys Hash of found in DOM attributes
Hotkeys.keys = {}

// Disable/enable keynav dynamically but remember to call addHotkeys again
Hotkeys.isHotkeysEnabled = true;

Hotkeys.init = function(el) {
    addHotkeys(el);
    addHotkeysBehavior();
}

export default Hotkeys;


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
    if (!this.isLog) return;
    console.log('Hotkeys Error: ' + logString);
}
