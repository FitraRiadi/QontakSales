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
import { Plus, MagnifyingGlass, Phone, Envelope, User, PhoneCall, ChatCircle, X } from "@phosphor-icons/react";
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
            <Dialog.Content maxW="400px">
              <Dialog.Header>
                <HStack justify="space-between">
                  <Dialog.Title>{selectedContact ? `${selectedContact.first_name} ${selectedContact.last_name}` : "Contact Detail"}</Dialog.Title>
                  <Button variant="ghost" size="sm" onClick={() => setContactDialogOpen(false)}><X size={16} /></Button>
                </HStack>
              </Dialog.Header>
              <Dialog.Body>
                {selectedContact && (
                  <VStack gap={4} align="stretch">
                    <HStack gap={3}>
                      <Box w={12} h={12} borderRadius="full" bg="primary" color="white" display="flex" alignItems="center" justifyContent="center"><User size={22} /></Box>
                      <VStack align="start" gap={1} flex={1}>
                        <Text fontWeight="bold" fontSize="lg">{selectedContact.first_name} {selectedContact.last_name}</Text>
                        {selectedContact.job_title && <Text fontSize="sm" color="gray.500">{selectedContact.job_title}</Text>}
                        {selectedContact.account_name && <Text fontSize="sm" color="gray.400">{selectedContact.account_name}</Text>}
                      </VStack>
                    </HStack>
                    <Box borderBottom="1px solid" borderColor="border" w="full" my={2} />
                    <VStack align="start" gap={3}>
                      {selectedContact.phone && (
                        <HStack gap={3}>
                          <PhoneCall size={20} color="primary" />
                          <VStack align="start" gap={1} flex={1}>
                            <Text fontSize="sm" color="gray.500">Phone</Text>
                            <HStack gap={2}>
                              <Text fontSize="sm" fontWeight="medium">{selectedContact.phone}</Text>
                              <Button size="xs" leftIcon={<PhoneCall size={12} />} variant="solid" bg="green.500" color="white" onClick={() => window.open(`tel:${selectedContact.phone.replace(/\s/g, "")}`)}>Call</Button>
                              <Button size="xs" leftIcon={<ChatCircle size={12} />} variant="outline" color="green.500" borderColor="green.500" onClick={() => window.open(`https://wa.me/${selectedContact.phone.replace(/\D/g, "")}`)}>WhatsApp</Button>
                            </HStack>
                          </VStack>
                        </HStack>
                      )}
                      {selectedContact.email && (
                        <HStack gap={3}>
                          <Envelope size={20} color="primary" />
                          <VStack align="start" gap={1} flex={1}>
                            <Text fontSize="sm" color="gray.500">Email</Text>
                            <Button size="xs" leftIcon={<ChatCircle size={12} />} variant="outline" color="blue.500" borderColor="blue.500" onClick={() => window.open(`mailto:${selectedContact.email}`)}>{selectedContact.email}</Button>
                          </VStack>
                        </HStack>
                      )}
                    </VStack>
                  </VStack>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
