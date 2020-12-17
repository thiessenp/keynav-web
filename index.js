/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is not neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["KeynavWeb"] = factory();
	else
		root["KeynavWeb"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/hotkeys.js":
/*!************************!*\
  !*** ./src/hotkeys.js ***!
  \************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__.r, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => __WEBPACK_DEFAULT_EXPORT__\n/* harmony export */ });\nvar Hotkeys = {}; // Hotkeys Hash of found in DOM attributes\n\nHotkeys.keys = {}; // Disable/enable keynav dynamically but remember to call addHotkeys again\n\nHotkeys.isHotkeysEnabled = true;\n\nHotkeys.init = function (el) {\n  addHotkeys(el);\n  addHotkeysBehavior();\n};\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Hotkeys);\n/**\r\n * Creates a list of hotkeys from the data attributes in the DOM. The list maps \r\n * each hotkey to an element to be used for triggering. \r\n *\r\n * Example:\r\n * <button click=\"doSomething()\">'x' Triggers Me</button>\r\n * \r\n * Example CSS Mapping:\r\n * <li data-hotkey-web=\"x\" data-hotkey-web-selector=\".hotkey-web-x\">\r\n *  <a class=\"hotkey-web-x\" href=\"#x\">Hotkey 'x' triggers me</a>\r\n * </li>\r\n * \r\n * @param el Optional DOM element container. Default is document body element\r\n */\n\nfunction addHotkeys(el) {\n  // Note: isEnabled not checked here so can easily enable it. Add check if problems.\n  var containerEl = el || document;\n  var hotkeyEls = containerEl.querySelectorAll('[data-knw-hotkey]');\n  hotkeyEls.forEach(function (hotkeyEl) {\n    // Get hotkey\n    var hotkey = hotkeyEl.dataset.knwHotkey;\n\n    if (!hotkey) {\n      log('Hotkeys: no hotkey for ' + hotkey);\n      return;\n    } // Key combo?\n\n\n    var hasAltKey = /^alt/i.test(hotkey);\n    var hasCtrlKey = /^ctrl/i.test(hotkey); // Valid key?\n\n    var validKey = hasAltKey || hasCtrlKey ? hotkey.split('+')[1] : hotkey;\n\n    if (!isValidHotkey(validKey)) {\n      log('Hotkeys: invalid hotkey ' + hotkey);\n      return;\n    } // Is it a key in an overlay? (only active when modal open)\n    // var isOverlay = Boolean(hotkeyEl.dataset.cmpHotkeyOverlay);\n    // Get related element for triggering, or if none, assume container should be triggered\n\n\n    var triggerEl = containerEl.querySelector(hotkey);\n\n    if (!triggerEl) {\n      triggerEl = hotkeyEl;\n    } // Map the hotkey to related data\n\n\n    Hotkeys.keys[hotkey] = {\n      triggerEl: triggerEl // isOverlay: isOverlay\n\n    };\n  });\n}\n/**\r\n * Defines what to do when a keynav element is triggered. In this case, the \r\n * triggered element is clicked, then any event handlers added to that element\r\n * will also be triggered.\r\n *\r\n * Example: trigger key and action on same element\r\n * // HTML\r\n * <button data-cmp-hotkey=\"x\">Hotkey <kbd>x</kbd></button>\r\n * // JavaScript\r\n * document.addEventListener('keydown', function(e) {\r\n *      if (e.key === 'x') { console.log('Do something when key A is keyed'); }\r\n * });\r\n *\r\n * Example: trigger key and action on *different* element\r\n * // HTML\r\n * <div data-cmp-hotkey=\"b\" data-cmp-hotkey-selector=\".cmp-hotkey-b\">Hotkey <kbd>x</kbd></div>\r\n * <div class=\"cmp-hotkey-b\">Something happens here when <kbd>b</kbd> is keyed</button>\r\n * // JavaScript\r\n * document.addEventListener('keydown', function(e) {\r\n *      if (e.key === 'b') { console.log('Do something when key B is keyed'); }\r\n * });\r\n */\n\n\nfunction addHotkeysBehavior() {\n  document.addEventListener('keyup', function (e) {\n    // Do some checks. Note worthy, avoid hotkeys in inputs (for obvious reasons) and only alpha or meta keys.\n    if (!Hotkeys.isHotkeysEnabled) return;\n    if (isInputElement(e)) return;\n    if (!isValidHotkey(e.key)) return; // Parse the key to a string\n\n    var key = '';\n\n    if (e.altKey) {\n      key = 'alt+';\n    }\n\n    if (e.ctrlKey) {\n      key = 'ctrl+';\n    }\n\n    key += e.key.toLowerCase(); // Use the key string to get the related key object\n\n    var keyObj = Hotkeys.keys[key];\n    if (!keyObj) return; // This should never happen (so it probably will... it's just life..)\n\n    if (!keyObj.triggerEl) {\n      log('Error: no trigger element for key=' + key);\n      return;\n    } // Trigger that related key object with a DOM click\n    // if ((!this.isOverlayState && !keyObj.isOverlay) || (this.isOverlayState && keyObj.isOverlay)) {\n\n\n    keyObj.triggerEl.click(); // }\n  });\n}\n\n; // Whitelist these keys as valid hotkeys currently just letters\n\nfunction isValidHotkey(hotkey) {\n  return /[a-z]/i.test(hotkey);\n} // Avoid activating behavior (like a hotkey) if the current element is an input related element.\n\n\nfunction isInputElement(e) {\n  return /input|textarea|select/i.test(e.target.tagName);\n} // Convenience method to only log errors when enabled (probably only in DEV environment)\n\n\nfunction log(logString) {\n  if (!this.isLog) return;\n  console.log('Hotkeys Error: ' + logString);\n}\n\n//# sourceURL=webpack://KeynavWeb/./src/hotkeys.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! namespace exports */
