import { createSystem, defaultConfig } from "@chakra-ui/react";

const config = {
  theme: {
    tokens: {
      colors: {
        primary: { value: "#2563EB" },
        onPrimary: { value: "#FFFFFF" },
        secondary: { value: "#3B82F6" },
        accent: { value: "#059669" },
        background: { value: "#FAFAFA" },
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
        heading: { value: "'Inter', sans-serif" },
        body: { value: "'Inter', sans-serif" },
      },
      fontSizes: {
        xs:    { value: "12px" },
        sm:    { value: "13px" },
        md:    { value: "15px" },
        lg:    { value: "17px" },
        xl:    { value: "18px" },
        "2xl": { value: "24px" },
        "3xl": { value: "30px" },
        "4xl": { value: "40px" },
      },
      fontWeights: {
        regular:  { value: 400 },
        medium:   { value: 500 },
        semibold: { value: 600 },
        bold:     { value: 700 },
      },
      letterSpacings: {
        tighter: { value: "-0.03em" },
        tight:   { value: "-0.02em" },
        normal:  { value: "0" },
      },
    },
  },
};

export const system = createSystem(defaultConfig, config);
