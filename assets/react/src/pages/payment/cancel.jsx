import React from 'react';

export default function Cancel({ homeUrl }) {
    return (
        <section className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center max-w-md">
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-500/20 border border-red-500/40">
                    <i className="fa-solid fa-xmark text-red-400 text-3xl"></i>
                </div>
                <h1 className="text-white text-4xl font-bold">Paiement annulé</h1>
                <p className="text-stone-400 text-lg">
                    Votre paiement a été annulé. Aucun montant n'a été débité. Vous pouvez réessayer à tout moment.
                </p>
                <a href={homeUrl} className="btn-larry-1 mt-2">
                    <span>Retour à l'accueil</span>
                </a>
            </div>
        </section>
    );
}
