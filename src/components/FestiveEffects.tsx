"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
}

export function FestiveEffects() {
    const [particles, setParticles] = useState<Particle[]>([]);
    const colors = ["#FFD700", "#FFA500", "#FF4500", "#FFFFFF", "#9333ea"];

    useEffect(() => {
        const interval = setInterval(() => {
            const newParticles = Array.from({ length: 5 }).map((_, i) => ({
                id: Date.now() + i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 4 + 2,
            }));
            setParticles(prev => [...prev.slice(-20), ...newParticles]);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ scale: 0, opacity: 1, x: p.x + "%", y: "100%" }}
                    animate={{
                        y: p.y + "%",
                        scale: [0, 1.5, 0],
                        opacity: [1, 1, 0]
                    }}
                    transition={{
                        duration: 2,
                        ease: "easeOut"
                    }}
                    style={{
                        position: 'absolute',
                        width: p.size,
                        height: p.size,
                        borderRadius: '50%',
                        backgroundColor: p.color,
                        boxShadow: `0 0 10px ${p.color}`,
                    }}
                />
            ))}

            {/* Confetti rain */}
            <div className="absolute inset-0">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={`confetti-${i}`}
                        initial={{ y: -20, x: Math.random() * 100 + "%", rotate: 0 }}
                        animate={{
                            y: "110vh",
                            rotate: 360,
                            x: (Math.random() * 100 - 10) + "%"
                        }}
                        transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 5
                        }}
                        className="absolute w-2 h-2 rounded-sm"
                        style={{
                            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                            opacity: 0.6
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export function NewYearBanner() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative py-4 px-2 md:px-6 mb-8 text-center"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-primary/20 to-yellow-500/20 blur-xl opacity-50" />
            <div className="relative inline-block w-full max-w-[90vw] md:max-w-none">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)] leading-tight">
                    Happy New Year 2026
                </h2>
                <div className="flex items-center justify-center gap-1 sm:gap-2 mt-2">
                    <div className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent to-yellow-500" />
                    <span className="text-[8px] sm:text-[10px] font-bold text-yellow-500/80 uppercase tracking-[0.2em] sm:tracking-[0.3em] whitespace-nowrap">FortisArena Season Special</span>
                    <div className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent to-yellow-500" />
                </div>
            </div>
        </motion.div>
    );
}
