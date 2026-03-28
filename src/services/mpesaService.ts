import Constants from "expo-constants";

type StkPayload = {
  phone: string;
  amount: number;
};

export type MpesaApiResponse = {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
};

function getDevServerHostIp(): string | undefined {
  const fromExpoConfig = (Constants.expoConfig as { hostUri?: string } | null)?.hostUri;
  const fromManifest2 = (
    Constants.manifest2 as { extra?: { expoGo?: { debuggerHost?: string } } } | null
  )?.extra?.expoGo?.debuggerHost;
  const fromLegacyManifest = (Constants as unknown as { manifest?: { debuggerHost?: string } }).manifest
    ?.debuggerHost;

  const candidates = [fromExpoConfig, fromManifest2, fromLegacyManifest];
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    const host = candidate.split("/")[0]?.split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  }

  return undefined;
}

function normalizeProxyUrl(rawValue: string): string {
  try {
    const parsed = new URL(rawValue);
    const isLoopback = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
    if (!isLoopback) {
      return rawValue;
    }

    const devHostIp = getDevServerHostIp();
    if (!devHostIp) {
      return rawValue;
    }

    parsed.hostname = devHostIp;
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return rawValue;
  }
}

function getProxyBaseUrl(): string {
  const extraProxyUrl =
    Constants.expoConfig?.extra?.mpesa?.proxyUrl ||
    (Constants.manifest2?.extra?.expoClient?.extra?.mpesa?.proxyUrl as string | undefined);
  const envProxyUrl = process.env.EXPO_PUBLIC_MPESA_PROXY_URL;
  const value = normalizeProxyUrl((envProxyUrl || extraProxyUrl || "").trim().replace(/\/+$/, ""));

  if (!value) {
    throw new Error("M-Pesa proxy URL is missing. Set EXPO_PUBLIC_MPESA_PROXY_URL.");
  }

  if (/safaricom\.co\.ke/i.test(value)) {
    throw new Error(
      "EXPO_PUBLIC_MPESA_PROXY_URL points to Safaricom directly. Set it to your Firebase function URL (for example, .../us-central1/mpesaProxy)."
    );
  }

  return value;
}

async function parseJsonResponse(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function toErrorMessage(data: Record<string, unknown>, fallback: string): string {
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }
  if (typeof data.errorMessage === "string" && data.errorMessage.trim()) {
    return data.errorMessage;
  }
  return fallback;
}

export async function getAccessToken(): Promise<string> {
  const baseUrl = getProxyBaseUrl();
  let response: Response;

  try {
    response = await fetch(`${baseUrl}/access-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    throw new Error(
      "Network error while requesting M-Pesa token. Ensure Functions emulator is running and EXPO_PUBLIC_MPESA_PROXY_URL points to your machine IP + emulator port."
    );
  }

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(toErrorMessage(data, "Unable to fetch M-Pesa access token."));
  }

  const token = data.access_token;
  if (typeof token !== "string" || !token) {
    throw new Error("M-Pesa proxy did not return a valid access token.");
  }

  return token;
}

export async function initiateMpesaPayment(payload: StkPayload): Promise<MpesaApiResponse> {
  const baseUrl = getProxyBaseUrl();
  let response: Response;

  try {
    response = await fetch(`${baseUrl}/stk-push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error("Network error while initiating M-Pesa STK push.");
  }

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(toErrorMessage(data, "Unable to initiate M-Pesa payment."));
  }

  return data as MpesaApiResponse;
}

export async function requestMpesaStkPayment(payload: StkPayload): Promise<MpesaApiResponse> {
  await getAccessToken();
  return initiateMpesaPayment(payload);
}
