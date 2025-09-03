import React from 'react';
import FAQItem from '@/components/FAQItem';

const FAQPage = () => {
    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-10 text-center">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
                Find answers to common questions about Resync, investing, blockchain, and more. If you can&apos;t find your answer here, feel free to <a href="#contact" className="text-green-600 hover:underline">contact us</a>.
            </p>

            <div id="faq-list">
                <h2 className="text-2xl font-semibold text-green-700 mt-10 mb-6 pb-2 border-b border-gray-300">General Questions</h2>
                <FAQItem question="What is Resync?">
                    <p>Resync is a platform that enables individuals and institutions to invest in real-world energy efficiency projects using blockchain technology. We connect building owners looking to upgrade their energy systems with investors seeking to fund these green initiatives and earn returns from the resulting energy savings.</p>
                </FAQItem>

                <FAQItem question="How does Resync make money?">
                    <p>Resync typically earns revenue through a combination of:</p>
                    <ul>
                        <li>A platform fee on successfully funded projects.</li>
                        <li>A percentage of the project-specific RET tokens allocated to Resync for platform operations and development (as outlined in each project&apos;s tokenomics).</li>
                        <li>Potentially, a small operational fee deducted from the verified monetary savings before dividend distribution (this will be clearly stated in project details).</li>
                    </ul>
                    <p>Our goal is to align our success with the success of the projects and our investors.</p>
                </FAQItem>

                <FAQItem question="Who can invest on Resync?">
                    <p>Resync aims to be accessible to a global audience. However, investors must comply with the laws and regulations of their respective jurisdictions regarding cryptocurrency investments and participation in such platforms. KYC (Know Your Customer) procedures may be required, especially for larger investment amounts, to adhere to AML (Anti-Money Laundering) regulations.</p>
                </FAQItem>

                <h2 className="text-2xl font-semibold text-green-700 mt-10 mb-6 pb-2 border-b border-gray-300">Investing</h2>
                <FAQItem question="How do I invest in a project?">
                    <p>To invest in a project on Resync:</p>
                    <ol>
                        <li><strong>Connect Your Wallet:</strong> Use a compatible Web3 wallet (like MetaMask) to connect to the Resync platform.</li>
                        <li><strong>Browse Projects:</strong> Explore available projects and review their details (overview, financials, expected returns).</li>
                        <li><strong>Complete KYC (if required):</strong> Follow the instructions for identity verification.</li>
                        <li><strong>Choose Investment Amount:</strong> Decide how much you want to invest in your chosen project (ensure you have sufficient stablecoins like USDC or USDT in your wallet).</li>
                        <li><strong>Confirm Transaction:</strong> Approve the investment transaction in your wallet. This will send your stablecoins to the project&apos;s smart contract and mint project-specific RET tokens to your wallet.</li>
                    </ol>
                </FAQItem>
            </div>
        </main>
    )
}

export default FAQPage;
