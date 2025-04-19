import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
// import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
// import AddDevicePage from "./pages/AddDevicePage";
import RegistrationPage from "./pages/RegistrationPage";
import Dashboard2 from "./pages/Dashboard2";
// import { useSelector } from "react-redux";

function App() {
    // const isAuth = useSelector((s) => s.auth.isAuthenticated);
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
                    path="/dashboard"
                    element={<Dashboard />}
                />
                <Route
                    path="/dashboard2"
                    element={<Dashboard2 />}
                />
                {/* <Route
                    path="/add-device"
                    element={isAuth ? <AddDevicePage /> : <Navigate to="/login" />}
                /> */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
