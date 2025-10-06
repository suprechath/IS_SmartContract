import Link from 'next/link';
import heroImage from '@/assets/smart_building.png';
import { Trees, StepForward, Shield, TrendingUp, Leaf } from "lucide-react";
const Hero = () => {
    return (
        <section className="relative overflow-hidden">
            <div className="absolute inset-0">
                <img
                    src={heroImage.src}
                    alt="Hero Background"
                    className="w-full h-full object-cover opacity-20"
                />
            </div>

            <div className="relative mx-auto container px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                <div className='text-center'>
                    <div className="mx-auto mb-6 inline-flex items-center rounded-full px-4 py-2 text-2xl sm:text-5xl font-bold text-emerald-800">
                        {/* bg-[hsl(158_64%_25%)]/10 */}
                        <Trees className="mr-4 h-16 w-16" />
                        Sustainable Infrastructure Financing
                    </div>
                    <h1 className="mx-auto text-4xl font-bold text-emerald-950 sm:text-6xl lg:text-7xl">
                        Invest in a{" "}
                        <span className="bg-[linear-gradient(135deg,_hsl(158,45%,45%),_hsl(158,64%,25%))] bg-clip-text text-transparent">
                            Sustainable Future
                        </span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-6xl text-lg text-emerald-950/90 sm:text-xl lg:text-2xl">
                        Invest in high-impact sustainable building projects with blockchain-powered transparency. <br />
                        Professional trust meets environmental impact through cutting-edge technology.
                    </p>
                    <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-60">
                        <button className="bg-emerald-300 hover:bg-emerald-500 text-emerald-950 font-semibold px-6 py-3 rounded-lg text-lg sm:text-xl transition-bounce shadow-md ">
                            <Link href="/projects" className='flex gap-2 item-center'>Explore Projects<StepForward /></Link>
                        </button>
                        <button className="bg-emerald-700 hover:bg-emerald-500 text-emerald-50 font-semibold px-6 py-3 rounded-lg text-lg sm:text-xl transition-bounce shadow-md ">
                            <Link href="/register">Become a Creator</Link>
                        </button>
                    </div>

                    <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:gap-16">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-300">
                                <Shield className="h-10 w-10 text-emerald-800" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-emerald-950">
                                Verified Projects
                            </h3>
                            <p className="mt-2 text-md text-emerald-950/80">
                                All projects undergo rigorous third-party verification and due diligence
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500">
                                <TrendingUp className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-emerald-950">
                                Competitive Returns
                            </h3>
                            <p className="mt-2 text-md text-emerald-950/80">
                                Earn attractive returns while supporting sustainable infrastructure
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-800">
                                <Leaf className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-emerald-950">
                                Environmental Impact
                            </h3>
                            <p className="mt-2 text-md text-emerald-950/80">
                                Measurable CO2 reduction and positive environmental outcomes
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    )
}
export default Hero