import React, { useState, useRef } from 'react';
import { useQuota } from '../../hooks/useQuota.js';
import QuotaBar from '../../components/QuotaBar.js';

export default function MergePdf({ endpoint, quotaUrl }) {
    const { quota, refreshQuota } = useQuota(quotaUrl);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pdf, setPdf] = useState(null);
    const [dragging, setDragging] = useState(false);
    const blobRef = useRef(null);
    const inputRef = useRef(null);

    const addFiles = (newFiles) => {
        const pdfs = Array.from(newFiles).filter(f => f.name.toLowerCase().endsWith('.pdf'));
        if (pdfs.length === 0) {
            setError('Seuls les fichiers PDF sont acceptés.');
            return;
        }
        setError(null);
        setFiles(prev => [...prev, ...pdfs]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length < 2) {
            setError('Ajoutez au moins 2 fichiers PDF.');
            return;
        }

        setLoading(true);
        setError(null);
        setPdf(null);

        if (blobRef.current) {
            URL.revokeObjectURL(blobRef.current);
            blobRef.current = null;
        }

        const formData = new FormData();
        files.forEach(f => formData.append('files[]', f));

        try {
            const res = await fetch(endpoint, { method: 'POST', body: formData });

            if (!res.ok) {
                let msg = 'Erreur lors de la fusion.';
                try { const d = await res.json(); msg = d.error || d.message || msg; } catch (_) {}
                throw new Error(msg);
            }

            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            blobRef.current = blobUrl;
            setPdf({ blobUrl, filename: 'merged.pdf' });
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
                <h1 className="text-white text-4xl font-bold mb-3">Fusionner des PDF</h1>
                <p className="text-stone-400 text-lg max-w-xl mx-auto">
                    Combinez plusieurs fichiers PDF en un seul document.
                </p>
            </div>

            <div className="max-w-2xl mx-auto fade-up fade-up-delay-1">
                <QuotaBar quota={quota} />
            </div>

            <div className="max-w-2xl mx-auto mb-8 fade-up fade-up-delay-1">
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6">
                    <form onSubmit={handleSubmit}>
                        {/* Drop zone */}
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition mb-4 ${dragging ? 'border-violet-larry bg-violet-larry/10' : 'border-white/10 hover:border-white/20'}`}
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            <i className="fa-solid fa-cloud-arrow-up text-3xl text-white/20 mb-3 block"></i>
                            <p className="text-white/50 text-sm">Glissez vos PDF ici ou <span className="text-violet-larry">cliquez pour choisir</span></p>
                            <input ref={inputRef} type="file" multiple accept=".pdf" className="hidden" onChange={e => addFiles(e.target.files)} />
                        </div>

                        {/* File list */}
                        {files.length > 0 && (
                            <ul className="space-y-2 mb-4">
                                {files.map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5">
                                        <i className="fa-solid fa-file-pdf text-red-400 text-sm shrink-0"></i>
                                        <span className="text-white/70 text-sm flex-1 truncate">{f.name}</span>
                                        <button type="button" onClick={() => removeFile(i)} className="text-white/20 hover:text-red-400 transition text-xs">
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <button
                            type="submit"
                            disabled={loading || files.length < 2 || (quota && quota.remaining === 0)}
                            className="btn-larry-1 w-full disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading
                                    ? <><i className="fa-solid fa-spinner fa-spin text-xs"></i> Fusion en cours…</>
                                    : <><i className="fa-solid fa-code-merge text-xs"></i> Fusionner {files.length > 0 ? `(${files.length} fichiers)` : ''}</>
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
                            <i className="fa-solid fa-code-merge text-5xl text-violet-larry/30 animate-pulse"></i>
                            <p className="text-sm">Fusion en cours…</p>
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
                                        PDF fusionné avec succès
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
