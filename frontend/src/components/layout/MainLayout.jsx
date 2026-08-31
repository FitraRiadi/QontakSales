import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Flex h="100vh" bg="background" overflow="hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Flex flex={1} flexDirection="column" minW={0}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <Box flex={1} p={{ base: 4, md: 6 }} overflow="auto">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
