import React from 'react';
import Image from 'next/image';

const ProjectDetailPage = () => {
    return (
        <main className="container mx-auto px-4 py-8">
            {/* Project Header */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                {/* Image Gallery */}
                <div className="relative">
                    <div className="h-96 bg-gray-200 flex items-center justify-center">
                        <Image id="mainImage" src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                             alt="Project main image" width={1470} height={96} className="w-full h-full object-cover" />
                        <button className="absolute top-4 left-4 bg-white/80 text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <i className="fas fa-images mr-2"></i> View Gallery
                        </button>
                    </div>

                    <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                        Funding Open
                    </div>
                </div>

                {/* Project Title and Basic Info */}
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sunny Valley Solar Farm</h1>
                            <div className="flex items-center text-gray-600">
                                <i className="fas fa-map-marker-alt mr-2"></i>
                                <span>Fresno, California, USA</span>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Solar Energy</span>
                        </div>
                    </div>

                    {/* Funding Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-500 text-sm mb-1">Funding Goal</p>
                            <p className="text-xl font-bold">$2,400,000</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-500 text-sm mb-1">Amount Raised</p>
                            <p className="text-xl font-bold">$1,560,000</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-500 text-sm mb-1">Investors</p>
                            <p className="text-xl font-bold">84</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-500 text-sm mb-1">Days Left</p>
                            <p className="text-xl font-bold">23</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>65% Funded</span>
                            <span>$1,560,000 raised of $2,400,000</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-green-500 h-3 rounded-full" style={{width: "65%"}}></div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex-1 flex items-center justify-center">
                            <i className="fas fa-wallet mr-2"></i> Connect Wallet to Invest
                        </button>
                        <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 flex-1 flex items-center justify-center">
                            <i className="fas fa-share-alt mr-2"></i> Share Project
                        </button>
                        <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                            <i className="fas fa-bookmark mr-2"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="flex overflow-x-auto">
                        <button className="tab-button px-6 py-4 text-sm font-medium active-tab" data-tab="overview">
                            Overview
                        </button>
                        <button className="tab-button px-6 py-4 text-sm font-medium" data-tab="financials">
                            Financials & Tokenomics
                        </button>
                        <button className="tab-button px-6 py-4 text-sm font-medium" data-tab="documents">
                            Documents
                        </button>
                        <button className="tab-button px-6 py-4 text-sm font-medium" data-tab="updates">
                            Updates
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Overview Tab */}
                    <div id="overview" className="tab-content active">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Project Overview</h2>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">The Building</h3>
                            <p className="text-gray-600 mb-4">
                                The Sunny Valley Solar Farm is a 50MW photovoltaic power station located on 200 acres of land in California&apos;s Central Valley.
                                The site benefits from excellent solar irradiation levels averaging 5.8 kWh/m²/day, making it ideal for solar energy production.
                            </p>
                            <p className="text-gray-600 mb-4">
                                The project will utilize high-efficiency bifacial solar panels mounted on single-axis tracking systems to maximize energy output.
                                The generated electricity will be sold to the local utility under a 20-year power purchase agreement (PPA).
                            </p>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">The Challenge</h3>
                            <p className="text-gray-600 mb-4">
                                California has set ambitious renewable energy targets, aiming for 100% clean electricity by 2045. However,
                                the transition requires significant private investment in utility-scale renewable projects like this one.
                            </p>
                            <p className="text-gray-600">
                                Traditional financing methods often have high barriers to entry for individual investors, limiting participation
                                in the clean energy transition. This project democratizes access through tokenized investment.
                            </p>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Proposed Solution</h3>
                            <p className="text-gray-600 mb-4">
                                The project will implement state-of-the-art solar technology including:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                                <li>Bifacial solar panels with 21.4% efficiency rating</li>
                                <li>Single-axis tracking systems to follow the sun&apos;s path</li>
                                <li>Advanced string inverters with 98.5% efficiency</li>
                                <li>Robotic cleaning system to maintain optimal performance</li>
                                <li>Comprehensive monitoring and analytics platform</li>
                            </ul>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Expected Outcomes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-blue-600 font-medium mb-1">Annual Energy Production</p>
                                    <p className="text-2xl font-bold">110,000 MWh</p>
                                    <p className="text-sm text-gray-600">Enough to power ~10,000 homes</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-green-600 font-medium mb-1">CO2 Reduction</p>
                                    <p className="text-2xl font-bold">78,000 tons/year</p>
                                    <p className="text-sm text-gray-600">Equivalent to removing 17,000 cars</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-purple-600 font-medium mb-1">Payback Period</p>
                                    <p className="text-2xl font-bold">6.5 years</p>
                                    <p className="text-sm text-gray-600">Project life: 25+ years</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ProjectDetailPage;
