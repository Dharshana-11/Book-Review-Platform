import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("access_token");

  // Retrieve user object from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const profileComplete = user?.profile_complete === true; // Ensure correct access

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login"); 
    } else if (!profileComplete) {
      navigate("/profile/setup");
    }
  }, [isAuthenticated, profileComplete, navigate]);

  return isAuthenticated && profileComplete ? children : null;
};

export default ProtectedRoute;
