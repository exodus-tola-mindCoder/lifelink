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
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser?.name?.charAt(0)?.toUpperCase() ?? "D"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{currentUser?.name}</Text>
          </View>
        </View>
        <PrimaryButton label="Logout" onPress={() => void logout()} variant="outline" />
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusLeft}>
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodType}>{currentUser?.bloodType}</Text>
          </View>
          <View>
            <Text style={styles.statusLabel}>
              {currentUser?.availability ? "On Duty" : "Off Duty"}
            </Text>
            <Text style={styles.statusMeta}>Toggle your availability</Text>
          </View>
        </View>
        <Switch
          value={Boolean(currentUser?.availability)}
          onValueChange={(next) => void updateAvailability(next)}
          trackColor={{ false: "#E7E5E4", true: "#FECACA" }}
          thumbColor={currentUser?.availability ? theme.colors.primary : "#D6D3D1"}
        />
      </View>

      <Text style={styles.sectionTitle}>Emergency Alerts</Text>

      {donorMatches.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>+</Text>
          <Text style={styles.emptyText}>No active requests nearby</Text>
          <Text style={styles.emptyHint}>Stay on duty — you will be notified instantly.</Text>
        </View>
      ) : (
        donorMatches.map((request) => (
          <View key={request.id} style={styles.alertCard}>
            <View style={styles.alertTop}>
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{request.bloodType}</Text>
              </View>
              <View style={styles.urgencyBadge}>
                <Text style={styles.urgencyText}>{request.urgency.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.alertHospital}>{request.hospitalName}</Text>
            <Text style={styles.alertMeta}>
              Transport support: KES {request.suggestedTransportAmount}
            </Text>
            <PrimaryButton label="I'm Available" onPress={() => void handleAvailable(request.id)} />
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
    marginBottom: theme.spacing.lg
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800"
  },
  greeting: {
    fontSize: 14,
    color: theme.colors.mutedText
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.card
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  bloodBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  bloodType: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.primary
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text
  },
  statusMeta: {
    fontSize: 13,
    color: theme.colors.mutedText,
    marginTop: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 40,
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: "dashed"
  },
  emptyIcon: {
    fontSize: 32,
    color: theme.colors.border,
    fontWeight: "300"
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text
  },
  emptyHint: {
    fontSize: 13,
    color: theme.colors.mutedText,
    textAlign: "center"
  },
  alertCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadow.card
  },
  alertTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  alertBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  alertBadgeText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18
  },
  urgencyBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.warning
  },
  alertHospital: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 4
  },
  alertMeta: {
    fontSize: 14,
    color: theme.colors.mutedText,
    marginBottom: 4
  }
});
