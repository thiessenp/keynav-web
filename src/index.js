import Hotkeys from './hotkeys.js';
import Keynav from './keynav.js';

// FAIL: Webpack Exports an empty module 
// export default {
//     hotkeys: Hotkeys,
//     keynav: Keynav
// };


/**
Can use either Library style individual exports:
    export {
        Hotkeys as hotkeys,
        Keynav as keynav
    };
    ...
    import {keynav} from '...

Or default Object style exports:
    const KeynavWeb = {
        hotkeys: Hotkeys,
        keynav: Keynav
    };
    export default KeynavWeb;

Webpack will expose both in the "main" Object name.
 */
const KeynavWeb = {
    hotkeys: Hotkeys,
    keynav: Keynav
};
export default KeynavWeb;
