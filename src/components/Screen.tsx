import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../theme/theme";

type Props = {
  children: ReactNode;
  padded?: boolean;
  scroll?: boolean;
};

export function Screen({ children, padded = true, scroll = true }: Props) {
  const content = (
    <View style={[styles.content, padded && styles.padded]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scroll: {
    flexGrow: 1
  },
  content: {
    flex: 1
  },
  inner: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center"
  },
  padded: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg
  }
});
