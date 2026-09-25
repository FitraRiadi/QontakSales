import { useState } from "react";
import { createPortal } from "react-dom";
import { Box, VStack, Text, HStack } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  House,
  UserPlus,
  ChatsCircle,
  ClockCounterClockwise,
  X,
  CalendarBlank,
  Buildings,
  AddressBook,
  Handshake,
  Package,
  Archive,
  Newspaper,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import logoNav from "@/assets/landing-stitch/logo-nav.png";
import "./Sidebar.css";

const NAV_ITEMS = [
  { label: "Dashboard", icon: House, path: "/dashboard" },
  { label: "Accounts", icon: Buildings, path: "/accounts" },
  { label: "Contacts", icon: AddressBook, path: "/contacts" },
  { label: "Deals", icon: Handshake, path: "/deals" },
  { label: "Products", icon: Package, path: "/products" },
  { label: "Calendar", icon: CalendarBlank, path: "/calendar" },
  { label: "Agents", icon: UserPlus, path: "/agents", managerOnly: true },
  { label: "Broadcast", icon: ChatsCircle, path: "/broadcasts" },
  { label: "Broadcast History", icon: ClockCounterClockwise, path: "/broadcasts/history" },
  { label: "Articles", icon: Newspaper, path: "/articles" },
  { label: "Archive", icon: Archive, path: "/archive" },
];

function NavList({ expanded, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("user_role");
  const isManager = userRole === "MANAGER";
  const items = NAV_ITEMS.filter((i) => !i.managerOnly || isManager);
  const [tip, setTip] = useState(null);
  const go = (path) => {
    onNavigate();
    navigate(path);
  };
  const showTip = (e, label) => {
    if (expanded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTip({ label, left: rect.right + 12, top: rect.top + rect.height / 2 });
  };

  return (
    <VStack align="stretch" gap={1}>
      {items.map((item, idx) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <div
            key={item.path}
            onMouseEnter={(e) => showTip(e, item.label)}
            onMouseLeave={() => setTip(null)}
          >
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
            >
              <Box
                role="link"
                tabIndex={0}
                display="flex"
                alignItems="center"
                gap={3}
                px={expanded ? 4 : 2}
                py={3}
                justifyContent="flex-start"
                borderRadius="xl"
                fontWeight={isActive ? "semibold" : "normal"}
                color="foreground"
                overflow="hidden"
                cursor="pointer"
                bg="transparent"
                border="1px solid transparent"
                boxShadow="none"
                _hover={{
                  bg: "#fff",
                  textDecoration: "none",
                  boxShadow:
                    "inset 2px 2px 5px rgba(255,255,255,1), inset -3px -3px 8px rgba(15,23,42,.07), 4px 6px 14px rgba(15,23,42,.1)",
                }}
                transition="background-color 150ms ease, padding 350ms ease, box-shadow 200ms ease"
                onClick={() => go(item.path)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    go(item.path);
                  }
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w="40px"
                  h="40px"
                  borderRadius="lg"
                  flexShrink={0}
                  position="relative"
                  left={expanded ? 0 : "-2px"}
                  transition="left 350ms ease"
                >
                  <Icon size={22} color={isActive ? "#2563EB" : "#0F172A"} />
                </Box>
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      key="nav-label"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.18, delay: 0.08 }}
                      style={{ display: "flex", overflow: "hidden", flexShrink: 1 }}
                    >
                      <Text fontSize="sm" whiteSpace="nowrap">
                        {item.label}
                      </Text>
                    </motion.span>
                  )}
                </AnimatePresence>
              </Box>
            </motion.div>
          </div>
        );
      })}
      {tip &&
        createPortal(
          <span className="sb-tip-fixed" style={{ left: tip.left, top: tip.top }}>
            {tip.label}
          </span>,
          document.body
        )}
    </VStack>
  );
}

export default function Sidebar({ open, onClose }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Desktop: hover-expand 280 / 72 */}
      <motion.div
        animate={{ width: expanded ? 280 : 72 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          height: "calc(100vh - 56px)",
          background: "#edf2ff",
          borderRight: "1px solid rgba(255,255,255,.9)",
          boxShadow:
            "inset 2px 0 6px rgba(255,255,255,.9), inset -4px 0 10px rgba(15,23,42,.05), 10px 0 28px -12px rgba(15,23,42,.18)",
          position: "relative",
          zIndex: 50,
          flexShrink: 0,
        }}
        className="sb-desktop"
      >
        <Box flex={1} overflowY="auto" overflowX="hidden" px={expanded ? 3 : 2} py={4} className="sb-scroll" minH={0}>
          <NavList expanded={expanded} onNavigate={() => {}} />
        </Box>
      </motion.div>

      {/* Mobile: slide-over drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 40,
              }}
              className="sb-mobileonly"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: 280,
                height: "100vh",
                background: "#edf2ff",
                zIndex: 50,
                boxShadow:
                  "inset 2px 0 6px rgba(255,255,255,.9), 16px 0 40px -16px rgba(15,23,42,.3)",
              }}
              className="sb-mobileonly sb-mobile-panel"
            >
              <HStack justify="space-between" p={4} pb={0}>
                <Box as="img" src={logoNav} h="24px" alt="Sales Qontak" />
                <Box cursor="pointer" onClick={onClose} p={2} borderRadius="md" _hover={{ bg: "muted" }}>
                  <X size={20} />
                </Box>
              </HStack>
              <Box flex={1} overflowY="auto" overflowX="hidden" px={3} py={4} className="sb-scroll" minH={0}>
                <NavList expanded onNavigate={onClose} />
              </Box>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
