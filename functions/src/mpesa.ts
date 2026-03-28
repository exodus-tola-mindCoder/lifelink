import { randomUUID } from "node:crypto";

type MpesaConfig = {
  consumerKey: string;
  consumerSecret: string;
  baseUrl: string;
  tokenPath: string;
  stkPushPath: string;
  phoneCountryCode: "254" | "251";
  shortcode: string;
  passkey: string;
  callbackUrl: string;
  stkPasswordOverride: string;
  stkTimestampOverride: string;
  merchantRequestIdPrefix: string;
  merchantRequestIdOverride: string;
};

type StkPushPayload = {
  phone: string;
  amount: number;
  accountReference?: string;
  transactionDesc?: string;
};

type AccessTokenResponse = {
  access_token: string;
  expires_in: string;
};

export type StkPushResponse = {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
  [key: string]: unknown;
};

function readConfig(): MpesaConfig {
  const consumerKey = process.env.MPESA_CONSUMER_KEY ?? "";
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET ?? "";
  const baseUrl = process.env.MPESA_BASE_URL ?? "https://sandbox.safaricom.co.ke";
  const tokenPath =
    process.env.MPESA_TOKEN_PATH ??
    (baseUrl.includes("safaricom.et")
      ? "/v1/token/generate?grant_type=client_credentials"
      : "/oauth/v1/generate?grant_type=client_credentials");
  const stkPushPath =
    process.env.MPESA_STK_PUSH_PATH ??
    (baseUrl.includes("safaricom.et")
      ? "/mpesa/stkpush/v3/processrequest"
      : "/mpesa/stkpush/v1/processrequest");
  const phoneCountryCode =
    (process.env.MPESA_PHONE_COUNTRY_CODE as "254" | "251" | undefined) ??
    (baseUrl.includes("safaricom.et") ? "251" : "254");
  const shortcode = process.env.MPESA_SHORTCODE ?? "174379";
  const passkey = process.env.MPESA_PASSKEY ?? "";
  const callbackUrl = process.env.MPESA_CALLBACK_URL ?? "https://example.com/callback";
  const stkPasswordOverride = process.env.MPESA_STK_PASSWORD_OVERRIDE ?? "";
  const stkTimestampOverride = process.env.MPESA_STK_TIMESTAMP_OVERRIDE ?? "";
  const merchantRequestIdPrefix = process.env.MPESA_MERCHANT_REQUEST_ID_PREFIX ?? "Partner name -";
  const merchantRequestIdOverride = process.env.MPESA_MERCHANT_REQUEST_ID_OVERRIDE ?? "";

  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa consumer credentials are not configured on the server.");
  }

  if (!passkey && !stkPasswordOverride) {
    throw new Error(
      "Set MPESA_PASSKEY or MPESA_STK_PASSWORD_OVERRIDE for STK push authentication."
    );
  }

  return {
    consumerKey,
    consumerSecret,
    baseUrl,
    tokenPath,
    stkPushPath,
    phoneCountryCode,
    shortcode,
    passkey,
    callbackUrl,
    stkPasswordOverride,
    stkTimestampOverride,
    merchantRequestIdPrefix,
    merchantRequestIdOverride
  };
}

function basicAuthHeader(consumerKey: string, consumerSecret: string): string {
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  return `Basic ${credentials}`;
}

function timestampNow(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
}

function normalizePhoneNumber(phone: string, countryCode: "254" | "251"): string {
  const digits = phone.replace(/\D/g, "");
  if (/^2547\d{8}$/.test(digits) || /^251[79]\d{8}$/.test(digits)) {
    return digits;
  }

  if (countryCode === "254" && /^07\d{8}$/.test(digits)) {
    return `254${digits.slice(1)}`;
  }
  if (countryCode === "254" && /^7\d{8}$/.test(digits)) {
    return `254${digits}`;
  }
  if (countryCode === "251" && /^0[79]\d{8}$/.test(digits)) {
    return `251${digits.slice(1)}`;
  }
  if (countryCode === "251" && /^[79]\d{8}$/.test(digits)) {
    return `251${digits}`;
  }

  throw new Error(
    countryCode === "251"
      ? "Phone number must look like 2517XXXXXXXX, 2519XXXXXXXX, 07XXXXXXXX, or 09XXXXXXXX."
      : "Phone number must look like 2547XXXXXXXX."
  );
}

function joinUrl(baseUrl: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const base = baseUrl.replace(/\/+$/, "");
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

function createMerchantRequestId(prefix: string): string {
  const randomPart = randomUUID();
  return `${prefix}${randomPart}`;
}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as Record<string, unknown>;
    const message =
      typeof data.errorMessage === "string"
        ? data.errorMessage
        : typeof data.message === "string"
          ? data.message
          : `Daraja request failed with status ${response.status}`;
    return message;
  } catch {
    return `Daraja request failed with status ${response.status}`;
  }
}

export async function getAccessToken(): Promise<string> {
  const { baseUrl, tokenPath, consumerKey, consumerSecret } = readConfig();
  const endpoint = joinUrl(baseUrl, tokenPath);

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: basicAuthHeader(consumerKey, consumerSecret)
    }
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(`Unable to generate M-Pesa token: ${errorMessage}`);
  }

  const data = (await response.json()) as AccessTokenResponse;
  if (!data.access_token) {
    throw new Error("Daraja token response did not include access_token.");
  }

  return data.access_token;
}

export async function initiateMpesaPayment(payload: StkPushPayload): Promise<StkPushResponse> {
  const {
    baseUrl,
    stkPushPath,
    phoneCountryCode,
    shortcode,
    passkey,
    callbackUrl,
    stkPasswordOverride,
    stkTimestampOverride,
    merchantRequestIdPrefix,
    merchantRequestIdOverride
  } = readConfig();
  const accessToken = await getAccessToken();
  const timestamp = stkTimestampOverride || timestampNow();
  const password =
    stkPasswordOverride || Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
  const normalizedPhone = normalizePhoneNumber(payload.phone, phoneCountryCode);
  const amount = Math.max(1, Math.round(payload.amount));
  const merchantRequestId =
    merchantRequestIdOverride.trim() || createMerchantRequestId(merchantRequestIdPrefix);

  const endpoint = joinUrl(baseUrl, stkPushPath);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      MerchantRequestID: merchantRequestId,
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: normalizedPhone,
      PartyB: shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: callbackUrl,
      AccountReference: payload.accountReference ?? "LifeLink",
      TransactionDesc: payload.transactionDesc ?? "Blood Transport Support"
    })
  });

  const data = (await response.json()) as StkPushResponse;

  if (!response.ok) {
    const serverMessage =
      typeof data.errorMessage === "string"
        ? data.errorMessage
        : typeof data.ResponseDescription === "string"
          ? data.ResponseDescription
          : `Daraja STK request failed with status ${response.status}`;
    throw new Error(serverMessage);
  }

  return data;
}
