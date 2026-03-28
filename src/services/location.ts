import * as Location from "expo-location";

import type { Coordinates } from "../types/models";

export async function getCurrentLocation(): Promise<Coordinates | undefined> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    return undefined;
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    updatedAt: new Date().toISOString()
  };
}
