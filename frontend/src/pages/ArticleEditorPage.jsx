import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Field,
  Heading,
  HStack,
  Input,
  Spinner,
  Stack,
  Text,
  VStack,
  createToaster,
} from "@chakra-ui/react";
import { ArrowLeft, Image as ImageIcon, X } from "@phosphor-icons/react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import api from "@/services/api";
import ImageCropDialog from "@/components/ui/ImageCropDialog";
import { fmtDateTime } from "./ArticlesPage";

const MAX_COVER_MB = 5;

const toaster = createToaster({ placement: "top" });

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  ["link", "image"],
  ["clean"],
];

export default function ArticleEditorPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const pendingHtmlRef = useRef(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    category_name: "",
    tags: "",
    visibility: "INTERNAL",
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [coverRemoved, setCoverRemoved] = useState(false);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [meta, setMeta] = useState(null);
  const catFilledRef = useRef(false);
  const isManager = localStorage.getItem("user_role") === "MANAGER";

  useEffect(() => {
    api.get("/article-categories/").then((r) => setCategories(r.data.results || r.data)).catch(() => {});
  }, []);

  // Fill category name from id once categories are loaded (edit mode)
  useEffect(() => {
    if (isEdit && editCategoryId && categories.length > 0 && !catFilledRef.current) {
      const cat = categories.find((c) => String(c.id) === String(editCategoryId));
      if (cat) {
        setForm((f) => ({ ...f, category_name: cat.name }));
        catFilledRef.current = true;
      }
    }
  }, [isEdit, editCategoryId, categories]);

  // Init Quill once the editor container is rendered (edit mode renders it after load)
  useEffect(() => {
    if (!loading && editorRef.current && !quillRef.current) {
      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Write your article...",
        modules: {
          toolbar: {
            container: TOOLBAR,
            handlers: { image: () => imageHandler() },
          },
        },
      });
      quillRef.current = quill;
      if (pendingHtmlRef.current) {
        quillRef.current.root.innerHTML = pendingHtmlRef.current;
        pendingHtmlRef.current = null;
      }
    }
    return () => {
      // keep instance across StrictMode remounts via ref guard; cleanup only content
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const imageHandler = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const quill = quillRef.current;
      const range = quill.getSelection(true);
      quill.insertText(range.index, "Uploading image...", "italic", true);
      try {
        const fd = new FormData();
        fd.append("image", file);
        const r = await api.post("/articles/upload-image/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        quill.deleteText(range.index, "Uploading image...".length);
        quill.insertEmbed(range.index, "image", r.data.url);
        quill.setSelection(range.index + 1);
      } catch {
        quill.deleteText(range.index, "Uploading image...".length);
        toaster.create({ title: "Image upload failed (max 5MB)", type: "error" });
      }
    };
    input.click();
  };

  // Load existing article in edit mode
  useEffect(() => {
    if (!isEdit) return;
    api.get(`/articles/${id}/`)
      .then((r) => {
        const a = r.data;
        setForm({
          title: a.title || "",
          excerpt: a.excerpt || "",
          category_name: "",
          tags: (a.tags || []).join(", "),
          visibility: a.visibility || "INTERNAL",
        });
        setEditCategoryId(a.category || null);
        setMeta(a);
        setCoverPreview(a.cover_image_url || null);
        const html = a.content || "";
        if (quillRef.current) quillRef.current.root.innerHTML = html;
        else pendingHtmlRef.current = html;
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toaster.create({ title: "Article not found", type: "error" });
        navigate("/articles");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getHtml = () => quillRef.current?.root?.innerHTML || "";

  const handleCoverFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toaster.create({ title: "Only image files are allowed", type: "error" });
      return;
    }
    if (file.size > MAX_COVER_MB * 1024 * 1024) {
      toaster.create({ title: `Cover must be smaller than ${MAX_COVER_MB}MB`, type: "error" });
      return;
    }
    setCropSrc(URL.createObjectURL(file));
    setCropOpen(true);
  };

  const applyCrop = (blob) => {
    setCropOpen(false);
    setCropSrc(null);
    if (!blob) {
      toaster.create({ title: "Crop failed", type: "error" });
      return;
    }
    const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverRemoved(false);
  };

  const clearCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setCoverRemoved(true);
  };

  const saveArticle = async (publishNow) => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    const editorText = quillRef.current?.getText()?.trim() || "";
    if (editorText.length < 1) errs.content = "Content is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        category_name: form.category_name.trim(),
        tag_names: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        visibility: form.visibility,
        content: getHtml(),
      };
      let articleId = id;
      if (isEdit) {
        await api.put(`/articles/${id}/`, payload);
      } else {
        const r = await api.post("/articles/", payload);
        articleId = r.data.id;
      }
      if (coverFile) {
        const fd = new FormData();
        fd.append("cover_image", coverFile);
        await api.patch(`/articles/${articleId}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (coverRemoved) {
        await api.patch(`/articles/${articleId}/`, { cover_image: null });
      }
      if (publishNow) {
        await api.post(`/articles/${articleId}/publish/`);
        toaster.create({ title: "Article published", type: "success" });
      } else {
        toaster.create({ title: isEdit ? "Article saved" : "Draft saved", type: "success" });
      }
      navigate(`/articles/${articleId}`);
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const fieldErrors = {};
        for (const [key, val] of Object.entries(data)) {
          fieldErrors[key] = Array.isArray(val) ? val[0] : String(val);
        }
        if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); setSaving(false); return; }
      }
      toaster.create({ title: "Failed to save article", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" py={16}><Spinner size="lg" color="primary" /></Box>;
  }

  return (
    <Container maxW="6xl" py={{ base: 4, md: 8 }}>
      <Button size="sm" variant="ghost" mb={4} onClick={() => navigate(isEdit ? `/articles/${id}` : "/articles")}>
        <ArrowLeft size={16} /> Back
      </Button>
      <Heading fontWeight="semibold" size="lg" color="foreground" mb={6}>
        {isEdit ? "Edit Article" : "Write Article"}
      </Heading>

      <Stack direction={{ base: "column", lg: "row" }} gap={6} align="stretch">
        <Box flex={1} minW={0}>
      <VStack gap={4} align="stretch">
        <Field.Root invalid={!!errors.title}>
          <Field.Label>Title</Field.Label>
          <Input
            placeholder="Article title..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            bg="#FAFAFA"
          />
          {errors.title && <Field.ErrorText>{errors.title}</Field.ErrorText>}
        </Field.Root>

        <Field.Root>
          <Field.Label>Excerpt (short summary)</Field.Label>
          <Input
            placeholder="One or two sentences..."
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            bg="#FAFAFA"
          />
        </Field.Root>

        <Field.Root invalid={!!errors.content}>
          <Field.Label>Content</Field.Label>
          <Box
            bg="white"
            borderRadius="lg"
            border="1px solid"
            borderColor="border"
            overflow="hidden"
            sx={{
              "& .ql-toolbar": { border: "none", borderBottom: "1px solid var(--color-border)" },
              "& .ql-container": { border: "none", minHeight: "300px", fontSize: "15px" },
            }}
          >
            <div ref={editorRef} />
          </Box>
          {errors.content && <Field.ErrorText>{errors.content}</Field.ErrorText>}
        </Field.Root>

        <HStack gap={4} align="start" wrap="wrap">
          <Field.Root flex={1} minW="180px" invalid={!!errors.category_name}>
            <Field.Label>Category</Field.Label>
            <Input
              list="article-categories"
              placeholder="Type or pick..."
              value={form.category_name}
              onChange={(e) => setForm({ ...form, category_name: e.target.value })}
              bg="#FAFAFA"
            />
            <datalist id="article-categories">
              {categories.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
            {errors.category_name && <Field.ErrorText>{errors.category_name}</Field.ErrorText>}
          </Field.Root>

          <Field.Root flex={1} minW="180px">
            <Field.Label>Tags (comma separated)</Field.Label>
            <Input
              placeholder="sales, tips, onboarding"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              bg="#FAFAFA"
            />
          </Field.Root>

          <Field.Root w="160px">
            <Field.Label>Visibility</Field.Label>
            <select
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "#FAFAFA" }}
            >
              <option value="INTERNAL">Internal</option>
              <option value="PUBLIC">Public</option>
            </select>
          </Field.Root>
        </HStack>

        <Field.Root>
          <Field.Label>Cover image</Field.Label>
          <Box
            border="2px dashed"
            borderColor={dragging ? "primary" : "border"}
            borderRadius="xl"
            p={8}
            textAlign="center"
            cursor="pointer"
            bg={dragging ? "muted" : "transparent"}
            transition="all 0.15s"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleCoverFile(e.dataTransfer.files?.[0]); }}
          >
            <VStack gap={2}>
              <Box color="foreground" opacity={0.4}>
                <ImageIcon size={32} />
              </Box>
              <Text fontWeight="medium" fontSize="sm" color="foreground">
                Upload Image
              </Text>
              <Text fontSize="xs" color="foreground" opacity={0.5}>
                Drag & drop or click to browse · 16:9 recommended · Max {MAX_COVER_MB}MB
              </Text>
            </VStack>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => { handleCoverFile(e.target.files?.[0]); e.target.value = ""; }}
            />
          </Box>
          {coverPreview && (
            <HStack gap={3} mt={3} align="start">
              <Box borderRadius="lg" overflow="hidden" border="1px solid" borderColor="border" maxW="300px" flexShrink={0}>
                <Box as="img" src={coverPreview} w="full" alt="Cover preview" />
              </Box>
              <Button size="xs" variant="ghost" color="red.500" onClick={clearCover}>
                <X size={12} /> Remove
              </Button>
            </HStack>
          )}
        </Field.Root>

        <ImageCropDialog
          open={cropOpen}
          imageSrc={cropSrc}
          onClose={() => { setCropOpen(false); setCropSrc(null); }}
          onApply={applyCrop}
        />
          </VStack>
        </Box>

        <Box w={{ base: "100%", lg: "1px" }} h={{ base: "1px", lg: "auto" }} bg="black" flexShrink={0} borderRadius="full" />

        <Box w={{ base: "full", lg: "300px" }} flexShrink={0}>
          <VStack gap={4} align="stretch" position={{ lg: "sticky" }} top="88px">
            <Box border="1px solid" borderColor="border" borderRadius="xl" p={5} bg="#FAFAFA">
              <Heading size="sm" mb={4}>Status</Heading>
              <VStack gap={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="foreground" opacity={0.6}>Status</Text>
                  <Box
                    fontSize="11px"
                    fontWeight="bold"
                    px={3}
                    py={0.5}
                    borderRadius="full"
                    bg={meta?.status === "PUBLISHED" ? "#ecfdf5" : "#fef3c7"}
                    color={meta?.status === "PUBLISHED" ? "#006242" : "#92400e"}
                  >
                    {meta?.status || "DRAFT"}
                  </Box>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="foreground" opacity={0.6}>Visibility</Text>
                  <Text fontSize="sm" fontWeight="medium">{form.visibility}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="foreground" opacity={0.6}>Author</Text>
                  <Text fontSize="sm" fontWeight="medium">{meta?.author_name || "—"}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="foreground" opacity={0.6}>Created</Text>
                  <Text fontSize="sm" fontWeight="medium">{meta ? fmtDateTime(meta.created_at) : "—"}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="foreground" opacity={0.6}>Last update</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {meta?.updated_by ? `${meta.updated_by_name} · ${fmtDateTime(meta.updated_at)}` : "Never updated"}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="foreground" opacity={0.6}>Published</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {!meta
                      ? "Not published yet"
                      : meta.scheduled_publish_at && !meta.is_live
                        ? fmtDateTime(meta.scheduled_publish_at)
                        : meta.effective_published_at
                          ? fmtDateTime(meta.effective_published_at)
                          : "Not published yet"}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="foreground" opacity={0.6}>Views</Text>
                  <Text fontSize="sm" fontWeight="medium">{meta?.view_count ?? "—"}</Text>
                </HStack>
              </VStack>
            </Box>

            <Box border="1px solid" borderColor="border" borderRadius="xl" p={5} bg="#FAFAFA">
              <Heading size="sm" mb={4}>Publish</Heading>
              <VStack gap={2} align="stretch">
                {isManager ? (
                  <>
                    <Button bg="primary" color="white" onClick={() => saveArticle(true)} loading={saving}>
                      Publish Now
                    </Button>
                    <Button variant="outline" onClick={() => saveArticle(false)} loading={saving}>
                      Save Draft
                    </Button>
                  </>
                ) : (
                  <Button bg="primary" color="white" onClick={() => saveArticle(false)} loading={saving}>
                    Save
                  </Button>
                )}
                {!isManager && (
                  <Text fontSize="xs" color="foreground" opacity={0.4}>
                    Saved as draft — a manager will review & publish.
                  </Text>
                )}
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Stack>
    </Container>
  );
}
