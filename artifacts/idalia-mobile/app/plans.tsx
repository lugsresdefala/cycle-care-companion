import React, { useRef, useState } from "react";
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
  checkoutStatus,
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

type StatusKind = "info" | "success" | "error";
type StatusBanner = { kind: StatusKind; message: string } | null;

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 8;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function PlansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const plansQ = useListPlans<Plan[]>();
  const subQ = useGetSubscription<SubscriptionState>();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusBanner>(null);
  const pollingRef = useRef(false);

  const plans = (plansQ.data ?? [])
    .filter((p) => p.tier !== "free_trial" && p.stripePriceId)
    .sort((a, b) => (TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99));

  const pollForActivation = async (
    sessionId: string | null,
    previousTier: string | null,
    targetTier: string,
  ) => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    setStatus({
      kind: "info",
      message: "Processando pagamento, aguarde alguns segundos…",
    });

    let lastCheckoutStatus: Awaited<ReturnType<typeof checkoutStatus>> | null = null;

    try {
      for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
        await sleep(POLL_INTERVAL_MS);

        const { data: sub } = await subQ.refetch();
        if (
          sub?.subscribed &&
          (sub.subscriptionTier === targetTier ||
            sub.subscriptionTier !== previousTier)
        ) {
          setStatus({ kind: "success", message: "Assinatura ativada com sucesso." });
          return;
        }

        if (sessionId) {
          try {
            lastCheckoutStatus = await checkoutStatus({ session_id: sessionId });
          } catch {
            // ignore transient errors; keep polling
          }
          if (lastCheckoutStatus) {
            if (
              lastCheckoutStatus.status === "expired" ||
              lastCheckoutStatus.paymentStatus === "unpaid" &&
                lastCheckoutStatus.status !== "complete"
            ) {
              setStatus({
                kind: "error",
                message: "Pagamento cancelado ou expirado. Tente novamente quando quiser.",
              });
              return;
            }
            if (
              lastCheckoutStatus.status === "complete" &&
              lastCheckoutStatus.paymentStatus &&
              lastCheckoutStatus.paymentStatus !== "paid"
            ) {
              setStatus({
                kind: "error",
                message: "Falha no pagamento. Tente novamente ou use outro cartão.",
              });
              return;
            }
          }
        }
      }

      if (
        lastCheckoutStatus?.status === "complete" &&
        (!lastCheckoutStatus.paymentStatus ||
          lastCheckoutStatus.paymentStatus === "paid")
      ) {
        setStatus({
          kind: "info",
          message:
            "Pagamento confirmado. A ativação pode levar alguns instantes — puxe para atualizar.",
        });
      } else {
        setStatus({
          kind: "info",
          message:
            "Ainda não recebemos a confirmação. Aguarde alguns minutos e puxe para atualizar.",
        });
      }
    } finally {
      pollingRef.current = false;
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (!plan.stripePriceId) return;
    setStatus(null);
    setLoadingId(plan.id);
    const previousTier = subQ.data?.subscribed
      ? subQ.data.subscriptionTier ?? null
      : null;
    try {
      const { url, sessionId } = await createCheckout({ priceId: plan.stripePriceId });
      if (!url) throw new Error("URL de checkout indisponível");
      const result = await WebBrowser.openBrowserAsync(url);
      setLoadingId(null);
      if (
        Platform.OS === "ios" &&
        (result as any)?.type === "cancel"
      ) {
        // iOS reports `cancel` when the user explicitly closes the browser tab
        // before the success page; still poll because Stripe may have completed
        // in the background.
      }
      await pollForActivation(sessionId ?? null, previousTier, plan.tier);
    } catch (e: any) {
      setStatus({
        kind: "error",
        message: e?.message || "Erro ao abrir checkout.",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const bannerColor =
    status?.kind === "success"
      ? colors.accent
      : status?.kind === "error"
        ? colors.destructive
        : colors.secondary;

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

        {status ? (
          <View
            style={[
              styles.banner,
              {
                borderColor: bannerColor,
                backgroundColor: colors.card,
                borderRadius: colors.radius,
              },
            ]}
          >
            {pollingRef.current && status.kind === "info" ? (
              <ActivityIndicator color={bannerColor} />
            ) : null}
            <Text
              style={{
                color: bannerColor,
                fontFamily: "Inter_600SemiBold",
                flex: 1,
                fontSize: 13,
              }}
            >
              {status.message}
            </Text>
          </View>
        ) : null}

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
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderWidth: 1,
  },
});
