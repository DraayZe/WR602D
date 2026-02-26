import React from 'react';

export default function CheckEmail({ expirationMessage, retryUrl, loginUrl, homeUrl, logoUrl }) {
    return (
        <div className="max-w-md mx-auto">
            <div className="text-center mb-10">
                <a href={homeUrl} className="inline-flex items-center gap-2 no-underline">
                    <img src={logoUrl} alt="LarryPDF" className="h-12 w-auto" />
                    <span className="text-white text-2xl font-bold">LarryPDF</span>
                </a>
            </div>

            <div className="auth-card text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-larry/25 to-blue-500/25 border border-violet-larry/30 inline-flex items-center justify-center mb-5">
                    <i className="fa-solid fa-envelope-circle-check text-violet-larry text-xl"></i>
                </div>
                <h1 className="text-white text-2xl font-bold mb-3">Email envoyé</h1>
                <p className="text-white/50 text-sm leading-relaxed mb-5">
                    Si un compte correspond à votre adresse email, un lien de réinitialisation vient d'être envoyé.
                    Ce lien expirera dans {expirationMessage}.
                </p>
                <p className="text-white/35 text-xs leading-relaxed">
                    Vous n'avez pas reçu d'email ? Vérifiez vos spams ou{' '}
                    <a href={retryUrl} className="text-violet-larry hover:underline">réessayez</a>.
                </p>
            </div>

            <p className="text-center text-white/40 text-sm mt-7">
                <a href={loginUrl} className="text-violet-larry hover:text-white transition font-medium">
                    <i className="fa-solid fa-arrow-left text-xs mr-1"></i>Retour à la connexion
                </a>
            </p>
        </div>
    );
}
