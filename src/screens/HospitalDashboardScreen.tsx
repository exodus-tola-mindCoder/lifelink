import { Pressable, StyleSheet, Text, View } from "react-native";
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser?.name?.charAt(0)?.toUpperCase() ?? "H"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{currentUser?.name}</Text>
          </View>
        </View>
        <PrimaryButton label="Logout" onPress={() => void logout()} variant="outline" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Post a Blood Donation Request</Text>
        <Text style={styles.cardSub}>Request blood to thousands of nearby users.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Blood Type</Text>
          <View style={styles.chipRow}>
            {bloodTypes.map((type) => (
              <Pressable
                key={type}
                onPress={() => setBloodType(type)}
                style={[styles.chip, bloodType === type && styles.chipActive]}
              >
                <Text style={[styles.chipText, bloodType === type && styles.chipTextActive]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Urgency Level</Text>
          <View style={styles.chipRow}>
            {urgencyLevels.map((level) => (
              <Pressable
                key={level}
                onPress={() => setUrgency(level)}
                style={[styles.chip, urgency === level && styles.chipActive]}
              >
                <Text style={[styles.chipText, urgency === level && styles.chipTextActive]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Search Radius: {radiusKm} km</Text>
          <View style={styles.chipRow}>
            {[5, 8, 10].map((km) => (
              <Pressable
                key={km}
                onPress={() => setRadiusKm(km)}
                style={[styles.chip, radiusKm === km && styles.chipActive]}
              >
                <Text style={[styles.chipText, radiusKm === km && styles.chipTextActive]}>
                  {km} km
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <PrimaryButton label="Get Started" loading={saving} onPress={() => void submitRequest()} />
      </View>

      <Text style={styles.sectionTitle}>Active Requests</Text>

      {ownRequests.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No requests yet</Text>
          <Text style={styles.emptyHint}>Post a request to notify nearby donors.</Text>
        </View>
      ) : (
        ownRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestTop}>
              <View style={styles.requestBadge}>
                <Text style={styles.requestBadgeText}>{request.bloodType}</Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  request.status === "fulfilled" ? styles.statusDone : styles.statusOpen
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    request.status === "fulfilled" ? styles.statusDoneText : styles.statusOpenText
                  ]}
                >
                  {request.status === "fulfilled" ? "Fulfilled" : "Open"}
                </Text>
              </View>
            </View>
            <Text style={styles.requestMeta}>
              Urgency: {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
            </Text>
            <Text style={styles.requestMeta}>
              Matched: {request.matchedCount} donors  ·  Responded: {request.responderIds.length}
            </Text>
            <Text style={styles.requestMeta}>
              Transport: KES {request.suggestedTransportAmount}
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.card
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text
  },
  cardSub: {
    fontSize: 14,
    color: theme.colors.mutedText,
    marginTop: -12
  },
  fieldGroup: {
    gap: 10
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    alignItems: "center"
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  chipText: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 14
  },
  chipTextActive: {
    color: "#FFFFFF"
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
    gap: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    marginBottom: theme.spacing.lg
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text
  },
  emptyHint: {
    fontSize: 13,
    color: theme.colors.mutedText
  },
  requestCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    ...theme.shadow.card
  },
  requestTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  requestBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  requestBadgeText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18
  },
  statusPill: {
    borderRadius: theme.radius.full,
    paddingHorizontal: 14,
    paddingVertical: 4
  },
  statusOpen: {
    backgroundColor: "#FEF3C7"
  },
  statusDone: {
    backgroundColor: "#DCFCE7"
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700"
  },
  statusOpenText: {
    color: theme.colors.warning
  },
  statusDoneText: {
    color: theme.colors.success
  },
  requestMeta: {
    fontSize: 14,
    color: theme.colors.mutedText
  }
});
