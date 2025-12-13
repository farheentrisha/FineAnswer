import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProgressTracker from "../components/ProgressTracker";
import EligibilityCard from "../components/EligibilityCard";
import DocumentChecklist from "../components/DocumentChecklist";
import "../css/dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <h2 className="welcome-text">
          Welcome back, Sarah! 👋
        </h2>
        <p className="sub-text">
          Track your study abroad journey and manage your applications
        </p>

        <ProgressTracker />

        <div className="dashboard-grid">
          <EligibilityCard />
          <DocumentChecklist />
        </div>
      </div>
    </div>
  );
}
