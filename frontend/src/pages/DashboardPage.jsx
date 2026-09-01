import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { TrendUp, Users, CurrencyDollar, Trophy, Export } from "@phosphor-icons/react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "@/services/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/stats/").then((r) => {
      setStats(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" color="primary" /></Box>;
  if (!stats) return <Text>Failed to load dashboard</Text>;

  const handleExport = async () => {
    try {
      const res = await api.get("/dashboard/export/", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      console.error("Export failed");
    }
  };

  const metrics = [
    { label: "Total Revenue", value: `Rp ${(stats.total_revenue / 1000000).toFixed(1)}M`, icon: CurrencyDollar, color: "stageWon" },
    { label: "Win Rate", value: `${stats.win_rate}%`, icon: Trophy, color: "primary" },
    { label: "Active Leads", value: stats.active_leads, icon: Users, color: "stageContacted" },
    { label: "Total Leads", value: stats.total_leads, icon: TrendUp, color: "stageNegotiation" },
  ];

  const barData = {
    labels: stats.monthly_revenue.map((m) => m.month),
    datasets: [{
      label: "Revenue (Rp)",
      data: stats.monthly_revenue.map((m) => m.revenue),
      backgroundColor: "#2563EB",
      borderRadius: 6,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v) => `Rp ${(v / 1000000).toFixed(0)}M` } } },
  };

  const donutData = {
    labels: stats.stage_distribution.map((s) => s.stage),
    datasets: [{
      data: stats.stage_distribution.map((s) => s.count),
      backgroundColor: ["#3B82F6", "#F59E0B", "#8B5CF6", "#059669", "#DC2626"],
      borderWidth: 0,
    }],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { padding: 16 } } },
    cutout: "65%",
  };

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg" color="foreground">Dashboard</Heading>
        <Button bg="accent" color="white" size="sm" onClick={handleExport} _hover={{ bg: "accent", opacity: 0.9 }}>
          <Export size={16} /> Export Excel
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card.Root key={m.label} bg="white" border="1px solid" borderColor="border">
              <Card.Body>
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <Text fontSize="sm" color="foreground" opacity={0.6}>{m.label}</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="foreground">{m.value}</Text>
                  </VStack>
                  <Box p={3} borderRadius="md" bg={`${m.color}10`}>
                    <Icon size={24} color={`var(--color-${m.color})`} />
                  </Box>
                </HStack>
              </Card.Body>
            </Card.Root>
          );
        })}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        <Card.Root bg="white" border="1px solid" borderColor="border">
          <Card.Header><Heading size="md">Monthly Revenue</Heading></Card.Header>
          <Card.Body><Box h="300px"><Bar data={barData} options={barOptions} /></Box></Card.Body>
        </Card.Root>
        <Card.Root bg="white" border="1px solid" borderColor="border">
          <Card.Header><Heading size="md">Pipeline Distribution</Heading></Card.Header>
          <Card.Body><Box h="300px"><Doughnut data={donutData} options={donutOptions} /></Box></Card.Body>
        </Card.Root>
      </SimpleGrid>

      <Card.Root bg="white" border="1px solid" borderColor="border">
        <Card.Header>
          <HStack justify="space-between">
            <Heading size="md">Agent Leaderboard</Heading>
            <Trophy size={20} color="primary" />
          </HStack>
        </Card.Header>
        <Card.Body>
          {stats.leaderboard.length === 0 ? (
            <Text color="foreground" opacity={0.5}>No agents yet. Add team members from Settings.</Text>
          ) : (
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Rank</Table.ColumnHeader>
                  <Table.ColumnHeader>Agent</Table.ColumnHeader>
                  <Table.ColumnHeader>Deals Won</Table.ColumnHeader>
                  <Table.ColumnHeader>Revenue</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {stats.leaderboard.map((a, i) => (
                  <Table.Row key={i}>
                    <Table.Cell><Text fontWeight="bold" color={i < 3 ? "stageContacted" : "foreground"}>#{i + 1}</Text></Table.Cell>
                    <Table.Cell fontWeight="medium">{a.name}</Table.Cell>
                    <Table.Cell>{a.deals}</Table.Cell>
                    <Table.Cell fontWeight="medium">Rp {(a.revenue / 1000000).toFixed(1)}M</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}
