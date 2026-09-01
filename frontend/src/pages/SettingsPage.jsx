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
  createToaster,
} from "@chakra-ui/react";
import { User, Lock, Camera, FloppyDisk } from "@phosphor-icons/react";
import api from "@/services/api";
import LoadingPopup from "@/components/ui/LoadingPopup";

const toaster = createToaster({ placement: "top-end" });

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
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
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("first_name", profileForm.first_name);
      formData.append("last_name", profileForm.last_name);
      formData.append("email", profileForm.email);
      formData.append("phone", profileForm.phone);
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
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toaster.create({ title: "Passwords do not match", type: "error" });
      return;
    }
    if (passwordForm.new_password.length < 6) {
      toaster.create({ title: "Password must be at least 6 characters", type: "error" });
      return;
    }
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

  if (loading) return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" color="primary" /></Box>;

  return (
    <VStack gap={6} align="stretch">
      <Heading size="lg">Settings</Heading>

      <Card.Root bg="white" border="1px solid" borderColor="border">
        <Card.Header><HStack gap={2}><User size={20} color="primary" /><Heading size="md">Profile</Heading></HStack></Card.Header>
        <Card.Body>
          <Stack gap={6}>
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
                  <Field.Root><Field.Label>First Name</Field.Label><Input value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} /></Field.Root>
                  <Field.Root><Field.Label>Last Name</Field.Label><Input value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} /></Field.Root>
                  <Field.Root><Field.Label>Email</Field.Label><Input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} /></Field.Root>
                  <Field.Root><Field.Label>Phone</Field.Label><Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></Field.Root>
                  <Field.Root><Field.Label>Company</Field.Label><Input value={settings?.user?.company_name || ""} readOnly _disabled={{ opacity: 0.7 }} /></Field.Root>
                </SimpleGrid>
                <Button type="submit" bg="primary" color="white" loading={saving} _hover={{ bg: "secondary" }}><FloppyDisk size={16} /> Save Changes</Button>
              </VStack>
            </Box>
          </Stack>
        </Card.Body>
      </Card.Root>

      <Card.Root bg="white" border="1px solid" borderColor="border">
        <Card.Header><HStack gap={2}><Lock size={20} color="primary" /><Heading size="md">Change Password</Heading></HStack></Card.Header>
        <Card.Body>
          <Box as="form" onSubmit={handlePasswordChange}>
            <VStack gap={4}>
              <Field.Root w="full"><Field.Label>Current Password</Field.Label><Input type="password" value={passwordForm.old_password} onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })} required /></Field.Root>
              <Field.Root w="full"><Field.Label>New Password</Field.Label><Input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} required minLength={6} /></Field.Root>
              <Field.Root w="full"><Field.Label>Confirm New Password</Field.Label><Input type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} required minLength={6} /></Field.Root>
              <Button type="submit" bg="primary" color="white" w="full" loading={changingPassword} _hover={{ bg: "secondary" }}>Change Password</Button>
            </VStack>
          </Box>
        </Card.Body>
      </Card.Root>

      <LoadingPopup open={saving} message="Saving profile..." />
      <LoadingPopup open={changingPassword} message="Changing password..." />
    </VStack>
  );
}

function Stack({ children, ...props }) {
  return <VStack gap={4} {...props}>{children}</VStack>;
}
