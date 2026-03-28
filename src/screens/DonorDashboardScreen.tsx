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
          <Text style={styles.heading}>DONOR CONSOLE</Text>
          <Text style={styles.sub}>
            <Text style={styles.name}>{currentUser?.name}</Text>
            {"\n"}Standby for urgent matches.
          </Text>
        </View>
        <PrimaryButton label="Logout" onPress={() => void logout()} variant="outline" />
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.cardTitle}>STATUS</Text>
            <Text style={styles.meta}>Blood type: {currentUser?.bloodType}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, currentUser?.availability ? styles.statusActive : styles.statusInactive]}>
              {currentUser?.availability ? "ON DUTY" : "OFF DUTY"}
            </Text>
            <Switch
              value={Boolean(currentUser?.availability)}
              onValueChange={(next) => void updateAvailability(next)}
              trackColor={{ false: "#E4E4E7", true: theme.colors.primary }}
              thumbColor={"#FFFFFF"}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EMERGENCY ALERTS</Text>
        {donorMatches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>NO ACTIVE REQUESTS.</Text>
          </View>
        ) : (
          donorMatches.map((request) => (
            <View key={request.id} style={styles.alert}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertType}>{request.bloodType}</Text>
                <Text style={styles.alertUrgency}>
                  URGENCY: {request.urgency.toUpperCase()}
                </Text>
              </View>
              <View style={styles.alertBody}>
                <Text style={styles.alertHospital}>{request.hospitalName}</Text>
                <Text style={styles.alertMeta}>Transport Coverage: KES {request.suggestedTransportAmount}</Text>
              </View>
              <PrimaryButton label="RESPOND NOW" onPress={() => void handleAvailable(request.id)} />
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.primary
  },
  heading: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.accent,
    letterSpacing: 2
  },
  sub: {
    marginTop: 12,
    color: theme.colors.mutedText,
    lineHeight: 24,
    fontSize: 16
  },
  name: {
    color: theme.colors.primary,
    fontWeight: "900",
    fontSize: 24,
    letterSpacing: -1
  },
  card: {
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: 1.5,
    marginBottom: 4
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  statusBadge: {
    alignItems: "flex-end",
    gap: 8
  },
  statusText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1
  },
  statusActive: {
    color: theme.colors.accent
  },
  statusInactive: {
    color: theme.colors.mutedText
  },
  meta: {
    color: theme.colors.mutedText,
    fontSize: 14
  },
  section: {
    gap: theme.spacing.md
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: theme.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F5",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: "dashed"
  },
  emptyText: {
    color: theme.colors.mutedText,
    fontWeight: "700",
    letterSpacing: 2,
    fontSize: 12
  },
  alert: {
    borderWidth: 1,
    borderBottomWidth: 4,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 12
  },
  alertType: {
    fontSize: 32,
    fontWeight: "900",
    color: theme.colors.accent,
    letterSpacing: -1
  },
  alertUrgency: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: 1
  },
  alertBody: {
    gap: 4
  },
  alertHospital: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: -0.5
  },
  alertMeta: {
    fontSize: 15,
    color: theme.colors.mutedText
  }
});
