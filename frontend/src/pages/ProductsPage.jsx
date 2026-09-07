import { useState, useEffect } from "react";
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
import { Plus, Package, PencilSimple, Trash } from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

const EMPTY_FORM = { name: "", code: "", description: "", base_price: "", cost: "", category: "", unit: "pcs", tax_rate: "0", status: "ACTIVE" };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    api.get("/products/", { params })
      .then((r) => { setProducts(r.data.results || r.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const openCreate = () => { setEditProduct(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (p, e) => {
    e.stopPropagation();
    setEditProduct(p);
    setForm({ name: p.name || "", code: p.code || "", description: p.description || "", base_price: p.base_price || "", cost: p.cost || "", category: p.category || "", unit: p.unit || "pcs", tax_rate: p.tax_rate || "0", status: p.status || "ACTIVE" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toaster.create({ title: "Name is required", type: "error" });
    setSaving(true);
    try {
      const payload = { ...form, base_price: parseFloat(form.base_price) || 0, cost: parseFloat(form.cost) || 0, tax_rate: parseFloat(form.tax_rate) || 0 };
      if (editProduct) {
        await api.put(`/products/${editProduct.id}/`, payload);
        toaster.create({ title: "Product updated", type: "success" });
      } else {
        await api.post("/products/", payload);
        toaster.create({ title: "Product created", type: "success" });
      }
      setDialogOpen(false);
      fetchProducts();
    } catch {
      toaster.create({ title: "Failed to save product", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await api.delete(`/products/${deleteDialog.id}/`);
      toaster.create({ title: "Product deleted", type: "success" });
      setDeleteDialog(null);
      fetchProducts();
    } catch {
      toaster.create({ title: "Failed to delete", type: "error" });
    }
  };

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Products</Heading>
        <Button bg="primary" color="white" _hover={{ bg: "secondary" }} onClick={openCreate}><Plus size={16} /> Add Product</Button>
      </HStack>
      <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} maxW="400px" />

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}><Spinner size="lg" color="primary" /></Box>
      ) : products.length === 0 ? (
        <Box textAlign="center" py={10}><Package size={48} style={{ margin: "0 auto 12px", opacity: 0.3 }} /><Text color="gray.500">No products found</Text></Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {products.map((p) => (
            <Card.Root key={p.id} bg="white" border="1px solid" borderColor="border" _hover={{ borderColor: "primary" }} transition="all 150ms ease">
              <Card.Body>
                <HStack justify="space-between" mb={2}>
                  <Heading size="sm" noOfLines={1}>{p.name}</Heading>
                  <Badge colorPalette={p.status === "ACTIVE" ? "green" : "gray"} size="sm">{p.status}</Badge>
                </HStack>
                {p.code && <Text fontSize="xs" color="gray.500">SKU: {p.code}</Text>}
                {p.category && <Text fontSize="xs" color="gray.500">Category: {p.category}</Text>}
                <HStack justify="space-between" mt={3} pt={3} borderTop="1px solid" borderColor="border">
                  <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="gray.500">Base Price</Text>
                    <Text fontWeight="bold" fontSize="sm" color="primary">Rp {Number(p.base_price).toLocaleString("id-ID")}</Text>
                  </VStack>
                  <HStack gap={1}>
                    <Button size="xs" variant="ghost" onClick={(e) => openEdit(p, e)}><PencilSimple size={12} /></Button>
                    <Button size="xs" variant="ghost" color="red.500" onClick={(e) => { e.stopPropagation(); setDeleteDialog(p); }}><Trash size={12} /></Button>
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
            <Dialog.Content maxW="500px">
              <Dialog.Header><Dialog.Title>{editProduct ? "Edit Product" : "New Product"}</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root required><Field.Label>Name</Field.Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field.Root>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}><Field.Label>Code/SKU</Field.Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field.Root>
                    <Field.Root flex={1}><Field.Label>Category</Field.Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field.Root>
                  </HStack>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}><Field.Label>Base Price</Field.Label><Input type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} /></Field.Root>
                    <Field.Root flex={1}><Field.Label>Cost</Field.Label><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></Field.Root>
                  </HStack>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}><Field.Label>Unit</Field.Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></Field.Root>
                    <Field.Root flex={1}><Field.Label>Tax Rate (%)</Field.Label><Input type="number" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} /></Field.Root>
                  </HStack>
                  <Field.Root w="full"><Field.Label>Description</Field.Label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "14px", resize: "vertical" }} /></Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild><Button variant="outline" mr={3}>Cancel</Button></Dialog.CloseTrigger>
                <Button bg="primary" color="white" onClick={handleSave} loading={saving}>{editProduct ? "Update" : "Create"}</Button>
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
              <Dialog.Header><Dialog.Title>Delete Product</Dialog.Title></Dialog.Header>
              <Dialog.Body><Text>Are you sure you want to delete <strong>{deleteDialog?.name}</strong>?</Text></Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild><Button variant="outline" mr={3}>Cancel</Button></Dialog.CloseTrigger>
                <Button bg="red.500" color="white" onClick={handleDelete}>Delete</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
