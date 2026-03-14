import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

interface AttemptRow {
  user_id: number;
  email: string;
  full_name?: string;
  assigned: boolean;
  has_attempted: boolean;
  last_score: number | null;
  attempt_count: number;
  [key: string]: unknown;
}

function AdminExamAttemptsPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (user && !user.is_admin) {
      navigate("/exams");
      return;
    }
    const load = async () => {
      if (!id) return;
      try {
        const data = (await api.getExamAttempts(id, token)) as AttemptRow[];
        setRows(data);
      } catch (e) {
        setError((e as Error).message || "Failed to load attempts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, user, navigate]);

  if (!token) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Exam attempts</h1>
          <p className="page-subtitle">See who has attempted this exam and their scores.</p>
        </div>
        <Link className="btn btn-ghost" to="/exams">
          Back to exams
        </Link>
      </div>
      {loading && <p>Loading attempts...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Assigned</th>
                <th>Attempted</th>
                <th>Last score</th>
                <th>Attempt count</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user_id}>
                  <td>{r.user_id}</td>
                  <td>{r.email}</td>
                  <td>{r.full_name || "—"}</td>
                  <td>{r.assigned ? "Yes" : "No"}</td>
                  <td>{r.has_attempted ? "Yes" : "No"}</td>
                  <td>{r.last_score != null ? r.last_score : "—"}</td>
                  <td>{r.attempt_count}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "1rem" }}>
                    No users found for this exam.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminExamAttemptsPage;
