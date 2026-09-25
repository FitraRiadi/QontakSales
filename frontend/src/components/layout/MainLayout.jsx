import { useEffect, useRef, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const contentRef = useRef(null);

  // Dashboard scroll-nya di Box dalam, bukan window — reset tiap ganti menu
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <Flex h="100vh" bg="background" overflow="hidden" flexDirection="column">
      <TopBar onMenuClick={() => setSidebarOpen(true)} />
      <Flex flex={1} minH={0}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Flex flex={1} flexDirection="column" minW={0} minH={0}>
          <Box ref={contentRef} flex={1} p={{ base: 4, md: 6 }} overflow="auto" bg="muted">
            <Outlet />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}
