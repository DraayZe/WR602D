import React, { useState, useEffect, useRef } from 'react';
import ProfileModal from './ProfileModal.js';

export default function Navbar({ user, logoutUrl, loginUrl, registerUrl, logoUrl, pathHomeUrl, profileUrl, plans, csrfToken, planCsrfToken, planUrl }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(user);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleUserUpdate = ({ photo, firstname, lastname }) => {
        setCurrentUser(u => ({ ...u, photo, firstname, lastname }));
    };

    return (
        <>
            <header className="relative z-50 pt-6">
                <nav className="mx-auto max-w-3/4 flex items-center justify-between px-6 py-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/15">
                    <a href={pathHomeUrl}>
                        <div className="flex items-center gap-1">
                            <img src={logoUrl} alt="LarryPDF" className="h-auto w-8 mr-2" />
                            <span className="text-white text-2xl font-bold">LarryPDF</span>
                        </div>
                    </a>

                    <div className="flex items-center gap-8">
                        <a href="#" className="text-stone-300 hover:text-white transition text-base">Outils</a>
                        <a href="#" className="text-stone-300 hover:text-white transition text-base">Tarifs</a>
                        <a href="#" className="text-stone-300 hover:text-white transition text-base">Conversion</a>
                        <a href="#" className="text-stone-300 hover:text-white transition text-base">Historique</a>
                    </div>

                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <div className="ml-12 w-12 h-12 rounded-full overflow-hidden border border-white/20 flex items-center justify-center bg-white/10 shrink-0">
                                        {currentUser.photo
                                            ? <img src={`/uploads/avatars/${currentUser.photo}`} alt="" className="w-full h-full object-cover" />
                                            : <i className="fa-solid fa-user text-white/50 text-xs"></i>
                                        }
                                    </div>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-6 w-72 bg-white/[0.06] backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50">
                                        <div className="px-5 pt-4 pb-3 border-b border-white/10">
                                            <p className="text-white/40 text-xs font-medium tracking-widest uppercase">Bon retour</p>
                                        </div>

                                        <div className="px-5 py-4 flex items-center gap-3 border-b border-white/10">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#B155FF]/40 flex items-center justify-center bg-white/10 shrink-0">
                                                {currentUser.photo
                                                    ? <img src={`/uploads/avatars/${currentUser.photo}`} alt="" className="w-full h-full object-cover" />
                                                    : <i className="fa-solid fa-user text-white/50 text-sm"></i>
                                                }
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-semibold text-sm truncate">{currentUser.firstname} {currentUser.lastname}</p>
                                                {currentUser.plan && (
                                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[#B155FF]/15 border border-[#B155FF]/30 text-[#B155FF] text-xs font-medium">
                                                        <i className="fa-solid fa-crown text-[10px]"></i>
                                                        {currentUser.plan}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="py-2">
                                            <button
                                                onClick={() => { setDropdownOpen(false); setShowProfile(true); }}
                                                className="hover:cursor-pointer w-full flex items-center gap-3 px-5 py-2.5 text-stone-300 hover:bg-white/10 hover:text-white transition text-sm"
                                            >
                                                <i className="fa-regular fa-id-badge text-xs w-4 text-center"></i>
                                                Profil
                                            </button>
                                            <a
                                                href={logoutUrl}
                                                className="flex items-center gap-3 px-5 py-2.5 text-stone-300 hover:bg-white/10 hover:text-red-400 transition text-sm"
                                            >
                                                <i className="fa-solid fa-right-from-bracket text-xs w-4 text-center"></i>
                                                Déconnexion
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <a href={loginUrl}
                                   className="text-stone-300 hover:text-white transition text-base">Connexion</a>
                                <a href={registerUrl} className="btn-larry-1">
                                    <span>Démarrer</span>
                                </a>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {showProfile && (
                <ProfileModal
                    user={currentUser}
                    plans={plans || []}
                    csrfToken={csrfToken}
                    planCsrfToken={planCsrfToken}
                    profileUrl={profileUrl}
                    planUrl={planUrl}
                    plansPageUrl={pathHomeUrl + '#plans'}
                    onClose={() => setShowProfile(false)}
                    onUserUpdate={handleUserUpdate}
                />
            )}
        </>
    );
}
