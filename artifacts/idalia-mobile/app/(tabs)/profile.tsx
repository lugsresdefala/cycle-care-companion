import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import {
  useGetMyProfile,
  useGetSubscription,
  type Profile,
  type SubscriptionState,
} from "@workspace/api-client-react";

import { BrandHeader } from "@/components/BrandHeader";
import { GlassCard } from "@/components/GlassCard";
import { Field } from "@/components/Field";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/hooks/useColors";
import { updateMyProfile } from "@/lib/api";

export default function ProfileTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();

  const profileQ = useGetMyProfile<Profile>();
  const subQ = useGetSubscription<SubscriptionState>();

  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [crm, setCrm] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profileQ.data) {
      setFullName(profileQ.data.fullName ?? "");
      setSpecialty(profileQ.data.specialty ?? "");
      setCrm(profileQ.data.crmNumber ?? "");
      setPhone(profileQ.data.phone ?? "");
    }
  }, [profileQ.data]);

  const headerTop = Platform.OS === "web" ? Math.max(insets.top, 16) : insets.top;

  const save = async () => {
    setSaving(true);
    setSavedMsg(null);
    try {
      await updateMyProfile({ fullName, specialty, crmNumber: crm, phone });
      await profileQ.refetch();
      setSavedMsg("Perfil atualizado");
    } catch (e: any) {
      setSavedMsg(e?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const refetch = () => {
    profileQ.refetch();
    subQ.refetch();
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={profileQ.isRefetching || subQ.isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      <View style={{ paddingTop: headerTop }}>
        <BrandHeader title="Conta" subtitle="Perfil e assinatura" />
      </View>

      <View style={{ padding: 16, gap: 14 }}>
        <GlassCard>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Assinatura</Text>
          {subQ.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
          ) : subQ.data ? (
            <View style={{ marginTop: 10, gap: 10 }}>
              <View style={styles.rowBetween}>
                <Text style={{ color: colors.mutedForeground }}>Status</Text>
                <View
                  style={[
                    styles.pill,
                    {
                      backgroundColor: subQ.data.subscribed
                        ? colors.accent
                        : colors.muted,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: subQ.data.subscribed ? "#fff" : colors.foreground,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                    }}
                  >
                    {subQ.data.subscribed
                      ? subQ.data.subscriptionTier?.toUpperCase() ?? "ATIVO"
                      : "SEM PLANO"}
                  </Text>
                </View>
              </View>
              <View style={styles.rowBetween}>
                <Text style={{ color: colors.mutedForeground }}>Tokens disponíveis</Text>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 20 }}>
                  {subQ.data.tokensRemaining}
                </Text>
              </View>
              {subQ.data.isTrial ? (
                <Text style={{ color: colors.secondary, fontFamily: "Inter_500Medium", fontSize: 13 }}>
                  Período de avaliação ativo
                </Text>
              ) : null}
              {subQ.data.subscriptionEnd ? (
                <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
                  Renovação: {new Date(subQ.data.subscriptionEnd).toLocaleDateString("pt-BR")}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={{ color: colors.mutedForeground, marginTop: 10 }}>
              Informações de assinatura indisponíveis.
            </Text>
          )}
        </GlassCard>

        <GlassCard>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Perfil</Text>
          {profileQ.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
          ) : (
            <View style={{ gap: 12, marginTop: 12 }}>
              <Field label="Nome completo" value={fullName} onChangeText={setFullName} />
              <Field label="Especialidade" value={specialty} onChangeText={setSpecialty} />
              <Field label="CRM" value={crm} onChangeText={setCrm} />
              <Field label="Telefone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              {savedMsg ? (
                <Text
                  style={{
                    color: savedMsg.includes("atualizado") ? colors.accent : colors.destructive,
                    fontFamily: "Inter_500Medium",
                  }}
                >
                  {savedMsg}
                </Text>
              ) : null}
              <PrimaryButton label="Salvar alterações" onPress={save} loading={saving} />
            </View>
          )}
        </GlassCard>

        <Pressable
          onPress={() => signOut()}
          style={({ pressed }) => [
            styles.signOut,
            {
              borderColor: colors.destructive,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={{ color: colors.destructive, fontFamily: "Inter_600SemiBold", fontSize: 15 }}>
            Sair
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  signOut: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderWidth: 1,
  },
});
