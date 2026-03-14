import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

function ExamReviewPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const load = async () => {
      try {
        const data = await api.reviewExam(id, token);
        setReview(data);
      } catch (err) {
        setError(err.message || "Unable to load review");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, navigate]);

  if (!token) return null;

  const isCorrect = (q) => {
    const selected = new Set(q.selected_options || []);
    const correct = new Set(q.correct_options || []);
    return selected.size > 0 && selected.size === correct.size && [...selected].every((v) => correct.has(v));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Exam review</h1>
          <p className="page-subtitle">See your answers alongside the correct answers.</p>
        </div>
        <Link className="btn btn-ghost" to={`/exams/${id}`}>
          Back to exam
        </Link>
      </div>
      {loading && <p>Loading review...</p>}
      {error && <p className="form-error">{error}</p>}
      {review && !loading && !error && (
        <>
          <div className="result-banner">
            <h2>
              Score: {review.score} (Attempt #{review.attempt_number})
            </h2>
          </div>
          <div className="exam-form">
            {review.questions.map((q, index) => (
              <div key={q.question_id} className="question-card">
                <h2 className="question-title">
                  Q{index + 1}. {q.text}
                </h2>
                {q.question_image && (
                  <div style={{ marginBottom: "0.6rem" }}>
                    <img src={q.question_image} alt="Question" className="exam-question-image" />
                  </div>
                )}
                <div className="options-grid exam-options-grid">
                  {["A", "B", "C", "D"].map((key) => {
                    const label = q.options[key];
                    const image = q.option_images?.[key];
                    const selected = q.selected_options.includes(key);
                    const correct = q.correct_options.includes(key);
                    return (
                      <div
                        key={key}
                        className={`option-pill review-pill ${
                          correct ? "review-correct" : selected ? "review-selected" : ""
                        }`}
                      >
                        <span>
                          <strong>{key}.</strong> {label}
                        </span>
                        {image && (
                          <img
                            src={image}
                            alt={`Option ${key}`}
                            className="exam-option-image"
                          />
                        )}
                        <span style={{ marginLeft: "auto", fontSize: "0.8rem" }}>
                          {correct && selected && "Correct"}
                          {correct && !selected && "Should be selected"}
                          {!correct && selected && "Your choice"}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p
                  className="card-meta"
                  style={{ marginTop: "0.5rem", color: isCorrect(q) ? "#16a34a" : "#ef4444" }}
                >
                  {isCorrect(q) ? "You answered this question correctly." : "Your answer was not fully correct."}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ExamReviewPage;




