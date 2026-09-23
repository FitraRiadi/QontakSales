import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Reveal, Stagger, staggerChild, megaList, megaItem, heroParent, heroChild, EASE } from "./landingMotion";
import api from "@/services/api";
import "./LandingPageStitch.css";
import logoNav from "@/assets/landing-stitch/logo-nav.png";
import logoFooter from "@/assets/landing-stitch/logo-footer.png";
import heroTeam from "@/assets/landing-stitch/hero-team.png";
import teamRoster from "@/assets/landing-stitch/team-roster.png";

const AV = {
  a: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
  b: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
  c: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces",
  lucas: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80",
  emily: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
  alex: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80",
  mia: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&h=160&q=80",
  jacob: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160&q=80",
  bella: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&h=160&q=80",
};

const TABS = [
  { id: "pipeline", label: "Pipeline Tracking" },
  { id: "omnichannel", label: "Omnichannel & WhatsApp" },
  { id: "automation", label: "Workflow Automation" },
  { id: "analytics", label: "Predictive Analytics" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pipeline");
  const [billing, setBilling] = useState("annual");
  const [insight, setInsight] = useState("All Insights");
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);
  const closeTimer = useRef(null);

  const go = (p) => navigate(p);
  const starter = billing === "annual" ? "$29" : "$36";
  const growth = billing === "annual" ? "$79" : "$99";

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const openTab = (id) => { setTab(id); setOpenMenu(null); setMobileOpen(false); setTimeout(() => scrollTo("product-capabilities"), 60); };

  const fetchArticles = () => {
    setArticlesLoading(true);
    setArticlesError(false);
    api.get("/public-articles/", { params: { ordering: "-published_at" } })
      .then((r) => {
        const list = r.data.results || r.data;
        setArticles(Array.isArray(list) ? list.slice(0, 12) : []);
        setArticlesLoading(false);
      })
      .catch(() => { setArticlesLoading(false); setArticlesError(true); });
  };

  useEffect(() => { fetchArticles(); }, []);

  const readMins = (a) => {
    const words = (a.excerpt || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200) || 1);
  };

  const insightCats = ["All Insights", ...new Set(articles.map((a) => a.category_name).filter(Boolean))].slice(0, 5);
  const visibleArticles = (insight === "All Insights" ? articles : articles.filter((a) => a.category_name === insight)).slice(0, 3);
  const scheduleClose = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setOpenMenu(null), 140); };
  const cancelClose = () => clearTimeout(closeTimer.current);

  const MENUS = {
    product: {
      label: "Product",
      links: [
        { icon: "view_column", tint: "#eff6ff", color: "#004ac6", title: "Pipeline Tracking", desc: "Kanban + SLA timers", onClick: () => openTab("pipeline") },
        { icon: "chat", tint: "#ecfdf5", color: "#006242", title: "Omnichannel & WhatsApp", desc: "Meta BSP inbox", onClick: () => openTab("omnichannel") },
        { icon: "bolt", tint: "#ede9fe", color: "#6d28d9", title: "Workflow Automation", desc: "No-code follow-ups", onClick: () => openTab("automation") },
        { icon: "monitoring", tint: "#fef3c7", color: "#92400e", title: "Predictive Analytics", desc: "Quota forecasting", onClick: () => openTab("analytics") },
      ],
      feature: { kicker: "LIVE METRICS", title: "$842K closing + 98.4% WA delivery", cta: "Book a Demo", onClick: () => go("/register") },
    },
    solutions: {
      label: "Solutions",
      links: [
        { icon: "storefront", tint: "#eff6ff", color: "#004ac6", title: "Sales Operations", desc: "Broadcast + velocity", onClick: () => { setOpenMenu(null); scrollTo("product-capabilities"); } },
        { icon: "query_stats", tint: "#fef3c7", color: "#92400e", title: "RevOps & Reporting", desc: "Forecast + quotas", onClick: () => { setOpenMenu(null); scrollTo("product-capabilities"); } },
        { icon: "security", tint: "#ecfdf5", color: "#006242", title: "Enterprise & Security", desc: "SOC 2 + SSO", onClick: () => { setOpenMenu(null); scrollTo("pricing"); } },
        { icon: "campaign", tint: "#ede9fe", color: "#6d28d9", title: "WhatsApp Broadcast", desc: "HSM campaigns", onClick: () => { setOpenMenu(null); scrollTo("product-capabilities"); } },
      ],
      feature: { kicker: "CASE STUDY", title: "+68% pipeline conversion, 120+ reps", cta: "See proof", onClick: () => { setOpenMenu(null); scrollTo("insights-resources"); } },
    },
    resources: {
      label: "Resources",
      links: [
        { icon: "menu_book", tint: "#eff6ff", color: "#004ac6", title: "WhatsApp API Blueprint", desc: "5 min playbook", onClick: () => go("/blog") },
        { icon: "speed", tint: "#fef3c7", color: "#92400e", title: "Kill Deal Stalls", desc: "7 min guide", onClick: () => go("/blog") },
        { icon: "bar_chart", tint: "#ecfdf5", color: "#006242", title: "2024 Conversion Report", desc: "4 min benchmark", onClick: () => go("/blog") },
      ],
      feature: { kicker: "SALES ACADEMY", title: "Playbooks dari practitioner enterprise", cta: "View all articles", onClick: () => go("/blog") },
    },
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="sq-landing">
      <header className="sq-header">
        <div className="sq-header-inner">
          <a href="#" onClick={(e) => e.preventDefault()}>
            <img alt="Sales Qontak" className="sq-logo" src={logoNav} />
          </a>
          <nav className="sq-nav" onMouseLeave={scheduleClose} onKeyDown={(e) => { if (e.key === "Escape") setOpenMenu(null); }}>
            {Object.entries(MENUS).map(([key, m]) => (
              <div key={key} className="sq-nav-item" onMouseEnter={() => { cancelClose(); setOpenMenu(key); }}>
                <button
                  className={"sq-nav-btn" + (openMenu === key ? " open" : "")}
                  aria-expanded={openMenu === key}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu(openMenu === key ? null : key)}
                  onFocus={() => setOpenMenu(key)}
                >
                  {m.label}
                  <span className="material-symbols-outlined sq-caret">expand_more</span>
                </button>
                <AnimatePresence>
                {openMenu === key && (
                  <motion.div
                    className="sq-mega"
                    initial={{ opacity: 0, x: "-50%", y: 8 }}
                    animate={{ opacity: 1, x: "-50%", y: 0 }}
                    exit={{ opacity: 0, x: "-50%", y: 6, transition: { duration: 0.12 } }}
                    transition={{ duration: 0.18, ease: EASE }}
                    onMouseEnter={cancelClose} onMouseLeave={scheduleClose}
                  >
                    <motion.div className="sq-mega-links" variants={megaList} initial="hidden" animate="show" exit="hidden">
                      {m.links.map((l) => (
                        <motion.button key={l.title} className="sq-mega-link" variants={megaItem} onClick={l.onClick}>
                          <span className="sq-mega-icon" style={{ background: l.tint, color: l.color }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{l.icon}</span>
                          </span>
                          <span className="sq-mega-text">
                            <span className="sq-mega-title">{l.title}</span>
                            <span className="sq-mega-desc">{l.desc}</span>
                          </span>
                        </motion.button>
                      ))}
                    </motion.div>
                    <motion.button
                      className="sq-mega-feature"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: 0.12, duration: 0.2 } }}
                      onClick={m.feature.onClick}
                    >
                      <span className="sq-mega-kicker">{m.feature.kicker}</span>
                      <span className="sq-mega-feature-title">{m.feature.title}</span>
                      <span className="sq-mega-feature-cta">{m.feature.cta} <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span></span>
                    </motion.button>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            ))}
            <a href="#pricing">Enterprise</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="sq-header-cta">
            <button className="sq-signin" onClick={() => go("/login")}>Sign in</button>
            <button className="sq-btn-demo" onClick={() => go("/register")}>Book a Demo</button>
            <button className="sq-burger" aria-label="Menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>
              <span className="material-symbols-outlined">{mobileOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
        <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="sq-mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.22, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            {Object.entries(MENUS).map(([key, m]) => (
              <div key={key} className="sq-mobile-group">
                <button className="sq-mobile-head" onClick={() => setMobileSection(mobileSection === key ? null : key)}>
                  {m.label}
                  <span className="material-symbols-outlined" style={{ transform: mobileSection === key ? "rotate(180deg)" : "none" }}>expand_more</span>
                </button>
                {mobileSection === key && (
                  <div className="sq-mobile-links">
                    {m.links.map((l) => (
                      <button key={l.title} className="sq-mobile-link" onClick={() => { l.onClick(); setMobileOpen(false); }}>
                        <span className="material-symbols-outlined" style={{ color: l.color, fontSize: 20 }}>{l.icon}</span>
                        <span><b>{l.title}</b><br /><small>{l.desc}</small></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a className="sq-mobile-link" href="#pricing" onClick={() => setMobileOpen(false)}>Enterprise</a>
            <a className="sq-mobile-link" href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
            <button className="sq-btn-demo" style={{ width: "100%", marginTop: 8 }} onClick={() => go("/login")}>Sign in</button>
          </motion.div>
        )}
        </AnimatePresence>
      </header>

      <main className="sq-main">
        {/* 1. HERO */}
        <section className="sq-hero">
          <div className="sq-container">
            <motion.div className="sq-hero-top" variants={heroParent} initial="hidden" animate="show">
              <motion.div variants={heroChild}>
                <h1 className="sq-h1">Accelerate deals and unify customer touchpoints <span className="blue">on your terms</span></h1>
              </motion.div>
              <motion.div className="sq-hero-side" variants={heroChild}>
                <p className="sq-body">Get business-grade WhatsApp Cloud API, visual deal pipelines, VoIP calling, and automated SLA routing&nbsp; all in one scalable revenue engine.</p>
                <motion.button className="sq-pill-dark" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => go("/register")}>
                  <span>Get Demo Account</span>
                  <span className="circle"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span></span>
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div className="sq-hero-grid" variants={heroParent} initial="hidden" animate="show">
              <motion.div className="sq-hero-card sq-hero-a" variants={heroChild}>
                <div style={{ position: "relative", zIndex: 10, maxWidth: 28 + "rem" }}>
                  <h2 className="sq-h3">Sales Operations</h2>
                  <p className="sq-body" style={{ fontSize: 12 }}>The all-in-one suite for WhatsApp broadcast, pipeline velocity, and automated SLA routing.</p>
                </div>
                <motion.div
                  className="sq-hero-img"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <motion.img
                    alt="Sales Operations Team"
                    src={heroTeam}
                    style={{ width: "100%", height: "auto", objectFit: "contain", display: "block", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.12))" }}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
                <div className="sq-mini-row">
                  <div className="sq-mini-card">
                    <div className="sq-mini-top">
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f59e0b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>+</div>
                      <div style={{ height: 40, borderRadius: 12, background: "#eff4ff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 10, color: "#565e74", fontWeight: 700 }}>PIPELINE</span>
                        <span style={{ fontWeight: 800, fontSize: 12 }}>23 Deals</span>
                      </div>
                      <div style={{ height: 40, borderRadius: 12, background: "#eff4ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#565e74" }}>
                        <span className="material-symbols-outlined">lock</span>
                      </div>
                    </div>
                    <div className="sq-mini-avatars">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="sq-avatar-stack">
                          <img alt="rep" src={AV.a} /><img alt="rep" src={AV.b} /><img alt="rep" src={AV.c} />
                          <span className="sq-avatar-more">+4</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700 }}>Active Team</span>
                      </div>
                      <span style={{ fontSize: 11, color: "#006242", fontWeight: 800 }}>99.8% Sync</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <a className="sq-circle-btn" href="#product-capabilities"><span className="material-symbols-outlined">arrow_forward</span></a>
                  </div>
                </div>
              </motion.div>

              <motion.div className="sq-hero-card sq-hero-b" variants={heroChild}>
                <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="sq-stat-box">
                    <p style={{ fontSize: 11, color: "#565e74" }}>Closing Deals</p>
                    <p style={{ fontWeight: 800, fontSize: 16 }}>$842,000</p>
                    <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: 4, background: "#ecfdf5", color: "#006242", fontWeight: 800, fontSize: 10, marginTop: 4 }}>+28% YoY</span>
                  </div>
                  <div className="sq-stat-box">
                    <p style={{ fontSize: 11, color: "#565e74" }}>Cycle Duration</p>
                    <p style={{ fontWeight: 800, fontSize: 16 }}>14 Days</p>
                    <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: 4, background: "#eff6ff", color: "#004ac6", fontWeight: 800, fontSize: 10, marginTop: 4 }}>Fast Track</span>
                  </div>
                </div>
                <div className="sq-card-foot"><span style={{ fontWeight: 800 }}>Enterprise</span><span className="material-symbols-outlined" style={{ color: "#2563eb" }}>arrow_upward</span></div>
              </motion.div>

              <motion.div className="sq-hero-card sq-hero-c" variants={heroChild}>
                <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="sq-stat-box">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontWeight: 800, fontSize: 12 }}>WhatsApp Broadcast</span><span style={{ fontSize: 10, color: "#565e74", fontWeight: 700 }}>98.4%</span></div>
                    <p style={{ fontSize: 11, color: "#434655" }}>Instant delivery via Meta verified cloud pipe.</p>
                  </div>
                  <div className="sq-stat-box">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontWeight: 800, fontSize: 12 }}>SLA Auto-Assignment</span><span style={{ fontSize: 10, color: "#006242", fontWeight: 800 }}>0.4s</span></div>
                    <p style={{ fontSize: 11, color: "#434655" }}>Routing to active rep with zero delay.</p>
                  </div>
                </div>
                <div className="sq-card-foot"><span style={{ fontWeight: 800 }}>WhatsApp Broadcast</span><span className="material-symbols-outlined" style={{ color: "#006242" }}>check_circle</span></div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 2. TRUSTED */}
        <section className="sq-section sq-bg-base">
          <div className="sq-container">
            <Reveal><p style={{ textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#434655", marginBottom: 24 }}>Over 5,000+ Fast-Growing Enterprise Teams Accelerate Growth With Sales Qontak</p></Reveal>
            <Stagger className="sq-logo-grid">
              <motion.div variants={staggerChild} className="sq-logo-item"><span style={{ color: "#2563eb", marginRight: 4 }}>●</span>TOKOPEDIA</motion.div>
              <motion.div variants={staggerChild} className="sq-logo-item"><span style={{ color: "#006242", marginRight: 4 }}>■</span>GOJEK REVENUE</motion.div>
              <motion.div variants={staggerChild} className="sq-logo-item"><span style={{ color: "#004ac6", marginRight: 4 }}>▲</span>BANK JAGO</motion.div>
              <motion.div variants={staggerChild} className="sq-logo-item"><span style={{ color: "#565e74", marginRight: 4 }}>◆</span>TRAVELOKA</motion.div>
              <motion.div variants={staggerChild} className="sq-logo-item"><span style={{ color: "#2563eb", marginRight: 4 }}>★</span>TELKOM IND</motion.div>
              <motion.div variants={staggerChild} className="sq-logo-item"><span style={{ color: "#007d55", marginRight: 4 }}>❖</span>KALBE FARMA</motion.div>
            </Stagger>
            <Stagger className="sq-metrics">
              <motion.div variants={staggerChild} className="sq-metric"><p className="big" style={{ color: "#2563eb" }}>3.4x</p><p style={{ fontWeight: 700, margin: "0 0 4px" }}>Faster Deal Close</p><p className="sq-body">Automated task routing eliminates pipeline stalls.</p></motion.div>
              <motion.div variants={staggerChild} className="sq-metric"><p className="big" style={{ color: "#006242" }}>98.4%</p><p style={{ fontWeight: 700, margin: "0 0 4px" }}>WhatsApp Delivery Rate</p><p className="sq-body">Official Tier-1 Meta BSP direct cloud infrastructure.</p></motion.div>
              <motion.div variants={staggerChild} className="sq-metric"><p className="big">$1.2B+</p><p style={{ fontWeight: 700, margin: "0 0 4px" }}>Pipeline Managed</p><p className="sq-body">Trusted by mid-market to Fortune 500 commercial teams.</p></motion.div>
            </Stagger>
          </div>
        </section>

        {/* 3. CAPABILITIES */}
        <section className="sq-section-lg sq-bg-white" id="product-capabilities">
          <div className="sq-container">
            <motion.div className="sq-center" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: 0.55, ease: EASE }}>
              <span className="sq-eyebrow">Complete Revenue Operations Architecture</span>
              <h2 className="sq-h2">Everything your sales floor needs to close predictably</h2>
              <p className="sq-sub">Replace disconnected spreadsheets, separate telephony apps, and manual WhatsApp chats with one cohesive operating engine.</p>
            </motion.div>
            <div className="sq-tabs" role="tablist">
              <div className="sq-tabs-inner">
                {TABS.map((t) => (
                  <button key={t.id} role="tab" aria-selected={tab === t.id} className={"sq-tab-btn" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
                    {tab === t.id && (
                      <motion.span layoutId="sq-tab-pill" className="sq-tab-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                    )}
                    <span className="sq-tab-label">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: EASE }}>
            <div className={"sq-panel" + (tab === "pipeline" ? " show" : "")}>
              <div className="sq-split">
                <div className="sq-split-5" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <h3 className="sq-h3">Total visibility into every deal stage and SLA requirement</h3>
                  <p className="sq-body">Organize leads across customizable stages. Flag stagnant deals automatically with deal-rot timers and configure required fields before advancing high-value opportunities.</p>
                  <div className="sq-check"><span className="material-symbols-outlined" style={{ color: "#2563eb" }}>check_circle</span><span>Custom deal velocity timers and bottleneck triggers</span></div>
                  <div className="sq-check"><span className="material-symbols-outlined" style={{ color: "#2563eb" }}>check_circle</span><span>Automatic currency conversion and tax calculation</span></div>
                  <div className="sq-check"><span className="material-symbols-outlined" style={{ color: "#2563eb" }}>check_circle</span><span>Role-based deal access permissions and audit trails</span></div>
                </div>
                <div className="sq-split-7 sq-mock">
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid rgba(195,198,215,.3)", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 800, fontSize: 14 }}><span className="material-symbols-outlined" style={{ color: "#2563eb" }}>view_column</span> Enterprise Pipeline - Q3</div>
                    <span style={{ fontSize: 12, color: "#565e74", fontFamily: "monospace" }}>18 Deals • Total Value $1.42M</span>
                  </div>
                  <div className="sq-kanban">
                    <div className="sq-kanban-col">
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 10, fontWeight: 800, color: "#565e74" }}>DISCOVERY (7)</span><span style={{ fontSize: 12, fontWeight: 700 }}>$240k</span></div>
                      <div className="sq-deal"><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 800 }}>Astra Agro Inc</span><span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#eff6ff", color: "#004ac6", fontWeight: 700 }}>Tier 1</span></div><p style={{ fontSize: 11, color: "#565e74", margin: 0 }}>$65,000 • 3 days in stage</p></div>
                      <div className="sq-deal"><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 800 }}>Nusa Logistics</span><span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#f1f5f9", color: "#565e74", fontWeight: 700 }}>SME</span></div><p style={{ fontSize: 11, color: "#565e74", margin: 0 }}>$18,500 • Action today</p></div>
                    </div>
                    <div className="sq-kanban-col">
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 10, fontWeight: 800, color: "#565e74" }}>PROPOSAL (5)</span><span style={{ fontSize: 12, fontWeight: 700 }}>$510k</span></div>
                      <div className="sq-deal"><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 800 }}>Bhinneka Retail</span><span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#ecfdf5", color: "#006242", fontWeight: 700 }}>90% Fit</span></div><p style={{ fontSize: 11, color: "#565e74", margin: 0 }}>$120,000 • Contract sent</p></div>
                      <div className="sq-deal"><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 800 }}>Indomobil Fleet</span><span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#fef3c7", color: "#92400e", fontWeight: 700 }}>Stalled</span></div><p style={{ fontSize: 11, color: "#565e74", margin: 0 }}>$88,000 • WA Followup</p></div>
                    </div>
                    <div className="sq-kanban-col">
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 10, fontWeight: 800, color: "#565e74" }}>CLOSING WON (6)</span><span style={{ fontSize: 12, fontWeight: 800, color: "#006242" }}>$670k</span></div>
                      <div className="sq-deal won"><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 800 }}>Sinarmas Multi</span><span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#a7f3d0", color: "#006242", fontWeight: 800 }}>WON</span></div><p style={{ fontSize: 11, color: "#565e74", margin: 0 }}>$320,000 • Annual plan</p></div>
                      <div className="sq-deal won"><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 800 }}>Ruang Financial</span><span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#a7f3d0", color: "#006242", fontWeight: 800 }}>WON</span></div><p style={{ fontSize: 11, color: "#565e74", margin: 0 }}>$145,000 • 3yr agreement</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={"sq-panel" + (tab === "omnichannel" ? " show" : "")}>
              <div className="sq-split">
                <div className="sq-split-5" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <span className="sq-badge" style={{ background: "#d1fae5", color: "#064e3b", alignSelf: "flex-start" }}>OFFICIAL META BSP INFRASTRUCTURE</span>
                  <h3 className="sq-h3">Native WhatsApp, Instagram DM, and Voice from one inbox</h3>
                  <p className="sq-body">Connect multiple verified green-badge WhatsApp numbers to a central team inbox. Route inbound leads by sales territory, assign tickets automatically, and trigger verified HSM blast campaigns.</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div className="sq-stat-box" style={{ flex: 1, textAlign: "center" }}><p style={{ fontWeight: 800, color: "#004ac6" }}>0.4s</p><p style={{ fontSize: 12, color: "#565e74" }}>Dispatch Latency</p></div>
                    <div className="sq-stat-box" style={{ flex: 1, textAlign: "center" }}><p style={{ fontWeight: 800, color: "#006242" }}>100%</p><p style={{ fontSize: 12, color: "#565e74" }}>Official Meta API</p></div>
                    <div className="sq-stat-box" style={{ flex: 1, textAlign: "center" }}><p style={{ fontWeight: 800 }}>Unlimited</p><p style={{ fontSize: 12, color: "#565e74" }}>Live Agents</p></div>
                  </div>
                </div>
                <div className="sq-split-7 sq-mock">
                  <div className="sq-chat">
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid rgba(195,198,215,.3)", marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#006242", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>WA</div>
                        <div><h4 style={{ margin: 0, fontSize: 14 }}>Enterprise Priority Routing</h4><p style={{ margin: 0, fontSize: 11, color: "#565e74" }}>WhatsApp Official Broadcast #84920</p></div>
                      </div>
                      <span style={{ padding: "4px 8px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: "#6ffbbe", color: "#002113" }}>Green Badge Verified</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
                      <div style={{ padding: 10, borderRadius: 6, background: "#eff4ff" }}><b>Customer (Budi Santoso):</b> &quot;Hello, we want to expand our team seats to 150 licenses. Can you send an amended quote?&quot;</div>
                      <div style={{ padding: 10, borderRadius: 6, background: "#eff6ff", marginLeft: 24, borderLeft: "2px solid #2563eb" }}><b style={{ color: "#004ac6" }}>Qontak Bot + Sales Rep (Jessica):</b> &quot;Hi Budi, I&apos;ve generated quote Q-2024-819 with the enterprise 15% tiered volume discount. Forwarding to your WhatsApp right now!&quot;</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={"sq-panel" + (tab === "automation" ? " show" : "")}>
              <div className="sq-split">
                <div className="sq-split-5" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <span className="sq-badge" style={{ background: "#ede9fe", color: "#4c1d95", alignSelf: "flex-start" }}>NO-CODE LOGIC BUILDER</span>
                  <h3 className="sq-h3">Build multi-step follow up rules without writing code</h3>
                  <p className="sq-body">Automate cold outreach, re-engage dead leads, and trigger internal approvals. Create conditions like: &quot;If prospect opens proposal link twice in 24 hours, alert assigned account executive.&quot;</p>
                </div>
                <div className="sq-split-7 sq-mock" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="sq-step"><div><p style={{ margin: 0, fontSize: 12, fontWeight: 800 }}>TRIGGER: New Form Submission or Webhook</p><p style={{ margin: 0, fontSize: 11, color: "#565e74" }}>Source: High-Intent Pricing Page Calculator</p></div><span style={{ fontSize: 12, fontFamily: "monospace", color: "#006242", fontWeight: 800 }}>Auto-run</span></div>
                  <div style={{ width: 2, height: 16, background: "#c3c6d7", margin: "0 auto" }} />
                  <div className="sq-step"><div><p style={{ margin: 0, fontSize: 12, fontWeight: 800 }}>CONDITION: Lead Score &gt; 80 AND Company Size &gt; 50</p><p style={{ margin: 0, fontSize: 11, color: "#565e74" }}>Enrichment: Clearbit &amp; LinkedIn profile match</p></div><span style={{ fontSize: 12, fontFamily: "monospace", color: "#565e74" }}>Filter</span></div>
                  <div style={{ width: 2, height: 16, background: "#c3c6d7", margin: "0 auto" }} />
                  <div className="sq-step sq-step-action"><div><p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#006242" }}>ACTION: Assign Senior AE &amp; Send Instant WhatsApp Greeting</p><p style={{ margin: 0, fontSize: 11, color: "#565e74" }}>Average response time: 24 seconds</p></div><span className="material-symbols-outlined" style={{ color: "#006242" }}>check_circle</span></div>
                </div>
              </div>
            </div>

            <div className={"sq-panel" + (tab === "analytics" ? " show" : "")}>
              <div className="sq-split">
                <div className="sq-split-5" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <span className="sq-badge" style={{ background: "#fef3c7", color: "#92400e", alignSelf: "flex-start" }}>REVENUE FORECASTING</span>
                  <h3 className="sq-h3">Real-time quota tracking with predictive win probability</h3>
                  <p className="sq-body">Gain clarity on which reps will hit target. Sales Qontak analyzes historical conversion duration, conversation sentiment, and contact frequency to forecast quarterly ARR accurately.</p>
                </div>
                <div className="sq-split-7 sq-mock">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div className="sq-stat-box"><p style={{ fontSize: 12, color: "#565e74" }}>Q3 Committed ARR</p><p style={{ fontWeight: 800, fontSize: 20, margin: "4px 0" }}>$1.84M</p><p style={{ fontSize: 12, color: "#006242", fontWeight: 700 }}>108% of quota target</p></div>
                    <div className="sq-stat-box"><p style={{ fontSize: 12, color: "#565e74" }}>Avg Sales Cycle</p><p style={{ fontWeight: 800, fontSize: 20, margin: "4px 0" }}>19 Days</p><p style={{ fontSize: 12, color: "#004ac6", fontWeight: 700 }}>-14 days vs last quarter</p></div>
                  </div>
                  <div className="sq-stat-box">
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Top Performing Account Executives</span>
                    <div style={{ fontSize: 12, marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: 4 }}><span>Faza Felix (Enterprise AE)</span><span style={{ color: "#006242" }}>$480k / $400k (120%)</span></div><div style={{ width: "100%", height: 8, background: "#e5eeff", borderRadius: 999 }}><div style={{ height: "100%", width: "100%", background: "#006242", borderRadius: 999 }} /></div></div>
                    <div style={{ fontSize: 12 }}><div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: 4 }}><span>Jihan Zas (Fintech AE)</span><span style={{ color: "#2563eb" }}>$390k / $350k (111%)</span></div><div style={{ width: "100%", height: 8, background: "#e5eeff", borderRadius: 999 }}><div style={{ height: "100%", width: "90%", background: "#2563eb", borderRadius: 999 }} /></div></div>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </section>

        {/* 4. TESTIMONIALS */}
        <section className="sq-section-lg sq-bg-base">
          <div className="sq-container">
            <motion.div className="sq-testi-head" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: 0.55, ease: EASE }}>
              <div><span className="sq-eyebrow">Peer Endorsements</span><h2 className="sq-h2">Trusted by Revenue Leaders &amp; High-Performing Teams</h2></div>
              <p className="sq-body" style={{ maxWidth: 28 + "rem" }}>Discover how modern sales, RevOps, and customer success executives deploy Sales Qontak to supercharge conversion rates.</p>
            </motion.div>
            <Stagger className="sq-testi-grid">
              <motion.div variants={staggerChild} className="sq-tcard white sq-span-8">
                <div className="sq-tcard-inner">
                  <div className="l">
                    <span className="sq-badge" style={{ background: "#6ffbbe", color: "#002113", marginBottom: 8 }}>CUSTOMER CASE STUDY</span>
                    <h3 className="sq-h3" style={{ margin: "8px 0" }}>&quot;Sales Qontak consolidated 6 fragmented chat apps and legacy Salesforce into a single high-speed dashboard.&quot;</h3>
                    <p className="sq-body" style={{ marginBottom: 12 }}>Over 120 account reps now manage their omnichannel WhatsApp and enterprise deal pipelines synchronously without ever copy-pasting lead records.</p>
                    <div className="sq-tfoot">
                      <div className="sq-avatar-stack"><img alt="Lucas" src={AV.lucas} /><img alt="Emily" src={AV.emily} /></div>
                      <div><p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>Lucas Hayes &amp; Emily Carter</p><p style={{ margin: 0, fontSize: 12, color: "#565e74" }}>Global Revenue Directors at Fintech Scale-up</p></div>
                      <div style={{ marginLeft: "auto", textAlign: "right" }}><p style={{ margin: 0, fontWeight: 800, fontSize: 20, color: "#006242" }}>+68%</p><p style={{ margin: 0, fontSize: 11, color: "#565e74" }}>Pipeline Conversion</p></div>
                    </div>
                  </div>
                  <div className="r"><img className="cover" alt="Sales Qontak Revenue Team" src={teamRoster} /></div>
                </div>
              </motion.div>
              <motion.div variants={staggerChild} className="sq-tcard low sq-span-4">
                <div><div style={{ color: "#f59e0b", marginBottom: 12 }}>{"★★★★★"}</div><p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.5 }}>&quot;We slashed lead first-response latency from 35 minutes to under 45 seconds using Qontak&apos;s automated WhatsApp dispatch.&quot;</p></div>
                <div className="sq-tfoot"><img alt="Alexander" src={AV.alex} /><div><p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>Alexander Rossi</p><p style={{ margin: 0, fontSize: 12, color: "#565e74" }}>Head of RevOps, Omnia Logistics</p></div></div>
              </motion.div>
              <motion.div variants={staggerChild} className="sq-tcard white sq-span-4">
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>&quot;SOC 2 Type II compliance and direct bank-grade security protocols made Qontak the sole CRM approved by our enterprise InfoSec audit.&quot;</p>
                <div className="sq-tfoot"><img alt="Mia" src={AV.mia} /><div><p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>Mia Thompson</p><p style={{ margin: 0, fontSize: 12, color: "#565e74" }}>Chief Information Officer, Nexus Trust</p></div></div>
              </motion.div>
              <motion.div variants={staggerChild} className="sq-tcard white sq-span-4">
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>&quot;Broadcast WhatsApp marketing with live dynamic customer field injection yielded a 4.2x ROI on our Black Friday campaign.&quot;</p>
                <div className="sq-tfoot"><img alt="Jacob" src={AV.jacob} /><div><p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>Jacob Ramirez</p><p style={{ margin: 0, fontSize: 12, color: "#565e74" }}>VP Growth, Kencana Commerce</p></div></div>
              </motion.div>
              <motion.div variants={staggerChild} className="sq-tcard white sq-span-4">
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>&quot;The VoIP call logging and auto-transcription features allow our patient coordinators to review call histories seamlessly.&quot;</p>
                <div className="sq-tfoot"><img alt="Isabella" src={AV.bella} /><div><p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>Isabella Rivera</p><p style={{ margin: 0, fontSize: 12, color: "#565e74" }}>Director of Operations, Medika Asia</p></div></div>
              </motion.div>
            </Stagger>
          </div>
        </section>

        {/* 5. INTEGRATIONS */}
        <section className="sq-section-lg sq-bg-white">
          <div className="sq-container">
            <div className="sq-split">
              <motion.div
                className="sq-split-5"
                initial={{ opacity: 0, x: -28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <span className="sq-eyebrow">Ecosystem &amp; APIs</span>
                <h2 className="sq-h2">Plug Sales Qontak directly into your existing stack</h2>
                <p className="sq-sub" style={{ marginBottom: 8 }}>Deploy pre-built integrations in clicks or build custom automation logic using our comprehensive REST API and webhooks.</p>
                <div className="sq-feat-list">
                  <div className="row"><span className="material-symbols-outlined" style={{ color: "#2563eb" }}>sync_alt</span><span>Bi-directional sync with enterprise ERPs &amp; CRMs</span></div>
                  <div className="row"><span className="material-symbols-outlined" style={{ color: "#2563eb" }}>code</span><span>Open OpenAPI 3.0 specs with client SDKs</span></div>
                  <div className="row"><span className="material-symbols-outlined" style={{ color: "#2563eb" }}>security</span><span>OAuth 2.0 and granular scoped token authorization</span></div>
                </div>
              </motion.div>
              <Stagger className="sq-split-7 sq-int-grid">
                {[
                  { i: "chat", c: "#059669", t: "WhatsApp Cloud API", d: "WhatsApp Broadcast" },
                  { i: "cloud", c: "#2563eb", t: "Salesforce Sync", d: "Real-time object sync" },
                  { i: "hub", c: "#d97706", t: "HubSpot CRM", d: "Two-way deal migration" },
                  { i: "mail", c: "#dc2626", t: "Access Calendar", d: "Activity Calendar sync" },
                  { i: "forum", c: "#7c3aed", t: "Slack Enterprise", d: "Deal alert notifications" },
                  { i: "webhook", c: "#0f172a", t: "Webhooks & REST", d: "Custom event triggers" },
                ].map((x) => (
                  <motion.div variants={staggerChild} className="sq-int" key={x.t}>
                    <span className="material-symbols-outlined" style={{ color: x.c, fontSize: 30 }}>{x.i}</span>
                    <h4>{x.t}</h4><p>{x.d}</p>
                  </motion.div>
                ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* 6. INSIGHTS */}
        <section className="sq-section-lg sq-bg-base" id="insights-resources">
          <div className="sq-container">
            <motion.div className="sq-testi-head" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: 0.55, ease: EASE }}>
              <div><span className="sq-eyebrow">Latest Insights &amp; Playbooks</span><h2 className="sq-h2">Mastering modern revenue operations &amp; WhatsApp CRM</h2></div>
              <p className="sq-body" style={{ maxWidth: 28 + "rem" }}>Practical playbooks, benchmark reports, and revenue architecture guides written by enterprise sales practitioners.</p>
            </motion.div>
            <div className="sq-pills">
              {insightCats.map((c) => (
                <button key={c} className={"sq-pill" + (insight === c ? " active" : "")} onClick={() => setInsight(c)}>{c}</button>
              ))}
            </div>
            {articlesLoading ? (
              <div className="sq-cards3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="sq-article" aria-hidden="true">
                    <div>
                      <div className="sq-skel" style={{ width: "45%", height: 12, marginBottom: 12 }} />
                      <div className="sq-skel" style={{ width: "100%", height: 22, marginBottom: 8 }} />
                      <div className="sq-skel" style={{ width: "92%", height: 22, marginBottom: 12 }} />
                      <div className="sq-skel" style={{ width: "100%", height: 14, marginBottom: 8 }} />
                      <div className="sq-skel" style={{ width: "70%", height: 14 }} />
                    </div>
                    <div className="sq-skel" style={{ width: "55%", height: 12, marginTop: 16 }} />
                  </div>
                ))}
              </div>
            ) : articlesError ? (
              <div className="sq-article" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2.5rem 1.5rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#94a3b8" }}>cloud_off</span>
                <p style={{ fontWeight: 700, margin: "8px 0 4px" }}>Gagal memuat artikel</p>
                <p className="sq-body" style={{ margin: "0 0 12px" }}>Periksa koneksi lalu coba lagi.</p>
                <button className="sq-btn-outline" style={{ width: "auto", padding: "10px 28px", marginTop: 0 }} onClick={fetchArticles}>Coba lagi</button>
              </div>
            ) : visibleArticles.length === 0 ? (
              <div className="sq-article" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2.5rem 1.5rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#94a3b8" }}>newspaper</span>
                <p style={{ fontWeight: 700, margin: "8px 0 4px" }}>Belum ada artikel</p>
                <p className="sq-body" style={{ margin: "0 0 12px" }}>Playbook dan panduan terbaru segera hadir di sini.</p>
                {insight !== "All Insights" && (
                  <button className="sq-btn-outline" style={{ width: "auto", padding: "10px 28px", marginTop: 0 }} onClick={() => setInsight("All Insights")}>Lihat semua</button>
                )}
              </div>
            ) : (
              <motion.div className="sq-cards3" layout>
                <AnimatePresence mode="popLayout">
                  {visibleArticles.map((a) => (
                    <motion.article
                      key={a.id}
                      className="sq-article"
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      onClick={() => go(`/blog/${a.slug}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          {a.category_name ? (
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: ".04em" }}>{a.category_name}</span>
                          ) : <span />}
                          <span style={{ fontSize: 12, color: "#565e74", flexShrink: 0 }}>{readMins(a)} min read</span>
                        </div>
                        <h3>{a.title}</h3>
                        <p className="sq-body" style={{ marginBottom: 12 }}>{a.excerpt}</p>
                      </div>
                      <div style={{ paddingTop: 8, borderTop: "1px solid rgba(195,198,215,.25)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "#565e74", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.author_name || "Sales Qontak Team"}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "#565e74", flexShrink: 0 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span> {a.view_count ?? 0}
                          </span>
                          <span className="sq-link">Read <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span></span>
                        </span>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <motion.button className="sq-link" style={{ fontSize: 14 }} whileHover={{ x: 4 }} onClick={() => go("/blog")}>View All Articles &amp; Resources <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span></motion.button>
            </div>
          </div>
        </section>

        {/* 7. PRICING */}
        <section className="sq-section-lg sq-bg-base" id="pricing">
          <div className="sq-container">
            <motion.div className="sq-center" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: 0.55, ease: EASE }}>
              <span className="sq-eyebrow">Transparent Pricing</span>
              <h2 className="sq-h2">Simple plans built to scale with your sales quota</h2>
              <p className="sq-sub">No hidden per-message markups on WhatsApp API. Predictable monthly pricing.</p>
              <div style={{ marginTop: 16 }}>
                <div className="sq-billing">
                  <button className={billing === "monthly" ? "active" : ""} onClick={() => setBilling("monthly")} aria-pressed={billing === "monthly"}>
                    {billing === "monthly" && <motion.span layoutId="sq-billing-pill" className="sq-billing-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    <span className="sq-billing-label">Monthly</span>
                  </button>
                  <button className={billing === "annual" ? "active" : ""} onClick={() => setBilling("annual")} aria-pressed={billing === "annual"}>
                    {billing === "annual" && <motion.span layoutId="sq-billing-pill" className="sq-billing-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    <span className="sq-billing-label">Annual Billing Save 20%</span>
                  </button>
                </div>
              </div>
            </motion.div>
            <Stagger className="sq-price-grid">
              <motion.div variants={staggerChild} className="sq-price">
                <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Starter</p>
                <p className="sq-body" style={{ margin: "0 0 12px" }}>Essential CRM &amp; lead capture for small teams.</p>
                <p style={{ margin: "0 0 12px" }}><motion.span key={billing} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ fontSize: 30, fontWeight: 800, display: "inline-block" }}>{starter}</motion.span> <span style={{ fontSize: 12, color: "#565e74" }}>/ user / mo</span></p>
                <ul>
                  {["Up to 5 users", "Visual Kanban pipeline", "WhatsApp Web Link", "Email & call logging", "Basic reports"].map((f) => (
                    <li key={f}><span className="material-symbols-outlined" style={{ color: "#2563eb" }}>check_circle</span>{f}</li>
                  ))}
                </ul>
                <button className="sq-btn-outline" onClick={() => go("/register")}>Start Starter Trial</button>
              </motion.div>
              <motion.div variants={staggerChild} className="sq-price popular">
                <span className="sq-pop">MOST POPULAR</span>
                <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Growth Pro</p>
                <p className="sq-body" style={{ margin: "0 0 12px" }}>Native WhatsApp Business API for scaling sales.</p>
                <p style={{ margin: "0 0 12px" }}><motion.span key={billing} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ fontSize: 30, fontWeight: 800, color: "#2563eb", display: "inline-block" }}>{growth}</motion.span> <span style={{ fontSize: 12, color: "#565e74" }}>/ user / mo</span></p>
                <ul>
                  {["Unlimited pipeline stages", "Official Meta WhatsApp API", "No-code workflow automation", "Shared inbox + collision alert", "Custom validation & SLAs"].map((f) => (
                    <li key={f}><span className="material-symbols-outlined" style={{ color: "#2563eb" }}>check_circle</span>{f}</li>
                  ))}
                </ul>
                <button className="sq-btn-primary" onClick={() => go("/register")}>Get Started Free</button>
              </motion.div>
              <motion.div variants={staggerChild} className="sq-price">
                <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Enterprise</p>
                <p className="sq-body" style={{ margin: "0 0 12px" }}>Dedicated database &amp; security for large floors.</p>
                <p style={{ margin: "0 0 12px" }}><span style={{ fontSize: 24, fontWeight: 800 }}>Custom</span> <span style={{ fontSize: 12, color: "#565e74" }}>tailored to your floor</span></p>
                <ul>
                  {["Dedicated solution architect", "Custom REST & webhook limits", "SOC 2 & HIPAA compliance", "On-premise / VPC deploy", "SSO & audit trails"].map((f) => (
                    <li key={f}><span className="material-symbols-outlined" style={{ color: "#2563eb" }}>check_circle</span>{f}</li>
                  ))}
                </ul>
                <button className="sq-btn-outline" onClick={() => go("/contact")}>Contact Enterprise Sales</button>
              </motion.div>
            </Stagger>
          </div>
        </section>

        {/* 8. BOTTOM CTA */}
        <section className="sq-section-lg sq-bg-white">
          <div className="sq-container">
            <motion.div
              className="sq-cta-card"
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <h2 className="sq-h2">Transform your sales organization into an unstoppable revenue machine.</h2>
              <p style={{ maxWidth: 40 + "rem", margin: "12px auto 0" }}>Join thousands of fast-growing commercial teams closing deals faster with Sales Qontak&apos;s unified omnichannel CRM. Start free for 14 days or speak to an enterprise architect.</p>
              <div className="sq-cta-row">
                <motion.button className="sq-btn-white" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => go("/register")}>Start Free <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span></motion.button>
                <a className="sq-btn-ghost" href="#product-capabilities"><span className="material-symbols-outlined">computer</span> Check out the features.</a>
              </div>
              <div className="sq-trust"><span>✓ Free Started</span><span>✓ Zero setup fees</span><span>✓ Instant WhatsApp API provisioning</span></div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="sq-footer">
        <div className="sq-container">
          <div className="sq-footer-grid">
            <div className="sq-footer-brand">
              <img alt="Sales Qontak" src={logoFooter} style={{ height: 32, marginBottom: 12 }} />
              <p className="sq-body">The complete enterprise CRM &amp; Omnichannel customer engagement platform built for scale.</p>
            </div>
            <div><h5>Solutions</h5><ul>{["Omnichannel Chat", "Sales CRM", "Helpdesk & Ticketing", "Sales Automation", "Predictive Lead Scoring"].map((l) => (<li key={l}><button onClick={() => document.getElementById("product-capabilities")?.scrollIntoView({ behavior: "smooth" })}>{l}</button></li>))}</ul></div>
            <div><h5>Integrations</h5><ul>{["WhatsApp Official API", "Instagram DM API", "Shopify Commerce", "VoIP & Call Center", "Rest APIs & Webhooks"].map((l) => (<li key={l}><button onClick={() => document.getElementById("product-capabilities")?.scrollIntoView({ behavior: "smooth" })}>{l}</button></li>))}</ul></div>
            <div><h5>Resources</h5><ul>
              <li><button onClick={() => go("/blog")}>Documentation &amp; Docs</button></li>
              <li><button onClick={() => go("/blog")}>Developer Portal</button></li>
              <li><button onClick={() => go("/blog")}>Customer Stories</button></li>
              <li><button onClick={() => go("/blog")}>Sales Academy</button></li>
              <li><button onClick={() => go("/blog")}>Security Whitepaper</button></li>
            </ul></div>
            <div><h5>Company</h5><ul>
              <li><button onClick={() => go("/contact")}>About Us</button></li>
              <li><button onClick={() => go("/contact")}>Careers</button></li>
              <li><button onClick={() => go("/contact")}>Press &amp; Media</button></li>
              <li><button onClick={() => go("/privacy")}>Privacy Policy</button></li>
              <li><button onClick={() => go("/terms")}>Terms of Service</button></li>
            </ul></div>
          </div>
          <div className="sq-bottom"><span>© 2026 Sales Qontak Inc. All rights reserved. SOC 2 Type II Certified.</span><span>Built for scale • Meta BSP • Enterprise CRM</span></div>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}
