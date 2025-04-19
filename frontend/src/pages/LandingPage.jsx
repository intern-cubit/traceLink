// src/pages/LandingPage.jsx
import { Link } from "react-router-dom";

const LandingPage = () => (
    <div className="min-h-screen flex flex-col">

        {/* Full‑Screen Hero */}
        <section
            className="h-screen flex flex-col justify-center items-center text-center text-white
                 bg-gradient-to-br from-[#6B4F4F] via-[#A57C55] to-[#2E1A47] bg-cover bg-no-repeat"
        >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight max-w-3xl">
                Real‑Time Vehicle Tracking, Redefined
            </h1>
            <p className="mt-6 text-lg sm:text-xl max-w-xl opacity-90">
                Monitor your fleet effortlessly with live GPS, intelligent histories, and airtight security.
            </p>
            <div className="mt-8 flex space-x-4">
                <Link
                    to="/register"
                    className="px-8 py-3 bg-white text-[#2E1A47] font-semibold rounded-lg shadow-lg
                     hover:bg-gray-100 transition"
                >
                    Get Started
                </Link>
                <Link
                    to="/login"
                    className="px-8 py-3 border-2 border-white text-white rounded-lg
                     hover:bg-white hover:text-[#2E1A47] transition"
                >
                    Login
                </Link>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-gray-50 text-gray-800">
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
                {[
                    {
                        title: "Live GPS Tracking",
                        desc: "Sub‑second location updates for unparalleled accuracy.",
                    },
                    {
                        title: "Travel History",
                        desc: "Filter and review past routes with date‑range controls.",
                    },
                    {
                        title: "Multi‑Device Support",
                        desc: "Easily switch between all your vehicles in one dashboard.",
                    },
                    {
                        title: "Mobile‑Optimized",
                        desc: "Full functionality on phone, tablet, and desktop screens.",
                    },
                    {
                        title: "Data Encryption",
                        desc: "Bank‑grade security to keep your fleet information private.",
                    },
                    {
                        title: "Custom Alerts",
                        desc: "Receive notifications for geofence, inactivity, or speed thresholds.",
                    },
                ].map((feature) => (
                    <div
                        key={feature.title}
                        className="relative bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
                    >
                        {/* Gradient Accent Bar */}
                        <div className="absolute top-0 left-0 w-full h-1
                            bg-gradient-to-r from-[#6B4F4F] via-[#A57C55] to-[#2E1A47]" />
                        <div className="p-6 mt-1">
                            <h3 className="text-xl font-semibold mb-2 text-[#2E1A47]">
                                {feature.title}
                            </h3>
                            <p className="text-sm opacity-90">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-[#2E1A47] to-[#6B4F4F] text-white text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Elevate Your Fleet Management?
            </h2>
            <Link
                to="/register"
                className="inline-block px-10 py-4 bg-white text-[#2E1A47] font-semibold rounded-lg shadow
                   hover:bg-gray-100 transition"
            >
                Create Account
            </Link>
        </section>

        {/* Footer */}
        <footer className="py-6 text-center text-white
                       bg-gradient-to-br from-[#6B4F4F] via-[#A57C55] to-[#2E1A47]">
            <p>© {new Date().getFullYear()} TrackMate. All rights reserved.</p>
        </footer>
    </div>
);

export default LandingPage;
