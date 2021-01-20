# keynav-web
keyboard navigation for web based UIs.

*TODO Fix hotkeys*
*TODO IE11 support using babel*

## Keynav for Lists

Adds Keyboard navigation to HTML elements through data attributes.

User behavior would be tabbing to the container UL and then keying down and 
up through the list element. Once in the list, tabbing again would either 
navigate to a tabable element in that list item or the next tabable element 
in the DOM.

Example Usage:
```
// JS: Once DOM ready
const listSimple1 = new KeynavWeb.ListNav({
    listEl: document.querySelector('.listSimple1'),
    listItemsSelector: '.listSimple1 > li'
});

// JS: Add Behavior?
// Each list item has a listener to trigger a click on keying Enter or Space.
// This way any click listeners on a list element would fire.
doSomething({items:'.listSimple1 > li', output:'.listSimple1-output'});

// HTML: add keynav to a list using data-knw-keynav-list
...
<div class="listSimple2" aria-labelledby="listSimple2-label">
    <div><span>List Item A</span></div>
    <div><span>List Item B</span></div>
    <div><span>List Item C</span></div>
</div>
...
```

## Keynav for Hotkeys
Creates a list of hotkeys from the data attributes in the DOM. The list maps each hotkey to an element to be used for triggering. 

Example:
```
// JavaScript Add hotkeys (searched from DOM)
KeynavWeb.hotkeys.init();

// Example: adds hotkey 'x'. When 'x' is keyed, the link is clicked
<li data-hotkey-web="x">
    <a class="hotkey-web-x" href="#x">Hotkey 'x' triggers me</a>
</li>

// Example: adds hotkey 'x' with Custom CSS Mapping. When x is keyed
// the element with the matching CSS selector is clicked.
<li data-hotkey-web="x" data-hotkey-web-selector=".hotkey-web-x">
    <a class="hotkey-web-x" href="#x">Hotkey 'x' triggers me</a>
</li>
```

## Development

Note: Webpack has trouble importing projects created with Webpack, so includes the source in publish. BUT this ran into a Webpack error also where it would not run the babel-loader for imported libs. BUTx2 the built webpack project seems to be working as an import in another webpack project... "le sigh..." So, remove this from the package.json for now: 
```
// this alows projects that use the import ES6 style to auto chose the lib src -- TODO: add back later
"module": "lib/index.js",
```

### Test/Example

Run a quick test/example by loading `./test/test.html` in a server and trying keynav.

### Publishing

On windows, powershell has trouble with executing npm scripts so use Command 
Prompt:

```
// build first
// note: remember to semantically bump package.json version
npm run build

npm login
npm publish
```
