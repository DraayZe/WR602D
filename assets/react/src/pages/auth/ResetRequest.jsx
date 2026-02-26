import React, { useState } from 'react';

export default function ResetRequest({ csrfToken, errors = {}, loginUrl, homeUrl, logoUrl, requestUrl }) {
    const [email, setEmail] = useState('');

    return (
        <div className="max-w-md mx-auto">
            <div className="text-center mb-10">
                <a href={homeUrl} className="inline-flex items-center gap-2 no-underline">
                    <img src={logoUrl} alt="LarryPDF" className="h-12 w-auto" />
                    <span className="text-white text-2xl font-bold">LarryPDF</span>
                </a>
            </div>

            <div className="auth-card">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-larry/25 to-blue-500/25 border border-violet-larry/30 inline-flex items-center justify-center mb-4">
                        <i className="fa-solid fa-key text-violet-larry text-xl"></i>
                    </div>
                    <h1 className="text-white text-2xl font-bold mb-1">Mot de passe oublié</h1>
                    <p className="text-white/40 text-sm">Entrez votre email pour recevoir un lien de réinitialisation</p>
                </div>

                <form method="post" action={requestUrl} noValidate>
                    <input type="hidden" name="reset_password_request_form[_token]" value={csrfToken} />

                    <div className="mb-7">
                        <label className="block text-white/60 text-sm font-medium mb-2">Adresse email</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${email ? 'text-violet-larry' : 'text-white/20'}`}></i>
                            <input
                                type="email"
                                name="reset_password_request_form[email]"
                                className="auth-input"
                                placeholder="exemple@email.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {errors.email && <div className="text-red-400 text-xs mt-1">{errors.email}</div>}
                    </div>

                    <button type="submit" className="auth-submit">
                        <span>Envoyer le lien</span>
                    </button>
                </form>
            </div>

            <p className="text-center text-white/40 text-sm mt-7">
                <a href={loginUrl} className="text-violet-larry hover:text-white transition font-medium">
                    <i className="fa-solid fa-arrow-left text-xs mr-1"></i>Retour à la connexion
                </a>
            </p>
        </div>
    );
}
