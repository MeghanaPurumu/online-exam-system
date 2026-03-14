import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ExamsPage from "./pages/ExamsPage";
import ExamDetailPage from "./pages/ExamDetailPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ExamReviewPage from "./pages/ExamReviewPage";
import AdminCreateExamPage from "./pages/AdminCreateExamPage";
import AdminEditExamPage from "./pages/AdminEditExamPage";
import AdminExamAttemptsPage from "./pages/AdminExamAttemptsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider } from "./context/AuthContext";

const App: React.FC = () => {
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




