// src/pages/LandingPage.jsx
import { Link } from "react-router-dom";

const LandingPage = () => (
    <div className="min-h-screen flex flex-col bg-black text-white">

        {/* Full-Screen Hero */}
        <section
            className="h-screen flex flex-col justify-center items-center text-center
                 bg-black relative overflow-hidden"
        >
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-amber-900 opacity-70"></div>

            {/* Gold accent lines */}
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>
            <div className="absolute bottom-0 right-0 w-full h-1 bg-amber-400"></div>
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
            <div className="absolute top-0 right-0 w-1 h-full bg-amber-400"></div>

            <div className="z-10 px-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight max-w-3xl text-amber-400">
                    TraceLink
                </h1>
                <p className="text-2xl sm:text-3xl font-light text-white mt-2">by CuBIT Dynamics</p>
                <p className="mt-6 text-lg sm:text-xl max-w-xl text-white">
                    Premium vehicle tracking technology with military-grade precision and enterprise-level security.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                    <Link
                        to="/register"
                        className="px-8 py-3 bg-amber-500 text-black font-semibold rounded-lg shadow-lg
                         hover:bg-amber-600 transition"
                    >
                        Get Started
                    </Link>
                    <Link
                        to="/login"
                        className="px-8 py-3 border-2 border-amber-400 text-amber-400 rounded-lg
                         hover:bg-amber-400 hover:text-black transition"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-black text-white">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-amber-400 mb-16">Unparalleled Tracking Capabilities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
                    {[
                        {
                            title: "Precision GPS Tracking",
                            desc: "Industry-leading accuracy with updates every second for real-time monitoring.",
                        },
                        {
                            title: "Advanced Route Analytics",
                            desc: "Comprehensive history with intelligent analytics and exportable reports.",
                        },
                        {
                            title: "Multi-Vehicle Management",
                            desc: "Track and manage your entire fleet from a single intuitive dashboard.",
                        },
                        {
                            title: "Cross-Platform Access",
                            desc: "Seamless experience across mobile, tablet, and desktop devices.",
                        },
                        {
                            title: "Military-Grade Security",
                            desc: "End-to-end encryption and advanced authentication protocols.",
                        },
                        {
                            title: "Smart Notifications",
                            desc: "Customizable alerts for geofence breaches, speed violations, and more.",
                        },
                    ].map((feature) => (
                        <div
                            key={feature.title}
                            className="relative bg-black rounded-xl border border-amber-400 hover:shadow-lg hover:shadow-amber-900/50 transition overflow-hidden group"
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2 text-amber-400 group-hover:text-amber-300 transition">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-white">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Product Showcase */}
        <section className="py-16 px-6 bg-gradient-to-r from-black to-amber-950">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 mb-8 md:mb-0">
                        <h2 className="text-3xl font-bold text-amber-400 mb-4">The Most Advanced Vehicle Tracker</h2>
                        <ul className="space-y-3">
                            {[
                                "Universal compatibility with any vehicle type",
                                "Self-contained power source with 3-month battery life",
                                "Tamper detection with instant alerts",
                                "Weather-resistant rugged design",
                                "Simple installation with no technical expertise needed"
                            ].map((point, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-amber-400 mr-2">✓</span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                        <div className="w-64 h-64 bg-black border-2 border-amber-400 rounded-xl flex items-center justify-center">
                            <p className="text-amber-400 text-center">TraceLink Device</p>
                            {/* You could place an actual product image here */}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-black text-white text-center border-t border-amber-900">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-amber-400">
                Secure Your Fleet with TraceLink Today
            </h2>
            <p className="max-w-xl mx-auto mb-8 opacity-80">
                Join thousands of businesses and individuals who trust CuBIT Dynamics for their vehicle security and tracking needs.
            </p>
            <Link
                to="/register"
                className="inline-block px-10 py-4 bg-amber-500 text-black font-semibold rounded-lg shadow
                   hover:bg-amber-600 transition"
            >
                Create Account
            </Link>
        </section>

        {/* Footer */}
        <footer className="py-6 bg-black border-t border-amber-900">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p className="text-amber-400 font-bold">TraceLink by CuBIT Dynamics</p>
                        <p className="text-white text-sm">© {new Date().getFullYear()} All rights reserved.</p>
                    </div>
                    <div className="flex space-x-8">
                        <Link to="/privacy" className="text-white hover:text-amber-400 transition">Privacy</Link>
                        <Link to="/terms" className="text-white hover:text-amber-400 transition">Terms</Link>
                        <Link to="/contact" className="text-white hover:text-amber-400 transition">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    </div>
);

export default LandingPage;