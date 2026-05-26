import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
}

export function Field({ label, hint, error, style, ...rest }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        {...rest}
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            color: colors.foreground,
            borderColor: error ? colors.destructive : colors.border,
            borderRadius: colors.radius - 4,
          },
          style,
        ]}
      />
      {error ? (
        <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", letterSpacing: 0.3, textTransform: "uppercase" },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    minHeight: 48,
  },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  error: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
