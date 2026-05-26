import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListPatients, type Patient } from "@workspace/api-client-react";

import { BrandHeader } from "@/components/BrandHeader";
import { GlassCard } from "@/components/GlassCard";
import { useColors } from "@/hooks/useColors";

export default function PatientsTab() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error, refetch, isRefetching } = useListPatients<Patient[]>();

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.medicalRecordId ?? "").toLowerCase().includes(q),
    );
  }, [data, search]);

  const headerTop = Platform.OS === "web" ? Math.max(insets.top, 16) : insets.top;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 100;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: headerTop }}>
        <BrandHeader title="Pacientes" subtitle="Acompanhe seus prontuários" />
      </View>

      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchWrap,
            { backgroundColor: colors.input, borderColor: colors.border, borderRadius: colors.radius - 4 },
          ]}
        >
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nome ou prontuário"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
        <Pressable
          onPress={() => router.push("/patient/new")}
          style={({ pressed }) => [
            styles.addBtn,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius - 4,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="plus" size={20} color={colors.primaryForeground} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>Carregando...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Feather name="alert-circle" size={28} color={colors.destructive} />
          <Text style={[styles.muted, { color: colors.destructive }]}>
            {(error as Error)?.message || "Erro ao carregar pacientes"}
          </Text>
          <Pressable onPress={() => refetch()} style={{ marginTop: 12 }}>
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad, gap: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <GlassCard style={{ alignItems: "center", paddingVertical: 36, marginTop: 20 }}>
              <Feather name="user-plus" size={28} color={colors.mutedForeground} />
              <Text style={[styles.empty, { color: colors.foreground }]}>
                Nenhum paciente cadastrado
              </Text>
              <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>
                Toque em + para criar o primeiro
              </Text>
            </GlassCard>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/patient/${item.id}`)}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <GlassCard>
                <View style={styles.itemRow}>
                  <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                    <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>
                      {item.name.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, { color: colors.foreground }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>
                      {item.age ? `${item.age} anos` : "Idade não informada"}
                      {item.medicalRecordId ? `  ·  Prontuário ${item.medicalRecordId}` : ""}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
                </View>
              </GlassCard>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    gap: 8,
    height: 46,
  },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  addBtn: { width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  muted: { fontFamily: "Inter_500Medium" },
  empty: { fontFamily: "Inter_600SemiBold", fontSize: 16, marginTop: 12 },
  emptyHint: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  itemMeta: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
});
