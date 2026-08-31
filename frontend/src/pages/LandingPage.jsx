import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  ChartLineUp,
  Users,
  Kanban,
  ShieldCheck,
  Lightning,
  DeviceMobile,
  ArrowRight,
  CheckCircle,
  Star,
  ChatCircleText,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import brandLogo from "@/assets/brand.png";
import heroImg from "@/assets/heroImg.png";

const features = [
  { icon: Kanban, title: "Sales Pipeline", desc: "Visual Kanban board to track every deal from first contact to closed won." },
  { icon: ChartLineUp, title: "Real-time Analytics", desc: "Dashboards with charts showing revenue, win rate, and agent performance." },
  { icon: Users, title: "Lead Management", desc: "Organize, tag, and filter prospects with Hot/Cold temperature indicators." },
  { icon: ShieldCheck, title: "Secure & Multi-tenant", desc: "JWT authentication with company-level data isolation for every team." },
  { icon: Lightning, title: "Activity Tracking", desc: "Chronological activity logs for every lead interaction, nothing lost." },
  { icon: DeviceMobile, title: "Responsive Design", desc: "Full mobile and desktop support — manage deals from anywhere." },
];

const stats = [
  { value: "10K+", label: "Deals Managed" },
  { value: "500+", label: "Sales Teams" },
  { value: "68%", label: "Win Rate" },
  { value: "99.9%", label: "Uptime" },
];

const testimonials = [
  { name: "Rina Sari", role: "Sales Director, PT Maju Jaya", text: "QontakSales transformed how our team tracks leads. We closed 30% more deals in the first quarter.", rating: 5, company: "PT Maju Jaya" },
  { name: "Budi Hartono", role: "Founder, Berkah Abadi", text: "The pipeline view is incredibly intuitive. My team adopted it on day one with zero training.", rating: 5, company: "Berkah Abadi" },
  { name: "Dewi Lestari", role: "Ops Manager, Global Mandiri", text: "Finally a CRM that doesn't feel like a spreadsheet. The analytics alone are worth the switch.", rating: 5, company: "Global Mandiri" },
  { name: "Ahmad Rizki", role: "Sales Lead, Sejahtera Corp", text: "We switched from spreadsheets to QontakSales and never looked back. Game changer.", rating: 5, company: "Sejahtera Corp" },
  { name: "Siti Nurhaliza", role: "Manager, Berkah Group", text: "The activity logs alone save us hours every week. Highly recommend for any sales team.", rating: 5, company: "Berkah Group" },
  { name: "Eko Prasetyo", role: "Director, Prima Sejahtera", text: "QontakSales helped us unify our sales process across 3 regions. Outstanding platform.", rating: 5, company: "Prima Sejahtera" },
];

const logos = [
  { name: "PT Maju Jaya", color: "#2563EB" },
  { name: "Berkah Abadi", color: "#059669" },
  { name: "Global Mandiri", color: "#8B5CF6" },
  { name: "Sejahtera Corp", color: "#F59E0B" },
  { name: "Sumber Rejeki", color: "#DC2626" },
  { name: "Putra Jaya", color: "#3B82F6" },
  { name: "Berkah Group", color: "#10B981" },
  { name: "Prima Sejahtera", color: "#6366F1" },
];

