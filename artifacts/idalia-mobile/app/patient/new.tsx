import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { GlassCard } from "@/components/GlassCard";
import { Field } from "@/components/Field";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/hooks/useColors";
import { createPatient } from "@/lib/api";

export default function NewPatient() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [mrn, setMrn] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Informe o nome da paciente");
      return;
    }
    setSaving(true);
    try {
      const ageNum = age ? parseInt(age, 10) : null;
      const created = await createPatient({
        name: name.trim(),
        age: Number.isFinite(ageNum as number) ? (ageNum as number) : null,
        medicalRecordId: mrn.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      await queryClient.invalidateQueries({ predicate: (q) => {
        const key = q.queryKey?.[0];
        return typeof key === "string" && key.includes("/patients");
      }});
      router.replace(`/patient/${created.id}`);
    } catch (e: any) {
      setError(e?.message || "Não foi possível criar a paciente");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nova paciente",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
          <GlassCard>
            <View style={{ gap: 14 }}>
              <Field
                label="Nome completo"
                value={name}
                onChangeText={setName}
                placeholder="Ex.: Ana Maria Souza"
                autoCapitalize="words"
              />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Idade"
                    value={age}
                    onChangeText={setAge}
                    placeholder="32"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 2 }}>
                  <Field
                    label="Prontuário"
                    value={mrn}
                    onChangeText={setMrn}
                    placeholder="Opcional"
                  />
                </View>
              </View>
              <Field
                label="Observações"
                value={notes}
                onChangeText={setNotes}
                placeholder="Histórico, alergias, etc."
                multiline
                numberOfLines={4}
                style={{ minHeight: 100, textAlignVertical: "top" }}
              />
              {error ? (
                <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium" }}>
                  {error}
                </Text>
              ) : null}
              <PrimaryButton
                label={saving ? "Salvando..." : "Cadastrar paciente"}
                onPress={submit}
                loading={saving}
                disabled={!name.trim()}
              />
            </View>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({});
