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
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBg}>
              <View style={styles.logoCircle}>
                <View style={styles.logoDrop} />
              </View>
            </View>
          </View>

          <Text style={styles.appName}>LifeLink</Text>
          <Text style={styles.tagline}>
            Connect with blood donors nearby.{"\n"}Save lives in real-time.
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.buttons}>
            <PrimaryButton label="Continue as Donor" onPress={() => void pickRole("donor")} />
            <PrimaryButton
              label="Continue as Hospital"
              onPress={() => void pickRole("hospital")}
              variant="outline"
            />
          </View>

          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>Demo Credentials</Text>
            <Text style={styles.demoCreds}>
              Donor: donor.a@lifelink.app / password123
            </Text>
            <Text style={styles.demoCreds}>
              Hospital: hospital@lifelink.app / password123
            </Text>
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
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: theme.colors.background,
  },
  heroSection: {
    alignItems: "center",
    gap: theme.spacing.md
  },
  logoContainer: {
    marginBottom: 16
  },
  logoBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  logoDrop: {
    width: 20,
    height: 24,
    borderRadius: 10,
    backgroundColor: "#FFFFFF"
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -1
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.mutedText,
    textAlign: "center",
    lineHeight: 24
  },
  bottomSection: {
    gap: theme.spacing.xl
  },
  buttons: {
    gap: theme.spacing.sm
  },
  demoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: 6,
    ...theme.shadow.card
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4
  },
  demoCreds: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 20
  }
});
