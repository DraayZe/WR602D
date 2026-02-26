import React, { useState, useEffect, useRef } from 'react';

export default function Navbar({ user, logoutUrl, loginUrl, registerUrl, logoUrl }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
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

    return (
        <header className="relative z-10 pt-10">
            <nav className="mx-auto max-w-3/4 flex items-center justify-between px-6 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/15">
                <div className="flex items-center gap-1">
                    <img src={logoUrl} alt="LarryPDF" className="h-auto w-8 mr-2" />
                    <span className="text-white text-2xl font-bold">LarryPDF</span>
                </div>

                <div className="flex items-center gap-8">
                    <a href="#" className="text-stone-300 hover:text-white transition text-base">Outils</a>
                    <a href="#" className="text-stone-300 hover:text-white transition text-base">Tarifs</a>
                    <a href="#" className="text-stone-300 hover:text-white transition text-base">Conversion</a>
                    <a href="#" className="text-stone-300 hover:text-white transition text-base">Historique</a>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full py-2 px-4 border border-white/10 hover:bg-white/10 transition cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-larry to-violet-larry-dark flex items-center justify-center">
                                    <i className="fa-solid fa-user text-white text-sm"></i>
                                </div>
                                <span className="text-white text-sm font-medium">{user.firstname}</span>
                                <i className="fa-solid fa-chevron-down text-stone-400 text-xs ml-1"></i>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg overflow-hidden z-50">
                                    <a
                                        href={logoutUrl}
                                        className="flex items-center gap-3 px-4 py-3 text-stone-300 hover:bg-white/10 hover:text-white transition text-sm"
                                    >
                                        <i className="fa-solid fa-right-from-bracket text-xs"></i>
                                        Déconnexion
                                    </a>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <a href={loginUrl} className="text-stone-300 hover:text-white transition text-base">Connexion</a>
                            <a href={registerUrl} className="btn-larry-1">
                                <span>Démarrer</span>
                            </a>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
