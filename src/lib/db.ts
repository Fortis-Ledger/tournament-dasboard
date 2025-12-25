import { supabase } from './supabase';
import { Tournament, CreateTournamentInput, TournamentStats } from './types';

// Generate UUID
function generateId(): string {
    return crypto.randomUUID();
}

// ============ Tournament CRUD ============

export async function getTournaments(): Promise<Tournament[]> {
    const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tournaments:', error);
        return [];
    }

    return data || [];
}

export async function getTournamentById(id: string): Promise<Tournament | null> {
    const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching tournament:', error);
        return null;
    }

    return data;
}

export async function getOpenTournaments(): Promise<Tournament[]> {
    const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('is_open', true)
        .order('tournament_start', { ascending: true });

    if (error) {
        console.error('Error fetching open tournaments:', error);
        return [];
    }

    return data || [];
}

export async function createTournament(input: CreateTournamentInput): Promise<Tournament | null> {
    const tournament: Omit<Tournament, 'id' | 'created_at'> = {
        ...input,
        registered_count: 0,
        is_active: false,
        is_open: true,
        stats: { visits: 0, redirects: 0 },
    };

    const { data, error } = await supabase
        .from('tournaments')
        .insert([tournament])
        .select()
        .single();

    if (error) {
        console.error('Error creating tournament:', error);
        return null;
    }

    return data;
}

export async function updateTournament(id: string, updates: Partial<Tournament>): Promise<boolean> {
    const { error } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating tournament:', error);
        return false;
    }

    return true;
}

export async function deleteTournament(id: string): Promise<boolean> {
    // Get tournament first to delete image
    const tournament = await getTournamentById(id);

    // Delete image from storage if exists
    if (tournament?.image_url) {
        const imagePath = tournament.image_url.split('/tournament-images/')[1];
        if (imagePath) {
            await supabase.storage.from('tournament-images').remove([imagePath]);
        }
    }

    const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting tournament:', error);
        return false;
    }

    return true;
}

// Upload image to Supabase Storage
export async function uploadTournamentImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('tournament-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Error uploading image:', error);
        return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('tournament-images')
        .getPublicUrl(data.path);

    return publicUrl;
}

export async function setActiveTournament(id: string): Promise<boolean> {
    // First, deactivate all tournaments
    await supabase
        .from('tournaments')
        .update({ is_active: false })
        .neq('id', '');

    // Then activate the selected one
    const { error } = await supabase
        .from('tournaments')
        .update({ is_active: true })
        .eq('id', id);

    if (error) {
        console.error('Error setting active tournament:', error);
        return false;
    }

    return true;
}

export async function incrementStat(tournamentId: string, stat: 'visits' | 'redirects'): Promise<void> {
    // Get current stats
    const tournament = await getTournamentById(tournamentId);
    if (!tournament) return;

    const newStats: TournamentStats = {
        ...tournament.stats,
        [stat]: (tournament.stats[stat] || 0) + 1,
    };

    await supabase
        .from('tournaments')
        .update({ stats: newStats })
        .eq('id', tournamentId);
}

// ============ Admin Auth ============

export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'fortis2024';

export function isAdminAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('fa_admin_auth') === 'true';
}

export function setAdminAuthenticated(value: boolean): void {
    if (value) {
        sessionStorage.setItem('fa_admin_auth', 'true');
    } else {
        sessionStorage.removeItem('fa_admin_auth');
    }
}
