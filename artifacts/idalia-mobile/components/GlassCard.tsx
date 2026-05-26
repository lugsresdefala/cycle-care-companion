import React from "react";
import { StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

export function GlassCard({ style, children, ...rest }: ViewProps) {
  const colors = useColors();
  return (
    <View
      {...rest}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.glassBorder,
          borderRadius: colors.radius,
          shadowColor: colors.primary,
        },
        style as ViewStyle,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
});
