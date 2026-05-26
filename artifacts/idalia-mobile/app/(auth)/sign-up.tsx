import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { useColors } from "@/hooks/useColors";
import { Field } from "@/components/Field";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const loading = fetchStatus === "fetching";

  const needsVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields?.includes("email_address") &&
    (signUp.missingFields?.length ?? 0) === 0;

  const handleSubmit = async () => {
    setLocalError(null);
    try {
      const [first, ...rest] = fullName.trim().split(" ");
      const { error } = await signUp.password({
        emailAddress: email,
        password,
        firstName: first || undefined,
        lastName: rest.length ? rest.join(" ") : undefined,
      });
      if (error) {
        setLocalError(error.message ?? "Não foi possível criar a conta.");
        return;
      }
      await signUp.verifications.sendEmailCode();
    } catch (e: any) {
      setLocalError(e?.message ?? "Não foi possível criar a conta.");
    }
  };

  const handleVerify = async () => {
    setLocalError(null);
    try {
      await signUp.verifications.verifyEmailCode({ code });
      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: () => router.replace("/(tabs)"),
        });
      } else {
        setLocalError("Verificação incompleta. Tente novamente.");
      }
    } catch (e: any) {
      setLocalError(e?.message ?? "Código inválido.");
    }
  };

  const fieldError =
    errors?.fields?.emailAddress?.message ||
    errors?.fields?.password?.message ||
    errors?.fields?.code?.message ||
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
        <Text style={styles.tagline}>Crie sua conta</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          {!needsVerification ? (
            <>
              <Text style={[styles.title, { color: colors.foreground }]}>Criar conta</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                Comece a usar as calculadoras IDALIA
              </Text>

              <View style={{ gap: 14, marginTop: 18 }}>
                <Field
                  label="Nome completo"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Dra. Maria Silva"
                  autoCapitalize="words"
                />
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
                  placeholder="Mínimo 8 caracteres"
                  hint="Use uma senha forte com letras, números e símbolos"
                />
                {fieldError ? (
                  <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium" }}>
                    {fieldError}
                  </Text>
                ) : null}
              </View>

              <View style={{ marginTop: 24, gap: 12 }}>
                <PrimaryButton
                  label={loading ? "Criando..." : "Criar conta"}
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!email || !password || !fullName}
                />
                <View style={styles.row}>
                  <Text style={{ color: colors.mutedForeground }}>Já tem conta? </Text>
                  <Link href="/(auth)/sign-in" replace>
                    <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
                      Entrar
                    </Text>
                  </Link>
                </View>
              </View>

              <View nativeID="clerk-captcha" />
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.foreground }]}>
                Verificar e-mail
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                Enviamos um código para {email}
              </Text>
              <View style={{ marginTop: 18, gap: 14 }}>
                <Field
                  label="Código de verificação"
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  keyboardType="number-pad"
                />
                {fieldError ? (
                  <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium" }}>
                    {fieldError}
                  </Text>
                ) : null}
                <PrimaryButton
                  label={loading ? "Verificando..." : "Verificar"}
                  onPress={handleVerify}
                  loading={loading}
                  disabled={!code}
                />
              </View>
            </>
          )}
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
