import Checkbox from "expo-checkbox";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";

import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { useApp } from "../context/AppContext";
import { generateTransactionId } from "../services/matching";
import { requestMpesaStkPayment } from "../services/mpesaService";
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
  const [phone, setPhone] = useState("");
  const [coverFull, setCoverFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Sending request to M-Pesa...");
  const [result, setResult] = useState<{ amount: number; txId: string; message?: string } | undefined>(
    undefined
  );
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

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function isValidMpesaPhone(value: string): boolean {
    const normalized = value.replace(/\D/g, "");
    return /^2547\d{8}$/.test(normalized) || /^251[79]\d{8}$/.test(normalized);
  }

  async function payNow() {
    setError(undefined);

    const normalizedPhone = phone.replace(/\D/g, "");
    if (!isValidMpesaPhone(normalizedPhone)) {
      setError("Phone must be like 2547XXXXXXXX or 2517/2519XXXXXXXX.");
      return;
    }

    const parsed = Number(customAmount);
    const finalAmount = coverFull ? suggested : parsed;

    if (Number.isNaN(finalAmount) || finalAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    setLoading(true);
    setLoadingMessage("Sending request to M-Pesa...");

    try {
      const apiResponse = await requestMpesaStkPayment({
        phone: normalizedPhone,
        amount: finalAmount
      });

      setLoadingMessage("Awaiting payment confirmation...");
      await sleep(2200);

      const txId = generateTransactionId();
      const record = await payForTransport({
        requestId: currentRequest.id,
        donorId: donor.id,
        phone: normalizedPhone,
        amount: finalAmount,
        transactionId: txId,
        checkoutRequestId: apiResponse.CheckoutRequestID,
        merchantRequestId: apiResponse.MerchantRequestID,
        responseDescription: apiResponse.ResponseDescription
      });

      setResult({
        amount: finalAmount,
        txId: record.transactionId,
        message: apiResponse.CustomerMessage
      });
    } catch (paymentError) {
      setError(
        paymentError instanceof Error ? paymentError.message : "Payment request failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.headerInfo}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{currentRequest.bloodType}</Text>
        </View>
        <View>
          <Text style={styles.title}>Transport Payment</Text>
          <Text style={styles.sub}>{currentRequest.hospitalName}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <FormField
          label="Suggested Amount (KES)"
          value={String(suggested)}
          onChangeText={() => undefined}
          editable={false}
        />

        <FormField
          label="Your Amount (KES)"
          value={customAmount}
          onChangeText={setCustomAmount}
          keyboardType="numeric"
          editable={!coverFull}
        />

        <FormField
          label="M-Pesa Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="numeric"
          placeholder="2547XXXXXXXX or 2517XXXXXXXX"
        />

        <View style={styles.checkboxRow}>
          <Checkbox
            value={coverFull}
            onValueChange={setCoverFull}
            color={coverFull ? theme.colors.primary : undefined}
          />
          <Text style={styles.checkboxLabel}>Cover full transport expense</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? <Text style={styles.loadingText}>{loadingMessage}</Text> : null}

        <PrimaryButton label="Pay with M-Pesa" loading={loading} onPress={() => void payNow()} />
      </View>

      {result ? (
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Payment Successful</Text>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Amount Paid</Text>
            <Text style={styles.receiptValue}>KES {result.amount}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Transaction ID</Text>
            <Text style={styles.receiptValue}>{result.txId}</Text>
          </View>
          {result.message ? (
            <View style={[styles.receiptRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.receiptLabel}>Message</Text>
              <Text style={styles.receiptValue}>{result.message}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24
  },
  headerBadge: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  headerBadgeText: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.primary
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.text
  },
  sub: {
    fontSize: 14,
    color: theme.colors.mutedText,
    marginTop: 2
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    gap: theme.spacing.md,
    ...theme.shadow.card
  },
  checkboxRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "center",
    paddingVertical: 4
  },
  checkboxLabel: {
    flex: 1,
    color: theme.colors.text,
    fontWeight: "500",
    fontSize: 14
  },
  error: {
    color: theme.colors.danger,
    fontWeight: "600",
    fontSize: 13,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: theme.radius.sm,
    overflow: "hidden"
  },
  loadingText: {
    color: theme.colors.primary,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center"
  },
  successCard: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 24,
    alignItems: "center",
    gap: theme.spacing.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.success,
    ...theme.shadow.card
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4
  },
  successCheck: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800"
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.success,
    marginBottom: 8
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  receiptLabel: {
    fontSize: 13,
    color: theme.colors.mutedText,
    fontWeight: "500"
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text
  }
});
