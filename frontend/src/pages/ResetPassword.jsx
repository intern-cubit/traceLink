import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const navigate = useNavigate();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong.");
            }

            setMessage(data.message || "Password reset successfully!");
            setError("");

            // Redirect to login after a brief delay
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.message || "Error occurred");
            setMessage("");
        }
    };

    return (
        <div className="flex justify-center items-center py-12 px-4 min-h-screen bg-black">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-black p-8 rounded-2xl shadow-lg space-y-6 mx-auto border border-amber-400"
            >
                <h2 className="text-2xl font-bold text-center text-amber-400">
                    Reset Password
                </h2>

                {message && (
                    <div className="text-green-400 text-sm text-center">{message}</div>
                )}
                {error && (
                    <div className="text-red-400 text-sm text-center">{error}</div>
                )}

                {/* New Password Field */}
                <div className="relative">
                    <label className="block mb-1 font-medium text-sm text-white">
                        New Password
                    </label>
                    <input
                        type={newPasswordVisible ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        required
                        className="w-full px-4 py-2 border border-amber-400 bg-black text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                    />
                    <div
                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-amber-400"
                        onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                        style={{ top: '30px' }}
                    >
                        {newPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                </div>

                {/* Confirm Password Field */}
                <div className="relative">
                    <label className="block mb-1 font-medium text-sm text-white">
                        Confirm Password
                    </label>
                    <input
                        type={confirmPasswordVisible ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        required
                        className="w-full px-4 py-2 border border-amber-400 bg-black text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                    />
                    <div
                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-amber-400"
                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                        style={{ top: '30px' }}
                    >
                        {confirmPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                    Reset Password
                </button>

                <p className="text-center text-sm text-white">
                    Remembered your password?{" "}
                    <Link to="/login" className="text-amber-400 hover:text-amber-300 hover:underline font-medium">
                        Back to Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default ResetPassword;