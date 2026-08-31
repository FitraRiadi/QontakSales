import { createSystem, defaultConfig } from "@chakra-ui/react";

const config = {
  theme: {
    tokens: {
      colors: {
        primary: { value: "#2563EB" },
        onPrimary: { value: "#FFFFFF" },
        secondary: { value: "#3B82F6" },
        accent: { value: "#059669" },
        background: { value: "#F8FAFC" },
        foreground: { value: "#0F172A" },
        muted: { value: "#F1F5FD" },
        border: { value: "#E4ECFC" },
        destructive: { value: "#DC2626" },
        stageNew: { value: "#3B82F6" },
        stageContacted: { value: "#F59E0B" },
        stageNegotiation: { value: "#8B5CF6" },
        stageWon: { value: "#059669" },
        stageLost: { value: "#DC2626" },
      },
      fonts: {
        heading: { value: "'Plus Jakarta Sans', sans-serif" },
        body: { value: "'Inter', 'Open Sans', sans-serif" },
      },
    },
  },
};

export const system = createSystem(defaultConfig, config);
