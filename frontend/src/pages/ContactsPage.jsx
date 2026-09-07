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
import { Plus, MagnifyingGlass, Phone, Envelope, User } from "@phosphor-icons/react";
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
            <Card.Root key={c.id} bg="white" border="1px solid" borderColor="border" _hover={{ borderColor: "primary" }} transition="all 150ms ease">
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
    </VStack>
  );
}
