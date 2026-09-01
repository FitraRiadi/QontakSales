import { Box, Spinner, Text, VStack } from "@chakra-ui/react";

export default function LoadingPopup({ open, message = "Loading..." }) {
  if (!open) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={9999}
      bg="blackAlpha.50"
      backdropFilter="blur(4px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      style={{ touchAction: "none" }}
    >
      <Box
        bg="white"
        borderRadius="xl"
        px={10}
        py={8}
        shadow="2xl"
        border="1px solid"
        borderColor="border"
        textAlign="center"
        minW="220px"
        onClick={(e) => e.stopPropagation()}
      >
        <VStack gap={4}>
          <Spinner size="xl" color="primary" borderWidth="3px" />
          <Text fontWeight="semibold" color="foreground" fontSize="sm">{message}</Text>
        </VStack>
      </Box>
    </Box>
  );
}
