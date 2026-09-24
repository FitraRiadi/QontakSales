import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { EASE } from "./landingMotion";
import BackgroundRipple from "@/components/ui/BackgroundRipple";
import "./LandingPageStitch.css";
import "./BlogStitch.css";
import logoNav from "@/assets/landing-stitch/logo-nav.png";

const readMins = (text) => {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200) || 1);
};

function ArticleCard({ a, onOpen }) {
  return (
    <motion.article
      className="sq-article"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: EASE }}
      onClick={onOpen}
      style={{ cursor: "pointer" }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
          {a.category_name ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: ".04em" }}>{a.category_name}</span>
          ) : <span />}
          <span style={{ fontSize: 12, color: "#565e74", flexShrink: 0 }}>{readMins(a.excerpt)} min read</span>
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
  );
}

export default function BlogPage() {
  const navigate = useNavigate();
  const go = (p) => navigate(p);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("-published_at");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  const fetchAll = () => {
    setLoading(true);
    setError(false);
    const params = { ordering: sort };
    if (search.trim()) params.search = search.trim();
    api.get("/public-articles/", { params })
      .then((r) => {
        const list = r.data.results || r.data;
        setArticles(Array.isArray(list) ? list : []);
        setLoading(false);
      })
      .catch(() => { setLoading(false); setError(true); });
  };

  useEffect(() => {
    const t = setTimeout(fetchAll, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort]);

  const cats = ["All", ...new Set(articles.map((a) => a.category_name).filter(Boolean))].slice(0, 6);
  const filtered = cat === "All" ? articles : articles.filter((a) => a.category_name === cat);
  const isDefaultView = cat === "All" && !search.trim();
  const featured = isDefaultView ? filtered[0] : null;
  const gridList = isDefaultView ? filtered.slice(1) : filtered;
  const totalPages = Math.max(1, Math.ceil(gridList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = gridList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const resetAll = () => { setSearch(""); setCat("All"); setPage(1); };

  return (
    <div className="sb-page">
      <header className="sb-header">
        <div className="sb-header-inner">
          <img src={logoNav} className="sb-logo" alt="Sales Qontak" onClick={() => go("/")} />
          <div className="sb-header-cta">
            <button className="sb-signin" onClick={() => go("/login")}>Sign In</button>
            <button className="sq-btn-demo" onClick={() => go("/register")}>Book a Demo</button>
          </div>
        </div>
      </header>

      <div className="sb-wrap">
        <div style={{ position: "relative" }}>
          <BackgroundRipple rows={6} cols={27} cellSize={52} />
          <div className="sb-hero" style={{ position: "relative", zIndex: 1 }}>
            <h1>Blog</h1>
            <p>Sales tips, playbooks, and product updates.</p>
          </div>
        </div>

        <div className="sb-search">
          <span className="material-symbols-outlined">search</span>
          <input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCat("All"); setPage(1); }}
          />
        </div>

        <div className="sb-toolbar">
          <div className="sq-pills" style={{ marginBottom: 0 }}>
            {cats.map((c) => (
              <button key={c} className={"sq-pill" + (cat === c ? " active" : "")} onClick={() => { setCat(c); setPage(1); }}>
                {c === "All" ? "All Articles" : c}
              </button>
            ))}
          </div>
          <div className="sb-sort">
            <button className={sort === "-published_at" ? "active" : ""} onClick={() => { setSort("-published_at"); setPage(1); }}>Latest</button>
            <button className={sort === "-view_count" ? "active" : ""} onClick={() => { setSort("-view_count"); setPage(1); }}>Most viewed</button>
          </div>
        </div>

        {loading ? (
          <div className="sq-cards3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="sq-article" aria-hidden="true">
                <div className="sq-skel" style={{ width: "40%", height: 12, marginBottom: 12 }} />
                <div className="sq-skel" style={{ width: "100%", height: 22, marginBottom: 8 }} />
                <div className="sq-skel" style={{ width: "90%", height: 22, marginBottom: 12 }} />
                <div className="sq-skel" style={{ width: "100%", height: 14, marginBottom: 8 }} />
                <div className="sq-skel" style={{ width: "60%", height: 14 }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="sq-article" style={{ textAlign: "center", padding: "3rem 1.5rem", maxWidth: 480, margin: "0 auto" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#94a3b8" }}>cloud_off</span>
            <p style={{ fontWeight: 700, margin: "8px 0 4px" }}>Failed to load articles</p>
            <p className="sq-body" style={{ margin: "0 0 12px" }}>Check your connection and try again.</p>
            <button className="sq-btn-outline" style={{ width: "auto", padding: "10px 28px", marginTop: 0 }} onClick={fetchAll}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="sq-article" style={{ textAlign: "center", padding: "3rem 1.5rem", maxWidth: 480, margin: "0 auto" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#94a3b8" }}>newspaper</span>
            <p style={{ fontWeight: 700, margin: "8px 0 4px" }}>No articles yet</p>
            <p className="sq-body" style={{ margin: "0 0 12px" }}>Try different keywords or categories.</p>
            <button className="sq-btn-outline" style={{ width: "auto", padding: "10px 28px", marginTop: 0 }} onClick={resetAll}>Reset filters</button>
          </div>
        ) : (
          <>
            {featured && (
              <motion.button
                className="sb-featured"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                onClick={() => go(`/blog/${featured.slug}`)}
              >
                <span className="sb-feat-tag">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>star</span> Featured
                  {featured.category_name ? ` · ${featured.category_name}` : ""}
                </span>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt}</p>
                <span className="sb-feat-meta">
                  <span>{featured.author_name || "Sales Qontak Team"}</span>
                  <span>·</span>
                  <span>{readMins(featured.excerpt)} min read</span>
                  <span>·</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span> {featured.view_count ?? 0}
                  </span>
                  <span className="sb-feat-cta" style={{ marginLeft: "auto" }}>Read article <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span></span>
                </span>
              </motion.button>
            )}
            <motion.div className="sq-cards3" layout>
              <AnimatePresence mode="popLayout">
                {paged.map((a) => (
                  <ArticleCard key={a.id} a={a} onOpen={() => go(`/blog/${a.slug}`)} />
                ))}
              </AnimatePresence>
            </motion.div>
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 24 }}>
                <button
                  className="sq-btn-outline"
                  style={{ width: "auto", padding: "8px 20px", marginTop: 0, opacity: safePage === 1 ? 0.4 : 1 }}
                  disabled={safePage === 1}
                  onClick={() => setPage(safePage - 1)}
                >
                  Prev
                </button>
                <span style={{ fontSize: 14, color: "#565e74" }}>{safePage} / {totalPages}</span>
                <button
                  className="sq-btn-outline"
                  style={{ width: "auto", padding: "8px 20px", marginTop: 0, opacity: safePage === totalPages ? 0.4 : 1 }}
                  disabled={safePage === totalPages}
                  onClick={() => setPage(safePage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        <div className="sb-footer">
          <button className="sq-link" style={{ fontSize: 14 }} onClick={() => go("/")}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span> Back to Home
          </button>
          <small>© 2026 Sales Qontak Inc.</small>
        </div>
      </div>
    </div>
  );
}
