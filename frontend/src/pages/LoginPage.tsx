<<<<<<< HEAD
import { useState } from "react";
=======
import React, { useState } from "react";
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

<<<<<<< HEAD
function LoginPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
=======
const LoginPage: React.FC = () => {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a

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
<<<<<<< HEAD
      setError((err as Error).message || "Login failed");
=======
      setError(err.message || "Login failed");
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-subtitle">Sign in to access your exams.</p>
<<<<<<< HEAD
      <form onSubmit={handleSubmit} className="form">
=======
      <form onSubmit={handleSubmit} className="form" autoComplete="off">
        <input type="text" style={{ display: 'none' }} autoComplete="username" />
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
        <label className="form-label">
          Email
          <input
            className="form-input"
            type="email"
            value={email}
<<<<<<< HEAD
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>
=======
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <input type="password" style={{ display: 'none' }} autoComplete="current-password" />
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
        <label className="form-label">
          Password
          <input
            className="form-input"
            type="password"
            value={password}
<<<<<<< HEAD
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
=======
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
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
<<<<<<< HEAD
=======




>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
