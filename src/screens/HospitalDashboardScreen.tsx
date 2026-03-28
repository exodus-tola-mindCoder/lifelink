import { StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { useApp } from "../context/AppContext";
import { theme } from "../theme/theme";
import type { BloodType, UrgencyLevel } from "../types/models";

const bloodTypes: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const urgencyLevels: UrgencyLevel[] = ["low", "medium", "high", "critical"];

export function HospitalDashboardScreen() {
  const { currentUser, requests, createRequest, markFulfilled, logout } = useApp();

  const [bloodType, setBloodType] = useState<BloodType>("O+");
  const [urgency, setUrgency] = useState<UrgencyLevel>("high");
  const [radiusKm, setRadiusKm] = useState(8);
  const [saving, setSaving] = useState(false);

  const ownRequests = useMemo(
    () => requests.filter((request) => request.hospitalId === currentUser?.id),
    [requests, currentUser]
  );

  async function submitRequest() {
    setSaving(true);
    await createRequest({ bloodType, urgency, radiusKm });
    setSaving(false);
  }

  return (
    <Screen>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Welcome, {currentUser?.name}</Text>
          <Text style={styles.sub}>Create blood emergencies and track live donor responses.</Text>
        </View>
        <PrimaryButton label="Logout" onPress={() => void logout()} variant="outline" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>New Emergency Request</Text>

        <Text style={styles.label}>Blood Type</Text>
        <View style={styles.optionRow}>
          {bloodTypes.map((type) => (
            <Text
              key={type}
              style={[styles.option, bloodType === type && styles.optionActive]}
              onPress={() => setBloodType(type)}
            >
              {type}
            </Text>
          ))}
        </View>

        <Text style={styles.label}>Urgency</Text>
        <View style={styles.optionRow}>
          {urgencyLevels.map((level) => (
            <Text
              key={level}
              style={[styles.option, urgency === level && styles.optionActive]}
              onPress={() => setUrgency(level)}
            >
              {level.toUpperCase()}
            </Text>
          ))}
        </View>

        <Text style={styles.label}>Radius: {radiusKm} km</Text>
        <View style={styles.optionRow}>
          {[5, 8, 10].map((km) => (
            <Text
              key={km}
              style={[styles.option, radiusKm === km && styles.optionActive]}
              onPress={() => setRadiusKm(km)}
            >
              {km}km
            </Text>
          ))}
        </View>

        <PrimaryButton label="Create Request" loading={saving} onPress={() => void submitRequest()} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Requests</Text>
        {ownRequests.length === 0 ? (
          <Text style={styles.empty}>No requests yet. Create one to notify nearby donors.</Text>
        ) : (
          ownRequests.map((request) => (
            <View key={request.id} style={styles.requestItem}>
              <View style={styles.requestTop}>
                <Text style={styles.requestTitle}>
                  {request.bloodType} • {request.urgency.toUpperCase()}
                </Text>
                <Text
                  style={[
                    styles.status,
                    request.status === "fulfilled" ? styles.statusDone : styles.statusOpen
                  ]}
                >
                  {request.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.requestMeta}>
                Nearby donors: {request.matchedCount} • Responses: {request.responderIds.length}
              </Text>
              <Text style={styles.requestMeta}>
                Suggested transport: KES {request.suggestedTransportAmount}
              </Text>
              {request.status === "open" ? (
                <PrimaryButton
                  label="Mark as Fulfilled"
                  variant="outline"
                  onPress={() => void markFulfilled(request.id)}
                />
              ) : null}
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    backgroundColor: "#fff",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text
  },
  label: {
    marginTop: 6,
    color: theme.colors.text,
    fontWeight: "600"
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs
  },
  option: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: "#fff",
    color: theme.colors.text,
    overflow: "hidden"
  },
  optionActive: {
    backgroundColor: "#FFEDEE",
    borderColor: theme.colors.primary,
    color: theme.colors.primaryDark
  },
  empty: {
    color: theme.colors.mutedText
  },
  requestItem: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    gap: 8
  },
  requestTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  requestTitle: {
    fontWeight: "700",
    color: theme.colors.text
  },
  requestMeta: {
    color: theme.colors.mutedText
  },
  status: {
    fontWeight: "700",
    fontSize: 12
  },
  statusOpen: {
    color: theme.colors.warning
  },
  statusDone: {
    color: theme.colors.success
  }
});