/*! export Hotkeys [provided] [maybe used in main (runtime-defined)] [usage prevents renaming] -> ./src/hotkeys.js .default */
/*! export Keynav [provided] [maybe used in main (runtime-defined)] [usage prevents renaming] -> ./src/keynav.js .default */
/*! other exports [not provided] [maybe used in main (runtime-defined)] */
/*! runtime requirements: __webpack_require__, __webpack_exports__, __webpack_require__.d, __webpack_require__.r, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Hotkeys\": () => /* reexport safe */ _hotkeys_js__WEBPACK_IMPORTED_MODULE_0__.default,\n/* harmony export */   \"Keynav\": () => /* reexport safe */ _keynav_js__WEBPACK_IMPORTED_MODULE_1__.default\n/* harmony export */ });\n/* harmony import */ var _hotkeys_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./hotkeys.js */ \"./src/hotkeys.js\");\n/* harmony import */ var _keynav_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./keynav.js */ \"./src/keynav.js\");\n\n\n/**\r\nCan use either Library style individual exports:\r\n    export {\r\n        Hotkeys as hotkeys,\r\n        Keynav as keynav\r\n    };\r\n    ...\r\n    import {keynav} from '...\r\n\r\nOr default Object style exports:\r\n    const KeynavWeb = {\r\n        hotkeys: Hotkeys,\r\n        keynav: Keynav\r\n    };\r\n    export default KeynavWeb;\r\n\r\nWebpack will expose both in the \"main\" Object name.\r\n */\n\n\n\n//# sourceURL=webpack://KeynavWeb/./src/index.js?");

/***/ }),

