import Hotkeys from './hotkeys.js';
import Keynav from './keynav.js';

// FAIL: Exports an empty module 
// export default {
//     hotkeys: Hotkeys,
//     keynav: Keynav
// };

// FAIL:  Webpack looses reference -or-
// Webpack will expose as KeynavWeb.KeynavWeb
const KeynavWeb = {
    hotkeys: Hotkeys,
    keynav: Keynav
};
export default KeynavWeb;

// Library style: Individual imports 
// e.g. import {keynav} from '...
// export {
//     Hotkeys as hotkeys,
//     Keynav as keynav
// };
