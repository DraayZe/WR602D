import React from 'react';

function formatPrice(price) {
    const num = parseFloat(price);
    return num % 1 === 0
        ? num.toFixed(0)
        : num.toFixed(2).replace('.', ',');
}

export default function Home({ tools = [], plans = [], heroImageUrl, mascotImageUrl }) {
    return (
        <>
            <section className="min-h-screen flex flex-col justify-center mx-auto max-w-3/4">
                <div className="flex items-center justify-center gap-16 mb-14">
                    <div className="flex-1 flex flex-col gap-6">
                        <h1 className="text-white text-6xl font-bold leading-tight">
                            Convertissez vos PDFs<br />
                            <span className="text-violet-larry">en quelques secondes</span>
                        </h1>
                        <p className="text-stone-300 text-lg max-w-xl">
                            Plateforme professionnelle de conversion et création de PDF. Rapide, sécurisé et sans limite.
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                            <a href="#" className="text-black bg-[#F8F4F4] px-6 py-3 rounded-2xl transition text-base font-medium hover:bg-white">
                                Commencer gratuitement
                            </a>
                            <a href="#" className="btn-larry-1">
                                <span>Partager</span>
                            </a>
                        </div>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <img className="h-114 w-auto" src={heroImageUrl} alt="Image d'illustration" />
                    </div>
                </div>

                <div className="flex justify-center mt-12">
                    <svg className="scroll-arrow w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            <section>
                <div className="mx-auto max-w-3/4">
                    <div className="text-center mb-16">
                        <h2 className="text-white text-4xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
                        <p className="text-stone-400 text-lg">Des outils pour tous vos besoins PDF</p>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                        {tools.map((tool, index) => (
                            <div key={index} className={`feature-card fade-up fade-up-delay-${index + 1}`}>
                                <div className="flex items-center">
                                    <div
                                        className="w-10 h-10 flex rounded-xl items-center justify-center mb-4"
                                        style={{
                                            backgroundColor: tool.color + '20',
                                            border: `1px solid ${tool.color}40`,
                                        }}
                                    >
                                        <i className={`${tool.icon} text-lg`} style={{ color: tool.color }}></i>
                                    </div>
                                    <h3 className="text-white text-lg font-semibold mb-2 ml-2">{tool.name}</h3>
                                </div>
                                <p className="text-stone-400 text-sm leading-relaxed">{tool.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="mx-auto max-w-3/4">
                    <div className="flex items-center justify-center gap-16 mb-16">
                        <img className="h-80 w-auto" src={mascotImageUrl} alt="Mascotte LarryPDF" />
                        <div className="flex flex-col gap-4">
                            <h2 className="text-white text-4xl font-bold">Choisissez votre formule</h2>
                            <p className="text-stone-400 text-lg max-w-md">
                                Des tarifs pour tous types de portefeuilles, adaptés à tous vos besoins.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-8">
                        {plans.map((plan, index) => {
                            const isFeatured = plan.name === 'BASIC';
                            return (
                                <div key={index} className={isFeatured ? 'pricing-card pricing-card--featured' : 'pricing-card'}>
                                    {isFeatured && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap">
                                            Le plus populaire
                                        </span>
                                    )}

                                    <div>
                                        <h3 className="text-white text-lg font-semibold mb-1">
                                            {plan.name.charAt(0).toUpperCase() + plan.name.slice(1).toLowerCase()}
                                        </h3>
                                        <p className="text-stone-400 text-sm leading-relaxed">{plan.description}</p>
                                    </div>

                                    <div className="mt-2">
                                        <span className="text-white text-5xl font-bold">{formatPrice(plan.price)}€</span>
                                        <span className="text-stone-400 text-base ml-1">/mois</span>
                                    </div>

                                    <div className="mt-4">
                                        <a href="#" className="btn-larry-1 w-full text-center">
                                            <span>Commencer</span>
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
}
