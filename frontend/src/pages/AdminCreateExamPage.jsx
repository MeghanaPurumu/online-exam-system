import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";

function emptyQuestion() {
  return {
    text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_options: ["A"],
    question_image: "",
    option_a_image: "",
    option_b_image: "",
    option_c_image: "",
    option_d_image: "",
  };
}

function AdminCreateExamPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [assignedOnly, setAssignedOnly] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageUpload = (questionIndex, field, event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateQuestion(questionIndex, field, reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  if (!token) {
    // simple redirect hint; real auth for admin is controlled by backend
    navigate("/login");
  }
  if (user && !user.is_admin) {
    navigate("/exams");
  }

  const loadUsers = async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const data = await api.listUsers(token);
      setUsers(data.filter((u) => !u.is_admin));
    } finally {
      setUsersLoading(false);
    }
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        title,
        description,
        allow_multiple_attempts: allowMultiple,
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: endAt ? new Date(endAt).toISOString() : null,
        questions,
        assigned_only: assignedOnly,
        assigned_user_ids: assignedOnly ? assignedUserIds : null,
      };
      const exam = await api.createExam(payload, token);
      setSuccess("Exam created successfully.");
      navigate(`/exams/${exam.id}`);
    } catch (err) {
      setError(err.message || "Failed to create exam. Ensure you are logged in as an admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create new exam</h1>
          <p className="page-subtitle">Design an assessment with multiple-choice questions.</p>
        </div>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <label className="form-label">
          Title
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Midterm Assessment"
          />
        </label>
        <label className="form-label">
          Description
          <textarea
            className="form-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of the exam, topics covered, and instructions."
          />
        </label>
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={allowMultiple}
            onChange={(e) => setAllowMultiple(e.target.checked)}
          />
          <span>Allow multiple attempts</span>
        </label>
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={assignedOnly}
            onChange={async (e) => {
              const next = e.target.checked;
              setAssignedOnly(next);
              if (next && users.length === 0) {
                try {
                  await loadUsers();
                } catch {
                  // errors will be caught on submit; keep UI lightweight here
                }
              }
            }}
          />
          <span>Assign this exam to specific users</span>
        </label>
        {assignedOnly && (
          <div className="card" style={{ padding: "0.9rem 1rem" }}>
            <div className="page-header" style={{ marginBottom: "0.6rem" }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>
                  Assigned users
                </h2>
                <p className="section-subtitle" style={{ margin: 0 }}>
                  Select which students can view and attempt this exam.
                </p>
              </div>
              <button type="button" className="btn btn-ghost" onClick={loadUsers} disabled={usersLoading}>
                {usersLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            {users.length === 0 ? (
              <p className="card-body-text">No students loaded yet.</p>
            ) : (
              <div className="chips">
                {users.map((u) => {
                  const checked = assignedUserIds.includes(u.id);
                  return (
                    <label key={u.id} className={`chip ${checked ? "chip-active" : ""}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(ev) => {
                          const on = ev.target.checked;
                          setAssignedUserIds((prev) =>
                            on ? [...prev, u.id] : prev.filter((x) => x !== u.id)
                          );
                        }}
                      />
                      <span>{u.email}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <div className="schedule-grid">
          <label className="form-label">
            Start time
            <input
              className="form-input"
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </label>
          <label className="form-label">
            End time
            <input
              className="form-input"
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </label>
        </div>

        <div className="questions-section">
          <h2 className="section-title">Questions</h2>
          <p className="section-subtitle">Add clear, concise questions with four options each.</p>
          {questions.map((q, index) => (
            <div key={index} className="question-editor-card">
              <div className="question-editor-header">
                <h3>Question {index + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => removeQuestion(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <label className="form-label">
                Question text
                <input
                  className="form-input"
                  value={q.text}
                  onChange={(e) => updateQuestion(index, "text", e.target.value)}
                  required
                />
                <div className="inline-file-input">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, "question_image", e)}
                  />
                  {q.question_image && (
                    <img
                      src={q.question_image}
                      alt="Question"
                      className="inline-image-preview"
                    />
                  )}
                </div>
              </label>
              <div className="options-grid">
                {["A", "B", "C", "D"].map((key) => (
                  <label key={key} className="form-label option-input option-input-editor">
                    <span className="option-label">{key}</span>
                    <input
                      className="form-input"
                      value={q[`option_${key.toLowerCase()}`]}
                      onChange={(e) =>
                        updateQuestion(index, `option_${key.toLowerCase()}`, e.target.value)
                      }
                      required
                    />
                    <div className="inline-file-input">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(index, `option_${key.toLowerCase()}_image`, e)
                        }
                      />
                      {q[`option_${key.toLowerCase()}_image`] && (
                        <img
                          src={q[`option_${key.toLowerCase()}_image`]}
                          alt={`Option ${key}`}
                          className="inline-image-preview"
                        />
                      )}
                    </div>
                  </label>
                ))}
              </div>
              <label className="form-label">
                Correct options
                <div className="chips">
                  {["A", "B", "C", "D"].map((key) => {
                    const active = q.correct_options?.includes(key);
                    return (
                      <label key={key} className={`chip ${active ? "chip-active" : ""}`}>
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            updateQuestion(
                              index,
                              "correct_options",
                              checked
                                ? [...(q.correct_options || []), key]
                                : (q.correct_options || []).filter((v) => v !== key)
                            );
                          }}
                        />
                        <span>{key}</span>
                      </label>
                    );
                  })}
                </div>
              </label>
            </div>
          ))}
          <button type="button" className="btn btn-ghost" onClick={addQuestion}>
            + Add another question
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <div className="exam-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating exam..." : "Create exam"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminCreateExamPage;

