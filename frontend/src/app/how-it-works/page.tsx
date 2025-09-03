import React from 'react';

const HowItWorksPage = () => {
    return (
        <main>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">How Our Platform Works</h1>
                    <p className="text-xl max-w-3xl mx-auto mb-8">Discover how we&apos;re revolutionizing renewable energy investment through blockchain technology and tokenization.</p>
                    <div className="flex justify-center space-x-4">
                        <a href="#architecture" className="bg-white text-dark px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition">Platform Architecture</a>
                        <a href="#flow" className="border-2 border-white px-6 py-3 rounded-full font-medium hover:bg-white hover:bg-opacity-10 transition">Data Flow</a>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-16">
                {/* Platform Architecture */}
                <section id="architecture" className="mb-20">
                    <h2 className="text-3xl font-bold mb-8 text-center">Platform Architecture</h2>
                    <div className="bg-white rounded-xl shadow-md p-6 mb-12">
                        <h3 className="text-2xl font-semibold mb-4 text-primary">Decentralized Renewable Energy Investment</h3>
                        <p className="mb-6 text-lg">Our platform connects renewable energy projects with global investors through blockchain technology, creating a transparent, efficient, and accessible ecosystem for sustainable investment.</p>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="flex items-center mb-4">
                                    <div className="bg-primary bg-opacity-10 p-3 rounded-full mr-4">
                                        <i className="fas fa-project-diagram text-primary text-xl"></i>
                                    </div>
                                    <h4 className="text-xl font-semibold">Core Components</h4>
                                </div>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                                        <span>Smart Contract Ecosystem</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                                        <span>Tokenized Project Ownership</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                                        <span>Automated Reward Distribution</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                                        <span>Decentralized Governance</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="flex items-center mb-4">
                                    <div className="bg-secondary bg-opacity-10 p-3 rounded-full mr-4">
                                        <i className="fas fa-shield-alt text-secondary text-xl"></i>
                                    </div>
                                    <h4 className="text-xl font-semibold">Key Features</h4>
                                </div>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                                        <span>Transparent & Immutable Records</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                                        <span>Fractional Project Ownership</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                                        <span>Real-time Performance Tracking</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                                        <span>Community Governance</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </main>
    )
}

export default HowItWorksPage;
