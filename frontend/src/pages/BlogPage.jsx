import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Container,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { ArrowLeft, Eye, Newspaper } from "@phosphor-icons/react";
import api from "@/services/api";
import brandLogo from "@/assets/brand.png";
import { fmtDate } from "./ArticlesPage";

export default function BlogPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = { ordering: "-published_at" };
    if (search) params.search = search;
    const t = setTimeout(() => {
      api.get("/public-articles/", { params })
        .then((r) => { setArticles(r.data.results || r.data); setLoading(false); })
        .catch(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

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
        <VStack gap={3} mb={8} textAlign="center">
          <Heading fontWeight="bold" size="2xl" color="foreground">Blog</Heading>
          <Text color="foreground" opacity={0.5}>Sales tips, playbooks, and product updates.</Text>
        </VStack>

        <Box maxW="420px" mx="auto" mb={10}>
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="#FAFAFA"
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={16}><Spinner size="lg" color="primary" /></Box>
        ) : articles.length === 0 ? (
          <Box textAlign="center" py={16}>
            <Newspaper size={40} style={{ margin: "0 auto", opacity: 0.3 }} />
            <Text mt={4} color="foreground" opacity={0.5}>No articles yet</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {articles.map((a) => (
              <Card.Root key={a.id} cursor="pointer" overflow="hidden" _hover={{ shadow: "md" }} onClick={() => navigate(`/blog/${a.slug}`)}>
                {a.cover_image_url ? (
                  <Box as="img" src={a.cover_image_url} h="180px" w="full" objectFit="cover" alt={a.title} />
                ) : (
                  <Box h="180px" w="full" bg="muted" display="flex" alignItems="center" justifyContent="center">
                    <Newspaper size={36} style={{ opacity: 0.25 }} />
                  </Box>
                )}
                <Card.Body gap={2}>
                  {a.category_name && <Badge size="sm" colorPalette="purple" variant="subtle" alignSelf="flex-start">{a.category_name}</Badge>}
                  <Heading size="md" fontWeight="semibold" color="foreground" lineClamp={2}>{a.title}</Heading>
                  <Text fontSize="sm" color="foreground" opacity={0.5} lineClamp={2}>{a.excerpt}</Text>
                  <HStack justify="space-between" mt={2}>
                    <Text fontSize="xs" color="foreground" opacity={0.5}>{a.author_name} · {fmtDate(a.effective_published_at)}</Text>
                    <HStack gap={1} fontSize="xs" color="foreground" opacity={0.5}><Eye size={12} /> {a.view_count}</HStack>
                  </HStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        )}

        <Box textAlign="center" mt={10}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}><ArrowLeft size={14} /> Back to Home</Button>
        </Box>
      </Container>
    </Box>
  );
}
