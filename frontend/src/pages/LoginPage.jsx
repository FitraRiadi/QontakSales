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
  Icon,
} from "@chakra-ui/react";
import { Eye, EyeClosed, Lightning, ChartLineUp, Kanban } from "@phosphor-icons/react";
import api from "@/services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (localStorage.getItem("access_token")) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/token/", { email, password });
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      const profile = await api.get("/auth/profile/");
      localStorage.setItem("user_role", profile.data.role);
      localStorage.setItem("user_name", `${profile.data.first_name} ${profile.data.last_name}`);
      localStorage.removeItem("manager_token");
      localStorage.removeItem("manager_refresh");
      localStorage.removeItem("manager_user");
      localStorage.removeItem("impersonating");
      localStorage.removeItem("impersonated_name");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || "Invalid email or password";
      setError(msg);
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
        <Box position="absolute" top={0} left={0} right={0} bottom={0} opacity={0.1}>
          <Kanban size={400} weight="light" style={{ position: "absolute", top: -50, right: -50 }} />
        </Box>
        <VStack align="start" gap={8} position="relative" zIndex={1}>
          <Heading size="2xl">QontakSales</Heading>
          <VStack align="start" gap={6}>
            <HStack gap={4}>
              <Box bg="white/20" p={3} borderRadius="lg"><ChartLineUp size={24} /></Box>
              <VStack align="start" gap={0}>
                <Text fontWeight="semibold">Track Performance</Text>
                <Text fontSize="sm" opacity={0.8}>Real-time analytics & reports</Text>
              </VStack>
            </HStack>
            <HStack gap={4}>
              <Box bg="white/20" p={3} borderRadius="lg"><Kanban size={24} /></Box>
              <VStack align="start" gap={0}>
                <Text fontWeight="semibold">Manage Pipeline</Text>
                <Text fontSize="sm" opacity={0.8}>Visual Kanban board</Text>
              </VStack>
            </HStack>
            <HStack gap={4}>
              <Box bg="white/20" p={3} borderRadius="lg"><Lightning size={24} /></Box>
              <VStack align="start" gap={0}>
                <Text fontWeight="semibold">Close Faster</Text>
                <Text fontSize="sm" opacity={0.8}>Boost your sales velocity</Text>
              </VStack>
            </HStack>
          </VStack>
        </VStack>
      </Box>

      {/* Right Panel - Form */}
      <Box flex={1} display="flex" alignItems="center" justifyContent="center" p={8} bg="background">
        <Box w="100%" maxW="400px">
          <VStack gap={8}>
            <VStack gap={3} align={{ base: "center", md: "start" }}>
              <Heading size="xl" color="foreground">Welcome back</Heading>
              <Text color="foreground" opacity={0.6}>Sign in to your account to continue</Text>
            </VStack>

            <Box w="100%" bg="white" p={8} borderRadius="2xl" border="1px solid" borderColor="border" shadow="sm">
              <form onSubmit={handleSubmit}>
                <Stack gap={5}>
                  {error && (
                    <Box bg="destructive/10" color="destructive" p={3} borderRadius="md" fontSize="sm" textAlign="center">
                      {error}
                    </Box>
                  )}
                  <Field.Root>
                    <Field.Label color="foreground">Email</Field.Label>
                    <Input
                      size="lg"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      borderRadius="lg"
                      required
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label color="foreground">Password</Field.Label>
                    <Box position="relative" w="full">
                      <Input
                        size="lg"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        borderRadius="lg"
                        w="full"
                        pr={12}
                        required
                      />
                      <Box
                        position="absolute"
                        right={4}
                        top="50%"
                        transform="translateY(-50%)"
                        cursor="pointer"
                        onClick={() => setShowPassword(!showPassword)}
                        color="foreground"
                        opacity={0.5}
                        _hover={{ opacity: 1 }}
                        display="flex"
                        alignItems="center"
                      >
                        {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                      </Box>
                    </Box>
                  </Field.Root>
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
                    Sign In
                  </Button>
                </Stack>
              </form>
            </Box>

            <Text fontSize="sm" color="foreground" opacity={0.6}>
              Don't have an account?{" "}
              <Link as={RouterLink} to="/register" color="primary" fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
                Sign up for free
              </Link>
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
