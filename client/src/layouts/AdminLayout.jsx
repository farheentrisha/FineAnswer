import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import "../styles/admin.css";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Topbar />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
