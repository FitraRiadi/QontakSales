import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { ArrowLeft, Eye, Newspaper, User, CalendarBlank, Tag, PencilSimple } from "@phosphor-icons/react";
import DOMPurify from "dompurify";
import api from "@/services/api";
import brandLogo from "@/assets/brand.png";
import SiteFooter from "@/components/layout/SiteFooter";
import { fmtDate } from "./ArticlesPage";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

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
          .sort((x, y) => y.s - x.s || y.a.view_count - x.a.view_count);
        setRelated(scored.slice(0, 4).map((x) => x.a));
      })
      .catch(() => {});
  };

  useEffect(() => {
    api.get(`/public-articles/${slug}/`)
      .then((r) => { setArticle(r.data); setLoading(false); fetchRelated(r.data); })
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

      <Container maxW="6xl" py={12}>
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
            <Stack direction={{ base: "column", lg: "row" }} gap={8} align="start">
              <Box flex={1} minW={0}>
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

            {/* Article Information */}
            <Box mt={8} p={5} bg="muted" borderRadius="xl" border="1px solid" borderColor="border">
              <Text fontWeight="semibold" fontSize="sm" color="foreground" mb={4}>
                Article Information
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <HStack gap={3} align="start">
                  <Box color="primary" mt={0.5}><User size={18} /></Box>
                  <VStack gap={0} align="start">
                    <Text fontSize="xs" color="foreground" opacity={0.5}>Written by</Text>
                    <Text fontSize="sm" fontWeight="medium" color="foreground">{article.author_name}</Text>
                  </VStack>
                </HStack>
                <HStack gap={3} align="start">
                  <Box color="primary" mt={0.5}><CalendarBlank size={18} /></Box>
                  <VStack gap={0} align="start">
                    <Text fontSize="xs" color="foreground" opacity={0.5}>Published on</Text>
                    <Text fontSize="sm" fontWeight="medium" color="foreground">{fmtDate(article.effective_published_at)}</Text>
                  </VStack>
                </HStack>
                <HStack gap={3} align="start">
                  <Box color="primary" mt={0.5}><PencilSimple size={18} /></Box>
                  <VStack gap={0} align="start">
                    <Text fontSize="xs" color="foreground" opacity={0.5}>Last updated</Text>
                    <Text fontSize="sm" fontWeight="medium" color="foreground">{fmtDate(article.updated_at)}</Text>
                  </VStack>
                </HStack>
                <HStack gap={3} align="start">
                  <Box color="primary" mt={0.5}><Tag size={18} /></Box>
                  <VStack gap={0} align="start">
                    <Text fontSize="xs" color="foreground" opacity={0.5}>Category</Text>
                    <Text fontSize="sm" fontWeight="medium" color="foreground">
                      {article.category_name || "Uncategorized"}
                    </Text>
                    <HStack gap={1} fontSize="xs" color="foreground" opacity={0.5}>
                      <Eye size={12} /> {article.view_count} views
                    </HStack>
                  </VStack>
                </HStack>
              </SimpleGrid>
            </Box>
              </Box>

              {/* Related sidebar */}
              <Box w={{ base: "full", lg: "300px" }} flexShrink={0}>
                <Box position={{ lg: "sticky" }} top="80px">
                  <Text fontWeight="semibold" fontSize="sm" color="foreground" mb={3}>
                    Related Articles
                  </Text>
                  <VStack gap={2} align="stretch">
                    {related.map((r) => (
                      <HStack
                        key={r.id}
                        gap={3}
                        p={2}
                        borderRadius="lg"
                        cursor="pointer"
                        align="start"
                        _hover={{ bg: "muted" }}
                        onClick={() => navigate(`/blog/${r.slug}`)}
                      >
                        {r.cover_image_url ? (
                          <Box as="img" src={r.cover_image_url} w="64px" h="64px" borderRadius="md" objectFit="cover" flexShrink={0} alt={r.title} />
                        ) : (
                          <Box w="64px" h="64px" borderRadius="md" bg="muted" flexShrink={0} display="flex" alignItems="center" justifyContent="center">
                            <Newspaper size={20} style={{ opacity: 0.3 }} />
                          </Box>
                        )}
                        <VStack gap={1} align="start" minW={0}>
                          <Text fontSize="sm" fontWeight="medium" color="foreground" lineClamp={2}>
                            {r.title}
                          </Text>
                          <HStack gap={1} fontSize="xs" color="foreground" opacity={0.5}>
                            <Eye size={11} /> {r.view_count}
                          </HStack>
                        </VStack>
                      </HStack>
                    ))}
                    {related.length === 0 && (
                      <Text fontSize="sm" color="foreground" opacity={0.5}>No related articles yet.</Text>
                    )}
                  </VStack>
                </Box>
              </Box>
            </Stack>
          </>
        )}
      </Container>

      <SiteFooter />
    </Box>
  );
}