/***/ "./src/keynav.js":
/*!***********************!*\
  !*** ./src/keynav.js ***!
  \***********************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_exports__, __webpack_require__.r, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => __WEBPACK_DEFAULT_EXPORT__\n/* harmony export */ });\n/* harmony import */ var _list__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./list */ \"./src/list.js\");\n/**\r\n * Adds Keyboard navigation to HTML elements through data attributes.\r\n * \r\n * User behavior would be tabbing to the container UL and then keying down and \r\n * up through the list element. Once in the list, tabbing again would either \r\n * navigate to a tabable element in that list item or the next tabable element \r\n * in the DOM.\r\n * \r\n * Example Usage:\r\n * ```\r\n * // JS: Once DOM ready\r\n * knw.keynav.init()    // Or if using this file directly: Keynav.init()\r\n * \r\n * // JS: Add Behavior?\r\n * // Each list item has a listener to trigger a click on keying Enter or Space.\r\n * // This way any click listeners on a list element would fire.\r\n * \r\n * // HTML: add keynav to a list using data-knw-keynav-list\r\n * <h2 id=\"keynavUpDown-label\">List of Items - nav with up or down keys</h2>\r\n * <ul data-knw-keynav-list id=\"keynavUpDown-list\" aria-labelledby=\"keynavUpDown-label\">\r\n *  <li tabindex=\"-1\">List Item A</li>\r\n *  <li tabindex=\"-1\" data-knw-keynav-list-active>List Item B</li>\r\n *  <li tabindex=\"-1\">List Item C</li>\r\n * </ul>\r\n * ```\r\n */\n\nvar Keynav = {};\nKeynav.initialized = false; // May be useful, should arguably remove since not using now\n\nKeynav.lists = [];\n\nKeynav.init = function () {\n  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};\n\n  if (!this.initialized) {\n    var items = props.items || _list__WEBPACK_IMPORTED_MODULE_0__.List.createListsFromDOM({\n      selectorList: props.selectorList || '[data-knw-list]',\n      selectorListItem: props.selectorListItem || '[data-knw-list-item]'\n    });\n    this.lists = _list__WEBPACK_IMPORTED_MODULE_0__.List.buildLists({\n      items: items,\n      activateCb: props.activateCb,\n      deactivateCb: props.deactivateCb,\n      focussedCb: props.focussedCb\n    });\n    this.initialized = true;\n  }\n};\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Keynav);\n\n//# sourceURL=webpack://KeynavWeb/./src/keynav.js?");

/***/ }),

/***/ "./src/keys.js":
/*!*********************!*\
  !*** ./src/keys.js ***!
  \*********************/
