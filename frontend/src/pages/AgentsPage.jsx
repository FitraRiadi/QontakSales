import { useState, useEffect, useRef } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Field,
  HStack,
  Heading,
  Input,
  SimpleGrid,
  Spinner,
  Table,
  Text,
  VStack,
  Portal,
  createToaster,
} from "@chakra-ui/react";
import { Plus, Pencil, Trash, UserPlus, Camera, X } from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", password: "", first_name: "", last_name: "", phone: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const fetchAgents = () => {
    api.get("/agents/").then((r) => {
      setAgents(r.data.results || r.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchAgents(); }, []);

  const openCreate = () => {
    setEditAgent(null);
    setForm({ username: "", email: "", password: "", first_name: "", last_name: "", phone: "" });
    setAvatarFile(null);
    setAvatarPreview(null);
    setDialogOpen(true);
  };

  const openEdit = (agent) => {
    setEditAgent(agent);
    setForm({ username: agent.username, email: agent.email, password: "", first_name: agent.first_name || "", last_name: agent.last_name || "", phone: agent.phone || "" });
    setAvatarFile(null);
    setAvatarPreview(agent.avatar_url);
    setDialogOpen(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", form.username);
    formData.append("email", form.email);
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name);
    formData.append("phone", form.phone);
    if (!editAgent) formData.append("password", form.password);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      if (editAgent) {
        await api.put(`/agents/${editAgent.id}/`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        toaster.create({ title: "Agent updated", type: "success" });
      } else {
        await api.post("/agents/", formData, { headers: { "Content-Type": "multipart/form-data" } });
        toaster.create({ title: "Agent created", type: "success" });
      }
      setDialogOpen(false);
      fetchAgents();
    } catch (err) {
      const msg = err.response?.data?.detail || Object.values(err.response?.data || {})[0]?.[0] || "Error";
      toaster.create({ title: typeof msg === "string" ? msg : "Error", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this agent?")) return;
    try {
      await api.delete(`/agents/${id}/`);
      toaster.create({ title: "Agent deleted", type: "success" });
      fetchAgents();
    } catch {
      toaster.create({ title: "Delete failed", type: "error" });
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" color="primary" /></Box>;

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Team Agents</Heading>
        <Button bg="primary" color="white" onClick={openCreate} _hover={{ bg: "secondary" }}><UserPlus size={16} /> Add Agent</Button>
      </HStack>

      <Card.Root bg="white" border="1px solid" borderColor="border">
        <Card.Body>
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Agent</Table.ColumnHeader>
                <Table.ColumnHeader>Email</Table.ColumnHeader>
                <Table.ColumnHeader>Phone</Table.ColumnHeader>
                <Table.ColumnHeader>Role</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {agents.map((agent) => (
                <Table.Row key={agent.id}>
                  <Table.Cell>
                    <HStack>
                      <Avatar.Root size="sm">
                        {agent.avatar_url ? <Avatar.Image src={agent.avatar_url} /> : <Avatar.Fallback name={`${agent.first_name} ${agent.last_name}`} bg="primary" color="white" />}
                      </Avatar.Root>
                      <Text fontWeight="medium">{agent.first_name} {agent.last_name}</Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>{agent.email}</Table.Cell>
                  <Table.Cell>{agent.phone || "-"}</Table.Cell>
                  <Table.Cell><Badge colorPalette={agent.role === "MANAGER" ? "purple" : "blue"}>{agent.role}</Badge></Table.Cell>
                  <Table.Cell>
                    <HStack gap={2}>
                      <Button size="xs" variant="outline" onClick={() => openEdit(agent)}><Pencil size={12} /> Edit</Button>
                      <Button size="xs" variant="outline" colorPalette="red" onClick={() => handleDelete(agent.id)}><Trash size={12} /> Del</Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card.Body>
      </Card.Root>

      <Dialog.Root open={dialogOpen} onOpenChange={(e) => setDialogOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{editAgent ? "Edit Agent" : "Add New Agent"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Box position="relative" cursor="pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar.Root size="2xl">
                      {avatarPreview ? <Avatar.Image src={avatarPreview} /> : <Avatar.Fallback name={`${form.first_name} ${form.last_name}`} bg="primary" color="white" />}
                    </Avatar.Root>
                    <Box position="absolute" bottom={0} right={0} bg="primary" color="white" p={1.5} borderRadius="full"><Camera size={14} /></Box>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                  </Box>
                  <SimpleGrid columns={2} gap={4} w="full">
                    <Field.Root required><Field.Label>First Name</Field.Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></Field.Root>
                    <Field.Root required><Field.Label>Last Name</Field.Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></Field.Root>
                    <Field.Root required><Field.Label>Username</Field.Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={!!editAgent} /></Field.Root>
                    <Field.Root required><Field.Label>Email</Field.Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field.Root>
                    <Field.Root><Field.Label>Phone</Field.Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field.Root>
                    {!editAgent && <Field.Root required><Field.Label>Password</Field.Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field.Root>}
                  </SimpleGrid>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild><Button variant="outline">Cancel</Button></Dialog.CloseTrigger>
                <Button bg="primary" color="white" onClick={handleSubmit}>{editAgent ? "Update" : "Create"}</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
