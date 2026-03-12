import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function ProfilePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const load = async () => {
      try {
        const data = await api.getProfile(token);
        setStats(data);
      } catch (err) {
        setError(err.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, navigate]);

  if (!token) return null;

  const completionData =
    stats && stats.total_exams_attempted > 0
      ? {
          labels: ["Completed exams", "Remaining"],
          datasets: [
            {
              data: [stats.total_exams_attempted, Math.max(0, 10 - stats.total_exams_attempted)],
              backgroundColor: ["rgba(59, 130, 246, 0.9)", "rgba(148, 163, 184, 0.4)"],
              borderWidth: 0,
            },
          ],
        }
      : null;

  const performanceTrendData =
    stats && stats.days_active > 0
      ? {
          labels: Array.from({ length: stats.days_active }, (_, i) => `Day ${i + 1}`),
          datasets: [
            {
              label: "Estimated average %",
              data: Array.from({ length: stats.days_active }, () => stats.average_percentage),
              borderColor: "rgba(59, 130, 246, 1)",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              fill: true,
              tension: 0.35,
            },
          ],
        }
      : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Your profile</h1>
          <p className="page-subtitle">See your overall performance and activity.</p>
        </div>
      </div>
      {loading && <p>Loading profile...</p>}
      {error && <p className="form-error">{error}</p>}
      {stats && !loading && !error && (
        <>
          <div className="grid">
            <div className="card">
              <h2 className="card-title">Total exams attempted</h2>
              <p className="card-metric">{stats.total_exams_attempted}</p>
            </div>
            <div className="card">
              <h2 className="card-title">Total score</h2>
              <p className="card-metric">{stats.total_score}</p>
            </div>
            <div className="card">
              <h2 className="card-title">Average percentage</h2>
              <p className="card-metric">{stats.average_percentage}%</p>
            </div>
            <div className="card">
              <h2 className="card-title">Active days</h2>
              <p className="card-metric">{stats.days_active}</p>
            </div>
          </div>
          <div className="grid" style={{ marginTop: "1.3rem" }}>
            {completionData && (
              <div className="card">
                <h2 className="card-title">Exam completion overview</h2>
                <p className="card-body-text">
                  See how many exams you have completed so far.
                </p>
                <div className="chart-wrapper">
                  <Doughnut
                    data={completionData}
                    options={{
                      plugins: {
                        legend: { position: "bottom" },
                      },
                    }}
                  />
                </div>
              </div>
            )}
            {performanceTrendData && (
              <div className="card">
                <h2 className="card-title">Performance trend</h2>
                <p className="card-body-text">
                  High-level view of your average percentage over active days.
                </p>
                <div className="chart-wrapper">
                  <Line
                    data={performanceTrendData}
                    options={{
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        y: { beginAtZero: true, max: 100 },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ProfilePage;

