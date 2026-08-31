import { Box, Container, Heading, Text, VStack, HStack, Button } from "@chakra-ui/react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import brandLogo from "@/assets/brand.png";

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <Box bg="background" minH="100vh">
      <Box as="nav" bg="white" borderBottom="1px solid" borderColor="border" py={4}>
        <Container maxW="4xl">
          <HStack justify="space-between">
            <Box as="img" src={brandLogo} h="28px" alt="QontakSales" />
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}><ArrowLeft size={16} /> Back to Home</Button>
          </HStack>
        </Container>
      </Box>

      <Container maxW="4xl" py={12}>
        <VStack align="stretch" gap={8}>
          <VStack align="start" gap={2}>
            <Heading size="xl">Terms of Service</Heading>
            <Text color="foreground" opacity={0.5}>Last updated: August 31, 2026</Text>
          </VStack>

          <VStack align="stretch" gap={6}>
            <Box>
              <Heading size="md" mb={2}>1. Acceptance of Terms</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                By accessing or using QontakSales, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>2. Account Registration</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>3. Acceptable Use</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                You agree not to use QontakSales for any unlawful purpose, to send spam or unsolicited messages, to violate any applicable laws or regulations, or to interfere with the platform's integrity or security.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>4. Payment & Billing</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                Free tier features are provided at no cost. Paid plans are billed in advance on a monthly or annual basis. All payments are non-refundable except as required by applicable law.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>5. Intellectual Property</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                QontakSales and its content, features, and functionality are owned by QontakSales and are protected by copyright, trademark, and other intellectual property laws.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>6. Limitation of Liability</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                QontakSales shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>7. Termination</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                We may terminate or suspend your account at any time for conduct that violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>8. Contact</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                For questions about these Terms, contact us at legal@qontaksales.com.
              </Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
