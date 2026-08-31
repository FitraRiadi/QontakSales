import { useState, useEffect, useCallback } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Field,
  HStack,
  Heading,
  Input,
  InputGroup,
  SimpleGrid,
  Table,
  Text,
  Textarea,
  VStack,
  Spinner,
  Portal,
  createToaster,
} from "@chakra-ui/react";
import { MagnifyingGlass, PaperPlaneRight, CheckCircle, XCircle, Clock } from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

const VARIABLES = [
  { key: "{name}", desc: "Contact name" },
  { key: "{phone}", desc: "Phone number" },
  { key: "{company}", desc: "Company source" },
  { key: "{value}", desc: "Deal value" },
];

export default function BroadcastPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState(null);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    const params = { search, tag: filterTag || undefined, stage: filterStage || undefined };
    api.get("/leads/", { params }).then((r) => {
      setLeads(r.data.results || r.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      toaster.create({ title: "Failed to load leads", type: "error" });
    });
  }, [search, filterTag, filterStage]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const toggleLead = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l.id));
    }
  };

  const insertVariable = (varKey) => {
    setMessage((prev) => prev + varKey);
  };

  const previewMessage = (lead) => {
    return message
      .replace(/\{name\}/g, lead.contact_name)
      .replace(/\{phone\}/g, lead.phone_number)
      .replace(/\{company\}/g, lead.company_source || "")
      .replace(/\{value\}/g, `Rp ${Number(lead.potential_value).toLocaleString("id-ID")}`);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toaster.create({ title: "Message is required", type: "warning" });
      return;
    }
    if (selectedLeads.length === 0) {
      toaster.create({ title: "Select at least 1 lead", type: "warning" });
      return;
    }

    setSending(true);
    try {
      const res = await api.post("/broadcasts/", {
        message: message.trim(),
        lead_ids: selectedLeads,
      });
      setResults(res.data);
      toaster.create({
        title: `Broadcast sent! ${res.data.total_sent} sent, ${res.data.total_failed} failed`,
        type: "success",
      });
    } catch (err) {
      toaster.create({
        title: "Broadcast failed",
        description: err.response?.data?.error || "Something went wrong",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">WhatsApp Broadcast</Heading>
        <Badge colorPalette="green" fontSize="md" px={3} py={1}>
          {selectedLeads.length} leads selected
        </Badge>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        {/* Left: Compose + Select */}
        <VStack gap={4} align="stretch">
          {/* Compose Message */}
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Body>
              <Text fontWeight="semibold" mb={2}>Compose Message</Text>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here... Use variables like {name} for personalization."
                rows={5}
                mb={3}
              />
              <HStack gap={2} wrap="wrap">
                <Text fontSize="xs" color="gray.500">Variables:</Text>
                {VARIABLES.map((v) => (
                  <Button
                    key={v.key}
                    size="xs"
                    variant="outline"
                    onClick={() => insertVariable(v.key)}
                    title={v.desc}
                  >
                    {v.key}
                  </Button>
                ))}
              </HStack>
            </Card.Body>
          </Card.Root>

          {/* Select Leads */}
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Body>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="semibold">Select Leads</Text>
                <Button size="xs" variant="ghost" onClick={toggleAll}>
                  {selectedLeads.length === leads.length ? "Deselect All" : "Select All"}
                </Button>
              </HStack>

              <HStack gap={3} mb={3} wrap="wrap">
                <InputGroup flex={1} minW="150px" startElement={<MagnifyingGlass size={16} />}>
                  <Input
                    size="sm"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", backgroundColor: "white" }}
                >
                  <option value="">All Tags</option>
                  <option value="HOT">Hot</option>
                  <option value="COLD">Cold</option>
                </select>
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", backgroundColor: "white" }}
                >
                  <option value="">All Stages</option>
                  <option value="NEW">Prospek Baru</option>
                  <option value="CONTACTED">Hubungi</option>
                  <option value="NEGOTIATION">Negosiasi</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
                </select>
              </HStack>

              {loading ? (
                <HStack justify="center" py={8}><Spinner /></HStack>
              ) : leads.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>No leads found</Text>
              ) : (
                <Box maxH="400px" overflowY="auto">
                  <Table.Root size="sm">
                    <Table.Header>
                      <Table.Row>
                        <Table.Cell w="40px">
                          <Checkbox.Root
                            checked={selectedLeads.length === leads.length}
                            onCheckedChange={toggleAll}
                          >
                            <Checkbox.Control />
                          </Checkbox.Root>
                        </Table.Cell>
                        <Table.Cell>Company</Table.Cell>
                        <Table.Cell>Contact</Table.Cell>
                        <Table.Cell>Phone</Table.Cell>
                        <Table.Cell>Tag</Table.Cell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {leads.map((lead) => (
                        <Table.Row key={lead.id} _hover={{ bg: "muted" }}>
                          <Table.Cell>
                            <Checkbox.Root
                              checked={selectedLeads.includes(lead.id)}
                              onCheckedChange={() => toggleLead(lead.id)}
                            >
                              <Checkbox.Control />
                            </Checkbox.Root>
                          </Table.Cell>
                          <Table.Cell fontWeight="medium">{lead.name}</Table.Cell>
                          <Table.Cell>{lead.contact_name}</Table.Cell>
                          <Table.Cell fontSize="sm">{lead.phone_number}</Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={lead.tag === "HOT" ? "red" : "blue"} size="sm">
                              {lead.tag}
                            </Badge>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Card.Body>
          </Card.Root>

          {/* Send Button */}
          <Button
            bg="green.600"
            color="white"
            size="lg"
            onClick={handleSend}
            loading={sending}
            disabled={selectedLeads.length === 0 || !message.trim()}
            _hover={{ bg: "green.700" }}
          >
            <PaperPlaneRight size={18} />
            Send Broadcast ({selectedLeads.length} leads)
          </Button>
        </VStack>

        {/* Right: Preview + Results */}
        <VStack gap={4} align="stretch">
          {/* Preview */}
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Body>
              <Text fontWeight="semibold" mb={3}>Message Preview</Text>
              {selectedLeads.length === 0 ? (
                <Text color="gray.400" fontSize="sm">Select a lead to preview the message</Text>
              ) : (
                <VStack align="stretch" gap={3} maxH="300px" overflowY="auto">
                  {selectedLeads.slice(0, 3).map((leadId) => {
                    const lead = leads.find((l) => l.id === leadId);
                    if (!lead) return null;
                    return (
                      <Box key={lead.id} p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="xs" fontWeight="semibold">{lead.contact_name}</Text>
                          <Text fontSize="xs" color="gray.500">{lead.phone_number}</Text>
                        </HStack>
                        <Text fontSize="sm" whiteSpace="pre-wrap">{previewMessage(lead)}</Text>
                      </Box>
                    );
                  })}
                  {selectedLeads.length > 3 && (
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      +{selectedLeads.length - 3} more previews...
                    </Text>
                  )}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

          {/* Results */}
          {results && (
            <Card.Root bg="white" border="1px solid" borderColor="border">
              <Card.Body>
                <Text fontWeight="semibold" mb={3}>Results</Text>
                <HStack gap={4} mb={3}>
                  <HStack gap={1}>
                    <CheckCircle size={16} color="#16a34a" />
                    <Text fontSize="sm" fontWeight="medium">{results.total_sent} Sent</Text>
                  </HStack>
                  <HStack gap={1}>
                    <XCircle size={16} color="#dc2626" />
                    <Text fontSize="sm" fontWeight="medium">{results.total_failed} Failed</Text>
                  </HStack>
                  <HStack gap={1}>
                    <Clock size={16} color="#64748b" />
                    <Text fontSize="sm" fontWeight="medium">{results.total_recipients} Total</Text>
                  </HStack>
                </HStack>
                <Box maxH="250px" overflowY="auto">
                  {results.logs?.map((log) => (
                    <HStack
                      key={log.id}
                      justify="space-between"
                      py={2}
                      borderBottom="1px solid"
                      borderColor="gray.100"
                    >
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="medium">{log.lead_name}</Text>
                        <Text fontSize="xs" color="gray.500">{log.phone_number}</Text>
                      </VStack>
                      <Badge
                        colorPalette={log.status === "SENT" ? "green" : "red"}
                        size="sm"
                      >
                        {log.status === "SENT" ? "✓ Sent" : "✗ Failed"}
                      </Badge>
                    </HStack>
                  ))}
                </Box>
              </Card.Body>
            </Card.Root>
          )}
        </VStack>
      </SimpleGrid>
    </VStack>
  );
}
