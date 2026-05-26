import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { useColors } from "@/hooks/useColors";
import { Field } from "@/components/Field";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const loading = fetchStatus === "fetching";

  const handleSubmit = async () => {
    setLocalError(null);
    try {
      const { error } = await signIn.password({ emailAddress: email, password });
      if (error) {
        setLocalError(error.message ?? "Não foi possível entrar.");
        return;
      }
      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: () => router.replace("/(tabs)"),
        });
      } else {
        setLocalError("Verificação adicional necessária. Acesse a versão web.");
      }
    } catch (e: any) {
      setLocalError(e?.message ?? "Não foi possível entrar.");
    }
  };

  const fieldError =
    errors?.fields?.identifier?.message ||
    errors?.fields?.password?.message ||
    errors?.global?.[0]?.message ||
    localError;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.brand}>IDALIA</Text>
        <Text style={styles.tagline}>
          Calculadoras obstétricas e gestão de pacientes
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.foreground }]}>Entrar</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Acesse sua conta IDALIA
          </Text>

          <View style={{ gap: 14, marginTop: 18 }}>
            <Field
              label="E-mail"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
            />
            <Field
              label="Senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
            />
            {fieldError ? (
              <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium" }}>
                {fieldError}
              </Text>
            ) : null}
          </View>

          <View style={{ marginTop: 24, gap: 12 }}>
            <PrimaryButton
              label={loading ? "Entrando..." : "Entrar"}
              onPress={handleSubmit}
              loading={loading}
              disabled={!email || !password}
            />
            <View style={styles.row}>
              <Text style={{ color: colors.mutedForeground }}>Não tem conta? </Text>
              <Link href="/(auth)/sign-up" replace>
                <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
                  Criar conta
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingTop: 80, paddingBottom: 36, paddingHorizontal: 24 },
  brand: { fontFamily: "Inter_700Bold", fontSize: 36, color: "#fff", letterSpacing: 4 },
  tagline: {
    fontFamily: "Inter_500Medium",
    color: "#fff",
    opacity: 0.9,
    marginTop: 6,
    fontSize: 14,
  },
  form: { padding: 24, paddingBottom: 60 },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
});
