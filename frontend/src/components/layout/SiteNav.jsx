import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../pages/LandingPageStitch.css";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Satu-satunya navbar situs — dipakai landing (mega-menu, fixed)
 * dan blog (link simpel, sticky). Beda isi menunya aja.
 *
 * menus: { key: { label, links: [{icon,tint,color,title,desc,onClick}],
 *                   feature: {kicker,title,cta,onClick} } } | null
 * links: [{ label, href?, onClick?, active? }] — link desktop biasa
 * mobileLinks: [{ label, href?, onClick? }] — drawer flat (di bawah accordion)
 */
export default function SiteNav({
  logo,
  logoAlt = "Sales Qontak",
  onLogo,
  sticky = false,
  maxWidth = 1200,
  menus = null,
  links = [],
  mobileLinks = [],
  signinLabel = "Sign In",
  onSignin,
  demoLabel = "Book a Demo",
  onDemo,
  mobileSigninLabel = "Sign In",
  onMobileSignin,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);
  const closeTimer = useRef(null);

  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };
  const cancelClose = () => clearTimeout(closeTimer.current);

  const runMobile = (fn) => {
    setMobileOpen(false);
    fn?.();
  };

  return (
    <header
      className={"sq-header" + (sticky ? " sq-header-sticky" : "")}
      style={{ width: `min(${maxWidth}px, calc(100% - 32px))` }}
    >
      <div className="sq-header-inner">
        <a href="#" onClick={(e) => { e.preventDefault(); onLogo?.(); }}>
          <img alt={logoAlt} className="sq-logo" src={logo} />
        </a>
        <nav className="sq-nav" onMouseLeave={scheduleClose} onKeyDown={(e) => { if (e.key === "Escape") setOpenMenu(null); }}>
          {menus && Object.entries(menus).map(([key, m]) => (
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
                    <motion.div
                      className="sq-mega-links"
                      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                      initial="hidden" animate="show" exit="hidden"
                    >
                      {m.links.map((l) => (
                        <motion.button
                          key={l.title}
                          className="sq-mega-link"
                          variants={{
                            hidden: { opacity: 0, x: -8 },
                            show: { opacity: 1, x: 0, transition: { duration: 0.18 } },
                            exit: { opacity: 0, transition: { duration: 0.1 } },
                          }}
                          onClick={l.onClick}
                        >
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
          {links.map((l) => l.href ? (
            <a key={l.label} href={l.href} className={l.active ? "active" : ""}>{l.label}</a>
          ) : (
            <button key={l.label} className={"sq-nav-link" + (l.active ? " active" : "")} onClick={l.onClick}>{l.label}</button>
          ))}
        </nav>
        <div className="sq-header-cta">
          <button className="sq-signin" onClick={onSignin}>{signinLabel}</button>
          <button className="sq-btn-demo" onClick={onDemo}>{demoLabel}</button>
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
            {menus && Object.entries(menus).map(([key, m]) => (
              <div key={key} className="sq-mobile-group">
                <button className="sq-mobile-head" onClick={() => setMobileSection(mobileSection === key ? null : key)}>
                  {m.label}
                  <span className="material-symbols-outlined" style={{ transform: mobileSection === key ? "rotate(180deg)" : "none" }}>expand_more</span>
                </button>
                {mobileSection === key && (
                  <div className="sq-mobile-links">
                    {m.links.map((l) => (
                      <button key={l.title} className="sq-mobile-link" onClick={() => runMobile(l.onClick)}>
                        <span className="material-symbols-outlined" style={{ color: l.color, fontSize: 20 }}>{l.icon}</span>
                        <span><b>{l.title}</b><br /><small>{l.desc}</small></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {mobileLinks.map((l) => l.href ? (
              <a key={l.label} className="sq-mobile-link" href={l.href} onClick={() => setMobileOpen(false)}>{l.label}</a>
            ) : (
              <button key={l.label} className="sq-mobile-link" onClick={() => runMobile(l.onClick)}>{l.label}</button>
            ))}
            <button className="sq-btn-demo" style={{ width: "100%", marginTop: 8 }} onClick={() => runMobile(onMobileSignin)}>{mobileSigninLabel}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
