// Library code example: https://github.com/WICG/inert/blob/master/src/inert.js
// and http://www.unodc.org/misc/treaties/ext/docs/output/KeyNav.jss.html



const KeynavWeb = {};

// Enabled to log errors. Remember to disable in PROD probably.
KeynavWeb.isLog = true;

/**
 * Maps a keyboard key (probably from an event) to the "new" standardized DOM
 * event key name. This also acts as a filter to only allow certain key for nav.
 * 
 * @param {string} key string proboably from an event
 */
KeynavWeb.getMappedKey = function(key) {
    // Standard key
    if (/^Key[A-Z]/.test(key) || /^Arrow[Up|Down|Right|Left]/.test(key)) {
        return key;
    }

    // Non-Standard or Code Key
    // Key codes originally used by IE 'Esc', 'Up', 'Down'
    if (key === 'Escape' || key === 'Esc' || key === 27) return 'Escape';
    if (key === 'Enter' || key === 13) return 'Enter';
    if (key === 'Space' || key === 32) return 'Space';
    if (key === 'Up' || key === 38) return 'ArrowUp';
    if (key === 'Down' || key === 40) return 'ArrowDown';
    if (key === 'Right' || key === 39) return 'ArrowRight';
    if (key === 'Left' || key === 37) return 'ArrowLeft';

    // undefined returned for not found
}

KeynavWeb.getKeyByEvent = function(e) {
    const key = e.key || e.code || e.keyCode;
    if (key) {
        return this.getMappedKey(key);
    }
    // undefined returned for not found
};

KeynavWeb.addKeynavToList = function(listEl) {
    if (!listEl) return;
    
    var active = null;
    listEl.addEventListener('keydown', (e) => {
        // Avoid e.preventDefault(); here, or keys like tab stop working..

        const key = this.getKey(e);

        if (key === 'Enter' || code === 'Space') {
            e.preventDefault();
            // Inactive list so enter at the first list item
            if (!active) {
                active = listEl.firstElementChild;
                active.focus();
            // Active list so activate (browser click on) the current element
            } else {
                active.click();
            }
        }
        else if (key === 'ArrowDown' || key === 'ArrowRight') {		
            e.preventDefault();		
            if (active && active.nextElementSibling) {
                active = active.nextElementSibling;
                active.focus();
            }
        }
        else if (key === 'ArrowUp' || key === 'ArrowLeft') {
            e.preventDefault();
            if (active && active.previousElementSibling) {
                active = active.previousElementSibling;
                active.focus();
            }
        }
        else if (key === 'Escape') {
            e.preventDefault();
            active = null;
            listEl.focus();
        }
    });
}


// Hotkeys Hash of found in DOM attributes
KeynavWeb.hotkeys = {}

// Disable/enable keynav dynamically but remember to call addHotkeys again
KeynavWeb.isHotkeysEnabled = true;

KeynavWeb.initHotkeys = function(el) {
    this.addHotkeys(el);
    this.addHotkeysBehavior();
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
 * @param el Optional DOM element container. Default is document body element
 */
KeynavWeb.addHotkeys = function(el) {
    // Note: isEnabled not checked here so can easily enable it. Add check if problems.
    var containerEl = el || document;
    var hotkeyEls = containerEl.querySelectorAll('[data-hotkeys-web]');

    hotkeyEls.forEach(function(hotkeyEl) {
        // Get hotkey
        var hotkey = hotkeyEl.dataset.hotkeysWeb;
        if (!hotkey) {
            this.log('Hotkeys: no hotkey for ' + hotkeyEl.dataset.hotkeysWeb);
            return;
        }

        // Key combo?
        var hasAltKey = /^alt/i.test(hotkey);
        var hasCtrlKey = /^ctrl/i.test(hotkey);

        // Valid key?
        var validKey = hasAltKey || hasCtrlKey ? hotkey.split('+')[1] : hotkey;
        if (!this.isValidHotkey(validKey)) { 
            this.log('Hotkeys: invalid hotkey ' + hotkey);
            return; 
        }

        // Is it a key in an overlay? (only active when modal open)
        // var isOverlay = Boolean(hotkeyEl.dataset.cmpHotkeyOverlay);

        // Get related element for triggering, or if none, assume container should be triggered
        var triggerEl = containerEl.querySelector(hotkeyEl.dataset.hotkeysWeb);
        if (!triggerEl) { triggerEl = hotkeyEl; }

        // Map the hotkey to related data
        this.hotkeys[hotkey] = {
            triggerEl: triggerEl,
            // isOverlay: isOverlay
        };
    }.bind(this));
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
KeynavWeb.addHotkeysBehavior = function() {
    document.addEventListener('keyup', function(e) {
        // Do some checks. Note worthy, avoid hotkeys in inputs (for obvious reasons) and only alpha or meta keys.
        if (!this.isHotkeysEnabled) return;
        if (this.isInputElement(e)) return;
        if (!this.isValidHotkey(e.key)) return;

        // Parse the key to a string
        var key = '';
        if (e.altKey) { key = 'alt+'; }
        if (e.ctrlKey) { key = 'ctrl+'; }
        key += e.key.toLowerCase();

        // Use the key string to get the related key object
        var keyObj = this.hotkeys[key];
        if (!keyObj) return;
        // This should never happen (so it probably will... it's just life..)
        if (!keyObj.triggerEl) { this.log('Error: no trigger element for key=' + key); return; }

        // Trigger that related key object with a DOM click
        // if ((!this.isOverlayState && !keyObj.isOverlay) || (this.isOverlayState && keyObj.isOverlay)) {
            keyObj.triggerEl.click();
        // }
    }.bind(this));
};

// Whitelist these keys as valid hotkeys currently just letters
KeynavWeb.isValidHotkey = function(hotkey) {
    return /[a-z]/i.test(hotkey);
}

// Avoid activating behavior (like a hotkey) if the current element is an input related element.
KeynavWeb.isInputElement = function(e) {
    return /input|textarea|select/i.test(e.target.tagName);
}

// Convenience method to only log errors when enabled (probably only in DEV environment)
KeynavWeb.log = function(logString) {
    if (!this.isLog) return;
    console.log('Hotkeys Error: ' + logString);
}


export default KeynavWeb; 
