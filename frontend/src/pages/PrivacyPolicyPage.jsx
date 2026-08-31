import { Box, Container, Heading, Text, VStack, HStack, Button } from "@chakra-ui/react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import brandLogo from "@/assets/brand.png";

export default function PrivacyPolicyPage() {
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
            <Heading size="xl">Privacy Policy</Heading>
            <Text color="foreground" opacity={0.5}>Last updated: August 31, 2026</Text>
          </VStack>

          <VStack align="stretch" gap={6}>
            <Box>
              <Heading size="md" mb={2}>1. Information We Collect</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                We collect information you provide directly, including your name, email address, company name, phone number, and payment information when you register for an account. We also collect data about your leads and sales activities as you use our platform.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>2. How We Use Your Information</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                We use your information to provide, maintain, and improve our services, to process transactions, send you technical notices and support messages, and to communicate with you about products, services, and promotions.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>3. Data Security</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>4. Data Sharing</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                We do not sell or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our platform, subject to confidentiality obligations.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>5. Your Rights</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                You have the right to access, correct, or delete your personal information. You may also export your data at any time through the platform settings. Contact us to exercise these rights.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>6. Contact Us</Heading>
              <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                If you have questions about this Privacy Policy, please contact us at privacy@qontaksales.com.
              </Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
