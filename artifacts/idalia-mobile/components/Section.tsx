import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  title: string;
  caption?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}

export function Section({ title, caption, children, right }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          {caption ? (
            <Text style={[styles.caption, { color: colors.mutedForeground }]}>{caption}</Text>
          ) : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.2 },
  caption: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
});
