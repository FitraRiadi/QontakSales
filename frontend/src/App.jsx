import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import LeadsPage from "./pages/LeadsPage";
import PipelinePage from "./pages/PipelinePage";
import LeadDetailPage from "./pages/LeadDetailPage";
import SettingsPage from "./pages/SettingsPage";
import AgentsPage from "./pages/AgentsPage";
import BroadcastPage from "./pages/BroadcastPage";
import BroadcastHistoryPage from "./pages/BroadcastHistoryPage";
import ArchivedLeadsPage from "./pages/ArchivedLeadsPage";
import CalendarPage from "./pages/CalendarPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";
import MainLayout from "./components/layout/MainLayout";
import AuthGuard from "./components/layout/AuthGuard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/archived" element={<ArchivedLeadsPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/broadcasts" element={<BroadcastPage />} />
          <Route path="/broadcasts/history" element={<BroadcastHistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
