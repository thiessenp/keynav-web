import {getKeyFromEvent, getModifierKeyFromEvent} from './keys';


/**
 * Adds behavior to tab/shift+tab only the list of focussable items in a Dialog.
 */
export class FocusTrap {
    // No Default (document) since intended to be used in a container
    containerEl;

    // Holds list of activatable elements
    // NOTE: may want to add a dynamic cache encase of DOM updates on container
    items;

    // NOTE: SLOWLY addin private vars to see how Babble/child-Babble projs react
    #events = [];

    // NOTE: could get specific with TYPE but only works if developer adds type
    // input[type="text"]:not([disabled]),
    // input[type="radio"]:not([disabled]),
    // input[type="checkbox"]:not([disabled]),
    #selectorsActiveatable = `
        a[href]:not([disabled]), 
        button:not([disabled]), 
        textarea:not([disabled]), 
        input:not([disabled]),
        select:not([disabled]), 
        [tabindex="0"],
        [data-knw-activatable]
    `;

    /**
     * Builds a Focus trap instance
     * @param {Object.Element} containerEl - element to the focus trap on
     * @param {Object.Array} items - list of activatable elements (optional)
     * @param {Object.String} selectorsActiveatable - overrides default selector
     * for activatable elements
     * @param {Object.Boolean} isAutoInit - default is to initialize instance
     * immediately, set to false to delay for something like waiting for the DOM
     */
    constructor({containerEl, items, selectorsActiveatable, isAutoInit=true}) {
      if (!containerEl) {
        throw new Error('TabTrap contructor requires a containerEl and tabs');
      }
      this.containerEl = containerEl;

      if (items) {
        this.items;
      }
      if (selectorsActiveatable) {
        this.#selectorsActiveatable;
      }

      if (isAutoInit) {
        this.init();
      }
    }

    /**
     * Initializes the class by creating the activatable list and adds tab trap
     * behavior
     */
    init() {
      // Allows a custom Items to be sent or use default to creat items[]
      if (!this.items) {
        const items = this.containerEl.querySelectorAll(this.#selectorsActiveatable);
        this.items = Array.from(items);
      }

      this.addBehavior();
    }

    /**
     * Adds focus trap behavior to container element
     */
    addBehavior() {
      this.#events[0] = {
        topic: 'keydown',
        callback: (e) => {
          const key = getKeyFromEvent(e);
          const modifier = getModifierKeyFromEvent(e);
          const activeEl = window.document.activeElement;

          // Only care if it's a tab key - for forward/back focus
          if (key !== 'Tab') {
            return;
          }

          // Check back in list (shift+tab keyed)
          // otherwise check forward in list (tab keyed)
          if (modifier === 'Shift') {
            if (activeEl === this.getFirstItem()) {
              e.preventDefault();
              // Beginning of list so loop around focus the last item
              this.getLastItem().focus();
            }
          } else {
            if (activeEl === this.getLastItem()) {
              e.preventDefault();
              // End of the list so loop around to the first item
              this.getFirstItem().focus();
            }
          }
        },
      };

      this.containerEl.addEventListener(
          this.#events[0].topic,
          this.#events[0].callback,
      );
    }

    /**
     * @TODO Think of how to deal with a zero size list better
     * @return {Element} first element in activatable list
     */
    getFirstItem() {
      return this.items[0];
    }

    /**
     * @TODO Think of how to deal with a zero size list better
     * @return {Element} last element in activatable list
     */
    getLastItem() {
      return this.items[this.items.length - 1];
    }

    /**
     * Removes any added behavior (events) from this Class
     */
    remove() {
      this.containerEl.removeEventListener(
          this.#events[0].topic,
          this.#events[0].callback,
      );
    }
}
