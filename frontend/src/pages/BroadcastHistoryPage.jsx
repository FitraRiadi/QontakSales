import { useState, useEffect } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  HStack,
  Heading,
  Spinner,
  Table,
  Text,
  VStack,
  Portal,
  createToaster,
} from "@chakra-ui/react";
import { Eye, CheckCircle, XCircle } from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

const STATUS_MAP = {
  DRAFT: { label: "Draft", color: "gray" },
  SENDING: { label: "Sending", color: "yellow" },
  COMPLETED: { label: "Completed", color: "green" },
  FAILED: { label: "Failed", color: "red" },
};

export default function BroadcastHistoryPage() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/broadcasts/");
      setBroadcasts(res.data.results || res.data);
    } catch {
      toaster.create({ title: "Failed to load broadcasts", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBroadcasts(); }, []);

  const viewDetail = (broadcast) => {
    setSelectedBroadcast(broadcast);
    setDetailOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const truncateMessage = (msg, maxLen = 50) => {
    if (!msg) return "-";
    return msg.length > maxLen ? msg.slice(0, maxLen) + "..." : msg;
  };

  return (
    <VStack gap={6} align="stretch">
      <Heading size="lg">Broadcast History</Heading>

      <Card.Root bg="white" border="1px solid" borderColor="border">
        <Card.Body>
          {loading ? (
            <HStack justify="center" py={12}><Spinner /></HStack>
          ) : broadcasts.length === 0 ? (
            <VStack py={12}>
              <Text color="gray.500">No broadcast history yet</Text>
              <Button as="a" href="/broadcasts" bg="green.600" color="white" size="sm">
                Create Broadcast
              </Button>
            </VStack>
          ) : (
            <Box overflowX="auto">
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader w="50px">#</Table.ColumnHeader>
                    <Table.ColumnHeader>Message</Table.ColumnHeader>
                    <Table.ColumnHeader>Recipients</Table.ColumnHeader>
                    <Table.ColumnHeader>Sent</Table.ColumnHeader>
                    <Table.ColumnHeader>Failed</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader>Date</Table.ColumnHeader>
                    <Table.ColumnHeader w="60px">Detail</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {broadcasts.map((b) => (
                    <Table.Row key={b.id} _hover={{ bg: "muted" }}>
                      <Table.Cell fontWeight="medium">{b.id}</Table.Cell>
                      <Table.Cell maxW="200px">
                        <Text fontSize="sm" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {truncateMessage(b.message)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>{b.total_recipients}</Table.Cell>
                      <Table.Cell>
                        <HStack gap={1}>
                          <CheckCircle size={14} color="#16a34a" />
                          <Text fontSize="sm">{b.total_sent}</Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <HStack gap={1}>
                          <XCircle size={14} color={b.total_failed > 0 ? "#dc2626" : "#94a3b8"} />
                          <Text fontSize="sm" color={b.total_failed > 0 ? "red.600" : "gray.500"}>
                            {b.total_failed}
                          </Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={STATUS_MAP[b.status]?.color || "gray"}>
                          {STATUS_MAP[b.status]?.label || b.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell fontSize="sm" color="gray.600">{formatDate(b.sent_at || b.created_at)}</Table.Cell>
                      <Table.Cell>
                        <Button size="xs" variant="ghost" onClick={() => viewDetail(b)}>
                          <Eye size={16} />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </Card.Body>
      </Card.Root>

      {/* Detail Dialog */}
      <Dialog.Root open={detailOpen} onOpenChange={(e) => setDetailOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="600px">
              <Dialog.Header>
                <Dialog.Title>Broadcast #{selectedBroadcast?.id}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {selectedBroadcast && (
                  <VStack align="stretch" gap={4}>
                    <Box p={3} bg="gray.50" borderRadius="md">
                      <Text fontSize="xs" color="gray.500" mb={1}>Message</Text>
                      <Text fontSize="sm" whiteSpace="pre-wrap">{selectedBroadcast.message}</Text>
                    </Box>

                    <HStack gap={4}>
                      <Box flex={1} p={3} bg="gray.50" borderRadius="md" textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold">{selectedBroadcast.total_recipients}</Text>
                        <Text fontSize="xs" color="gray.500">Recipients</Text>
                      </Box>
                      <Box flex={1} p={3} bg="green.50" borderRadius="md" textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="green.600">{selectedBroadcast.total_sent}</Text>
                        <Text fontSize="xs" color="gray.500">Sent</Text>
                      </Box>
                      <Box flex={1} p={3} bg="red.50" borderRadius="md" textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="red.600">{selectedBroadcast.total_failed}</Text>
                        <Text fontSize="xs" color="gray.500">Failed</Text>
                      </Box>
                    </HStack>

                    {selectedBroadcast.logs?.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={2}>Delivery Log</Text>
                        <Box maxH="250px" overflowY="auto">
                          {selectedBroadcast.logs.map((log) => (
                            <HStack
                              key={log.id}
                              justify="space-between"
                              py={2}
                              borderBottom="1px solid"
                              borderColor="gray.100"
                            >
                              <VStack align="start" gap={0}>
                                <Text fontSize="sm">{log.lead_name || "Unknown"}</Text>
                                <Text fontSize="xs" color="gray.500">{log.phone_number}</Text>
                              </VStack>
                              <VStack align="end" gap={0}>
                                <Badge
                                  colorPalette={log.status === "SENT" ? "green" : "red"}
                                  size="sm"
                                >
                                  {log.status === "SENT" ? "✓ Sent" : "✗ Failed"}
                                </Badge>
                                {log.error_message && (
                                  <Text fontSize="xs" color="red.500" maxW="200px" noOfLines={1}>
                                    {log.error_message}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </VStack>
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <Button variant="outline">Close</Button>
                </Dialog.CloseTrigger>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
