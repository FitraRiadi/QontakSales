import { Box, VStack, Text, Link as ChakraLink, HStack } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { House, Users, Kanban, Gear, UserPlus, ChatsCircle, Archive, X, CalendarBlank } from "@phosphor-icons/react";
import brandLogo from "@/assets/brand.png";

const allNavItems = [
  { label: "Dashboard", icon: House, path: "/dashboard" },
  { label: "Leads", icon: Users, path: "/leads" },
  { label: "Pipeline", icon: Kanban, path: "/pipeline" },
  { label: "Calendar", icon: CalendarBlank, path: "/calendar" },
  { label: "Agents", icon: UserPlus, path: "/agents", managerOnly: true },
  { label: "Broadcast", icon: ChatsCircle, path: "/broadcasts" },
  { label: "Broadcast History", icon: ChatsCircle, path: "/broadcasts/history" },
  { label: "Archived Leads", icon: Archive, path: "/leads/archived" },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const userRole = localStorage.getItem("user_role");
  const isManager = userRole === "MANAGER";
  const navItems = allNavItems.filter((item) => !item.managerOnly || isManager);

  return (
    <>
      {open && (
        <Box
          display={{ base: "block", md: "none" }}
          position="fixed" inset={0} bg="blackAlpha.600" zIndex={40}
          onClick={onClose}
        />
      )}

      <Box
        w="260px" h="100vh" bg="white" borderRight="1px solid" borderColor="border"
        display="flex" flexDirection="column"
        position={{ base: "fixed", md: "relative" }}
        zIndex={50}
        transform={{ base: open ? "translateX(0)" : "translateX(-100%)", md: "translateX(0)" }}
        transition="transform 200ms ease"
      >
        <HStack justify="space-between" p={6}>
          <Box as="img" src={brandLogo} h="28px" alt="QontakSales" />
          <Box display={{ base: "block", md: "none" }} cursor="pointer" onClick={onClose}><X size={20} /></Box>
        </HStack>

        <VStack flex={1} align="stretch" px={3} gap={1}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <ChakraLink
                key={item.path}
                as={RouterLink}
                to={item.path}
                display="flex" alignItems="center" gap={3} px={4} py={3} borderRadius="md"
                fontWeight={isActive ? "semibold" : "normal"}
                bg={isActive ? "primary" : "transparent"}
                color={isActive ? "white" : "foreground"}
                _hover={{ bg: isActive ? "primary" : "muted", textDecoration: "none" }}
                transition="all 150ms ease"
                onClick={onClose}
              >
                <Icon size={20} />
                <Text fontSize="sm">{item.label}</Text>
              </ChakraLink>
            );
          })}
        </VStack>

        <Box p={3}>
          <ChakraLink
            as={RouterLink}
            to="/settings"
            display="flex" alignItems="center" gap={3} px={4} py={3} borderRadius="md"
            color="foreground"
            bg={location.pathname === "/settings" ? "muted" : "transparent"}
            _hover={{ bg: "muted", textDecoration: "none" }}
            transition="all 150ms ease"
            onClick={onClose}
          >
            <Gear size={20} />
            <Text fontSize="sm">Settings</Text>
          </ChakraLink>
        </Box>
      </Box>
    </>
  );
}
