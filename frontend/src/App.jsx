import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AddDevicePage from "./pages/AddDevicePage";
import RegistrationPage from "./pages/RegistrationPage";
import LiveTrackerMap from "./components/LiveTrackerMap";
import { useSelector } from "react-redux";
import AdminDashboard from "./pages/AdminDashboard";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
    const isAuth = useSelector((s) => s.auth.isAuthenticated);
    const isAdmin = useSelector((s) => s.auth.isAdmin);
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={isAuth ? <Navigate to={"/dashboard"} /> : <LandingPage />} />
                <Route
                    path="/login"
                    element={!isAuth ? <LoginPage /> : isAdmin ? <Navigate to={"/admin/dashboard"} /> : <Navigate to={"/dashboard"} />}
                />
                <Route
                    path="/register"
                    element={!isAuth ? <RegistrationPage /> : isAdmin ? <Navigate to={"/admin/dashboard"} /> : <Navigate to={"/dashboard"} />}
                />
                <Route
                    path="/reset-password/:token"
                    element={!isAuth ? <ResetPassword /> : isAdmin ? <Navigate to={"/admin/dashboard"} /> : <Navigate to={"/dashboard"} />}
                />
                <Route
                    path="forgot-password"
                    element={!isAuth ? <ForgotPassword /> : isAdmin ? <Navigate to={"/admin/dashboard"} /> : <Navigate to={"/dashboard"} />}
                />
                <Route
                    path="/dashboard"
                    element={!isAuth ? <Navigate to={"/login"} /> : isAdmin ? <Navigate to={"/admin/dashboard"} /> : <Dashboard />}
                />
                <Route
                    path="/add-device"
                    element={!isAuth ? <Navigate to={"/login"} /> : isAdmin ? <Navigate to={"/admin/dashboard"} /> : <AddDevicePage />}
                />
                <Route
                    path="/admin/dashboard"
                    element={!isAuth ? <Navigate to={"/login"} /> : isAdmin ? <AdminDashboard /> : <Navigate to={"/dashboard"} />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
