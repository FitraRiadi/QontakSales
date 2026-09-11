import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Button, Card, Field, Heading, Input, Spinner, Text, VStack, Link, createToaster } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { Lock } from "@phosphor-icons/react";
import api from "@/services/api";
import brandLogo from "@/assets/brand.png";

const toaster = createToaster({ placement: "top" });

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const uid = searchParams.get("uid");

  const [form, setForm] = useState({ new_password: "", confirm_password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    if (!token || !uid) {
      setValidating(false);
      setTokenValid(false);
      return;
    }
    api.get(`/auth/reset-password/?token=${token}&uid=${uid}`)
      .then((r) => setTokenValid(r.data.valid === true))
      .catch(() => setTokenValid(false))
      .finally(() => setValidating(false));
  }, [token, uid]);

  if (validating) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="muted" px={4}>
        <Spinner size="xl" color="primary" />
      </Box>
    );
  }

  if (!token || !uid || !tokenValid) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="muted" px={4}>
        <Card.Root maxW="420px" w="full" bg="#FAFAFA" border="1px solid" borderColor="border">
          <Card.Body p={8}>
            <VStack gap={4} textAlign="center">
              <Box as="img" src={brandLogo} h="28px" />
              <Heading fontWeight="semibold" size="lg">Invalid Link</Heading>
              <Text color="gray.500" fontSize="sm">
                This password reset link is invalid or has expired. Please request a new one.
              </Text>
              <Button as={RouterLink} to="/forgot-password" bg="primary" color="white" _hover={{ bg: "secondary" }}>
                Request New Link
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.new_password) errs.new_password = "Password is required";
    else if (form.new_password.length < 8) errs.new_password = "Password must be at least 8 characters";
    if (!form.confirm_password) errs.confirm_password = "Please confirm your password";
    else if (form.new_password !== form.confirm_password) errs.confirm_password = "Passwords do not match";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await api.post("/auth/reset-password/", {
        token,
        uid: parseInt(uid),
        new_password: form.new_password,
      });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to reset password";
      setErrors({ token: msg });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="muted" px={4}>
        <Card.Root maxW="420px" w="full" bg="#FAFAFA" border="1px solid" borderColor="border">
          <Card.Body p={8}>
            <VStack gap={4} textAlign="center">
              <Box as="img" src={brandLogo} h="28px" />
              <Heading fontWeight="semibold" size="lg">Password Updated</Heading>
              <Text color="gray.500" fontSize="sm">
                Your password has been successfully changed. You can now sign in with your new password.
              </Text>
              <Button onClick={() => navigate("/login")} bg="primary" color="white" w="full" _hover={{ bg: "secondary" }}>
                Go to Sign In
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
              <Heading fontWeight="semibold" size="lg">Set New Password</Heading>
              <Text color="gray.500" fontSize="sm">
                Enter your new password below.
              </Text>
            </VStack>
            {errors.token && (
              <Box bg="red.50" color="red.700" px={4} py={3} borderRadius="md" fontSize="sm" w="full">
                {errors.token}
              </Box>
            )}
            <Box as="form" onSubmit={handleSubmit} w="full">
              <VStack gap={4}>
                <Field.Root w="full" required invalid={!!errors.new_password}>
                  <Field.Label>New Password</Field.Label>
                  <Input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={form.new_password}
                    onChange={(e) => { setForm({ ...form, new_password: e.target.value }); setErrors({ ...errors, new_password: undefined }); }}
                  />
                  <Field.ErrorText>{errors.new_password}</Field.ErrorText>
                </Field.Root>
                <Field.Root w="full" required invalid={!!errors.confirm_password}>
                  <Field.Label>Confirm New Password</Field.Label>
                  <Input
                    type="password"
                    placeholder="Repeat your new password"
                    value={form.confirm_password}
                    onChange={(e) => { setForm({ ...form, confirm_password: e.target.value }); setErrors({ ...errors, confirm_password: undefined }); }}
                  />
                  <Field.ErrorText>{errors.confirm_password}</Field.ErrorText>
                </Field.Root>
                <Button type="submit" bg="primary" color="white" w="full" loading={loading} _hover={{ bg: "secondary" }}>
                  <Lock size={16} /> Reset Password
                </Button>
              </VStack>
            </Box>
            <Text fontSize="sm" color="gray.500">
              <Link as={RouterLink} to="/login" color="primary" fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
                Back to Sign In
              </Link>
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
