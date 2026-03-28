import { StyleSheet, Text, TextInput, View } from "react-native";

import { theme } from "../theme/theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  error?: string;
  editable?: boolean;
};

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  error,
  editable = true
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        style={[styles.input, !editable && styles.readOnly]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8
  },
  label: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  input: {
    borderWidth: 1,
    borderBottomWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.none,
    backgroundColor: "#FFFFFF",
    color: theme.colors.text,
    paddingHorizontal: 16,
    minHeight: 56,
    fontSize: 16
  },
  readOnly: {
    backgroundColor: "#F4F4F5",
    color: theme.colors.mutedText,
    borderColor: "#E4E4E7"
  },
  error: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: "600"
  }
});
