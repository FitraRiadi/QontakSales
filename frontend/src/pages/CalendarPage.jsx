import { useState, useEffect, useCallback, useMemo } from "react";
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
import { CaretLeft, CaretRight, CalendarBlank, X, SquaresFour, List } from "@phosphor-icons/react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  getYear,
  getMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import api from "@/services/api";

const toaster = createToaster({ placement: "top-end" });

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DAYS_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TYPE_LABELS = {
  FOLLOW_UP: "Follow Up",
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  NOTE: "Note",
  DEAL: "Deal",
};

const TYPE_COLORS = {
  FOLLOW_UP: "green",
  CALL: "blue",
  EMAIL: "purple",
  MEETING: "yellow",
  NOTE: "gray",
  DEAL: "blue",
};

const MONTHS_ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function MiniCalendar({ year, month, events, onSelect }) {
  const monthDate = new Date(year, month, 1);
  const mStart = startOfMonth(monthDate);
  const mEnd = endOfMonth(monthDate);
  const calStart = startOfWeek(mStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(mEnd, { weekStartsOn: 0 });

  const days = [];
  let d = calStart;
  while (d <= calEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const getEventsCount = (date) => {
    return events.filter((e) => isSameDay(parseISO(e.date), date)).length;
  };

  const hasEvents = (date) => getEventsCount(date) > 0;

  return (
    <Card.Root
      size="sm"
      bg="white"
      border="1px solid"
      borderColor="border"
      cursor="pointer"
      _hover={{ borderColor: "primary", transform: "translateY(-2px)" }}
      transition="all 150ms ease"
      onClick={() => onSelect(new Date(year, month, 1))}
    >
      <Card.Body p={2}>
        <Text textAlign="center" fontWeight="semibold" fontSize="xs" color="primary" mb={1}>
          {MONTH_NAMES[month]}
        </Text>
        <HStack mb={1} justify="center">
          {DAYS.map((d) => (
            <Box key={d} w="20px" textAlign="center" fontSize="9px" fontWeight="bold" color="gray.400">
              {d}
            </Box>
          ))}
        </HStack>
        <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap="1px">
          {days.map((day, i) => {
            const inMonth = isSameMonth(day, monthDate);
            const today = isToday(day);
            const eventsOnDay = getEventsCount(day);
            return (
              <Box
                key={i}
                w="20px"
                h="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="9px"
                borderRadius="full"
                bg={today ? "primary" : "transparent"}
                color={today ? "white" : inMonth ? "gray.700" : "gray.300"}
                fontWeight={today ? "bold" : "normal"}
                position="relative"
              >
                {format(day, "d")}
                {eventsOnDay > 0 && (
                  <Box
                    position="absolute"
                    bottom="0px"
                    w="4px"
                    h="4px"
                    borderRadius="full"
                    bg={eventsOnDay > 2 ? "red.500" : "primary"}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Card.Body>
    </Card.Root>
  );
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterType, setFilterType] = useState("ALL");
  const [viewMode, setViewMode] = useState("month");
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [decadeStart, setDecadeStart] = useState(() => Math.floor(new Date().getFullYear() / 10) * 10);

  const fetchMonthEvents = useCallback(() => {
    setLoading(true);
    const start = format(startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }), "yyyy-MM-dd");
    const end = format(endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }), "yyyy-MM-dd");
    api.get("/calendar/events/", { params: { start, end } })
      .then((r) => { setEvents(r.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [currentDate]);

  const fetchYearEvents = useCallback(() => {
    setLoading(true);
    const year = getYear(currentDate);
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    api.get("/calendar/events/", { params: { start, end } })
      .then((r) => { setEvents(r.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [currentDate]);

  useEffect(() => {
    if (viewMode === "month") fetchMonthEvents();
    else fetchYearEvents();
  }, [viewMode, fetchMonthEvents, fetchYearEvents]);

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

  const handleMonthSelect = (date) => {
    setCurrentDate(date);
    setViewMode("month");
  };

  const handleCancel = async (ev, e) => {
    e.stopPropagation();
    try {
      if (ev.type === "DEAL") return;
      if (ev.id.startsWith("activity-")) {
        const activityId = ev.id.replace("activity-", "");
        await api.post(`/activities/${activityId}/cancel/`);
      }
      toaster.create({ title: "Schedule cancelled", type: "success" });
      if (viewMode === "month") fetchMonthEvents();
      else fetchYearEvents();
    } catch {
      toaster.create({ title: "Failed to cancel", type: "error" });
    }
  };

  const year = getYear(currentDate);

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg" color="foreground">Calendar</Heading>
        <Button
          size="sm"
          variant="outline"
          leftIcon={viewMode === "month" ? <SquaresFour size={16} /> : <List size={16} />}
          onClick={() => setViewMode(viewMode === "month" ? "year" : "month")}
        >
          {viewMode === "month" ? "Year View" : "Month View"}
        </Button>
      </HStack>

      <Card.Root bg="white" border="1px solid" borderColor="border">
        <Card.Body>
          {viewMode === "month" ? (
            <>
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
                  { value: "DEAL", label: "Deal" },
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
                    {DAYS_FULL.map((d) => (
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
                                onClick={(e) => { e.stopPropagation(); navigate(`/deals/${ev.deal_id}`); }}
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
            </>
          ) : (
            <>
              <HStack justify="space-between" mb={4}>
                <Button size="sm" variant="outline" onClick={() => setCurrentDate(subYears(currentDate, 1))}>
                  <CaretLeft size={16} />
                </Button>
                <Button
                  size="md"
                  variant="ghost"
                  fontWeight="bold"
                  fontSize="md"
                  color="foreground"
                  onClick={() => { setDecadeStart(Math.floor(year / 10) * 10); setYearPickerOpen(true); }}
                  _hover={{ bg: "gray.100" }}
                >
                  {year}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCurrentDate(addYears(currentDate, 1))}>
                  <CaretRight size={16} />
                </Button>
              </HStack>

              {loading ? (
                <Box display="flex" justifyContent="center" py={10}><Spinner size="lg" color="primary" /></Box>
              ) : (
                <Box display="grid" gridTemplateColumns="repeat(5, 1fr)" gap={3} overflowX="auto" pb={4}>
                  {MONTHS_ALL.map((mi) => (
                    <Box key={mi} minW="150px">
                      <MiniCalendar
                        year={year}
                        month={mi}
                        events={events}
                        onSelect={handleMonthSelect}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </>
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
                            <VStack align="start" gap={1} cursor="pointer" flex={1} onClick={() => { setDetailOpen(false); navigate(`/deals/${ev.deal_id}`); }}>
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
                            {ev.type !== "DEAL" && (
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

      <Dialog.Root open={yearPickerOpen} onOpenChange={(e) => setYearPickerOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="320px">
              <Dialog.Header>
                <Dialog.Title>
                  <HStack justify="space-between" w="full">
                    <Button size="xs" variant="ghost" onClick={() => setDecadeStart(decadeStart - 10)}>
                      <CaretLeft size={14} />
                    </Button>
                    <Text fontWeight="bold">{decadeStart}s</Text>
                    <Button size="xs" variant="ghost" onClick={() => setDecadeStart(decadeStart + 10)}>
                      <CaretRight size={14} />
                    </Button>
                  </HStack>
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                    const y = decadeStart + i;
                    const isActive = y === year;
                    return (
                      <Button
                        key={y}
                        size="sm"
                        variant={isActive ? "solid" : "outline"}
                        bg={isActive ? "primary" : "transparent"}
                        color={isActive ? "white" : "gray.700"}
                        fontWeight={isActive ? "bold" : "normal"}
                        onClick={() => {
                          setCurrentDate(new Date(y, getMonth(currentDate), 1));
                          setYearPickerOpen(false);
                        }}
                      >
                        {y}
                      </Button>
                    );
                  })}
                </Box>
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
