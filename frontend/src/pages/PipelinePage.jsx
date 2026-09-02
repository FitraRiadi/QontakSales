import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
  Badge,
  createToaster,
} from "@chakra-ui/react";
import { ArrowRight, CurrencyDollar, CheckCircle, XCircle } from "@phosphor-icons/react";
import { isThisMonth, isThisYear, parseISO } from "date-fns";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

const stages = [
  { id: "NEW", label: "New Lead", color: "stageNew", next: "CONTACTED" },
  { id: "CONTACTED", label: "Contacted", color: "stageContacted", next: "NEGOTIATION" },
  { id: "NEGOTIATION", label: "Negotiation", color: "stageNegotiation", next: "WON" },
  { id: "WON", label: "Won", color: "stageWon", next: null },
  { id: "LOST", label: "Lost", color: "stageLost", next: null },
];

function KanbanCard({ lead, onMove }) {
  const currentStage = stages.find((s) => s.id === lead.stage);
  const nextStageId = currentStage?.next;

  return (
    <Card.Root
      size="sm"
      bg="white"
      border="1px solid"
      borderColor="border"
      _hover={{ borderColor: "primary", transform: "translateY(-2px)" }}
      transition="all 150ms ease"
    >
      <Card.Body p={4}>
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <Text fontWeight="semibold" fontSize="sm">{lead.name}</Text>
            <Badge colorPalette={lead.tag === "HOT" ? "red" : "blue"} size="sm">{lead.tag}</Badge>
          </HStack>
          <Text fontSize="xs" color="foreground" opacity={0.6}>{lead.contact_name}</Text>
          <HStack gap={1} color="foreground" opacity={0.8}>
            <CurrencyDollar size={14} />
            <Text fontSize="sm" fontWeight="medium">Rp {Number(lead.potential_value).toLocaleString("id-ID")}</Text>
          </HStack>
          <HStack gap={2} mt={1}>
            {nextStageId && (
              <Button
                size="xs"
                variant="outline"
                color="primary"
                onClick={() => onMove(lead.id, nextStageId)}
                _hover={{ bg: "primary", color: "white" }}
              >
                <ArrowRight size={12} /> {stages.find((s) => s.id === nextStageId)?.label}
              </Button>
            )}
            {lead.stage !== "WON" && lead.stage !== "LOST" && (
              <>
                <Button
                  size="xs"
                  variant="outline"
                  color="stageWon"
                  onClick={() => onMove(lead.id, "WON")}
                  _hover={{ bg: "stageWon", color: "white" }}
                >
                  <CheckCircle size={12} /> Won
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  color="destructive"
                  onClick={() => onMove(lead.id, "LOST")}
                  _hover={{ bg: "destructive", color: "white" }}
                >
                  <XCircle size={12} /> Lost
                </Button>
              </>
            )}
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

export default function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState("YEAR");

  const fetchLeads = () => {
    api.get("/leads/")
      .then((r) => {
        setLeads(r.data.results || r.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toaster.create({ title: "Failed to load pipeline", type: "error" });
      });
  };

  useEffect(() => { fetchLeads(); }, []);

  const filteredLeads = leads.filter((l) => {
    if (!l.created_at) return true;
    const date = parseISO(l.created_at);
    if (filterPeriod === "MONTH") return isThisMonth(date);
    if (filterPeriod === "YEAR") return isThisYear(date);
    return true;
  });

  const handleMove = async (leadId, newStage) => {
    try {
      await api.post(`/leads/${leadId}/move_stage/`, { stage: newStage });
      const stageLabel = stages.find((s) => s.id === newStage)?.label;
      toaster.create({ title: `Moved to ${stageLabel}`, type: "success" });
      fetchLeads();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to move lead";
      toaster.create({ title: msg, type: "error" });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={20}>
        <Spinner size="xl" color="primary" />
      </Box>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Sales Pipeline</Heading>
        <HStack gap={2}>
          <Button size="sm" variant={filterPeriod === "ALL" ? "solid" : "outline"} bg={filterPeriod === "ALL" ? "primary" : "transparent"} color={filterPeriod === "ALL" ? "white" : "gray.600"} onClick={() => setFilterPeriod("ALL")}>All</Button>
          <Button size="sm" variant={filterPeriod === "MONTH" ? "solid" : "outline"} bg={filterPeriod === "MONTH" ? "primary" : "transparent"} color={filterPeriod === "MONTH" ? "white" : "gray.600"} onClick={() => setFilterPeriod("MONTH")}>This Month</Button>
          <Button size="sm" variant={filterPeriod === "YEAR" ? "solid" : "outline"} bg={filterPeriod === "YEAR" ? "primary" : "transparent"} color={filterPeriod === "YEAR" ? "white" : "gray.600"} onClick={() => setFilterPeriod("YEAR")}>This Year</Button>
        </HStack>
      </HStack>
      <HStack gap={4} align="start" overflowX="auto" pb={4}>
        {stages.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.stage === stage.id);
          return (
            <Box key={stage.id} minW="300px" flex={1} bg="muted" borderRadius="lg" p={4}>
              <HStack mb={4} justify="space-between">
                <HStack gap={2}>
                  <Box w={3} h={3} borderRadius="full" bg={stage.color} />
                  <Text fontWeight="semibold" fontSize="sm">{stage.label}</Text>
                </HStack>
                <Badge variant="outline" size="sm">{stageLeads.length}</Badge>
              </HStack>
              <VStack gap={3} align="stretch" maxH="60vh" overflowY="auto">
                {stageLeads.map((lead) => (
                  <KanbanCard key={lead.id} lead={lead} onMove={handleMove} />
                ))}
                {stageLeads.length === 0 && (
                  <Text fontSize="xs" color="foreground" opacity={0.4} textAlign="center" py={4}>
                    No leads
                  </Text>
                )}
              </VStack>
            </Box>
          );
        })}
      </HStack>
    </VStack>
  );
}
