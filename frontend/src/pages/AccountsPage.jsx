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
import { Plus, Buildings, MagnifyingGlass, Phone, Envelope, MapPin, PencilSimple, Trash } from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

const INDUSTRY_LABELS = {
  TECH: "Technology",
  FINANCE: "Finance",
  HEALTH: "Healthcare",
  EDUCATION: "Education",
  RETAIL: "Retail",
  MANUFACTURING: "Manufacturing",
  REAL_ESTATE: "Real Estate",
  CONSULTING: "Consulting",
  OTHER: "Other",
};

const TYPE_LABELS = {
  PROSPECT: "Prospect",
  CUSTOMER: "Customer",
  PARTNER: "Partner",
  VENDOR: "Vendor",
};

const TYPE_COLORS = {
  PROSPECT: "blue",
  CUSTOMER: "green",
  PARTNER: "purple",
  VENDOR: "orange",
};

const EMPTY_FORM = {
  name: "",
  industry: "",
  size: "",
  account_type: "PROSPECT",
  website: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "Indonesia",
  annual_revenue: "",
  notes: "",
};

export default function AccountsPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");

  const fetchAccounts = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (filterType) params.type = filterType;
    if (filterIndustry) params.industry = filterIndustry;
    api.get("/accounts/", { params })
      .then((r) => { setAccounts(r.data.results || r.data); setLoading(false); })
      .catch(() => { setLoading(false); toaster.create({ title: "Failed to load accounts", type: "error" }); });
  };

  useEffect(() => { fetchAccounts(); }, [search, filterType, filterIndustry]);

  const openCreate = () => {
    setEditAccount(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (account, e) => {
    e.stopPropagation();
    setEditAccount(account);
    setForm({
      name: account.name || "",
      industry: account.industry || "",
      size: account.size || "",
      account_type: account.account_type || "PROSPECT",
      website: account.website || "",
      phone: account.phone || "",
      email: account.email || "",
      address: account.address || "",
      city: account.city || "",
      country: account.country || "Indonesia",
      annual_revenue: account.annual_revenue || "",
      notes: account.notes || "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const payload = { ...form, annual_revenue: form.annual_revenue ? parseFloat(form.annual_revenue) : null };
      if (editAccount) {
        await api.put(`/accounts/${editAccount.id}/`, payload);
        toaster.create({ title: "Account updated", type: "success" });
      } else {
        await api.post("/accounts/", payload);
        toaster.create({ title: "Account created", type: "success" });
      }
      setDialogOpen(false);
      fetchAccounts();
    } catch {
      toaster.create({ title: "Failed to save account", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await api.delete(`/accounts/${deleteDialog.id}/`);
      toaster.create({ title: "Account deleted", type: "success" });
      setDeleteDialog(null);
      fetchAccounts();
    } catch {
      toaster.create({ title: "Failed to delete", type: "error" });
    }
  };

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Accounts</Heading>
        <Button bg="primary" color="white" _hover={{ bg: "secondary" }} onClick={openCreate}>
          <Plus size={16} /> Add Account
        </Button>
      </HStack>

      <HStack gap={3} wrap="wrap">
        <Box position="relative" flex={1} minW="200px">
          <Input placeholder="Search accounts..." value={search} onChange={(e) => setSearch(e.target.value)} pl={10} />
          <MagnifyingGlass size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
        </Box>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", backgroundColor: "white" }}>
          <option value="">All Types</option>
          <option value="PROSPECT">Prospect</option>
          <option value="CUSTOMER">Customer</option>
          <option value="PARTNER">Partner</option>
          <option value="VENDOR">Vendor</option>
        </select>
        <select value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", backgroundColor: "white" }}>
          <option value="">All Industries</option>
          {Object.entries(INDUSTRY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </HStack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}><Spinner size="lg" color="primary" /></Box>
      ) : accounts.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Buildings size={48} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <Text color="gray.500">No accounts found</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {accounts.map((acc) => (
            <Card.Root
              key={acc.id}
              bg="white"
              border="1px solid"
              borderColor="border"
              cursor="pointer"
              _hover={{ borderColor: "primary", transform: "translateY(-2px)" }}
              transition="all 150ms ease"
              onClick={() => navigate(`/accounts/${acc.id}`)}
            >
              <Card.Body>
                <HStack justify="space-between" mb={2}>
                  <Heading size="sm" noOfLines={1}>{acc.name}</Heading>
                  <Badge colorPalette={TYPE_COLORS[acc.account_type] || "gray"} size="sm">
                    {TYPE_LABELS[acc.account_type] || acc.account_type}
                  </Badge>
                </HStack>
                {acc.industry && <Text fontSize="xs" color="gray.500">{INDUSTRY_LABELS[acc.industry] || acc.industry}</Text>}
                <VStack align="start" gap={1} mt={2}>
                  {acc.phone && <HStack gap={1}><Phone size={12} color="gray.400" /><Text fontSize="xs">{acc.phone}</Text></HStack>}
                  {acc.email && <HStack gap={1}><Envelope size={12} color="gray.400" /><Text fontSize="xs">{acc.email}</Text></HStack>}
                  {acc.city && <HStack gap={1}><MapPin size={12} color="gray.400" /><Text fontSize="xs">{acc.city}</Text></HStack>}
                </VStack>
                <HStack justify="space-between" mt={3} pt={3} borderTop="1px solid" borderColor="border">
                  <Text fontSize="xs" color="gray.500">{acc.contacts_count || 0} contacts</Text>
                  <Text fontSize="xs" color="gray.500">{acc.deals_count || 0} deals</Text>
                  <HStack gap={1}>
                    <Button size="xs" variant="ghost" onClick={(e) => openEdit(acc, e)}><PencilSimple size={12} /></Button>
                    <Button size="xs" variant="ghost" color="red.500" onClick={(e) => { e.stopPropagation(); setDeleteDialog(acc); }}><Trash size={12} /></Button>
                  </HStack>
                </HStack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      )}

      <Dialog.Root open={dialogOpen} onOpenChange={(e) => setDialogOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="600px">
              <Dialog.Header>
                <Dialog.Title>{editAccount ? "Edit Account" : "New Account"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root required invalid={!!errors.name}>
                    <Field.Label>Company Name</Field.Label>
                    <Input placeholder="Company name" value={form.name} onChange={(e) => { setErrors({}); setForm({ ...form, name: e.target.value }); }} />
                    <Field.ErrorText>{errors.name}</Field.ErrorText>
                  </Field.Root>
                  <SimpleGrid columns={2} gap={4} w="full">
                    <Field.Root>
                      <Field.Label>Industry</Field.Label>
                      <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}>
                        <option value="">Select...</option>
                        {Object.entries(INDUSTRY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Size</Field.Label>
                      <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}>
                        <option value="">Select...</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </Field.Root>
                  </SimpleGrid>
                  <Field.Root>
                    <Field.Label>Type</Field.Label>
                    <select value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "white" }}>
                      {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </Field.Root>
                  <SimpleGrid columns={2} gap={4} w="full">
                    <Field.Root>
                      <Field.Label>Phone</Field.Label>
                      <Input placeholder="+62 xxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Email</Field.Label>
                      <Input type="email" placeholder="name@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </Field.Root>
                  </SimpleGrid>
                  <Field.Root>
                    <Field.Label>Website</Field.Label>
                    <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Address</Field.Label>
                    <Input placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </Field.Root>
                  <SimpleGrid columns={3} gap={4} w="full">
                    <Field.Root>
                      <Field.Label>City</Field.Label>
                      <Input placeholder="Jakarta" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Country</Field.Label>
                      <Input placeholder="Indonesia" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Annual Revenue</Field.Label>
                      <Input type="number" placeholder="0" value={form.annual_revenue} onChange={(e) => setForm({ ...form, annual_revenue: e.target.value })} />
                    </Field.Root>
                  </SimpleGrid>
                  <Field.Root w="full">
                    <Field.Label>Notes</Field.Label>
                    <textarea placeholder="Additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", resize: "vertical" }} />
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <Button variant="outline" mr={3}>Cancel</Button>
                </Dialog.CloseTrigger>
                <Button bg="primary" color="white" onClick={handleSave} loading={saving}>
                  {editAccount ? "Update" : "Create"}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={!!deleteDialog} onOpenChange={(e) => { if (!e.open) setDeleteDialog(null); }}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header><Dialog.Title>Delete Account</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <Text>Are you sure you want to delete <strong>{deleteDialog?.name}</strong>? This action cannot be undone.</Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <Button variant="outline" mr={3}>Cancel</Button>
                </Dialog.CloseTrigger>
                <Button bg="red.500" color="white" onClick={handleDelete}>Delete</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
