import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { theme } from "../theme/theme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "outline" | "payment";
  size?: "md" | "sm";
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
  size = "md"
}: Props) {
  const isOutline = variant === "outline";
  const isPayment = variant === "payment";
  const isSmall = size === "sm";

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSmall && styles.buttonSmall,
        isOutline && styles.outlineButton,
        isPayment && styles.paymentButton,
        !isOutline && !isPayment && styles.primaryButton,
        pressed && !(disabled || loading) && styles.pressed,
        (disabled || loading) && styles.disabled
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isOutline || isPayment ? theme.colors.paymentDark : "#FFFFFF"}
        />
      ) : (
        <Text
          style={[
            styles.text,
            isOutline && styles.outlineText,
            isPayment && styles.paymentText,
            !isOutline && !isPayment && styles.primaryText
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: theme.radius.lg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg
  },
  buttonSmall: {
    minHeight: 40,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.soft
  },
  paymentButton: {
    backgroundColor: theme.colors.paymentYellow,
    shadowColor: theme.colors.paymentYellow,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: "transparent"
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }]
  },
  disabled: {
    opacity: 0.45
  },
  text: {
    fontSize: 16,
    fontWeight: "700"
  },
  primaryText: {
    color: "#FFFFFF"
  },
  outlineText: {
    color: theme.colors.primary
  },
  paymentText: {
    color: theme.colors.paymentDark
  }
});
