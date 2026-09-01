import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
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
  Portal,
  createToaster,
} from "@chakra-ui/react";
import { Plus, MagnifyingGlass, ArrowUp, ArrowDown, Buildings, Phone, Archive } from "@phosphor-icons/react";
import api from "@/services/api";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingPopup from "@/components/ui/LoadingPopup";

const toaster = createToaster({ placement: "top-end" });

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [form, setForm] = useState({ name: "", contact_name: "", phone_number: "", email: "", company_source: "", potential_value: "", tag: "COLD", stage: "NEW" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [archiveDialog, setArchiveDialog] = useState({ open: false, id: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const userRole = localStorage.getItem("user_role");
  const isManager = userRole === "MANAGER";

  const fetchLeads = useCallback(() => {
    setLoading(true);
    const params = { page, ordering, search, tag: filterTag || undefined, stage: filterStage || undefined };
    api.get("/leads/", { params }).then((r) => {
      setLeads(r.data.results || r.data);
      setCount(r.data.count || (r.data.results || r.data).length);
      setLoading(false);
    }).catch(() => { setLoading(false); toaster.create({ title: "Failed to load leads", type: "error" }); });
  }, [page, ordering, search, filterTag, filterStage]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleSort = (field) => {
    setOrdering(ordering === field ? `-${field}` : field);
    setPage(1);
  };

  const openCreate = () => { setEditLead(null); setForm({ name: "", contact_name: "", phone_number: "", email: "", company_source: "", potential_value: "", tag: "COLD", stage: "NEW", address: "" }); setDialogOpen(true); };
  const openEdit = (lead) => { setEditLead(lead); setForm({ name: lead.name, contact_name: lead.contact_name, phone_number: lead.phone_number, email: lead.email || "", company_source: lead.company_source || "", potential_value: lead.potential_value, tag: lead.tag, stage: lead.stage, address: lead.address || "" }); setDialogOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (editLead) {
        await api.put(`/leads/${editLead.id}/`, form);
        toaster.create({ title: "Lead updated", type: "success" });
      } else {
        await api.post("/leads/", form);
        toaster.create({ title: "Lead created", type: "success" });
      }
      setDialogOpen(false);
      fetchLeads();
    } catch (err) {
      toaster.create({ title: "Error", description: err.response?.data?.detail || "Something went wrong", type: "error" });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await api.delete(`/leads/${id}/`);
      toaster.create({ title: "Lead deleted", type: "success" });
      fetchLeads();
    } catch {
      toaster.create({ title: "Delete failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async (id) => {
    setActionLoading(true);
    try {
      await api.post(`/leads/${id}/archive/`);
      toaster.create({ title: "Lead archived", type: "success" });
      fetchLeads();
    } catch {
      toaster.create({ title: "Archive failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const SortIcon = ({ field }) => {
    if (ordering === field) return <ArrowUp size={14} color="primary" />;
    if (ordering === `-${field}`) return <ArrowDown size={14} color="primary" />;
    return null;
  };

  const totalPages = Math.ceil(count / 10);

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Leads Directory</Heading>
        <Button bg="primary" color="white" onClick={openCreate} _hover={{ bg: "secondary" }}><Plus size={16} /> Add Lead</Button>
      </HStack>

      <Card.Root bg="white" border="1px solid" borderColor="border">
        <Card.Body>
          <HStack gap={4} mb={4} wrap="wrap">
            <InputGroup flex={1} minW="200px" startElement={<MagnifyingGlass size={16} />}>
              <Input placeholder="Search leads..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </InputGroup>
            <select
              value={filterTag}
              onChange={(e) => { setFilterTag(e.target.value); setPage(1); }}
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", backgroundColor: "white" }}
            >
              <option value="">All Tags</option>
              <option value="HOT">Hot</option>
              <option value="COLD">Cold</option>
            </select>
            <select
              value={filterStage}
              onChange={(e) => { setFilterStage(e.target.value); setPage(1); }}
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", backgroundColor: "white" }}
            >
              <option value="">All Stages</option>
              <option value="NEW">Prospek Baru</option>
              <option value="CONTACTED">Hubungi</option>
              <option value="NEGOTIATION">Negosiasi</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>
          </HStack>

          <Box overflowX="auto">
            <Table.Root size="sm" interactive>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader cursor="pointer" onClick={() => handleSort("name")}><HStack gap={1}>Company <SortIcon field="name" /></HStack></Table.ColumnHeader>
                  <Table.ColumnHeader>Contact</Table.ColumnHeader>
                  <Table.ColumnHeader>Phone</Table.ColumnHeader>
                  <Table.ColumnHeader cursor="pointer" onClick={() => handleSort("potential_value")}><HStack gap={1}>Value <SortIcon field="potential_value" /></HStack></Table.ColumnHeader>
                  <Table.ColumnHeader>Tag</Table.ColumnHeader>
                  <Table.ColumnHeader cursor="pointer" onClick={() => handleSort("stage")}><HStack gap={1}>Stage <SortIcon field="stage" /></HStack></Table.ColumnHeader>
                  <Table.ColumnHeader>Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {leads.map((lead) => (
                  <Table.Row key={lead.id} _hover={{ bg: "muted" }}>
                    <Table.Cell><HStack><Buildings size={16} color="#64748B" /><Text fontWeight="medium" cursor="pointer" color="primary" onClick={() => navigate(`/leads/${lead.id}`)}>{lead.name}</Text></HStack></Table.Cell>
                    <Table.Cell>{lead.contact_name}</Table.Cell>
                    <Table.Cell><HStack><Phone size={14} color="#64748B" /><Text fontSize="sm">{lead.phone_number}</Text></HStack></Table.Cell>
                    <Table.Cell fontWeight="medium">Rp {Number(lead.potential_value).toLocaleString("id-ID")}</Table.Cell>
                    <Table.Cell><Badge colorPalette={lead.tag === "HOT" ? "red" : "blue"}>{lead.tag}</Badge></Table.Cell>
                    <Table.Cell><Text fontSize="sm">{lead.stage}</Text></Table.Cell>
                    <Table.Cell>
                      <HStack gap={2}>
                        <Button size="xs" variant="outline" onClick={() => openEdit(lead)}>Edit</Button>
                        <Button size="xs" variant="outline" colorPalette="orange" onClick={() => setArchiveDialog({ open: true, id: lead.id })}>
                          <Archive size={12} />
                        </Button>
                        {isManager && (
                          <Button size="xs" variant="outline" colorPalette="red" onClick={() => setDeleteDialog({ open: true, id: lead.id })}>Del</Button>
                        )}
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          {totalPages > 1 && (
            <HStack justify="center" mt={4} gap={2}>
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Text fontSize="sm">Page {page} of {totalPages}</Text>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </HStack>
          )}
        </Card.Body>
      </Card.Root>

      <Dialog.Root open={dialogOpen} onOpenChange={(e) => setDialogOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{editLead ? "Edit Lead" : "New Lead"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Box as="form" onSubmit={handleSubmit}>
                  <VStack gap={4}>
                    <SimpleGrid columns={2} gap={4} w="full">
                      <Field.Root required>
                        <Field.Label>Company Name</Field.Label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label>Contact Name</Field.Label>
                        <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label>Phone</Field.Label>
                        <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Email</Field.Label>
                        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Source Company</Field.Label>
                        <Input value={form.company_source} onChange={(e) => setForm({ ...form, company_source: e.target.value })} />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label>Deal Value (Rp)</Field.Label>
                        <Input type="number" value={form.potential_value} onChange={(e) => setForm({ ...form, potential_value: e.target.value })} />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Tag</Field.Label>
                        <select
                          value={form.tag}
                          onChange={(e) => setForm({ ...form, tag: e.target.value })}
                          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}
                        >
                          <option value="HOT">Hot</option>
                          <option value="COLD">Cold</option>
                        </select>
                      </Field.Root>
                      {editLead && (
                        <Field.Root>
                          <Field.Label>Stage</Field.Label>
                          <select
                            value={form.stage}
                            onChange={(e) => setForm({ ...form, stage: e.target.value })}
                            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}
                          >
                            <option value="NEW">Prospek Baru</option>
                            <option value="CONTACTED">Hubungi</option>
                            <option value="NEGOTIATION">Negosiasi</option>
                            <option value="WON">Won</option>
                            <option value="LOST">Lost</option>
                          </select>
                        </Field.Root>
                      )}
                    </SimpleGrid>
                    <Field.Root w="full">
                      <Field.Label>Address</Field.Label>
                      <Textarea
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Enter full address for Google Maps..."
                        rows={3}
                      />
                    </Field.Root>
                  </VStack>
                </Box>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild><Button variant="outline">Cancel</Button></Dialog.CloseTrigger>
                <Button bg="primary" color="white" onClick={handleSubmit}>{editLead ? "Update" : "Create"}</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={() => handleDelete(deleteDialog.id)}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        action="delete"
      />

      <ConfirmDialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, id: null })}
        onConfirm={() => handleArchive(archiveDialog.id)}
        title="Archive Lead"
        message="This lead will be hidden from Leads, Pipeline, and Dashboard. You can restore it later from Archived Leads."
        action="archive"
      />

      <LoadingPopup open={actionLoading} message="Processing..." />
      <LoadingPopup open={submitLoading} message={editLead ? "Updating lead..." : "Creating lead..."} />
    </VStack>
  );
}
