import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";

import { AppLogo } from "../components/AppLogo";
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
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <LinearGradient colors={["#FFE4E6", "#FFFFFF"]} style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <AppLogo size="sm" />
          <PrimaryButton label="Logout" onPress={() => void logout()} variant="outline" size="sm" />
        </View>
        <Text style={styles.pageTitle}>New Blood Request</Text>
      </LinearGradient>

      <Screen scroll={true} padded={true}>
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
          <View style={styles.segmentedControl}>
            {urgencyLevels.map((level, i) => {
              const isActive = urgency === level;
              return (
                <Pressable
                  key={level}
                  onPress={() => setUrgency(level)}
                  style={[
                    styles.segmentButton,
                    isActive && styles.segmentActive,
                    i === 0 && styles.segmentFirst,
                    i === urgencyLevels.length - 1 && styles.segmentLast
                  ]}
                >
                  <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Search Radius: {radiusKm} km</Text>
          <View style={styles.chipRow}>
            {[5, 8, 10, 15].map((km) => (
              <Pressable
                key={km}
                onPress={() => setRadiusKm(km)}
                style={[styles.chip, radiusKm === km && styles.chipActive]}
              >
                <Text style={[styles.chipText, radiusKm === km && styles.chipTextActive]}>
                  {km}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <PrimaryButton label="Broadcast Request" loading={saving} onPress={() => void submitRequest()} />
        </View>

        <Text style={styles.sectionTitle}>Active Requests</Text>

        {ownRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active requests.</Text>
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
                <View style={{ marginTop: 8 }}>
                  <PrimaryButton
                    label="Mark as Fulfilled"
                    variant="outline"
                    onPress={() => void markFulfilled(request.id)}
                    size="sm"
                  />
                </View>
              ) : null}
            </View>
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.text
  },
  fieldGroup: {
    gap: 12,
    marginBottom: 24
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    minWidth: 56
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  chipText: {
    color: theme.colors.text,
    fontWeight: "600",
    fontSize: 15
  },
  chipTextActive: {
    color: "#FFFFFF"
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden"
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border
  },
  segmentFirst: {
    borderLeftWidth: 0
  },
  segmentLast: {},
  segmentActive: {
    backgroundColor: "#FEE2E2"
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.mutedText
  },
  segmentTextActive: {
    color: theme.colors.primaryDark
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 32,
    marginBottom: 16
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: "dashed"
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.mutedText
  },
  requestCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 10,
    marginBottom: 16,
    ...theme.shadow.card
  },
  requestTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  requestBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  requestBadgeText: {
    color: theme.colors.primaryDark,
    fontWeight: "800",
    fontSize: 16
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
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
