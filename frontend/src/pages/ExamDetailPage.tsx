import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

interface Question {
  id: number;
  text: string;
  is_multi?: boolean;
  question_image?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  option_a_image?: string;
  option_b_image?: string;
  option_c_image?: string;
  option_d_image?: string;
  [key: string]: unknown;
}

interface Exam {
  id: number;
  title: string;
  allow_multiple_attempts?: boolean;
  attempt_number?: number;
  questions: Question[];
  [key: string]: unknown;
}

interface SubmissionResult {
  score: number;
  attempt_number: number;
  [key: string]: unknown;
}

function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SubmissionResult | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const load = async () => {
      if (!id) return;
      try {
        const data = (await api.takeExam(id, token)) as Exam;
        setExam(data);
        setAnswers({});
        setResult(null);
      } catch (err) {
        setError((err as Error).message || "Unable to load exam");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, navigate]);

  if (!token) return null;

  const handleChange = (questionId: number, value: string, multi = false) => {
    if (multi) {
      setAnswers((prev) => {
        const current = (prev[questionId] || []) as string[];
        const exists = current.includes(value);
        const next = exists ? current.filter((v) => v !== value) : [...current, value];
        return { ...prev, [questionId]: next };
      });
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!exam || !id) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        answers: exam.questions
          .filter((q) => answers[q.id] && (Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length > 0 : true))
          .map((q) => {
            const value = answers[q.id];
            return {
              question_id: q.id,
              selected_option: Array.isArray(value) ? value.join(",") : value,
            };
          }),
      };
      const submission = (await api.submitExam(exam.id, payload, token)) as SubmissionResult;
      setResult(submission);
    } catch (err) {
      setError((err as Error).message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{exam ? exam.title : "Exam"}</h1>
          <p className="page-subtitle">
            Answer all questions carefully. You can only submit once if this exam restricts multiple attempts.
          </p>
          {exam?.attempt_number && (
            <p className="page-subtitle">Attempt #{exam.attempt_number}</p>
          )}
        </div>
        <Link className="btn btn-ghost" to={`/exams/${id}/leaderboard`}>
          View leaderboard
        </Link>
      </div>
      {loading && <p>Loading exam...</p>}
      {error && <p className="form-error">{error}</p>}
      {exam && (
        <form onSubmit={handleSubmit} className="exam-form">
          {exam.questions.map((q, index) => {
            const isMulti = Boolean(q.is_multi);
            const selectedForQuestion = answers[q.id] || (isMulti ? [] : "");
            return (
              <div key={q.id} className="question-card">
                <h2 className="question-title">
                  Q{index + 1}. {q.text}
                </h2>
                {q.question_image && (
                  <div style={{ marginBottom: "0.6rem" }}>
                    <img src={q.question_image} alt="Question" className="exam-question-image" />
                  </div>
                )}
                <div className="options-grid exam-options-grid">
                  {["A", "B", "C", "D"].map((optKey) => {
                    const label = q[`option_${optKey.toLowerCase()}`];
                    const image = q[`option_${optKey.toLowerCase()}_image`];
                    const checked = isMulti
                      ? Array.isArray(selectedForQuestion) && selectedForQuestion.includes(optKey)
                      : selectedForQuestion === optKey;
                    return (
                      <label key={optKey} className="option-pill">
                        <input
                          type={isMulti ? "checkbox" : "radio"}
                          name={`question-${q.id}`}
                          value={optKey}
                          checked={checked}
                          onChange={() => handleChange(q.id, optKey, isMulti)}
                        />
                        <span>
                          <strong>{optKey}.</strong> {label}
                        </span>
                        {image && (
                          <img
                            src={image}
                            alt={`Option ${optKey}`}
                            className="exam-option-image"
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="exam-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit answers"}
            </button>
          </div>
        </form>
      )}
      {result && (
        <div className="result-banner">
          <h2>Your score: {result.score}</h2>
          <p>
            Attempt #{result.attempt_number} saved.{" "}
            {exam?.allow_multiple_attempts ? "You may retake the exam from the exams page." : "This exam allows only one attempt."}
          </p>
        </div>
      )}
    </div>
  );
}

export default ExamDetailPage;
