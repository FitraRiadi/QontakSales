import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Input,
  Portal,
  Dialog,
  Field,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  Badge,
  createToaster,
} from "@chakra-ui/react";
import { Plus, MagnifyingGlass, Phone, Envelope, User, PhoneCall, ChatCircle, X, PencilSimple, Trash } from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

const ROLE_LABELS = { DECISION_MAKER: "Decision Maker", CHAMPION: "Champion", TECH_EVALUATOR: "Tech Evaluator", INFLUENCER: "Influencer", BLOCKER: "Blocker", USER: "End User", OTHER: "Other" };
const ROLE_COLORS = { DECISION_MAKER: "green", CHAMPION: "blue", TECH_EVALUATOR: "purple", INFLUENCER: "yellow", BLOCKER: "red", USER: "gray", OTHER: "gray" };

export default function ContactsPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [contactForm, setContactForm] = useState({ first_name: "", last_name: "", email: "", phone: "", job_title: "", department: "", role_in_deal: "OTHER", notes: "" });
  const [contactErrors, setContactErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);

  const fetchContacts = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (filterRole) params.role = filterRole;
    api.get("/contacts/", { params })
      .then((r) => { setContacts(r.data.results || r.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  };

  useEffect(() => { fetchContacts(); }, [search, filterRole]);

  const openEdit = (contact) => {
    setEditContact(contact);
    setContactForm({
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      job_title: contact.job_title || "",
      department: contact.department || "",
      role_in_deal: contact.role_in_deal || "OTHER",
      notes: contact.notes || "",
    });
    setContactErrors({});
    setContactDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleEditContact = async () => {
    const errs = {};
    if (!contactForm.first_name.trim()) errs.first_name = "First name is required";
    if (!contactForm.email.trim()) errs.email = "Email is required";
    if (!contactForm.phone.trim()) errs.phone = "Phone is required";
    if (Object.keys(errs).length > 0) { setContactErrors(errs); return; }
    setContactErrors({});
    setSaving(true);
    try {
      await api.put(`/contacts/${editContact.id}/`, contactForm);
      toaster.create({ title: "Contact updated", type: "success" });
      setEditDialogOpen(false);
      fetchContacts();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const fieldErrors = {};
        for (const [key, val] of Object.entries(data)) {
          if (Array.isArray(val)) fieldErrors[key] = val[0];
          else if (typeof val === "string") fieldErrors[key] = val;
        }
        if (Object.keys(fieldErrors).length > 0) { setContactErrors(fieldErrors); return; }
      }
      toaster.create({ title: "Failed to update contact", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!deleteDialog) return;
    try {
      await api.delete(`/contacts/${deleteDialog.id}/`);
      toaster.create({ title: "Contact deleted", type: "success" });
      setDeleteDialog(null);
      setContactDialogOpen(false);
      fetchContacts();
    } catch {
      toaster.create({ title: "Failed to delete contact", type: "error" });
    }
  };

  return (
    <VStack gap={6} align="stretch">
      <Heading size="lg">Contacts</Heading>
      <HStack gap={3} wrap="wrap">
        <Box position="relative" flex={1} minW="200px">
          <Input placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} pl={10} />
          <MagnifyingGlass size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
        </Box>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", backgroundColor: "white" }}>
          <option value="">All Roles</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </HStack>
      {loading ? (
        <Box display="flex" justifyContent="center" py={10}><Spinner size="lg" color="primary" /></Box>
      ) : contacts.length === 0 ? (
        <Box textAlign="center" py={10}><User size={48} style={{ margin: "0 auto 12px", opacity: 0.3 }} /><Text color="gray.500">No contacts found</Text></Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {contacts.map((c) => (
            <Card.Root key={c.id} bg="white" border="1px solid" borderColor="border" _hover={{ borderColor: "primary", boxShadow: "lg" }} transition="all 150ms ease" cursor="pointer" onClick={() => { setSelectedContact(c); setContactDialogOpen(true); }}>
              <Card.Body>
                <HStack gap={3} mb={2}>
                  <Box w={10} h={10} borderRadius="full" bg="primary" color="white" display="flex" alignItems="center" justifyContent="center"><User size={18} /></Box>
                  <VStack align="start" gap={0} flex={1}>
                    <Text fontWeight="semibold" fontSize="sm">{c.first_name} {c.last_name}</Text>
                    {c.job_title && <Text fontSize="xs" color="gray.500">{c.job_title}</Text>}
                  </VStack>
                  <Badge size="sm" colorPalette={ROLE_COLORS[c.role_in_deal] || "gray"}>{ROLE_LABELS[c.role_in_deal]}</Badge>
                </HStack>
                {c.account_name && <Text fontSize="xs" color="gray.400" mb={2}>{c.account_name}</Text>}
                <VStack align="start" gap={1}>
                  {c.phone && <HStack gap={1}><Phone size={12} color="gray.400" /><Text fontSize="xs">{c.phone}</Text></HStack>}
                  {c.email && <HStack gap={1}><Envelope size={12} color="gray.400" /><Text fontSize="xs">{c.email}</Text></HStack>}
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      )}
      <Dialog.Root open={contactDialogOpen} onOpenChange={(e) => setContactDialogOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="440px" borderRadius="xl" overflow="hidden">
              {selectedContact && (
                <>
                  <Box bg="primary" px={6} pt={6} pb={10} position="relative">
                    <VStack position="absolute" top={3} right={3} gap={1}>
                      <Button
                        size="xs" variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}
                        onClick={() => openEdit(selectedContact)}
                      >
                        <PencilSimple size={14} />
                      </Button>
                      <Button
                        size="xs" variant="ghost" color="white" _hover={{ bg: "redAlpha.400" }}
                        onClick={() => { setContactDialogOpen(false); setDeleteDialog(selectedContact); }}
                      >
                        <Trash size={14} />
                      </Button>
                      <Button
                        size="xs" variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}
                        onClick={() => setContactDialogOpen(false)}
                      >
                        <X size={16} />
                      </Button>
                    </VStack>
                    <VStack align="center" gap={3}>
                      <Box
                        w={16} h={16} borderRadius="full" bg="whiteAlpha.200"
                        border="2px solid white" color="white"
                        display="flex" alignItems="center" justifyContent="center"
                      >
                        <User size={28} weight="fill" />
                      </Box>
                      <VStack align="center" gap={0}>
                        <Text fontWeight="bold" fontSize="lg" color="white">
                          {selectedContact.first_name} {selectedContact.last_name}
                        </Text>
                        {selectedContact.job_title && (
                          <Text fontSize="sm" color="whiteAlpha.800">{selectedContact.job_title}</Text>
                        )}
                        {selectedContact.account_name && (
                          <HStack gap={1} mt={1}>
                            <Badge bg="whiteAlpha.200" color="white" size="sm" borderRadius="full">
                              {selectedContact.account_name}
                            </Badge>
                            {selectedContact.role_in_deal && (
                              <Badge bg="whiteAlpha.300" color="white" size="sm" borderRadius="full">
                                {ROLE_LABELS[selectedContact.role_in_deal] || selectedContact.role_in_deal}
                              </Badge>
                            )}
                          </HStack>
                        )}
                      </VStack>
                    </VStack>
                  </Box>

                  <Box px={6} pb={6} pt={4}>
                    <HStack gap={3} mb={5}>
                      {selectedContact.phone && (
                        <Button
                          flex={1} size="sm" bg="green.500" color="white"
                          _hover={{ bg: "green.600" }}
                          leftIcon={<PhoneCall size={14} />}
                          onClick={() => window.open(`tel:${selectedContact.phone.replace(/\s/g, "")}`)}
                        >
                          Call
                        </Button>
                      )}
                      {selectedContact.phone && (
                        <Button
                          flex={1} size="sm" variant="outline"
                          color="green.600" borderColor="green.300"
                          _hover={{ bg: "green.50" }}
                          leftIcon={<ChatCircle size={14} />}
                          onClick={() => window.open(`https://wa.me/${selectedContact.phone.replace(/\D/g, "")}`)}
                        >
                          WhatsApp
                        </Button>
                      )}
                      {selectedContact.email && (
                        <Button
                          flex={1} size="sm" variant="outline"
                          color="blue.600" borderColor="blue.300"
                          _hover={{ bg: "blue.50" }}
                          leftIcon={<Envelope size={14} />}
                          onClick={() => window.open(`mailto:${selectedContact.email}`)}
                        >
                          Email
                        </Button>
                      )}
                    </HStack>

                    <VStack align="stretch" gap={0}>
                      <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={2}>
                        Contact Info
                      </Text>
                      <VStack align="stretch" gap={3} bg="muted" borderRadius="lg" p={4}>
                        {selectedContact.phone && (
                          <HStack gap={3}>
                            <Box w={8} h={8} borderRadius="md" bg="green.100" color="green.600" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                              <Phone size={14} />
                            </Box>
                            <VStack align="start" gap={0}>
                              <Text fontSize="xs" color="gray.500">Phone</Text>
                              <Text fontSize="sm" fontWeight="medium">{selectedContact.phone}</Text>
                            </VStack>
                          </HStack>
                        )}
                        {selectedContact.email && (
                          <HStack gap={3}>
                            <Box w={8} h={8} borderRadius="md" bg="blue.100" color="blue.600" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                              <Envelope size={14} />
                            </Box>
                            <VStack align="start" gap={0}>
                              <Text fontSize="xs" color="gray.500">Email</Text>
                              <Text fontSize="sm" fontWeight="medium">{selectedContact.email}</Text>
                            </VStack>
                          </HStack>
                        )}
                      </VStack>
                    </VStack>

                    <VStack align="stretch" gap={0} mt={4}>
                      <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={2}>
                        Details
                      </Text>
                      <VStack align="stretch" gap={0} bg="muted" borderRadius="lg" p={4}>
                        {selectedContact.role_in_deal && (
                          <HStack justify="space-between" py={1.5}>
                            <Text fontSize="sm" color="gray.500">Role in Deal</Text>
                            <Badge size="sm" colorPalette={ROLE_COLORS[selectedContact.role_in_deal] || "gray"} borderRadius="full">
                              {ROLE_LABELS[selectedContact.role_in_deal] || selectedContact.role_in_deal}
                            </Badge>
                          </HStack>
                        )}
                        <HStack justify="space-between" py={1.5}>
                          <Text fontSize="sm" color="gray.500">Status</Text>
                          <Badge size="sm" colorPalette="green" borderRadius="full">Active</Badge>
                        </HStack>
                        {selectedContact.created_at && (
                          <HStack justify="space-between" py={1.5}>
                            <Text fontSize="sm" color="gray.500">Created</Text>
                            <Text fontSize="sm">{new Date(selectedContact.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</Text>
                          </HStack>
                        )}
                      </VStack>
                    </VStack>
                  </Box>
                </>
              )}
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={editDialogOpen} onOpenChange={(e) => setEditDialogOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="500px">
              <Dialog.Header><Dialog.Title>Edit Contact</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1} required invalid={!!contactErrors.first_name}>
                      <Field.Label>First Name</Field.Label>
                      <Input placeholder="John" value={contactForm.first_name} onChange={(e) => { setContactErrors({ ...contactErrors, first_name: undefined }); setContactForm({ ...contactForm, first_name: e.target.value }); }} />
                      <Field.ErrorText>{contactErrors.first_name}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root flex={1} invalid={!!contactErrors.last_name}>
                      <Field.Label>Last Name</Field.Label>
                      <Input placeholder="Doe" value={contactForm.last_name} onChange={(e) => { setContactErrors({ ...contactErrors, last_name: undefined }); setContactForm({ ...contactForm, last_name: e.target.value }); }} />
                      <Field.ErrorText>{contactErrors.last_name}</Field.ErrorText>
                    </Field.Root>
                  </HStack>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1} required invalid={!!contactErrors.email}>
                      <Field.Label>Email</Field.Label>
                      <Input type="email" placeholder="john@company.com" value={contactForm.email} onChange={(e) => { setContactErrors({ ...contactErrors, email: undefined }); setContactForm({ ...contactForm, email: e.target.value }); }} />
                      <Field.ErrorText>{contactErrors.email}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root flex={1} required invalid={!!contactErrors.phone}>
                      <Field.Label>Phone</Field.Label>
                      <Input placeholder="+62 xxx" value={contactForm.phone} onChange={(e) => { setContactErrors({ ...contactErrors, phone: undefined }); setContactForm({ ...contactForm, phone: e.target.value }); }} />
                      <Field.ErrorText>{contactErrors.phone}</Field.ErrorText>
                    </Field.Root>
                  </HStack>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}><Field.Label>Job Title (optional)</Field.Label><Input placeholder="VP Sales" value={contactForm.job_title} onChange={(e) => setContactForm({ ...contactForm, job_title: e.target.value })} /></Field.Root>
                    <Field.Root flex={1}>
                      <Field.Label>Role in Deal (optional)</Field.Label>
                      <select value={contactForm.role_in_deal} onChange={(e) => setContactForm({ ...contactForm, role_in_deal: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}>
                        {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </Field.Root>
                  </HStack>
                  <Field.Root w="full"><Field.Label>Notes (optional)</Field.Label><textarea placeholder="Contact notes..." value={contactForm.notes} onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })} rows={3} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", resize: "vertical" }} /></Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild><Button variant="outline" mr={3}>Cancel</Button></Dialog.CloseTrigger>
                <Button bg="primary" color="white" onClick={handleEditContact} loading={saving}>Update</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={!!deleteDialog} onOpenChange={(e) => { if (!e.open) setDeleteDialog(null); }}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="400px">
              <Dialog.Header><Dialog.Title>Delete Contact</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <Text>Are you sure you want to delete <strong>{deleteDialog?.first_name} {deleteDialog?.last_name}</strong>? This action cannot be undone.</Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild><Button variant="outline" mr={3}>Cancel</Button></Dialog.CloseTrigger>
                <Button bg="red.500" color="white" _hover={{ bg: "red.600" }} onClick={handleDeleteContact}>Delete</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
