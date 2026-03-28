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
      <View style={styles.bootDot} />
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.bootText}>LifeLink</Text>
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
            backgroundColor: theme.colors.background
          },
          headerTitleStyle: {
            color: theme.colors.text,
            fontWeight: "700",
            fontSize: 18
          },
          headerTintColor: theme.colors.primary,
          contentStyle: {
            backgroundColor: theme.colors.background
          }
        }}
      >
        {!currentUser ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Sign In" }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Register" }} />
          </>
        ) : currentUser.role === "donor" ? (
          <>
            <Stack.Screen
              name="DonorDashboard"
              component={DonorDashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: "M-Pesa Payment" }} />
          </>
        ) : (
          <Stack.Screen
            name="HospitalDashboard"
            component={HospitalDashboardScreen}
            options={{ headerShown: false }}
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
    backgroundColor: theme.colors.primary,
    gap: theme.spacing.lg
  },
  bootDot: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    opacity: 0.2,
    marginBottom: 8
  },
  bootText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5
  }
});
