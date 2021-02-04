# keynav-web
keyboard navigation for web based UIs.

*TODO IE11 support using babel*

## Keynav Modules/Components

### List Navigation (custom SELECT)

Adds Keyboard navigation similar to a native SELECT element on a custom element. So when a user tabs to the custom element, then up/down/left/right/space/enter keys have the same behavior. Tabbing again taks the user to the next focusable element.

Example:
```
// JS
const listSimple1 = new KeynavWeb.ListNav({
    listEl: document.querySelector('.listSimple1'),
    listItemsSelector: '.listSimple1 > li'
});
// HTML
<ol class="listSimple1" ...
    <li>List Item A</li>
    <li>List Item B</li>
</ol>
```

Full Example See: `./test/list.html`

### Hotkeys

Adds the convienience of mapping data-attributes to event listeners that when Keyed fire a click on that element. So it's still up to you to add whatever should happen when the keyed element is "clicked".

Example:
```
// JS
const globalHotkeys = KeynavWeb.Hotkeys.buildGlobal({
    selectorHotkeys: '[data-knw-hotkeys-key]'       // selector can be an attribute or class
});
// HTML
<button data-knw-hotkeys-key='a'>Key a</button>     <!--keying 'a' would click the button -->
<button data-knw-hotkeys-key='b'>Key b</button>
```

Full Example See: `./test/hotkeys.html`

### Focus Trap

Traps tabbing withing an element. So you can <kbd>tab</kbd> forward or <kbd>shift+tab</kbd> on any focussable item within the element BUT not outside it. This is probably only useful in modal dialogs or similar and probably used alongside with Hotkeys.

Example:
```
// JS
const focusTrap = new KeynavWeb.FocusTrap({     // e.g. when opening the dialog
    containerEl: document.querySelector('.my-dialog')
});
focusTrap.remove();     // e.g. when closing the dialog
```

Full Example See: `./test/hotkeys.html`

## Tests (examples)

For example to help testing (especially for ATs like screen readers), see: `./test/
