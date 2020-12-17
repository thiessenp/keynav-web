

const KEY_HASH = {
    // Non characters
    9: 'Tab',
    13: 'Enter',
    27: 'Escape',       // Esc older IE
    32: 'Space',
    33: 'PageUp',
    34: 'PageDown',
    35: 'End',
    36: 'Home',
    37: 'ArrowLeft',    // Left
    38: 'ArrowUp',      // Up
    39: 'ArrowRight',
    40: 'ArrowDown',    // Down
    46: 'Delete',

    // Not sure what to do about:
    // NUMBER_KEY=NUMBER_KEY
    48: '0',
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    // -vs- SHIFT+NUMBER_KEY=SYMBOL
    // 48: ')',
    // 49: '!',
    // 50: '@',
    // ...57

    // Characters - e.which integer mapping not case sensitive
    65: 'a',
    66: 'b',
    67: 'c',
    68: 'd',
    69: 'e',
    70: 'f',
    71: 'g',
    72: 'h',
    73: 'i',
    74: 'j',
    75: 'k',
    76: 'l',
    77: 'm',
    78: 'n',
    79: 'o',
    80: 'p',
    81: 'q',
    82: 'r',
    83: 's',
    84: 't',
    85: 'u',
    86: 'v',
    87: 'w',
    88: 'x',
    89: 'y',
    90: 'z',

    187: '+',   // or '='
    189: '-',   // or '_'
    199: ',',   // or ','
    190: '.',   // or '>'
    191: '?',   // or '/'

    220: '\\'   // or '|'

    // More TODO
};

function mapWhichToKey(key) {
    if (key === undefined) { return; }

    key = parseInt(key);
    if (Number.isInteger(key)) {
        return KEY_HASH[key];
    }

    // Explicit return of undefined for key not found
    return;
}

function mapKeyToWhich(key) {
    if (key === undefined) { return; }

    const valuesAsArray = Array.from(Object.values(KEY_HASH));
    const indexOfMatch = valuesAsArray.indexOf(key);
    const keysAsArray = Array.from(Object.keys(KEY_HASH));
    if (keysAsArray[indexOfMatch]) {
        return keysAsArray[indexOfMatch];
    }

    // Explicit return of undefined for key not found
    return;
}

/**
 * Maps a keyboard key either from legacy event.which 
 * to event.key or vice versa.
 * 
 * Note: event.code is rarely useful so not included.
 * 
 * @param {object} e proboably from an event
 */
function getKeyFromEvent(e) {
    if (typeof e !== 'object') { return e; }

    // Legacy event, use e.which to get e.key for modern browsers
    if (e.key === undefined && Number.isInteger(e.which)) {
        return getKeyByWhich(e.which);
    }

    return e.key
};

// What key, which thing? Look it up on https://keycode.info/
// note: could also receive "code" but seems unneeded
function fireKey({target=document, type='keydown', key, which}) {
    if (key === undefined && which === undefined) { return; }

    // Which not needed in modern browsers but here it is for legacy
    if (which === undefined) {
        which = mapKeyToWhich(key);
    }
    // Also which may be more convenient so add a mapping to key
    if (key === undefined) {
        key = mapWhichToKey(which);
    }

    const customKeyEvent = new KeyboardEvent(type, {key , which});
    target.dispatchEvent(customKeyEvent);
}

export {
    KEY_HASH,
    getKeyFromEvent,
    mapWhichToKey,
    mapKeyToWhich,
    fireKey,
}