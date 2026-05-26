import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useColors } from "@/hooks/useColors";

interface Props {
  title: string;
  subtitle?: string;
  compact?: boolean;
}

export function BrandHeader({ title, subtitle, compact }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.wrap, compact && { paddingBottom: 8 }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <View style={[styles.dot, { backgroundColor: colors.accent, opacity: 0.18 }]} />
      <View style={[styles.dot2, { backgroundColor: colors.secondary, opacity: 0.16 }]} />
      <Text style={[styles.title, { color: colors.primaryForeground }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.primaryForeground, opacity: 0.85 }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18, overflow: "hidden" },
  gradient: { ...StyleSheet.absoluteFillObject },
  dot: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    right: -40,
    top: -50,
  },
  dot2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    left: -30,
    bottom: -40,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 4 },
});
