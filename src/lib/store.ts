export interface Tournament {
    id: string;
    name: string;
    isActive: boolean;
    isOpen: boolean;
    createdAt: string;
    links: {
        discord: string;
        whatsapp: string;
        youtube: string;
        googleForm: string;
    };
    stats: {
        visits: number;
        redirects: number;
    };
}

export interface AdminState {
    isAuthenticated: boolean;
    tournaments: Tournament[];
}

// Storage keys
export const STORAGE_KEYS = {
    ADMIN_AUTH: 'fa_admin_auth',
    TOURNAMENTS: 'fa_tournaments',
    ACTIVE_TOURNAMENT: 'fa_active_tournament',
};

// Default admin password - change this!
export const ADMIN_PASSWORD = 'fortis2024';

export function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

export function getTournaments(): Tournament[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
    return data ? JSON.parse(data) : [];
}

export function saveTournaments(tournaments: Tournament[]): void {
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
}

export function getActiveTournament(): Tournament | null {
    const tournaments = getTournaments();
    return tournaments.find(t => t.isActive) || null;
}

export function setActiveTournament(id: string): void {
    const tournaments = getTournaments();
    const updated = tournaments.map(t => ({
        ...t,
        isActive: t.id === id,
    }));
    saveTournaments(updated);
}

export function createTournament(name: string): Tournament {
    const tournament: Tournament = {
        id: generateId(),
        name,
        isActive: false,
        isOpen: true,
        createdAt: new Date().toISOString(),
        links: {
            discord: '',
            whatsapp: '',
            youtube: '',
            googleForm: '',
        },
        stats: {
            visits: 0,
            redirects: 0,
        },
    };

    const tournaments = getTournaments();
    // If first tournament, make it active
    if (tournaments.length === 0) {
        tournament.isActive = true;
    }
    tournaments.push(tournament);
    saveTournaments(tournaments);

    return tournament;
}

export function updateTournament(id: string, updates: Partial<Tournament>): void {
    const tournaments = getTournaments();
    const index = tournaments.findIndex(t => t.id === id);
    if (index !== -1) {
        tournaments[index] = { ...tournaments[index], ...updates };
        saveTournaments(tournaments);
    }
}

export function deleteTournament(id: string): void {
    let tournaments = getTournaments();
    const wasActive = tournaments.find(t => t.id === id)?.isActive;
    tournaments = tournaments.filter(t => t.id !== id);

    // If deleted was active and there are others, make first one active
    if (wasActive && tournaments.length > 0) {
        tournaments[0].isActive = true;
    }

    saveTournaments(tournaments);
}

export function incrementStat(tournamentId: string, stat: 'visits' | 'redirects'): void {
    const tournaments = getTournaments();
    const index = tournaments.findIndex(t => t.id === tournamentId);
    if (index !== -1) {
        tournaments[index].stats[stat]++;
        saveTournaments(tournaments);
    }
}

export function isAdminAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
}

export function setAdminAuthenticated(value: boolean): void {
    if (value) {
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    } else {
        sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
}
