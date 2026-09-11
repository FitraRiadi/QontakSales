import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  Field,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  Avatar,
  Link,
  createToaster,
} from "@chakra-ui/react";
import { User, Lock, Camera, FloppyDisk } from "@phosphor-icons/react";
import { Link as RouterLink } from "react-router-dom";
import api from "@/services/api";
import LoadingPopup from "@/components/ui/LoadingPopup";

const toaster = createToaster({ placement: "top" });

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [sendingReset, setSendingReset] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get("/auth/settings/").then((r) => {
      setSettings(r.data);
      setProfileForm({
        first_name: r.data.user.first_name || "",
        last_name: r.data.user.last_name || "",
        email: r.data.user.email || "",
        phone: r.data.user.phone || "",
      });
      setAvatarPreview(r.data.user.avatar_url);
      setLoading(false);
    });
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setProfileForm({ ...profileForm, _avatarFile: file });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!profileForm.first_name.trim()) errs.first_name = "First name is required";
    if (!profileForm.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) errs.email = "Please enter a valid email";
    if (Object.keys(errs).length > 0) { setProfileErrors(errs); return; }
    setProfileErrors({});
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("first_name", profileForm.first_name.trim());
      formData.append("last_name", profileForm.last_name.trim());
      formData.append("email", profileForm.email.trim());
      formData.append("phone", profileForm.phone.trim());
      if (profileForm._avatarFile) {
        formData.append("avatar", profileForm._avatarFile);
      }
      await api.put("/auth/settings/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toaster.create({ title: "Profile updated", type: "success" });
    } catch {
      toaster.create({ title: "Update failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwordForm.old_password) errs.old_password = "Current password is required";
    if (!passwordForm.new_password) errs.new_password = "New password is required";
    else if (passwordForm.new_password.length < 8) errs.new_password = "Password must be at least 8 characters";
    if (!passwordForm.confirm_password) errs.confirm_password = "Please confirm your password";
    else if (passwordForm.new_password !== passwordForm.confirm_password) errs.confirm_password = "Passwords do not match";
    if (Object.keys(errs).length > 0) { setPasswordErrors(errs); return; }
    setPasswordErrors({});
    setChangingPassword(true);
    try {
      await api.post("/auth/change-password/", {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
      toaster.create({ title: "Password changed successfully", type: "success" });
    } catch (err) {
      toaster.create({ title: err.response?.data?.error || "Failed to change password", type: "error" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!profileForm.email) { toaster.create({ title: "No email found", type: "error" }); return; }
    setSendingReset(true);
    try {
      await api.post("/auth/forgot-password/", { email: profileForm.email });
      toaster.create({ title: "Reset link sent to your email", type: "success" });
    } catch {
      toaster.create({ title: "Failed to send reset link", type: "error" });
    } finally {
      setSendingReset(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" color="primary" /></Box>;

  return (
    <VStack gap={6} align="stretch">
      <Heading fontWeight="semibold" size="lg">Settings</Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        <Card.Root bg="#FAFAFA" border="1px solid" borderColor="border">
          <Card.Header><HStack gap={2}><User size={20} color="primary" /><Heading fontWeight="semibold" size="md">Profile</Heading></HStack></Card.Header>
          <Card.Body>
            <VStack gap={6} align="stretch">
              <HStack gap={6} align="center">
                <Box position="relative">
                  <Avatar.Root size="2xl" cursor="pointer" onClick={() => fileInputRef.current?.click()}>
                    {avatarPreview ? (
                      <Avatar.Image src={avatarPreview} />
                    ) : (
                      <Avatar.Fallback name={`${profileForm.first_name} ${profileForm.last_name}`} bg="primary" color="white" />
                    )}
                  </Avatar.Root>
                  <Box
                    position="absolute" bottom={0} right={0} bg="primary" color="white"
                    p={1.5} borderRadius="full" cursor="pointer"
                    onClick={() => fileInputRef.current?.click()}
                    _hover={{ bg: "secondary" }}
                  >
                    <Camera size={14} />
                  </Box>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                </Box>
                <VStack align="start" gap={1}>
                  <Text fontWeight="semibold">{profileForm.first_name} {profileForm.last_name}</Text>
                  <Text fontSize="sm" color="foreground" opacity={0.6}>{settings?.user?.role}</Text>
                  {settings?.user?.company_name && (
                    <Text fontSize="xs" color="foreground" opacity={0.5}>{settings.user.company_name}</Text>
                  )}
                  <Text fontSize="xs" color="foreground" opacity={0.4}>Click avatar to change photo</Text>
                </VStack>
              </HStack>

              <Box as="form" onSubmit={handleProfileUpdate}>
                <VStack gap={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                    <Field.Root invalid={!!profileErrors.first_name}>
                      <Field.Label>First Name *</Field.Label>
                      <Input value={profileForm.first_name} onChange={(e) => { setProfileForm({ ...profileForm, first_name: e.target.value }); if (profileErrors.first_name) setProfileErrors((p) => ({ ...p, first_name: "" })); }} />
                      <Field.ErrorText>{profileErrors.first_name}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Last Name</Field.Label>
                      <Input value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} />
                    </Field.Root>
                    <Field.Root invalid={!!profileErrors.email}>
                      <Field.Label>Email *</Field.Label>
                      <Input type="email" value={profileForm.email} onChange={(e) => { setProfileForm({ ...profileForm, email: e.target.value }); if (profileErrors.email) setProfileErrors((p) => ({ ...p, email: "" })); }} />
                      <Field.ErrorText>{profileErrors.email}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Phone</Field.Label>
                      <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Company</Field.Label>
                      <Input value={settings?.user?.company_name || ""} isDisabled pointerEvents="none" tabIndex={-1} bg="gray.100" color="gray.500" borderColor="gray.200" _disabled={{ opacity: 1, cursor: "default" }} />
                    </Field.Root>
                  </SimpleGrid>
                  <Button type="submit" bg="primary" color="white" loading={saving} _hover={{ bg: "secondary" }}><FloppyDisk size={16} /> Save Changes</Button>
                </VStack>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root bg="#FAFAFA" border="1px solid" borderColor="border" display="flex" flexDirection="column">
          <Card.Header><HStack gap={2}><Lock size={20} color="primary" /><Heading fontWeight="semibold" size="md">Change Password</Heading></HStack></Card.Header>
          <Card.Body display="flex" flexDirection="column" flex={1}>
            <Box as="form" onSubmit={handlePasswordChange} display="flex" flexDirection="column" flex={1}>
              <VStack gap={4} flex={1}>
                <Field.Root w="full" invalid={!!passwordErrors.old_password}>
                  <Field.Label>Current Password *</Field.Label>
                  <Input type="password" value={passwordForm.old_password} onChange={(e) => { setPasswordForm({ ...passwordForm, old_password: e.target.value }); if (passwordErrors.old_password) setPasswordErrors((p) => ({ ...p, old_password: "" })); }} />
                  <Field.ErrorText>{passwordErrors.old_password}</Field.ErrorText>
                </Field.Root>
                <Field.Root w="full" invalid={!!passwordErrors.new_password}>
                  <Field.Label>New Password *</Field.Label>
                  <Input type="password" value={passwordForm.new_password} onChange={(e) => { setPasswordForm({ ...passwordForm, new_password: e.target.value }); if (passwordErrors.new_password) setPasswordErrors((p) => ({ ...p, new_password: "" })); }} />
                  <Field.ErrorText>{passwordErrors.new_password}</Field.ErrorText>
                </Field.Root>
                <Field.Root w="full" invalid={!!passwordErrors.confirm_password}>
                  <Field.Label>Confirm New Password *</Field.Label>
                  <Input type="password" value={passwordForm.confirm_password} onChange={(e) => { setPasswordForm({ ...passwordForm, confirm_password: e.target.value }); if (passwordErrors.confirm_password) setPasswordErrors((p) => ({ ...p, confirm_password: "" })); }} />
                  <Field.ErrorText>{passwordErrors.confirm_password}</Field.ErrorText>
                </Field.Root>
                <Box mt="auto">
                  <HStack justify="center" mb={3}>
                    <Link as={RouterLink} to="/forgot-password" fontSize="sm" color="primary" fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
                      Forgot your password?
                    </Link>
                  </HStack>
                  <Button type="submit" bg="primary" color="white" w="full" loading={changingPassword} _hover={{ bg: "secondary" }}>Change Password</Button>
                </Box>
              </VStack>
            </Box>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <LoadingPopup open={saving} message="Saving profile..." />
      <LoadingPopup open={changingPassword} message="Changing password..." />
    </VStack>
  );
}

function Stack({ children, ...props }) {
  return <VStack gap={4} {...props}>{children}</VStack>;
}
