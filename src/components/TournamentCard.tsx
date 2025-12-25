"use client";

import { motion } from "framer-motion";
import { Calendar, Users, Trophy, Clock, DollarSign, Gamepad2 } from "lucide-react";
import { Tournament } from "@/lib/types";
import Link from "next/link";

interface TournamentCardProps {
    tournament: Tournament;
    index?: number;
}

export function TournamentCard({ tournament, index = 0 }: TournamentCardProps) {
    const registrationEnded = new Date(tournament.registration_end) < new Date();
    const slotsLeft = tournament.max_slots - tournament.registered_count;
    const isFull = slotsLeft <= 0;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getModeColor = (mode: string) => {
        switch (mode) {
            case 'solo': return 'from-blue-500 to-cyan-500';
            case 'duo': return 'from-purple-500 to-pink-500';
            case 'squad': return 'from-orange-500 to-red-500';
            default: return 'from-primary to-accent';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="glass-strong rounded-3xl overflow-hidden group border border-yellow-500/20 hover:border-yellow-500/50 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:shadow-[0_0_25px_rgba(234,179,8,0.2)]"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                {tournament.image_url ? (
                    <img
                        src={tournament.image_url}
                        alt={tournament.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                        <Gamepad2 className="w-16 h-16 text-white/20" />
                    </div>
                )}

                {/* Festive Banner */}
                <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-yellow-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-bl-xl shadow-lg z-10">
                    <span className="text-[8px] sm:text-[10px] font-black uppercase italic text-black tracking-tighter">New Year Special</span>
                </div>

                {/* Mode Badge */}
                <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-gradient-to-r ${getModeColor(tournament.mode)} text-white shadow-lg`}>
                    {tournament.mode.toUpperCase()}
                </div>

                {/* Status Badge */}
                {(registrationEnded || isFull || !tournament.is_open) && (
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/90 text-white shadow-lg">
                        {!tournament.is_open ? 'Closed' : isFull ? 'Full' : 'Ended'}
                    </div>
                )}

                {/* Prize Pool Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-2 text-yellow-500">
                        <Trophy className="w-5 h-5 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                        <span className="font-bold text-lg italic pr-2">Rs. {tournament.total_prize_pool.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{tournament.name}</h3>
                <p className="text-white/50 text-sm mb-4">{tournament.game_name}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span>Rs. {tournament.entry_fee} Entry</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>{slotsLeft}/{tournament.max_slots} Slots</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span>{formatDate(tournament.registration_end)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span>{formatDate(tournament.tournament_start)}</span>
                    </div>
                </div>

                {/* Join Button */}
                <Link href={`/tournament/${tournament.id}`}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={registrationEnded || isFull || !tournament.is_open}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {!tournament.is_open ? 'Registration Closed' : isFull ? 'Tournament Full' : registrationEnded ? 'Registration Ended' : 'Join Tournament'}
                    </motion.button>
                </Link>
            </div>
        </motion.div>
    );
}
