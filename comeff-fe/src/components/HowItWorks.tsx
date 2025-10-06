import { Users, Zap, TrendingUp } from "lucide-react"

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-16 bg-muted">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4 text-emerald-800">How CommEfficient Works</h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto">
                        A transparent, blockchain-powered platform connecting investors with sustainable energy projects
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    <div className="bg-card p-6 rounded-lg shadow-card">
                        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-8 h-8 text-success-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-primary">Browse Verified Projects</h3>
                        <p className="text-muted-foreground font-semibold">
                            Discover vetted energy projects with detailed financial projections and verification documents.
                        </p>
                    </div>

                    <div className="bg-card p-6 rounded-lg shadow-card">
                        <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center mb-6 mx-auto">
                            <Zap className="w-8 h-8 text-success-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-primary">Invest with Confidence</h3>
                        <p className="text-muted-foreground font-semibold">
                            Fund projects directly through smart contracts. Your investment is secured on the blockchain with full transparency.
                        </p>
                    </div>

                    <div className="bg-card p-6 rounded-lg shadow-card">
                        <div className="w-16 h-16 rounded-full bg-gradient-secondary flex items-center justify-center mb-6 mx-auto">
                            <TrendingUp className="w-8 h-8 text-secondary-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-primary">Earn Returns</h3>
                        <p className="text-muted-foreground font-semibold">
                            Receive regular returns from energy cost savings. Track your portfolio and claim rewards directly from your dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
export default HowItWorks