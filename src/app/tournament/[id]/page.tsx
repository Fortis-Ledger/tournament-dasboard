"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Gamepad2,
    Trophy,
    Users,
    Calendar,
    DollarSign,
    Clock,
    FileText,
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    Disc,
    MessageCircle,
    Youtube,
    X,
    ChevronRight,
    AlertCircle
} from "lucide-react";
import { Tournament } from "@/lib/types";
import { getTournamentById, incrementStat } from "@/lib/db";
import Link from "next/link";
import { FestiveEffects } from "@/components/FestiveEffects";

interface PageProps {
    params: { id: string };
}

export default function TournamentJoinPage({ params }: PageProps) {
    const id = params.id;
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'prizes'>('overview');
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [joinedPlatforms, setJoinedPlatforms] = useState<string[]>([]);
    const [confirmations, setConfirmations] = useState({
        discord: false,
        whatsapp: false,
        youtube: false,
    });
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const loadTournament = async () => {
            const data = await getTournamentById(id);
            setTournament(data);
            setIsLoading(false);

            if (data) {
                incrementStat(data.id, "visits");
            }
        };
        loadTournament();
    }, [id]);

    const socialPlatforms = !tournament ? [] : [
        {
            id: "discord",
            name: "Join Our Discord",
            icon: Disc,
            color: "from-[#5865F2] via-[#7289da] to-[#5865F2]",
            shadow: "shadow-indigo-500/40",
            url: tournament.links.discord,
            instruction: "Join our server and send 'Join Tournament' in #tournament-join",
        },
        {
            id: "whatsapp",
            name: "Join WhatsApp Group",
            icon: MessageCircle,
            color: "from-[#25D366] via-[#128C7E] to-[#25D366]",
            shadow: "shadow-emerald-500/40",
            url: tournament.links.whatsapp,
            instruction: "Join our group for real-time match updates",
        },
        {
            id: "youtube",
            name: "Join YouTube Channel",
            icon: Youtube,
            color: "from-[#FF0000] via-[#CC0000] to-[#FF0000]",
            shadow: "shadow-red-500/40",
            url: tournament.links.youtube,
            instruction: "Subscribe and hit the bell for live stream alerts",
        },
    ].filter(p => p.url);

    const handleJoinPlatform = (platformId: string, url: string) => {
        window.open(url, "_blank");
        if (!joinedPlatforms.includes(platformId)) {
            setJoinedPlatforms([...joinedPlatforms, platformId]);
        }
    };

    const handleContinueToForm = () => {
        if (!tournament?.links.googleForm) return;
        setIsRedirecting(true);
        incrementStat(tournament.id, "redirects");
        setTimeout(() => {
            window.location.href = tournament.links.googleForm;
        }, 2000);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-black">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h1 className="text-2xl font-bold mb-2">Not Found</h1>
                    <Link href="/" className="text-primary hover:underline">Back to Home</Link>
                </div>
            </div>
        );
    }

    const slotsLeft = tournament.max_slots - tournament.registered_count;
    const isRegistrationClosed = !tournament.is_open || new Date() > new Date(tournament.registration_end);

    return (
        <div className="min-h-screen bg-black text-white pb-32 relative overflow-hidden">
            <FestiveEffects />

            {/* 1. Header & Navigation */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-md border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <span className="font-bold text-sm tracking-widest uppercase text-white/50">Tournament Details</span>
                    <button className="p-2 -mr-2 opacity-0 cursor-default"><ArrowLeft className="w-6 h-6" /></button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto pt-16">
                {/* 2. Premium Hero Banner */}
                <div className="relative aspect-[21/9] md:aspect-[3/1] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                    <img
                        src={tournament.image_url || '/icon.svg'}
                        alt={tournament.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-primary/20 text-primary text-[10px] md:text-xs font-bold border border-primary/30 uppercase tracking-tighter">
                                {tournament.mode}
                            </span>
                            <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-white/10 text-white/80 text-[10px] md:text-xs font-bold border border-white/10 uppercase tracking-tighter">
                                {tournament.game_name}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black italic uppercase text-white leading-none tracking-tighter">
                            {tournament.name}
                        </h1>
                    </div>
                </div>

                {/* 3. Main Info Grid */}
                <div className="px-6 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <div className="glass-strong rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                            <Trophy className="w-6 h-6 text-yellow-500 mb-2" />
                            <span className="text-[10px] text-white/40 uppercase font-black">Prize Pool</span>
                            <span className="text-lg font-black italic">Rs. {tournament.total_prize_pool.toLocaleString()}</span>
                        </div>
                        <div className="glass-strong rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                            <DollarSign className="w-6 h-6 text-green-500 mb-2" />
                            <span className="text-[10px] text-white/40 uppercase font-black">Entry Fee</span>
                            <span className="text-lg font-black italic">Rs. {tournament.entry_fee}</span>
                        </div>
                        <div className="glass-strong rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                            <Users className="w-6 h-6 text-blue-500 mb-2" />
                            <span className="text-[10px] text-white/40 uppercase font-black">Slots Left</span>
                            <span className="text-lg font-black italic">{slotsLeft} Seats</span>
                        </div>
                        <div className="glass-strong rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                            <Calendar className="w-6 h-6 text-purple-500 mb-2" />
                            <span className="text-[10px] text-white/40 uppercase font-black">Starts On</span>
                            <span className="text-sm font-black italic">{formatDate(tournament.tournament_start)}</span>
                        </div>
                    </div>

                    {/* 4. Tabbed Interface */}
                    <div className="mb-6 flex border-b border-white/10 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'overview', label: 'Overview', icon: FileText },
                            { id: 'rules', label: 'Rules', icon: CheckCircle2 },
                            { id: 'prizes', label: 'Prizes', icon: Trophy },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all relative shrink-0 ${activeTab === tab.id ? 'text-primary' : 'text-white/40 hover:text-white'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary glow-primary"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="min-h-[300px]"
                        >
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-white/70 leading-relaxed text-lg italic font-medium">
                                            {tournament.description || "No description available for this tournament."}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                            <span className="text-[10px] text-white/30 uppercase font-black block mb-2">Registration Ends</span>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary" />
                                                <span className="font-bold">{formatDate(tournament.registration_end)}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                            <span className="text-[10px] text-white/30 uppercase font-black block mb-2">Match Format</span>
                                            <div className="flex items-center gap-2">
                                                <Gamepad2 className="w-4 h-4 text-primary" />
                                                <span className="font-bold capitalize">{tournament.mode} Match</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'rules' && (
                                <div className="space-y-4">
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-white/70 whitespace-pre-wrap leading-relaxed font-medium">
                                            {tournament.rules || "Standard tournament rules apply."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'prizes' && (
                                <div className="space-y-4">
                                    {tournament.prize_distribution.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {tournament.prize_distribution.map((p, idx) => (
                                                <div
                                                    key={p.position}
                                                    className={`flex items-center justify-between p-4 rounded-xl border ${p.position === 1 ? 'bg-yellow-500/10 border-yellow-500/20' :
                                                        p.position === 2 ? 'bg-gray-400/10 border-gray-400/20' :
                                                            p.position === 3 ? 'bg-orange-600/10 border-orange-600/20' :
                                                                'bg-white/5 border-white/10'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black italic ${p.position === 1 ? 'bg-yellow-500 text-black' :
                                                            p.position === 2 ? 'bg-gray-400 text-black' :
                                                                p.position === 3 ? 'bg-orange-600 text-white' :
                                                                    'bg-white/20 text-white'
                                                            }`}>
                                                            {p.position}{p.position === 1 ? 'st' : p.position === 2 ? 'nd' : p.position === 3 ? 'rd' : 'th'}
                                                        </div>
                                                        <span className="font-black tracking-tighter uppercase text-sm">Place Reward</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black italic text-yellow-500 pr-2">Rs. {p.amount.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-white/30">
                                            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>Prize details haven't been shared yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* 5. Floating Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-t border-white/10 p-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
                    <div className="hidden md:block">
                        <p className="text-xs text-white/40 uppercase font-bold tracking-tighter">Current Prize Pool</p>
                        <p className="text-2xl font-black italic text-primary pr-2">Rs. {tournament.total_prize_pool.toLocaleString()}</p>
                    </div>
                    <button
                        onClick={() => setShowJoinModal(true)}
                        disabled={isRegistrationClosed || slotsLeft <= 0}
                        className="flex-1 md:flex-none md:min-w-[300px] h-14 rounded-full bg-primary hover:bg-primary-hover disabled:bg-white/10 disabled:text-white/30 transition-all font-black italic uppercase tracking-widest text-lg glow-primary flex items-center justify-center gap-3 active:scale-95"
                    >
                        {isRegistrationClosed ? 'Locked' : slotsLeft <= 0 ? 'Full' : 'Join Now'}
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* 6. Join Flow Modal */}
            <AnimatePresence>
                {showJoinModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-strong rounded-3xl w-full max-w-md overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase italic">Registration</h2>
                                    <div className="flex gap-2 mt-2">
                                        {[0, 1, 2].map(s => (
                                            <div
                                                key={s}
                                                className={`h-2 w-10 rounded-full transition-all duration-500 ${currentStep >= s
                                                    ? 'bg-primary shadow-[0_0_10px_rgba(147,51,234,0.5)]'
                                                    : 'bg-white/10'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowJoinModal(false)}
                                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                {/* Step Content */}
                                <AnimatePresence mode="wait">
                                    {currentStep === 0 && (
                                        <motion.div
                                            key="step0"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6 py-4"
                                        >
                                            <div className="text-center">
                                                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 rotate-3">
                                                    <Gamepad2 className="w-10 h-10 text-primary -rotate-3" />
                                                </div>
                                                <h3 className="text-xl font-bold mb-2 uppercase tracking-tighter">Prerequisites</h3>
                                                <p className="text-white/60 leading-relaxed italic">
                                                    To ensure competitive integrity, participants must join our essential community platforms before registering.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setCurrentStep(1)}
                                                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary-hover transition-all font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                                Understood <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    )}

                                    {currentStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4 py-2"
                                        >
                                            <h3 className="text-lg font-bold uppercase tracking-tighter text-center">Join Platforms</h3>
                                            <div className="space-y-3">
                                                {socialPlatforms.map((p) => (
                                                    <div key={p.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-4 shadow-2xl">
                                                        <button
                                                            onClick={() => handleJoinPlatform(p.id, p.url)}
                                                            className={`relative group w-full h-16 rounded-2xl bg-gradient-to-r ${p.color} ${p.shadow} font-black uppercase italic tracking-wider flex items-center px-6 overflow-hidden active:scale-95 transition-all duration-300 shadow-lg hover:shadow-2xl`}
                                                        >
                                                            {/* Inner Glow/Gloss Effect */}
                                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                                                            <div className="flex items-center gap-4 relative z-10 w-full">
                                                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                                                                    <p.icon className="w-6 h-6 text-white" />
                                                                </div>
                                                                <span className="text-sm md:text-base">{p.name}</span>
                                                                <ExternalLink className="w-5 h-5 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </button>
                                                        {joinedPlatforms.includes(p.id) && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="px-2 pb-1"
                                                            >
                                                                <p className="text-[11px] text-white/40 mb-3 font-bold uppercase tracking-tighter leading-tight">{p.instruction}</p>
                                                                <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase italic tracking-widest bg-green-500/10 w-fit px-3 py-1 rounded-full border border-green-500/20">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    Step Verified
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                disabled={joinedPlatforms.length < socialPlatforms.length}
                                                onClick={() => setCurrentStep(2)}
                                                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary-hover disabled:bg-white/10 disabled:text-white/30 transition-all font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
                                            >
                                                Finish Steps <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    )}

                                    {currentStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6 pt-4"
                                        >
                                            <div className="space-y-4">
                                                {socialPlatforms.map(p => (
                                                    <label key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group">
                                                        <input
                                                            type="checkbox"
                                                            className="w-6 h-6 rounded-lg bg-black border-2 border-white/10 checked:bg-primary checked:border-primary transition-all cursor-pointer accent-primary"
                                                            checked={confirmations[p.id as keyof typeof confirmations]}
                                                            onChange={() => setConfirmations(prev => ({ ...prev, [p.id]: !prev[p.id as keyof typeof confirmations] }))}
                                                        />
                                                        <span className="text-sm font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                                                            I have joined <span className="text-white underline">{p.name}</span>
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>

                                            {isRedirecting ? (
                                                <div className="text-center py-6">
                                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                                    <p className="font-bold italic uppercase tracking-tighter">Opening Registration Form...</p>
                                                </div>
                                            ) : (
                                                <button
                                                    disabled={!Object.entries(confirmations).every(([k, v]) => !socialPlatforms.find(p => p.id === k) || v)}
                                                    onClick={handleContinueToForm}
                                                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary-hover disabled:bg-white/10 disabled:text-white/30 transition-all font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                                >
                                                    Finalize Registration <ChevronRight className="w-5 h-5" />
                                                </button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
