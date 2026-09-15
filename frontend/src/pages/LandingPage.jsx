import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
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
  CalendarBlank,
  Clock,
  ListChecks,
} from "@phosphor-icons/react";
import brandLogo from "@/assets/brand.png";
import dashboardPreviewLaptop from "@/assets/dashboard-preview-laptop.png";
import trustedHighlightBg from "@/assets/trusted-highligh-bg.png";
import logo1 from "@/assets/trustedcompany/0e2be920-70a4-4334-9194-d324196ab501-removebg-preview.png";
import logo2 from "@/assets/trustedcompany/10a3dc54-3e31-43bf-8d67-5e51e35d192c-removebg-preview.png";
import logo3 from "@/assets/trustedcompany/5c2bf62a-3fc0-4292-a9b9-903fe4f28ea9-removebg-preview.png";
import logo4 from "@/assets/trustedcompany/78c43690-9816-421b-9bee-772f3fe017c0-removebg-preview.png";
import logo5 from "@/assets/trustedcompany/97437919-bdb2-48b4-bcda-e1f7762d50f0-removebg-preview.png";
import logo6 from "@/assets/trustedcompany/a36e9a95-dea2-4741-aa56-9e5544b09bc5-removebg-preview.png";
import logo7 from "@/assets/trustedcompany/c3ffdca2-4009-4748-bb32-76dbcbe7211f-removebg-preview.png";
import logo8 from "@/assets/trustedcompany/ff518a49-2055-490e-b6d3-7eb38504e8ce-removebg-preview.png";
import faqIllustration from "@/assets/FAQ-ilustration.png";
import dashboardHighlight from "@/assets/dashboard-highlight.png";
import calendarVideo from "@/assets/calendar-higlight-video.webm";
import pipelineVideo from "@/assets/pipiline-highlight-video.webm";
import Stepper, { Step } from "@/components/ui/Stepper";
import ctaImg from "@/assets/cta.jpg";

const features = [
  {
    icon: Kanban,
    title: "Visual Sales Pipeline",
    desc: "Track every deal seamlessly with an intuitive Kanban board. Drag and drop leads across customized stages from initial inquiry to final contract signing.",
  },
  {
    icon: ChartLineUp,
    title: "Real-time Analytics & Dashboards",
    desc: "Make data-driven decisions with dynamic charts. Monitor monthly revenue forecasts, team win rates, pipeline distribution, and top-performing sales agents.",
  },
  {
    icon: Users,
    title: "Advanced Lead Management",
    desc: "Organize, tag, and segment prospects effortlesly. Utilize Hot/Cold temperature indicators and custom filters to prioritize high-value leads and boost conversion.",
  },
  {
    icon: ShieldCheck,
    title: "Multi-tenant & Enterprise Security",
    desc: "Built with JWT authentication and strict company-level data isolation, ensuring your sensitive business data stays completely secure and private.",
  },
  {
    icon: Lightning,
    title: "Chronological Activity Tracking",
    desc: "Log every touchpoint with your leads. From phone calls and meeting notes to email updates, maintain a complete timeline of customer interactions.",
  },
  {
    icon: DeviceMobile,
    title: "Seamless Cross-Device Experience",
    desc: "Designed for modern remote teams. Enjoy full functionality and smooth user experience whether you are on a desktop workstation or a mobile device.",
  },
];

const stats = [
  { value: "10K+", label: "Deals Managed" },
  { value: "500+", label: "Sales Teams" },
  { value: "68%", label: "Win Rate" },
  { value: "99.9%", label: "Uptime" },
];

const testimonials = [
  { name: "Rina Sari", role: "Sales Director, PT Maju Jaya", text: "QontakSales transformed how our team tracks leads. We closed 30% more deals in the first quarter.", rating: 5 },
  { name: "Budi Hartono", role: "Founder, Berkah Abadi", text: "The pipeline view is incredibly intuitive. My team adopted it on day one with zero training.", rating: 5 },
  { name: "Dewi Lestari", role: "Ops Manager, Global Mandiri", text: "Finally a CRM that doesn't feel like a spreadsheet. The analytics alone are worth the switch.", rating: 5 },
  { name: "Ahmad Rizki", role: "Sales Lead, Sejahtera Corp", text: "We switched from spreadsheets to QontakSales and never looked back. Game changer.", rating: 5 },
  { name: "Siti Nurhaliza", role: "Manager, Berkah Group", text: "The activity logs alone save us hours every week. Highly recommend for any sales team.", rating: 5 },
  { name: "Eko Prasetyo", role: "Director, Prima Sejahtera", text: "QontakSales helped us unify our sales process across 3 regions. Outstanding platform.", rating: 5 },
];

