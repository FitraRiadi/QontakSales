import { useState } from "react";
import { Box, Button, Card, Field, Heading, Input, Text, VStack, Link, createToaster } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { Envelope } from "@phosphor-icons/react";
import api from "@/services/api";
import brandLogo from "@/assets/brand.png";

const toaster = createToaster({ placement: "top" });

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Please enter a valid email"); return; }
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password/", { email: email.trim() });
      setSent(true);
    } catch {
      toaster.create({ title: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="muted" px={4}>
        <Card.Root maxW="420px" w="full" bg="#FAFAFA" border="1px solid" borderColor="border">
          <Card.Body p={8}>
            <VStack gap={4} textAlign="center">
              <Box as="img" src={brandLogo} h="28px" />
              <Heading fontWeight="semibold" size="lg">Check your email</Heading>
              <Text color="gray.500" fontSize="sm">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
              </Text>
              <Text color="gray.400" fontSize="xs">
                Didn't receive the email? Check your spam folder or try again.
              </Text>
              <Button as={RouterLink} to="/login" variant="outline" w="full" mt={2}>
                Back to Sign In
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Box>
    );
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="muted" px={4}>
      <Card.Root maxW="420px" w="full" bg="#FAFAFA" border="1px solid" borderColor="border">
        <Card.Body p={8}>
          <VStack gap={6}>
            <Box as="img" src={brandLogo} h="28px" />
            <VStack gap={1} textAlign="center">
              <Heading fontWeight="semibold" size="lg">Forgot your password?</Heading>
              <Text color="gray.500" fontSize="sm">
                Enter your email address and we'll send you a link to reset your password.
              </Text>
            </VStack>
            <Box as="form" onSubmit={handleSubmit} w="full">
              <VStack gap={4}>
                <Field.Root w="full" required invalid={!!error}>
                  <Field.Label>Email address</Field.Label>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  />
                  <Field.ErrorText>{error}</Field.ErrorText>
                </Field.Root>
                <Button type="submit" bg="primary" color="white" w="full" loading={loading} _hover={{ bg: "secondary" }}>
                  <Envelope size={16} /> Send Reset Link
                </Button>
              </VStack>
            </Box>
            <Text fontSize="sm" color="gray.500">
              Remember your password?{" "}
              <Link as={RouterLink} to="/login" color="primary" fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
                Sign in
              </Link>
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
