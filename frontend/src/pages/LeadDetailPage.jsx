import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Card,
  Field,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spinner,
  Table,
  Text,
  Textarea,
  VStack,
  createToaster,
} from "@chakra-ui/react";
import { ArrowLeft, Phone, Buildings, CurrencyDollar, Clock } from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    Promise.all([
      api.get(`/leads/${id}/`),
      api.get("/activities/", { params: { lead_id: id } }),
    ]).then(([leadRes, logsRes]) => {
      setLead(leadRes.data);
      setLogs(logsRes.data.results || logsRes.data);
      setLoading(false);
    }).catch(() => { setLoading(false); toaster.create({ title: "Failed to load lead", type: "error" }); });
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const res = await api.post("/activities/", { lead: lead.id, notes: newNote });
      setLogs([res.data, ...logs]);
      setNewNote("");
      toaster.create({ title: "Note added", type: "success" });
    } catch {
      toaster.create({ title: "Failed to add note", type: "error" });
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" color="primary" /></Box>;
  if (!lead) return <Text>Lead not found</Text>;

  return (
    <VStack gap={6} align="stretch">
      <HStack gap={4}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</Button>
        <Heading size="lg">Lead Detail</Heading>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
        <Box lg={{ colSpan: 2 }}>
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header>
              <HStack justify="space-between">
                <Heading size="md">{lead.name}</Heading>
                <Badge colorPalette={lead.tag === "HOT" ? "red" : "blue"}>{lead.tag}</Badge>
              </HStack>
            </Card.Header>
            <Card.Body>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <HStack gap={3}><Buildings size={20} color="#64748B" /><VStack align="start" gap={0}><Text fontSize="xs" color="foreground" opacity={0.6}>Company</Text><Text fontWeight="medium">{lead.company_source || "-"}</Text></VStack></HStack>
                <HStack gap={3}><Phone size={20} color="#64748B" /><VStack align="start" gap={0}><Text fontSize="xs" color="foreground" opacity={0.6}>Phone</Text><Text fontWeight="medium">{lead.phone_number}</Text></VStack></HStack>
                <HStack gap={3}><CurrencyDollar size={20} color="#64748B" /><VStack align="start" gap={0}><Text fontSize="xs" color="foreground" opacity={0.6}>Deal Value</Text><Text fontWeight="medium">Rp {Number(lead.potential_value).toLocaleString("id-ID")}</Text></VStack></HStack>
                <HStack gap={3}><Clock size={20} color="#64748B" /><VStack align="start" gap={0}><Text fontSize="xs" color="foreground" opacity={0.6}>Stage</Text><Text fontWeight="medium">{lead.stage}</Text></VStack></HStack>
              </SimpleGrid>
            </Card.Body>
          </Card.Root>
        </Box>

        <Card.Root bg="white" border="1px solid" borderColor="border">
          <Card.Header><Heading size="md">Quick Actions</Heading></Card.Header>
          <Card.Body>
            <VStack gap={3} align="stretch">
              <Button variant="outline" justifyContent="flex-start"><Phone size={16} /> Call Contact</Button>
              <Button variant="outline" justifyContent="flex-start" colorPalette="red" onClick={async () => { await api.post(`/leads/${lead.id}/move_stage/`, { stage: "LOST" }); setLead({ ...lead, stage: "LOST" }); toaster.create({ title: "Marked as Lost", type: "warning" }); }}>Mark as Lost</Button>
              <Button variant="outline" justifyContent="flex-start" colorPalette="green" onClick={async () => { await api.post(`/leads/${lead.id}/move_stage/`, { stage: "WON" }); setLead({ ...lead, stage: "WON" }); toaster.create({ title: "Marked as Won!", type: "success" }); }}>Mark as Won</Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <Card.Root bg="white" border="1px solid" borderColor="border">
        <Card.Header><Heading size="md">Activity Log</Heading></Card.Header>
        <Card.Body>
          <Box as="form" onSubmit={handleAddNote} mb={6}>
            <Field.Root>
              <Field.Label>Add Note</Field.Label>
              <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Enter activity note..." rows={3} />
            </Field.Root>
            <Button type="submit" mt={3} bg="primary" color="white" _hover={{ bg: "secondary" }}>Add Note</Button>
          </Box>

          <VStack gap={4} align="stretch">
            {logs.length === 0 && <Text color="foreground" opacity={0.5}>No activity logs yet.</Text>}
            {logs.map((log) => (
              <Box key={log.id} p={4} bg="muted" borderRadius="md" borderLeft="3px solid" borderColor="primary">
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="medium" fontSize="sm">{log.agent_name}</Text>
                  <Text fontSize="xs" color="foreground" opacity={0.6}>{new Date(log.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</Text>
                </HStack>
                <Text fontSize="sm">{log.notes}</Text>
              </Box>
            ))}
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}
