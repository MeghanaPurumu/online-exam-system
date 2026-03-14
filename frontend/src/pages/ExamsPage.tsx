import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const ExamsPage: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [adminExams, setAdminExams] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        if (user?.is_admin) {
          const data = await api.listExams(token);
          setAdminExams(data);
          setExams([]);
        } else {
          const data = await api.listExamStatus(token);
          setExams(data);
          setAdminExams([]);
        }
      } catch (err) {
        setError(err.message || "Unable to load exams");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, user, navigate]);

  if (!token) return null;

  const completed = exams.filter((e) => e.status === "completed");
  const upcoming = exams.filter((e) => e.status === "upcoming");
  const overdue = exams.filter((e) => e.status === "overdue");

  const renderAdminExamCard = (exam) => {
    const start = exam.start_at ? new Date(exam.start_at) : null;
    const end = exam.end_at ? new Date(exam.end_at) : null;

    const range =
      start && end
        ? `${start.toLocaleString()} – ${end.toLocaleString()}`
        : start
        ? `Starts at ${start.toLocaleString()}`
        : end
        ? `Ends at ${end.toLocaleString()}`
        : "No schedule";

    return (
      <div key={exam.id} className="card">
        <h2 className="card-title">{exam.title}</h2>
        <p className="card-body-text">
          {exam.description || "No description provided."}
        </p>

        <p className="badge">
          {exam.allow_multiple_attempts
            ? "Multiple attempts allowed"
            : "Single attempt only"}
        </p>

        <p className="card-meta">{range}</p>

        <div className="card-actions">
          <Link className="btn btn-primary" to={`/exams/${exam.id}`}>
            Open
          </Link>

          <Link className="btn btn-ghost" to={`/admin/exams/${exam.id}/edit`}>
            Edit
          </Link>

          <Link
            className="btn btn-ghost"
            to={`/admin/exams/${exam.id}/attempts`}
          >
            Attempts
          </Link>

          <Link
            className="btn btn-ghost"
            to={`/exams/${exam.id}/leaderboard`}
          >
            Leaderboard
          </Link>
        </div>
      </div>
    );
  };

  const renderExamCard = (exam, type) => {
    const start = exam.start_at ? new Date(exam.start_at) : null;
    const end = exam.end_at ? new Date(exam.end_at) : null;

    const range =
      start && end
        ? `${start.toLocaleString()} – ${end.toLocaleString()}`
        : start
        ? `Starts at ${start.toLocaleString()}`
        : end
        ? `Ends at ${end.toLocaleString()}`
        : "No schedule";

    return (
      <div key={exam.id} className="card">
        <h2 className="card-title">{exam.title}</h2>

        <p className="card-body-text">
          {exam.description || "No description provided."}
        </p>

        <p className="badge">
          {exam.allow_multiple_attempts
            ? "Multiple attempts allowed"
            : "Single attempt only"}
        </p>

        <p className="card-meta">{range}</p>

        {type === "completed" && exam.last_score != null && (
          <p className="card-meta">Last score: {exam.last_score}</p>
        )}

        <div className="card-actions">
          {type !== "overdue" &&
            !(type === "completed" && !exam.allow_multiple_attempts) && (
              <Link className="btn btn-primary" to={`/exams/${exam.id}`}>
                {type === "completed" ? "Retake / review" : "Start exam"}
              </Link>
            )}

          {type === "completed" && !exam.allow_multiple_attempts && (
            <button className="btn btn-primary" type="button" disabled>
              Single-attempt exam
            </button>
          )}

          {type === "overdue" && (
            <button className="btn btn-primary" type="button" disabled>
              Exam overdue
            </button>
          )}

          {type === "completed" && (
            <>
              <Link
                className="btn btn-ghost"
                to={`/exams/${exam.id}/leaderboard`}
              >
                View leaderboard
              </Link>

              <Link className="btn btn-ghost" to={`/exams/${exam.id}/review`}>
                Review answers
              </Link>
            </>
          )}

          {user?.is_admin && (
            <>
              <Link
                className="btn btn-ghost"
                to={`/admin/exams/${exam.id}/edit`}
              >
                Edit
              </Link>

              <Link
                className="btn btn-ghost"
                to={`/admin/exams/${exam.id}/attempts`}
              >
                Attempts
              </Link>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Available exams</h1>
          <p className="page-subtitle">
            Browse and attempt exams assigned to you.
          </p>
        </div>
      </div>

      {loading && <p>Loading exams...</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && (
        <>
          {user?.is_admin && (
            <section>
              <h2 className="section-title">All exams (admin)</h2>

              <p className="section-subtitle">
                View, edit, and review attempts for any exam.
              </p>

              <div className="grid">
                {adminExams.map((exam) => renderAdminExamCard(exam))}
                {adminExams.length === 0 && <p>No exams found.</p>}
              </div>
            </section>
          )}

          {!user?.is_admin && (
            <>
              <section>
                <h2 className="section-title">Completed exams</h2>

                <p className="section-subtitle">
                  Exams you have already attempted. Click to view the
                  leaderboard.
                </p>

                <div className="grid">
                  {completed.map((exam) =>
                    renderExamCard(exam, "completed")
                  )}
                  {completed.length === 0 && (
                    <p>No completed exams yet.</p>
                  )}
                </div>
              </section>

              <section style={{ marginTop: "2rem" }}>
                <h2 className="section-title">Upcoming exams</h2>

                <p className="section-subtitle">
                  Exams that are available to attempt.
                </p>

                <div className="grid">
                  {upcoming.map((exam) =>
                    renderExamCard(exam, "upcoming")
                  )}
                  {upcoming.length === 0 && (
                    <p>No upcoming exams.</p>
                  )}
                </div>
              </section>

              <section style={{ marginTop: "2rem" }}>
                <h2 className="section-title">Overdue exams</h2>

                <p className="section-subtitle">
                  Exams whose end time has passed.
                </p>

                <div className="grid">
                  {overdue.map((exam) =>
                    renderExamCard(exam, "overdue")
                  )}
                  {overdue.length === 0 && (
                    <p>No overdue exams.</p>
                  )}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ExamsPage;



