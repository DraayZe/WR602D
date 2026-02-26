import React, { useState } from 'react';

export default function ResetPassword({ csrfToken, errors = {}, loginUrl, homeUrl, logoUrl, resetUrl }) {
    const [values, setValues] = useState({ first: '', second: '' });
    const handleChange = (field) => (e) => setValues(v => ({ ...v, [field]: e.target.value }));

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
                        <i className="fa-solid fa-lock text-violet-larry text-xl"></i>
                    </div>
                    <h1 className="text-white text-2xl font-bold mb-1">Nouveau mot de passe</h1>
                    <p className="text-white/40 text-sm">Choisissez votre nouveau mot de passe</p>
                </div>

                <form method="post" action={resetUrl} noValidate>
                    <input type="hidden" name="change_password_form[_token]" value={csrfToken} />

                    <div className="mb-5">
                        <label className="block text-white/60 text-sm font-medium mb-2">Nouveau mot de passe</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${values.first ? 'text-violet-larry' : 'text-white/20'}`}></i>
                            <input
                                type="password"
                                name="change_password_form[plainPassword][first]"
                                className="auth-input"
                                placeholder="Minimum 6 caractères"
                                autoComplete="new-password"
                                value={values.first}
                                onChange={handleChange('first')}
                            />
                        </div>
                        {errors.first && <div className="text-red-400 text-xs mt-1">{errors.first}</div>}
                    </div>

                    <div className="mb-7">
                        <label className="block text-white/60 text-sm font-medium mb-2">Confirmer le mot de passe</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${values.second ? 'text-violet-larry' : 'text-white/20'}`}></i>
                            <input
                                type="password"
                                name="change_password_form[plainPassword][second]"
                                className="auth-input"
                                placeholder="Retapez votre mot de passe"
                                autoComplete="new-password"
                                value={values.second}
                                onChange={handleChange('second')}
                            />
                        </div>
                        {errors.second && <div className="text-red-400 text-xs mt-1">{errors.second}</div>}
                    </div>

                    {errors.plainPassword && <div className="text-red-400 text-xs mb-4">{errors.plainPassword}</div>}

                    <button type="submit" className="auth-submit">
                        <span>Réinitialiser le mot de passe</span>
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
