import React, { useState } from 'react';

export default function Login({ csrfToken, lastUsername = '', error, forgotPasswordUrl, registerUrl, homeUrl, logoUrl }) {
    const [values, setValues] = useState({ username: lastUsername, password: '' });

    const handleChange = (field) => (e) => setValues(v => ({ ...v, [field]: e.target.value }));

    return (
        <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
                <a href={homeUrl} className="inline-flex items-center gap-2 no-underline">
                    <img src={logoUrl} alt="LarryPDF" className="h-auto w-10" />
                    <span className="text-white text-2xl font-bold">LarryPDF</span>
                </a>
            </div>

            <div className="auth-card">
                <h1 className="text-white text-2xl font-bold text-center mb-1">Connexion</h1>
                <p className="text-white/40 text-sm text-center mb-8">Accédez à votre espace LarryPDF</p>

                {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form method="post">
                    <div className="mb-5">
                        <label htmlFor="username" className="block text-white/60 text-sm font-medium mb-2">Adresse email</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${values.username ? 'text-violet-larry' : 'text-white/20'}`}></i>
                            <input
                                type="email"
                                defaultValue={lastUsername}
                                name="_username"
                                id="username"
                                className="auth-input"
                                placeholder="exemple@email.com"
                                autoComplete="email"
                                required
                                autoFocus
                                onChange={handleChange('username')}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-white/60 text-sm font-medium mb-2">Mot de passe</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${values.password ? 'text-violet-larry' : 'text-white/20'}`}></i>
                            <input
                                type="password"
                                name="_password"
                                id="password"
                                className="auth-input"
                                placeholder="Votre mot de passe"
                                autoComplete="current-password"
                                required
                                onChange={handleChange('password')}
                            />
                        </div>
                    </div>

                    <input type="hidden" name="_csrf_token" value={csrfToken} />

                    <div className="text-right mb-5">
                        <a href={forgotPasswordUrl} className="text-violet-larry hover:text-violet-larry/70 text-xs font-medium transition">
                            Mot de passe oublié ?
                        </a>
                    </div>

                    <button type="submit" className="w-full btn-larry-1">
                        <span>Se connecter</span>
                    </button>
                </form>
            </div>

            <p className="text-center text-white/40 text-sm mt-7">
                Pas encore de compte ?{' '}
                <a href={registerUrl} className="text-violet-larry hover:text-white transition font-medium">Créer un compte</a>
            </p>
        </div>
    );
}
