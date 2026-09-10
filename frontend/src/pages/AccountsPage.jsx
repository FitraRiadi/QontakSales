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
  Menu,
  Portal,
  SimpleGrid,
  Spinner,
  Table,
  Text,
  VStack,
  Badge,
  createToaster,
} from "@chakra-ui/react";
import { Plus, Buildings, MagnifyingGlass, Phone, Envelope, MapPin, PencilSimple, Trash, DotsThreeVertical, Eye, Archive } from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top" });

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

const PAGE_SIZE = 10;

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
  const userRole = localStorage.getItem("user_role");
  const userId = localStorage.getItem("user_id");

  const [viewMode, setViewMode] = useState("card");
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(accounts.length / PAGE_SIZE);
  const pagedAccounts = accounts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fetchAccounts = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (filterType) params.type = filterType;
    if (filterIndustry) params.industry = filterIndustry;
    api.get("/accounts/", { params })
      .then((r) => { setAccounts(r.data.results || r.data); setLoading(false); })
      .catch(() => { setLoading(false); toaster.create({ title: "Gagal memuat akun", type: "error" }); });
  };

  useEffect(() => { fetchAccounts(); }, [search, filterType, filterIndustry]);
  useEffect(() => { setPage(1); }, [search, filterType, filterIndustry]);

  const openCreate = () => {
    setEditAccount(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (account, e) => {
    if (e) e.stopPropagation();
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
    if (!form.industry) errs.industry = "Industry is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const payload = { ...form, annual_revenue: form.annual_revenue ? parseFloat(form.annual_revenue) : null };
      if (editAccount) {
        await api.put(`/accounts/${editAccount.id}/`, payload);
        toaster.create({ title: "Akun berhasil diupdate", type: "success" });
      } else {
        await api.post("/accounts/", payload);
        toaster.create({ title: "Akun berhasil dibuat", type: "success" });
      }
      setDialogOpen(false);
      fetchAccounts();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const fieldErrors = {};
        for (const [key, val] of Object.entries(data)) {
          if (Array.isArray(val)) fieldErrors[key] = val[0];
          else if (typeof val === "string") fieldErrors[key] = val;
        }
        if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }
      }
      toaster.create({ title: "Gagal menyimpan akun", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await api.delete(`/accounts/${deleteDialog.id}/`);
      toaster.create({ title: "Akun berhasil dihapus", type: "success" });
      setDeleteDialog(null);
      fetchAccounts();
    } catch {
      toaster.create({ title: "Gagal menghapus akun", type: "error" });
    }
  };

  const handleArchive = async (id) => {
    try {
      await api.post(`/accounts/${id}/archive/`);
      toaster.create({ title: "Akun berhasil diarsipkan", type: "success" });
      fetchAccounts();
    } catch {
      toaster.create({ title: "Gagal mengarsipkan akun", type: "error" });
    }
  };

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between" wrap="wrap" gap={4}>
        <Heading fontWeight="semibold" size="lg">Akun</Heading>
        <HStack gap={3}>
          <HStack gap={1} bg="muted" borderRadius="lg" p={1}>
            <Button size="xs" variant={viewMode === "card" ? "solid" : "ghost"} bg={viewMode === "card" ? "foreground" : undefined} color={viewMode === "card" ? "background" : undefined} onClick={() => setViewMode("card")}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
            </Button>
            <Button size="xs" variant={viewMode === "table" ? "solid" : "ghost"} bg={viewMode === "table" ? "foreground" : undefined} color={viewMode === "table" ? "background" : undefined} onClick={() => setViewMode("table")}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2" rx="0.5" /><rect x="1" y="7" width="14" height="2" rx="0.5" /><rect x="1" y="12" width="14" height="2" rx="0.5" /></svg>
            </Button>
          </HStack>
          {userRole === "MANAGER" && (
            <Button bg="primary" color="white" _hover={{ bg: "secondary" }} onClick={openCreate}>
              <Plus size={16} /> Tambah Akun
            </Button>
          )}
        </HStack>
      </HStack>

      <HStack gap={3} wrap="wrap">
        <Box position="relative" flex={1} minW="200px">
          <Input placeholder="Cari akun..." value={search} onChange={(e) => setSearch(e.target.value)} pl={10} />
          <MagnifyingGlass size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
        </Box>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", backgroundColor: "#FAFAFA" }}>
          <option value="">Semua Tipe</option>
          <option value="PROSPECT">Prospect</option>
          <option value="CUSTOMER">Customer</option>
          <option value="PARTNER">Partner</option>
          <option value="VENDOR">Vendor</option>
        </select>
        <select value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", backgroundColor: "#FAFAFA" }}>
          <option value="">Semua Industri</option>
          {Object.entries(INDUSTRY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </HStack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}><Spinner size="lg" color="primary" /></Box>
      ) : accounts.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Buildings size={48} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <Text color="gray.500">Tidak ada akun ditemukan</Text>
        </Box>
      ) : viewMode === "card" ? (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {pagedAccounts.map((acc) => (
              <Card.Root
                key={acc.id}
                bg="#FAFAFA"
                border="1px solid"
                borderColor="border"
                cursor="pointer"
                _hover={{ borderColor: "primary", transform: "translateY(-2px)" }}
                transition="all 150ms ease"
                onClick={() => navigate(`/accounts/${acc.id}`)}
              >
                <Card.Body>
                  <HStack justify="space-between" mb={2}>
                    <Heading fontWeight="semibold" size="sm" noOfLines={1}>{acc.name}</Heading>
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
                    <Text fontSize="xs" color="gray.500">{acc.contacts_count || 0} kontak</Text>
                    <Text fontSize="xs" color="gray.500">{acc.deals_count || 0} deal</Text>
                    {(userRole === "MANAGER" || String(acc.owner) === String(userId)) && (
                      <Menu.Root>
                        <Menu.Trigger asChild>
                          <Button size="xs" variant="ghost" onClick={(e) => e.stopPropagation()}>
                            <DotsThreeVertical size={16} />
                          </Button>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content>
                              <Menu.Item value="detail" onClick={() => navigate(`/accounts/${acc.id}`)}>
                                <HStack gap={2}><Eye size={14} /> <Text fontSize="sm">Lihat Detail</Text></HStack>
                              </Menu.Item>
                              <Menu.Item value="edit" onClick={(e) => openEdit(acc, e)}>
                                <HStack gap={2}><PencilSimple size={14} /> <Text fontSize="sm">Edit</Text></HStack>
                              </Menu.Item>
                              <Menu.Item value="archive" onClick={() => handleArchive(acc.id)}>
                                <HStack gap={2}><Archive size={14} /> <Text fontSize="sm">Arsipkan</Text></HStack>
                              </Menu.Item>
                              <Menu.Item value="delete" color="red.500" onClick={() => setDeleteDialog(acc)}>
                                <HStack gap={2}><Trash size={14} /> <Text fontSize="sm">Hapus</Text></HStack>
                              </Menu.Item>
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    )}
                  </HStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
          {totalPages > 1 && (
            <HStack justify="center" gap={2} pt={2}>
              <Button size="xs" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Text fontSize="sm">Halaman {page} dari {totalPages}</Text>
              <Button size="xs" variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </HStack>
          )}
        </>
      ) : (
        <>
          <Box overflowX="auto">
            <Table.Root size="sm" interactive>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Perusahaan</Table.ColumnHeader>
                  <Table.ColumnHeader>Tipe</Table.ColumnHeader>
                  <Table.ColumnHeader>Industri</Table.ColumnHeader>
                  <Table.ColumnHeader>Telepon</Table.ColumnHeader>
                  <Table.ColumnHeader>Kota</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="center">Deal</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Aksi</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {pagedAccounts.map((acc) => (
                  <Table.Row key={acc.id} cursor="pointer" _hover={{ bg: "muted" }} onClick={() => navigate(`/accounts/${acc.id}`)}>
                    <Table.Cell>
                      <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>{acc.name}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={TYPE_COLORS[acc.account_type] || "gray"} size="sm">
                        {TYPE_LABELS[acc.account_type] || acc.account_type}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color="gray.600">{INDUSTRY_LABELS[acc.industry] || "-"}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm">{acc.phone || "-"}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm">{acc.city || "-"}</Text>
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Text fontSize="sm" fontWeight="medium">{acc.deals_count || 0}</Text>
                    </Table.Cell>
                    <Table.Cell textAlign="end" onClick={(e) => e.stopPropagation()}>
                      {(userRole === "MANAGER" || String(acc.owner) === String(userId)) && (
                        <Menu.Root>
                          <Menu.Trigger asChild>
                            <Button size="xs" variant="ghost">
                              <DotsThreeVertical size={16} />
                            </Button>
                          </Menu.Trigger>
                          <Portal>
                            <Menu.Positioner>
                              <Menu.Content>
                                <Menu.Item value="detail" onClick={() => navigate(`/accounts/${acc.id}`)}>
                                  <HStack gap={2}><Eye size={14} /> <Text fontSize="sm">Lihat Detail</Text></HStack>
                                </Menu.Item>
                                <Menu.Item value="edit" onClick={() => openEdit(acc)}>
                                  <HStack gap={2}><PencilSimple size={14} /> <Text fontSize="sm">Edit</Text></HStack>
                                </Menu.Item>
                                <Menu.Item value="archive" onClick={() => handleArchive(acc.id)}>
                                  <HStack gap={2}><Archive size={14} /> <Text fontSize="sm">Arsipkan</Text></HStack>
                                </Menu.Item>
                                <Menu.Item value="delete" color="red.500" onClick={() => setDeleteDialog(acc)}>
                                  <HStack gap={2}><Trash size={14} /> <Text fontSize="sm">Hapus</Text></HStack>
                                </Menu.Item>
                              </Menu.Content>
                            </Menu.Positioner>
                          </Portal>
                        </Menu.Root>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
          {totalPages > 1 && (
            <HStack justify="center" gap={2} pt={2}>
              <Button size="xs" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Text fontSize="sm">Halaman {page} dari {totalPages}</Text>
              <Button size="xs" variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </HStack>
          )}
        </>
      )}

      <Dialog.Root open={dialogOpen} onOpenChange={(e) => setDialogOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="600px">
              <Dialog.Header>
                <Dialog.Title>{editAccount ? "Edit Akun" : "Akun Baru"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root required invalid={!!errors.name}>
                    <Field.Label>Nama Perusahaan</Field.Label>
                    <Input placeholder="Nama perusahaan" value={form.name} onChange={(e) => { setErrors({ ...errors, name: undefined }); setForm({ ...form, name: e.target.value }); }} />
                    <Field.ErrorText>{errors.name}</Field.ErrorText>
                  </Field.Root>
                  <SimpleGrid columns={2} gap={4} w="full">
                    <Field.Root required invalid={!!errors.industry}>
                      <Field.Label>Industri</Field.Label>
                      <select value={form.industry} onChange={(e) => { setErrors({ ...errors, industry: undefined }); setForm({ ...form, industry: e.target.value }); }} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "#FAFAFA" }}>
                        <option value="">Pilih...</option>
                        {Object.entries(INDUSTRY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <Field.ErrorText>{errors.industry}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Ukuran (opsional)</Field.Label>
                      <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "#FAFAFA" }}>
                        <option value="">Pilih...</option>
                        <option value="1-10">1-10 karyawan</option>
                        <option value="11-50">11-50 karyawan</option>
                        <option value="51-200">51-200 karyawan</option>
                        <option value="201-500">201-500 karyawan</option>
                        <option value="500+">500+ karyawan</option>
                      </select>
                    </Field.Root>
                  </SimpleGrid>
                  <Field.Root>
                    <Field.Label>Tipe (opsional)</Field.Label>
                    <select value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", width: "100%", backgroundColor: "#FAFAFA" }}>
                      {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </Field.Root>
                  <SimpleGrid columns={2} gap={4} w="full">
                    <Field.Root required invalid={!!errors.phone}>
                      <Field.Label>Telepon</Field.Label>
                      <Input placeholder="+62 xxx" value={form.phone} onChange={(e) => { setErrors({ ...errors, phone: undefined }); setForm({ ...form, phone: e.target.value }); }} />
                      <Field.ErrorText>{errors.phone}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root required invalid={!!errors.email}>
                      <Field.Label>Email</Field.Label>
                      <Input type="email" placeholder="nama@perusahaan.com" value={form.email} onChange={(e) => { setErrors({ ...errors, email: undefined }); setForm({ ...form, email: e.target.value }); }} />
                      <Field.ErrorText>{errors.email}</Field.ErrorText>
                    </Field.Root>
                  </SimpleGrid>
                  <Field.Root>
                    <Field.Label>Website (opsional)</Field.Label>
                    <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Alamat (opsional)</Field.Label>
                    <Input placeholder="Alamat jalan" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </Field.Root>
                  <SimpleGrid columns={3} gap={4} w="full">
                    <Field.Root>
                      <Field.Label>Kota (opsional)</Field.Label>
                      <Input placeholder="Jakarta" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Negara (opsional)</Field.Label>
                      <Input placeholder="Indonesia" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Pendapatan (opsional)</Field.Label>
                      <Input type="number" placeholder="0" value={form.annual_revenue} onChange={(e) => setForm({ ...form, annual_revenue: e.target.value })} />
                    </Field.Root>
                  </SimpleGrid>
                  <Field.Root w="full">
                    <Field.Label>Catatan (opsional)</Field.Label>
                    <textarea placeholder="Catatan tambahan..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", resize: "vertical" }} />
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <Button variant="outline" mr={3}>Batal</Button>
                </Dialog.CloseTrigger>
                <Button bg="primary" color="white" onClick={handleSave} loading={saving}>
                  {editAccount ? "Update" : "Buat"}
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
              <Dialog.Header><Dialog.Title>Hapus Akun</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <Text>Apakah kamu yakin ingin menghapus <strong>{deleteDialog?.name}</strong>? Tindakan ini tidak dapat dibatalkan.</Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <Button variant="outline" mr={3}>Batal</Button>
                </Dialog.CloseTrigger>
                <Button bg="red.500" color="white" onClick={handleDelete}>Hapus</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
