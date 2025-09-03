import React from 'react';
import { projects } from '@/data/projects';
import BrowseProjectCard from '@/components/BrowseProjectCard';

const BrowseProjectsPage = () => {
    return (
        <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Browse Sustainable Projects</h2>
                <p className="text-gray-600">Invest in projects that align with your values and financial goals</p>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                {/* Search Bar */}
                <div className="mb-6 relative">
                    <input type="text" placeholder="Search by project name or location..."
                           className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>

                {/* Filter Toggle */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
                    <button id="filterToggle" className="text-blue-600 hover:text-blue-800 flex items-center">
                        <i className="fas fa-sliders-h mr-2"></i>
                        <span>Show Filters</span>
                    </button>
                </div>

                {/* Filter Options (Hidden by default) */}
                <div id="filterOptions" className="hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Status Filter */}
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Project Status</h4>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                                    <span className="ml-2 text-gray-700">Funding Open</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded text-blue-600" />
                                    <span className="ml-2 text-gray-700">Fully Funded</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded text-blue-600" />
                                    <span className="ml-2 text-gray-700">Active</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded text-blue-600" />
                                    <span className="ml-2 text-gray-700">Completed</span>
                                </label>
                            </div>
                        </div>

                        {/* Project Type Filter */}
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Project Type</h4>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                                    <span className="ml-2 text-gray-700">Smart Building</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                                    <span className="ml-2 text-gray-700">Microgrid</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                                    <span className="ml-2 text-gray-700">Solar Farm</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                                    <span className="ml-2 text-gray-700">Wind Energy</span>
                                </label>
                            </div>
                        </div>

                        {/* Expected Return Range */}
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Expected Return</h4>
                            <div className="mb-2">
                                <input type="range" min="5" max="30" defaultValue="15" className="w-full slider-thumb" />
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>5%</span>
                                <span>30%</span>
                            </div>
                            <div className="mt-2 text-center">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Selected: 5% - 15%</span>
                            </div>
                        </div>

                        {/* Funding Goal Range */}
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Funding Goal ($)</h4>
                            <div className="flex space-x-2 mb-2">
                                <input type="number" placeholder="Min" className="w-1/2 p-2 border border-gray-300 rounded" />
                                <input type="number" placeholder="Max" className="w-1/2 p-2 border border-gray-300 rounded" />
                            </div>
                            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Apply Range</button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <button className="text-blue-600 hover:text-blue-800">Reset All Filters</button>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Apply Filters</button>
                    </div>
                </div>
            </div>

            {/* Sorting and View Options */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="mb-4 md:mb-0">
                    <span className="text-gray-600 mr-2">Sort by:</span>
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button type="button" className="sort-btn active-filter px-4 py-2 text-sm font-medium rounded-l-lg border border-gray-200">
                            Newest
                        </button>
                        <button type="button" className="sort-btn px-4 py-2 text-sm font-medium border-t border-b border-gray-200">
                            Ending Soon
                        </button>
                        <button type="button" className="sort-btn px-4 py-2 text-sm font-medium border-t border-b border-gray-200">
                            Most Funded
                        </button>
                        <button type="button" className="sort-btn px-4 py-2 text-sm font-medium rounded-r-lg border border-gray-200">
                            Highest Return
                        </button>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className="text-gray-600 mr-2">View:</span>
                    <button className="view-toggle grid-icon active p-2 rounded-full hover:bg-gray-100 mr-1">
                        <i className="fas fa-th-large text-xl"></i>
                    </button>
                    <button className="view-toggle list-icon p-2 rounded-full hover:bg-gray-100">
                        <i className="fas fa-list text-xl"></i>
                    </button>
                </div>
            </div>

            {/* Project Count */}
            <div className="mb-6">
                <p className="text-gray-600">Showing <span className="font-medium">12</span> of <span className="font-medium">48</span> projects</p>
            </div>

            {/* Project Listings */}
            <div id="projectsContainer" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {projects.map((project) => (
                    <BrowseProjectCard
                        key={project.id}
                        {...project}
                    />
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center">
                <nav className="inline-flex rounded-md shadow">
                    <a href="#" className="px-4 py-2 rounded-l-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                        <i className="fas fa-chevron-left"></i>
                    </a>
                    <a href="#" className="px-4 py-2 border-t border-b border-gray-300 bg-white text-blue-600 font-medium">1</a>
                    <a href="#" className="px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50">2</a>
                    <a href="#" className="px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50">3</a>
                    <a href="#" className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-r-md hover:bg-gray-50">
                        <i className="fas fa-chevron-right"></i>
                    </a>
                </nav>
            </div>
        </main>
    );
};

export default BrowseProjectsPage;
