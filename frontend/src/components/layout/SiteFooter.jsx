import { Box, Container, HStack, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import brandLogo from "@/assets/brand.png";

const LINKS = [
  { label: "Blog", path: "/blog" },
  { label: "Privacy", path: "/privacy" },
  { label: "Terms", path: "/terms" },
  { label: "Contact", path: "/contact" },
];

export default function SiteFooter() {
  const navigate = useNavigate();
  return (
    <Box py={8} borderTop="1px solid" borderColor="border" mt={8}>
      <Container maxW="6xl">
        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={4}>
          <HStack gap={3}>
            <Box as="img" src={brandLogo} h="24px" alt="QontakSales" cursor="pointer" onClick={() => navigate("/")} />
          </HStack>
          <HStack gap={6} wrap="wrap" justify="center">
            {LINKS.map((l) => (
              <Text
                key={l.label}
                fontSize="sm"
                color="foreground"
                opacity={0.4}
                cursor="pointer"
                _hover={{ opacity: 0.8 }}
                onClick={() => navigate(l.path)}
              >
                {l.label}
              </Text>
            ))}
          </HStack>
          <Text fontSize="sm" color="foreground" opacity={0.3}>
            &copy; 2026 QontakSales
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
