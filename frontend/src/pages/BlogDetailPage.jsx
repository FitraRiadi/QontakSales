import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, useScroll } from "framer-motion";
import DOMPurify from "dompurify";
import api from "@/services/api";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteNav from "@/components/layout/SiteNav";
import { fmtDate } from "./ArticlesPage";
import { EASE } from "./landingMotion";
import "./LandingPageStitch.css";
import "./BlogStitch.css";
import logoNav from "@/assets/landing-stitch/logo-nav.png";

const stripHtml = (html) => {
  const d = document.createElement("div");
  d.innerHTML = html || "";
  return d.textContent || "";
};

const readMins = (text) => {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200) || 1);
};

export default function BlogDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const go = (p) => navigate(p);
  const goPricing = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }), 250);
    } else {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
    }
  };
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [copied, setCopied] = useState(false);
  const { scrollYProgress } = useScroll();

  const fetchRelated = (current) => {
    api.get("/public-articles/")
      .then((r) => {
        const list = r.data.results || r.data;
        const tags = current.tags || [];
        const scored = list
          .filter((a) => String(a.slug) !== String(current.slug))
          .map((a) => {
            let s = 0;
            if (a.category && current.category && a.category === current.category) s += 2;
            s += (a.tags || []).filter((t) => tags.includes(t)).length;
            return { a, s };
          })
          .filter((x) => x.s > 0)
          .sort((x, y) => y.s - x.s || y.a.view_count - x.a.view_count);
        setRelated(scored.slice(0, 7).map((x) => x.a));
      })
      .catch(() => {});
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/public-articles/${slug}/`)
      .then((r) => { setArticle(r.data); setLoading(false); fetchRelated(r.data); })
      .catch(() => setLoading(false));
  }, [slug]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sb-page">
      <motion.div className="sb-progress" style={{ scaleX: scrollYProgress }} />
      <SiteNav
        logo={logoNav}
        onLogo={() => go("/")}
        sticky
        maxWidth={1200}
        links={[
          { label: "Product", onClick: () => go("/") },
          { label: "Pricing", onClick: goPricing },
          { label: "Blog", active: true, onClick: () => go("/blog") },
        ]}
        mobileLinks={[
          { label: "Product", onClick: () => go("/") },
          { label: "Pricing", onClick: goPricing },
          { label: "Blog", onClick: () => go("/blog") },
        ]}
        signinLabel="Sign In"
        onSignin={() => go("/login")}
        demoLabel="Book a Demo"
        onDemo={() => go("/register")}
        mobileSigninLabel="Sign In"
        onMobileSignin={() => go("/login")}
      />

      <div className="sb-wrap">
        {loading ? (
          <div className="sb-article">
            <div className="sq-skel" style={{ width: "30%", height: 14, marginBottom: 12 }} />
            <div className="sq-skel" style={{ width: "100%", height: 36, marginBottom: 12 }} />
            <div className="sq-skel" style={{ width: "60%", height: 14, marginBottom: 24 }} />
            <div className="sq-skel" style={{ width: "100%", height: 14, marginBottom: 10 }} />
            <div className="sq-skel" style={{ width: "100%", height: 14, marginBottom: 10 }} />
            <div className="sq-skel" style={{ width: "85%", height: 14, marginBottom: 10 }} />
            <div className="sq-skel" style={{ width: "100%", height: 14 }} />
          </div>
        ) : !article ? (
          <div className="sq-article" style={{ textAlign: "center", padding: "3rem 1.5rem", maxWidth: 480, margin: "0 auto" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#94a3b8" }}>newspaper</span>
            <p style={{ fontWeight: 700, margin: "8px 0 12px" }}>Article not found.</p>
            <button className="sq-link" style={{ fontSize: 14 }} onClick={() => go("/blog")}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span> Back to Blog
            </button>
          </div>
        ) : (
          <>
            <button className="sb-back" onClick={() => go("/blog")}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span> Back to Blog
            </button>
            <div className="sb-detail-grid">
              <motion.article
                className="sb-article"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                {article.category_name && <span className="sb-cat">{article.category_name}</span>}
                <h1 className="sb-title">{article.title}</h1>
                <div className="sb-meta">
                  <span>Written by <b>{article.author_name}</b></span>
                  <span>·</span>
                  <span>{fmtDate(article.effective_published_at)}</span>
                  <span>·</span>
                  <span>{readMins(stripHtml(article.content))} min read</span>
                  <span>·</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span> {article.view_count} views
                  </span>
                </div>
                <div className="sb-subdates">
                  <span>Published {fmtDate(article.published_at || article.effective_published_at)}</span>
                  <span>·</span>
                  <span>Updated {fmtDate(article.updated_at)}</span>
                  <span>·</span>
                  <span>Created {fmtDate(article.created_at)}</span>
                </div>
                {article.cover_image_url && (
                  <div className="sb-cover">
                    <img src={article.cover_image_url} alt={article.title} />
                  </div>
                )}
                <div
                  className="sb-body"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content || "") }}
                />
                {article.tags?.length > 0 && (
                  <div className="sb-tags">
                    {article.tags.map((t) => (
                      <span key={t} className="sb-tag">#{t}</span>
                    ))}
                  </div>
                )}
                <div className="sb-share">
                  <span className="lbl">Share:</span>
                  <button onClick={copyLink}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{copied ? "check" : "link"}</span>
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                  <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${article.title} ${shareUrl}`)}`, "_blank", "noopener")}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat</span> WhatsApp
                  </button>
                </div>
                <div className="sb-cta">
                  <h3>Need a CRM to close faster?</h3>
                  <p>Join hundreds of teams managing pipelines + WhatsApp broadcasts in one place.</p>
                  <button onClick={() => go("/register")}>
                    Get Started Free <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                  </button>
                </div>
              </motion.article>

              <aside className="sb-side">
                <div className="sb-related">
                  <h4>Related Articles</h4>
                  <div className="sb-rel">
                    {related.map((r) => (
                      <button key={r.id} onClick={() => go(`/blog/${r.slug}`)}>
                        <b>{r.title}</b>
                        <small>
                          {r.category_name ? `${r.category_name} · ` : ""}
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>visibility</span> {r.view_count}
                          </span>
                        </small>
                      </button>
                    ))}
                    {related.length === 0 && (
                      <small style={{ color: "#94a3b8", fontSize: 13 }}>No related articles yet.</small>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
