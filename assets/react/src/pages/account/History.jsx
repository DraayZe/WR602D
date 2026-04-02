import React from 'react';

const TOOL_COLORS = {
    'url-to-pdf':        'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'html-to-pdf':       'text-orange-400 bg-orange-400/10 border-orange-400/20',
    'merge-pdf':         'text-green-400 bg-green-400/10 border-green-400/20',
    'office-to-pdf':     'text-sky-400 bg-sky-400/10 border-sky-400/20',
    'word-to-pdf':       'text-sky-400 bg-sky-400/10 border-sky-400/20',
    'image-to-pdf':      'text-pink-400 bg-pink-400/10 border-pink-400/20',
    'split-pdf':         'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'excel-to-pdf':      'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'powerpoint-to-pdf': 'text-red-400 bg-red-400/10 border-red-400/20',
    'markdown-to-pdf':   'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    'screenshot':        'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'wysiwyg-to-pdf':    'text-violet-400 bg-violet-400/10 border-violet-400/20',
};

export default function History({ generations }) {
    return (
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-24">

            {/* Header */}
            <div className="mb-10 fade-up">
                <h1 className="text-white text-4xl font-bold mb-2">Historique</h1>
                <p className="text-stone-400 text-lg">Retrouvez toutes vos générations de PDF.</p>
            </div>

            {generations.length === 0 ? (
                <div className="fade-up bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-violet-larry/10 border border-violet-larry/20 flex items-center justify-center">
                        <i className="fa-solid fa-clock-rotate-left text-violet-larry text-2xl"></i>
                    </div>
                    <p className="text-white/60 text-base">Aucune génération pour le moment.</p>
                    <a
                        href="/convert/url"
                        className="inline-flex items-center gap-2 bg-violet-larry/15 border border-violet-larry/30 rounded-xl px-5 py-2.5 text-violet-larry text-sm font-medium hover:bg-violet-larry/25 transition"
                    >
                        <i className="fa-solid fa-plus text-xs"></i>
                        Commencer une conversion
                    </a>
                </div>
            ) : (
                <div className="fade-up bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden">

                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 border-b border-white/[0.06] text-white/30 text-xs font-medium uppercase tracking-wider">
                        <span>Outil</span>
                        <span className="text-right w-44">Date</span>
                        <span className="text-right w-32">Action</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/[0.04]">
                        {generations.map((item) => {
                            const colorClass = TOOL_COLORS[item.tool] || 'text-violet-larry bg-violet-larry/10 border-violet-larry/20';
                            return (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-6 py-4 hover:bg-white/[0.02] transition"
                                >
                                    {/* Tool */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${colorClass}`}>
                                            <i className={`fa-solid ${item.toolIcon} text-sm`}></i>
                                        </div>
                                        <span className="text-white text-sm font-medium truncate">{item.toolLabel}</span>
                                    </div>

                                    {/* Date */}
                                    <span className="text-white/40 text-sm text-right w-44 shrink-0">{item.createdAt}</span>

                                    {/* Action */}
                                    <div className="w-32 shrink-0 flex justify-end">
                                        {item.toolUrl ? (
                                            <a
                                                href={item.toolUrl}
                                                className="inline-flex items-center gap-1.5 bg-violet-larry/10 border border-violet-larry/20 rounded-lg px-3 py-1.5 text-violet-larry text-xs font-medium hover:bg-violet-larry/20 transition"
                                            >
                                                <i className="fa-solid fa-rotate-right text-xs"></i>
                                                Reconvertir
                                            </a>
                                        ) : (
                                            <span className="text-white/20 text-xs">—</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer count */}
                    <div className="px-6 py-3 border-t border-white/[0.06] text-white/25 text-xs">
                        {generations.length} génération{generations.length > 1 ? 's' : ''}
                    </div>
                </div>
            )}
        </div>
    );
}
