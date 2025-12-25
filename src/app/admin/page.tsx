"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    ToggleLeft,
    ToggleRight,
    Gamepad2,
    RefreshCw,
    Plus,
    Trash2,
    LogOut,
    Edit3,
    Eye,
    Trophy,
    X,
    Calendar,
    DollarSign,
    Image as ImageIcon,
    FileText,
    Settings,
    Upload,
    Loader2,
    Lock,
    Link,
    MousePointerClick
} from "lucide-react";
import { Tournament, CreateTournamentInput, GAME_MODES, DEFAULT_LINKS, PrizePosition } from "@/lib/types";
import {
    getTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    setActiveTournament,
    isAdminAuthenticated,
    setAdminAuthenticated,
    ADMIN_PASSWORD,
    uploadTournamentImage,
} from "@/lib/db";
import { PrizeDistributionModal } from "@/components/PrizeDistributionModal";
import Image from "next/image";

// Login Component
function AdminLogin({ onLogin }: { onLogin: () => void }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setAdminAuthenticated(true);
            onLogin();
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-strong rounded-3xl p-8 max-w-sm w-full"
            >
                <div className="flex items-center justify-center gap-3 mb-6">
                    <Lock className="w-8 h-8 text-primary" />
                    <h1 className="text-xl font-bold">Admin Access</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter admin password"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-colors mb-4"
                    />
                    {error && <p className="text-red-400 text-sm mb-4">Incorrect password</p>}
                    <button type="submit" className="btn-primary w-full">Login</button>
                </form>
            </motion.div>
        </div>
    );
}

