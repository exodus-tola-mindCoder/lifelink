import AsyncStorage from "@react-native-async-storage/async-storage";

export const keys = {
  session: "lifelink:session",
  users: "lifelink:users",
  requests: "lifelink:requests",
  payments: "lifelink:payments",
  selectedRole: "lifelink:selected-role"
} as const;

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  if (value === undefined || value === null) {
    await AsyncStorage.removeItem(key);
    return;
  }

  await AsyncStorage.setItem(key, JSON.stringify(value));
}
