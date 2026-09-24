import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Button,
  Dialog,
  Field,
  HStack,
  Input,
  Portal,
  Text,
  createToaster,
} from "@chakra-ui/react";
import { PencilSimple, Trash, Clock } from "@phosphor-icons/react";
import DOMPurify from "dompurify";
import api from "@/services/api";
import SiteFooter from "@/components/layout/SiteFooter";
import { fmtDateTime } from "./ArticlesPage";
import "./BlogStitch.css";

const toaster = createToaster({ placement: "top" });

const stripHtml = (html) => {
  const d = document.createElement("div");
  d.innerHTML = html || "";
  return d.textContent || "";
};

const readMins = (text) => {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200) || 1);
};

const pill = { fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 9999 };

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [related, setRelated] = useState([]);
  const [copied, setCopied] = useState(false);
  const userRole = localStorage.getItem("user_role");
  const userId = localStorage.getItem("user_id");
  const isManager = userRole === "MANAGER";

  const fetchRelated = (current) => {
    api.get("/articles/")
      .then((r) => {
        const list = r.data.results || r.data;
        const tags = current.tags || [];
        const scored = list
          .filter((a) => String(a.id) !== String(current.id))
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

  const fetchArticle = () => {
    setLoading(true);
    api.get(`/articles/${id}/`)
      .then((r) => { setArticle(r.data); setLoading(false); fetchRelated(r.data); })
      .catch(() => { setLoading(false); toaster.create({ title: "Article not found", type: "error" }); });
  };

  useEffect(() => { fetchArticle(); }, [id]);

  const canModify = article && (isManager || String(article.author) === String(userId));
  const isScheduled =
    article && article.status === "PUBLISHED" && article.scheduled_publish_at && !article.is_live;

  const handlePublish = async () => {
    try {
      await api.post(`/articles/${id}/publish/`);
      toaster.create({ title: "Article published", type: "success" });
      fetchArticle();
    } catch {
      toaster.create({ title: "Failed to publish", type: "error" });
    }
  };

  const handleUnpublish = async () => {
    try {
      await api.post(`/articles/${id}/unpublish/`);
      toaster.create({ title: "Article unpublished", type: "success" });
      fetchArticle();
    } catch {
      toaster.create({ title: "Failed to unpublish", type: "error" });
    }
  };

  const handleSchedule = async () => {
    if (!scheduleAt) return;
    setScheduling(true);
    try {
      await api.post(`/articles/${id}/schedule/`, { scheduled_publish_at: new Date(scheduleAt).toISOString() });
      toaster.create({ title: "Publish scheduled", type: "success" });
      setScheduleOpen(false);
      fetchArticle();
    } catch {
      toaster.create({ title: "Failed to schedule", type: "error" });
    } finally {
      setScheduling(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/articles/${id}/`);
      toaster.create({ title: "Article deleted", type: "success" });
      navigate("/articles");
    } catch {
      toaster.create({ title: "Failed to delete", type: "error" });
    }
  };

  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sb-page" style={{ minHeight: "auto", background: "transparent" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0.5rem 0 2rem" }}>
        <button className="sb-back" onClick={() => navigate("/articles")}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span> Back to Articles
        </button>

        {loading ? (
          <div className="sb-article">
            <div className="sq-skel" style={{ width: "30%", height: 14, marginBottom: 12 }} />
            <div className="sq-skel" style={{ width: "100%", height: 36, marginBottom: 12 }} />
            <div className="sq-skel" style={{ width: "60%", height: 14, marginBottom: 24 }} />
            <div className="sq-skel" style={{ width: "100%", height: 14, marginBottom: 10 }} />
            <div className="sq-skel" style={{ width: "100%", height: 14, marginBottom: 10 }} />
            <div className="sq-skel" style={{ width: "85%", height: 14 }} />
          </div>
        ) : !article ? (
          <div className="sq-article" style={{ textAlign: "center", padding: "3rem 1.5rem", maxWidth: 480, margin: "0 auto" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#94a3b8" }}>newspaper</span>
            <p style={{ fontWeight: 700, margin: "8px 0 12px" }}>Article not found.</p>
            <button className="sb-back" style={{ marginBottom: 0 }} onClick={() => navigate("/articles")}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span> Back to Articles
            </button>
          </div>
        ) : (
          <div className="sb-detail-grid">
            <motion.article
              className="sb-article"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                <span style={{ ...pill, background: article.status === "PUBLISHED" ? "#ecfdf5" : "#fef3c7", color: article.status === "PUBLISHED" ? "#006242" : "#92400e" }}>
                  {article.status}
                </span>
                {isScheduled && (
                  <span style={{ ...pill, background: "#eff6ff", color: "#004ac6" }}>SCHEDULED</span>
                )}
                <span style={{ ...pill, background: "transparent", color: "#565e74", border: "1px solid #c3c6d7" }}>
                  {article.visibility}
                </span>
                {article.category_name && (
                  <span style={{ ...pill, background: "#eff6ff", color: "#004ac6" }}>{article.category_name}</span>
                )}
              </div>

              <h1 className="sb-title">{article.title}</h1>
              {article.excerpt && (
                <p style={{ fontSize: 15, color: "#565e74", lineHeight: 1.6, margin: "0 0 16px" }}>{article.excerpt}</p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 24 }}>
                <div className="sb-meta" style={{ marginBottom: 0 }}>
                  <span>Created by <b>{article.author_name}</b></span>
                  <span>·</span>
                  <span>{fmtDateTime(article.created_at)}</span>
                </div>
                <div className="sb-meta" style={{ marginBottom: 0 }}>
                  <span>Updated by <b>{article.updated_by_name || "—"}</b></span>
                  <span>·</span>
                  <span>{article.updated_by ? fmtDateTime(article.updated_at) : "Never updated"}</span>
                </div>
                <div className="sb-meta" style={{ marginBottom: 0 }}>
                  <span>{isScheduled ? "Scheduled" : "Published"}</span>
                  <span>·</span>
                  <span>
                    {isScheduled
                      ? fmtDateTime(article.scheduled_publish_at)
                      : article.effective_published_at
                        ? fmtDateTime(article.effective_published_at)
                        : "Not published yet"}
                  </span>
                  <span>·</span>
                  <span>{readMins(stripHtml(article.content))} min read</span>
                  <span>·</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span> {article.view_count} views
                  </span>
                </div>
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
                <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${article.title} ${window.location.href}`)}`, "_blank", "noopener")}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat</span> WhatsApp
                </button>
              </div>

              {canModify && (
                <HStack gap={2} mt={6} wrap="wrap">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/articles/${id}/edit`)}>
                    <PencilSimple size={14} /> Edit
                  </Button>
                  {isManager && article.status === "DRAFT" && (
                    <>
                      <Button size="sm" bg="primary" color="white" onClick={handlePublish}>
                        Publish Now
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setScheduleOpen(true)}>
                        <Clock size={14} /> Schedule
                      </Button>
                    </>
                  )}
                  {isManager && article.status === "PUBLISHED" && (
                    <Button size="sm" variant="outline" onClick={handleUnpublish}>
                      Unpublish
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" color="red.500" onClick={() => setDeleteOpen(true)}>
                    <Trash size={14} /> Delete
                  </Button>
                </HStack>
              )}
            </motion.article>

            <aside className="sb-side">
              <div className="sb-related">
                <h4>Related Articles</h4>
                <div className="sb-rel">
                  {related.map((r) => (
                    <button key={r.id} onClick={() => navigate(`/articles/${r.id}`)}>
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
        )}
      </div>

      <Dialog.Root open={deleteOpen} onOpenChange={(e) => !e.open && setDeleteOpen(false)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header><Dialog.Title>Delete Article</Dialog.Title></Dialog.Header>
              <Dialog.Body><Text>Delete "{article?.title}"? This cannot be undone.</Text></Dialog.Body>
              <Dialog.Footer>
                <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button colorPalette="red" onClick={handleDelete}>Delete</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={scheduleOpen} onOpenChange={(e) => !e.open && setScheduleOpen(false)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header><Dialog.Title>Schedule Publish</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <Field.Root>
                  <Field.Label>Publish at</Field.Label>
                  <Input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={(e) => setScheduleAt(e.target.value)}
                  />
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="ghost" onClick={() => setScheduleOpen(false)}>Cancel</Button>
                <Button bg="primary" color="white" onClick={handleSchedule} loading={scheduling}>Schedule</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <SiteFooter />
    </div>
  );
}
