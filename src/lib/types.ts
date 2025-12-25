export interface PrizePosition {
    position: number;
    amount: number;
}

export interface TournamentLinks {
    discord: string;
    whatsapp: string;
    youtube: string;
    googleForm: string;
}

export interface TournamentStats {
    visits: number;
    redirects: number;
}

export interface Tournament {
    id: string;
    name: string;
    game_name: string;
    mode: 'solo' | 'duo' | 'squad';
    image_url: string;
    description: string;
    rules: string;
    total_prize_pool: number;
    prize_distribution: PrizePosition[];
    entry_fee: number;
    max_slots: number;
    registered_count: number;
    registration_end: string;
    tournament_start: string;
    links: TournamentLinks;
    is_active: boolean;
    is_open: boolean;
    stats: TournamentStats;
    created_at: string;
}

export interface CreateTournamentInput {
    name: string;
    game_name: string;
    mode: 'solo' | 'duo' | 'squad';
    image_url: string;
    description: string;
    rules: string;
    total_prize_pool: number;
    prize_distribution: PrizePosition[];
    entry_fee: number;
    max_slots: number;
    registration_end: string;
    tournament_start: string;
    links: TournamentLinks;
}

export const GAME_MODES = [
    { value: 'solo', label: 'Solo' },
    { value: 'duo', label: 'Duo' },
    { value: 'squad', label: 'Squad' },
] as const;

export const DEFAULT_LINKS: TournamentLinks = {
    discord: '',
    whatsapp: '',
    youtube: '',
    googleForm: '',
};
