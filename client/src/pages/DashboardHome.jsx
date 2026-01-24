import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressTracker from "../components/ProgressTracker.jsx";
import DocumentChecklist from "./DocumentChecklist";
import { AuthContext } from "./Provider/ContextProvider";

export default function DashboardHome() {
  const { user, getCurrentUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Always fetch fresh user data from backend (no localStorage)
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUserData(currentUser);
      } else {
        // No user found, redirect to login
        navigate("/login");
      }
    };

    fetchUser();
  }, [getCurrentUser, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Get user name (handle different possible field names)
  // Use user from context or userData state
  const userName = user?.name || userData?.name || user?.displayName || userData?.displayName || user?.email?.split("@")[0] || userData?.email?.split("@")[0] || "User";

  return (
    <>
      <h2 className="welcome-text">Welcome back, {userName}! 👋</h2>
      <p className="sub-text">
        Track your study abroad journey and manage your applications
      </p>

      {/* User Details Section */}
      {(userData || user) && (
        <div className="user-details-card" style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ marginBottom: "12px", color: "#0369a1" }}>Your Profile</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {(userData?.email || user?.email) && (
              <div>
                <strong style={{ color: "#64748b", fontSize: "0.9rem" }}>Email:</strong>
                <p style={{ margin: "4px 0 0 0", color: "#1e293b" }}>{userData?.email || user?.email}</p>
              </div>
            )}
            {(userData?.phone || user?.phone) && (
              <div>
                <strong style={{ color: "#64748b", fontSize: "0.9rem" }}>Phone:</strong>
                <p style={{ margin: "4px 0 0 0", color: "#1e293b" }}>{userData?.phone || user?.phone}</p>
              </div>
            )}
            {(userData?.picture || user?.picture) && (
              <div>
                <strong style={{ color: "#64748b", fontSize: "0.9rem" }}>Profile Picture:</strong>
                <div style={{ marginTop: "8px" }}>
                  <img 
                    src={userData?.picture || user?.picture} 
                    alt="Profile" 
                    style={{ 
                      width: "60px", 
                      height: "60px", 
                      borderRadius: "50%",
                      objectFit: "cover"
                    }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <ProgressTracker />
        <DocumentChecklist />
      </div>
    </>
  );
}
