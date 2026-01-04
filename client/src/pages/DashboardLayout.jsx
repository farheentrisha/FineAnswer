import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "../css/dashboard.css";

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Outlet />
      </div>
    </div>
  );
}
