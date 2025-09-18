import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./welcome/LandingPage";
import Signup from "./authentication/Signup";
import Login from "./authentication/Login";
import Dashboard from "./features/Dashboard";
import CommunityHub from "./features/CommunityHub";
import Quote from "./features/Quote";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/community-hub" 
          element={
            <ProtectedRoute>
              <CommunityHub />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quote" 
          element={
            <ProtectedRoute>
              <Quote />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;