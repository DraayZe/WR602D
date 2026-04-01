import React, { useState, useRef } from 'react';
import { useQuota } from '../../hooks/useQuota.js';
import QuotaBar from '../../components/QuotaBar.js';

export default function PowerPointToPdf({ endpoint, quotaUrl }) {
    const { quota, refreshQuota } = useQuota(quotaUrl);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pdf, setPdf] = useState(null);
    const [dragging, setDragging] = useState(false);
    const blobRef = useRef(null);
    const inputRef = useRef(null);

    const handleFile = (f) => {
        if (!f) return;
        if (!f.name.match(/\.(pptx?)$/i)) {
            setError('Veuillez sélectionner une présentation PowerPoint (.ppt ou .pptx)');
            return;
        }
        setError(null);
        setPdf(null);
        setFile(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);
        setPdf(null);

        if (blobRef.current) {
            URL.revokeObjectURL(blobRef.current);
            blobRef.current = null;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(endpoint, { method: 'POST', body: formData });

            if (!res.ok) {
                let msg = 'Erreur lors de la conversion.';
                try { const d = await res.json(); msg = d.error || d.message || msg; } catch (_) {}
                throw new Error(msg);
            }

            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            blobRef.current = blobUrl;
            const filename = file.name.replace(/\.[^.]+$/, '') + '.pdf';
            setPdf({ blobUrl, filename });
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
                <h1 className="text-white text-4xl font-bold mb-3">PowerPoint en PDF</h1>
                <p className="text-stone-400 text-lg max-w-xl mx-auto">
                    Convertissez vos présentations PowerPoint en PDF en quelques secondes.
                </p>
            </div>

            <div className="max-w-2xl mx-auto fade-up fade-up-delay-1">
                <QuotaBar quota={quota} />
            </div>

            <div className="max-w-2xl mx-auto mb-8 fade-up fade-up-delay-1">
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6">
                    <form onSubmit={handleSubmit}>
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition mb-4 ${dragging ? 'border-violet-larry bg-violet-larry/10' : file ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/10 hover:border-white/20'}`}
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            {file ? (
                                <>
                                    <i className="fa-solid fa-display text-3xl text-orange-400 mb-3 block"></i>
                                    <p className="text-white/70 text-sm font-medium">{file.name}</p>
                                    <p className="text-white/30 text-xs mt-1">Cliquez pour changer</p>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-cloud-arrow-up text-3xl text-white/20 mb-3 block"></i>
                                    <p className="text-white/50 text-sm">Glissez votre fichier .pptx ici ou <span className="text-violet-larry">cliquez pour choisir</span></p>
                                </>
                            )}
                            <input ref={inputRef} type="file" accept=".ppt,.pptx" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !file || (quota && quota.remaining === 0)}
                            className="btn-larry-1 w-full disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading
                                    ? <><i className="fa-solid fa-spinner fa-spin text-xs"></i> Conversion…</>
                                    : <><i className="fa-solid fa-file-pdf text-xs"></i> Convertir en PDF</>
                                }
                            </span>
                        </button>
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
                        <div className="h-[200px] flex flex-col items-center justify-center gap-4 text-white/20">
                            <i className="fa-solid fa-display text-5xl text-orange-400/30 animate-pulse"></i>
                            <p className="text-sm">Conversion en cours…</p>
                        </div>
                    </div>
                </div>
            )}

            {pdf && !loading && (
                <div className="max-w-4xl mx-auto fade-up">
                    <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden">
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
                                <a href={pdf.blobUrl} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-stone-300 text-sm font-medium hover:bg-white/10 transition">
                                    <i className="fa-solid fa-up-right-from-square text-xs"></i> Ouvrir
                                </a>
                                <a href={pdf.blobUrl} download={pdf.filename}
                                    className="inline-flex items-center gap-2 bg-violet-larry/15 border border-violet-larry/30 rounded-xl px-4 py-2 text-violet-larry text-sm font-medium hover:bg-violet-larry/25 transition">
                                    <i className="fa-solid fa-download text-xs"></i> Télécharger
                                </a>
                            </div>
                        </div>
                        <div className="rounded-b-2xl overflow-hidden bg-white">
                            <iframe src={pdf.blobUrl} className="w-full" style={{ height: '600px' }} title="Aperçu PDF" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
