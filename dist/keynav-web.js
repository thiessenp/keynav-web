!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.KeynavWeb=t():e.KeynavWeb=t()}(self,(function(){return(()=>{"use strict";var e={740:(e,t,n)=>{n.r(t),n.d(t,{hotkeys:()=>r,keynav:()=>d});var o={keys:{},isHotkeysEnabled:!0,init:function(e){!function(e){var t=e||document;t.querySelectorAll("[data-knw-hotkey]").forEach((function(e){var n=e.dataset.knwHotkey;if(n){var r=/^alt/i.test(n),a=/^ctrl/i.test(n);if(i(r||a?n.split("+")[1]:n)){var s=t.querySelector(n);s||(s=e),o.keys[n]={triggerEl:s}}else l("Hotkeys: invalid hotkey "+n)}else l("Hotkeys: no hotkey for "+n)}))}(e),document.addEventListener("keyup",(function(e){if(o.isHotkeysEnabled&&!function(e){return/input|textarea|select/i.test(e.target.tagName)}(e)&&i(e.key)){var t="";e.altKey&&(t="alt+"),e.ctrlKey&&(t="ctrl+"),t+=e.key.toLowerCase();var n=o.keys[t];n&&(n.triggerEl?n.triggerEl.click():l("Error: no trigger element for key="+t))}}))}};const r=o;function i(e){return/[a-z]/i.test(e)}function l(e){this.isLog&&console.log("Hotkeys Error: "+e)}function a(e){var t,n=function(e){var t=e.code||e.key||e.keyCode;if(t)return function(e){return"Esc"===e||"Escape"===e||27===e?"Escape":"Enter"===e||13===e?"Enter":" "===e||"Space"===e||32===e?"Space":"ArrowUp"===e||"Up"===e||38===e?"ArrowUp":"ArrowDown"===e||"Down"===e||40===e?"ArrowDown":"ArrowRight"===e||"Right"===e||39===e?"ArrowRight":"Delete"===e||"Delete"===e||46===e?"Delete":"End"===e||"End"===e||35===e?"End":"Home"===e||"Home"===e||36===e?"Home":void 0}(t)}(e),o=c(this);"Enter"===n||"Space"===n?(e.preventDefault(),this,(t=o)?t.click():(u(this,t=this.firstElementChild),t.focus())):"ArrowDown"===n||"ArrowRight"===n?(e.preventDefault(),s(this,o)):"ArrowUp"===n||"ArrowLeft"===n?(e.preventDefault(),function(e,t){t?t.previousElementSibling?t.previousElementSibling&&(t=t.previousElementSibling).focus():t=e.lastElementChild:t=e.firstElementChild,t&&(u(e,t),t.focus())}(this,o)):"Home"===n?(e.preventDefault(),function(e){s(e)}(this),console.log("home")):"End"===n&&(e.preventDefault(),function(e){e&&e.lastElementChild&&s(e,e.lastElementChild.previousElementSibling)}(this),console.log("end"))}function s(e,t){t&&t.nextElementSibling?t.nextElementSibling&&(t=t.nextElementSibling):t=e.firstElementChild,t&&(u(e,t),t.focus())}function c(e){if(e)return e.querySelector('[tabindex="0"]')}function u(e,t){if(e&&t){var n=c(e);n&&n.setAttribute("tabindex","-1"),t.setAttribute("tabindex","0")}}var f={initialized:!1,dataSelectorList:"data-knw-keynav-list",init:function(e){this.initialized||(function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"data-knw-keynav-list";e.querySelectorAll("[".concat(t,"]")).forEach((function(e){e&&(e.addEventListener("keydown",a),c(e)||s(e))}))}(e||document,f.dataSelectorList),this.initialized=!0)}};const d=f}},t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={exports:{}};return e[o](r,r.exports,n),r.exports}return n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n(740)})()}));