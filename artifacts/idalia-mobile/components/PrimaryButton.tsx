import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "accent" | "outline" | "ghost" | "destructive";

interface Props {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  testID?: string;
}

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  fullWidth = true,
  testID,
}: Props) {
  const colors = useColors();

  const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
    primary: { bg: colors.primary, fg: colors.primaryForeground, border: colors.primary },
    secondary: { bg: colors.secondary, fg: colors.secondaryForeground, border: colors.secondary },
    accent: { bg: colors.accent, fg: colors.accentForeground, border: colors.accent },
    outline: { bg: "transparent", fg: colors.primary, border: colors.primary },
    ghost: { bg: "transparent", fg: colors.primary, border: "transparent" },
    destructive: { bg: colors.destructive, fg: colors.destructiveForeground, border: colors.destructive },
  };
  const v = palette[variant];

  const handlePress = (e: GestureResponderEvent) => {
    if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
    onPress?.(e);
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderRadius: colors.radius,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          paddingHorizontal: fullWidth ? 16 : 22,
        },
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={v.fg} />
        ) : (
          <Text style={[styles.label, { color: v.fg }]}>{label}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderWidth: 1, height: 50, justifyContent: "center", alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 16, fontFamily: "Inter_600SemiBold", letterSpacing: 0.2 },
});
