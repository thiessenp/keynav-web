/**
 * Maps a keyboard key (probably from an event) to the "new" standardized DOM
 * event key name. This also can act as a filter to only allow certain keys for nav.
 * 
 * @param {string} key string proboably from an event
 */
function getMappedKey(key) {
    // Normalize the key
    // or could just regex for keys like:
    // /^Key[A-Z]/.test(key) || /^Arrow[Up|Down|Right|Left]/.test(key)) {...
    // note: Key codes originally used by IE 'Esc', 'Up', 'Down'
    if (key === 'Esc' || key === 'Escape' || key === 27) return 'Escape';
    if (key === 'Enter' || key === 13) return 'Enter';
    if (key === ' ' || key === 'Space' || key === 32) return 'Space';
    if (key === 'ArrowUp' || key === 'Up' || key === 38) return 'ArrowUp';
    if (key === 'ArrowDown' || key === 'Down' || key === 40) return 'ArrowDown';
    if (key === 'ArrowRight' || key === 'Right' || key === 39) return 'ArrowRight';
    if (key === 'ArrowLeft' ||key === 'Left' || key === 37) return 'ArrowLeft';

    // undefined returned for not found
}

function getKeyByEvent(e) {
    // e.g. Space key: e.code=Space, e.key= , e.keyCode=32
    const key = e.code || e.key ||  e.keyCode;

    if (key) {
        return getMappedKey(key);
    }
    // undefined returned for not found
};

export {
    getMappedKey as normalizeKey,
    getKeyByEvent as getKeyByEvent
}