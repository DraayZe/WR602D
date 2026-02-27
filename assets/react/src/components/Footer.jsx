import React from 'react';

export default function Footer({ logoUrl, linkedinUrl, instagramUrl, githubUrl, xUrl }) {
    return (
        <footer className="relative z-10 mt-24 backdrop-blur-lg border-white/20 border-t-1">
            <div className="mx-auto max-w-3/4 px-6 pt-16">

                <div className="grid grid-cols-4 gap-12 pb-12">
                    <div className="col-span-1">
                        <div className="flex items-center justify-start pb-4">
                            <img src={logoUrl} alt="LarryPDF" className="h-auto w-8 mr-2" />
                            <span className="text-white text-xl font-bold">LarryPDF</span>
                        </div>
                        <p className="text-stone-400 text-sm leading-relaxed pb-4">
                            Plateforme professionnelle de conversion et création de PDF. Rapide, sécurisé et sans limite.
                        </p>
                        <div className="flex gap-2 pb-4">
                            <div className="footer-bg-social-media">
                                <img src={linkedinUrl} alt="Linkedin" className="h-4 w-4" />
                            </div>
                            <div className="footer-bg-social-media">
                                <img src={instagramUrl} alt="Instagram" className="h-6 w-6" />
                            </div>
                            <div className="footer-bg-social-media">
                                <img src={githubUrl} alt="GitHub" className="h-6 w-6" />
                            </div>
                            <div className="footer-bg-social-media">
                                <img src={xUrl} alt="X" className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Produit vers PDF</h4>
                        <ul className="flex flex-col gap-3">
                            <li><a href="#" className="footer-link">URL vers PDF</a></li>
                            <li><a href="#" className="footer-link">Page vers PDF</a></li>
                            <li><a href="#" className="footer-link">Word vers PDF</a></li>
                            <li><a href="#" className="footer-link">Division</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">PDF vers produit</h4>
                        <ul className="flex flex-col gap-3">
                            <li><a href="#" className="footer-link">URL vers PDF</a></li>
                            <li><a href="#" className="footer-link">Page vers PDF</a></li>
                            <li><a href="#" className="footer-link">Word vers PDF</a></li>
                            <li><a href="#" className="footer-link">Division</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Ressources</h4>
                        <ul className="flex flex-col gap-3">
                            <li><a href="#" className="footer-link">FAQ</a></li>
                            <li><a href="#" className="footer-link">Contactez-nous</a></li>
                            <li><a href="#" className="footer-link">API</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-divider"></div>

                <div className="flex items-center justify-between py-6">
                    <p className="text-stone-500 text-sm">&copy; 2026 LarryPDF. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="footer-link">Politique de confidentialité</a>
                        <a href="#" className="footer-link">Conditions d'utilisation</a>
                        <a href="#" className="footer-link">Paramètres des cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