const plans = [
  { name: "Starter", price: "Free", period: "forever", features: ["Up to 100 leads", "1 sales agent", "Basic pipeline", "Email support"], cta: "Get Started", highlighted: false },
  { name: "Professional", price: "Rp 299K", period: "/month", features: ["Unlimited leads", "10 sales agents", "Advanced analytics", "Priority support", "Custom tags"], cta: "Start Free Trial", highlighted: true },
  { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited everything", "Unlimited agents", "API access", "Dedicated support", "Custom integrations"], cta: "Contact Sales", highlighted: false },
];

const faqs = [
  { q: "What is QontakSales?", a: "QontakSales is a modern Sales CRM designed for teams to manage leads, track pipelines, and boost revenue — all in one place. It features real-time analytics, Kanban pipeline, WhatsApp broadcast, and role-based access." },
  { q: "Is QontakSales free to use?", a: "Yes! QontakSales offers a free Starter plan with up to 100 leads and 1 sales agent. No credit card required. You can upgrade to Professional or Enterprise for more features." },
  { q: "Can I send WhatsApp messages to my leads?", a: "Absolutely. QontakSales has a built-in WhatsApp Broadcast feature powered by Fonnte API. You can send personalized messages using templates with variables like {name}, {company}, and {value}." },
  { q: "What is the difference between Manager and Agent roles?", a: "Managers have full access to all features including agent management, all leads, and broadcast history. Agents can only access their own assigned leads and broadcasts." },
  { q: "Can I archive leads instead of deleting them?", a: "Yes. QontakSales supports soft-delete via the Archive feature. Archived leads are hidden from the main Leads list, Pipeline, and Dashboard statistics, but can be restored anytime." },
  { q: "Does QontakSales support multiple companies?", a: "Yes. Each company has its own isolated data. Users are assigned to a company and can only see data within their organization." },
  { q: "How does the Pipeline feature work?", a: "The Pipeline is a Kanban-style board with 5 stages: Prospek Baru, Hubungi, Negosiasi, Won, and Lost. You can drag-and-drop leads between stages to track deal progress visually." },
  { q: "Is my data secure?", a: "Yes. QontakSales uses JWT authentication, company-level data isolation, and HTTPS encryption. Your data is stored securely in PostgreSQL and is never shared with third parties." },
];

function InfiniteCarousel() {
  const [paused, setPaused] = useState(false);

  const keyframeStyle = `
    @keyframes scroll-logos {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;

  return (
    <Box overflow="hidden" py={8}>
      <style>{keyframeStyle}</style>
      <Box
        display="flex"
        gap={8}
        style={{
          animation: `scroll-logos 30s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          width: "max-content",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {[...logos, ...logos, ...logos].map((logo, i) => (
          <Box
            key={i}
            minW="200px"
            h="80px"
            bg="white"
            border="1px solid"
            borderColor="border"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            _hover={{ borderColor: "primary", shadow: "md" }}
            transition="all 200ms ease"
          >
            <HStack gap={3}>
              <Box w={10} h={10} borderRadius="md" bg={logo.color} color="white" display="flex" alignItems="center" justifyContent="center" fontWeight="bold" fontSize="md">
                {logo.name[0]}
              </Box>
              <Text fontWeight="semibold" fontSize="sm" color="foreground">{logo.name}</Text>
            </HStack>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <Box w="full" bg="background" borderRadius="xl" border="1px solid" borderColor="border" overflow="hidden" _hover={{ borderColor: "primary" }} transition="all 200ms ease">
      <HStack justify="space-between" p={5} cursor="pointer" onClick={() => setOpen(!open)}>
        <Text fontWeight="semibold" color="foreground" flex={1}>{question}</Text>
        <Icon color="foreground" opacity={0.5}>{open ? <CaretUp size={18} /> : <CaretDown size={18} />}</Icon>
      </HStack>
      {open && (
        <Box px={5} pb={5}>
          <Text color="foreground" opacity={0.6} fontSize="sm" lineHeight="tall">{answer}</Text>
        </Box>
      )}
    </Box>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box bg="background">
      {/* Navbar */}
      <Box as="nav" position="sticky" top={0} zIndex={10} bg="white/80" backdropFilter="blur(12px)" borderBottom="1px solid" borderColor="border">
        <Container maxW="7xl" py={4}>
          <HStack justify="space-between">
            <Box as="img" src={brandLogo} h="36px" alt="QontakSales" />
            <HStack gap={3}>
              <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
              <Button bg="primary" color="white" onClick={() => navigate("/register")} _hover={{ bg: "secondary" }} px={6}>Get Started Free</Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* Hero */}
      <Box py={{ base: 12, md: 20 }} bg="white">
        <Container maxW="7xl">
          <Stack direction={{ base: "column", md: "row" }} gap={12} align="center">
            <VStack align="start" gap={6} flex={1}>
              <Box bg="primary/10" color="primary" px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="medium">
                #1 Sales CRM for Teams
              </Box>
              <Heading size={{ base: "2xl", md: "3xl" }} color="foreground" lineHeight="shorter">
                Close More Deals,<br />
                <Text as="span" bgGradient="to-r" gradientFrom="primary" gradientTo="stageContacted" bgClip="text">Faster.</Text>
              </Heading>
              <Text fontSize="lg" color="foreground" opacity={0.7} maxW="lg">
                The modern Sales CRM that helps teams manage leads, track pipelines,
                and boost revenue — all in one place.
              </Text>
              <HStack gap={4}>
                <Button size="lg" bg="primary" color="white" onClick={() => navigate("/register")} _hover={{ bg: "secondary", transform: "translateY(-1px)" }} transition="all 200ms ease" px={8}>
                  Start Free <Icon ml={1}><ArrowRight size={18} /></Icon>
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                  See Demo
                </Button>
              </HStack>
              <HStack gap={6} mt={2} wrap="wrap">
                {["Free to start", "No credit card", "Setup in 2 min"].map((t) => (
                  <HStack key={t}><Icon color="accent"><CheckCircle size={16} /></Icon><Text fontSize="sm">{t}</Text></HStack>
                ))}
              </HStack>
            </VStack>
            <Box flex={1} position="relative">
              <Box bg="gradient-to-br from-primary/5 to-stageContacted/10" borderRadius="2xl" p={8} minH="360px" border="1px solid" borderColor="border" display="flex" alignItems="center" justifyContent="center">
                <Box as="img" src={heroImg} maxH="340px" alt="Sales Dashboard" />
              </Box>
              <Box position="absolute" top={-4} right={-4} bg="white" p={3} borderRadius="lg" shadow="lg" border="1px solid" borderColor="border">
                <HStack gap={2}><CheckCircle size={16} color="var(--color-accent)" /><Text fontSize="xs" fontWeight="medium">Deal Won!</Text></HStack>
              </Box>
              <Box position="absolute" bottom={-4} left={-4} bg="white" p={3} borderRadius="lg" shadow="lg" border="1px solid" borderColor="border">
                <HStack gap={2}><Users size={16} color="var(--color-primary)" /><Text fontSize="xs" fontWeight="medium">+12 New Leads</Text></HStack>
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Logo Carousel */}
      <Box bg="background" py={4}>
        <Container maxW="7xl">
          <Text textAlign="center" fontSize="sm" color="foreground" opacity={0.5} mb={4}>Trusted by leading companies</Text>
        </Container>
        <InfiniteCarousel />
      </Box>

      {/* Stats */}
      <Box py={12} bg="primary">
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={8}>
            {stats.map((s) => (
              <VStack key={s.label} color="white">
                <Heading size="2xl">{s.value}</Heading>
                <Text opacity={0.8}>{s.label}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features */}
      <Box py={20}>
        <Container maxW="7xl">
          <VStack gap={4} mb={12} textAlign="center">
            <Box bg="primary/10" color="primary" px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="medium">Features</Box>
            <Heading size="xl" color="foreground">Everything You Need</Heading>
            <Text color="foreground" opacity={0.6} maxW="lg">Built for sales teams who want to focus on closing, not data entry.</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {features.map((f) => {
              const IconComp = f.icon;
              return (
                <Box key={f.title} p={6} bg="white" borderRadius="xl" border="1px solid" borderColor="border" _hover={{ borderColor: "primary", transform: "translateY(-4px)", shadow: "lg" }} transition="all 200ms ease">
                  <Box w={12} h={12} borderRadius="lg" bg="primary/10" display="flex" alignItems="center" justifyContent="center" mb={4}>
                    <Icon size={24} color="primary"><IconComp /></Icon>
                  </Box>
                  <Heading size="md" mb={2} color="foreground">{f.title}</Heading>
                  <Text color="foreground" opacity={0.6} fontSize="sm">{f.desc}</Text>
                </Box>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box py={20} bg="white">
        <Container maxW="7xl">
          <VStack gap={4} mb={12} textAlign="center">
            <Box bg="primary/10" color="primary" px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="medium">Testimonials</Box>
            <Heading size="xl" color="foreground">Loved by Sales Teams</Heading>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {testimonials.map((t) => (
              <Box key={t.name} p={6} bg="background" borderRadius="xl" border="1px solid" borderColor="border" _hover={{ shadow: "md" }} transition="all 200ms ease">
                <Icon size={24} color="primary/30" mb={3}><ChatCircleText /></Icon>
                <HStack mb={3} gap={1}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Icon key={i} color="stageContacted"><Star size={14} weight="fill" /></Icon>
                  ))}
                </HStack>
                <Text color="foreground" fontSize="sm" mb={4} lineHeight="tall">"{t.text}"</Text>
                <HStack>
                  <Box w={10} h={10} borderRadius="full" bg="primary" color="white" display="flex" alignItems="center" justifyContent="center" fontSize="sm" fontWeight="bold">
                    {t.name[0]}
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text fontWeight="semibold" fontSize="sm">{t.name}</Text>
                    <Text fontSize="xs" color="foreground" opacity={0.5}>{t.role}</Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Pricing */}
      <Box py={20}>
        <Container maxW="7xl">
          <VStack gap={4} mb={12} textAlign="center">
            <Box bg="primary/10" color="primary" px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="medium">Pricing</Box>
            <Heading size="xl" color="foreground">Simple Pricing</Heading>
            <Text color="foreground" opacity={0.6}>Start free. Upgrade when you're ready.</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
            {plans.map((p) => (
              <Box key={p.name} p={8} bg="white" borderRadius="2xl" border="2px solid" borderColor={p.highlighted ? "primary" : "border"} position="relative" _hover={{ transform: "translateY(-4px)", shadow: "xl" }} transition="all 200ms ease">
                {p.highlighted && <Box position="absolute" top={-3} left="50%" transform="translateX(-50%)" bg="primary" color="white" px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="bold">Most Popular</Box>}
                <Heading size="md" mb={2}>{p.name}</Heading>
                <HStack baseline gap={1} mb={6}>
                  <Heading size="2xl" color={p.highlighted ? "primary" : "foreground"}>{p.price}</Heading>
                  <Text color="foreground" opacity={0.5}>{p.period}</Text>
                </HStack>
                <VStack align="start" gap={3} mb={8}>
                  {p.features.map((f) => (
                    <HStack key={f} gap={2}><Icon color="accent"><CheckCircle size={16} /></Icon><Text fontSize="sm">{f}</Text></HStack>
                  ))}
                </VStack>
                <Button w="full" bg={p.highlighted ? "primary" : "transparent"} color={p.highlighted ? "white" : "foreground"} border={p.highlighted ? "none" : "1px solid"} borderColor="border" onClick={() => navigate("/register")} _hover={{ bg: p.highlighted ? "secondary" : "muted" }} size="lg">
                  {p.cta}
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* FAQ */}
      <Box py={20} bg="white">
        <Container maxW="3xl">
          <VStack gap={4} mb={12} textAlign="center">
            <Box bg="primary/10" color="primary" px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="medium">FAQ</Box>
            <Heading size="xl" color="foreground">Frequently Asked Questions</Heading>
            <Text color="foreground" opacity={0.6}>Everything you need to know about QontakSales.</Text>
          </VStack>
          <VStack gap={4}>
            {faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </VStack>
        </Container>
      </Box>

      {/* CTA */}
      <Box py={20} bg="primary" color="white">
        <Container maxW="3xl" textAlign="center">
          <VStack gap={6}>
            <Heading size="xl">Ready to Boost Your Sales?</Heading>
            <Text opacity={0.8} fontSize="lg">Join hundreds of teams already closing more deals with QontakSales.</Text>
            <Button size="lg" bg="white" color="primary" onClick={() => navigate("/register")} _hover={{ bg: "muted", transform: "translateY(-1px)" }} px={8}>
              Get Started Free <Icon ml={1}><ArrowRight size={18} /></Icon>
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={12} bg="white" borderTop="1px solid" borderColor="border">
        <Container maxW="7xl">
          <Stack direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={4}>
            <HStack gap={3}>
              <Box as="img" src={brandLogo} h="28px" alt="QontakSales" />
            </HStack>
            <HStack gap={6}>
              {["Privacy", "Terms", "Contact"].map((t) => (
                <Text key={t} fontSize="sm" color="foreground" opacity={0.5} cursor="pointer" _hover={{ opacity: 1 }}>{t}</Text>
              ))}
            </HStack>
            <Text fontSize="sm" color="foreground" opacity={0.4}>© 2026 QontakSales. All rights reserved.</Text>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
