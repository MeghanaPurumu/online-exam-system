<<<<<<< HEAD
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
=======
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="brand">
            <img src="/logo.png" alt="Xam Mate" className="brand-logo" />
            <span className="brand-text">Xam Mate</span>
          </Link>
          <nav className="nav-links">
            <NavLink to="/profile" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Profile
            </NavLink>
            <NavLink to="/exams" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Exams
            </NavLink>
            {user?.is_admin && (
              <>
                <NavLink
                  to="/admin/exams/new"
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                >
                  Create exam
                </NavLink>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                >
                  Users
                </NavLink>
              </>
            )}
          </nav>
          <div className="auth-actions">
            {token ? (
              <button className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                <Link className="btn btn-ghost" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="app-main">
        <div className="app-main-inner">{children}</div>
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Xam Mate</p>
      </footer>
    </div>
  );
}

export default Layout;
<<<<<<< HEAD
=======




>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
