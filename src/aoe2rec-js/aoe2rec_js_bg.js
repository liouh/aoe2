export class GameSettings {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(GameSettings.prototype);
        obj.__wbg_ptr = ptr;
        GameSettingsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GameSettingsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_gamesettings_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    get all_techs() {
        const ret = wasm.__wbg_get_gamesettings_all_techs(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    get allow_specs() {
        const ret = wasm.__wbg_get_gamesettings_allow_specs(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get battle_royale_time() {
        const ret = wasm.__wbg_get_gamesettings_battle_royale_time(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    get cheats() {
        const ret = wasm.__wbg_get_gamesettings_cheats(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get difficulty() {
        const ret = wasm.__wbg_get_gamesettings_difficulty(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get ending_age_id() {
        const ret = wasm.__wbg_get_gamesettings_ending_age_id(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    get fog_of_war() {
        const ret = wasm.__wbg_get_gamesettings_fog_of_war(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get game_type() {
        const ret = wasm.__wbg_get_gamesettings_game_type(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    get handicap() {
        const ret = wasm.__wbg_get_gamesettings_handicap(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    get hidden_civs() {
        const ret = wasm.__wbg_get_gamesettings_hidden_civs(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    get lobby_name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_gamesettings_lobby_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get lobby_visibility() {
        const ret = wasm.__wbg_get_gamesettings_lobby_visibility(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    get lock_speed() {
        const ret = wasm.__wbg_get_gamesettings_lock_speed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    get lock_teams() {
        const ret = wasm.__wbg_get_gamesettings_lock_teams(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get map_size() {
        const ret = wasm.__wbg_get_gamesettings_map_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    get matchmaking() {
        const ret = wasm.__wbg_get_gamesettings_matchmaking(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    get modded_dataset() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_gamesettings_modded_dataset(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {boolean}
     */
    get multiplayer() {
        const ret = wasm.__wbg_get_gamesettings_multiplayer(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get n_players() {
        const ret = wasm.__wbg_get_gamesettings_n_players(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get num_starting_units() {
        const ret = wasm.__wbg_get_gamesettings_num_starting_units(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get population_limit() {
        const ret = wasm.__wbg_get_gamesettings_population_limit(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    get random_positions() {
        const ret = wasm.__wbg_get_gamesettings_random_positions(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    get ranked() {
        const ret = wasm.__wbg_get_gamesettings_ranked(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    get record_game() {
        const ret = wasm.__wbg_get_gamesettings_record_game(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get resolved_map_id() {
        const ret = wasm.__wbg_get_gamesettings_resolved_map_id(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get reveal_map() {
        const ret = wasm.__wbg_get_gamesettings_reveal_map(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {string[]}
     */
    get rms_strings() {
        const ret = wasm.__wbg_get_gamesettings_rms_strings(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {boolean}
     */
    get scenario_civ() {
        const ret = wasm.__wbg_get_gamesettings_scenario_civ(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get selected_map_id() {
        const ret = wasm.__wbg_get_gamesettings_selected_map_id(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    get shared_exploration() {
        const ret = wasm.__wbg_get_gamesettings_shared_exploration(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get spec_delay() {
        const ret = wasm.__wbg_get_gamesettings_spec_delay(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get speed() {
        const ret = wasm.__wbg_get_gamesettings_speed(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get starting_age_id() {
        const ret = wasm.__wbg_get_gamesettings_starting_age_id(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get starting_resources_id() {
        const ret = wasm.__wbg_get_gamesettings_starting_resources_id(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get sub_game_mode() {
        const ret = wasm.__wbg_get_gamesettings_sub_game_mode(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    get team_bonus_disabled() {
        const ret = wasm.__wbg_get_gamesettings_team_bonus_disabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    get team_positions() {
        const ret = wasm.__wbg_get_gamesettings_team_positions(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    get trade_enabled() {
        const ret = wasm.__wbg_get_gamesettings_trade_enabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get treaty_length() {
        const ret = wasm.__wbg_get_gamesettings_treaty_length(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get victory_amount() {
        const ret = wasm.__wbg_get_gamesettings_victory_amount(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get victory_type_id() {
        const ret = wasm.__wbg_get_gamesettings_victory_type_id(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {boolean} arg0
     */
    set all_techs(arg0) {
        wasm.__wbg_set_gamesettings_all_techs(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set allow_specs(arg0) {
        wasm.__wbg_set_gamesettings_allow_specs(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set battle_royale_time(arg0) {
        wasm.__wbg_set_gamesettings_battle_royale_time(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set cheats(arg0) {
        wasm.__wbg_set_gamesettings_cheats(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set difficulty(arg0) {
        wasm.__wbg_set_gamesettings_difficulty(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set ending_age_id(arg0) {
        wasm.__wbg_set_gamesettings_ending_age_id(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set fog_of_war(arg0) {
        wasm.__wbg_set_gamesettings_fog_of_war(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set game_type(arg0) {
        wasm.__wbg_set_gamesettings_game_type(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set handicap(arg0) {
        wasm.__wbg_set_gamesettings_handicap(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set hidden_civs(arg0) {
        wasm.__wbg_set_gamesettings_hidden_civs(this.__wbg_ptr, arg0);
    }
    /**
     * @param {string} arg0
     */
    set lobby_name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_gamesettings_lobby_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} arg0
     */
    set lobby_visibility(arg0) {
        wasm.__wbg_set_gamesettings_lobby_visibility(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set lock_speed(arg0) {
        wasm.__wbg_set_gamesettings_lock_speed(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set lock_teams(arg0) {
        wasm.__wbg_set_gamesettings_lock_teams(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set map_size(arg0) {
        wasm.__wbg_set_gamesettings_map_size(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set matchmaking(arg0) {
        wasm.__wbg_set_gamesettings_matchmaking(this.__wbg_ptr, arg0);
    }
    /**
     * @param {string} arg0
     */
    set modded_dataset(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_gamesettings_modded_dataset(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {boolean} arg0
     */
    set multiplayer(arg0) {
        wasm.__wbg_set_gamesettings_multiplayer(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set n_players(arg0) {
        wasm.__wbg_set_gamesettings_n_players(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set num_starting_units(arg0) {
        wasm.__wbg_set_gamesettings_num_starting_units(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set population_limit(arg0) {
        wasm.__wbg_set_gamesettings_population_limit(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set random_positions(arg0) {
        wasm.__wbg_set_gamesettings_random_positions(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set ranked(arg0) {
        wasm.__wbg_set_gamesettings_ranked(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set record_game(arg0) {
        wasm.__wbg_set_gamesettings_record_game(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set resolved_map_id(arg0) {
        wasm.__wbg_set_gamesettings_resolved_map_id(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set reveal_map(arg0) {
        wasm.__wbg_set_gamesettings_reveal_map(this.__wbg_ptr, arg0);
    }
    /**
     * @param {string[]} arg0
     */
    set rms_strings(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_gamesettings_rms_strings(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {boolean} arg0
     */
    set scenario_civ(arg0) {
        wasm.__wbg_set_gamesettings_scenario_civ(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set selected_map_id(arg0) {
        wasm.__wbg_set_gamesettings_selected_map_id(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set shared_exploration(arg0) {
        wasm.__wbg_set_gamesettings_shared_exploration(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set spec_delay(arg0) {
        wasm.__wbg_set_gamesettings_spec_delay(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set speed(arg0) {
        wasm.__wbg_set_gamesettings_speed(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set starting_age_id(arg0) {
        wasm.__wbg_set_gamesettings_starting_age_id(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set starting_resources_id(arg0) {
        wasm.__wbg_set_gamesettings_starting_resources_id(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set sub_game_mode(arg0) {
        wasm.__wbg_set_gamesettings_sub_game_mode(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set team_bonus_disabled(arg0) {
        wasm.__wbg_set_gamesettings_team_bonus_disabled(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set team_positions(arg0) {
        wasm.__wbg_set_gamesettings_team_positions(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set trade_enabled(arg0) {
        wasm.__wbg_set_gamesettings_trade_enabled(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set treaty_length(arg0) {
        wasm.__wbg_set_gamesettings_treaty_length(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set victory_amount(arg0) {
        wasm.__wbg_set_gamesettings_victory_amount(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set victory_type_id(arg0) {
        wasm.__wbg_set_gamesettings_victory_type_id(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) GameSettings.prototype[Symbol.dispose] = GameSettings.prototype.free;

export class Player {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Player.prototype);
        obj.__wbg_ptr = ptr;
        PlayerFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof Player)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PlayerFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_player_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get civ_id() {
        const ret = wasm.__wbg_get_player_civ_id(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get color_id() {
        const ret = wasm.__wbg_get_player_color_id(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Uint32Array}
     */
    get custom_civ_ids() {
        const ret = wasm.__wbg_get_player_custom_civ_ids(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_player_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get player_number() {
        const ret = wasm.__wbg_get_player_player_number(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get player_type() {
        const ret = wasm.__wbg_get_player_player_type(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    get prefer_random() {
        const ret = wasm.__wbg_get_player_prefer_random(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get profile_id() {
        const ret = wasm.__wbg_get_gamesettings_difficulty(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get resigned() {
        const ret = wasm.__wbg_get_player_resigned(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get resolved_team_id() {
        const ret = wasm.__wbg_get_player_resolved_team_id(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get selected_color() {
        const ret = wasm.__wbg_get_player_selected_color(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get selected_team_id() {
        const ret = wasm.__wbg_get_player_selected_team_id(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set civ_id(arg0) {
        wasm.__wbg_set_player_civ_id(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set color_id(arg0) {
        wasm.__wbg_set_player_color_id(this.__wbg_ptr, arg0);
    }
    /**
     * @param {Uint32Array} arg0
     */
    set custom_civ_ids(arg0) {
        const ptr0 = passArray32ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_player_custom_civ_ids(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_player_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} arg0
     */
    set player_number(arg0) {
        wasm.__wbg_set_gamesettings_map_size(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set player_type(arg0) {
        wasm.__wbg_set_player_player_type(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set prefer_random(arg0) {
        wasm.__wbg_set_player_prefer_random(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set profile_id(arg0) {
        wasm.__wbg_set_gamesettings_difficulty(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set resigned(arg0) {
        wasm.__wbg_set_player_resigned(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set resolved_team_id(arg0) {
        wasm.__wbg_set_player_resolved_team_id(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set selected_color(arg0) {
        wasm.__wbg_set_player_selected_color(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set selected_team_id(arg0) {
        wasm.__wbg_set_player_selected_team_id(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) Player.prototype[Symbol.dispose] = Player.prototype.free;

export class Replay {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Replay.prototype);
        obj.__wbg_ptr = ptr;
        ReplayFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ReplayFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_replay_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    get cheats_enabled() {
        const ret = wasm.__wbg_get_replay_cheats_enabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get game_mode() {
        const ret = wasm.__wbg_get_replay_game_mode(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get game_speed_id() {
        const ret = wasm.__wbg_get_replay_game_speed_id(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get game_speed() {
        const ret = wasm.__wbg_get_replay_game_speed(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get instant_build() {
        const ret = wasm.__wbg_get_replay_instant_build(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get num_players() {
        const ret = wasm.__wbg_get_replay_num_players(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get old_time() {
        const ret = wasm.__wbg_get_replay_old_time(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get old_world_time() {
        const ret = wasm.__wbg_get_replay_old_world_time(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get random_seed_2() {
        const ret = wasm.__wbg_get_player_player_type(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get random_seed() {
        const ret = wasm.__wbg_get_player_civ_id(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get rec_player() {
        const ret = wasm.__wbg_get_replay_rec_player(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get temp_pause() {
        const ret = wasm.__wbg_get_replay_temp_pause(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get timer() {
        const ret = wasm.__wbg_get_replay_timer(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get world_time_delta_seconds() {
        const ret = wasm.__wbg_get_replay_world_time_delta_seconds(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get world_time() {
        const ret = wasm.__wbg_get_replay_world_time(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {boolean} arg0
     */
    set cheats_enabled(arg0) {
        wasm.__wbg_set_replay_cheats_enabled(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set game_mode(arg0) {
        wasm.__wbg_set_replay_game_mode(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set game_speed_id(arg0) {
        wasm.__wbg_set_replay_game_speed_id(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set game_speed(arg0) {
        wasm.__wbg_set_replay_game_speed(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set instant_build(arg0) {
        wasm.__wbg_set_replay_instant_build(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set num_players(arg0) {
        wasm.__wbg_set_replay_num_players(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set old_time(arg0) {
        wasm.__wbg_set_replay_old_time(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set old_world_time(arg0) {
        wasm.__wbg_set_replay_old_world_time(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set random_seed_2(arg0) {
        wasm.__wbg_set_player_player_type(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set random_seed(arg0) {
        wasm.__wbg_set_player_civ_id(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set rec_player(arg0) {
        wasm.__wbg_set_replay_rec_player(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set temp_pause(arg0) {
        wasm.__wbg_set_replay_temp_pause(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set timer(arg0) {
        wasm.__wbg_set_replay_timer(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set world_time_delta_seconds(arg0) {
        wasm.__wbg_set_replay_world_time_delta_seconds(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set world_time(arg0) {
        wasm.__wbg_set_replay_world_time(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) Replay.prototype[Symbol.dispose] = Replay.prototype.free;

export class SavegameHeader {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SavegameHeader.prototype);
        obj.__wbg_ptr = ptr;
        SavegameHeaderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SavegameHeaderFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_savegameheader_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get build() {
        const ret = wasm.__wbg_get_savegameheader_build(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {GameSettings}
     */
    get game_settings() {
        const ret = wasm.__wbg_get_savegameheader_game_settings(this.__wbg_ptr);
        return GameSettings.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    get game_string() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_savegameheader_game_string(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {Replay}
     */
    get replay() {
        const ret = wasm.__wbg_get_savegameheader_replay(this.__wbg_ptr);
        return Replay.__wrap(ret);
    }
    /**
     * @returns {number}
     */
    get timestamp() {
        const ret = wasm.__wbg_get_savegameheader_timestamp(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get version_major() {
        const ret = wasm.__wbg_get_savegameheader_version_major(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get version_minor() {
        const ret = wasm.__wbg_get_savegameheader_version_minor(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set build(arg0) {
        wasm.__wbg_set_savegameheader_build(this.__wbg_ptr, arg0);
    }
    /**
     * @param {GameSettings} arg0
     */
    set game_settings(arg0) {
        _assertClass(arg0, GameSettings);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_savegameheader_game_settings(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {string} arg0
     */
    set game_string(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_player_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Replay} arg0
     */
    set replay(arg0) {
        _assertClass(arg0, Replay);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_savegameheader_replay(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {number} arg0
     */
    set timestamp(arg0) {
        wasm.__wbg_set_savegameheader_timestamp(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set version_major(arg0) {
        wasm.__wbg_set_savegameheader_version_major(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set version_minor(arg0) {
        wasm.__wbg_set_savegameheader_version_minor(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) SavegameHeader.prototype[Symbol.dispose] = SavegameHeader.prototype.free;

export class SavegameSummary {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SavegameSummary.prototype);
        obj.__wbg_ptr = ptr;
        SavegameSummaryFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SavegameSummaryFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_savegamesummary_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get duration() {
        const ret = wasm.__wbg_get_savegamesummary_duration(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {SavegameHeader}
     */
    get header() {
        const ret = wasm.__wbg_get_savegamesummary_header(this.__wbg_ptr);
        return SavegameHeader.__wrap(ret);
    }
    /**
     * @returns {Team[]}
     */
    get teams() {
        const ret = wasm.__wbg_get_savegamesummary_teams(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {number} arg0
     */
    set duration(arg0) {
        wasm.__wbg_set_savegamesummary_duration(this.__wbg_ptr, arg0);
    }
    /**
     * @param {SavegameHeader} arg0
     */
    set header(arg0) {
        _assertClass(arg0, SavegameHeader);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_savegamesummary_header(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {Team[]} arg0
     */
    set teams(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_savegamesummary_teams(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) SavegameSummary.prototype[Symbol.dispose] = SavegameSummary.prototype.free;

export class Team {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Team.prototype);
        obj.__wbg_ptr = ptr;
        TeamFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof Team)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TeamFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_team_free(ptr, 0);
    }
    /**
     * @returns {Player[]}
     */
    get players() {
        const ret = wasm.__wbg_get_team_players(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {boolean}
     */
    get winner() {
        const ret = wasm.__wbg_get_team_winner(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {Player[]} arg0
     */
    set players(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_team_players(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {boolean} arg0
     */
    set winner(arg0) {
        wasm.__wbg_set_team_winner(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) Team.prototype[Symbol.dispose] = Team.prototype.free;

/**
 * @param {ArrayBuffer} buffer
 * @returns {any}
 */
export function parse_rec(buffer) {
    const ret = wasm.parse_rec(buffer);
    return ret;
}

/**
 * @param {ArrayBuffer} buffer
 * @returns {SavegameSummary}
 */
export function parse_rec_summary(buffer) {
    const ret = wasm.parse_rec_summary(buffer);
    return SavegameSummary.__wrap(ret);
}
export function __wbg_Error_8c4e43fe74559d73(arg0, arg1) {
    const ret = Error(getStringFromWasm0(arg0, arg1));
    return ret;
}
export function __wbg_Number_04624de7d0e8332d(arg0) {
    const ret = Number(arg0);
    return ret;
}
export function __wbg___wbindgen_debug_string_0bc8482c6e3508ae(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_is_string_cd444516edc5b180(arg0) {
    const ret = typeof(arg0) === 'string';
    return ret;
}
export function __wbg___wbindgen_string_get_72fb696202c56729(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_throw_be289d5034ed271b(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
}
export function __wbg_error_7534b8e9a36f1ab4(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
}
export function __wbg_length_32ed9a279acd054c(arg0) {
    const ret = arg0.length;
    return ret;
}
export function __wbg_new_361308b2356cecd0() {
    const ret = new Object();
    return ret;
}
export function __wbg_new_3eb36ae241fe6f44() {
    const ret = new Array();
    return ret;
}
export function __wbg_new_8a6f238a6ece86ea() {
    const ret = new Error();
    return ret;
}
export function __wbg_new_dca287b076112a51() {
    const ret = new Map();
    return ret;
}
export function __wbg_new_dd2b680c8bf6ae29(arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
}
export function __wbg_player_new(arg0) {
    const ret = Player.__wrap(arg0);
    return ret;
}
export function __wbg_player_unwrap(arg0) {
    const ret = Player.__unwrap(arg0);
    return ret;
}
export function __wbg_prototypesetcall_bdcdcc5842e4d77d(arg0, arg1, arg2) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
}
export function __wbg_set_1eb0999cf5d27fc8(arg0, arg1, arg2) {
    const ret = arg0.set(arg1, arg2);
    return ret;
}
export function __wbg_set_3f1d0b984ed272ed(arg0, arg1, arg2) {
    arg0[arg1] = arg2;
}
export function __wbg_set_f43e577aea94465b(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
}
export function __wbg_stack_0ed75d68575b0f3c(arg0, arg1) {
    const ret = arg1.stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg_team_new(arg0) {
    const ret = Team.__wrap(arg0);
    return ret;
}
export function __wbg_team_unwrap(arg0) {
    const ret = Team.__unwrap(arg0);
    return ret;
}
export function __wbindgen_cast_0000000000000001(arg0) {
    // Cast intrinsic for `F64 -> Externref`.
    const ret = arg0;
    return ret;
}
export function __wbindgen_cast_0000000000000002(arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
}
export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
}
const GameSettingsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_gamesettings_free(ptr >>> 0, 1));
const PlayerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_player_free(ptr >>> 0, 1));
const ReplayFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_replay_free(ptr >>> 0, 1));
const SavegameHeaderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_savegameheader_free(ptr >>> 0, 1));
const SavegameSummaryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_savegamesummary_free(ptr >>> 0, 1));
const TeamFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_team_free(ptr >>> 0, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;


let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}
