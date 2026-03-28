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
          <Text style={styles.heading}>Welcome, {currentUser?.name}</Text>
          <Text style={styles.sub}>Be on standby for urgent donor matches near you.</Text>
        </View>
        <PrimaryButton label="Logout" onPress={() => void logout()} variant="outline" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Availability</Text>
        <View style={styles.row}>
          <Text style={styles.value}>{currentUser?.availability ? "ON" : "OFF"}</Text>
          <Switch
            value={Boolean(currentUser?.availability)}
            onValueChange={(next) => void updateAvailability(next)}
            trackColor={{ false: "#CFD4DC", true: "#FFB4B1" }}
            thumbColor={currentUser?.availability ? theme.colors.primary : "#F9FAFB"}
          />
        </View>
        <Text style={styles.meta}>
          Blood type: {currentUser?.bloodType} • Location used internally for nearby matching.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Emergency Alerts</Text>
        {donorMatches.length === 0 ? (
          <Text style={styles.meta}>No active nearby requests right now.</Text>
        ) : (
          donorMatches.map((request) => (
            <View key={request.id} style={styles.alert}>
              <Text style={styles.alertTitle}>
                {request.hospitalName} needs {request.bloodType}
              </Text>
              <Text style={styles.meta}>
                Urgency: {request.urgency.toUpperCase()} • Nearby donors available
              </Text>
              <Text style={styles.meta}>Suggested transport: KES {request.suggestedTransportAmount}</Text>
              <PrimaryButton label="I'm available" onPress={() => void handleAvailable(request.id)} />
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
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.text
  },
  sub: {
    marginTop: 4,
    color: theme.colors.mutedText
  },
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#fff",
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  value: {
    fontWeight: "700",
    color: theme.colors.primaryDark
  },
  meta: {
    color: theme.colors.mutedText
  },
  alert: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    gap: 8
  },
  alertTitle: {
    fontWeight: "700",
    color: theme.colors.text
  }
});
