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
      <View style={styles.header}>
        <Text style={styles.title}>Access {selectedRole === "donor" ? "Donor" : "Hospital"} Portal</Text>
        <Text style={styles.subtitle}>Enter your credentials to coordinate response actions.</Text>
      </View>

      <View style={styles.form}>
        <FormField
          label="Email Address"
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
          placeholder="Minimum 6 characters"
        />
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttonGroup}>
          <PrimaryButton label="Sign In" onPress={() => void onSubmit()} loading={loading} />
          <PrimaryButton
            label="Create Account"
            variant="outline"
            onPress={() => navigation.navigate("Signup")}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    paddingLeft: 16
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: -1
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.mutedText,
    lineHeight: 24,
    fontSize: 16
  },
  form: {
    gap: theme.spacing.lg
  },
  buttonGroup: {
    marginTop: 16,
    gap: theme.spacing.md
  },
  error: {
    color: theme.colors.danger,
    fontWeight: "700",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger
  }
});
