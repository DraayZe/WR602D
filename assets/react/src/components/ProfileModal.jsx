import React, { useState, useRef, useEffect } from 'react';

export default function ProfileModal({ user = {}, plans = [], csrfToken, planCsrfToken, profileUrl, planUrl, plansPageUrl = '#', onClose, onUserUpdate }) {
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

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const iconClass = (value) => value ? 'text-blue-larry' : 'text-white/20';
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
                if (onUserUpdate) onUserUpdate({ ...profileValues, photo: data.photo ?? user.photo });
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

    const [activeSection, setActiveSection] = useState('profile');

    const navItems = [
        { id: 'profile', label: 'Informations personnelles', icon: 'fa-solid fa-user' },
        { id: 'password', label: 'Mot de passe', icon: 'fa-solid fa-lock' },
        { id: 'plan', label: 'Mon plan', icon: 'fa-solid fa-crown' },
    ];

    return (
        <div className="profile-modal fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative z-10 w-full max-w-5xl h-3/4 bg-bg-dark border border-white/10 rounded-2xl overflow-hidden flex">

                {/* Sidebar gauche */}
                <div className="w-1/5 border-r border-white/10 flex flex-col p-6 gap-6">
                    {/* Avatar + nom */}
                    <div className="flex flex-col items-center gap-3 pb-6 border-b border-white/10">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-larry/50 bg-white/5 flex items-center justify-center">
                            {currentPhotoSrc ? (
                                <img src={currentPhotoSrc} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <i className="fa-solid fa-user text-xl text-white/20"></i>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-white font-semibold text-sm leading-tight">
                                {profileValues.firstname || profileValues.lastname
                                    ? `${profileValues.firstname} ${profileValues.lastname}`.trim()
                                    : 'Mon profil'}
                            </p>
                            <p className="text-white/40 text-xs mt-0.5">{currentPlanData?.name ?? currentPlanName ?? ''}</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-1">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all hover:cursor-pointer ${
                                    activeSection === item.id
                                        ? 'bg-blue-larry/15 text-white border border-blue-larry/30'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <i className={`${item.icon} text-xs w-4 text-center`}></i>
                                <span className="leading-tight">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Contenu droit */}
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
                        <div>
                            <h2 className="text-white text-lg font-bold">{navItems.find(n => n.id === activeSection)?.label}</h2>
                        </div>
                        <button onClick={onClose} aria-label="Fermer" className="hover:cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Section : Informations personnelles */}
                        {activeSection === 'profile' && (
                            <form onSubmit={handleProfileSubmit} encType="multipart/form-data" noValidate>
                                {profileStatus === 'success' && (
                                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm mb-6">
                                        <i className="fa-solid fa-circle-check"></i>
                                        <span>Modifications enregistrées avec succès.</span>
                                    </div>
                                )}
                                {profileStatus === 'error' && !Object.keys(profileErrors).length && (
                                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
                                        <i className="fa-solid fa-circle-exclamation"></i>
                                        <span>Une erreur est survenue.</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                                    <div className="relative">
                                        <div
                                            className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-larry/50 bg-white/5 flex items-center justify-center cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {currentPhotoSrc ? (
                                                <img src={currentPhotoSrc} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <i className="fa-solid fa-user text-xl text-white/20"></i>
                                            )}
                                        </div>
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-larry flex items-center justify-center hover:bg-blue-larry/80 transition">
                                            <i className="fa-solid fa-camera text-white" style={{fontSize: '8px'}}></i>
                                        </button>
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">Photo de profil</p>
                                        <p className="text-white/40 text-xs mt-0.5">JPG, PNG — cliquez pour modifier</p>
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

                                <div className="mb-6">
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
                        )}

                        {/* Section : Mot de passe */}
                        {activeSection === 'password' && (
                            <form onSubmit={handlePasswordSubmit} noValidate>
                                {passwordStatus === 'success' && (
                                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm mb-6">
                                        <i className="fa-solid fa-circle-check"></i>
                                        <span>Mot de passe mis à jour avec succès.</span>
                                    </div>
                                )}
                                {passwordStatus === 'error' && (
                                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
                                        <i className="fa-solid fa-circle-exclamation"></i>
                                        <span>{passwordErrors.currentPassword || passwordErrors.confirmPassword || 'Une erreur est survenue.'}</span>
                                    </div>
                                )}

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
                                <div className="mb-6">
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
                        )}

                        {/* Section : Mon plan */}
                        {activeSection === 'plan' && (
                            <div>
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-blue-larry/30 bg-blue-larry/5 mb-6">
                                    <div>
                                        <p className="text-white font-bold text-lg">{currentPlanData?.name ?? currentPlanName ?? 'Aucun plan'}</p>
                                        {currentPlanData && (
                                            <p className="text-white/50 text-sm mt-0.5">
                                                {currentPlanData.price === 0 ? 'Gratuit' : `${currentPlanData.price}€/mois`}
                                                {currentPlanData.limitGeneration ? ` · ${currentPlanData.limitGeneration} générations/jour` : ''}
                                            </p>
                                        )}
                                    </div>
                                    <i className="fa-solid fa-crown text-blue-larry text-2xl"></i>
                                </div>

                                <a href={plansPageUrl} data-turbo="false" className="btn-larry-1 block w-full">
                                    <span className="text-center">Voir les plans</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
