import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";
import FAQItem from "@/components/FAQItem";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="gradient-bg text-white">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Tokenizing Energy Efficiency in Real Estate
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Invest in verified energy savings from commercial buildings and
              earn sustainable returns powered by blockchain technology.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="#projects"
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Browse Projects
              </a>
              <a
                href="#learn"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                $12.8M+
              </div>
              <div className="text-gray-600">Total Value Tokenized</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                8.2%
              </div>
              <div className="text-gray-600">Average Annual Yield</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                42
              </div>
              <div className="text-gray-600">Projects Funded</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-yellow-600 mb-2">
                1,250+
              </div>
              <div className="text-gray-600">Investors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">
              Featured Projects
            </h2>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <i className="fas fa-filter mr-2"></i> Filter
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <i className="fas fa-sort mr-2"></i> Sort
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
              View All Projects
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="learn" className="py-16 bg-white">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="text-center p-6 rounded-xl bg-gray-50">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-blue-600 text-2xl font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Building Owners Apply</h3>
                    <p className="text-gray-600 mb-4">Property owners submit their energy efficiency projects for evaluation by our team of experts.</p>
                    <div className="text-sm text-blue-600 font-medium">
                        <a href="#" className="inline-flex items-center">
                            Learn more <i className="fas fa-chevron-right ml-1 text-xs"></i>
                        </a>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="text-center p-6 rounded-xl bg-gray-50">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-blue-600 text-2xl font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Project Tokenization</h3>
                    <p className="text-gray-600 mb-4">Approved projects are tokenized as RET (Real Estate Energy Tokens) representing future energy savings.</p>
                    <div className="text-sm text-blue-600 font-medium">
                        <a href="#" className="inline-flex items-center">
                            Learn more <i className="fas fa-chevron-right ml-1 text-xs"></i>
                        </a>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="text-center p-6 rounded-xl bg-gray-50">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-blue-600 text-2xl font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Investors Participate</h3>
                    <p className="text-gray-600 mb-4">Investors purchase RET tokens and receive dividends from verified energy savings each month.</p>
                    <div className="text-sm text-blue-600 font-medium">
                        <a href="#" className="inline-flex items-center">
                            Learn more <i className="fas fa-chevron-right ml-1 text-xs"></i>
                        </a>
                    </div>
                </div>
            </div>

            <div className="mt-16">
                <div className="bg-gray-50 rounded-xl p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Blockchain-Powered Transparency</h3>
                            <p className="text-gray-600 mb-6">All transactions, ownership records, and dividend distributions are recorded on the blockchain for complete transparency and auditability.</p>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Smart Contracts</span>
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Immutable Records</span>
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Transparent Dividends</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-sm font-medium text-gray-500">Transaction History</div>
                                <a href="#" className="text-sm text-blue-600 font-medium">View on Explorer</a>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                            <i className="fas fa-check-circle text-green-500"></i>
                                        </div>
                                        <div>
                                            <div className="font-medium">Dividend Payment</div>
                                            <div className="text-xs text-gray-500">5 mins ago</div>
                                        </div>
                                    </div>
                                    <div className="text-green-600 font-medium">+$42.50</div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <i className="fas fa-exchange-alt text-blue-500"></i>
                                        </div>
                                        <div>
                                            <div className="font-medium">Token Purchase</div>
                                            <div className="text-xs text-gray-500">2 days ago</div>
                                        </div>
                                    </div>
                                    <div className="text-blue-600 font-medium">500 RET</div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                            <i className="fas fa-user-plus text-purple-500"></i>
                                        </div>
                                        <div>
                                            <div className="font-medium">KYC Approved</div>
                                            <div className="text-xs text-gray-500">1 week ago</div>
                                        </div>
                                    </div>
                                    <div className="text-purple-600 font-medium">Verified</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <FAQItem question="What are RET tokens?">
                <p className="mb-4">RET (Real Estate Energy Tokens) are blockchain-based tokens that represent a share in the verified energy savings from a specific building efficiency project. When you purchase RET tokens, you&apos;re entitled to receive dividends from the actual energy cost savings achieved by the project.</p>
                <p>Each RET token is backed by real-world energy savings that are independently verified and recorded on the blockchain for transparency.</p>
              </FAQItem>
              <FAQItem question="How are the energy savings verified?">
                <p className="mb-4">Energy savings are verified through a multi-step process:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Baseline energy consumption is established before the efficiency measures are implemented.</li>
                  <li>After implementation, the building&apos;s energy management system continuously monitors actual consumption.</li>
                  <li>An independent third-party auditor reviews the data and verifies the savings.</li>
                  <li>The verified savings amount is recorded on the blockchain via smart contracts.</li>
                </ol>
              </FAQItem>
              <FAQItem question="What is the minimum investment amount?">
                <p>The minimum investment amount varies by project but typically starts at $250. Each project listing clearly states its minimum investment requirement. Some projects may have higher minimums based on regulatory requirements or project specifics.</p>
              </FAQItem>
              <FAQItem question="How often are dividends paid out?">
                <p>Dividends are typically paid monthly, corresponding to the verified energy savings achieved in the previous month. The exact payment schedule is specified in each project&apos;s documentation. All dividend distributions are automated through smart contracts and recorded on the blockchain.</p>
              </FAQItem>
              <FAQItem question="Can I sell my RET tokens before the project term ends?">
                <p className="mb-4">Yes, RET tokens are transferable and can be sold on secondary markets. However, there are a few important considerations:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The platform may provide a secondary market for token trading.</li>
                  <li>Token value may fluctuate based on project performance and market demand.</li>
                  <li>Some projects may have lock-up periods specified in their terms.</li>
                  <li>Always review the specific project documentation for transfer restrictions.</li>
                </ul>
              </FAQItem>
            </div>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">Still have questions? Our team is here to help.</p>
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-bg text-white">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Invest in Sustainable Returns?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">Join the future of real estate investing by funding verified energy efficiency projects with blockchain-powered transparency.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button id="connect-wallet-cta" className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                    Connect Wallet to Get Started
                </button>
                <a href="#learn" className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors">
                    Learn More
                </a>
            </div>
        </div>
      </section>
    </main>
  );
}
