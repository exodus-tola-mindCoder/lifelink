import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Switch, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { useApp } from "../context/AppContext";
import { theme } from "../theme/theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "DonorDashboard">;

export function DonorDashboardScreen({ navigation }: Props) {
  const { currentUser, donorMatches, updateAvailability, respondToRequest, logout } = useApp();

  async function handleAvailable(requestId: string) {
    await respondToRequest(requestId);
    navigation.navigate("Payment", { requestId });
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Welcome back,</Text>
          <Text style={styles.nameTitle}>{currentUser?.name}!</Text>
        </View>
        <PrimaryButton label="Logout" onPress={() => void logout()} variant="outline" size="sm" />
      </View>

      <View style={styles.statusCard}>
        <View>
          <Text style={styles.statusLabel}>
            {currentUser?.availability ? "Available ✨" : "Unavailable"}
          </Text>
        </View>
        <Switch
          value={Boolean(currentUser?.availability)}
          onValueChange={(next) => void updateAvailability(next)}
          trackColor={{ false: "#E5E7EB", true: "#2E7D5A" }}
          thumbColor="#FFFFFF"
          style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
        />
      </View>

      {donorMatches.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No active requests nearby</Text>
          <Text style={styles.emptyHint}>Stay on duty — you will be notified instantly.</Text>
        </View>
      ) : (
        donorMatches.map((request) => (
          <View key={request.id} style={styles.alertCard}>
            <Text style={styles.alertText}>
              URGENT: {request.bloodType} Blood needed at{"\n"}
              {request.hospitalName} - {request.suggestedTransportAmount} KES transport
            </Text>
            <View style={{ marginTop: 12 }}>
              <PrimaryButton
                label="I'm Available"
                onPress={() => void handleAvailable(request.id)}
              />
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
    paddingTop: 10
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text
  },
  nameTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.text
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.card
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text
  },
  emptyHint: {
    fontSize: 14,
    color: theme.colors.mutedText,
    textAlign: "center"
  },
  alertCard: {
    backgroundColor: "#BE223C",
    borderRadius: 20,
    padding: 24,
    marginBottom: theme.spacing.md,
    shadowColor: "#991B1B",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  alertText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 26
  }
});
