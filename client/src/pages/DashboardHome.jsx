import ProgressTracker from "../components/ProgressTracker.jsx";
import DocumentChecklist from "./DocumentChecklist";

export default function DashboardHome() {
  return (
    <>
      <h2 className="welcome-text">Welcome back, Sarah! 👋</h2>
      <p className="sub-text">
        Track your study abroad journey and manage your applications
      </p>

      <div className="dashboard-grid">
        <ProgressTracker />
        <DocumentChecklist />
      </div>
    </>
  );
}