/*! namespace exports */
/*! export KEY_HASH [provided] [no usage info] [missing usage info prevents renaming] */
/*! export fireKey [provided] [no usage info] [missing usage info prevents renaming] */
/*! export getKeyFromEvent [provided] [no usage info] [missing usage info prevents renaming] */
/*! export mapKeyToWhich [provided] [no usage info] [missing usage info prevents renaming] */
/*! export mapWhichToKey [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"KEY_HASH\": () => /* binding */ KEY_HASH,\n/* harmony export */   \"getKeyFromEvent\": () => /* binding */ getKeyFromEvent,\n/* harmony export */   \"mapWhichToKey\": () => /* binding */ mapWhichToKey,\n/* harmony export */   \"mapKeyToWhich\": () => /* binding */ mapKeyToWhich,\n/* harmony export */   \"fireKey\": () => /* binding */ fireKey\n/* harmony export */ });\nfunction _typeof(obj) { \"@babel/helpers - typeof\"; if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nvar KEY_HASH = {\n  // Non characters\n  9: 'Tab',\n  13: 'Enter',\n  27: 'Escape',\n  // Esc older IE\n  32: 'Space',\n  33: 'PageUp',\n  34: 'PageDown',\n  35: 'End',\n  36: 'Home',\n  37: 'ArrowLeft',\n  // Left\n  38: 'ArrowUp',\n  // Up\n  39: 'ArrowRight',\n  40: 'ArrowDown',\n  // Down\n  46: 'Delete',\n  // Not sure what to do about:\n  // NUMBER_KEY=NUMBER_KEY\n  48: '0',\n  49: '1',\n  50: '2',\n  51: '3',\n  52: '4',\n  53: '5',\n  54: '6',\n  55: '7',\n  56: '8',\n  57: '9',\n  // -vs- SHIFT+NUMBER_KEY=SYMBOL\n  // 48: ')',\n  // 49: '!',\n  // 50: '@',\n  // ...57\n  // Characters - e.which integer mapping not case sensitive\n  65: 'a',\n  66: 'b',\n  67: 'c',\n  68: 'd',\n  69: 'e',\n  70: 'f',\n  71: 'g',\n  72: 'h',\n  73: 'i',\n  74: 'j',\n  75: 'k',\n  76: 'l',\n  77: 'm',\n  78: 'n',\n  79: 'o',\n  80: 'p',\n  81: 'q',\n  82: 'r',\n  83: 's',\n  84: 't',\n  85: 'u',\n  86: 'v',\n  87: 'w',\n  88: 'x',\n  89: 'y',\n  90: 'z',\n  187: '+',\n  // or '='\n  189: '-',\n  // or '_'\n  199: ',',\n  // or ','\n  190: '.',\n  // or '>'\n  191: '?',\n  // or '/'\n  220: '\\\\' // or '|'\n  // More TODO\n\n};\n\nfunction mapWhichToKey(key) {\n  if (key === undefined) {\n    return;\n  }\n\n  key = parseInt(key);\n\n  if (Number.isInteger(key)) {\n    return KEY_HASH[key];\n  } // Explicit return of undefined for key not found\n\n\n  return;\n}\n\nfunction mapKeyToWhich(key) {\n  if (key === undefined) {\n    return;\n  }\n\n  var valuesAsArray = Array.from(Object.values(KEY_HASH));\n  var indexOfMatch = valuesAsArray.indexOf(key);\n  var keysAsArray = Array.from(Object.keys(KEY_HASH));\n\n  if (keysAsArray[indexOfMatch]) {\n    return keysAsArray[indexOfMatch];\n  } // Explicit return of undefined for key not found\n\n\n  return;\n}\n/**\r\n * Maps a keyboard key either from legacy event.which \r\n * to event.key or vice versa.\r\n * \r\n * Note: event.code is rarely useful so not included.\r\n * \r\n * @param {object} e proboably from an event\r\n */\n\n\nfunction getKeyFromEvent(e) {\n  if (_typeof(e) !== 'object') {\n    return e;\n  } // Legacy event, use e.which to get e.key for modern browsers\n\n\n  if (e.key === undefined && Number.isInteger(e.which)) {\n    return getKeyByWhich(e.which);\n  }\n\n  return e.key;\n}\n\n; // What key, which thing? Look it up on https://keycode.info/\n// note: could also receive \"code\" but seems unneeded\n\nfunction fireKey(_ref) {\n  var _ref$target = _ref.target,\n      target = _ref$target === void 0 ? document : _ref$target,\n      _ref$type = _ref.type,\n      type = _ref$type === void 0 ? 'keydown' : _ref$type,\n      key = _ref.key,\n      which = _ref.which;\n\n  if (key === undefined && which === undefined) {\n    return;\n  } // Which not needed in modern browsers but here it is for legacy\n\n\n  if (which === undefined) {\n    which = mapKeyToWhich(key);\n  } // Also which may be more convenient so add a mapping to key\n\n\n  if (key === undefined) {\n    key = mapWhichToKey(which);\n  }\n\n  var customKeyEvent = new KeyboardEvent(type, {\n    key: key,\n    which: which\n  });\n  target.dispatchEvent(customKeyEvent);\n}\n\n\n\n//# sourceURL=webpack://KeynavWeb/./src/keys.js?");

/***/ }),

/***/ "./src/list.js":
/*!*********************!*\
  !*** ./src/list.js ***!
  \*********************/
