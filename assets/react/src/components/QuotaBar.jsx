import React from 'react';

export default function QuotaBar({ quota }) {
    if (!quota) return null;

    if (!quota.hasPlan) {
        return (
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 text-orange-400 text-sm mb-6">
                <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                <span>Aucun plan actif. <a href="/#plans" className="underline hover:text-orange-300">Choisissez un plan</a> pour utiliser cet outil.</span>
            </div>
        );
    }

    const pct = quota.limit > 0 ? Math.min(100, (quota.used / quota.limit) * 100) : 0;
    const isNearLimit = pct >= 80;
    const isAtLimit = quota.remaining === 0;

    const barColor = isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-400' : 'bg-violet-larry';
    const textColor = isAtLimit ? 'text-red-400' : isNearLimit ? 'text-orange-400' : 'text-white/50';

    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 mb-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-white/40 text-xs flex items-center gap-1.5">
                    <i className="fa-solid fa-chart-simple"></i>
                    Générations aujourd'hui
                </span>
                <span className={`text-xs font-medium ${textColor}`}>
                    {quota.used} / {quota.limit}
                </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {isAtLimit && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                    <i className="fa-solid fa-lock text-[10px]"></i>
                    Limite atteinte — revenez demain ou <a href="/#plans" className="underline hover:text-red-300">changez de plan</a>
                </p>
            )}
        </div>
    );
}
