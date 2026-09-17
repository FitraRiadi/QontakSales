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
  Text,
  VStack,
  createToaster,
} from "@chakra-ui/react";
import { ArrowLeft } from "@phosphor-icons/react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import api from "@/services/api";

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
  const [errors, setErrors] = useState({});
  const isManager = localStorage.getItem("user_role") === "MANAGER";

  useEffect(() => {
    api.get("/article-categories/").then((r) => setCategories(r.data.results || r.data)).catch(() => {});
  }, []);

  // Init Quill once
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
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
  }, []);

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
          category_name: a.category_name || "",
          tags: (a.tags || []).join(", "),
          visibility: a.visibility || "INTERNAL",
        });
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

  const saveArticle = async (publishNow) => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (quillRef.current?.getText().trim().length < 1) errs.content = "Content is required";
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
    <Container maxW="3xl" py={{ base: 4, md: 8 }}>
      <Button size="sm" variant="ghost" mb={4} onClick={() => navigate(isEdit ? `/articles/${id}` : "/articles")}>
        <ArrowLeft size={16} /> Back
      </Button>
      <Heading fontWeight="semibold" size="lg" color="foreground" mb={6}>
        {isEdit ? "Edit Article" : "Write Article"}
      </Heading>

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
          <HStack gap={3}>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setCoverFile(f || null);
                setCoverPreview(f ? URL.createObjectURL(f) : coverPreview);
              }}
              bg="#FAFAFA"
              p={1}
            />
          </HStack>
          {coverPreview && (
            <Box mt={2} borderRadius="lg" overflow="hidden" border="1px solid" borderColor="border" maxW="300px">
              <Box as="img" src={coverPreview} w="full" alt="Cover preview" />
            </Box>
          )}
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

        <HStack gap={2} mt={2}>
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
          <Text fontSize="xs" color="foreground" opacity={0.4}>
            {!isManager && "Saved as draft — a manager will review & publish."}
          </Text>
        </HStack>
      </VStack>
    </Container>
  );
}
