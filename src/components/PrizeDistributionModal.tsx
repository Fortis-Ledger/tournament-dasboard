"use client";

import { useState, useEffect } from "react";
import { Trophy, X, Plus, Minus } from "lucide-react";
import { PrizePosition } from "@/lib/types";

interface PrizeDistributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (distribution: PrizePosition[]) => void;
    totalPrizePool: number;
    initialDistribution?: PrizePosition[];
}

export function PrizeDistributionModal({
    isOpen,
    onClose,
    onSave,
    totalPrizePool,
    initialDistribution = [],
}: PrizeDistributionModalProps) {
    const [topCount, setTopCount] = useState(initialDistribution.length || 3);
    const [distribution, setDistribution] = useState<PrizePosition[]>(
        initialDistribution.length > 0
            ? initialDistribution
            : Array.from({ length: 3 }, (_, i) => ({ position: i + 1, amount: 0 }))
    );

    useEffect(() => {
        if (initialDistribution.length > 0) {
            setTopCount(initialDistribution.length);
            setDistribution(initialDistribution);
        }
    }, [initialDistribution]);

    const handleTopCountChange = (newCount: number) => {
        if (newCount < 1 || newCount > 20) return;
        const newDistribution: PrizePosition[] = [];
        for (let i = 0; i < newCount; i++) {
            const existing = distribution.find(d => d.position === i + 1);
            newDistribution.push({ position: i + 1, amount: existing?.amount || 0 });
        }
        setTopCount(newCount);
        setDistribution(newDistribution);
    };

    const handleAmountChange = (position: number, amount: number) => {
        setDistribution(prev => prev.map(d => d.position === position ? { ...d, amount: Math.max(0, amount) } : d));
    };

    const totalDistributed = distribution.reduce((sum, d) => sum + d.amount, 0);
    const remaining = totalPrizePool - totalDistributed;
    const isValid = remaining === 0 && totalPrizePool > 0;

    const handleSave = () => { if (isValid) { onSave(distribution); onClose(); } };

    const distributeEvenly = () => {
        const perPrize = Math.floor(totalPrizePool / topCount);
        const remainder = totalPrizePool - perPrize * topCount;
        setDistribution(prev => prev.map((d, i) => ({ ...d, amount: perPrize + (i === 0 ? remainder : 0) })));
    };

    const getLabel = (p: number) => `${p}${p <= 3 ? ['st', 'nd', 'rd'][p - 1] : 'th'}`;

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: '#111122',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '380px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>

                {/* Header Area - Lean */}
                <div style={{ padding: '16px 16px 10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '16px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Trophy style={{ width: '18px', height: '18px', color: '#facc15' }} />
                            Prizes
                        </h2>
                        <button onClick={onClose} style={{ padding: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'white' }}>
                            <X style={{ width: '18px', height: '18px' }} />
                        </button>
                    </div>

                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center' }}>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '700' }}>Pool Balance</p>
                        <p style={{ fontSize: '20px', fontWeight: '900', color: '#facc15', fontStyle: 'italic' }}>Rs. {totalPrizePool.toLocaleString()}</p>
                    </div>
                </div>

                {/* Controls - Lean */}
                <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '40px' }}>
                        <button onClick={() => handleTopCountChange(topCount - 1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Minus size={14} /></button>
                        <span style={{ fontWeight: '900', fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>{topCount}</span>
                        <button onClick={() => handleTopCountChange(topCount + 1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Plus size={14} /></button>
                    </div>
                    <button onClick={distributeEvenly} style={{ fontSize: '11px', color: '#9333ea', fontWeight: '800', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
                        Distribute Auto
                    </button>
                </div>

                {/* Scrollable Area - Explicitly capped */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', minHeight: '100px' }}>
                    <div style={{ display: 'grid', gap: '8px', paddingBottom: '16px' }}>
                        {distribution.map((d) => (
                            <div key={d.position} style={{
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '8px',
                                background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '10px', flexShrink: 0,
                                    background: d.position === 1 ? '#eab308' : d.position === 2 ? '#9ca3af' : d.position === 3 ? '#ea580c' : 'rgba(255,255,255,0.1)',
                                    color: d.position <= 2 ? 'black' : 'white',
                                    fontStyle: 'italic'
                                }}>
                                    {getLabel(d.position)}
                                </div>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', opacity: 0.4, fontWeight: '700' }}>RS</span>
                                    <input
                                        type="number"
                                        value={d.amount || ''}
                                        onChange={(e) => handleAmountChange(d.position, parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        style={{
                                            width: '100%', padding: '8px 10px 8px 30px', borderRadius: '8px',
                                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)',
                                            color: 'white', outline: 'none', fontSize: '14px', fontWeight: '700'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer - Fixed & Strong */}
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                    <div style={{
                        padding: '12px', borderRadius: '14px', marginBottom: '12px',
                        background: remaining === 0 ? 'rgba(34,197,94,0.1)' : remaining < 0 ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.05)',
                        border: '1px solid ' + (remaining === 0 ? 'rgba(34,197,94,0.2)' : remaining < 0 ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)')
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '700' }}>
                            <span>DISTRIBUTED</span>
                            <span style={{ color: 'white' }}>Rs. {totalDistributed.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '4px', fontWeight: '900' }}>
                            <span>REMAINING</span>
                            <span style={{ color: remaining === 0 ? '#4ade80' : remaining < 0 ? '#f87171' : '#fbbf24' }}>
                                Rs. {remaining.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>
                            CANCEL
                        </button>
                        <button onClick={handleSave} disabled={!isValid} style={{
                            flex: 1.5, padding: '12px', borderRadius: '12px', border: 'none', cursor: isValid ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: '900',
                            background: isValid ? '#9333ea' : 'rgba(255,255,255,0.05)',
                            color: isValid ? 'white' : 'rgba(255,255,255,0.2)',
                            boxShadow: isValid ? '0 10px 20px -5px rgba(147, 51, 234, 0.5)' : 'none',
                            transition: 'all 0.2s'
                        }}>
                            SAVE DISTRIBUTION
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
