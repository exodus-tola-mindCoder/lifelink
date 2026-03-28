import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { theme } from "../theme/theme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "outline";
};

export function PrimaryButton({ label, onPress, disabled, loading, variant = "primary" }: Props) {
  const isOutline = variant === "outline";

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        isOutline ? styles.outlineButton : styles.primaryButton,
        (disabled || loading) && styles.disabled
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? theme.colors.primary : "#fff"} />
      ) : (
        <Text style={[styles.text, isOutline ? styles.outlineText : styles.primaryText]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md
  },
  primaryButton: {
    backgroundColor: theme.colors.primary
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: "#fff"
  },
  disabled: {
    opacity: 0.65
  },
  text: {
    fontSize: 16,
    fontWeight: "700"
  },
  primaryText: {
    color: "#fff"
  },
  outlineText: {
    color: theme.colors.primary
  }
});
