import React, { useState, useRef } from 'react';
import { useQuota } from '../../hooks/useQuota.js';
import QuotaBar from '../../components/QuotaBar.js';

export default function Screenshot({ endpoint, quotaUrl }) {
    const { quota, refreshQuota } = useQuota(quotaUrl);
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [image, setImage] = useState(null);
    const blobRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = url.trim();
        if (!trimmed) return;

        setLoading(true);
        setError(null);
        setImage(null);

        if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: trimmed }),
            });

            if (!res.ok) {
                let msg = 'Erreur lors de la capture.';
                try { const d = await res.json(); msg = d.error || d.message || msg; } catch (_) {}
                throw new Error(msg);
            }

            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            blobRef.current = blobUrl;

            let filename = 'screenshot.png';
            try { filename = new URL(trimmed).hostname.replace(/^www\./, '') + '.png'; } catch (_) {}

            setImage({ blobUrl, filename });
            refreshQuota();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-24">

            <div className="text-center mb-12 fade-up">
                <h1 className="text-white text-4xl font-bold mb-3">Capture d'écran</h1>
                <p className="text-stone-400 text-lg max-w-xl mx-auto">
                    Capturez n'importe quelle page web en image PNG haute qualité.
                </p>
            </div>

            <div className="max-w-2xl mx-auto fade-up fade-up-delay-1">
                <QuotaBar quota={quota} />
            </div>

            <div className="max-w-2xl mx-auto mb-8 fade-up fade-up-delay-1">
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <i className={`fa-solid fa-link absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none transition-colors ${url ? 'text-violet-larry' : 'text-white/20'}`}></i>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="auth-input"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || (quota && quota.remaining === 0)}
                                className="btn-larry-1 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <span className="flex items-center gap-2">
                                    {loading
                                        ? <><i className="fa-solid fa-spinner fa-spin text-xs"></i> Capture…</>
                                        : <><i className="fa-solid fa-camera text-xs"></i> Capturer</>}
                                </span>
                            </button>
                        </div>
                        <p className="text-white/25 text-xs mt-3 flex items-center gap-1.5">
                            <i className="fa-solid fa-circle-info"></i>
                            La page doit être accessible publiquement. Résultat en PNG.
                        </p>
                    </form>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mt-4">
                            <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="max-w-4xl mx-auto fade-up">
                    <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] h-[300px] flex flex-col items-center justify-center gap-4 text-white/20">
                        <i className="fa-solid fa-camera text-5xl text-violet-larry/30 animate-pulse"></i>
                        <p className="text-sm">Capture en cours…</p>
                    </div>
                </div>
            )}

            {image && !loading && (
                <div className="max-w-4xl mx-auto fade-up">
                    <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-violet-larry/10 border border-violet-larry/20 flex items-center justify-center">
                                    <i className="fa-solid fa-image text-violet-larry text-sm"></i>
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">{image.filename}</p>
                                    <p className="text-white/40 text-xs flex items-center gap-1">
                                        <i className="fa-solid fa-circle-check text-green-400"></i>
                                        Capture générée avec succès
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href={image.blobUrl} target="_blank" rel="noreferrer"
                                   className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-stone-300 text-sm font-medium hover:bg-white/10 transition">
                                    <i className="fa-solid fa-up-right-from-square text-xs"></i> Ouvrir
                                </a>
                                <a href={image.blobUrl} download={image.filename}
                                   className="inline-flex items-center gap-2 bg-violet-larry/15 border border-violet-larry/30 rounded-xl px-4 py-2 text-violet-larry text-sm font-medium hover:bg-violet-larry/25 transition">
                                    <i className="fa-solid fa-download text-xs"></i> Télécharger
                                </a>
                            </div>
                        </div>
                        <div className="p-4 bg-[#111] flex justify-center">
                            <img src={image.blobUrl} alt="Capture d'écran" className="max-w-full rounded-lg shadow-xl" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
