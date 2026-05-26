import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

import { BrandHeader } from "@/components/BrandHeader";
import { GlassCard } from "@/components/GlassCard";
import { Field } from "@/components/Field";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/hooks/useColors";
import {
  calculateGestationalAgeFromLMP,
  calculateGestationalAgeFromTransfer,
  calculateGestationalAgeFromUltrasound,
  trimesterLabel,
  type GestationalResult,
} from "@/lib/calculators";

type Method = "lmp" | "us" | "transfer";

const METHODS: { id: Method; label: string; sub: string }[] = [
  { id: "lmp", label: "DUM", sub: "Data da última menstruação" },
  { id: "us", label: "USG", sub: "Idade por ultrassonografia" },
  { id: "transfer", label: "FIV", sub: "Transferência embrionária" },
];

function parseDate(s: string): Date | null {
  const d = parse(s, "dd/MM/yyyy", new Date());
  return isValid(d) ? d : null;
}

export default function GestationalTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState<Method>("lmp");
  const [dateStr, setDateStr] = useState("");
  const [usWeeks, setUsWeeks] = useState("");
  const [usDays, setUsDays] = useState("");
  const [embryoDays, setEmbryoDays] = useState("5");
  const [result, setResult] = useState<GestationalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const headerTop = Platform.OS === "web" ? Math.max(insets.top, 16) : insets.top;

  const compute = () => {
    setError(null);
    const date = parseDate(dateStr);
    if (!date) {
      setError("Informe uma data válida (DD/MM/AAAA)");
      return;
    }
    try {
      if (method === "lmp") {
        setResult(calculateGestationalAgeFromLMP(date));
      } else if (method === "us") {
        const w = parseInt(usWeeks || "0", 10);
        const d = parseInt(usDays || "0", 10);
        setResult(calculateGestationalAgeFromUltrasound(date, w, d));
      } else {
        const d = parseInt(embryoDays || "5", 10);
        setResult(calculateGestationalAgeFromTransfer(date, d));
      }
    } catch (e: any) {
      setError(e?.message || "Erro no cálculo");
    }
  };

  const trimesterColor = useMemo(() => {
    if (!result) return colors.primary;
    return result.currentTrimester === 1
      ? colors.primary
      : result.currentTrimester === 2
        ? colors.secondary
        : colors.accent;
  }, [result, colors]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ paddingTop: headerTop }}>
        <BrandHeader title="Idade gestacional" subtitle="DUM · USG · FIV" />
      </View>

      <View style={{ padding: 16, gap: 14 }}>
        <View style={styles.methodRow}>
          {METHODS.map((m) => {
            const active = method === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setMethod(m.id)}
                style={({ pressed }) => [
                  styles.methodChip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: colors.radius - 4,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.primaryForeground : colors.foreground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                  }}
                >
                  {m.label}
                </Text>
                <Text
                  style={{
                    color: active ? colors.primaryForeground : colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {m.sub}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <GlassCard>
          <View style={{ gap: 12 }}>
            <Field
              label={
                method === "lmp"
                  ? "Data da última menstruação"
                  : method === "us"
                    ? "Data da ultrassonografia"
                    : "Data da transferência"
              }
              placeholder="DD/MM/AAAA"
              value={dateStr}
              onChangeText={setDateStr}
              keyboardType="numeric"
            />
            {method === "us" ? (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Semanas (USG)"
                    placeholder="0"
                    value={usWeeks}
                    onChangeText={setUsWeeks}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Dias (USG)"
                    placeholder="0"
                    value={usDays}
                    onChangeText={setUsDays}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ) : null}
            {method === "transfer" ? (
              <Field
                label="Dia embrionário (D3, D5...)"
                placeholder="5"
                value={embryoDays}
                onChangeText={setEmbryoDays}
                keyboardType="numeric"
              />
            ) : null}
            {error ? (
              <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium" }}>
                {error}
              </Text>
            ) : null}
            <PrimaryButton label="Calcular" onPress={compute} />
          </View>
        </GlassCard>

        {result ? (
          <>
            <GlassCard style={{ backgroundColor: trimesterColor }}>
              <Text style={{ color: "#fff", fontFamily: "Inter_500Medium", fontSize: 13 }}>
                Idade gestacional
              </Text>
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "Inter_700Bold",
                  fontSize: 44,
                  letterSpacing: -1,
                  marginTop: 4,
                }}
              >
                {result.weeks}s {result.days}d
              </Text>
              <View style={[styles.badge]}>
                <Text style={styles.badgeText}>{trimesterLabel(result.currentTrimester)}</Text>
              </View>
            </GlassCard>

            <GlassCard>
              <Row
                label="Data provável do parto"
                value={format(result.dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              />
              <Sep />
              <Row
                label="Fim do 1º trimestre"
                value={format(result.firstTrimesterEnd, "dd/MM/yyyy")}
              />
              <Sep />
              <Row
                label="Fim do 2º trimestre"
                value={format(result.secondTrimesterEnd, "dd/MM/yyyy")}
              />
            </GlassCard>

            <GlassCard>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Feather name="info" size={16} color={colors.secondary} />
                <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 15 }}>
                  {result.developmentInfo.title}
                </Text>
              </View>
              <Text style={{ color: colors.foreground, marginTop: 8, lineHeight: 20 }}>
                {result.developmentInfo.development}
              </Text>
              <Text style={{ color: colors.mutedForeground, marginTop: 8, fontSize: 13 }}>
                Tamanho: {result.developmentInfo.size}
              </Text>
              <Text style={{ color: colors.mutedForeground, marginTop: 4, fontSize: 13 }}>
                Marco: {result.developmentInfo.milestone}
              </Text>
            </GlassCard>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>
        {label}
      </Text>
      <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
        {value}
      </Text>
    </View>
  );
}

function Sep() {
  const colors = useColors();
  return <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />;
}

const styles = StyleSheet.create({
  methodRow: { flexDirection: "row", gap: 8 },
  methodChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  badgeText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
