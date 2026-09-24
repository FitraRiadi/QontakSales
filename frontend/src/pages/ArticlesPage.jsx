import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  Heading,
  HStack,
  Input,
  Portal,
  SimpleGrid,
  Spinner,
  Table,
  Text,
  VStack,
  createToaster,
} from "@chakra-ui/react";
import { Plus, Newspaper, Eye, PencilSimple, Trash } from "@phosphor-icons/react";
import api from "@/services/api";
import "./LandingPageStitch.css";

const toaster = createToaster({ placement: "top" });

export const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export const fmtDateTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const readMins = (text) => {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200) || 1);
};

function StatusBadges({ article }) {
  const isScheduled =
    article.status === "PUBLISHED" && article.scheduled_publish_at && !article.is_live;
  const st =
    article.status === "PUBLISHED"
      ? { bg: "#ecfdf5", fg: "#006242" }
      : { bg: "#fef3c7", fg: "#92400e" };
  const pill = { fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 9999 };
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <span style={{ ...pill, background: st.bg, color: st.fg }}>{article.status}</span>
      {isScheduled && (
        <span style={{ ...pill, background: "#eff6ff", color: "#004ac6" }}>SCHEDULED</span>
      )}
      <span style={{ ...pill, background: "transparent", color: "#565e74", border: "1px solid #c3c6d7" }}>
        {article.visibility}
      </span>
    </div>
  );
}