/*! namespace exports */
/*! export List [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"List\": () => /* binding */ List\n/* harmony export */ });\n/* harmony import */ var _keys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./keys */ \"./src/keys.js\");\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n/**\r\n * NOTE: Only state is items[], HTML Data attributes are used to track active to make tracking state easier\r\n */\n\nvar List = /*#__PURE__*/function () {\n  function List(_ref) {\n    var _this = this;\n\n    var items = _ref.items,\n        _ref$isAutoInit = _ref.isAutoInit,\n        isAutoInit = _ref$isAutoInit === void 0 ? true : _ref$isAutoInit,\n        activateCb = _ref.activateCb,\n        deactivateCb = _ref.deactivateCb,\n        focussedCb = _ref.focussedCb;\n\n    _classCallCheck(this, List);\n\n    this.items = [];\n\n    this.activateCb = function (item) {\n      if (!item) {\n        return;\n      } // Only update if el is not currently active, avoids DOM confusion\n\n\n      if (item.getAttribute('tabindex') !== '0') {\n        // Deactivate old active item\n        var oldActiveItem = _this.items.find(function (item) {\n          return item.getAttribute('tabindex') === '0';\n        });\n\n        _this.deactivateCb(oldActiveItem); // Set new active item\n\n\n        item.setAttribute('tabindex', '0');\n      }\n    };\n\n    this.deactivateCb = function (item) {\n      if (!item) {\n        return;\n      }\n\n      if (item.getAttribute('tabindex') !== '-1') {\n        item.setAttribute('tabindex', '-1');\n      }\n    };\n\n    this.focussedCb = function (item) {\n      if (!item) {\n        return;\n      } // Make sure attribute has a tabindex so can be focussed\n\n\n      if (item.getAttribute('tabindex') !== '-1' && item.getAttribute('tabindex') !== '0') {\n        item.setAttribute('tabindex', '-1');\n      }\n\n      item.focus();\n    };\n\n    if (!items || items.length === undefined) {\n      throw new Error('Error: called List constructor without items list');\n    }\n\n    this.items = Array.from(items); // Potentially enable callbacks for increased flexibility on item activation\n\n    if (activateCb && typeof activateCb === 'function') {\n      this.activateCb = activateCb;\n    }\n\n    if (deactivateCb && typeof deactivateCb === 'function') {\n      this.deactivateCb = deactivateCb;\n    }\n\n    if (focussedCb && typeof focussedCb === 'function') {\n      this.focussedCb = focussedCb;\n    }\n\n    if (isAutoInit) {\n      this.init();\n    }\n  }\n\n  _createClass(List, [{\n    key: \"init\",\n    value: function init() {\n      this.addBehavior(); // Create an entry point by using existing Active or default to first item\n\n      var firstItem = this.getActive() || this.getFirst();\n      this.activateCb(firstItem);\n    }\n  }, {\n    key: \"addBehavior\",\n    value: function addBehavior() {\n      var _this2 = this;\n\n      //NOTE: no way to delegate since Parent > Child relationship can be any nesting\n      this.items.forEach(function (item) {\n        if (!item) {\n          return;\n        } // NOTE: keep arrow invocation this way so can call with Class's `this`\n\n\n        item.addEventListener('keydown', function (e) {\n          _this2.handleKey(e);\n        });\n        item.addEventListener('click', function (e) {\n          _this2.handleClick(e);\n        });\n      });\n    }\n  }, {\n    key: \"handleKey\",\n    value: function handleKey(e) {\n      var key = (0,_keys__WEBPACK_IMPORTED_MODULE_0__.getKeyFromEvent)(e); // List of keys part of behavior, if not do nothing\n      // NOTE: have to add key here and switch, difficult to maintain?\n\n      if (!/^Arrow[Up|Down|Right|Left]|Enter|Space|Home|End|Delete/.test(key)) {\n        return;\n      } // Stop unwanted browser default behavior like scrolling when arrowing around\n\n\n      e.preventDefault(); // Below simulates actions on the keynav list like arrowing around, enter as a click..\n\n      switch (key) {\n        case 'Enter':\n        case 'Space':\n          var item = e.target; // Click done here so can use setActive in getClick without x2 click problem\n\n          if (item) {\n            item.click();\n          }\n\n          break;\n\n        case 'ArrowDown':\n        case 'ArrowRight':\n          var next = this.getNext(e.target);\n          this.focussedCb(next);\n          break;\n\n        case 'ArrowUp':\n        case 'ArrowLeft':\n          var prev = this.getPrev(e.target);\n          this.focussedCb(prev);\n          break;\n\n        case 'Home':\n          var first = this.getFirst();\n          this.focussedCb(first);\n          break;\n\n        case 'End':\n          var last = this.getLast();\n          this.focussedCb(last);\n          break;\n\n        case 'Delete':\n          // Assumed behavior is to fist go the next (or prev?) item \n          (0,_keys__WEBPACK_IMPORTED_MODULE_0__.fireKey)({\n            target: e.target,\n            type: 'keydown',\n            key: 'ArrowUp'\n          }); // Then remove it\n\n          this.removeItem(e.target);\n          break;\n      }\n    }\n  }, {\n    key: \"handleClick\",\n    value: function handleClick(e) {\n      // Case of entering list, focus this element as the entry point\n      this.focussedCb(e.target); // NOTE: no need to click, since natively done - otherwise would be double click\n      // plus intention to handle click with custom behavior, so prevent it actually.\n\n      this.activateCb(e.target);\n    }\n  }, {\n    key: \"getNext\",\n    value: function getNext(item) {\n      var index = this.items.indexOf(item); // Not found\n\n      if (index < 0) {\n        return this.items[0];\n      } // End of list\n\n\n      if (!this.items[index + 1]) {\n        return this.items[0];\n      } // Got it\n\n\n      return this.items[index + 1];\n    }\n  }, {\n    key: \"getPrev\",\n    value: function getPrev(item) {\n      var index = this.items.indexOf(item); // Not found\n\n      if (index < 0) {\n        return this.items[0];\n      } // Passed Begining of list\n\n\n      if (!this.items[index - 1]) {\n        return this.items[this.items.length - 1];\n      } // Got it\n\n\n      return this.items[index - 1];\n    }\n  }, {\n    key: \"getLast\",\n    value: function getLast() {\n      return this.items[this.items.length - 1];\n    }\n  }, {\n    key: \"getFirst\",\n    value: function getFirst() {\n      return this.items[0];\n    }\n  }, {\n    key: \"getActive\",\n    value: function getActive() {\n      return this.items.find(function (item) {\n        return item.getAttribute('tabindex') === '0';\n      });\n    }\n  }, {\n    key: \"removeItem\",\n    value: function removeItem(item) {\n      var removeIndex = this.items.indexOf(item);\n\n      if (removeIndex > -1) {\n        this.items.splice(removeIndex, 1);\n      }\n    }\n  }], [{\n    key: \"createListsFromDOM\",\n    value: function createListsFromDOM(_ref2) {\n      var selectorList = _ref2.selectorList,\n          selectorListItem = _ref2.selectorListItem;\n      var containerListEls = document.querySelectorAll(selectorList); // Array of NodeLists\n\n      var childListsEls = [];\n      containerListEls.forEach(function (containerListEl) {\n        childListsEls.push(containerListEl.querySelectorAll(selectorListItem));\n      });\n      return childListsEls;\n    }\n  }, {\n    key: \"buildLists\",\n    value: function buildLists(_ref3) {\n      var items = _ref3.items,\n          activateCb = _ref3.activateCb,\n          deactivateCb = _ref3.deactivateCb;\n      // Convert non-array to an array to make easier to work with\n      items = Array.from(items);\n      items = items.map(function (listItems) {\n        if (!listItems || listItems.length === undefined) {\n          throw new Error('Error: Lists addListItems received a non array like list of items in listItems');\n        }\n\n        listItems = Array.from(listItems);\n        return new List({\n          items: listItems,\n          activateCb: activateCb,\n          deactivateCb: deactivateCb\n        });\n      });\n      return items;\n    }\n  }]);\n\n  return List;\n}();\n\n//# sourceURL=webpack://KeynavWeb/./src/list.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/index.js");
/******/ })()
;
});