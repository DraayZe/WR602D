import React, { useState } from 'react';

export default function Register({ csrfToken, errors = {}, lastValues = {}, flashError, registerUrl, loginUrl, homeUrl, logoUrl }) {
    const [values, setValues] = useState({
        lastname: lastValues.lastname || '',
        firstname: lastValues.firstname || '',
        email: lastValues.email || '',
        password: '',
        dob: lastValues.dob || '',
        phone: lastValues.phone || '',
        favoriteColor: lastValues.favoriteColor || '',
        agreeTerms: false,
    });

    const handleChange = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setValues(v => ({ ...v, [field]: value }));
    };

    const iconClass = (field) => values[field] ? 'text-violet-larry' : 'text-white/20';

    return (
        <div className="max-w-lg mx-auto">
            <div className="text-center mb-10">
                <a href={homeUrl} className="inline-flex items-center gap-2 no-underline">
                    <img src={logoUrl} alt="LarryPDF" className="h-12 w-auto" />
                    <span className="text-white text-2xl font-bold">LarryPDF</span>
                </a>
            </div>

            <div className="auth-card">
                <h1 className="text-white text-2xl font-bold text-center mb-1">Créer un compte</h1>
                <p className="text-white/40 text-sm text-center mb-8">Rejoignez LarryPDF gratuitement</p>

                {(flashError || errors.registration_form) && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{flashError || errors.registration_form}</span>
                    </div>
                )}

                <form method="post" action={registerUrl} noValidate data-turbo="false">
                    <input type="hidden" name="registration_form[_token]" value={csrfToken} />

                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Nom</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('lastname')}`}></i>
                                <input type="text" name="registration_form[lastname]" className="auth-input" placeholder="Dupont" value={values.lastname} onChange={handleChange('lastname')} />
                            </div>
                            {errors.lastname && <div className="text-red-400 text-xs mt-1">{errors.lastname}</div>}
                        </div>
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Prénom</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('firstname')}`}></i>
                                <input type="text" name="registration_form[firstname]" className="auth-input" placeholder="Jean" value={values.firstname} onChange={handleChange('firstname')} />
                            </div>
                            {errors.firstname && <div className="text-red-400 text-xs mt-1">{errors.firstname}</div>}
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block text-white/60 text-sm font-medium mb-2">Adresse email</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('email')}`}></i>
                            <input type="email" name="registration_form[email]" className="auth-input" placeholder="exemple@email.com" value={values.email} onChange={handleChange('email')} autoComplete="email" />
                        </div>
                        {errors.email && <div className="text-red-400 text-xs mt-1">{errors.email}</div>}
                    </div>

                    <div className="mb-5">
                        <label className="block text-white/60 text-sm font-medium mb-2">Mot de passe</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('password')}`}></i>
                            <input type="password" name="registration_form[plainPassword]" className="auth-input" placeholder="Minimum 6 caractères" value={values.password} onChange={handleChange('password')} autoComplete="new-password" />
                        </div>
                        {errors.plainPassword && <div className="text-red-400 text-xs mt-1">{errors.plainPassword}</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Date de naissance</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('dob')}`}></i>
                                <input type="date" name="registration_form[dob]" className="auth-input" value={values.dob} onChange={handleChange('dob')} />
                            </div>
                            {errors.dob && <div className="text-red-400 text-xs mt-1">{errors.dob}</div>}
                        </div>
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Téléphone</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('phone')}`}></i>
                                <input type="text" name="registration_form[phone]" className="auth-input" placeholder="06 12 34 56 78" value={values.phone} onChange={handleChange('phone')} />
                            </div>
                            {errors.phone && <div className="text-red-400 text-xs mt-1">{errors.phone}</div>}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-white/60 text-sm font-medium mb-2">Couleur préférée</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-palette absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('favoriteColor')}`}></i>
                            <input type="text" name="registration_form[favoriteColor]" className="auth-input" placeholder="Violet, Bleu..." value={values.favoriteColor} onChange={handleChange('favoriteColor')} />
                        </div>
                        {errors.favoriteColor && <div className="text-red-400 text-xs mt-1">{errors.favoriteColor}</div>}
                    </div>

                    <div className="flex items-start gap-3 mb-6">
                        <input type="checkbox" name="registration_form[agreeTerms]" id="agreeTerms" className="w-4 h-4 accent-violet-larry cursor-pointer shrink-0 mt-0.5" checked={values.agreeTerms} onChange={handleChange('agreeTerms')} />
                        <label htmlFor="agreeTerms" className="text-white/45 text-xs leading-relaxed cursor-pointer">
                            J'accepte les <a href="#" className="text-violet-larry hover:underline">conditions d'utilisation</a> et la <a href="#" className="text-violet-larry hover:underline">politique de confidentialité</a>
                        </label>
                    </div>
                    {errors.agreeTerms && <div className="text-red-400 text-xs mb-4">{errors.agreeTerms}</div>}

                    <button type="submit" className="auth-submit">
                        <span>Créer mon compte</span>
                    </button>
                </form>
            </div>

            <p className="text-center text-white/40 text-sm mt-7">
                Déjà un compte ?{' '}
                <a href={loginUrl} className="text-violet-larry hover:text-white transition font-medium">Se connecter</a>
            </p>
        </div>
    );
}
