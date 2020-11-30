import {getKeyByEvent} from './keys';

/**
 * Behavior
 * arrorwing to next/prev El triggers a focus on it (prob w/ border)
 * enter/space clicks the current el (any click callbacks on the El r called)
 */
function addKeynavToList(containerEl, dataSelectorList='data-knw-keynav-list') {
    const keynavEls = containerEl.querySelectorAll(`[${dataSelectorList}]`);
    keynavEls.forEach((listEl) => {
        if (!listEl) {
            return;
        }

        listEl.addEventListener('keydown', handleListNavigation);

        if (!getActiveListItem(listEl)) {
            nexListItem(listEl);
        }
    });
}

/**
 * 
 * Note: Automatic Navigation (activate item on nav to) is used. Could 
 * add a feature switch for Automatic/Manual nav.
 */
function handleListNavigation(e) {
    // Avoid e.preventDefault(); here, or keys like tab stop working..

    const key = getKeyByEvent(e);
    
    // Data attribute used to track active to make tracking state easier
    let active = getActiveListItem(this);

    if (key === 'Enter' || key === 'Space') {
        e.preventDefault();
        activateListItem(this, active)
    }
    else if (key === 'ArrowDown' || key === 'ArrowRight') {		
        e.preventDefault();	
        nexListItem(this, active)
    }
    else if (key === 'ArrowUp' || key === 'ArrowLeft') {
        e.preventDefault();
        prevListItem(this, active)
    }
}

function nexListItem(listEl, el) {
    if (!el) {
        el = listEl.firstElementChild;
    }
    else if (el.nextElementSibling) {
        el = el.nextElementSibling;
    }

    if (el) { 
        setActiveListItem(listEl, el);
        el.focus();
    }
}

function prevListItem(listEl, el) {
    if (!el) {
        el = listEl.firstElementChild;
    } 
    else if (el.previousElementSibling) {
        el = el.previousElementSibling;
        el.focus();
    }

    if (el) { 
        setActiveListItem(listEl, el);
        el.focus();
    }
}

function activateListItem(listEl, el) {
    // Inactive list so enter at the first list item
    if (!el) {
        el = listEl.firstElementChild;
        setActiveListItem(listEl, el);
        el.focus();
    // Active list so activate (browser click on) the current element
    } else {
        el.click();
    }
}

function getActiveListItem(listEl) {
    if (!listEl) return;

    return listEl.querySelector(`[tabindex="0"]`);
}

function setActiveListItem(listEl, listItemEl) {
    if (!listEl || !listItemEl) return;

    // remove old active el attribute
    const oldActiveEl = getActiveListItem(listEl);
    if (oldActiveEl) {
        oldActiveEl.setAttribute('tabindex', '-1');
    }

    // set new active el attribute
    listItemEl.setAttribute('tabindex', '0');
}

export {
    getActiveListItem,
    setActiveListItem,
    handleListNavigation,
    addKeynavToList
}