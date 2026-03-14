import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function LeaderboardPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const load = async () => {
      try {
        const data = await api.getLeaderboard(id, token);
        setEntries(data);
      } catch (err) {
        setError(err.message || "Unable to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, navigate]);

  if (!token) return null;

  const chartData =
    entries.length > 0
      ? {
          labels: entries.map((e, index) => e.student_email || `User #${index + 1}`),
          datasets: [
            {
              label: "Score",
              data: entries.map((e) => e.score),
              backgroundColor: "rgba(59, 130, 246, 0.7)",
              borderRadius: 6,
            },
          ],
        }
      : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-subtitle">Top performers for this exam.</p>
        </div>
        <Link className="btn btn-ghost" to={`/exams/${id}`}>
          Back to exam
        </Link>
      </div>
      {loading && <p>Loading leaderboard...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && (
        <>
          {chartData && (
            <div className="card" style={{ marginBottom: "1rem" }}>
              <h2 className="card-title">Score distribution</h2>
              <p className="card-body-text">
                Visual overview of scores for this exam.
              </p>
              <div className="chart-wrapper leaderboard-chart">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    },
                  }}
                />
              </div>
            </div>
          )}
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student ID</th>
                  <th>Email</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, index) => (
                  <tr key={`${e.student_id}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{e.student_id}</td>
                    <td>{e.student_email || "Hidden"}</td>
                    <td>{e.score}</td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>
                      No submissions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default LeaderboardPage;




