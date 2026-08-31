import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  HStack,
  Text,
  Avatar,
  Badge,
  VStack,
} from "@chakra-ui/react";
import { Bell, List, SignOut, Gear } from "@phosphor-icons/react";
import api from "@/services/api";

export default function TopBar({ onMenuClick }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarKey, setAvatarKey] = useState(0);
  const notifRef = useRef(null);
  const menuRef = useRef(null);

  const fetchUser = () => {
    api.get("/auth/profile/").then((r) => {
      setUser(r.data);
      setAvatarKey((k) => k + 1);
    });
  };

  const fetchNotifications = () => {
    api.get("/notifications/").then((r) => setNotifications(r.data.results || r.data));
  };

  useEffect(() => {
    fetchUser();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchUser();
      fetchNotifications();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handleFocus();
    });
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = async (id) => {
    await api.post(`/notifications/${id}/mark_read/`);
    setNotifications(notifications.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const avatarUrl = user?.avatar_url || null;

  return (
    <HStack
      h="64px" px={{ base: 4, md: 6 }} bg="white"
      borderBottom="1px solid" borderColor="border"
      justify="flex-end" gap={4}
    >
      <Box display={{ base: "block", md: "none" }} cursor="pointer" onClick={onMenuClick} p={2} borderRadius="md" _hover={{ bg: "muted" }}>
        <List size={22} color="#0F172A" />
      </Box>

      {/* Notifications */}
      <Box ref={notifRef} position="relative">
        <HStack cursor="pointer" p={2} borderRadius="md" _hover={{ bg: "muted" }} onClick={() => setShowNotif(!showNotif)} position="relative">
          <Bell size={20} color="#0F172A" />
          {unreadCount > 0 && (
            <Badge position="absolute" top={0} right={0} colorPalette="red" size="xs" borderRadius="full">{unreadCount}</Badge>
          )}
        </HStack>
        {showNotif && (
          <Box position="absolute" top="100%" right={0} mt={2} w="360px" bg="white" border="1px solid" borderColor="border" borderRadius="lg" shadow="lg" zIndex={50} maxH="400px" overflow="auto">
            <HStack justify="space-between" p={3} borderBottom="1px solid" borderColor="border">
              <Text fontWeight="semibold" fontSize="sm">Notifications</Text>
              {unreadCount > 0 && (
                <Button size="xs" variant="ghost" onClick={async () => { await api.post("/notifications/mark_all_read/"); setNotifications(notifications.map((n) => ({ ...n, is_read: true }))); }}>Mark all read</Button>
              )}
            </HStack>
            {notifications.length === 0 ? (
              <Box p={4}><Text fontSize="sm" color="foreground" opacity={0.5}>No notifications</Text></Box>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <Box key={n.id} p={3} borderBottom="1px solid" borderColor="border" cursor="pointer" bg={n.is_read ? "transparent" : "muted"} _hover={{ bg: "muted" }} onClick={() => { markRead(n.id); if (n.link) navigate(n.link); setShowNotif(false); }}>
                  <Text fontWeight={n.is_read ? "normal" : "semibold"} fontSize="sm">{n.title}</Text>
                  <Text fontSize="xs" color="foreground" opacity={0.6}>{n.message}</Text>
                  <Text fontSize="xs" color="foreground" opacity={0.4} mt={1}>{new Date(n.created_at).toLocaleString("id-ID")}</Text>
                </Box>
              ))
            )}
          </Box>
        )}
      </Box>

      {/* User Menu */}
      <Box ref={menuRef} position="relative">
        <Avatar.Root size="sm" cursor="pointer" onClick={() => setShowMenu(!showMenu)}>
          {avatarUrl ? (
            <Avatar.Image key={avatarKey} src={`${avatarUrl}?t=${avatarKey}`} />
          ) : (
            <Avatar.Fallback name={user ? `${user.first_name} ${user.last_name}` : "User"} bg="primary" color="white" />
          )}
        </Avatar.Root>
        {showMenu && (
          <Box position="absolute" top="100%" right={0} mt={2} w="200px" bg="white" border="1px solid" borderColor="border" borderRadius="lg" shadow="lg" zIndex={50}>
            <Box p={3} borderBottom="1px solid" borderColor="border">
              <Text fontWeight="semibold" fontSize="sm">{user?.first_name} {user?.last_name}</Text>
              <Text fontSize="xs" color="foreground" opacity={0.5}>{user?.role}</Text>
            </Box>
            <VStack align="stretch" gap={0}>
              <HStack p={3} cursor="pointer" _hover={{ bg: "muted" }} onClick={() => { navigate("/settings"); setShowMenu(false); }}>
                <Gear size={16} /><Text fontSize="sm">Settings</Text>
              </HStack>
              <HStack p={3} cursor="pointer" _hover={{ bg: "muted" }} color="destructive" onClick={handleLogout}>
                <SignOut size={16} /><Text fontSize="sm">Logout</Text>
              </HStack>
            </VStack>
          </Box>
        )}
      </Box>
    </HStack>
  );
}
