import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { AppLogo } from "../components/AppLogo";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { useApp } from "../context/AppContext";
import { theme } from "../theme/theme";
import type { BloodType } from "../types/models";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

const bloodTypes: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function SignupScreen({ navigation }: Props) {
  const { selectedRole, signUp, loading, error } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bloodType, setBloodType] = useState<BloodType>("O+");
  const [facility, setFacility] = useState("");
  const [formError, setFormError] = useState<string | undefined>(undefined);

  async function onSubmit() {
    setFormError(undefined);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError("Please fill all required fields.");
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setFormError("Please enter a valid email format.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password should be at least 6 characters.");
      return;
    }

    if (selectedRole === "hospital" && !facility.trim()) {
      setFormError("Hospital facility is required.");
      return;
    }

    const success = await signUp({
      role: selectedRole,
      name,
      email,
      password,
      bloodType: selectedRole === "donor" ? bloodType : undefined,
      facility: selectedRole === "hospital" ? facility : undefined
    });

    if (!success) {
      return;
    }
  }

  return (
    <Screen>
      <View style={styles.logoWrap}>
        <AppLogo size="sm" />
      </View>

      <Text style={styles.title}>
        {selectedRole === "donor" ? "Blood Donor" : "Hospital"} Registration
      </Text>
      <Text style={styles.subtitle}>
        Join the LifeLink network and help save lives.
      </Text>

      <View style={styles.card}>
        <FormField label="Name" value={name} onChangeText={setName} placeholder="First name, Surname" />
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

        {selectedRole === "donor" ? (
          <View>
            <Text style={styles.fieldLabel}>Select blood group</Text>
            <View style={styles.pillWrap}>
              {bloodTypes.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setBloodType(type)}
                  style={[styles.pill, bloodType === type && styles.pillActive]}
                >
                  <Text style={[styles.pillText, bloodType === type && styles.pillTextActive]}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FormField
            label="Facility"
            value={facility}
            onChangeText={setFacility}
            placeholder="Hospital name"
          />
        )}

        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttonGroup}>
          <PrimaryButton label="REGISTER" onPress={() => void onSubmit()} loading={loading} />
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Already have an account? Sign in"
          variant="outline"
          onPress={() => navigation.goBack()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    alignItems: "flex-start",
    marginBottom: 20
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 6
  },
  subtitle: {
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    gap: theme.spacing.md,
    ...theme.shadow.card
  },
  fieldLabel: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "600",
    marginBottom: 10
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  pill: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    minWidth: 52,
    alignItems: "center"
  },
  pillActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary
  },
  pillText: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 15
  },
  pillTextActive: {
    color: "#FFFFFF"
  },
  buttonGroup: {
    marginTop: 8
  },
  footer: {
    marginTop: 20,
    marginBottom: theme.spacing.xl
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
