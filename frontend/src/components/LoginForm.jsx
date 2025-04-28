import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../features/authSlice";
// import { initSocket } from "../socket";
import { useNavigate, Link } from "react-router-dom";

export default function LoginForm() {
    const [form, setForm] = useState({ identifier: "", password: "" });
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        dispatch(loginStart());

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            dispatch(loginSuccess({ token: data.token, user: data.user }));
            // initSocket(data.token);
            navigate("/dashboard");
        } catch (err) {
            dispatch(loginFailure());
            setError(err.message || "Login failed");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-black p-8 rounded-2xl shadow-lg space-y-6 border border-amber-400"
        >
            <h2 className="text-2xl font-bold text-center text-amber-400">Sign In</h2>
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}

            <div>
                <label className="block mb-1 font-medium text-sm text-white">
                    Email or Username
                </label>
                <input
                    name="identifier"
                    value={form.identifier}
                    onChange={handleChange}
                    placeholder="email or username"
                    required
                    className="w-full px-4 py-2 border border-amber-400 bg-black text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
            </div>

            <div>
                <label className="block mb-1 font-medium text-sm text-white">
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="password"
                    required
                    className="w-full px-4 py-2 border border-amber-400 bg-black text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <div className="text-right mt-2">
                    <Link
                        to="/forgot-password"
                        className="text-sm text-amber-400 hover:text-amber-300 hover:underline font-medium"
                    >
                        Forgot Password?
                    </Link>
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
                Login
            </button>

            <p className="text-center text-sm text-white">
                Don't have an account?{" "}
                <Link to="/register" className="text-amber-400 hover:text-amber-300 hover:underline font-medium">
                    Sign up
                </Link>
            </p>
        </form>
    );
}