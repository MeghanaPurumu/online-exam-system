## Xam Mate Backend (FastAPI)

Backend service for an online examination system with JWT authentication, automated scoring, and leaderboards.

### Tech Stack

- **Backend**: FastAPI
- **Database**: PostgreSQL (SQLAlchemy)
- **Auth**: JWT (OAuth2 password flow)
- **Frontend**: React + Vite (branded as Xam Mate)

---

### How to Run the Project

1. **Clone / open the project**

2. **Create and activate a virtual environment**

```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Configure environment variables**

- Copy `.env.example` to `.env` and update values:
  - `DATABASE_URL` (PostgreSQL connection string)
  - `JWT_SECRET_KEY` (strong random string)

5. **Create database tables**

Run the following once to create tables:

```bash
python -c "from app.database import engine; from app.models.base import Base; import app.models.user, app.models.exam; Base.metadata.create_all(bind=engine)"
```

6. **Run the FastAPI app**

```bash
uvicorn app.main:app --reload
```

7. **Open API docs**

Visit `http://127.0.0.1:8000/docs` for interactive Swagger UI.

*The frontend branding will show “Xam Mate.”*

---

### How to Run the Frontend (React)

The React application is branded as **Xam Mate**. Place your logo image in `frontend/public/logo.png` (or update the `<img>` path in `Layout.jsx`) — the default file is a placeholder.
From the project root:

1. **Install frontend dependencies**

```bash
cd frontend
npm install
```

2. **Start the React dev server**

```bash
npm run dev
```

3. **Open the app**

- Vite will show a local URL in the terminal (by default `http://127.0.0.1:5173`).
- The frontend is configured to call the backend at `http://127.0.0.1:8000`.

#### Frontend Features

- Professional, dark, modern interface with:
  - Sticky, glassmorphism-style header and branding.
  - Responsive layout and cards for exam listing.
  - Smooth gradients and subtle shadows for an elegant look.
- **Pages**:
  - `Login` and `Register` – JWT-based authentication against the FastAPI backend.
  - `Exams` – list all exams and navigate to details or leaderboard.
  - `Exam detail` – attempt an exam with multiple-choice questions and submit answers.
  - `Leaderboard` – view ranked results for a given exam.
  - `Admin create exam` – UI to create exams with questions (actual admin permission is enforced in backend).

---

### Folder Structure

- **`app/`**: Main application package
  - **`main.py`**: FastAPI app instance and router registration
  - **`config.py`**: Settings and environment configuration (Pydantic)
  - **`database.py`**: SQLAlchemy engine and session management
  - **`models/`**: SQLAlchemy ORM models
    - `base.py` – Base `declarative_base`
    - `user.py` – `User` model
    - `exam.py` – `Exam`, `Question`, `Submission` models
  - **`schemas/`**: Pydantic request/response models
    - `user.py` – auth/user schemas
    - `exam.py` – exam, question, submission, leaderboard schemas
  - **`routes/`**: FastAPI route handlers (no business logic)
    - `auth.py` – registration, login, auth dependencies
    - `exams.py` – exam CRUD, submission, leaderboard
  - **`services/`**: Business logic layer
    - `auth_service.py` – registration, authentication, token issuance
    - `exam_service.py` – exam creation, scoring, leaderboard logic
  - **`repositories/`**: Data access layer (DB queries)
    - `user_repository.py` – user lookups and creation
    - `exam_repository.py` – exams, questions, submissions, leaderboard queries
  - **`utils/`**
    - `security.py` – password hashing, JWT creation/verification

- **`frontend/`**: React single-page application
  - `package.json` – Vite + React setup and scripts
  - `vite.config.mts` – Vite configuration
  - `index.html` – HTML shell
  - `src/`
    - `main.jsx` – React entrypoint
    - `App.jsx` – routing and layout wiring
    - `styles.css` – global, professional styling for the portal
    - `api/client.js` – API client for talking to the FastAPI backend
    - `context/AuthContext.jsx` – JWT storage and auth context
    - `components/Layout.jsx` – top-level shell (header/footer)
    - `pages/` – route-level pages (login, register, exams, exam detail, leaderboard, admin create exam)

---

### Authentication Flow (JWT)

- **User Registration**: `POST /auth/register`
  - Body: email, full_name, password
  - Creates a non-admin user with hashed password.

- **User Login**: `POST /auth/login`
  - OAuth2 password flow (`username` = email, `password`)
  - Returns `access_token` (JWT) and `token_type="bearer"`.

- **Protected Routes**:
  - Use `Authorization: Bearer <token>` header.
  - `get_current_user` dependency validates token and loads user.
  - `get_current_admin` additionally requires `is_admin=True`.

---

### Main API Endpoints

#### Auth (`/auth`)

- **`POST /auth/register`**
  - Register a new user.
  - Request body (JSON): `{ "email", "full_name", "password" }`
  - Response: `UserOut` (id, email, full_name, is_admin).

- **`POST /auth/login`**
  - Login and receive JWT.
  - Form data (`application/x-www-form-urlencoded`): `username`, `password`.
  - Response: `{ "access_token", "token_type" }`.

---

#### Exams (`/exams`)

All exams routes require a valid JWT token.

- **`POST /exams/`** (Admin only)
  - Create an exam with questions.
  - Body:
    - `title`, `description`, `allow_multiple_attempts`
    - `questions`: list of `{ text, option_a, option_b, option_c, option_d, correct_option }`

- **`GET /exams/`**
  - List all exams with their questions (without correct options in response).

- **`GET /exams/{exam_id}`**
  - Get a single exam by id.

- **`POST /exams/{exam_id}/submit`**
  - Student submits answers for an exam.
  - Body: `{ "answers": [ { "question_id", "selected_option" }, ... ] }`
  - Automatically computes score based on correct options and creates a submission.
  - If `allow_multiple_attempts` is false, only first submission is allowed.

- **`GET /exams/{exam_id}/leaderboard`**
  - Returns leaderboard for exam ordered by highest score, then earliest submission.
  - Response: list of `{ student_id, student_email, score }`.

---

### Error Handling & REST Practices

- Uses structured HTTP exceptions (`HTTPException`) with proper status codes:
  - `400` for bad requests (e.g., duplicate user, multiple attempts not allowed).
  - `401` for invalid credentials or missing auth.
  - `403` for forbidden (non-admin access to admin-only routes).
  - `404` for resources not found (exam).
- Request/response models use Pydantic for validation and serialization.

