import { useState, useEffect, useCallback } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
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
import LoadingPopup from "@/components/ui/LoadingPopup";

const toaster = createToaster({ placement: "top-end" });

const VARIABLES = [
  { key: "{name}", desc: "Contact name" },
  { key: "{phone}", desc: "Phone number" },
  { key: "{company}", desc: "Company name" },
];

export default function BroadcastPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState(null);

  const fetchContacts = useCallback(() => {
    setLoading(true);
    const params = { search };
    api.get("/contacts/", { params }).then((r) => {
      setContacts(r.data.results || r.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      toaster.create({ title: "Failed to load contacts", type: "error" });
    });
  }, [search]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const toggleContact = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c.id));
    }
  };

  const insertVariable = (varKey) => {
    setMessage((prev) => prev + varKey);
  };

  const previewMessage = (contact) => {
    const fullName = `${contact.first_name} ${contact.last_name}`;
    return message
      .replace(/\{name\}/g, fullName)
      .replace(/\{phone\}/g, contact.phone || "")
      .replace(/\{company\}/g, contact.account_name || "");
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toaster.create({ title: "Message is required", type: "warning" });
      return;
    }
    if (selectedContacts.length === 0) {
      toaster.create({ title: "Select at least 1 contact", type: "warning" });
      return;
    }

    setSending(true);
    try {
      const res = await api.post("/broadcasts/", {
        message: message.trim(),
        contact_ids: selectedContacts,
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
          {selectedContacts.length} contacts selected
        </Badge>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        <VStack gap={4} align="stretch">
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

          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Body>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="semibold">Select Contacts</Text>
                <Button size="xs" variant="ghost" onClick={toggleAll}>
                  {selectedContacts.length === contacts.length ? "Deselect All" : "Select All"}
                </Button>
              </HStack>

              <HStack gap={3} mb={3}>
                <InputGroup flex={1} startElement={<MagnifyingGlass size={16} />}>
                  <Input
                    size="sm"
                    placeholder="Search contacts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </HStack>

              {loading ? (
                <HStack justify="center" py={8}><Spinner /></HStack>
              ) : contacts.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>No contacts found</Text>
              ) : (
                <Box maxH="400px" overflowY="auto">
                  <Table.Root size="sm">
                    <Table.Header>
                      <Table.Row>
                        <Table.Cell w="40px" />
                        <Table.Cell>Name</Table.Cell>
                        <Table.Cell>Company</Table.Cell>
                        <Table.Cell>Phone</Table.Cell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {contacts.map((contact) => (
                        <Table.Row key={contact.id} _hover={{ bg: "muted" }}>
                          <Table.Cell>
                            <input
                              type="checkbox"
                              checked={selectedContacts.includes(contact.id)}
                              onChange={() => toggleContact(contact.id)}
                              style={{ width: "16px", height: "16px", cursor: "pointer", position: "relative", zIndex: 10 }}
                            />
                          </Table.Cell>
                          <Table.Cell fontWeight="medium">{contact.first_name} {contact.last_name}</Table.Cell>
                          <Table.Cell>{contact.account_name || "-"}</Table.Cell>
                          <Table.Cell fontSize="sm">{contact.phone || "-"}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Card.Body>
          </Card.Root>

          <Button
            bg="green.600"
            color="white"
            size="lg"
            onClick={handleSend}
            loading={sending}
            disabled={selectedContacts.length === 0 || !message.trim()}
            _hover={{ bg: "green.700" }}
          >
            <PaperPlaneRight size={18} />
            Send Broadcast ({selectedContacts.length} contacts)
          </Button>
        </VStack>

        <VStack gap={4} align="stretch">
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Body>
              <Text fontWeight="semibold" mb={3}>Message Preview</Text>
              {selectedContacts.length === 0 ? (
                <Text color="gray.400" fontSize="sm">Select a contact to preview the message</Text>
              ) : (
                <VStack align="stretch" gap={3} maxH="300px" overflowY="auto">
                  {selectedContacts.slice(0, 3).map((contactId) => {
                    const contact = contacts.find((c) => c.id === contactId);
                    if (!contact) return null;
                    return (
                      <Box key={contact.id} p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="xs" fontWeight="semibold">{contact.first_name} {contact.last_name}</Text>
                          <Text fontSize="xs" color="gray.500">{contact.phone}</Text>
                        </HStack>
                        <Text fontSize="sm" whiteSpace="pre-wrap">{previewMessage(contact)}</Text>
                      </Box>
                    );
                  })}
                  {selectedContacts.length > 3 && (
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      +{selectedContacts.length - 3} more previews...
                    </Text>
                  )}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

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
                        <Text fontSize="sm" fontWeight="medium">{log.contact_name}</Text>
                        <Text fontSize="xs" color="gray.500">{log.phone_number}</Text>
                      </VStack>
                      <Badge
                        colorPalette={log.status === "SENT" ? "green" : "red"}
                        size="sm"
                      >
                        {log.status === "SENT" ? "Sent" : "Failed"}
                      </Badge>
                    </HStack>
                  ))}
                </Box>
              </Card.Body>
            </Card.Root>
          )}
        </VStack>
      </SimpleGrid>

      <LoadingPopup open={sending} message="Sending broadcast..." />
    </VStack>
  );
}
