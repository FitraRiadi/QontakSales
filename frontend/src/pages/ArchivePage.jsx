import { useState, useEffect, useCallback } from "react";
import {
  Box, Heading, Text, Button, Table, Badge, VStack, HStack, Tabs, Spinner, createToaster,
  Dialog, Portal
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ArrowCounterClockwise, Trash, Archive, Buildings, AddressBook, Handshake } from "@phosphor-icons/react";
import api from "@/services/api";

const toaster = createToaster({ placement: "top" });

const TABS = [
  { value: "accounts", label: "Accounts", icon: Buildings },
  { value: "contacts", label: "Contacts", icon: AddressBook },
  { value: "deals", label: "Deals", icon: Handshake },
];

const TYPE_COLORS = {
  CUSTOMER: { bg: "blue.50", color: "blue.700", label: "Customer" },
  PARTNER: { bg: "purple.50", color: "purple.700", label: "Partner" },
  VENDOR: { bg: "green.50", color: "green.700", label: "Vendor" },
  LEAD: { bg: "yellow.50", color: "yellow.700", label: "Lead" },
  OTHER: { bg: "gray.50", color: "gray.700", label: "Other" },
};

export default function ArchivePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("accounts");
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [accountsCount, setAccountsCount] = useState(0);
  const [contactsCount, setContactsCount] = useState(0);
  const [dealsCount, setDealsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/accounts/", { params: { archived: "true", page, page_size: 10 } });
      setAccounts(data.results || []);
      setAccountsCount(data.count || 0);
    } catch {
      toaster.create({ title: "Failed to load archived accounts", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/contacts/", { params: { archived: "true", page, page_size: 10 } });
      setContacts(data.results || []);
      setContactsCount(data.count || 0);
    } catch {
      toaster.create({ title: "Failed to load archived contacts", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/deals/", { params: { archived: "true", page, page_size: 10 } });
      setDeals(data.results || []);
      setDealsCount(data.count || 0);
    } catch {
      toaster.create({ title: "Failed to load archived deals", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    if (tab === "accounts") fetchAccounts();
    else if (tab === "contacts") fetchContacts();
    else fetchDeals();
  }, [tab, page, fetchAccounts, fetchContacts, fetchDeals]);

  const handleRestore = async (endpoint) => {
    try {
      await api.post(endpoint);
      toaster.create({ title: "Restored successfully", type: "success" });
      if (tab === "accounts") fetchAccounts();
      else if (tab === "contacts") fetchContacts();
      else fetchDeals();
    } catch {
      toaster.create({ title: "Failed to restore", type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await api.delete(deleteDialog.endpoint);
      toaster.create({ title: "Deleted permanently", type: "success" });
      setDeleteDialog(null);
      if (tab === "accounts") fetchAccounts();
      else if (tab === "contacts") fetchContacts();
      else fetchDeals();
    } catch {
      toaster.create({ title: "Failed to delete", type: "error" });
    }
  };

  const getCounts = () => {
    const items = tab === "accounts" ? accounts : tab === "contacts" ? contacts : deals;
    return items.length;
  };

  const totalPages = Math.ceil((tab === "accounts" ? accountsCount : tab === "contacts" ? contactsCount : dealsCount) / 10);

  return (
    <Box px={6} py={4}>
      <HStack justify="space-between" mb={4}>
        <Heading fontWeight="semibold" size="lg">Archive</Heading>
      </HStack>

      <Tabs.Root value={tab} onValueChange={(e) => setTab(e.value)}>
        <Tabs.List>
          {TABS.map((t) => {
            const Icon = t.icon;
            const count = t.value === "accounts" ? accountsCount : t.value === "contacts" ? contactsCount : dealsCount;
            return (
              <Tabs.Trigger key={t.value} value={t.value}>
                <HStack gap={2}>
                  <Icon size={16} />
                  <Text>{t.label}</Text>
                  {count > 0 && (
                    <Badge size="sm" bg="muted" color="gray.600" borderRadius="full" px={2}>
                      {count}
                    </Badge>
                  )}
                </HStack>
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>

        {TABS.map((t) => (
          <Tabs.Content key={t.value} value={t.value}>
            {loading ? (
              <Box py={10} textAlign="center">
                <Spinner size="lg" color="primary" />
              </Box>
            ) : (tab === "accounts" ? accounts : tab === "contacts" ? contacts : deals).length === 0 ? (
              <Box py={10} textAlign="center">
                <Archive size={40} color="gray.300" />
                <Text mt={3} color="gray.500">No archived items</Text>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table.Root size="sm">
                  <Table.Header>
                    <Table.Row>
                      {tab === "accounts" && (
                        <>
                          <Table.ColumnHeader>Company</Table.ColumnHeader>
                          <Table.ColumnHeader>Type</Table.ColumnHeader>
                          <Table.ColumnHeader>Industry</Table.ColumnHeader>
                          <Table.ColumnHeader>City</Table.ColumnHeader>
                        </>
                      )}
                      {tab === "contacts" && (
                        <>
                          <Table.ColumnHeader>Name</Table.ColumnHeader>
                          <Table.ColumnHeader>Email</Table.ColumnHeader>
                          <Table.ColumnHeader>Phone</Table.ColumnHeader>
                          <Table.ColumnHeader>Account</Table.ColumnHeader>
                        </>
                      )}
                      {tab === "deals" && (
                        <>
                          <Table.ColumnHeader>Deal</Table.ColumnHeader>
                          <Table.ColumnHeader>Company</Table.ColumnHeader>
                          <Table.ColumnHeader>Amount</Table.ColumnHeader>
                          <Table.ColumnHeader>Stage</Table.ColumnHeader>
                        </>
                      )}
                      <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {(tab === "accounts" ? accounts : tab === "contacts" ? contacts : deals).map((item) => (
                      <Table.Row key={item.id}>
                        {tab === "accounts" && (
                          <>
                            <Table.Cell fontWeight="medium">{item.name}</Table.Cell>
                            <Table.Cell>
                              <Badge size="sm" bg={TYPE_COLORS[item.account_type]?.bg} color={TYPE_COLORS[item.account_type]?.color} borderRadius="full" px={2}>
                                {TYPE_COLORS[item.account_type]?.label || item.account_type}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>{item.industry || "-"}</Table.Cell>
                            <Table.Cell>{item.city || "-"}</Table.Cell>
                          </>
                        )}
                        {tab === "contacts" && (
                          <>
                            <Table.Cell fontWeight="medium">{item.first_name} {item.last_name}</Table.Cell>
                            <Table.Cell>{item.email || "-"}</Table.Cell>
                            <Table.Cell>{item.phone || "-"}</Table.Cell>
                            <Table.Cell>{item.account_name || "-"}</Table.Cell>
                          </>
                        )}
                        {tab === "deals" && (
                          <>
                            <Table.Cell fontWeight="medium">{item.name}</Table.Cell>
                            <Table.Cell>{item.company_name || "-"}</Table.Cell>
                            <Table.Cell>{item.amount ? `Rp ${Number(item.amount).toLocaleString("id-ID")}` : "-"}</Table.Cell>
                            <Table.Cell>{item.stage}</Table.Cell>
                          </>
                        )}
                        <Table.Cell textAlign="end">
                          <HStack gap={1} justify="flex-end">
                            <Button
                              size="xs"
                              variant="ghost"
                              colorPalette="green"
                              onClick={() => handleRestore(
                                tab === "accounts" ? `/accounts/${item.id}/restore/`
                                : tab === "contacts" ? `/contacts/${item.id}/restore/`
                                : `/deals/${item.id}/restore/`
                              )}
                            >
                              <ArrowCounterClockwise size={14} /> Restore
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              colorPalette="red"
                              onClick={() => setDeleteDialog({
                                name: tab === "accounts" ? item.name : tab === "contacts" ? `${item.first_name} ${item.last_name}` : item.name,
                                endpoint: tab === "accounts" ? `/accounts/${item.id}/`
                                  : tab === "contacts" ? `/contacts/${item.id}/`
                                  : `/deals/${item.id}/`
                              })}
                            >
                              <Trash size={14} /> Delete
                            </Button>
                          </HStack>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>

                {totalPages > 1 && (
                  <HStack justify="center" gap={4} mt={4}>
                    <Button size="xs" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
                    <Text fontSize="sm">Page {page} of {totalPages}</Text>
                    <Button size="xs" variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                  </HStack>
                )}
              </Box>
            )}
          </Tabs.Content>
        ))}
      </Tabs.Root>

      <Dialog.Root open={!!deleteDialog} onOpenChange={(e) => !e.open && setDeleteDialog(null)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delete Permanently</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>Are you sure you want to permanently delete <strong>{deleteDialog?.name}</strong>? This action cannot be undone.</Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" mr={3} onClick={() => setDeleteDialog(null)}>Cancel</Button>
                <Button bg="red.500" color="white" onClick={handleDelete}>Delete</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
