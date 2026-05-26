import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useListPlans,
  useGetSubscription,
  type Plan,
  type SubscriptionState,
} from "@workspace/api-client-react";

import { GlassCard } from "@/components/GlassCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/hooks/useColors";
import { createCheckout } from "@/lib/api";

const TIER_ORDER: Record<string, number> = {
  basic: 1,
  professional: 2,
  premium: 3,
};

const FEATURE_LABELS: Record<string, string> = {
  biometry: "Biometria Fetal",
  gestational: "Idade Gestacional",
  fertility: "Ciclo / Fertilidade",
  efw: "Peso Fetal Estimado",
  doppler: "Doppler Obstétrico",
  growth_curve: "Curvas de Crescimento",
  trisomy_risk: "Risco de Trissomias",
  preeclampsia_risk: "Risco de Pré-Eclâmpsia",
};

export default function PlansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const plansQ = useListPlans<Plan[]>();
  const subQ = useGetSubscription<SubscriptionState>();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const plans = (plansQ.data ?? [])
    .filter((p) => p.tier !== "free_trial" && p.stripePriceId)
    .sort((a, b) => (TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99));

  const handleSubscribe = async (plan: Plan) => {
    if (!plan.stripePriceId) return;
    setErrorMsg(null);
    setLoadingId(plan.id);
    try {
      const { url } = await createCheckout({ priceId: plan.stripePriceId });
      if (!url) throw new Error("URL de checkout indisponível");
      await WebBrowser.openBrowserAsync(url);
      subQ.refetch();
    } catch (e: any) {
      setErrorMsg(e?.message || "Erro ao abrir checkout");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Planos" }} />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 32,
          gap: 14,
        }}
      >
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          Escolha o plano ideal para sua prática. A assinatura é processada com
          segurança pelo Stripe e abre no navegador.
        </Text>

        {plansQ.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : plans.length === 0 ? (
          <Text style={{ color: colors.mutedForeground, textAlign: "center" }}>
            Nenhum plano disponível no momento.
          </Text>
        ) : (
          plans.map((plan) => {
            const isCurrent =
              subQ.data?.subscribed && subQ.data?.subscriptionTier === plan.tier;
            const features = Array.isArray(plan.features)
              ? (plan.features as string[])
              : [];

            return (
              <GlassCard key={plan.id}>
                <View style={styles.headerRow}>
                  <Text style={[styles.planName, { color: colors.foreground }]}>
                    {plan.name}
                  </Text>
                  {isCurrent ? (
                    <View
                      style={[styles.pill, { backgroundColor: colors.accent }]}
                    >
                      <Text style={styles.pillText}>PLANO ATUAL</Text>
                    </View>
                  ) : null}
                </View>

                {plan.description ? (
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    {plan.description}
                  </Text>
                ) : null}

                <View style={{ marginTop: 12, flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={[styles.price, { color: colors.foreground }]}>
                    R$ {(plan.priceCents / 100).toFixed(2).replace(".", ",")}
                  </Text>
                  <Text style={{ color: colors.mutedForeground, marginLeft: 4 }}>
                    /mês
                  </Text>
                </View>

                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontSize: 13,
                    marginTop: 6,
                  }}
                >
                  <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                    {plan.tokensPerPeriod}
                  </Text>{" "}
                  cálculos por mês
                </Text>

                {features.length > 0 ? (
                  <View style={{ marginTop: 10, gap: 4 }}>
                    {features.map((f) => (
                      <Text
                        key={f}
                        style={{ color: colors.mutedForeground, fontSize: 13 }}
                      >
                        • {FEATURE_LABELS[f] ?? f}
                      </Text>
                    ))}
                  </View>
                ) : null}

                <View style={{ marginTop: 14 }}>
                  <PrimaryButton
                    label={isCurrent ? "Plano atual" : "Assinar"}
                    onPress={() => handleSubscribe(plan)}
                    loading={loadingId === plan.id}
                    disabled={!!isCurrent}
                    variant={isCurrent ? "outline" : "primary"}
                  />
                </View>
              </GlassCard>
            );
          })
        )}

        {errorMsg ? (
          <Text style={{ color: colors.destructive, textAlign: "center" }}>
            {errorMsg}
          </Text>
        ) : null}

        {Platform.OS === "ios" ? (
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 11,
              textAlign: "center",
              marginTop: 12,
            }}
          >
            Pagamentos processados pelo Stripe fora do aplicativo.
          </Text>
        ) : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, lineHeight: 18 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  planName: { fontFamily: "Inter_700Bold", fontSize: 17 },
  price: { fontFamily: "Inter_700Bold", fontSize: 24 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
