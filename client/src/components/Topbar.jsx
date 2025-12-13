export default function Topbar() {
  return (
    <div className="topbar">
      <input placeholder="Search universities, programs, documents..." />
      <div className="topbar-right">
        <span className="notification">🔔</span>
        <div className="user">
          <span className="avatar">SJ</span>
          <span>Sarah Johnson</span>
        </div>
      </div>
    </div>
  );
}
