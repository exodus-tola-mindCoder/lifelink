import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { useApp } from "../context/AppContext";
import { theme } from "../theme/theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  const { setSelectedRole } = useApp();

  async function pickRole(role: "donor" | "hospital") {
    await setSelectedRole(role);
    navigation.navigate("Login");
  }

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.accentLine} />
          <Text style={styles.eyebrow}>CRITICAL RESPONSE</Text>
          <Text style={styles.title}>LifeLink.</Text>
          <Text style={styles.subtitle}>
            A real-time synchronization layer for emergency blood logistics.
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.block}>
            <PrimaryButton label="Sign in as Donor" onPress={() => void pickRole("donor")} />
            <PrimaryButton
              label="Sign in as Hospital"
              onPress={() => void pickRole("hospital")}
              variant="outline"
            />
          </View>

          <View style={styles.demoCard}>
            <Text style={styles.demoLabel}>DEMO CREDENTIALS</Text>
            <View style={styles.demoRow}>
              <Text style={styles.demoRole}>Donor</Text>
              <Text style={styles.demoCreds}>donor.a@lifelink.app / password123</Text>
            </View>
            <View style={styles.demoRow}>
              <Text style={styles.demoRole}>Hospital</Text>
              <Text style={styles.demoCreds}>hospital@lifelink.app / password123</Text>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 80,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  topSection: {
    gap: theme.spacing.sm,
  },
  accentLine: {
    width: 48,
    height: 4,
    backgroundColor: theme.colors.accent,
    marginBottom: theme.spacing.md,
  },
  eyebrow: {
    color: theme.colors.accent,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    fontSize: 56,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: -2,
    lineHeight: 60,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.mutedText,
    lineHeight: 26,
    marginTop: 8,
    maxWidth: 320,
    fontWeight: "400",
  },
  bottomSection: {
    gap: theme.spacing.xl,
  },
  block: {
    gap: theme.spacing.md,
  },
  demoCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  demoLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.mutedText,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  demoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
  },
  demoRole: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  demoCreds: {
    fontSize: 13,
    color: theme.colors.mutedText,
    fontFamily: "monospace",
  },
});
