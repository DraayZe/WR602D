import React, { useState, useRef, useEffect } from 'react';

export default function ProfileModal({ user = {}, plans = [], csrfToken, planCsrfToken, profileUrl, planUrl, onClose, onUserUpdate }) {
    const [profileValues, setProfileValues] = useState({
        lastname: user.lastname || '',
        firstname: user.firstname || '',
        email: user.email || '',
        dob: user.dob || '',
        phone: user.phone || '',
        favoriteColor: user.favoriteColor || '',
    });
    const [passwordValues, setPasswordValues] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const fileInputRef = useRef(null);

    const [currentPlanId, setCurrentPlanId] = useState(user.planId ?? null);
    const [currentPlanName, setCurrentPlanName] = useState(user.plan ?? null);
    const [selectedPlan, setSelectedPlan] = useState(user.planId ?? null);
    const [showPlanPicker, setShowPlanPicker] = useState(false);

    const [profileStatus, setProfileStatus] = useState(null);
    const [passwordStatus, setPasswordStatus] = useState(null);
    const [planStatus, setPlanStatus] = useState(null);
    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});

    const iconClass = (value) => value ? 'text-violet-larry' : 'text-white/20';
    const currentPhotoSrc = photoPreview || (user.photo ? `/uploads/avatars/${user.photo}` : null);
    const currentPlanData = plans.find(p => p.id === currentPlanId);

    const handleProfileChange = (field) => (e) => {
        setProfileValues(v => ({ ...v, [field]: e.target.value }));
    };
    const handlePasswordChange = (field) => (e) => {
        setPasswordValues(v => ({ ...v, [field]: e.target.value }));
    };
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setPhotoPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileStatus(null);
        setProfileErrors({});
        const formData = new FormData();
        formData.append('_csrf_token', csrfToken);
        formData.append('profile_form[lastname]', profileValues.lastname);
        formData.append('profile_form[firstname]', profileValues.firstname);
        formData.append('profile_form[email]', profileValues.email);
        formData.append('profile_form[dob]', profileValues.dob);
        formData.append('profile_form[phone]', profileValues.phone);
        formData.append('profile_form[favoriteColor]', profileValues.favoriteColor);
        if (photoFile) {
            formData.append('photo', photoFile);
        }
        try {
            const res = await fetch(profileUrl, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await res.json();
            if (data.success) {
                setProfileStatus('success');
                setPhotoFile(null);
                if (onUserUpdate) onUserUpdate({ photo: data.photo, firstname: data.firstname, lastname: data.lastname });
            } else {
                setProfileErrors(data.errors || {});
                setProfileStatus('error');
            }
        } catch {
            setProfileStatus('error');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordStatus(null);
        setPasswordErrors({});
        const formData = new FormData();
        formData.append('_csrf_token', csrfToken);
        formData.append('profile_password_form[currentPassword]', passwordValues.currentPassword);
        formData.append('profile_password_form[newPassword]', passwordValues.newPassword);
        formData.append('profile_password_form[confirmPassword]', passwordValues.confirmPassword);
        try {
            const res = await fetch(profileUrl, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await res.json();
            if (data.success) {
                setPasswordStatus('success');
                setPasswordValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setPasswordErrors(data.errors || {});
                setPasswordStatus('error');
            }
        } catch {
            setPasswordStatus('error');
        }
    };

    const handlePlanSubmit = async () => {
        if (!selectedPlan) return;
        setPlanStatus(null);
        const formData = new FormData();
        formData.append('_csrf_token', planCsrfToken);
        formData.append('plan_id', selectedPlan);
        try {
            const res = await fetch(planUrl, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await res.json();
            if (data.success) {
                setCurrentPlanId(data.plan.id);
                setCurrentPlanName(data.plan.name);
                setShowPlanPicker(false);
                setPlanStatus('success');
            } else {
                setPlanStatus('error');
            }
        } catch {
            setPlanStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative z-10 w-full max-w-2xl bg-[#0a0118] border border-white/10 rounded-2xl p-8 mb-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-white text-2xl font-bold">Mon profil</h2>
                    <button onClick={onClose} aria-label="Fermer" className="hover:cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="auth-card mb-6">
                    <h3 className="text-white text-lg font-semibold mb-1">Informations personnelles</h3>
                    <p className="text-white/40 text-sm mb-6">Modifiez vos informations personnelles</p>

                    {profileStatus === 'success' && (
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm mb-4">
                            <i className="fa-solid fa-circle-check"></i>
                            <span>Modifications enregistrées avec succès.</span>
                        </div>
                    )}
                    {profileStatus === 'error' && !Object.keys(profileErrors).length && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>Une erreur est survenue.</span>
                        </div>
                    )}

                    <form onSubmit={handleProfileSubmit} encType="multipart/form-data" noValidate>
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div
                                    className="w-20 h-20 rounded-full overflow-hidden border-2 border-violet-larry/50 bg-white/5 flex items-center justify-center cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {currentPhotoSrc ? (
                                        <img src={currentPhotoSrc} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <i className="fa-solid fa-user text-2xl text-white/20"></i>
                                    )}
                                </div>
                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-violet-larry flex items-center justify-center hover:bg-violet-larry/80 transition">
                                    <i className="fa-solid fa-camera text-white text-xs"></i>
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-white/60 text-sm font-medium mb-2">Nom</label>
                                <div className="auth-icon-wrap relative">
                                    <i className={`fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(profileValues.lastname)}`}></i>
                                    <input type="text" className="auth-input" placeholder="Dupont" value={profileValues.lastname} onChange={handleProfileChange('lastname')} />
                                </div>
                                {profileErrors.lastname && <div className="text-red-400 text-xs mt-1">{profileErrors.lastname}</div>}
                            </div>
                            <div>
                                <label className="block text-white/60 text-sm font-medium mb-2">Prénom</label>
                                <div className="auth-icon-wrap relative">
                                    <i className={`fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(profileValues.firstname)}`}></i>
                                    <input type="text" className="auth-input" placeholder="Jean" value={profileValues.firstname} onChange={handleProfileChange('firstname')} />
                                </div>
                                {profileErrors.firstname && <div className="text-red-400 text-xs mt-1">{profileErrors.firstname}</div>}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-white/60 text-sm font-medium mb-2">Adresse email</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(profileValues.email)}`}></i>
                                <input type="email" className="auth-input" placeholder="exemple@email.com" value={profileValues.email} onChange={handleProfileChange('email')} autoComplete="email" />
                            </div>
                            {profileErrors.email && <div className="text-red-400 text-xs mt-1">{profileErrors.email}</div>}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-white/60 text-sm font-medium mb-2">Date de naissance</label>
                                <div className="auth-icon-wrap relative">
                                    <i className={`fa-solid fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(profileValues.dob)}`}></i>
                                    <input type="date" className="auth-input" value={profileValues.dob} onChange={handleProfileChange('dob')} />
                                </div>
                                {profileErrors.dob && <div className="text-red-400 text-xs mt-1">{profileErrors.dob}</div>}
                            </div>
                            <div>
                                <label className="block text-white/60 text-sm font-medium mb-2">Téléphone</label>
                                <div className="auth-icon-wrap relative">
                                    <i className={`fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(profileValues.phone)}`}></i>
                                    <input type="text" className="auth-input" placeholder="06 12 34 56 78" value={profileValues.phone} onChange={handleProfileChange('phone')} />
                                </div>
                                {profileErrors.phone && <div className="text-red-400 text-xs mt-1">{profileErrors.phone}</div>}
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-white/60 text-sm font-medium mb-2">Couleur préférée</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-palette absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(profileValues.favoriteColor)}`}></i>
                                <input type="text" className="auth-input" placeholder="Violet, Bleu..." value={profileValues.favoriteColor} onChange={handleProfileChange('favoriteColor')} />
                            </div>
                            {profileErrors.favoriteColor && <div className="text-red-400 text-xs mt-1">{profileErrors.favoriteColor}</div>}
                        </div>

                        <button type="submit" className="btn-larry-1 w-full">
                            <span>Enregistrer les modifications</span>
                        </button>
                    </form>
                </div>

                <div className="auth-card mb-6">
                    <h3 className="text-white text-lg font-semibold mb-1">Changer le mot de passe</h3>
                    <p className="text-white/40 text-sm mb-6">Mettez à jour votre mot de passe</p>

                    {passwordStatus === 'success' && (
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm mb-4">
                            <i className="fa-solid fa-circle-check"></i>
                            <span>Mot de passe mis à jour avec succès.</span>
                        </div>
                    )}
                    {passwordStatus === 'error' && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{passwordErrors.currentPassword || passwordErrors.confirmPassword || 'Une erreur est survenue.'}</span>
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} noValidate>
                        <div className="mb-4">
                            <label className="block text-white/60 text-sm font-medium mb-2">Mot de passe actuel</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(passwordValues.currentPassword)}`}></i>
                                <input type="password" className="auth-input" placeholder="Votre mot de passe actuel" value={passwordValues.currentPassword} onChange={handlePasswordChange('currentPassword')} />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-white/60 text-sm font-medium mb-2">Nouveau mot de passe</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-lock-open absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(passwordValues.newPassword)}`}></i>
                                <input type="password" className="auth-input" placeholder="Minimum 6 caractères" value={passwordValues.newPassword} onChange={handlePasswordChange('newPassword')} autoComplete="new-password" />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label className="block text-white/60 text-sm font-medium mb-2">Confirmer le mot de passe</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-circle-check absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(passwordValues.confirmPassword)}`}></i>
                                <input type="password" className="auth-input" placeholder="Confirmez votre nouveau mot de passe" value={passwordValues.confirmPassword} onChange={handlePasswordChange('confirmPassword')} autoComplete="new-password" />
                            </div>
                        </div>
                        <button type="submit" className="btn-larry-1 w-full">
                            <span>Changer le mot de passe</span>
                        </button>
                    </form>
                </div>

                <div className="auth-card">
                    <h3 className="text-white text-lg font-semibold mb-1">Mon plan</h3>
                    <p className="text-white/40 text-sm mb-6">Votre abonnement actuel</p>

                    {planStatus === 'success' && (
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm mb-4">
                            <i className="fa-solid fa-circle-check"></i>
                            <span>Plan mis à jour avec succès.</span>
                        </div>
                    )}
                    {planStatus === 'error' && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>Erreur lors du changement de plan.</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 rounded-2xl border border-violet-larry/30 bg-violet-larry/5 mb-4">
                        <div>
                            <p className="text-white font-bold text-lg">{currentPlanData?.name ?? currentPlanName ?? 'Aucun plan'}</p>
                            {currentPlanData && (
                                <p className="text-white/50 text-sm mt-0.5">
                                    {currentPlanData.price === 0 ? 'Gratuit' : `${currentPlanData.price}€/mois`}
                                    {currentPlanData.limitGeneration ? ` · ${currentPlanData.limitGeneration} générations/jour` : ''}
                                </p>
                            )}
                        </div>
                        <i className="fa-solid fa-crown text-violet-larry text-2xl"></i>
                    </div>

                    {!showPlanPicker && (
                        <button type="button" onClick={() => setShowPlanPicker(true)} className="btn-larry-1 w-full">
                            <span>Changer de plan</span>
                        </button>
                    )}

                    {showPlanPicker && (
                        <div>
                            <div className="grid grid-cols-1 gap-3 mb-4">
                                {plans.map(plan => (
                                    <div
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={`cursor-pointer rounded-xl border p-4 transition-all ${
                                            selectedPlan === plan.id
                                                ? 'border-violet-larry bg-violet-larry/10'
                                                : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {selectedPlan === plan.id
                                                    ? <i className="fa-solid fa-circle-check text-violet-larry"></i>
                                                    : <i className="fa-regular fa-circle text-white/20"></i>
                                                }
                                                <div>
                                                    <p className="text-white font-semibold">{plan.name}</p>
                                                    <p className="text-white/40 text-xs">{plan.description}</p>
                                                </div>
                                            </div>
                                            <span className="text-violet-larry font-bold">
                                                {plan.price === 0 ? 'Gratuit' : `${plan.price}€/mois`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowPlanPicker(false)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition text-sm font-medium">
                                    Annuler
                                </button>
                                <button type="button" onClick={handlePlanSubmit} disabled={!selectedPlan}
                                    className="btn-larry-1" style={{flex: 2}}>
                                    <span>Confirmer</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
