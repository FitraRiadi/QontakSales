import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Dialog,
  Field,
  Heading,
  HStack,
  Input,
  Portal,
  Spinner,
  Text,
  VStack,
  Badge,
  createToaster,
} from "@chakra-ui/react";
import { ArrowLeft, PencilSimple, Trash, Eye, Clock } from "@phosphor-icons/react";
import DOMPurify from "dompurify";
import api from "@/services/api";
import { fmtDate, fmtDateTime } from "./ArticlesPage";

const toaster = createToaster({ placement: "top" });

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const userRole = localStorage.getItem("user_role");
  const userId = localStorage.getItem("user_id");
  const isManager = userRole === "MANAGER";

  const fetchArticle = () => {
    setLoading(true);
    api.get(`/articles/${id}/`)
      .then((r) => { setArticle(r.data); setLoading(false); })
      .catch(() => { setLoading(false); toaster.create({ title: "Article not found", type: "error" }); });
  };

  useEffect(() => { fetchArticle(); }, [id]);

  if (loading) {
    return <Box display="flex" justifyContent="center" py={16}><Spinner size="lg" color="primary" /></Box>;
  }
  if (!article) {
    return <Box p={6}><Text>Article not found.</Text></Box>;
  }

  const canModify = isManager || String(article.author) === String(userId);
  const isScheduled =
    article.status === "PUBLISHED" && article.scheduled_publish_at && !article.is_live;

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

  return (
    <Container maxW="3xl" py={{ base: 4, md: 8 }}>
      <Button size="sm" variant="ghost" mb={4} onClick={() => navigate("/articles")}>
        <ArrowLeft size={16} /> Back to Articles
      </Button>

      <HStack gap={2} mb={3} wrap="wrap">
        <Badge size="sm" colorPalette={article.status === "PUBLISHED" ? "green" : "yellow"} variant="subtle">
          {article.status}
        </Badge>
        {isScheduled && <Badge size="sm" colorPalette="blue" variant="subtle">SCHEDULED</Badge>}
        <Badge size="sm" colorPalette="gray" variant="outline">{article.visibility}</Badge>
        {article.category_name && <Badge size="sm" colorPalette="purple" variant="subtle">{article.category_name}</Badge>}
      </HStack>

      <Heading fontWeight="bold" size="xl" color="foreground" mb={2}>
        {article.title}
      </Heading>
      {article.excerpt && (
        <Text color="foreground" opacity={0.6} mb={4}>{article.excerpt}</Text>
      )}

      {article.cover_image_url && (
        <Box borderRadius="xl" overflow="hidden" mb={6} border="1px solid" borderColor="border">
          <Box as="img" src={article.cover_image_url} w="full" maxH="400px" objectFit="cover" alt={article.title} />
        </Box>
      )}

      <Box
        className="article-content"
        fontSize="md"
        lineHeight="1.8"
        color="foreground"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content || "") }}
        css={{
          "& h1, & h2, & h3": { fontWeight: "bold", marginTop: "1.2em", marginBottom: "0.5em" },
          "& p": { marginBottom: "0.8em" },
          "& ul, & ol": { paddingLeft: "1.5em", marginBottom: "0.8em" },
          "& img": { maxWidth: "100%", borderRadius: "8px", margin: "0.8em 0" },
          "& a": { color: "var(--color-primary)" },
          "& blockquote": { borderLeft: "3px solid var(--color-border)", paddingLeft: "1em", opacity: 0.8, margin: "0.8em 0" },
        }}
      />

      {article.tags?.length > 0 && (
        <HStack gap={2} mt={6} wrap="wrap">
          {article.tags.map((t) => (
            <Badge key={t} size="sm" variant="outline">#{t}</Badge>
          ))}
        </HStack>
      )}

      {/* Audit meta */}
      <Box mt={8} p={4} bg="muted" borderRadius="xl">
        <VStack gap={1} align="start" fontSize="sm">
          <Text color="foreground" opacity={0.7}>
            Created by <b>{article.author_name}</b> · {fmtDateTime(article.created_at)}
          </Text>
          <Text color="foreground" opacity={0.7}>
            Last updated by <b>{article.updated_by_name}</b> · {article.updated_by ? fmtDateTime(article.updated_at) : "—"}
          </Text>
          <Text color="foreground" opacity={0.7}>
            {isScheduled
              ? <>Scheduled to publish · <b>{fmtDateTime(article.scheduled_publish_at)}</b></>
              : <>Published · <b>{article.effective_published_at ? fmtDateTime(article.effective_published_at) : "—"}</b></>}
          </Text>
          <HStack gap={1} fontSize="sm" color="foreground" opacity={0.7}>
            <Eye size={14} /> {article.view_count} views
          </HStack>
        </VStack>
      </Box>

      {/* Actions */}
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

      <Dialog.Root open={deleteOpen} onOpenChange={(e) => !e.open && setDeleteOpen(false)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header><Dialog.Title>Delete Article</Dialog.Title></Dialog.Header>
              <Dialog.Body><Text>Delete "{article.title}"? This cannot be undone.</Text></Dialog.Body>
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
    </Container>
  );
}
