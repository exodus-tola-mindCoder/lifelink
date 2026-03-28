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
    <Screen>
      <View style={styles.centered}>
        <Text style={styles.title}>LifeLink</Text>
        <Text style={styles.subtitle}>
          Real-time emergency blood support connecting hospitals and nearby donors.
        </Text>
      </View>

      <View style={styles.block}>
        <PrimaryButton label="Continue as Donor" onPress={() => void pickRole("donor")} />
        <PrimaryButton
          label="Continue as Hospital"
          onPress={() => void pickRole("hospital")}
          variant="outline"
        />
      </View>

      <Text style={styles.demo}>
        Demo accounts:
        {"\n"}Donor: donor.a@lifelink.app / password123
        {"\n"}Hospital: hospital@lifelink.app / password123
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    marginTop: 44,
    gap: theme.spacing.sm
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: theme.colors.primary
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22
  },
  block: {
    marginTop: 42,
    gap: theme.spacing.md
  },
  demo: {
    marginTop: 36,
    borderRadius: theme.radius.md,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    color: theme.colors.mutedText
  }
});