export default function ArticlesPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [deleteDialog, setDeleteDialog] = useState(null);
  const userRole = localStorage.getItem("user_role");
  const userId = localStorage.getItem("user_id");
  const isManager = userRole === "MANAGER";
  const PAGE_SIZE = 9;

  const fetchArticles = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;
    api.get("/articles/", { params })
      .then((r) => { setArticles(r.data.results || r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchArticles(); setPage(1); }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    api.get("/article-categories/").then((r) => setCategories(r.data.results || r.data)).catch(() => {});
  }, []);

  const canModify = (a) => isManager || String(a.author) === String(userId);

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await api.delete(`/articles/${deleteDialog.id}/`);
      toaster.create({ title: "Article deleted", type: "success" });
      setDeleteDialog(null);
      fetchArticles();
    } catch {
      toaster.create({ title: "Failed to delete", type: "error" });
    }
  };

  const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const paged = articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box p={{ base: 4, md: 6 }}>
      <HStack justify="space-between" mb={6}>
        <HStack gap={3}>
          <Newspaper size={24} />
          <Heading fontWeight="semibold" size="lg" color="foreground">Articles</Heading>
        </HStack>
        <HStack gap={3}>
          <HStack gap={1} bg="muted" borderRadius="lg" p={1}>
            <Button size="xs" variant={viewMode === "card" ? "solid" : "ghost"} bg={viewMode === "card" ? "foreground" : undefined} color={viewMode === "card" ? "background" : undefined} onClick={() => setViewMode("card")}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
            </Button>
            <Button size="xs" variant={viewMode === "table" ? "solid" : "ghost"} bg={viewMode === "table" ? "foreground" : undefined} color={viewMode === "table" ? "background" : undefined} onClick={() => setViewMode("table")}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2" rx="0.5" /><rect x="1" y="7" width="14" height="2" rx="0.5" /><rect x="1" y="12" width="14" height="2" rx="0.5" /></svg>
            </Button>
          </HStack>
          <Button size="sm" bg="primary" color="white" onClick={() => navigate("/articles/new")}>
            <Plus size={14} /> Write Article
          </Button>
        </HStack>
      </HStack>

      <HStack gap={3} mb={6} wrap="wrap">
        <Box position="relative" flex={1} minW="200px">
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="#FAFAFA"
          />
        </Box>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", backgroundColor: "#FAFAFA" }}
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", backgroundColor: "#FAFAFA" }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </HStack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={16}><Spinner size="lg" color="primary" /></Box>
      ) : articles.length === 0 ? (
        <Box textAlign="center" py={16}>
          <Newspaper size={40} style={{ margin: "0 auto", opacity: 0.3 }} />
          <Text mt={4} color="foreground" opacity={0.5}>No articles found</Text>
        </Box>
      ) : (
        <>
          {viewMode === "card" ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {paged.map((a) => (
              <div
                key={a.id}
                className="sq-article"
                onClick={() => navigate(`/articles/${a.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    {a.category_name ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: ".04em" }}>{a.category_name}</span>
                    ) : <span />}
                    <span style={{ fontSize: 12, color: "#565e74", flexShrink: 0 }}>{readMins(a.excerpt)} min read</span>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <StatusBadges article={a} />
                  </div>
                  <h3>{a.title}</h3>
                  <p className="sq-body" style={{ marginBottom: 12 }}>
                    {a.excerpt || "No excerpt"}
                  </p>
                </div>
                <div>
                  <div style={{ paddingTop: 8, borderTop: "1px solid rgba(195,198,215,.25)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <Text fontSize="xs" color="foreground" opacity={0.5} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.author_name} · {fmtDate(a.created_at)}
                    </Text>
                    <HStack gap={1} fontSize="xs" color="foreground" opacity={0.5} flexShrink={0}>
                      <Eye size={12} /> {a.view_count}
                    </HStack>
                  </div>
                  {canModify(a) && (
                    <HStack gap={2} mt={3} onClick={(e) => e.stopPropagation()}>
                      <Button size="xs" variant="ghost" onClick={() => navigate(`/articles/${a.id}/edit`)}>
                        <PencilSimple size={12} /> Edit
                      </Button>
                      <Button size="xs" variant="ghost" color="red.500" onClick={() => setDeleteDialog(a)}>
                        <Trash size={12} /> Delete
                      </Button>
                    </HStack>
                  )}
                </div>
              </div>
            ))}
          </SimpleGrid>
          ) : (
          <Box overflowX="auto">
            <Table.Root size="sm" interactive>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Title</Table.ColumnHeader>
                  <Table.ColumnHeader>Category</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Views</Table.ColumnHeader>
                  <Table.ColumnHeader>Updated</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {paged.map((a) => (
                  <Table.Row key={a.id} cursor="pointer" _hover={{ bg: "muted" }} onClick={() => navigate(`/articles/${a.id}`)}>
                    <Table.Cell maxW="340px">
                      <Text fontWeight="medium" lineClamp={2}>{a.title}</Text>
                      <Text fontSize="xs" color="gray.500" lineClamp={1}>{a.excerpt || "No excerpt"}</Text>
                    </Table.Cell>
                    <Table.Cell fontSize="sm">{a.category_name || "—"}</Table.Cell>
                    <Table.Cell><StatusBadges article={a} /></Table.Cell>
                    <Table.Cell textAlign="end">
                      <HStack justify="end" gap={1} fontSize="xs"><Eye size={12} /> {a.view_count}</HStack>
                    </Table.Cell>
                    <Table.Cell fontSize="sm" whiteSpace="nowrap">{fmtDate(a.updated_at)}</Table.Cell>
                    <Table.Cell textAlign="end" onClick={(e) => e.stopPropagation()}>
                      {canModify(a) ? (
                        <HStack justify="end" gap={1}>
                          <Button size="xs" variant="ghost" onClick={() => navigate(`/articles/${a.id}/edit`)}>
                            <PencilSimple size={12} /> Edit
                          </Button>
                          <Button size="xs" variant="ghost" color="red.500" onClick={() => setDeleteDialog(a)}>
                            <Trash size={12} /> Delete
                          </Button>
                        </HStack>
                      ) : (
                        <Text fontSize="xs" color="gray.400">—</Text>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
          )}
          {totalPages > 1 && (
            <HStack justify="center" mt={6} gap={2}>
              <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Text fontSize="sm">{page} / {totalPages}</Text>
              <Button size="sm" variant="ghost" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </HStack>
          )}
        </>
      )}

      <Dialog.Root open={!!deleteDialog} onOpenChange={(e) => !e.open && setDeleteDialog(null)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header><Dialog.Title>Delete Article</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <Text>Delete "{deleteDialog?.title}"? This cannot be undone.</Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="ghost" onClick={() => setDeleteDialog(null)}>Cancel</Button>
                <Button colorPalette="red" onClick={handleDelete}>Delete</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
