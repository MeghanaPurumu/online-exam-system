import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const RegisterPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
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
      await api.register({ email, full_name: fullName, password });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-subtitle">Register to start taking exams.</p>
      <form onSubmit={handleSubmit} className="form">
        <label className="form-label">
          Full name
          <input
            className="form-input"
            type="text"
            value={fullName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
            required
            placeholder="Alex Johnson"
          />
        </label>
        <label className="form-label">
          Email
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>
        <label className="form-label">
          Password
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            placeholder="Create a strong password"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="auth-footer-text">
        Already have an account? <a href="/login">Sign in</a>
      </p>
    </div>
  );
}

export default RegisterPage;




