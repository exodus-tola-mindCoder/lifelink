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
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>HOSPITAL COMMAND</Text>
          <Text style={styles.sub}>
            <Text style={styles.name}>{currentUser?.name}</Text>
            {"\n"}Publish and track emergency requests.
          </Text>
        </View>
        <PrimaryButton label="Logout" onPress={() => void logout()} variant="outline" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NEW EMERGENCY REQUEST</Text>
        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>BLOOD TYPE</Text>
            <View style={styles.optionRow}>
              {bloodTypes.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setBloodType(type)}
                  style={[styles.option, bloodType === type && styles.optionActive]}
                >
                  <Text style={[styles.optionText, bloodType === type && styles.optionTextActive]}>{type}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>URGENCY</Text>
            <View style={styles.optionRow}>
              {urgencyLevels.map((level) => (
                <Pressable
                  key={level}
                  onPress={() => setUrgency(level)}
                  style={[styles.option, urgency === level && styles.optionActive]}
                >
                  <Text style={[styles.optionText, urgency === level && styles.optionTextActive]}>
                    {level.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>RADIUS: {radiusKm} KM</Text>
            <View style={styles.optionRow}>
              {[5, 8, 10].map((km) => (
                <Pressable
                  key={km}
                  onPress={() => setRadiusKm(km)}
                  style={[styles.option, radiusKm === km && styles.optionActive]}
                >
                  <Text style={[styles.optionText, radiusKm === km && styles.optionTextActive]}>
                    {km} KM
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 8 }}>
            <PrimaryButton label="PUBLISH REQUEST" loading={saving} onPress={() => void submitRequest()} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACTIVE REQUESTS</Text>
        {ownRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>NO ACTIVE REQUESTS.</Text>
          </View>
        ) : (
          ownRequests.map((request) => (
            <View key={request.id} style={styles.requestItem}>
              <View style={styles.requestTop}>
                <View>
                  <Text style={styles.requestType}>{request.bloodType}</Text>
                  <Text style={styles.requestUrgency}>URGENCY: {request.urgency.toUpperCase()}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text
                    style={[
                      styles.status,
                      request.status === "fulfilled" ? styles.statusDone : styles.statusOpen
                    ]}
                  >
                    {request.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.requestBody}>
                <Text style={styles.requestMeta}>
                  <Text style={styles.metaLabel}>MATCHED:</Text> {request.matchedCount}   <Text style={styles.metaLabel}>RESPONDED:</Text> {request.responderIds.length}
                </Text>
                <Text style={styles.requestMeta}>
                  <Text style={styles.metaLabel}>TRANSPORT:</Text> KES {request.suggestedTransportAmount}
                </Text>
              </View>
              {request.status === "open" ? (
                <PrimaryButton
                  label="MARK AS FULFILLED"
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
  section: {
    marginBottom: theme.spacing.xxl,
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
  formCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.xl
  },
  fieldGroup: {
    gap: 12
  },
  label: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: "700",
    letterSpacing: 1
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  option: {
    borderWidth: 1,
    borderBottomWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.none,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface
  },
  optionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.accent,
    borderBottomWidth: 2
  },
  optionText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.5
  },
  optionTextActive: {
    color: "#FFFFFF"
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
  requestItem: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: theme.colors.border,
    borderLeftColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg
  },
  requestTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 12
  },
  requestType: {
    fontSize: 32,
    fontWeight: "900",
    color: theme.colors.accent,
    letterSpacing: -1
  },
  requestUrgency: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: 1,
    marginTop: 4
  },
  requestBody: {
    gap: 8
  },
  requestMeta: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "500"
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: theme.colors.mutedText
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  status: {
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 1
  },
  statusOpen: {
    color: theme.colors.warning
  },
  statusDone: {
    color: theme.colors.success
  }
});
