import React, { useState } from "react";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { BrandHeader } from "@/components/BrandHeader";
import { GlassCard } from "@/components/GlassCard";
import { Field } from "@/components/Field";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/hooks/useColors";
import {
  dueDateFromGA,
  estimatedFetalWeight,
  gestationalAgeFromCRL,
  gestationalAgeFromMultipleBiometry,
  isValidCRL,
  type BiometryAverage,
  type EFWResult,
  type GAEstimate,
} from "@/lib/biometry";

type Mode = "crl" | "multi" | "efw";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "crl", label: "CCN", sub: "1º trimestre" },
  { id: "multi", label: "Biometria", sub: "DBP · CC · CA · CF" },
  { id: "efw", label: "Peso fetal", sub: "Hadlock 3-param" },
];

export default function BiometryTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>("crl");

  const [crl, setCrl] = useState("");
  const [bpd, setBpd] = useState("");
  const [hc, setHc] = useState("");
  const [ac, setAc] = useState("");
  const [fl, setFl] = useState("");

  const [crlResult, setCrlResult] = useState<GAEstimate | null>(null);
  const [multiResult, setMultiResult] = useState<BiometryAverage | null>(null);
  const [efwResult, setEfwResult] = useState<EFWResult | null>(null);
  const [efwGa, setEfwGa] = useState<GAEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const headerTop = Platform.OS === "web" ? Math.max(insets.top, 16) : insets.top;

  const compute = () => {
    setError(null);
    setCrlResult(null);
    setMultiResult(null);
    setEfwResult(null);
    setEfwGa(null);
    try {
      if (mode === "crl") {
        const v = parseFloat(crl.replace(",", "."));
        if (!isValidCRL(v)) {
          setError("CCN deve estar entre 2 e 84 mm");
          return;
        }
        setCrlResult(gestationalAgeFromCRL(v));
      } else if (mode === "multi") {
        const r = gestationalAgeFromMultipleBiometry({
          bpd: bpd ? parseFloat(bpd.replace(",", ".")) : undefined,
          hc: hc ? parseFloat(hc.replace(",", ".")) : undefined,
          ac: ac ? parseFloat(ac.replace(",", ".")) : undefined,
          fl: fl ? parseFloat(fl.replace(",", ".")) : undefined,
        });
        if (r.estimates.length === 0) {
          setError("Informe ao menos um valor (DBP, CC, CA ou CF)");
          return;
        }
        setMultiResult(r);
      } else {
        const hcN = parseFloat(hc.replace(",", "."));
        const acN = parseFloat(ac.replace(",", "."));
        const flN = parseFloat(fl.replace(",", "."));
        if (!hcN || !acN || !flN) {
          setError("CC, CA e CF são obrigatórios para estimar o peso");
          return;
        }
        setEfwResult(estimatedFetalWeight({ hc: hcN, ac: acN, fl: flN }));
        const ga = gestationalAgeFromMultipleBiometry({
          bpd: bpd ? parseFloat(bpd.replace(",", ".")) : undefined,
          hc: hcN,
          ac: acN,
          fl: flN,
        });
        if (ga.estimates.length > 0) setEfwGa(ga);
      }
    } catch (e: any) {
      setError(e?.message || "Erro no cálculo");
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ paddingTop: headerTop }}>
        <BrandHeader title="Biometria fetal" subtitle="Hadlock · Robinson-Fleming" />
      </View>

      <View style={{ padding: 16, gap: 14 }}>
        <View style={styles.row}>
          {MODES.map((m) => {
            const active = mode === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setMode(m.id)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: active ? colors.secondary : colors.card,
                    borderColor: active ? colors.secondary : colors.border,
                    borderRadius: colors.radius - 4,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? "#fff" : colors.foreground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                  }}
                >
                  {m.label}
                </Text>
                <Text
                  style={{
                    color: active ? "#fff" : colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                    fontSize: 10,
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
            {mode === "crl" ? (
              <Field
                label="CCN (mm)"
                placeholder="Ex.: 45.2"
                value={crl}
                onChangeText={setCrl}
                keyboardType="decimal-pad"
                hint="Robinson-Fleming · válido entre 2 e 84 mm"
              />
            ) : (
              <>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Field label="DBP (mm)" placeholder="—" value={bpd} onChangeText={setBpd} keyboardType="decimal-pad" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="CC (mm)" placeholder="—" value={hc} onChangeText={setHc} keyboardType="decimal-pad" />
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Field label="CA (mm)" placeholder="—" value={ac} onChangeText={setAc} keyboardType="decimal-pad" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="CF (mm)" placeholder="—" value={fl} onChangeText={setFl} keyboardType="decimal-pad" />
                  </View>
                </View>
              </>
            )}
            {error ? (
              <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium" }}>{error}</Text>
            ) : null}
            <PrimaryButton label="Calcular" onPress={compute} variant="secondary" />
          </View>
        </GlassCard>

        {crlResult ? (
          <GlassCard style={{ backgroundColor: colors.primary }}>
            <Text style={styles.lblLight}>Idade gestacional (CCN)</Text>
            <Text style={styles.bigValue}>
              {crlResult.weeks}s {crlResult.days}d
            </Text>
            <Text style={styles.subLight}>
              DPP estimada: {format(dueDateFromGA(crlResult.totalDays), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </Text>
          </GlassCard>
        ) : null}

        {multiResult ? (
          <>
            <GlassCard style={{ backgroundColor: colors.secondary }}>
              <Text style={styles.lblLight}>Idade gestacional média</Text>
              <Text style={styles.bigValue}>
                {multiResult.weeks}s {multiResult.days}d
              </Text>
              <Text style={styles.subLight}>
                DPP estimada: {format(dueDateFromGA(multiResult.totalDays), "dd/MM/yyyy")}
              </Text>
            </GlassCard>
            <GlassCard>
              <Text style={{ fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 8 }}>
                Estimativas individuais
              </Text>
              {multiResult.estimates.map((e) => (
                <View key={e.label} style={styles.estRow}>
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
                    {e.label}
                  </Text>
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                    {e.weeks}s {e.days}d
                  </Text>
                </View>
              ))}
            </GlassCard>
          </>
        ) : null}

        {efwResult ? (
          <>
            <GlassCard style={{ backgroundColor: colors.accent }}>
              <Text style={styles.lblLight}>Peso fetal estimado</Text>
              <Text style={styles.bigValue}>{efwResult.weightKg} kg</Text>
              <Text style={styles.subLight}>
                {efwResult.weightG} g · {efwResult.formula}
              </Text>
            </GlassCard>
            <GlassCard>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Feather name="bar-chart-2" size={16} color={colors.secondary} />
                <Text style={{ fontFamily: "Inter_700Bold", color: colors.foreground }}>
                  Classificação
                </Text>
              </View>
              <Text style={{ color: colors.foreground, marginTop: 8 }}>
                {efwResult.classification}
              </Text>
              {efwGa ? (
                <Text style={{ color: colors.mutedForeground, marginTop: 8, fontSize: 13 }}>
                  Idade gestacional pela biometria: {efwGa.weeks}s {efwGa.days}d
                </Text>
              ) : null}
            </GlassCard>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  lblLight: { color: "#fff", fontFamily: "Inter_500Medium", fontSize: 13 },
  bigValue: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 44,
    letterSpacing: -1,
    marginTop: 4,
  },
  subLight: { color: "#fff", opacity: 0.9, fontFamily: "Inter_400Regular", marginTop: 4 },
  estRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
});
