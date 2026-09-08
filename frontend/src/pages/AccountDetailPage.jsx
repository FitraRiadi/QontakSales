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
  Spinner,
  Text,
  VStack,
  Badge,
  createToaster,
} from "@chakra-ui/react";
import { ArrowLeft, Buildings, Phone, Envelope, Globe, MapPin, PencilSimple, Plus, User, CalendarBlank, Clock, CheckCircle, X } from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

const INDUSTRY_LABELS = { TECH: "Technology", FINANCE: "Finance", HEALTH: "Healthcare", EDUCATION: "Education", RETAIL: "Retail", MANUFACTURING: "Manufacturing", REAL_ESTATE: "Real Estate", CONSULTING: "Consulting", OTHER: "Other" };
const TYPE_LABELS = { PROSPECT: "Prospect", CUSTOMER: "Customer", PARTNER: "Partner", VENDOR: "Vendor" };
const TYPE_COLORS = { PROSPECT: "blue", CUSTOMER: "green", PARTNER: "purple", VENDOR: "orange" };
const STAGE_LABELS = { QUALIFICATION: "Qualification", DISCOVERY: "Discovery", PROPOSAL: "Proposal", NEGOTIATION: "Negotiation", CLOSING: "Closing", WON: "Won", LOST: "Lost" };
const STAGE_COLORS = { QUALIFICATION: "blue", DISCOVERY: "yellow", PROPOSAL: "purple", NEGOTIATION: "orange", CLOSING: "red", WON: "green", LOST: "red" };
const ROLE_LABELS = { DECISION_MAKER: "Decision Maker", CHAMPION: "Champion", TECH_EVALUATOR: "Technical Evaluator", INFLUENCER: "Influencer", BLOCKER: "Blocker", USER: "End User", OTHER: "Other" };

