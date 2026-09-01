import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Field,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  Textarea,
  VStack,
  Portal,
  createToaster,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Phone,
  Envelope,
  Buildings,
  CurrencyDollar,
  Clock,
  User,
  MapPin,
  FloppyDisk,
  PencilSimple,
  WhatsappLogo,
  CheckCircle,
  XCircle,
  Archive,
  ArrowClockwise,
} from "@phosphor-icons/react";
import api from "@/services/api";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingPopup from "@/components/ui/LoadingPopup";

const toaster = createToaster({ placement: "top-end" });

const STAGE_LABELS = {
  NEW: "Prospek Baru",
  CONTACTED: "Hubungi",
  NEGOTIATION: "Negosiasi",
  WON: "Won",
  LOST: "Lost",
};

const STAGE_COLORS = {
  NEW: "blue",
  CONTACTED: "yellow",
  NEGOTIATION: "purple",
  WON: "green",
  LOST: "red",
};

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/leads/${id}/`),
      api.get("/activities/", { params: { lead_id: id } }),
    ]).then(([leadRes, logsRes]) => {
      setLead(leadRes.data);
      setLogs(logsRes.data.results || logsRes.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      toaster.create({ title: "Failed to load lead", type: "error" });
    });
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

  const openEdit = () => {
    setEditForm({
      name: lead.name || "",
      contact_name: lead.contact_name || "",
      phone_number: lead.phone_number || "",
      email: lead.email || "",
      company_source: lead.company_source || "",
      potential_value: lead.potential_value || "",
      tag: lead.tag || "COLD",
      stage: lead.stage || "NEW",
      address: lead.address || "",
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/leads/${lead.id}/`, editForm);
      setLead(res.data);
      setEditOpen(false);
      toaster.create({ title: "Lead updated", type: "success" });
    } catch {
      toaster.create({ title: "Update failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleMoveStage = async (stage) => {
    try {
      const res = await api.post(`/leads/${lead.id}/move_stage/`, { stage });
      setLead(res.data);
      toaster.create({ title: `Marked as ${STAGE_LABELS[stage]}`, type: stage === "WON" ? "success" : "warning" });
    } catch {
      toaster.create({ title: "Failed to update stage", type: "error" });
    }
  };

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/leads/${lead.id}/archive/`);
      setLead(res.data.lead);
      toaster.create({ title: "Lead archived", type: "success" });
    } catch {
      toaster.create({ title: "Archive failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/leads/${lead.id}/restore/`);
      setLead(res.data.lead);
      toaster.create({ title: "Lead restored", type: "success" });
    } catch {
      toaster.create({ title: "Restore failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const mapsUrl = lead?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`
    : null;

  if (loading)
    return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" color="primary" /></Box>;
  if (!lead) return <Text>Lead not found</Text>;

  return (
    <VStack gap={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" wrap="wrap" gap={4}>
        <HStack gap={4} wrap="wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </Button>
          <VStack align="start" gap={0}>
            <HStack gap={3} wrap="wrap">
              <Heading size={{ base: "md", md: "lg" }}>{lead.name}</Heading>
              <Badge colorPalette={STAGE_COLORS[lead.stage]} size="lg">{STAGE_LABELS[lead.stage]}</Badge>
              <Badge colorPalette={lead.tag === "HOT" ? "red" : "blue"} size="lg">{lead.tag}</Badge>
              {lead.is_archived && <Badge colorPalette="orange" size="lg">Archived</Badge>}
            </HStack>
            {lead.company_source && <Text fontSize="sm" color="foreground" opacity={0.6}>{lead.company_source}</Text>}
          </VStack>
        </HStack>
        <HStack gap={2}>
          {lead.is_archived ? (
            <Button size="sm" variant="outline" colorPalette="green" onClick={handleRestore}>
              <ArrowClockwise size={14} /> Restore
            </Button>
          ) : (
            <Button size="sm" variant="outline" colorPalette="orange" onClick={() => setArchiveDialog(true)}>
              <Archive size={14} /> Archive
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={openEdit}>
            <PencilSimple size={14} /> Edit
          </Button>
        </HStack>
      </HStack>

      {/* Info Cards Row */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={4}>
        <Card.Root bg="white" border="1px solid" borderColor="border">
          <Card.Body py={4}>
            <HStack gap={3}>
              <Box bg="blue.50" p={2} borderRadius="md"><Phone size={20} color="#2563EB" /></Box>
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color="foreground" opacity={0.5}>Phone</Text>
                <Text fontWeight="semibold" fontSize="sm">{lead.phone_number}</Text>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>

        <Card.Root bg="white" border="1px solid" borderColor="border">
          <Card.Body py={4}>
            <HStack gap={3}>
              <Box bg="purple.50" p={2} borderRadius="md"><Envelope size={20} color="#7C3AED" /></Box>
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color="foreground" opacity={0.5}>Email</Text>
                <Text fontWeight="semibold" fontSize="sm">{lead.email || "-"}</Text>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>

        <Card.Root bg="white" border="1px solid" borderColor="border">
          <Card.Body py={4}>
            <HStack gap={3}>
              <Box bg="green.50" p={2} borderRadius="md"><CurrencyDollar size={20} color="#059669" /></Box>
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color="foreground" opacity={0.5}>Deal Value</Text>
                <Text fontWeight="semibold" fontSize="sm">Rp {Number(lead.potential_value).toLocaleString("id-ID")}</Text>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>

        <Card.Root bg="white" border="1px solid" borderColor="border">
          <Card.Body py={4}>
            <HStack gap={3}>
              <Box bg="orange.50" p={2} borderRadius="md"><Clock size={20} color="#EA580C" /></Box>
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color="foreground" opacity={0.5}>Created</Text>
                <Text fontWeight="semibold" fontSize="sm">{formatDate(lead.created_at)}</Text>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Main Content */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        {/* Left Column */}
        <Box display="flex" flexDirection="column" gap={6}>
          {/* Contact Info */}
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header>
              <HStack gap={2}><User size={18} color="primary" /><Heading size="sm">Contact Information</Heading></HStack>
            </Card.Header>
            <Card.Body>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" color="foreground" opacity={0.5}>Contact Name</Text>
                  <Text fontWeight="medium">{lead.contact_name}</Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" color="foreground" opacity={0.5}>Email</Text>
                  <Text fontWeight="medium">{lead.email || "-"}</Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" color="foreground" opacity={0.5}>Phone</Text>
                  <Text fontWeight="medium">{lead.phone_number}</Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" color="foreground" opacity={0.5}>Assigned To</Text>
                  <Text fontWeight="medium">{lead.assigned_to_name || "Unassigned"}</Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" color="foreground" opacity={0.5}>Created</Text>
                  <Text fontWeight="medium">{formatDate(lead.created_at)}</Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" color="foreground" opacity={0.5}>Last Updated</Text>
                  <Text fontWeight="medium">{formatDate(lead.updated_at)}</Text>
                </VStack>
              </SimpleGrid>
            </Card.Body>
          </Card.Root>

          {/* Address + Maps */}
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header>
              <HStack gap={2}><MapPin size={18} color="primary" /><Heading size="sm">Location</Heading></HStack>
            </Card.Header>
            <Card.Body>
              {lead.address ? (
                <VStack align="stretch" gap={4}>
                  <Text fontSize="sm">{lead.address}</Text>
                  <Box
                    as="a"
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    display="block"
                    borderRadius="lg"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="border"
                    _hover={{ shadow: "md" }}
                    transition="all 200ms ease"
                  >
                    <Box
                      as="iframe"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(lead.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      width="100%"
                      height="250"
                      border="0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Google Maps"
                    />
                  </Box>
                  <Button
                    as="a"
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    variant="outline"
                    colorPalette="blue"
                  >
                    <MapPin size={14} /> Open in Google Maps
                  </Button>
                </VStack>
              ) : (
                <Text fontSize="sm" color="foreground" opacity={0.5}>No address provided</Text>
              )}
            </Card.Body>
          </Card.Root>

          {/* Activity Log */}
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header>
              <HStack gap={2}><Clock size={18} color="primary" /><Heading size="sm">Activity Log</Heading></HStack>
            </Card.Header>
            <Card.Body>
              <Box as="form" onSubmit={handleAddNote} mb={6}>
                <Field.Root>
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this lead..."
                    rows={3}
                    borderRadius="lg"
                  />
                </Field.Root>
                <Button type="submit" mt={3} bg="primary" color="white" size="sm" _hover={{ bg: "secondary" }}>
                  Add Note
                </Button>
              </Box>

              <VStack gap={3} align="stretch">
                {logs.length === 0 && (
                  <Text fontSize="sm" color="foreground" opacity={0.5}>No activity logs yet.</Text>
                )}
                {logs.map((log) => (
                  <Box key={log.id} p={4} bg="muted" borderRadius="lg" borderLeft="3px solid" borderColor="primary">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium" fontSize="sm">{log.agent_name}</Text>
                      <Text fontSize="xs" color="foreground" opacity={0.5}>{formatDate(log.created_at)}</Text>
                    </HStack>
                    <Text fontSize="sm">{log.notes}</Text>
                  </Box>
                ))}
              </VStack>
            </Card.Body>
          </Card.Root>
        </Box>

        {/* Right Column (1/3) */}
        <Box display="flex" flexDirection="column" gap={6}>
          {/* Quick Actions */}
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header>
              <Heading size="sm">Quick Actions</Heading>
            </Card.Header>
            <Card.Body>
              <VStack gap={3} align="stretch">
                <Button
                  as="a"
                  href={`tel:${lead.phone_number}`}
                  variant="outline"
                  justifyContent="flex-start"
                >
                  <Phone size={16} /> Call Contact
                </Button>
                <Button
                  as="a"
                  href={`https://wa.me/${lead.phone_number.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  justifyContent="flex-start"
                  colorPalette="green"
                >
                  <WhatsappLogo size={16} /> WhatsApp
                </Button>
                <Box h="1px" bg="border" />
                <Button
                  variant="outline"
                  justifyContent="flex-start"
                  colorPalette="green"
                  onClick={() => handleMoveStage("WON")}
                  disabled={lead.stage === "WON"}
                >
                  <CheckCircle size={16} /> Mark as Won
                </Button>
                <Button
                  variant="outline"
                  justifyContent="flex-start"
                  colorPalette="red"
                  onClick={() => handleMoveStage("LOST")}
                  disabled={lead.stage === "LOST"}
                >
                  <XCircle size={16} /> Mark as Lost
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Deal Summary */}
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header>
              <Heading size="sm">Deal Summary</Heading>
            </Card.Header>
            <Card.Body>
              <VStack align="stretch" gap={3}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="foreground" opacity={0.6}>Stage</Text>
                  <Badge colorPalette={STAGE_COLORS[lead.stage]}>{STAGE_LABELS[lead.stage]}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="foreground" opacity={0.6}>Tag</Text>
                  <Badge colorPalette={lead.tag === "HOT" ? "red" : "blue"}>{lead.tag}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="foreground" opacity={0.6}>Value</Text>
                  <Text fontWeight="semibold">Rp {Number(lead.potential_value).toLocaleString("id-ID")}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="foreground" opacity={0.6}>Assigned</Text>
                  <Text fontSize="sm">{lead.assigned_to_name || "Unassigned"}</Text>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Box>
      </SimpleGrid>

      {/* Edit Dialog */}
      <Dialog.Root open={editOpen} onOpenChange={(e) => setEditOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW={{ base: "90vw", md: "600px" }}>
              <Dialog.Header>
                <Dialog.Title>Edit Lead</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Box as="form" onSubmit={handleEditSubmit}>
                  <VStack gap={4}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                      <Field.Root required>
                        <Field.Label>Company Name</Field.Label>
                        <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label>Contact Name</Field.Label>
                        <Input value={editForm.contact_name} onChange={(e) => setEditForm({ ...editForm, contact_name: e.target.value })} />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label>Phone</Field.Label>
                        <Input value={editForm.phone_number} onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })} />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Email</Field.Label>
                        <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Source Company</Field.Label>
                        <Input value={editForm.company_source} onChange={(e) => setEditForm({ ...editForm, company_source: e.target.value })} />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label>Deal Value (Rp)</Field.Label>
                        <Input type="number" value={editForm.potential_value} onChange={(e) => setEditForm({ ...editForm, potential_value: e.target.value })} />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Tag</Field.Label>
                        <select
                          value={editForm.tag}
                          onChange={(e) => setEditForm({ ...editForm, tag: e.target.value })}
                          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}
                        >
                          <option value="HOT">Hot</option>
                          <option value="COLD">Cold</option>
                        </select>
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Stage</Field.Label>
                        <select
                          value={editForm.stage}
                          onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}
                        >
                          <option value="NEW">Prospek Baru</option>
                          <option value="CONTACTED">Hubungi</option>
                          <option value="NEGOTIATION">Negosiasi</option>
                          <option value="WON">Won</option>
                          <option value="LOST">Lost</option>
                        </select>
                      </Field.Root>
                    </SimpleGrid>
                    <Field.Root w="full">
                      <Field.Label>Address</Field.Label>
                      <Textarea
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        placeholder="Enter full address for Google Maps..."
                        rows={3}
                      />
                    </Field.Root>
                  </VStack>
                </Box>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <Button variant="outline" size="sm">Cancel</Button>
                </Dialog.CloseTrigger>
                <Button bg="primary" color="white" size="sm" loading={saving} onClick={handleEditSubmit}>
                  <FloppyDisk size={14} /> Save Changes
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={archiveDialog}
        onClose={() => setArchiveDialog(false)}
        onConfirm={handleArchive}
        title="Archive Lead"
        message="This lead will be hidden from Leads, Pipeline, and Dashboard. You can restore it later from Archived Leads."
        action="archive"
      />

      <LoadingPopup open={actionLoading} message="Processing..." />
    </VStack>
  );
}
