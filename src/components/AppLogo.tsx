import { StyleSheet, Text, View } from "react-native";

import { theme } from "../theme/theme";

type Props = {
  size?: "sm" | "md" | "lg";
  subtitle?: string;
};

const dimensions = {
  sm: { mark: 34, title: 20, subtitle: 12 },
  md: { mark: 52, title: 30, subtitle: 14 },
  lg: { mark: 74, title: 40, subtitle: 16 }
} as const;

export function AppLogo({ size = "md", subtitle }: Props) {
  const d = dimensions[size];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.markWrap,
          {
            width: d.mark,
            height: d.mark,
            borderRadius: d.mark / 2
          }
        ]}
      >
        <View
          style={[
            styles.markCenter,
            {
              width: d.mark * 0.54,
              height: d.mark * 0.54,
              borderRadius: (d.mark * 0.54) / 2
            }
          ]}
        />
      </View>
      <Text style={[styles.title, { fontSize: d.title }]}>LifeLink</Text>
      {subtitle ? <Text style={[styles.subtitle, { fontSize: d.subtitle }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8
  },
  markWrap: {
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  markCenter: {
    backgroundColor: theme.colors.primary
  },
  title: {
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -0.7
  },
  subtitle: {
    fontWeight: "500",
    color: theme.colors.mutedText,
    textAlign: "center"
  }
});
