import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { ArrowLeft, Eye } from "@phosphor-icons/react";
import DOMPurify from "dompurify";
import api from "@/services/api";
import brandLogo from "@/assets/brand.png";
import { fmtDate } from "./ArticlesPage";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/public-articles/${slug}/`)
      .then((r) => { setArticle(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  return (
    <Box bg="background" minH="100vh">
      <Box as="nav" borderBottom="1px solid" borderColor="border" bg="background">
        <Container maxW="6xl" px={4} py={3}>
          <HStack justify="space-between">
            <Box as="img" src={brandLogo} h="28px" alt="QontakSales" cursor="pointer" onClick={() => navigate("/")} />
            <HStack gap={2}>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Log in</Button>
              <Button size="sm" bg="primary" color="white" onClick={() => navigate("/register")}>Get Started</Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="3xl" py={12}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={16}><Spinner size="lg" color="primary" /></Box>
        ) : !article ? (
          <VStack gap={4} py={16}>
            <Text color="foreground" opacity={0.5}>Article not found.</Text>
            <Button size="sm" variant="ghost" onClick={() => navigate("/blog")}><ArrowLeft size={14} /> Back to Blog</Button>
          </VStack>
        ) : (
          <>
            <Button size="sm" variant="ghost" mb={4} onClick={() => navigate("/blog")}>
              <ArrowLeft size={16} /> Back to Blog
            </Button>
            {article.category_name && (
              <Badge size="sm" colorPalette="purple" variant="subtle" mb={3}>{article.category_name}</Badge>
            )}
            <Heading fontWeight="bold" size="xl" color="foreground" mb={2}>{article.title}</Heading>
            <HStack gap={2} fontSize="sm" color="foreground" opacity={0.5} mb={6}>
              <Text>{article.author_name}</Text>
              <Text>·</Text>
              <Text>{fmtDate(article.effective_published_at)}</Text>
              <Text>·</Text>
              <HStack gap={1}><Eye size={12} /> {article.view_count}</HStack>
            </HStack>
            {article.cover_image_url && (
              <Box borderRadius="xl" overflow="hidden" mb={6} border="1px solid" borderColor="border">
                <Box as="img" src={article.cover_image_url} w="full" maxH="420px" objectFit="cover" alt={article.title} />
              </Box>
            )}
            <Box
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
          </>
        )}
      </Container>
    </Box>
  );
}
