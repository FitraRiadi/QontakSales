import { Button, Dialog, HStack, Icon, Text, VStack, Portal } from "@chakra-ui/react";
import { Warning, Trash, Archive, ArrowClockwise, WarningCircle } from "@phosphor-icons/react";

const ACTION_CONFIG = {
  delete: {
    icon: Trash,
    color: "red.600",
    bg: "red.50",
    buttonColor: "red.600",
    confirmText: "Delete",
  },
  archive: {
    icon: Archive,
    color: "orange.600",
    bg: "orange.50",
    buttonColor: "orange.600",
    confirmText: "Archive",
  },
  restore: {
    icon: ArrowClockwise,
    color: "green.600",
    bg: "green.50",
    buttonColor: "green.600",
    confirmText: "Restore",
  },
  warning: {
    icon: WarningCircle,
    color: "yellow.600",
    bg: "yellow.50",
    buttonColor: "yellow.600",
    confirmText: "Confirm",
  },
};

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, action = "warning", loading = false }) {
  const config = ACTION_CONFIG[action] || ACTION_CONFIG.warning;
  const IconComp = config.icon;

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !loading && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="400px">
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <HStack gap={4}>
                <Icon size={32} color={config.color}>
                  <IconComp />
                </Icon>
                <Text color="foreground" opacity={0.7} fontSize="sm" lineHeight="tall">
                  {message}
                </Text>
              </HStack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap={3}>
                <Dialog.CloseTrigger asChild>
                  <Button variant="outline" disabled={loading}>Cancel</Button>
                </Dialog.CloseTrigger>
                <Button
                  bg={config.buttonColor}
                  color="white"
                  _hover={{ opacity: 0.9 }}
                  loading={loading}
                  onClick={() => { onConfirm(); onClose(); }}
                >
                  {config.confirmText}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
