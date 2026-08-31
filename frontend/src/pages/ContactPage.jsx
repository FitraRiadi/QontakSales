import { Box, Container, Heading, Text, VStack, HStack, Button, SimpleGrid, Icon, Input, Textarea, Field, createToaster } from "@chakra-ui/react";
import { ArrowLeft, EnvelopeSimple, Phone, MapPin } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import brandLogo from "@/assets/brand.png";

const toaster = createToaster({ placement: "top-end" });

const contactInfo = [
  { icon: EnvelopeSimple, label: "Email", value: "hello@qontaksales.com", color: "primary" },
  { icon: Phone, label: "Phone", value: "+62 21 1234 5678", color: "green.600" },
  { icon: MapPin, label: "Address", value: "Jakarta, Indonesia", color: "orange.600" },
];

export default function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    toaster.create({ title: "Message sent! We'll get back to you soon.", type: "success" });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <Box bg="background" minH="100vh">
      <Box as="nav" bg="white" borderBottom="1px solid" borderColor="border" py={4}>
        <Container maxW="4xl">
          <HStack justify="space-between">
            <Box as="img" src={brandLogo} h="28px" alt="QontakSales" />
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}><ArrowLeft size={16} /> Back to Home</Button>
          </HStack>
        </Container>
      </Box>

      <Container maxW="4xl" py={12}>
        <VStack align="stretch" gap={8}>
          <VStack align="start" gap={2}>
            <Heading size="xl">Contact Us</Heading>
            <Text color="foreground" opacity={0.6}>Have a question? We'd love to hear from you.</Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            {contactInfo.map((c) => {
              const IconComp = c.icon;
              return (
                <Box key={c.label} p={6} bg="white" borderRadius="xl" border="1px solid" borderColor="border" textAlign="center">
                  <Box w={12} h={12} borderRadius="lg" bg="primary/10" display="flex" alignItems="center" justifyContent="center" mx="auto" mb={3}>
                    <Icon size={24} color={c.color}><IconComp /></Icon>
                  </Box>
                  <Text fontWeight="semibold" fontSize="sm" mb={1}>{c.label}</Text>
                  <Text color="foreground" opacity={0.6} fontSize="sm">{c.value}</Text>
                </Box>
              );
            })}
          </SimpleGrid>

          <Box p={8} bg="white" borderRadius="2xl" border="1px solid" borderColor="border">
            <Heading size="md" mb={6}>Send a Message</Heading>
            <Box as="form" onSubmit={handleSubmit}>
              <VStack gap={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} w="full" gap={4}>
                  <Field.Root required>
                    <Field.Label>Name</Field.Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>Email</Field.Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
                  </Field.Root>
                </SimpleGrid>
                <Field.Root required w="full">
                  <Field.Label>Message</Field.Label>
                  <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help you?" rows={5} />
                </Field.Root>
                <Button type="submit" bg="primary" color="white" _hover={{ bg: "secondary" }} px={8} size="lg">Send Message</Button>
              </VStack>
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
