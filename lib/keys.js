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
        // WARNING: INCOMPLETE and does NOT WORK correctly with non numeric/alphabet
        return getKeyByWhich(e.which);
    }

    // Case of Space e.key that returns an actual ' ', so use e.code instead
    if (e.code === 'Space') { return 'Space'; }

    // Event has a key that will probably work right, let's use it
    return e.key;
};

// What key, which thing? Look it up on https://keycode.info/
// note: could also receive "code" but seems unneeded
function fireKey({target=document, type='keydown', key, /*DEPRECATED*/which/*DEPRECATED*/}) {
    if (key === undefined && which === undefined) { return; }

    // DEPRECATED: Which not needed in modern browsers but here it is for legacy
    if (which === undefined) {
        which = mapKeyToWhich(key);
    }
    // DEPRECATED: Also which may be more convenient so add a mapping to key
    if (key === undefined) {
        key = mapWhichToKey(which);
    }

    const customKeyEvent = new KeyboardEvent(type, {key , which});
    target.dispatchEvent(customKeyEvent);
}

export {
    fireKey,
    getKeyFromEvent,

    // Below For historical purposes.
    KEY_HASH,
    mapWhichToKey,
    mapKeyToWhich,
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NOTE: Below For historical purposes.
// WARNING: event.which is deprecated and event.key (since IE9) should be used when possible.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const KEY_HASH = {
    // Non characters
    9: 'Backspace',
    9: 'Tab',
    13: 'Enter',
    16: 'Shift',
    17: 'Control',
    18: 'Alt',
    27: 'Escape',       // older IE: Esc 
    32: 'Space',
    33: 'PageUp',
    34: 'PageDown',
    35: 'End',
    36: 'Home',
    37: 'ArrowLeft',    // older IE: Left
    38: 'ArrowUp',      // older IE: Up
    39: 'ArrowRight',
    40: 'ArrowDown',    // older IE: Down
    44: 'PrintScreen',
    45: 'Insert',
    46: 'Delete',

    // Numbers (TODO could add numpad keys)
    48: '0',    // and )
    49: '1',    // and !
    50: '2',    // and @
    51: '3',    // and #
    52: '4',    // and $
    53: '5',    // and %
    54: '6',    // and ^
    55: '7',    // and &
    56: '8',    // and *
    57: '9',    // and (

    // Alphabet
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

    // "Operation" keys - part 2
    186: ';',   // (; and :)
    187: '+',   // (= and +)
    189: '-',   // (_ and -)
    188: ',',   // (< and ,)
    190: '.',   // (> and .)
    191: '?',   // (/ and ?)
    219: '[',   // ({ and [)
    221: ']',   // (} and ])
    220: '\\',  // (| and \)
    222: '"',   // (' and "") which maps both single and double quote to 222
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