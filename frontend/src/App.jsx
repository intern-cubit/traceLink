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
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/login"
                    element={<LoginPage />}
                />
                <Route
                    path="/register"
                    element={<RegistrationPage />}
                />
                <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                />
                <Route 
                    path="forgot-password"
                    element={<ForgotPassword />}
                />
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
                <Route
                    path="/live-location"
                    element={<LiveTrackerMap />}
                />
                <Route
                    path="/add-device"
                    element={<AddDevicePage />}
                />
                <Route
                    path="/admin/dashboard"
                    element={ <AdminDashboard /> }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
