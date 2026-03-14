<<<<<<< HEAD
import { useState } from "react";
=======
import React, { useState } from "react";
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

<<<<<<< HEAD
function RegisterPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
=======
const RegisterPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
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
      await api.register({ email, full_name: fullName, password });
      navigate("/login");
    } catch (err) {
<<<<<<< HEAD
      setError((err as Error).message || "Registration failed");
=======
      setError(err.message || "Registration failed");
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
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
<<<<<<< HEAD
            onChange={(e) => setFullName(e.target.value)}
=======
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
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
<<<<<<< HEAD
            onChange={(e) => setEmail(e.target.value)}
=======
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
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
<<<<<<< HEAD
            onChange={(e) => setPassword(e.target.value)}
=======
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
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
<<<<<<< HEAD
=======




>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
