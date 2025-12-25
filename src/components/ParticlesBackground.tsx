"use client";

import { useEffect, useState } from "react";

export function ParticlesBackground() {
    const [particles, setParticles] = useState<{ id: number; left: string; delay: string; duration: string }[]>([]);

    useEffect(() => {
        const generated = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 15}s`,
            duration: `${15 + Math.random() * 10}s`,
        }));
        setParticles(generated);
    }, []);

    return (
        <div className="particles-bg">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="particle"
                    style={{
                        left: p.left,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                    }}
                />
            ))}
            {/* Gradient orbs for ambient lighting */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-[120px] animate-pulse-glow" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/20 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[150px]" />
        </div>
    );
}
