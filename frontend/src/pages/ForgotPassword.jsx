import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const ForgotPassword = () => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSent) return;

        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Something went wrong.");

            setMessage(data.message || "Reset email sent!");
            setError("");
            setIsSent(true);
        } catch (err) {
            setError(err.message);
            setMessage("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-12 px-4 min-h-screen bg-black">
            <div className="w-full max-w-lg">
                <div className="bg-black rounded-xl shadow-lg overflow-hidden border border-amber-400">
                    <div className="bg-black px-6 py-8 border-b border-amber-400">
                        <h2 className="text-2xl font-bold text-amber-400">Forgot Password</h2>
                        <p className="mt-2 text-sm text-white">Enter your email to receive reset instructions</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
                        {message && (
                            <div className="bg-black border-l-4 border-green-500 p-4 rounded">
                                <p className="text-sm text-green-400">{message}</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-black border-l-4 border-red-500 p-4 rounded">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                className="w-full px-3 py-2 border border-amber-400 rounded-md shadow-sm bg-black text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || isSent}
                                className={`w-full py-3 px-4 border border-transparent rounded-md ${isSent
                                    ? "bg-amber-600 text-black cursor-not-allowed"
                                    : loading
                                        ? "bg-amber-400 text-black cursor-not-allowed"
                                        : "bg-amber-500 text-black hover:bg-amber-600"
                                    }`}
                            >
                                {isSent ? "Email Sent" : loading ? "Sending..." : "Send Reset Instructions"}
                            </button>
                        </div>

                        {isSent && (
                            <div className="text-center mt-4 text-sm text-white">
                                Didn't receive an email? Check your spam folder or try again in a few minutes.
                            </div>
                        )}
                    </form>

                    <div className="px-6 py-4 bg-black border-t border-amber-400">
                        <p className="text-center text-sm text-white">
                            Remembered your password?{" "}
                            <Link to="/login" className="font-medium text-amber-400 hover:text-amber-300">
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;