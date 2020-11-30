import Hotkeys from './hotkeys.js';
import Keynav from './keynav.js';

// NOTE: Webpack will expose as KeynavWeb.KeynavWeb
// export const KeynavWeb = {
//     hotkeys: Hotkeys,
//     keynav: Keynav
// };

// TODO: Webpack looses reference
// export default KeynavWeb;

export {
    Hotkeys as hotkeys,
    Keynav as keynav
};