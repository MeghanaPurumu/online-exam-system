import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ExamsPage from "./pages/ExamsPage.jsx";
import ExamDetailPage from "./pages/ExamDetailPage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import ExamReviewPage from "./pages/ExamReviewPage.jsx";
import AdminCreateExamPage from "./pages/AdminCreateExamPage.jsx";
import AdminEditExamPage from "./pages/AdminEditExamPage.jsx";
import AdminExamAttemptsPage from "./pages/AdminExamAttemptsPage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/exams" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/exams/:id" element={<ExamDetailPage />} />
          <Route path="/exams/:id/leaderboard" element={<LeaderboardPage />} />
          <Route path="/exams/:id/review" element={<ExamReviewPage />} />
          <Route path="/admin/exams/new" element={<AdminCreateExamPage />} />
          <Route path="/admin/exams/:id/edit" element={<AdminEditExamPage />} />
          <Route path="/admin/exams/:id/attempts" element={<AdminExamAttemptsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;

