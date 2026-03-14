import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const LoginPage: React.FC = () => {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  if (token) {
    return <Navigate to="/exams" replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.login(email, password);
      login(res.access_token);
      navigate("/exams");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-subtitle">Sign in to access your exams.</p>
      <form onSubmit={handleSubmit} className="form" autoComplete="off">
        <input type="text" style={{ display: 'none' }} autoComplete="username" />
        <label className="form-label">
          Email
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <input type="password" style={{ display: 'none' }} autoComplete="current-password" />
        <label className="form-label">
          Password
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="auth-footer-text">
        Don&apos;t have an account? <a href="/register">Create one</a>
      </p>
    </div>
  );
}

export default LoginPage;




