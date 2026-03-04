import React, { useState, useRef } from 'react';

export default function Profile({ csrfToken, user = {}, errors = {}, success = false, profileUrl, homeUrl, logoUrl }) {
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
    const fileInputRef = useRef(null);

    const handleProfileChange = (field) => (e) => {
        setProfileValues(v => ({ ...v, [field]: e.target.value }));
    };

    const handlePasswordChange = (field) => (e) => {
        setPasswordValues(v => ({ ...v, [field]: e.target.value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setPhotoPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const iconClass = (value) => value ? 'text-violet-larry' : 'text-white/20';

    const currentPhotoSrc = photoPreview || (user.photo ? `/uploads/avatars/${user.photo}` : null);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
                <a href={homeUrl} className="inline-flex items-center gap-2 no-underline">
                    <img src={logoUrl} alt="LarryPDF" className="h-auto w-10" />
                    <span className="text-white text-2xl font-bold">LarryPDF</span>
                </a>
            </div>

            {success && (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm mb-6">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Modifications enregistrées avec succès.</span>
                </div>
            )}

            {errors.csrf && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{errors.csrf}</span>
                </div>
            )}

            <div className="auth-card mb-6">
                <h1 className="text-white text-2xl font-bold text-center mb-1">Mon profil</h1>
                <p className="text-white/40 text-sm text-center mb-8">Modifiez vos informations personnelles</p>

                <form method="post" action={profileUrl} encType="multipart/form-data" noValidate data-turbo="false">
                    <input type="hidden" name="_csrf_token" value={csrfToken} />

                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div
                                className="w-24 h-24 rounded-full overflow-hidden border-2 border-violet-larry/50 bg-white/5 flex items-center justify-center cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {currentPhotoSrc ? (
                                    <img src={currentPhotoSrc} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <i className="fa-solid fa-user text-3xl text-white/20"></i>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-violet-larry flex items-center justify-center hover:bg-violet-larry/80 transition"
                            >
                                <i className="fa-solid fa-camera text-white text-xs"></i>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                name="photo"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Nom</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(profileValues.lastname)}`}></i>
                                <input type="text" name="profile_form[lastname]" className="auth-input" placeholder="Dupont" value={profileValues.lastname} onChange={handleProfileChange('lastname')} />
                            </div>
                            {errors.lastname && <div className="text-red-400 text-xs mt-1">{errors.lastname}</div>}
                        </div>
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Prénom</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(profileValues.firstname)}`}></i>
                                <input type="text" name="profile_form[firstname]" className="auth-input" placeholder="Jean" value={profileValues.firstname} onChange={handleProfileChange('firstname')} />
                            </div>
                            {errors.firstname && <div className="text-red-400 text-xs mt-1">{errors.firstname}</div>}
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block text-white/60 text-sm font-medium mb-2">Adresse email</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(profileValues.email)}`}></i>
                            <input type="email" name="profile_form[email]" className="auth-input" placeholder="exemple@email.com" value={profileValues.email} onChange={handleProfileChange('email')} autoComplete="email" />
                        </div>
                        {errors.email && <div className="text-red-400 text-xs mt-1">{errors.email}</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Date de naissance</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(profileValues.dob)}`}></i>
                                <input type="date" name="profile_form[dob]" className="auth-input" value={profileValues.dob} onChange={handleProfileChange('dob')} />
                            </div>
                            {errors.dob && <div className="text-red-400 text-xs mt-1">{errors.dob}</div>}
                        </div>
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Téléphone</label>
                            <div className="auth-icon-wrap relative">
                                <i className={`fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(profileValues.phone)}`}></i>
                                <input type="text" name="profile_form[phone]" className="auth-input" placeholder="06 12 34 56 78" value={profileValues.phone} onChange={handleProfileChange('phone')} />
                            </div>
                            {errors.phone && <div className="text-red-400 text-xs mt-1">{errors.phone}</div>}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-white/60 text-sm font-medium mb-2">Couleur préférée</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-palette absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(profileValues.favoriteColor)}`}></i>
                            <input type="text" name="profile_form[favoriteColor]" className="auth-input" placeholder="Violet, Bleu..." value={profileValues.favoriteColor} onChange={handleProfileChange('favoriteColor')} />
                        </div>
                        {errors.favoriteColor && <div className="text-red-400 text-xs mt-1">{errors.favoriteColor}</div>}
                    </div>

                    <button type="submit" className="btn-larry-1 w-full">
                        <span>Enregistrer les modifications</span>
                    </button>
                </form>
            </div>

            <div className="auth-card">
                <h2 className="text-white text-xl font-bold text-center mb-1">Changer le mot de passe</h2>
                <p className="text-white/40 text-sm text-center mb-8">Mettez à jour votre mot de passe</p>

                <form method="post" action={profileUrl} noValidate data-turbo="false">
                    <input type="hidden" name="_csrf_token" value={csrfToken} />

                    <div className="mb-5">
                        <label className="block text-white/60 text-sm font-medium mb-2">Mot de passe actuel</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(passwordValues.currentPassword)}`}></i>
                            <input type="password" name="profile_password_form[currentPassword]" className="auth-input" placeholder="Votre mot de passe actuel" value={passwordValues.currentPassword} onChange={handlePasswordChange('currentPassword')} />
                        </div>
                        {errors.currentPassword && <div className="text-red-400 text-xs mt-1">{errors.currentPassword}</div>}
                    </div>

                    <div className="mb-5">
                        <label className="block text-white/60 text-sm font-medium mb-2">Nouveau mot de passe</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-lock-open absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(passwordValues.newPassword)}`}></i>
                            <input type="password" name="profile_password_form[newPassword]" className="auth-input" placeholder="Minimum 6 caractères" value={passwordValues.newPassword} onChange={handlePasswordChange('newPassword')} autoComplete="new-password" />
                        </div>
                        {errors.newPassword && <div className="text-red-400 text-xs mt-1">{errors.newPassword}</div>}
                    </div>

                    <div className="mb-6">
                        <label className="block text-white/60 text-sm font-medium mb-2">Confirmer le mot de passe</label>
                        <div className="auth-icon-wrap relative">
                            <i className={`fa-solid fa-circle-check absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-2 ${iconClass(passwordValues.confirmPassword)}`}></i>
                            <input type="password" name="profile_password_form[confirmPassword]" className="auth-input" placeholder="Confirmez votre nouveau mot de passe" value={passwordValues.confirmPassword} onChange={handlePasswordChange('confirmPassword')} />
                        </div>
                        {errors.confirmPassword && <div className="text-red-400 text-xs mt-1">{errors.confirmPassword}</div>}
                    </div>

                    <button type="submit" className="btn-larry-1 w-full">
                        <span>Changer le mot de passe</span>
                    </button>
                </form>
            </div>

            <p className="text-center text-white/40 text-sm mt-7">
                <a href={homeUrl} className="text-violet-larry hover:text-white transition font-medium">
                    ← Retour à l'accueil
                </a>
            </p>
        </div>
    );
}
