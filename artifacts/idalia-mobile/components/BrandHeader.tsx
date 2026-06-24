import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const HEADER_GRADIENT = ["#1b3f80", "#0d2350"] as const;
export const HEADER_ACCENT = "#ef8527";

interface Props {
  title: string;
  subtitle?: string;
  compact?: boolean;
}

export function BrandHeader({ title, subtitle, compact }: Props) {
  return (
    <View style={[styles.wrap, compact && { paddingTop: 16, paddingBottom: 16 }]}>
      <LinearGradient
        colors={HEADER_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      />
      <View style={styles.accentBar} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    overflow: "hidden",
  },
  gradient: { ...StyleSheet.absoluteFillObject },
  accentBar: {
    width: 26,
    height: 3,
    borderRadius: 2,
    backgroundColor: HEADER_ACCENT,
    marginBottom: 12,
  },
  title: {
    fontSize: 23,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#ffffff",
    opacity: 0.72,
    marginTop: 5,
  },
});
