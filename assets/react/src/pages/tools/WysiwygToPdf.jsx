import React, { useState, useRef, useCallback } from 'react';
import { useQuota } from '../../hooks/useQuota.js';
import QuotaBar from '../../components/QuotaBar.js';

const TOOLBAR = [
    { cmd: 'bold',          icon: 'fa-bold',          title: 'Gras',        tag: null },
    { cmd: 'italic',        icon: 'fa-italic',        title: 'Italique',    tag: null },
    { cmd: 'underline',     icon: 'fa-underline',     title: 'Souligné',    tag: null },
    { cmd: 'strikeThrough', icon: 'fa-strikethrough', title: 'Barré',       tag: null },
    { sep: true },
    { cmd: 'formatBlock', value: 'h1',  icon: 'fa-heading',    title: 'Titre 1', label: 'H1' },
    { cmd: 'formatBlock', value: 'h2',  icon: 'fa-heading',    title: 'Titre 2', label: 'H2' },
    { cmd: 'formatBlock', value: 'h3',  icon: 'fa-heading',    title: 'Titre 3', label: 'H3' },
    { cmd: 'formatBlock', value: 'p',   icon: 'fa-paragraph',  title: 'Paragraphe' },
    { sep: true },
    { cmd: 'insertUnorderedList', icon: 'fa-list-ul',     title: 'Liste à puces' },
    { cmd: 'insertOrderedList',   icon: 'fa-list-ol',     title: 'Liste numérotée' },
    { sep: true },
    { cmd: 'justifyLeft',   icon: 'fa-align-left',    title: 'Aligner à gauche' },
    { cmd: 'justifyCenter', icon: 'fa-align-center',  title: 'Centrer' },
    { cmd: 'justifyRight',  icon: 'fa-align-right',   title: 'Aligner à droite' },
];

const FONT_SIZES = ['1', '2', '3', '4', '5', '6', '7'];
const FONT_LABELS = ['Très petit', 'Petit', 'Normal', 'Moyen', 'Grand', 'Très grand', 'Énorme'];

export default function WysiwygToPdf({ endpoint, quotaUrl }) {
    const { quota, refreshQuota } = useQuota(quotaUrl);
    const editorRef = useRef(null);
    const [fontSize, setFontSize] = useState('3');
    const [color, setColor] = useState('#ffffff');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pdf, setPdf] = useState(null);
    const blobRef = useRef(null);

    const exec = useCallback((cmd, value = null) => {
        editorRef.current?.focus();
        document.execCommand(cmd, false, value);
    }, []);

    const handleFontSize = (e) => {
        const val = e.target.value;
        setFontSize(val);
        exec('fontSize', val);
    };

    const handleColor = (e) => {
        const val = e.target.value;
        setColor(val);
        exec('foreColor', val);
    };

    const handleSubmit = async () => {
        const html = editorRef.current?.innerHTML?.trim();
        if (!html || html === '<br>') {
            setError('Le contenu ne peut pas être vide.');
            return;
        }

        setLoading(true);
        setError(null);
        setPdf(null);

        if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html }),
            });

            if (!res.ok) {
                let msg = 'Erreur lors de la génération.';
                try { const d = await res.json(); msg = d.error || d.message || msg; } catch (_) {}
                throw new Error(msg);
            }

            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            blobRef.current = blobUrl;
            const filename = 'document-' + new Date().toISOString().slice(0, 10) + '.pdf';
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
                <h1 className="text-white text-4xl font-bold mb-3">Éditeur WYSIWYG</h1>
                <p className="text-stone-400 text-lg max-w-xl mx-auto">
                    Rédigez votre document avec la mise en forme souhaitée et exportez-le en PDF.
                </p>
            </div>

            <div className="max-w-3xl mx-auto fade-up fade-up-delay-1">
                <QuotaBar quota={quota} />
            </div>

            <div className="max-w-3xl mx-auto mb-8 fade-up fade-up-delay-1">
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden">

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
                        {TOOLBAR.map((btn, i) => {
                            if (btn.sep) return <div key={i} className="w-px h-5 bg-white/10 mx-1" />;
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    title={btn.title}
                                    onMouseDown={e => { e.preventDefault(); exec(btn.cmd, btn.value ?? null); }}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition text-xs font-bold"
                                >
                                    {btn.label
                                        ? <span className="text-[10px] font-bold">{btn.label}</span>
                                        : <i className={`fa-solid ${btn.icon}`}></i>}
                                </button>
                            );
                        })}

                        {/* Séparateur */}
                        <div className="w-px h-5 bg-white/10 mx-1" />

                        {/* Taille */}
                        <select
                            value={fontSize}
                            onChange={handleFontSize}
                            className="bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1 text-white/60 text-xs hover:bg-white/10 transition cursor-pointer"
                        >
                            {FONT_SIZES.map((s, i) => (
                                <option key={s} value={s}>{FONT_LABELS[i]}</option>
                            ))}
                        </select>

                        {/* Couleur */}
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition cursor-pointer" title="Couleur du texte">
                            <input
                                type="color"
                                value={color}
                                onChange={handleColor}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-full h-full flex items-center justify-center">
                                <i className="fa-solid fa-palette text-white/50 text-xs pointer-events-none"></i>
                            </div>
                        </div>

                        {/* Bouton effacer */}
                        <div className="w-px h-5 bg-white/10 mx-1" />
                        <button
                            type="button"
                            title="Effacer le formatage"
                            onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition text-xs"
                        >
                            <i className="fa-solid fa-eraser"></i>
                        </button>
                    </div>

                    {/* Zone d'édition */}
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        data-placeholder="Commencez à écrire votre document ici…"
                        className="min-h-[400px] p-6 text-white/80 text-base leading-relaxed outline-none wysiwyg-editor"
                        onFocus={() => setError(null)}
                    />

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-white/[0.08] flex items-center justify-between">
                        <p className="text-white/25 text-xs flex items-center gap-1.5">
                            <i className="fa-solid fa-circle-info"></i>
                            Le PDF sera généré avec une mise en page propre.
                        </p>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || (quota && quota.remaining === 0)}
                            className="btn-larry-1 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center gap-2">
                                {loading
                                    ? <><i className="fa-solid fa-spinner fa-spin text-xs"></i> Génération…</>
                                    : <><i className="fa-solid fa-file-pdf text-xs"></i> Générer le PDF</>}
                            </span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mt-4">
                        <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                        <span>{error}</span>
                    </div>
                )}
            </div>

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
