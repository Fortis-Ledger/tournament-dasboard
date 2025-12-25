"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Trophy, Search } from "lucide-react";
import { Tournament } from "@/lib/types";
import { getOpenTournaments } from "@/lib/db";
import { TournamentCard } from "@/components/TournamentCard";
import { FestiveEffects, NewYearBanner } from "@/components/FestiveEffects";

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadTournaments = async () => {
      const data = await getOpenTournaments();
      setTournaments(data);
      setIsLoading(false);
    };
    loadTournaments();
  }, []);

  const filteredTournaments = tournaments.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.game_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10 relative overflow-hidden">
      <FestiveEffects />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <img src="/icon.svg" alt="FortisArena" className="w-10 h-10 sm:w-14 sm:h-14 drop-shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase text-white tracking-tighter">FortisArena</h1>
          </div>

          <NewYearBanner />

          <p className="text-white/60 text-base sm:text-xl max-w-lg mx-auto italic font-medium px-4">
            Celebrate the new season of competitive gaming. Win big in 2026!
          </p>
        </motion.div>

        {/* Search */}
        {tournaments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-md mx-auto mb-10"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tournaments..."
                className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-white/10 focus:border-primary outline-none transition-colors"
              />
            </div>
          </motion.div>
        )}

        {/* Stats Banner */}
        {tournaments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-strong rounded-3xl p-8 mb-12 border border-yellow-500/10 shadow-[0_0_30px_rgba(234,179,8,0.05)]"
          >
            <div className="flex flex-col md:flex-row items-center justify-around gap-8 text-center">
              <div>
                <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-3 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                <p className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 pr-2">
                  Rs. {tournaments.reduce((sum, t) => sum + t.total_prize_pool, 0).toLocaleString()}
                </p>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Season Prize Pool</p>
              </div>
              <div className="hidden md:block w-px h-16 bg-white/5" />
              <div>
                <Gamepad2 className="w-10 h-10 text-primary mx-auto mb-3 drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]" />
                <p className="text-3xl font-black italic text-white">
                  {tournaments.length}
                </p>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Live Tournaments</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tournament Grid */}
        {filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament, index) => (
              <TournamentCard key={tournament.id} tournament={tournament} index={index} />
            ))}
          </div>
        ) : tournaments.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <p className="text-white/50">No tournaments found matching "{searchQuery}"</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-strong rounded-3xl p-16 text-center"
          >
            <Gamepad2 className="w-20 h-20 mx-auto mb-6 text-white/20" />
            <h2 className="text-2xl font-bold mb-3">No Tournaments Available</h2>
            <p className="text-white/50 max-w-md mx-auto">
              There are no active tournaments at the moment. Check back soon for exciting competitions!
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <p className="text-center text-white/30 text-sm mt-16">
          © {new Date().getFullYear()} FortisArena. All rights reserved.
        </p>
      </div>
    </div>
  );
}
