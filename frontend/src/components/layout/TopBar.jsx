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
  Spinner,
} from "@chakra-ui/react";
import { Bell, List, SignOut, Gear, ArrowsClockwise, ArrowUUpLeft, ArrowLeft } from "@phosphor-icons/react";
import api from "@/services/api";

export default function TopBar({ onMenuClick }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSwitchSubmenu, setShowSwitchSubmenu] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [switching, setSwitching] = useState(null);
  const [user, setUser] = useState(null);
  const [avatarKey, setAvatarKey] = useState(0);
  const notifRef = useRef(null);
  const menuRef = useRef(null);
  const submenuRef = useRef(null);

  const isImpersonating = localStorage.getItem("impersonating") === "true";
  const impersonatedName = localStorage.getItem("impersonated_name") || "";
  const impersonatedId = localStorage.getItem("impersonated_id") || "";
  const userRole = localStorage.getItem("user_role");
  const isManager = userRole === "MANAGER" && !isImpersonating;

  const fetchUser = () => {
    api.get("/auth/profile/").then((r) => {
      setUser(r.data);
      setAvatarKey((k) => k + 1);
    });
  };

  const fetchNotifications = () => {
    api.get("/notifications/").then((r) => setNotifications(r.data.results || r.data));
  };

  const fetchTeam = () => {
    setLoadingTeam(true);
    api.get("/auth/team/").then((r) => {
      setTeamMembers(r.data);
      setLoadingTeam(false);
    }).catch(() => setLoadingTeam(false));
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

  const handleSwitchBack = () => {
    const managerToken = localStorage.getItem("manager_token");
    const managerRefresh = localStorage.getItem("manager_refresh");
    const managerUser = JSON.parse(localStorage.getItem("manager_user") || "{}");
    localStorage.setItem("access_token", managerToken);
    localStorage.setItem("refresh_token", managerRefresh);
    localStorage.setItem("user_role", managerUser.role);
    localStorage.setItem("user_name", managerUser.name);
    localStorage.removeItem("manager_token");
    localStorage.removeItem("manager_refresh");
    localStorage.removeItem("manager_user");
    localStorage.removeItem("impersonating");
    localStorage.removeItem("impersonated_name");
    localStorage.removeItem("impersonated_id");
    window.location.href = "/dashboard";
  };

  const handleSwitch = async (member) => {
    if (isImpersonating && String(member.id) === String(impersonatedId)) return;
    setSwitching(member.id);
    try {
      const res = await api.post("/auth/switch-account/", { user_id: member.id });
      const managerToken = localStorage.getItem("access_token");
      const managerRefresh = localStorage.getItem("refresh_token");
      const managerUser = {
        role: localStorage.getItem("user_role"),
        name: localStorage.getItem("user_name"),
      };
      localStorage.setItem("manager_token", managerToken);
      localStorage.setItem("manager_refresh", managerRefresh);
      localStorage.setItem("manager_user", JSON.stringify(managerUser));
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("user_role", res.data.user.role);
      localStorage.setItem("user_name", `${res.data.user.first_name} ${res.data.user.last_name}`);
      localStorage.setItem("impersonating", "true");
      localStorage.setItem("impersonated_name", `${res.data.user.first_name} ${res.data.user.last_name}`);
      localStorage.setItem("impersonated_id", String(res.data.user.id));
      window.location.href = "/dashboard";
    } catch {
      setSwitching(null);
    }
  };

  const openSwitchSubmenu = () => {
    setShowMenu(false);
    setShowSwitchSubmenu(true);
    fetchTeam();
  };

  const closeSwitchSubmenu = () => {
    setShowSwitchSubmenu(false);
    setShowMenu(true);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (submenuRef.current && !submenuRef.current.contains(e.target)) setShowSwitchSubmenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const avatarUrl = user?.avatar_url || null;

  return (
    <>
      {isImpersonating && (
        <Box bg="blue.500" color="white" px={4} py={2}>
          <HStack justify="center" gap={3}>
            <Text fontSize="sm" fontWeight="medium">
              Viewing as: {impersonatedName}
            </Text>
            <Button
              size="xs"
              bg="white"
              color="blue.500"
              _hover={{ bg: "blue.50" }}
              leftIcon={<ArrowUUpLeft size={14} />}
              onClick={handleSwitchBack}
            >
              Switch Back to Manager
            </Button>
          </HStack>
        </Box>
      )}

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
          <Avatar.Root size="sm" cursor="pointer" onClick={() => { setShowMenu(!showMenu); setShowSwitchSubmenu(false); }}>
            {avatarUrl ? (
              <Avatar.Image key={avatarKey} src={`${avatarUrl}?t=${avatarKey}`} />
            ) : (
              <Avatar.Fallback name={user ? `${user.first_name} ${user.last_name}` : "User"} bg="primary" color="white" />
            )}
          </Avatar.Root>

          {/* Main User Menu */}
          {showMenu && (
            <Box position="absolute" top="100%" right={0} mt={2} w="220px" bg="white" border="1px solid" borderColor="border" borderRadius="lg" shadow="lg" zIndex={50}>
              <Box p={3} borderBottom="1px solid" borderColor="border">
                <Text fontWeight="semibold" fontSize="sm">{user?.first_name} {user?.last_name}</Text>
                <Text fontSize="xs" color="foreground" opacity={0.5}>{user?.role}</Text>
                {user?.company_name && (
                  <Text fontSize="xs" color="foreground" opacity={0.4}>{user.company_name}</Text>
                )}
              </Box>
              <VStack align="stretch" gap={0}>
                <HStack p={3} cursor="pointer" _hover={{ bg: "muted" }} onClick={() => { navigate("/settings"); setShowMenu(false); }}>
                  <Gear size={16} /><Text fontSize="sm">Settings</Text>
                </HStack>
                {(isManager || isImpersonating) && (
                  <HStack p={3} cursor="pointer" _hover={{ bg: "muted" }} onClick={isImpersonating ? handleSwitchBack : openSwitchSubmenu}>
                    {isImpersonating ? <ArrowUUpLeft size={16} /> : <ArrowsClockwise size={16} />}
                    <Text fontSize="sm">{isImpersonating ? "Switch Back" : "Switch Account"}</Text>
                  </HStack>
                )}
                <HStack p={3} cursor="pointer" _hover={{ bg: "muted" }} color="destructive" onClick={handleLogout}>
                  <SignOut size={16} /><Text fontSize="sm">Logout</Text>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Switch Account Submenu */}
          {showSwitchSubmenu && (
            <Box ref={submenuRef} position="absolute" top="100%" right={0} mt={2} w="300px" bg="white" border="1px solid" borderColor="border" borderRadius="lg" shadow="lg" zIndex={50}>
              <HStack p={3} borderBottom="1px solid" borderColor="border" justify="space-between">
                <HStack gap={2} cursor="pointer" _hover={{ opacity: 0.7 }} onClick={closeSwitchSubmenu}>
                  <ArrowLeft size={16} />
                  <Text fontSize="sm" fontWeight="semibold">Back</Text>
                </HStack>
                <Text fontSize="sm" fontWeight="semibold" color="primary">Switch Account</Text>
              </HStack>

              {loadingTeam ? (
                <Box display="flex" justifyContent="center" py={6}><Spinner size="md" color="primary" /></Box>
              ) : (
                <VStack align="stretch" gap={0} maxH="320px" overflow="auto">
                  {teamMembers.map((member) => {
                    const isActive = isImpersonating && String(member.id) === String(impersonatedId);
                    const isCurrentManager = !isImpersonating && String(member.id) === String(user?.id);
                    const disabled = isActive || isCurrentManager;
                    return (
                      <HStack
                        key={member.id}
                        p={3}
                        cursor={disabled ? "not-allowed" : "pointer"}
                        bg={disabled ? "muted" : "transparent"}
                        opacity={disabled ? 0.5 : 1}
                        _hover={disabled ? {} : { bg: "muted" }}
                        borderBottom="1px solid"
                        borderColor="border"
                        transition="all 150ms ease"
                        onClick={() => !disabled && handleSwitch(member)}
                      >
                        <Avatar.Root size="sm">
                          {member.avatar_url ? (
                            <Avatar.Image src={member.avatar_url} />
                          ) : (
                            <Avatar.Fallback name={`${member.first_name} ${member.last_name}`} bg="primary" color="white" />
                          )}
                        </Avatar.Root>
                        <VStack align="start" gap={0} flex={1}>
                          <Text fontWeight="semibold" fontSize="sm">{member.first_name} {member.last_name}</Text>
                          <Text fontSize="xs" color="foreground" opacity={0.5}>{member.email}</Text>
                        </VStack>
                        {isActive ? (
                          <Badge colorPalette="green" size="sm">Active</Badge>
                        ) : isCurrentManager ? (
                          <Badge colorPalette="blue" size="sm">You</Badge>
                        ) : (
                          <Badge colorPalette={member.role === "MANAGER" ? "blue" : "green"} size="sm">{member.role}</Badge>
                        )}
                        {switching === member.id && <Spinner size="sm" color="primary" />}
                      </HStack>
                    );
                  })}
                </VStack>
              )}
            </Box>
          )}
        </Box>
      </HStack>
    </>
  );
}
