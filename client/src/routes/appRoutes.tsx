import { Routes, Route} from "react-router-dom";
import RegisterPage from "../features/auth/pages/RegisterPage";
import LoginPage from "../features/auth/pages/LoginPage";
import { AllRooms } from "../features/room/pages/AllRooms";
import { UsersRooms } from "../features/room/pages/UsersRooms";
import { PermittedRooms } from "../features/room/pages/PermittedRooms";
import { RoomView } from "../features/room/pages/RoomView";

function AppRoutes() {
    return(
        <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* User Routes */}
        {/* Search Routes */}
        {/* Room Routes */}
        <Route path="/rooms" element={<AllRooms />} />
        <Route path="/rooms/mine" element={<UsersRooms />} />
        <Route path="/rooms/permitted" element={<PermittedRooms />} />
        <Route path="/rooms/:roomId" element={<RoomView />} />
        {/* Media Routes */}
        {/* Permission Routes */}
        </Routes>
    );
}

export default AppRoutes;