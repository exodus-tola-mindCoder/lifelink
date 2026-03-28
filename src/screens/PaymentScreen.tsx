import Checkbox from "expo-checkbox";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, View, TextInput } from "react-native";
import { useMemo, useState } from "react";

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
      setError("Phone must be like +251 9XX XXX XXX or 2547XXXXXXXX.");
      return;
    }

    const parsed = Number(customAmount);
    const finalAmount = parsed;

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
    <View style={styles.container}>
      <Screen scroll={true} padded={true}>
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Transport Support</Text>
          <Text style={styles.sub}>Help get blood to hospital faster</Text>
        </View>

        <View style={styles.amountWrap}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountInputRow}>
            <TextInput
              style={styles.amountInput}
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
            />
            <Text style={styles.currency}>KES</Text>
          </View>
        </View>

        <View style={styles.cardDark}>
          <View style={styles.phoneInputWrap}>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+254 7XX XXX XXX"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {loading ? <Text style={styles.loadingText}>{loadingMessage}</Text> : null}

          <View style={{ marginTop: 16 }}>
            <PrimaryButton
              label="Pay with M-Pesa"
              variant="payment"
              loading={loading}
              onPress={() => void payNow()}
            />
          </View>

          {result ? (
            <View style={styles.successCard}>
              <View style={styles.successHeader}>
                <Text style={styles.successTitleText}>LifeLink</Text>
                <View style={styles.successIcon}>
                  <Text style={styles.successCheck}>✓</Text>
                </View>
              </View>

              <View style={styles.receiptGrid}>
                <View style={styles.receiptCol}>
                  <Text style={styles.receiptLabel}>Recipient</Text>
                  <Text style={styles.receiptValue}>Transport Support</Text>
                  <Text style={styles.receiptLabel}>Transaction</Text>
                  <Text style={styles.receiptValue}>{result.txId}</Text>
                </View>
                <View style={[styles.receiptCol, { alignItems: "flex-end" }]}>
                  <Text style={styles.receiptLabel}>Amount</Text>
                  <Text style={styles.receiptValue}>{result.amount} KES</Text>
                  <Text style={styles.receiptLabel}>Status</Text>
                  <Text style={[styles.receiptValue, { color: "#4ADE80" }]}>Completed</Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA"
  },
  headerWrap: {
    marginBottom: 24,
    paddingTop: 10
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.6
  },
  sub: {
    fontSize: 16,
    color: "#4B5563",
    marginTop: 4
  },
  amountWrap: {
    marginBottom: 24
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  amountInput: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    minWidth: 80,
    padding: 0
  },
  currency: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4B5563",
    marginTop: 6
  },
  cardDark: {
    backgroundColor: "#1F2937",
    borderRadius: 24,
    padding: 24,
    marginTop: 8,
    shadowColor: "#111827",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    minHeight: 400
  },
  phoneInputWrap: {
    backgroundColor: "#374151",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16
  },
  phoneInput: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    textAlign: "center"
  },
  error: {
    color: "#FCA5A5",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8
  },
  loadingText: {
    color: "#FBBF24",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8
  },
  successCard: {
    marginTop: 32,
    backgroundColor: "#374151",
    borderRadius: 20,
    padding: 20
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20
  },
  successTitleText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    flex: 1
  },
  successIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4ADE80",
    alignItems: "center",
    justifyContent: "center"
  },
  successCheck: {
    color: "#064E3B",
    fontSize: 18,
    fontWeight: "800"
  },
  receiptGrid: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  receiptCol: {
    gap: 6
  },
  receiptLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 6
  },
  receiptValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF"
  }
});
