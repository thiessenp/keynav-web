!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.KeynavWeb=e():t.KeynavWeb=e()}(self,(function(){return(()=>{"use strict";var t={561:(t,e,i)=>{i.r(e),i.d(e,{Hotkeys:()=>n,Keynav:()=>u});var r={keys:{},isHotkeysEnabled:!0,init:function(t){!function(t){var e=t||document;e.querySelectorAll("[data-knw-hotkey]").forEach((function(t){var i=t.dataset.knwHotkey;if(i){var n=/^alt/i.test(i),a=/^ctrl/i.test(i);if(o(n||a?i.split("+")[1]:i)){var c=e.querySelector(i);c||(c=t),r.keys[i]={triggerEl:c}}else s("Hotkeys: invalid hotkey "+i)}else s("Hotkeys: no hotkey for "+i)}))}(t),document.addEventListener("keyup",(function(t){if(r.isHotkeysEnabled&&!function(t){return/input|textarea|select/i.test(t.target.tagName)}(t)&&o(t.key)){var e="";t.altKey&&(e="alt+"),t.ctrlKey&&(e="ctrl+"),e+=t.key.toLowerCase();var i=r.keys[e];i&&(i.triggerEl?i.triggerEl.click():s("Error: no trigger element for key="+e))}}))}};const n=r;function o(t){return/[a-z]/i.test(t)}function s(t){this.isLog&&console.log("Hotkeys Error: "+t)}function a(t,e){for(var i=0;i<e.length;i++){var r=e[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}var c=function(){function t(e){var i=e.items,r=e.isAutoInit,n=void 0===r||r,o=e.activateCb,s=e.deactivateCb;if(function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.items=[],this.activateCb=function(t){t&&"0"!==t.getAttribute("tabindex")&&(console.log("0"),t.setAttribute("tabindex","0"))},this.deactivateCb=function(t){t&&"-1"!==t.getAttribute("tabindex")&&(console.log("-1"),t.setAttribute("tabindex","-1"))},!i||void 0===i.length)throw new Error("Error: called List constructor without items list");this.items=Array.from(i),o&&"function"==typeof o&&(this.activateCb=o),s&&"function"==typeof s&&(this.deactivateCb=s),n&&this.init()}var e,i,r;return e=t,r=[{key:"createListsFromDOM",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"[data-knw-list]",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"[data-knw-list-item]",i=document.querySelectorAll(t),r=[];return i.forEach((function(t){r.push(t.querySelectorAll(e))})),r}},{key:"buildKeynavLists",value:function(e){var i=e.listItems,r=e.selectorList,n=e.selectorListItem,o=e.activateCb,s=e.deactivateCb;return i=i||t.createListsFromDOM(r,n),(i=Array.from(i)).map((function(e){if(!e||void 0===e.length)throw new Error("Error: Lists addListItems received a non array like list of items in listItems");return new t({items:e=Array.from(e),selectorList:r,selectorListItem:n,activateCb:o,deactivateCb:s})}))}}],(i=[{key:"init",value:function(){this.addBehavior();var t=this.getActive()||this.items[0];this.setActive(t)}},{key:"addBehavior",value:function(){var t=this;this.items.forEach((function(e){e&&(e.addEventListener("keydown",(function(e){t.handleKey(e)})),e.addEventListener("click",(function(e){t.handleClick(e)})))}))}},{key:"handleKey",value:function(t){var e=function(t){var e=t.code||t.key||t.keyCode;if(e)return function(t){return"Esc"===t||"Escape"===t||27===t?"Escape":"Enter"===t||13===t?"Enter":" "===t||"Space"===t||32===t?"Space":"ArrowUp"===t||"Up"===t||38===t?"ArrowUp":"ArrowDown"===t||"Down"===t||40===t?"ArrowDown":"ArrowLeft"===t||"Left"===t||37===t?"ArrowLeft":"ArrowRight"===t||"Right"===t||39===t?"ArrowRight":"Delete"===t||"Delete"===t||46===t?"Delete":"End"===t||"End"===t||35===t?"End":"Home"===t||"Home"===t||36===t?"Home":void 0}(e)}(t);if("Enter"===e||"Space"===e){t.preventDefault();var i=t.target;i&&i.click()}else if("ArrowDown"===e||"ArrowRight"===e){t.preventDefault();var r=this.getNext(t.target);this.setFocussed(r),r.focus()}else if("ArrowUp"===e||"ArrowLeft"===e){t.preventDefault();var n=this.getPrev(t.target);this.setFocussed(n),n.focus()}}},{key:"handleClick",value:function(t){this.setActive(t.target)}},{key:"setActive",value:function(t){this.removeActive(),this.activateCb(t)}},{key:"removeActive",value:function(){var t=this.getActive();this.deactivateCb(t)}},{key:"setFocussed",value:function(t){t&&"-1"!==t.getAttribute("tabindex")&&"0"!==t.getAttribute("tabindex")&&t.setAttribute("tabindex","-1")}},{key:"getActive",value:function(){return this.items.find((function(t){return"0"===t.getAttribute("tabindex")}))}},{key:"getNext",value:function(t){var e=this.items.indexOf(t);return e<0?this.items[0]:this.items[e+1]?this.items[e+1]:this.items[0]}},{key:"getPrev",value:function(t){var e=this.items.indexOf(t);return e<0?this.items[0]:this.items[e-1]?this.items[e-1]:this.items[this.items.length-1]}}])&&a(e.prototype,i),r&&a(e,r),t}();const u={initialized:!1,lists:[],init:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.initialized||(this.lists=c.buildKeynavLists({listItems:t.items,activateCb:t.activateCb,deactivateCb:t.deactivateCb}),this.initialized=!0)}}}},e={};function i(r){if(e[r])return e[r].exports;var n=e[r]={exports:{}};return t[r](n,n.exports,i),n.exports}return i.d=(t,e)=>{for(var r in e)i.o(e,r)&&!i.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},i.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),i.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i(561)})()}));