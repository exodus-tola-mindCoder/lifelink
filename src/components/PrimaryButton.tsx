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
        <ActivityIndicator color={isOutline ? theme.colors.primary : "#FFFFFF"} />
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
    minHeight: 54,
    borderRadius: theme.radius.lg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.soft
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
  }
});
