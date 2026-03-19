import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthContext";
import AppRoutes from "../routes/appRoutes";

function App() {
  return (
    <Router>
      <AuthProvider> 
        <AppRoutes /> 
      </AuthProvider>
    </Router>
  );
}

export default App;

