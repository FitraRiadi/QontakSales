import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Card,
  HStack,
  Heading,
  Input,
  InputGroup,
  SimpleGrid,
  Table,
  Text,
  VStack,
  Spinner,
  createToaster,
} from "@chakra-ui/react";
import { MagnifyingGlass, Buildings, Phone, ArrowClockwise } from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

export default function ArchivedLeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    const params = { page, search, archived: "true" };
    api.get("/leads/", { params }).then((r) => {
      setLeads(r.data.results || r.data);
      setCount(r.data.count || (r.data.results || r.data).length);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      toaster.create({ title: "Failed to load archived leads", type: "error" });
    });
  }, [page, search]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleRestore = async (id) => {
    try {
      await api.post(`/leads/${id}/restore/`);
      toaster.create({ title: "Lead restored", type: "success" });
      fetchLeads();
    } catch {
      toaster.create({ title: "Restore failed", type: "error" });
    }
  };

  const totalPages = Math.ceil(count / 10);

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Archived Leads</Heading>
        <Badge colorPalette="orange" fontSize="md" px={3} py={1}>
          {count} archived
        </Badge>
      </HStack>

      <Card.Root bg="white" border="1px solid" borderColor="border">
        <Card.Body>
          <HStack gap={4} mb={4}>
            <InputGroup flex={1} minW="200px" startElement={<MagnifyingGlass size={16} />}>
              <Input placeholder="Search archived leads..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </InputGroup>
          </HStack>

          {loading ? (
            <HStack justify="center" py={12}><Spinner /></HStack>
          ) : leads.length === 0 ? (
            <VStack py={12}>
              <Text color="gray.500">No archived leads</Text>
              <Button size="sm" variant="outline" onClick={() => navigate("/leads")}>Back to Leads</Button>
            </VStack>
          ) : (
            <Box overflowX="auto">
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Company</Table.ColumnHeader>
                    <Table.ColumnHeader>Contact</Table.ColumnHeader>
                    <Table.ColumnHeader>Phone</Table.ColumnHeader>
                    <Table.ColumnHeader>Tag</Table.ColumnHeader>
                    <Table.ColumnHeader>Stage</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {leads.map((lead) => (
                    <Table.Row key={lead.id} _hover={{ bg: "muted" }}>
                      <Table.Cell>
                        <HStack>
                          <Buildings size={16} color="#64748B" />
                          <Text fontWeight="medium" cursor="pointer" color="primary" onClick={() => navigate(`/leads/${lead.id}`)}>
                            {lead.name}
                          </Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>{lead.contact_name}</Table.Cell>
                      <Table.Cell>
                        <HStack>
                          <Phone size={14} color="#64748B" />
                          <Text fontSize="sm">{lead.phone_number}</Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={lead.tag === "HOT" ? "red" : "blue"} size="sm">{lead.tag}</Badge>
                      </Table.Cell>
                      <Table.Cell><Text fontSize="sm">{lead.stage}</Text></Table.Cell>
                      <Table.Cell>
                        <Button size="xs" variant="outline" colorPalette="green" onClick={() => handleRestore(lead.id)}>
                          <ArrowClockwise size={12} /> Restore
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}

          {totalPages > 1 && (
            <HStack justify="center" mt={4} gap={2}>
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Text fontSize="sm">Page {page} of {totalPages}</Text>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </HStack>
          )}
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}
