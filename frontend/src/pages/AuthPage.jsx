import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import LoadingPopup from "@/components/ui/LoadingPopup";
import AuthShell, { TextField, PasswordField, StrengthMeter, GoogleIcon, pwdScore } from "./authStitch";
import { EASE } from "./landingMotion";

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Please enter a valid email address";
    if (!password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setFieldErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/token/", { email: email.trim(), password });
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      const profile = await api.get("/auth/profile/");
      localStorage.setItem("user_role", profile.data.role);
      localStorage.setItem("user_id", String(profile.data.id));
      localStorage.setItem("user_name", `${profile.data.first_name} ${profile.data.last_name}`);
      localStorage.removeItem("manager_token");
      localStorage.removeItem("manager_refresh");
      localStorage.removeItem("manager_user");
      localStorage.removeItem("impersonating");
      localStorage.removeItem("impersonated_name");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 className="sa-h1">Welcome back to Sales Qontak</h1>
        <p className="sa-sub">Enter your work credentials to access real-time pipelines and messaging.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button type="button" className="sa-google" onClick={() => setNotice("Google sign-in is coming soon — please continue with email.")}>
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>
      </div>

      <div className="sa-divider"><span>or continue with email</span></div>

      <form className="sa-form" onSubmit={handleSubmit} noValidate>
        {notice && <div className="sa-alert-info">{notice}</div>}
        {error && <div className="sa-alert-err">{error}</div>}
        <TextField
          id="signin-email"
          label="Work Email"
          icon="mail"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" })); }}
          placeholder="name@company.com"
          error={fieldErrors.email}
        />
        <div>
          <div className="sa-frow" style={{ marginBottom: 6 }}>
            <label className="sa-flabel" style={{ marginBottom: 0 }} htmlFor="signin-password">Password</label>
            <button type="button" className="sa-forgot" onClick={() => navigate("/forgot-password")}>Forgot password?</button>
          </div>
          <PasswordField
            id="signin-password"
            label=""
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" })); }}
            placeholder="••••••••••••"
            error={fieldErrors.password}
          />
        </div>
        <div style={{ padding: "4px 0" }}>
          <label className="sa-check">
            <input type="checkbox" defaultChecked />
            <span style={{ fontSize: 14 }}>Remember this device for 30 days</span>
          </label>
        </div>
        <button type="submit" className="sa-submit" disabled={loading}>
          {loading ? <span className="sa-spin" /> : null}
          <span>{loading ? "Signing in..." : "Sign In to Workspace"}</span>
          {!loading && <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>}
        </button>
      </form>
      <LoadingPopup open={loading} message="Signing in..." />
    </div>
  );
}

function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", company_name: "", email: "", phone: "", password: "" });
  const [tos, setTos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!form.company_name.trim()) errs.company_name = "Company name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Please enter a valid email address";
    const digits = form.phone.replace(/[^0-9]/g, "");
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (digits.length < 8) errs.phone = "Please enter a valid phone number";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    else if (pwdScore(form.password).score < 2) errs.password = "Password is too weak — add uppercase letters, numbers, or symbols";
    if (!tos) errs.tos = "Please agree to the Terms of Service and Privacy Policy";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register/", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        company_name: form.company_name.trim(),
        phone: form.phone.trim(),
      });
      navigate("/login");
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const fieldErrs = {};
        for (const [key, val] of Object.entries(data)) {
          if (Array.isArray(val)) fieldErrs[key] = val[0];
          else if (typeof val === "string") fieldErrs[key] = val;
        }
        if (Object.keys(fieldErrs).length > 0) setFieldErrors(fieldErrs);
        else setError(data.message || data.detail || "Registration failed. Please try again.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 className="sa-h1">Started Free</h1>
        <p className="sa-sub">Scale your revenue team with conversational sales workflows.</p>
      </div>

      <form className="sa-form2" onSubmit={handleSubmit} noValidate>
        {error && <div className="sa-alert-err">{error}</div>}
        <div className="sa-fgrid">
          <TextField
            id="reg-name"
            label="Full Name"
            icon="badge"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Sarah Jenkins"
            error={fieldErrors.name}
          />
          <TextField
            id="reg-company"
            label="Company Name"
            icon="domain"
            name="company_name"
            type="text"
            value={form.company_name}
            onChange={handleChange}
            placeholder="Acme Logistics Inc."
            error={fieldErrors.company_name}
          />
        </div>
        <TextField
          id="reg-email"
          label="Work Email"
          icon="mail"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="sarah@acme.com"
          error={fieldErrors.email}
        />
        <TextField
          id="reg-phone"
          label="Phone (WhatsApp Verified)"
          icon="phone_iphone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="+62 812 3456 7890"
          error={fieldErrors.phone}
        />
        <div>
          <PasswordField
            id="reg-password"
            name="password"
            label="Create Password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 alphanumeric characters"
            error={fieldErrors.password}
          />
          <StrengthMeter password={form.password} />
        </div>
        <div style={{ paddingTop: 8 }}>
          <label className="sa-check top">
            <input type="checkbox" checked={tos} onChange={(e) => { setTos(e.target.checked); if (fieldErrors.tos) setFieldErrors((p) => ({ ...p, tos: "" })); }} />
            <span className="sa-tos">
              I agree to the <a href="/terms" onClick={(e) => { e.preventDefault(); navigate("/terms"); }}>Terms of Service</a>, <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate("/privacy"); }}>Privacy Policy</a>, and consent to account setup verification.
            </span>
          </label>
          {fieldErrors.tos && <div className="sa-ferr">{fieldErrors.tos}</div>}
        </div>
        <button type="submit" className="sa-submit" disabled={loading}>
          {loading ? <span className="sa-spin" /> : null}
          <span>{loading ? "Creating account..." : "Create Free Account (14-day trial)"}</span>
          {!loading && <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>}
        </button>
      </form>
      <LoadingPopup open={loading} message="Creating account..." />
    </div>
  );
}

export default function AuthPage({ initialMode = "signin" }) {
  const [mode, setMode] = useState(initialMode);

  if (localStorage.getItem("access_token")) return <Navigate to="/dashboard" replace />;

  return (
    <AuthShell mode={mode} onModeChange={setMode}>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === "register" ? 24 : -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === "register" ? -16 : 16, transition: { duration: 0.15 } }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          {mode === "signin" ? <LoginForm /> : <RegisterForm />}
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  );
}
