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
        placeholderTextColor="#A8A29E"
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
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "600"
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: "#FFFFFF",
    color: theme.colors.text,
    paddingHorizontal: 16,
    minHeight: 52,
    fontSize: 15
  },
  readOnly: {
    backgroundColor: theme.colors.warmGray,
    color: theme.colors.mutedText,
    borderColor: theme.colors.border
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: "600"
  }
});
