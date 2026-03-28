import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useApp } from "../context/AppContext";
import { theme } from "../theme/theme";
import { DonorDashboardScreen } from "../screens/DonorDashboardScreen";
import { HospitalDashboardScreen } from "../screens/HospitalDashboardScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { PaymentScreen } from "../screens/PaymentScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

function BootScreen() {
  return (
    <View style={styles.boot}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.bootText}>Loading LifeLink...</Text>
    </View>
  );
}

export function RootNavigator() {
  const { booting, currentUser } = useApp();

  if (booting) {
    return <BootScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.colors.surface
          },
          headerTitleStyle: {
            color: theme.colors.text,
            fontWeight: "700"
          },
          contentStyle: {
            backgroundColor: theme.colors.background
          }
        }}
      >
        {!currentUser ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Sign in" }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Create account" }} />
          </>
        ) : currentUser.role === "donor" ? (
          <>
            <Stack.Screen
              name="DonorDashboard"
              component={DonorDashboardScreen}
              options={{ title: "Donor Dashboard" }}
            />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: "M-Pesa Simulation" }} />
          </>
        ) : (
          <Stack.Screen
            name="HospitalDashboard"
            component={HospitalDashboardScreen}
            options={{ title: "Hospital Dashboard" }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md
  },
  bootText: {
    color: theme.colors.mutedText
  }
});
