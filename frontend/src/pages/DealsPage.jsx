import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Dialog,
  Field,
  Heading,
  HStack,
  Input,
  Portal,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  Badge,
  createToaster,
} from "@chakra-ui/react";
import { ArrowRight, CurrencyDollar, CheckCircle, XCircle, Plus } from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

const stages = [
  { id: "QUALIFICATION", label: "Qualification", color: "blue", next: "DISCOVERY", prob: 10 },
  { id: "DISCOVERY", label: "Discovery", color: "yellow", next: "PROPOSAL", prob: 30 },
  { id: "PROPOSAL", label: "Proposal", color: "purple", next: "NEGOTIATION", prob: 50 },
  { id: "NEGOTIATION", label: "Negotiation", color: "orange", next: "CLOSING", prob: 70 },
  { id: "CLOSING", label: "Closing", color: "red", next: null, prob: 90 },
  { id: "WON", label: "Won", color: "green", next: null, prob: 100 },
  { id: "LOST", label: "Lost", color: "red", next: null, prob: 0 },
];

function DealCard({ deal, onMove }) {
  const currentStage = stages.find((s) => s.id === deal.stage);
  const nextStageId = currentStage?.next;
  const nextStage = stages.find((s) => s.id === nextStageId);

  return (
    <Card.Root size="sm" bg="white" border="1px solid" borderColor="border" _hover={{ borderColor: "primary", transform: "translateY(-2px)" }} transition="all 150ms ease">
      <Card.Body p={4}>
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>{deal.name}</Text>
            <Badge size="sm" colorPalette={deal.probability >= 70 ? "green" : deal.probability >= 40 ? "yellow" : "blue"}>{deal.probability}%</Badge>
          </HStack>
          <Text fontSize="xs" color="gray.500">{deal.company_name}</Text>
          {deal.contacts?.length > 0 && (
            <Text fontSize="xs" color="gray.400">{deal.contacts.map((c) => c.full_name).join(", ")}</Text>
          )}
          <HStack gap={1} color="gray.600">
            <CurrencyDollar size={14} />
            <Text fontSize="sm" fontWeight="medium">Rp {Number(deal.amount).toLocaleString("id-ID")}</Text>
          </HStack>
          {deal.expected_close_date && <Text fontSize="xs" color="gray.400">Close: {deal.expected_close_date}</Text>}
          <HStack gap={1} mt={1}>
            {nextStageId && (
              <Button size="xs" variant="outline" color="primary" onClick={() => onMove(deal.id, nextStageId)} _hover={{ bg: "primary", color: "white" }}>
                <ArrowRight size={12} /> {nextStage?.label}
              </Button>
            )}
            {deal.stage !== "WON" && deal.stage !== "LOST" && (
              <>
                <Button size="xs" variant="outline" color="green.500" onClick={() => onMove(deal.id, "WON")} _hover={{ bg: "green.500", color: "white" }}><CheckCircle size={12} /> Won</Button>
                <Button size="xs" variant="outline" color="red.500" onClick={() => onMove(deal.id, "LOST")} _hover={{ bg: "red.500", color: "white" }}><XCircle size={12} /> Lost</Button>
              </>
            )}
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

export default function DealsPage() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ name: "", company: "", amount: "", expected_close_date: "", description: "", source: "", competitors: "" });
  const [saving, setSaving] = useState(false);

  const fetchDeals = () => {
    api.get("/deals/", { params: { page_size: 200 } })
      .then((r) => { setDeals(r.data.results || r.data); setLoading(false); })
      .catch(() => { setLoading(false); toaster.create({ title: "Failed to load deals", type: "error" }); });
  };

  useEffect(() => { fetchDeals(); }, []);

  const openCreate = async () => {
    setForm({ name: "", company: "", amount: "", expected_close_date: "", description: "", source: "", competitors: "" });
    try {
      const res = await api.get("/accounts/");
      const data = res.data;
      setAccounts(data.results || data);
    } catch { setAccounts([]); }
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!form.name || !form.company) return toaster.create({ title: "Name and Company are required", type: "error" });
    setSaving(true);
    try {
      const res = await api.post("/deals/", { ...form, amount: form.amount || 0 });
      toaster.create({ title: "Deal created", type: "success" });
      setCreateOpen(false);
      navigate(`/deals/${res.data.id}`);
    } catch {
      toaster.create({ title: "Failed to create deal", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (dealId, newStage) => {
    try {
      await api.post(`/deals/${dealId}/move_stage/`, { stage: newStage });
      const stageLabel = stages.find((s) => s.id === newStage)?.label;
      toaster.create({ title: `Moved to ${stageLabel}`, type: "success" });
      fetchDeals();
    } catch (err) {
      toaster.create({ title: err.response?.data?.error || "Failed to move deal", type: "error" });
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" color="primary" /></Box>;

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Deal Pipeline</Heading>
        <Button bg="primary" color="white" onClick={openCreate}><Plus size={16} /> New Deal</Button>
      </HStack>
      <HStack gap={4} align="start" overflowX="auto" pb={4}>
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          const totalValue = stageDeals.reduce((sum, d) => sum + Number(d.amount), 0);
          return (
            <Box key={stage.id} minW="280px" flex={1} bg="muted" borderRadius="lg" p={4}>
              <HStack mb={4} justify="space-between">
                <HStack gap={2}>
                  <Box w={3} h={3} borderRadius="full" bg={stage.color} />
                  <Text fontWeight="semibold" fontSize="sm">{stage.label}</Text>
                </HStack>
                <VStack gap={0} align="end">
                  <Badge variant="outline" size="sm">{stageDeals.length}</Badge>
                  <Text fontSize="xs" color="gray.500">Rp {(totalValue / 1000000).toFixed(0)}jt</Text>
                </VStack>
              </HStack>
              <VStack gap={3} align="stretch" maxH="60vh" overflowY="auto">
                {stageDeals.map((deal) => (
                  <Box key={deal.id} cursor="pointer" onClick={() => navigate(`/deals/${deal.id}`)}>
                    <DealCard deal={deal} onMove={handleMove} />
                  </Box>
                ))}
                {stageDeals.length === 0 && <Text fontSize="xs" color="gray.400" textAlign="center" py={4}>No deals</Text>}
              </VStack>
            </Box>
          );
        })}
      </HStack>

      <Dialog.Root open={createOpen} onOpenChange={(e) => setCreateOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="500px">
              <Dialog.Header><Dialog.Title>Create New Deal</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root required><Field.Label>Deal Name</Field.Label><Input placeholder="e.g. CRM Implementation" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field.Root>
                  <Field.Root required>
                    <Field.Label>Company</Field.Label>
                    <select value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}>
                      <option value="">Select company...</option>
                      {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </Field.Root>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}><Field.Label>Amount (Rp)</Field.Label><Input type="number" placeholder="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field.Root>
                    <Field.Root flex={1}><Field.Label>Expected Close</Field.Label><Input type="date" value={form.expected_close_date} onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })} /></Field.Root>
                  </HStack>
                  <Field.Root w="full"><Field.Label>Source</Field.Label><Input placeholder="e.g. Website, Referral, Cold Call" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></Field.Root>
                  <Field.Root w="full"><Field.Label>Competitors</Field.Label><Input placeholder="e.g. Mekari Qontak, Salesmo" value={form.competitors} onChange={(e) => setForm({ ...form, competitors: e.target.value })} /></Field.Root>
                  <Field.Root w="full"><Field.Label>Description</Field.Label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", resize: "vertical" }} /></Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild><Button variant="outline" mr={3}>Cancel</Button></Dialog.CloseTrigger>
                <Button bg="primary" color="white" onClick={handleCreate} loading={saving}>Create Deal</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