const logos = [logo1, logo2, logo3, logo4, logo5, logo6, logo7, logo8];

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for solo sales reps getting started with CRM.",
    features: ["Up to 100 leads", "1 sales agent", "Basic pipeline", "Email support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "Rp 299K",
    period: "/month",
    description: "For growing teams that need more power and insights.",
    features: ["Unlimited leads", "10 sales agents", "Advanced analytics", "Priority support", "Custom tags"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored for large organizations with custom needs.",
    features: ["Unlimited everything", "Unlimited agents", "API access", "Dedicated support", "Custom integrations"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const faqs = [
  { q: "What is QontakSales?", a: "QontakSales is a modern Sales CRM designed for teams to manage leads, track pipelines, and boost revenue — all in one place. It features real-time analytics, Kanban pipeline, WhatsApp broadcast, and role-based access." },
  { q: "Is QontakSales free to use?", a: "Yes! QontakSales offers a free Starter plan with up to 100 leads and 1 sales agent. No credit card required. You can upgrade to Professional or Enterprise for more features." },
  { q: "Can I send WhatsApp messages to my leads?", a: "Absolutely. QontakSales has a built-in WhatsApp Broadcast feature powered by Fonnte API. You can send personalized messages using templates with variables like {name}, {company}, and {value}." },
  { q: "What is the difference between Manager and Agent roles?", a: "Managers have full access to all features including agent management, all leads, and broadcast history. Agents can only access their own assigned leads and broadcasts." },
  { q: "Can I archive leads instead of deleting them?", a: "Yes. QontakSales supports soft-delete via the Archive feature. Archived leads are hidden from the main Leads list, Pipeline, and Dashboard statistics, but can be restored anytime." },
  { q: "Does QontakSales support multiple companies?", a: "Yes. Each company has its own isolated data. Users are assigned to a company and can only see data within their organization." },
  { q: "How does the Pipeline feature work?", a: "The Pipeline is a Kanban-style board with stages: Qualification, Discovery, Proposal, Negotiation, Closing, Won, and Lost. You can drag-and-drop deals between stages to track progress visually." },
  { q: "Is my data secure?", a: "Yes. QontakSales uses JWT authentication, company-level data isolation, and HTTPS encryption. Your data is stored securely in PostgreSQL and is never shared with third parties." },
];

function InfiniteCarousel() {
  const [paused, setPaused] = useState(false);

  return (
    <Box overflow="hidden" py={8}>
      <style>{`
        @keyframes scroll-logos {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <Box
        display="flex"
        gap={12}
        style={{
          animation: `scroll-logos 25s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          width: "max-content",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {[...logos, ...logos, ...logos].map((src, i) => (
          <Box
            key={i}
            flexShrink={0}
            opacity={0.5}
            _hover={{ opacity: 1 }}
            transition="opacity 200ms"
          >
            <Box
              as="img"
              src={src}
              h="64px"
              alt="Company logo"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <Box
      w="full"
      borderBottom="1px solid"
      borderColor="border"
      overflow="hidden"
    >
      <HStack
        justify="space-between"
        py={5}
        px={1}
        cursor="pointer"
        onClick={() => setOpen(!open)}
        _hover={{ opacity: 0.7 }}
        transition="opacity 150ms"
      >
        <Text fontWeight="medium" color="foreground" flex={1} fontSize="md">
          {question}
        </Text>
        <Icon color="foreground" opacity={0.4}>
          {open ? <CaretUp size={16} /> : <CaretDown size={16} />}
        </Icon>
      </HStack>
      {open && (
        <Box px={1} pb={5}>
          <Text color="foreground" opacity={0.6} fontSize="md" lineHeight="relaxed">
            {answer}
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("Professional");

  return (
    <Box bg="background" minH="100vh">
      {/* Navbar */}
      <Box
        as="nav"
        position="sticky"
        top={0}
        zIndex={10}
        bg="background"
        borderBottom="1px solid"
        borderColor="border"
      >
        <Container maxW="full" px={{ base: 4, md: 8 }} py={3}>
          <HStack justify="space-between">
            <HStack gap={2}>
              <Box as="img" src={brandLogo} h="28px" alt="QontakSales" />
            </HStack>
            <HStack gap={2}>
              <Button
                variant="ghost"
                size="sm"
                color="foreground"
                opacity={0.6}
                _hover={{ opacity: 1 }}
                onClick={() => navigate("/login")}
              >
                Log in
              </Button>
              <Button
                size="sm"
                bg="primary"
                color="white"
                fontWeight="medium"
                onClick={() => navigate("/register")}
                _hover={{ opacity: 0.85 }}
                px={5}
              >
                Get Started
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* Hero */}
      <Box pt={{ base: 12, md: 16 }} pb={{ base: 12, md: 20 }} position="relative" overflow="hidden">
        <Box
          position="absolute"
          top={{ base: "-10%", md: "-20%" }}
          left="-5%"
          right="-5%"
          bottom="0"
          bgImage={`url(${trustedHighlightBg})`}
          bgSize="contain"
          bgRepeat="no-repeat"
          bgPosition="center top"
          opacity={0.50}
        />
        <Container maxW="6xl" position="relative" zIndex={1}>
          <Stack direction={{ base: "column", md: "row" }} align="center" gap={10}>
            <VStack flex={1} gap={6} textAlign={{ base: "center", md: "left" }}>
              <Heading
                fontWeight="bold"
                fontSize={{ base: "40px", md: "56px", lg: "64px" }}
                color="foreground"
                lineHeight="tight"
                letterSpacing="tight"
              >
                The Modern CRM            
                For Sales Teams
              </Heading>
              <Text
                fontSize="lg"
                color="foreground"
                opacity={0.6}
                lineHeight="relaxed"
              >
                Manage leads, track pipelines, and close more deals, all in one
                place. Built for teams who want results, not spreadsheets.
              </Text>
              <HStack gap={3}>
                <Button
                  size="md"
                  bg="primary"
                  color="white"
                  fontWeight="medium"
                  onClick={() => navigate("/register")}
                  _hover={{ opacity: 0.85 }}
                  px={6}
                >
                  Get Started Free
                </Button>
                <Button
                  size="md"
                  variant="subtle"
                  color="foreground"
                  onClick={() => navigate("/login")}
                  fontWeight="medium"
                  px={6}
                >
                  See Demo
                </Button>
              </HStack>
              <HStack gap={5} wrap="wrap" justify={{ base: "center", md: "start" }}>
                {["Free to start", "No credit card", "Setup in 2 min"].map(
                  (t) => (
                    <HStack key={t} gap={1.5}>
                      <Icon color="accent" size={14}>
                        <CheckCircle />
                      </Icon>
                      <Text fontSize="sm" opacity={0.6}>
                        {t}
                      </Text>
                    </HStack>
                  )
                )}
              </HStack>
            </VStack>

            <Box flex={1}>
              <Box
                as="img"
                src={dashboardPreviewLaptop}
                w="full"
                alt="QontakSales Dashboard"
                display="block"
              />
            </Box>
          </Stack>

          <SimpleGrid columns={{ base: 2, md: 4 }} gap={6} pt={10}>
            {stats.map((s) => (
              <VStack key={s.label} gap={1}>
                <Heading fontWeight="semibold" size="lg" color="foreground">
                  {s.value}
                </Heading>
                <Text fontSize="sm" color="foreground" opacity={0.5}>
                  {s.label}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Logo Carousel */}
      <Box pb={8}>
        <Container maxW="6xl">
          <Text
            textAlign="center"
            fontSize="sm"
            color="foreground"
            opacity={0.4}
            mb={2}
            fontWeight="medium"
          >
            Trusted by leading companies
          </Text>
        </Container>
        <InfiniteCarousel />
      </Box>

      {/* Product Highlights */}
      <Box py={20}>
        <Container maxW="6xl" display="flex" flexDirection="column" gap={20}>
          {/* Section Header */}
          <VStack gap={3} align="flex-start">
            <Heading
              fontWeight="bold"
              size="2xl"
              color="foreground"
              lineHeight="tight"
            >
              Powerful Tools, Simple Workflow
            </Heading>
            <Text color="foreground" opacity={0.5} maxW="2xl" lineHeight="relaxed">
              QontakSales gives your team a complete toolkit to manage
              leads, close deals faster, and stay organized. From
              drag-and-drop pipeline boards to activity scheduling and
              real-time analytics — every feature is designed to help
              your sales team focus on what matters most: closing revenue.
            </Text>
          </VStack>

          {/* Row 1: Text Left, Pipeline Right */}
          <Stack direction={{ base: "column", lg: "row" }} gap={12} align="center">
            <VStack flex={1} gap={6} textAlign={{ base: "center", lg: "left" }} align={{ base: "center", lg: "flex-start" }}>
              <VStack gap={3} align={{ base: "center", lg: "flex-start" }}>
                <Heading
                  fontWeight="bold"
                  size="xl"
                  color="foreground"
                  lineHeight="tight"
                >
                  Track Every Deal from Start to Close
                </Heading>
                <Text color="foreground" opacity={0.5} maxW="lg" lineHeight="relaxed">
                  Manage your entire sales process on a Kanban board with 7
                  customizable stages — from Qualification to Closed Won.
                  Drag deals forward, spot bottlenecks instantly, and never
                  lose track of what matters.
                </Text>
              </VStack>
              <HStack gap={8} wrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
                {[
                  { icon: Kanban, text: "Visual stages" },
                  { icon: ArrowRight, text: "Drag & drop" },
                  { icon: ChartLineUp, text: "Real-time tracking" },
                ].map((item) => (
                  <HStack key={item.text} gap={2}>
                    <Icon color="primary" size={16}>
                      <item.icon />
                    </Icon>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="foreground"
                      opacity={0.6}
                    >
                      {item.text}
                    </Text>
                  </HStack>
                ))}
              </HStack>
            </VStack>
            <Box
              flex={1}
              borderRadius="xl"
              overflow="hidden"
              border="1px solid"
              borderColor="border"
              shadow="md"
            >
              <video
                src={pipelineVideo}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: "100%", display: "block" }}
              />
            </Box>
          </Stack>

          {/* Row 2: Video Left, Text Right */}
          <Stack direction={{ base: "column", lg: "row" }} gap={12} align="center">
            <Box
              flex={1}
              borderRadius="xl"
              overflow="hidden"
              border="1px solid"
              borderColor="border"
              shadow="md"
              order={{ base: 1, lg: 0 }}
            >
              <video
                src={calendarVideo}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: "100%", display: "block" }}
              />
            </Box>
            <VStack flex={1} gap={6} textAlign={{ base: "center", lg: "left" }} align={{ base: "center", lg: "flex-start" }}>
              <VStack gap={3} align={{ base: "center", lg: "flex-start" }}>
                <Heading
                  fontWeight="bold"
                  size="xl"
                  color="foreground"
                  lineHeight="tight"
                >
                  Schedule & Track Every Activity
                </Heading>
                <Text color="foreground" opacity={0.5} maxW="lg" lineHeight="relaxed">
                  Schedule meetings, calls, and tasks directly from a deal.
                  Every activity is logged chronologically so your whole team
                  has full context — no more missed follow-ups or duplicate
                  outreach.
                </Text>
              </VStack>
              <HStack gap={8} wrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
                {[
                  { icon: CalendarBlank, text: "Smart scheduling" },
                  { icon: Clock, text: "Reminders & alerts" },
                  { icon: ListChecks, text: "Activity timeline" },
                ].map((item) => (
                  <HStack key={item.text} gap={2}>
                    <Icon color="primary" size={16}>
                      <item.icon />
                    </Icon>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="foreground"
                      opacity={0.6}
                    >
                      {item.text}
                    </Text>
                  </HStack>
                ))}
              </HStack>
            </VStack>
          </Stack>
        </Container>
      </Box>

      {/* How It Works */}
      <Box py={20}>
        <Container maxW="6xl">
          <VStack gap={3} mb={12} textAlign="center">
            <Heading
              fontWeight="bold"
              size="2xl"
              color="foreground"
              lineHeight="tight"
            >
              How QontakSales Works
            </Heading>
            <Text color="foreground" opacity={0.5} maxW="2xl">
              From first contact to closed deal — here's how QontakSales
              helps your team sell smarter.
            </Text>
          </VStack>
          <Stack direction={{ base: "column", lg: "row" }} gap={12} align="center">
            <Box flex={1} w="full">
              <Stepper
                initialStep={1}
                onStepChange={(step) => console.log(step)}
                onFinalStepCompleted={() => console.log("All steps completed!")}
                backButtonText="Previous"
                nextButtonText="Next"
              >
                <Step>
                  <h2 style={{ fontWeight: "bold", fontSize: "1.25rem", marginBottom: "0.5rem", color: "#0F172A" }}>
                    1. Add Your Leads
                  </h2>
                  <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: "0.95rem" }}>
                    Import contacts in bulk or add them one by one. Organize with
                    tags, temperature indicators (Hot/Cold), and custom filters to
                    prioritize your hottest prospects first.
                  </p>
                </Step>
                <Step>
                  <h2 style={{ fontWeight: "bold", fontSize: "1.25rem", marginBottom: "0.5rem", color: "#0F172A" }}>
                    2. Track Deals on the Pipeline
                  </h2>
                  <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: "0.95rem" }}>
                    Visualize your entire sales process on a Kanban board. Drag deals
                    across 7 stages — from Qualification to Closed Won — and spot
                    bottlenecks instantly.
                  </p>
                </Step>
                <Step>
                  <h2 style={{ fontWeight: "bold", fontSize: "1.25rem", marginBottom: "0.5rem", color: "#0F172A" }}>
                    3. Schedule & Log Activities
                  </h2>
                  <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: "0.95rem" }}>
                    Plan meetings, calls, and tasks tied directly to each deal. Every
                    touchpoint is logged chronologically so your whole team has full
                    context — no more missed follow-ups or duplicate outreach.
                  </p>
                </Step>
                <Step>
                  <h2 style={{ fontWeight: "bold", fontSize: "1.25rem", marginBottom: "0.5rem", color: "#0F172A" }}>
                    4. Monitor & Close
                  </h2>
                  <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: "0.95rem" }}>
                    Track performance with real-time dashboard analytics. Spot
                    bottlenecks, forecast revenue, and close more deals with
                    data-driven insights.
                  </p>
                </Step>
              </Stepper>
            </Box>
            <VStack flex={1} gap={6} align={{ base: "center", lg: "flex-start" }} textAlign={{ base: "center", lg: "left" }}>
              <Heading fontWeight="semibold" size="lg" color="foreground">
                Your Sales Process, Simplified
              </Heading>
              <Text color="foreground" opacity={0.5} lineHeight="relaxed">
                No complicated setup. No training required. Just 4 simple
                steps to transform how your team sells.
              </Text>
              <VStack gap={3} align={{ base: "center", lg: "flex-start" }}>
                {[
                  "Guided step-by-step onboarding",
                  "Works for teams of any size",
                  "Zero learning curve — start selling in minutes",
                ].map((point) => (
                  <HStack key={point} gap={2}>
                    <Icon color="primary" size={16} mt={0.5}>
                      <CheckCircle />
                    </Icon>
                    <Text fontSize="sm" color="foreground" opacity={0.6}>
                      {point}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Box py={20}>
        <Container maxW="6xl">
          <VStack gap={3} mb={12} textAlign="center">
            <Heading
              fontWeight="semibold"
              size="xl"
              color="foreground"
              lineHeight="tight"
            >
              Everything You Need
            </Heading>
            <Text color="foreground" opacity={0.5} maxW="lg">
              Built for sales teams who want to focus on closing, not data
              entry.
            </Text>
          </VStack>
          <Stack
            direction={{ base: "column", lg: "row" }}
            gap={8}
            align="stretch"
          >
            {/* Dashboard Image */}
            <Box
              flex={1}
              minH="400px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderColor="border"
              borderRadius="xl"
              overflow="hidden"
            >
              <Box
                as="img"
                src={dashboardHighlight}
                maxH="650px"
                alt="Dashboard Analytics"
              />
            </Box>
            {/* Feature Cards Grid */}
            <Box
              flex={1}
              display="grid"
              gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap={3}
            >
              {features.map((f) => {
                const IconComp = f.icon;
                return (
                  <Box
                    key={f.title}
                    p={5}
                    bg="background"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="border"
                    _hover={{ borderColor: "primary" }}
                    transition="border-color 150ms"
                  >
                    <Icon size={20} color="primary" mb={3}>
                      <IconComp />
                    </Icon>
                    <Text
                      fontWeight="semibold"
                      fontSize="md"
                      mb={1}
                      color="foreground"
                    >
                      {f.title}
                    </Text>
                    <Text
                      color="foreground"
                      opacity={0.5}
                      fontSize="sm"
                      lineHeight="relaxed"
                    >
                      {f.desc}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box py={20}>
        <Container maxW="6xl">
          <VStack gap={3} mb={12} textAlign="center">
            <Heading
              fontWeight="semibold"
              size="xl"
              color="foreground"
              lineHeight="tight"
            >
              Loved by Sales Teams
            </Heading>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {testimonials.map((t) => (
              <Box
                key={t.name}
                p={6}
                bg="background"
                borderRadius="lg"
                border="1px solid"
                borderColor="border"
              >
                <HStack mb={3} gap={0.5}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Icon key={i} color="stageContacted" size={14}>
                      <Star weight="fill" />
                    </Icon>
                  ))}
                </HStack>
                <Text
                  color="foreground"
                  fontSize="md"
                  mb={4}
                  lineHeight="relaxed"
                  opacity={0.8}
                >
                  "{t.text}"
                </Text>
                <HStack gap={3}>
                  <Box
                    w={8}
                    h={8}
                    borderRadius="full"
                    bg="foreground"
                    color="background"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {t.name[0]}
                  </Box>
                  <Box>
                    <Text fontWeight="medium" fontSize="sm" color="foreground">
                      {t.name}
                    </Text>
                    <Text fontSize="xs" color="foreground" opacity={0.4}>
                      {t.role}
                    </Text>
                  </Box>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Pricing */}
      <Box py={20}>
        <Container maxW="6xl">
          <VStack gap={3} mb={12} textAlign="center">
            <Heading
              fontWeight="semibold"
              size="xl"
              color="foreground"
              lineHeight="tight"
            >
              Simple Pricing
            </Heading>
            <Text color="foreground" opacity={0.5}>
              Start free. Upgrade when you're ready.
            </Text>
          </VStack>

          {/* Plan Selector */}
          <Box display="flex" justifyContent="center" mb={10}>
            <Box
              bg="muted"
              borderRadius="full"
              p={1}
              display="inline-flex"
              gap={1}
              position="relative"
            >
              {plans.map((plan) => (
                <Box
                  key={plan.name}
                  position="relative"
                  cursor="pointer"
                  px={6}
                  py={2}
                  borderRadius="full"
                  zIndex={1}
                  onClick={() => setSelectedPlan(plan.name)}
                >
                  {selectedPlan === plan.name && (
                    <motion.div
                      layoutId="plan-highlight"
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "9999px",
                        backgroundColor: "white",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        zIndex: -1,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={selectedPlan === plan.name ? "foreground" : "foreground"}
                    opacity={selectedPlan === plan.name ? 1 : 0.5}
                    position="relative"
                    zIndex={1}
                    whiteSpace="nowrap"
                  >
                    {plan.name}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Detail Panel */}
          <AnimatePresence mode="wait">
            {plans
              .filter((p) => p.name === selectedPlan)
              .map((p) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: "100%", display: "flex", justifyContent: "center" }}
                >
                  <Box
                    maxW="420px"
                    w="full"
                    p={10}
                    bg="background"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={p.highlighted ? "primary" : "border"}
                    position="relative"
                    boxShadow={p.highlighted ? "0 4px 24px rgba(37, 99, 235, 0.12)" : "none"}
                  >
                    {p.highlighted && (
                      <Box
                        position="absolute"
                        top={-3}
                        left="50%"
                        transform="translateX(-50%)"
                        bg="primary"
                        color="white"
                        px={3}
                        py={0.5}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="medium"
                      >
                        Most Popular
                      </Box>
                    )}
                    <VStack gap={6} align="start" w="full">
                      <VStack gap={1} align="start" w="full">
                        <Text fontWeight="semibold" fontSize="md" color="foreground">
                          {p.name}
                        </Text>
                        <Text fontSize="sm" color="foreground" opacity={0.5}>
                          {p.description}
                        </Text>
                      </VStack>
                      <HStack baseline gap={1}>
                        <Heading
                          fontWeight="semibold"
                          size="3xl"
                          color={p.highlighted ? "primary" : "foreground"}
                        >
                          {p.price}
                        </Heading>
                        {p.period && (
                          <Text color="foreground" opacity={0.4} fontSize="sm">
                            {p.period}
                          </Text>
                        )}
                      </HStack>
                      <VStack align="start" gap={3} w="full">
                        {p.features.map((f) => (
                          <HStack key={f} gap={3}>
                            <Icon color="primary" size={16}>
                              <CheckCircle />
                            </Icon>
                            <Text fontSize="sm" color="foreground" opacity={0.7}>
                              {f}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                      <Button
                        w="full"
                        bg={p.highlighted ? "primary" : "transparent"}
                        color={p.highlighted ? "white" : "foreground"}
                        border={p.highlighted ? "none" : "1px solid"}
                        borderColor="border"
                        onClick={() => navigate("/register")}
                        _hover={{
                          bg: p.highlighted ? "secondary" : "muted",
                        }}
                        fontWeight="medium"
                        size="md"
                        mt={2}
                      >
                        {p.cta}
                      </Button>
                    </VStack>
                  </Box>
                </motion.div>
              ))}
          </AnimatePresence>
        </Container>
      </Box>

      {/* FAQ */}
      <Box py={20}>
        <Container maxW="6xl">
          <VStack gap={3} mb={10} textAlign="center">
            <Heading
              fontWeight="semibold"
              size="xl"
              color="foreground"
              lineHeight="tight"
            >
              Frequently Asked Questions
            </Heading>
            <Text color="foreground" opacity={0.5}>
              Everything you need to know about QontakSales.
            </Text>
          </VStack>
          <Stack direction={{ base: "column", md: "row" }} gap={10} align="start">
            <Box flex={1} display={{ base: "none", md: "block" }}>
              <Box as="img" src={faqIllustration} w="full" display="block" />
            </Box>
            <VStack gap={0} align="start" flex={1} w="full">
              {faqs.map((faq, i) => (
                <FaqItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </VStack>
          </Stack>
        </Container>
      </Box>

      {/* CTA */}
      <Box py={24} position="relative" overflow="hidden">
        <Box
          position="absolute"
          inset={0}
          bgImage={`url(${ctaImg})`}
          bgSize="cover"
          bgPosition="center"
        />
        <Box position="absolute" inset={0} bg="black" opacity={0.6} />
        <Container maxW="2xl" textAlign="center" position="relative" zIndex={1}>
          <VStack gap={6}>
            <Heading
              fontWeight="semibold"
              size="xl"
              color="white"
              lineHeight="tight"
            >
              Ready to Boost Your Sales?
            </Heading>
            <Text color="white" opacity={0.8} lineHeight="relaxed">
              Join hundreds of teams already closing more deals with
              QontakSales.
            </Text>
            <Button
              size="md"
              bg="primary"
              color="white"
              fontWeight="medium"
              onClick={() => navigate("/register")}
              _hover={{ opacity: 0.85 }}
              px={8}
            >
              Get Started Free
              <Icon ml={1.5}>
                <ArrowRight size={16} />
              </Icon>
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={8} borderTop="1px solid" borderColor="border">
        <Container maxW="6xl">
          <Stack
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <HStack gap={3}>
              <Box
                as="img"
                src={brandLogo}
                h="24px"
                alt="QontakSales"
              />
            </HStack>
            <HStack gap={6}>
              {["Privacy", "Terms", "Contact"].map((label) => (
                <Text
                  key={label}
                  fontSize="sm"
                  color="foreground"
                  opacity={0.4}
                  cursor="pointer"
                  _hover={{ opacity: 0.8 }}
                  onClick={() =>
                    navigate(
                      `/${label.toLowerCase()}`
                    )
                  }
                >
                  {label}
                </Text>
              ))}
            </HStack>
            <Text fontSize="sm" color="foreground" opacity={0.3}>
              &copy; 2026 QontakSales
            </Text>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
