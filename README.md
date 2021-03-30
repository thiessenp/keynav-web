# keynav-web
Utility classes to add Keyboard Navigation and Hotkeys for web based UIs.

*TODO IE11 support using babel*

## Keynav Modules/Components

### Keyanv

Adds Keyboard navigation to a list of elements with default behavior similar to
a native HTML SELECT element. See `test/keynav.html` for more info.

Example:
```
// JS
const keynav = new KeynavWeb.Keynav({
    listEl: document.querySelector('.keynav-list'),
    listItemsSelector: '.keynav-list > li',
});
// HTML
<ol class="keynav-list" ...
    <li>List Item A</li>
    <li>List Item B</li>
</ol>
```

### Hotkeys

Adds Hotkeys using data-attributest on an element. Once that element is keyed 
whatever behavior you added to it is triggered. See `test/hotkeys.html` for more
 info.

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

### Focus Trap

Traps tabbing withing an element. So you can <kbd>tab</kbd> forward or 
<kbd>shift+tab</kbd> on any focussable item within the element BUT not outside 
it. This is probably only useful in modal dialogs or similar and probably used
alongside with Hotkeys. See `test/hotkeys.html` for more info.

Example:
```
// JS
const focusTrap = new KeynavWeb.FocusTrap({     // e.g. when opening the dialog
    containerEl: document.querySelector('.my-dialog')
});
focusTrap.remove();     // e.g. when closing the dialog
```

