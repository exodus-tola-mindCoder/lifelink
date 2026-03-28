import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppLogo } from "../components/AppLogo";
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
        <View style={styles.topSpace} />

        <View style={styles.heroSection}>
          <AppLogo size="lg" subtitle="Emergency Blood Network" />
        </View>

        <View style={styles.pickerWrap}>
          <View style={styles.pickerContainer}>
            <Pressable
              style={[styles.pickerButton, styles.pickerDonor]}
              onPress={() => void pickRole("donor")}
            >
              <Text style={styles.pickerDonorText}>Donor Mode</Text>
            </Pressable>
            <Pressable
              style={[styles.pickerButton, styles.pickerHospital]}
              onPress={() => void pickRole("hospital")}
            >
              <Text style={styles.pickerHospitalText}>Hospital Mode</Text>
            </Pressable>
          </View>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: theme.colors.background,
    alignItems: "center"
  },
  topSpace: {
    flex: 1
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 40
  },
  pickerWrap: {
    width: "100%",
    alignItems: "center",
    marginBottom: 60
  },
  pickerContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    padding: 4,
    width: "100%",
    height: 56
  },
  pickerButton: {
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  pickerDonor: {
    backgroundColor: "#2E7D5A"
  },
  pickerDonorText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16
  },
  pickerHospital: {
    backgroundColor: "#3B5270"
  },
  pickerHospitalText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16
  },
  demoCard: {
    width: "100%",
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
