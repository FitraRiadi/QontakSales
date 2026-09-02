import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  HStack,
  Heading,
  Text,
  VStack,
  Dialog,
  Portal,
  Badge,
  Spinner,
  createToaster,
} from "@chakra-ui/react";
import { CaretLeft, CaretRight, CalendarBlank, X } from "@phosphor-icons/react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TYPE_LABELS = {
  FOLLOW_UP: "Follow Up",
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  NOTE: "Note",
  NEW_LEAD: "New Lead",
};

const TYPE_COLORS = {
  FOLLOW_UP: "green",
  CALL: "blue",
  EMAIL: "purple",
  MEETING: "yellow",
  NOTE: "gray",
  NEW_LEAD: "blue",
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterType, setFilterType] = useState("ALL");

  const fetchEvents = useCallback(() => {
    setLoading(true);
    const start = format(startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }), "yyyy-MM-dd");
    const end = format(endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }), "yyyy-MM-dd");
    api.get("/calendar/events/", { params: { start, end } })
      .then((r) => { setEvents(r.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [currentDate]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDate = (date) => {
    const filtered = filterType === "ALL" ? events : events.filter((e) => e.type === filterType);
    return filtered.filter((e) => isSameDay(parseISO(e.date), date));
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setDetailOpen(true);
  };

  const handleCancel = async (ev, e) => {
    e.stopPropagation();
    try {
      if (ev.type === "NEW_LEAD") return;
      if (ev.id.startsWith("lead-")) {
        const leadId = ev.lead_id;
        await api.post(`/leads/${leadId}/cancel_follow_up/`);
      } else if (ev.id.startsWith("activity-")) {
        const activityId = ev.id.replace("activity-", "");
        await api.post(`/activities/${activityId}/cancel/`);
      }
      toaster.create({ title: "Schedule cancelled", type: "success" });
      fetchEvents();
    } catch {
      toaster.create({ title: "Failed to cancel", type: "error" });
    }
  };

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg" color="foreground">Calendar</Heading>
      </HStack>

      <Card.Root bg="white" border="1px solid" borderColor="border">
        <Card.Body>
          <HStack justify="space-between" mb={4}>
            <Button size="sm" variant="outline" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <CaretLeft size={16} />
            </Button>
            <Heading size="md" color="foreground">
              {format(currentDate, "MMMM yyyy", { locale: idLocale })}
            </Heading>
            <Button size="sm" variant="outline" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <CaretRight size={16} />
            </Button>
          </HStack>

          <HStack mb={4} gap={2} wrap="wrap">
            <Text fontSize="sm" fontWeight="medium" color="gray.600">Filter:</Text>
            {[
              { value: "ALL", label: "All" },
              { value: "FOLLOW_UP", label: "Follow Up" },
              { value: "CALL", label: "Call" },
              { value: "EMAIL", label: "Email" },
              { value: "MEETING", label: "Meeting" },
              { value: "NOTE", label: "Note" },
              { value: "NEW_LEAD", label: "New Lead" },
            ].map((opt) => (
              <Button
                key={opt.value}
                size="xs"
                variant={filterType === opt.value ? "solid" : "outline"}
                bg={filterType === opt.value ? "primary" : "transparent"}
                color={filterType === opt.value ? "white" : "gray.600"}
                onClick={() => setFilterType(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </HStack>

          {loading ? (
            <Box display="flex" justifyContent="center" py={10}><Spinner size="lg" color="primary" /></Box>
          ) : (
            <Box>
              <HStack mb={2}>
                {DAYS.map((d) => (
                  <Box key={d} flex={1} textAlign="center" fontWeight="bold" fontSize="sm" color="gray.500" py={2}>
                    {d}
                  </Box>
                ))}
              </HStack>

              <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap="1px" bg="gray.100" borderRadius="lg" overflow="hidden">
                {days.map((d, i) => {
                  const dayEvents = getEventsForDate(d);
                  const inMonth = isSameMonth(d, currentDate);
                  const today = isToday(d);
                  return (
                    <Box
                      key={i}
                      bg="white"
                      minH="100px"
                      p={2}
                      cursor="pointer"
                      opacity={inMonth ? 1 : 0.4}
                      _hover={{ bg: "gray.50" }}
                      onClick={() => handleDayClick(d)}
                    >
                      <Text
                        fontSize="sm"
                        fontWeight={today ? "bold" : "normal"}
                        color={today ? "white" : "gray.700"}
                        bg={today ? "primary" : "transparent"}
                        borderRadius="full"
                        w="24px"
                        h="24px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mb={1}
                      >
                        {format(d, "d")}
                      </Text>
                      <VStack gap={1} align="stretch">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <Box
                            key={ev.id}
                            bg={ev.color || "gray.100"}
                            color="white"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                            fontSize="xs"
                            cursor="pointer"
                            onClick={(e) => { e.stopPropagation(); navigate(`/leads/${ev.lead_id}`); }}
                          >
                            <Text noOfLines={1}>{ev.title}</Text>
                            {ev.time && <Text fontSize="xs" opacity={0.8}>{ev.time}</Text>}
                          </Box>
                        ))}
                        {dayEvents.length > 3 && (
                          <Text fontSize="xs" color="gray.500">+{dayEvents.length - 3} more</Text>
                        )}
                      </VStack>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Card.Body>
      </Card.Root>

      <Dialog.Root open={detailOpen} onOpenChange={(e) => setDetailOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  <HStack>
                    <CalendarBlank size={20} />
                    <Text>{selectedDate ? format(selectedDate, "EEEE, d MMMM yyyy", { locale: idLocale }) : ""}</Text>
                  </HStack>
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {selectedDate && getEventsForDate(selectedDate).length === 0 ? (
                  <Text color="gray.500" py={4}>No events on this day</Text>
                ) : (
                  <VStack gap={3} align="stretch">
                    {selectedDate && getEventsForDate(selectedDate).map((ev) => (
                      <Card.Root
                        key={ev.id}
                        size="sm"
                        bg="white"
                        border="1px solid"
                        borderColor="border"
                      >
                        <Card.Body py={3}>
                          <HStack justify="space-between">
                            <VStack align="start" gap={1} cursor="pointer" flex={1} onClick={() => { setDetailOpen(false); navigate(`/leads/${ev.lead_id}`); }}>
                              <Text fontWeight="bold" fontSize="sm">{ev.title}</Text>
                              <HStack gap={2}>
                                <Badge colorPalette={TYPE_COLORS[ev.type] || "gray"} size="sm">
                                  {TYPE_LABELS[ev.type] || ev.type}
                                </Badge>
                                {ev.time && (
                                  <Badge colorPalette="purple" size="sm">
                                    {ev.time}
                                  </Badge>
                                )}
                                {ev.is_completed !== undefined && (
                                  <Badge colorPalette={ev.is_completed ? "green" : "orange"} size="sm">
                                    {ev.is_completed ? "Done" : "Pending"}
                                  </Badge>
                                )}
                              </HStack>
                            </VStack>
                            {ev.type !== "NEW_LEAD" && (
                              <Button
                                size="xs"
                                variant="ghost"
                                colorPalette="red"
                                onClick={(e) => handleCancel(ev, e)}
                                title="Cancel schedule"
                              >
                                <X size={14} />
                              </Button>
                            )}
                          </HStack>
                        </Card.Body>
                      </Card.Root>
                    ))}
                  </VStack>
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <Button variant="outline" size="sm">Close</Button>
                </Dialog.CloseTrigger>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