// Tournament Form Modal
function TournamentFormModal({
    tournament,
    onSave,
    onClose,
}: {
    tournament?: Tournament | null;
    onSave: (data: CreateTournamentInput) => void;
    onClose: () => void;
}) {
    const isEditing = !!tournament;

    const [formData, setFormData] = useState<CreateTournamentInput>({
        name: tournament?.name || '',
        game_name: tournament?.game_name || '',
        mode: tournament?.mode || 'solo',
        image_url: tournament?.image_url || '',
        description: tournament?.description || '',
        rules: tournament?.rules || '',
        total_prize_pool: tournament?.total_prize_pool || 0,
        prize_distribution: tournament?.prize_distribution || [],
        entry_fee: tournament?.entry_fee || 0,
        max_slots: tournament?.max_slots || 100,
        registration_end: tournament?.registration_end ? tournament.registration_end.slice(0, 16) : '',
        tournament_start: tournament?.tournament_start ? tournament.tournament_start.slice(0, 16) : '',
        links: tournament?.links || { ...DEFAULT_LINKS },
    });

    const [showPrizeModal, setShowPrizeModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'prizes' | 'links'>('basic');
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadTournamentImage(file);
            if (url) {
                handleChange('image_url', url);
            } else {
                alert('Failed to upload image. Please try again.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image.');
        }
        setIsUploading(false);
    };

    const handleChange = (field: keyof CreateTournamentInput, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLinksChange = (field: keyof typeof formData.links, value: string) => {
        setFormData(prev => ({
            ...prev,
            links: { ...prev.links, [field]: value },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            registration_end: new Date(formData.registration_end).toISOString(),
            tournament_start: new Date(formData.tournament_start).toISOString(),
        });
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: Gamepad2 },
        { id: 'prizes', label: 'Prizes & Fees', icon: Trophy },
        { id: 'links', label: 'Links', icon: Link },
    ] as const;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="glass-strong rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold">
                        {isEditing ? 'Edit Tournament' : 'Create Tournament'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-white/50 hover:text-white/70'
                                } `}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'basic' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Tournament Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                                        placeholder="e.g. Winter Championship"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Game Name *</label>
                                    <input
                                        type="text"
                                        value={formData.game_name}
                                        onChange={(e) => handleChange('game_name', e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                                        placeholder="e.g. BGMI, Free Fire"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Tournament Mode *</label>
                                    <select
                                        value={formData.mode}
                                        onChange={(e) => handleChange('mode', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                                    >
                                        {GAME_MODES.map((mode) => (
                                            <option key={mode.value} value={mode.value} className="bg-gray-900">
                                                {mode.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Max Slots *</label>
                                    <input
                                        type="number"
                                        value={formData.max_slots}
                                        onChange={(e) => handleChange('max_slots', parseInt(e.target.value) || 0)}
                                        required
                                        min={1}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-white/60 mb-2">Tournament Image</label>
                                <div className="space-y-3">
                                    {/* Upload Button */}
                                    <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-dashed border-white/20 hover:border-primary/50 cursor-pointer transition-colors">
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span className="text-sm">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5" />
                                                <span className="text-sm">Click to upload image</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={isUploading}
                                        />
                                    </label>

                                    {/* Preview */}
                                    {formData.image_url && (
                                        <div className="relative h-32 w-full">
                                            <Image
                                                src={formData.image_url}
                                                alt="Preview"
                                                fill
                                                className="rounded-xl object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleChange('image_url', '')}
                                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-red-500/50 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-white/60 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none resize-none"
                                    placeholder="Describe your tournament..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-white/60 mb-2">Rules</label>
                                <textarea
                                    value={formData.rules}
                                    onChange={(e) => handleChange('rules', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none resize-none"
                                    placeholder="Enter tournament rules..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Registration Ends *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.registration_end}
                                        onChange={(e) => handleChange('registration_end', e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Tournament Starts *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.tournament_start}
                                        onChange={(e) => handleChange('tournament_start', e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'prizes' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Entry Fee (Rs.) *</label>
                                    <input
                                        type="number"
                                        value={formData.entry_fee}
                                        onChange={(e) => handleChange('entry_fee', parseInt(e.target.value) || 0)}
                                        required
                                        min={0}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Total Prize Pool (Rs.) *</label>
                                    <input
                                        type="number"
                                        value={formData.total_prize_pool}
                                        onChange={(e) => handleChange('total_prize_pool', parseInt(e.target.value) || 0)}
                                        required
                                        min={0}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="glass rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold">Prize Distribution</h3>
                                        <p className="text-sm text-white/50">
                                            {formData.prize_distribution.length > 0
                                                ? `${formData.prize_distribution.length} positions configured`
                                                : 'No distribution set'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPrizeModal(true)}
                                        disabled={formData.total_prize_pool <= 0}
                                        className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {formData.prize_distribution.length > 0 ? 'Edit Distribution' : 'Set Distribution'}
                                    </button>
                                </div>

                                {formData.prize_distribution.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.prize_distribution.slice(0, 5).map((p) => (
                                            <div key={p.position} className="flex justify-between text-sm">
                                                <span className="text-white/60">{p.position}{['st', 'nd', 'rd'][p.position - 1] || 'th'} Place</span>
                                                <span className="font-medium">Rs. {p.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {formData.prize_distribution.length > 5 && (
                                            <p className="text-xs text-white/40">+{formData.prize_distribution.length - 5} more positions...</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'links' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Google Form URL *</label>
                                <input
                                    type="url"
                                    value={formData.links.googleForm}
                                    onChange={(e) => handleLinksChange('googleForm', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                                    placeholder="https://forms.google.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Discord Invite URL</label>
                                <input
                                    type="url"
                                    value={formData.links.discord}
                                    onChange={(e) => handleLinksChange('discord', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                                    placeholder="https://discord.gg/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-2">WhatsApp Group URL</label>
                                <input
                                    type="url"
                                    value={formData.links.whatsapp}
                                    onChange={(e) => handleLinksChange('whatsapp', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                                    placeholder="https://chat.whatsapp.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-2">YouTube Channel URL</label>
                                <input
                                    type="url"
                                    value={formData.links.youtube}
                                    onChange={(e) => handleLinksChange('youtube', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                                    placeholder="https://youtube.com/@..."
                                />
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="flex-1 btn-primary"
                    >
                        {isEditing ? 'Save Changes' : 'Create Tournament'}
                    </button>
                </div>
            </motion.div>

            {/* Prize Distribution Modal-Outside the clipped container */}
            <PrizeDistributionModal
                isOpen={showPrizeModal}
                onClose={() => setShowPrizeModal(false)}
                onSave={(distribution) => handleChange('prize_distribution', distribution)}
                totalPrizePool={formData.total_prize_pool}
                initialDistribution={formData.prize_distribution}
            />
        </motion.div>
    );
}

// Tournament Row
function TournamentRow({
    tournament,
    onEdit,
    onDelete,
    onSetActive,
    onToggleOpen,
}: {
    tournament: Tournament;
    onEdit: () => void;
    onDelete: () => void;
    onSetActive: () => void;
    onToggleOpen: () => void;
}) {
    const conversionRate = tournament.stats.visits > 0
        ? Math.round((tournament.stats.redirects / tournament.stats.visits) * 100)
        : 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`glass rounded-xl p-4 ${tournament.is_active ? "ring-2 ring-primary" : ""} `}
        >
            <div className="flex items-center gap-4">
                {/* Image */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    {tournament.image_url ? (
                        <Image src={tournament.image_url} alt={tournament.name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                            <Gamepad2 className="w-6 h-6 text-primary" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{tournament.name}</h3>
                        {tournament.is_active && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary shrink-0">Active</span>
                        )}
                    </div>
                    <p className="text-sm text-white/50 mb-1">{tournament.game_name} â€¢ {tournament.mode.toUpperCase()}</p>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                        <span>Rs. {tournament.total_prize_pool.toLocaleString()} Pool</span>
                        <span>{tournament.registered_count}/{tournament.max_slots} Slots</span>
                        <span>{tournament.stats.visits} Visits</span>
                        <span>{conversionRate}% Rate</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {!tournament.is_active && (
                        <button
                            onClick={onSetActive}
                            className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                            title="Set as Active"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onToggleOpen}
                        className={`p-2 rounded-lg transition-colors ${tournament.is_open
                            ? "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                            : "bg-white/5 hover:bg-white/10 text-white/50"
                            } `}
                        title={tournament.is_open ? "Open" : "Closed"}
                    >
                        {tournament.is_open ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Edit"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Main Admin Dashboard
export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tournaments, setTournamentsState] = useState<Tournament[]>([]);
    const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        const data = await getTournaments();
        setTournamentsState(data);
    };

    useEffect(() => {
        setIsAuthenticated(isAdminAuthenticated());
        loadData().then(() => setIsLoading(false));
    }, []);

    const handleCreateTournament = async (data: CreateTournamentInput) => {
        await createTournament(data);
        setShowCreateModal(false);
        loadData();
    };

    const handleUpdateTournament = async (data: CreateTournamentInput) => {
        if (editingTournament) {
            await updateTournament(editingTournament.id, data);
            setEditingTournament(null);
            loadData();
        }
    };

    const handleDeleteTournament = async (id: string) => {
        if (confirm("Are you sure you want to delete this tournament?")) {
            await deleteTournament(id);
            loadData();
        }
    };

    const handleSetActive = async (id: string) => {
        await setActiveTournament(id);
        loadData();
    };

    const handleToggleOpen = async (tournament: Tournament) => {
        await updateTournament(tournament.id, { is_open: !tournament.is_open });
        loadData();
    };

    const handleLogout = () => {
        setAdminAuthenticated(false);
        setIsAuthenticated(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
    }

    // Calculate totals
    const totalStats = tournaments.reduce(
        (acc, t) => ({
            visits: acc.visits + (t.stats?.visits || 0),
            redirects: acc.redirects + (t.stats?.redirects || 0),
        }),
        { visits: 0, redirects: 0 }
    );

    return (
        <div className="min-h-screen p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-3">
                        <Image src="/icon.svg" alt="FortisArena" width={32} height={32} className="w-8 h-8" priority />
                        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadData}
                            className="p-2 rounded-xl glass hover:bg-white/10 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-colors text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <Gamepad2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{tournaments.length}</p>
                                <p className="text-white/50 text-xs">Tournaments</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-strong rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <MousePointerClick className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalStats.visits}</p>
                                <p className="text-white/50 text-xs">Total Visits</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-strong rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalStats.redirects}</p>
                                <p className="text-white/50 text-xs">Redirects</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-strong rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    Rs. {tournaments.reduce((sum, t) => sum + t.total_prize_pool, 0).toLocaleString()}
                                </p>
                                <p className="text-white/50 text-xs">Total Prizes</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Tournaments Section */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Tournaments</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Create Tournament
                    </button>
                </div>

                {tournaments.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-strong rounded-2xl p-12 text-center">
                        <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-white/20" />
                        <p className="text-white/50 mb-4">No tournaments yet</p>
                        <button onClick={() => setShowCreateModal(true)} className="btn-primary inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Create Your First Tournament
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {tournaments.map((tournament) => (
                                <TournamentRow
                                    key={tournament.id}
                                    tournament={tournament}
                                    onEdit={() => setEditingTournament(tournament)}
                                    onDelete={() => handleDeleteTournament(tournament.id)}
                                    onSetActive={() => handleSetActive(tournament.id)}
                                    onToggleOpen={() => handleToggleOpen(tournament)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <p className="text-center text-white/30 text-xs mt-8">FortisArena Admin â€¢ Password protected</p>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <TournamentFormModal
                        onSave={handleCreateTournament}
                        onClose={() => setShowCreateModal(false)}
                    />
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingTournament && (
                    <TournamentFormModal
                        tournament={editingTournament}
                        onSave={handleUpdateTournament}
                        onClose={() => setEditingTournament(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
