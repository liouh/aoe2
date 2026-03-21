/* tslint:disable */
/* eslint-disable */

export class GameSettings {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    all_techs: boolean;
    allow_specs: boolean;
    battle_royale_time: number;
    cheats: boolean;
    difficulty: number;
    ending_age_id: number;
    fog_of_war: boolean;
    game_type: number;
    handicap: boolean;
    hidden_civs: boolean;
    lobby_name: string;
    lobby_visibility: number;
    lock_speed: boolean;
    lock_teams: boolean;
    map_size: number;
    matchmaking: boolean;
    modded_dataset: string;
    multiplayer: boolean;
    n_players: number;
    num_starting_units: number;
    population_limit: number;
    random_positions: boolean;
    ranked: boolean;
    record_game: boolean;
    resolved_map_id: number;
    reveal_map: number;
    rms_strings: string[];
    scenario_civ: boolean;
    selected_map_id: number;
    shared_exploration: boolean;
    spec_delay: number;
    speed: number;
    starting_age_id: number;
    starting_resources_id: number;
    sub_game_mode: number;
    team_bonus_disabled: boolean;
    team_positions: boolean;
    trade_enabled: boolean;
    treaty_length: number;
    victory_amount: number;
    victory_type_id: number;
}

export class Player {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    civ_id: number;
    color_id: number;
    custom_civ_ids: Uint32Array;
    name: string;
    player_number: number;
    player_type: number;
    prefer_random: boolean;
    profile_id: number;
    resigned: boolean;
    resolved_team_id: number;
    selected_color: number;
    selected_team_id: number;
}

export class Replay {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    cheats_enabled: boolean;
    game_mode: number;
    game_speed_id: number;
    game_speed: number;
    instant_build: boolean;
    num_players: number;
    old_time: number;
    old_world_time: number;
    random_seed_2: number;
    random_seed: number;
    rec_player: number;
    temp_pause: boolean;
    timer: number;
    world_time_delta_seconds: number;
    world_time: number;
}

export class SavegameHeader {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    build: number;
    game_settings: GameSettings;
    game_string: string;
    replay: Replay;
    timestamp: number;
    version_major: number;
    version_minor: number;
}

export class SavegameSummary {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    duration: number;
    header: SavegameHeader;
    teams: Team[];
}

export class Team {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    players: Player[];
    winner: boolean;
}

export function parse_rec(buffer: ArrayBuffer): any;

export function parse_rec_summary(buffer: ArrayBuffer): SavegameSummary;
