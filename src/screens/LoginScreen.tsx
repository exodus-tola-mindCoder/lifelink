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
      <Text style={styles.title}>Sign in as {selectedRole === "donor" ? "Donor" : "Hospital"}</Text>
      <Text style={styles.subtitle}>Use your account to continue to the dashboard.</Text>

      <View style={styles.form}>
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
          placeholder="Minimum 6 characters"
        />
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton label="Sign in" onPress={() => void onSubmit()} loading={loading} />
      </View>

      <PrimaryButton
        label="Create a new account"
        variant="outline"
        onPress={() => navigation.navigate("Signup")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.text
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.mutedText
  },
  form: {
    marginTop: 30,
    gap: theme.spacing.md,
    marginBottom: 16
  },
  error: {
    color: theme.colors.primaryDark,
    fontWeight: "600"
  }
});
