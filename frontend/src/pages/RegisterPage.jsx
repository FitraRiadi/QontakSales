import { useState } from "react";
import { useNavigate, Link as RouterLink, Navigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Field,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  VStack,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { Eye, EyeClosed, Buildings, User, Envelope, Lock } from "@phosphor-icons/react";
import api from "@/services/api";
import brandLogo from "@/assets/brand.png";
import LoadingPopup from "@/components/ui/LoadingPopup";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirm: "", company_name: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (localStorage.getItem("access_token")) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (form.password !== form.password_confirm) { setError("Passwords do not match"); setLoading(false); return; }
    try {
      await api.post("/auth/register/", { name: form.name, email: form.email, password: form.password, company_name: form.company_name });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex">
      {/* Left Panel - Branding */}
      <Box
        display={{ base: "none", md: "flex" }}
        flex={1}
        bg="primary"
        color="white"
        flexDirection="column"
        justifyContent="center"
        p={12}
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" bottom={-100} left={-100} w={300} h={300} bg="white" opacity={5} borderRadius="full" />
        <Box position="absolute" top={-50} right={-50} w={200} h={200} bg="white" opacity={5} borderRadius="full" />
        <VStack align="start" gap={8} position="relative" zIndex={1}>
          <Box as="img" src={brandLogo} h="40px" alt="QontakSales" />
          <VStack align="start" gap={4}>
            <Text fontSize="lg" opacity={0.9}>Start closing more deals today.</Text>
            <VStack align="start" gap={3} mt={4}>
              {["Free forever for small teams", "Setup in under 2 minutes", "No credit card required"].map((t) => (
                <HStack key={t} gap={2}>
                  <Box w={2} h={2} borderRadius="full" bg="white" />
                  <Text fontSize="sm" opacity={0.8}>{t}</Text>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </VStack>
      </Box>

      {/* Right Panel - Form */}
      <Box flex={1} display="flex" alignItems="center" justifyContent="center" p={8} bg="background" overflow="auto">
        <Box w="100%" maxW="480px">
          <VStack gap={6}>
            <VStack gap={2} align={{ base: "center", md: "start" }}>
              <Heading size="xl" color="foreground">Create your account</Heading>
              <Text color="foreground" opacity={0.6}>Get started with QontakSales for free</Text>
            </VStack>

            <Box w="100%" bg="white" p={8} borderRadius="2xl" border="1px solid" borderColor="border" shadow="sm">
              <form onSubmit={handleSubmit}>
                <Stack gap={4}>
                  {error && (
                    <Box bg="destructive/10" color="destructive" p={3} borderRadius="md" fontSize="sm" textAlign="center">
                      {error}
                    </Box>
                  )}
                  <Field.Root>
                    <Field.Label>Full Name</Field.Label>
                    <Input name="name" size="lg" value={form.name} onChange={handleChange} placeholder="John Doe" borderRadius="lg" required />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Email</Field.Label>
                    <Input name="email" type="email" size="lg" value={form.email} onChange={handleChange} placeholder="you@company.com" borderRadius="lg" required />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Company Name</Field.Label>
                    <Input name="company_name" size="lg" value={form.company_name} onChange={handleChange} placeholder="Your Company" borderRadius="lg" required />
                  </Field.Root>
                  <SimpleGrid columns={2} gap={4}>
                    <Field.Root>
                      <Field.Label>Password</Field.Label>
                      <Input name="password" type="password" size="lg" value={form.password} onChange={handleChange} placeholder="Min 8 characters" borderRadius="lg" required />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Confirm</Field.Label>
                      <Input name="password_confirm" type="password" size="lg" value={form.password_confirm} onChange={handleChange} placeholder="Confirm password" borderRadius="lg" required />
                    </Field.Root>
                  </SimpleGrid>
                  <Button
                    type="submit"
                    bg="primary"
                    color="white"
                    size="lg"
                    loading={loading}
                    _hover={{ bg: "secondary", transform: "translateY(-1px)" }}
                    transition="all 200ms ease"
                    borderRadius="lg"
                  >
                    Create Account
                  </Button>
                </Stack>
              </form>
            </Box>

            <Text fontSize="sm" color="foreground" opacity={0.6}>
              Already have an account?{" "}
              <Link as={RouterLink} to="/login" color="primary" fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
                Sign in
              </Link>
            </Text>
          </VStack>
        </Box>
      </Box>

      <LoadingPopup open={loading} message="Creating account..." />
    </Box>
  );
}
