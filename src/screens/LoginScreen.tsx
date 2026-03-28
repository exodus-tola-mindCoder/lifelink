import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { useApp } from "../context/AppContext";
import { theme } from "../theme/theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { login, loading, error, clearError, selectedRole } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | undefined>(undefined);

  useEffect(() => {
    clearError();
  }, [clearError]);

  async function onSubmit() {
    setFormError(undefined);

    if (!email.trim() || !password.trim()) {
      setFormError("Email and password are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }

    await login({ email, password });
  }

  return (
    <Screen>
      <View style={styles.logoRow}>
        <View style={styles.logoSmall}>
          <View style={styles.logoDrop} />
        </View>
        <Text style={styles.logoText}>LifeLink</Text>
      </View>

      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>
        Enter your credentials to continue as {selectedRole === "donor" ? "Donor" : "Hospital"}.
      </Text>

      <View style={styles.card}>
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter your password"
        />
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttonGroup}>
          <PrimaryButton label="LOGIN" onPress={() => void onSubmit()} loading={loading} />
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Create a new account"
          variant="outline"
          onPress={() => navigation.navigate("Signup")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 32
  },
  logoSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  logoDrop: {
    width: 12,
    height: 14,
    borderRadius: 6,
    backgroundColor: "#FFFFFF"
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.primary
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 6
  },
  subtitle: {
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    gap: theme.spacing.md,
    ...theme.shadow.card
  },
  buttonGroup: {
    marginTop: 8
  },
  footer: {
    marginTop: 20
  },
  error: {
    color: theme.colors.danger,
    fontWeight: "600",
    fontSize: 13,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: theme.radius.sm,
    overflow: "hidden"
  }
});
