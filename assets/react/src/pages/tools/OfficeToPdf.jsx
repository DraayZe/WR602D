import React, { useState, useRef } from 'react';
import { useQuota } from '../../hooks/useQuota.js';
import QuotaBar from '../../components/QuotaBar.js';

const ACCEPTED = '.doc,.docx,.xls,.xlsx,.ppt,.pptx';

const TYPE_MAP = {
    doc: { label: 'Word', icon: 'fa-solid fa-file-word', color: 'text-blue-400' },
    docx: { label: 'Word', icon: 'fa-solid fa-file-word', color: 'text-blue-400' },
    xls: { label: 'Excel', icon: 'fa-solid fa-file-excel', color: 'text-green-400' },
    xlsx: { label: 'Excel', icon: 'fa-solid fa-file-excel', color: 'text-green-400' },
    ppt: { label: 'PowerPoint', icon: 'fa-solid fa-file-powerpoint', color: 'text-orange-400' },
    pptx: { label: 'PowerPoint', icon: 'fa-solid fa-file-powerpoint', color: 'text-orange-400' },
};

export default function OfficeToPdf({ endpoint, quotaUrl }) {
    const { quota, refreshQuota } = useQuota(quotaUrl);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pdf, setPdf] = useState(null);
    const blobRef = useRef(null);
    const inputRef = useRef(null);

    const fileType = file ? TYPE_MAP[file.name.split('.').pop().toLowerCase()] : null;

    const handleFile = (f) => {
        if (!f) return;
        const ext = f.name.split('.').pop().toLowerCase();
        if (!TYPE_MAP[ext]) {
            setError('Format non supporté. Utilisez .doc, .docx, .xls, .xlsx, .ppt ou .pptx');
            return;
        }
        setFile(f);
        setError(null);
        setPdf(null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);
        setPdf(null);

        if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; }

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
                <h1 className="text-white text-4xl font-bold mb-3">Office en PDF</h1>
                <p className="text-stone-400 text-lg max-w-xl mx-auto">
                    Convertissez vos documents Word, Excel ou PowerPoint en PDF en quelques secondes.
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
                            onDragOver={e => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                            className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-violet-larry/40 hover:bg-white/[0.02] transition mb-4"
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                accept={ACCEPTED}
                                className="hidden"
                                onChange={e => handleFile(e.target.files[0])}
                            />
                            {file ? (
                                <div className="flex items-center justify-center gap-3">
                                    <i className={`${fileType?.icon} text-2xl ${fileType?.color}`}></i>
                                    <div className="text-left">
                                        <p className="text-white font-medium text-sm">{file.name}</p>
                                        <p className="text-white/40 text-xs">{(file.size / 1024).toFixed(1)} Ko · {fileType?.label}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <i className="fa-solid fa-file-arrow-up text-3xl text-white/20 mb-3"></i>
                                    <p className="text-white/50 text-sm">Glissez votre fichier ici ou <span className="text-violet-larry">parcourir</span></p>
                                    <p className="text-white/20 text-xs mt-1">.doc · .docx · .xls · .xlsx · .ppt · .pptx</p>
                                </>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!file || loading || (quota && quota.remaining === 0)}
                            className="btn-larry-1 w-full disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading
                                    ? <><i className="fa-solid fa-spinner fa-spin text-xs"></i> Conversion…</>
                                    : <><i className="fa-solid fa-file-pdf text-xs"></i> Convertir en PDF</>}
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
                        <div className="h-[600px] flex flex-col items-center justify-center gap-4 text-white/20">
                            <i className="fa-solid fa-file-pdf text-5xl text-violet-larry/30 animate-pulse"></i>
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
