import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import {
  ArrowLeft,
  PencilSimple,
  Plus,
  Trash,
  CurrencyDollar,
  CalendarBlank,
  Percent,
  User,
  Package,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

const STAGE_CHOICES = [
  { value: "QUALIFICATION", label: "Qualification", color: "blue", prob: 10 },
  { value: "DISCOVERY", label: "Discovery & Demo", color: "yellow", prob: 30 },
  { value: "PROPOSAL", label: "Proposal Sent", color: "purple", prob: 50 },
  { value: "NEGOTIATION", label: "Negotiation", color: "orange", prob: 70 },
  { value: "CLOSING", label: "Closing", color: "red", prob: 90 },
  { value: "WON", label: "Won", color: "green", prob: 100 },
  { value: "LOST", label: "Lost", color: "red", prob: 0 },
];

const LOST_REASON_CHOICES = [
  { value: "PRICE", label: "Price" },
  { value: "COMPETITOR", label: "Competitor" },
  { value: "TIMING", label: "Timing" },
  { value: "BUDGET", label: "Budget" },
  { value: "NO_DECISION", label: "No Decision" },
  { value: "WRONG_FIT", label: "Wrong Fit" },
  { value: "OTHER", label: "Other" },
];

const ROLE_CHOICES = [
  { value: "DECISION_MAKER", label: "Decision Maker" },
  { value: "CHAMPION", label: "Champion" },
  { value: "TECH_EVALUATOR", label: "Technical Evaluator" },
  { value: "INFLUENCER", label: "Influencer" },
  { value: "BLOCKER", label: "Blocker" },
  { value: "USER", label: "End User" },
  { value: "OTHER", label: "Other" },
];

const ROLE_COLORS = {
  DECISION_MAKER: "green",
  CHAMPION: "blue",
  TECH_EVALUATOR: "purple",
  INFLUENCER: "yellow",
  BLOCKER: "red",
  USER: "gray",
  OTHER: "gray",
};

export default function DealDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editContactDeal, setEditContactDeal] = useState(null);
  const [contactDealForm, setContactDealForm] = useState({ contact: "", role: "OTHER", is_primary: false });
  const [availableContacts, setAvailableContacts] = useState([]);
  const [contactSaving, setContactSaving] = useState(false);

  const [lineItemDialogOpen, setLineItemDialogOpen] = useState(false);
  const [editLineItem, setEditLineItem] = useState(null);
  const [lineItemForm, setLineItemForm] = useState({ product: "", quantity: 1, unit_price: 0, discount: 0, notes: "" });
  const [availableProducts, setAvailableProducts] = useState([]);
  const [lineItemSaving, setLineItemSaving] = useState(false);

  const fetchDeal = () => {
    setLoading(true);
    api.get(`/deals/${id}/`)
      .then((r) => { setDeal(r.data); setLoading(false); })
      .catch(() => { setLoading(false); toaster.create({ title: "Failed to load deal", type: "error" }); });
  };

  useEffect(() => { fetchDeal(); }, [id]);

  const openEditDeal = () => {
    setEditForm({
      name: deal.name || "",
      amount: deal.amount || "",
      stage: deal.stage || "QUALIFICATION",
      probability: deal.probability || 10,
      expected_close_date: deal.expected_close_date || "",
      lost_reason: deal.lost_reason || "",
      lost_notes: deal.lost_notes || "",
      competitors: deal.competitors || "",
      description: deal.description || "",
      source: deal.source || "",
    });
    setEditOpen(true);
  };

  const handleUpdateDeal = async () => {
    setSaving(true);
    try {
      await api.put(`/deals/${id}/`, editForm);
      toaster.create({ title: "Deal updated", type: "success" });
      setEditOpen(false);
      fetchDeal();
    } catch {
      toaster.create({ title: "Failed to update deal", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const openCreateContact = async () => {
    setEditContactDeal(null);
    setContactDealForm({ contact: "", role: "OTHER", is_primary: false });
    try {
      const res = await api.get("/contacts/", { params: { account_id: deal.company } });
      setAvailableContacts(res.data.results || res.data);
    } catch { setAvailableContacts([]); }
    setContactDialogOpen(true);
  };

  const openEditContactDeal = (cd) => {
    setEditContactDeal(cd);
    setContactDealForm({ contact: cd.contact || "", role: cd.role_in_deal || "OTHER", is_primary: cd.is_primary || false });
    setAvailableContacts([{ id: cd.contact, first_name: cd.contact_name?.split(" ")[0], last_name: cd.contact_name?.split(" ").slice(1).join(" ") }]);
    setContactDialogOpen(true);
  };

  const handleSaveContactDeal = async () => {
    if (!contactDealForm.contact) return toaster.create({ title: "Contact is required", type: "error" });
    setContactSaving(true);
    try {
      if (editContactDeal) {
        await api.put(`/contact-deals/${editContactDeal.id}/`, { ...contactDealForm, deal: parseInt(id) });
        toaster.create({ title: "Contact updated", type: "success" });
      } else {
        await api.post("/contact-deals/", { ...contactDealForm, deal: parseInt(id) });
        toaster.create({ title: "Contact added", type: "success" });
      }
      setContactDialogOpen(false);
      fetchDeal();
    } catch {
      toaster.create({ title: "Failed to save", type: "error" });
    } finally {
      setContactSaving(false);
    }
  };

  const openCreateLineItem = async () => {
    setEditLineItem(null);
    setLineItemForm({ product: "", quantity: 1, unit_price: 0, discount: 0, notes: "" });
    try {
      const res = await api.get("/products/");
      setAvailableProducts(res.data.results || res.data);
    } catch { setAvailableProducts([]); }
    setLineItemDialogOpen(true);
  };

  const openEditLineItem = (li) => {
    setEditLineItem(li);
    setLineItemForm({ product: li.product || "", quantity: li.quantity || 1, unit_price: li.unit_price || 0, discount: li.discount || 0, notes: li.notes || "" });
    setAvailableProducts([{ id: li.product, name: li.product_name }]);
    setLineItemDialogOpen(true);
  };

  const handleSaveLineItem = async () => {
    if (!lineItemForm.product) return toaster.create({ title: "Product is required", type: "error" });
    setLineItemSaving(true);
    try {
      if (editLineItem) {
        await api.put(`/line-items/${editLineItem.id}/`, { ...lineItemForm, deal: parseInt(id) });
        toaster.create({ title: "Line item updated", type: "success" });
      } else {
        await api.post("/line-items/", { ...lineItemForm, deal: parseInt(id) });
        toaster.create({ title: "Product added to deal", type: "success" });
      }
      setLineItemDialogOpen(false);
      fetchDeal();
    } catch {
      toaster.create({ title: "Failed to save", type: "error" });
    } finally {
      setLineItemSaving(false);
    }
  };

  const handleDeleteLineItem = async (liId) => {
    try {
      await api.delete(`/line-items/${liId}/`);
      toaster.create({ title: "Line item removed", type: "success" });
      fetchDeal();
    } catch {
      toaster.create({ title: "Failed to remove", type: "error" });
    }
  };

  const handleMoveStage = async (newStage) => {
    try {
      await api.post(`/deals/${id}/move_stage/`, { stage: newStage });
      toaster.create({ title: `Moved to ${STAGE_CHOICES.find((s) => s.value === newStage)?.label}`, type: "success" });
      fetchDeal();
    } catch (err) {
      toaster.create({ title: err.response?.data?.error || "Failed", type: "error" });
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" color="primary" /></Box>;
  if (!deal) return <Box textAlign="center" py={10}><Text>Deal not found</Text></Box>;

  const currentStage = STAGE_CHOICES.find((s) => s.value === deal.stage);
  const nextStage = STAGE_CHOICES.find((s) => s.value === currentStage?.next);

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <HStack gap={3}>
          <Button size="sm" variant="ghost" onClick={() => navigate("/deals")}><ArrowLeft size={16} /></Button>
          <Heading size="lg">{deal.name}</Heading>
          <Badge colorPalette={currentStage?.color || "gray"} size="lg">{currentStage?.label}</Badge>
        </HStack>
        <HStack gap={2}>
          {deal.stage !== "WON" && deal.stage !== "LOST" && nextStage && (
            <Button size="sm" bg="primary" color="white" onClick={() => handleMoveStage(nextStage.value)} _hover={{ bg: "secondary" }}>
              <ArrowRight size={14} /> Move to {nextStage.label}
            </Button>
          )}
          {deal.stage !== "WON" && deal.stage !== "LOST" && (
            <>
              <Button size="sm" bg="green.500" color="white" onClick={() => handleMoveStage("WON")} _hover={{ bg: "green.600" }}><CheckCircle size={14} /> Won</Button>
              <Button size="sm" bg="red.500" color="white" onClick={() => handleMoveStage("LOST")} _hover={{ bg: "red.600" }}><XCircle size={14} /> Lost</Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={openEditDeal}><PencilSimple size={14} /> Edit</Button>
        </HStack>
      </HStack>

      <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        <VStack gap={6} align="stretch">
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header><Heading size="sm">Deal Information</Heading></Card.Header>
            <Card.Body>
              <SimpleGrid columns={2} gap={4}>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" color="gray.500">Deal Value</Text>
                  <HStack gap={1}><CurrencyDollar size={14} color="primary" /><Text fontWeight="bold" fontSize="lg" color="primary">Rp {Number(deal.amount).toLocaleString("id-ID")}</Text></HStack>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" color="gray.500">Probability</Text>
                  <HStack gap={1}><Percent size={14} /><Text fontWeight="bold" fontSize="lg">{deal.probability}%</Text></HStack>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" color="gray.500">Expected Close</Text>
                  <HStack gap={1}><CalendarBlank size={14} /><Text fontSize="sm">{deal.expected_close_date || "-"}</Text></HStack>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" color="gray.500">Source</Text>
                  <Text fontSize="sm">{deal.source || "-"}</Text>
                </VStack>
                {deal.description && (
                  <VStack align="start" gap={1} gridColumn="span 2">
                    <Text fontSize="xs" color="gray.500">Description</Text>
                    <Text fontSize="sm">{deal.description}</Text>
                  </VStack>
                )}
              </SimpleGrid>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header>
              <HStack justify="space-between">
                <Heading size="sm">Contacts Involved ({deal.contacts?.length || 0})</Heading>
                <Button size="xs" bg="primary" color="white" onClick={openCreateContact}><Plus size={12} /> Add</Button>
              </HStack>
            </Card.Header>
            <Card.Body>
              {(!deal.contacts || deal.contacts.length === 0) ? (
                <Text fontSize="sm" color="gray.500">No contacts assigned to this deal</Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {deal.contacts.map((c) => (
                    <HStack key={c.id} p={3} bg="muted" borderRadius="lg" justify="space-between">
                      <HStack gap={3}>
                        <Box w={8} h={8} borderRadius="full" bg="primary" color="white" display="flex" alignItems="center" justifyContent="center"><User size={14} /></Box>
                        <VStack align="start" gap={0}>
                          <Text fontWeight="medium" fontSize="sm">{c.full_name}</Text>
                          {c.job_title && <Text fontSize="xs" color="gray.500">{c.job_title}</Text>}
                        </VStack>
                      </HStack>
                      <HStack gap={2}>
                        <Badge size="sm" colorPalette={ROLE_COLORS[c.role_in_deal] || "gray"}>{ROLE_CHOICES.find((r) => r.value === c.role_in_deal)?.label}</Badge>
                        <Button size="xs" variant="ghost" onClick={() => openEditContactDeal(c)}><PencilSimple size={12} /></Button>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header>
              <HStack justify="space-between">
                <Heading size="sm">Products / Line Items ({deal.line_items?.length || 0})</Heading>
                <Button size="xs" bg="primary" color="white" onClick={openCreateLineItem}><Plus size={12} /> Add Product</Button>
              </HStack>
            </Card.Header>
            <Card.Body>
              {(!deal.line_items || deal.line_items.length === 0) ? (
                <Text fontSize="sm" color="gray.500">No products added to this deal</Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {deal.line_items.map((li) => (
                    <HStack key={li.id} p={3} bg="muted" borderRadius="lg" justify="space-between">
                      <HStack gap={3}>
                        <Box w={8} h={8} borderRadius="full" bg="purple.500" color="white" display="flex" alignItems="center" justifyContent="center"><Package size={14} /></Box>
                        <VStack align="start" gap={0}>
                          <Text fontWeight="medium" fontSize="sm">{li.product_name}</Text>
                          {li.product_code && <Text fontSize="xs" color="gray.500">SKU: {li.product_code}</Text>}
                        </VStack>
                      </HStack>
                      <HStack gap={4} align="center">
                        <VStack align="end" gap={0}>
                          <Text fontSize="xs" color="gray.500">Qty: {li.quantity}</Text>
                          <Text fontSize="xs" color="gray.500">Price: Rp {Number(li.unit_price).toLocaleString("id-ID")}</Text>
                          {Number(li.discount) > 0 && <Text fontSize="xs" color="red.500">Discount: -Rp {Number(li.discount).toLocaleString("id-ID")}</Text>}
                        </VStack>
                        <Text fontWeight="bold" fontSize="sm" color="primary">Rp {Number(li.total_price).toLocaleString("id-ID")}</Text>
                        <HStack gap={1}>
                          <Button size="xs" variant="ghost" onClick={() => openEditLineItem(li)}><PencilSimple size={12} /></Button>
                          <Button size="xs" variant="ghost" color="red.500" onClick={() => handleDeleteLineItem(li.id)}><Trash size={12} /></Button>
                        </HStack>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        </VStack>

        <VStack gap={6} align="stretch">
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header><Heading size="sm">Deal Summary</Heading></Card.Header>
            <Card.Body>
              <VStack align="start" gap={3} w="full">
                <HStack justify="space-between" w="full"><Text fontSize="sm" color="gray.500">Company</Text><Text fontWeight="bold" fontSize="sm" cursor="pointer" color="primary" onClick={() => navigate(`/accounts/${deal.company}`)}>{deal.company_name}</Text></HStack>
                <HStack justify="space-between" w="full"><Text fontSize="sm" color="gray.500">Stage</Text><Badge colorPalette={currentStage?.color}>{currentStage?.label}</Badge></HStack>
                <HStack justify="space-between" w="full"><Text fontSize="sm" color="gray.500">Value</Text><Text fontWeight="bold" fontSize="sm">Rp {Number(deal.amount).toLocaleString("id-ID")}</Text></HStack>
                <HStack justify="space-between" w="full"><Text fontSize="sm" color="gray.500">Line Items</Text><Text fontWeight="bold" fontSize="sm">Rp {Number(deal.total_line_value || 0).toLocaleString("id-ID")}</Text></HStack>
                <HStack justify="space-between" w="full"><Text fontSize="sm" color="gray.500">Contacts</Text><Text fontWeight="bold" fontSize="sm">{deal.contact_count || 0}</Text></HStack>
                <HStack justify="space-between" w="full"><Text fontSize="sm" color="gray.500">Owner</Text><Text fontSize="sm">{deal.owner_name || "-"}</Text></HStack>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header><Heading size="sm">Stage Progress</Heading></Card.Header>
            <Card.Body>
              <VStack align="start" gap={2} w="full">
                {STAGE_CHOICES.filter((s) => s.value !== "WON" && s.value !== "LOST").map((s) => (
                  <HStack key={s.value} w="full" p={2} borderRadius="md" bg={s.value === deal.stage ? `${s.color}.100` : "transparent"}>
                    <Box w={3} h={3} borderRadius="full" bg={s.value === deal.stage ? s.color : s.value < deal.stage ? "green" : "gray.200"} />
                    <Text fontSize="sm" fontWeight={s.value === deal.stage ? "bold" : "normal"} flex={1}>{s.label}</Text>
                    {s.value === deal.stage && <Badge size="sm" colorPalette={s.color}>Current</Badge>}
                  </HStack>
                ))}
              </VStack>
            </Card.Body>
          </Card.Root>

          {deal.lost_reason && (
            <Card.Root bg="red.50" border="1px solid" borderColor="red.200">
              <Card.Header><Heading size="sm" color="red.600">Lost Information</Heading></Card.Header>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <HStack gap={2}><Text fontSize="sm" fontWeight="medium">Reason:</Text><Text fontSize="sm">{LOST_REASON_CHOICES.find((r) => r.value === deal.lost_reason)?.label}</Text></HStack>
                  {deal.lost_notes && <Text fontSize="sm">{deal.lost_notes}</Text>}
                </VStack>
              </Card.Body>
            </Card.Root>
          )}
        </VStack>
      </Box>

      <Dialog.Root open={editOpen} onOpenChange={(e) => setEditOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="600px">
              <Dialog.Header><Dialog.Title>Edit Deal</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root required><Field.Label>Deal Name</Field.Label><Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></Field.Root>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}><Field.Label>Amount (Rp)</Field.Label><Input type="number" value={editForm.amount || ""} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} /></Field.Root>
                    <Field.Root flex={1}><Field.Label>Probability (%)</Field.Label><Input type="number" value={editForm.probability || ""} onChange={(e) => setEditForm({ ...editForm, probability: parseInt(e.target.value) || 0 })} /></Field.Root>
                  </HStack>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}><Field.Label>Stage</Field.Label><select value={editForm.stage || ""} onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}>{STAGE_CHOICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></Field.Root>
                    <Field.Root flex={1}><Field.Label>Expected Close</Field.Label><Input type="date" value={editForm.expected_close_date || ""} onChange={(e) => setEditForm({ ...editForm, expected_close_date: e.target.value })} /></Field.Root>
                  </HStack>
                  {editForm.stage === "LOST" && (
                    <HStack gap={4} w="full">
                      <Field.Root flex={1}><Field.Label>Lost Reason</Field.Label><select value={editForm.lost_reason || ""} onChange={(e) => setEditForm({ ...editForm, lost_reason: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}><option value="">Select...</option>{LOST_REASON_CHOICES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></Field.Root>
                      <Field.Root flex={1}><Field.Label>Lost Notes</Field.Label><Input value={editForm.lost_notes || ""} onChange={(e) => setEditForm({ ...editForm, lost_notes: e.target.value })} /></Field.Root>
                    </HStack>
                  )}
                  <Field.Root w="full"><Field.Label>Competitors</Field.Label><Input value={editForm.competitors || ""} onChange={(e) => setEditForm({ ...editForm, competitors: e.target.value })} /></Field.Root>
                  <Field.Root w="full"><Field.Label>Description</Field.Label><textarea value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", resize: "vertical" }} /></Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild><Button variant="outline" mr={3}>Cancel</Button></Dialog.CloseTrigger>
                <Button bg="primary" color="white" onClick={handleUpdateDeal} loading={saving}>Update</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={contactDialogOpen} onOpenChange={(e) => setContactDialogOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="400px">
              <Dialog.Header><Dialog.Title>{editContactDeal ? "Edit Contact" : "Add Contact to Deal"}</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root required>
                    <Field.Label>Contact</Field.Label>
                    <select value={contactDealForm.contact} onChange={(e) => setContactDealForm({ ...contactDealForm, contact: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }} disabled={!!editContactDeal}>
                      <option value="">Select contact...</option>
                      {availableContacts.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                    </select>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Role in Deal</Field.Label>
                    <select value={contactDealForm.role} onChange={(e) => setContactDealForm({ ...contactDealForm, role: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}>
                      {ROLE_CHOICES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild><Button variant="outline" mr={3}>Cancel</Button></Dialog.CloseTrigger>
                <Button bg="primary" color="white" onClick={handleSaveContactDeal} loading={contactSaving}>{editContactDeal ? "Update" : "Add"}</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={lineItemDialogOpen} onOpenChange={(e) => setLineItemDialogOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="500px">
              <Dialog.Header><Dialog.Title>{editLineItem ? "Edit Line Item" : "Add Product to Deal"}</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root required>
                    <Field.Label>Product</Field.Label>
                    <select value={lineItemForm.product} onChange={(e) => {
                      const prod = availableProducts.find((p) => p.id === parseInt(e.target.value));
                      setLineItemForm({ ...lineItemForm, product: e.target.value, unit_price: prod?.base_price || 0 });
                    }} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }} disabled={!!editLineItem}>
                      <option value="">Select product...</option>
                      {availableProducts.map((p) => <option key={p.id} value={p.id}>{p.name} - Rp {Number(p.base_price).toLocaleString("id-ID")}</option>)}
                    </select>
                  </Field.Root>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}><Field.Label>Quantity</Field.Label><Input type="number" value={lineItemForm.quantity} onChange={(e) => setLineItemForm({ ...lineItemForm, quantity: parseInt(e.target.value) || 1 })} /></Field.Root>
                    <Field.Root flex={1}><Field.Label>Unit Price (Rp)</Field.Label><Input type="number" value={lineItemForm.unit_price} onChange={(e) => setLineItemForm({ ...lineItemForm, unit_price: parseFloat(e.target.value) || 0 })} /></Field.Root>
                  </HStack>
                  <Field.Root w="full"><Field.Label>Discount (Rp)</Field.Label><Input type="number" value={lineItemForm.discount} onChange={(e) => setLineItemForm({ ...lineItemForm, discount: parseFloat(e.target.value) || 0 })} /></Field.Root>
                  <HStack justify="space-between" w="full" p={3} bg="muted" borderRadius="lg">
                    <Text fontSize="sm" fontWeight="bold">Total:</Text>
                    <Text fontSize="sm" fontWeight="bold" color="primary">Rp {((lineItemForm.unit_price * lineItemForm.quantity) - lineItemForm.discount).toLocaleString("id-ID")}</Text>
                  </HStack>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild><Button variant="outline" mr={3}>Cancel</Button></Dialog.CloseTrigger>
                <Button bg="primary" color="white" onClick={handleSaveLineItem} loading={lineItemSaving}>{editLineItem ? "Update" : "Add"}</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
