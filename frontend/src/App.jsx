import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import AgentsPage from "./pages/AgentsPage";
import BroadcastPage from "./pages/BroadcastPage";
import BroadcastHistoryPage from "./pages/BroadcastHistoryPage";
import CalendarPage from "./pages/CalendarPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";
import AccountsPage from "./pages/AccountsPage";
import AccountDetailPage from "./pages/AccountDetailPage";
import ContactsPage from "./pages/ContactsPage";
import DealsPage from "./pages/DealsPage";
import DealDetailPage from "./pages/DealDetailPage";
import ProductsPage from "./pages/ProductsPage";
import ArchivePage from "./pages/ArchivePage";
import MainLayout from "./components/layout/MainLayout";
import AuthGuard from "./components/layout/AuthGuard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/accounts/:id" element={<AccountDetailPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/deals/:id" element={<DealDetailPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/broadcasts" element={<BroadcastPage />} />
          <Route path="/broadcasts/history" element={<BroadcastHistoryPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
