import React, { useState } from 'react';

export default function Register({ csrfToken, errors = {}, lastValues = {}, plans = [], flashError, registerUrl, loginUrl, homeUrl, logoUrl }) {
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(plans[0]?.id ?? null);
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
            <div className="text-center mb-6">
                <a href={homeUrl} className="inline-flex items-center gap-2 no-underline">
                    <img src={logoUrl} alt="LarryPDF" className="h-auto w-10" />
                    <span className="text-white text-2xl font-bold">LarryPDF</span>
                </a>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className={`flex-1 h-1 rounded-full transition-all ${step >= 1 ? 'bg-violet-larry' : 'bg-white/10'}`}></div>
                <div className={`flex-1 h-1 rounded-full transition-all ${step >= 2 ? 'bg-violet-larry' : 'bg-white/10'}`}></div>
            </div>
            <p className="text-white/40 text-xs text-center mb-4">Étape {step} sur 2</p>

            {step === 1 && (
                <div className="auth-card">
                    <h1 className="text-white text-2xl font-bold text-center mb-1">Créer un compte</h1>
                    <p className="text-white/40 text-sm text-center mb-8">Rejoignez LarryPDF gratuitement</p>

                    {(flashError || errors.registration_form) && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{flashError || errors.registration_form}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Nom</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('lastname')}`}></i>
                                <input type="text" className="auth-input" placeholder="Dupont" value={values.lastname} onChange={handleChange('lastname')} />
                            </div>
                            {errors.lastname && <div className="text-red-400 text-xs mt-1">{errors.lastname}</div>}
                        </div>
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Prénom</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('firstname')}`}></i>
                                <input type="text" className="auth-input" placeholder="Jean" value={values.firstname} onChange={handleChange('firstname')} />
                            </div>
                            {errors.firstname && <div className="text-red-400 text-xs mt-1">{errors.firstname}</div>}
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block text-white/60 text-sm font-medium mb-2">Adresse email</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('email')}`}></i>
                            <input type="email" className="auth-input" placeholder="exemple@email.com" value={values.email} onChange={handleChange('email')} autoComplete="email" />
                        </div>
                        {errors.email && <div className="text-red-400 text-xs mt-1">{errors.email}</div>}
                    </div>

                    <div className="mb-5">
                        <label className="block text-white/60 text-sm font-medium mb-2">Mot de passe</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('password')}`}></i>
                            <input type="password" className="auth-input" placeholder="Minimum 6 caractères" value={values.password} onChange={handleChange('password')} autoComplete="new-password" />
                        </div>
                        {errors.plainPassword && <div className="text-red-400 text-xs mt-1">{errors.plainPassword}</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Date de naissance</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('dob')}`}></i>
                                <input type="date" className="auth-input" value={values.dob} onChange={handleChange('dob')} />
                            </div>
                            {errors.dob && <div className="text-red-400 text-xs mt-1">{errors.dob}</div>}
                        </div>
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Téléphone</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('phone')}`}></i>
                                <input type="text" className="auth-input" placeholder="06 12 34 56 78" value={values.phone} onChange={handleChange('phone')} />
                            </div>
                            {errors.phone && <div className="text-red-400 text-xs mt-1">{errors.phone}</div>}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-white/60 text-sm font-medium mb-2">Couleur préférée</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-palette absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass('favoriteColor')}`}></i>
                            <input type="text" className="auth-input" placeholder="Violet, Bleu..." value={values.favoriteColor} onChange={handleChange('favoriteColor')} />
                        </div>
                        {errors.favoriteColor && <div className="text-red-400 text-xs mt-1">{errors.favoriteColor}</div>}
                    </div>

                    <div className="flex items-start gap-3 mb-6">
                        <input type="checkbox" id="agreeTerms" className="w-4 h-4 accent-violet-larry cursor-pointer shrink-0 mt-0.5" checked={values.agreeTerms} onChange={handleChange('agreeTerms')} />
                        <label htmlFor="agreeTerms" className="text-white/45 text-xs leading-relaxed cursor-pointer">
                            J'accepte les <a href="#" className="text-violet-larry hover:underline">conditions d'utilisation</a> et la <a href="#" className="text-violet-larry hover:underline">politique de confidentialité</a>
                        </label>
                    </div>
                    {errors.agreeTerms && <div className="text-red-400 text-xs mb-4">{errors.agreeTerms}</div>}

                    <button type="button" onClick={() => setStep(2)} className="w-full btn-larry-1">
                        <span>Suivant →</span>
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="auth-card">
                    <h1 className="text-white text-2xl font-bold text-center mb-1">Choisissez votre plan</h1>
                    <p className="text-white/40 text-sm text-center mb-8">Vous pouvez changer de plan à tout moment</p>

                    <form method="post" action={registerUrl} noValidate data-turbo="false">
                        <input type="hidden" name="registration_form[_token]" value={csrfToken} />
                        <input type="hidden" name="registration_form[lastname]" value={values.lastname} />
                        <input type="hidden" name="registration_form[firstname]" value={values.firstname} />
                        <input type="hidden" name="registration_form[email]" value={values.email} />
                        <input type="hidden" name="registration_form[plainPassword]" value={values.password} />
                        <input type="hidden" name="registration_form[dob]" value={values.dob} />
                        <input type="hidden" name="registration_form[phone]" value={values.phone} />
                        <input type="hidden" name="registration_form[favoriteColor]" value={values.favoriteColor} />
                        <input type="hidden" name="registration_form[agreeTerms]" value={values.agreeTerms ? '1' : ''} />
                        <input type="hidden" name="registration_form[plan]" value={selectedPlan ?? ''} />

                        <div className="grid grid-cols-1 gap-4 mb-8">
                            {plans.map(plan => (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                                        selectedPlan === plan.id
                                            ? 'border-violet-larry bg-violet-larry/10'
                                            : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            {selectedPlan === plan.id && (
                                                <i className="fa-solid fa-circle-check text-violet-larry"></i>
                                            )}
                                            {selectedPlan !== plan.id && (
                                                <i className="fa-regular fa-circle text-white/20"></i>
                                            )}
                                            <span className="text-white font-bold text-lg">{plan.name}</span>
                                        </div>
                                        <span className="text-violet-larry font-bold text-xl">
                                            {plan.price === 0 ? 'Gratuit' : `${plan.price}€/mois`}
                                        </span>
                                    </div>
                                    <p className="text-white/50 text-sm ml-7">{plan.description}</p>
                                    {plan.limitGeneration && (
                                        <p className="text-white/30 text-xs ml-7 mt-1">
                                            <i className="fa-solid fa-bolt mr-1"></i>
                                            {plan.limitGeneration} générations/jour
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setStep(1)} className="hover:cursor-pointer flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition text-sm font-medium">
                                ← Retour
                            </button>
                            <button type="submit" className="flex-2 btn-larry-1" style={{flex: 2}}>
                                <span>Créer mon compte</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <p className="text-center text-white/40 text-sm mt-7">
                Déjà un compte ?{' '}
                <a href={loginUrl} className="text-violet-larry hover:text-white transition font-medium">Se connecter</a>
            </p>
        </div>
    );
}
