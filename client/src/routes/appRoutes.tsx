import { Routes, Route} from "react-router-dom";
import RegisterPage from "../features/auth/pages/RegisterPage";
import LoginPage from "../features/auth/pages/LoginPage";

function AppRoutes() {
    return(
        <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* User Routes */}
        {/* Search Routes */}
        {/* Room Routes */}
        {/* Media Routes */}
        {/* Permission Routes */}
        </Routes>
    );
}

export default AppRoutes;