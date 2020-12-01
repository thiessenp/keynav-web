import Hotkeys from './hotkeys.js';
import Keynav from './keynav.js';

// FAIL:  Webpack looses reference -or-
// Webpack will expose as KeynavWeb.KeynavWeb
// const KeynavWeb = {
//     hotkeys: Hotkeys,
//     keynav: Keynav
// };
// export default KeynavWeb;

// FAIL: Exports an empty module 
// export default {
//     hotkeys: Hotkeys,
//     keynav: Keynav
// };

// Looks like individual imports are the only way 
// e.g. import {keynav} from '...
export {
    Hotkeys as hotkeys,
    Keynav as keynav
};
