import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

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
      <View style={styles.header}>
        <Text style={styles.title}>Register {selectedRole === "donor" ? "Donor" : "Hospital"}</Text>
        <Text style={styles.subtitle}>Set up your profile for faster emergency matching.</Text>
      </View>
      <View style={styles.form}>
        <FormField label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
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

        {selectedRole === "donor" ? (
          <View>
            <Text style={styles.fieldLabel}>BLOOD TYPE</Text>
            <View style={styles.pillWrap}>
              {bloodTypes.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setBloodType(type)}
                  style={[styles.pill, bloodType === type && styles.pillActive]}
                >
                  <Text style={[styles.pillText, bloodType === type && styles.pillTextActive]}>{type}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FormField
            label="Facility"
            value={facility}
            onChangeText={setFacility}
            placeholder="Main branch"
          />
        )}

        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttonGroup}>
          <PrimaryButton label="Sign Up" onPress={() => void onSubmit()} loading={loading} />
          <PrimaryButton label="Back to Sign In" variant="outline" onPress={() => navigation.goBack()} />
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
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl
  },
  fieldLabel: {
    color: theme.colors.primary,
    fontWeight: "700",
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: theme.spacing.sm
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  pill: {
    borderWidth: 1,
    borderBottomWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.none,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface
  },
  pillActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 2
  },
  pillText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 15
  },
  pillTextActive: {
    color: "#FFFFFF"
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
