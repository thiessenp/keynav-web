import {getKeyByEvent} from './keys';

// TODO: Delete	When focus is on the Joke tab, removes the tab from the tab list and places focus on the previous tab.

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

    // TODO: careful with `this` maybe set explicit?
    
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
    else if (key === 'Home') {
        e.preventDefault();
        firstListItem(this);
    }
    else if (key === 'End') {
        e.preventDefault();
        // Defaults to sendi,g focus to first element
        lastListItem(this);
    }
}

function nexListItem(listEl, el) {
    // Assume 1st element in list if none sent OR no next (end of list)
    if (!el || !el.nextElementSibling) {
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
    // Loop around to last element if at beginning of list
    else if (!el.previousElementSibling) {
        el = listEl.lastElementChild;
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

function firstListItem(listEl) {
    // Defaults to sendi,g focus to first element
    nexListItem(listEl);
}

function lastListItem(listEl) {
    if (!listEl || !listEl.lastElementChild) {
        return;
    }

    // Get to the last item, by finding the second last item that next uses
    const secondLastEl = listEl.lastElementChild.previousElementSibling;
    nexListItem(listEl, secondLastEl);
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