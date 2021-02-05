/**
 * Maps a keyboard key either from legacy event.which
 * to event.key or vice versa.
 *
 * Note: event.code is rarely useful so not included.
 * Note: What key, which thing? Look it up on https://keycode.info/
 *
 * @param {object} e proboably from an event
 * @return {String} key keyed
 */
function getKeyFromEvent(e) {
  if (typeof e !== 'object') {
    return e;
  }

  // Case of Space e.key that returns an actual ' ', so use e.code instead
  if (e.code === 'Space') {
    return 'Space';
  }

  // Legacy event, use e.which to get e.key for modern browsers - UNPREDICTABLE
  // if (e.key === undefined && Number.isInteger(e.which)) {
  //     // WARNING: INCOMPLETE and does NOT WORK correctly with non numeric/alphabet
  //     return getKeyByWhich(e.which);
  // }

  // Event has a key that will probably work right, let's use it
  return e.key;
}

/**
 * Fires a custom key keyed DOM event.
 * @param {Object} target to fire event on
 * @param {Object} type event topic (should one of keydown/keypress/keyup)
 */
function fireKey({target=document, type='keydown', key /* DEPRECATED - which*/}) {
  if (key === undefined /* && which === undefined*/) {
    return;
  }

  // DEPRECATED: Which not needed in modern browsers but here it is for legacy
  // if (which === undefined) {
  //     which = mapKeyToWhich(key);
  // }

  // DEPRECATED: Also which may be more convenient so add a mapping to key
  // WARNING: unpredictable since keys can map to multiple codes, depeneding
  // if (key === undefined) {
  //     key = mapWhichToKey(which);
  // }

  const customKeyEvent = new KeyboardEvent(type, {
    key,
    // which
    bubbles: true,
  });
  target.dispatchEvent(customKeyEvent);
}

/**
 * Gets if/the key combination/modifier fired.
 * Useful when want to use key combinations with on.keydown
 * @param {Event} e event fired to get the modifier
 * @return {String} modifier string or empty string if none
 */
function getModifierKeyFromEvent(e) {
  if (typeof e !== 'object') {
    return '';
  }

  // Check for and return modifier as string
  if (e.altKey) {
    return 'Alt';
  }
  if (e.shiftKey) {
    return 'Shift';
  }
  if (e.ctrlKey) {
    return 'Ctrl';
  }

  // None found, flag with empty string
  return '';
}

export {
  fireKey,
  getKeyFromEvent,
  getModifierKeyFromEvent,
  mapWhichToKey,
  mapKeyToWhich,
};


// /////////////////////////////////////////////////////////////////////////////
// NOTE: Below For historical purposes.
// WARNING: event.which is deprecated and event.key (since IE9) should be used.
// /////////////////////////////////////////////////////////////////////////////
const KEY_HASH = {
  // Non characters
  8: 'Backspace',
  9: 'Tab',
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  27: 'Escape', // older IE: Esc
  32: 'Space',
  33: 'PageUp',
  34: 'PageDown',
  35: 'End',
  36: 'Home',
  37: 'ArrowLeft', // older IE: Left
  38: 'ArrowUp', // older IE: Up
  39: 'ArrowRight',
  40: 'ArrowDown', // older IE: Down
  44: 'PrintScreen',
  45: 'Insert',
  46: 'Delete',

  // Numbers (TODO could add numpad keys)
  48: '0', // and )
  49: '1', // and !
  50: '2', // and @
  51: '3', // and #
  52: '4', // and $
  53: '5', // and %
  54: '6', // and ^
  55: '7', // and &
  56: '8', // and *
  57: '9', // and (

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
  186: ';', // (; and :)
  187: '+', // (= and +)
  189: '-', // (_ and -)
  188: ',', // (< and ,)
  190: '.', // (> and .)
  191: '?', // (/ and ?)
  219: '[', // ({ and [)
  221: ']', // (} and ])
  220: '\\', // (| and \)
  222: '"', // (' and "") which maps both single and double quote to 222
};

/**
 * @deprecated
 * @param {String} key converts the 'key' format to the old integer code
 * @return {Number} converted key or undefined if none found
 */
function mapWhichToKey(key) {
  if (key === undefined) {
    return;
  }

  key = parseInt(key);
  if (Number.isInteger(key)) {
    return KEY_HASH[key];
  }

  // Explicit return of undefined for key not found
  return;
}

/**
 * @deprecated
 * @param {Number} key convers old integer code to new 'key' string format
 * @return {String} converted key or undefined if none found
 */
function mapKeyToWhich(key) {
  if (key === undefined) {
    return;
  }

  const valuesAsArray = Array.from(Object.values(KEY_HASH));
  const indexOfMatch = valuesAsArray.indexOf(key);
  const keysAsArray = Array.from(Object.keys(KEY_HASH));
  if (keysAsArray[indexOfMatch]) {
    return keysAsArray[indexOfMatch];
  }

  // Explicit return of undefined for key not found
  return;
}
