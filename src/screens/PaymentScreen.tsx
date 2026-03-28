import Checkbox from "expo-checkbox";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";

import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { useApp } from "../context/AppContext";
import { theme } from "../theme/theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Payment">;

export function PaymentScreen({ route }: Props) {
  const { currentUser, requests, payForTransport } = useApp();
  const request = useMemo(
    () => requests.find((item) => item.id === route.params.requestId),
    [requests, route.params.requestId]
  );

  const suggested = request?.suggestedTransportAmount ?? 0;
  const [customAmount, setCustomAmount] = useState(String(suggested));
  const [coverFull, setCoverFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ amount: number; txId: string } | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  if (!request || !currentUser) {
    return (
      <Screen>
        <Text style={styles.title}>Request not found.</Text>
      </Screen>
    );
  }

  const currentRequest = request;
  const donor = currentUser;

  async function payNow() {
    setError(undefined);
    setLoading(true);

    const parsed = Number(customAmount);
    const finalAmount = coverFull ? suggested : parsed;

    if (Number.isNaN(finalAmount) || finalAmount <= 0) {
      setError("Enter a valid amount.");
      setLoading(false);
      return;
    }

    const record = await payForTransport({
      requestId: currentRequest.id,
      donorId: donor.id,
      amount: finalAmount
    });

    setResult({ amount: finalAmount, txId: record.transactionId });
    setLoading(false);
  }

  return (
    <Screen>
      <Text style={styles.title}>M-Pesa Transport Payment</Text>
      <Text style={styles.sub}>
        Emergency: {currentRequest.bloodType} for {currentRequest.hospitalName}
      </Text>

      <View style={styles.card}>
        <FormField
          label="Suggested amount (KES)"
          value={String(suggested)}
          onChangeText={() => undefined}
          editable={false}
        />

        <FormField
          label="Adjust amount (KES)"
          value={customAmount}
          onChangeText={setCustomAmount}
          keyboardType="numeric"
          editable={!coverFull}
        />

        <View style={styles.checkboxRow}>
          <Checkbox value={coverFull} onValueChange={setCoverFull} color={coverFull ? theme.colors.primary : undefined} />
          <Text style={styles.checkboxLabel}>I want to cover full transport expense myself</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton label="Pay with M-Pesa" loading={loading} onPress={() => void payNow()} />
      </View>

      {result ? (
        <View style={styles.success}>
          <Text style={styles.successTitle}>Payment Successful</Text>
          <Text style={styles.successText}>Paid Amount: KES {result.amount}</Text>
          <Text style={styles.successText}>Transaction ID: {result.txId}</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.text
  },
  sub: {
    marginTop: 6,
    color: theme.colors.mutedText
  },
  card: {
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: "#fff",
    padding: theme.spacing.md,
    gap: theme.spacing.md
  },
  checkboxRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "center"
  },
  checkboxLabel: {
    flex: 1,
    color: theme.colors.text
  },
  error: {
    color: theme.colors.primaryDark,
    fontWeight: "600"
  },
  success: {
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    borderRadius: theme.radius.md,
    backgroundColor: "#F0FDF4",
    padding: theme.spacing.md,
    gap: 4
  },
  successTitle: {
    color: theme.colors.success,
    fontSize: 18,
    fontWeight: "800"
  },
  successText: {
    color: "#166534"
  }
});
