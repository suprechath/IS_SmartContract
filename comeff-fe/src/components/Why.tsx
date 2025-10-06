import { CheckCircle2, Leaf } from "lucide-react"
import heroImage from '@/assets/smart_building.png';
import heroBuilding from "@/assets/hero-building.jpg";


const Why = () => {
    return (
        <section id="about" className="mb-16">
            <div className="container mx-auto px-4 text-left">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-center">Why Choose CommEfficient?</h2>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <CheckCircle2 className="w-6 h-6 text-success shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold mb-1">Blockchain Transparency</h3>
                                    <p className="text-muted-foreground">Every transaction is recorded on-chain, ensuring complete transparency and trust.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 className="w-6 h-6 text-success shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold mb-1">Verified Projects</h3>
                                    <p className="text-muted-foreground">All projects undergo rigorous vetting by our team of energy efficiency experts.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 className="w-6 h-6 text-success shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold mb-1">Sustainable Impact</h3>
                                    <p className="text-muted-foreground">Invest in projects that reduce carbon emissions and promote environmental sustainability.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 className="w-6 h-6 text-success shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold mb-1">Attractive Returns</h3>
                                    <p className="text-muted-foreground">Earn competitive returns from energy cost savings with clear ROI projections.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-success flex items-center justify-center">
                            <img src={heroBuilding.src} alt="Hero Building" className="object-cover w-full h-full" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
export default Why