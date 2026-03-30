import React, { useState, useRef } from 'react';

export default function SplitPdf({ endpoint }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [splitMode, setSplitMode] = useState('intervals');
    const [splitParam, setSplitParam] = useState('1');
    const blobRef = useRef(null);
    const inputRef = useRef(null);

    const handleFile = (f) => {
        if (!f) return;
        if (!f.name.toLowerCase().endsWith('.pdf')) {
            setError('Veuillez sélectionner un fichier PDF');
            return;
        }
        setError(null);
        setResult(null);
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
        setResult(null);

        if (blobRef.current) {
            URL.revokeObjectURL(blobRef.current);
            blobRef.current = null;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('splitMode', splitMode);
        formData.append('splitParam', splitParam);

        try {
            const res = await fetch(endpoint, { method: 'POST', body: formData });

            if (!res.ok) {
                let msg = 'Erreur lors de la division.';
                try { const d = await res.json(); msg = d.error || d.message || msg; } catch (_) {}
                throw new Error(msg);
            }

            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            blobRef.current = blobUrl;
            const filename = file.name.replace(/\.[^.]+$/, '') + '-split.zip';
            setResult({ blobUrl, filename });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-24">
            <div className="text-center mb-12 fade-up">
                <h1 className="text-white text-4xl font-bold mb-3">Diviser un PDF</h1>
                <p className="text-stone-400 text-lg max-w-xl mx-auto">
                    Découpez votre PDF en plusieurs fichiers. Le résultat est téléchargé en ZIP.
                </p>
            </div>

            <div className="max-w-2xl mx-auto mb-8 fade-up fade-up-delay-1">
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6">
                    <form onSubmit={handleSubmit}>
                        {/* Drop zone */}
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition mb-5 ${dragging ? 'border-violet-larry bg-violet-larry/10' : file ? 'border-violet-larry/40 bg-violet-larry/5' : 'border-white/10 hover:border-white/20'}`}
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            {file ? (
                                <>
                                    <i className="fa-solid fa-file-pdf text-3xl text-red-400 mb-3 block"></i>
                                    <p className="text-white/70 text-sm font-medium">{file.name}</p>
                                    <p className="text-white/30 text-xs mt-1">Cliquez pour changer</p>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-cloud-arrow-up text-3xl text-white/20 mb-3 block"></i>
                                    <p className="text-white/50 text-sm">Glissez votre PDF ici ou <span className="text-violet-larry">cliquez pour choisir</span></p>
                                </>
                            )}
                            <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                        </div>

                        {/* Mode selector */}
                        <div className="mb-4">
                            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Mode de division</p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setSplitMode('intervals'); setSplitParam('1'); }}
                                    className={`flex-1 py-2 px-3 rounded-xl text-sm border transition ${splitMode === 'intervals' ? 'bg-violet-larry/15 border-violet-larry/30 text-violet-larry' : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60'}`}
                                >
                                    <i className="fa-solid fa-ruler-horizontal mr-2"></i>Par intervalle
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setSplitMode('pages'); setSplitParam('1-3'); }}
                                    className={`flex-1 py-2 px-3 rounded-xl text-sm border transition ${splitMode === 'pages' ? 'bg-violet-larry/15 border-violet-larry/30 text-violet-larry' : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60'}`}
                                >
                                    <i className="fa-solid fa-scissors mr-2"></i>Par pages
                                </button>
                            </div>
                        </div>

                        {/* Parameter input */}
                        <div className="mb-5">
                            {splitMode === 'intervals' ? (
                                <div>
                                    <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">
                                        Nombre de pages par partie
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={splitParam}
                                        onChange={e => setSplitParam(e.target.value)}
                                        className="auth-input w-full"
                                        placeholder="ex: 2"
                                    />
                                    <p className="text-white/25 text-xs mt-1.5 flex items-center gap-1.5">
                                        <i className="fa-solid fa-circle-info"></i>
                                        Divise toutes les X pages (ex: 2 = PDF de 2 pages chacun)
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">
                                        Plages de pages
                                    </label>
                                    <input
                                        type="text"
                                        value={splitParam}
                                        onChange={e => setSplitParam(e.target.value)}
                                        className="auth-input w-full"
                                        placeholder="ex: 1-3,4-6,7"
                                    />
                                    <p className="text-white/25 text-xs mt-1.5 flex items-center gap-1.5">
                                        <i className="fa-solid fa-circle-info"></i>
                                        Séparez les plages par des virgules (ex: 1-3,4-6 crée 2 PDFs)
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="btn-larry-1 w-full disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading
                                    ? <><i className="fa-solid fa-spinner fa-spin text-xs"></i> Division en cours…</>
                                    : <><i className="fa-solid fa-divide text-xs"></i> Diviser le PDF</>
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
                <div className="max-w-2xl mx-auto fade-up">
                    <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden">
                        <div className="h-[150px] flex flex-col items-center justify-center gap-4 text-white/20">
                            <i className="fa-solid fa-divide text-5xl text-orange-400/30 animate-pulse"></i>
                            <p className="text-sm">Division en cours…</p>
                        </div>
                    </div>
                </div>
            )}

            {result && !loading && (
                <div className="max-w-2xl mx-auto fade-up">
                    <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <i className="fa-solid fa-file-zipper text-green-400 text-sm"></i>
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">{result.filename}</p>
                                <p className="text-white/40 text-xs flex items-center gap-1">
                                    <i className="fa-solid fa-circle-check text-green-400"></i>
                                    PDF divisé avec succès
                                </p>
                            </div>
                        </div>
                        <a href={result.blobUrl} download={result.filename}
                            className="flex items-center justify-center gap-2 bg-violet-larry/15 border border-violet-larry/30 rounded-xl px-4 py-3 text-violet-larry text-sm font-medium hover:bg-violet-larry/25 transition w-full">
                            <i className="fa-solid fa-download text-xs"></i>
                            Télécharger le ZIP
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
