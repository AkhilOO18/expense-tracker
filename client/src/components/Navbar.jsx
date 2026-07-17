import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <div className="brand">
        Ledger<span className="dot">.</span>
      </div>
      <div className="navbar-right">
        <span>{user?.name}</span>
        <button className="btn btn-ghost" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  );
}
