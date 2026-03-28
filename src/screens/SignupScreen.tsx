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
      <Text style={styles.title}>Create {selectedRole === "donor" ? "Donor" : "Hospital"} account</Text>
      <View style={styles.form}>
        <FormField label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
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
            <Text style={styles.fieldLabel}>Blood type</Text>
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

        <PrimaryButton label="Sign up" onPress={() => void onSubmit()} loading={loading} />
      </View>
      <PrimaryButton label="Already have an account? Sign in" variant="outline" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.text
  },
  form: {
    marginTop: 20,
    gap: theme.spacing.md,
    marginBottom: 16
  },
  fieldLabel: {
    color: theme.colors.text,
    fontWeight: "600",
    marginBottom: theme.spacing.xs
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  pill: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#fff"
  },
  pillActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "#FFEDEE"
  },
  pillText: {
    color: theme.colors.text,
    fontWeight: "600"
  },
  pillTextActive: {
    color: theme.colors.primaryDark
  },
  error: {
    color: theme.colors.primaryDark,
    fontWeight: "600"
  }
});
