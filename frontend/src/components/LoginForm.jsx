import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../features/authSlice";
// import { initSocket } from "../socket";
import { useNavigate } from "react-router-dom";

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
            className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-6"
        >
            <h2 className="text-2xl font-bold text-center text-gray-800">Sign In</h2>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}

            <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">
                    Email or Username
                </label>
                <input
                    name="identifier"
                    value={form.identifier}
                    onChange={handleChange}
                    placeholder="email or username"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="password"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
                Login
            </button>

            <p className="text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <a href="/register" className="text-blue-600 hover:underline font-medium">
                    Sign up
                </a>
            </p>
        </form>
    );
}
