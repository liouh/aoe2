/* @ts-self-types="./aoe2rec_js.d.ts" */

import * as wasm from "./aoe2rec_js_bg.wasm";
import { __wbg_set_wasm } from "./aoe2rec_js_bg.js";
__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    GameSettings, Player, Replay, SavegameHeader, SavegameSummary, Team, parse_rec, parse_rec_summary
} from "./aoe2rec_js_bg.js";
