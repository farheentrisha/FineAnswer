export default function Topbar() {
  return (
    <header className="admin-topbar">
      <div>
        <h2>Students</h2>
        <p>Manage and monitor your platform</p>
      </div>

      <div className="topbar-right">
        <input placeholder="Search anything..." />
        <div className="admin-user">
          <div className="avatar">AU</div>
          <div>
            <strong>Admin User</strong>
            <small>Administrator</small>
          </div>
        </div>
      </div>
    </header>
  );
}
