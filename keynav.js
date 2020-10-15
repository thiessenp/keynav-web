/**
 * Adds Keyboard navigation to HTML elements through data attributes.
 * 
 * User behavior would be tabbing to the container UL and then keying down and 
 * up through the list element. Once in the list, tabbing again would either 
 * navigate to a tabable element in that list item or the next tabable element 
 * in the DOM.
 * 
 * Example Usage:
 * ```
 * // JS: Once DOM ready
 * knw.keynav.init()    // Or if using this file directly: Keynav.init()
 * 
 * // JS: Add Behavior?
 * // Each list item has a listener to trigger a click on keying Enter or Space.
 * // This way any click listeners on a list element would fire.
 * 
 * // HTML: add keynav to a list using data-knw-keynav-list
 * <h2 id="keynavUpDown-label">List of Items - nav with up or down keys</h2>
 * <ul data-knw-keynav-list tabindex="0" id="keynavUpDown-list" aria-labelledby="keynavUpDown-label">
 *  <li tabindex="-1">List Item A</li>
 *  <li tabindex="-1" data-knw-keynav-list-active>List Item B</li>
 *  <li tabindex="-1">List Item C</li>
 * </ul>
 * ```
 */

const Keynav = {};

Keynav.initialized = false;
Keynav.dataSelectorList = 'data-knw-keynav-list';
Keynav.dataSelectorListItemActive = 'data-knw-keynav-list-active';

Keynav.init = function(el) {
    if (!this.initialized) {
        const containerEl = el || document;
        const keynavEls = containerEl
            .querySelectorAll(`[${Keynav.dataSelectorList}]`);

        keynavEls.forEach(keynavListEl => {
            addKeynavToList(keynavListEl);
        });

        this.initialized = true;
    }
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

    listEl.addEventListener('keydown', function(e) {
        // Avoid e.preventDefault(); here, or keys like tab stop working..

        const key = getKeyByEvent(e);
        
        // Data attribute used to track active to make tracking state easier
        let active = getActive(this);

        if (key === 'Enter' || key === 'Space') {
            e.preventDefault();
            // Inactive list so enter at the first list item
            if (!active) {
                active = this.firstElementChild;
                setActive(this, active);
                active.focus();
            // Active list so activate (browser click on) the current element
            } else {
                active.click();
            }
        }
        else if (key === 'ArrowDown' || key === 'ArrowRight') {		
            e.preventDefault();	
            if (!active) {
                active = this.firstElementChild;
            }
            else if (active.nextElementSibling) {
                active = active.nextElementSibling;
            }

            if (active) { 
                setActive(this, active);
                active.focus();
            }
        }
        else if (key === 'ArrowUp' || key === 'ArrowLeft') {
            e.preventDefault();
            if (!active) {
                active = this.firstElementChild;
            } 
            else if (active.previousElementSibling) {
                active = active.previousElementSibling;
                active.focus();
            }

            if (active) { 
                setActive(this, active);
                active.focus();
            }
        }
        else if (key === 'Escape') {
            e.preventDefault();
            active = null;
            // reset focus back on the list container to "show" left list
            this.focus();
        }
    });
}

function getActive(listEl) {
    if (!listEl) return;

    return listEl.querySelector(`[${Keynav.dataSelectorListItemActive}]`);
}

function setActive(listEl, listItemEl) {
    if (!listEl || !listItemEl) return;

    // remove old active el attribute
    const oldActiveEl = listEl.querySelector(`[${Keynav.dataSelectorListItemActive}]`);
    oldActiveEl && oldActiveEl.removeAttribute(Keynav.dataSelectorListItemActive);

    // set new active el attribute
    listItemEl.setAttribute(Keynav.dataSelectorListItemActive, '');
}
