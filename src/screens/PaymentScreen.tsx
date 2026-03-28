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
      <View style={styles.header}>
        <Text style={styles.title}>TRANSPORT COVERAGE</Text>
        <Text style={styles.sub}>
          Emergency request for <Text style={styles.highlight}>{currentRequest.hospitalName}</Text>
        </Text>
      </View>

      <View style={styles.invoiceCard}>
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceTitle}>M-PESA CHECKOUT</Text>
        </View>

        <View style={styles.invoiceBody}>
          <FormField
            label="SUGGESTED AMOUNT (KES)"
            value={String(suggested)}
            onChangeText={() => undefined}
            editable={false}
          />

          <FormField
            label="ADJUST AMOUNT (KES)"
            value={customAmount}
            onChangeText={setCustomAmount}
            keyboardType="numeric"
            editable={!coverFull}
          />

          <FormField
            label="M-PESA PHONE NUMBER"
            value={phone}
            onChangeText={setPhone}
            keyboardType="numeric"
            placeholder="2547XXXXXXXX or 2517XXXXXXXX"
          />

          <View style={styles.checkboxRow}>
            <Checkbox value={coverFull} onValueChange={setCoverFull} color={coverFull ? theme.colors.accent : undefined} />
            <Text style={styles.checkboxLabel}>Cover full transport expense</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {loading ? <Text style={styles.loadingText}>{loadingMessage}</Text> : null}
          <View style={{ marginTop: 12 }}>
            <PrimaryButton label="AUTHORIZE PAYMENT" loading={loading} onPress={() => void payNow()} />
          </View>
        </View>
      </View>

      {result ? (
        <View style={styles.success}>
          <View style={styles.successHeader}>
            <Text style={styles.successTitle}>PAYMENT SUCCESSFUL</Text>
          </View>
          <View style={styles.successBody}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>AMOUNT PAID</Text>
              <Text style={styles.receiptValue}>KES {result.amount}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>TRANSACTION ID</Text>
              <Text style={styles.receiptValue}>{result.txId}</Text>
            </View>
            {result.message ? (
              <View style={[styles.receiptRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.receiptLabel}>STATUS</Text>
                <Text style={styles.receiptValue}>{result.message}</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    paddingLeft: 16
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: -1
  },
  sub: {
    marginTop: 8,
    color: theme.colors.mutedText,
    lineHeight: 24,
    fontSize: 16
  },
  highlight: {
    fontWeight: "800",
    color: theme.colors.text
  },
  invoiceCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },
  invoiceHeader: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    padding: theme.spacing.lg,
    backgroundColor: "#F4F4F5"
  },
  invoiceTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    color: theme.colors.primary
  },
  invoiceBody: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg
  },
  checkboxRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "center",
    paddingVertical: 8
  },
  checkboxLabel: {
    flex: 1,
    color: theme.colors.primary,
    fontWeight: "600",
    letterSpacing: 0.5
  },
  error: {
    color: theme.colors.danger,
    fontWeight: "700",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger
  },
  loadingText: {
    color: theme.colors.accent,
    fontWeight: "800",
    letterSpacing: 1,
    fontSize: 12,
    textAlign: "center"
  },
  success: {
    marginTop: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.surface
  },
  successHeader: {
    backgroundColor: theme.colors.success,
    padding: theme.spacing.md
  },
  successTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center"
  },
  successBody: {
    padding: theme.spacing.lg
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    borderStyle: "dashed"
  },
  receiptLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: theme.colors.mutedText
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.primary
  }
});
