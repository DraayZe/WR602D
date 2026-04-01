import React from 'react';

export default function Success({ homeUrl }) {
    return (
        <section className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center max-w-md">
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-500/20 border border-green-500/40">
                    <i className="fa-solid fa-check text-green-400 text-3xl"></i>
                </div>
                <h1 className="text-white text-4xl font-bold">Paiement réussi !</h1>
                <p className="text-stone-400 text-lg">
                    Votre abonnement a bien été activé. Vous pouvez dès maintenant profiter de toutes les fonctionnalités de votre plan.
                </p>
                <a href={homeUrl} className="btn-larry-1 mt-2">
                    <span>Retour à l'accueil</span>
                </a>
            </div>
        </section>
    );
}
