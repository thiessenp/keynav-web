const Keynav = {};

Keynav.init = function(el) {
    // Note: isEnabled not checked here so can easily enable it. Add check if problems.
    var containerEl = el || document;
    var keynavEls = containerEl.querySelectorAll('[data-knw-keynav-list]');

    keynavEls.forEach(keynavListEl => {
        addKeynavToList(keynavListEl);
    });
};

export default Keynav;


/**
 * Maps a keyboard key (probably from an event) to the "new" standardized DOM
 * event key name. This also acts as a filter to only allow certain key for nav.
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

/**
 * Behavior
 * arrorwing to next/prev El triggers a focus on it (prob w/ border)
 * enter/space clicks the current el (any click callbacks on the El r called)
 */
function addKeynavToList(listEl) {
    if (!listEl) return;
    
    var active = null;
    listEl.addEventListener('keydown', (e) => {
        // Avoid e.preventDefault(); here, or keys like tab stop working..

        const key = getKeyByEvent(e);

        if (key === 'Enter' || key === 'Space') {
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
            if (!active) {
                active = listEl.firstElementChild;
            }
            else if (active.nextElementSibling) {
                active = active.nextElementSibling;
            }

            if (active) { 
                active.focus();
            }
        }
        else if (key === 'ArrowUp' || key === 'ArrowLeft') {
            e.preventDefault();
            if (!active) {
                active = listEl.firstElementChild;
            } 
            else if (active.previousElementSibling) {
                active = active.previousElementSibling;
                active.focus();
            }

            if (active) { 
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
