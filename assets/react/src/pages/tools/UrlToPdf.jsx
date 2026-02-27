import React, { useState, useRef } from 'react';

export default function UrlToPdf({ pdfFromUrlEndpoint }) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pdf, setPdf] = useState(null); // { blobUrl, filename }
    const blobRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = url.trim();
        if (!trimmed) return;

        setLoading(true);
        setError(null);
        setPdf(null);

        if (blobRef.current) {
            URL.revokeObjectURL(blobRef.current);
            blobRef.current = null;
        }

        try {
            const res = await fetch(pdfFromUrlEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: trimmed }),
            });

            if (!res.ok) {
                let msg = 'Erreur lors de la conversion.';
                try {
                    const data = await res.json();
                    msg = data.error || data.message || msg;
                } catch (_) {}
                throw new Error(msg);
            }

            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            blobRef.current = blobUrl;

            let filename = 'document.pdf';
            try {
                filename = new URL(trimmed).hostname.replace(/^www\./, '') + '.pdf';
            } catch (_) {}

            setPdf({ blobUrl, filename });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-24">

            <div className="text-center mb-12 fade-up">
                {/*<div className="inline-flex items-center gap-2 bg-violet-larry/10 border border-violet-larry/20 rounded-full px-4 py-1.5 mb-6">
                    <i className="fa-solid fa-link text-violet-larry text-xs"></i>
                    <span className="text-violet-larry text-sm font-medium">Outil gratuit</span>
                </div> */}
                <h1 className="text-white text-4xl font-bold mb-3">Lien en PDF</h1>
                <p className="text-stone-400 text-lg max-w-xl mx-auto">
                    Convertissez n'importe quelle page web en document PDF en un clic.
                </p>
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
                                disabled={loading}
                                className="btn-larry-1 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <span className="flex items-center gap-2 hover:cursor-pointer">
                                    {loading
                                        ? <><i className="fa-solid fa-spinner fa-spin text-xs"></i> Conversion…</>
                                        : <><i className="fa-solid fa-file-pdf text-xs"></i> Convertir</>
                                    }
                                </span>
                            </button>
                        </div>

                        <p className="text-white/25 text-xs mt-3 flex items-center gap-1.5">
                            <i className="fa-solid fa-circle-info"></i>
                            La page doit être accessible publiquement.
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
                    <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-white/5 animate-pulse"></div>
                                <div className="space-y-1.5">
                                    <div className="w-32 h-3 bg-white/10 rounded animate-pulse"></div>
                                    <div className="w-20 h-2.5 bg-white/5 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-24 h-8 bg-white/5 rounded-lg animate-pulse"></div>
                                <div className="w-24 h-8 bg-violet-larry/10 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                        <div className="h-[600px] flex flex-col items-center justify-center gap-4 text-white/20">
                            <i className="fa-solid fa-file-pdf text-5xl text-violet-larry/30 animate-pulse"></i>
                            <p className="text-sm">Conversion en cours…</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PDF preview ── */}
            {pdf && !loading && (
                <div className="max-w-4xl mx-auto fade-up">
                    <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden">

                        {/* Result header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-violet-larry/10 border border-violet-larry/20 flex items-center justify-center">
                                    <i className="fa-solid fa-file-pdf text-violet-larry text-sm"></i>
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">{pdf.filename}</p>
                                    <p className="text-white/40 text-xs flex items-center gap-1">
                                        <i className="fa-solid fa-circle-check text-green-400"></i>
                                        PDF généré avec succès
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={pdf.blobUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-stone-300 text-sm font-medium hover:bg-white/10 transition"
                                >
                                    <i className="fa-solid fa-up-right-from-square text-xs"></i>
                                    Ouvrir
                                </a>
                                <a
                                    href={pdf.blobUrl}
                                    download={pdf.filename}
                                    className="inline-flex items-center gap-2 bg-violet-larry/15 border border-violet-larry/30 rounded-xl px-4 py-2 text-violet-larry text-sm font-medium hover:bg-violet-larry/25 transition"
                                >
                                    <i className="fa-solid fa-download text-xs"></i>
                                    Télécharger
                                </a>
                            </div>
                        </div>

                        {/* iFrame preview */}
                        <div className="rounded-b-2xl overflow-hidden bg-white">
                            <iframe
                                src={pdf.blobUrl}
                                className="w-full"
                                style={{ height: '600px' }}
                                title="Aperçu PDF"
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
