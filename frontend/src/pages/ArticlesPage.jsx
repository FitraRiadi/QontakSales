import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Dialog,
  Heading,
  HStack,
  Input,
  Portal,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  Badge,
  createToaster,
} from "@chakra-ui/react";
import { Plus, Newspaper, Eye, PencilSimple, Trash } from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top" });

export const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export const fmtDateTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

function StatusBadges({ article }) {
  const isScheduled =
    article.status === "PUBLISHED" && article.scheduled_publish_at && !article.is_live;
  return (
    <HStack gap={1} wrap="wrap">
      <Badge
        size="sm"
        colorPalette={article.status === "PUBLISHED" ? "green" : "yellow"}
        variant="subtle"
      >
        {article.status}
      </Badge>
      {isScheduled && (
        <Badge size="sm" colorPalette="blue" variant="subtle">
          SCHEDULED
        </Badge>
      )}
      <Badge size="sm" colorPalette="gray" variant="outline">
        {article.visibility}
      </Badge>
    </HStack>
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
        <Button size="sm" bg="primary" color="white" onClick={() => navigate("/articles/new")}>
          <Plus size={14} /> Write Article
        </Button>
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
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {paged.map((a) => (
              <Card.Root
                key={a.id}
                cursor="pointer"
                overflow="hidden"
                _hover={{ shadow: "md" }}
                onClick={() => navigate(`/articles/${a.id}`)}
              >
                {a.cover_image_url ? (
                  <Box as="img" src={a.cover_image_url} h="160px" w="full" objectFit="cover" alt={a.title} />
                ) : (
                  <Box h="160px" w="full" bg="muted" display="flex" alignItems="center" justifyContent="center">
                    <Newspaper size={36} style={{ opacity: 0.25 }} />
                  </Box>
                )}
                <Card.Body gap={2}>
                  <StatusBadges article={a} />
                  <Heading size="sm" fontWeight="semibold" color="foreground" lineClamp={2}>
                    {a.title}
                  </Heading>
                  <Text fontSize="sm" color="foreground" opacity={0.5} lineClamp={2}>
                    {a.excerpt || "No excerpt"}
                  </Text>
                  <HStack justify="space-between" mt={2}>
                    <Text fontSize="xs" color="foreground" opacity={0.5}>
                      {a.author_name} · {fmtDate(a.created_at)}
                    </Text>
                    <HStack gap={1} fontSize="xs" color="foreground" opacity={0.5}>
                      <Eye size={12} /> {a.view_count}
                    </HStack>
                  </HStack>
                  {canModify(a) && (
                    <HStack gap={2} mt={2} onClick={(e) => e.stopPropagation()}>
                      <Button size="xs" variant="ghost" onClick={() => navigate(`/articles/${a.id}/edit`)}>
                        <PencilSimple size={12} /> Edit
                      </Button>
                      <Button size="xs" variant="ghost" color="red.500" onClick={() => setDeleteDialog(a)}>
                        <Trash size={12} /> Delete
                      </Button>
                    </HStack>
                  )}
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
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
