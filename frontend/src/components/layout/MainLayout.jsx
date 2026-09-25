import { useEffect, useRef, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pinned, setPinned] = useState(() => {
    try {
      return localStorage.getItem("sidebar_pinned") === "1";
    } catch {
      return false;
    }
  });
  const { pathname } = useLocation();
  const contentRef = useRef(null);

  // Dashboard scroll-nya di Box dalam, bukan window — reset tiap ganti menu
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  const togglePin = () => {
    setPinned((p) => {
      const next = !p;
      try {
        localStorage.setItem("sidebar_pinned", next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  return (
    <Flex h="100vh" bg="background" overflow="hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} pinned={pinned} />
      <Flex flex={1} flexDirection="column" minW={0} minH={0}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} pinned={pinned} onTogglePin={togglePin} />
        <Box ref={contentRef} flex={1} p={{ base: 4, md: 6 }} pt={{ base: 4, md: 4 }} overflow="auto" bg="muted">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
