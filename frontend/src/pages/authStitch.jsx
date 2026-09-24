import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EASE } from "./landingMotion";
import "./AuthStitch.css";
import logoAuth from "@/assets/auth-stitch/logo-auth.png";
import showcaseTeam from "@/assets/auth-stitch/showcase-team.png";

const AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80";

/* Skor 0-4 + label, port dari logika Stitch */
export function pwdScore(pw) {
  if (!pw) return { score: 0, label: "None", color: "#737686" };
  let s = 0;
  if (pw.length >= 6) s += 1;
  if (pw.length >= 10) s += 1;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  if (s <= 1) return { score: 1, label: "Weak", color: "#ba1a1a" };
  if (s === 2) return { score: 2, label: "Fair", color: "#ba1a1a" };
  if (s === 3) return { score: 3, label: "Good", color: "#004ac6" };
  return { score: 4, label: "Strong", color: "#006242" };
}

export function TextField({ id, label, icon, error, ...props }) {
  return (
    <div>
      <label className="sa-flabel" htmlFor={id}>{label}</label>
      <div className="sa-fwrap">
        <span className="material-symbols-outlined sa-ficon">{icon}</span>
        <input id={id} className={error ? "sa-invalid" : ""} {...props} />
      </div>
      {error && <div className="sa-ferr">{error}</div>}
    </div>
  );
}

export function PasswordField({ id, name, label, value, onChange, error, placeholder, onInput }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      {label ? <label className="sa-flabel" htmlFor={id}>{label}</label> : null}
      <div className="sa-fwrap">
        <span className="material-symbols-outlined sa-ficon">lock</span>
        <input
          id={id}
          name={name || id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          onInput={onInput}
          placeholder={placeholder}
          style={{ paddingRight: 44 }}
          className={error ? "sa-invalid" : ""}
        />
        <button type="button" className="sa-eye" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{show ? "visibility_off" : "visibility"}</span>
        </button>
      </div>
      {error && <div className="sa-ferr">{error}</div>}
    </div>
  );
}

export function StrengthMeter({ password }) {
  const { score, label, color } = pwdScore(password);
  const barColor = (i) => (i < score ? color : undefined);
  return (
    <div style={{ paddingTop: 4 }}>
      <div className="sa-strbars">
        {[0, 1, 2, 3].map((i) => (
          <i key={i} style={barColor(i) ? { background: barColor(i) } : undefined} />
        ))}
      </div>
      <div className="sa-strmeta">
        <span>Strength: <strong style={{ color }}>{label}</strong></span>
        <span>Use 8+ chars with mix of symbols</span>
      </div>
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg style={{ width: 16, height: 16, flexShrink: 0 }} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
  );
}

function Showcase() {
  return (
    <div className="sa-show">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
        <h2>Join thousands of high-performing sales floors</h2>
        <p>Sales Qontak empowers modern revenue teams to accelerate sales pipelines and engage customers with real-time WhatsApp &amp; CRM automation.</p>
      </motion.div>
      <motion.div
        className="sa-bento"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
      >
        <motion.div className="sa-card span2" variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }}>
          <div className="sa-pipe">
            <div className="sa-pipebox">
              <div className="t"><span>Discovery</span><span className="sa-count">5</span></div>
              <div className="v">Rp240M</div>
              <div className="sa-bar"><i style={{ width: "40%", background: "#004ac6" }} /></div>
            </div>
            <div className="sa-pipebox">
              <div className="t"><span>Proposal Sent</span><span className="sa-count">8</span></div>
              <div className="v">Rp510M</div>
              <div className="sa-bar"><i style={{ width: "75%", background: "#2563eb" }} /></div>
            </div>
            <div className="sa-pipebox">
              <div className="t"><span>Closing Stage</span><span className="sa-count won">Won</span></div>
              <div className="v" style={{ color: "#006242" }}>Rp870M</div>
              <div className="sa-bar"><i style={{ width: "100%", background: "#006242" }} /></div>
            </div>
          </div>
        </motion.div>
        <motion.div className="sa-card sa-metric" variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }}>
          <div className="mhead"><span>Win Rate Growth</span><span className="material-symbols-outlined" style={{ fontSize: 18, color: "#006242" }}>trending_up</span></div>
          <div className="mbig" style={{ color: "#006242" }}>+42%</div>
          <p>Post WhatsApp API integration &amp; smart triage</p>
        </motion.div>
        <motion.div className="sa-card sa-metric" variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }}>
          <div className="mhead"><span>Activity Timeline</span><span className="material-symbols-outlined" style={{ fontSize: 18, color: "#004ac6" }}>speed</span></div>
          <div className="mbig" style={{ color: "#004ac6" }}>4 types</div>
          <p>Meeting, Call, Email and Follow-up logged per deal</p>
        </motion.div>
        <motion.div className="sa-card span2 sa-endorse" variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }}>
          <div className="ph"><img src={showcaseTeam} alt="Sales Collaboration and Community" /></div>
          <div>
            <div className="sa-who">
              <img src={AVATAR} alt="David Reynolds" />
              <div><b>David Reynolds</b><small>VP of Revenue Operations • Fintech Scaleup</small></div>
            </div>
            <p className="sa-quote">&ldquo;Our team&apos;s deal velocity and qualified pipeline conversion jumped 42% within 60 days of deploying Sales Qontak.&rdquo;</p>
            <div className="sa-trust">
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#006242" }}>shield_with_heart</span>
              <span>WhatsApp broadcast • Visual pipeline • Live dashboard</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function AuthShell({ mode, children, onModeChange }) {
  const navigate = useNavigate();
  const pick = (m) => { if (onModeChange) onModeChange(m); else navigate(m === "signin" ? "/login" : "/register"); };
  return (
    <div className="sa-auth">
      <div className="sa-cols">
        <div className="sa-left">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <div className="sa-brandrow">
              <img alt="Sales Qontak" className="sa-logo" src={logoAuth} onClick={() => navigate("/")} />
              <button className="sa-back" onClick={() => navigate("/")}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                <span>Back to site</span>
              </button>
            </div>
            <div className="sa-seg">
              <button className={mode === "signin" ? "active" : ""} onClick={() => pick("signin")}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
                <span>Sign In</span>
              </button>
              <button className={mode === "register" ? "active" : ""} onClick={() => pick("register")}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
                <span>Create Account</span>
              </button>
            </div>
            {children}
          </motion.div>
        </div>
        <div className="sa-right">
          <Showcase />
        </div>
      </div>
    </div>
  );
}
