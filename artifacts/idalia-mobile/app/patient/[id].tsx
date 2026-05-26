import React from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  useGetPatient,
  useListExams,
  type Patient,
  type Exam,
} from "@workspace/api-client-react";

import { GlassCard } from "@/components/GlassCard";
import { useColors } from "@/hooks/useColors";
import { deletePatient, deleteExam } from "@/lib/api";

const CALC_LABEL: Record<string, string> = {
  gestational_lmp: "Idade gestacional (DUM)",
  gestational_us: "Idade gestacional (USG)",
  gestational_transfer: "Idade gestacional (FIV)",
  biometry_crl: "Biometria — CCN",
  biometry_multi: "Biometria fetal",
  biometry_efw: "Peso fetal estimado",
};

function calcLabel(t: string) {
  return CALC_LABEL[t] ?? t;
}

export default function PatientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();

  const patientQ = useGetPatient<Patient>(id!);
  const examsQ = useListExams<Exam[]>({ patientId: id });

  const handleDelete = () => {
    const doDelete = async () => {
      try {
        await deletePatient(id!);
        router.back();
      } catch (e: any) {
        Alert.alert("Erro", e?.message ?? "Não foi possível excluir.");
      }
    };

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm("Excluir paciente? Esta ação não pode ser desfeita.")) {
        void doDelete();
      }
      return;
    }
    Alert.alert("Excluir paciente?", "Esta ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: doDelete },
    ]);
  };

  const handleDeleteExam = (examId: string) => {
    const doDelete = async () => {
      try {
        await deleteExam(examId);
        examsQ.refetch();
      } catch (e: any) {
        Alert.alert("Erro", e?.message ?? "Não foi possível excluir o exame.");
      }
    };
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm("Excluir exame?")) void doDelete();
      return;
    }
    Alert.alert("Excluir exame?", "", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: doDelete },
    ]);
  };

  const refetch = () => {
    patientQ.refetch();
    examsQ.refetch();
  };

  const p = patientQ.data;

  return (
    <>
      <Stack.Screen
        options={{
          title: p?.name ?? "Paciente",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerRight: () => (
            <Pressable onPress={handleDelete} hitSlop={10}>
              <Feather name="trash-2" size={20} color={colors.destructive} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: 80, gap: 14 }}
        refreshControl={
          <RefreshControl
            refreshing={patientQ.isRefetching || examsQ.isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {patientQ.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
        ) : patientQ.isError ? (
          <GlassCard>
            <Text style={{ color: colors.destructive }}>
              {(patientQ.error as Error)?.message || "Erro ao carregar paciente"}
            </Text>
          </GlassCard>
        ) : p ? (
          <>
            <GlassCard>
              <View style={styles.headRow}>
                <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                  <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 18 }}>
                    {p.name.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 20 }}>
                    {p.name}
                  </Text>
                  <Text style={{ color: colors.mutedForeground, marginTop: 2 }}>
                    {p.age ? `${p.age} anos` : "Idade não informada"}
                  </Text>
                </View>
              </View>
              {p.medicalRecordId ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>Prontuário</Text>
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>
                    {p.medicalRecordId}
                  </Text>
                </View>
              ) : null}
              {p.notes ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>Observações</Text>
                  <Text style={{ color: colors.foreground, marginTop: 2 }}>{p.notes}</Text>
                </View>
              ) : null}
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                  Cadastrado em {format(new Date(p.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </Text>
              </View>
            </GlassCard>

            <View style={{ marginTop: 4 }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 17 }}>
                Histórico de exames
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 2 }}>
                Cálculos e biometrias salvos para esta paciente
              </Text>
            </View>

            {examsQ.isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (examsQ.data?.length ?? 0) === 0 ? (
              <GlassCard style={{ alignItems: "center", paddingVertical: 28 }}>
                <Feather name="clipboard" size={26} color={colors.mutedForeground} />
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", marginTop: 10 }}>
                  Nenhum exame registrado
                </Text>
              </GlassCard>
            ) : (
              (examsQ.data ?? []).map((e) => (
                <GlassCard key={e.id}>
                  <View style={styles.examRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                        {calcLabel(e.calcType)}
                      </Text>
                      <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 4 }}>
                        {format(new Date(e.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </Text>
                      {e.gestationalAgeWeeks != null ? (
                        <Text
                          style={{
                            color: colors.primary,
                            fontFamily: "Inter_700Bold",
                            marginTop: 6,
                            fontSize: 16,
                          }}
                        >
                          {e.gestationalAgeWeeks}s {e.gestationalAgeDays ?? 0}d
                        </Text>
                      ) : null}
                      {e.notes ? (
                        <Text style={{ color: colors.foreground, marginTop: 6, fontSize: 13 }}>
                          {e.notes}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable onPress={() => handleDeleteExam(e.id)} hitSlop={10}>
                      <Feather name="trash-2" size={18} color={colors.destructive} />
                    </Pressable>
                  </View>
                </GlassCard>
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 12, fontFamily: "Inter_500Medium", letterSpacing: 0.3, textTransform: "uppercase" },
  examRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
});