export default function AccountDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [contactForm, setContactForm] = useState({ first_name: "", last_name: "", email: "", phone: "", job_title: "", department: "", role_in_deal: "OTHER", notes: "" });
  const [contactSaving, setContactSaving] = useState(false);
  const [contactErrors, setContactErrors] = useState({});

  const [activities, setActivities] = useState([]);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityForm, setActivityForm] = useState({ activity_type: "MEETING", deal: "", notes: "", scheduled_at: "" });
  const [availableDeals, setAvailableDeals] = useState([]);
  const [activitySaving, setActivitySaving] = useState(false);
  const [activityErrors, setActivityErrors] = useState({});

  const fetchAccount = () => {
    setLoading(true);
    api.get(`/accounts/${id}/`)
      .then((r) => { setAccount(r.data); setLoading(false); })
      .catch(() => { setLoading(false); toaster.create({ title: "Failed to load account", type: "error" }); });
  };

  const fetchActivities = () => {
    api.get("/activities/", { params: { account_id: id } })
      .then((r) => setActivities(r.data.results || r.data))
      .catch(() => {});
  };

  useEffect(() => { fetchAccount(); fetchActivities(); }, [id]);

  const handleUpdate = async () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = "Name is required";
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setEditErrors({});
    setSaving(true);
    try {
      const payload = { ...form, annual_revenue: form.annual_revenue ? parseFloat(form.annual_revenue) : null };
      await api.put(`/accounts/${id}/`, payload);
      toaster.create({ title: "Account updated", type: "success" });
      setEditOpen(false);
      fetchAccount();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const fieldErrors = {};
        for (const [key, val] of Object.entries(data)) {
          if (Array.isArray(val)) fieldErrors[key] = val[0];
          else if (typeof val === "string") fieldErrors[key] = val;
        }
        if (Object.keys(fieldErrors).length > 0) { setEditErrors(fieldErrors); return; }
      }
      toaster.create({ title: "Failed to update", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = () => {
    setForm({
      name: account.name || "", industry: account.industry || "", size: account.size || "",
      account_type: account.account_type || "PROSPECT", website: account.website || "",
      phone: account.phone || "", email: account.email || "", address: account.address || "",
      city: account.city || "", country: account.country || "Indonesia",
      annual_revenue: account.annual_revenue || "", notes: account.notes || "",
    });
    setEditErrors({});
    setEditOpen(true);
  };

  const openCreateContact = () => {
    setEditContact(null);
    setContactForm({ first_name: "", last_name: "", email: "", phone: "", job_title: "", department: "", role_in_deal: "OTHER", notes: "" });
    setContactErrors({});
    setContactDialogOpen(true);
  };

  const openEditContact = (contact) => {
    setEditContact(contact);
    setContactForm({
      first_name: contact.first_name || "", last_name: contact.last_name || "",
      email: contact.email || "", phone: contact.phone || "",
      job_title: contact.job_title || "", department: contact.department || "",
      role_in_deal: contact.role_in_deal || "OTHER", notes: contact.notes || "",
    });
    setContactErrors({});
    setContactDialogOpen(true);
  };

  const handleSaveContact = async () => {
    const errs = {};
    if (!contactForm.first_name.trim()) errs.first_name = "First name is required";
    if (Object.keys(errs).length > 0) { setContactErrors(errs); return; }
    setContactErrors({});
    setContactSaving(true);
    try {
      if (editContact) {
        await api.put(`/contacts/${editContact.id}/`, { ...contactForm, account: id });
        toaster.create({ title: "Contact updated", type: "success" });
      } else {
        await api.post("/contacts/", { ...contactForm, account: parseInt(id) });
        toaster.create({ title: "Contact created", type: "success" });
      }
      setContactDialogOpen(false);
      fetchAccount();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const fieldErrors = {};
        for (const [key, val] of Object.entries(data)) {
          if (Array.isArray(val)) fieldErrors[key] = val[0];
          else if (typeof val === "string") fieldErrors[key] = val;
        }
        if (Object.keys(fieldErrors).length > 0) { setContactErrors(fieldErrors); return; }
      }
      toaster.create({ title: "Failed to save contact", type: "error" });
    } finally {
      setContactSaving(false);
    }
  };

  const openCreateActivity = () => {
    setActivityForm({ activity_type: "MEETING", deal: "", notes: "", scheduled_at: "" });
    setActivityErrors({});
    const deals = account?.deals || [];
    setAvailableDeals(deals);
    setActivityDialogOpen(true);
  };

  const handleSaveActivity = async () => {
    const errs = {};
    if (!activityForm.deal) errs.deal = "Deal is required";
    if (!activityForm.scheduled_at) errs.scheduled_at = "Schedule date/time is required";
    if (!activityForm.notes.trim()) errs.notes = "Notes are required";
    if (Object.keys(errs).length > 0) { setActivityErrors(errs); return; }
    setActivityErrors({});
    setActivitySaving(true);
    try {
      await api.post("/activities/", {
        activity_type: activityForm.activity_type,
        deal: parseInt(activityForm.deal),
        notes: activityForm.notes,
        scheduled_at: activityForm.scheduled_at,
      });
      toaster.create({ title: "Activity created", type: "success" });
      setActivityDialogOpen(false);
      fetchActivities();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const fieldErrors = {};
        for (const [key, val] of Object.entries(data)) {
          if (Array.isArray(val)) fieldErrors[key] = val[0];
          else if (typeof val === "string") fieldErrors[key] = val;
        }
        if (Object.keys(fieldErrors).length > 0) { setActivityErrors(fieldErrors); return; }
      }
      toaster.create({ title: "Failed to create activity", type: "error" });
    } finally {
      setActivitySaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" color="primary" /></Box>;
  if (!account) return <Box textAlign="center" py={10}><Text>Account not found</Text></Box>;

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <HStack gap={3}>
          <Button size="sm" variant="ghost" onClick={() => navigate("/accounts")}><ArrowLeft size={16} /></Button>
          <Heading size="lg">{account.name}</Heading>
          <Badge colorPalette={TYPE_COLORS[account.account_type] || "gray"}>{TYPE_LABELS[account.account_type]}</Badge>
        </HStack>
        <Button size="sm" variant="outline" onClick={openEdit}><PencilSimple size={14} /> Edit</Button>
      </HStack>

      <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        <VStack gap={6} align="stretch">
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header><Heading size="sm">Company Information</Heading></Card.Header>
            <Card.Body>
              <VStack align="start" gap={3}>
                {account.industry && <HStack gap={2}><Text fontSize="sm" fontWeight="medium" color="gray.500" w="120px">Industry</Text><Text fontSize="sm">{INDUSTRY_LABELS[account.industry]}</Text></HStack>}
                {account.size && <HStack gap={2}><Text fontSize="sm" fontWeight="medium" color="gray.500" w="120px">Size</Text><Text fontSize="sm">{account.size}</Text></HStack>}
                {account.website && <HStack gap={2}><Text fontSize="sm" fontWeight="medium" color="gray.500" w="120px">Website</Text><a href={account.website} target="_blank" rel="noreferrer"><Text fontSize="sm" color="blue.500">{account.website}</Text></a></HStack>}
                {account.annual_revenue && <HStack gap={2}><Text fontSize="sm" fontWeight="medium" color="gray.500" w="120px">Revenue</Text><Text fontSize="sm">Rp {Number(account.annual_revenue).toLocaleString("id-ID")}</Text></HStack>}
                {account.notes && <HStack gap={2} align="start"><Text fontSize="sm" fontWeight="medium" color="gray.500" w="120px">Notes</Text><Text fontSize="sm">{account.notes}</Text></HStack>}
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header>
              <HStack justify="space-between">
                <Heading size="sm">Contacts ({account.contacts?.length || 0})</Heading>
                <Button size="xs" bg="primary" color="white" onClick={openCreateContact}><Plus size={12} /> Add</Button>
              </HStack>
            </Card.Header>
            <Card.Body>
              {(!account.contacts || account.contacts.length === 0) ? (
                <Text fontSize="sm" color="gray.500">No contacts yet</Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {account.contacts.map((c) => (
                    <HStack key={c.id} p={3} bg="muted" borderRadius="lg" justify="space-between" cursor="pointer" onClick={() => openEditContact(c)}>
                      <HStack gap={3}>
                        <Box w={8} h={8} borderRadius="full" bg="primary" color="white" display="flex" alignItems="center" justifyContent="center">
                          <User size={14} />
                        </Box>
                        <VStack align="start" gap={0}>
                          <Text fontWeight="medium" fontSize="sm">{c.first_name} {c.last_name}</Text>
                          {c.job_title && <Text fontSize="xs" color="gray.500">{c.job_title}</Text>}
                        </VStack>
                      </HStack>
                      <Badge size="sm" colorPalette={c.role_in_deal === "DECISION_MAKER" ? "green" : "gray"}>
                        {ROLE_LABELS[c.role_in_deal] || c.role_in_deal}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header>
              <HStack justify="space-between">
                <Heading size="sm">Deals ({account.deals?.length || 0})</Heading>
                <Button size="xs" bg="primary" color="white" onClick={() => navigate("/deals")}><Plus size={12} /> New Deal</Button>
              </HStack>
            </Card.Header>
            <Card.Body>
              {(!account.deals || account.deals.length === 0) ? (
                <Text fontSize="sm" color="gray.500">No deals yet</Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {account.deals.map((d) => (
                    <HStack key={d.id} p={3} bg="muted" borderRadius="lg" justify="space-between" cursor="pointer" onClick={() => navigate(`/deals/${d.id}`)}>
                      <VStack align="start" gap={0}>
                        <Text fontWeight="medium" fontSize="sm">{d.name}</Text>
                        <Text fontSize="xs" color="gray.500">Rp {Number(d.amount).toLocaleString("id-ID")}</Text>
                      </VStack>
                      <Badge size="sm" colorPalette={STAGE_COLORS[d.stage] || "gray"}>{STAGE_LABELS[d.stage]}</Badge>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        </VStack>

        <VStack gap={6} align="stretch">
          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header><Heading size="sm">Contact Details</Heading></Card.Header>
            <Card.Body>
              <VStack align="start" gap={3}>
                {account.phone && <HStack gap={2}><Phone size={14} color="gray.400" /><Text fontSize="sm">{account.phone}</Text></HStack>}
                {account.email && <HStack gap={2}><Envelope size={14} color="gray.400" /><Text fontSize="sm">{account.email}</Text></HStack>}
                {account.website && <HStack gap={2}><Globe size={14} color="gray.400" /><Text fontSize="sm">{account.website}</Text></HStack>}
                {account.address && <HStack gap={2} align="start"><MapPin size={14} color="gray.400" /><Text fontSize="sm">{account.address}{account.city ? `, ${account.city}` : ""}{account.country ? `, ${account.country}` : ""}</Text></HStack>}
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header><Heading size="sm">Summary</Heading></Card.Header>
            <Card.Body>
              <VStack align="start" gap={3}>
                <HStack justify="space-between" w="full"><Text fontSize="sm" color="gray.500">Total Deals</Text><Text fontWeight="bold" fontSize="sm">{account.deals_count || 0}</Text></HStack>
                <HStack justify="space-between" w="full"><Text fontSize="sm" color="gray.500">Total Value</Text><Text fontWeight="bold" fontSize="sm" color="primary">Rp {Number(account.total_deal_value || 0).toLocaleString("id-ID")}</Text></HStack>
                <HStack justify="space-between" w="full"><Text fontSize="sm" color="gray.500">Contacts</Text><Text fontWeight="bold" fontSize="sm">{account.contacts_count || 0}</Text></HStack>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="white" border="1px solid" borderColor="border">
            <Card.Header>
              <HStack justify="space-between">
                <Heading size="sm">Activity Log ({activities.length})</Heading>
                <Button size="xs" bg="primary" color="white" onClick={openCreateActivity}><Plus size={12} /> New</Button>
              </HStack>
            </Card.Header>
            <Card.Body>
              {activities.length === 0 ? (
                <Text fontSize="sm" color="gray.500">No activities yet</Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {activities.slice(0, 10).map((a) => (
                    <HStack key={a.id} p={3} bg="muted" borderRadius="lg" justify="space-between">
                      <HStack gap={3}>
                        <Box w={8} h={8} borderRadius="full" bg={a.activity_type === "MEETING" ? "yellow.500" : a.activity_type === "CALL" ? "blue.500" : a.activity_type === "EMAIL" ? "purple.500" : a.activity_type === "FOLLOW_UP" ? "green.500" : "gray.500"} color="white" display="flex" alignItems="center" justifyContent="center">
                          {a.activity_type === "MEETING" ? <CalendarBlank size={14} /> : a.activity_type === "CALL" ? <Phone size={14} /> : a.activity_type === "EMAIL" ? <Envelope size={14} /> : <Clock size={14} />}
                        </Box>
                        <VStack align="start" gap={0}>
                          <Text fontWeight="medium" fontSize="sm">{a.activity_type_display || a.activity_type}: {a.deal_name || ""}</Text>
                          {a.notes && <Text fontSize="xs" color="gray.500" noOfLines={1}>{a.notes}</Text>}
                          {a.scheduled_at && <Text fontSize="xs" color="gray.400">{new Date(a.scheduled_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</Text>}
                        </VStack>
                      </HStack>
                      <Badge size="sm" colorPalette={a.is_completed ? "green" : "orange"} borderRadius="full">
                        {a.is_completed ? "Done" : "Pending"}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>

      <Dialog.Root open={editOpen} onOpenChange={(e) => setEditOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="600px">
              <Dialog.Header><Dialog.Title>Edit Account</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root required invalid={!!editErrors.name}>
                    <Field.Label>Company Name</Field.Label>
                    <Input placeholder="Company name" value={form.name || ""} onChange={(e) => { setEditErrors({}); setForm({ ...form, name: e.target.value }); }} />
                    <Field.ErrorText>{editErrors.name}</Field.ErrorText>
                  </Field.Root>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}><Field.Label>Industry</Field.Label><select value={form.industry || ""} onChange={(e) => setForm({ ...form, industry: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}><option value="">Select...</option>{Object.entries(INDUSTRY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field.Root>
                    <Field.Root flex={1}><Field.Label>Size</Field.Label><select value={form.size || ""} onChange={(e) => setForm({ ...form, size: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}><option value="">Select...</option><option value="1-10">1-10</option><option value="11-50">11-50</option><option value="51-200">51-200</option><option value="201-500">201-500</option><option value="500+">500+</option></select></Field.Root>
                  </HStack>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}><Field.Label>Phone</Field.Label><Input placeholder="+62 xxx" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field.Root>
                    <Field.Root flex={1}><Field.Label>Email</Field.Label><Input type="email" placeholder="name@company.com" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field.Root>
                  </HStack>
                  <Field.Root w="full"><Field.Label>Website</Field.Label><Input placeholder="https://..." value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field.Root>
                  <Field.Root w="full"><Field.Label>Address</Field.Label><Input placeholder="Street address" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field.Root>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}><Field.Label>City</Field.Label><Input placeholder="Jakarta" value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field.Root>
                    <Field.Root flex={1}><Field.Label>Country</Field.Label><Input placeholder="Indonesia" value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field.Root>
                    <Field.Root flex={1}><Field.Label>Revenue</Field.Label><Input type="number" placeholder="0" value={form.annual_revenue || ""} onChange={(e) => setForm({ ...form, annual_revenue: e.target.value })} /></Field.Root>
                  </HStack>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild><Button variant="outline" mr={3}>Cancel</Button></Dialog.CloseTrigger>
                <Button bg="primary" color="white" onClick={handleUpdate} loading={saving}>Update</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={contactDialogOpen} onOpenChange={(e) => setContactDialogOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="500px">
              <Dialog.Header><Dialog.Title>{editContact ? "Edit Contact" : "New Contact"}</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1} required invalid={!!contactErrors.first_name}>
                      <Field.Label>First Name</Field.Label>
                      <Input placeholder="John" value={contactForm.first_name} onChange={(e) => { setContactErrors({}); setContactForm({ ...contactForm, first_name: e.target.value }); }} />
                      <Field.ErrorText>{contactErrors.first_name}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root flex={1}><Field.Label>Last Name</Field.Label><Input placeholder="Doe" value={contactForm.last_name} onChange={(e) => setContactForm({ ...contactForm, last_name: e.target.value })} /></Field.Root>
                  </HStack>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}><Field.Label>Email</Field.Label><Input type="email" placeholder="john@company.com" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} /></Field.Root>
                    <Field.Root flex={1}><Field.Label>Phone</Field.Label><Input placeholder="+62 xxx" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} /></Field.Root>
                  </HStack>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}><Field.Label>Job Title</Field.Label><Input placeholder="VP Sales" value={contactForm.job_title} onChange={(e) => setContactForm({ ...contactForm, job_title: e.target.value })} /></Field.Root>
                    <Field.Root flex={1}><Field.Label>Role in Deal</Field.Label><select value={contactForm.role_in_deal} onChange={(e) => setContactForm({ ...contactForm, role_in_deal: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}>{Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field.Root>
                  </HStack>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild><Button variant="outline" mr={3}>Cancel</Button></Dialog.CloseTrigger>
                <Button bg="primary" color="white" onClick={handleSaveContact} loading={contactSaving}>{editContact ? "Update" : "Create"}</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={activityDialogOpen} onOpenChange={(e) => setActivityDialogOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="500px">
              <Dialog.Header><Dialog.Title>New Activity</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root required>
                    <Field.Label>Activity Type</Field.Label>
                    <select value={activityForm.activity_type} onChange={(e) => setActivityForm({ ...activityForm, activity_type: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}>
                      <option value="CALL">Call</option>
                      <option value="EMAIL">Email</option>
                      <option value="MEETING">Meeting</option>
                      <option value="NOTE">Note</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                    </select>
                  </Field.Root>
                  <Field.Root required invalid={!!activityErrors.deal}>
                    <Field.Label>Deal</Field.Label>
                    <select value={activityForm.deal} onChange={(e) => { setActivityErrors({ ...activityErrors, deal: undefined }); setActivityForm({ ...activityForm, deal: e.target.value }); }} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}>
                      <option value="">Select deal...</option>
                      {availableDeals.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <Field.ErrorText>{activityErrors.deal}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root required invalid={!!activityErrors.scheduled_at}>
                    <Field.Label>Schedule Date & Time</Field.Label>
                    <Input type="datetime-local" value={activityForm.scheduled_at} onChange={(e) => { setActivityErrors({ ...activityErrors, scheduled_at: undefined }); setActivityForm({ ...activityForm, scheduled_at: e.target.value }); }} />
                    <Field.ErrorText>{activityErrors.scheduled_at}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root w="full" required invalid={!!activityErrors.notes}>
                    <Field.Label>Notes</Field.Label>
                    <textarea placeholder="Activity notes..." value={activityForm.notes} onChange={(e) => { setActivityErrors({ ...activityErrors, notes: undefined }); setActivityForm({ ...activityForm, notes: e.target.value }); }} rows={3} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", resize: "vertical" }} />
                    <Field.ErrorText>{activityErrors.notes}</Field.ErrorText>
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild><Button variant="outline" mr={3}>Cancel</Button></Dialog.CloseTrigger>
                <Button bg="primary" color="white" onClick={handleSaveActivity} loading={activitySaving}>Create</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
