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
      style={({ pressed }) => [
        styles.button,
        isOutline ? styles.outlineButton : styles.primaryButton,
        pressed && !(disabled || loading) && styles.pressed,
        (disabled || loading) && styles.disabled
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? theme.colors.primary : "#F8FAFC"} />
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
    minHeight: 56,
    borderRadius: theme.radius.none,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: "transparent"
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  disabled: {
    opacity: 0.4
  },
  text: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  primaryText: {
    color: "#FFFFFF"
  },
  outlineText: {
    color: theme.colors.primary
  }
});
